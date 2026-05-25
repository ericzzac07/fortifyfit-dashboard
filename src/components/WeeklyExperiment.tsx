'use client';

import { useState, useEffect } from 'react';
import { startOfWeek, format } from 'date-fns';
import { FlaskRound, Plus, Check } from 'lucide-react';
import { experimentTypes } from '@/lib/data';
import type { WeeklyExperiment as ExperimentType } from '@/lib/types';

function getWeekStart(): string {
  return format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
}

export default function WeeklyExperiment() {
  const weekStart = getWeekStart();
  const [experiment, setExperiment] = useState<ExperimentType | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<ExperimentType['experiment_type']>('new_keyword');
  const [title, setTitle] = useState('');
  const [hypothesis, setHypothesis] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(`experiment-${weekStart}`);
    if (stored) setExperiment(JSON.parse(stored));
  }, [weekStart]);

  const save = (exp: ExperimentType) => {
    setExperiment(exp);
    localStorage.setItem(`experiment-${weekStart}`, JSON.stringify(exp));
  };

  const submit = () => {
    if (!title.trim()) return;
    save({ id: Date.now(), week_start: weekStart, experiment_type: type, title: title.trim(), hypothesis: hypothesis.trim(), status: 'planned' });
    setShowForm(false); setTitle(''); setHypothesis('');
  };

  const updateStatus = (status: ExperimentType['status']) => { if (experiment) save({ ...experiment, status }); };
  const updateResult = (result: string) => { if (experiment) save({ ...experiment, result }); };

  const statusColor = {
    planned: 'text-blue-600 bg-blue-50',
    running: 'text-yellow-600 bg-yellow-50',
    completed: 'text-green-600 bg-green-50',
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
          <FlaskRound className="w-4 h-4 text-purple-500" />
          Innovation Slot
          <span className="text-xs text-gray-400 font-normal">({weekStart})</span>
        </h2>
        {!experiment && !showForm && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1 px-2 py-1 rounded bg-purple-50 text-purple-600 hover:bg-purple-100 text-xs">
            <Plus className="w-3 h-3" />Set
          </button>
        )}
      </div>

      {showForm && (
        <div className="space-y-2 mb-3">
          <select value={type} onChange={(e) => setType(e.target.value as ExperimentType['experiment_type'])} className="w-full px-2 py-1.5 rounded bg-gray-50 text-gray-700 text-xs border border-gray-200 focus:outline-none">
            {experimentTypes.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
          </select>
          <input type="text" placeholder="What are you testing?" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-2 py-1.5 rounded bg-gray-50 text-gray-700 text-xs border border-gray-200 focus:outline-none" />
          <input type="text" placeholder="Hypothesis (optional)" value={hypothesis} onChange={(e) => setHypothesis(e.target.value)} className="w-full px-2 py-1.5 rounded bg-gray-50 text-gray-700 text-xs border border-gray-200 focus:outline-none" />
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="px-2 py-1 rounded bg-gray-100 text-gray-500 text-xs">Cancel</button>
            <button onClick={submit} className="px-2 py-1 rounded bg-purple-500 text-white text-xs hover:bg-purple-600">Start Experiment</button>
          </div>
        </div>
      )}

      {experiment && (
        <div className="rounded-lg bg-gray-50 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-700 font-medium">{experiment.title}</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] ${statusColor[experiment.status]}`}>{experiment.status}</span>
          </div>
          <div className="text-[10px] text-gray-400 mb-2">
            {experimentTypes.find((t) => t.value === experiment.experiment_type)?.label}
            {experiment.hypothesis && ` — ${experiment.hypothesis}`}
          </div>
          <div className="flex gap-2">
            {experiment.status === 'planned' && (
              <button onClick={() => updateStatus('running')} className="px-2 py-1 rounded bg-yellow-50 text-yellow-600 text-[10px] hover:bg-yellow-100">Start</button>
            )}
            {experiment.status === 'running' && (
              <>
                <input type="text" placeholder="Result / insight..." value={experiment.result || ''} onChange={(e) => updateResult(e.target.value)} className="flex-1 px-2 py-1 rounded bg-white text-gray-700 text-[10px] border border-gray-200 focus:outline-none" />
                <button onClick={() => updateStatus('completed')} className="px-2 py-1 rounded bg-green-50 text-green-600 text-[10px] hover:bg-green-100 flex items-center gap-1">
                  <Check className="w-3 h-3" />Done
                </button>
              </>
            )}
            {experiment.status === 'completed' && experiment.result && (
              <p className="text-[10px] text-green-600">Result: {experiment.result}</p>
            )}
          </div>
        </div>
      )}

      {!experiment && !showForm && (
        <p className="text-xs text-gray-400 text-center py-2">No experiment set this week.</p>
      )}
    </div>
  );
}
