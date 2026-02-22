import { Task } from '../types';
import { StatusBadge, PriorityBadge } from './Badges';

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

export default function TaskCard({ task, onEdit, onDelete }: Props) {
  const isOverdue =
    task.due_date &&
    task.status !== 'completed' &&
    new Date(task.due_date) < new Date();

  return (
    <div className="glass-light rounded-xl p-5 hover:border-white/12 transition-all duration-200 group animate-fade-in">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className={`font-display font-semibold text-base leading-snug ${task.status === 'completed' ? 'line-through text-zinc-500' : 'text-white'}`}>
          {task.title}
        </h3>
        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-brand-500/20 hover:text-brand-400 text-zinc-500 transition-all"
            title="Edit"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-zinc-500 transition-all"
            title="Delete"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-zinc-500 text-sm mb-3 line-clamp-2 leading-relaxed">{task.description}</p>
      )}

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <StatusBadge status={task.status} />
          <span className="text-zinc-700">·</span>
          <PriorityBadge priority={task.priority} />
        </div>
        {task.due_date && (
          <span className={`text-xs font-mono ${isOverdue ? 'text-red-400' : 'text-zinc-500'}`}>
            {isOverdue ? '⚠ ' : ''}
            {new Date(task.due_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        )}
      </div>
    </div>
  );
}
