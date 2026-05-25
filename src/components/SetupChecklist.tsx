'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, ListChecks } from 'lucide-react';
import { setupChecklistItems } from '@/lib/data';
import type { SetupChecklistItem } from '@/lib/types';

const CATEGORY_LABELS: Record<string, string> = {
  algorithm: 'Algorithm Cleanup',
  physical: 'Physical Environment',
  relationship: 'Deep Relationships',
  review: 'Review',
};

export default function SetupChecklist() {
  const [items, setItems] = useState<SetupChecklistItem[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('setup-checklist');
    if (stored) { setItems(JSON.parse(stored)); }
    else {
      const initial = setupChecklistItems.map((item) => ({ ...item, done: false }));
      setItems(initial);
      localStorage.setItem('setup-checklist', JSON.stringify(initial));
    }
  }, []);

  const toggle = (idx: number) => {
    const updated = items.map((item, i) =>
      i === idx ? { ...item, done: !item.done, done_date: !item.done ? new Date().toISOString().slice(0, 10) : undefined } : item
    );
    setItems(updated);
    localStorage.setItem('setup-checklist', JSON.stringify(updated));
  };

  const doneCount = items.filter((i) => i.done).length;
  const allDone = doneCount === items.length;
  const pct = items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0;

  if (allDone) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-3 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-green-500" />
        <span className="text-xs text-green-600">Setup Complete!</span>
      </div>
    );
  }

  const grouped = items.reduce<Record<string, { item: SetupChecklistItem; idx: number }[]>>((acc, item, idx) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push({ item, idx });
    return acc;
  }, {});

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <button onClick={() => setCollapsed(!collapsed)} className="flex items-center justify-between w-full">
        <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-orange-500" />
          D-1 Setup Checklist
          <span className="text-xs font-normal text-gray-400">{doneCount}/{items.length} ({pct}%)</span>
        </h2>
      </button>
      {!collapsed && (
        <div className="mt-3 space-y-3">
          <div className="h-1.5 rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-orange-400 transition-all" style={{ width: `${pct}%` }} />
          </div>
          {Object.entries(grouped).map(([category, entries]) => (
            <div key={category}>
              <div className="text-[10px] uppercase tracking-wider mb-1 text-gray-400">{CATEGORY_LABELS[category] || category}</div>
              <div className="space-y-1">
                {entries.map(({ item, idx }) => (
                  <button key={idx} onClick={() => toggle(idx)} className="flex items-start gap-2 w-full text-left group">
                    {item.done ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" /> : <Circle className="w-3.5 h-3.5 text-gray-300 flex-shrink-0 mt-0.5 group-hover:text-gray-500" />}
                    <span className={`text-xs ${item.done ? 'text-gray-400 line-through' : 'text-gray-600'}`}>{item.task}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
