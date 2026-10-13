/**
 * Seeded Pseudo-Random Number Generator using Mulberry32.
 * Ensures 100% deterministic, repeatable simulation runs.
 */
export class SeededRandom {
  private initialSeed: number;
  private state: number;

  constructor(seed: number = 42) {
    this.initialSeed = Math.floor(Math.abs(seed)) || 42;
    this.state = this.initialSeed;
  }

  public reset(seed?: number): void {
    if (seed !== undefined) {
      this.initialSeed = Math.floor(Math.abs(seed)) || 42;
    }
    this.state = this.initialSeed;
  }

  public getSeed(): number {
    return this.initialSeed;
  }

  /**
   * Generates a float in [0, 1) using Mulberry32
   */
  public next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generates an integer in [min, max] inclusive
   */
  public nextInt(min: number, max: number): number {
    if (min >= max) return min;
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Returns true with given probability p in [0, 1]
   */
  public nextBool(probability: number): boolean {
    if (probability <= 0) return false;
    if (probability >= 1) return true;
    return this.next() < probability;
  }

  /**
   * Generates exponentially distributed random value (mean = 1 / lambda)
   */
  public nextExponential(lambda: number): number {
    if (lambda <= 0) return 0;
    const u = Math.max(1e-9, this.next());
    return -Math.log(u) / lambda;
  }

  /**
   * Generates Poisson distributed integer using Knuth's algorithm
   */
  public nextPoisson(lambda: number): number {
    if (lambda <= 0) return 0;
    const L = Math.exp(-lambda);
    let k = 0;
    let p = 1.0;
    do {
      k++;
      p *= this.next();
    } while (p > L);
    return k - 1;
  }
}
