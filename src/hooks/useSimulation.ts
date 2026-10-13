import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_CONFIG, SimulationEngine } from '../simulation/engine';
import { SimulationConfig, SimulationSnapshot } from '../types/simulation';

export function useSimulation(initialConfig: Partial<SimulationConfig> = {}) {
  const engineRef = useRef<SimulationEngine | null>(null);
  const [snapshot, setSnapshot] = useState<SimulationSnapshot>(() => {
    const engine = new SimulationEngine(initialConfig);
    engineRef.current = engine;
    return engine.getSnapshot();
  });

  const [speed, setSpeed] = useState<number>(5); // steps per second (1 to 60)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTickTimeRef = useRef<number>(0);

  // Initialize engine if not already done
  if (!engineRef.current) {
    engineRef.current = new SimulationEngine(initialConfig);
  }

  const syncSnapshot = useCallback(() => {
    if (engineRef.current) {
      setSnapshot(engineRef.current.getSnapshot());
    }
  }, []);

  const step = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.step();
      syncSnapshot();
    }
  }, [syncSnapshot]);

  const start = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.start();
      setIsPlaying(true);
      lastTickTimeRef.current = performance.now();
      syncSnapshot();
    }
  }, [syncSnapshot]);

  const pause = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.pause();
      setIsPlaying(false);
      syncSnapshot();
    }
  }, [syncSnapshot]);

  const resume = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.resume();
      setIsPlaying(true);
      lastTickTimeRef.current = performance.now();
      syncSnapshot();
    }
  }, [syncSnapshot]);

  const reset = useCallback(
    (newConfig?: Partial<SimulationConfig>) => {
      if (engineRef.current) {
        engineRef.current.reset(newConfig);
        setIsPlaying(false);
        syncSnapshot();
      }
    },
    [syncSnapshot]
  );

  const updateConfig = useCallback(
    (newConfig: Partial<SimulationConfig>) => {
      if (engineRef.current) {
        engineRef.current.setConfig(newConfig);
        syncSnapshot();
      }
    },
    [syncSnapshot]
  );

  const clearLog = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.clearEventLog();
      syncSnapshot();
    }
  }, [syncSnapshot]);

  // Main simulation clock loop
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      return;
    }

    const intervalMs = 1000 / speed;

    const loop = (timestamp: number) => {
      const elapsed = timestamp - lastTickTimeRef.current;

      if (elapsed >= intervalMs) {
        // Run steps based on elapsed time, capped to prevent spiral of death
        const stepsToRun = Math.min(Math.floor(elapsed / intervalMs), 5);
        for (let i = 0; i < stepsToRun; i++) {
          engineRef.current?.step();
        }
        lastTickTimeRef.current = timestamp - (elapsed % intervalMs);
        syncSnapshot();
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    lastTickTimeRef.current = performance.now();
    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
  }, [isPlaying, speed, syncSnapshot]);

  return {
    snapshot,
    isPlaying,
    speed,
    setSpeed,
    start,
    pause,
    resume,
    reset,
    step,
    updateConfig,
    clearLog,
    engine: engineRef.current,
  };
}
