'use client';

import { differenceInDays } from 'date-fns';
import { countdowns } from '@/lib/data';

export default function CountdownTimers() {
  const today = new Date();

  return (
    <div className="flex flex-wrap gap-4">
      {countdowns.map((c) => {
        const target = new Date(c.date);
        const daysLeft = differenceInDays(target, today);
        return (
          <div
            key={c.label}
            className="flex-1 min-w-[180px] rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 p-4 text-white text-center"
          >
            <div className="text-sm opacity-90">{c.label}</div>
            <div className="text-3xl font-bold mt-1">D-{daysLeft}</div>
            <div className="text-xs opacity-70 mt-1">{c.date}</div>
          </div>
        );
      })}
    </div>
  );
}
