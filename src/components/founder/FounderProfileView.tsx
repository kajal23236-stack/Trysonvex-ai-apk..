import React from 'react';
import { 
  Sparkles, Shield, Cpu, Terminal, Globe, Award, 
  Lightbulb, Compass, Rocket, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { 
  founderImage, FOUNDER_NAME, FOUNDER_TITLE, 
  FOUNDER_TAGLINE, BRAND_NAME, BRAND_TAGLINE 
} from '../../assets/founder';

export const FounderProfileView: React.FC = () => {
  return (
    <div className="min-h-full pb-20 pt-4 px-3 sm:px-6 max-w-5xl mx-auto space-y-8 sm:space-y-12">
      {/* Hero Founder Showcase */}
      <section className="relative p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900/90 via-[#0A0E1A]/90 to-slate-900/90 border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] sonvex-glow-cyan overflow-hidden">
        {/* Ambient glow light */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 relative z-10">
          {/* Founder Portrait (Young male founder, confident, modern tech visionary) */}
          <div className="relative flex-shrink-0 group">
            <div className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-3xl overflow-hidden border-2 border-cyan-400/50 shadow-2xl sonvex-border-glow">
              <img
                src={founderImage}
                alt={`${FOUNDER_NAME} - ${FOUNDER_TITLE}`}
                className="w-full h-full object-cover object-top filter contrast-[1.05] brightness-100 transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
            </div>

            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-950/90 border border-cyan-400/40 text-[10px] font-mono text-cyan-300 font-semibold tracking-wider uppercase whitespace-nowrap shadow-lg">
              Founder & Creator
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{FOUNDER_TAGLINE}</span>
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-sans">
                {FOUNDER_NAME.toUpperCase()}
              </h1>
              <div className="text-base sm:text-lg font-semibold text-cyan-400 font-sans tracking-wide">
                {FOUNDER_TITLE}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light max-w-xl">
              "We built <strong className="text-white font-medium">{BRAND_NAME}</strong> with an uncompromising mandate: replace the fragmented web of disjointed AI tools with a sovereign, unified operating system. When intelligence is seamless, humans can operate at the speed of thought."
            </p>

            <div className="pt-2 flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="px-3 py-1 rounded-lg bg-slate-800/80 border border-white/10 text-slate-300 text-xs font-mono">
                System Architect
              </span>
              <span className="px-3 py-1 rounded-lg bg-slate-800/80 border border-white/10 text-slate-300 text-xs font-mono">
                AI Operating System
              </span>
              <span className="px-3 py-1 rounded-lg bg-slate-800/80 border border-white/10 text-slate-300 text-xs font-mono">
                Real-Time Grounding
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Vision & Mission */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/10 space-y-3 sonvex-glass">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Lightbulb className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">The Vision</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Eliminating the cognitive friction of juggling multiple AI subscriptions, tabs, and interfaces. One unified engine that knows how to route, search, translate, compute, and create instantly.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/10 space-y-3 sonvex-glass">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Zero-Mock Philosophy</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Every feature in SONVEX connects to actual production models and APIs. Real Google search grounding with clickable sources, real multi-modal vision inspection, and verifiable mathematical proofs.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/10 space-y-3 sonvex-glass">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Rocket className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Building Useful Technology</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Focusing on concrete human utility: from students solving advanced calculus to engineers drafting production systems, SONVEX empowers builders worldwide without gimmicks.
          </p>
        </div>
      </section>

      {/* Technical Architecture Overview */}
      <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/50 border border-white/10 space-y-5">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            SONVEX System Architecture
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-white/5 space-y-1.5">
            <span className="font-mono text-cyan-400 font-semibold text-[11px] block">01 / NEURAL BRAIN</span>
            <div className="font-bold text-white text-sm">Gemini 3.8 Flash</div>
            <p className="text-slate-400 text-[11px]">Sub-second multi-turn reasoning and code generation.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-white/5 space-y-1.5">
            <span className="font-mono text-blue-400 font-semibold text-[11px] block">02 / WEB GROUNDING</span>
            <div className="font-bold text-white text-sm">Live Google Search</div>
            <p className="text-slate-400 text-[11px]">Real-time index querying with cited web source links.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-white/5 space-y-1.5">
            <span className="font-mono text-purple-400 font-semibold text-[11px] block">03 / MULTI-MODAL</span>
            <div className="font-bold text-white text-sm">Vision & Audio TTS</div>
            <p className="text-slate-400 text-[11px]">Gemini 3.5 Transcribe & 3.8 Flash Lite Speech Studio.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-white/5 space-y-1.5">
            <span className="font-mono text-emerald-400 font-semibold text-[11px] block">04 / SECURE BACKEND</span>
            <div className="font-bold text-white text-sm">Express + TSX Proxy</div>
            <p className="text-slate-400 text-[11px]">Zero client-side API key leakage with protected endpoints.</p>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            <strong className="text-white">SONVEX Version 2.5 Enterprise</strong> • Engineered by Sonal Yadav
          </div>
          <div className="font-mono text-cyan-400">
            {BRAND_TAGLINE}
          </div>
        </div>
      </section>
    </div>
  );
};
