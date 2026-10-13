import { Device, Packet, SimulationConfig, SimulationEvent } from '../../types/simulation';
import { ChannelTracker } from '../channel';
import { SeededRandom } from '../random';
import { ProtocolDecision } from './pureAloha';

export class SlottedAlohaProtocol {
  /**
   * Slotted ALOHA:
   * 1. Simulated time is divided into discrete slots of length config.slotDuration.
   * 2. Devices can ONLY start transmission at slot boundaries (currentTime % slotDuration === 0).
   * 3. Devices with packets ready mid-slot enter 'waiting' state until the next slot boundary.
   * 4. Multiple devices transmitting at the same slot boundary collide for that slot.
   * 5. Backoff is quantized to integer multiples of slotDuration.
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

    const isSlotBoundary = currentTime % config.slotDuration === 0;

    for (const device of devices) {
      // 1. Decrement backoff timer
      if (device.state === 'backoff') {
        device.backoffTimer--;
        if (device.backoffTimer <= 0) {
          // Backoff completed. If at slot boundary, packet is ready to transmit immediately;
          // otherwise wait until next slot boundary.
          if (isSlotBoundary) {
            device.state = 'packet-ready';
          } else {
            device.state = 'waiting';
          }
          events.push({
            id: `evt-${currentTime}-${device.id}-backoff-end`,
            timestamp: currentTime,
            type: 'ENTERED_BACKOFF',
            deviceId: device.id,
            packetId: device.currentPacket?.id,
            message: `Device ${String(device.id).padStart(2, '0')} finished backoff; aligned to next slot boundary.`,
          });
        }
      }

      // 2. Fetch packet from queue if idle or waiting
      if (
        (device.state === 'idle' || device.state === 'waiting' || device.state === 'packet-ready') &&
        !device.currentPacket &&
        device.packetQueue.length > 0
      ) {
        device.currentPacket = device.packetQueue.shift()!;
        device.state = isSlotBoundary ? 'packet-ready' : 'waiting';
      }

      // 3. If slot boundary reached and device was waiting with a packet, make it packet-ready
      if (isSlotBoundary && device.state === 'waiting' && device.currentPacket) {
        device.state = 'packet-ready';
      }

      // 4. Transmission can ONLY begin at a slot boundary!
      if (isSlotBoundary && device.state === 'packet-ready' && device.currentPacket) {
        const packet = device.currentPacket;
        packet.attempts++;
        device.totalAttempts++;

        packet.transmissionStartTime = currentTime;
        packet.transmissionEndTime = currentTime + config.packetDuration;
        packet.status = 'transmitting';
        device.state = 'transmitting';

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
            id: `evt-${currentTime}-${device.id}-slot-collision`,
            timestamp: currentTime,
            type: 'COLLISION_DETECTED',
            deviceId: device.id,
            packetId: packet.id,
            message: `Slot #${Math.floor(currentTime / config.slotDuration)}: Multiple devices transmitted! Collision detected.`,
          });
        } else {
          events.push({
            id: `evt-${currentTime}-${device.id}-tx-start`,
            timestamp: currentTime,
            type: 'TRANSMISSION_STARTED',
            deviceId: device.id,
            packetId: packet.id,
            message: `Slot #${Math.floor(currentTime / config.slotDuration)}: Device ${String(device.id).padStart(2, '0')} started packet ${packet.id}.`,
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
    // Slotted ALOHA: backoff is a random integer number of slots
    const slots = random.nextInt(1, config.maxBackoffSlots);
    return slots * config.slotDuration;
  }
}
