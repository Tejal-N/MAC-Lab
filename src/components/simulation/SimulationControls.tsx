import React, { useState } from 'react';
import { Play, Pause, RotateCcw, StepForward, Gauge, ChevronDown, ChevronRight, Dices } from 'lucide-react';
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
    <div className="bg-charcoal-900 border border-charcoal-700/80 rounded-xl p-3.5 space-y-3">
      {/* Playback Buttons & Clock Speed */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-charcoal-800">
        <div className="flex items-center space-x-2">
          {!isPlaying ? (
            <button
              onClick={onStart}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Start</span>
            </button>
          ) : (
            <button
              onClick={onPause}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold transition"
            >
              <Pause className="w-3.5 h-3.5 fill-white" />
              <span>Pause</span>
            </button>
          )}

          <button
            onClick={onStep}
            disabled={isPlaying}
            className="flex items-center space-x-1 px-3 py-1.5 bg-charcoal-800 hover:bg-charcoal-700 disabled:opacity-40 text-slate-200 rounded-lg text-xs font-medium border border-charcoal-700 transition"
          >
            <StepForward className="w-3.5 h-3.5 text-cyan-400" />
            <span>Step</span>
          </button>

          <button
            onClick={onReset}
            className="flex items-center space-x-1 px-3 py-1.5 bg-charcoal-800 hover:bg-charcoal-700 text-slate-200 rounded-lg text-xs font-medium border border-charcoal-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>Reset</span>
          </button>
        </div>

        {/* Speed Slider */}
        <div className="flex items-center space-x-2.5 bg-charcoal-950 px-3 py-1 rounded-lg border border-charcoal-800 text-xs">
          <Gauge className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Speed:</span>
          <input
            type="range"
            min="1"
            max="30"
            value={speed}
            onChange={(e) => onSetSpeed(Math.max(1, Math.min(30, Number(e.target.value))))}
            className="w-24 h-1.5 bg-charcoal-700 rounded appearance-none cursor-pointer accent-cyan-400"
          />
          <span className="font-mono text-cyan-400 font-semibold w-7 text-right">
            {speed}x
          </span>
        </div>
      </div>

      {/* Primary Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Device count */}
        <div className="bg-charcoal-950 p-2.5 rounded-lg border border-charcoal-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>Devices (N)</span>
            <span className="font-mono text-cyan-300 font-semibold">{config.numDevices} nodes</span>
          </div>
          <input
            type="range"
            min="5"
            max="20"
            value={config.numDevices}
            onChange={(e) => onUpdateConfig({ numDevices: Math.max(5, Math.min(20, Number(e.target.value))) })}
            className="w-full h-1 bg-charcoal-700 rounded appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Traffic arrival rate */}
        <div className="bg-charcoal-950 p-2.5 rounded-lg border border-charcoal-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>Traffic Intensity (Arrival Rate λ)</span>
            <span className="font-mono text-cyan-300 font-semibold">{config.packetArrivalRate.toFixed(3)}</span>
          </div>
          <input
            type="range"
            min="0.005"
            max="0.10"
            step="0.005"
            value={config.packetArrivalRate}
            onChange={(e) => onUpdateConfig({ packetArrivalRate: Math.max(0.001, Math.min(0.2, Number(e.target.value))) })}
            className="w-full h-1 bg-charcoal-700 rounded appearance-none cursor-pointer accent-cyan-400"
          />
        </div>
      </div>

      {/* Advanced Settings Collapsible */}
      <div className="pt-1">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-slate-300 transition"
        >
          {showAdvanced ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          <span>Advanced Configuration (Packet Duration, Prop Delay, Seed)</span>
        </button>

        {showAdvanced && (
          <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs pt-2 border-t border-charcoal-800/80">
            {/* Packet Duration */}
            <div className="bg-charcoal-950 p-2 rounded border border-charcoal-800">
              <span className="text-slate-400 block mb-1">Packet Duration: {config.packetDuration}u</span>
              <input
                type="range"
                min="4"
                max="20"
                step="2"
                value={config.packetDuration}
                onChange={(e) => {
                  const val = Math.max(2, Number(e.target.value));
                  onUpdateConfig({ packetDuration: val, slotDuration: val });
                }}
                className="w-full h-1 bg-charcoal-700 rounded appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Propagation Delay */}
            <div className="bg-charcoal-950 p-2 rounded border border-charcoal-800">
              <span className="text-slate-400 block mb-1">Propagation Delay (τ): {config.propagationDelay}u</span>
              <input
                type="range"
                min="0"
                max="4"
                step="1"
                value={config.propagationDelay}
                onChange={(e) => onUpdateConfig({ propagationDelay: Math.max(0, Number(e.target.value)) })}
                className="w-full h-1 bg-charcoal-700 rounded appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Seed */}
            <div className="bg-charcoal-950 p-2 rounded border border-charcoal-800">
              <span className="text-slate-400 block mb-1">PRNG Seed:</span>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  value={config.randomSeed}
                  onChange={(e) => onUpdateConfig({ randomSeed: Number(e.target.value) || 1 })}
                  className="w-full bg-charcoal-900 border border-charcoal-700 rounded px-2 py-0.5 text-xs font-mono text-slate-200"
                />
                <button
                  onClick={() => onUpdateConfig({ randomSeed: Math.floor(Math.random() * 9000) + 1000 })}
                  className="px-2 py-0.5 bg-charcoal-800 border border-charcoal-700 rounded text-slate-300 text-[10px] font-mono"
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
