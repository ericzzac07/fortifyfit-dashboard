'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, X, ExternalLink } from 'lucide-react';

export type Keyword = {
  id: number;
  keyword: string;
  channel: 'fortifyfit' | 'naver' | 'threads';
  status: 'backlog' | 'writing' | 'published';
  url?: string;
  note?: string;
};

const CHANNEL_COLORS: Record<string, string> = {
  fortifyfit: 'bg-blue-50 text-blue-600',
  naver: 'bg-green-50 text-green-600',
  threads: 'bg-purple-50 text-purple-600',
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  backlog: { label: 'Backlog', color: 'text-gray-400' },
  writing: { label: 'Writing', color: 'text-yellow-600' },
  published: { label: 'Published', color: 'text-green-600' },
};

export default function KeywordRecipe() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ keyword: '', channel: 'fortifyfit' as Keyword['channel'], note: '' });
  const [filter, setFilter] = useState<'all' | 'backlog' | 'writing' | 'published'>('all');

  useEffect(() => {
    const stored = localStorage.getItem('keyword-recipe');
    if (stored) setKeywords(JSON.parse(stored));
  }, []);

  const save = (updated: Keyword[]) => {
    setKeywords(updated);
    localStorage.setItem('keyword-recipe', JSON.stringify(updated));
  };

  const addKeyword = () => {
    if (!form.keyword.trim()) return;
    save([{ id: Date.now(), keyword: form.keyword.trim(), channel: form.channel, status: 'backlog', note: form.note.trim() || undefined }, ...keywords]);
    setForm({ keyword: '', channel: 'fortifyfit', note: '' });
    setShowForm(false);
  };

  const updateStatus = (id: number, status: Keyword['status']) => {
    save(keywords.map((k) => (k.id === id ? { ...k, status } : k)));
  };

  const updateUrl = (id: number, url: string) => {
    save(keywords.map((k) => (k.id === id ? { ...k, url } : k)));
  };

  const remove = (id: number) => {
    save(keywords.filter((k) => k.id !== id));
  };

  const filtered = filter === 'all' ? keywords : keywords.filter((k) => k.status === filter);
  const counts = {
    all: keywords.length,
    backlog: keywords.filter((k) => k.status === 'backlog').length,
    writing: keywords.filter((k) => k.status === 'writing').length,
    published: keywords.filter((k) => k.status === 'published').length,
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
          <Search className="w-4 h-4 text-blue-500" />
          Keyword Recipe
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs"
        >
          <Plus className="w-3 h-3" />
          Add
        </button>
      </div>

      <div className="flex gap-1 mb-4">
        {(['all', 'backlog', 'writing', 'published'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${
              filter === f ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f === 'all' ? 'All' : STATUS_LABELS[f].label} ({counts[f]})
          </button>
        ))}
      </div>

      {showForm && (
        <div className="mb-4 p-3 rounded-lg bg-gray-50 border border-gray-200 space-y-2">
          <input
            type="text"
            placeholder="Target keyword"
            value={form.keyword}
            onChange={(e) => setForm({ ...form, keyword: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
            className="w-full px-3 py-2 rounded bg-white text-gray-800 text-sm border border-gray-200 focus:border-blue-400 focus:outline-none"
            autoFocus
          />
          <div className="flex gap-2">
            <select
              value={form.channel}
              onChange={(e) => setForm({ ...form, channel: e.target.value as Keyword['channel'] })}
              className="px-3 py-1.5 rounded bg-white text-gray-700 text-xs border border-gray-200 focus:outline-none"
            >
              <option value="fortifyfit">Fortifyfit</option>
              <option value="naver">Naver</option>
              <option value="threads">Threads</option>
            </select>
            <input
              type="text"
              placeholder="Memo (optional)"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="flex-1 px-3 py-1.5 rounded bg-white text-gray-700 text-xs border border-gray-200 focus:border-blue-400 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-1.5 rounded bg-gray-200 text-gray-600 text-xs hover:bg-gray-300">Cancel</button>
            <button onClick={addKeyword} className="flex-1 py-1.5 rounded bg-blue-500 text-white text-xs hover:bg-blue-600">Add Keyword</button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No keywords yet.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((kw) => (
            <div key={kw.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 border border-gray-100 group hover:border-gray-200 transition-colors">
              <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${CHANNEL_COLORS[kw.channel]}`}>{kw.channel}</span>
              <div className="flex-1 min-w-0">
                <span className="text-sm text-gray-800">{kw.keyword}</span>
                {kw.note && <span className="text-xs text-gray-400 ml-2">{kw.note}</span>}
              </div>
              <select
                value={kw.status}
                onChange={(e) => updateStatus(kw.id, e.target.value as Keyword['status'])}
                className={`px-2 py-0.5 rounded text-xs bg-transparent border-0 focus:outline-none cursor-pointer ${STATUS_LABELS[kw.status].color}`}
              >
                <option value="backlog">Backlog</option>
                <option value="writing">Writing</option>
                <option value="published">Published</option>
              </select>
              {kw.status === 'published' && (
                kw.url ? (
                  <a href={kw.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <input
                    type="text"
                    placeholder="URL"
                    className="w-24 px-2 py-0.5 rounded text-xs bg-white text-gray-600 border border-gray-200 focus:outline-none"
                    onBlur={(e) => updateUrl(kw.id, e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && updateUrl(kw.id, (e.target as HTMLInputElement).value)}
                  />
                )
              )}
              <button onClick={() => remove(kw.id)} className="text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
