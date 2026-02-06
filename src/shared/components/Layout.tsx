
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
    <div className={`min-h-screen flex flex-col ${isCriticalAlert ? 'bg-red-950/20' : 'bg-slate-900'} transition-colors duration-500`}>
      {/* HUD Header */}
      <header className={`sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b ${isCriticalAlert ? 'border-red-600 animate-pulse' : 'border-slate-700'} bg-slate-900/90 backdrop-blur-md`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-500 rounded flex items-center justify-center font-bold text-slate-900 italic">IA</div>
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              AERO-IA-PRO
              {isCriticalAlert && <span className="bg-red-600 text-[10px] px-2 py-0.5 rounded animate-bounce">CRITICAL ALERT</span>}
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">Aerospace Cluster Baja California</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end mr-4">
            <span className="text-[10px] text-slate-500 uppercase">System Status</span>
            <span className="text-teal-500 font-mono text-xs uppercase tracking-widest">Nominal // Compliance 100%</span>
          </div>
          <Bell className="w-5 h-5 text-slate-400 cursor-pointer hover:text-teal-500 transition-colors" />
          <Settings className="w-5 h-5 text-slate-400 cursor-pointer hover:text-teal-500 transition-colors" />
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
            <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-[10px] text-slate-900 font-bold">AP</div>
            <span className="text-xs font-medium text-slate-200">A. Prieto</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Nav */}
        <aside className="w-20 md:w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col">
          <nav className="p-4 space-y-2 flex-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${activeModule === item.id
                    ? 'bg-teal-500/10 text-teal-500 border border-teal-500/50 glow-teal'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
              >
                {React.cloneElement(item.icon as React.ReactElement, { size: 20 })}
                <span className="hidden md:block text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <div className="hidden md:block mb-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-[10px] text-slate-500 uppercase mb-1">Session Data</p>
              <p className="text-xs font-mono text-teal-400">LAT: 32.5149° N</p>
              <p className="text-xs font-mono text-teal-400">LON: 117.0382° W</p>
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
      <footer className="bg-slate-900 border-t border-slate-800 px-6 py-2 flex items-center justify-between">
        <div className="flex gap-4 text-[10px] text-slate-500 font-mono">
          <span>IA.AGUS_PROTOCOL: 0.8.4</span>
          <span>ENCRYPTION: AES-256</span>
          <span>REGION: BAJA_CALIFORNIA_CLUSTER</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest">Live Integration Active</span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
