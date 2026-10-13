import { Device, Packet, SimulationConfig, SimulationEvent } from '../../types/simulation';
import { ChannelTracker } from '../channel';
import { SeededRandom } from '../random';
import { ProtocolDecision } from './pureAloha';

export class CsmaCdProtocol {
  /**
   * CSMA/CD (Carrier Sense Multiple Access with Collision Detection):
   * 1. Senses channel before transmitting (like CSMA).
   * 2. If idle, begins transmission.
   * 3. Continuously listens to channel WHILE transmitting.
   * 4. As soon as a collision is detected (collision interval >= 2 * propagationDelay or immediate overlap):
   *    - Aborts transmission immediately!
   *    - Sends a brief jam signal (1 time unit).
   *    - Channel is freed early rather than transmitting corrupt payload for full duration.
   * 5. Uses Binary Exponential Backoff (BEB):
   *    r in [0, 2^min(collisionCount, 10) - 1] slots.
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

      // 2. Fetch packet from queue
      if (device.state === 'idle' && !device.currentPacket && device.packetQueue.length > 0) {
        device.currentPacket = device.packetQueue.shift()!;
        device.state = 'sensing';
      }

      // 3. Collision detection for currently transmitting devices
      if (device.state === 'transmitting' && device.currentPacket) {
        const tx = channel.getTransmission(device.currentPacket.id);
        if (tx && tx.collided) {
          // Collision detected during transmission!
          // CSMA/CD aborts transmission early + sends jam signal!
          channel.abortTransmission(device.currentPacket.id, currentTime);

          device.collidedAttempts++;
          device.currentPacket.hasCollided = true;
          device.collisionCount++;

          // Binary Exponential Backoff: r in [0, 2^k - 1]
          const k = Math.min(device.collisionCount, 10);
          const maxSlots = Math.pow(2, k) - 1;
          const backoffSlots = random.nextInt(0, Math.max(1, maxSlots));
          device.backoffTimer = backoffSlots * config.slotDuration;
          device.state = 'backoff';

          events.push({
            id: `evt-${currentTime}-${device.id}-cd-abort`,
            timestamp: currentTime,
            type: 'TRANSMISSION_ABORTED',
            deviceId: device.id,
            packetId: device.currentPacket.id,
            message: `Device ${String(device.id).padStart(2, '0')} detected COLLISION; aborted transmission early! Sent JAM signal. BEB: ${device.backoffTimer} units (k=${k}).`,
          });

          continue;
        }
      }

      // 4. Sensing logic
      if (device.state === 'sensing' && device.currentPacket) {
        if (channelSensedBusy) {
          // Defer
          device.state = 'waiting';
          events.push({
            id: `evt-${currentTime}-${device.id}-defer`,
            timestamp: currentTime,
            type: 'CHANNEL_SENSED_BUSY',
            deviceId: device.id,
            packetId: device.currentPacket.id,
            message: `Device ${String(device.id).padStart(2, '0')} sensed carrier busy; deferring.`,
          });
        } else {
          // Channel idle
          device.state = 'packet-ready';
        }
      }

      // 5. Waiting station senses idle
      if (device.state === 'waiting' && device.currentPacket && !channelSensedBusy) {
        device.state = 'packet-ready';
      }

      // 6. Transmit
      if (device.state === 'packet-ready' && device.currentPacket) {
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
          events.push({
            id: `evt-${currentTime}-${device.id}-cd-overlap`,
            timestamp: currentTime,
            type: 'COLLISION_DETECTED',
            deviceId: device.id,
            packetId: packet.id,
            message: `Device ${String(device.id).padStart(2, '0')} transmit overlapped (within propagation window ${config.propagationDelay}); collision occurring!`,
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
    const k = Math.min(device.collisionCount, 10);
    const maxSlots = Math.pow(2, k) - 1;
    const backoffSlots = random.nextInt(0, Math.max(1, maxSlots));
    return backoffSlots * config.slotDuration;
  }
}
