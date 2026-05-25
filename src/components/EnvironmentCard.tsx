'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Shield, Eye, Users, Minus, Plus } from 'lucide-react';
import { deepRelationships } from '@/lib/data';
import type { InputEnvironment } from '@/lib/types';

const today = () => format(new Date(), 'yyyy-MM-dd');

export default function EnvironmentCard() {
  const [env, setEnv] = useState<InputEnvironment>({
    date: today(),
    decompression_hours: 0,
    constructive_input_hours: 0,
    academic_input_hours: 0,
    comparison_trigger_count: 0,
  });

  useEffect(() => {
    const stored = localStorage.getItem(`env-${today()}`);
    if (stored) setEnv(JSON.parse(stored));
  }, []);

  const save = (updated: InputEnvironment) => {
    setEnv(updated);
    localStorage.setItem(`env-${today()}`, JSON.stringify(updated));
  };

  const adjust = (field: keyof InputEnvironment, delta: number) => {
    const val = (env[field] as number) + delta;
    if (val < 0) return;
    save({ ...env, [field]: Math.round(val * 10) / 10 });
  };

  const total = env.decompression_hours + env.constructive_input_hours + env.academic_input_hours;
  const constructiveRatio = total > 0 ? Math.round(((env.constructive_input_hours + env.academic_input_hours) / total) * 100) : 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
        <Shield className="w-4 h-4 text-indigo-500" />
        Environment Status
      </h2>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: 'Decompress', field: 'decompression_hours' as const, color: 'text-blue-500', step: 0.5 },
          { label: 'Constructive', field: 'constructive_input_hours' as const, color: 'text-green-500', step: 0.5 },
          { label: 'Academic', field: 'academic_input_hours' as const, color: 'text-purple-500', step: 0.5 },
        ].map((item) => (
          <div key={item.field} className="text-center">
            <div className={`text-[10px] ${item.color} mb-1`}>{item.label}</div>
            <div className="flex items-center justify-center gap-1">
              <button onClick={() => adjust(item.field, -item.step)} className="w-5 h-5 rounded bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200">
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-sm font-mono text-gray-700 w-8 text-center">{env[item.field]}h</span>
              <button onClick={() => adjust(item.field, item.step)} className="w-5 h-5 rounded bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200">
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
          <span>Constructive Ratio</span>
          <span className={constructiveRatio >= 40 ? 'text-green-500' : 'text-yellow-500'}>{constructiveRatio}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-100">
          <div className={`h-full rounded-full transition-all ${constructiveRatio >= 40 ? 'bg-green-400' : 'bg-yellow-400'}`} style={{ width: `${Math.min(100, constructiveRatio)}%` }} />
        </div>
      </div>

      <div className="flex items-center justify-between mb-3 p-2 rounded-lg bg-gray-50">
        <div className="flex items-center gap-2">
          <Eye className="w-3.5 h-3.5 text-red-400" />
          <span className="text-xs text-gray-600">Comparison Triggers</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => adjust('comparison_trigger_count', -1)} className="w-5 h-5 rounded bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200">
            <Minus className="w-3 h-3" />
          </button>
          <span className={`text-sm font-mono w-6 text-center ${env.comparison_trigger_count === 0 ? 'text-green-500' : 'text-red-500'}`}>{env.comparison_trigger_count}</span>
          <button onClick={() => adjust('comparison_trigger_count', 1)} className="w-5 h-5 rounded bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200">
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Users className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-[10px] text-indigo-500 uppercase tracking-wider">Deep 5</span>
        </div>
        <div className="space-y-1">
          {deepRelationships.slice(0, 3).map((r) => (
            <div key={r.name} className="flex justify-between text-[10px]">
              <span className="text-gray-500">{r.name}</span>
              <span className="text-gray-400">{r.freq}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
