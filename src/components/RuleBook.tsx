'use client';

import { useState } from 'react';
import { rules } from '@/lib/data';
import { ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';

export default function RuleBook() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 w-full text-left">
        <ShieldAlert className="w-4 h-4 text-red-400" />
        <h2 className="text-sm font-bold text-gray-700 flex-1">Rule Book (6-Month Lock)</h2>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {expanded && (
        <ol className="mt-3 space-y-2">
          {rules.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
              <span className="flex-shrink-0 text-red-400 font-mono w-5 text-right">{i + 1}.</span>
              <span>{r}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
