
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

  const statusText = !isRunning
    ? 'Ready'
    : isPaused
      ? 'Paused'
      : 'Running';

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-1.5 text-blue-600">
              <Radio className="h-4 w-4" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold tracking-tight text-slate-900">
                  MAC LAB
                </span>
                <span className="hidden text-xs text-slate-300 sm:inline">
                  |
                </span>
                <span className="hidden text-xs font-medium text-slate-500 sm:inline">
                  Simulation Lab
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="rounded border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
              {getProtocolLabel(activeProtocol)}
            </div>

            <div className="flex items-center space-x-1.5 rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs">
              <span className="text-slate-500">Time:</span>
              <span className="font-mono font-semibold text-slate-800">
                {currentTime}u
              </span>
            </div>

            <div className="flex items-center space-x-1.5 rounded border border-blue-100 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              <span>{statusText}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
