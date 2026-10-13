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
    },
    {
      name: 'Collisions',
      value: metrics.collidedAttempts,
    },
    {
      name: 'Throughput',
      value: metrics.throughput.toFixed(3),
    },
    {
      name: 'Average Delay',
      value:
        metrics.successfulDeliveries > 0
          ? `${metrics.averagePacketDelay.toFixed(1)} u`
          : '—',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.name}
          className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <span className="text-sm font-medium text-slate-500">
            {card.name}
          </span>

          <span className="mt-2 font-mono text-2xl font-semibold tracking-tight text-blue-700">
            {card.value}
          </span>
        </div>
      ))}
    </div>
  );
};