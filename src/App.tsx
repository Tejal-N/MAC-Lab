import React from 'react';
import { Navbar } from './components/layout/Navbar';
import { SimulationLab } from './pages/SimulationLab';
import { useSimulation } from './hooks/useSimulation';

export const App: React.FC = () => {
  const simulation = useSimulation();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar
        activeProtocol={simulation.snapshot.config.protocol}
        isRunning={simulation.snapshot.isRunning}
        isPaused={simulation.snapshot.isPaused}
        currentTime={simulation.snapshot.time}
      />

      <main className="flex-1 pb-8">
        <SimulationLab simulation={simulation} />
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-semibold tracking-wide">MAC LAB</span>
          <span>Pure ALOHA · Slotted ALOHA · CSMA · CSMA/CD</span>
        </div>
      </footer>
    </div>
  );
};

export default App;