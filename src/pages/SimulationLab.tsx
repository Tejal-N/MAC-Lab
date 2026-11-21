
import React from 'react';
import { useSimulation } from '../hooks/useSimulation';
import { ProtocolBanner } from '../components/simulation/ProtocolBanner';
import { SimulationControls } from '../components/simulation/SimulationControls';
import { MetricCards } from '../components/metrics/MetricCards';
import { NetworkCanvas } from '../components/network/NetworkCanvas';
import { LiveCharts } from '../components/charts/LiveCharts';
import { ProtocolAnalysis } from '../components/analysis/ProtocolAnalysis';
import { ProtocolType } from '../types/simulation';

interface SimulationLabProps {
  simulation: ReturnType<typeof useSimulation>;
}

export const SimulationLab: React.FC<SimulationLabProps> = ({
  simulation,
}) => {
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
  } = simulation;

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-4 sm:px-6 lg:px-8">

      {/* Protocol selection */}
      <ProtocolBanner
        currentProtocol={snapshot.config.protocol}
        onSelectProtocol={(proto: ProtocolType) =>
          updateConfig({ protocol: proto })
        }
        persistence={snapshot.config.csmaPersistence}
        onChangePersistence={(p: '1-persistent' | 'non-persistent') =>
          updateConfig({ csmaPersistence: p })
        }
      />

      {/* Simulation metrics */}
      <MetricCards metrics={snapshot.metrics} />

      {/* Network visualization */}
      <NetworkCanvas snapshot={snapshot} />

      {/* Playback controls */}
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

      {/* Live performance chart */}
      <LiveCharts timeSeries={snapshot.metrics.timeSeries} />

      {/* Comparison of all four protocols */}
      <ProtocolAnalysis config={snapshot.config} />

    </div>
  );
};
