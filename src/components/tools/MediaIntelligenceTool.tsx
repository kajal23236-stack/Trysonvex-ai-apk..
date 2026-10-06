import React, { useState, useRef } from 'react';
import { 
  FileText, Image as ImageIcon, Upload, Loader2, Sparkles, 
  Copy, Check, Eye, Table, Search, FileCode
} from 'lucide-react';
import { analyzeDocument, analyzeVision } from '../../services/api';
import { MarkdownRenderer } from '../chat/MarkdownRenderer';

export const MediaIntelligenceTool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'document' | 'image' | 'ocr'>('document');
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    type: string;
    size: number;
    base64: string;
  } | null>(null);

  const [prompt, setPrompt] = useState('');
  const [task, setTask] = useState<'general' | 'summary' | 'extract_tables'>('general');
  const [analysisResult, setAnalysisResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setSelectedFile({
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        base64,
      });
      setAnalysisResult('');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAnalyze = async () => {
    if (!selectedFile || loading) return;
    setLoading(true);

    try {
      if (activeTab === 'image') {
        const res = await analyzeVision(
          selectedFile.base64,
          selectedFile.type,
          prompt || 'Analyze this image in visual detail, identifying all key objects, atmosphere, and architectural elements.'
        );
        setAnalysisResult(res.analysis);
      } else if (activeTab === 'ocr') {
        const res = await analyzeVision(
          selectedFile.base64,
          selectedFile.type,
          undefined,
          'ocr'
        );
        setAnalysisResult(res.analysis);
      } else {
        // Document / File
        const res = await analyzeDocument(
          selectedFile.name,
          selectedFile.type,
          selectedFile.base64,
          prompt,
          task
        );
        setAnalysisResult(res.result);
      }
    } catch (err: any) {
      alert(err.message || 'File analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(analysisResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">File & Vision Intelligence</h2>
            <p className="text-xs text-slate-400">Multi-modal deep inspection for PDF, CSV, TXT, code, and images</p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex p-1 rounded-xl bg-slate-900 border border-white/10 text-xs">
          <button
            onClick={() => {
              setActiveTab('document');
              setSelectedFile(null);
              setAnalysisResult('');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'document' ? 'bg-blue-500 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            PDF & Documents
          </button>
          <button
            onClick={() => {
              setActiveTab('image');
              setSelectedFile(null);
              setAnalysisResult('');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'image' ? 'bg-blue-500 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Image Vision
          </button>
          <button
            onClick={() => {
              setActiveTab('ocr');
              setSelectedFile(null);
              setAnalysisResult('');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'ocr' ? 'bg-blue-500 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Text Extractor (OCR)
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept={
          activeTab === 'document'
            ? '.pdf,.txt,.docx,.csv,.xlsx,.json,.js,.ts,.py,.html,.md'
            : 'image/*'
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload & controls */}
        <div className="lg:col-span-5 space-y-4">
          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/10 hover:border-blue-500/50 bg-slate-900/40 hover:bg-slate-900/70 p-6 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>

            {selectedFile ? (
              <div className="space-y-1">
                <div className="text-sm font-semibold text-white truncate max-w-xs">{selectedFile.name}</div>
                <div className="text-xs text-blue-400 font-mono">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Click to replace
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-sm font-semibold text-slate-200">
                  {activeTab === 'document' ? 'Upload Document or File' : 'Upload Image'}
                </div>
                <div className="text-xs text-slate-500">
                  {activeTab === 'document'
                    ? 'Supports PDF, TXT, CSV, JSON, Markdown, Code'
                    : 'Supports PNG, JPG, WEBP, SVG'}
                </div>
              </div>
            )}
          </div>

          {/* Document Task Options */}
          {activeTab === 'document' && (
            <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Analysis Mode
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {[
                  { id: 'general', label: 'Deep Q&A', icon: Eye },
                  { id: 'summary', label: 'Summary', icon: FileText },
                  { id: 'extract_tables', label: 'Tables', icon: Table },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTask(item.id as any)}
                      className={`p-2 rounded-lg flex flex-col items-center gap-1 border transition-all ${
                        task === item.id
                          ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                          : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[11px] font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom Question Prompt */}
          <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Specific Query (Optional)
            </label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Find revenue figures in 2025, or identify text..."
              className="w-full rounded-xl bg-slate-950 border border-white/10 p-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!selectedFile || loading}
            className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{loading ? 'Analyzing with Multi-Modal Engine...' : 'Run Analysis'}</span>
          </button>
        </div>

        {/* Results view */}
        <div className="lg:col-span-7 bg-slate-900/30 rounded-2xl border border-white/10 p-5 flex flex-col min-h-[350px]">
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Intelligence Output
            </span>
            {analysisResult && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {analysisResult ? (
              <MarkdownRenderer content={analysisResult} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 text-xs">
                <FileCode className="w-8 h-8 mb-2 opacity-30 text-blue-400" />
                <span>Upload a file or image on the left and run analysis to inspect findings.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
