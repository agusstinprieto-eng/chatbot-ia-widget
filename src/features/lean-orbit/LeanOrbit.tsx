import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, Users, Zap, Clock, AlertTriangle, Play } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';

const LeanOrbit: React.FC = () => {
  const [productivityData, setProductivityData] = useState([
    { name: 'Station 1', cycle: 45, takt: 42, load: 95 },
    { name: 'Station 2', cycle: 38, takt: 42, load: 82 },
    { name: 'Station 3', cycle: 48, takt: 42, load: 110 },
    { name: 'Station 4', cycle: 40, takt: 42, load: 88 },
    { name: 'Station 5', cycle: 41, takt: 42, load: 92 },
  ]);

  const [trendData, setTrendData] = useState([
    { time: '08:00', throughput: 12 },
    { time: '10:00', throughput: 15 },
    { time: '12:00', throughput: 8 },
    { time: '14:00', throughput: 14 },
    { time: '16:00', throughput: 16 },
  ]);

  const [efficiency, setEfficiency] = useState(92.4);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setProductivityData(prev => prev.map(s => ({
        ...s,
        cycle: Math.max(30, Math.min(60, s.cycle + (Math.random() - 0.5) * 5))
      })));

      setEfficiency(prev => Math.min(100, Math.max(80, prev + (Math.random() - 0.5) * 2)));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const simulateBottleneck = () => {
    const stations = productivityData.map(s => s.name);
    const randomStation = stations[Math.floor(Math.random() * stations.length)];
    setProductivityData(prev => prev.map(s =>
      s.name === randomStation ? { ...s, cycle: 55 } : s
    ));
  };

  const avgCycle = (productivityData.reduce((acc, s) => acc + s.cycle, 0) / productivityData.length).toFixed(1);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between glass-panel p-6 rounded-2xl">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3 font-tech tracking-wider glow-text-blue">
            <Activity className="text-cyber-blue" />
            LEAN ORBIT
          </h2>
          <p className="text-cyber-blue/70 font-mono text-sm mt-2">&gt;&gt; High-Mix/Low-Volume Production Optimization</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={simulateBottleneck}
            className="bg-cyber-dark hover:bg-cyber-blue/10 text-cyber-blue px-4 py-2 rounded-lg border border-cyber-blue/30 text-xs font-bold flex items-center gap-2 transition-all hover:shadow-neon-blue font-tech tracking-wide"
          >
            <Play size={14} /> SIMULATE SHIFT CHANGE
          </button>
          <div className="bg-cyber-black/50 px-4 py-2 rounded-lg border border-cyber-blue/50 flex gap-6 shadow-inner glass-panel">
            <div>
              <p className="text-[10px] text-cyber-blue/50 uppercase font-mono font-bold">Current Takt</p>
              <p className="text-lg font-mono text-cyber-blue font-bold">42.0m</p>
            </div>
            <div>
              <p className="text-[10px] text-cyber-blue/50 uppercase font-mono font-bold">Avg Cycle</p>
              <p className="text-lg font-mono text-white font-bold">{avgCycle}m</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: 'Line Efficiency', value: `${efficiency.toFixed(1)}%`, icon: <Zap className="text-yellow-400" />, sub: '+2.4% vs Shift A' },
          { label: 'WIP Levels', value: '18 Units', icon: <TrendingUp className="text-cyber-blue" />, sub: '-3 units target' },
          { label: 'Active Technicians', value: '24', icon: <Users className="text-cyber-purple" />, sub: '100% Allocation' },
          { label: 'Throughput', value: '142', icon: <Clock className="text-cyber-blue" />, sub: 'Units/Week' },
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-4 rounded-xl border-cyber-blue/30 hover:bg-cyber-dark/60 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              {stat.icon}
              <span className="text-xs font-bold text-cyber-blue/70 uppercase tracking-wider font-tech">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono drop-shadow-[0_0_5px_rgba(0,240,255,0.3)]">{stat.value}</div>
            <div className="text-[10px] text-cyber-blue/40 mt-1 font-mono">{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-xl border-cyber-blue/30 h-80 relative overflow-hidden">
          {/* Subtle grid bg */}
          <div className="absolute inset-0 bg-cyber-blue/5 opacity-20" style={{ backgroundImage: 'linear-gradient(#00f0ff 1px, transparent 1px), linear-gradient(90deg, #00f0ff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

          <h3 className="text-sm font-bold text-cyber-blue uppercase tracking-widest mb-6 font-tech relative z-10">Cycle Time vs Takt (By Station)</h3>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={productivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c1c2e" opacity={0.3} />
              <XAxis dataKey="name" stroke="#00f0ff" fontSize={10} tick={{ fill: '#e0e0e0' }} />
              <YAxis stroke="#00f0ff" fontSize={10} tick={{ fill: '#e0e0e0' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0a0a0f', border: '1px solid #1c1c2e', borderRadius: '8px' }}
                itemStyle={{ color: '#00f0ff' }}
                cursor={{ fill: '#1c1c2e', opacity: 0.2 }}
              />
              <Bar dataKey="cycle">
                {productivityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cycle > entry.takt ? '#ef4444' : '#00f0ff'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel p-6 rounded-xl border-cyber-blue/30 h-80 relative overflow-hidden">
          {/* Subtle grid bg */}
          <div className="absolute inset-0 bg-cyber-blue/5 opacity-20" style={{ backgroundImage: 'linear-gradient(#00f0ff 1px, transparent 1px), linear-gradient(90deg, #00f0ff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

          <h3 className="text-sm font-bold text-cyber-blue uppercase tracking-widest mb-6 font-tech relative z-10">Throughput Trend (Real-time)</h3>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c1c2e" opacity={0.3} />
              <XAxis dataKey="time" stroke="#00f0ff" fontSize={10} tick={{ fill: '#e0e0e0' }} />
              <YAxis stroke="#00f0ff" fontSize={10} tick={{ fill: '#e0e0e0' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0a0a0f', border: '1px solid #1c1c2e', borderRadius: '8px' }}
                itemStyle={{ color: '#00f0ff' }}
              />
              <Line type="monotone" dataKey="throughput" stroke="#00f0ff" strokeWidth={3} dot={{ fill: '#00f0ff', r: 4 }} activeDot={{ r: 6, fill: '#fff' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-xl border border-cyber-blue/30">
        <h3 className="text-sm font-bold text-cyber-blue uppercase tracking-widest mb-6 font-tech">Strategic Optimization Log</h3>
        <div className="space-y-4">
          {productivityData.filter(s => s.cycle > s.takt).map((s, i) => (
            <div key={i} className="p-4 bg-red-950/20 rounded-lg border border-red-900/50 flex gap-4 animate-in fade-in slide-in-from-left duration-500 shadow-[0_0_15px_rgba(220,38,38,0.1)]">
              <div className="w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center flex-shrink-0 border border-red-500/30">
                <AlertTriangle className="text-red-500" size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-red-400 font-tech tracking-wide">Bottleneck Detected: {s.name}</p>
                <p className="text-xs text-cyber-blue/60 mt-1 font-mono">
                  Cycle time is {((s.cycle / s.takt) * 100).toFixed(0)}% of Takt. Potential backlog expected.
                  <br />
                  <span className="text-cyber-blue font-bold italic">Agustín's Advice:</span> Re-allocate high-skill operators to {s.name} to balance the flow and ensure fulfillment.
                </p>
              </div>
            </div>
          ))}
          {productivityData.every(s => s.cycle <= s.takt) && (
            <div className="p-4 bg-cyber-dark rounded-lg border border-cyber-blue/20 text-cyber-blue text-sm italic font-mono flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyber-blue animate-pulse"></div>
              All stations are currently operating within Takt time limits. Flow is optimal.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeanOrbit;
