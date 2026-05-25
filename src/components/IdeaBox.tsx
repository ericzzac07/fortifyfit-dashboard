'use client';

import { useState, useEffect } from 'react';
import { format, addMonths, differenceInDays } from 'date-fns';
import { Lock, Plus, X, Lightbulb, ChevronDown, ChevronUp, CheckCircle2, Circle } from 'lucide-react';
import { rules } from '@/lib/data';
import type { IdeaBoxItem } from '@/lib/types';

type Phase = 'list' | 'warning' | 'basic' | 'analysis';

export default function IdeaBox() {
  const [ideas, setIdeas] = useState<IdeaBoxItem[]>([]);
  const [phase, setPhase] = useState<Phase>('list');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deepAnalysis, setDeepAnalysis] = useState('');
  const [connectionToMain, setConnectionToMain] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('idea-box');
    if (stored) setIdeas(JSON.parse(stored));
  }, []);

  const saveIdeas = (updated: IdeaBoxItem[]) => {
    setIdeas(updated);
    localStorage.setItem('idea-box', JSON.stringify(updated));
  };

  const resetForm = () => { setTitle(''); setDescription(''); setDeepAnalysis(''); setConnectionToMain(''); setPhase('list'); };

  const submitIdea = () => {
    if (!title.trim()) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    const lockDate = format(addMonths(new Date(), 6), 'yyyy-MM-dd');
    saveIdeas([{
      id: Date.now(), title: title.trim(), description: description.trim(), registered_date: today, lock_until: lockDate, reviewed: false,
      deep_analysis: deepAnalysis.trim() || undefined, connection_to_main: connectionToMain.trim() || undefined,
      analysis_time_minutes: deepAnalysis.trim() ? 30 : 0,
      review_checklist: { main_result_check: false, market_validation: false, no_revenue_impact: false, still_valuable: false },
    }, ...ideas]);
    resetForm();
  };

  const deleteIdea = (id: number) => { saveIdeas(ideas.filter((i) => i.id !== id)); };

  const analyzed = ideas.filter((i) => i.deep_analysis);
  const analysisRate = ideas.length > 0 ? Math.round((analyzed.length / ideas.length) * 100) : 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          Idea Box
        </h2>
        <button onClick={() => setPhase('warning')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 text-xs">
          <Plus className="w-3 h-3" />Ideation
        </button>
      </div>
      <p className="text-xs text-gray-400 mb-4">Ideation은 강점. 깊이 분석 + 본진 연결 + 6개월 lock.</p>

      {ideas.length > 0 && (
        <div className="flex gap-4 mb-4 text-xs">
          <span className="text-gray-400">Total: <span className="text-gray-600 font-mono">{ideas.length}</span></span>
          <span className="text-gray-400">Deep Analyzed: <span className={`font-mono ${analysisRate >= 80 ? 'text-green-500' : 'text-yellow-500'}`}>{analysisRate}%</span></span>
          <span className="text-gray-400">Main Connected: <span className="text-blue-500 font-mono">{ideas.filter((i) => i.connection_to_main).length}</span></span>
        </div>
      )}

      {/* Warning Modal */}
      {phase === 'warning' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="w-8 h-8 text-amber-500" />
              <h3 className="text-lg font-bold text-amber-700">Ideation이 작동했습니다</h3>
            </div>
            <div className="bg-amber-50 rounded-lg p-4 mb-4 text-sm text-amber-800 leading-relaxed">
              <p className="mb-2">이건 본인의 <strong>강점</strong>입니다.</p>
              <p className="mb-2">이 아이디어를 Idea Box에서 <strong>30분 깊이 분석</strong>하시겠습니까?</p>
              <p className="text-amber-600 text-xs">본진(fortifyfit.kr)은 그대로 진행 중. 이 아이디어는 6개월 후 검토하실 수 있습니다.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-xs text-gray-500">
              <p className="font-bold text-gray-600 mb-1">분석 후 본진에 부분 적용 가능한 요소 있으면 메모해두세요.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-xs text-red-400 mb-1">과거 미완성 자산 8~10개:</p>
              <p className="text-xs text-gray-400">fortifyfit, fortifyseo, Chartok, DR.BAQUO, Project Deep, VIDEOPIPE, banner-studio, 애드센스...</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setPhase('list')} className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm">Cancel</button>
              <button onClick={() => setPhase('basic')} className="flex-1 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 text-sm">Deep Analysis</button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {(phase === 'basic' || phase === 'analysis') && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{phase === 'basic' ? 'Step 1: Idea Registration' : 'Step 2: Deep Analysis'}</h3>
            {phase === 'basic' && (
              <>
                <input type="text" placeholder="Idea title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full mb-3 px-3 py-2 rounded bg-gray-50 text-gray-800 text-sm border border-gray-200 focus:border-amber-400 focus:outline-none" autoFocus />
                <textarea placeholder="One-line description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full mb-4 px-3 py-2 rounded bg-gray-50 text-gray-800 text-sm border border-gray-200 focus:border-amber-400 focus:outline-none resize-none" />
                <div className="flex gap-3">
                  <button onClick={resetForm} className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm">Cancel</button>
                  <button onClick={() => { if (title.trim()) setPhase('analysis'); }} className="flex-1 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 text-sm">Next: Deep Analysis</button>
                </div>
              </>
            )}
            {phase === 'analysis' && (
              <>
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="text-sm font-medium text-gray-800">{title}</div>
                  {description && <div className="text-xs text-gray-500 mt-1">{description}</div>}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-amber-600 mb-1">Why does this look good? / Potential ROI / Market feasibility</label>
                    <textarea placeholder="왜 이게 좋아 보이나?" value={deepAnalysis} onChange={(e) => setDeepAnalysis(e.target.value)} rows={4} className="w-full px-3 py-2 rounded bg-gray-50 text-gray-800 text-sm border border-gray-200 focus:border-amber-400 focus:outline-none resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-blue-500 mb-1">Connection to Main (fortifyfit.kr)</label>
                    <textarea placeholder="본진과 어떻게 연결되나?" value={connectionToMain} onChange={(e) => setConnectionToMain(e.target.value)} rows={4} className="w-full px-3 py-2 rounded bg-gray-50 text-gray-800 text-sm border border-gray-200 focus:border-blue-400 focus:outline-none resize-none" />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setPhase('basic')} className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm">Back</button>
                  <button onClick={submitIdea} className="flex-1 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 text-sm flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4" />Lock 6 Months
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Ideas List */}
      {ideas.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No ideas yet. Ideation is your strength — use the system.</p>
      ) : (
        <div className="space-y-2">
          {ideas.slice(0, 5).map((idea) => {
            const daysLeft = differenceInDays(new Date(idea.lock_until), new Date());
            const isUnlocked = daysLeft <= 0;
            const isExpanded = expandedId === idea.id;
            return (
              <div key={idea.id} className={`rounded-lg border ${isUnlocked ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-gray-50'}`}>
                <div className="p-3 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : idea.id!)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {!isUnlocked && <Lock className="w-3 h-3 text-amber-500" />}
                        <span className="text-sm font-medium text-gray-700">{idea.title}</span>
                        {idea.deep_analysis && <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-50 text-amber-600">Analyzed</span>}
                        {idea.connection_to_main && <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-600">Main-linked</span>}
                      </div>
                      <div className="flex gap-3 mt-1 text-xs text-gray-400">
                        <span>{idea.registered_date}</span>
                        <span>{isUnlocked ? <span className="text-green-500">Unlocked</span> : <span>D-{daysLeft}</span>}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      <button onClick={(e) => { e.stopPropagation(); deleteIdea(idea.id!); }} className="text-gray-300 hover:text-gray-500 ml-1"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-3 pb-3 space-y-2 border-t border-gray-100 pt-2">
                    {idea.description && <p className="text-xs text-gray-500">{idea.description}</p>}
                    {idea.deep_analysis && (
                      <div>
                        <span className="text-[10px] text-amber-500 uppercase tracking-wider">Deep Analysis</span>
                        <p className="text-xs text-gray-600 mt-0.5 whitespace-pre-wrap">{idea.deep_analysis}</p>
                      </div>
                    )}
                    {idea.connection_to_main && (
                      <div>
                        <span className="text-[10px] text-blue-500 uppercase tracking-wider">Main Connection</span>
                        <p className="text-xs text-gray-600 mt-0.5 whitespace-pre-wrap">{idea.connection_to_main}</p>
                      </div>
                    )}
                    {isUnlocked && idea.review_checklist && (
                      <div className="mt-2">
                        <span className="text-[10px] text-green-500 uppercase tracking-wider">Review Checklist</span>
                        <div className="mt-1 space-y-1">
                          {[
                            { key: 'main_result_check', label: '6개월 본진 결과 어떤가' },
                            { key: 'market_validation', label: '한국 시장 적용 가능 검증됐나' },
                            { key: 'no_revenue_impact', label: '현 매출 라인에 영향 없이 추가 가능한가' },
                            { key: 'still_valuable', label: '6개월 후에도 가치 있어 보이나' },
                          ].map((item) => {
                            const checked = idea.review_checklist![item.key as keyof typeof idea.review_checklist];
                            return (
                              <button
                                key={item.key}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  saveIdeas(ideas.map((i) => i.id === idea.id ? { ...i, review_checklist: { ...i.review_checklist!, [item.key]: !checked } } : i));
                                }}
                                className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 w-full text-left"
                              >
                                {checked ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" /> : <Circle className="w-3.5 h-3.5 text-gray-300 shrink-0" />}
                                <span className={checked ? 'line-through text-gray-400' : ''}>{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    <div className="text-xs text-gray-400">Lock until: {idea.lock_until}</div>
                  </div>
                )}
              </div>
            );
          })}
          {ideas.length > 5 && <p className="text-xs text-gray-400 text-center">+{ideas.length - 5} more ideas locked</p>}
        </div>
      )}
    </div>
  );
}
