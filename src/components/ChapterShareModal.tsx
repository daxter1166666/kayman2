import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  X,
  ExternalLink,
  MessageCircle,
  Send,
  Facebook,
  Twitter,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { Novel, Chapter } from '../types';

interface ChapterShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: Chapter;
  novel: Novel;
}

export const ChapterShareModal: React.FC<ChapterShareModalProps> = ({
  isOpen,
  onClose,
  chapter,
  novel,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  // Generate shareable link
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?novel=${encodeURIComponent(novel.id)}&chapter=${encodeURIComponent(chapter.id)}`
    : '';

  const shareTitle = `قراءة ${chapter.title} من رواية ${novel.title}`;
  const shareText = `استمتع بقراءة "${chapter.title}" من عمل "${novel.title}" للكاتب ${novel.author} عبر منصة نوفيليا:`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  const shareChannels = [
    {
      name: 'واتساب',
      icon: MessageCircle,
      color: 'bg-emerald-500 hover:bg-emerald-600 text-white',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`,
    },
    {
      name: 'تيليجرام',
      icon: Send,
      color: 'bg-sky-500 hover:bg-sky-600 text-white',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    },
    {
      name: 'منصة X',
      icon: Twitter,
      color: 'bg-neutral-800 hover:bg-neutral-900 text-white',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'فيسبوك',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
  ];

  return (
    <div
      id="chapter-share-modal-backdrop"
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-cairo animate-in fade-in duration-200 overflow-y-auto"
    >
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div
        id="chapter-share-modal-dialog"
        className="relative w-full max-w-lg bg-[#FFFFFF] border border-[#E5E2D9] rounded-3xl shadow-2xl p-6 sm:p-7 text-right z-10 overflow-hidden my-auto"
      >
        {/* Top Decorative Amber Line */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-[#C88A3B]" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#C88A3B]/10 text-[#C88A3B] flex items-center justify-center shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-amiri font-bold text-xl text-[#2C2C2C]">
                مشاركة الفصل
              </h3>
              <p className="text-xs text-[#6E6A64]">
                شارك رابط الفصل المباشر مع القراء ومحبي الأدب
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#6E6A64] hover:text-[#2C2C2C] hover:bg-[#F2EFE9] rounded-full transition-colors cursor-pointer"
            aria-label="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chapter Info Card */}
        <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#E5E2D9] mb-5">
          <div className="flex items-center gap-2 text-xs font-medium text-[#4A5D4E] mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>رواية: {novel.title}</span>
          </div>
          <h4 className="font-amiri font-bold text-base text-[#2C2C2C] leading-snug">
            {chapter.title}
          </h4>
          <p className="text-xs text-[#6E6A64] mt-1">
            بقلم الكاتب: <span className="text-[#2C2C2C] font-semibold">{novel.author}</span>
          </p>
        </div>

        {/* Copy Link Section */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-[#5A5751] mb-2">
            الرابط المباشر للقراءة:
          </label>
          <div className="flex items-center gap-2 p-1.5 bg-[#F2EFE9] border border-[#E5E2D9] rounded-xl">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-transparent px-3 py-1.5 text-xs text-[#2C2C2C] font-mono outline-hidden select-all text-left dir-ltr"
            />
            <button
              type="button"
              id="chapter-share-copy-btn"
              onClick={handleCopyLink}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-[#4A5D4E] hover:bg-[#3d4d40] text-white shadow-xs'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>تم النسخ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ الرابط</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Social Share Grid */}
        <div className="mb-6">
          <span className="block text-xs font-bold text-[#5A5751] mb-2.5">
            مشاركة سريعة عبر وسائل التواصل:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {shareChannels.map((channel) => {
              const Icon = channel.icon;
              return (
                <a
                  key={channel.name}
                  href={channel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl font-bold text-xs transition-all shadow-2xs hover:scale-[1.02] active:scale-[0.98] ${channel.color}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{channel.name}</span>
                </a>
              );
            })}
          </div>
        </div>

        {/* Native Share button (if supported or as generic action) */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            type="button"
            id="chapter-share-native-btn"
            onClick={handleNativeShare}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#4A5D4E] text-[#4A5D4E] hover:bg-[#4A5D4E]/10 font-bold text-xs transition-all mb-4 cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>مشاركة عبر تطبيقات الهاتف الأخرى</span>
          </button>
        )}

        {/* Footer info */}
        <div className="pt-3 border-t border-[#E5E2D9] flex items-center justify-between text-[11px] text-[#6E6A64]">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#C88A3B]" />
            <span>يمكن للقراء فتح الفصل مباشرة وقراءته</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-[#6E6A64] hover:text-[#2C2C2C] font-semibold cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
