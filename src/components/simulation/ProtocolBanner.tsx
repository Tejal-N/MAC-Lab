
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
    {
      title: string;
      subtitle: string;
      description: string;
      rule: string;
    }
  > = {
    'pure-aloha': {
      title: 'Pure ALOHA',
      subtitle: 'Unslotted Random Access (Vulnerability = 2T)',
      description:
        'Devices transmit immediately upon packet generation. If any transmissions overlap, a collision occurs.',
      rule: 'Access Rule: Transmit immediately. On collision, wait random backoff.',
    },
    'slotted-aloha': {
      title: 'Slotted ALOHA',
      subtitle: 'Slot-Synchronized Access (Vulnerability = 1T)',
      description:
        'Time is divided into slots of duration T. Devices may begin transmission only at slot boundaries.',
      rule:
        'Access Rule: Align to slot boundary. Collisions occur if ≥2 transmit in the same slot.',
    },
    csma: {
      title: 'CSMA',
      subtitle: 'Carrier Sense Multiple Access (Listen-Before-Talk)',
      description:
        'Devices sense the channel before transmitting. Defers while busy; transmits when idle.',
      rule: 'Access Rule: Sense channel. If busy, defer; if idle, transmit.',
    },
    'csma-cd': {
      title: 'CSMA / CD',
      subtitle: 'Collision Detection with Early Abort & BEB',
      description:
        'Senses channel before transmitting and monitors during transmission. Aborts early on collision and applies Binary Exponential Backoff.',
      rule: 'Access Rule: Listen while talk. On collision, abort immediately + BEB.',
    },
  };

  const current = protocolData[currentProtocol];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2">
          {(
            ['pure-aloha', 'slotted-aloha', 'csma', 'csma-cd'] as ProtocolType[]
          ).map((proto) => {
            const isSelected = proto === currentProtocol;
            const item = protocolData[proto];

            return (
              <button
                key={proto}
                onClick={() => onSelectProtocol(proto)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  isSelected
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                {item.title}
              </button>
            );
          })}
        </div>

        {currentProtocol === 'csma' && (
          <div className="flex items-center space-x-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs">
            <span className="text-slate-500">Mode:</span>

            <button
              onClick={() => onChangePersistence('1-persistent')}
              className={`rounded px-2 py-0.5 transition-colors ${
                persistence === '1-persistent'
                  ? 'bg-blue-600 font-semibold text-white'
                  : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              1-Persistent
            </button>

            <button
              onClick={() => onChangePersistence('non-persistent')}
              className={`rounded px-2 py-0.5 transition-colors ${
                persistence === 'non-persistent'
                  ? 'bg-blue-600 font-semibold text-white'
                  : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              Non-Persistent
            </button>
          </div>
        )}
      </div>

      <div className="mt-2.5 flex flex-col justify-between gap-2 border-t border-slate-200 pt-2.5 text-xs sm:flex-row sm:items-center">
        <div className="text-slate-600">
          <span className="mr-1.5 font-semibold text-slate-900">
            {current.title}:
          </span>
          <span>{current.description}</span>
        </div>

        <div className="flex-shrink-0 rounded border border-blue-100 bg-blue-50 px-2 py-1 text-[11px] text-blue-700">
          {current.rule}
        </div>
      </div>
    </div>
  );
};
