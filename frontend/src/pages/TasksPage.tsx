import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Task, FilterStatus } from '../types';
import { tasksApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import TaskCard from '../components/TaskCard';
import TaskFormModal from '../components/TaskFormModal';
import { statusConfig } from '../components/Badges';

const FILTERS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

export default function TasksPage() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const data = await tasksApi.getAll(filter);
      setTasks(data);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    fetchTasks();
  }, [fetchTasks]);

  const handleSave = async (data: Parameters<typeof tasksApi.create>[0]) => {
    try {
      if (editTask) {
        const updated = await tasksApi.update(editTask.id, data);
        setTasks((prev) => prev.map((t) => (t.id === editTask.id ? updated : t)));
        toast.success('Task updated!');
      } else {
        const created = await tasksApi.create(data);
        setTasks((prev) => [created, ...prev]);
        toast.success('Task created!');
      }
    } catch {
      toast.error('Failed to save task');
      throw new Error('save failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this task?')) return;
    try {
      await tasksApi.delete(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const openCreate = () => {
    setEditTask(null);
    setModalOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditTask(task);
    setModalOpen(true);
  };

  // Stats
  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Header */}
      <header className="border-b border-white/[0.06] glass sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="font-display font-bold text-white text-lg tracking-tight">TaskFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-zinc-500 text-sm hidden sm:block">{user?.name}</span>
            <button
              onClick={logout}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Title row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-white tracking-tight">My Tasks</h1>
            <p className="text-zinc-500 text-sm mt-1">
              {stats.total} tasks · {stats.in_progress} in progress · {stats.completed} done
            </p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-all text-sm glow shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {(['pending', 'in_progress', 'completed'] as const).map((s) => {
            const cfg = statusConfig[s];
            const count = stats[s];
            return (
              <div key={s} className="glass-light rounded-xl p-4 text-center">
                <div className={`text-2xl font-display font-bold ${count > 0 ? 'text-white' : 'text-zinc-600'}`}>{count}</div>
                <div className={`text-xs mt-0.5 ${cfg.color.split(' ')[1]}`}>{cfg.label}</div>
              </div>
            );
          })}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 mb-6 p-1 bg-white/[0.03] rounded-xl border border-white/[0.06] w-fit">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f.value
                  ? 'bg-brand-500 text-white shadow-lg'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Tasks list */}
        {loading ? (
          <div className="grid gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-light rounded-xl h-24 animate-pulse" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16 text-zinc-600">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="font-display font-semibold text-lg text-zinc-500">No tasks found</p>
            <p className="text-sm mt-1">
              {filter === 'all' ? 'Create your first task to get started.' : `No ${filter.replace('_', ' ')} tasks.`}
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={openEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>

      <TaskFormModal
        open={modalOpen}
        task={editTask}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
