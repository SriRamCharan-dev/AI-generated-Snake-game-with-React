import { useMemo } from 'react';
import { MusicPlayer } from './components/MusicPlayer';
import { SnakeGame } from './components/SnakeGame';

export default function App() {
  const terminalId = useMemo(() => Math.random().toString(36).substring(7).toUpperCase(), []);

  return (
    <div className="min-h-screen bg-dark text-white font-mono selection:bg-magenta/30 overflow-hidden relative">
      {/* Static Noise Overlay */}
      <div className="static-overlay" />
      
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-magenta/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col screen-tear">
        <header className="mb-12 text-center">
          <h1 
            className="text-7xl md:text-9xl font-display font-black text-white tracking-tighter glitch-text"
            data-text="SYSTEM_ARCADE"
          >
            SYSTEM_ARCADE
          </h1>
          <p className="text-magenta font-pixel mt-6 tracking-[0.3em] uppercase text-[10px] md:text-xs">
            [ PROTOCOL_V.2.5.0 ]
          </p>
        </header>

        <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24">
          <div className="w-full lg:w-auto flex-1 flex justify-center lg:justify-end">
            <div className="relative p-1 bg-magenta/10 border border-magenta/30">
              <SnakeGame />
            </div>
          </div>
          
          <div className="w-full lg:w-auto flex-1 flex justify-center lg:justify-start">
            <div className="relative p-1 bg-cyan/10 border border-cyan/30">
              <MusicPlayer />
            </div>
          </div>
        </main>
        
        <footer className="mt-12 text-center text-cyan/40 font-mono text-[10px] uppercase tracking-[0.5em]">
          <p>TERMINAL_ID: {terminalId} // {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
}
