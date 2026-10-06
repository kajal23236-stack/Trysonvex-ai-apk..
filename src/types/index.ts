export type ActiveTab = 'home' | 'chat' | 'search' | 'tools' | 'workspace' | 'founder' | 'studio';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachments?: {
    name: string;
    mimeType: string;
    data: string; // base64
    size?: number;
  }[];
  isStreaming?: boolean;
  error?: string;
  modelUsed?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  pinned?: boolean;
}

export interface SearchSource {
  title: string;
  url: string;
  snippet?: string;
}

export interface SearchResponseData {
  query: string;
  answer: string;
  sources: SearchSource[];
  searchQueries: string[];
  elapsedMs: number;
  timestamp: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  updatedAt: string;
}

export interface ReminderItem {
  id: string;
  title: string;
  dateTime: string;
  triggered: boolean;
  repeat: 'none' | 'daily' | 'weekly';
}

export interface GeneratedImageItem {
  id: string;
  url: string;
  prompt: string;
  aspectRatio: string;
  createdAt: string;
}

export interface UploadedFileItem {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  data: string; // base64
  uploadedAt: string;
  analysisSummary?: string;
}

export interface SystemHealthData {
  status: string;
  app: string;
  tagline: string;
  founder: string;
  created_by: string;
  version: string;
  geminiConfigured: boolean;
  models: {
    core: string;
    image: string;
    transcribe: string;
    tts: string;
  };
  capabilities: string[];
}
