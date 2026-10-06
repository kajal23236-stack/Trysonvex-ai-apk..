import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Volume2, Sparkles, Loader2, Square, RotateCcw } from 'lucide-react';
import { sendChatMessage, synthesizeTTS } from '../../services/api';

interface VoiceOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceOSModal: React.FC<VoiceOSModalProps> = ({ isOpen, onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [statusMessage, setStatusMessage] = useState('Tap the core to begin speaking');

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      handleStopAll();
    } else {
      setStatusMessage('Tap the core to begin speaking');
      setTranscript('');
      setAiResponse('');
    }
  }, [isOpen]);

  const handleStopAll = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsListening(false);
    setIsThinking(false);
    setIsSpeaking(false);
  };

  const startVoiceInput = () => {
    handleStopAll();
    setTranscript('');
    setAiResponse('');

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatusMessage('Speech Recognition not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setStatusMessage('Listening to your voice...');
      };

      recognition.onresult = (event: any) => {
        const text = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join('');
        setTranscript(text);
      };

      recognition.onerror = (e: any) => {
        console.error('Recognition error:', e);
        setIsListening(false);
        setStatusMessage('Could not recognize audio. Try again.');
      };

      recognition.onend = () => {
        setIsListening(false);
        // If we captured something, send to AI
        recognitionRef.current = null;
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setStatusMessage('Microphone access blocked.');
      setIsListening(false);
    }
  };

  // When listening stops and transcript exists, process AI response
  useEffect(() => {
    if (!isListening && transcript.trim() && !isThinking && !isSpeaking) {
      processAiAnswer(transcript);
    }
  }, [isListening, transcript]);

  const processAiAnswer = async (userPrompt: string) => {
    setIsThinking(true);
    setStatusMessage('SONVEX Neural Brain processing...');

    try {
      const response = await sendChatMessage(
        [{ role: 'user', content: userPrompt }],
        undefined,
        'You are SONVEX Voice OS, created by Sonal Yadav. Provide a concise, clear spoken response under 3 sentences.'
      );

      setAiResponse(response);
      setIsThinking(false);
      speakResponse(response);
    } catch (err: any) {
      setIsThinking(false);
      setStatusMessage('Error: ' + err.message);
    }
  };

  const speakResponse = async (text: string) => {
    setIsSpeaking(true);
    setStatusMessage('SONVEX is speaking...');

    try {
      const res = await synthesizeTTS(text.slice(0, 500), 'Kore');
      const audio = new Audio(`data:${res.mimeType};base64,${res.audioBase64}`);
      currentAudioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        setStatusMessage('Tap to speak again');
      };
      audio.onerror = () => {
        fallbackBrowserTTS(text);
      };
      audio.play();
    } catch {
      fallbackBrowserTTS(text);
    }
  };

  const fallbackBrowserTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.onend = () => {
        setIsSpeaking(false);
        setStatusMessage('Tap to speak again');
      };
      u.onerror = () => {
        setIsSpeaking(false);
        setStatusMessage('Tap to speak again');
      };
      window.speechSynthesis.speak(u);
    } else {
      setIsSpeaking(false);
      setStatusMessage('Tap to speak again');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg flex flex-col items-center justify-between min-h-[520px] p-6 text-center">
        {/* Top Header */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-300 uppercase">
              SONVEX Neural Voice OS
            </span>
          </div>

          <button
            onClick={() => {
              handleStopAll();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Futuristic Audio Visualizer Orb */}
        <div className="relative my-8 flex items-center justify-center">
          {/* Animated rings */}
          <div
            className={`absolute w-64 h-64 rounded-full border border-cyan-500/20 transition-all duration-700 ${
              isListening || isSpeaking ? 'scale-125 opacity-100 animate-spin' : 'scale-90 opacity-40'
            }`}
          />
          <div
            className={`absolute w-52 h-52 rounded-full border border-purple-500/30 transition-all duration-500 ${
              isListening || isSpeaking ? 'scale-110 opacity-80' : 'scale-90 opacity-30'
            }`}
          />

          {/* Main Pulsating Core */}
          <button
            onClick={() => {
              if (isListening || isSpeaking) {
                handleStopAll();
                setStatusMessage('Stopped. Tap to speak.');
              } else {
                startVoiceInput();
              }
            }}
            className={`relative z-10 w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl active:scale-95 ${
              isListening
                ? 'bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 shadow-[0_0_80px_rgba(6,182,212,0.6)] animate-pulse'
                : isSpeaking
                ? 'bg-gradient-to-tr from-purple-500 via-pink-600 to-cyan-500 shadow-[0_0_80px_rgba(168,85,247,0.6)] animate-pulse'
                : isThinking
                ? 'bg-gradient-to-tr from-blue-700 to-cyan-700 shadow-[0_0_50px_rgba(37,99,235,0.4)]'
                : 'bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 border border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.25)]'
            }`}
          >
            {isThinking ? (
              <Loader2 className="w-12 h-12 text-cyan-300 animate-spin" />
            ) : isListening ? (
              <Mic className="w-12 h-12 text-white animate-bounce" />
            ) : isSpeaking ? (
              <Volume2 className="w-12 h-12 text-white animate-pulse" />
            ) : (
              <Mic className="w-12 h-12 text-cyan-400" />
            )}
          </button>
        </div>

        {/* Live Status & Text Transcript Display */}
        <div className="w-full space-y-4 max-w-md">
          <div className="text-xs font-mono font-medium text-cyan-300">
            {statusMessage}
          </div>

          {transcript && (
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 text-xs sm:text-sm text-slate-300 italic">
              "{transcript}"
            </div>
          )}

          {aiResponse && (
            <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs sm:text-sm text-white font-medium leading-relaxed shadow-lg">
              {aiResponse}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="text-[11px] text-slate-500 font-mono pt-4">
          SONVEX Voice Engine • Sonal Yadav
        </div>
      </div>
    </div>
  );
};
