import { TaskStatus, TaskPriority } from '../types';

export const statusConfig: Record<TaskStatus, { label: string; color: string; dot: string }> = {
  pending: {
    label: 'Pending',
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dot: 'bg-amber-400',
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    dot: 'bg-blue-400',
  },
  completed: {
    label: 'Completed',
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
};

export const priorityConfig: Record<TaskPriority, { label: string; color: string; icon: string }> = {
  low: {
    label: 'Low',
    color: 'text-zinc-400',
    icon: '↓',
  },
  medium: {
    label: 'Medium',
    color: 'text-amber-400',
    icon: '→',
  },
  high: {
    label: 'High',
    color: 'text-red-400',
    icon: '↑',
  },
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  const cfg = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const cfg = priorityConfig[priority];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-mono font-medium ${cfg.color}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}
