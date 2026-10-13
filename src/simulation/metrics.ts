import { SimulationMetrics, TimeSeriesPoint } from '../types/simulation';

export class MetricsTracker {
  private totalPacketsGenerated: number = 0;
  private successfulDeliveries: number = 0;
  private collidedAttempts: number = 0;
  private totalAttempts: number = 0;
  private totalDelaySum: number = 0;
  private totalSuccessfulChannelTime: number = 0;
  private packetDuration: number = 10;
  private timeSeries: TimeSeriesPoint[] = [];
  private lastTimeSeriesSampleTime: number = 0;
  private sampleInterval: number = 2; // sample every 2 time units for smooth charts

  constructor(packetDuration: number = 10) {
    this.packetDuration = packetDuration;
    this.reset();
  }

  public reset(packetDuration?: number): void {
    if (packetDuration !== undefined) {
      this.packetDuration = packetDuration;
    }
    this.totalPacketsGenerated = 0;
    this.successfulDeliveries = 0;
    this.collidedAttempts = 0;
    this.totalAttempts = 0;
    this.totalDelaySum = 0;
    this.totalSuccessfulChannelTime = 0;
    this.timeSeries = [];
    this.lastTimeSeriesSampleTime = 0;
  }

  public recordPacketGeneration(): void {
    this.totalPacketsGenerated++;
  }

  public recordTransmissionAttempt(): void {
    this.totalAttempts++;
  }

  public recordCollision(): void {
    this.collidedAttempts++;
  }

  public recordSuccessfulDelivery(delay: number, packetDuration: number): void {
    this.successfulDeliveries++;
    this.totalDelaySum += delay;
    this.totalSuccessfulChannelTime += packetDuration;
  }

  public sampleTimeSeries(
    currentTime: number,
    activeTransmissions: number
  ): void {
    if (currentTime - this.lastTimeSeriesSampleTime >= this.sampleInterval || currentTime === 0) {
      this.lastTimeSeriesSampleTime = currentTime;
      const metrics = this.getMetrics(currentTime, 0, 0, 0);
      this.timeSeries.push({
        time: Math.round(currentTime * 10) / 10,
        throughput: metrics.throughput,
        collisionRate: metrics.collisionRate,
        channelUtilization: metrics.channelUtilization,
        offeredLoadG: metrics.offeredLoadG,
        activeTransmissions,
      });

      // Keep recent 120 points for smooth performance
      if (this.timeSeries.length > 150) {
        this.timeSeries.shift();
      }
    }
  }

  public getMetrics(
    currentTime: number,
    currentSlot: number,
    activePacketsInFlight: number,
    devicesInBackoff: number
  ): SimulationMetrics {
    const timeSafe = Math.max(1, currentTime);

    // Throughput: normalized fraction of time delivering successful data
    const throughput = Math.min(1, this.totalSuccessfulChannelTime / timeSafe);

    // Collision rate: collided attempts / total attempts
    const collisionRate =
      this.totalAttempts > 0 ? this.collidedAttempts / this.totalAttempts : 0;

    // Average packet delay: mean duration from generation to delivery for delivered packets
    const averagePacketDelay =
      this.successfulDeliveries > 0
        ? this.totalDelaySum / this.successfulDeliveries
        : 0;

    // Channel utilization: ratio of useful payload transmission time to total time
    const channelUtilization = Math.min(
      1,
      this.totalSuccessfulChannelTime / timeSafe
    );

    // Offered load G: total transmission attempts scaled by packet duration / time
    const offeredLoadG =
      (this.totalAttempts * this.packetDuration) / timeSafe;

    return {
      currentTime,
      currentSlot,
      totalPacketsGenerated: this.totalPacketsGenerated,
      successfulDeliveries: this.successfulDeliveries,
      collidedAttempts: this.collidedAttempts,
      totalAttempts: this.totalAttempts,
      activePacketsInFlight,
      devicesInBackoff,
      throughput: Math.round(throughput * 1000) / 1000,
      collisionRate: Math.round(collisionRate * 1000) / 1000,
      averagePacketDelay: Math.round(averagePacketDelay * 10) / 10,
      channelUtilization: Math.round(channelUtilization * 1000) / 1000,
      offeredLoadG: Math.round(offeredLoadG * 1000) / 1000,
      timeSeries: [...this.timeSeries],
    };
  }
}
