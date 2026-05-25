'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';

type ContentItem = {
  id: number;
  title: string;
  keyword: string;
  channel: 'fortifyfit' | 'naver' | 'threads';
  outline: string;
  status: 'idea' | 'drafting' | 'published';
  created: string;
};

const CHANNEL_COLORS: Record<string, string> = {
  fortifyfit: 'bg-blue-50 text-blue-600',
  naver: 'bg-green-50 text-green-600',
  threads: 'bg-purple-50 text-purple-600',
};

const STATUS_COLORS: Record<string, string> = {
  idea: 'text-gray-400',
  drafting: 'text-yellow-600',
  published: 'text-green-600',
};

export default function ContentRecipe() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: '', keyword: '', channel: 'fortifyfit' as ContentItem['channel'], outline: '' });

  useEffect(() => {
    const stored = localStorage.getItem('content-recipe');
    if (stored) setItems(JSON.parse(stored));
  }, []);

  const save = (updated: ContentItem[]) => {
    setItems(updated);
    localStorage.setItem('content-recipe', JSON.stringify(updated));
  };

  const add = () => {
    if (!form.title.trim()) return;
    save([{
      id: Date.now(),
      title: form.title.trim(),
      keyword: form.keyword.trim(),
      channel: form.channel,
      outline: form.outline.trim(),
      status: 'idea',
      created: new Date().toISOString().slice(0, 10),
    }, ...items]);
    setForm({ title: '', keyword: '', channel: 'fortifyfit', outline: '' });
    setShowForm(false);
  };

  const updateStatus = (id: number, status: ContentItem['status']) => {
    save(items.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  const updateOutline = (id: number, outline: string) => {
    save(items.map((item) => (item.id === id ? { ...item, outline } : item)));
  };

  const remove = (id: number) => {
    save(items.filter((item) => item.id !== id));
  };

  const statusCounts = {
    idea: items.filter((i) => i.status === 'idea').length,
    drafting: items.filter((i) => i.status === 'drafting').length,
    published: items.filter((i) => i.status === 'published').length,
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
          <FileText className="w-4 h-4 text-orange-500" />
          Content Recipe
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 text-xs"
        >
          <Plus className="w-3 h-3" />
          Add
        </button>
      </div>

      {items.length > 0 && (
        <div className="flex gap-3 mb-4 text-xs text-gray-400">
          <span>Idea <span className="text-gray-600 font-mono">{statusCounts.idea}</span></span>
          <span>Drafting <span className="text-yellow-600 font-mono">{statusCounts.drafting}</span></span>
          <span>Published <span className="text-green-600 font-mono">{statusCounts.published}</span></span>
        </div>
      )}

      {showForm && (
        <div className="mb-4 p-3 rounded-lg bg-gray-50 border border-gray-200 space-y-2">
          <input
            type="text"
            placeholder="Content title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 rounded bg-white text-gray-800 text-sm border border-gray-200 focus:border-orange-400 focus:outline-none"
            autoFocus
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Target keyword"
              value={form.keyword}
              onChange={(e) => setForm({ ...form, keyword: e.target.value })}
              className="flex-1 px-3 py-1.5 rounded bg-white text-gray-700 text-xs border border-gray-200 focus:border-orange-400 focus:outline-none"
            />
            <select
              value={form.channel}
              onChange={(e) => setForm({ ...form, channel: e.target.value as ContentItem['channel'] })}
              className="px-3 py-1.5 rounded bg-white text-gray-700 text-xs border border-gray-200 focus:outline-none"
            >
              <option value="fortifyfit">Fortifyfit</option>
              <option value="naver">Naver</option>
              <option value="threads">Threads</option>
            </select>
          </div>
          <textarea
            placeholder="Outline / notes (optional)"
            value={form.outline}
            onChange={(e) => setForm({ ...form, outline: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 rounded bg-white text-gray-700 text-xs border border-gray-200 focus:border-orange-400 focus:outline-none resize-none"
          />
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-1.5 rounded bg-gray-200 text-gray-600 text-xs hover:bg-gray-300">Cancel</button>
            <button onClick={add} className="flex-1 py-1.5 rounded bg-orange-500 text-white text-xs hover:bg-orange-600">Add Content</button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No content recipes yet.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div key={item.id} className="rounded-lg bg-gray-50 border border-gray-100 group hover:border-gray-200 transition-colors">
                <div className="flex items-center gap-2 p-2.5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : item.id)}>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${CHANNEL_COLORS[item.channel]}`}>{item.channel}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-gray-800">{item.title}</span>
                    {item.keyword && <span className="text-xs text-blue-500 ml-2">[{item.keyword}]</span>}
                  </div>
                  <select
                    value={item.status}
                    onChange={(e) => { e.stopPropagation(); updateStatus(item.id, e.target.value as ContentItem['status']); }}
                    onClick={(e) => e.stopPropagation()}
                    className={`px-2 py-0.5 rounded text-xs bg-transparent border-0 focus:outline-none cursor-pointer ${STATUS_COLORS[item.status]}`}
                  >
                    <option value="idea">Idea</option>
                    <option value="drafting">Drafting</option>
                    <option value="published">Published</option>
                  </select>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                  <button
                    onClick={(e) => { e.stopPropagation(); remove(item.id); }}
                    className="text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {isExpanded && (
                  <div className="px-3 pb-3 border-t border-gray-100 pt-2">
                    <textarea
                      value={item.outline}
                      onChange={(e) => updateOutline(item.id, e.target.value)}
                      placeholder="Write outline or notes here..."
                      rows={4}
                      className="w-full px-3 py-2 rounded bg-white text-gray-600 text-xs border border-gray-200 focus:border-orange-400 focus:outline-none resize-none"
                    />
                    <div className="text-[10px] text-gray-400 mt-1">Created: {item.created}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
