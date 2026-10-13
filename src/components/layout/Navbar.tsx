import React from 'react';
import { Radio } from 'lucide-react';
import { ProtocolType } from '../../types/simulation';

interface NavbarProps {
  activeProtocol: ProtocolType;
  isRunning: boolean;
  isPaused: boolean;
  currentTime: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeProtocol,
  isRunning,
  isPaused,
  currentTime,
}) => {
  const getProtocolLabel = (proto: ProtocolType) => {
    switch (proto) {
      case 'pure-aloha':
        return 'Pure ALOHA';
      case 'slotted-aloha':
        return 'Slotted ALOHA';
      case 'csma':
        return 'CSMA';
      case 'csma-cd':
        return 'CSMA / CD';
    }
  };

  const statusText = !isRunning ? 'Ready' : isPaused ? 'Paused' : 'Running';
  const statusColor = !isRunning
    ? 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    : isPaused
    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';

  return (
    <header className="bg-charcoal-900 border-b border-charcoal-700/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="p-1.5 rounded-lg bg-charcoal-800 border border-charcoal-700 text-cyan-400">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold tracking-tight text-white">MAC LAB</span>
                <span className="text-xs text-slate-400 hidden sm:inline">|</span>
                <span className="text-xs text-slate-300 font-medium hidden sm:inline">Simulation Lab</span>
              </div>
            </div>
          </div>

          {/* Protocol & Clock Badges */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="text-xs font-mono bg-charcoal-950 px-2.5 py-1 rounded border border-charcoal-800 text-cyan-400 font-medium">
              {getProtocolLabel(activeProtocol)}
            </div>

            <div className="flex items-center space-x-1.5 text-xs font-mono bg-charcoal-950 px-2.5 py-1 rounded border border-charcoal-800">
              <span className="text-slate-400">Time:</span>
              <span className="text-slate-200 font-semibold">{currentTime}u</span>
            </div>

            <div className={`px-2 py-0.5 rounded text-xs font-mono font-medium border flex items-center space-x-1.5 ${statusColor}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
              <span>{statusText}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
