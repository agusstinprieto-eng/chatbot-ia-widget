
import React from 'react';
import { LayoutDashboard, ShieldCheck, BrainCircuit, Activity, Settings, User, Bell } from 'lucide-react';
import { ModuleType } from '../../types';

interface LayoutProps {
  children: React.ReactNode;
  activeModule: ModuleType;
  onNavigate: (module: ModuleType) => void;
  isCriticalAlert: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, activeModule, onNavigate, isCriticalAlert }) => {
  const navItems = [
    { id: ModuleType.DASHBOARD, icon: <LayoutDashboard />, label: 'Dashboard' },
    { id: ModuleType.FALCON_EYE, icon: <ShieldCheck />, label: 'Falcon Eye' },
    { id: ModuleType.MRO_EXPERT, icon: <BrainCircuit />, label: 'MRO Expert' },
    { id: ModuleType.LEAN_ORBIT, icon: <Activity />, label: 'Lean Orbit' },
  ];

  return (
    <div className={`min-h-screen flex flex-col ${isCriticalAlert ? 'bg-red-950/20' : 'bg-cyber-black'} transition-colors duration-500`}>
      {/* HUD Header */}
      <header className={`sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b ${isCriticalAlert ? 'border-red-600 animate-pulse bg-red-950/20' : 'border-cyber-blue/20'} glass-panel`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyber-blue/10 border border-cyber-blue rounded flex items-center justify-center font-bold text-cyber-blue italic glow-blue font-tech">IA</div>
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2 text-white shadow-neon-blue font-tech">
              AERO.SYS // IA-PRO
              {isCriticalAlert && <span className="bg-red-600 text-[10px] px-2 py-0.5 rounded animate-bounce shadow-[0_0_10px_rgba(220,38,38,0.8)]">CRITICAL ALERT</span>}
            </h1>
            <p className="text-[10px] text-cyber-blue/70 uppercase tracking-[0.3em] font-mono">Aerospace Cluster Baja California</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end mr-4">
            <span className="text-[10px] text-cyber-blue/50 uppercase font-mono">System Status</span>
            <span className="text-cyber-blue font-mono text-xs uppercase tracking-widest glow-text-blue">Nominal // Compliance 100%</span>
          </div>
          <Bell className="w-5 h-5 text-gray-400 cursor-pointer hover:text-cyber-blue transition-colors" />
          <Settings className="w-5 h-5 text-gray-400 cursor-pointer hover:text-cyber-blue transition-colors" />
          <div className="flex items-center gap-2 bg-cyber-dark px-3 py-1.5 rounded-full border border-cyber-blue/30 hover:border-cyber-blue/50 transition-colors">
            <div className="w-6 h-6 bg-cyber-blue rounded-full flex items-center justify-center text-[10px] text-black font-bold shadow-neon-blue">AP</div>
            <span className="text-xs font-medium text-cyber-blue">A. Prieto</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Nav */}
        <aside className="w-20 md:w-64 border-r border-cyber-blue/30 glass-panel flex flex-col">
          <nav className="p-4 space-y-2 flex-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 font-tech tracking-wide text-gray-400 hover:bg-cyber-dark/40 hover:text-cyber-blue hover:border-cyber-blue/20 border border-transparent"
              >
                {React.cloneElement(item.icon as React.ReactElement, { size: 20 })}
                <span className="hidden md:block text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-cyber-gray">
            <div className="hidden md:block mb-4 p-3 bg-cyber-dark rounded-lg border border-cyber-blue/30 shadow-inner">
              <p className="text-[10px] text-cyber-blue/40 uppercase mb-1 font-mono">Session Data</p>
              <p className="text-xs font-mono text-cyber-blue/80">LAT: 32.5149° N</p>
              <p className="text-xs font-mono text-cyber-blue/80">LON: 117.0382° W</p>
            </div>
            <button className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-red-400 transition-colors w-full">
              <User size={20} />
              <span className="hidden md:block text-sm font-medium">Operator Exit</span>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto cockpit-grid p-6 relative">
          {children}
        </main>
      </div>

      {/* Industrial Footer */}
      <footer className="bg-cyber-black border-t border-cyber-blue/30 px-6 py-2 flex items-center justify-between relative z-10 glass-panel rounded-t-xl mx-4 mb-4">
        <div className="flex gap-4 text-[10px] text-cyber-blue/40 font-mono">
          <span>IA.AGUS_PROTOCOL: 0.8.6</span>
          <span>ENCRYPTION: AES-256</span>
          <span>REGION: BAJA_CALIFORNIA_CLUSTER</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyber-blue animate-pulse shadow-neon-blue"></div>
          <span className="text-[10px] text-cyber-blue/50 uppercase tracking-widest font-tech">Live Integration Active</span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
