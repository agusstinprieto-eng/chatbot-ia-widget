import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Sparkles, Loader2, Maximize2, Minimize2, Trash2, ExternalLink, Copy, Check } from 'lucide-react';
import { chatWithAi, ChatMessage } from '../../services/chatbotService';

interface AgusProChatProps {
    tenantId: string;
    agentName?: string;
    primaryColor?: string;
    isWidget?: boolean;
    defaultOpen?: boolean;
}

const AgusProChat: React.FC<AgusProChatProps> = ({ 
    tenantId, 
    agentName = 'Valentina',
    primaryColor = '#0f172a',
    isWidget = false,
    defaultOpen = false
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    
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

    const processInline = (lineText: string) => {
        // Linkify URLs that are not already in markdown format
        let text = lineText;
        
        // Handle markdown links first: [text](url)
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '%%LINK_S%%$1%%LINK_M%%$2%%LINK_E%%');
        
        // Handle plain URLs: https://...
        text = text.replace(/(?<!\()https?:\/\/[^\s)]+/g, (url) => {
            return `%%URL_S%%${url}%%URL_E%%`;
        });

        // Handle Pricing: $1,000 MXN or similar
        text = text.replace(/(\$\d{1,3}(?:,\d{3})*(?:\.\d+)?(?:\s*MXN)?\s*\*?)/g, '%%PRICE_S%%$1%%PRICE_E%%');

        // Handle Citations: [1], [2]
        text = text.replace(/\[(\d+)\]/g, '%%CITE_S%%$1%%CITE_E%%');

        // Handle Bold/Strong (support both ** and *)
        text = text.replace(/\*\*([^*]+)\*\*/g, '%%BOLD_S%%$1%%BOLD_E%%');
        text = text.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '%%BOLD_S%%$1%%BOLD_E%%');

        // Handle Inline Code
        text = text.replace(/`([^`]+)`/g, '%%CODE_S%%$1%%CODE_E%%');

        const parts = text.split(/(%%LINK_S%%.*?%%LINK_E%%|%%URL_S%%.*?%%URL_E%%|%%PRICE_S%%.*?%%PRICE_E%%|%%CITE_S%%.*?%%CITE_E%%|%%BOLD_S%%.*?%%BOLD_E%%|%%CODE_S%%.*?%%CODE_E%%)/g);
        
        return parts.map((part, idx) => {
            if (part.startsWith('%%LINK_S%%')) {
                const m = part.match(/%%LINK_S%%(.*?)%%LINK_M%%(.*?)%%LINK_E%%/);
                if (m) return (
                    <a key={idx} href={m[2]} target="_blank" rel="noopener noreferrer" 
                       className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 rounded-md text-blue-400 font-medium hover:bg-blue-500/20 transition-all no-underline">
                        {m[1]} <ExternalLink size={10} />
                    </a>
                );
            }
            if (part.startsWith('%%URL_S%%')) {
                const url = part.slice(9, -9);
                const displayUrl = url.length > 30 ? url.substring(0, 27) + '...' : url;
                return (
                    <a key={idx} href={url} target="_blank" rel="noopener noreferrer" 
                       className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-700/30 border border-slate-600/30 rounded-md text-cyan-400 font-medium hover:bg-slate-700/50 transition-all no-underline">
                        {displayUrl} <ExternalLink size={10} />
                    </a>
                );
            }
            if (part.startsWith('%%PRICE_S%%')) {
                return <span key={idx} className="inline-block px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 font-bold rounded border border-emerald-500/20">{part.slice(10, -10)}</span>;
            }
            if (part.startsWith('%%CITE_S%%')) {
                return <span key={idx} className="inline-flex items-center justify-center w-4 h-4 text-[9px] bg-blue-600 text-white rounded-full font-bold align-top ml-0.5">{part.slice(9, -9)}</span>;
            }
            if (part.startsWith('%%BOLD_S%%')) {
                return <strong key={idx} className="text-white font-bold tracking-tight">{part.slice(9, -9)}</strong>;
            }
            if (part.startsWith('%%CODE_S%%')) {
                return <code key={idx} className="bg-slate-800 px-1.5 py-0.5 rounded text-pink-400 font-mono text-[11px] border border-slate-700">{part.slice(9, -9)}</code>;
            }
            return part;
        });
    };

    const formatMessage = (text: string) => {
        if (!text) return null;
        const lines = text.split('\n');
        const elements: React.ReactNode[] = [];
        let inCodeBlock = false;
        let codeContent = '';
        let codeLang = '';
        let inTable = false;
        let tableHeaders: string[] = [];
        let tableRows: string[][] = [];

        const flushTable = () => {
            if (tableHeaders.length === 0) return;
            elements.push(
                <div key={`tbl-${elements.length}`} className="overflow-x-auto my-3 rounded-xl border border-slate-700/50">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="bg-slate-800/80">
                                {tableHeaders.map((h, hi) => (
                                    <th key={hi} className="px-4 py-2.5 text-left font-bold text-blue-300 uppercase tracking-wider whitespace-nowrap">{h.trim()}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tableRows.map((row, ri) => (
                                <tr key={ri} className={ri % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-900/20'}>
                                    {row.map((cell, ci) => (
                                        <td key={ci} className="px-4 py-2 text-slate-300 border-t border-slate-800/50">{cell.trim()}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
            tableHeaders = [];
            tableRows = [];
            inTable = false;
        };

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (line.trim().startsWith('```')) {
                if (inCodeBlock) {
                    elements.push(
                        <div key={`code-${elements.length}`} className="relative group my-3">
                            <pre className="bg-slate-900/90 p-4 rounded-xl overflow-x-auto border border-slate-800 shadow-inner">
                                {codeLang && <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center justify-between">
                                    <span>{codeLang}</span>
                                </div>}
                                <code className="text-slate-300 font-mono text-xs leading-relaxed block whitespace-pre">{codeContent}</code>
                            </pre>
                            <button 
                                onClick={() => navigator.clipboard.writeText(codeContent)}
                                className="absolute top-3 right-3 p-1.5 bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all border border-slate-700"
                                title="Copiar código"
                            >
                                <Copy size={12} />
                            </button>
                        </div>
                    );
                    codeContent = '';
                    codeLang = '';
                    inCodeBlock = false;
                } else {
                    inCodeBlock = true;
                    codeLang = line.trim().slice(3).trim();
                }
                continue;
            }

            if (inCodeBlock) {
                codeContent += (codeContent ? '\n' : '') + line;
                continue;
            }

            if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
                const cells = line.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
                if (cells.every(c => /^[\s:-]+$/.test(c.trim()))) continue;
                if (!inTable) { inTable = true; tableHeaders = cells; tableRows = []; }
                else { tableRows.push(cells); }
                continue;
            } else if (inTable) flushTable();

            if (/^[-*_]{3,}$/.test(line.trim())) {
                elements.push(<hr key={`hr-${elements.length}`} className="my-4 border-slate-700/50" />);
                continue;
            }

            if (line.trim().startsWith('> ')) {
                elements.push(
                    <div key={`qt-${elements.length}`} className="border-l-2 border-blue-500/50 pl-4 my-2 italic text-slate-400 text-xs">
                        {processInline(line.trim().substring(2))}
                    </div>
                );
                continue;
            }

            const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
            if (numMatch) {
                elements.push(
                    <div key={`nl-${elements.length}`} className="flex gap-2 ml-3 mb-1">
                        <span className="text-blue-400 font-bold shrink-0 text-xs">{numMatch[1]}.</span>
                        <span className="text-xs">{processInline(numMatch[2])}</span>
                    </div>
                );
                continue;
            }

            if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                const indent = line.search(/\S/);
                elements.push(
                    <div key={`ul-${elements.length}`} className="flex gap-2 ml-3 mb-1" style={{ paddingLeft: indent > 0 ? `${indent * 8}px` : undefined }}>
                        <span className="text-blue-400 mt-0.5 shrink-0">•</span>
                        <span className="text-xs">{processInline(line.trim().substring(2))}</span>
                    </div>
                );
                continue;
            }

            if (line.trim().startsWith('### ')) {
                elements.push(<h4 key={`h4-${elements.length}`} className="text-sm font-bold text-cyan-400 mt-2 mb-1">{processInline(line.trim().substring(4))}</h4>);
                continue;
            }
            if (line.trim().startsWith('## ')) {
                elements.push(<h3 key={`h3-${elements.length}`} className="text-base font-bold text-blue-400 mt-2 mb-1">{processInline(line.trim().substring(3))}</h3>);
                continue;
            }
            if (line.trim().startsWith('# ')) {
                elements.push(<h2 key={`h2-${elements.length}`} className="text-lg font-bold text-white mt-3 mb-2">{processInline(line.trim().substring(2))}</h2>);
                continue;
            }

            if (!line.trim()) {
                elements.push(<div key={`sp-${elements.length}`} className="h-2" />);
                continue;
            }

            elements.push(<div key={`p-${elements.length}`} className="mb-3 text-[13px] last:mb-0 leading-relaxed text-slate-300">{processInline(line)}</div>);
        }

        if (inCodeBlock) {
            elements.push(
                <pre key={`code-${elements.length}`} className="bg-slate-900/80 p-4 rounded-xl my-2 overflow-x-auto border border-slate-700/50">
                    {codeLang && <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">{codeLang}</div>}
                    <code className="text-slate-200 font-mono text-xs leading-relaxed block whitespace-pre">{codeContent}</code>
                </pre>
            );
        }

        if (inTable) flushTable();
        return elements;
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
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.3, delay: i * 0.05 }}
                                    key={i}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-start gap-3`}
                                >
                                    {msg.role === 'model' && (
                                        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shrink-0 border border-slate-800 shadow-lg shadow-blue-500/10">
                                            <Bot size={14} className="text-blue-400" />
                                        </div>
                                    )}
                                    <div className={`max-w-[85%] rounded-2xl p-5 shadow-2xl transition-all hover:shadow-blue-500/5 ${
                                        msg.role === 'user'
                                        ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-tr-none shadow-blue-600/20 border border-blue-500/30'
                                        : 'bg-slate-900/70 backdrop-blur-xl text-slate-200 border border-slate-800/50 rounded-tl-none ring-1 ring-white/5'
                                    }`}>
                                        <div className="space-y-3 leading-relaxed text-[14px]">
                                            {formatMessage(msg.content)}
                                        </div>
                                    </div>
                                    {msg.role === 'user' && (
                                        <div className="w-8 h-8 rounded-lg bg-blue-900/30 flex items-center justify-center shrink-0 border border-blue-500/20">
                                            <User size={14} className="text-blue-200" />
                                        </div>
                                    )}
                                </motion.div>
                            ))}

                            {isLoading && (
                                <div className="flex justify-start items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shrink-0 border border-slate-800 shadow-lg shadow-blue-500/10">
                                        <Bot size={14} className="text-blue-400" />
                                    </div>
                                    <div className="bg-slate-900/50 backdrop-blur-md text-slate-400 border border-slate-800/50 rounded-2xl rounded-tl-none p-4 flex items-center gap-3">
                                        <Loader2 size={16} className="animate-spin text-blue-500" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest italic text-blue-400/70">
                                            {agentName} está procesando...
                                        </span>
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
