import React from 'react';
import { Device, SimulationConfig, SimulationSnapshot } from '../../types/simulation';
import { Radio, AlertTriangle, CheckCircle2, Clock, Hourglass, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Legend } from './Legend';

interface NetworkCanvasProps {
  snapshot: SimulationSnapshot;
}

export const NetworkCanvas: React.FC<NetworkCanvasProps> = ({ snapshot }) => {
  const { devices, channel, time, slot, config, metrics, isRunning } = snapshot;
  const numDevices = devices.length;

  // Split devices across 1 or 2 rows depending on device count
  const topDevices = devices.filter((_, idx) => idx % 2 === 0);
  const bottomDevices = devices.filter((_, idx) => idx % 2 === 1);

  const getDeviceStateBadge = (state: Device['state'], backoffTimer: number) => {
    switch (state) {
      case 'idle':
        return { label: 'Idle', bg: 'bg-slate-800 text-slate-400 border-slate-700' };
      case 'packet-ready':
        return { label: 'Ready', bg: 'bg-cyan-950 text-cyan-300 border-cyan-800 animate-pulse' };
      case 'sensing':
        return { label: 'Sensing', bg: 'bg-purple-950 text-purple-300 border-purple-800' };
      case 'transmitting':
        return { label: 'Transmitting', bg: 'bg-blue-950 text-blue-300 border-blue-700 ring-1 ring-blue-500' };
      case 'waiting':
        return { label: 'Deferring', bg: 'bg-amber-950 text-amber-300 border-amber-800' };
      case 'backoff':
        return { label: `Backoff (${backoffTimer})`, bg: 'bg-orange-950 text-orange-300 border-orange-800' };
      case 'collision':
        return { label: 'Collision!', bg: 'bg-rose-950 text-rose-300 border-rose-700 animate-bounce' };
      case 'success':
        return { label: 'Delivered', bg: 'bg-emerald-950 text-emerald-300 border-emerald-700' };
    }
  };

  return (
    <div className="bg-charcoal-900 border border-charcoal-700/80 rounded-xl p-4 shadow-sm flex flex-col space-y-4">
      {/* Topology Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-charcoal-800">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-white">Shared Medium Bus Topology</span>
          <span className="text-xs px-2 py-0.5 rounded bg-charcoal-950 border border-charcoal-800 font-mono text-slate-400">
            {numDevices} Nodes attached
          </span>
          {config.protocol === 'slotted-aloha' && (
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/80 font-mono text-cyan-300">
              Slot: #{slot} (Boundary in {config.slotDuration - (time % config.slotDuration)} units)
            </span>
          )}
        </div>

        <Legend />
      </div>

      {/* Interactive Visual Network Diagram */}
      <div className="relative bg-charcoal-950 border border-charcoal-800/90 rounded-lg p-4 overflow-x-auto min-h-[360px] flex flex-col justify-between">
        {/* TOP ROW OF DEVICES */}
        <div className="flex items-center justify-around gap-2 pb-6">
          {topDevices.map((device) => {
            const badge = getDeviceStateBadge(device.state, device.backoffTimer);
            const isTransmitting = device.state === 'transmitting';
            const hasCollision = device.state === 'collision' || (device.currentPacket?.hasCollided && isTransmitting);

            return (
              <div
                key={device.id}
                className={`relative flex flex-col items-center p-2 rounded-lg border transition-all min-w-[85px] max-w-[120px] text-center ${
                  hasCollision
                    ? 'bg-rose-950/30 border-rose-500 shadow-lg shadow-rose-950/50'
                    : isTransmitting
                    ? 'bg-blue-950/40 border-cyan-400 shadow-md shadow-cyan-950/50'
                    : 'bg-charcoal-900/90 border-charcoal-700/70 hover:border-slate-500'
                }`}
              >
                {/* Node ID */}
                <div className="flex items-center space-x-1 mb-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      hasCollision
                        ? 'bg-rose-500 animate-ping'
                        : isTransmitting
                        ? 'bg-cyan-400 animate-pulse'
                        : 'bg-slate-500'
                    }`}
                  />
                  <span className="text-xs font-mono font-bold text-slate-200">D{String(device.id).padStart(2, '0')}</span>
                </div>

                {/* State Badge */}
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border mb-1 truncate max-w-full ${badge.bg}`}>
                  {badge.label}
                </span>

                {/* Packet & Queue Info */}
                <div className="text-[10px] font-mono text-slate-400 flex flex-col items-center">
                  {device.currentPacket ? (
                    <span className="text-cyan-400 font-semibold truncate">
                      {device.currentPacket.id}
                    </span>
                  ) : (
                    <span className="text-slate-600">Idle</span>
                  )}
                  <span className="text-slate-500 text-[9px]">
                    Q: {device.packetQueue.length}
                  </span>
                </div>

                {/* Connecting stub downward */}
                <div
                  className={`absolute -bottom-6 w-0.5 h-6 transition-colors ${
                    isTransmitting
                      ? hasCollision
                        ? 'bg-rose-500 shadow-[0_0_8px_#ef4444]'
                        : 'bg-cyan-400 shadow-[0_0_8px_#06b6d4]'
                      : 'bg-charcoal-700'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* SHARED TRANSMISSION BUS MEDIUM (HORIZONTAL TRUNK) */}
        <div className="relative my-4 py-3 flex items-center">
          {/* Main Bus Line */}
          <div
            className={`w-full h-3 rounded-full transition-all duration-300 relative ${
              channel.collisionActive
                ? 'bg-rose-600/70 channel-collision-glow border border-rose-400'
                : channel.isBusy
                ? 'bg-cyan-500/60 channel-active-glow border border-cyan-400'
                : 'bg-charcoal-800 border border-charcoal-700'
            }`}
          >
            {/* Bus Label & Carrier indicator */}
            <div className="absolute -top-6 left-2 flex items-center space-x-2 text-[10px] font-mono text-slate-400">
              <span className="text-slate-300 font-semibold uppercase">Shared Broadcast Bus</span>
              {channel.isBusy && (
                <span className="text-cyan-400 flex items-center space-x-1">
                  <Zap className="w-3 h-3 text-cyan-400 animate-pulse" />
                  <span>Carrier Detected</span>
                </span>
              )}
            </div>

            {/* Collision burst indicator on the bus */}
            {channel.collisionActive && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center">
                <svg className="w-16 h-16 absolute -top-6 -left-6 pointer-events-none">
                  <circle cx="32" cy="32" r="14" fill="none" stroke="#ef4444" className="animate-collision-ring" />
                  <circle cx="32" cy="32" r="24" fill="none" stroke="#f43f5e" className="animate-collision-ring" style={{ animationDelay: '0.4s' }} />
                </svg>
                <div className="bg-rose-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-300 flex items-center space-x-1 animate-pulse shadow-lg">
                  <AlertTriangle className="w-3 h-3" />
                  <span>COLLISION BURST</span>
                </div>
              </div>
            )}

            {/* Active packets flying across the bus */}
            {channel.transmissions.map((tx) => {
              const duration = tx.endTime - tx.startTime;
              const progress = Math.min(1, Math.max(0, (time - tx.startTime) / Math.max(1, duration)));
              const leftPercent = Math.min(92, Math.max(5, progress * 90));

              return (
                <div
                  key={tx.packetId}
                  className={`absolute top-1/2 -translate-y-1/2 z-10 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-all duration-150 ${
                    tx.collided
                      ? 'bg-rose-600 text-white border border-rose-300 shadow-sm shadow-rose-900'
                      : 'bg-cyan-500 text-charcoal-950 border border-cyan-200 shadow-md shadow-cyan-900'
                  }`}
                  style={{ left: `${leftPercent}%` }}
                >
                  {tx.packetId}
                </div>
              );
            })}
          </div>

          {/* Central Receiver Station at the right end of the bus */}
          <div className="ml-4 flex-shrink-0 flex flex-col items-center p-2.5 rounded-lg bg-charcoal-900 border border-emerald-500/40 shadow-sm text-center min-w-[110px]">
            <div className="flex items-center space-x-1 text-emerald-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Receiver</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Rx Delivered:
            </div>
            <div className="text-base font-bold font-mono text-emerald-300">
              {metrics.successfulDeliveries}
            </div>
          </div>
        </div>

        {/* BOTTOM ROW OF DEVICES (if any) */}
        {bottomDevices.length > 0 && (
          <div className="flex items-center justify-around gap-2 pt-6">
            {bottomDevices.map((device) => {
              const badge = getDeviceStateBadge(device.state, device.backoffTimer);
              const isTransmitting = device.state === 'transmitting';
              const hasCollision = device.state === 'collision' || (device.currentPacket?.hasCollided && isTransmitting);

              return (
                <div
                  key={device.id}
                  className={`relative flex flex-col items-center p-2 rounded-lg border transition-all min-w-[85px] max-w-[120px] text-center ${
                    hasCollision
                      ? 'bg-rose-950/30 border-rose-500 shadow-lg shadow-rose-950/50'
                      : isTransmitting
                      ? 'bg-blue-950/40 border-cyan-400 shadow-md shadow-cyan-950/50'
                      : 'bg-charcoal-900/90 border-charcoal-700/70 hover:border-slate-500'
                  }`}
                >
                  {/* Connecting stub upward */}
                  <div
                    className={`absolute -top-6 w-0.5 h-6 transition-colors ${
                      isTransmitting
                        ? hasCollision
                          ? 'bg-rose-500 shadow-[0_0_8px_#ef4444]'
                          : 'bg-cyan-400 shadow-[0_0_8px_#06b6d4]'
                        : 'bg-charcoal-700'
                    }`}
                  />

                  {/* Node ID */}
                  <div className="flex items-center space-x-1 mb-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        hasCollision
                          ? 'bg-rose-500 animate-ping'
                          : isTransmitting
                          ? 'bg-cyan-400 animate-pulse'
                          : 'bg-slate-500'
                      }`}
                    />
                    <span className="text-xs font-mono font-bold text-slate-200">D{String(device.id).padStart(2, '0')}</span>
                  </div>

                  {/* State Badge */}
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border mb-1 truncate max-w-full ${badge.bg}`}>
                    {badge.label}
                  </span>

                  {/* Packet & Queue Info */}
                  <div className="text-[10px] font-mono text-slate-400 flex flex-col items-center">
                    {device.currentPacket ? (
                      <span className="text-cyan-400 font-semibold truncate">
                        {device.currentPacket.id}
                      </span>
                    ) : (
                      <span className="text-slate-600">Idle</span>
                    )}
                    <span className="text-slate-500 text-[9px]">
                      Q: {device.packetQueue.length}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
