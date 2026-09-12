import React, { useState, useEffect } from 'react';
import { MessageSquare, Heart, CornerDownLeft, Send, User, Check, Trash2 } from 'lucide-react';

export interface ArticleReplyItem {
  id: string;
  articleId: string;
  authorName: string;
  content: string;
  createdAt: string;
  likes: number;
  userLiked?: boolean;
  parentId?: string; // for nested replies
}

interface ArticleRepliesProps {
  articleId: string;
  articleTitle: string;
}

const STORAGE_KEY = 'ayman_article_replies_v1';

export const ArticleReplies: React.FC<ArticleRepliesProps> = ({
  articleId,
  articleTitle,
}) => {
  const [replies, setReplies] = useState<ArticleReplyItem[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyAuthorName, setReplyAuthorName] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Load replies for this article
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const all: ArticleReplyItem[] = JSON.parse(stored);
        const filtered = all.filter(r => r.articleId === articleId);
        setReplies(filtered);
      } else {
        // Sample thoughtful replies for initial rich experience
        const initialReplies: ArticleReplyItem[] = [
          {
            id: `reply-${articleId}-1`,
            articleId,
            authorName: 'د. طارق الحكيم',
            content: 'طرح منهجي دقيق ورؤية تحليلية متقدمة، خصوصاً في الربط بين الجذور المفاهيمية وسياق الحداثة المعاصرة. حبذا التوسع في نقطة الإشكالية التأويلية.',
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            likes: 7,
            userLiked: false,
          },
          {
            id: `reply-${articleId}-2`,
            articleId,
            authorName: 'أيمن كناني (الكاتب)',
            content: 'أشكرك دكتور طارق على هذه الإضافة النوعية، بالفعل الإشكالية التأويلية تحتاج لبحث مستقل وسيكون موضوع دراستي القادمة بمشيئة الله.',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            likes: 12,
            userLiked: true,
            parentId: `reply-${articleId}-1`,
          },
        ];
        setReplies(initialReplies);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialReplies));
      }
    } catch {
      setReplies([]);
    }
  }, [articleId]);

  const saveAllReplies = (updated: ArticleReplyItem[]) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const all: ArticleReplyItem[] = stored ? JSON.parse(stored) : [];
      const others = all.filter(r => r.articleId !== articleId);
      const combined = [...others, ...updated];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(combined));
      setReplies(updated);
    } catch {
      setReplies(updated);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const newReply: ArticleReplyItem = {
      id: `rep-${Date.now()}`,
      articleId,
      authorName: authorName.trim() || 'قارئ وباحث',
      content: content.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      userLiked: false,
    };

    const updated = [newReply, ...replies];
    saveAllReplies(updated);
    setContent('');
    setSuccessNotice('تم إضافة ردك بنجاح.');
    setTimeout(() => setSuccessNotice(''), 3500);
  };

  const handleAddNestedReply = (parentId: string) => {
    if (!replyContent.trim()) return;

    const newReply: ArticleReplyItem = {
      id: `rep-${Date.now()}`,
      articleId,
      authorName: replyAuthorName.trim() || 'قارئ وباحث',
      content: replyContent.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      userLiked: false,
      parentId,
    };

    const updated = [...replies, newReply];
    saveAllReplies(updated);
    setReplyContent('');
    setReplyingToId(null);
    setSuccessNotice('تم إضافة تعقيبك بنجاح.');
    setTimeout(() => setSuccessNotice(''), 3500);
  };

  const handleToggleLike = (id: string) => {
    const updated = replies.map(r => {
      if (r.id === id) {
        const isLiked = r.userLiked;
        return {
          ...r,
          likes: isLiked ? Math.max(0, r.likes - 1) : r.likes + 1,
          userLiked: !isLiked,
        };
      }
      return r;
    });
    saveAllReplies(updated);
  };

  // Group into root comments and their child replies
  const rootComments = replies.filter(r => !r.parentId);
  const getChildReplies = (parentId: string) => replies.filter(r => r.parentId === parentId);

  return (
    <section className="mt-12 p-5 sm:p-7 rounded-3xl border border-[#E5E2D9] bg-white text-[#2C2C2C] shadow-2xs font-cairo">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E5E2D9]">
        <div>
          <h3 className="font-amiri font-bold text-lg sm:text-xl text-stone-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#4A5D4E]" />
            <span>ردود ومناقشات القراء ({replies.length})</span>
          </h3>
          <p className="text-xs text-[#70757a] mt-0.5">
            شارك برأيك أو تعقيبك الفكري على مقال: «{articleTitle}»
          </p>
        </div>
      </div>

      {successNotice && (
        <div className="my-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Main Comment Input Form */}
      <form onSubmit={handleAddComment} className="mt-4 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5E2D9] space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="sm:w-1/3">
            <label className="block text-xs font-bold text-stone-700 mb-1">
              اسمك أو صفتك (اختياري):
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                placeholder="مثال: د. باحث أكاديمي، قارئ مهتم..."
                className="w-full p-2.5 text-xs rounded-xl border border-[#D5D0C5] bg-white text-stone-900 font-cairo outline-hidden focus:border-[#4A5D4E]"
              />
              <User className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 pointer-events-none" />
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-xs font-bold text-stone-700 mb-1">
              نص الرد أو المناقشة الفكرية:
            </label>
            <textarea
              rows={2}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="اكتب تعقيبك أو سؤالك هنا..."
              className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-[#D5D0C5] bg-white text-stone-900 font-cairo outline-hidden focus:border-[#4A5D4E]"
              required
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-[#4A5D4E] hover:bg-[#3C4C3F] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>نشر الرد</span>
          </button>
        </div>
      </form>

      {/* Replies List */}
      <div className="mt-6 space-y-4">
        {rootComments.length === 0 ? (
          <p className="text-center py-8 text-xs text-[#8E8A83]">
            لا توجد ردود بعد. كن أول من يفتتح النقاش الفكري حول هذا المقال!
          </p>
        ) : (
          rootComments.map(comment => {
            const children = getChildReplies(comment.id);
            const isReplying = replyingToId === comment.id;

            return (
              <div
                key={comment.id}
                className="p-4 rounded-2xl border border-[#E5E2D9] bg-[#FAF8F5] space-y-2.5"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-[#4A5D4E]/10 text-[#4A5D4E] flex items-center justify-center font-bold text-xs">
                      {comment.authorName.charAt(0) || 'ق'}
                    </span>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-stone-900">
                        {comment.authorName}
                      </h4>
                      <span className="text-[10px] text-[#8E8A83]">
                        {new Date(comment.createdAt).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Like button */}
                    <button
                      type="button"
                      onClick={() => handleToggleLike(comment.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                        comment.userLiked
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
                      }`}
                      title="إعجاب بالرد"
                    >
                      <Heart className={`w-3 h-3 ${comment.userLiked ? 'fill-current' : ''}`} />
                      <span>{comment.likes}</span>
                    </button>

                    {/* Reply button */}
                    <button
                      type="button"
                      onClick={() => setReplyingToId(isReplying ? null : comment.id)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-stone-100 text-[#4A5D4E] border border-stone-200 flex items-center gap-1 cursor-pointer"
                    >
                      <CornerDownLeft className="w-3 h-3" />
                      <span>رد</span>
                    </button>
                  </div>
                </div>

                {/* Comment Content */}
                <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-cairo pr-9">
                  {comment.content}
                </p>

                {/* Nested Reply Form */}
                {isReplying && (
                  <div className="mt-3 mr-6 p-3 rounded-xl bg-white border border-[#D5D0C5] space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={replyAuthorName}
                        onChange={e => setReplyAuthorName(e.target.value)}
                        placeholder="اسمك (اختياري)"
                        className="w-1/3 p-2 text-xs rounded-lg border border-stone-200 font-cairo"
                      />
                      <input
                        type="text"
                        value={replyContent}
                        onChange={e => setReplyContent(e.target.value)}
                        placeholder="اكتب ردك المباشر هنا..."
                        className="flex-1 p-2 text-xs rounded-lg border border-stone-200 font-cairo"
                        autoFocus
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setReplyingToId(null)}
                        className="px-3 py-1 rounded-lg text-xs text-stone-500 hover:bg-stone-100 cursor-pointer"
                      >
                        إلغاء
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddNestedReply(comment.id)}
                        className="px-3 py-1 rounded-lg bg-[#4A5D4E] text-white text-xs font-bold cursor-pointer"
                      >
                        إرسال التعقيب
                      </button>
                    </div>
                  </div>
                )}

                {/* Child Replies */}
                {children.length > 0 && (
                  <div className="mt-3 mr-6 space-y-2 pt-2 border-t border-[#E5E2D9]/60">
                    {children.map(child => (
                      <div
                        key={child.id}
                        className="p-3 rounded-xl bg-white border border-[#E5E2D9] space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-[10px]">
                              {child.authorName.charAt(0) || 'ق'}
                            </span>
                            <span className="font-bold text-xs text-stone-900">
                              {child.authorName}
                            </span>
                            <span className="text-[10px] text-[#8E8A83]">
                              {new Date(child.createdAt).toLocaleDateString('ar-EG', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleToggleLike(child.id)}
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer ${
                              child.userLiked
                                ? 'bg-rose-50 text-rose-600'
                                : 'text-stone-500 hover:text-stone-800'
                            }`}
                          >
                            <Heart className={`w-2.5 h-2.5 ${child.userLiked ? 'fill-current' : ''}`} />
                            <span>{child.likes}</span>
                          </button>
                        </div>

                        <p className="text-xs text-stone-700 leading-relaxed pr-6">
                          {child.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
