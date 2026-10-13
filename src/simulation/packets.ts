import { Packet } from '../types/simulation';

let globalPacketCounter = 0;

export function resetPacketCounter(): void {
  globalPacketCounter = 0;
}

export function createPacket(
  sourceDeviceId: number,
  generationTime: number,
  size: number
): Packet {
  globalPacketCounter++;
  const idStr = String(globalPacketCounter).padStart(3, '0');
  return {
    id: `P${idStr}`,
    sourceDeviceId,
    generationTime,
    size,
    attempts: 0,
    hasCollided: false,
    status: 'queued',
  };
}
