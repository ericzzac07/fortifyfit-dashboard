'use client';

import { useState, useEffect } from 'react';
import ContentPipeline from '@/components/ContentPipeline';
import KpiTracker from '@/components/KpiTracker';
import AiChat from '@/components/AiChat';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

import KpiChart from '@/components/KpiChart';
import BeliefBoard from '@/components/BeliefBoard';
import IdeaBox from '@/components/IdeaBox';
import RuleBook from '@/components/RuleBook';
import ComparisonDefense from '@/components/ComparisonDefense';

const QUOTES = [
  '완벽하지 않아도 된다. 오늘 한 줄이 내일의 자산이 된다.',
  '비교는 독이다. 어제의 나보다 나으면 된다.',
  '아이디어는 넘친다. 실행 하나가 아이디어 열 개를 이긴다.',
  '본진에 집중. 흔들릴 때마다 여기로 돌아와라.',
  '6개월 뒤의 내가 고마워할 일을 오늘 하자.',
  '쉬운 것부터. Threads 하나 올리면 오늘은 성공이다.',
  '매출은 시스템의 결과다. 시스템을 믿어라.',
  '지금 안 되는 건 아직 안 된 거지, 못 하는 게 아니다.',
  'SEO는 복리다. 오늘 쓴 글이 6개월 뒤에 일한다.',
  '멈추지 않으면 느려도 된다.',
];

export default function Home() {
  const [showExtra, setShowExtra] = useState(false);
  const [quote, setQuote] = useState<string | null>(null);

  useEffect(() => {
    // 하루에 한 번만 팝업 표시
    const lastShown = localStorage.getItem('quote-last-shown');
    const today = new Date().toISOString().slice(0, 10);
    if (lastShown !== today) {
      setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
      localStorage.setItem('quote-last-shown', today);
    }
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 오늘의 문구 팝업 */}
      {quote && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setQuote(null)}>
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setQuote(null)} className="absolute top-3 right-3 text-gray-300 hover:text-gray-500">
              <X className="w-5 h-5" />
            </button>
            <div className="text-3xl mb-4">💪</div>
            <p className="text-lg font-medium text-gray-800 leading-relaxed">{quote}</p>
            <button onClick={() => setQuote(null)} className="mt-6 px-6 py-2.5 rounded-xl bg-blue-500 text-white text-sm hover:bg-blue-600">
              오늘도 시작
            </button>
          </div>
        </div>
      )}

      <header className="border-b border-gray-200 px-4 py-3 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">FORTIFYFIT</h1>
          <div className="text-xs text-gray-400">
            {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <ContentPipeline />
        <KpiTracker />

        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <button onClick={() => setShowExtra(!showExtra)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white text-sm text-gray-400 hover:bg-gray-50">
            <span>More</span>
            {showExtra ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showExtra && (
            <div className="p-4 space-y-4 bg-gray-50">
              <KpiChart />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ComparisonDefense />
                <BeliefBoard />
              </div>
              <IdeaBox />
              <RuleBook />
            </div>
          )}
        </div>
      </div>

      <AiChat />
    </main>
  );
}
