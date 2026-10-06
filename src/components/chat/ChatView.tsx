import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Square, Sparkles, Paperclip, Image as ImageIcon, 
  Mic, MicOff, Volume2, Copy, Check, RotateCw, Trash2, 
  Edit3, Plus, Search, Bot, User, AlertCircle, FileText, 
  ChevronRight, X, ArrowDown
} from 'lucide-react';
import { ChatMessage, Conversation } from '../../types';
import { sendChatMessage, synthesizeTTS } from '../../services/api';
import { saveConversations } from '../../services/storage';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatViewProps {
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  conversations,
  setConversations,
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const [activeConvoId, setActiveConvoId] = useState<string>(
    conversations[0]?.id || 'welcome-session'
  );
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchHistoryQuery, setSearchHistoryQuery] = useState('');
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [newTitleText, setNewTitleText] = useState('');
  const [attachments, setAttachments] = useState<Array<{
    name: string;
    mimeType: string;
    data: string;
    size?: number;
  }>>([]);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Active conversation
  const activeConvo = conversations.find((c) => c.id === activeConvoId) || conversations[0];

  // Auto scroll to bottom
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('auto');
  }, [activeConvoId]);

  useEffect(() => {
    scrollToBottom('smooth');
  }, [activeConvo?.messages?.length, isGenerating]);

  // Handle external initial prompt from Universal Command Bar
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  // Create New Chat
  const handleCreateNewChat = () => {
    const newId = `chat_${Date.now()}`;
    const newConvo: Conversation = {
      id: newId,
      title: 'New Conversation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    setConversations((prev) => {
      const updated = [newConvo, ...prev];
      saveConversations(updated);
      return updated;
    });
    setActiveConvoId(newId);
    setShowHistorySidebar(false);
  };

  // Delete Chat
  const handleDeleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConversations((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveConversations(updated);
      if (activeConvoId === id && updated.length > 0) {
        setActiveConvoId(updated[0].id);
      }
      return updated;
    });
  };

  // Rename Chat
  const handleSaveRename = (id: string) => {
    if (!newTitleText.trim()) {
      setEditingTitleId(null);
      return;
    }
    setConversations((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, title: newTitleText.trim() } : c));
      saveConversations(updated);
      return updated;
    });
    setEditingTitleId(null);
  };

  // File Upload Handling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = (reader.result as string).split(',')[1];
        setAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            mimeType: file.type || 'application/octet-stream',
            data: base64Data,
            size: file.size,
          },
        ]);
      };
      reader.readAsDataURL(file);
    }
    // reset input
    e.target.value = '';
  };

  // Voice Input via Web Speech API
  const handleToggleVoice = () => {
    if (isRecordingVoice) {
      setIsRecordingVoice(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your current browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsRecordingVoice(true);
      recognition.onend = () => setIsRecordingVoice(false);
      recognition.onerror = () => setIsRecordingVoice(false);

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputText(transcript);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsRecordingVoice(false);
    }
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if ((!query && attachments.length === 0) || isGenerating) return;

    // Reset input
    setInputText('');
    const currentAttachments = [...attachments];
    setAttachments([]);

    // Target conversation
    let currentId = activeConvoId;
    let convo = conversations.find((c) => c.id === currentId);

    if (!convo) {
      currentId = `chat_${Date.now()}`;
      convo = {
        id: currentId,
        title: query.slice(0, 30) || 'New Conversation',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      };
    }

    const userMessageId = `u_${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
      attachments: currentAttachments.length > 0 ? currentAttachments : undefined,
    };

    const assistantMessageId = `a_${Date.now()}`;
    const initialAssistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true,
      modelUsed: 'gemini-3.8-flash',
    };

    const updatedConvo: Conversation = {
      ...convo,
      title: convo.messages.length === 0 ? query.slice(0, 32) || 'Chat' : convo.title,
      updatedAt: new Date().toISOString(),
      messages: [...convo.messages, userMessage, initialAssistantMessage],
    };

    setConversations((prev) => {
      const exists = prev.some((c) => c.id === currentId);
      const next = exists
        ? prev.map((c) => (c.id === currentId ? updatedConvo : c))
        : [updatedConvo, ...prev];
      saveConversations(next);
      return next;
    });

    setIsGenerating(true);
    abortControllerRef.current = new AbortController();

    try {
      const messagesForAPI = updatedConvo.messages
        .slice(0, -1)
        .map((m) => ({ role: m.role, content: m.content }));

      let streamedText = '';

      await sendChatMessage(
        messagesForAPI,
        currentAttachments,
        undefined,
        (chunk) => {
          streamedText += chunk;
          setConversations((prev) => {
            return prev.map((c) => {
              if (c.id !== currentId) return c;
              return {
                ...c,
                messages: c.messages.map((m) => {
                  if (m.id === assistantMessageId) {
                    return { ...m, content: streamedText };
                  }
                  return m;
                }),
              };
            });
          });
        },
        abortControllerRef.current.signal
      );

      // Finish streaming
      setConversations((prev) => {
        const next = prev.map((c) => {
          if (c.id !== currentId) return c;
          return {
            ...c,
            messages: c.messages.map((m) => {
              if (m.id === assistantMessageId) {
                return { ...m, isStreaming: false };
              }
              return m;
            }),
          };
        });
        saveConversations(next);
        return next;
      });
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setConversations((prev) => {
          return prev.map((c) => {
            if (c.id !== currentId) return c;
            return {
              ...c,
              messages: c.messages.map((m) => {
                if (m.id === assistantMessageId) {
                  return { ...m, isStreaming: false, content: m.content + '\n\n*(Generation stopped by user)*' };
                }
                return m;
              }),
            };
          });
        });
      } else {
        setConversations((prev) => {
          return prev.map((c) => {
            if (c.id !== currentId) return c;
            return {
              ...c,
              messages: c.messages.map((m) => {
                if (m.id === assistantMessageId) {
                  return {
                    ...m,
                    isStreaming: false,
                    error: err.message || 'AI processing encountered an error',
                  };
                }
                return m;
              }),
            };
          });
        });
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  // Stop Generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // Regenerate Response
  const handleRegenerate = (index: number) => {
    if (!activeConvo || isGenerating) return;
    const messages = activeConvo.messages.slice(0, index);
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUser) return;

    // Prune subsequent messages
    setConversations((prev) => {
      const next = prev.map((c) => (c.id === activeConvo.id ? { ...c, messages } : c));
      saveConversations(next);
      return next;
    });

    handleSendMessage(lastUser.content);
  };

  // Copy Message Content
  const handleCopyMessage = (msgId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Text to Speech playback
  const handlePlayTTS = async (msgId: string, text: string) => {
    if (playingAudioId === msgId && currentAudioRef.current) {
      currentAudioRef.current.pause();
      setPlayingAudioId(null);
      return;
    }

    try {
      setPlayingAudioId(msgId);
      const res = await synthesizeTTS(text.slice(0, 800));
      const audioUrl = `data:${res.mimeType};base64,${res.audioBase64}`;
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;

      audio.onended = () => {
        setPlayingAudioId(null);
      };
      audio.onerror = () => {
        setPlayingAudioId(null);
      };
      audio.play();
    } catch (err) {
      console.warn('Backend TTS failed, falling back to Web Speech Synthesis:', err);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text.slice(0, 500));
        utterance.onend = () => setPlayingAudioId(null);
        utterance.onerror = () => setPlayingAudioId(null);
        window.speechSynthesis.speak(utterance);
      } else {
        setPlayingAudioId(null);
      }
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchHistoryQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-4rem-3.5rem)] relative overflow-hidden bg-[#05070B]">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        multiple
        accept=".pdf,.txt,.docx,.csv,.xlsx,.json,.js,.ts,.py,.html,.css"
      />
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept="image/*"
        multiple
      />

      {/* Mobile Sidebar Overlay */}
      {showHistorySidebar && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setShowHistorySidebar(false)}
        />
      )}

      {/* History Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-72 bg-[#080B13] border-r border-white/10 flex flex-col transition-transform duration-300 ${
          showHistorySidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-3 border-b border-white/10 space-y-2">
          <button
            onClick={handleCreateNewChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600/30 via-blue-600/20 to-purple-600/30 hover:from-cyan-600/40 hover:to-purple-600/40 border border-cyan-500/30 text-white font-medium text-xs sm:text-sm transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>New Chat</span>
          </button>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchHistoryQuery}
              onChange={(e) => setSearchHistoryQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900/60 border border-white/5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/30"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Conversations ({filteredConversations.length})
          </div>

          {filteredConversations.map((convo) => {
            const isActive = convo.id === activeConvoId;
            const isEditing = editingTitleId === convo.id;

            return (
              <div
                key={convo.id}
                onClick={() => {
                  setActiveConvoId(convo.id);
                  setShowHistorySidebar(false);
                }}
                className={`group relative flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all ${
                  isActive
                    ? 'bg-cyan-950/40 text-cyan-200 border border-cyan-500/30 shadow-inner'
                    : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                }`}
              >
                {isEditing ? (
                  <input
                    type="text"
                    value={newTitleText}
                    autoFocus
                    onChange={(e) => setNewTitleText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveRename(convo.id);
                      if (e.key === 'Escape') setEditingTitleId(null);
                    }}
                    onBlur={() => handleSaveRename(convo.id)}
                    className="w-full bg-slate-800 text-white px-2 py-1 rounded border border-cyan-400 focus:outline-none text-xs"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <div className="flex items-center gap-2 truncate pr-6">
                    <Sparkles className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="truncate font-medium">{convo.title}</span>
                  </div>
                )}

                {/* Hover actions */}
                {!isEditing && (
                  <div className="absolute right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/90 px-1 py-0.5 rounded-md">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTitleId(convo.id);
                        setNewTitleText(convo.title);
                      }}
                      className="p-1 hover:text-cyan-400 text-slate-400"
                      title="Rename"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteChat(e, convo.id)}
                      className="p-1 hover:text-rose-400 text-slate-400"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer info */}
        <div className="p-3 border-t border-white/10 text-[11px] text-slate-500 font-mono flex items-center justify-between">
          <span>Engine: Gemini 3.8 Flash</span>
          <span className="text-cyan-400 font-semibold">Active</span>
        </div>
      </aside>

      {/* Main Chat Interface */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Chat Header Bar */}
        <div className="h-12 border-b border-white/10 px-3 sm:px-4 flex items-center justify-between bg-[#060910]/60 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistorySidebar(true)}
              className="lg:hidden p-1.5 rounded-lg bg-slate-900 border border-white/10 text-slate-300"
              title="Chat History"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs sm:text-sm text-white truncate max-w-[200px] sm:max-w-md">
                {activeConvo?.title || 'SONVEX AI Chat'}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                gemini-3.8-flash
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateNewChat}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs text-slate-300 hover:text-cyan-300 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New</span>
            </button>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-6">
          {(!activeConvo || activeConvo.messages.length === 0) ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto py-10 px-4 space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-blue-600/20 to-purple-600/20 border border-cyan-500/30 flex items-center justify-center sonvex-glow-cyan">
                <Sparkles className="w-7 h-7 text-cyan-400" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">SONVEX Intelligence</h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Ask complex questions, analyze documents, write code, or execute multi-step plans.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full pt-2">
                {[
                  'Explain quantum computing in simple terms',
                  'Write a high-performance REST API in TypeScript',
                  'Summarize key principles of AI safety',
                  'Translate: "Welcome to the future of computing" into 5 languages',
                ].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(prompt)}
                    className="p-3 rounded-xl bg-slate-900/60 hover:bg-cyan-950/30 border border-white/5 hover:border-cyan-500/30 text-left text-xs text-slate-300 hover:text-cyan-200 transition-all shadow-sm"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            activeConvo.messages.map((message, idx) => {
              const isUser = message.role === 'user';
              const isAssistant = message.role === 'assistant';

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 max-w-4xl mx-auto ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 sonvex-glow-cyan text-cyan-400 mt-1">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`relative group max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 transition-all ${
                      isUser
                        ? 'bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-cyan-500/30 text-slate-100 shadow-md'
                        : 'bg-slate-900/60 border border-white/10 text-slate-200 shadow-sm'
                    }`}
                  >
                    {/* User attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3 pb-2 border-b border-white/10">
                        {message.attachments.map((att, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/40 border border-white/10 text-xs font-mono text-cyan-300"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[150px]">{att.name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Content or Streaming */}
                    {message.content ? (
                      <MarkdownRenderer content={message.content} />
                    ) : message.isStreaming ? (
                      <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono">
                        <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                        <span>SONVEX is thinking and formulating response...</span>
                      </div>
                    ) : null}

                    {/* Error state */}
                    {message.error && (
                      <div className="flex items-center gap-2 p-3 mt-2 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{message.error}</span>
                      </div>
                    )}

                    {/* Message Actions */}
                    {isAssistant && message.content && (
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5 text-xs text-slate-400">
                        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                          <span>{message.modelUsed || 'gemini-3.8-flash'}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handlePlayTTS(message.id, message.content)}
                            className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${
                              playingAudioId === message.id ? 'text-cyan-400 bg-cyan-950/50' : 'text-slate-400 hover:text-white'
                            }`}
                            title="Listen (Text-to-Speech)"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleCopyMessage(message.id, message.content)}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                            title="Copy response"
                          >
                            {copiedMsgId === message.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => handleRegenerate(idx)}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                            title="Regenerate"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center flex-shrink-0 text-slate-300 mt-1">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar & Controls */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-[#060910]/80 backdrop-blur-xl">
          <div className="max-w-4xl mx-auto space-y-2">
            {/* Attachment preview pills */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 pb-1">
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/50 border border-cyan-500/30 text-xs text-cyan-300"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[150px]">{att.name}</span>
                    <button
                      onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                      className="hover:text-rose-400 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="relative flex items-end gap-2 bg-slate-900/80 rounded-2xl border border-white/10 focus-within:border-cyan-500/50 shadow-lg p-2 transition-all">
              {/* Attachment Actions */}
              <div className="flex items-center gap-1 pb-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 transition-colors"
                  title="Upload Document / File (PDF, TXT, CSV, DOCX)"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 transition-colors"
                  title="Upload Image for Vision Analysis"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleToggleVoice}
                  className={`p-2 rounded-xl transition-colors ${
                    isRecordingVoice
                      ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                      : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80'
                  }`}
                  title={isRecordingVoice ? 'Listening...' : 'Voice Input'}
                >
                  {isRecordingVoice ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>

              {/* Textarea */}
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={isRecordingVoice ? 'Listening to speech...' : 'Message SONVEX or press Enter to send...'}
                rows={1}
                className="flex-1 bg-transparent text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none resize-none py-2 px-1 max-h-32"
              />

              {/* Send or Stop button */}
              <div className="pb-1">
                {isGenerating ? (
                  <button
                    onClick={handleStopGeneration}
                    className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 transition-colors"
                    title="Stop Generation"
                  >
                    <Square className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim() && attachments.length === 0}
                    className={`p-2 rounded-xl transition-all ${
                      inputText.trim() || attachments.length > 0
                        ? 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-md shadow-cyan-500/30 active:scale-95'
                        : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    }`}
                    title="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 px-2 font-mono">
              <span className="hidden sm:inline">Shift+Enter for newline</span>
              <span className="text-cyan-400/80 font-sans">SONVEX Neural Engine • Sonal Yadav</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
