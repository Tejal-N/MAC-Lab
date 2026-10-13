import React from 'react';
import {
  AlertTriangle,
  Radio,
  ShieldCheck,
  Zap,
  Monitor,
} from 'lucide-react';
import { Device, SimulationSnapshot } from '../../types/simulation';

interface NetworkCanvasProps {
  snapshot: SimulationSnapshot;
}

const primary = '#2563EB';

export const NetworkCanvas: React.FC<NetworkCanvasProps> = ({
  snapshot,
}) => {
  const {
    devices,
    channel,
    time,
    slot,
    config,
    metrics,
  } = snapshot;

  const topDevices = devices.filter((_, index) => index % 2 === 0);
  const bottomDevices = devices.filter((_, index) => index % 2 === 1);

  const getDeviceState = (
    state: Device['state'],
    backoffTimer: number,
  ) => {
    switch (state) {
      case 'idle':
        return 'Idle';
      case 'packet-ready':
        return 'Ready';
      case 'sensing':
        return 'Sensing';
      case 'transmitting':
        return 'Sending';
      case 'waiting':
        return 'Waiting';
      case 'backoff':
        return `Backoff (${backoffTimer})`;
      case 'collision':
        return 'Collision';
      case 'success':
        return 'Delivered';
      default:
        return 'Idle';
    }
  };

  const renderDevice = (device: Device) => {
    const isTransmitting = device.state === 'transmitting';

    const hasCollision =
      device.state === 'collision' ||
      Boolean(device.currentPacket?.hasCollided && isTransmitting);

    const isActive =
      isTransmitting ||
      device.state === 'packet-ready' ||
      device.state === 'sensing';

    const isTopDevice = topDevices.some(
      (item) => item.id === device.id,
    );

    return (
      <div
        key={device.id}
        className="relative flex min-w-[58px] flex-col items-center gap-1.5 text-center"
      >
        {/* PC icon */}
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors duration-200 ${
            hasCollision
              ? 'border-dashed border-blue-600 bg-blue-50 text-blue-700'
              : isActive
                ? 'border-blue-300 bg-blue-50 text-blue-700'
                : device.state === 'success'
                  ? 'border-slate-300 bg-white text-slate-700'
                  : 'border-slate-200 bg-white text-slate-500'
          }`}
        >
          <Monitor size={21} strokeWidth={1.7} />
        </div>

        {/* Device label */}
        <span className="font-mono text-[10px] font-semibold text-slate-700">
          D{String(device.id).padStart(2, '0')}
        </span>

        {/* Device state */}
        <span
          className={`max-w-[76px] truncate text-[9px] font-medium ${
            hasCollision || isActive
              ? 'text-blue-700'
              : 'text-slate-500'
          }`}
        >
          {getDeviceState(device.state, device.backoffTimer)}
        </span>

        {/* Packet and queue information */}
        <div className="flex max-w-[76px] flex-col items-center gap-0.5 font-mono text-[9px]">
          {device.currentPacket ? (
            <span className="max-w-full truncate text-blue-700">
              {device.currentPacket.id}
            </span>
          ) : (
            <span className="text-slate-400">No packet</span>
          )}

          <span className="text-slate-500">
            Q: {device.packetQueue.length}
          </span>
        </div>

        {hasCollision && (
          <div className="flex items-center gap-0.5 text-[9px] font-medium text-blue-700">
            <AlertTriangle size={10} />
            Collision
          </div>
        )}

        {/* Connector to the shared channel */}
        <div
          className={`absolute left-1/2 h-3 w-px -translate-x-1/2 ${
            isTransmitting ? 'bg-blue-500' : 'bg-slate-300'
          } ${isTopDevice ? '-bottom-3' : '-top-3'}`}
        />
      </div>
    );
  };

  const renderTransmission = (
    tx: (typeof channel.transmissions)[number],
  ) => {
    const duration = Math.max(1, tx.endTime - tx.startTime);

    const progress = Math.min(
      1,
      Math.max(0, (time - tx.startTime) / duration),
    );

    const leftPercent = Math.min(92, Math.max(4, progress * 90));

    return (
      <div
        key={tx.packetId}
        className={`absolute top-1/2 z-10 -translate-y-1/2 rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold ${
          tx.collided
            ? 'border border-dashed border-blue-700 bg-white text-blue-800'
            : 'bg-blue-600 text-white'
        }`}
        style={{ left: `${leftPercent}%` }}
      >
        {tx.packetId}
      </div>
    );
  };

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Network Simulation
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Shared-medium bus topology
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
          <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-slate-600">
            {devices.length} Nodes
          </span>

          {config.protocol === 'slotted-aloha' && (
            <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-blue-800">
              Slot #{slot} · Next boundary in{' '}
              {config.slotDuration - (time % config.slotDuration)} units
            </span>
          )}
        </div>
      </div>

      {/* Compact network diagram */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 px-3 py-4">
        <div className="flex min-w-[360px] flex-col gap-0">
          {/* Top row of PCs */}
          <div className="flex items-start justify-around gap-2 pb-2">
            {topDevices.map(renderDevice)}
          </div>

          {/* Shared channel and receiver */}
          <div className="relative flex min-w-0 items-center gap-3 py-3">
            <div className="relative flex h-1.5 min-w-0 flex-1 items-center rounded-full bg-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  channel.isBusy ? 'bg-blue-500' : 'bg-transparent'
                }`}
                style={{ width: channel.isBusy ? '100%' : '0%' }}
              />

              {channel.transmissions.map(renderTransmission)}

              {channel.collisionActive && (
                <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
                  <div className="animate-pulse rounded border border-blue-300 bg-white px-2 py-0.5 text-[9px] font-bold text-blue-700 shadow-sm">
                    COLLISION
                  </div>
                </div>
              )}

              <div className="absolute -top-4 left-0 flex items-center gap-1 whitespace-nowrap text-[9px] font-medium text-slate-500">
                <span>Shared Channel</span>
                {channel.isBusy && (
                  <span className="flex items-center gap-0.5 text-blue-700">
                    <Zap size={10} />
                    Busy
                  </span>
                )}
              </div>
            </div>

            {/* Receiver */}
            <div className="flex shrink-0 flex-col items-center gap-0.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5">
              <ShieldCheck size={17} color={primary} />
              <span className="text-[10px] font-semibold text-slate-700">
                Receiver
              </span>
              <span className="font-mono text-sm font-semibold text-blue-700">
                {metrics.successfulDeliveries}
              </span>
            </div>
          </div>

          {/* Bottom row of PCs */}
          {bottomDevices.length > 0 && (
            <div className="flex items-start justify-around gap-2 pt-2">
              {bottomDevices.map(renderDevice)}
            </div>
          )}
        </div>
      </div>

      {/* Legend and simulation time */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-blue-600" />
          Active
        </span>

        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-slate-300" />
          Idle
        </span>

        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded border border-dashed border-blue-700" />
          Collision
        </span>

        <span className="ml-auto flex items-center gap-1 font-mono text-slate-600">
          <Radio size={12} color={primary} />
          Time: {time}u
        </span>
      </div>
    </section>
  );
};