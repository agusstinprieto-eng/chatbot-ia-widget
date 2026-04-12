
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { decode, decodeAudioData, createBlob } from '../../utils/audioUtils';
import { Mic, PhoneOff, PhoneCall, Satellite, FileText, Trash2, Check, Copy, Activity, Sparkles, Plane } from 'lucide-react';
import { motion } from 'framer-motion';
import { getSecureKey } from '../../services/ai/geminiService';

interface TranscriptionHistory {
    role: 'user' | 'model';
    text: string;
    timestamp: Date;
}

interface VoiceLinkViewProps {
    activeColor?: string;
}

export const VoiceLinkView: React.FC<VoiceLinkViewProps> = ({
    activeColor = 'bg-teal-500',
}) => {
    // Aerospace specific instruction
    const systemInstruction = 'Eres AERO IA, una experta en protocolos de ingeniería aeroespacial, mantenimiento MRO y cumplimiento de la norma AS9100. Tu objetivo es asistir a los técnicos en el taller, resolver dudas sobre manuales y reportar no conformidades (NCR) de forma precisa y técnica.';
    const agentVoice = 'Aoede';
    const agentName = 'AERO-01';

    const [isActive, setIsActive] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isModelSpeaking, setIsModelSpeaking] = useState(false);
    const [history, setHistory] = useState<TranscriptionHistory[]>([]);
    const [currentTurn, setCurrentTurn] = useState({ user: '', model: '' });
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const audioContextInRef = useRef<AudioContext | null>(null);
    const audioContextOutRef = useRef<AudioContext | null>(null);
    const sessionRef = useRef<any>(null);
    const nextStartTimeRef = useRef<number>(0);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const streamRef = useRef<MediaStream | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const isSocketReadyRef = useRef<boolean>(false);
    const isActiveRef = useRef<boolean>(false);

    const glowColor = 'rgba(20, 184, 166, 0.4)'; // Teal-500

    useEffect(() => { isActiveRef.current = isActive; }, [isActive]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history, currentTurn]);

    useEffect(() => {
        return () => {
            stopSession();
        };
    }, []);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const stopSession = useCallback(() => {
        if (sessionRef.current) {
            try { sessionRef.current.close(); } catch (e) { }
            sessionRef.current = null;
        }
        if (processorRef.current) {
            processorRef.current.onaudioprocess = null;
            processorRef.current.disconnect();
            processorRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (audioContextInRef.current) {
            if (audioContextInRef.current.state !== 'closed') {
                audioContextInRef.current.close().catch(e => console.error("Error closing context:", e));
            }
            audioContextInRef.current = null;
        }
        if (audioContextOutRef.current) {
            if (audioContextOutRef.current.state !== 'closed') {
                audioContextOutRef.current.close().catch(e => console.error("Error closing context:", e));
            }
            audioContextOutRef.current = null;
        }

        isActiveRef.current = false;
        isSocketReadyRef.current = false;
        setIsActive(false);
        setIsConnecting(false);
        setIsModelSpeaking(false);
    }, []);

    const startSession = async () => {
        try {
            setIsConnecting(true);
            // AGUS PRO: Carga segura de API Key
            const apiKey = await getSecureKey('GEMINI_API_KEY');
            if (!apiKey) {
                alert('GEMINI_API_KEY no detectada en Supabase.');
                setIsConnecting(false);
                return;
            }
            const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1alpha' } as any);

            audioContextInRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            audioContextOutRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            await audioContextInRef.current.resume();
            await audioContextOutRef.current.resume();

            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                alert('Micrófono no disponible.');
                setIsConnecting(false);
                return;
            }

            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

            const sessionPromise = ai.live.connect({
                model: 'models/gemini-2.5-flash-native-audio-preview-12-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: agentVoice } },
                    },
                    systemInstruction: systemInstruction,
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
                callbacks: {
                    onopen: () => {
                        isActiveRef.current = true;
                        isSocketReadyRef.current = true;
                        setIsActive(true);
                        setIsConnecting(false);

                        const source = audioContextInRef.current!.createMediaStreamSource(streamRef.current!);
                        processorRef.current = audioContextInRef.current!.createScriptProcessor(4096, 1, 1);

                        processorRef.current.onaudioprocess = (e) => {
                            if (!audioContextInRef.current || !sessionRef.current || !isSocketReadyRef.current) return;
                            const inputData = e.inputBuffer.getChannelData(0);
                            sessionRef.current.sendRealtimeInput({ media: createBlob(inputData) });
                        };

                        const gainNode = audioContextInRef.current!.createGain();
                        gainNode.gain.value = 0;
                        source.connect(processorRef.current);
                        processorRef.current.connect(gainNode);
                        gainNode.connect(audioContextInRef.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
                            setIsModelSpeaking(true);
                            const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
                            const ctx = audioContextOutRef.current!;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                            const source = ctx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(ctx.destination);
                            source.onended = () => {
                                sourcesRef.current.delete(source);
                                if (sourcesRef.current.size === 0) setIsModelSpeaking(false);
                            };
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            sourcesRef.current.add(source);
                        }

                        if (message.serverContent?.inputTranscription) {
                            const text = message.serverContent.inputTranscription.text;
                            setCurrentTurn(prev => ({ ...prev, user: prev.user + text }));
                        }
                        if (message.serverContent?.outputTranscription) {
                            const text = message.serverContent.outputTranscription.text;
                            setCurrentTurn(prev => ({ ...prev, model: prev.model + text }));
                        }

                        if (message.serverContent?.turnComplete) {
                            setHistory(prev => [
                                ...prev,
                                { role: 'user' as const, text: currentTurn.user, timestamp: new Date() },
                                { role: 'model' as const, text: currentTurn.model, timestamp: new Date() }
                            ].filter(m => m.text.trim() !== ''));
                            setCurrentTurn({ user: '', model: '' });
                        }
                    },
                    onerror: (err: any) => {
                        console.error("Voice Error:", err);
                        stopSession();
                    },
                    onclose: stopSession
                }
            });
            sessionRef.current = await sessionPromise;
        } catch (err: any) {
            console.error(err);
            setIsConnecting(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-6 space-y-6 overflow-hidden">
            {/* Header info */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter flex items-center gap-4">
                        <Plane className="text-teal-500" size={32} />
                        Voice <span className="text-teal-500">Link</span>
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-teal-500 animate-pulse' : 'bg-slate-700'} shadow-[0_0_10px_rgba(20,184,166,0.5)]`}></div>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] opacity-60">
                            Aerospace Neural Interface // Global Flight Standards
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
                {/* Visualizer and Controls */}
                <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-6 pt-10 pb-6 flex flex-col items-center justify-center relative overflow-visible group">
                    <div
                        className={`absolute inset-0 rounded-full blur-[120px] opacity-0 transition-opacity duration-1000 ${isActive ? 'opacity-20 animate-pulse' : ''}`}
                        style={{ backgroundColor: glowColor }}
                    ></div>

                    <div className="relative z-10 flex flex-col items-center gap-6 w-full">
                        <div className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center">
                            {/* Animated Outer Glow */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.05, 1],
                                    opacity: isActive ? [0.3, 0.6, 0.3] : 0.2
                                }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className={`absolute inset-[-20px] rounded-full blur-3xl opacity-30 ${activeColor}`}
                            />

                            {/* Orb Visualizer */}
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className={`relative w-full h-full rounded-full overflow-hidden border-2 transition-all duration-700 z-10 ${isActive ? 'border-teal-500/40 shadow-[0_0_50px_rgba(20,184,166,0.4)]' : 'border-white/20 opacity-100'}`}
                            >
                                <img
                                    src="/voice-ai-orb.png"
                                    alt="AERO AI"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
                            </motion.div>

                            {/* Spectrum Ring */}
                            {isActive && (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    className={`absolute inset-[-10px] rounded-full border-2 border-dashed border-teal-500/30 blur-[2px]`}
                                />
                            )}
                        </div>

                        {/* Frequency Waves */}
                        <div className="flex gap-1.5 h-16 items-center">
                            {[...Array(32)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        height: isActive && isModelSpeaking ? [4, 40, 10, 60, 4] : 4,
                                        opacity: isActive ? [0.4, 1, 0.4] : 0.1
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 0.8,
                                        delay: i * 0.05
                                    }}
                                    className={`w-1 rounded-full bg-teal-500`}
                                    style={{
                                        boxShadow: isActive ? `0 0 10px ${glowColor}` : 'none'
                                    }}
                                />
                            ))}
                        </div>

                        <div className="flex flex-col items-center gap-6 w-full max-w-xs">
                            <button
                                onClick={isActive ? stopSession : startSession}
                                disabled={isConnecting}
                                className={`w-full py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 ${isActive
                                    ? 'bg-red-600 text-white shadow-[0_0_40px_rgba(220,38,38,0.4)]'
                                    : 'bg-teal-500 text-white shadow-[0_0_40px_rgba(20,184,166,0.3)] hover:scale-105 active:scale-95'
                                    } disabled:opacity-50`}
                            >
                                {isConnecting ? (
                                    <>
                                        <Activity className="animate-spin" size={20} />
                                        Syncing Protocols...
                                    </>
                                ) : isActive ? (
                                    <>
                                        <PhoneOff size={20} />
                                        End Link
                                    </>
                                ) : (
                                    <>
                                        <PhoneCall size={20} />
                                        Initiate Link
                                    </>
                                )}
                            </button>

                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest text-center leading-relaxed">
                                {isActive ? 'Channel Open: AERO-01 is processing telemetry...' : 'Touch to start the high-fidelity aero industrial neural bridge.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Transcription History */}
                <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FileText className="text-teal-400" size={18} />
                            <h3 className="text-xs font-black text-white uppercase tracking-widest italic">Live Telemetry Transmit</h3>
                        </div>
                        <button
                            onClick={() => setHistory([])}
                            className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>

                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-black/20"
                    >
                        {history.length === 0 && !currentTurn.user && !currentTurn.model && (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-20 p-8">
                                <Mic size={48} className="mb-4 text-teal-500" />
                                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Listening for frequencies...</p>
                            </div>
                        )}

                        {history.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] group relative p-4 rounded-2xl border text-xs leading-relaxed transition-all shadow-xl ${m.role === 'user'
                                    ? 'bg-slate-800 border-white/10 text-slate-300 rounded-tr-none'
                                    : 'bg-teal-500/10 border-teal-500/30 text-teal-100 rounded-tl-none'
                                    }`}>
                                    <p>{m.text}</p>
                                    <div className="mt-2 flex items-center justify-between opacity-40">
                                        <span className="text-[8px] font-black uppercase tracking-widest">
                                            {m.role === 'user' ? 'Operator' : 'AERO-01'}
                                        </span>
                                        <span className="text-[8px] font-bold">
                                            {m.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleCopy(m.text, i)}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-slate-900 border border-white/10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        {copiedIndex === i ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} className="text-slate-400" />}
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Partial Turns */}
                        {(currentTurn.user || currentTurn.model) && (
                            <div className="space-y-3">
                                {currentTurn.user && (
                                    <div className="flex justify-end animate-pulse">
                                        <div className="max-w-[85%] p-4 bg-slate-800/40 border border-white/5 rounded-2xl rounded-tr-none text-slate-500 italic text-xs">
                                            {currentTurn.user}
                                        </div>
                                    </div>
                                )}
                                {currentTurn.model && (
                                    <div className="flex justify-start animate-pulse">
                                        <div className="max-w-[85%] p-4 bg-teal-500/5 border border-teal-500/10 rounded-2xl rounded-tl-none text-teal-500/50 italic text-xs">
                                            {currentTurn.model}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-black/40 border-t border-white/5 flex justify-center">
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`}></div>
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Neural Engine Status: {isActive ? 'ONLINE' : 'IDLE'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};
