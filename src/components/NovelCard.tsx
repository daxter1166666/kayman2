import React from 'react';
import { Novel } from '../types';
import { BookOpen, Heart, Eye, Star, Sparkles, ChevronLeft, Download } from 'lucide-react';
import { toArabicGenre } from '../utils/genreHelper';
import { formatDeweyDisplay } from '../utils/deweyDecimal';

interface NovelCardProps {
  novel: Novel;
  chapterCount: number;
  onSelectNovel: (novelId: string) => void;
  onReadFirstChapter: (novelId: string) => void;
}

export const NovelCard: React.FC<NovelCardProps> = ({
  novel,
  chapterCount,
  onSelectNovel,
  onReadFirstChapter,
}) => {
  const statusConfig = {
    ONGOING: { label: 'مستمرة', classes: 'bg-[#4A5D4E]/15 text-[#2D4532] border-[#4A5D4E]/30' },
    COMPLETED: { label: 'مكتملة', classes: 'bg-[#C88A3B]/15 text-[#965A15] border-[#C88A3B]/30' },
    HIATUS: { label: 'متوقفة مؤقتاً', classes: 'bg-[#8E8A83]/15 text-[#5A5751] border-[#E5E2D9]' },
  }[novel.status];

  return (
    <div
      id={`novel-card-${novel.id}`}
      className="group bg-[#FFFFFF] border border-[#E5E2D9] hover:border-[#4A5D4E]/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-[#4A5D4E]/10 relative"
    >
      {/* MOBILE LAYOUT (< 640px) */}
      <div className="flex sm:hidden p-3.5 gap-3.5 items-start">
        {/* Mobile Cover */}
        <div
          className="relative w-28 aspect-[2/3] shrink-0 overflow-hidden rounded-xl bg-[#2C2C2C] shadow-md cursor-pointer"
          onClick={() => onSelectNovel(novel.id)}
        >
          <img
            src={novel.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop'}
            alt={novel.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {/* Status Badge */}
          <span className={`absolute top-1.5 right-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border backdrop-blur-md ${statusConfig.classes}`}>
            {statusConfig.label}
          </span>
          {novel.isFeatured && (
            <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-[#4A5D4E] text-white shadow-xs flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5 text-amber-200" />
              <span>مميز</span>
            </span>
          )}
        </div>

        {/* Mobile Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              {(novel.genres || []).slice(0, 2).map(genre => (
                <span
                  key={genre}
                  className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#F7F5EE] text-[#4A5D4E] border border-[#E5E2D9]"
                >
                  {toArabicGenre(genre)}
                </span>
              ))}
              {novel.deweyDecimal && (
                <span
                  className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-[#4A5D4E]/10 text-[#4A5D4E]"
                  title={formatDeweyDisplay(novel.deweyDecimal, novel.deweyCategoryName)}
                >
                  ديوي {novel.deweyDecimal}
                </span>
              )}
            </div>

            <h3
              onClick={() => onSelectNovel(novel.id)}
              className="font-amiri font-bold text-base text-[#2C2C2C] cursor-pointer line-clamp-2 leading-snug mb-1"
            >
              {novel.title}
            </h3>

            <p className="text-xs text-[#8C5E45] font-cairo mb-2 font-medium">
              بقلم: <span className="font-semibold text-[#2C2C2C]">{novel.author}</span>
            </p>

            {/* Stats */}
            <div className="flex items-center gap-2.5 text-xs text-[#6E6A64] mb-3">
              <span className="flex items-center gap-1 font-bold text-amber-600">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{novel.rating.toFixed(1)}</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-[#4A5D4E]" />
                <span>{chapterCount} {chapterCount === 1 ? 'فصل' : chapterCount === 2 ? 'فصلان' : 'فصول'}</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                <span>{novel.totalViews > 1000 ? `${(novel.totalViews / 1000).toFixed(1)}k` : novel.totalViews}</span>
              </span>
            </div>
          </div>

          {/* Mobile Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-[#E5E2D9]">
            <button
              type="button"
              onClick={() => onReadFirstChapter(novel.id)}
              className="flex-1 py-2 bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8] text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>قراءة</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectNovel(novel.id)}
              className="px-3 py-2 rounded-xl border border-[#E5E2D9] text-[#2C2C2C] text-xs font-bold hover:bg-[#F7F5EE] cursor-pointer flex items-center gap-1"
            >
              <span>التفاصيل</span>
              <ChevronLeft className="w-3.5 h-3.5 text-[#6E6A64]" />
            </button>
            {novel.pdfDownloadUrl && (
              <a
                href={novel.pdfDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-xl border border-[#C88A3B]/40 bg-[#C88A3B]/10 text-[#C88A3B] hover:bg-[#C88A3B] hover:text-white cursor-pointer transition-all"
                title={`تحميل PDF (${novel.pdfFileSize || ''})`}
              >
                <Download className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* DESKTOP & TABLET LAYOUT (>= 640px) */}
      <div className="hidden sm:flex sm:flex-col h-full">
        {/* Vertical Book Cover Container (Standard 2:3 Novel Ratio with realistic spine & sheen) */}
        <div
          className="relative aspect-[2/3] w-full overflow-hidden bg-[#2C2C2C] cursor-pointer"
          onClick={() => onSelectNovel(novel.id)}
        >
          <img
            src={novel.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop'}
            alt={novel.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />

          {/* Realistic Book Spine & Overlay Shadows */}
          <div className="absolute inset-y-0 right-0 w-3 bg-gradient-to-l from-black/40 via-white/10 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1B19]/90 via-[#1C1B19]/20 to-black/30 pointer-events-none" />

          {/* Top Badges */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border backdrop-blur-md shadow-xs ${statusConfig.classes}`}>
              {statusConfig.label}
            </span>
            <div className="flex items-center gap-1.5">
              {novel.pdfDownloadUrl && (
                <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-[#C88A3B] text-white shadow-md flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  <span>تحميل متاح</span>
                </span>
              )}
              {novel.isFeatured && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#4A5D4E] text-white shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-100" />
                  <span>مختارة</span>
                </span>
              )}
            </div>
          </div>

          {/* Floating Quick Stats on Cover bottom */}
          <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-xs text-white pointer-events-none">
            <div className="flex items-center gap-1 bg-[#1C1B19]/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 shadow-xs">
              <Star className="w-3.5 h-3.5 fill-[#E9B949] text-[#E9B949]" />
              <span className="font-bold text-[#FDFCF8]">{novel.rating.toFixed(1)}</span>
              <span className="text-[11px] text-white/70">({novel.ratingCount})</span>
            </div>

            <div className="flex items-center gap-2.5 bg-[#1C1B19]/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 text-xs shadow-xs">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-emerald-300" />
                <span className="font-sans font-medium">{novel.totalViews > 1000 ? `${(novel.totalViews / 1000).toFixed(1)}k` : novel.totalViews}</span>
              </span>
              <span className="text-white/40">|</span>
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/30" />
                <span className="font-sans font-medium">{novel.totalLikes > 1000 ? `${(novel.totalLikes / 1000).toFixed(1)}k` : novel.totalLikes}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Novel Body & Information */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white">
          <div>
            {/* Genre Tags & Dewey Classification */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
              {novel.deweyDecimal && (
                <span
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#4A5D4E]/10 text-[#4A5D4E] border border-[#4A5D4E]/25"
                  title={formatDeweyDisplay(novel.deweyDecimal, novel.deweyCategoryName)}
                >
                  ديوي {novel.deweyDecimal}
                </span>
              )}
              {(novel.genres || []).slice(0, 3).map(genre => (
                <span
                  key={genre}
                  className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#F7F5EE] text-[#4A5D4E] border border-[#E5E2D9]"
                >
                  {toArabicGenre(genre)}
                </span>
              ))}
            </div>

            {/* Title */}
            <h3
              onClick={() => onSelectNovel(novel.id)}
              className="font-amiri font-bold text-lg sm:text-xl text-[#2C2C2C] group-hover:text-[#4A5D4E] transition-colors cursor-pointer line-clamp-1 mb-1.5 leading-snug"
            >
              {novel.title}
            </h3>

            {/* Author */}
            <p className="text-xs text-[#8C5E45] font-cairo mb-2.5 font-medium flex items-center gap-1">
              <span>بقلم:</span>
              <span className="font-semibold text-[#2C2C2C]">{novel.author}</span>
            </p>

            {/* Synopsis preview */}
            <p className="text-xs sm:text-[13px] text-[#6E6A64] font-cairo line-clamp-2 sm:line-clamp-3 mb-4 leading-relaxed">
              {novel.synopsis}
            </p>
          </div>

          {/* Card Footer: Chapter count & Action CTA */}
          <div className="pt-3.5 border-t border-[#E5E2D9] flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#6E6A64] flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#4A5D4E]" />
              <span>{chapterCount} {chapterCount === 1 ? 'فصل' : chapterCount === 2 ? 'فصلان' : 'فصول'}</span>
            </span>

            <div className="flex items-center gap-1.5">
              {novel.pdfDownloadUrl && (
                <a
                  href={novel.pdfDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  id={`card-download-btn-${novel.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 rounded-lg border border-[#C88A3B]/40 hover:bg-[#C88A3B] text-[#C88A3B] hover:text-white transition-all cursor-pointer"
                  title={`تحميل الكتاب (${novel.pdfFileSize || 'PDF'})`}
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              )}
              <button
                type="button"
                id={`read-first-btn-${novel.id}`}
                onClick={() => onReadFirstChapter(novel.id)}
                className="px-3.5 py-1.5 bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8] text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>قراءة</span>
                <BookOpen className="w-3 h-3" />
              </button>
              <button
                type="button"
                id={`view-details-btn-${novel.id}`}
                onClick={() => onSelectNovel(novel.id)}
                className="px-2.5 py-1.5 rounded-lg border border-[#E5E2D9] hover:border-[#4A5D4E]/50 text-[#2C2C2C] text-xs font-medium hover:bg-[#F7F5EE] transition-all cursor-pointer flex items-center gap-0.5"
              >
                <span>التفاصيل</span>
                <ChevronLeft className="w-3 h-3 text-[#6E6A64]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
