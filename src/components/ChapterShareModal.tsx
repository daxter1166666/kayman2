import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Send,
  BookOpen,
  Sparkles,
  Smartphone,
  Quote,
} from 'lucide-react';
import { Chapter, Novel } from '../types';

interface ChapterShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: Chapter;
  novel: Novel;
  themeMode?: string;
}

export const ChapterShareModal: React.FC<ChapterShareModalProps> = ({
  isOpen,
  onClose,
  chapter,
  novel,
  themeMode = 'paper',
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedQuote, setCopiedQuote] = useState(false);

  if (!isOpen) return null;

  // Formulate canonical share link
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${origin}/novel/${novel.slug || novel.id}/chapter-${chapter.chapterNumber}?chapter=${chapter.id}`;

  const shareText = `أرشح لك قراءة الفصل ${chapter.chapterNumber} «${chapter.title}» من كتاب «${novel.title}» للكاتب أيمن كناني 📖✨`;
  
  const quoteText = `📖 «${chapter.title}» — الفصل ${chapter.chapterNumber}\nمن كتاب: ${novel.title}\nالمؤلف: أيمن كناني\n\nتفضل بقراءة هذا الفصل كاملاً وبجودة عالية عبر الرابط:\n${shareUrl}`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleCopyQuote = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(quoteText);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = quoteText;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedQuote(true);
      setTimeout(() => setCopiedQuote(false), 3000);
    } catch (err) {
      console.error('Failed to copy quote:', err);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `الفصل ${chapter.chapterNumber}: ${chapter.title} | ${novel.title}`,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or aborted
      }
    } else {
      handleCopyLink();
    }
  };

  // Social share URLs
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=${encodeURIComponent('أيمن_كناني,كتب,روايات')}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

  const isDark = themeMode === 'slate' || themeMode === 'obsidian' || themeMode === 'emerald';
  const hasNativeShare = typeof navigator !== 'undefined' && Boolean(navigator.share);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      id="chapter-share-modal-overlay"
    >
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden transition-all animate-in zoom-in-95 duration-200 ${
          isDark
            ? 'bg-[#181C24] border-[#2E3440] text-[#E5E9F0]'
            : 'bg-[#FFFFFF] border-[#E5E2D9] text-[#2C2C2C]'
        }`}
        onClick={(e) => e.stopPropagation()}
        id="chapter-share-modal"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E5E2D9]/70 dark:border-[#2E3440]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#4A5D4E]/10 text-[#4A5D4E] flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-amiri font-bold text-lg leading-none">
                مشاركة الفصل مع الأصدقاء
              </h3>
              <p className={`text-[11px] mt-0.5 ${isDark ? 'text-[#8892B0]' : 'text-[#8E8A83]'}`}>
                اختر المنصة المناسبة لنشر هذا الفصل وقراءته مباشرة
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق النافذة"
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isDark
                ? 'hover:bg-[#202530] text-[#8892B0] hover:text-[#FFFFFF]'
                : 'hover:bg-[#F7F5EE] text-[#8E8A83] hover:text-[#2C2C2C]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Chapter Summary Card */}
          <div
            className={`p-4 rounded-xl border flex items-center gap-4 ${
              isDark
                ? 'bg-[#202530]/60 border-[#2E3440]'
                : 'bg-[#F7F5EE]/80 border-[#E5E2D9]'
            }`}
          >
            {novel.coverImage ? (
              <img
                src={novel.coverImage}
                alt={novel.title}
                className="w-14 h-20 rounded-lg object-cover shadow-xs shrink-0 border border-[#E5E2D9]"
              />
            ) : (
              <div className="w-14 h-20 rounded-lg bg-[#4A5D4E]/15 text-[#4A5D4E] flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
            )}

            <div className="min-w-0 flex-1 space-y-1">
              <div className="text-[11px] font-bold text-[#4A5D4E] flex items-center gap-1.5">
                <span>الفصل {chapter.chapterNumber}</span>
                <span>·</span>
                <span>{chapter.wordCount || 0} كلمة</span>
              </div>
              <h4 className="font-amiri font-bold text-base sm:text-lg leading-tight truncate">
                {chapter.title}
              </h4>
              <p className={`text-xs truncate ${isDark ? 'text-[#A0AEC0]' : 'text-[#6E6A64]'}`}>
                من كتاب: {novel.title} · بقلم الكاتب أيمن كناني
              </p>
            </div>
          </div>

          {/* Social Platforms Row */}
          <div>
            <div className="text-xs font-bold mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C88A3B]" />
              <span>مشاركة سريعة بنقرة واحدة:</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#128C7E] dark:text-[#25D366] font-bold text-xs transition-all transform hover:-translate-y-0.5"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>واتساب</span>
              </a>

              {/* Telegram */}
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-[#0088cc]/10 hover:bg-[#0088cc]/20 border border-[#0088cc]/30 text-[#0088cc] font-bold text-xs transition-all transform hover:-translate-y-0.5"
              >
                <Send className="w-5 h-5" />
                <span>تليجرام</span>
              </a>

              {/* X / Twitter */}
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-[#000000]/10 dark:bg-[#FFFFFF]/10 hover:bg-[#000000]/20 dark:hover:bg-[#FFFFFF]/20 border border-current/20 font-bold text-xs transition-all transform hover:-translate-y-0.5"
              >
                <span className="font-mono font-bold text-base">𝕏</span>
                <span>منصة X</span>
              </a>

              {/* Facebook */}
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] font-bold text-xs transition-all transform hover:-translate-y-0.5"
              >
                <ExternalLink className="w-5 h-5" />
                <span>فيسبوك</span>
              </a>
            </div>

            {/* Native Mobile Share Button (If supported) */}
            {hasNativeShare && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="w-full mt-2.5 py-2.5 px-4 rounded-xl border border-[#4A5D4E]/30 bg-[#4A5D4E]/10 hover:bg-[#4A5D4E]/20 text-[#4A5D4E] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>فتح قائمة المشاركة بهاتفك (تطبيقات أخرى)</span>
              </button>
            )}
          </div>

          {/* Copy Direct URL Section */}
          <div className="space-y-2">
            <label className="text-xs font-bold block">
              رابط الفصل المباشر:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className={`flex-1 px-3.5 py-2.5 rounded-xl border text-xs font-mono select-all focus:outline-none ${
                  isDark
                    ? 'bg-[#202530] border-[#2E3440] text-[#CBD5E0]'
                    : 'bg-[#F7F5EE] border-[#E5E2D9] text-[#2C2C2C]'
                }`}
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                  copiedLink
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#4A5D4E] hover:bg-[#3D4D40] text-white shadow-xs'
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>نسخ الرابط</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Copy Full Quote Snippet */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
              isDark
                ? 'bg-[#202530]/40 border-[#2E3440]'
                : 'bg-[#F7F5EE]/50 border-[#E5E2D9]'
            }`}
          >
            <div className="space-y-0.5 text-right">
              <div className="text-xs font-bold flex items-center gap-1.5">
                <Quote className="w-3.5 h-3.5 text-[#C88A3B]" />
                <span>نسخ بطاقة دعوة للقراءة</span>
              </div>
              <p className={`text-[11px] ${isDark ? 'text-[#8892B0]' : 'text-[#8E8A83]'}`}>
                تتضمن عنوان الفصل، اسم الكاتب ورابط القراءة منسقة للمحادثات
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopyQuote}
              className={`px-3 py-2 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1 transition-all cursor-pointer border ${
                copiedQuote
                  ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/40'
                  : isDark
                  ? 'bg-[#202530] hover:bg-[#282E3A] border-[#2E3440] text-[#CBD5E0]'
                  : 'bg-white hover:bg-[#F7F5EE] border-[#E5E2D9] text-[#2C2C2C]'
              }`}
            >
              {copiedQuote ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>تم نسخ الدعوة!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ النص كاملاً</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
