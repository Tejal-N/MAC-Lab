import {
  Device,
  Packet,
  ProtocolType,
  SimulationConfig,
  SimulationEvent,
  SimulationMetrics,
  SimulationSnapshot,
} from '../types/simulation';
import { ChannelTracker } from './channel';
import { createInitialDevices, updateDeviceState } from './devices';
import { MetricsTracker } from './metrics';
import { createPacket, resetPacketCounter } from './packets';
import { CsmaProtocol } from './protocols/csma';
import { CsmaCdProtocol } from './protocols/csmaCd';
import { PureAlohaProtocol } from './protocols/pureAloha';
import { SlottedAlohaProtocol } from './protocols/slottedAloha';
import { SeededRandom } from './random';

export const DEFAULT_CONFIG: SimulationConfig = {
  protocol: 'pure-aloha',
  numDevices: 8,
  packetArrivalRate: 0.02, // 2% chance per device per time unit
  packetDuration: 10,
  slotDuration: 10,
  propagationDelay: 1,
  maxBackoffSlots: 8,
  simulationDuration: 1000,
  randomSeed: 1337,
  csmaPersistence: '1-persistent',
};

export class SimulationEngine {
  private config: SimulationConfig;
  private currentTime: number = 0;
  private devices: Device[] = [];
  private channel: ChannelTracker;
  private metricsTracker: MetricsTracker;
  private random: SeededRandom;
  private arrivalRandom: SeededRandom;
  private eventLog: SimulationEvent[] = [];
  private isRunning: boolean = false;
  private isPaused: boolean = false;

  // Protocol modules
  private pureAloha: PureAlohaProtocol;
  private slottedAloha: SlottedAlohaProtocol;
  private csma: CsmaProtocol;
  private csmaCd: CsmaCdProtocol;

  constructor(initialConfig: Partial<SimulationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...initialConfig };
    this.random = new SeededRandom(this.config.randomSeed);
    this.arrivalRandom = new SeededRandom(this.config.randomSeed);
    this.channel = new ChannelTracker();
    this.metricsTracker = new MetricsTracker(this.config.packetDuration);

    this.pureAloha = new PureAlohaProtocol();
    this.slottedAloha = new SlottedAlohaProtocol();
    this.csma = new CsmaProtocol();
    this.csmaCd = new CsmaCdProtocol();

    this.reset();
  }

  public reset(newConfig?: Partial<SimulationConfig>): void {
    if (newConfig) {
      this.config = { ...this.config, ...newConfig };
    }
    this.currentTime = 0;
    this.isRunning = false;
    this.isPaused = false;
    this.random.reset(this.config.randomSeed);
    this.arrivalRandom.reset(this.config.randomSeed);
    resetPacketCounter();
    this.channel.reset();
    this.metricsTracker.reset(this.config.packetDuration);
    this.devices = createInitialDevices(this.config.numDevices);
    this.eventLog = [
      {
        id: `evt-init`,
        timestamp: 0,
        type: 'SLOT_TICK',
        message: `Simulation initialized with protocol: ${this.config.protocol.toUpperCase()}, Devices: ${this.config.numDevices}, Seed: ${this.config.randomSeed}`,
      },
    ];
  }

  public getConfig(): SimulationConfig {
    return { ...this.config };
  }

  public setConfig(updated: Partial<SimulationConfig>): void {
    const shouldReset =
      updated.protocol !== undefined ||
      updated.numDevices !== undefined ||
      updated.randomSeed !== undefined ||
      updated.packetDuration !== undefined ||
      updated.slotDuration !== undefined;

    this.config = { ...this.config, ...updated };

    if (shouldReset) {
      this.reset();
    }
  }

  public start(): void {
    this.isRunning = true;
    this.isPaused = false;
  }

  public pause(): void {
    this.isPaused = true;
  }

  public resume(): void {
    if (this.isRunning) {
      this.isPaused = false;
    } else {
      this.start();
    }
  }

  public clearEventLog(): void {
    this.eventLog = [];
  }

  /**
   * Performs one discrete simulation time unit step
   */
  public step(): void {
    this.currentTime++;

    // 1. Packet Generation (Bernoulli arrival trial per device)
    this.generatePackets();

    // 2. Protocol Access Decision
    this.executeProtocolAccess();

    // 3. Process Transmissions In-Flight & Completions
    this.processTransmissions();

    // 4. Sample Metrics Time-Series
    const activeTxCount = this.channel.getActiveTransmissions().length;
    this.metricsTracker.sampleTimeSeries(this.currentTime, activeTxCount);
  }

  private generatePackets(): void {
    for (const device of this.devices) {
      // Don't generate if queue is very large (limit memory buffer to 5 packets)
      if (device.packetQueue.length >= 5) continue;

      if (this.arrivalRandom.nextBool(this.config.packetArrivalRate)) {
        const packet = createPacket(device.id, this.currentTime, this.config.packetDuration);
        device.packetQueue.push(packet);
        this.metricsTracker.recordPacketGeneration();

        this.addEvent({
          id: `evt-${this.currentTime}-${device.id}-gen`,
          timestamp: this.currentTime,
          type: 'PACKET_GENERATED',
          deviceId: device.id,
          packetId: packet.id,
          message: `Device ${String(device.id).padStart(2, '0')} generated Packet ${packet.id} (Queue size: ${device.packetQueue.length}).`,
        });

        // If device is idle and not waiting, transition to ready
        if (device.state === 'idle' && !device.currentPacket) {
          device.currentPacket = device.packetQueue.shift()!;
          device.state = 'packet-ready';
        }
      }
    }
  }

  private executeProtocolAccess(): void {
    let decision;

    switch (this.config.protocol) {
      case 'pure-aloha':
        decision = this.pureAloha.handleStep(
          this.currentTime,
          this.devices,
          this.channel,
          this.config,
          this.random
        );
        break;
      case 'slotted-aloha':
        decision = this.slottedAloha.handleStep(
          this.currentTime,
          this.devices,
          this.channel,
          this.config,
          this.random
        );
        break;
      case 'csma':
        decision = this.csma.handleStep(
          this.currentTime,
          this.devices,
          this.channel,
          this.config,
          this.random
        );
        break;
      case 'csma-cd':
        decision = this.csmaCd.handleStep(
          this.currentTime,
          this.devices,
          this.channel,
          this.config,
          this.random
        );
        break;
    }

    if (decision) {
      for (const ev of decision.events) {
        this.addEvent(ev);
      }
      for (const tx of decision.transmissionsStarted) {
        this.metricsTracker.recordTransmissionAttempt();
      }
    }
  }

  private processTransmissions(): void {
    const activeTxs = this.channel.getActiveTransmissions();

    for (const tx of activeTxs) {
      // If transmission duration has elapsed:
      if (this.currentTime >= tx.endTime) {
        this.channel.removeTransmission(tx.packetId);
        const device = this.devices.find((d) => d.id === tx.deviceId);
        if (!device || !device.currentPacket) continue;

        if (tx.collided) {
          // Transmission failed due to COLLISION
          this.metricsTracker.recordCollision();
          device.collidedAttempts++;
          device.currentPacket.hasCollided = true;

          // Calculate backoff based on active protocol
          let backoffDuration = 0;
          switch (this.config.protocol) {
            case 'pure-aloha':
              backoffDuration = this.pureAloha.calculateBackoff(device, this.config, this.random);
              break;
            case 'slotted-aloha':
              backoffDuration = this.slottedAloha.calculateBackoff(device, this.config, this.random);
              break;
            case 'csma':
              backoffDuration = this.csma.calculateBackoff(device, this.config, this.random);
              break;
            case 'csma-cd':
              backoffDuration = this.csmaCd.calculateBackoff(device, this.config, this.random);
              break;
          }

          device.backoffTimer = backoffDuration;
          device.state = 'backoff';

          this.addEvent({
            id: `evt-${this.currentTime}-${device.id}-collision-result`,
            timestamp: this.currentTime,
            type: 'COLLISION_DETECTED',
            deviceId: device.id,
            packetId: tx.packetId,
            message: `Packet ${tx.packetId} from Device ${String(device.id).padStart(2, '0')} finished with COLLISION! Backing off for ${backoffDuration} time units.`,
          });
        } else {
          // Transmission SUCCEEDED! Delivered to receiver
          const packet = device.currentPacket;
          packet.status = 'delivered';
          packet.deliveredTime = this.currentTime;
          const delay = this.currentTime - packet.generationTime;

          device.successfulPackets++;
          device.collisionCount = 0; // reset consecutive collision counter
          this.metricsTracker.recordSuccessfulDelivery(delay, this.config.packetDuration);

          device.state = 'success';
          device.currentPacket = null;

          this.addEvent({
            id: `evt-${this.currentTime}-${device.id}-delivered`,
            timestamp: this.currentTime,
            type: 'PACKET_DELIVERED',
            deviceId: device.id,
            packetId: tx.packetId,
            message: `Packet ${tx.packetId} DELIVERED to central receiver! Delay: ${delay} units.`,
          });
        }
      }
    }

    // After success state, transition to idle or next packet
    for (const device of this.devices) {
      if (device.state === 'success') {
        if (device.packetQueue.length > 0) {
          device.currentPacket = device.packetQueue.shift()!;
          device.state = 'packet-ready';
        } else {
          device.state = 'idle';
        }
      }
    }
  }

  private addEvent(event: SimulationEvent): void {
    this.eventLog.push(event);
    // Limit memory footprint of log to last 600 events
    if (this.eventLog.length > 600) {
      this.eventLog.shift();
    }
  }

  public getSnapshot(): SimulationSnapshot {
    const devicesInBackoff = this.devices.filter((d) => d.state === 'backoff').length;
    const activePacketsInFlight = this.channel.getActiveTransmissions().length;

    const metrics = this.metricsTracker.getMetrics(
      this.currentTime,
      Math.floor(this.currentTime / this.config.slotDuration),
      activePacketsInFlight,
      devicesInBackoff
    );

    return {
      time: this.currentTime,
      slot: Math.floor(this.currentTime / this.config.slotDuration),
      devices: this.devices.map((d) => ({
        ...d,
        packetQueue: [...d.packetQueue],
        currentPacket: d.currentPacket ? { ...d.currentPacket } : null,
      })),
      channel: this.channel.getState(),
      metrics,
      recentEvents: [...this.eventLog],
      config: { ...this.config },
      isRunning: this.isRunning,
      isPaused: this.isPaused,
    };
  }
}
