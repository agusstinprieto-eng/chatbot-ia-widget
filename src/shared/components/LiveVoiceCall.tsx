
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { decode, decodeAudioData, createPCM16kBlob } from '../utils/audioUtils';
import { X, Mic, PhoneOff, Activity, ShieldAlert, Cpu } from 'lucide-react';

interface LiveVoiceCallProps {
    isOpen: boolean;
    onClose: () => void;
    systemInstruction: string;
    language: 'es' | 'en';
    unlimited?: boolean;
}

const LiveVoiceCall: React.FC<LiveVoiceCallProps> = ({ isOpen, onClose, systemInstruction, language, unlimited = false }) => {
    const [isActive, setIsActive] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isModelSpeaking, setIsModelSpeaking] = useState(false);
    const [volume, setVolume] = useState(0);
    const [transcription, setTranscription] = useState<{ user: string; model: string }>({ user: '', model: '' });
    const [duration, setDuration] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const sessionRef = useRef<any>(null);
    const audioContextInRef = useRef<AudioContext | null>(null);
    const audioContextOutRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const nextStartTimeRef = useRef<number>(0);

    const MAX_DURATION_PER_CALL = 600; // 10 Minutes per call for Aero

    useEffect(() => {
        let interval: any;
        if (isActive) {
            interval = setInterval(() => {
                setDuration(prev => {
                    if (!unlimited && prev >= MAX_DURATION_PER_CALL) {
                        stopSession();
                        setError(language === 'es' ? "Límite de tiempo alcanzado." : "Time limit reached.");
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, unlimited, language]);

    useEffect(() => {
        if (isOpen) startSession();
        return () => stopSession();
    }, [isOpen]);

    useEffect(() => {
        let animationFrame: number;
        const animate = () => {
            if (analyserRef.current && isActive) {
                const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
                analyserRef.current.getByteFrequencyData(dataArray);
                const avg = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
                setVolume(avg);
            }
            animationFrame = requestAnimationFrame(animate);
        };
        animate();
        return () => cancelAnimationFrame(animationFrame);
    }, [isActive]);

    const stopSession = useCallback(() => {
        if (processorRef.current) processorRef.current.disconnect();
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        sourcesRef.current.forEach(s => { try { s.stop(); } catch (e) { } });
        sourcesRef.current.clear();
        if (audioContextInRef.current) audioContextInRef.current.close();
        if (audioContextOutRef.current) audioContextOutRef.current.close();

        setIsActive(false);
        setIsConnecting(false);
        setIsModelSpeaking(false);
        setVolume(0);
    }, []);

    const startSession = async () => {
        setError(null);
        setIsConnecting(true);
        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            // Note: This requires the @google/genai SDK with multimodal support
            // For now, providing the structure. If dependency is missing, WebSockets could be used directly.

            audioContextInRef.current = new AudioContext({ sampleRate: 16000 });
            audioContextOutRef.current = new AudioContext({ sampleRate: 24000 });
            analyserRef.current = audioContextOutRef.current.createAnalyser();
            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Simulated connection for structure - In production, replace with real Gemini Live connect
            setIsActive(true);
            setIsConnecting(false);
        } catch (err: any) {
            setError(err.message);
            setIsConnecting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-cyber-black/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="relative w-full max-w-lg p-10 flex flex-col items-center glass-panel rounded-[3rem] border-cyber-blue/30 shadow-neon-blue">

                {/* Aero Header Decoration */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-2 bg-cyber-blue text-black font-black uppercase tracking-[0.3em] text-[10px] rounded-full shadow-neon-blue">
                    SECURE VOICE LINK // ACTIVE
                </div>

                <button onClick={onClose} className="absolute top-6 right-6 p-2 text-cyber-blue/40 hover:text-cyber-blue transition-colors">
                    <X size={24} />
                </button>

                {error ? (
                    <div className="text-center space-y-6">
                        <ShieldAlert size={64} className="text-red-500 mx-auto animate-pulse" />
                        <h3 className="text-xl font-bold text-white uppercase tracking-widest">Link Failure</h3>
                        <p className="text-red-400/80 font-mono text-xs">{error}</p>
                        <button onClick={startSession} className="px-8 py-3 bg-red-500/10 border border-red-500 text-red-500 rounded-xl font-bold uppercase hover:bg-red-500 hover:text-white transition-all">Reconnect</button>
                    </div>
                ) : (
                    <>
                        {/* Aero Visualizer Orb */}
                        <div className="relative w-56 h-56 flex items-center justify-center mb-10">
                            <div className={`absolute inset-0 rounded-full transition-all duration-300 ${isModelSpeaking ? 'bg-cyber-blue/20 blur-3xl scale-150' : 'bg-cyber-blue/5 blur-xl'}`}></div>

                            <div className={`relative w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${isModelSpeaking ? 'border-cyber-blue shadow-neon-blue scale-110' : 'border-cyber-blue/20'}`}
                                style={{ background: isModelSpeaking ? 'radial-gradient(circle, #13131f 30%, #00f0ff33 100%)' : '#0a0a0f' }}>
                                <Cpu size={48} className={`transition-all duration-500 ${isModelSpeaking ? 'text-cyber-blue animate-pulse' : 'text-cyber-blue/20'}`} />

                                {/* Orbiting rings */}
                                <div className={`absolute inset-[-10px] border border-cyber-blue/10 rounded-full ${isModelSpeaking ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
                                <div className={`absolute inset-[-25px] border border-cyber-blue/5 rounded-full ${isModelSpeaking ? 'animate-spin' : ''}`} style={{ animationDuration: '5s', animationDirection: 'reverse' }} />

                                {isActive && (
                                    <div className="absolute bottom-[-40px] flex gap-1 h-8 items-end">
                                        {[...Array(8)].map((_, i) => (
                                            <div key={i} className="w-1 bg-cyber-blue/40 rounded-full transition-all duration-75"
                                                style={{ height: `${20 + Math.random() * (volume || 10)}%` }} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="text-center space-y-4 mb-8 w-full">
                            <h3 className="text-2xl font-black text-white tracking-[0.2em] uppercase italic">
                                {isConnecting ? 'Initializing...' : isActive ? (isModelSpeaking ? 'Transmitting' : 'Awaiting Input') : 'Offline'}
                            </h3>
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex items-center gap-2 text-cyber-blue/60 font-mono text-[10px] uppercase tracking-widest whitespace-nowrap">
                                    <Activity size={12} className="animate-pulse" />
                                    <span>Gemini 2.0 Live // Multimodal</span>
                                </div>
                                <div className="px-4 py-1.5 rounded-full bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue font-mono text-xs font-bold shadow-inner">
                                    {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')} // SYSTEM_UPTIME
                                </div>
                            </div>
                        </div>

                        {/* Transcription Surface */}
                        <div className="w-full bg-cyber-dark/50 border border-cyber-blue/10 rounded-2xl p-5 min-h-[120px] mb-8 space-y-3 font-mono">
                            {transcription.model ? (
                                <div className="animate-in fade-in slide-in-from-left-2 transition-all">
                                    <span className="text-[10px] text-cyber-blue/40 uppercase tracking-widest block mb-1">AI_CORE_OUTPUT</span>
                                    <p className="text-cyan-100 text-sm leading-relaxed">{transcription.model}</p>
                                </div>
                            ) : (
                                <p className="text-center text-cyber-blue/20 text-xs italic mt-8 uppercase tracking-widest animate-pulse">
                                    System listening for operator commands...
                                </p>
                            )}
                        </div>
                    </>
                )}

                <button onClick={onClose} className="group px-12 py-5 bg-red-950/40 border border-red-500/50 text-red-500 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all shadow-[0_0_20px_rgba(239,68,68,0.1)] flex items-center gap-4">
                    <PhoneOff size={24} className="group-hover:rotate-12 transition-transform" />
                    <span>Terminate Link</span>
                </button>
            </div>
        </div>
    );
};

export default LiveVoiceCall;
