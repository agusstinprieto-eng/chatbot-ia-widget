
import React, { useState, useRef, useEffect } from 'react';
// Fix: Added BrainCircuit to the imports from lucide-react to resolve "Cannot find name 'BrainCircuit'" error
import { Search, Loader2, BookOpen, PenTool as Tool, FileText, ChevronRight, AlertCircle, BrainCircuit } from 'lucide-react';
import { mroExpertQuery } from '../../services/ai/geminiService';

const MROExpert: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const data = await mroExpertQuery(query);
      setResult(data);
      setHistory(prev => [{ query, ...data }, ...prev]);
      setQuery('');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8 glass-panel p-6 rounded-2xl">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3 font-tech tracking-wider glow-text-blue">
            <BookOpen className="text-cyber-blue" />
            MRO EXPERT
          </h2>
          <p className="text-cyber-blue/70 font-mono text-sm mt-2">&gt;&gt; Technical Intelligence Assistant (Boeing/Airbus Specifications)</p>
        </div>
        <div className="bg-cyber-dark p-2 rounded-lg border border-cyber-blue/20 hidden md:block">
          <div className="text-[10px] text-cyber-blue uppercase px-2 font-bold tracking-wider">Active Spec Database</div>
          <div className="text-xs font-mono text-cyber-blue/70 px-2">AMM / SRM / IPC Rev 2024.1</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., What is the torque spec for the landing gear strut bolt?"
          className="w-full glass-panel border border-cyber-blue/30 rounded-xl px-6 py-4 pr-16 focus:border-cyber-blue outline-none transition-all group-hover:border-cyber-blue/50 text-lg font-medium text-white placeholder-cyber-blue/30 font-mono"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-cyber-blue hover:bg-cyber-blue/80 disabled:bg-cyber-dark disabled:text-gray-500 p-3 rounded-lg text-black transition-colors shadow-neon-blue"
        >
          {loading ? <Loader2 className="animate-spin text-black" /> : <Search />}
        </button>
      </form>

      {result && (
        <div className="glass-panel border-l-4 border-l-blue-500 rounded-r-xl p-6 shadow-2xl animate-in slide-in-from-top duration-300 border-y border-r border-blue-500/20">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-cyber-blue uppercase tracking-widest font-bold font-tech">Technical Answer</label>
                <div className="text-xl font-mono text-cyber-text bg-cyber-dark p-4 rounded-lg border border-cyber-blue/30 mt-1 shadow-inner">
                  {result.answer}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-cyber-blue uppercase tracking-widest font-bold font-tech">Manual Reference</label>
                <div className="flex items-center gap-2 mt-1 text-cyber-blue/80">
                  <FileText className="w-4 h-4 text-cyber-blue" />
                  <span className="font-mono">{result.reference}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-blue-400 uppercase tracking-widest font-bold font-tech">Special Tooling</label>
                <div className="flex items-center gap-3 mt-1 bg-blue-950/20 p-3 rounded-lg border border-blue-900/30">
                  <Tool className="text-blue-500" />
                  <span className="text-blue-200 font-mono text-sm">{result.tooling}</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-blue-500/50 uppercase tracking-widest font-bold font-tech">Agustín's Strategic Advice</label>
                <div className="mt-1 p-4 bg-blue-900/10 rounded-lg italic text-blue-300/70 text-sm border-l-2 border-blue-500/30">
                  "{result.strategicAdvice}"
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="pt-8 border-t border-blue-900/30">
          <h3 className="text-sm font-bold text-blue-500/50 uppercase tracking-widest mb-4 font-tech">Query History</h3>
          <div className="space-y-3">
            {history.map((item, idx) => (
              <div key={idx} className="glass-panel p-4 rounded-lg border-blue-900/30 flex items-center justify-between hover:bg-slate-800/50 transition-colors cursor-pointer group">
                <div>
                  <p className="text-sm font-medium text-blue-200 group-hover:text-white transition-colors">{item.query}</p>
                  <p className="text-[10px] text-blue-500/70 font-mono mt-1">{item.reference}</p>
                </div>
                <ChevronRight className="text-blue-500/50 group-hover:text-blue-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {!result && !loading && history.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-blue-900/40 space-y-4">
          <BrainCircuit size={64} strokeWidth={1} className="animate-pulse" />
          <div className="text-center">
            <p className="text-lg font-bold font-tech tracking-wider text-blue-500/50">SYSTEMS READY</p>
            <p className="text-sm font-mono text-blue-300/30">Input query regarding MRO specifications or AMM data.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MROExpert;
