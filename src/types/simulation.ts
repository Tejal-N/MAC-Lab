export type ProtocolType = 'pure-aloha' | 'slotted-aloha' | 'csma' | 'csma-cd';

export type DeviceState =
  | 'idle'
  | 'packet-ready'
  | 'sensing'
  | 'transmitting'
  | 'waiting'
  | 'backoff'
  | 'collision'
  | 'success';

export interface Packet {
  id: string;
  sourceDeviceId: number;
  generationTime: number; // in simulation time units
  size: number; // packet duration / units
  transmissionStartTime?: number;
  transmissionEndTime?: number;
  deliveredTime?: number;
  attempts: number;
  hasCollided: boolean;
  status: 'queued' | 'transmitting' | 'collided' | 'delivered';
  currentBackoffRemaining?: number;
}

export interface Device {
  id: number;
  name: string;
  state: DeviceState;
  packetQueue: Packet[];
  currentPacket: Packet | null;
  backoffTimer: number; // remaining time units in backoff
  collisionCount: number; // consecutive collision count for exponential backoff
  sensingTimer: number; // timer for sensing
  successfulPackets: number;
  totalAttempts: number;
  collidedAttempts: number;
}

export type EventType =
  | 'PACKET_GENERATED'
  | 'CHANNEL_SENSED_IDLE'
  | 'CHANNEL_SENSED_BUSY'
  | 'TRANSMISSION_STARTED'
  | 'TRANSMISSION_ABORTED'
  | 'COLLISION_DETECTED'
  | 'ENTERED_BACKOFF'
  | 'PACKET_DELIVERED'
  | 'SLOT_TICK';

export interface SimulationEvent {
  id: string;
  timestamp: number; // simulation time
  type: EventType;
  deviceId?: number;
  packetId?: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface SimulationConfig {
  protocol: ProtocolType;
  numDevices: number; // 5 to 20
  packetArrivalRate: number; // packets per unit time per device (lambda) e.g., 0.01 - 0.2
  packetDuration: number; // transmission duration in time units (e.g. 5 or 10 units)
  slotDuration: number; // for slotted ALOHA (equal to packetDuration)
  propagationDelay: number; // for CSMA / CSMA-CD vulnerability window (e.g. 1 unit)
  maxBackoffSlots: number; // max backoff window multiplier
  simulationDuration: number; // max simulation time (or infinite)
  randomSeed: number; // PRNG seed
  csmaPersistence: '1-persistent' | 'non-persistent';
}

export interface TimeSeriesPoint {
  time: number;
  throughput: number; // successful data delivered per time unit
  collisionRate: number; // cumulative or windowed
  channelUtilization: number; // fraction of channel time occupied by successful data
  offeredLoadG: number; // total attempts * duration / time
  activeTransmissions: number;
}

export interface SimulationMetrics {
  currentTime: number;
  currentSlot: number;
  totalPacketsGenerated: number;
  successfulDeliveries: number;
  collidedAttempts: number;
  totalAttempts: number;
  activePacketsInFlight: number;
  devicesInBackoff: number;
  throughput: number; // successful transmission time / total simulation time
  collisionRate: number; // collidedAttempts / totalAttempts
  averagePacketDelay: number; // mean time from generation to successful delivery
  channelUtilization: number; // successful channel busy time / total time
  offeredLoadG: number; // normalized traffic load G
  timeSeries: TimeSeriesPoint[];
}

export interface ChannelTransmission {
  packetId: string;
  deviceId: number;
  startTime: number;
  endTime: number;
  collided: boolean;
  color: string;
}

export interface ChannelState {
  isBusy: boolean;
  transmissions: ChannelTransmission[];
  collisionActive: boolean;
  lastCollisionTime?: number;
}

export interface SimulationSnapshot {
  time: number;
  slot: number;
  devices: Device[];
  channel: ChannelState;
  metrics: SimulationMetrics;
  recentEvents: SimulationEvent[];
  config: SimulationConfig;
  isRunning: boolean;
  isPaused: boolean;
}
