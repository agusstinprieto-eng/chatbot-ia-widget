
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Sparkles, Loader2, Maximize2, Minimize2, Trash2 } from 'lucide-react';
import { chatWithAi, ChatMessage } from '../../services/chatbotService';

interface AgusProChatProps {
    tenantId: string;
    agentName?: string;
    primaryColor?: string;
    isWidget?: boolean;
}

const AgusProChat: React.FC<AgusProChatProps> = ({ 
    tenantId, 
    agentName = 'Valentina',
    primaryColor = '#0f172a',
    isWidget = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    
    // Notify parent window of state changes (for iframes)
    useEffect(() => {
        if (isWidget) {
            const message = isOpen ? 'agus-chat-open' : 'agus-chat-close';
            window.parent.postMessage(message, '*');
        }
    }, [isOpen, isWidget]);
    const [isMaximized, setIsMaximized] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const CHAT_HISTORY_KEY = `agus_pro_chat_history_${tenantId}`;

    // Load history
    useEffect(() => {
        const saved = localStorage.getItem(CHAT_HISTORY_KEY);
        if (saved) {
            try {
                setMessages(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load chat history", e);
            }
        }
    }, [tenantId]);

    // Save history
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
        }
    }, [messages]);

    // Scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: ChatMessage = { role: 'user', content: input.trim() };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const response = await chatWithAi(tenantId, userMsg.content, messages);
            const botMsg: ChatMessage = { role: 'model', content: response.result };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("Chat error:", error);
            const errorMsg: ChatMessage = { 
                role: 'model', 
                content: "Lo siento, tuve un problema al procesar tu solicitud. ¿Podrías intentarlo de nuevo? 🚀" 
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearHistory = () => {
        if (window.confirm('¿Deseas borrar el historial de chat?')) {
            setMessages([]);
            localStorage.removeItem(CHAT_HISTORY_KEY);
        }
    };

    return (
        <div className={`${isWidget ? 'relative h-screen w-screen flex flex-col items-end justify-end p-4' : 'fixed bottom-6 right-6 z-[9999]'} font-sans`}>
            {/* Chat Trigger Button */}
            <AnimatePresence mode="wait">
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(true)}
                        className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 shadow-[0_0_20px_rgba(30,58,138,0.3)] flex items-center justify-center text-white relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 group-hover:opacity-100 transition-opacity opacity-0" />
                        <MessageCircle size={28} />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-slate-950 animate-pulse" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ y: 100, opacity: 0, scale: 0.9 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 100, opacity: 0, scale: 0.9 }}
                        className={`${
                            isMaximized 
                            ? (isWidget ? 'fixed inset-0 z-50' : 'fixed inset-4 md:inset-10')
                            : (isWidget ? 'w-full h-full' : 'w-[90vw] md:w-[420px] h-[600px]')
                        } bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden`}
                    >
                        {/* Header */}
                        <div className="p-5 border-b border-slate-800/50 bg-slate-900/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <Bot size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm tracking-tight">{agentName}</h3>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">En línea</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => setIsMaximized(!isMaximized)}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                                </button>
                                <button 
                                    onClick={clearHistory}
                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                                    title="Borrar historial"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div 
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
                        >
                            {messages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-blue-500 mb-2">
                                        <Sparkles size={32} />
                                    </div>
                                    <h4 className="text-white font-bold">¿Cómo puedo ayudarte hoy?</h4>
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                        Soy tu asistente inteligente de {
                                            tenantId === 'ia-agus' ? 'IA.AGUS' : 
                                            tenantId === 'mcvill' ? 'McVILL' : 
                                            tenantId === 'tiendasfull' ? 'Tiendas Full' : tenantId
                                        }. Pregúntame lo que necesites.
                                    </p>
                                </div>
                            )}

                            {messages.map((msg, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={i}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-start gap-3`}
                                >
                                    {msg.role === 'model' && (
                                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                                            <Bot size={14} className="text-blue-400" />
                                        </div>
                                    )}
                                    <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                                        msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-600/10'
                                        : 'bg-slate-800/50 text-slate-200 border border-slate-700/50 rounded-tl-none'
                                    }`}>
                                        {msg.content}
                                    </div>
                                    {msg.role === 'user' && (
                                        <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center shrink-0 border border-slate-600">
                                            <User size={14} className="text-slate-300" />
                                        </div>
                                    )}
                                </motion.div>
                            ))}

                            {isLoading && (
                                <div className="flex justify-start items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                                        <Bot size={14} className="text-blue-400" />
                                    </div>
                                    <div className="bg-slate-800/50 text-slate-400 border border-slate-700/50 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
                                        <Loader2 size={16} className="animate-spin" />
                                        <span className="text-xs font-bold uppercase tracking-widest italic">{agentName} está escribiendo...</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-5 border-t border-slate-800/50 bg-slate-900/30">
                            <div className="relative flex items-center gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Escribe un mensaje..."
                                    className="flex-1 bg-slate-800/50 border border-slate-700 text-white rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className="absolute right-1.5 p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-lg transition-all shadow-lg shadow-blue-600/20"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                            <p className="text-[9px] text-slate-500 text-center mt-3 font-bold uppercase tracking-widest opacity-50">
                                AGUS PRO AI HUB • v2.5 LITE
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AgusProChat;
