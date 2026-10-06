import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { HomeScreen } from './components/home/HomeScreen';
import { ChatView } from './components/chat/ChatView';
import { WebSearchView } from './components/search/WebSearchView';
import { ToolsView } from './components/tools/ToolsView';
import { WorkspaceView } from './components/workspace/WorkspaceView';
import { FounderProfileView } from './components/founder/FounderProfileView';
import { ImageStudioView } from './components/image/ImageStudioView';
import { UniversalCommandModal } from './components/command/UniversalCommandModal';
import { VoiceOSModal } from './components/voice/VoiceOSModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { InstallPhoneModal } from './components/install/InstallPhoneModal';
import { OfflineIndicator } from './components/install/OfflineIndicator';

import { ActiveTab, Conversation, GeneratedImageItem, NoteItem, ReminderItem, SystemHealthData, TaskItem, UploadedFileItem } from './types';
import { 
  loadConversations, saveConversations, 
  loadTasks, saveTasks, 
  loadNotes, saveNotes, 
  loadReminders, saveReminders, 
  loadImages, saveImages, 
  loadUploadedFiles, saveUploadedFiles, 
  loadSettings, saveSettings, 
  AppSettings 
} from './services/storage';
import { fetchSystemHealth } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [conversations, setConversations] = useState<Conversation[]>(loadConversations);
  const [tasks, setTasks] = useState<TaskItem[]>(loadTasks);
  const [notes, setNotes] = useState<NoteItem[]>(loadNotes);
  const [reminders, setReminders] = useState<ReminderItem[]>(loadReminders);
  const [images, setImages] = useState<GeneratedImageItem[]>(loadImages);
  const [files, setFiles] = useState<UploadedFileItem[]>(loadUploadedFiles);
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [systemHealth, setSystemHealth] = useState<SystemHealthData | null>(null);

  // Command & Modal state
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Execution Handlers
  const [pendingChatPrompt, setPendingChatPrompt] = useState<string | undefined>();
  const [pendingSearchQuery, setPendingSearchQuery] = useState<string | undefined>();
  const [pendingToolAction, setPendingToolAction] = useState<string | undefined>();

  // Fetch health status on mount
  useEffect(() => {
    fetchSystemHealth()
      .then((data) => setSystemHealth(data))
      .catch((err) => console.warn('System health check:', err.message));
  }, []);

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Universal Prompt Execution
  const handleExecutePrompt = (
    prompt: string,
    targetTab: ActiveTab = 'chat',
    directAction?: string
  ) => {
    if (targetTab === 'search') {
      setPendingSearchQuery(prompt);
      setActiveTab('search');
    } else if (targetTab === 'tools') {
      setPendingToolAction(directAction || 'writer');
      setActiveTab('tools');
    } else {
      setPendingChatPrompt(prompt);
      setActiveTab('chat');
    }
  };

  const handleClearData = () => {
    localStorage.clear();
    setConversations(loadConversations());
    setTasks(loadTasks());
    setNotes(loadNotes());
    setReminders(loadReminders());
    setImages(loadImages());
    setFiles(loadUploadedFiles());
    setSettings(loadSettings());
  };

  return (
    <div className="min-h-screen bg-[#05070B] text-[#F3F4F6] flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Futuristic Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCommand={() => setIsCommandOpen(true)}
        onOpenVoice={() => setIsVoiceOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenInstall={() => setIsInstallModalOpen(true)}
        systemHealth={systemHealth}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 w-full relative">
        {activeTab === 'home' && (
          <HomeScreen
            setActiveTab={setActiveTab}
            onOpenCommand={() => setIsCommandOpen(true)}
            onOpenInstall={() => setIsInstallModalOpen(true)}
            onExecutePrompt={handleExecutePrompt}
            recentConversations={conversations}
            tasks={tasks}
            notes={notes}
          />
        )}

        {activeTab === 'chat' && (
          <ChatView
            conversations={conversations}
            setConversations={setConversations}
            initialPrompt={pendingChatPrompt}
            onClearInitialPrompt={() => setPendingChatPrompt(undefined)}
          />
        )}

        {activeTab === 'search' && (
          <WebSearchView
            initialQuery={pendingSearchQuery}
            onClearInitialQuery={() => setPendingSearchQuery(undefined)}
          />
        )}

        {activeTab === 'tools' && (
          <ToolsView
            initialTool={pendingToolAction}
            onClearInitialTool={() => setPendingToolAction(undefined)}
            tasks={tasks}
            setTasks={setTasks}
            notes={notes}
            setNotes={setNotes}
            reminders={reminders}
            setReminders={setReminders}
          />
        )}

        {activeTab === 'workspace' && (
          <WorkspaceView
            conversations={conversations}
            notes={notes}
            tasks={tasks}
            images={images}
            files={files}
            setActiveTab={setActiveTab}
            onRefreshData={() => {
              setConversations(loadConversations());
              setTasks(loadTasks());
              setNotes(loadNotes());
              setReminders(loadReminders());
              setImages(loadImages());
            }}
          />
        )}

        {activeTab === 'founder' && <FounderProfileView />}
      </main>

      {/* Universal Command Bar Modal (Cmd+K) */}
      <UniversalCommandModal
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        setActiveTab={setActiveTab}
        onExecutePrompt={handleExecutePrompt}
        onOpenVoice={() => setIsVoiceOpen(true)}
      />

      {/* Futuristic Voice OS Modal */}
      <VoiceOSModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
      />

      {/* System Settings & Diagnostics Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        setSettings={setSettings}
        systemHealth={systemHealth}
        onClearData={handleClearData}
        onOpenInstall={() => setIsInstallModalOpen(true)}
      />

      {/* Phone Install & GitHub APK Modal */}
      <InstallPhoneModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Offline Connectivity Indicator */}
      <OfflineIndicator />

      {/* Android-first Bottom Navigation Bar */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
