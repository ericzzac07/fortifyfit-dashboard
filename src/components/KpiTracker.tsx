'use client';

import { useState, useEffect, useCallback } from 'react';
import { startOfWeek, format } from 'date-fns';
import { KPI_TARGETS, type WeeklyKpi } from '@/lib/types';

const KPI_LABELS: Record<string, string> = {
  fortifyfit_blogs: 'Fortifyfit Blog',
  naver_blogs: 'Naver Blog',
  threads_posts: 'Threads Posts',
  main_hours: 'Main Hours',
  meta_ad_spend: 'Meta Ad (man)',
};

const KPI_FIELDS = Object.keys(KPI_TARGETS) as (keyof typeof KPI_TARGETS)[];

function getWeekStart(): string {
  return format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
}

export default function KpiTracker() {
  const weekStart = getWeekStart();
  const [kpi, setKpi] = useState<WeeklyKpi>({
    week_start: weekStart,
    fortifyfit_blogs: 0,
    naver_blogs: 0,
    threads_posts: 0,
    main_hours: 0,
    meta_ad_spend: 0,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(`kpi-${weekStart}`);
    if (stored) setKpi(JSON.parse(stored));
  }, [weekStart]);

  const save = useCallback(
    (updated: WeeklyKpi) => {
      localStorage.setItem(`kpi-${weekStart}`, JSON.stringify(updated));
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    },
    [weekStart]
  );

  const update = (field: keyof typeof KPI_TARGETS, value: number) => {
    const updated = { ...kpi, [field]: value };
    setKpi(updated);
    save(updated);
  };

  const achievements = KPI_FIELDS.map((f) => {
    const target = KPI_TARGETS[f];
    if (target === 0) return 100;
    return Math.min(100, Math.round((kpi[f] / target) * 100));
  });
  const overallPct = Math.round(
    achievements.reduce((a, b) => a + b, 0) / achievements.length
  );

  const overallColor =
    overallPct >= 80 ? 'text-green-600' : overallPct >= 50 ? 'text-yellow-600' : 'text-red-500';

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">
          Weekly KPI
          <span className="ml-2 text-xs text-gray-400 font-normal">{weekStart}</span>
        </h2>
        <div className={`text-2xl font-bold ${overallColor}`}>
          {overallPct}%
          {saved && <span className="ml-2 text-xs text-green-500">Saved</span>}
        </div>
      </div>

      {overallPct < 50 && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          KPI 달성률 50% 미만. 본진에 더 시간을 투입하세요.
        </div>
      )}

      <div className="space-y-4">
        {KPI_FIELDS.map((field, i) => {
          const target = KPI_TARGETS[field];
          const value = kpi[field];
          const pct = achievements[i];
          const barColor =
            pct >= 100 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-400' : 'bg-red-400';

          return (
            <div key={field}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm text-gray-600">{KPI_LABELS[field]}</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => update(field, Math.max(0, value - (field === 'main_hours' ? 0.5 : field === 'meta_ad_spend' ? 5 : 1)))}
                    className="w-7 h-7 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm border border-gray-200"
                  >
                    -
                  </button>
                  <span className="text-sm font-mono w-12 text-center text-gray-800">
                    {value}<span className="text-gray-400">/{target}</span>
                  </span>
                  <button
                    onClick={() => update(field, value + (field === 'main_hours' ? 0.5 : field === 'meta_ad_spend' ? 5 : 1))}
                    className="w-7 h-7 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm border border-gray-200"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="h-2 rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full transition-all ${barColor}`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-400">
          3-Month Checkpoint (8월 말):{' '}
          <span className="text-orange-500 font-mono">
            D-{Math.max(0, Math.ceil((new Date('2026-08-31').getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}
          </span>
        </div>
      </div>
    </div>
  );
}
