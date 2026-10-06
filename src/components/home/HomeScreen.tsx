import React, { useState } from 'react';
import { 
  Sparkles, Search, MessageSquare, Image, Languages, 
  FileText, Wrench, ArrowRight, Zap, Shield, Cpu, 
  Terminal, Globe, BookOpen, Layers, CheckCircle2, ChevronRight, User
} from 'lucide-react';
import { ActiveTab, Conversation, NoteItem, TaskItem } from '../../types';
import { BRAND_NAME, BRAND_TAGLINE, FOUNDER_NAME, FOUNDER_TAGLINE, founderImage } from '../../assets/founder';

interface HomeScreenProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenCommand: () => void;
  onOpenInstall: () => void;
  onExecutePrompt: (prompt: string, targetTab?: ActiveTab, directAction?: string) => void;
  recentConversations: Conversation[];
  tasks: TaskItem[];
  notes: NoteItem[];
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  setActiveTab,
  onOpenCommand,
  onOpenInstall,
  onExecutePrompt,
  recentConversations,
  tasks,
  notes,
}) => {
  const [commandInput, setCommandInput] = useState('');

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    onExecutePrompt(commandInput.trim());
    setCommandInput('');
  };

  const quickActions = [
    { label: 'AI Chat', icon: MessageSquare, tab: 'chat' as ActiveTab, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
    { label: 'Search', icon: Search, tab: 'search' as ActiveTab, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Create', icon: Image, tab: 'tools' as ActiveTab, directAction: 'image', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { label: 'Analyze', icon: FileText, tab: 'tools' as ActiveTab, directAction: 'document', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Write', icon: BookOpen, tab: 'tools' as ActiveTab, directAction: 'writer', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'Translate', icon: Languages, tab: 'tools' as ActiveTab, directAction: 'translate', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
    { label: 'Tools', icon: Wrench, tab: 'tools' as ActiveTab, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
  ];

  return (
    <div className="min-h-full pb-20 pt-4 sm:pt-10 px-3 sm:px-6 max-w-6xl mx-auto space-y-8 sm:space-y-12">
      {/* Cinematic Hero */}
      <section className="text-center relative pt-2 sm:pt-6">
        {/* Ambient glow backgrounds */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] bg-gradient-to-tr from-cyan-600/15 via-blue-600/10 to-purple-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Brand tag pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-white/10 text-xs text-slate-300 mb-4 sm:mb-6 shadow-sm">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="font-semibold text-white tracking-wider uppercase text-[10px] sm:text-xs">
            Next-Generation AI OS
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-cyan-400 text-[11px] font-medium">{FOUNDER_TAGLINE}</span>
        </div>

        {/* Big Brand Title & Tagline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-3 sm:mb-4 font-sans">
          {BRAND_NAME}
        </h1>
        <p className="text-lg sm:text-2xl md:text-3xl text-slate-300 font-light max-w-2xl mx-auto tracking-tight">
          {BRAND_TAGLINE}
        </p>

        {/* Large Intelligent Command Box */}
        <div className="mt-8 sm:mt-10 max-w-2xl mx-auto">
          <form
            onSubmit={handleCommandSubmit}
            className="relative flex items-center bg-[#090D16]/90 border border-cyan-500/30 rounded-2xl shadow-[0_0_35px_rgba(6,182,212,0.15)] focus-within:border-cyan-400 focus-within:shadow-[0_0_50px_rgba(6,182,212,0.3)] transition-all p-1.5 sm:p-2"
          >
            <div className="p-3 text-cyan-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>

            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="Ask SONVEX anything..."
              className="flex-1 bg-transparent text-white text-sm sm:text-base placeholder:text-slate-500 focus:outline-none px-2"
            />

            <button
              type="submit"
              disabled={!commandInput.trim()}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
                commandInput.trim()
                  ? 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-md shadow-cyan-500/30 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Execute</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Quick Action Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-6 sm:mt-8">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  if (action.directAction) {
                    onExecutePrompt('', action.tab, action.directAction);
                  } else {
                    setActiveTab(action.tab);
                  }
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border ${action.bg} hover:border-cyan-400/60 transition-all text-xs sm:text-sm font-medium text-slate-200 hover:text-white shadow-sm hover:scale-105 active:scale-95`}
              >
                <Icon className={`w-4 h-4 ${action.color}`} />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>

        {/* Install on Phone / APK Quick Trigger */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={onOpenInstall}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-950/70 via-blue-950/70 to-purple-950/70 hover:from-cyan-900/80 hover:to-purple-900/80 border border-cyan-400/40 text-cyan-300 text-xs font-semibold shadow-lg shadow-cyan-500/10 hover:scale-105 active:scale-95 transition-all group"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
            <span>📥 Download Android APK / Install on Phone</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Featured Intelligence Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Core Intelligence card */}
        <div 
          onClick={() => setActiveTab('chat')}
          className="group cursor-pointer p-5 rounded-2xl bg-slate-900/40 hover:bg-slate-900/70 border border-white/10 hover:border-cyan-500/40 transition-all sonvex-glow-cyan"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              Neural Core
            </span>
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-cyan-200 transition-colors">
            Universal AI Brain
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Multi-modal reasoning, code synthesis, document Q&A, and real-time streaming intelligence.
          </p>
          <div className="flex items-center gap-1 text-xs text-cyan-400 font-semibold mt-4">
            <span>Launch Chat</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Real Web Search Grounding */}
        <div 
          onClick={() => setActiveTab('search')}
          className="group cursor-pointer p-5 rounded-2xl bg-slate-900/40 hover:bg-slate-900/70 border border-white/10 hover:border-blue-500/40 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Globe className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
              Live Web
            </span>
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-blue-200 transition-colors">
            Google Search Grounding
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Real search results with cited URLs, verifiable timestamps, snippets, and factual synthesis.
          </p>
          <div className="flex items-center gap-1 text-xs text-blue-400 font-semibold mt-4">
            <span>Explore Search</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* 18+ Functional Production Tools */}
        <div 
          onClick={() => setActiveTab('tools')}
          className="group cursor-pointer p-5 rounded-2xl bg-slate-900/40 hover:bg-slate-900/70 border border-white/10 hover:border-purple-500/40 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
              18+ Tools
            </span>
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-purple-200 transition-colors">
            Suite of Production Tools
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Calculator, QR Generator, Currency Converter, OCR, Voice Transcription, TTS, and Notes.
          </p>
          <div className="flex items-center gap-1 text-xs text-purple-400 font-semibold mt-4">
            <span>Open Tool Suite</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </section>

      {/* Recent Activity & Workspace Snapshots */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white tracking-tight">Recent Activity</h2>
          </div>
          <button
            onClick={() => setActiveTab('workspace')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
          >
            <span>View Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Recent Conversations */}
          <div className="p-4 rounded-2xl bg-slate-900/30 border border-white/5 space-y-2.5">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Recent Conversations</span>
              <span className="text-cyan-400">{recentConversations.length}</span>
            </div>
            <div className="space-y-1.5">
              {recentConversations.slice(0, 3).map((convo) => (
                <div
                  key={convo.id}
                  onClick={() => setActiveTab('chat')}
                  className="p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-white/5 hover:border-cyan-500/30 cursor-pointer transition-all flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <MessageSquare className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    <span className="text-slate-200 font-medium truncate">{convo.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">
                    {convo.messages.length} msgs
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Tasks */}
          <div className="p-4 rounded-2xl bg-slate-900/30 border border-white/5 space-y-2.5">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Action Items</span>
              <span className="text-emerald-400">{tasks.filter((t) => t.status !== 'completed').length} active</span>
            </div>
            <div className="space-y-1.5">
              {tasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  onClick={() => setActiveTab('workspace')}
                  className="p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-white/5 hover:border-emerald-500/30 cursor-pointer transition-all flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <CheckCircle2 className={`w-3.5 h-3.5 ${task.status === 'completed' ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span className="text-slate-200 truncate">{task.title}</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 border border-white/5 text-slate-400 capitalize">
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Founder Spotlight Banner */}
      <section 
        onClick={() => setActiveTab('founder')}
        className="cursor-pointer p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-[#0A1020]/90 to-slate-900/90 border border-cyan-500/20 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg group"
      >
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-cyan-400/50 shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
            <img
              src={founderImage}
              alt="Sonal Yadav"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div>
            <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest">
              Founder & Creator
            </div>
            <div className="text-lg font-bold text-white group-hover:text-cyan-200 transition-colors">
              {FOUNDER_NAME}
            </div>
            <div className="text-xs text-slate-400">
              "Building sovereign intelligence that unifies every computing workflow."
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 group-hover:text-cyan-300">
          <span>Read Founder Vision</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </section>
    </div>
  );
};
