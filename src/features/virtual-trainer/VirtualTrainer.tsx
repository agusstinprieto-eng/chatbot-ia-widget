import React, { useState, useRef, useEffect } from 'react';
import { BrainCircuit, BookOpen, Trophy, Send, User, Bot, Loader2, Sparkles, AlertTriangle, ShieldCheck, Copy, Trash2, FileDown } from 'lucide-react';
import { startVirtualTraining } from '../../services/ai/geminiService';
import { useLanguage } from '../../contexts/LanguageContext';
import { parseMessageContent } from '../../utils/markdown';

interface Message {
    id: string;
    role: 'user' | 'model';
    content: string;
    timestamp: Date;
}

const VirtualTrainer: React.FC = () => {
    const { language, t } = useLanguage();

    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'model',
            content: t('vt.welcome'),
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [topic, setTopic] = useState<string | null>(null);
    const [level, setLevel] = useState<'beginner' | 'intermediate' | 'expert'>('beginner');
    const [certificationProgress, setCertificationProgress] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const topics = [
        { id: 'as9100', name: 'AS9100 Rev D Compliance', icon: <ShieldCheck className="text-teal-400" /> },
        { id: 'safety', name: 'Industrial Safety Protocol', icon: <AlertTriangle className="text-amber-400" /> },
        { id: 'fod', name: 'FOD Prevention', icon: <Sparkles className="text-purple-400" /> }
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim() || !topic) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Convert messages to history format for API
            const history = messages.map(m => ({
                role: m.role,
                content: m.content
            }));

            const response = await startVirtualTraining(topic, level, [...history, { role: 'user', content: input }], language);

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                content: response.content || response, // Handle if response is object or string
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMsg]);

            // Simulate progress update based on interaction count (mock logic for now)
            setCertificationProgress(prev => Math.min(prev + 10, 100));

        } catch (error) {
            console.error(error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                content: language === 'es' ? "Error del Sistema: Conexión al Núcleo de Entrenamiento perdida. Inténtalo de nuevo." : "System Error: Connection to Training Core lost. Please try again.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    const startSession = (selectedTopic: string) => {
        setTopic(selectedTopic);
        const startMessage = language === 'es'
            ? `Iniciando módulo de entrenamiento ${selectedTopic} (Nivel: ${level.toUpperCase()}). Comencemos con lo básico. ¿Cuál es tu comprensión actual de este protocolo?`
            : `Initiating ${selectedTopic} training module (Level: ${level.toUpperCase()}). Let's start with the basics. What is your current understanding of this protocol?`;

        setMessages([{
            id: 'start',
            role: 'model',
            content: startMessage,
            timestamp: new Date()
        }]);
        setCertificationProgress(0);
    };

    const handleCopyMessage = (content: string) => {
        navigator.clipboard.writeText(content);
    };

    const handleDeleteMessage = (id: string) => {
        setMessages(prev => prev.filter(m => m.id !== id));
    };

    const handleClearHistory = () => {
        if (confirm(language === 'es' ? '¿Borrar todo el historial?' : 'Clear all history?')) {
            setMessages([]);
            setTopic(null);
            setCertificationProgress(0);
        }
    };

    const handleExportPDF = () => {
        // Create a simple text export (PDF generation without external library)
        const content = messages.map(m => {
            const role = m.role === 'user' ? (language === 'es' ? 'Usuario' : 'User') : (language === 'es' ? 'Instructor IA' : 'AI Instructor');
            const time = m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return `[${time}] ${role}:\n${m.content}\n`;
        }).join('\n---\n\n');

        const header = language === 'es'
            ? `AERO IA PRO - Sesión de Entrenamiento Virtual\nTema: ${topic}\nNivel: ${level}\nFecha: ${new Date().toLocaleDateString()}\n\n========================================\n\n`
            : `AERO IA PRO - Virtual Training Session\nTopic: ${topic}\nLevel: ${level}\nDate: ${new Date().toLocaleDateString()}\n\n========================================\n\n`;

        const fullContent = header + content;
        const blob = new Blob([fullContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aero-training-${topic}-${new Date().getTime()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="h-[calc(100vh-100px)] grid grid-cols-12 gap-6 p-6">
            {/* HUD / Sidebar */}
            <div className="col-span-12 lg:col-span-3 space-y-6">
                <div className="glass-panel p-6 rounded-2xl border border-teal-500/20 shadow-lg shadow-teal-500/10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-teal-500/10 rounded-xl">
                            <BrainCircuit className="text-teal-400 w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold font-tech text-white">VIRTUAL TRAINER</h2>
                            <p className="text-xs text-teal-400/70 font-mono tracking-widest">AI INSTRUCTOR BETA</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                            <p className="text-xs text-slate-400 font-bold uppercase mb-2">Certification Readiness</p>
                            <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-teal-600 to-emerald-400 transition-all duration-1000"
                                    style={{ width: `${certificationProgress}%` }}
                                />
                            </div>
                            <div className="flex justify-between mt-2 text-xs font-mono">
                                <span className="text-teal-400">{certificationProgress}%</span>
                                <span className="text-slate-500">TARGET: 100%</span>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                            <p className="text-xs text-slate-400 font-bold uppercase mb-3">Training Modules</p>
                            <div className="space-y-2">
                                {topics.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => startSession(t.id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${topic === t.id ? 'bg-teal-500/20 border border-teal-500/50 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
                                    >
                                        {t.icon}
                                        <span className="text-sm font-medium">{t.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                            <p className="text-xs text-slate-400 font-bold uppercase mb-3">Proficiency Level</p>
                            <div className="flex gap-2">
                                {(['beginner', 'intermediate', 'expert'] as const).map((l) => (
                                    <button
                                        key={l}
                                        onClick={() => setLevel(l)}
                                        className={`flex-1 py-2 text-[10px] uppercase font-bold rounded transition-colors ${level === l ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
                                    >
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="col-span-12 lg:col-span-9 flex flex-col glass-panel rounded-2xl border border-slate-700/50 overflow-hidden relative">
                {!topic ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                        <BookOpen className="w-24 h-24 text-teal-800/50 mb-6" />
                        <h3 className="text-2xl font-bold text-white mb-2">Ready to Train?</h3>
                        <p className="text-slate-400 max-w-md">Select a training module from the sidebar to initialize the AI Instructor protocol.</p>
                    </div>
                ) : (
                    <>
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-teal-900 scrollbar-track-transparent">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.role === 'model' && (
                                        <div className="min-w-[40px] h-10 w-10 rounded-full bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
                                            <Bot size={20} className="text-teal-400" />
                                        </div>
                                    )}

                                    <div className="flex-1 flex flex-col gap-2">
                                        <div className={`
                                            p-4 rounded-2xl text-sm leading-relaxed shadow-lg relative group
                                            ${msg.role === 'user'
                                                ? 'bg-gradient-to-br from-teal-600 to-teal-700 text-white rounded-tr-none'
                                                : 'bg-slate-800/80 text-slate-200 border border-slate-700 rounded-tl-none'}
                                        `}>
                                            <div
                                                className="whitespace-pre-wrap"
                                                dangerouslySetInnerHTML={{ __html: parseMessageContent(msg.content) }}
                                            />
                                            <div className="flex items-center justify-between mt-2 gap-2">
                                                <span className="text-[10px] opacity-50 font-mono">
                                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleCopyMessage(msg.content)}
                                                        className="p-1 hover:bg-slate-700/50 rounded transition-colors"
                                                        title={language === 'es' ? 'Copiar' : 'Copy'}
                                                    >
                                                        <Copy size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteMessage(msg.id)}
                                                        className="p-1 hover:bg-red-500/20 rounded transition-colors text-red-400"
                                                        title={language === 'es' ? 'Eliminar' : 'Delete'}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {msg.role === 'user' && (
                                        <div className="min-w-[40px] h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
                                            <User size={20} className="text-slate-300" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-slate-900/80 border-t border-slate-700">
                            <div className="flex justify-end gap-2 mb-2">
                                <button
                                    onClick={handleExportPDF}
                                    disabled={messages.length === 0}
                                    className="text-xs px-3 py-1 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FileDown size={12} />
                                    {language === 'es' ? 'Exportar Chat' : 'Export Chat'}
                                </button>
                                <button
                                    onClick={handleClearHistory}
                                    className="text-xs px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors flex items-center gap-1"
                                >
                                    <Trash2 size={12} />
                                    {language === 'es' ? 'Borrar Historial' : 'Clear History'}
                                </button>
                            </div>
                            <div className="flex gap-4 max-w-4xl mx-auto items-end">
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    placeholder="Type your response or ask a question..."
                                    className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl p-4 min-h-[60px] max-h-[120px] resize-none text-slate-200 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all placeholder-slate-500"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={loading || !input.trim()}
                                    className="h-[60px] px-6 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-bold transition-all flex items-center justify-center"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : <Send />}
                                </button>
                            </div>
                            <p className="text-center text-[10px] text-slate-500 mt-2 font-mono">
                                Aero IA Virtual Trainer // Confidential Training Data
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default VirtualTrainer;
