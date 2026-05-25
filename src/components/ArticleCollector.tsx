'use client';

import { useState, useEffect } from 'react';
import { Plus, X, ExternalLink, Lightbulb, ChevronDown, ChevronUp, Bookmark } from 'lucide-react';

type Article = {
  id: number;
  url: string;
  title: string;
  idea: string;
  tags: string[];
  createdAt: string;
  usedForContent: boolean;
};

const TAG_OPTIONS = ['SEO', 'GEO', 'AEO', '의료마케팅', '키워드', 'Threads', '네이버', '트렌드', '기술', '사례'];

export default function ArticleCollector() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [idea, setIdea] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('article-collector');
    if (stored) setArticles(JSON.parse(stored));
  }, []);

  const save = (updated: Article[]) => {
    setArticles(updated);
    localStorage.setItem('article-collector', JSON.stringify(updated));
  };

  const resetForm = () => { setUrl(''); setTitle(''); setIdea(''); setTags([]); setShowForm(false); };

  const addArticle = () => {
    if (!title.trim()) return;
    const article: Article = {
      id: Date.now(),
      url: url.trim(),
      title: title.trim(),
      idea: idea.trim(),
      tags,
      createdAt: new Date().toISOString().slice(0, 10),
      usedForContent: false,
    };
    save([article, ...articles]);
    resetForm();
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
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-blue-500" />
            기사 수집 & 콘텐츠 소재
          </h2>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        <div className="flex items-center gap-2">
          {articles.length > 0 && (
            <span className="text-xs text-gray-400">소재 {unused.length}개 / 사용 {used.length}개</span>
          )}
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs">
            <Plus className="w-3 h-3" />수집
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-400 mb-3">좋은 기사 → 내 아이디어 추가 → 콘텐츠로 변환</p>

      {!expanded && articles.length > 0 && (
        <div className="text-xs text-gray-400">미사용 소재 {unused.length}개 대기 중</div>
      )}

      {expanded && (
        <>
          {/* 입력 폼 */}
          {showForm && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3 border border-gray-100">
              <input
                type="text"
                placeholder="기사 제목 / 핵심 내용"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white text-sm border border-gray-200 focus:border-blue-400 focus:outline-none"
                autoFocus
              />
              <input
                type="url"
                placeholder="URL (선택)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white text-sm border border-gray-200 focus:border-blue-400 focus:outline-none"
              />
              <div>
                <div className="text-xs text-gray-500 mb-1.5">태그</div>
                <div className="flex flex-wrap gap-1.5">
                  {TAG_OPTIONS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t])}
                      className={`px-2.5 py-1 rounded-full text-xs ${tags.includes(t) ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                placeholder="내 아이디어: 이 기사를 바탕으로 어떤 콘텐츠를 만들 수 있을까?"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-white text-sm border border-gray-200 focus:border-blue-400 focus:outline-none resize-none"
              />
              <div className="flex gap-2">
                <button onClick={resetForm} className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm">취소</button>
                <button onClick={addArticle} disabled={!title.trim()} className="flex-1 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 text-sm disabled:opacity-40">
                  <Lightbulb className="w-3.5 h-3.5 inline mr-1" />저장
                </button>
              </div>
            </div>
          )}

          {/* 목록 */}
          {articles.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">메일에서 좋은 기사를 발견하면 여기에 수집하세요.</p>
          ) : (
            <div className="space-y-2">
              {unused.map((article) => {
                const isExpanded = expandedId === article.id;
                return (
                  <div key={article.id} className="rounded-lg border border-gray-100 bg-gray-50 overflow-hidden">
                    <div className="p-3 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : article.id)}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-700 truncate">{article.title}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {article.tags.map((t) => (
                              <span key={t} className="px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-600">{t}</span>
                            ))}
                            <span className="text-[10px] text-gray-400">{article.createdAt}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </div>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="px-3 pb-3 space-y-2 border-t border-gray-100 pt-2">
                        {article.url && (
                          <a href={article.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600">
                            <ExternalLink className="w-3 h-3" />원문 보기
                          </a>
                        )}
                        {article.idea && (
                          <div>
                            <span className="text-[10px] text-amber-500 uppercase tracking-wider">내 아이디어</span>
                            <p className="text-xs text-gray-600 mt-0.5 whitespace-pre-wrap bg-amber-50 rounded p-2">{article.idea}</p>
                          </div>
                        )}
                        <div className="flex gap-2 pt-1">
                          <button onClick={() => toggleUsed(article.id)}
                            className="px-3 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 text-xs">
                            콘텐츠로 사용 완료
                          </button>
                          <button onClick={() => deleteArticle(article.id)}
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
        </>
      )}
    </div>
  );
}
