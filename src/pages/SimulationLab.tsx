import React from 'react';
import { useSimulation } from '../hooks/useSimulation';
import { ProtocolBanner } from '../components/simulation/ProtocolBanner';
import { SimulationControls } from '../components/simulation/SimulationControls';
import { MetricCards } from '../components/metrics/MetricCards';
import { NetworkCanvas } from '../components/network/NetworkCanvas';
import { LiveCharts } from '../components/charts/LiveCharts';
import { EventLog } from '../components/logs/EventLog';
import { ProtocolType } from '../types/simulation';

interface SimulationLabProps {
  simulation: ReturnType<typeof useSimulation>;
}

export const SimulationLab: React.FC<SimulationLabProps> = ({ simulation }) => {
  const {
    snapshot,
    isPlaying,
    speed,
    setSpeed,
    start,
    pause,
    resume,
    reset,
    step,
    updateConfig,
    clearLog,
  } = simulation;

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Protocol Banner & Selector */}
      <ProtocolBanner
        currentProtocol={snapshot.config.protocol}
        onSelectProtocol={(proto: ProtocolType) => updateConfig({ protocol: proto })}
        persistence={snapshot.config.csmaPersistence}
        onChangePersistence={(p: '1-persistent' | 'non-persistent') => updateConfig({ csmaPersistence: p })}
      />

      {/* Simulation Playback & Parameter Controls */}
      <SimulationControls
        isPlaying={isPlaying}
        speed={speed}
        onSetSpeed={setSpeed}
        onStart={start}
        onPause={pause}
        onResume={resume}
        onReset={() => reset()}
        onStep={step}
        config={snapshot.config}
        onUpdateConfig={updateConfig}
      />

      {/* Live Metric Cards */}
      <MetricCards metrics={snapshot.metrics} />

      {/* Shared Medium Bus Topology Network Canvas */}
      <NetworkCanvas snapshot={snapshot} />

      {/* Performance Chart & Live Event Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LiveCharts timeSeries={snapshot.metrics.timeSeries} />
        <EventLog events={snapshot.recentEvents} onClear={clearLog} />
      </div>
    </div>
  );
};
