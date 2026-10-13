import { Device, DeviceState } from '../types/simulation';

export function createInitialDevices(count: number): Device[] {
  const devices: Device[] = [];
  for (let i = 1; i <= count; i++) {
    const idPad = String(i).padStart(2, '0');
    devices.push({
      id: i,
      name: `Device-${idPad}`,
      state: 'idle',
      packetQueue: [],
      currentPacket: null,
      backoffTimer: 0,
      collisionCount: 0,
      sensingTimer: 0,
      successfulPackets: 0,
      totalAttempts: 0,
      collidedAttempts: 0,
    });
  }
  return devices;
}

export function updateDeviceState(device: Device, newState: DeviceState): Device {
  return {
    ...device,
    state: newState,
  };
}
