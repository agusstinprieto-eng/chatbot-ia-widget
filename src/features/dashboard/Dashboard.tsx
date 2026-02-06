
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
        <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
          Welcome, Aerospace Cluster Baja California
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Operational Intelligence System by <span className="text-teal-500 font-bold">IA.AGUS</span>.
          Optimizing High-Mix/Low-Volume production lines and MRO workflows.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <div className="px-4 py-2 bg-slate-800 rounded-full border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
            Engine 1 System Status: ONLINE
          </div>
          <div className="px-4 py-2 bg-slate-800 rounded-full border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
            AS9100 Rev D Sync: OK
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {MODULES_INFO.map((module) => (
          <button
            key={module.id}
            onClick={() => onSelectModule(module.id as ModuleType)}
            className="group relative bg-slate-800/40 border border-slate-700 rounded-2xl p-8 text-left transition-all duration-300 hover:bg-slate-800 hover:border-teal-500/50 hover:shadow-[0_0_30px_rgba(20,184,166,0.1)] hover:-translate-y-1"
          >
            <div className="mb-6 p-3 bg-slate-900 rounded-xl w-fit group-hover:scale-110 transition-transform">
              {module.icon}
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{module.title}</h3>
            <p className="text-teal-500 text-xs font-bold uppercase tracking-widest mb-4">{module.subtitle}</p>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              {module.description}
            </p>

            <div className="flex items-center gap-2 text-teal-400 text-sm font-bold group-hover:gap-3 transition-all">
              Initialize Module <ChevronRight size={18} />
            </div>

            {/* Futuristic decoration */}
            <div className="absolute top-4 right-4 text-slate-700 opacity-20 group-hover:opacity-100 transition-opacity">
              <ExternalLink size={16} />
            </div>
          </button>
        ))}
      </div>

      <div className="mt-20 grid md:grid-cols-2 gap-12">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8">
          <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <div className="w-2 h-8 bg-teal-500"></div>
            Active Operations Protocol
          </h4>
          <div className="space-y-4">
            {[
              { label: 'Compliance Level', value: '100% AS9100 Rev D', status: 'optimal' },
              { label: 'Plant Efficiency', value: '94.2%', status: 'optimal' },
              { label: 'Safety Incidents', value: '0 - 365+ Days', status: 'optimal' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 border-b border-slate-800 last:border-0">
                <span className="text-slate-500 text-sm">{item.label}</span>
                <span className="text-teal-500 font-mono text-sm font-bold uppercase">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 flex flex-col justify-center">
          <blockquote className="text-slate-300 italic text-lg leading-relaxed mb-6">
            "To reduce waste in station 4, we must first master the art of visibility. AERO-IA-PRO is designed to be your second set of eyes, ensuring safety and precision in every rivet."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-slate-900 font-bold">AP</div>
            <div>
              <p className="text-sm font-bold text-white">Agustín Prieto</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Lead Industrial Architect</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
