
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

export const LiveCharts: React.FC<LiveChartsProps> = ({
  timeSeries,
}) => {
  const hasData = timeSeries.length > 1;

  return (
    <div className="flex flex-col space-y-2 rounded-xl border border-slate-200 bg-white p-3.5">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <span className="text-xs font-semibold text-slate-900">
          Live Throughput Telemetry (S)
        </span>

        <span className="text-[10px] text-slate-500">
          Normalized payload / time
        </span>
      </div>

      <div className="h-52 w-full">
        {!hasData ? (
          <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 text-xs text-slate-500">
            <span>Awaiting simulation progression...</span>
            <span className="mt-0.5 text-[10px] text-slate-400">
              Click "Start" or "Step" to record data.
            </span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={timeSeries}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="throughputBlueGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="#2563EB"
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="95%"
                    stopColor="#2563EB"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E2E8F0"
              />

              <XAxis
                dataKey="time"
                stroke="#64748B"
                tick={{ fontSize: 10 }}
                unit="u"
              />

              <YAxis
                stroke="#64748B"
                tick={{ fontSize: 10 }}
                domain={[0, 'auto']}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#CBD5E1',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#0F172A',
                }}
                labelStyle={{ color: '#475569' }}
                itemStyle={{ color: '#2563EB' }}
                formatter={(val: number | string) => [
                  Number(val).toFixed(3),
                  'Throughput (S)',
                ]}
              />

              <Area
                type="monotone"
                dataKey="throughput"
                name="Throughput"
                stroke="#2563EB"
                fill="url(#throughputBlueGradient)"
                strokeWidth={2}
                activeDot={{
                  r: 4,
                  fill: '#2563EB',
                  stroke: '#FFFFFF',
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
