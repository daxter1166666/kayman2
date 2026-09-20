import React, { useState, useMemo } from 'react';
import { IntellectualItem } from '../types';
import {
  Languages,
  Search,
  BookOpen,
  Clock,
  Eye,
  Heart,
  Calendar,
  Sparkles,
  ArrowLeft,
  Columns,
  Globe,
  UserCheck,
  ExternalLink,
  BookMarked
} from 'lucide-react';

interface TranslationsSectionProps {
  articles: IntellectualItem[];
  onSelectTranslation: (item: IntellectualItem) => void;
  onNavigateHome: () => void;
}

export const TranslationsSection: React.FC<TranslationsSectionProps> = ({
  articles,
  onSelectTranslation,
  onNavigateHome,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('الكل');

  // Filter only translated studies/articles
  const translations = useMemo(() => {
    return articles.filter(
      item =>
        item.type === 'translated_article' ||
        Boolean(item.translator) ||
        Boolean(item.originalLanguage) ||
        Boolean(item.originalAuthor) ||
        Boolean(item.parallelSegments && item.parallelSegments.length > 0)
    );
  }, [articles]);

  const languages = useMemo(() => {
    const set = new Set<string>();
    translations.forEach(t => {
      if (t.originalLanguage) set.add(t.originalLanguage);
    });
    return ['الكل', ...Array.from(set)];
  }, [translations]);

  const filteredTranslations = useMemo(() => {
    return translations.filter(item => {
      const matchLang = selectedLanguage === 'الكل' || item.originalLanguage === selectedLanguage;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchLang;
      const matchSearch =
        item.title.toLowerCase().includes(q) ||
        (item.originalTitle && item.originalTitle.toLowerCase().includes(q)) ||
        (item.originalAuthor && item.originalAuthor.toLowerCase().includes(q)) ||
        (item.originalSource && item.originalSource.toLowerCase().includes(q)) ||
        (item.abstract && item.abstract.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q));
      return matchLang && matchSearch;
    });
  }, [translations, selectedLanguage, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 font-cairo text-[#2C2C2C]" dir="rtl">
      {/* Header Banner */}
      <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#F7F5EE] via-[#FAF8F2] to-[#ECE8DE] border border-[#E5E2D9] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C88A3B]/10 text-[#A66E28] text-xs font-bold mb-3">
              <Languages className="w-3.5 h-3.5" />
              <span>قسم الترجمات الفكرية المقارنة</span>
            </div>
            <h1 className="font-amiri font-bold text-2xl sm:text-3xl lg:text-4xl text-[#2C2C2C] tracking-tight">
              ترجمات ودراسات مترجمة
            </h1>
            <p className="text-xs sm:text-sm text-[#6E6A64] mt-2 max-w-2xl leading-relaxed">
              دراسات فكرية ومقالات فلسفية وعلمية مترجمة بعناية فائقة بقلم أيمن كناني، مع توثيق المصدر الأصلي وتوفير ميزة القراءة المزدوجة المتوازية (العربية والأصلية).
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateHome}
            className="self-start sm:self-center px-4 py-2 rounded-xl bg-white border border-[#E5E2D9] hover:bg-[#FDFCF8] text-xs font-bold text-[#4A5D4E] flex items-center gap-2 shadow-2xs transition-all cursor-pointer shrink-0"
          >
            <BookOpen className="w-4 h-4" />
            <span>العودة للكتاب الرئيسي</span>
          </button>
        </div>

        {/* Search & Language Filter */}
        <div className="mt-6 pt-6 border-t border-[#E5E2D9] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E8A83]" />
            <input
              type="text"
              placeholder="ابحث في عنوان الترجمة، الكاتب الأصلي، أو المصدر..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-8 py-2.5 text-xs rounded-xl bg-white border border-[#E5E2D9] focus:border-[#4A5D4E] focus:ring-1 focus:ring-[#4A5D4E] text-[#2C2C2C] placeholder-[#8E8A83] focus:outline-none transition-all text-right shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#8E8A83] hover:text-[#2C2C2C] p-1 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <Globe className="w-3.5 h-3.5 text-[#8E8A83] shrink-0 ml-1 hidden sm:block" />
            {languages.map(lang => (
              <button
                key={lang}
                type="button"
                onClick={() => setSelectedLanguage(lang)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 shadow-2xs ${
                  selectedLanguage === lang
                    ? 'bg-[#C88A3B] text-white shadow-xs'
                    : 'bg-white text-[#6E6A64] hover:bg-[#EFECE4] border border-[#E5E2D9]'
                }`}
              >
                {lang === 'الكل' ? 'جميع اللغات' : lang}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Translations List */}
      {filteredTranslations.length === 0 ? (
        <div className="py-16 text-center bg-[#FDFCF8] rounded-3xl border border-dashed border-[#E5E2D9]">
          <Languages className="w-12 h-12 text-[#C88A3B]/60 mx-auto mb-3" />
          <h3 className="font-amiri font-bold text-xl text-[#2C2C2C]">لا توجد ترجمات مطابقة</h3>
          <p className="text-xs text-[#8E8A83] mt-1 max-w-sm mx-auto">
            لم نتمكن من العثور على دراسات مترجمة تطابق معايير البحث المحددة.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTranslations.map(item => (
            <div
              key={item.id}
              onClick={() => onSelectTranslation(item)}
              className="group bg-[#FDFCF8] rounded-2xl border border-[#E5E2D9] hover:border-[#C88A3B]/50 hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer active:scale-[0.99]"
            >
              <div className="p-6">
                {/* Top Row: Language & Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-md bg-[#C88A3B]/15 text-[#965A15] border border-[#C88A3B]/30 text-xs font-bold flex items-center gap-1">
                      <Columns className="w-3 h-3" />
                      <span>قراءة مقارنة ثنائية</span>
                    </span>
                    {item.originalLanguage && (
                      <span className="px-2 py-0.5 rounded text-[11px] bg-[#FAF8F2] text-[#8E8A83] border border-[#E5E2D9] font-mono">
                        {item.originalLanguage}
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-[#8E8A83] font-mono">
                    {item.originalYear || (item.publishedAt ? new Date(item.publishedAt).getFullYear() : '2026')}
                  </span>
                </div>

                {/* Arabic Title */}
                <h3 className="font-amiri font-bold text-xl text-[#2C2C2C] group-hover:text-[#C88A3B] transition-colors leading-snug">
                  {item.title}
                </h3>

                {/* Original Title */}
                {item.originalTitle && (
                  <h4
                    className="text-xs text-[#8E8A83] font-serif italic mt-1.5 text-left"
                    dir="ltr"
                  >
                    "{item.originalTitle}"
                  </h4>
                )}

                {/* Author & Translator Block */}
                <div className="mt-4 p-3 rounded-xl bg-[#F7F5EE] border border-[#E5E2D9] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-[#8E8A83] block text-[10px]">المؤلف الأصلي:</span>
                    <span className="font-bold text-[#2C2C2C]">
                      {item.originalAuthor || 'كاتب ومفكر عالمي'}
                    </span>
                  </div>
                  <div className="sm:border-r sm:border-[#E5E2D9] sm:pr-3">
                    <span className="text-[#8E8A83] block text-[10px]">الترجمة والتحقيق:</span>
                    <span className="font-bold text-[#4A5D4E] flex items-center gap-1">
                      <UserCheck className="w-3 h-3" />
                      <span>{item.translator || 'أيمن كناني'}</span>
                    </span>
                  </div>
                </div>

                {/* Abstract or Source note */}
                <p className="text-xs text-[#6E6A64] mt-3.5 leading-relaxed line-clamp-3">
                  {item.abstract || item.content.replace(/[#*`_]/g, '').slice(0, 150) + '...'}
                </p>

                {item.originalSource && (
                  <div className="mt-3 text-[11px] text-[#8E8A83] flex items-center gap-1">
                    <ExternalLink className="w-3 h-3 text-[#C88A3B]" />
                    <span>المصدر: {item.originalSource}</span>
                  </div>
                )}
              </div>

              {/* Card Bottom Bar */}
              <div className="px-6 py-3.5 bg-[#F7F5EE]/60 border-t border-[#E5E2D9] flex items-center justify-between text-xs text-[#8E8A83]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#4A5D4E]" />
                    <span>{item.readingTimeMinutes || 12} دقيقة</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span className="font-mono">{item.views || 0}</span>
                  </span>
                </div>

                <span className="font-bold text-[#C88A3B] group-hover:translate-x-[-2px] transition-transform flex items-center gap-1">
                  <span>فتح القراءة المزدوجة</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
