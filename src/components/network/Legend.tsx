import React from 'react';

export const Legend: React.FC = () => {
  const items = [
    { label: 'Idle', color: 'bg-slate-600', border: 'border-slate-500' },
    { label: 'Packet Ready', color: 'bg-cyan-500', border: 'border-cyan-400' },
    { label: 'Sensing', color: 'bg-purple-500', border: 'border-purple-400' },
    { label: 'Transmitting', color: 'bg-blue-500', border: 'border-blue-400' },
    { label: 'Waiting / Defer', color: 'bg-amber-500', border: 'border-amber-400' },
    { label: 'Backoff Timer', color: 'bg-orange-500', border: 'border-orange-400' },
    { label: 'Collision', color: 'bg-rose-500', border: 'border-rose-400' },
    { label: 'Delivered', color: 'bg-emerald-500', border: 'border-emerald-400' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-400 bg-charcoal-950/80 px-3 py-1.5 rounded-lg border border-charcoal-800">
      <span className="font-semibold text-slate-300">Legend:</span>
      {items.map((item) => (
        <div key={item.label} className="flex items-center space-x-1.5">
          <span className={`w-2 h-2 rounded-full ${item.color} ${item.border} border`} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};
