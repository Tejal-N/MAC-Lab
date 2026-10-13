import { ChannelState, ChannelTransmission } from '../types/simulation';

export class ChannelTracker {
  private activeTransmissions: Map<string, ChannelTransmission> = new Map();
  private collisionActive: boolean = false;
  private lastCollisionTime?: number;
  private totalBusyTime: number = 0;
  private successfulChannelTime: number = 0;

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.activeTransmissions.clear();
    this.collisionActive = false;
    this.lastCollisionTime = undefined;
    this.totalBusyTime = 0;
    this.successfulChannelTime = 0;
  }

  /**
   * Check if channel has any active transmission at this instant.
   * If propagationDelay is specified, returns whether any transmission has
   * propagated (time >= start + propagationDelay).
   */
  public isChannelBusy(currentTime: number, propagationDelay: number = 0): boolean {
    if (this.activeTransmissions.size === 0) return false;
    if (propagationDelay <= 0) return true;

    // Sensed as busy if at least one transmission has propagated past the delay window
    for (const tx of this.activeTransmissions.values()) {
      if (currentTime >= tx.startTime + propagationDelay) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if channel is strictly occupied physically (regardless of propagation delay sensing)
   */
  public hasAnyPhysicalTransmission(): boolean {
    return this.activeTransmissions.size > 0;
  }

  /**
   * Register a new transmission starting on the channel.
   * If there are already active transmissions, all active transmissions collide!
   */
  public addTransmission(
    packetId: string,
    deviceId: number,
    startTime: number,
    endTime: number,
    color: string
  ): { collidedWithExisting: boolean } {
    let collidedWithExisting = false;

    if (this.activeTransmissions.size > 0) {
      collidedWithExisting = true;
      this.collisionActive = true;
      this.lastCollisionTime = startTime;

      // Mark all existing active transmissions as collided
      for (const tx of this.activeTransmissions.values()) {
        tx.collided = true;
      }
    }

    const newTx: ChannelTransmission = {
      packetId,
      deviceId,
      startTime,
      endTime,
      collided: collidedWithExisting,
      color,
    };

    this.activeTransmissions.set(packetId, newTx);
    return { collidedWithExisting };
  }

  /**
   * Mark all active transmissions as collided
   */
  public markAllCollided(currentTime: number): void {
    this.collisionActive = true;
    this.lastCollisionTime = currentTime;
    for (const tx of this.activeTransmissions.values()) {
      tx.collided = true;
    }
  }

  /**
   * Remove completed or aborted transmission
   */
  public removeTransmission(packetId: string): ChannelTransmission | undefined {
    const tx = this.activeTransmissions.get(packetId);
    if (tx) {
      this.activeTransmissions.delete(packetId);
      if (this.activeTransmissions.size <= 1) {
        this.collisionActive = false;
      }
    }
    return tx;
  }

  /**
   * Abort a transmission early (used in CSMA/CD when collision is detected)
   */
  public abortTransmission(packetId: string, abortTime: number): ChannelTransmission | undefined {
    const tx = this.activeTransmissions.get(packetId);
    if (tx) {
      tx.endTime = abortTime;
      tx.collided = true;
      this.activeTransmissions.delete(packetId);
      if (this.activeTransmissions.size <= 1) {
        this.collisionActive = false;
      }
    }
    return tx;
  }

  public getTransmission(packetId: string): ChannelTransmission | undefined {
    return this.activeTransmissions.get(packetId);
  }

  public getActiveTransmissions(): ChannelTransmission[] {
    return Array.from(this.activeTransmissions.values());
  }

  public getState(): ChannelState {
    return {
      isBusy: this.activeTransmissions.size > 0,
      transmissions: Array.from(this.activeTransmissions.values()),
      collisionActive: this.collisionActive,
      lastCollisionTime: this.lastCollisionTime,
    };
  }
}
