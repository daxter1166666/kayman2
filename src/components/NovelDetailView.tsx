import React, { useState } from 'react';
import { Novel, Chapter, AdSettings } from '../types';
import { storageService } from '../services/storageService';
import { AdSlot } from './AdSlot';
import { StarRatingWidget } from './StarRatingWidget';
import {
  ArrowRight,
  BookOpen,
  Heart,
  Eye,
  Star,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  Share2,
  Layers,
  ChevronLeft,
  UserCheck,
  CheckCircle2,
  Tag,
  Download
} from 'lucide-react';

interface NovelDetailViewProps {
  novel: Novel;
  chapters: Chapter[];
  onSelectChapter: (chapterId: string) => void;
  onBack: () => void;
  onRefreshNovelData?: () => void;
  adSettings: AdSettings;
}

export const NovelDetailView: React.FC<NovelDetailViewProps> = ({
  novel,
  chapters,
  onSelectChapter,
  onBack,
  onRefreshNovelData,
  adSettings,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [currentRating, setCurrentRating] = useState<number>(novel.rating);
  const [ratingCount, setRatingCount] = useState<number>(novel.ratingCount);
  const isNovelBookmarked = storageService.isBookmarked(novel.id);

  const handleRatingUpdated = (newRating: number, newCount: number) => {
    setCurrentRating(newRating);
    setRatingCount(newCount);
    if (onRefreshNovelData) {
      onRefreshNovelData();
    }
  };

  const sortedChapters = [...chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);
  const totalWords = chapters.reduce((acc, c) => acc + c.wordCount, 0);

  const statusConfig = {
    ONGOING: { label: 'مستمرة في النشر', classes: 'bg-[#4A5D4E]/15 text-[#2D4532] border-[#4A5D4E]/30' },
    COMPLETED: { label: 'رواية مكتملة', classes: 'bg-[#C88A3B]/15 text-[#965A15] border-[#C88A3B]/30' },
    HIATUS: { label: 'متوقفة مؤقتاً', classes: 'bg-[#8E8A83]/15 text-[#5A5751] border-[#E5E2D9]' },
  }[novel.status];

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBookmarkToggle = () => {
    if (chapters.length > 0) {
      const firstChapter = sortedChapters[0];
      storageService.toggleBookmark(novel.id, firstChapter.id, firstChapter.chapterNumber, firstChapter.title);
      window.location.hash = window.location.hash;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 text-[#2C2C2C] font-cairo">
      {/* Back Button & Breadcrumbs */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          type="button"
          id="back-to-catalog-btn"
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] hover:bg-[#F7F5EE] text-[#2C2C2C] text-xs font-bold transition-all cursor-pointer shadow-xs"
        >
          <ArrowRight className="w-4 h-4 text-[#4A5D4E]" />
          <span>العودة لدليل الروايات</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="share-novel-btn"
            onClick={handleShare}
            className="p-2.5 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] hover:bg-[#F7F5EE] text-[#2C2C2C] text-xs transition-all relative cursor-pointer shadow-xs flex items-center gap-1.5"
            title="مشاركة رابط الرواية"
          >
            <Share2 className="w-4 h-4 text-[#4A5D4E]" />
            <span className="text-xs font-semibold">مشاركة</span>
            {copied && (
              <span className="absolute -bottom-8 left-0 bg-[#4A5D4E] text-[#FDFCF8] text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap">
                تم نسخ الرابط!
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Top Banner & Novel Hero Info */}
      <div className="relative rounded-3xl overflow-hidden border border-[#E5E2D9] bg-[#FFFFFF] shadow-sm mb-10">
        {/* Banner backdrop image */}
        <div className="h-48 sm:h-72 w-full relative overflow-hidden bg-[#2C2C2C]">
          <img
            src={novel.bannerImage || novel.coverImage}
            alt={novel.title}
            className="w-full h-full object-cover opacity-40 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FFFFFF] via-[#FFFFFF]/60 to-transparent" />
        </div>

        {/* Content Box Overlapping Banner */}
        <div className="p-6 sm:p-8 -mt-24 sm:-mt-32 relative z-10">
          <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start">
            {/* Book 3D Vertical Cover */}
            <div className="w-44 sm:w-60 shrink-0 mx-auto md:mx-0 rounded-2xl overflow-hidden shadow-2xl border-2 border-[#E5E2D9] bg-[#1C1B19] aspect-[2/3] relative group">
              <img
                src={novel.coverImage}
                alt={novel.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-y-0 right-0 w-3 bg-gradient-to-l from-black/40 via-white/10 to-transparent pointer-events-none" />
            </div>

            {/* Metadata & Title */}
            <div className="flex-1 text-center md:text-right">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                <span className={`px-3 py-1 rounded-lg text-xs font-bold border backdrop-blur-md shadow-xs ${statusConfig.classes}`}>
                  {statusConfig.label}
                </span>
                {novel.genres.map(g => (
                  <span
                    key={g}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F7F5EE] text-[#4A5D4E] border border-[#E5E2D9]"
                  >
                    {g}
                  </span>
                ))}
              </div>

              <h1 className="font-amiri font-bold text-2xl sm:text-4xl text-[#2C2C2C] mb-2 leading-tight">
                {novel.title}
              </h1>

              <p className="text-sm sm:text-base text-[#8C5E45] mb-4 flex items-center justify-center md:justify-start gap-1.5 font-medium">
                <UserCheck className="w-4 h-4 text-[#4A5D4E]" />
                <span>بقلم المؤلف: <strong className="text-[#2C2C2C] font-semibold">{novel.author}</strong></span>
              </p>

              {/* Stats Bar */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-6 py-3 px-4 rounded-xl bg-[#F7F5EE] border border-[#E5E2D9] text-xs text-[#2C2C2C] mb-6">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-[#C88A3B] fill-[#C88A3B]" />
                  <span className="font-bold text-[#2C2C2C]">{currentRating.toFixed(1)}</span>
                  <span className="text-[#6E6A64]">({ratingCount} تقييم)</span>
                </div>
                <span className="text-[#E5E2D9]">|</span>
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-[#4A5D4E]" />
                  <span>{novel.totalViews.toLocaleString()} مشاهدة وقراءة</span>
                </div>
                <span className="text-[#E5E2D9]">|</span>
                <div className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-[#8C5E45]" />
                  <span>{novel.totalLikes.toLocaleString()} إعجاب</span>
                </div>
                <span className="text-[#E5E2D9]">|</span>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#4A5D4E]" />
                  <span>{chapters.length} فصول ({totalWords.toLocaleString()} كلمة)</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                {chapters.length > 0 && (
                  <button
                    type="button"
                    id="start-reading-novel-btn"
                    onClick={() => onSelectChapter(sortedChapters[0].id)}
                    className="px-6 py-3 bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8] font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>ابدأ قراءة الفصل الأول</span>
                  </button>
                )}

                <button
                  type="button"
                  id="bookmark-novel-btn"
                  onClick={handleBookmarkToggle}
                  className={`px-5 py-3 rounded-xl border ${
                    isNovelBookmarked
                      ? 'bg-[#4A5D4E]/15 text-[#2D4532] border-[#4A5D4E]/40 font-bold'
                      : 'border-[#E5E2D9] bg-[#FFFFFF] hover:bg-[#F7F5EE] text-[#2C2C2C] font-semibold'
                  } text-sm transition-all flex items-center gap-2 cursor-pointer shadow-xs`}
                >
                  {isNovelBookmarked ? (
                    <>
                      <BookmarkCheck className="w-4 h-4 text-[#4A5D4E]" />
                      <span>في مكتبتك المحفوظة</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4 text-[#6E6A64]" />
                      <span>حفظ في مكتبتي</span>
                    </>
                  )}
                </button>

                {novel.pdfDownloadUrl && (
                  <a
                    href={novel.pdfDownloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    id="download-novel-pdf-btn"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#C88A3B] to-[#B3782E] hover:from-[#B3782E] hover:to-[#9E6523] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2.5 cursor-pointer active:scale-95 group"
                    title="تحميل نسخة إلكترونية كاملة"
                  >
                    <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                    <span>{novel.downloadButtonText || 'تحميل الكتاب PDF'} {novel.pdfFileSize ? `(${novel.pdfFileSize})` : ''}</span>
                  </a>
                )}
              </div>

              {/* Reader Star Rating Box */}
              <div className="max-w-md mx-auto md:mx-0">
                <StarRatingWidget
                  novelId={novel.id}
                  currentRating={currentRating}
                  ratingCount={ratingCount}
                  onRatingSubmitted={handleRatingUpdated}
                />
              </div>
            </div>
          </div>

          {/* Synopsis & Author Bio Section */}
          <div className="mt-8 pt-8 border-t border-[#E5E2D9] grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h3 className="font-amiri font-bold text-xl text-[#2C2C2C] mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#4A5D4E]" />
                <span>نبذة عن الكتاب والمؤلف</span>
              </h3>
              <p className="text-sm sm:text-base text-[#4A4742] leading-relaxed font-cairo">
                {novel.synopsis}
              </p>

              {/* Tags */}
              <div className="mt-4 flex flex-wrap gap-1.5 items-center">
                <Tag className="w-3.5 h-3.5 text-[#8E8A83] ml-1" />
                {novel.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 rounded text-[11px] bg-[#F7F5EE] text-[#5A5751] border border-[#E5E2D9]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Author Profile Card */}
            <div className="p-5 rounded-2xl bg-[#F7F5EE] border border-[#E5E2D9] flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A5D4E] mb-2">
                  عن الكاتب والمؤلف
                </h4>
                <h5 className="font-amiri font-bold text-[#2C2C2C] text-lg mb-1">
                  {novel.author}
                </h5>
                <p className="text-xs text-[#6E6A64] leading-relaxed font-cairo">
                  {novel.authorBio}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#E5E2D9] text-[11px] text-[#8E8A83] flex items-center justify-between">
                <span>ناشر معتمد</span>
                <span>آخر تحديث: {new Date(novel.updatedAt).toLocaleDateString('ar-EG')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header Ad Slot on Novel Details */}
      <AdSlot location="header" adSettings={adSettings} className="mb-10" />

      {/* Table of Contents / Chapter List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-amiri font-bold text-2xl text-[#2C2C2C] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#4A5D4E]" />
              <span>فهرس الفصول المنشورة ({sortedChapters.length})</span>
            </h2>
            <span className="text-xs text-[#6E6A64]">
              إجمالي {totalWords.toLocaleString()} كلمة
            </span>
          </div>

          <div className="space-y-2.5">
            {sortedChapters.map((ch) => (
              <div
                key={ch.id}
                id={`chapter-row-${ch.id}`}
                onClick={() => onSelectChapter(ch.id)}
                className="group p-4 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] hover:bg-[#F7F5EE] hover:border-[#4A5D4E]/40 transition-all flex items-center justify-between gap-4 cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="w-9 h-9 rounded-lg bg-[#F7F5EE] border border-[#E5E2D9] flex items-center justify-center font-mono font-bold text-xs text-[#4A5D4E] shrink-0 group-hover:border-[#4A5D4E]/40">
                    {ch.chapterNumber}
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-amiri font-bold text-base sm:text-lg text-[#2C2C2C] group-hover:text-[#4A5D4E] transition-colors truncate">
                      الفصل {ch.chapterNumber}: {ch.title}
                    </h4>
                    <div className="flex items-center gap-3 text-[11px] text-[#6E6A64] mt-0.5">
                      <span>{ch.wordCount} كلمة</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-[#8E8A83]" />
                        <span>{ch.views} قراءة</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-rose-500" />
                        <span>{ch.likes} إعجاب</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-[#4A5D4E] group-hover:-translate-x-1 transition-transform flex items-center gap-1">
                    <span>قراءة</span>
                    <ChevronLeft className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: Ad Slot & Reader Features & Download Box */}
        <div className="space-y-6">
          {novel.pdfDownloadUrl && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#C88A3B]/10 via-[#C88A3B]/5 to-transparent border-2 border-[#C88A3B]/30 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-[#965A15] font-bold text-sm font-amiri">
                <Download className="w-5 h-5 text-[#C88A3B]" />
                <span>النسخة الإلكترونية الكاملة</span>
              </div>
              <p className="text-xs text-[#6E6A64] leading-relaxed">
                يمكنك تحميل هذا العمل بصيغة ملف مباشر للقراءة دون اتصال بالإنترنت على هاتفك أو حاسوبك.
              </p>
              {novel.pdfFileSize && (
                <div className="text-[11px] font-bold text-[#8C5E45] bg-[#C88A3B]/10 px-2.5 py-1 rounded-md inline-block">
                  حجم الملف: {novel.pdfFileSize}
                </div>
              )}
              <a
                href={novel.pdfDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                id="sidebar-download-pdf-btn"
                className="w-full py-3 px-4 rounded-xl bg-[#C88A3B] hover:bg-[#B3782E] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>{novel.downloadButtonText || 'تحميل الكتاب الآن'}</span>
              </a>
            </div>
          )}

          <AdSlot location="sidebar" adSettings={adSettings} />

          <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs">
            <h4 className="font-amiri font-bold text-base text-[#2C2C2C] mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#4A5D4E]" />
              <span>ميزات تجربة القراءة في نوفيليا</span>
            </h4>
            <p className="text-xs text-[#6E6A64] leading-relaxed mb-3">
              توفر منصة نوفيليا بيئة قراءة أدبية غامرة تحاكي الورق الطبيعي، مع خطوط عربية تراثية وحديثة وتخصيص كامل لحجم الخط ومسافات الأسطر.
            </p>
            <div className="space-y-2 text-xs text-[#5A5751]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4A5D4E]" />
                <span>5 خطوط عربية وأدبية فاخرة (الأميري، القاهرة، تجوال...)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4A5D4E]" />
                <span>ثيمات الورق الطبيعي، السبيا، الأسود الليلي الدافئ</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4A5D4E]" />
                <span>تفاعل مع الفصول بالإعجاب والتعليقات المباشرة</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
