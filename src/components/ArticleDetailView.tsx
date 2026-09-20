import React, { useState, useEffect } from 'react';
import { IntellectualItem, MarginNote } from '../types';
import { storageService } from '../services/storageService';
import { BilingualReaderView } from './BilingualReaderView';
import { ArticleReplies } from './ArticleReplies';
import {
  ArrowRight,
  Clock,
  Eye,
  Heart,
  Calendar,
  Share2,
  Bookmark,
  Sparkles,
  UserCheck,
  Languages,
  BookOpen,
  Tag,
  Check,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Palette,
  FileText
} from 'lucide-react';

interface ArticleDetailViewProps {
  article: IntellectualItem;
  onBack: () => void;
}

export const ArticleDetailView: React.FC<ArticleDetailViewProps> = ({ article, onBack }) => {
  const [fontSize, setFontSize] = useState<number>(18);
  const [theme, setTheme] = useState<'paper' | 'sepia' | 'sage'>('paper');
  const [likes, setLikes] = useState<number>(article.likes || 0);
  const [isLiked, setIsLiked] = useState<boolean>(() => storageService.isArticleLiked(article.id));
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'reading' | 'bilingual'>(() => {
    return article.type === 'translated_article' || Boolean(article.originalContent) ? 'bilingual' : 'reading';
  });

  const [marginNotes, setMarginNotes] = useState<MarginNote[]>(() => {
    return storageService.getArticleReaderNotes(article.id);
  });

  // Increment views once per session
  useEffect(() => {
    const key = `article_viewed_${article.id}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, 'true');
      storageService.incrementArticleViews(article.id);
    }
  }, [article.id]);

  const handleToggleLike = () => {
    const res = storageService.toggleArticleLike(article.id);
    setIsLiked(res.liked);
    setLikes(res.newCount);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isBilingualCapable = Boolean(
    article.type === 'translated_article' ||
    article.originalContent ||
    (article.parallelSegments && article.parallelSegments.length > 0)
  );

  const themeClasses = {
    paper: 'bg-[#FDFCF8] text-[#2C2C2C]',
    sepia: 'bg-[#FBF0D9] text-[#433422]',
    sage: 'bg-[#EEF2E6] text-[#2D3B2F]',
  }[theme];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 font-cairo text-[#2C2C2C]" dir="rtl">
      {/* Top Navigation & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[#E5E2D9]">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-[#E5E2D9] hover:bg-[#F7F5EE] text-xs font-bold text-[#4A5D4E] shadow-2xs transition-all cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>الرجوع للقائمة</span>
        </button>

        {/* Reader Display Controls */}
        <div className="flex items-center gap-2">
          {/* Font Controls */}
          <div className="flex items-center bg-white rounded-xl border border-[#E5E2D9] p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setFontSize(prev => Math.max(14, prev - 2))}
              className="p-1.5 rounded-lg hover:bg-[#F7F5EE] text-[#6E6A64] hover:text-[#2C2C2C] cursor-pointer"
              title="تصغير حجم الخط"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1 text-[#8E8A83]">{fontSize}</span>
            <button
              type="button"
              onClick={() => setFontSize(prev => Math.min(26, prev + 2))}
              className="p-1.5 rounded-lg hover:bg-[#F7F5EE] text-[#6E6A64] hover:text-[#2C2C2C] cursor-pointer"
              title="تكبير حجم الخط"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Theme Switcher */}
          <div className="flex items-center bg-white rounded-xl border border-[#E5E2D9] p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setTheme('paper')}
              className={`w-6 h-6 rounded-lg bg-[#FDFCF8] border ${theme === 'paper' ? 'border-[#4A5D4E] ring-1 ring-[#4A5D4E]' : 'border-[#E5E2D9]'}`}
              title="نمط ورقي ناصع"
            />
            <button
              type="button"
              onClick={() => setTheme('sepia')}
              className={`w-6 h-6 rounded-lg bg-[#FBF0D9] border mx-1 ${theme === 'sepia' ? 'border-[#C88A3B] ring-1 ring-[#C88A3B]' : 'border-[#E5E2D9]'}`}
              title="نمط دافئ"
            />
            <button
              type="button"
              onClick={() => setTheme('sage')}
              className={`w-6 h-6 rounded-lg bg-[#EEF2E6] border ${theme === 'sage' ? 'border-[#4A5D4E] ring-1 ring-[#4A5D4E]' : 'border-[#E5E2D9]'}`}
              title="نمط مهدئ"
            />
          </div>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-xl bg-white border border-[#E5E2D9] hover:bg-[#F7F5EE] text-[#6E6A64] hover:text-[#4A5D4E] shadow-2xs transition-all cursor-pointer"
            title="مشاركة المقال"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Article Header Card */}
      <header className="p-6 sm:p-8 rounded-3xl bg-[#F7F5EE] border border-[#E5E2D9] mb-8 shadow-xs">
        {/* Category & Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#4A5D4E] text-white text-xs font-bold shadow-2xs">
              {article.category || 'دراسات فكرية'}
            </span>
            {article.type === 'translated_article' && (
              <span className="px-2.5 py-1 rounded-full bg-[#C88A3B]/15 text-[#965A15] border border-[#C88A3B]/30 text-xs font-bold flex items-center gap-1">
                <Languages className="w-3.5 h-3.5" />
                <span>دراسة مترجمة</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-[#8E8A83] font-mono">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('ar-EG') : '2026'}</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{article.readingTimeMinutes || 10} دقائق</span>
            </span>
          </div>
        </div>

        {/* Title */}
        <h1 className="font-amiri font-bold text-2xl sm:text-3xl lg:text-4xl text-[#2C2C2C] leading-snug tracking-tight">
          {article.title}
        </h1>

        {/* Subtitle */}
        {article.subtitle && (
          <p className="text-sm sm:text-base text-[#6E6A64] mt-2 font-medium leading-relaxed">
            {article.subtitle}
          </p>
        )}

        {/* Original title for translated works */}
        {article.originalTitle && (
          <p className="text-xs text-[#8E8A83] font-serif italic mt-2 text-left" dir="ltr">
            Original Title: "{article.originalTitle}"
          </p>
        )}

        {/* Author / Translator Meta */}
        <div className="mt-6 pt-5 border-t border-[#E5E2D9] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#4A5D4E] text-white font-amiri font-bold text-base flex items-center justify-center shadow-xs">
              أ
            </div>
            <div>
              <span className="text-xs font-bold text-[#2C2C2C] block">
                {article.author || 'أيمن كناني'}
              </span>
              {article.originalAuthor && (
                <span className="text-[11px] text-[#8E8A83]">
                  المؤلف الأصلي: {article.originalAuthor}
                </span>
              )}
            </div>
          </div>

          {/* Social Stats: Likes & Views */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleLike}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                isLiked
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-white border-[#E5E2D9] text-[#6E6A64] hover:border-rose-300'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-[#8E8A83]'}`} />
              <span className="font-mono">{likes}</span>
              <span>إعجاب</span>
            </button>

            <div className="px-3 py-1.5 rounded-xl bg-white border border-[#E5E2D9] text-xs text-[#8E8A83] flex items-center gap-1.5 shadow-2xs font-mono">
              <Eye className="w-3.5 h-3.5" />
              <span>{article.views || 0}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Mode Switcher for translated studies */}
      {isBilingualCapable && (
        <div className="flex items-center justify-center gap-2 mb-8 p-1.5 bg-[#F7F5EE] rounded-2xl border border-[#E5E2D9] max-w-sm mx-auto shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('reading')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'reading'
                ? 'bg-[#4A5D4E] text-white shadow-xs'
                : 'text-[#6E6A64] hover:text-[#2C2C2C]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>النص العربي الكامل</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bilingual')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'bilingual'
                ? 'bg-[#C88A3B] text-white shadow-xs'
                : 'text-[#6E6A64] hover:text-[#2C2C2C]'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>قراءة ثنائية مقارنة</span>
          </button>
        </div>
      )}

      {/* Main Reading Surface */}
      <div className={`p-6 sm:p-10 rounded-3xl border border-[#E5E2D9] shadow-xs transition-colors ${themeClasses}`}>
        {isBilingualCapable && activeTab === 'bilingual' ? (
          <BilingualReaderView
            article={article}
            fontSize={fontSize}
            theme={theme}
            marginNotes={marginNotes}
            onOpenAddMarginModal={() => {}}
            onOpenMarginPopover={() => {}}
          />
        ) : (
          <div
            className="prose max-w-none font-amiri leading-[2.1] selection:bg-[#4A5D4E]/20"
            style={{ fontSize: `${fontSize}px` }}
          >
            {article.content ? (
              article.content.split('\n\n').map((para, idx) => {
                const clean = para.trim();
                if (!clean) return null;
                if (clean.startsWith('### ')) {
                  return (
                    <h3 key={idx} className="font-bold text-xl sm:text-2xl mt-8 mb-4 text-[#2C2C2C]">
                      {clean.replace('### ', '')}
                    </h3>
                  );
                }
                if (clean.startsWith('## ')) {
                  return (
                    <h2 key={idx} className="font-bold text-2xl sm:text-3xl mt-10 mb-5 text-[#2C2C2C] border-b border-[#E5E2D9] pb-2">
                      {clean.replace('## ', '')}
                    </h2>
                  );
                }
                if (clean.startsWith('> ')) {
                  return (
                    <blockquote
                      key={idx}
                      className="p-4 my-5 rounded-2xl bg-[#4A5D4E]/5 border-r-4 border-[#4A5D4E] italic text-[#4A4742]"
                    >
                      {clean.replace('> ', '')}
                    </blockquote>
                  );
                }
                return (
                  <p key={idx} className="mb-5 text-justify leading-relaxed">
                    {clean}
                  </p>
                );
              })
            ) : (
              <p className="text-center text-[#8E8A83] py-12">لا يوجد محتوى نصي متاح حالياً لهذه المقالة.</p>
            )}
          </div>
        )}

        {/* References & Footnotes */}
        {article.references && article.references.length > 0 && (
          <div className="mt-10 pt-8 border-t border-[#E5E2D9]">
            <h4 className="font-amiri font-bold text-lg text-[#2C2C2C] mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#4A5D4E]" />
              <span>المراجع والمصادر التوثيقية</span>
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm text-[#6E6A64]">
              {article.references.map((ref, idx) => (
                <li key={idx} className="leading-relaxed">
                  {ref}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {/* Interactive Comments & Discussions on the Article */}
      <div className="mt-10">
        <ArticleReplies articleId={article.id} articleTitle={article.title} />
      </div>
    </div>
  );
};
