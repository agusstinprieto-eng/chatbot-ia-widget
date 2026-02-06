
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <BookOpen className="text-teal-500" />
            MRO Expert
          </h2>
          <p className="text-slate-400">Technical Intelligence Assistant (Boeing/Airbus Specifications)</p>
        </div>
        <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
          <div className="text-[10px] text-slate-500 uppercase px-2">Active Spec Database</div>
          <div className="text-xs font-mono text-teal-400 px-2">AMM / SRM / IPC Rev 2024.1</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., What is the torque spec for the landing gear strut bolt?"
          className="w-full bg-slate-800/50 border-2 border-slate-700 rounded-xl px-6 py-4 pr-16 focus:border-teal-500 outline-none transition-all group-hover:border-slate-600 text-lg font-medium"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-700 p-3 rounded-lg text-slate-900 transition-colors"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Search />}
        </button>
      </form>

      {result && (
        <div className="bg-slate-800 border-l-4 border-teal-500 rounded-r-xl p-6 shadow-2xl animate-in slide-in-from-top duration-300">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Technical Answer</label>
                <div className="text-xl font-mono text-teal-400 bg-teal-950/20 p-4 rounded-lg border border-teal-900/50 mt-1">
                  {result.answer}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Manual Reference</label>
                <div className="flex items-center gap-2 mt-1 text-slate-300">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="font-mono">{result.reference}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Special Tooling</label>
                <div className="flex items-center gap-3 mt-1 bg-slate-700/30 p-3 rounded-lg border border-slate-700">
                  <Tool className="text-teal-500" />
                  <span className="text-slate-300">{result.tooling}</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-teal-500/50 uppercase tracking-widest font-bold">Agustín's Strategic Advice</label>
                <div className="mt-1 p-4 bg-teal-950/10 rounded-lg italic text-slate-400 text-sm border-l border-teal-500/30">
                  "{result.strategicAdvice}"
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="pt-8 border-t border-slate-800">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Query History</h3>
          <div className="space-y-3">
            {history.map((item, idx) => (
              <div key={idx} className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-200">{item.query}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">{item.reference}</p>
                </div>
                <ChevronRight className="text-slate-600" />
              </div>
            ))}
          </div>
        </div>
      )}

      {!result && !loading && history.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-600 space-y-4">
          <BrainCircuit size={64} strokeWidth={1} />
          <div className="text-center">
            <p className="text-lg font-medium">Systems Ready</p>
            <p className="text-sm">Please input query regarding MRO specifications or AMM data.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MROExpert;
