import React from 'react';
import { ProtocolType } from '../../types/simulation';

interface ProtocolBannerProps {
  currentProtocol: ProtocolType;
  onSelectProtocol: (protocol: ProtocolType) => void;
  persistence: '1-persistent' | 'non-persistent';
  onChangePersistence: (p: '1-persistent' | 'non-persistent') => void;
}

export const ProtocolBanner: React.FC<ProtocolBannerProps> = ({
  currentProtocol,
  onSelectProtocol,
  persistence,
  onChangePersistence,
}) => {
  const protocolData: Record<
    ProtocolType,
    { title: string; subtitle: string; description: string; rule: string; color: string }
  > = {
    'pure-aloha': {
      title: 'Pure ALOHA',
      subtitle: 'Unslotted Random Access (Vulnerability = 2T)',
      description: 'Devices transmit immediately upon packet generation. If any transmissions overlap, a collision occurs.',
      rule: 'Access Rule: Transmit immediately. On collision, wait random backoff.',
      color: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
    },
    'slotted-aloha': {
      title: 'Slotted ALOHA',
      subtitle: 'Slot-Synchronized Access (Vulnerability = 1T)',
      description: 'Time is divided into slots of duration T. Devices may begin transmission only at slot boundaries.',
      rule: 'Access Rule: Align to slot boundary. Collisions occur if ≥2 transmit in the same slot.',
      color: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10',
    },
    'csma': {
      title: 'CSMA',
      subtitle: 'Carrier Sense Multiple Access (Listen-Before-Talk)',
      description: 'Devices sense the channel before transmitting. Defers while busy; transmits when idle.',
      rule: 'Access Rule: Sense channel. If busy, defer; if idle, transmit.',
      color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    },
    'csma-cd': {
      title: 'CSMA / CD',
      subtitle: 'Collision Detection with Early Abort & BEB',
      description: 'Senses channel before transmitting and monitors during transmission. Aborts early on collision and applies Binary Exponential Backoff.',
      rule: 'Access Rule: Listen while talk. On collision, abort immediately + BEB.',
      color: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
    },
  };

  const current = protocolData[currentProtocol];

  return (
    <div className="bg-charcoal-900 border border-charcoal-700/80 rounded-xl p-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Protocol tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {(['pure-aloha', 'slotted-aloha', 'csma', 'csma-cd'] as ProtocolType[]).map((proto) => {
            const isSelected = proto === currentProtocol;
            const item = protocolData[proto];
            return (
              <button
                key={proto}
                onClick={() => onSelectProtocol(proto)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  isSelected
                    ? `${item.color} border shadow-sm`
                    : 'bg-charcoal-800 text-slate-400 hover:text-slate-200 border border-charcoal-700'
                }`}
              >
                {item.title}
              </button>
            );
          })}
        </div>

        {/* CSMA Persistence selector if CSMA */}
        {currentProtocol === 'csma' && (
          <div className="flex items-center space-x-2 text-xs bg-charcoal-950 px-2.5 py-1 rounded-lg border border-charcoal-800">
            <span className="text-slate-400">Mode:</span>
            <button
              onClick={() => onChangePersistence('1-persistent')}
              className={`px-2 py-0.5 rounded text-xs transition ${
                persistence === '1-persistent'
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1-Persistent
            </button>
            <button
              onClick={() => onChangePersistence('non-persistent')}
              className={`px-2 py-0.5 rounded text-xs transition ${
                persistence === 'non-persistent'
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Non-Persistent
            </button>
          </div>
        )}
      </div>

      {/* Protocol summary */}
      <div className="mt-2.5 pt-2.5 border-t border-charcoal-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="text-slate-300">
          <span className="font-semibold text-white mr-1.5">{current.title}:</span>
          <span className="text-slate-400">{current.description}</span>
        </div>
        <div className="text-[11px] font-mono text-cyan-400 bg-charcoal-950 px-2 py-0.5 rounded border border-charcoal-800 flex-shrink-0">
          {current.rule}
        </div>
      </div>
    </div>
  );
};
