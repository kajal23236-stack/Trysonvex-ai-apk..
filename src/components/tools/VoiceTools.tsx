import React, { useState, useRef } from 'react';
import { Mic, MicOff, Volume2, Download, Play, Square, Loader2, Sparkles, Upload } from 'lucide-react';
import { synthesizeTTS, transcribeAudioData } from '../../services/api';

export const VoiceTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tts' | 'transcribe'>('tts');

  // TTS State
  const [ttsText, setTtsText] = useState('Welcome to SONVEX, the unified AI Operating System engineered by Sonal Yadav.');
  const [voice, setVoice] = useState('Kore');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loadingTTS, setLoadingTTS] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Transcribe State
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptResult, setTranscriptResult] = useState('');
  const [loadingTranscribe, setLoadingTranscribe] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Generate TTS
  const handleGenerateTTS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ttsText.trim() || loadingTTS) return;

    setLoadingTTS(true);
    setAudioUrl(null);

    try {
      const res = await synthesizeTTS(ttsText, voice);
      const url = `data:${res.mimeType};base64,${res.audioBase64}`;
      setAudioUrl(url);
    } catch (err: any) {
      console.warn('Server TTS failed, using browser speech synthesis:', err);
      // Browser fallback
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(ttsText);
        window.speechSynthesis.speak(u);
      } else {
        alert(err.message || 'TTS generation failed');
      }
    } finally {
      setLoadingTTS(false);
    }
  };

  // Play/Stop Audio
  const togglePlay = () => {
    if (!audioUrl) return;
    if (!audioElementRef.current) {
      audioElementRef.current = new Audio(audioUrl);
      audioElementRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  // Start Mic Recording for Transcribe
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = async () => {
          const base64Data = (reader.result as string).split(',')[1];
          setLoadingTranscribe(true);
          try {
            const res = await transcribeAudioData(base64Data, 'audio/webm');
            setTranscriptResult(res.text);
          } catch (err: any) {
            alert('Transcription failed: ' + err.message);
          } finally {
            setLoadingTranscribe(false);
          }
        };
        reader.readAsDataURL(audioBlob);

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert('Microphone access denied or unavailable: ' + err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Voice & Speech Studio</h2>
            <p className="text-xs text-slate-400">Studio-grade Text-to-Speech synthesis and verbatim audio transcription</p>
          </div>
        </div>

        <div className="flex p-1 rounded-xl bg-slate-900 border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('tts')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'tts' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Text-to-Speech
          </button>
          <button
            onClick={() => setActiveTab('transcribe')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'transcribe' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Audio Transcription
          </button>
        </div>
      </div>

      {activeTab === 'tts' ? (
        /* TTS STUDIO */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <form onSubmit={handleGenerateTTS} className="md:col-span-7 bg-slate-900/60 p-5 rounded-2xl border border-white/10 space-y-4 shadow-xl">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Script / Speech Text
              </label>
              <textarea
                rows={5}
                value={ttsText}
                onChange={(e) => setTtsText(e.target.value)}
                placeholder="Type or paste text to synthesize..."
                className="w-full rounded-xl bg-slate-950 border border-white/10 p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Voice Model Persona
              </label>
              <div className="grid grid-cols-5 gap-2">
                {['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVoice(v)}
                    className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                      voice === v
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                        : 'bg-slate-950 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingTTS || !ttsText.trim()}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              {loadingTTS ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{loadingTTS ? 'Synthesizing Audio Waveform...' : 'Synthesize Speech'}</span>
            </button>
          </form>

          {/* Audio Player Card */}
          <div className="md:col-span-5 bg-slate-900/30 p-5 rounded-2xl border border-white/10 flex flex-col items-center justify-center space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-600/20 border border-cyan-500/30 flex items-center justify-center sonvex-glow-cyan">
              <Volume2 className="w-10 h-10 text-cyan-400" />
            </div>

            <div className="text-center">
              <div className="text-sm font-semibold text-white">Voice: {voice}</div>
              <div className="text-xs text-slate-400">24kHz Studio Audio</div>
            </div>

            {audioUrl ? (
              <div className="w-full space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={togglePlay}
                    className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs flex items-center justify-center gap-2"
                  >
                    {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlaying ? 'Pause' : 'Play Audio'}</span>
                  </button>

                  <a
                    href={audioUrl}
                    download={`sonvex_speech_${Date.now()}.wav`}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center"
                    title="Download WAV"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 text-center">
                Click Synthesize to render natural speech.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* TRANSCRIBE STUDIO */
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-white/10 space-y-6 shadow-xl max-w-2xl mx-auto">
          <div className="text-center space-y-2">
            <div className="inline-flex p-4 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-2">
              <Mic className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white">Record Audio for AI Transcription</h3>
            <p className="text-xs text-slate-400">
              Captures high-accuracy speech and transcribes using Gemini transcribe engine
            </p>
          </div>

          <div className="flex justify-center">
            {isRecording ? (
              <button
                onClick={stopRecording}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-rose-500 hover:bg-rose-400 text-white font-semibold text-xs sm:text-sm animate-pulse shadow-lg shadow-rose-500/30"
              >
                <Square className="w-4 h-4" />
                <span>Stop Recording</span>
              </button>
            ) : (
              <button
                onClick={startRecording}
                disabled={loadingTranscribe}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs sm:text-sm shadow-lg shadow-cyan-500/30 active:scale-95"
              >
                <Mic className="w-4 h-4" />
                <span>Start Microphone Recording</span>
              </button>
            )}
          </div>

          {loadingTranscribe && (
            <div className="flex items-center justify-center gap-2 text-cyan-400 text-xs font-mono">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Transcribing audio verbatim...</span>
            </div>
          )}

          {transcriptResult && (
            <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider">Transcription</span>
                <button
                  onClick={() => navigator.clipboard.writeText(transcriptResult)}
                  className="hover:text-white"
                >
                  Copy
                </button>
              </div>
              <div className="text-sm text-white leading-relaxed">{transcriptResult}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
