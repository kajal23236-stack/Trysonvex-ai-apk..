import React, { useState, useEffect, useRef } from 'react';
import { 
  Command, Search, MessageSquare, Image, Languages, 
  Calculator, FileText, CheckSquare, Sparkles, ArrowRight,
  Loader2, Zap, CornerDownLeft, Globe, Wrench, X, Mic
} from 'lucide-react';
import { ActiveTab } from '../../types';
import { routeIntent } from '../../services/api';

interface UniversalCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  onExecutePrompt: (prompt: string, targetTab?: ActiveTab, directAction?: string) => void;
  onOpenVoice: () => void;
}

export const UniversalCommandModal: React.FC<UniversalCommandModalProps> = ({
  isOpen,
  onClose,
  setActiveTab,
  onExecutePrompt,
  onOpenVoice,
}) => {
  const [query, setQuery] = useState('');
  const [isRouting, setIsRouting] = useState(false);
  const [intentSuggestion, setIntentSuggestion] = useState<{
    tool: string;
    quickAnswer: string;
    confidence: number;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setIntentSuggestion(null);
    }
  }, [isOpen]);

  // Debounced Intent Preview
  useEffect(() => {
    if (!query.trim() || query.length < 5) {
      setIntentSuggestion(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsRouting(true);
        const result = await routeIntent(query);
        setIntentSuggestion(result);
      } catch (err) {
        // silent
      } finally {
        setIsRouting(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle keyboard submission
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    const trimmed = query.trim();
    onClose();

    if (intentSuggestion) {
      const tool = intentSuggestion.tool;
      if (tool === 'search') {
        onExecutePrompt(trimmed, 'search');
      } else if (tool === 'image_studio') {
        onExecutePrompt(trimmed, 'tools', 'image');
      } else if (tool === 'translator') {
        onExecutePrompt(trimmed, 'tools', 'translate');
      } else if (tool === 'calculator') {
        onExecutePrompt(trimmed, 'tools', 'math');
      } else if (tool === 'writer') {
        onExecutePrompt(trimmed, 'tools', 'writer');
      } else if (tool === 'summarizer') {
        onExecutePrompt(trimmed, 'tools', 'summarizer');
      } else if (tool === 'founder') {
        setActiveTab('founder');
      } else {
        onExecutePrompt(trimmed, 'chat');
      }
    } else {
      // Default to AI Chat
      onExecutePrompt(trimmed, 'chat');
    }
  };

  if (!isOpen) return null;

  const quickActions = [
    { label: 'Live Web Search', icon: Globe, tab: 'search' as ActiveTab, desc: 'Real-time Google search grounding' },
    { label: 'Neural AI Chat', icon: MessageSquare, tab: 'chat' as ActiveTab, desc: 'ChatGPT-style deep reasoning' },
    { label: 'AI Image Studio', icon: Image, tab: 'tools' as ActiveTab, directAction: 'image', desc: 'Generate & edit visuals' },
    { label: 'Universal Translator', icon: Languages, tab: 'tools' as ActiveTab, directAction: 'translate', desc: '50+ human languages' },
    { label: 'Scientific Math Solver', icon: Calculator, tab: 'tools' as ActiveTab, directAction: 'math', desc: 'Step-by-step calculus & algebra' },
    { label: 'Document Intelligence', icon: FileText, tab: 'tools' as ActiveTab, directAction: 'document', desc: 'PDF, DOCX, CSV deep extraction' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#090D16] border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top input bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400">
            {isRouting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Command className="w-4 h-4" />}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
              if (e.key === 'Escape') onClose();
            }}
            placeholder="Ask SONVEX anything... (Search, Calculate, Translate, Draw, Write, Analyze)"
            className="flex-1 bg-transparent text-white text-base placeholder:text-slate-500 focus:outline-none"
          />

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenVoice();
              }}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-cyan-400 hover:bg-slate-700 transition-colors"
              title="Voice Input"
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Intent Routing Live Preview Badge */}
        {intentSuggestion && (
          <div className="px-4 py-2.5 bg-gradient-to-r from-cyan-950/40 via-blue-950/20 to-purple-950/30 border-b border-cyan-500/20 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-cyan-300 truncate">
              <Zap className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 animate-pulse" />
              <span className="font-semibold uppercase tracking-wider text-[10px] bg-cyan-500/20 px-1.5 py-0.5 rounded border border-cyan-400/30">
                Routed to {intentSuggestion.tool.replace('_', ' ')}
              </span>
              <span className="text-slate-300 truncate font-sans">{intentSuggestion.quickAnswer}</span>
            </div>
            <button
              onClick={() => handleSubmit()}
              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-200 font-medium whitespace-nowrap"
            >
              Execute <CornerDownLeft className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Quick Suggestions or Launcher */}
        <div className="p-3 sm:p-4 max-h-[60vh] overflow-y-auto space-y-3">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
            Universal Intelligence Hub
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    onClose();
                    if (query.trim()) {
                      onExecutePrompt(query.trim(), action.tab, action.directAction);
                    } else {
                      setActiveTab(action.tab);
                    }
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/50 hover:bg-cyan-950/30 border border-white/5 hover:border-cyan-500/40 text-left transition-all group"
                >
                  <div className="p-2 rounded-lg bg-slate-800 text-slate-300 group-hover:bg-cyan-500/20 group-hover:text-cyan-300 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 truncate">
                    <div className="text-xs font-semibold text-white group-hover:text-cyan-200 flex items-center justify-between">
                      <span>{action.label}</span>
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{action.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Prompt inspiration */}
          <div className="pt-2 border-t border-white/5">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1 mb-2">
              Try asking:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Search latest advancements in humanoid robotics',
                'Translate this email to formal Japanese',
                'Calculate integral of x*sin(x) dx step-by-step',
                'Create a cinematic image of a glass city in space',
                'Who created SONVEX?',
                'Draft a venture capital pitch for an AI startup',
              ].map((p, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuery(p);
                    inputRef.current?.focus();
                  }}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-cyan-300 transition-colors text-left"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer shortcuts info */}
        <div className="px-4 py-2 bg-slate-950/90 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1 py-0.5 bg-slate-800 rounded border border-white/10">↵</kbd> to execute</span>
            <span><kbd className="px-1 py-0.5 bg-slate-800 rounded border border-white/10">esc</kbd> to close</span>
          </div>
          <span className="text-cyan-400/80 font-sans font-medium">SONVEX Intelligence Engine</span>
        </div>
      </div>
    </div>
  );
};
