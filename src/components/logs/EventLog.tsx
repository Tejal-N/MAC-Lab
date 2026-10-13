import React, { useState, useEffect, useRef } from 'react';
import { SimulationEvent, EventType } from '../../types/simulation';
import {
  FileText,
  Trash2,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Radio,
  Clock,
  ArrowDownCircle,
} from 'lucide-react';

interface EventLogProps {
  events: SimulationEvent[];
  onClear: () => void;
}

export const EventLog: React.FC<EventLogProps> = ({ events, onClear }) => {
  const [filter, setFilter] = useState<string>('ALL');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [events, autoScroll]);

  const filteredEvents = events.filter((ev) => {
    if (filter === 'ALL') return true;
    if (filter === 'COLLISION') return ev.type === 'COLLISION_DETECTED' || ev.type === 'TRANSMISSION_ABORTED';
    if (filter === 'SUCCESS') return ev.type === 'PACKET_DELIVERED';
    if (filter === 'TRANSMIT') return ev.type === 'TRANSMISSION_STARTED';
    if (filter === 'SENSE') return ev.type === 'CHANNEL_SENSED_IDLE' || ev.type === 'CHANNEL_SENSED_BUSY';
    if (filter === 'GEN') return ev.type === 'PACKET_GENERATED';
    return true;
  });

  const getEventBadge = (type: EventType) => {
    switch (type) {
      case 'COLLISION_DETECTED':
      case 'TRANSMISSION_ABORTED':
        return {
          icon: AlertTriangle,
          text: 'COLLISION',
          color: 'text-rose-400 bg-rose-950/40 border-rose-800/80',
        };
      case 'PACKET_DELIVERED':
        return {
          icon: CheckCircle2,
          text: 'DELIVERY',
          color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/80',
        };
      case 'TRANSMISSION_STARTED':
        return {
          icon: Radio,
          text: 'TX START',
          color: 'text-cyan-400 bg-cyan-950/40 border-cyan-800/80',
        };
      case 'CHANNEL_SENSED_BUSY':
      case 'CHANNEL_SENSED_IDLE':
        return {
          icon: Zap,
          text: 'CARRIER',
          color: 'text-purple-400 bg-purple-950/40 border-purple-800/80',
        };
      case 'PACKET_GENERATED':
        return {
          icon: FileText,
          text: 'NEW PKT',
          color: 'text-slate-400 bg-slate-900 border-slate-800',
        };
      case 'ENTERED_BACKOFF':
        return {
          icon: Clock,
          text: 'BACKOFF',
          color: 'text-orange-400 bg-orange-950/40 border-orange-800/80',
        };
      default:
        return {
          icon: FileText,
          text: 'SYSTEM',
          color: 'text-slate-400 bg-charcoal-900 border-charcoal-800',
        };
    }
  };

  const exportCSV = () => {
    if (events.length === 0) return;
    const header = ['Timestamp', 'Type', 'DeviceID', 'PacketID', 'Message'];
    const rows = events.map((e) => [
      e.timestamp,
      e.type,
      e.deviceId !== undefined ? `D${e.deviceId}` : '',
      e.packetId || '',
      `"${e.message.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mac_lab_events_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-charcoal-900 border border-charcoal-700/80 rounded-xl p-4 shadow-sm flex flex-col space-y-3">
      {/* Header with actions and filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-charcoal-800">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-semibold text-white">Event Log & Telemetry Stream</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-charcoal-950 border border-charcoal-800 text-slate-400">
            {filteredEvents.length} events
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Category Filter */}
          <div className="flex items-center space-x-1 bg-charcoal-950 px-2 py-1 rounded-lg border border-charcoal-800">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-transparent text-slate-300 font-mono text-[11px] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="COLLISION">Collisions & Aborts</option>
              <option value="SUCCESS">Deliveries</option>
              <option value="TRANSMIT">Transmissions</option>
              <option value="SENSE">Carrier Sense</option>
              <option value="GEN">Packet Generations</option>
            </select>
          </div>

          {/* Auto-scroll toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2.5 py-1 rounded-lg border font-mono text-[11px] transition flex items-center space-x-1 ${
              autoScroll
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                : 'bg-charcoal-950 border-charcoal-800 text-slate-500'
            }`}
            title="Toggle Auto-Scroll to bottom"
          >
            <ArrowDownCircle className="w-3 h-3" />
            <span>Auto-Scroll</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={exportCSV}
            disabled={events.length === 0}
            className="px-2.5 py-1 bg-charcoal-950 hover:bg-charcoal-800 disabled:opacity-40 border border-charcoal-800 rounded-lg text-slate-300 text-[11px] font-mono flex items-center space-x-1 transition"
            title="Download CSV log"
          >
            <Download className="w-3 h-3 text-emerald-400" />
            <span>CSV</span>
          </button>

          {/* Clear Log */}
          <button
            onClick={onClear}
            className="p-1 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded-lg transition"
            title="Clear Event Log"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scrollable Log Stream */}
      <div
        ref={logContainerRef}
        className="h-64 overflow-y-auto bg-charcoal-950 rounded-lg border border-charcoal-800/80 p-2 font-mono text-[11px] space-y-1.5 divide-y divide-charcoal-800/40"
      >
        {filteredEvents.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-600">
            No events match selected category filter.
          </div>
        ) : (
          filteredEvents.map((ev) => {
            const badge = getEventBadge(ev.type);
            const Icon = badge.icon;

            return (
              <div key={ev.id} className="pt-1.5 first:pt-0 flex items-start space-x-2 text-slate-300 leading-snug">
                {/* Timestamp */}
                <span className="text-slate-500 text-[10px] w-14 flex-shrink-0 pt-0.5">
                  t={ev.timestamp.toString().padStart(4, '0')}
                </span>

                {/* Badge */}
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold border flex items-center space-x-1 flex-shrink-0 ${badge.color}`}
                >
                  <Icon className="w-2.5 h-2.5" />
                  <span>{badge.text}</span>
                </span>

                {/* Device Pill */}
                {ev.deviceId !== undefined && (
                  <span className="text-[10px] text-cyan-400 bg-charcoal-900 px-1 rounded border border-charcoal-800 flex-shrink-0">
                    D{String(ev.deviceId).padStart(2, '0')}
                  </span>
                )}

                {/* Packet Pill */}
                {ev.packetId && (
                  <span className="text-[10px] text-indigo-400 bg-charcoal-900 px-1 rounded border border-charcoal-800 flex-shrink-0">
                    {ev.packetId}
                  </span>
                )}

                {/* Message */}
                <span className="text-slate-300 break-words flex-1 text-[11px]">
                  {ev.message}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
