import React from 'react';
import { SimulationMetrics } from '../../types/simulation';

interface MetricCardsProps {
  metrics: SimulationMetrics;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics }) => {
  const cards = [
    {
      name: 'Packets Delivered',
      value: metrics.successfulDeliveries,
      color: 'text-emerald-400',
    },
    {
      name: 'Collisions',
      value: metrics.collidedAttempts,
      color: metrics.collidedAttempts > 0 ? 'text-rose-400' : 'text-slate-300',
    },
    {
      name: 'Throughput',
      value: metrics.throughput.toFixed(3),
      color: 'text-cyan-400',
    },
    {
      name: 'Average Delay',
      value: metrics.successfulDeliveries > 0 ? `${metrics.averagePacketDelay.toFixed(1)} u` : '—',
      color: metrics.successfulDeliveries > 0 ? 'text-indigo-400' : 'text-slate-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div
          key={card.name}
          className="bg-charcoal-900 border border-charcoal-700/80 rounded-xl p-3.5 flex flex-col justify-between"
        >
          <div className="text-xs font-medium text-slate-400 tracking-wide">
            {card.name}
          </div>
          <div className={`text-xl sm:text-2xl font-bold font-mono mt-1 ${card.color} tracking-tight`}>
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
};
