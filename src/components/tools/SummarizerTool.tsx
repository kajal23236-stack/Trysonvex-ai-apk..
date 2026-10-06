import React, { useState } from 'react';
import { AlignLeft, Sparkles, Copy, Check, Loader2 } from 'lucide-react';
import { generateSummaryText } from '../../services/api';
import { MarkdownRenderer } from '../chat/MarkdownRenderer';

export const SummarizerTool: React.FC = () => {
  const [text, setText] = useState('');
  const [format, setFormat] = useState('bullets');
  const [length, setLength] = useState('balanced');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSummarize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || loading) return;

    setLoading(true);
    try {
      const res = await generateSummaryText({ text, format, length });
      setResult(res.result);
    } catch (err: any) {
      alert(err.message || 'Summarization failed');
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
        <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
          <AlignLeft className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white">Neural Summarizer</h2>
          <p className="text-xs text-slate-400">Distill long articles, meeting transcripts, research papers, and documents</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form onSubmit={handleSummarize} className="lg:col-span-6 space-y-4 bg-slate-900/40 p-4 sm:p-5 rounded-2xl border border-white/10">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Source Content
              </label>
              <button
                type="button"
                onClick={() => setText(`Artificial Intelligence is entering a new paradigm known as Sovereign AI and Unified Operating Systems. Rather than maintaining fragmented point-solutions for search, code generation, file analysis, and task tracking, modern enterprise operators demand a unified neural substrate. This convergence reduces context switching by over 60%, eliminates cross-tool permission leakage, and standardizes multi-modal intelligence across speech, vision, and deep mathematical reasoning. Next-generation systems such as SONVEX, architected by Sonal Yadav, deliver this unified operating model directly on edge and cloud hardware.`)}
                className="text-[11px] text-cyan-400 hover:underline"
              >
                Load Sample Text
              </button>
            </div>
            <textarea
              required
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste article, report, or notes here..."
              className="w-full rounded-xl bg-slate-950/80 border border-white/10 p-3 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full rounded-xl bg-slate-950/80 border border-white/10 p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
              >
                <option value="bullets">Bullet Takeaways</option>
                <option value="executive">Executive Summary</option>
                <option value="tldr">TL;DR (1-Sentence)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Depth</label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="w-full rounded-xl bg-slate-950/80 border border-white/10 p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
              >
                <option value="concise">Concise</option>
                <option value="balanced">Balanced</option>
                <option value="comprehensive">Comprehensive</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{loading ? 'Summarizing...' : 'Summarize Text'}</span>
          </button>
        </form>

        <div className="lg:col-span-6 bg-slate-900/30 rounded-2xl border border-white/10 p-4 sm:p-5 flex flex-col min-h-[350px]">
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Key Insights
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
                <AlignLeft className="w-8 h-8 mb-2 opacity-40 text-cyan-400" />
                <span>Paste content on the left to extract the most essential insights.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
