import React from 'react';
import { Navbar } from './components/layout/Navbar';
import { SimulationLab } from './pages/SimulationLab';
import { useSimulation } from './hooks/useSimulation';

export const App: React.FC = () => {
  const simulation = useSimulation();

  return (
    <div className="min-h-screen bg-charcoal-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        activeProtocol={simulation.snapshot.config.protocol}
        isRunning={simulation.snapshot.isRunning}
        isPaused={simulation.snapshot.isPaused}
        currentTime={simulation.snapshot.time}
      />

      <main className="flex-1 pb-10">
        <SimulationLab simulation={simulation} />
      </main>

      <footer className="bg-charcoal-900 border-t border-charcoal-800/80 py-3 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>MAC-LAB</span>
          <span>Pure ALOHA • Slotted ALOHA • CSMA</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
