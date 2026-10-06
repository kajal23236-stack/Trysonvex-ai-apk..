import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckSquare, FileText, Bell, Timer, KeyRound, Calendar, 
  Plus, Trash2, Check, Clock, Play, Pause, RotateCcw, Volume2, 
  VolumeX, Copy, Sparkles, Shield
} from 'lucide-react';
import { NoteItem, ReminderItem, TaskItem } from '../../types';
import { saveNotes, saveTasks, saveReminders } from '../../services/storage';

interface ProductivityToolProps {
  tasks: TaskItem[];
  setTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>;
  notes: NoteItem[];
  setNotes: React.Dispatch<React.SetStateAction<NoteItem[]>>;
  reminders: ReminderItem[];
  setReminders: React.Dispatch<React.SetStateAction<ReminderItem[]>>;
}

export const ProductivityTool: React.FC<ProductivityToolProps> = ({
  tasks,
  setTasks,
  notes,
  setNotes,
  reminders,
  setReminders,
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'notes' | 'reminders' | 'timer' | 'password' | 'datetime'>('tasks');

  // Task Input State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Notes Input State
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState('General');

  // Reminder Input State
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('');

  // Pomodoro Timer State
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60); // 25 min
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');
  const [ambientSound, setAmbientSound] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  // Password Generator State
  const [pwdLength, setPwdLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [pwdCopied, setPwdCopied] = useState(false);

  // Date/Time State
  const [date1, setDate1] = useState(new Date().toISOString().split('T')[0]);
  const [date2, setDate2] = useState(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);

  // Pomodoro Interval
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime((prev) => prev - 1);
      }, 1000);
    } else if (pomodoroTime === 0) {
      setIsTimerRunning(false);
      // Play ding sound
      playBeep();
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, pomodoroTime]);

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch {}
  };

  // Ambient Focus Noise Generator (Brownian / White Noise synthesis)
  const toggleAmbientSound = () => {
    if (ambientSound) {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setAmbientSound(false);
    } else {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = ctx;
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5; // brown noise
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        noise.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
        noiseNodeRef.current = noise;
        setAmbientSound(true);
      } catch (err) {
        console.error('Audio noise synthesis error:', err);
      }
    }
  };

  // Password Generator
  const generateNewPassword = () => {
    let charset = 'abcdefghijklmnopqrstuvwxyz';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    let res = '';
    for (let i = 0; i < pwdLength; i++) {
      res += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setGeneratedPassword(res);
  };

  useEffect(() => {
    generateNewPassword();
  }, [pwdLength, includeUppercase, includeNumbers, includeSymbols]);

  // Task Actions
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: TaskItem = {
      id: `task_${Date.now()}`,
      title: newTaskTitle.trim(),
      priority: newTaskPriority,
      status: 'todo',
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => {
      const next = [newTask, ...prev];
      saveTasks(next);
      return next;
    });
    setNewTaskTitle('');
  };

  const toggleTaskStatus = (id: string) => {
    setTasks((prev) => {
      const next = prev.map((t) =>
        t.id === id ? { ...t, status: (t.status === 'completed' ? 'todo' : 'completed') as any } : t
      );
      saveTasks(next);
      return next;
    });
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => {
      const next = prev.filter((t) => t.id !== id);
      saveTasks(next);
      return next;
    });
  };

  // Note Actions
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;

    const newNote: NoteItem = {
      id: `note_${Date.now()}`,
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      category: newNoteCategory,
      tags: [newNoteCategory],
      updatedAt: new Date().toISOString(),
    };

    setNotes((prev) => {
      const next = [newNote, ...prev];
      saveNotes(next);
      return next;
    });
    setNewNoteTitle('');
    setNewNoteContent('');
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => {
      const next = prev.filter((n) => n.id !== id);
      saveNotes(next);
      return next;
    });
  };

  // Reminder Actions
  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderTitle.trim() || !newReminderTime) return;

    const newRem: ReminderItem = {
      id: `rem_${Date.now()}`,
      title: newReminderTitle.trim(),
      dateTime: newReminderTime,
      triggered: false,
      repeat: 'none',
    };

    setReminders((prev) => {
      const next = [newRem, ...prev];
      saveReminders(next);
      return next;
    });
    setNewReminderTitle('');
    setNewReminderTime('');
  };

  const deleteReminder = (id: string) => {
    setReminders((prev) => {
      const next = prev.filter((r) => r.id !== id);
      saveReminders(next);
      return next;
    });
  };

  // Date Diff Calculation
  const d1 = new Date(date1).getTime();
  const d2 = new Date(date2).getTime();
  const diffDays = Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6">
      {/* Sub-navigation pills */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-white/10">
        {[
          { id: 'tasks', label: 'Tasks', icon: CheckSquare },
          { id: 'notes', label: 'Notes', icon: FileText },
          { id: 'reminders', label: 'Reminders', icon: Bell },
          { id: 'timer', label: 'Focus Timer', icon: Timer },
          { id: 'password', label: 'Password Generator', icon: KeyRound },
          { id: 'datetime', label: 'Date/Time Utilities', icon: Calendar },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === item.id
                  ? 'bg-cyan-500 text-black shadow-md'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. TASKS TAB */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <form onSubmit={handleAddTask} className="flex gap-2">
            <input
              type="text"
              required
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Add new task..."
              className="flex-1 rounded-xl bg-slate-900/80 border border-white/10 px-3.5 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value as any)}
              className="rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </form>

          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-white/5 hover:border-cyan-500/30 transition-all text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => toggleTaskStatus(task.id)}
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                      task.status === 'completed'
                        ? 'bg-cyan-500 border-cyan-400 text-black'
                        : 'border-white/20 hover:border-cyan-400'
                    }`}
                  >
                    {task.status === 'completed' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                  <span className={task.status === 'completed' ? 'line-through text-slate-500' : 'text-white'}>
                    {task.title}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${
                      task.priority === 'high'
                        ? 'bg-rose-500/20 text-rose-300'
                        : task.priority === 'medium'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {task.priority}
                  </span>
                  <button onClick={() => deleteTask(task.id)} className="text-slate-500 hover:text-rose-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. NOTES TAB */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <form onSubmit={handleAddNote} className="space-y-3 bg-slate-900/40 p-4 rounded-2xl border border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder="Note Title..."
                className="flex-1 rounded-xl bg-slate-950 border border-white/10 px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500/50"
              />
              <input
                type="text"
                value={newNoteCategory}
                onChange={(e) => setNewNoteCategory(e.target.value)}
                placeholder="Category (e.g. Work, Ideas)"
                className="w-36 rounded-xl bg-slate-950 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
            <textarea
              rows={3}
              required
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Write note content in Markdown..."
              className="w-full rounded-xl bg-slate-950 border border-white/10 p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500/50"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Save Note</span>
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {notes.map((note) => (
              <div key={note.id} className="p-4 rounded-xl bg-slate-900/40 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">{note.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300">
                      {note.category}
                    </span>
                    <button onClick={() => deleteNote(note.id)} className="text-slate-500 hover:text-rose-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-slate-300 whitespace-pre-wrap line-clamp-4">{note.content}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. REMINDERS TAB */}
      {activeTab === 'reminders' && (
        <div className="space-y-4">
          <form onSubmit={handleAddReminder} className="flex gap-2">
            <input
              type="text"
              required
              value={newReminderTitle}
              onChange={(e) => setNewReminderTitle(e.target.value)}
              placeholder="Reminder Title..."
              className="flex-1 rounded-xl bg-slate-900 border border-white/10 px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none"
            />
            <input
              type="datetime-local"
              required
              value={newReminderTime}
              onChange={(e) => setNewReminderTime(e.target.value)}
              className="rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Set Alert</span>
            </button>
          </form>

          <div className="space-y-2">
            {reminders.map((rem) => (
              <div key={rem.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-white/5 text-xs">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-cyan-400" />
                  <span className="text-white font-medium">{rem.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 font-mono text-[11px]">{new Date(rem.dateTime).toLocaleString()}</span>
                  <button onClick={() => deleteReminder(rem.id)} className="text-slate-500 hover:text-rose-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. FOCUS POMODORO TIMER */}
      {activeTab === 'timer' && (
        <div className="p-8 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col items-center justify-center space-y-6 max-w-md mx-auto text-center shadow-xl">
          <div className="flex gap-2 p-1 rounded-xl bg-slate-950 border border-white/10 text-xs">
            <button
              onClick={() => {
                setTimerMode('work');
                setPomodoroTime(25 * 60);
                setIsTimerRunning(false);
              }}
              className={`px-4 py-1.5 rounded-lg ${timerMode === 'work' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400'}`}
            >
              Focus (25m)
            </button>
            <button
              onClick={() => {
                setTimerMode('break');
                setPomodoroTime(5 * 60);
                setIsTimerRunning(false);
              }}
              className={`px-4 py-1.5 rounded-lg ${timerMode === 'break' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400'}`}
            >
              Break (5m)
            </button>
          </div>

          <div className="text-6xl font-mono font-bold text-white tracking-tight">
            {String(Math.floor(pomodoroTime / 60)).padStart(2, '0')}:
            {String(pomodoroTime % 60).padStart(2, '0')}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isTimerRunning ? 'Pause' : 'Start Focus'}</span>
            </button>
            <button
              onClick={() => {
                setPomodoroTime(timerMode === 'work' ? 25 * 60 : 5 * 60);
                setIsTimerRunning(false);
              }}
              className="p-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={toggleAmbientSound}
              className={`p-3 rounded-xl border transition-all ${
                ambientSound
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                  : 'bg-slate-800 border-white/5 text-slate-400 hover:text-white'
              }`}
              title="Toggle Ambient Brownian Focus Noise"
            >
              {ambientSound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* 5. PASSWORD GENERATOR */}
      {activeTab === 'password' && (
        <div className="max-w-lg mx-auto bg-slate-900/60 p-6 rounded-2xl border border-white/10 space-y-5 shadow-xl">
          <div className="p-4 rounded-xl bg-[#05070B] border border-white/10 flex items-center justify-between">
            <span className="font-mono text-lg font-bold text-cyan-400 truncate pr-3">{generatedPassword}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedPassword);
                setPwdCopied(true);
                setTimeout(() => setPwdCopied(false), 2000);
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              {pwdCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Length: {pwdLength}</span>
              <input
                type="range"
                min="8"
                max="64"
                value={pwdLength}
                onChange={(e) => setPwdLength(Number(e.target.value))}
                className="w-48 accent-cyan-400"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={includeUppercase}
                  onChange={(e) => setIncludeUppercase(e.target.checked)}
                  className="accent-cyan-400"
                />
                <span>Uppercase (A-Z)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={(e) => setIncludeNumbers(e.target.checked)}
                  className="accent-cyan-400"
                />
                <span>Numbers (0-9)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={(e) => setIncludeSymbols(e.target.checked)}
                  className="accent-cyan-400"
                />
                <span>Symbols (!@#)</span>
              </label>
            </div>

            <button
              onClick={generateNewPassword}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-all shadow-md active:scale-95"
            >
              Generate New Password
            </button>
          </div>
        </div>
      )}

      {/* 6. DATE/TIME UTILITIES */}
      {activeTab === 'datetime' && (
        <div className="max-w-lg mx-auto bg-slate-900/60 p-6 rounded-2xl border border-white/10 space-y-4 shadow-xl text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Start Date</label>
              <input
                type="date"
                value={date1}
                onChange={(e) => setDate1(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-white/10 p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">End Date</label>
              <input
                type="date"
                value={date2}
                onChange={(e) => setDate2(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-white/10 p-2.5 text-white"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#05070B] border border-cyan-500/20 text-center">
            <div className="text-slate-400 font-mono text-xs">Calculated Difference</div>
            <div className="text-3xl font-mono font-bold text-cyan-400 mt-1">{diffDays} Days</div>
            <div className="text-[11px] text-slate-500 mt-1">({(diffDays / 7).toFixed(1)} Weeks • {(diffDays / 30.4).toFixed(1)} Months)</div>
          </div>
        </div>
      )}
    </div>
  );
};
