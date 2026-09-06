import React, { useState } from 'react';
import { Novel, Chapter, Comment } from '../../types';
import { storageService } from '../../services/storageService';
import {
  MessageSquare,
  Pin,
  Trash2,
  CornerDownRight,
  Heart,
  CheckCircle2,
  Filter,
  Send
} from 'lucide-react';

interface CommentModeratorTabProps {
  novels: Novel[];
  chapters: Chapter[];
  comments: Comment[];
  onRefreshData: () => void;
}

export const CommentModeratorTab: React.FC<CommentModeratorTabProps> = ({
  novels,
  chapters,
  comments,
  onRefreshData,
}) => {
  const [filterNovelId, setFilterNovelId] = useState<string>('all');
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleTogglePin = (commentId: string) => {
    storageService.togglePinComment(commentId);
    onRefreshData();
    showToast('تم تحديث حالة تثبيت التعليق بنجاح');
  };

  const handleDelete = (commentId: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا التعليق؟')) {
      storageService.deleteComment(commentId);
      onRefreshData();
      showToast('تم حذف التعليق');
    }
  };

  const handleAuthorReply = (targetComment: Comment) => {
    if (!replyContent.trim()) return;

    const novel = novels.find(n => n.id === targetComment.novelId);
    const authorName = novel ? novel.author : 'الكاتب';

    storageService.addComment({
      chapterId: targetComment.chapterId,
      novelId: targetComment.novelId,
      authorName,
      content: replyContent.trim(),
      parentId: targetComment.id,
      isAuthor: true,
    });

    setReplyContent('');
    setReplyingCommentId(null);
    onRefreshData();
    showToast(`تم الرد بصفة ${authorName}!`);
  };

  // Filtered list
  const displayedComments = comments.filter(c => {
    if (filterNovelId !== 'all' && c.novelId !== filterNovelId) return false;
    return true;
  });

  return (
    <div className="space-y-8 text-[#2C2C2C] font-cairo">
      {/* Toast */}
      {notification && (
        <div className="fixed bottom-6 left-6 z-50 bg-[#4A5D4E] text-[#FDFCF8] px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs">
        <div>
          <h2 className="font-amiri font-bold text-xl text-[#2C2C2C] flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#4A5D4E]" />
            <span>إدارة نقاشات وتعليقات القراء</span>
          </h2>
          <p className="text-xs text-[#6E6A64]">
            تفاعل مع قرائك، وثبت التحليلات المميزة بأعلى الفصل، ورد مباشرة بشارة الكاتب الرسمية.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#6E6A64]" />
          <select
            id="filter-comments-novel-select"
            value={filterNovelId}
            onChange={e => setFilterNovelId(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] font-bold cursor-pointer"
          >
            <option value="all">كافة الروايات ({comments.length} تعليق)</option>
            {novels.map(n => (
              <option key={n.id} value={n.id}>
                {n.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {displayedComments.length === 0 ? (
          <div className="text-center py-16 p-8 rounded-3xl bg-[#FFFFFF] border border-[#E5E2D9] text-[#6E6A64] text-xs italic shadow-xs">
            لا توجد تعليقات حتى الآن في هذا التصنيف.
          </div>
        ) : (
          displayedComments.map(comment => {
            const novel = novels.find(n => n.id === comment.novelId);
            const chapter = chapters.find(c => c.id === comment.chapterId);

            return (
              <div
                key={comment.id}
                id={`mod-comment-${comment.id}`}
                className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E2D9] space-y-3 shadow-xs"
              >
                {/* Context Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E2D9] pb-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-amiri font-bold text-[#4A5D4E] text-sm">
                      {novel?.title || 'رواية غير محددة'}
                    </span>
                    <span>·</span>
                    <span className="text-[#2C2C2C] font-semibold">
                      الفصل {chapter?.chapterNumber}: {chapter?.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {comment.isPinned && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#4A5D4E]/15 text-[#4A5D4E] flex items-center gap-1 border border-[#4A5D4E]/30">
                        <Pin className="w-3 h-3" />
                        <span>مثبت في الأعلى</span>
                      </span>
                    )}
                    <span className="text-[11px] text-[#6E6A64]">
                      {new Date(comment.createdAt).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                </div>

                {/* Comment Body */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <img
                      src={comment.authorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(comment.authorName)}`}
                      alt={comment.authorName}
                      className="w-8 h-8 rounded-full bg-[#4A5D4E]/20 object-cover shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#2C2C2C]">
                          {comment.authorName}
                        </span>
                        {comment.isAuthor && (
                          <span className="px-1.5 py-0.2 rounded bg-[#4A5D4E] text-[#FDFCF8] font-bold text-[9px]">
                            الكاتب
                          </span>
                        )}
                        <span className="text-[11px] text-rose-600 flex items-center gap-1 font-mono">
                          <Heart className="w-3 h-3 fill-current" />
                          <span>{comment.likes}</span>
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#2C2C2C] mt-1 leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      id={`pin-comment-btn-${comment.id}`}
                      onClick={() => handleTogglePin(comment.id)}
                      className={`p-2 rounded-lg border text-xs transition-colors cursor-pointer ${
                        comment.isPinned
                          ? 'bg-[#4A5D4E] text-[#FDFCF8] border-[#4A5D4E]'
                          : 'border-[#E5E2D9] bg-[#F7F5EE] hover:bg-[#E5E2D9] text-[#2C2C2C]'
                      }`}
                      title={comment.isPinned ? 'إلغاء التثبيت' : 'تثبيت التعليق بأعلى الفصل'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      id={`reply-author-btn-${comment.id}`}
                      onClick={() => setReplyingCommentId(replyingCommentId === comment.id ? null : comment.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#F7F5EE] hover:bg-[#E5E2D9] text-[#2C2C2C] text-xs font-bold flex items-center gap-1 cursor-pointer border border-[#E5E2D9]"
                    >
                      <CornerDownRight className="w-3.5 h-3.5" />
                      <span>رد الكاتب</span>
                    </button>

                    <button
                      type="button"
                      id={`delete-mod-comment-btn-${comment.id}`}
                      onClick={() => handleDelete(comment.id)}
                      className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs transition-colors cursor-pointer border border-rose-200"
                      title="حذف التعليق"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Inline Author Reply Form */}
                {replyingCommentId === comment.id && (
                  <div className="mt-3 pt-3 border-t border-[#E5E2D9] flex gap-2">
                    <input
                      type="text"
                      id={`mod-reply-input-${comment.id}`}
                      placeholder={`اكتب رد الكاتب (${novel?.author || 'المؤلف'})...`}
                      value={replyContent}
                      onChange={e => setReplyContent(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E]"
                    />
                    <button
                      type="button"
                      id={`mod-send-reply-${comment.id}`}
                      onClick={() => handleAuthorReply(comment)}
                      disabled={!replyContent.trim()}
                      className="px-4 py-2 bg-[#4A5D4E] hover:bg-[#3C4C3F] disabled:opacity-40 text-[#FDFCF8] font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>إرسال</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
