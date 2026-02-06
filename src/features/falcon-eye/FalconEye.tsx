import React, { useState, useRef } from 'react';
import { Camera, ShieldAlert, CheckCircle, AlertTriangle, FileWarning, Loader2, Lock, Upload, X } from 'lucide-react';
import { falconEyeInspection } from '../../services/ai/geminiService';

const FalconEye: React.FC<{ setCriticalAlert: (val: boolean) => void }> = ({ setCriticalAlert }) => {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [needsAuthorization, setNeedsAuthorization] = useState(false);
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
    try {
      const base64Data = selectedImage ? selectedImage.split(',')[1] : undefined;
      const data = await falconEyeInspection(description || "Analyze this aerospace component for defects.", base64Data);
      setReport(data);
      if (data.isCritical) {
        setCriticalAlert(true);
        setNeedsAuthorization(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetAlert = () => {
    setCriticalAlert(false);
    setNeedsAuthorization(false);
    setReport(null);
    setDescription('');
    removeImage();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <Camera className="text-teal-500" />
          Falcon Eye
        </h2>
        <p className="text-slate-400">Quality Inspection & NCR Generator (AS9100 Rev D)</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-slate-300">Defect Description / Observations</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs bg-slate-700 hover:bg-slate-600 text-teal-400 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors border border-teal-500/30"
              >
                <Upload size={14} /> Upload Image
              </button>
            </div>

            {selectedImage && (
              <div className="relative mb-4 group inline-block">
                <img src={selectedImage} alt="Preview" className="h-40 rounded-lg border border-teal-500/50" />
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
              placeholder="Enter defect details or let IA analyze the image (e.g. Porosity on turbine blade root...)"
              className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-4 text-slate-200 focus:border-teal-500 outline-none transition-all resize-none font-mono text-sm"
            />
            <div className="mt-4 flex gap-4">
              <button
                onClick={handleInspection}
                disabled={loading || (!description && !selectedImage)}
                className="flex-1 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-700 text-slate-900 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : <><ShieldAlert size={20} /> Run Compliance Check</>}
              </button>
            </div>
          </div>

          {report && (
            <div className={`p-6 rounded-xl border-2 animate-in fade-in zoom-in duration-300 ${report.isCritical ? 'bg-red-950/30 border-red-600' : 'bg-slate-800 border-teal-500'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  {report.isCritical ? <AlertTriangle className="text-red-600" /> : <CheckCircle className="text-teal-500" />}
                  Compliance Analysis Result
                </h3>
                <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${report.isCritical ? 'bg-red-600 text-white' : 'bg-teal-500 text-slate-900'}`}>
                  {report.isCritical ? 'CRITICAL - SAFETY RISK' : 'REPORTABLE'}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Generated Non-Conformance Report (NCR)</p>
                  <div className="mt-2 p-4 bg-slate-900 rounded-lg font-mono text-xs text-slate-300 border border-slate-700 leading-relaxed whitespace-pre-wrap">
                    {report.ncrText}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Standard Reference</p>
                    <p className="text-sm text-teal-400 font-mono">{report.standardRef}</p>
                  </div>
                  <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Required Action</p>
                    <p className="text-sm text-slate-300">{report.actionRequired}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Authorization</h3>
            {needsAuthorization ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center py-6 border-2 border-dashed border-red-900/50 rounded-lg bg-red-950/10">
                  <Lock className="text-red-600 mb-2" size={32} />
                  <p className="text-xs text-red-500 font-bold uppercase">Supervisor Override Req.</p>
                </div>
                <button
                  onClick={resetAlert}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg text-sm transition-colors"
                >
                  Acknowledge & Clear Alert
                </button>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 italic text-xs">
                Awaiting analysis...
              </div>
            )}
          </div>

          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">AS9100 Rev D Quicklinks</h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2 hover:text-teal-500 cursor-pointer">
                <div className="w-1 h-1 bg-teal-500 rounded-full"></div>
                8.7 Control of Nonconforming Outputs
              </li>
              <li className="flex items-center gap-2 hover:text-teal-500 cursor-pointer">
                <div className="w-1 h-1 bg-teal-500 rounded-full"></div>
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
