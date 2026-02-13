
import React, { useState, useEffect } from 'react';
import { ModuleType } from '../../types';
import { MODULES_INFO } from '../../constants';
import {
  ChevronRight, ExternalLink, Plane, Wrench, ShieldCheck, AlertTriangle,
  Activity, Cpu, BarChart3, Clock, Zap, TrendingUp, Signal
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
      <div className="flex items-center justify-between animate-in fade-in slide-in-from-top duration-500">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight font-tech uppercase flex items-center gap-3">
            <div className="w-2 h-8 bg-cyber-blue shadow-neon-blue rounded-full" />
            Operations Command Center
          </h2>
          <p className="text-cyber-blue/40 text-xs font-mono mt-1 ml-5 uppercase tracking-[0.3em]">
            Aerospace Cluster Baja California // IA.AGUS Intelligence HUB
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 glass-panel rounded-xl text-xs font-mono text-cyber-blue/60 flex items-center gap-2">
            <Signal size={12} className="text-emerald-400 animate-pulse" />
            UPLINK: ACTIVE
          </div>
          <div className="px-4 py-2 glass-panel rounded-xl text-xs font-mono text-cyber-blue/50">
            {currentTime.toLocaleTimeString('en-US', { hour12: false })} UTC-6
          </div>
        </div>
      </div>

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
