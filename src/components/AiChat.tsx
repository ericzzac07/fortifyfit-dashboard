'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Loader2, X } from 'lucide-react';

type Message = { role: 'user' | 'ai'; text: string };

export default function AiChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/weekly-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report: userMsg }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((prev) => [...prev, { role: 'ai', text: data.error || 'API 오류' }]);
      } else {
        setMessages((prev) => [...prev, { role: 'ai', text: data.feedback }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', text: 'API 연결 실패. ANTHROPIC_API_KEY 확인 필요.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 flex items-center justify-center z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[380px] h-[500px] rounded-2xl bg-white border border-gray-200 shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div>
          <div className="text-sm font-bold text-gray-700">AI 매니저</div>
          <div className="text-[10px] text-gray-400">뭐든 물어보세요</div>
        </div>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="text-sm text-gray-400 mb-3">질문 예시</div>
            {['이번 주 뭐 해야 돼?', '블로그 키워드 추천해줘', '진행 상황 어때?'].map((q) => (
              <button key={q} onClick={() => { setInput(q); }}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 mb-1">
                {q}
              </button>
            ))}
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-blue-500 text-white rounded-br-md'
                : 'bg-gray-100 text-gray-700 rounded-bl-md'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-2.5">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 p-3">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="메시지 입력..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            className="flex-1 px-3 py-2.5 rounded-xl bg-gray-50 text-sm border border-gray-200 focus:border-blue-400 focus:outline-none"
            disabled={loading}
          />
          <button onClick={send} disabled={loading || !input.trim()}
            className="px-3 py-2.5 rounded-xl bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-40">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
