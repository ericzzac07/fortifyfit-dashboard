'use client';

import { beliefs, dailyMantra, systemSlogan } from '@/lib/data';

export default function BeliefBoard() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-gray-800 mb-4">Belief Board</h2>
      <ul className="space-y-2 mb-5">
        {beliefs.map((b, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">
              {i + 1}
            </span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 mb-3">
        <div className="text-[10px] text-blue-500 uppercase tracking-wider mb-1">Today&apos;s Mantra</div>
        <p className="text-blue-700 font-medium text-sm leading-relaxed">&ldquo;{dailyMantra}&rdquo;</p>
      </div>
      <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
        {systemSlogan.map((line, i) => (
          <p key={i} className="text-xs text-gray-500 leading-relaxed">{line}</p>
        ))}
      </div>
    </div>
  );
}
