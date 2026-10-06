import { Conversation, GeneratedImageItem, NoteItem, ReminderItem, TaskItem, UploadedFileItem } from '../types';

const STORAGE_KEYS = {
  CONVERSATIONS: 'sonvex_conversations_v1',
  ACTIVE_CONVO_ID: 'sonvex_active_convo_id_v1',
  TASKS: 'sonvex_tasks_v1',
  NOTES: 'sonvex_notes_v1',
  REMINDERS: 'sonvex_reminders_v1',
  IMAGES: 'sonvex_images_v1',
  FILES: 'sonvex_files_v1',
  SETTINGS: 'sonvex_settings_v1',
  SAVED_ITEMS: 'sonvex_saved_items_v1',
};

export interface AppSettings {
  userName: string;
  theme: 'dark' | 'midnight' | 'cyber';
  aiTemperature: number;
  voiceName: string;
  soundEnabled: boolean;
  autoSpeechOutput: boolean;
  hapticFeedback: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  userName: 'Operator',
  theme: 'dark',
  aiTemperature: 0.7,
  voiceName: 'Kore',
  soundEnabled: true,
  autoSpeechOutput: false,
  hapticFeedback: true,
};

export function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    if (!raw) {
      const initial: Conversation = {
        id: 'welcome-session',
        title: 'Welcome to SONVEX',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [
          {
            id: 'm-welcome',
            role: 'assistant',
            content: `# SONVEX Neural Core Initialized

Welcome to **SONVEX** — *One AI. Everything in One Place.*  
Created by **Sonal Yadav**.

I am your unified AI Operating System. Here are just a few commands you can run right now:

* 🌐 **Live Web Intelligence:** *"What are today's top breakthroughs in quantum computing?"*
* 📄 **Document & File Analysis:** Upload any PDF, CSV, TXT, or Code file to extract tables or summarize.
* 🎨 **AI Image Studio:** *"Generate a futuristic cyberpunk skyline reflected in water."*
* 🔬 **Reasoning & Code:** *"Write an optimized graph traversal algorithm with tests."*
* 🌍 **Universal Translation:** *"Translate this paragraph into Hindi, Spanish, and Japanese."*
* 🧮 **Scientific Math:** *"Calculate the orbital velocity at 400km altitude with step-by-step derivation."*

Type your request below or open the **Universal Command Bar** (*Cmd+K*).`,
            timestamp: new Date().toISOString(),
            modelUsed: 'gemini-3.8-flash',
          },
        ],
      };
      saveConversations([initial]);
      return [initial];
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse conversations:', err);
    return [];
  }
}

export function saveConversations(conversations: Conversation[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
  } catch (err) {
    console.error('Failed to save conversations:', err);
  }
}

export function loadTasks(): TaskItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) {
      const initial: TaskItem[] = [
        {
          id: 't-1',
          title: 'Explore SONVEX Universal Command Bar (Cmd+K)',
          description: 'Try asking natural questions, translations, math equations, or web searches.',
          status: 'in_progress',
          priority: 'high',
          createdAt: new Date().toISOString(),
        },
        {
          id: 't-2',
          title: 'Test Live Google Search Grounding',
          description: 'Search for live global events and verify real citations.',
          status: 'todo',
          priority: 'medium',
          createdAt: new Date().toISOString(),
        },
        {
          id: 't-3',
          title: 'Review Founder Architecture by Sonal Yadav',
          description: 'Inspect the technology vision and design principles behind SONVEX.',
          status: 'todo',
          priority: 'low',
          createdAt: new Date().toISOString(),
        },
      ];
      saveTasks(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveTasks(tasks: TaskItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks:', err);
  }
}

export function loadNotes(): NoteItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (!raw) {
      const initial: NoteItem[] = [
        {
          id: 'n-1',
          title: 'SONVEX Operating Principles',
          content: `### Core Mission
"One AI. Everything in One Place."
Founded and engineered by Sonal Yadav.

- **Unified Intelligence**: Zero fragmentation between chat, search, file analysis, and tools.
- **Enterprise Rigor**: High-security server-side execution, real grounding, no fake responses.
- **Speed & Elegance**: Instant mobile-first experience on any device.`,
          category: 'Vision',
          tags: ['SONVEX', 'Architecture', 'Sonal Yadav'],
          updatedAt: new Date().toISOString(),
        },
      ];
      saveNotes(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveNotes(notes: NoteItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  } catch (err) {
    console.error('Failed to save notes:', err);
  }
}

export function loadReminders(): ReminderItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveReminders(reminders: ReminderItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  } catch (err) {
    console.error('Failed to save reminders:', err);
  }
}

export function loadImages(): GeneratedImageItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.IMAGES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveImages(images: GeneratedImageItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(images));
  } catch (err) {
    console.error('Failed to save images:', err);
  }
}

export function loadUploadedFiles(): UploadedFileItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FILES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveUploadedFiles(files: UploadedFileItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files));
  } catch (err) {
    console.error('Failed to save files:', err);
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function exportWorkspaceJSON(): string {
  const data = {
    app: 'SONVEX',
    creator: 'Sonal Yadav',
    exportedAt: new Date().toISOString(),
    conversations: loadConversations(),
    tasks: loadTasks(),
    notes: loadNotes(),
    reminders: loadReminders(),
    images: loadImages(),
    settings: loadSettings(),
  };
  return JSON.stringify(data, null, 2);
}

export function importWorkspaceJSON(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.conversations) saveConversations(data.conversations);
    if (data.tasks) saveTasks(data.tasks);
    if (data.notes) saveNotes(data.notes);
    if (data.reminders) saveReminders(data.reminders);
    if (data.images) saveImages(data.images);
    if (data.settings) saveSettings(data.settings);
    return true;
  } catch (err) {
    console.error('Failed to import JSON data:', err);
    return false;
  }
}
