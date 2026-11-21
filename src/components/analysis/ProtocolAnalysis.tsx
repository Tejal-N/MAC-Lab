
import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

import { SimulationEngine } from '../../simulation/engine';
import {
  ProtocolType,
  SimulationConfig,
  SimulationMetrics,
} from '../../types/simulation';

interface ComparisonResult {
  protocol: ProtocolType;
  label: string;
  metrics: SimulationMetrics;
}

interface ProtocolAnalysisProps {
  config: SimulationConfig;
}

const protocols: { id: ProtocolType; label: string }[] = [
  { id: 'pure-aloha', label: 'Pure ALOHA' },
  { id: 'slotted-aloha', label: 'Slotted ALOHA' },
  { id: 'csma', label: 'CSMA' },
  { id: 'csma-cd', label: 'CSMA/CD' },
];

export const ProtocolAnalysis: React.FC<ProtocolAnalysisProps> = ({
  config,
}) => {
  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runComparison = () => {
    setIsRunning(true);

    const duration = Math.max(
      1,
      Math.floor(config.simulationDuration)
    );

    const comparisonResults = protocols.map((protocol) => {
      const engine = new SimulationEngine({
        ...config,
        protocol: protocol.id,
      });

      // Run an independent simulation for the same duration.
      for (let i = 0; i < duration; i++) {
        engine.step();
      }

      return {
        protocol: protocol.id,
        label: protocol.label,
        metrics: engine.getSnapshot().metrics,
      };
    });

    setResults(comparisonResults);
    setIsRunning(false);
  };

  const bestThroughput =
    results.length > 0
      ? Math.max(...results.map((r) => r.metrics.throughput))
      : 0;

  const bestCollisionRate =
    results.length > 0
      ? Math.min(...results.map((r) => r.metrics.collisionRate))
      : 0;

  const deliveredResults = results.filter(
    (r) => r.metrics.successfulDeliveries > 0
  );

  const bestDelay =
    deliveredResults.length > 0
      ? Math.min(
          ...deliveredResults.map(
            (r) => r.metrics.averagePacketDelay
          )
        )
      : 0;

  const chartData = results.map((result) => ({
    protocol: result.label,
    throughput: result.metrics.throughput,
  }));

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Protocol Analysis
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Compare all four protocols under identical network settings.
          </p>
        </div>

        <button
          onClick={runComparison}
          disabled={isRunning}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRunning ? 'Running...' : 'Run Comparison'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-4">
        <div>
          <p className="text-xs text-slate-500">Devices</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {config.numDevices}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">Arrival Rate</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {config.packetArrivalRate}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">Packet Duration</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {config.packetDuration} u
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">Simulation Duration</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {config.simulationDuration} u
          </p>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="flex min-h-36 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 text-center">
          <p className="text-sm font-medium text-slate-700">
            No comparison results yet
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Click Run Comparison to evaluate all four protocols.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-800">
              Throughput Comparison
            </h3>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E2E8F0"
                  />

                  <XAxis
                    dataKey="protocol"
                    tick={{ fontSize: 10 }}
                    stroke="#64748B"
                  />

                  <YAxis
                    domain={[0, 1]}
                    tick={{ fontSize: 10 }}
                    stroke="#64748B"
                  />

                  <Tooltip
                    formatter={(value: number | string) => [
                      Number(value).toFixed(3),
                      'Throughput',
                    ]}
                  />

                  <Bar
                    dataKey="throughput"
                    fill="#2563EB"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-800">
              Performance Results
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="px-3 py-3 font-medium">Protocol</th>
                    <th className="px-3 py-3 font-medium">Delivered</th>
                    <th className="px-3 py-3 font-medium">Throughput</th>
                    <th className="px-3 py-3 font-medium">Collision Rate</th>
                    <th className="px-3 py-3 font-medium">Average Delay</th>
                  </tr>
                </thead>

                <tbody>
                  {results.map((result) => (
                    <tr
                      key={result.protocol}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-3 py-3 font-semibold text-slate-800">
                        {result.label}
                      </td>

                      <td className="px-3 py-3 text-slate-700">
                        {result.metrics.successfulDeliveries}
                      </td>

                      <td className="px-3 py-3 font-medium text-blue-700">
                        {result.metrics.throughput.toFixed(3)}
                        {result.metrics.throughput === bestThroughput && (
                          <span className="ml-1 text-[10px] text-green-700">
                            Best
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-3 text-slate-700">
                        {(result.metrics.collisionRate * 100).toFixed(1)}%
                        {result.metrics.collisionRate === bestCollisionRate && (
                          <span className="ml-1 text-[10px] text-green-700">
                            Best
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-3 text-slate-700">
                        {result.metrics.successfulDeliveries > 0
                          ? `${result.metrics.averagePacketDelay.toFixed(1)} u`
                          : '—'}

                        {result.metrics.successfulDeliveries > 0 &&
                          result.metrics.averagePacketDelay === bestDelay && (
                            <span className="ml-1 text-[10px] text-green-700">
                              Best
                            </span>
                          )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            Results are generated from independent simulations using the same
            network configuration, packet-arrival seed, and simulation duration.
          </p>
        </>
      )}
    </section>
  );
};
