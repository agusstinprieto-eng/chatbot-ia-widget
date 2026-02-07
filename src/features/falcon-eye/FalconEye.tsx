import React, { useState, useRef } from 'react';
import { Camera, ShieldAlert, CheckCircle, AlertTriangle, FileWarning, Loader2, Lock, Upload, X } from 'lucide-react';
import { falconEyeInspection } from '../../services/ai/geminiService';

const FalconEye: React.FC<{ setCriticalAlert: (val: boolean) => void }> = ({ setCriticalAlert }) => {
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
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
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
      if (data.isCritical) {
        setCriticalAlert(true);
        setNeedsAuthorization(true);
      }
    } catch (error: any) {
      console.error(error);
      setError(error.message || "Assessment failed. Please check network/API configuration.");
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 p-6 glass-panel rounded-2xl">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3 glow-text-blue font-tech tracking-wider">
          <Camera className="text-cyber-blue" />
          FALCON EYE
        </h2>
        <p className="text-cyber-blue/70 font-mono text-sm mt-2">&gt;&gt; Quality Inspection & NCR Generator (AS9100 Rev D)</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl">
            {error && (
              <div className="mb-4 p-4 bg-red-950/40 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-400 backdrop-blur-sm">
                <AlertTriangle size={20} />
                <p className="text-sm font-medium font-mono">{error}</p>
              </div>
            )}
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-bold text-cyber-blue uppercase tracking-wider font-tech">Defect Description / Observations</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs bg-cyber-dark/50 hover:bg-cyber-blue/10 text-cyber-blue px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all border border-cyber-blue/30 hover:border-cyber-blue hover:glow-blue font-mono"
              >
                <Upload size={14} /> Upload Image
              </button>
            </div>

            {selectedImage && (
              <div className="relative mb-4 group inline-block">
                <img src={selectedImage} alt="Preview" className="h-40 rounded-lg border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
                <button
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter defect details or let IA analyze the image..."
              className="w-full h-32 bg-cyber-black/50 border border-cyber-blue/30 rounded-lg p-4 text-white focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue/50 outline-none transition-all resize-none font-mono text-xs placeholder-cyber-blue/30"
            />
            <div className="mt-4 flex gap-4">
              <button
                onClick={handleInspection}
                disabled={loading || (!description && !selectedImage)}
                className="flex-1 bg-cyber-blue hover:bg-cyber-blue/80 disabled:bg-gray-900 disabled:text-gray-600 text-black font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 hover:shadow-neon-blue font-tech tracking-widest"
              >
                {loading ? <Loader2 className="animate-spin text-black" /> : <><ShieldAlert size={20} /> RUN COMPLIANCE CHECK</>}
              </button>
            </div>
          </div>

          {report && (
            <div className={`p-6 rounded-2xl border transition-all duration-500 ${report.isCritical ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_30px_rgba(220,38,38,0.2)]' : 'glass-panel shadow-neon-blue'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-white font-tech">
                  {report.isCritical ? <AlertTriangle className="text-red-500" /> : <CheckCircle className="text-cyber-blue" />}
                  COMPLIANCE ANALYSIS RESULT
                </h3>
                <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${report.isCritical ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-cyber-blue text-black shadow-lg shadow-neon-blue'}`}>
                  {report.isCritical ? 'CRITICAL - SAFETY RISK' : 'REPORTABLE'}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-blue-300/60 uppercase font-bold mb-1 font-mono">Generated Non-Conformance Report (NCR)</p>
                  <div className="mt-1 p-4 bg-slate-950/50 rounded-lg font-mono text-xs text-blue-100/90 border border-blue-900/50 leading-relaxed whitespace-pre-wrap shadow-inner">
                    {report.ncrText}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-950/20 rounded-lg border border-blue-900/30">
                    <p className="text-[10px] text-blue-300/60 uppercase font-bold mb-1 font-mono">Standard Reference</p>
                    <p className="text-sm text-blue-400 font-mono font-bold">{report.standardRef}</p>
                  </div>
                  <div className="p-3 bg-blue-950/20 rounded-lg border border-blue-900/30">
                    <p className="text-[10px] text-blue-300/60 uppercase font-bold mb-1 font-mono">Required Action</p>
                    <p className="text-sm text-blue-100/80">{report.actionRequired}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4 border-b border-blue-900/50 pb-2 font-tech">Authorization</h3>
            {needsAuthorization ? (
              <div className="space-y-4 animate-pulse">
                <div className="flex flex-col items-center py-6 border-2 border-dashed border-red-500/50 rounded-lg bg-red-950/20">
                  <Lock className="text-red-500 mb-2" size={32} />
                  <p className="text-xs text-red-400 font-bold uppercase tracking-wider">Supervisor Override Req.</p>
                </div>
                <button
                  onClick={resetAlert}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg text-sm transition-all shadow-lg shadow-red-600/20 font-tech tracking-wide"
                >
                  ACKNOWLEDGE & CLEAR ALERT
                </button>
              </div>
            ) : (
              <div className="text-center py-8 text-blue-900/60 italic text-xs font-mono">
                // System Status: Idle<br />
                // Awaiting analysis...
              </div>
            )}
          </div>

          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4 border-b border-blue-900/50 pb-2 font-tech">AS9100 Rev D Quicklinks</h3>
            <ul className="space-y-3 text-xs text-blue-200/70 font-mono">
              <li className="flex items-center gap-3 hover:text-blue-300 cursor-pointer transition-colors group">
                <div className="w-1.5 h-1.5 bg-blue-600/50 rounded-full group-hover:bg-blue-400 group-hover:shadow-[0_0_10px_rgba(59,130,246,0.8)] transition-all"></div>
                8.7 Control of Nonconforming Outputs
              </li>
              <li className="flex items-center gap-3 hover:text-blue-300 cursor-pointer transition-colors group">
                <div className="w-1.5 h-1.5 bg-blue-600/50 rounded-full group-hover:bg-blue-400 group-hover:shadow-[0_0_10px_rgba(59,130,246,0.8)] transition-all"></div>
                10.2 Nonconformity & Corrective Action
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FalconEye;
