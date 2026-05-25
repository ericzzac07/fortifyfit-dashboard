'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { format, addDays, isToday, isBefore, startOfWeek, startOfMonth, endOfMonth, eachWeekOfInterval, eachDayOfInterval, getDaysInMonth, getDate } from 'date-fns';
import { KPI_TARGETS } from '@/lib/types';
import { ko } from 'date-fns/locale';

type ContentItem = {
  id: number;
  title: string;
  channel: 'fortifyfit' | 'naver' | 'threads';
  done: boolean;
  dueDate: string;
};

type Keyword = { id: number; keyword: string; channel: 'fortifyfit' | 'naver' | 'threads' };

const CH: Record<string, { label: string; dot: string; tag: string }> = {
  fortifyfit: { label: 'Fortifyfit', dot: 'bg-blue-400', tag: 'bg-blue-50 text-blue-600' },
  naver: { label: 'Naver', dot: 'bg-green-400', tag: 'bg-green-50 text-green-600' },
  threads: { label: 'Threads', dot: 'bg-purple-400', tag: 'bg-purple-50 text-purple-600' },
};

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];

// 셋업 주간 (5월 마지막 주): 인프라 세팅
const SETUP_WEEK = [
  { day: 0, channel: 'fortifyfit' as const, title: 'Fortifyfit 홈페이지 리뉴얼 기획' },
  { day: 1, channel: 'fortifyfit' as const, title: 'Fortifyfit 홈페이지 리뉴얼 작업' },
  { day: 2, channel: 'fortifyfit' as const, title: 'Fortifyfit 블로그 셋업 (카테고리/구조)' },
  { day: 3, channel: 'naver' as const, title: 'Naver 블로그 셋업 (카테고리/구조)' },
  { day: 3, channel: 'threads' as const, title: 'Threads 콘텐츠 계획 수립 (주제/톤)' },
  { day: 4, channel: 'fortifyfit' as const, title: '6월 콘텐츠 캘린더 확정' },
];

const DEADLINE_HOUR = '밤 9시';

export default function ContentPipeline() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [kwInput, setKwInput] = useState('');
  const [kwChannel, setKwChannel] = useState<Keyword['channel']>('fortifyfit');
  const [showKwForm, setShowKwForm] = useState(false);
  const [viewMonth, setViewMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formChannel, setFormChannel] = useState<ContentItem['channel']>('fortifyfit');
  const [tab, setTab] = useState<'week' | 'month'>('week');
  const [showMonth, setShowMonth] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const ws = startOfWeek(today, { weekStartsOn: 1 });

  useEffect(() => {
    const c = localStorage.getItem('content-cal-v3');
    if (c) setItems(JSON.parse(c));
    const k = localStorage.getItem('keyword-pool');
    if (k) setKeywords(JSON.parse(k));
    setLoaded(true);
  }, []);

  // 밀린 항목 자동 이월: 지난 주 이전 미완료 → 삭제 (stale), 이번 주 미완료 → 토요일로
  useEffect(() => {
    if (!loaded || items.length === 0) return;
    const wsStr = format(ws, 'yyyy-MM-dd');
    const overdue = items.filter((i) => !i.done && i.dueDate < todayStr);
    if (overdue.length === 0) return;

    const saturday = format(addDays(ws, 5), 'yyyy-MM-dd');
    const sunday = format(addDays(ws, 6), 'yyyy-MM-dd');

    const updated = items.map((i) => {
      if (!i.done && i.dueDate < todayStr) {
        // 이번 주 범위 내 밀린 것만 주말로 이월
        if (i.dueDate >= wsStr) {
          if (saturday >= todayStr) return { ...i, dueDate: saturday };
          if (sunday >= todayStr) return { ...i, dueDate: sunday };
          return { ...i, dueDate: todayStr };
        }
        // 이번 주 이전 것은 삭제 대상 (null 마킹)
        return null;
      }
      return i;
    }).filter(Boolean) as ContentItem[];

    if (updated.length !== items.length || updated.some((u, i) => u.dueDate !== items[i]?.dueDate)) {
      save(updated);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  // 이번 주 아이템 없으면 자동 생성
  useEffect(() => {
    if (!loaded) return;
    const wsStr = format(ws, 'yyyy-MM-dd');
    const weStr = format(addDays(ws, 6), 'yyyy-MM-dd');
    const weekItems = items.filter((i) => i.dueDate >= wsStr && i.dueDate <= weStr);
    if (weekItems.length === 0) {
      generateWeek(ws);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  const save = (updated: ContentItem[]) => { setItems(updated); localStorage.setItem('content-cal-v3', JSON.stringify(updated)); };
  const saveKw = (updated: Keyword[]) => { setKeywords(updated); localStorage.setItem('keyword-pool', JSON.stringify(updated)); };

  const generateWeek = (weekStart: Date) => {
    const june1 = new Date(2026, 5, 1); // 6월 1일

    // 6월 이전 = 셋업 주간
    if (isBefore(weekStart, june1)) {
      const newItems = SETUP_WEEK
        .filter((d) => {
          const dayDate = addDays(weekStart, d.day);
          return !isBefore(dayDate, today) || isToday(dayDate);
        })
        .map((d, i) => ({
          id: Date.now() + i,
          title: d.title,
          channel: d.channel,
          done: false,
          dueDate: format(addDays(weekStart, d.day), 'yyyy-MM-dd'),
        }));
      if (newItems.length > 0) save([...items, ...newItems]);
      return;
    }

    // 6월부터: 정규 콘텐츠 스케줄
    const mEnd = endOfMonth(weekStart);
    const availableDays: number[] = [];
    for (let i = 0; i < 5; i++) {
      const d = addDays(weekStart, i);
      if (isBefore(d, today) && !isToday(d)) continue;
      if (d > mEnd) continue;
      availableDays.push(i);
    }
    if (availableDays.length === 0) return;

    // 이번 달 기존 아이템 수
    const monthPrefix = format(weekStart, 'yyyy-MM');
    const monthItems = items.filter((i) => i.dueDate.startsWith(monthPrefix));
    const ffDone = monthItems.filter((i) => i.channel === 'fortifyfit').length;
    const nvDone = monthItems.filter((i) => i.channel === 'naver').length;
    const thDone = monthItems.filter((i) => i.channel === 'threads').length;

    // 남은 수량
    const ffTarget = KPI_TARGETS.fortifyfit_blogs * 4;
    const nvTarget = KPI_TARGETS.naver_blogs * 4;
    const thTarget = KPI_TARGETS.threads_posts * 4;
    const ffRemain = Math.max(0, ffTarget - ffDone);
    const nvRemain = Math.max(0, nvTarget - nvDone);
    const thRemain = Math.max(0, thTarget - thDone);

    const daysLeftInMonth = getDaysInMonth(weekStart) - getDate(weekStart) + 1;
    const weeksLeft = Math.max(1, Math.ceil(daysLeftInMonth / 7));

    // 주간 cap: 절대 주간 목표 초과 안 함
    const ffThisWeek = Math.min(Math.ceil(ffRemain / weeksLeft), KPI_TARGETS.fortifyfit_blogs, availableDays.length);
    const nvThisWeek = Math.min(Math.ceil(nvRemain / weeksLeft), KPI_TARGETS.naver_blogs, availableDays.length);
    const thThisWeek = Math.min(Math.ceil(thRemain / weeksLeft), KPI_TARGETS.threads_posts, availableDays.length);

    const newItems: ContentItem[] = [];
    let id = Date.now();

    // Threads: 매일 1개
    availableDays.slice(0, thThisWeek).forEach((dayIdx) => {
      newItems.push({ id: id++, title: 'Threads 발행', channel: 'threads', done: false, dueDate: format(addDays(weekStart, dayIdx), 'yyyy-MM-dd') });
    });

    // FF 블로그: 짝수 인덱스 날
    availableDays.filter((_, i) => i % 2 === 0).slice(0, ffThisWeek).forEach((dayIdx, i) => {
      newItems.push({ id: id++, title: `Fortifyfit 블로그 #${i + 1}`, channel: 'fortifyfit', done: false, dueDate: format(addDays(weekStart, dayIdx), 'yyyy-MM-dd') });
    });

    // NV 블로그: 홀수 인덱스 날
    availableDays.filter((_, i) => i % 2 === 1).slice(0, nvThisWeek).forEach((dayIdx, i) => {
      newItems.push({ id: id++, title: `Naver 블로그 #${i + 1}`, channel: 'naver', done: false, dueDate: format(addDays(weekStart, dayIdx), 'yyyy-MM-dd') });
    });

    if (newItems.length > 0) save([...items, ...newItems]);
  };

  const [undoItem, setUndoItem] = useState<{ id: number; timer: NodeJS.Timeout } | null>(null);

  const toggleDone = (id: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    // 완료 처리 시 3초 undo 기회
    if (!item.done) {
      save(items.map((i) => i.id === id ? { ...i, done: true } : i));
      if (undoItem) clearTimeout(undoItem.timer);
      const timer = setTimeout(() => setUndoItem(null), 3000);
      setUndoItem({ id, timer });
    } else {
      save(items.map((i) => i.id === id ? { ...i, done: false } : i));
    }
  };

  const undo = () => {
    if (!undoItem) return;
    clearTimeout(undoItem.timer);
    save(items.map((i) => i.id === undoItem.id ? { ...i, done: false } : i));
    setUndoItem(null);
  };
  const removeItem = (id: number) => save(items.filter((i) => i.id !== id));

  const addContent = () => {
    if (!formTitle.trim() || !selectedDate) return;
    save([...items, { id: Date.now(), title: formTitle.trim(), channel: formChannel, done: false, dueDate: selectedDate }]);
    setFormTitle(''); setSelectedDate(null);
  };

  const addKeyword = () => {
    if (!kwInput.trim()) return;
    saveKw([...keywords, { id: Date.now(), keyword: kwInput.trim(), channel: kwChannel }]);
    setKwInput(''); setShowKwForm(false);
  };

  // 이번 주 요일별
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(ws, i);
      const ds = format(d, 'yyyy-MM-dd');
      return {
        date: d, dateStr: ds, dayName: DAYS[i],
        items: items.filter((item) => item.dueDate === ds),
        isToday: isToday(d),
        isPast: isBefore(d, today) && !isToday(d),
      };
    });
  }, [items, ws, today]);

  const weekDone = weekDays.flatMap((d) => d.items).filter((i) => i.done).length;
  const weekTotal = weekDays.flatMap((d) => d.items).length;

  // 앞으로 해야 할 것 (오늘 포함, 미완료만, 날짜순)
  const upcoming = useMemo(() => {
    return items
      .filter((i) => !i.done && i.dueDate >= todayStr)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [items, todayStr]);

  // 캘린더
  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const calWeeks = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 1 });

  // 날짜를 "오늘", "내일", "수요일" 등으로 표시
  const formatDeadline = (dateStr: string) => {
    if (dateStr === todayStr) return `오늘 ${DEADLINE_HOUR}까지`;
    const tomorrow = format(addDays(today, 1), 'yyyy-MM-dd');
    if (dateStr === tomorrow) return `내일 ${DEADLINE_HOUR}까지`;
    const d = new Date(dateStr);
    const dayIdx = (d.getDay() + 6) % 7; // 월=0
    return `${DAYS[dayIdx]}요일 (${dateStr.slice(5)}) ${DEADLINE_HOUR}까지`;
  };

  return (
    <div className="space-y-4">
      {/* Undo 토스트 */}
      {undoItem && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-gray-800 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-3 text-sm">
          <span>완료 처리됨</span>
          <button onClick={undo} className="text-blue-300 hover:text-blue-200 font-medium">취소</button>
        </div>
      )}

      {/* 이번 주 진행률 */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        {weekDone === weekTotal && weekTotal > 0 ? (
          <div className="text-center py-1">
            <span className="text-green-600 font-bold">이번 주 전부 완료</span>
            <span className="text-gray-400 text-sm ml-2">{weekDone}/{weekTotal}</span>
          </div>
        ) : (
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span>이번 주 진행률</span>
              <span>{weekDone}/{weekTotal}</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100">
              <div className={`h-full rounded-full transition-all bg-blue-400`}
                style={{ width: `${weekTotal > 0 ? (weekDone / weekTotal) * 100 : 0}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* 월간 목표 */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="text-xs text-gray-400 mb-2">월간 목표 (총 {(KPI_TARGETS.fortifyfit_blogs + KPI_TARGETS.naver_blogs + KPI_TARGETS.threads_posts) * 4}개/월)</div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Fortifyfit', target: KPI_TARGETS.fortifyfit_blogs * 4, channel: 'fortifyfit' },
            { label: 'Naver', target: KPI_TARGETS.naver_blogs * 4, channel: 'naver' },
            { label: 'Threads', target: KPI_TARGETS.threads_posts * 4, channel: 'threads' },
          ].map((g) => {
            const done = items.filter((i) => i.channel === g.channel && i.done && i.dueDate.startsWith(format(viewMonth, 'yyyy-MM'))).length;
            return (
              <div key={g.channel} className="text-center">
                <div className="text-xs text-gray-500 mb-1">{g.label}</div>
                <div className="text-lg font-bold text-gray-800">{done}<span className="text-sm text-gray-400">/{g.target}</span></div>
                <div className="h-1.5 rounded-full bg-gray-100 mt-1">
                  <div className={`h-full rounded-full transition-all ${done >= g.target ? 'bg-green-400' : CH[g.channel].dot}`}
                    style={{ width: `${Math.min(100, g.target > 0 ? (done / g.target) * 100 : 0)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-1">
        <button onClick={() => setTab('week')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'week' ? 'bg-gray-800 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
          주간 계획
        </button>
        <button onClick={() => setTab('month')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'month' ? 'bg-gray-800 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
          월간
        </button>
      </div>

      {/* 주간 */}
      {tab === 'week' && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-bold text-gray-700">
              {format(ws, 'M/d')} — {format(addDays(ws, 6), 'M/d')}
            </span>
            <button onClick={() => { save([]); setTimeout(() => window.location.reload(), 100); }} className="text-[10px] text-gray-400 hover:text-red-400">초기화</button>
          </div>
          {weekDays.map((day) => (
            <div key={day.dateStr} className={`border-b border-gray-50 last:border-0 ${day.isToday ? 'bg-blue-50' : ''}`}>
              <div className="flex items-center gap-2 px-4 py-2">
                <span className={`text-xs font-bold w-8 ${day.isToday ? 'text-blue-600' : day.isPast ? 'text-gray-300' : 'text-gray-500'}`}>{day.dayName}</span>
                <span className={`text-xs ${day.isToday ? 'text-blue-500' : 'text-gray-300'}`}>{day.dateStr.slice(5)}</span>
                {day.isToday && <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500 text-white">오늘 — {DEADLINE_HOUR}까지</span>}
                {!day.isToday && !day.isPast && day.items.length > 0 && !day.items.every((i) => i.done) && (
                  <span className="text-[10px] text-gray-400 ml-auto">{day.dayName} {DEADLINE_HOUR}까지</span>
                )}
                {day.items.length > 0 && day.items.every((i) => i.done) && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-100 text-green-600 ml-auto">완료</span>
                )}
              </div>
              {day.items.length === 0 ? (
                <div className="px-4 py-2 pl-12 text-xs text-gray-300">—</div>
              ) : (
                day.items.map((item) => (
                  <div key={item.id} className={`flex items-center gap-3 px-4 py-2.5 pl-12 group ${day.isToday && !item.done ? 'bg-blue-50/50' : ''}`}>
                    <button onClick={() => toggleDone(item.id)}
                      className={`w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${
                        item.done ? 'bg-green-500 border-green-500' : day.isToday ? 'border-blue-400 hover:bg-blue-100' : 'border-gray-300 hover:border-green-400'
                      }`}>
                      {item.done && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${CH[item.channel].dot}`} />
                    <span className={`flex-1 ${item.done ? 'line-through text-gray-400 text-sm' : day.isToday ? 'text-gray-800 font-medium text-sm' : 'text-gray-700 text-sm'}`}>{item.title}</span>
                    <button onClick={() => removeItem(item.id)}
                      className="text-xs text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100">삭제</button>
                  </div>
                ))
              )}
            </div>
          ))}
          {(() => {
            const nextWs = addDays(ws, 7);
            const nextWsStr = format(nextWs, 'yyyy-MM-dd');
            const nextWeStr = format(addDays(nextWs, 6), 'yyyy-MM-dd');
            const has = items.some((i) => i.dueDate >= nextWsStr && i.dueDate <= nextWeStr);
            if (has) return null;
            return (
              <button onClick={() => generateWeek(nextWs)}
                className="w-full py-3 text-sm text-blue-500 hover:bg-blue-50 border-t border-gray-100">
                + 다음 주 계획 생성
              </button>
            );
          })()}
        </div>
      )}

      {/* 월간 */}
      {tab === 'month' && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <button onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1))}
              className="p-1 rounded hover:bg-gray-100"><ChevronLeft className="w-4 h-4 text-gray-500" /></button>
            <span className="text-sm font-bold text-gray-700">{format(viewMonth, 'yyyy년 M월')}</span>
            <button onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1))}
              className="p-1 rounded hover:bg-gray-100"><ChevronRight className="w-4 h-4 text-gray-500" /></button>
          </div>
          <div className="grid grid-cols-7 border-b border-gray-100">
            {DAYS.map((d) => (<div key={d} className="text-center text-[11px] text-gray-400 py-2">{d}</div>))}
          </div>
          {calWeeks.map((cws) => {
            const days = eachDayOfInterval({ start: cws, end: addDays(cws, 6) });
            return (
              <div key={cws.toISOString()} className="grid grid-cols-7 border-b border-gray-50 last:border-0">
                {days.map((day) => {
                  const ds = format(day, 'yyyy-MM-dd');
                  const dayItems = items.filter((i) => i.dueDate === ds);
                  const isCurrent = day.getMonth() === viewMonth.getMonth();
                  return (
                    <div key={ds} onClick={() => { if (isCurrent) { setSelectedDate(ds); setFormTitle(''); setFormChannel('fortifyfit'); } }}
                      className={`min-h-[68px] p-1 border-r border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 ${!isCurrent ? 'opacity-20' : ''} ${isToday(day) ? 'bg-blue-50' : ''} ${selectedDate === ds ? 'ring-2 ring-blue-400 ring-inset' : ''}`}>
                      <div className={`text-[11px] px-0.5 ${isToday(day) ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>{day.getDate()}</div>
                      {dayItems.map((item) => (
                        <div key={item.id} onClick={(e) => { e.stopPropagation(); toggleDone(item.id); }}
                          className={`text-[10px] px-1 py-0.5 rounded mb-0.5 truncate cursor-pointer flex items-center gap-1 ${item.done ? 'bg-green-50 text-green-600 line-through' : 'bg-gray-100 text-gray-600'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.done ? 'bg-green-400' : CH[item.channel].dot}`} />
                          <span className="truncate">{item.title}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* 날짜 선택 팝업 */}
      {selectedDate && tab === 'month' && (
        <div className="rounded-xl border border-blue-200 bg-white p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-700">{selectedDate.slice(5)}</h3>
            <button onClick={() => setSelectedDate(null)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
          </div>
          {items.filter((i) => i.dueDate === selectedDate).map((item) => (
            <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
              <button onClick={() => toggleDone(item.id)}
                className={`w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center ${item.done ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                {item.done && <Check className="w-3 h-3 text-white" />}
              </button>
              <span className={`w-2 h-2 rounded-full ${CH[item.channel].dot}`} />
              <span className={`text-sm flex-1 ${item.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{item.title}</span>
              <button onClick={() => removeItem(item.id)} className="text-xs text-gray-300 hover:text-red-400">삭제</button>
            </div>
          ))}
          {keywords.length > 0 && (
            <div>
              <div className="text-xs text-gray-400 mb-1">키워드에서 추가:</div>
              <div className="flex flex-wrap gap-1.5">
                {keywords.map((kw) => (
                  <button key={kw.id} onClick={() => { setFormTitle(kw.keyword); setFormChannel(kw.channel); }}
                    className={`px-2.5 py-1 rounded-full text-xs ${formTitle === kw.keyword ? `${CH[kw.channel].dot} text-white` : CH[kw.channel].tag}`}>
                    {kw.keyword}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <select value={formChannel} onChange={(e) => setFormChannel(e.target.value as ContentItem['channel'])}
              className="px-2 py-2 rounded-lg bg-gray-50 text-xs border border-gray-200">
              <option value="fortifyfit">Fortifyfit</option><option value="naver">Naver</option><option value="threads">Threads</option>
            </select>
            <input type="text" placeholder="제목" value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addContent()}
              className="flex-1 px-3 py-2 rounded-lg bg-gray-50 text-sm border border-gray-200 focus:border-blue-400 focus:outline-none" />
            <button onClick={addContent} disabled={!formTitle.trim()} className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 disabled:opacity-40">추가</button>
          </div>
        </div>
      )}

      {/* 키워드 풀 */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-gray-700">키워드 풀</h2>
          <button onClick={() => setShowKwForm(!showKwForm)} className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1">
            <Plus className="w-3 h-3" />추가
          </button>
        </div>
        {showKwForm && (
          <div className="flex gap-2 mb-3">
            <select value={kwChannel} onChange={(e) => setKwChannel(e.target.value as Keyword['channel'])}
              className="px-2 py-1.5 rounded bg-gray-50 text-xs border border-gray-200">
              <option value="fortifyfit">FF</option><option value="naver">NV</option><option value="threads">TH</option>
            </select>
            <input type="text" placeholder="키워드" value={kwInput} onChange={(e) => setKwInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
              className="flex-1 px-3 py-1.5 rounded bg-gray-50 text-sm border border-gray-200 focus:border-blue-400 focus:outline-none" autoFocus />
            <button onClick={addKeyword} className="px-3 py-1.5 rounded bg-blue-500 text-white text-xs">추가</button>
          </div>
        )}
        {keywords.length === 0 ? (
          <p className="text-xs text-gray-400 py-1">타겟 키워드를 모아두세요.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {keywords.map((kw) => (
              <span key={kw.id} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs ${CH[kw.channel].tag} group`}>
                {kw.keyword}
                <button onClick={() => saveKw(keywords.filter((k) => k.id !== kw.id))} className="opacity-0 group-hover:opacity-100"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
