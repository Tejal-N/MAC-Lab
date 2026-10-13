import { Device, Packet, SimulationConfig, SimulationEvent } from '../../types/simulation';
import { ChannelTracker } from '../channel';
import { SeededRandom } from '../random';
import { ProtocolDecision } from './pureAloha';

export class CsmaProtocol {
  /**
   * Carrier Sense Multiple Access (CSMA):
   * 1. Senses channel before transmitting.
   * 2. If channel is sensed busy:
   *    - 1-persistent: device defers and listens continuously until channel becomes idle.
   *    - non-persistent: device enters backoff immediately and senses again later.
   * 3. If channel is sensed idle:
   *    - Transmits packet.
   * 4. Vulnerability window = propagationDelay (tau):
   *    If another station transmitted less than tau ago, carrier has not reached this station yet,
   *    so this station also senses idle and transmits, resulting in a collision!
   */
  public handleStep(
    currentTime: number,
    devices: Device[],
    channel: ChannelTracker,
    config: SimulationConfig,
    random: SeededRandom
  ): ProtocolDecision {
    const events: SimulationEvent[] = [];
    const transmissionsStarted: { deviceId: number; packet: Packet }[] = [];

    // Is the channel observable as busy at this time step?
    // A transmission is sensed if currentTime >= tx.startTime + propagationDelay
    const channelSensedBusy = channel.isChannelBusy(currentTime, config.propagationDelay);

    for (const device of devices) {
      // 1. Decrement backoff timer
      if (device.state === 'backoff') {
        device.backoffTimer--;
        if (device.backoffTimer <= 0) {
          device.state = 'sensing';
          events.push({
            id: `evt-${currentTime}-${device.id}-backoff-end`,
            timestamp: currentTime,
            type: 'ENTERED_BACKOFF',
            deviceId: device.id,
            packetId: device.currentPacket?.id,
            message: `Device ${String(device.id).padStart(2, '0')} finished backoff; sensing channel.`,
          });
        }
      }

      // 2. Fetch packet from queue if idle
      if (device.state === 'idle' && !device.currentPacket && device.packetQueue.length > 0) {
        device.currentPacket = device.packetQueue.shift()!;
        device.state = 'sensing';
      }

      // 3. Channel sensing logic
      if (device.state === 'sensing' && device.currentPacket) {
        if (channelSensedBusy) {
          // Channel is busy
          if (config.csmaPersistence === 'non-persistent') {
            // Non-persistent: back off immediately
            const backoffSlots = random.nextInt(1, config.maxBackoffSlots);
            device.backoffTimer = backoffSlots * config.packetDuration;
            device.state = 'backoff';
            events.push({
              id: `evt-${currentTime}-${device.id}-sense-busy`,
              timestamp: currentTime,
              type: 'CHANNEL_SENSED_BUSY',
              deviceId: device.id,
              packetId: device.currentPacket.id,
              message: `Device ${String(device.id).padStart(2, '0')} sensed BUSY channel; non-persistent backoff (${device.backoffTimer} units).`,
            });
          } else {
            // 1-persistent: defer and wait while busy
            device.state = 'waiting';
            events.push({
              id: `evt-${currentTime}-${device.id}-sense-defer`,
              timestamp: currentTime,
              type: 'CHANNEL_SENSED_BUSY',
              deviceId: device.id,
              packetId: device.currentPacket.id,
              message: `Device ${String(device.id).padStart(2, '0')} sensed BUSY channel; deferring until idle.`,
            });
          }
        } else {
          // Channel sensed IDLE!
          events.push({
            id: `evt-${currentTime}-${device.id}-sense-idle`,
            timestamp: currentTime,
            type: 'CHANNEL_SENSED_IDLE',
            deviceId: device.id,
            packetId: device.currentPacket.id,
            message: `Device ${String(device.id).padStart(2, '0')} sensed IDLE channel; initiating transmission.`,
          });
          device.state = 'packet-ready';
        }
      }

      // 4. If device was waiting (1-persistent) and channel becomes idle, become ready!
      if (device.state === 'waiting' && device.currentPacket && !channelSensedBusy) {
        device.state = 'packet-ready';
        events.push({
          id: `evt-${currentTime}-${device.id}-deferred-now-idle`,
          timestamp: currentTime,
          type: 'CHANNEL_SENSED_IDLE',
          deviceId: device.id,
          packetId: device.currentPacket.id,
          message: `Device ${String(device.id).padStart(2, '0')} noticed channel became IDLE after deferral; attempting transmission.`,
        });
      }

      // 5. Transmission
      if (device.state === 'packet-ready' && device.currentPacket) {
        const packet = device.currentPacket;
        packet.attempts++;
        device.totalAttempts++;

        packet.transmissionStartTime = currentTime;
        packet.transmissionEndTime = currentTime + config.packetDuration;
        packet.status = 'transmitting';
        device.state = 'transmitting';

        // Physically register transmission
        const { collidedWithExisting } = channel.addTransmission(
          packet.id,
          device.id,
          currentTime,
          packet.transmissionEndTime,
          '#06b6d4'
        );

        if (collidedWithExisting) {
          packet.hasCollided = true;
          device.collidedAttempts++;
          events.push({
            id: `evt-${currentTime}-${device.id}-collision`,
            timestamp: currentTime,
            type: 'COLLISION_DETECTED',
            deviceId: device.id,
            packetId: packet.id,
            message: `Device ${String(device.id).padStart(2, '0')} collided with another transmission (vulnerability window: ${config.propagationDelay} units)!`,
          });
        } else {
          events.push({
            id: `evt-${currentTime}-${device.id}-tx-start`,
            timestamp: currentTime,
            type: 'TRANSMISSION_STARTED',
            deviceId: device.id,
            packetId: packet.id,
            message: `Device ${String(device.id).padStart(2, '0')} started transmitting packet ${packet.id}.`,
          });
        }

        transmissionsStarted.push({ deviceId: device.id, packet });
      }
    }

    return { events, transmissionsStarted };
  }

  public calculateBackoff(
    device: Device,
    config: SimulationConfig,
    random: SeededRandom
  ): number {
    device.collisionCount++;
    const slots = random.nextInt(1, config.maxBackoffSlots);
    return slots * config.packetDuration;
  }
}
