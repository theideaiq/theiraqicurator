'use client';

import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';

/** Up/down, show/hide, edit and delete buttons for one row of a sorted list. */
export function RowControls({
  index,
  count,
  published,
  onMove,
  onToggle,
  onEdit,
  onDelete,
}: {
  index: number;
  count: number;
  published: boolean;
  onMove: (delta: -1 | 1) => void;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const round = 'p-2 border-2 rounded-full';
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <div className="flex flex-col">
        <button type="button" onClick={() => onMove(-1)} disabled={index === 0} className="p-1 disabled:opacity-20" aria-label="Move up">
          <ArrowUp size={14} />
        </button>
        <button type="button" onClick={() => onMove(1)} disabled={index === count - 1} className="p-1 disabled:opacity-20" aria-label="Move down">
          <ArrowDown size={14} />
        </button>
      </div>
      <button type="button" onClick={onToggle} className={`${round} border-ink hover:bg-saffron`} aria-label={published ? 'Hide from site' : 'Show on site'} title={published ? 'Hide from site' : 'Show on site'}>
        {published ? <Eye size={16} /> : <EyeOff size={16} />}
      </button>
      <button type="button" onClick={onEdit} className={`${round} border-ink hover:bg-saffron`} aria-label="Edit">
        <Pencil size={16} />
      </button>
      <button type="button" onClick={onDelete} className={`${round} border-brick text-brick hover:bg-brick hover:text-paper`} aria-label="Delete">
        <Trash2 size={16} />
      </button>
    </div>
  );
}
