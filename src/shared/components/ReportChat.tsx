
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Maximize2, Minimize2, Copy, FileText, Search, Headphones, Loader2, Sparkles, User, Download, Check, Trash2 } from 'lucide-react';
import { chatWithReport } from '../../services/ai/geminiService';
import LiveVoiceCall from './LiveVoiceCall';
import { jsPDF } from 'jspdf';

interface Message {
    role: 'user' | 'model';
    content: string;
}

interface ReportChatProps {
    analysisContext: string;
    language: 'es' | 'en';
}

const ReportChat: React.FC<ReportChatProps> = ({ analysisContext, language }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [isLiveCallOpen, setIsLiveCallOpen] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [isGroundingEnabled, setIsGroundingEnabled] = useState(false);
    const [searchCount, setSearchCount] = useState(0);

    const STORAGE_KEY = 'aero_search_limit';

    // Daily Limit Logic
    useEffect(() => {
        const storedData = localStorage.getItem(STORAGE_KEY);
        const today = new Date().toISOString().split('T')[0];

        if (storedData) {
            const { date, count } = JSON.parse(storedData);
            if (date === today) {
                setSearchCount(count);
            } else {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: 0 }));
                setSearchCount(0);
            }
        } else {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: 0 }));
        }
    }, []);

    const incrementSearchCount = () => {
        const today = new Date().toISOString().split('T')[0];
        const newCount = searchCount + 1;
        setSearchCount(newCount);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: newCount }));
    };

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await chatWithReport(
                analysisContext,
                input,
                messages,
                language,
                'aerospace',
                isGroundingEnabled
            );

            if (isGroundingEnabled) {
                incrementSearchCount();
            }

            setMessages(prev => [...prev, { role: 'model', content: response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', content: 'SYSTEM_ERROR: Parallel processing failure.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const clearHistory = () => {
        if (window.confirm('Delete all messages from this session?')) {
            setMessages([]);
        }
    };

    const removeMessage = (index: number) => {
        setMessages(prev => prev.filter((_, i) => i !== index));
    };

    const formatMessage = (text: string) => {
        if (!text) return null;

        const processInline = (lineText: string) => {
            // Match *text* (single asterisk)
            const parts = lineText.split(/(\*.*?\*)/g);
            return parts.map((part, i) => {
                if (part.startsWith('*') && part.endsWith('*')) {
                    return (
                        <strong
                            key={i}
                            className="text-cyber-blue font-black drop-shadow-[0_0_8px_rgba(0,240,255,0.4)] px-1"
                        >
                            {part.slice(1, -1)}
                        </strong>
                    );
                }
                return part;
            });
        };

        return text.split('\n').map((line, idx) => {
            // Handle Numbered Ideas/Lists (e.g., "1. Idea name")
            const numberedMatch = line.match(/^(\d+\.\s)(.*)/);
            if (numberedMatch) {
                return (
                    <div key={idx} className="mb-6 animate-in slide-in-from-left duration-300">
                        <span className="text-cyber-blue font-black mr-2 text-sm">{numberedMatch[1]}</span>
                        <span className="text-white/95 leading-relaxed">{processInline(numberedMatch[2])}</span>
                    </div>
                );
            }

            // Handle Bullet points (using * or -)
            if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
                const listContent = line.trim().substring(2);
                return (
                    <div key={idx} className="flex gap-2 ml-4 mb-3">
                        <span className="text-cyber-blue text-lg">•</span>
                        <span className="text-white/90 leading-relaxed">{processInline(listContent)}</span>
                    </div>
                );
            }

            // Empty lines as spaces
            if (!line.trim()) return <div key={idx} className="h-6"></div>;

            // Normal text
            return <p key={idx} className="text-white/90 mb-4 leading-relaxed">{processInline(line)}</p>;
        });
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        const addHeader = (pdf: jsPDF) => {
            // Header Bar
            pdf.setFillColor(10, 15, 20); // Dark background
            pdf.rect(0, 0, pageWidth, 28, 'F');

            // Accent Line
            pdf.setFillColor(0, 240, 255); // Cyber Blue
            pdf.rect(0, 27, pageWidth, 1, 'F');

            // Logo Text
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(18);
            pdf.setTextColor(255, 255, 255);
            pdf.text('AERO IA', 20, 18);

            pdf.setFontSize(8);
            pdf.setTextColor(0, 240, 255);
            pdf.text('PRO INDUSTRIAL ANALYST', 20, 23);

            // Confidential Label (Center)
            pdf.setFontSize(8);
            pdf.setTextColor(255, 80, 80); // Alert Red
            pdf.text('CONFIDENTIAL REPORT // PROTOCOL_SECURED', pageWidth / 2, 18, { align: 'center' });

            // System Status (Right)
            pdf.setFontSize(7);
            pdf.setTextColor(150, 150, 150);
            pdf.text('ENVIRONMENT: AERO_IA_PRO_MAIN', pageWidth - 20, 14, { align: 'right' });
            pdf.text('PROTOCOL: AS9100_REV_D_ACTIVE', pageWidth - 20, 18, { align: 'right' });
            pdf.text(`TS_EXPORT: ${new Date().toISOString()}`, pageWidth - 20, 22, { align: 'right' });
        };

        const addFooter = (pdf: jsPDF, pageNum: number, totalPages: number) => {
            const footerY = pageHeight - 10;

            // Background Strip
            pdf.setFillColor(5, 10, 15);
            pdf.rect(0, pageHeight - 18, pageWidth, 18, 'F');

            // Divider Line
            pdf.setDrawColor(0, 240, 255);
            pdf.setLineWidth(0.5);
            pdf.line(20, pageHeight - 18, pageWidth - 20, pageHeight - 18);

            pdf.setFontSize(8);
            pdf.setTextColor(100, 116, 139);

            // Left: Branding
            pdf.setFont('helvetica', 'bold');
            pdf.text('IA.AGUS INDUSTRIAL ENGINEERING', 20, footerY);

            // Center: Page count
            pdf.setFont('helvetica', 'normal');
            pdf.text(`REPORT PAGE ${pageNum} / ${totalPages}`, pageWidth / 2, footerY, { align: 'center' });

            // Right: URL
            pdf.setTextColor(0, 240, 255);
            pdf.text('WWW.IA-AGUS.COM', pageWidth - 20, footerY, { align: 'right' });
        };

        // First Page Header
        addHeader(doc);

        const maxContentY = pageHeight - 40; // Safer zone before footer
        let y = 35;

        // Content Font Setup (Critical for accurate splitTextToSize)
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(30, 40, 50);

        let isBold = false; // Persistent state for bolding across messages/lines

        messages.forEach((msg, index) => {
            if (!msg.content.trim()) return;

            const role = msg.role === 'user' ? 'USUARIO' : 'AERO IA PRO';

            // Re-sync font state for this message block calculation
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);

            const lines = doc.splitTextToSize(msg.content, pageWidth - 50);

            // Filter consecutive empty lines
            const filteredLines: string[] = [];
            let emptyCount = 0;
            lines.forEach((l: string) => {
                if (!l.trim()) {
                    emptyCount++;
                    if (emptyCount <= 1) filteredLines.push(l);
                } else {
                    emptyCount = 0;
                    filteredLines.push(l);
                }
            });

            // Check if we need a new page for the role header
            if (y + 25 > maxContentY) {
                doc.addPage();
                addHeader(doc);
                y = 35;
            }

            // Role Header
            doc.setFillColor(msg.role === 'user' ? 245 : 240);
            doc.rect(20, y, pageWidth - 40, 8, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(msg.role === 'user' ? 80 : 0, msg.role === 'user' ? 80 : 150, msg.role === 'user' ? 180 : 200);
            doc.text(`${role}`, 25, y + 5.5);
            y += 12;

            // Content - Process line by line for precise pagination and rich text
            doc.setFontSize(10);
            doc.setTextColor(30, 40, 50);

            filteredLines.forEach((line: string) => {
                if (y > maxContentY) {
                    doc.addPage();
                    addHeader(doc);
                    y = 35;
                    doc.setFontSize(10);
                    doc.setTextColor(30, 40, 50);
                }

                // Stateful Rich Line Rendering
                const segments = line.split(/(\*)/g);
                let currentX = 25;

                segments.forEach(segment => {
                    if (segment === '*') {
                        isBold = !isBold;
                        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
                    } else if (segment) {
                        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
                        doc.text(segment, currentX, y);
                        currentX += doc.getTextWidth(segment);
                    }
                });

                y += 6;
            });

            isBold = false; // Reset for next message
            y += 8; // Spacing between messages
        });

        // Add Footers to all pages
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            addFooter(doc, i, totalPages);
        }

        doc.save(`Aero_Analysis_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className={`glass-panel rounded-2xl border-cyber-blue/20 flex flex-col transition-all duration-500 overflow-hidden ${isMaximized
                ? 'fixed inset-4 z-50'
                : 'h-[calc(100vh-12rem)] min-h-[600px] shadow-2xl'
            }`}>
            {/* Chat Header */}
            <div className="px-4 py-3 bg-cyber-dark/80 border-b border-cyber-blue/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyber-blue/10 flex items-center justify-center border border-cyber-blue/30 shadow-neon-blue">
                        <Sparkles size={16} className="text-cyber-blue" />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                            Aero AI Analyst
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </h3>
                        <p className="text-[10px] text-cyber-blue/40 font-mono">READY // MULTI_MODAL_LINK</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={exportToPDF}
                        disabled={messages.length === 0}
                        className="p-2 text-cyber-blue/40 hover:text-cyber-blue hover:bg-cyber-blue/5 rounded transition-all disabled:opacity-20"
                        title="Export Conversation to PDF"
                    >
                        <Download size={14} />
                    </button>
                    <button
                        onClick={clearHistory}
                        disabled={messages.length === 0}
                        className="p-2 text-cyber-blue/40 hover:text-red-400 hover:bg-red-400/5 rounded transition-all disabled:opacity-20"
                        title="Clear Chat History"
                    >
                        <Trash2 size={14} />
                    </button>
                    <button onClick={() => setIsMaximized(!isMaximized)} className="p-2 text-cyber-blue/40 hover:text-cyber-blue hover:bg-cyber-blue/5 rounded transition-all">
                        {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </button>
                </div>
            </div>

            {/* Chat Body */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-cyber-black/30">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 opacity-40">
                        <div className="p-4 rounded-full border border-cyber-blue/20">
                            <Search size={32} className="text-cyber-blue" />
                        </div>
                        <p className="text-xs font-mono uppercase tracking-[0.2em] text-cyber-blue max-w-xs">
                            Establish communication link to start analysis...
                        </p>
                    </div>
                )}
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}>
                        <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${msg.role === 'user' ? 'bg-cyber-purple/10 border-cyber-purple/30' : 'bg-cyber-blue/10 border-cyber-blue/30'}`}>
                                {msg.role === 'user' ? <User size={14} className="text-cyber-purple" /> : <Sparkles size={14} className="text-cyber-blue" />}
                            </div>
                            <div className={`group relative p-3 rounded-2xl text-xs leading-relaxed ${msg.role === 'user' ? 'bg-cyber-purple/10 text-white rounded-tr-none border border-cyber-purple/20' : 'bg-cyber-dark/80 text-cyan-50 border border-cyber-blue/10 rounded-tl-none shadow-sm'}`}>
                                {formatMessage(msg.content)}
                                <div className="flex gap-1 absolute -bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => copyToClipboard(msg.content, i)}
                                        className="bg-cyber-dark border border-white/10 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                                        title="Copy Message"
                                    >
                                        {copiedIndex === i ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} className="text-cyber-blue/60" />}
                                    </button>
                                    <button
                                        onClick={() => removeMessage(i)}
                                        className="bg-cyber-dark border border-white/10 p-1.5 rounded-lg hover:text-red-400 hover:bg-red-400/10 transition-colors"
                                        title="Remove Message"
                                    >
                                        <Trash2 size={10} className="text-cyber-blue/40 hover:text-red-400" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start animate-pulse">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-cyber-blue/10 flex items-center justify-center border border-cyber-blue/30">
                                <Loader2 size={14} className="text-cyber-blue animate-spin" />
                            </div>
                            <div className="px-4 py-2 bg-cyber-dark/50 rounded-2xl rounded-tl-none border border-cyber-blue/10">
                                <span className="text-[10px] font-mono text-cyber-blue/40 tracking-widest uppercase italic">Processing...</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Chat Input Area */}
            <div className="p-4 bg-cyber-dark/80 border-t border-cyber-blue/10 space-y-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsLiveCallOpen(true)}
                        className="p-3 bg-cyber-blue text-black rounded-xl hover:bg-white transition-all shadow-neon-blue group relative"
                        title="Live Voice Call"
                    >
                        <Headphones size={20} className="group-hover:scale-110 transition-transform" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-cyber-dark animate-ping" />
                    </button>

                    {/* Grounding Toggle */}
                    <button
                        onClick={() => searchCount < 50 && setIsGroundingEnabled(!isGroundingEnabled)}
                        disabled={searchCount >= 50}
                        className={`p-3 rounded-xl flex flex-col items-center justify-center transition-all border ${isGroundingEnabled
                            ? 'bg-amber-500 border-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                            : 'bg-cyber-dark/80 border-white/10 text-white/40 hover:border-amber-500/50 hover:text-amber-500'
                            } disabled:opacity-20 disabled:grayscale`}
                        title={language === 'es' ? `Búsqueda en Internet (${50 - searchCount} restantes)` : `Web Search (${50 - searchCount} left)`}
                    >
                        <Search size={18} className={`${isGroundingEnabled ? 'animate-pulse' : ''}`} />
                        <span className="text-[7px] font-black uppercase mt-0.5 leading-none">{searchCount}/50</span>
                    </button>

                    <div className="flex-1 relative group">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type command or query..."
                            className="w-full bg-cyber-black/50 border border-cyber-blue/20 rounded-xl py-3 pl-4 pr-12 text-xs text-white placeholder:text-cyber-blue/20 outline-none focus:border-cyber-blue/50 transition-all font-mono"
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-cyber-blue/40 hover:text-cyber-blue disabled:opacity-30 transition-all"
                        >
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between px-1">
                    <div className="flex gap-4">
                        <button className="text-[10px] font-mono text-cyber-blue/30 hover:text-cyber-blue transition-colors flex items-center gap-1">
                            <FileText size={10} />
                            SAVE_LOGS
                        </button>
                        <div className={`text-[10px] font-mono flex items-center gap-1 ${isGroundingEnabled ? 'text-amber-500 shadow-neon-amber' : 'text-cyber-blue/30'}`}>
                            <Search size={10} />
                            {isGroundingEnabled ? 'WEB_LINK_ACTIVE' : 'WEB_LINK_IDLE'}
                        </div>
                    </div>
                    <span className="text-[8px] font-mono text-cyber-blue/20 uppercase tracking-widest">v0.8.6 // IA.AGUS</span>
                </div>
            </div>

            <LiveVoiceCall
                isOpen={isLiveCallOpen}
                onClose={() => setIsLiveCallOpen(false)}
                language={language}
                systemInstruction={`You are the Aero AI Assistant for Aero IA Pro. Context: ${analysisContext}`}
                unlimited={true}
            />
        </div>
    );
};

export default ReportChat;
