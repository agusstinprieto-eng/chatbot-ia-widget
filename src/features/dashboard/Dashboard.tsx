
import React from 'react';
import { ModuleType } from '../../types';
import { MODULES_INFO } from '../../constants';
import { ChevronRight, ExternalLink } from 'lucide-react';

interface DashboardProps {
  onSelectModule: (module: ModuleType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onSelectModule }) => {
  return (
    <div className="max-w-6xl mx-auto py-12">
      <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom duration-700">
        <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight font-tech uppercase drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]">
          Welcome, Aerospace Cluster Baja California
        </h2>
        <p className="text-cyber-blue/60 text-lg max-w-2xl mx-auto font-mono">
          Operational Intelligence System by <span className="text-cyber-blue font-bold glow-text-blue">IA.AGUS</span>.
          Optimizing High-Mix/Low-Volume production lines and MRO workflows.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <div className="px-4 py-2 bg-cyber-black rounded-full border border-cyber-blue/30 text-xs text-cyber-blue/50 flex items-center gap-2 font-mono">
            <div className="w-2 h-2 rounded-full bg-cyber-blue animate-pulse shadow-neon-blue"></div>
            Engine 1 System Status: ONLINE
          </div>
          <div className="px-4 py-2 bg-cyber-black rounded-full border border-cyber-blue/30 text-xs text-cyber-blue/50 flex items-center gap-2 font-mono">
            <div className="w-2 h-2 rounded-full bg-cyber-blue animate-pulse shadow-neon-blue"></div>
            AS9100 Rev D Sync: OK
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {MODULES_INFO.map((module) => (
          <button
            key={module.id}
            onClick={() => onSelectModule(module.id as ModuleType)}
            className="group relative glass-panel rounded-2xl p-8 text-left transition-all duration-300 hover:bg-cyber-dark/80 hover:border-cyber-blue/50 hover:shadow-neon-blue hover:-translate-y-1 overflow-hidden"
          >
            {/* Dark frame background effect */}
            <div className="absolute inset-0 bg-cyber-blue/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="mb-6 p-3 bg-cyber-dark rounded-xl w-fit group-hover:scale-110 transition-transform border border-cyber-blue/20">
              {React.cloneElement(module.icon as React.ReactElement, { className: "text-cyber-blue" })}
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 font-tech relative z-10">{module.title}</h3>
            <p className="text-cyber-blue text-xs font-bold uppercase tracking-widest mb-4 font-mono relative z-10">{module.subtitle}</p>
            <p className="text-cyber-text/70 text-sm leading-relaxed mb-8 relative z-10">
              {module.description}
            </p>

            <div className="flex items-center gap-2 text-cyber-blue text-sm font-bold group-hover:gap-3 transition-all font-tech tracking-wider relative z-10">
              INITIALIZE MODULE <ChevronRight size={18} />
            </div>

            {/* Futuristic decoration */}
            <div className="absolute top-4 right-4 text-cyber-blue/30 opacity-20 group-hover:opacity-100 transition-opacity">
              <ExternalLink size={16} />
            </div>
          </button>
        ))}
      </div>

      <div className="mt-20 grid md:grid-cols-2 gap-12">
        <div className="glass-panel rounded-2xl p-8">
          <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2 font-tech uppercase tracking-wider">
            <div className="w-1 h-6 bg-cyber-blue shadow-neon-blue"></div>
            Active Operations Protocol
          </h4>
          <div className="space-y-4">
            {[
              { label: 'Compliance Level', value: '100% AS9100 Rev D', status: 'optimal' },
              { label: 'Plant Efficiency', value: '94.2%', status: 'optimal' },
              { label: 'Safety Incidents', value: '0 - 365+ Days', status: 'optimal' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 border-b border-cyber-blue/20 last:border-0 hover:bg-cyber-blue/10 transition-colors rounded">
                <span className="text-cyber-blue/50 text-sm font-mono">{item.label}</span>
                <span className="text-cyber-blue font-mono text-sm font-bold uppercase glow-text-blue">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-8 flex flex-col justify-center">
          <blockquote className="text-cyber-text/80 italic text-lg leading-relaxed mb-6 border-l-2 border-cyber-blue/50 pl-4">
            "To reduce waste in station 4, we must first master the art of visibility. AERO-IA-PRO is designed to be your second set of eyes, ensuring safety and precision in every rivet."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyber-blue rounded-full flex items-center justify-center text-black font-bold shadow-neon-blue">AP</div>
            <div>
              <p className="text-sm font-bold text-white font-tech tracking-wide">Agustín Prieto</p>
              <p className="text-[10px] text-cyber-blue uppercase tracking-widest font-bold">Lead Industrial Architect</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
