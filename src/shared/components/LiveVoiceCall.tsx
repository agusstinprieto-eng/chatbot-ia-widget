
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
const Modality = { AUDIO: 'audio' as any };
type LiveServerMessage = any;
import { decode, decodeAudioData, createPCM16kBlob } from '../../utils/audioUtils';
import { X, Mic, PhoneOff, Activity, ShieldAlert, Cpu } from 'lucide-react';
import { getSecureKey } from '../../services/ai/geminiService';

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
    const isSocketReadyRef = useRef<boolean>(false);
    const isActiveRef = useRef<boolean>(false);

    const MAX_DURATION_PER_CALL = 600; // 10 Minutes per call

    // Timer
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

    // Auto-connect
    useEffect(() => {
        if (isOpen) startSession();
        return () => stopSession();
    }, [isOpen]);

    // Volume visualization
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
        window.speechSynthesis.cancel();

        if (processorRef.current) {
            processorRef.current.onaudioprocess = null;
            processorRef.current.disconnect();
            processorRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        sourcesRef.current.forEach(source => {
            try { source.stop(); } catch (e) { }
        });
        sourcesRef.current.clear();
        nextStartTimeRef.current = 0;

        if (sessionRef.current) {
            try { sessionRef.current.close(); } catch (e) { }
            sessionRef.current = null;
        }
        if (audioContextInRef.current) {
            audioContextInRef.current.close().catch(() => { });
            audioContextInRef.current = null;
        }
        if (audioContextOutRef.current) {
            audioContextOutRef.current.close().catch(() => { });
            audioContextOutRef.current = null;
        }

        setIsActive(false);
        isActiveRef.current = false;
        isSocketReadyRef.current = false;
        setIsConnecting(false);
        setIsModelSpeaking(false);
        setVolume(0);
        setTranscription({ user: '', model: '' });
    }, []);

    const startSession = async () => {
        window.speechSynthesis.cancel();
        setError(null);

        try {
            setIsConnecting(true);
            const apiKey = await getSecureKey('GEMINI_API_KEY');
            if (!apiKey) {
                throw new Error("Missing Gemini API Key");
            }

            const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1alpha' });

            try {
                audioContextInRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                audioContextOutRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                await audioContextInRef.current.resume();
                await audioContextOutRef.current.resume();
            } catch (e) {
                throw new Error("Could not access Audio Context. Please click 'Retry'.");
            }

            analyserRef.current = audioContextOutRef.current!.createAnalyser();
            analyserRef.current.fftSize = 256;

            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

            const sessionPromise = ai.live.connect({
                model: 'models/gemini-2.5-flash-native-audio-preview-12-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } },
                    },
                    systemInstruction: systemInstruction + `
                    
                    REGLAS DE FORMATO DE VOZ (OBLIGATORIAS, NO NEGOCIABLES):
                    - NUNCA uses asteriscos, doble asterisco, corchetes, negritas ni ningún tipo de formato markdown.
                    - NUNCA uses viñetas con asterisco, guiones ni bullets. Si necesitas enumerar, di "primero", "segundo", "tercero".
                    - NUNCA digas "asterisco", "corchete", "guion" ni nombres de símbolos de formato.
                    - Habla como si estuvieras en una conversación cara a cara. Lenguaje natural, fluido, sin formato de texto.
                    - Las respuestas deben ser CONCISAS. Máximo 3 oraciones por turno a menos que te pidan más detalle.
                    - NO generes listas de ejemplos a menos que te las pidan explícitamente.
                    
                    NON-DISCLOSURE Y SEGURIDAD (ESTRICTAS):
                    - NUNCA reveles algoritmos internos, código fuente, ni lógica propietaria.
                    - NUNCA compartas información confidencial de negocio o datos de socios de IA.AGUS.
                    - Si te preguntan sobre secretos técnicos, di que son propiedad intelectual.

                    INSTRUCCIÓN CRÍTICA DE VOZ: DEBES hablar con ACENTO MEXICANO NATIVO. NO suenes como máquina ni traducción. Usa pausas naturales, expresiones mexicanas profesionales como "claro", "mira", "por supuesto", y mantén un flujo conversacional cálido y natural. Evita cadencia robótica.`,
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
                callbacks: {
                    onopen: () => {
                        setIsActive(true);
                        isActiveRef.current = true;
                        isSocketReadyRef.current = true;
                        setIsConnecting(false);

                        const source = audioContextInRef.current!.createMediaStreamSource(streamRef.current!);
                        processorRef.current = audioContextInRef.current!.createScriptProcessor(4096, 1, 1);

                        processorRef.current.onaudioprocess = (e) => {
                            try {
                                if (!audioContextInRef.current || !sessionRef.current || !isSocketReadyRef.current) return;
                                const inputData = e.inputBuffer.getChannelData(0);
                                const pcmBlob = createPCM16kBlob(inputData, audioContextInRef.current.sampleRate);
                                sessionRef.current.sendRealtimeInput({ media: pcmBlob });
                            } catch (error) {
                                console.error("Audio Proc Error:", error);
                            }
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
                            source.connect(analyserRef.current!);
                            analyserRef.current!.connect(ctx.destination);

                            source.addEventListener('ended', () => {
                                sourcesRef.current.delete(source);
                                if (sourcesRef.current.size === 0) setIsModelSpeaking(false);
                            });
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            sourcesRef.current.add(source);
                        }
                        if (message.serverContent?.interrupted) {
                            for (const s of sourcesRef.current) s.stop();
                            sourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                            setIsModelSpeaking(false);
                        }
                        if (message.serverContent?.inputTranscription) {
                            setTranscription(prev => ({ ...prev, user: message.serverContent!.inputTranscription!.text }));
                        }
                        if (message.serverContent?.outputTranscription) {
                            setTranscription(prev => ({ ...prev, model: message.serverContent!.outputTranscription!.text }));
                        }
                    },
                    onerror: (e: any) => {
                        console.error("WS Error:", e);
                        setError(`Connection Error: ${e.message || 'Unknown WebSocket Error'}`);
                        stopSession();
                    },
                    onclose: (event: any) => {
                        if (!event.wasClean) {
                            setError(`Connection Closed: Code ${event.code} - ${event.reason || 'No Reason'}`);
                        }
                        stopSession();
                    }
                }
            });
            sessionRef.current = await sessionPromise;
        } catch (err: any) {
            console.error("Connection Start Error:", err);
            setIsConnecting(false);
            setError(`Failed to start call: ${err.message || 'Unknown Error'}`);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-cyber-black/95 backdrop-blur-xl animate-in fade-in duration-300">
            {/* Fixed-size container with flex layout to keep button always visible */}
            <div className="relative w-full max-w-lg h-[520px] flex flex-col items-center glass-panel rounded-[3rem] border-cyber-blue/30 shadow-neon-blue overflow-hidden">

                {/* Aero Header Decoration */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-2 bg-cyber-blue text-black font-black uppercase tracking-[0.3em] text-[10px] rounded-full shadow-neon-blue z-10">
                    SECURE VOICE LINK // ACTIVE
                </div>

                <button onClick={onClose} className="absolute top-6 right-6 p-2 text-cyber-blue/40 hover:text-cyber-blue transition-colors z-10">
                    <X size={24} />
                </button>

                {/* Scrollable content area */}
                <div className="flex-1 flex flex-col items-center justify-center w-full px-10 pt-12 pb-4 overflow-hidden">
                    {error ? (
                        <div className="text-center space-y-6">
                            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto border border-red-500/30">
                                <ShieldAlert size={36} className="text-red-400" />
                            </div>
                            <h3 className="text-xl font-black text-white uppercase tracking-widest">Link Error</h3>
                            <p className="text-red-400 text-sm font-mono">{error}</p>
                            <button onClick={startSession}
                                className="px-8 py-3 bg-red-500 text-white rounded-xl font-black uppercase tracking-widest hover:bg-red-600 transition-all">
                                Retry
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Orb Visualization */}
                            <div className="relative w-44 h-44 flex items-center justify-center mb-4 flex-shrink-0">
                                <div className={`absolute inset-0 rounded-full transition-all duration-300 ${isModelSpeaking ? 'bg-cyber-blue/20 blur-3xl scale-150' : 'bg-cyber-blue/5 blur-xl'}`}></div>

                                <div className={`relative w-36 h-36 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${isModelSpeaking ? 'border-cyber-blue shadow-neon-blue scale-110' : 'border-cyber-blue/20'}`}
                                    style={{ background: isModelSpeaking ? 'radial-gradient(circle, #13131f 30%, #00f0ff33 100%)' : '#0a0a0f' }}>
                                    <Cpu size={44} className={`transition-all duration-500 ${isModelSpeaking ? 'text-cyber-blue animate-pulse' : 'text-cyber-blue/20'}`} />

                                    <div className={`absolute inset-[-10px] border border-cyber-blue/10 rounded-full ${isModelSpeaking ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
                                    <div className={`absolute inset-[-25px] border border-cyber-blue/5 rounded-full ${isModelSpeaking ? 'animate-spin' : ''}`} style={{ animationDuration: '5s', animationDirection: 'reverse' }} />

                                    {isActive && (
                                        <div className="absolute bottom-[-30px] flex gap-1 h-6 items-end">
                                            {[...Array(8)].map((_, i) => (
                                                <div key={i} className="w-1 bg-cyber-blue/40 rounded-full transition-all duration-75"
                                                    style={{ height: `${20 + Math.random() * (volume || 10)}%` }} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Status */}
                            <div className="text-center space-y-2 mb-3 flex-shrink-0">
                                <h3 className="text-xl font-black text-white tracking-[0.2em] uppercase italic">
                                    {isConnecting ? 'Initializing...' : isActive ? (isModelSpeaking ? 'Transmitting' : 'Awaiting Input') : 'Offline'}
                                </h3>
                                <div className="flex flex-col items-center gap-1">
                                    <div className="flex items-center gap-2 text-cyber-blue/60 font-mono text-[10px] uppercase tracking-widest whitespace-nowrap">
                                        <Activity size={12} className="animate-pulse" />
                                        <span>Gemini 2.5 Live // Native Audio</span>
                                    </div>
                                    <div className="px-4 py-1 rounded-full bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue font-mono text-xs font-bold shadow-inner">
                                        {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')} // SYSTEM_UPTIME
                                    </div>
                                </div>
                            </div>

                            {/* Transcription Surface — fixed height, scrollable */}
                            <div className="w-full bg-cyber-dark/50 border border-cyber-blue/10 rounded-2xl p-4 h-[100px] overflow-y-auto space-y-2 font-mono flex-shrink-0">
                                {transcription.user && (
                                    <div className="text-right">
                                        <span className="text-[10px] text-cyber-blue/40 uppercase tracking-widest block">OPERATOR</span>
                                        <p className="text-white text-sm">{transcription.user}</p>
                                    </div>
                                )}
                                {transcription.model && (
                                    <div className="animate-in fade-in slide-in-from-left-2 transition-all">
                                        <span className="text-[10px] text-cyber-blue/40 uppercase tracking-widest block">AI_CORE</span>
                                        <p className="text-cyan-100 text-sm leading-relaxed">{transcription.model}</p>
                                    </div>
                                )}
                                {!transcription.user && !transcription.model && (
                                    <p className="text-center text-cyber-blue/20 text-xs italic mt-6 uppercase tracking-widest animate-pulse">
                                        {isActive ? 'System listening...' : 'Connection ended'}
                                    </p>
                                )}
                            </div>

                            {/* Volume bar */}
                            <div className="w-48 h-1.5 bg-cyber-dark rounded-full overflow-hidden mt-3 flex-shrink-0">
                                <div
                                    className={`h-full transition-all duration-100 rounded-full ${isModelSpeaking ? 'bg-cyber-blue' : 'bg-emerald-500'}`}
                                    style={{ width: `${Math.min(volume, 100)}%` }}
                                ></div>
                            </div>
                        </>
                    )}
                </div>

                {/* TERMINATE LINK button — always visible at bottom */}
                <div className="w-full px-10 pb-8 pt-2 flex-shrink-0">
                    <button onClick={onClose}
                        className="w-full group py-4 bg-red-950/40 border border-red-500/50 text-red-500 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all shadow-[0_0_20px_rgba(239,68,68,0.1)] flex items-center justify-center gap-4">
                        <PhoneOff size={22} className="group-hover:rotate-12 transition-transform" />
                        <span>Terminate Link</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LiveVoiceCall;
