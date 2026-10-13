
import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Gauge,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { SimulationConfig } from '../../types/simulation';

interface SimulationControlsProps {
  isPlaying: boolean;
  speed: number;
  onSetSpeed: (speed: number) => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onStep: () => void;
  config: SimulationConfig;
  onUpdateConfig: (config: Partial<SimulationConfig>) => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  isPlaying,
  speed,
  onSetSpeed,
  onStart,
  onPause,
  onResume,
  onReset,
  onStep,
  config,
  onUpdateConfig,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3.5">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-200 pb-3 sm:flex-row sm:items-center">
        <div className="flex items-center space-x-2">
          {!isPlaying ? (
            <button
              onClick={onStart}
              className="flex items-center space-x-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Start</span>
            </button>
          ) : (
            <button
              onClick={onPause}
              className="flex items-center space-x-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              <Pause className="h-3.5 w-3.5 fill-current" />
              <span>Pause</span>
            </button>
          )}

          <button
            onClick={onStep}
            disabled={isPlaying}
            className="flex items-center space-x-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <StepForward className="h-3.5 w-3.5" />
            <span>Step</span>
          </button>

          <button
            onClick={onReset}
            className="flex items-center space-x-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>

        <div className="flex items-center space-x-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs">
          <Gauge className="h-3.5 w-3.5 text-blue-600" />
          <span className="text-slate-500">Speed:</span>

          <input
            type="range"
            min="1"
            max="30"
            value={speed}
            onChange={(e) =>
              onSetSpeed(
                Math.max(1, Math.min(30, Number(e.target.value))),
              )
            }
            className="h-1.5 w-24 cursor-pointer appearance-none rounded accent-blue-600"
          />

          <span className="w-7 text-right font-mono font-semibold text-blue-700">
            {speed}x
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
          <div className="mb-1 flex items-center justify-between text-slate-600">
            <span>Devices (N)</span>
            <span className="font-mono font-semibold text-blue-700">
              {config.numDevices} nodes
            </span>
          </div>

          <input
            type="range"
            min="5"
            max="20"
            value={config.numDevices}
            onChange={(e) =>
              onUpdateConfig({
                numDevices: Math.max(
                  5,
                  Math.min(20, Number(e.target.value)),
                ),
              })
            }
            className="h-1 w-full cursor-pointer appearance-none rounded accent-blue-600"
          />
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
          <div className="mb-1 flex items-center justify-between text-slate-600">
            <span>Traffic Intensity (Arrival Rate λ)</span>
            <span className="font-mono font-semibold text-blue-700">
              {config.packetArrivalRate.toFixed(3)}
            </span>
          </div>

          <input
            type="range"
            min="0.005"
            max="0.10"
            step="0.005"
            value={config.packetArrivalRate}
            onChange={(e) =>
              onUpdateConfig({
                packetArrivalRate: Math.max(
                  0.001,
                  Math.min(0.2, Number(e.target.value)),
                ),
              })
            }
            className="h-1 w-full cursor-pointer appearance-none rounded accent-blue-600"
          />
        </div>
      </div>

      <div className="pt-1">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-1 text-[11px] text-slate-500 transition hover:text-blue-700"
        >
          {showAdvanced ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
          <span>
            Advanced Configuration (Packet Duration, Prop Delay, Seed)
          </span>
        </button>

        {showAdvanced && (
          <div className="mt-2.5 grid grid-cols-1 gap-2.5 border-t border-slate-200 pt-2.5 text-xs sm:grid-cols-3">
            <div className="rounded border border-slate-200 bg-slate-50 p-2">
              <span className="mb-1 block text-slate-600">
                Packet Duration: {config.packetDuration}u
              </span>

              <input
                type="range"
                min="4"
                max="20"
                step="2"
                value={config.packetDuration}
                onChange={(e) => {
                  const val = Math.max(2, Number(e.target.value));
                  onUpdateConfig({
                    packetDuration: val,
                    slotDuration: val,
                  });
                }}
                className="h-1 w-full cursor-pointer appearance-none rounded accent-blue-600"
              />
            </div>

            <div className="rounded border border-slate-200 bg-slate-50 p-2">
              <span className="mb-1 block text-slate-600">
                Propagation Delay (τ): {config.propagationDelay}u
              </span>

              <input
                type="range"
                min="0"
                max="4"
                step="1"
                value={config.propagationDelay}
                onChange={(e) =>
                  onUpdateConfig({
                    propagationDelay: Math.max(
                      0,
                      Number(e.target.value),
                    ),
                  })
                }
                className="h-1 w-full cursor-pointer appearance-none rounded accent-blue-600"
              />
            </div>

            <div className="rounded border border-slate-200 bg-slate-50 p-2">
              <span className="mb-1 block text-slate-600">
                PRNG Seed:
              </span>

              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  value={config.randomSeed}
                  onChange={(e) =>
                    onUpdateConfig({
                      randomSeed: Number(e.target.value) || 1,
                    })
                  }
                  className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 outline-none focus:border-blue-500"
                />

                <button
                  onClick={() =>
                    onUpdateConfig({
                      randomSeed: Math.floor(Math.random() * 9000) + 1000,
                    })
                  }
                  className="rounded border border-slate-200 bg-white px-2 py-1 text-[10px] text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
                >
                  Rand
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
