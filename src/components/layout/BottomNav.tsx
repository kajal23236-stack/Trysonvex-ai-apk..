import React from 'react';
import { Home, MessageSquare, Wrench, FolderKanban, User, Search, Palette } from 'lucide-react';
import { ActiveTab } from '../../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const navItems: Array<{ id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; highlight?: boolean }> = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'chat', label: 'AI', icon: MessageSquare, highlight: true },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'tools', label: 'Tools', icon: Wrench },
    { id: 'workspace', label: 'Workspace', icon: FolderKanban },
    { id: 'founder', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#05070B]/90 backdrop-blur-2xl border-t border-white/[0.08] px-2 py-1.5 pb-safe sm:py-2">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isAIHighlight = item.highlight;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 select-none ${
                isActive
                  ? isAIHighlight
                    ? 'text-cyan-400 font-semibold'
                    : 'text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isAIHighlight ? (
                <div
                  className={`relative p-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-tr from-cyan-500/25 to-blue-600/25 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.3)] scale-105'
                      : 'bg-slate-900/80 border border-white/10 hover:border-cyan-500/30'
                  }`}
                >
                  <Icon className="w-5 h-5 text-cyan-400" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                </div>
              ) : (
                <div className={`p-1.5 rounded-lg transition-transform ${isActive ? 'scale-110' : ''}`}>
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                </div>
              )}

              <span
                className={`text-[10px] mt-0.5 tracking-tight transition-colors ${
                  isActive ? 'text-cyan-300 font-bold' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>

              {isActive && !isAIHighlight && (
                <span className="absolute bottom-0 w-3 h-0.5 bg-cyan-400 rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
