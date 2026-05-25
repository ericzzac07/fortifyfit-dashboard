'use client';

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import type { WeeklyKpi } from '@/lib/types';
import { KPI_TARGETS } from '@/lib/types';

export default function KpiChart() {
  const [history, setHistory] = useState<WeeklyKpi[]>([]);

  useEffect(() => {
    const entries: WeeklyKpi[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('kpi-')) {
        try { entries.push(JSON.parse(localStorage.getItem(key)!)); } catch { /* skip */ }
      }
    }
    entries.sort((a, b) => a.week_start.localeCompare(b.week_start));
    setHistory(entries);
  }, []);

  if (history.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-gray-800 mb-2">KPI Trend</h2>
        <p className="text-sm text-gray-400 text-center py-8">No weekly data yet. Start tracking to see trends.</p>
      </div>
    );
  }

  const chartData = history.map((w) => {
    const scores = [
      (w.fortifyfit_blogs / KPI_TARGETS.fortifyfit_blogs) * 100,
      (w.naver_blogs / KPI_TARGETS.naver_blogs) * 100,
      (w.threads_posts / KPI_TARGETS.threads_posts) * 100,
      (w.main_hours / KPI_TARGETS.main_hours) * 100,
    ];
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    return { week: w.week_start.slice(5), achievement: Math.min(100, avg) };
  });

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-bold text-gray-800 mb-4">KPI Trend</h2>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="week" tick={{ fill: '#999', fontSize: 11 }} />
          <YAxis tick={{ fill: '#999', fontSize: 11 }} domain={[0, 100]} />
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
          />
          <Bar dataKey="achievement" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
