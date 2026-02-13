import React, { useState, useEffect } from 'react';
import { Save, Shield, Brain, Monitor, User, CheckCircle2, Database } from 'lucide-react';
import DocumentManager from './components/DocumentManager';

const SettingsView: React.FC = () => {
    const [apiKey, setApiKey] = useState('');
    const [operatorName, setOperatorName] = useState('A. Prieto');
    const [savedSettings, setSavedSettings] = useState(false);

    useEffect(() => {
        const storedKey = localStorage.getItem('aero_gemini_key') || '';
        const storedName = localStorage.getItem('aero_operator_name') || 'A. Prieto';
        setApiKey(storedKey);
        setOperatorName(storedName);
    }, []);

    const handleSave = () => {
        localStorage.setItem('aero_gemini_key', apiKey);
        localStorage.setItem('aero_operator_name', operatorName);
        setSavedSettings(true);
        setTimeout(() => setSavedSettings(false), 3000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-cyber-blue/5 p-6 rounded-2xl border border-cyber-blue/20 glass-panel">
                <div>
                    <h2 className="text-3xl font-bold font-tech text-white shadow-neon-blue">CONFIGURACIÓN DEL SISTEMA</h2>
                    <p className="text-cyber-blue/60 font-mono text-xs mt-1 uppercase tracking-widest">Aero IA Pro // Maintenance & Compliance Control</p>
                </div>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-cyber-blue text-black px-6 py-2 rounded-lg font-bold font-tech hover:bg-white transition-all shadow-neon-blue active:scale-95"
                >
                    {savedSettings ? <CheckCircle2 size={18} /> : <Save size={18} />}
                    {savedSettings ? 'GUARDADO' : 'GUARDAR CAMBIOS'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AI Configuration */}
                <div className="glass-panel p-6 border border-cyber-blue/20 rounded-2xl bg-cyber-dark/40">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-cyber-blue/10 rounded-lg text-cyber-blue">
                            <Brain size={24} />
                        </div>
                        <h3 className="font-tech text-xl text-white">INTERFAZ DE IA</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] text-cyber-blue/50 uppercase font-mono mb-2">Gemini API Key</label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Introduzca su API Key..."
                                className="w-full bg-black/40 border border-cyber-blue/20 rounded-lg px-4 py-2.5 text-cyber-blue font-mono text-sm focus:border-cyber-blue transition-colors outline-none"
                            />
                            <p className="text-[10px] text-gray-500 mt-2 font-mono">Requerido para Falcon Eye y MRO Expert.</p>
                        </div>
                        <div>
                            <label className="block text-[10px] text-cyber-blue/50 uppercase font-mono mb-2">Modelo Activo</label>
                            <select className="w-full bg-black border border-cyber-blue/20 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:border-cyber-blue outline-none cursor-pointer">
                                <option className="bg-black text-white">gemini-2.0-flash</option>
                                <option className="bg-black text-white">gemini-1.5-pro-latest</option>
                                <option className="bg-black text-white">gemini-1.5-flash-latest</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Compliance Settings */}
                <div className="glass-panel p-6 border border-cyber-blue/20 rounded-2xl bg-cyber-dark/40">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                            <Shield size={24} />
                        </div>
                        <h3 className="font-tech text-xl text-white">NORMATIVA Y COMPLIANCE</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                            <span className="text-xs text-zinc-300 font-tech">AS9100 Rev D Tracking</span>
                            <div className="w-10 h-5 bg-cyber-blue/20 rounded-full relative cursor-pointer border border-cyber-blue/30">
                                <div className="w-4 h-4 bg-cyber-blue rounded-full absolute right-0.5 top-0.5 shadow-neon-blue"></div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                            <span className="text-xs text-zinc-300 font-tech">Auto-Report Generation (NCR)</span>
                            <div className="w-10 h-5 bg-cyber-blue/20 rounded-full relative cursor-pointer border border-cyber-blue/30">
                                <div className="w-4 h-4 bg-cyber-blue rounded-full absolute right-0.5 top-0.5 shadow-neon-blue"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* User Identity */}
                <div className="glass-panel p-6 border border-cyber-blue/20 rounded-2xl bg-cyber-dark/40">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                            <User size={24} />
                        </div>
                        <h3 className="font-tech text-xl text-white">IDENTIDAD DEL OPERADOR</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] text-cyber-blue/50 uppercase font-mono mb-2">Nombre del Inspector</label>
                            <input
                                type="text"
                                value={operatorName}
                                onChange={(e) => setOperatorName(e.target.value)}
                                className="w-full bg-black/40 border border-cyber-blue/20 rounded-lg px-4 py-2.5 text-cyber-blue font-mono text-sm focus:border-cyber-blue transition-colors outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Preferences */}
                <div className="glass-panel p-6 border border-cyber-blue/20 rounded-2xl bg-cyber-dark/40">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                            <Monitor size={24} />
                        </div>
                        <h3 className="font-tech text-xl text-white">PREFERENCIAS DEL SISTEMA</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] text-cyber-blue/50 uppercase font-mono mb-2">Unidades de Medida</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button className="bg-cyber-blue text-black font-tech text-xs py-2 rounded-lg">MÉTRICO</button>
                                <button className="bg-white/5 text-zinc-400 font-tech text-xs py-2 rounded-lg border border-white/10">IMPERIAL</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Industrial Integrations */}
                <div className="glass-panel p-6 border border-cyber-blue/20 rounded-2xl bg-cyber-dark/40 md:col-span-2">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400">
                                <Database size={24} />
                            </div>
                            <h3 className="font-tech text-xl text-white uppercase">Ecosistema de Integración</h3>
                        </div>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-bold border border-emerald-500/20 uppercase tracking-widest">Sincronizado</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] text-zinc-400 font-mono font-bold">MRO CONNECTOR</span>
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                            </div>
                            <h4 className="text-white font-tech text-sm">Quantum / TRAX / CAMP</h4>
                            <p className="text-[10px] text-zinc-500 font-mono mt-1 italic">Conexión Bidireccional Activa</p>
                        </div>
                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] text-zinc-400 font-mono font-bold">ERP GATEWAY</span>
                                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                            </div>
                            <h4 className="text-white font-tech text-sm">SAP Aviation Cloud</h4>
                            <p className="text-[10px] text-purple-400 font-mono mt-1 font-bold uppercase">Beta Access Q2 2026</p>
                        </div>
                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl opacity-50">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] text-zinc-400 font-mono font-bold">FUTURE LINK</span>
                                <div className="w-2 h-2 rounded-full bg-zinc-600"></div>
                            </div>
                            <h4 className="text-white font-tech text-sm">Oracle Cloud</h4>
                            <p className="text-[10px] text-zinc-500 font-mono mt-1">Roadmap Q3 2026</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Knowledge Center & Documentation */}
            <div className="glass-panel p-8 border border-cyber-blue/20 rounded-2xl bg-cyber-dark/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Brain size={120} className="text-cyber-blue" />
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyber-blue/10 rounded-lg text-cyber-blue shadow-neon-blue/20">
                            <Brain size={24} />
                        </div>
                        <div>
                            <h3 className="font-tech text-xl text-white">CENTRO DE CONOCIMIENTO & DOCUMENTACIÓN</h3>
                            <p className="text-[10px] text-cyber-blue/50 font-mono uppercase tracking-widest mt-1">Videos Tutoriales, AS9100 & RAG Engine</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button className="flex items-center gap-2 px-4 py-2 bg-cyber-blue/10 border border-cyber-blue/30 rounded-lg text-cyber-blue text-xs font-tech hover:bg-cyber-blue/20 transition-all">
                            <Shield size={14} />
                            NORMATIVA AS9100
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-tech hover:bg-emerald-500/20 transition-all">
                            <CheckCircle2 size={14} />
                            VER TUTORIALES
                        </button>
                    </div>
                </div>

                <div className="relative z-10">
                    <DocumentManager />
                </div>

                <div className="mt-8 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl relative z-10">
                    <div className="flex gap-3">
                        <Brain size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-emerald-500/80 leading-relaxed font-mono">
                            <strong className="text-emerald-400">OPTIMIZACIÓN RAG + AS9100:</strong> La IA priorizará estos manuales y normativas para responder consultas técnicas en MRO Expert, Falcon Eye y Virtual Trainer.
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-8 border-t border-cyber-blue/20 flex flex-col items-center">
                <p className="text-[10px] text-cyber-blue/30 uppercase tracking-[0.5em] font-mono">Aero IA Pro // v1.0.5-industrial</p>
            </div>
        </div>
    );
};

export default SettingsView;
