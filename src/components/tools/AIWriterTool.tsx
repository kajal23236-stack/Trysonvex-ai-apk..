import React, { useState } from 'react';
import { BookOpen, Sparkles, Copy, Check, Loader2, RefreshCw } from 'lucide-react';
import { generateWriterText } from '../../services/api';
import { MarkdownRenderer } from '../chat/MarkdownRenderer';

export const AIWriterTool: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [type, setType] = useState('blog');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const [keyPoints, setKeyPoints] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || loading) return;

    setLoading(true);
    try {
      const res = await generateWriterText({ topic, type, tone, length, keyPoints });
      setResult(res.result);
    } catch (err: any) {
      alert(err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white">AI Writer & Copy Studio</h2>
          <p className="text-xs text-slate-400">Draft high-conversion articles, proposals, essays, and technical documentation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls form */}
        <form onSubmit={handleGenerate} className="lg:col-span-5 space-y-4 bg-slate-900/40 p-4 sm:p-5 rounded-2xl border border-white/10">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Topic or Objective
            </label>
            <textarea
              required
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. The impact of synthetic biology on future medicine..."
              className="w-full rounded-xl bg-slate-950/80 border border-white/10 p-3 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Format</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-xl bg-slate-950/80 border border-white/10 p-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
              >
                <option value="blog post">Blog Post</option>
                <option value="executive email">Executive Email</option>
                <option value="linkedin article">LinkedIn Article</option>
                <option value="academic essay">Academic Essay</option>
                <option value="sales pitch">Sales Pitch</option>
                <option value="technical documentation">Technical Docs</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full rounded-xl bg-slate-950/80 border border-white/10 p-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
              >
                <option value="professional & authoritative">Professional</option>
                <option value="visionary & inspiring">Visionary</option>
                <option value="persuasive & punchy">Persuasive</option>
                <option value="casual & conversational">Conversational</option>
                <option value="rigorous & scientific">Scientific</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Key Points to Include (Optional)</label>
            <input
              type="text"
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
              placeholder="e.g. cost reduction, 10x throughput, safety"
              className="w-full rounded-xl bg-slate-950/80 border border-white/10 p-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{loading ? 'Drafting Content...' : 'Generate with SONVEX'}</span>
          </button>
        </form>

        {/* Output view */}
        <div className="lg:col-span-7 bg-slate-900/30 rounded-2xl border border-white/10 p-4 sm:p-5 flex flex-col min-h-[350px]">
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Drafted Output
            </span>
            {result && (
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
            {result ? (
              <MarkdownRenderer content={result} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 text-xs">
                <BookOpen className="w-8 h-8 mb-2 opacity-40 text-amber-400" />
                <span>Specify your topic and click Generate to produce a polished draft.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
