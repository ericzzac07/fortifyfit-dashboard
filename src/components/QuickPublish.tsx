'use client';

import { useState, useEffect } from 'react';
import { Zap, Send, MessageSquare, FileText, PenLine, ChevronDown, ChevronUp } from 'lucide-react';

type QuickAction = {
  id: string;
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  channel: string;
};

const actions: QuickAction[] = [
  { id: 'threads', icon: <MessageSquare className="w-4 h-4" />, label: 'Threads', placeholder: "Today's insight for ai_demarco...", channel: 'threads' },
  { id: 'fortifyfit', icon: <FileText className="w-4 h-4" />, label: 'Blog Draft', placeholder: 'Blog post idea / keyword for fortifyfit...', channel: 'fortifyfit' },
  { id: 'content', icon: <PenLine className="w-4 h-4" />, label: 'Content Idea', placeholder: 'Quick content idea for calendar...', channel: 'naver' },
];

type LogItem = { id: number; channel: string; text: string; date: string };

export default function QuickPublish() {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [log, setLog] = useState<LogItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('quick-publish-log');
    if (stored) setLog(JSON.parse(stored));
  }, []);

  const save = () => {
    if (!text.trim() || !activeAction) return;
    const action = actions.find((a) => a.id === activeAction);
    const newItem: LogItem = { id: Date.now(), channel: action?.channel || '', text: text.trim(), date: new Date().toISOString() };
    const updated = [newItem, ...log].slice(0, 50);
    setLog(updated);
    localStorage.setItem('quick-publish-log', JSON.stringify(updated));
    setText('');
    setActiveAction(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-blue-500" />
        <h2 className="text-sm font-bold text-gray-800">Quick Publish</h2>
        {saved && <span className="text-[10px] text-green-500 ml-auto">Saved!</span>}
      </div>

      <div className="flex gap-2 mb-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => setActiveAction(activeAction === action.id ? null : action.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
              activeAction === action.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>

      {activeAction && (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={actions.find((a) => a.id === activeAction)?.placeholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            className="flex-1 px-3 py-2 rounded-lg bg-gray-50 text-gray-800 text-sm border border-gray-200 focus:border-blue-400 focus:outline-none"
            autoFocus
          />
          <button onClick={save} className="px-3 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600">
            <Send className="w-4 h-4" />
          </button>
        </div>
      )}

      {log.length > 0 && (
        <div className="mt-3 border-t border-gray-100 pt-2">
          <button onClick={() => setShowLog(!showLog)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
            {showLog ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            History ({log.length})
          </button>
          {showLog && (
            <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto">
              {log.map((item) => {
                const channelLabel = actions.find((a) => a.channel === item.channel)?.label || item.channel;
                return (
                  <div key={item.id} className="flex items-start gap-2 text-xs">
                    <span className="px-1.5 py-0.5 rounded bg-gray-100 text-blue-600 shrink-0">{channelLabel}</span>
                    <span className="text-gray-500 flex-1 break-all">{item.text}</span>
                    <span className="text-gray-300 shrink-0">
                      {new Date(item.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
