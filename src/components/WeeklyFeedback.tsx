'use client';

import { useState, useEffect } from 'react';
import { format, startOfWeek } from 'date-fns';
import { MessageSquareText, Send, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import type { WeeklyKpi } from '@/lib/types';
import { KPI_TARGETS } from '@/lib/types';

type FeedbackRecord = { week: string; report: string; feedback: string; date: string };

export default function WeeklyFeedback() {
  const [report, setReport] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<FeedbackRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  useEffect(() => {
    const stored = localStorage.getItem('weekly-feedback-log');
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  const buildAutoReport = (): string => {
    const raw = localStorage.getItem(`kpi-${weekStart}`);
    if (!raw) return '';
    const kpi: WeeklyKpi = JSON.parse(raw);
    return [
      `[${weekStart} 주간 보고]`,
      `- Fortifyfit 블로그: ${kpi.fortifyfit_blogs}/${KPI_TARGETS.fortifyfit_blogs}`,
      `- 네이버 블로그: ${kpi.naver_blogs}/${KPI_TARGETS.naver_blogs}`,
      `- Threads: ${kpi.threads_posts}/${KPI_TARGETS.threads_posts}`,
      `- 본진 시간: ${kpi.main_hours}/${KPI_TARGETS.main_hours}h`,
      `- Meta 광고비: ${kpi.meta_ad_spend}만원`,
    ].join('\n');
  };

  const handleAutoFill = () => {
    const auto = buildAutoReport();
    if (!auto) { setError('이번 주 KPI 데이터가 없습니다.'); return; }
    setReport(auto + '\n\n[추가 메모]\n');
    setError('');
  };

  const submit = async () => {
    if (!report.trim()) return;
    setLoading(true); setError(''); setFeedback('');
    try {
      const res = await fetch('/api/weekly-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report: report.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'API 오류'); return; }
      setFeedback(data.feedback);
      const record: FeedbackRecord = { week: weekStart, report: report.trim(), feedback: data.feedback, date: new Date().toISOString() };
      const updated = [record, ...history].slice(0, 20);
      setHistory(updated);
      localStorage.setItem('weekly-feedback-log', JSON.stringify(updated));
    } catch { setError('네트워크 오류. API 키 확인 필요.'); } finally { setLoading(false); }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
          <MessageSquareText className="w-4 h-4 text-violet-500" />
          Weekly Feedback
        </h2>
        <span className="text-xs text-gray-400">Claude Manager</span>
      </div>
      <p className="text-xs text-gray-400 mb-4">매주 금요일 진척 보고 → AI 매니저 피드백</p>

      <div className="space-y-3">
        <button onClick={handleAutoFill} className="px-3 py-1.5 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 text-xs">
          KPI 자동입력
        </button>
        <textarea
          placeholder="이번 주 진척 보고를 작성하세요."
          value={report}
          onChange={(e) => setReport(e.target.value)}
          rows={5}
          className="w-full px-3 py-2 rounded-lg bg-gray-50 text-gray-800 text-sm border border-gray-200 focus:border-violet-400 focus:outline-none resize-none font-mono"
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button
          onClick={submit}
          disabled={loading || !report.trim()}
          className="w-full py-2.5 rounded-lg bg-violet-500 text-white hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" />분석 중...</> : <><Send className="w-4 h-4" />보고 제출</>}
        </button>
      </div>

      {feedback && (
        <div className="mt-4 p-4 rounded-lg bg-violet-50 border border-violet-100">
          <span className="text-[10px] text-violet-500 uppercase tracking-wider">Manager Feedback</span>
          <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{feedback}</div>
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-4 border-t border-gray-100 pt-3">
          <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
            {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            Past Reports ({history.length})
          </button>
          {showHistory && (
            <div className="mt-2 space-y-3 max-h-60 overflow-y-auto">
              {history.map((rec, i) => (
                <div key={i} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex justify-between text-xs text-gray-400 mb-2">
                    <span>Week: {rec.week}</span>
                    <span>{new Date(rec.date).toLocaleDateString('ko-KR')}</span>
                  </div>
                  <details className="text-xs">
                    <summary className="text-violet-500 cursor-pointer mb-1">Report & Feedback</summary>
                    <div className="mt-1 p-2 rounded bg-white text-gray-500 whitespace-pre-wrap mb-2">{rec.report}</div>
                    <div className="p-2 rounded bg-violet-50 text-gray-600 whitespace-pre-wrap">{rec.feedback}</div>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
