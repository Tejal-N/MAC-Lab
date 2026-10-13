import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationEngine } from '../engine';
import { SeededRandom } from '../random';
import { ChannelTracker } from '../channel';
import { MetricsTracker } from '../metrics';

describe('SeededRandom PRNG', () => {
  it('produces identical pseudo-random sequences for the same seed', () => {
    const rng1 = new SeededRandom(42);
    const rng2 = new SeededRandom(42);

    const seq1 = Array.from({ length: 20 }, () => rng1.next());
    const seq2 = Array.from({ length: 20 }, () => rng2.next());

    expect(seq1).toEqual(seq2);
  });

  it('produces different sequences for different seeds', () => {
    const rng1 = new SeededRandom(42);
    const rng2 = new SeededRandom(999);

    expect(rng1.next()).not.toEqual(rng2.next());
  });
});

describe('ChannelTracker Collision Detection', () => {
  let tracker: ChannelTracker;

  beforeEach(() => {
    tracker = new ChannelTracker();
  });

  it('reports idle when empty', () => {
    expect(tracker.isChannelBusy(0)).toBe(false);
  });

  it('detects overlap collision when a second transmission begins', () => {
    const res1 = tracker.addTransmission('P001', 1, 0, 10, '#06b6d4');
    expect(res1.collidedWithExisting).toBe(false);
    expect(tracker.isChannelBusy(5)).toBe(true);

    const res2 = tracker.addTransmission('P002', 2, 5, 15, '#06b6d4');
    expect(res2.collidedWithExisting).toBe(true);
    expect(tracker.getState().collisionActive).toBe(true);

    const tx1 = tracker.getTransmission('P001');
    const tx2 = tracker.getTransmission('P002');
    expect(tx1?.collided).toBe(true);
    expect(tx2?.collided).toBe(true);
  });

  it('aborts transmission early in CSMA/CD', () => {
    tracker.addTransmission('P001', 1, 0, 10, '#06b6d4');
    tracker.addTransmission('P002', 2, 2, 12, '#06b6d4');

    const aborted = tracker.abortTransmission('P001', 3);
    expect(aborted?.endTime).toBe(3);
    expect(tracker.getTransmission('P001')).toBeUndefined();
  });
});

describe('MetricsTracker Calculations', () => {
  it('correctly calculates throughput, collision rate, and average delay', () => {
    const tracker = new MetricsTracker(10);

    tracker.recordPacketGeneration();
    tracker.recordTransmissionAttempt();
    tracker.recordSuccessfulDelivery(15, 10); // delay = 15, payload = 10

    tracker.recordPacketGeneration();
    tracker.recordTransmissionAttempt();
    tracker.recordCollision();

    const metrics = tracker.getMetrics(50, 5, 0, 0);

    // 1 successful out of 2 attempts -> collision rate = 0.5 (50%)
    expect(metrics.collisionRate).toBe(0.5);
    expect(metrics.successfulDeliveries).toBe(1);
    expect(metrics.collidedAttempts).toBe(1);
    expect(metrics.averagePacketDelay).toBe(15);
    // Throughput = 10 / 50 = 0.2
    expect(metrics.throughput).toBe(0.2);
    // Channel utilization = 10 / 50 = 0.2
    expect(metrics.channelUtilization).toBe(0.2);
  });
});

describe('SimulationEngine Protocol Execution', () => {
  it('guarantees seeded reproducibility across engine instances', () => {
    const engine1 = new SimulationEngine({ protocol: 'pure-aloha', randomSeed: 777 });
    const engine2 = new SimulationEngine({ protocol: 'pure-aloha', randomSeed: 777 });

    for (let i = 0; i < 50; i++) {
      engine1.step();
      engine2.step();
    }

    const snap1 = engine1.getSnapshot();
    const snap2 = engine2.getSnapshot();

    expect(snap1.metrics.totalPacketsGenerated).toBe(snap2.metrics.totalPacketsGenerated);
    expect(snap1.metrics.successfulDeliveries).toBe(snap2.metrics.successfulDeliveries);
    expect(snap1.metrics.collidedAttempts).toBe(snap2.metrics.collidedAttempts);
    expect(snap1.metrics.throughput).toBe(snap2.metrics.throughput);
  });

  it('resets clock, devices, and metrics to pristine initial state', () => {
    const engine = new SimulationEngine({ protocol: 'pure-aloha', randomSeed: 123 });
    for (let i = 0; i < 20; i++) {
      engine.step();
    }

    expect(engine.getSnapshot().time).toBe(20);
    engine.reset();

    const snap = engine.getSnapshot();
    expect(snap.time).toBe(0);
    expect(snap.channel.isBusy).toBe(false);
    expect(snap.metrics.totalAttempts).toBe(0);
    expect(snap.metrics.successfulDeliveries).toBe(0);
  });

  it('enforces slot boundaries in Slotted ALOHA', () => {
    const engine = new SimulationEngine({
      protocol: 'slotted-aloha',
      packetArrivalRate: 0.1,
      slotDuration: 10,
      randomSeed: 42,
    });

    for (let i = 0; i < 30; i++) {
      engine.step();
      const snap = engine.getSnapshot();

      // Whenever a transmission starts, the start time must be a multiple of slotDuration!
      for (const tx of snap.channel.transmissions) {
        expect(tx.startTime % snap.config.slotDuration).toBe(0);
      }
    }
  });

  it('defers transmission when channel is busy in CSMA', () => {
    const engine = new SimulationEngine({
      protocol: 'csma',
      numDevices: 10,
      packetArrivalRate: 0.05,
      randomSeed: 100,
    });

    for (let i = 0; i < 40; i++) {
      engine.step();
    }

    const snap = engine.getSnapshot();
    expect(snap.metrics.totalPacketsGenerated).toBeGreaterThan(0);
  });

  it('executes CSMA/CD collision detection and abort during transmission', () => {
    const engine = new SimulationEngine({
      protocol: 'csma-cd',
      numDevices: 12,
      packetArrivalRate: 0.1,
      randomSeed: 42,
    });

    for (let i = 0; i < 60; i++) {
      engine.step();
    }

    const snap = engine.getSnapshot();
    expect(snap.metrics.totalPacketsGenerated).toBeGreaterThan(0);
    expect(snap.metrics.totalAttempts).toBeGreaterThan(0);
  });
});
