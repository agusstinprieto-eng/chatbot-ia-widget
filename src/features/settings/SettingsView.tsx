
import React, { useState, useEffect } from 'react';
import { Save, Shield, Brain, Monitor, User, CheckCircle2 } from 'lucide-react';

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
            </div>

            <div className="p-8 border-t border-cyber-blue/20 flex flex-col items-center">
                <p className="text-[10px] text-cyber-blue/30 uppercase tracking-[0.5em] font-mono">Aero IA Pro // v1.0.4-stable</p>
            </div>
        </div>
    );
};

export default SettingsView;
