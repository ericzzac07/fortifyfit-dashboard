'use client';

import { useState } from 'react';
import { ShieldOff, X, Lightbulb } from 'lucide-react';
import { comparisonDefenseMessages, lonelinessMessage, beliefs, rules } from '@/lib/data';

type TriggerType = 'comparison' | 'loneliness' | 'fomo' | null;

export default function ComparisonDefense() {
  const [trigger, setTrigger] = useState<TriggerType>(null);
  const [cooldownEnd, setCooldownEnd] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('fomo-cooldown');
    if (stored && new Date(stored) > new Date()) return stored;
    return null;
  });

  const activateCooldown = () => {
    const end = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    setCooldownEnd(end);
    localStorage.setItem('fomo-cooldown', end);
  };

  const cooldownActive = cooldownEnd && new Date(cooldownEnd) > new Date();
  const cooldownHoursLeft = cooldownEnd ? Math.max(0, Math.ceil((new Date(cooldownEnd).getTime() - Date.now()) / (1000 * 60 * 60))) : 0;

  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <ShieldOff className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-bold text-gray-700">Trigger Defense</span>
        </div>

        {cooldownActive && (
          <div className="mb-3 p-2 rounded-lg bg-red-50 border border-red-100">
            <p className="text-xs text-red-500">24h Cooldown Active — {cooldownHoursLeft}h left. No decisions.</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button onClick={() => setTrigger('comparison')} className="px-3 py-1.5 rounded-lg bg-gray-50 text-xs text-gray-600 hover:bg-gray-100 border border-gray-200">Comparison Triggered</button>
          <button onClick={() => setTrigger('loneliness')} className="px-3 py-1.5 rounded-lg bg-gray-50 text-xs text-gray-600 hover:bg-gray-100 border border-gray-200">Feeling Lonely</button>
          <button onClick={() => { setTrigger('fomo'); activateCooldown(); }} className="px-3 py-1.5 rounded-lg bg-gray-50 text-xs text-gray-600 hover:bg-gray-100 border border-gray-200">FOMO / Excited</button>
        </div>
      </div>

      {trigger && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">
                {trigger === 'comparison' && <span className="text-amber-600">Comparison Defense</span>}
                {trigger === 'loneliness' && <span className="text-indigo-600">Loneliness Reframe</span>}
                {trigger === 'fomo' && <span className="text-red-500">FOMO Defense (24h Lock)</span>}
              </h3>
              <button onClick={() => setTrigger(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            {trigger === 'comparison' && (
              <div className="space-y-3">
                {comparisonDefenseMessages.map((msg, i) => (
                  <div key={i} className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                    <p className="text-sm text-amber-800 leading-relaxed">{msg}</p>
                  </div>
                ))}
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-xs text-gray-500 font-bold mb-2">Beliefs:</p>
                  {beliefs.map((b, i) => (<p key={i} className="text-xs text-gray-600">{i + 1}. {b}</p>))}
                </div>
              </div>
            )}

            {trigger === 'loneliness' && (
              <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-100">
                <p className="text-sm text-indigo-800 leading-relaxed whitespace-pre-line">{lonelinessMessage}</p>
              </div>
            )}

            {trigger === 'fomo' && (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                  <p className="text-sm text-red-700 mb-2">FOMO 콘텐츠를 봤거나 흥분 상태입니다. 24시간 결정 금지 룰 발동.</p>
                  <p className="text-xs text-red-500">이 사람의 진짜 수익원은 콘텐츠/강의 판매입니다. 본인 사업에 해당 없음.</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <p className="text-xs text-amber-600 font-bold">Ideation이 작동했다면 Idea Box로:</p>
                  </div>
                  <p className="text-xs text-gray-500">깊이 분석 + 본진 연결 메모 + 6개월 lock.</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-xs text-gray-500 font-bold mb-1">Rule Book:</p>
                  {rules.slice(0, 6).map((r, i) => (<p key={i} className="text-xs text-gray-400">{i + 1}. {r}</p>))}
                </div>
              </div>
            )}

            <button onClick={() => setTrigger(null)} className="w-full mt-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm">
              Understood. Back to Main.
            </button>
          </div>
        </div>
      )}
    </>
  );
}
