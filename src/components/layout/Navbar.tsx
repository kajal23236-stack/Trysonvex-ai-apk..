import React from 'react';
import { Sparkles, Command, Mic, Settings, User, ShieldCheck, Flame, Smartphone, Download } from 'lucide-react';
import { ActiveTab, SystemHealthData } from '../../types';
import { BRAND_NAME, BRAND_TAGLINE, FOUNDER_TAGLINE, founderImage } from '../../assets/founder';
import { PWAInstallButton } from '../install/PWAInstallButton';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenCommand: () => void;
  onOpenVoice: () => void;
  onOpenSettings: () => void;
  onOpenInstall: () => void;
  systemHealth: SystemHealthData | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCommand,
  onOpenVoice,
  onOpenSettings,
  onOpenInstall,
  systemHealth,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.07] bg-[#05070B]/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand identity */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer group select-none flex-shrink-0"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-purple-600/20 border border-cyan-500/40 sonvex-glow-cyan transition-transform group-hover:scale-105">
            <Sparkles className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white group-hover:text-cyan-300 transition-colors font-sans">
                {BRAND_NAME}
              </span>
              <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 uppercase tracking-wider">
                OS v2.5
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="hidden sm:inline font-medium text-slate-400">{BRAND_TAGLINE}</span>
              <span className="hidden lg:inline text-slate-600">•</span>
              <span className="hidden lg:inline text-cyan-400/80 font-medium">{FOUNDER_TAGLINE}</span>
            </div>
          </div>
        </div>

        {/* Center: Universal Command Bar Trigger */}
        <button
          onClick={onOpenCommand}
          className="flex-1 max-w-md hidden md:flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-900/90 border border-white/10 hover:border-cyan-500/40 text-slate-400 text-xs sm:text-sm transition-all group shadow-inner"
        >
          <div className="flex items-center gap-2.5 truncate">
            <Command className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="truncate group-hover:text-slate-200 transition-colors font-medium">
              Ask SONVEX anything...
            </span>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800/80 border border-white/10 rounded">
              ⌘K
            </kbd>
          </div>
        </button>

        {/* Right side controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Mobile Search Icon Button */}
          <button
            onClick={onOpenCommand}
            className="md:hidden p-2 rounded-lg bg-slate-900/80 border border-white/10 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
            title="Ask SONVEX"
          >
            <Command className="w-4 h-4" />
          </button>

          {/* Download APK / Install Button */}
          <button
            onClick={onOpenInstall}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-bold shadow-md shadow-cyan-500/25 transition-all active:scale-95"
            title="Download APK for Android Mobile"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Download APK</span>
            <span className="sm:hidden">APK</span>
          </button>

          {/* Voice Button */}
          <button
            onClick={onOpenVoice}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-950/60 to-purple-950/60 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-xs font-medium transition-all hover:scale-105 active:scale-95 shadow-sm"
            title="Voice Interface"
          >
            <Mic className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="hidden sm:inline">Voice</span>
          </button>

          {/* System Health / Model Badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Gemini 3.8 Flash</span>
          </div>

          {/* Founder Profile Button */}
          <button
            onClick={() => setActiveTab('founder')}
            className={`flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border transition-all ${
              activeTab === 'founder'
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-sm'
                : 'bg-slate-900/60 hover:bg-slate-800/80 border-white/10 text-slate-300 hover:text-white'
            }`}
            title="Sonal Yadav - Founder & Creator"
          >
            <div className="relative w-6 h-6 rounded-full overflow-hidden border border-cyan-400/50">
              <img 
                src={founderImage} 
                alt="Sonal Yadav - Founder" 
                className="w-full h-full object-cover object-top"
              />
            </div>
            <span className="hidden md:inline text-xs font-semibold tracking-tight">Sonal Yadav</span>
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 text-slate-300 hover:text-white transition-colors"
            title="Settings & System Diagnostics"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
