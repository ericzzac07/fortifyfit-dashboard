'use client';

import { useState, useEffect } from 'react';
import { Plus, X, ExternalLink, Lightbulb, ChevronDown, ChevronUp, Bookmark, Loader2 } from 'lucide-react';

type Article = {
  id: number;
  url: string;
  title: string;
  description: string;
  siteName: string;
  idea: string;
  tags: string[];
  createdAt: string;
  usedForContent: boolean;
};

export default function ArticleCollector() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingIdea, setEditingIdea] = useState<number | null>(null);
  const [ideaText, setIdeaText] = useState('');

  // 폼
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('article-collector');
    if (stored) setArticles(JSON.parse(stored));
  }, []);

  const save = (updated: Article[]) => {
    setArticles(updated);
    localStorage.setItem('article-collector', JSON.stringify(updated));
  };

  // URL 붙여넣으면 자동으로 정보 가져오기
  const fetchAndSave = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      const res = await fetch('/api/fetch-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await res.json();
      const article: Article = {
        id: Date.now(),
        url: trimmed,
        title: data.title || trimmed,
        description: data.description || '',
        siteName: data.siteName || '',
        idea: '',
        tags: data.tags || ['트렌드'],
        createdAt: new Date().toISOString().slice(0, 10),
        usedForContent: false,
      };
      save([article, ...articles]);
      setUrl('');
      setShowForm(false);
    } catch {
      // 실패해도 URL만으로 저장
      save([{
        id: Date.now(), url: trimmed, title: trimmed, description: '', siteName: '',
        idea: '', tags: ['트렌드'], createdAt: new Date().toISOString().slice(0, 10), usedForContent: false,
      }, ...articles]);
      setUrl('');
      setShowForm(false);
    } finally {
      setLoading(false);
    }
  };

  const saveIdea = (id: number) => {
    save(articles.map((a) => a.id === id ? { ...a, idea: ideaText.trim() } : a));
    setEditingIdea(null);
    setIdeaText('');
  };

  const toggleUsed = (id: number) => {
    save(articles.map((a) => a.id === id ? { ...a, usedForContent: !a.usedForContent } : a));
  };

  const deleteArticle = (id: number) => {
    save(articles.filter((a) => a.id !== id));
  };

  const unused = articles.filter((a) => !a.usedForContent);
  const used = articles.filter((a) => a.usedForContent);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-blue-500" />
          기사 수집
        </h2>
        <div className="flex items-center gap-2">
          {articles.length > 0 && (
            <span className="text-xs text-gray-400">{unused.length}개 소재</span>
          )}
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs">
            <Plus className="w-3 h-3" />수집
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-400 mb-3">링크만 붙여넣으면 자동 저장. 아이디어 추가해서 콘텐츠로.</p>

      {/* URL 입력 — 이것만 하면 됨 */}
      {showForm && (
        <div className="flex gap-2 mb-4">
          <input
            type="url"
            placeholder="기사 URL 붙여넣기"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchAndSave()}
            className="flex-1 px-3 py-2.5 rounded-lg bg-gray-50 text-sm border border-gray-200 focus:border-blue-400 focus:outline-none"
            autoFocus
            disabled={loading}
          />
          <button onClick={fetchAndSave} disabled={loading || !url.trim()}
            className="px-4 py-2.5 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 disabled:opacity-40 flex items-center gap-1.5">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {loading ? '가져오는 중' : '저장'}
          </button>
        </div>
      )}

      {/* 목록 */}
      {articles.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-3">메일에서 좋은 기사를 발견하면 링크를 수집하세요.</p>
      ) : (
        <div className="space-y-2">
          {unused.map((article) => {
            const isExpanded = expandedId === article.id;
            const isEditingIdea = editingIdea === article.id;
            return (
              <div key={article.id} className="rounded-lg border border-gray-100 bg-gray-50 overflow-hidden">
                <div className="p-3 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : article.id)}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-700 leading-snug">{article.title}</div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] text-gray-400">{article.siteName}</span>
                        <span className="text-[10px] text-gray-300">{article.createdAt}</span>
                        {article.tags.map((t) => (
                          <span key={t} className="px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-600">{t}</span>
                        ))}
                        {article.idea && <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-50 text-amber-600">아이디어</span>}
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-3 pb-3 space-y-2 border-t border-gray-100 pt-2">
                    {article.description && (
                      <p className="text-xs text-gray-500 leading-relaxed">{article.description}</p>
                    )}
                    {article.url && (
                      <a href={article.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600">
                        <ExternalLink className="w-3 h-3" />원문 보기
                      </a>
                    )}

                    {/* 아이디어 */}
                    {article.idea && !isEditingIdea && (
                      <div className="bg-amber-50 rounded-lg p-2.5 cursor-pointer" onClick={(e) => { e.stopPropagation(); setEditingIdea(article.id); setIdeaText(article.idea); }}>
                        <span className="text-[10px] text-amber-500 uppercase tracking-wider">내 아이디어</span>
                        <p className="text-xs text-gray-600 mt-0.5 whitespace-pre-wrap">{article.idea}</p>
                      </div>
                    )}
                    {isEditingIdea ? (
                      <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                        <textarea
                          placeholder="이 기사로 어떤 콘텐츠를 만들 수 있을까?"
                          value={ideaText}
                          onChange={(e) => setIdeaText(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 rounded-lg bg-white text-sm border border-amber-200 focus:border-amber-400 focus:outline-none resize-none"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingIdea(null); setIdeaText(''); }} className="text-xs text-gray-400">취소</button>
                          <button onClick={() => saveIdea(article.id)} className="text-xs text-amber-600 font-medium">저장</button>
                        </div>
                      </div>
                    ) : !article.idea && (
                      <button onClick={(e) => { e.stopPropagation(); setEditingIdea(article.id); setIdeaText(''); }}
                        className="flex items-center gap-1 text-xs text-amber-500 hover:text-amber-600">
                        <Lightbulb className="w-3 h-3" />아이디어 추가
                      </button>
                    )}

                    <div className="flex gap-2 pt-1">
                      <button onClick={(e) => { e.stopPropagation(); toggleUsed(article.id); }}
                        className="px-3 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 text-xs">
                        콘텐츠로 사용 완료
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteArticle(article.id); }}
                        className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-400 hover:text-red-400 text-xs">
                        삭제
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {used.length > 0 && (
            <div className="pt-2 border-t border-gray-100">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">사용 완료 ({used.length})</div>
              {used.slice(0, 3).map((article) => (
                <div key={article.id} className="flex items-center gap-2 py-1 text-xs text-gray-400">
                  <span className="line-through truncate">{article.title}</span>
                  <button onClick={() => toggleUsed(article.id)} className="text-[10px] text-blue-400 hover:text-blue-500 shrink-0">복원</button>
                </div>
              ))}
              {used.length > 3 && <div className="text-[10px] text-gray-300">+{used.length - 3}개 더</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
