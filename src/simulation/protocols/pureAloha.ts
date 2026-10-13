import { Device, Packet, SimulationConfig, SimulationEvent } from '../../types/simulation';
import { ChannelTracker } from '../channel';
import { SeededRandom } from '../random';

export interface ProtocolDecision {
  events: SimulationEvent[];
  transmissionsStarted: { deviceId: number; packet: Packet }[];
}

export class PureAlohaProtocol {
  /**
   * Pure ALOHA:
   * 1. A device transmits immediately whenever it has a packet ready.
   * 2. No channel sensing.
   * 3. Any temporal overlap with another packet results in a collision.
   * 4. On collision, device waits a random backoff time before retrying.
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

    for (const device of devices) {
      // 1. Decrement backoff timer if device is in backoff
      if (device.state === 'backoff') {
        device.backoffTimer--;
        if (device.backoffTimer <= 0) {
          // Backoff finished, packet is ready to transmit again
          device.state = 'packet-ready';
          events.push({
            id: `evt-${currentTime}-${device.id}-backoff-end`,
            timestamp: currentTime,
            type: 'ENTERED_BACKOFF',
            deviceId: device.id,
            packetId: device.currentPacket?.id,
            message: `Device ${String(device.id).padStart(2, '0')} finished backoff; packet ${device.currentPacket?.id} is ready to transmit.`,
          });
        }
      }

      // 2. If device has a packet ready (or in queue) and is idle or packet-ready
      if ((device.state === 'idle' || device.state === 'packet-ready') && !device.currentPacket && device.packetQueue.length > 0) {
        device.currentPacket = device.packetQueue.shift()!;
        device.state = 'packet-ready';
      }

      // 3. Pure ALOHA transmits immediately when packet is ready
      if (device.state === 'packet-ready' && device.currentPacket) {
        const packet = device.currentPacket;
        packet.attempts++;
        device.totalAttempts++;

        // Transmission duration
        packet.transmissionStartTime = currentTime;
        packet.transmissionEndTime = currentTime + config.packetDuration;
        packet.status = 'transmitting';
        device.state = 'transmitting';

        // Register to shared channel
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
            message: `Device ${String(device.id).padStart(2, '0')} transmitted packet ${packet.id} while channel was active; COLLISION occurred!`,
          });
        } else {
          events.push({
            id: `evt-${currentTime}-${device.id}-tx-start`,
            timestamp: currentTime,
            type: 'TRANSMISSION_STARTED',
            deviceId: device.id,
            packetId: packet.id,
            message: `Device ${String(device.id).padStart(2, '0')} started transmission of packet ${packet.id} (attempt #${packet.attempts}).`,
          });
        }

        transmissionsStarted.push({ deviceId: device.id, packet });
      }
    }

    return { events, transmissionsStarted };
  }

  /**
   * Determine backoff time on collision
   */
  public calculateBackoff(
    device: Device,
    config: SimulationConfig,
    random: SeededRandom
  ): number {
    device.collisionCount++;
    // Pure ALOHA random backoff: random multiple of packet duration
    const slots = random.nextInt(1, config.maxBackoffSlots);
    return slots * config.packetDuration;
  }
}
