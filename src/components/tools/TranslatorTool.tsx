import React, { useState } from 'react';
import { Languages, Sparkles, Copy, Check, Volume2, ArrowRightLeft, Loader2 } from 'lucide-react';
import { translateTextContent, synthesizeTTS } from '../../services/api';

export const TranslatorTool: React.FC = () => {
  const [sourceText, setSourceText] = useState('');
  const [targetLang, setTargetLang] = useState('Hindi');
  const [sourceLang, setSourceLang] = useState('auto');
  const [translatedData, setTranslatedData] = useState<{
    translatedText: string;
    detectedSourceLanguage: string;
    phoneticOrPronunciation?: string;
    contextNotes?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [playingTTS, setPlayingTTS] = useState(false);

  const languages = [
    'Hindi', 'Spanish', 'French', 'German', 'Japanese', 'Mandarin Chinese', 
    'Arabic', 'Russian', 'Portuguese', 'Italian', 'Korean', 'Bengali', 
    'Telugu', 'Marathi', 'Tamil', 'Urdu', 'Gujarati', 'Kannada', 'Malayalam', 
    'Punjabi', 'Dutch', 'Swedish', 'Turkish', 'Vietnamese', 'Indonesian', 'Greek'
  ];

  const handleTranslate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!sourceText.trim() || loading) return;

    setLoading(true);
    try {
      const res = await translateTextContent({
        text: sourceText,
        targetLanguage: targetLang,
        sourceLanguage: sourceLang,
      });
      setTranslatedData(res);
    } catch (err: any) {
      alert(err.message || 'Translation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!translatedData) return;
    navigator.clipboard.writeText(translatedData.translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlayAudio = async () => {
    if (!translatedData || playingTTS) return;
    setPlayingTTS(true);

    try {
      const res = await synthesizeTTS(translatedData.translatedText.slice(0, 500));
      const audio = new Audio(`data:${res.mimeType};base64,${res.audioBase64}`);
      audio.onended = () => setPlayingTTS(false);
      audio.onerror = () => setPlayingTTS(false);
      audio.play();
    } catch {
      // browser fallback
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(translatedData.translatedText.slice(0, 300));
        u.onend = () => setPlayingTTS(false);
        u.onerror = () => setPlayingTTS(false);
        window.speechSynthesis.speak(u);
      } else {
        setPlayingTTS(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400">
          <Languages className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white">Universal Neural Translator</h2>
          <p className="text-xs text-slate-400">High-fidelity multi-lingual translation with cultural nuances & pronunciation</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/60 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold uppercase">From:</span>
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className="rounded-lg bg-slate-950 border border-white/10 px-2.5 py-1 text-xs text-white focus:outline-none"
          >
            <option value="auto">Auto-Detect</option>
            <option value="English">English</option>
            {languages.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => {
            if (sourceLang !== 'auto') {
              const temp = sourceLang;
              setSourceLang(targetLang);
              setTargetLang(temp);
            }
          }}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          title="Swap Languages"
        >
          <ArrowRightLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold uppercase">To:</span>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="rounded-lg bg-slate-950 border border-white/10 px-2.5 py-1 text-xs text-white focus:outline-none focus:border-pink-500/50"
          >
            {languages.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source Textarea */}
        <div className="bg-slate-900/40 p-4 rounded-2xl border border-white/10 flex flex-col min-h-[260px]">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 mb-2 border-b border-white/5">
            <span>Input Text</span>
            <span>{sourceText.length} chars</span>
          </div>
          <textarea
            rows={7}
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Type or paste text to translate..."
            className="flex-1 w-full bg-transparent text-white text-sm placeholder:text-slate-500 focus:outline-none resize-none"
          />
          <button
            onClick={() => handleTranslate()}
            disabled={loading || !sourceText.trim()}
            className="mt-3 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-black font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Translate</span>
          </button>
        </div>

        {/* Translation Output */}
        <div className="bg-slate-900/30 p-4 rounded-2xl border border-white/10 flex flex-col min-h-[260px]">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 mb-2 border-b border-white/5">
            <span>
              {translatedData
                ? `Translated to ${targetLang} (detected ${translatedData.detectedSourceLanguage})`
                : 'Translation Output'}
            </span>
            {translatedData && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePlayAudio}
                  className={`p-1 hover:text-white transition-colors ${playingTTS ? 'text-pink-400' : 'text-slate-400'}`}
                  title="Pronounce translation"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCopy}
                  className="p-1 hover:text-white text-slate-400"
                  title="Copy translation"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-between">
            {translatedData ? (
              <div className="space-y-3">
                <div className="text-base text-white font-medium leading-relaxed">
                  {translatedData.translatedText}
                </div>

                {translatedData.phoneticOrPronunciation && (
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-slate-300 font-mono">
                    <span className="text-pink-400 font-semibold mr-1.5">Phonetic:</span>
                    {translatedData.phoneticOrPronunciation}
                  </div>
                )}

                {translatedData.contextNotes && (
                  <div className="text-[11px] text-slate-400 italic">
                    Note: {translatedData.contextNotes}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                Translation will appear here in real-time.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
