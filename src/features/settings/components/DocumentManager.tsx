
import React, { useState, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle2, Loader2, Database, AlertCircle, FileSpreadsheet, File as FileIcon } from 'lucide-react';

interface Document {
    id: string;
    name: string;
    size: string;
    type: string;
    status: 'uploading' | 'indexing' | 'active' | 'error';
    progress: number;
}

const DocumentManager: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (type: string) => {
        if (type.includes('pdf')) return <FileText className="text-red-400" />;
        if (type.includes('sheet') || type.includes('excel') || type.includes('csv')) return <FileSpreadsheet className="text-emerald-400" />;
        return <FileIcon className="text-blue-400" />;
    };

    const simulateUpload = (newDoc: Document) => {
        // Step 1: Uploading
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setDocuments(prev => prev.map(doc =>
                    doc.id === newDoc.id ? { ...doc, progress: 100, status: 'indexing' } : doc
                ));

                // Step 2: Indexing simulation
                setTimeout(() => {
                    setDocuments(prev => prev.map(doc =>
                        doc.id === newDoc.id ? { ...doc, status: 'active' } : doc
                    ));
                }, 3000);
            }
            setDocuments(prev => prev.map(doc =>
                doc.id === newDoc.id ? { ...doc, progress } : doc
            ));
        }, 400);
    };

    const handleFiles = (files: FileList) => {
        const newDocs: Document[] = Array.from(files).map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: formatSize(file.size),
            type: file.type,
            status: 'uploading',
            progress: 0
        }));

        setDocuments(prev => [...newDocs, ...prev]);
        newDocs.forEach(simulateUpload);
    };

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            handleFiles(e.dataTransfer.files);
        }
    }, []);

    const removeDoc = (id: string) => {
        setDocuments(prev => prev.filter(doc => doc.id !== id));
    };

    return (
        <div className="space-y-6">
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                className={`border-2 border-dashed rounded-2xl p-8 transition-all text-center group cursor-pointer
                    ${isDragging ? 'border-cyber-blue bg-cyber-blue/5' : 'border-cyber-blue/20 hover:border-cyber-blue/40 bg-black/20'}`}
            >
                <input
                    type="file"
                    multiple
                    className="hidden"
                    id="doc-upload"
                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                />
                <label htmlFor="doc-upload" className="cursor-pointer">
                    <div className="w-16 h-16 bg-cyber-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="text-cyber-blue" size={32} />
                    </div>
                    <h4 className="font-tech text-white text-lg mb-2">INDEXAR DOCUMENTACIÓN TÉCNICA</h4>
                    <p className="text-cyber-blue/50 text-xs font-mono uppercase tracking-widest">
                        PDF, DOCX, XLSX o TXT · Arrastre archivos aquí
                    </p>
                </label>
            </div>

            {documents.length > 0 && (
                <div className="glass-panel rounded-2xl border border-cyber-blue/10 overflow-hidden">
                    <div className="bg-cyber-blue/5 px-6 py-3 border-b border-cyber-blue/10 flex justify-between items-center">
                        <span className="text-[10px] font-tech text-cyber-blue uppercase tracking-widest">Archivos en Base de Conocimiento</span>
                        <span className="text-[10px] font-mono text-cyber-blue/40">{documents.length} DOCUMENTOS</span>
                    </div>
                    <div className="divide-y divide-cyber-blue/5">
                        {documents.map(doc => (
                            <div key={doc.id} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors group">
                                <div className="p-2 bg-black/40 rounded-lg">
                                    {getFileIcon(doc.type)}
                                </div>
                                <div className="flex-grow min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h5 className="text-sm font-tech text-white truncate pr-4">{doc.name}</h5>
                                        <button
                                            onClick={() => removeDoc(doc.id)}
                                            className="text-cyber-blue/30 hover:text-red-400 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] font-mono text-cyber-blue/50 uppercase">
                                        <span>{doc.size}</span>
                                        <span>•</span>
                                        <span className={`flex items-center gap-1 ${doc.status === 'active' ? 'text-emerald-400' :
                                                doc.status === 'error' ? 'text-red-400' : 'text-cyber-blue'
                                            }`}>
                                            {doc.status === 'uploading' && <Loader2 size={10} className="animate-spin" />}
                                            {doc.status === 'indexing' && <Database size={10} className="animate-pulse" />}
                                            {doc.status === 'active' && <CheckCircle2 size={10} />}
                                            {doc.status === 'error' && <AlertCircle size={10} />}
                                            {doc.status === 'uploading' ? `Cargando ${Math.round(doc.progress)}%` :
                                                doc.status === 'indexing' ? 'Indexando en Vector DB' :
                                                    doc.status === 'active' ? 'Sincronizado con IA' : 'Error de carga'}
                                        </span>
                                    </div>
                                    {doc.status === 'uploading' && (
                                        <div className="w-full h-1 bg-black/40 rounded-full mt-2 overflow-hidden">
                                            <div
                                                className="h-full bg-cyber-blue shadow-neon-blue transition-all duration-300"
                                                style={{ width: `${doc.progress}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentManager;
