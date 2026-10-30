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
  Globe,
  Image as ImageIcon,
} from 'lucide-react';
import { Chapter, Novel } from '../types';
import { storageService } from '../services/storageService';

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
  const [useCurrentOrigin, setUseCurrentOrigin] = useState(false);

  if (!isOpen) return null;

  // Base canonical official domain (e.g. https://www.aymankinani.org)
  const officialDomain = (storageService.getSeoSettings()?.canonicalBaseUrl || 'https://www.aymankinani.org').replace(/\/$/, '');
  const officialShareUrl = `${officialDomain}/chapter/${chapter.chapterNumber}`;

  // Current dev/preview origin
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const currentShareUrl = `${currentOrigin}/chapter/${chapter.chapterNumber}`;

  // Active share URL according to user selection (default is official canonical indexed link)
  const shareUrl = useCurrentOrigin ? currentShareUrl : officialShareUrl;

  const shareText = `أرشح لك قراءة الفصل ${chapter.chapterNumber} «${chapter.title}» من كتاب «${novel.title}» للكاتب أيمن كناني 📖✨\n${shareUrl}`;
  
  const quoteText = `📖 «${chapter.title}» — الفصل ${chapter.chapterNumber}\nمن كتاب: ${novel.title}\nالمؤلف: أيمن كناني\n\nتفضل بقراءة هذا الفصل كاملاً وبجودة عالية عبر الرابط الرسمي:\n${shareUrl}`;

  // Share card image (High-res book cover or banner)
  const shareImage = chapter.seo?.ogImage || novel.coverImage || novel.bannerImage || 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&auto=format&fit=crop&q=80';

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
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}`)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`📖 الفصل ${chapter.chapterNumber}: ${chapter.title} | كتاب ${novel.title} للمؤلف أيمن كناني`)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`قراءة الفصل ${chapter.chapterNumber} «${chapter.title}» من كتاب «${novel.title}» للكاتب أيمن كناني 📖`)}&url=${encodeURIComponent(shareUrl)}&hashtags=${encodeURIComponent('أيمن_كناني,كتب,روايات')}`;
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
                مشاركة الفصل
              </h3>
              <p className={`text-[11px] mt-0.5 ${isDark ? 'text-[#8892B0]' : 'text-[#8E8A83]'}`}>
                الرابط النظيف المفهرس ومعاينة بطاقة المشاركة للشبكات الاجتماعية
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
        <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Social Share Live Preview Card (What Facebook/Twitter/WhatsApp shows) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#6E6A64] dark:text-[#A0AEC0]">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#C88A3B]" />
                معاينة بطاقة المشاركة (Facebook / WhatsApp / X):
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-sans">
                OpenGraph 1200x630
              </span>
            </div>

            <div
              className={`rounded-2xl border overflow-hidden transition-all shadow-sm ${
                isDark
                  ? 'bg-[#151921] border-[#2E3440]'
                  : 'bg-[#FAF8F5] border-[#E5E2D9]'
              }`}
            >
              {/* Preview Image Header */}
              <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-black/5">
                <img
                  src={shareImage}
                  alt={chapter.title}
                  className="w-full h-full object-cover object-center filter brightness-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-end p-3.5 text-white">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-[10px] font-sans font-bold w-fit mb-1">
                    <Globe className="w-3 h-3" />
                    <span>AYMANKINANI.ORG</span>
                  </div>
                  <h4 className="font-amiri font-bold text-base sm:text-lg leading-tight line-clamp-1 drop-shadow-sm">
                    الفصل {chapter.chapterNumber}: {chapter.title}
                  </h4>
                  <p className="text-[11px] text-white/90 line-clamp-1 drop-shadow-xs">
                    كتاب: {novel.title} · بقلم الكاتب أيمن كناني
                  </p>
                </div>
              </div>

              {/* Preview Body Info */}
              <div className="p-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold text-[#4A5D4E] dark:text-emerald-400">
                    قراءة مباشرة بجودة عالية · المنصة المعتمدة
                  </div>
                  <div className="text-[10px] text-[#6E6A64] dark:text-[#8892B0] font-mono truncate mt-0.5">
                    {shareUrl}
                  </div>
                </div>
                <div className="shrink-0 px-3 py-1.5 rounded-lg bg-[#4A5D4E] text-white font-bold text-xs flex items-center gap-1 shadow-xs">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>قراءة الفصل</span>
                </div>
              </div>
            </div>
          </div>

          {/* Social Platforms Row */}
          <div>
            <div className="text-xs font-bold mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C88A3B]" />
              <span>نشر ومشاركة سريعة:</span>
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

          {/* Copy Direct Clean URL Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold block">
                رابط الفصل المفهرس:
              </label>
              {currentOrigin && currentOrigin !== officialDomain && (
                <div className="flex items-center gap-2 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setUseCurrentOrigin(false)}
                    className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                      !useCurrentOrigin
                        ? 'bg-[#4A5D4E] text-white shadow-xs'
                        : 'text-[#6E6A64] hover:text-[#2C2C2C]'
                    }`}
                  >
                    الرسمي المعتمد
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseCurrentOrigin(true)}
                    className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                      useCurrentOrigin
                        ? 'bg-[#4A5D4E] text-white shadow-xs'
                        : 'text-[#6E6A64] hover:text-[#2C2C2C]'
                    }`}
                  >
                    المعاينة الحالية
                  </button>
                </div>
              )}
            </div>

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
