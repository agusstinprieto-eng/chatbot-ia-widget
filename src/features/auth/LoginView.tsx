
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Plane, Lock, ArrowRight, Loader2 } from 'lucide-react';

const LoginView: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const success = await login(email, password);

        if (!success) {
            setError('Acceso denegado. Verifique sus credenciales.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-cyber-black flex items-center justify-center p-6 relative overflow-hidden font-tech">
            {/* HUD Grid Background Overlay */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#1c1c2e 1px, transparent 1px), linear-gradient(90deg, #1c1c2e 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            {/* Animated Glow Elements - Aero Style */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyber-blue/10 blur-[150px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyber-purple/5 blur-[150px] rounded-full delay-1000" />

            <div className="w-full max-w-md relative z-10">
                {/* Logo & Branding */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-cyber-dark border border-cyber-blue/30 rounded-2xl mb-6 shadow-neon-blue group hover:scale-110 transition-transform duration-500">
                        <Plane size={40} className="text-cyber-blue drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-4xl font-bold text-white uppercase tracking-tighter shadow-neon-blue">
                            AERO.<span className="text-cyber-blue">SYS</span> // IA
                        </h1>
                        <p className="text-cyber-blue/60 font-mono text-xs tracking-[0.4em] uppercase">Aerospace Intelligence HUB</p>
                    </div>
                </div>

                {/* Login Form Container */}
                <div className="glass-panel p-8 rounded-[2rem] border border-cyber-blue/20 shadow-2xl relative group overflow-hidden">
                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyber-blue/40 rounded-tl-xl" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyber-blue/40 rounded-tr-xl" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyber-blue/40 rounded-bl-xl" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyber-blue/40 rounded-br-xl" />

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-bold text-center uppercase tracking-widest animate-bounce">
                                [ ! ] {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="text-center border-b border-cyber-blue/10 pb-4 mb-2">
                                <h2 className="text-lg font-bold text-white uppercase tracking-widest">Operator Access</h2>
                                <p className="text-[10px] text-cyber-blue/40 font-mono mt-1">SECURE ENCRYPTION AES-256 ACTIVE</p>
                            </div>

                            <div className="space-y-1 group">
                                <label className="text-[10px] uppercase font-bold text-cyber-blue/40 ml-4 tracking-[0.2em] group-focus-within:text-cyber-blue transition-colors">Credential ID</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-cyber-black/50 border border-cyber-blue/20 rounded-xl p-4 text-white focus:border-cyber-blue/60 outline-none transition-all placeholder:text-cyber-gray font-mono text-sm"
                                        placeholder="user@aero.sys"
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="space-y-1 group">
                                <label className="text-[10px] uppercase font-bold text-cyber-blue/40 ml-4 tracking-[0.2em] group-focus-within:text-cyber-blue transition-colors">Access Key</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-cyber-black/50 border border-cyber-blue/20 rounded-xl p-4 text-white focus:border-cyber-blue/60 outline-none transition-all placeholder:text-cyber-gray font-mono text-sm"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-cyber-blue/20 group-focus-within:text-cyber-blue/50 transition-colors" />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-cyber-blue text-black rounded-xl font-black uppercase tracking-[0.3em] hover:bg-white hover:shadow-neon-blue active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 group mt-4 overflow-hidden relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                {isLoading ? (
                                    <div className="flex items-center gap-3">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span className="text-[10px]">Authorizing...</span>
                                    </div>
                                ) : (
                                    <>
                                        Authorize Access
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer Info */}
                <div className="mt-12 text-center space-y-4">
                    <a href="#" className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass-panel border border-cyber-blue/10 hover:border-cyber-blue/40 transition-all duration-300">
                        <span className="w-2 h-2 rounded-full bg-cyber-blue animate-pulse shadow-neon-blue"></span>
                        <span className="text-[10px] font-mono text-cyber-blue/40 tracking-widest hover:text-cyber-blue transition-colors">
                            POWERED BY <span className="font-bold text-cyber-blue">IA.AGUS</span> // DEEP GEN-AI
                        </span>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default LoginView;
