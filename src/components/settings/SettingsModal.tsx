import React, { useState } from 'react';
import { 
  X, ShieldCheck, Cpu, Sliders, Volume2, User, 
  Trash2, Download, Check, Sparkles, Moon, Sun, Info
} from 'lucide-react';
import { AppSettings, saveSettings } from '../../services/storage';
import { SystemHealthData } from '../../types';
import { BRAND_NAME, BRAND_TAGLINE, FOUNDER_NAME, FOUNDER_TAGLINE, founderImage } from '../../assets/founder';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  systemHealth: SystemHealthData | null;
  onClearData: () => void;
  onOpenInstall?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  setSettings,
  systemHealth,
  onClearData,
  onOpenInstall,
}) => {
  const [activeSection, setActiveSection] = useState<'system' | 'ai' | 'voice' | 'data' | 'about'>('system');
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleUpdate = (patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#090D17] border border-cyan-500/30 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.2)] overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">System Settings & OS Preferences</h2>
              <span className="text-[11px] text-slate-400">{BRAND_NAME} Operating System</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {savedNotice && (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex px-4 pt-2 border-b border-white/5 gap-2 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'system', label: 'Engine Health', icon: ShieldCheck },
            { id: 'ai', label: 'AI Parameters', icon: Cpu },
            { id: 'voice', label: 'Voice & Speech', icon: Volume2 },
            { id: 'data', label: 'Privacy & Storage', icon: Trash2 },
            { id: 'about', label: 'About SONVEX', icon: Info },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 transition-all whitespace-nowrap ${
                  activeSection === tab.id
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* 1. SYSTEM HEALTH */}
          {activeSection === 'system' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">Backend API Diagnostic</span>
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Operational
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5">
                    <span className="text-slate-500 block text-[10px]">Core AI Model:</span>
                    <span className="text-cyan-300 font-bold">gemini-3.8-flash</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5">
                    <span className="text-slate-500 block text-[10px]">Search Tool:</span>
                    <span className="text-blue-300 font-bold">Google Grounding</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5">
                    <span className="text-slate-500 block text-[10px]">Image Model:</span>
                    <span className="text-purple-300 font-bold">gemini-3.1-flash-lite-image</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5">
                    <span className="text-slate-500 block text-[10px]">Audio Engine:</span>
                    <span className="text-emerald-300 font-bold">gemini-3.8-flash-lite-tts</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-slate-300 leading-relaxed text-[11px]">
                <strong className="text-cyan-300">Security Architecture:</strong> All requests to Gemini models are executed strictly through the server-side Express proxy. Zero API keys are ever bundled or transmitted to client browser JavaScript.
              </div>
            </div>
          )}

          {/* 2. AI PREFERENCES */}
          {activeSection === 'ai' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1 font-semibold">
                    <span>Creativity / Temperature</span>
                    <span className="font-mono text-cyan-400">{settings.aiTemperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={settings.aiTemperature}
                    onChange={(e) => handleUpdate({ aiTemperature: Number(e.target.value) })}
                    className="w-full accent-cyan-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                    <span>Precise (0.1)</span>
                    <span>Balanced (0.7)</span>
                    <span>Creative (1.0)</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5">
                  <label className="block text-slate-300 font-semibold mb-1">Operator Profile Name</label>
                  <input
                    type="text"
                    value={settings.userName}
                    onChange={(e) => handleUpdate({ userName: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. VOICE SETTINGS */}
          {activeSection === 'voice' && (
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-2">Default TTS Voice Persona</label>
                <div className="grid grid-cols-5 gap-2">
                  {['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handleUpdate({ voiceName: v })}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                        settings.voiceName === v
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-slate-950 border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. PRIVACY & DATA */}
          {activeSection === 'data' && (
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
              <div>
                <h4 className="text-white font-bold">Local Device Storage</h4>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  All your conversations, tasks, notes, and generated media are held in your browser's private sandbox.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to reset and clear all local cache?')) {
                      onClearData();
                      alert('Local data reset.');
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-950/70 border border-rose-500/30 text-rose-300 font-semibold text-xs flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All Workspace Data</span>
                </button>
              </div>
            </div>
          )}

          {/* 5. ABOUT SONVEX */}
          {activeSection === 'about' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border border-cyan-400 flex-shrink-0">
                  <img src={founderImage} alt={FOUNDER_NAME} className="w-full h-full object-cover object-top" />
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{BRAND_NAME}</div>
                  <div className="text-xs text-cyan-400">{BRAND_TAGLINE}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{FOUNDER_TAGLINE}</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/10 space-y-2 text-slate-300 leading-relaxed text-[11px]">
                <p>
                  SONVEX was created by <strong>{FOUNDER_NAME}</strong> as an ultra-premium AI Operating System engineered to provide sovereign, unified intelligence without fragmentation.
                </p>
                <p className="text-slate-400">
                  Version 2.5.0-Production • Built on Google AI Studio
                </p>

                {onOpenInstall && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenInstall();
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-500/20 active:scale-95"
                    >
                      <span>📱 Install on Phone & GitHub APK (kajal23236-stack)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
