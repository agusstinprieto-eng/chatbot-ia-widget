
import React, { useState, useRef } from 'react';
import { ShieldAlert, AlertTriangle, Loader2, Lock, Upload, X, CheckCircle2, FileText, ChevronRight, History, Trash2, Clock } from 'lucide-react';
import { falconEyeInspection } from '../../services/ai/geminiService';

interface AuditRecord {
  id: string;
  timestamp: number;
  date: string;
  description: string;
  report: any;
}

const FalconEye: React.FC<{ setCriticalAlert: (val: boolean) => void }> = ({ setCriticalAlert }) => {
  const [history, setHistory] = useState<AuditRecord[]>([]);
  const [viewMode, setViewMode] = useState<'quicklinks' | 'history'>('quicklinks');

  React.useEffect(() => {
    const saved = localStorage.getItem('aero_falcon_eye_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [needsAuthorization, setNeedsAuthorization] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleInspection = async () => {
    if (!description.trim() && !selectedImage) return;
    setLoading(true);
    setError(null);
    try {
      const base64Data = selectedImage ? selectedImage.split(',')[1] : undefined;
      const data = await falconEyeInspection(description || "Analyze this aerospace component for defects.", base64Data);
      setReport(data);

      // Save to History
      const newRecord: AuditRecord = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        date: new Date().toLocaleString(),
        description: description || 'Image Analysis',
        report: data
      };
      const updatedHistory = [newRecord, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('aero_falcon_eye_history', JSON.stringify(updatedHistory));

      if (data.isCritical) {
        setCriticalAlert(true);
        setNeedsAuthorization(true);
      }
    } catch (error: any) {
      console.error(error);
      setError(error.message || "Assessment failed. Check network.");
    } finally {
      setLoading(false);
    }
  };

  const resetAlert = () => {
    setCriticalAlert(false);
    setNeedsAuthorization(false);
    setReport(null);
    setError(null);
    setDescription('');
    removeImage();
  };

  const loadRecord = (record: AuditRecord) => {
    setReport(record.report);
    setDescription(record.description);
    setCriticalAlert(record.report.isCritical);
    setNeedsAuthorization(record.report.isCritical);
  };

  const clearHistory = () => {
    if (window.confirm('Delete all audit history?')) {
      setHistory([]);
      localStorage.removeItem('aero_falcon_eye_history');
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom duration-500">

      {/* LEFT COLUMN - INPUT & RESULTS */}
      <div className="lg:col-span-2 space-y-6">

        {/* INPUT PANEL */}
        <div className="glass-panel p-1 rounded-2xl relative group overflow-hidden border-cyber-blue/30">
          <div className="absolute inset-0 bg-cyber-blue/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-cyber-blue uppercase tracking-widest font-tech flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-cyber-blue rounded-sm shadow-neon-blue" />
                DEFECT DESCRIPTION / OBSERVATIONS
              </h3>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] font-bold uppercase tracking-wider text-cyber-blue/60 hover:text-cyber-blue border border-cyber-blue/20 hover:border-cyber-blue/50 px-3 py-1.5 rounded transition-all flex items-center gap-2 group/btn"
              >
                <Upload size={12} className="group-hover/btn:-translate-y-0.5 transition-transform" />
                {selectedImage ? 'Change Image' : 'Upload Image'}
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
            </div>

            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the defect or observation here..."
                className="w-full h-40 bg-cyber-black border border-cyber-blue/20 rounded-xl p-4 text-white text-sm font-mono focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue/50 outline-none transition-all resize-none placeholder-cyber-blue/20"
              />
              {selectedImage && (
                <div className="absolute bottom-4 right-4 group/img">
                  <img src={selectedImage} alt="Preview" className="h-16 w-16 object-cover rounded border border-cyber-blue/50 shadow-lg" />
                  <button onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/img:opacity-100 transition-opacity">
                    <X size={10} />
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleInspection}
              disabled={loading || (!description && !selectedImage)}
              className="w-full mt-4 bg-cyber-blue hover:bg-cyber-blue/80 disabled:bg-cyber-dark disabled:text-gray-500 text-black font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-neon-blue font-tech flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : <ShieldAlert size={18} />}
              RUN COMPLIANCE CHECK
            </button>
          </div>
        </div>

        {/* RESULTS PANEL */}
        {report && (
          <div className={`glass-panel p-1 rounded-2xl relative overflow-hidden transition-all duration-500 ${report.isCritical ? 'border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.2)]' : 'border-cyber-blue shadow-neon-blue'}`}>
            {/* Glow Background */}
            <div className={`absolute inset-0 opacity-10 ${report.isCritical ? 'bg-red-500' : 'bg-cyber-blue'}`} />

            <div className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {report.isCritical ? <AlertTriangle size={28} className="text-red-500 animate-pulse" /> : <CheckCircle2 size={28} className="text-cyber-blue" />}
                  <div>
                    <h3 className="text-lg font-black text-white font-tech tracking-wide leading-none">
                      COMPLIANCE ANALYSIS RESULT
                    </h3>
                    <p className="text-[10px] font-mono uppercase tracking-widest opacity-60 mt-1">
                      AS9100 REV D // AUTOMATED INSPECTION
                    </p>
                  </div>
                </div>
                <div className={`px-4 py-1.5 rounded font-bold text-[10px] uppercase tracking-widest border ${report.isCritical ? 'bg-red-500/20 border-red-500 text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]' : 'bg-cyber-blue/20 border-cyber-blue text-cyber-blue drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]'}`}>
                  {report.isCritical ? 'CRITICAL NON-CONFORMANCE' : 'REPORTABLE FINDING'}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-cyber-blue/60 uppercase tracking-wider mb-2 font-mono">Generated Non-Conformance Report (NCR)</p>
                  <div className="p-4 bg-cyber-black/80 border border-cyber-blue/20 rounded-lg text-xs font-mono text-cyan-50 leading-relaxed shadow-inner">
                    {report.ncrText}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-cyber-black/40 border border-cyber-blue/10 rounded-lg">
                    <p className="text-[9px] font-bold text-cyber-blue/50 uppercase tracking-wider mb-1 font-mono">Standard Reference</p>
                    <p className="text-sm font-mono text-cyber-blue font-bold">{report.standardRef}</p>
                  </div>
                  <div className="p-3 bg-cyber-black/40 border border-cyber-blue/10 rounded-lg">
                    <p className="text-[9px] font-bold text-cyber-blue/50 uppercase tracking-wider mb-1 font-mono">Required Action</p>
                    <p className="text-xs text-white/80">{report.actionRequired}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN - SIDEBAR PANELS */}
      <div className="space-y-6">

        {/* AUTHORIZATION PANEL */}
        <div className="glass-panel p-6 rounded-2xl h-fit border-cyber-blue/20">
          <h3 className="text-xs font-bold text-cyber-blue uppercase tracking-widest font-tech mb-4 pb-2 border-b border-cyber-blue/10">
            AUTHORIZATION
          </h3>

          {needsAuthorization ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="p-6 border border-dashed border-red-500/30 bg-red-950/20 rounded-xl flex flex-col items-center justify-center text-center gap-3">
                <Lock size={32} className="text-red-500" />
                <div>
                  <p className="text-red-500 font-bold text-xs uppercase tracking-wider">LOCKED FOR REVIEW</p>
                  <p className="text-red-400/60 text-[10px] font-mono mt-1">Supervisor override required</p>
                </div>
              </div>
              <button onClick={resetAlert} className="w-full py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-widest rounded-lg transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)]">
                ACKNOWLEDGE Alert
              </button>
            </div>
          ) : (
            <div className="py-8 flex flex-col items-center justify-center text-cyber-blue/30 space-y-2 border border-cyber-blue/5 bg-cyber-black/20 rounded-xl">
              <p className="font-mono text-[10px] italic opacity-50">// System Status: Idle</p>
              <p className="font-mono text-[10px] italic opacity-50">// Awaiting analysis...</p>
            </div>
          )}
        </div>

        {/* QUICKLINKS / HISTORY PANEL */}
        <div className="glass-panel p-6 rounded-2xl h-fit border-cyber-blue/20 min-h-[300px]">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-cyber-blue/10">
            <h3 className="text-xs font-bold text-cyber-blue uppercase tracking-widest font-tech">
              {viewMode === 'quicklinks' ? 'AS9100 QUICKLINKS' : 'AUDIT HISTORY'}
            </h3>
            <div className="flex bg-cyber-black/50 rounded-lg p-1 border border-cyber-blue/20">
              <button
                onClick={() => setViewMode('quicklinks')}
                className={`p-1.5 rounded transition-all ${viewMode === 'quicklinks' ? 'bg-cyber-blue text-black shadow-neon-blue' : 'text-cyber-blue/50 hover:text-cyber-blue'}`}
              >
                <FileText size={14} />
              </button>
              <button
                onClick={() => setViewMode('history')}
                className={`p-1.5 rounded transition-all ${viewMode === 'history' ? 'bg-cyber-blue text-black shadow-neon-blue' : 'text-cyber-blue/50 hover:text-cyber-blue'}`}
              >
                <History size={14} />
              </button>
            </div>
          </div>

          {viewMode === 'quicklinks' ? (
            <ul className="space-y-3 animate-in fade-in slide-in-from-right duration-300">
              {[
                { code: '8.7', label: 'Control of Nonconforming Outputs' },
                { code: '10.2', label: 'Nonconformity & Corrective Action' },
                { code: '9.1.2', label: 'Customer Satisfaction' },
                { code: '7.5.3', label: 'Control of Documented Information' }
              ].map((link, i) => (
                <li key={i} className="group cursor-pointer">
                  <div className="flex items-center gap-3 p-2 rounded hover:bg-cyber-blue/5 transition-colors">
                    <div className="w-1 h-1 bg-cyber-blue rounded-full group-hover:scale-150 group-hover:shadow-[0_0_8px_rgba(0,240,255,0.8)] transition-all" />
                    <div>
                      <p className="text-[10px] font-bold text-cyber-blue font-mono group-hover:text-white transition-colors">{link.code}</p>
                      <p className="text-[10px] text-white/60 font-mono group-hover:text-cyber-blue/80 transition-colors">{link.label}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="space-y-3 animate-in fade-in slide-in-from-right duration-300">
              {history.length === 0 ? (
                <div className="text-center py-8 text-cyber-blue/30 italic text-xs font-mono">
                  No scan history found.
                </div>
              ) : (
                <>
                  <div className="flex justify-end mb-2">
                    <button onClick={clearHistory} className="text-[10px] text-red-500 hover:text-red-400 flex items-center gap-1">
                      <Trash2 size={10} /> CLEAR ALL
                    </button>
                  </div>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {history.map((record) => (
                      <div
                        key={record.id}
                        onClick={() => loadRecord(record)}
                        className="p-3 rounded-lg border border-cyber-blue/10 bg-cyber-black/40 hover:bg-cyber-blue/10 hover:border-cyber-blue/30 cursor-pointer transition-all group"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] font-mono text-cyber-blue/60">{record.date.split(',')[0]}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${record.report.isCritical ? 'text-red-500 border-red-500/30' : 'text-cyber-blue border-cyber-blue/30'}`}>
                            {record.report.isCritical ? 'CRITICAL' : 'OK'}
                          </span>
                        </div>
                        <p className="text-xs text-white/80 line-clamp-2 font-mono group-hover:text-white">{record.description}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default FalconEye;
