import React, { useState } from 'react';
import { 
  FolderKanban, MessageSquare, FileText, CheckSquare, 
  Image as ImageIcon, Download, Upload, Trash2, ArrowRight, 
  Sparkles, HardDrive, ShieldCheck, Plus
} from 'lucide-react';
import { Conversation, GeneratedImageItem, NoteItem, TaskItem, UploadedFileItem, ActiveTab } from '../../types';
import { exportWorkspaceJSON, importWorkspaceJSON } from '../../services/storage';

interface WorkspaceViewProps {
  conversations: Conversation[];
  notes: NoteItem[];
  tasks: TaskItem[];
  images: GeneratedImageItem[];
  files: UploadedFileItem[];
  setActiveTab: (tab: ActiveTab) => void;
  onSelectChat?: (convoId: string) => void;
  onRefreshData?: () => void;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  conversations,
  notes,
  tasks,
  images,
  files,
  setActiveTab,
  onSelectChat,
  onRefreshData,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'chats' | 'notes' | 'tasks' | 'images' | 'backup'>('all');

  const handleExportBackup = () => {
    const jsonStr = exportWorkspaceJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sonvex_workspace_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const ok = importWorkspaceJSON(reader.result as string);
      if (ok) {
        alert('Workspace backup restored successfully!');
        if (onRefreshData) onRefreshData();
      } else {
        alert('Failed to parse workspace backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-full pb-20 pt-4 px-3 sm:px-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Personal Workspace</h1>
            <p className="text-xs text-slate-400">Encrypted personal vault for chats, tasks, notes, documents, and media</p>
          </div>
        </div>

        {/* Export / Backup quick action */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs text-slate-300 hover:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup</span>
          </button>
        </div>
      </div>

      {/* Workspace Subtabs */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-white/5">
        {[
          { id: 'all', label: 'Overview', count: null },
          { id: 'chats', label: 'AI Chats', count: conversations.length },
          { id: 'notes', label: 'Notes', count: notes.length },
          { id: 'tasks', label: 'Tasks', count: tasks.length },
          { id: 'images', label: 'Images', count: images.length },
          { id: 'backup', label: 'Backup & Sync', count: null },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === tab.id
                ? 'bg-cyan-500 text-black shadow-md'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeSubTab === tab.id ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* OVERVIEW (ALL) */}
      {activeSubTab === 'all' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Saved Chats', count: conversations.length, icon: MessageSquare, color: 'text-cyan-400' },
              { label: 'Active Tasks', count: tasks.filter(t => t.status !== 'completed').length, icon: CheckSquare, color: 'text-emerald-400' },
              { label: 'Smart Notes', count: notes.length, icon: FileText, color: 'text-purple-400' },
              { label: 'Studio Images', count: images.length, icon: ImageIcon, color: 'text-pink-400' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{stat.label}</span>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-mono font-bold text-white">{stat.count}</div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recent Chats Section */}
            <div className="bg-slate-900/40 p-5 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Recent AI Conversations</span>
                <button onClick={() => setActiveTab('chat')} className="text-xs text-cyan-400 hover:underline">Open Chat</button>
              </div>
              <div className="space-y-1.5">
                {conversations.slice(0, 4).map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setActiveTab('chat')}
                    className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-white/5 cursor-pointer flex items-center justify-between text-xs"
                  >
                    <span className="text-white font-medium truncate pr-2">{c.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">{c.messages.length} msgs</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Notes Section */}
            <div className="bg-slate-900/40 p-5 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Quick Notes</span>
                <button onClick={() => setActiveSubTab('notes')} className="text-xs text-cyan-400 hover:underline">View All</button>
              </div>
              <div className="space-y-1.5">
                {notes.slice(0, 4).map((n) => (
                  <div key={n.id} className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">{n.title}</span>
                      <span className="text-[10px] text-cyan-400 font-mono">{n.category}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{n.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHATS SUBTAB */}
      {activeSubTab === 'chats' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => setActiveTab('chat')}
                className="p-4 rounded-xl bg-slate-900/50 hover:bg-slate-900/80 border border-white/10 hover:border-cyan-500/40 cursor-pointer transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="text-sm font-bold text-white">{c.title}</div>
                  <div className="text-xs text-slate-400 line-clamp-2 mt-1">
                    {c.messages[c.messages.length - 1]?.content.slice(0, 100) || 'Empty conversation'}
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-2 border-t border-white/5">
                  <span>{new Date(c.updatedAt).toLocaleDateString()}</span>
                  <span className="text-cyan-400 font-semibold">{c.messages.length} messages</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NOTES SUBTAB */}
      {activeSubTab === 'notes' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {notes.map((note) => (
            <div key={note.id} className="p-4 rounded-xl bg-slate-900/50 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{note.title}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300">
                  {note.category}
                </span>
              </div>
              <p className="text-xs text-slate-300 whitespace-pre-wrap">{note.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* TASKS SUBTAB */}
      {activeSubTab === 'tasks' && (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="p-3 rounded-xl bg-slate-900/50 border border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckSquare className={`w-4 h-4 ${task.status === 'completed' ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span className={task.status === 'completed' ? 'line-through text-slate-500' : 'text-white'}>
                  {task.title}
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 capitalize">
                {task.priority}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* IMAGES SUBTAB */}
      {activeSubTab === 'images' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {images.map((img) => (
            <div key={img.id} className="rounded-xl overflow-hidden border border-white/10 aspect-square bg-black">
              <img src={img.url} alt={img.prompt} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* BACKUP & SYNC SUBTAB */}
      {activeSubTab === 'backup' && (
        <div className="max-w-xl mx-auto bg-slate-900/60 p-6 rounded-2xl border border-white/10 space-y-6 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto">
            <HardDrive className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-base font-bold text-white">Full Workspace Backup & Portability</h3>
            <p className="text-xs text-slate-400 mt-1">
              Your SONVEX workspace data is completely private. You can export a snapshot or import one from any device.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleExportBackup}
              className="py-3 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON Backup</span>
            </button>

            <label className="py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Restore from JSON</span>
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
