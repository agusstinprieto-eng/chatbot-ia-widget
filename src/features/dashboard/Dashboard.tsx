
import React, { useState, useEffect } from 'react';
import { ModuleType } from '../../types';
import { MODULES_INFO } from '../../constants';
import {
  Activity, Cpu, BarChart3, Clock, Zap, TrendingUp, Signal, Shield, Play, FileText, CheckCircle
} from 'lucide-react';

interface DashboardProps {
  onSelectModule: (module: ModuleType) => void;
}

// Animated counter hook
const useAnimatedCounter = (target: number, duration: number = 1500, decimals: number = 0) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = target;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = end / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(decimals > 0 ? parseFloat(start.toFixed(decimals)) : Math.floor(start));
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [target, duration, decimals]);
  return count;
};

// OEE mini chart (pure CSS, no Recharts needed)
const OEEChart: React.FC = () => {
  const data = [
    { hour: '06:00', value: 88 },
    { hour: '07:00', value: 91 },
    { hour: '08:00', value: 85 },
    { hour: '09:00', value: 94 },
    { hour: '10:00', value: 92 },
    { hour: '11:00', value: 89 },
    { hour: '12:00', value: 93 },
  ];
  const max = 100;
  return (
    <div className="flex items-end gap-1.5 h-20 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full bg-cyber-dark rounded-t-sm relative overflow-hidden" style={{ height: '80px' }}>
            <div
              className="absolute bottom-0 w-full rounded-t-sm transition-all duration-1000"
              style={{
                height: `${(d.value / max) * 100}%`,
                background: d.value >= 90
                  ? 'linear-gradient(to top, #00f0ff, #00f0ff88)'
                  : d.value >= 85
                    ? 'linear-gradient(to top, #f59e0b, #f59e0b88)'
                    : 'linear-gradient(to top, #ef4444, #ef444488)',
                boxShadow: d.value >= 90 ? '0 0 8px rgba(0,240,255,0.4)' : 'none',
                animationDelay: `${i * 100}ms`
              }}
            />
          </div>
          <span className="text-[8px] text-cyber-blue/30 font-mono">{d.hour.split(':')[0]}h</span>
        </div>
      ))}
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ onSelectModule }) => {
  const fleetReadiness = useAnimatedCounter(94.7, 1800, 1);
  const activeWOs = useAnimatedCounter(23, 1200);
  const safetyDays = useAnimatedCounter(365, 2000);
  const compliance = useAnimatedCounter(100, 1500);
  const [showAlert, setShowAlert] = useState(false);
  const [showAS9100, setShowAS9100] = useState(false);
  const [showTutorials, setShowTutorials] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setTimeout(() => setShowAlert(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const kpis = [
    {
      label: 'Fleet Readiness',
      value: `${fleetReadiness}%`,
      icon: <Plane size={22} />,
      color: 'text-cyber-blue',
      bg: 'bg-cyber-blue/10',
      border: 'border-cyber-blue/30',
      glow: 'shadow-[0_0_15px_rgba(0,240,255,0.15)]',
      desc: 'Operational aircraft'
    },
    {
      label: 'Active Work Orders',
      value: activeWOs.toString(),
      icon: <Wrench size={22} />,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      border: 'border-amber-400/30',
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]',
      desc: 'MRO tasks in progress'
    },
    {
      label: 'Safety Record',
      value: `${safetyDays}+`,
      icon: <ShieldCheck size={22} />,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      border: 'border-emerald-400/30',
      glow: 'shadow-[0_0_15px_rgba(52,211,153,0.15)]',
      desc: 'Days without incidents'
    },
    {
      label: 'AS9100 Compliance',
      value: `${compliance}%`,
      icon: <ShieldCheck size={22} />,
      color: 'text-cyber-blue',
      bg: 'bg-cyber-blue/10',
      border: 'border-cyber-blue/30',
      glow: 'shadow-[0_0_15px_rgba(0,240,255,0.15)]',
      desc: 'Standard Rev D sync'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-8">

      {/* ===== HEADER BAR ===== */}
      <div className="flex items-center justify-between animate-in fade-in slide-in-from-top duration-500 relative z-20">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight font-tech uppercase flex items-center gap-3">
            <div className="w-2 h-8 bg-cyber-blue shadow-neon-blue rounded-full" />
            Operations Command Center
          </h2>
          <p className="text-cyber-blue/40 text-xs font-mono mt-1 ml-5 uppercase tracking-[0.3em]">
            Aerospace Cluster Baja California // IA.AGUS Intelligence HUB
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAS9100(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyber-black/50 border border-cyber-blue text-cyber-blue hover:bg-cyber-blue/10 hover:shadow-neon-blue transition-all group"
          >
            <Shield size={16} className="group-hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]" />
            <span className="text-xs font-bold font-tech uppercase tracking-wider">NORMATIVA AS9100</span>
          </button>

          <button
            onClick={() => setShowTutorials(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyber-black/50 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all group"
          >
            <CheckCircle size={16} className="group-hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span className="text-xs font-bold font-tech uppercase tracking-wider">VER TUTORIALES</span>
          </button>
        </div>
      </div>

      {/* AS9100 MODAL */}
      {showAS9100 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-cyber-black border border-cyber-blue rounded-2xl shadow-neon-blue p-6 relative">
            <button onClick={() => setShowAS9100(false)} className="absolute top-4 right-4 text-cyber-blue hover:text-white"><X size={24} /></button>
            <h3 className="text-2xl font-black text-white font-tech mb-6 flex items-center gap-3">
              <Shield size={28} className="text-cyber-blue" /> AS9100 REV D - REFERENCE LIBRARY
            </h3>
            <div className="grid md:grid-cols-2 gap-6 h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-cyber-blue/5 border border-cyber-blue/20">
                  <h4 className="text-cyber-blue font-bold text-sm mb-2">Section 8.7 - Control of Nonconforming Outputs</h4>
                  <p className="text-xs text-white/70 leading-relaxed font-mono">
                    The organization shall ensure that outputs that do not conform to their requirements are identified and controlled to prevent their unintended use or delivery. The organization shall take appropriate action based on the nature of the nonconformity and its effect on the conformity of products and services.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-cyber-blue/5 border border-cyber-blue/20">
                  <h4 className="text-cyber-blue font-bold text-sm mb-2">Section 10.2 - Nonconformity and Corrective Action</h4>
                  <p className="text-xs text-white/70 leading-relaxed font-mono">
                    When a nonconformity occurs, including any arising from complaints, the organization shall react to the nonconformity and, as applicable: take action to control and correct it; deal with the consequences.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-cyber-blue/5 border border-cyber-blue/20">
                  <h4 className="text-cyber-blue font-bold text-sm mb-2">Section 7.5.3 - Control of Documented Information</h4>
                  <p className="text-xs text-white/70 leading-relaxed font-mono">
                    Documented information required by the quality management system and by this International Standard shall be controlled to ensure: it is available and suitable for use, where and when it is needed; it is adequately protected (e.g. from loss of confidentiality, improper use, or loss of integrity).
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-cyber-blue/5 border border-cyber-blue/20">
                  <h4 className="text-cyber-blue font-bold text-sm mb-2">Section 9.1.2 - Customer Satisfaction</h4>
                  <p className="text-xs text-white/70 leading-relaxed font-mono">
                    The organization shall monitor customers' perceptions of the degree to which their needs and expectations have been fulfilled. The organization shall determine the methods for obtaining, monitoring, and reviewing this information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TUTORIALS MODAL */}
      {showTutorials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-5xl bg-cyber-black border border-emerald-500 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] p-6 relative">
            <button onClick={() => setShowTutorials(false)} className="absolute top-4 right-4 text-emerald-500 hover:text-white"><X size={24} /></button>
            <h3 className="text-2xl font-black text-white font-tech mb-6 flex items-center gap-3">
              <Play size={28} className="text-emerald-500" /> TRAINING CENTER - AERO IA PRO
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: 'Intro to Dashboard', duration: '3:45', thumb: 'bg-cyber-blue/20' },
                { title: 'Using Falcon Eye', duration: '5:20', thumb: 'bg-purple-500/20' },
                { title: 'AS9100 Compliance', duration: '8:15', thumb: 'bg-emerald-500/20' },
                { title: 'MRO Integration', duration: '4:10', thumb: 'bg-orange-500/20' },
                { title: 'Voice Commands', duration: '2:55', thumb: 'bg-red-500/20' },
                { title: 'Report Generation', duration: '6:30', thumb: 'bg-blue-500/20' },
              ].map((vid, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className={`aspect-video rounded-xl ${vid.thumb} relative overflow-hidden mb-3 border border-white/10 group-hover:border-emerald-500 transition-colors`}>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/80 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play size={20} className="text-white fill-current ml-1" />
                      </div>
                    </div>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-white text-[10px] font-mono rounded">{vid.duration}</span>
                  </div>
                  <h4 className="text-white font-bold text-sm font-tech group-hover:text-emerald-400 transition-colors">{vid.title}</h4>
                  <p className="text-white/40 text-[10px] font-mono uppercase tracking-wider">Video Tutorial</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== ROW 1: KPI CARDS ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom duration-700">
        {kpis.map((kpi, i) => (
          <div key={i} className={`glass-panel rounded-2xl p-5 ${kpi.border} ${kpi.glow} transition-all hover:scale-[1.02] group relative overflow-hidden`}>
            {/* Corner accent */}
            <div className={`absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 ${kpi.border} rounded-tl-xl opacity-50`} />
            <div className={`absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 ${kpi.border} rounded-br-xl opacity-50`} />

            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${kpi.bg}`}>
                <div className={kpi.color}>{kpi.icon}</div>
              </div>
              <TrendingUp size={14} className="text-emerald-400/50" />
            </div>
            <div className={`text-3xl font-black ${kpi.color} font-mono tracking-tight mb-1`}>
              {kpi.value}
            </div>
            <div className="text-white text-xs font-bold uppercase tracking-wider font-tech">{kpi.label}</div>
            <div className="text-cyber-blue/30 text-[10px] font-mono mt-1">{kpi.desc}</div>
          </div>
        ))}
      </div>

      {/* ===== ROW 2: ALERT PANEL + OEE CHART + SYSTEM STATUS ===== */}
      <div className="grid lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom duration-1000" style={{ animationDelay: '200ms' }}>

        {/* Critical Alert Panel */}
        <div className={`glass-panel rounded-2xl p-5 transition-all duration-500 relative overflow-hidden ${showAlert
          ? 'border-red-500/60 bg-red-950/20 shadow-[0_0_30px_rgba(239,68,68,0.15)]'
          : 'border-emerald-500/30 bg-emerald-950/10'
          }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-2 h-2 rounded-full ${showAlert ? 'bg-red-500 animate-pulse' : 'bg-emerald-400'}`} />
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">
              Falcon Eye Alert System
            </span>
          </div>

          {showAlert ? (
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center flex-shrink-0 animate-pulse">
                <AlertTriangle size={28} className="text-red-400" />
              </div>
              <div>
                <p className="text-red-400 font-black text-sm uppercase tracking-wider font-tech">
                  Defecto Crítico Detectado
                </p>
                <p className="text-red-400/60 text-[10px] font-mono mt-1">
                  Fan Blade #7 — Station 3 — NCR Auto-Generated
                </p>
                <button
                  onClick={() => onSelectModule('falcon-eye' as ModuleType)}
                  className="mt-2 text-[10px] text-red-400 font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1"
                >
                  Open Falcon Eye <ChevronRight size={12} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <ShieldCheck size={28} className="text-emerald-400" />
              <div>
                <p className="text-emerald-400 font-bold text-sm uppercase font-tech">All Clear</p>
                <p className="text-emerald-400/50 text-[10px] font-mono">No critical defects detected</p>
              </div>
            </div>
          )}
        </div>

        {/* OEE Chart */}
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 size={14} className="text-cyber-blue/50" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">
                OEE — Last 7 Hours
              </span>
            </div>
            <span className="text-cyber-blue font-mono text-sm font-bold">91.7%</span>
          </div>
          <OEEChart />
          <div className="flex justify-between mt-2 text-[9px] font-mono text-cyber-blue/20 uppercase">
            <span>Availability</span>
            <span>Performance</span>
            <span>Quality</span>
          </div>
        </div>

        {/* System Status */}
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Cpu size={14} className="text-cyber-blue/50" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">
              System Diagnostics
            </span>
          </div>
          <div className="space-y-3">
            {[
              { label: 'AI Engine (Gemini)', status: 'ONLINE', ok: true },
              { label: 'Supabase Core', status: 'CONNECTED', ok: true },
              { label: 'AS9100 Module', status: 'SYNCED', ok: true },
              { label: 'Voice Link', status: 'STANDBY', ok: true },
            ].map((sys, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-cyber-blue/40 text-xs font-mono">{sys.label}</span>
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${sys.ok ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]' : 'bg-red-400'}`} />
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${sys.ok ? 'text-emerald-400/70' : 'text-red-400'}`}>
                    {sys.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-cyber-blue/10 flex items-center justify-between">
            <span className="text-[9px] text-cyber-blue/20 font-mono uppercase">Latency</span>
            <span className="text-cyber-blue/50 text-[10px] font-mono font-bold">23ms</span>
          </div>
        </div>
      </div>

      {/* ===== ROW 2.5: INTEGRATION ECOSYSTEM ===== */}
      <div className="animate-in fade-in slide-in-from-bottom duration-1000" style={{ animationDelay: '300ms' }}>
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-cyber-blue/5 opacity-50" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyber-dark rounded-lg border border-orange-500/30 text-orange-400">
                <Database size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-tech tracking-wide uppercase">
                  Integration Ecosystem
                </h3>
                <p className="text-[10px] text-cyber-blue/50 font-mono uppercase tracking-[0.2em]">
                  Enterprise Data Synchronization
                </p>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <span className="text-[10px] font-bold text-emerald-400 font-mono uppercase tracking-wider">Synchronized</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* MRO CONNECTOR */}
            <div className="bg-cyber-black/40 border border-cyber-blue/20 rounded-xl p-5 hover:border-emerald-500/50 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              </div>
              <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest mb-2">MRO Connector</p>
              <h4 className="text-white font-bold text-sm font-tech tracking-wide mb-1">Quantum / TRAX / CAMP</h4>
              <p className="text-[10px] text-white/40 font-mono italic group-hover:text-emerald-400/80 transition-colors">
                Active Bidirectional Connection
              </p>
            </div>

            {/* ERP GATEWAY */}
            <div className="bg-cyber-black/40 border border-cyber-blue/20 rounded-xl p-5 hover:border-purple-500/50 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3">
                <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
              </div>
              <p className="text-[10px] font-mono text-purple-400 uppercase tracking-widest mb-2">ERP Gateway</p>
              <h4 className="text-white font-bold text-sm font-tech tracking-wide mb-1">SAP Aviation Cloud</h4>
              <p className="text-[10px] text-white/40 font-mono italic group-hover:text-purple-400/80 transition-colors">
                BETA ACCESS Q2 2026
              </p>
            </div>

            {/* FUTURE LINK */}
            <div className="bg-cyber-black/40 border border-cyber-blue/20 rounded-xl p-5 hover:border-gray-500/50 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3">
                <div className="w-2 h-2 rounded-full bg-slate-600" />
              </div>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2">Future Link</p>
              <h4 className="text-white font-bold text-sm font-tech tracking-wide mb-1">Oracle Cloud</h4>
              <p className="text-[10px] text-white/40 font-mono italic group-hover:text-slate-400/80 transition-colors">
                Roadmap Q3 2026
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== ROW 3: MODULE CARDS (COMPACT) ===== */}
      <div className="animate-in fade-in slide-in-from-bottom duration-1000" style={{ animationDelay: '400ms' }}>
        <div className="flex items-center gap-2 mb-4">
          <Zap size={14} className="text-cyber-blue/40" />
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">
            Operational Modules
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-cyber-blue/20 to-transparent ml-2" />
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
          {MODULES_INFO.map((module) => (
            <button
              key={module.id}
              onClick={() => onSelectModule(module.id as ModuleType)}
              className="group glass-panel rounded-xl p-4 text-left transition-all duration-300 hover:bg-cyber-dark/80 hover:border-cyber-blue/50 hover:shadow-neon-blue hover:-translate-y-0.5 overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-cyber-blue/5 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-start gap-3 relative z-10">
                <div className="p-2 bg-cyber-dark rounded-lg group-hover:scale-110 transition-transform border border-cyber-blue/20 flex-shrink-0">
                  {React.cloneElement(module.icon as React.ReactElement, { className: "text-cyber-blue", size: 18 })}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white font-tech truncate">{module.title}</h3>
                  <p className="text-cyber-blue/50 text-[10px] font-mono uppercase tracking-wider truncate">{module.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-cyber-blue text-[10px] font-bold group-hover:gap-2 transition-all font-tech tracking-wider mt-3 relative z-10 uppercase">
                Initialize <ChevronRight size={12} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
