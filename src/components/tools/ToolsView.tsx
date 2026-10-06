import React, { useState, useEffect } from 'react';
import { 
  BookOpen, AlignLeft, Languages, Calculator, Scale, 
  QrCode, FileCode, Volume2, CheckSquare, Search, 
  ArrowRight, Sparkles, Wrench
} from 'lucide-react';
import { AIWriterTool } from './AIWriterTool';
import { SummarizerTool } from './SummarizerTool';
import { TranslatorTool } from './TranslatorTool';
import { CalculatorTool } from './CalculatorTool';
import { ConvertersTool } from './ConvertersTool';
import { QRCodeTool } from './QRCodeTool';
import { MediaIntelligenceTool } from './MediaIntelligenceTool';
import { VoiceTools } from './VoiceTools';
import { ProductivityTool } from './ProductivityTool';
import { NoteItem, ReminderItem, TaskItem } from '../../types';

interface ToolsViewProps {
  initialTool?: string;
  onClearInitialTool?: () => void;
  tasks: TaskItem[];
  setTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>;
  notes: NoteItem[];
  setNotes: React.Dispatch<React.SetStateAction<NoteItem[]>>;
  reminders: ReminderItem[];
  setReminders: React.Dispatch<React.SetStateAction<ReminderItem[]>>;
}

export const ToolsView: React.FC<ToolsViewProps> = ({
  initialTool,
  onClearInitialTool,
  tasks,
  setTasks,
  notes,
  setNotes,
  reminders,
  setReminders,
}) => {
  const [selectedToolId, setSelectedToolId] = useState<string | null>(initialTool || null);
  const [filterSearch, setFilterSearch] = useState('');

  useEffect(() => {
    if (initialTool) {
      if (initialTool === 'writer') setSelectedToolId('writer');
      else if (initialTool === 'summarizer') setSelectedToolId('summarizer');
      else if (initialTool === 'translate') setSelectedToolId('translator');
      else if (initialTool === 'math') setSelectedToolId('calculator');
      else if (initialTool === 'currency' || initialTool === 'unit') setSelectedToolId('converters');
      else if (initialTool === 'document' || initialTool === 'ocr' || initialTool === 'image') setSelectedToolId('media');
      else if (initialTool === 'voice' || initialTool === 'tts') setSelectedToolId('voice');
      else if (initialTool === 'tasks' || initialTool === 'notes' || initialTool === 'timer') setSelectedToolId('productivity');
      else setSelectedToolId(initialTool);

      if (onClearInitialTool) onClearInitialTool();
    }
  }, [initialTool]);

  const toolsList = [
    {
      id: 'writer',
      title: 'AI Writer',
      description: 'Draft essays, blogs, executive pitches, and docs with customizable tone and length.',
      icon: BookOpen,
      category: 'Intelligence',
      badge: 'High-Fidelity',
    },
    {
      id: 'summarizer',
      title: 'Neural Summarizer',
      description: 'Condense articles, papers, and transcripts into actionable executive takeaways.',
      icon: AlignLeft,
      category: 'Intelligence',
      badge: 'Fast',
    },
    {
      id: 'translator',
      title: 'Universal Translator',
      description: 'Translate between 50+ languages with nuance, phonetic guides, and speech audio.',
      icon: Languages,
      category: 'Language',
      badge: '50+ Langs',
    },
    {
      id: 'calculator',
      title: 'Scientific Calculator & Math',
      description: 'Scientific keyboard with trigonometric functions plus AI step-by-step calculus derivation.',
      icon: Calculator,
      category: 'Math',
      badge: 'Derivation',
    },
    {
      id: 'converters',
      title: 'Currency & Unit Converter',
      description: 'Instant global forex rates (USD, EUR, INR, GBP) and physical metric conversion.',
      icon: Scale,
      category: 'Finance & Science',
      badge: 'Live Rates',
    },
    {
      id: 'qrcode',
      title: 'QR Code Generator',
      description: 'Generate high-resolution colored QR codes for URLs, Wi-Fi keys, and text with PNG download.',
      icon: QrCode,
      category: 'Utilities',
      badge: 'HD Export',
    },
    {
      id: 'media',
      title: 'Document & Vision Intelligence',
      description: 'Multi-modal analysis for PDF, TXT, CSV, Code, Images, plus OCR text extraction.',
      icon: FileCode,
      category: 'Multi-Modal',
      badge: 'PDF/Vision',
    },
    {
      id: 'voice',
      title: 'Voice & Speech Studio',
      description: 'Generate natural speech in 5 custom voices (WAV download) & transcribe voice recordings.',
      icon: Volume2,
      category: 'Audio',
      badge: 'Gemini TTS',
    },
    {
      id: 'productivity',
      title: 'Productivity Suite',
      description: 'Smart Notes, Kanban Tasks, Reminders, Pomodoro Focus Timer with Brownian noise, and Passwords.',
      icon: CheckSquare,
      category: 'Productivity',
      badge: 'All-in-One',
    },
  ];

  const filtered = toolsList.filter((t) =>
    t.title.toLowerCase().includes(filterSearch.toLowerCase()) ||
    t.description.toLowerCase().includes(filterSearch.toLowerCase()) ||
    t.category.toLowerCase().includes(filterSearch.toLowerCase())
  );

  return (
    <div className="min-h-full pb-20 pt-4 px-3 sm:px-6 max-w-6xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Wrench className="w-5 h-5 text-cyan-400" />
            <span>SONVEX Production Tools</span>
          </h1>
          <p className="text-xs text-slate-400">
            Real, functional tools engineered for daily productivity, mathematics, multi-modal analysis, and writing
          </p>
        </div>

        {selectedToolId && (
          <button
            onClick={() => setSelectedToolId(null)}
            className="self-start sm:self-auto text-xs px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-cyan-300 transition-colors"
          >
            ← Back to All Tools
          </button>
        )}
      </div>

      {/* If a tool is selected, render the dedicated tool view */}
      {selectedToolId ? (
        <div className="bg-[#080B14] p-4 sm:p-6 rounded-2xl border border-white/10 shadow-2xl">
          {selectedToolId === 'writer' && <AIWriterTool />}
          {selectedToolId === 'summarizer' && <SummarizerTool />}
          {selectedToolId === 'translator' && <TranslatorTool />}
          {selectedToolId === 'calculator' && <CalculatorTool />}
          {selectedToolId === 'converters' && <ConvertersTool />}
          {selectedToolId === 'qrcode' && <QRCodeTool />}
          {selectedToolId === 'media' && <MediaIntelligenceTool />}
          {selectedToolId === 'voice' && <VoiceTools />}
          {selectedToolId === 'productivity' && (
            <ProductivityTool
              tasks={tasks}
              setTasks={setTasks}
              notes={notes}
              setNotes={setNotes}
              reminders={reminders}
              setReminders={setReminders}
            />
          )}
        </div>
      ) : (
        /* Tools Catalog */
        <div className="space-y-6">
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              placeholder="Search tools (e.g. calculator, qr, translation, pdf)..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.id}
                  onClick={() => setSelectedToolId(tool.id)}
                  className="group cursor-pointer p-5 rounded-2xl bg-slate-900/50 hover:bg-[#0A1020] border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4 shadow-sm sonvex-glass-hover"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/5">
                        {tool.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 group-hover:text-cyan-400 font-medium">
                    <span>Open Tool</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
