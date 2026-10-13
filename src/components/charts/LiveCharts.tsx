import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TimeSeriesPoint } from '../../types/simulation';

interface LiveChartsProps {
  timeSeries: TimeSeriesPoint[];
}

export const LiveCharts: React.FC<LiveChartsProps> = ({ timeSeries }) => {
  const hasData = timeSeries.length > 1;

  return (
    <div className="bg-charcoal-900 border border-charcoal-700/80 rounded-xl p-3.5 flex flex-col space-y-2">
      <div className="flex items-center justify-between pb-2 border-b border-charcoal-800">
        <span className="text-xs font-semibold text-white">Live Throughput Telemetry (S)</span>
        <span className="text-[10px] font-mono text-slate-400">
          Normalized payload / time
        </span>
      </div>

      <div className="h-52 w-full">
        {!hasData ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs border border-dashed border-charcoal-800 rounded-lg">
            <span>Awaiting simulation progression...</span>
            <span className="text-[10px] text-slate-600 mt-0.5">Click "Start" or "Step" to record data.</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeries} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} unit="u" />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={[0, 'auto']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '6px', fontSize: '11px' }}
                itemStyle={{ color: '#38bdf8' }}
                formatter={(val: any) => [Number(val).toFixed(3), 'Throughput (S)']}
              />
              <Area type="monotone" dataKey="throughput" name="Throughput" stroke="#06b6d4" fill="url(#cyanGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
