import React, { useState, useMemo } from 'react';
import { UnifiedSearchResult, IntellectualItem } from '../types';
import {
  Search,
  Book,
  FileText,
  Languages,
  Sparkles,
  Bookmark,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Eye,
  Heart,
  Clock,
  Layers,
  Shuffle,
  X,
  BookOpen,
  Filter,
  CheckCircle2,
  Library,
  Compass
} from 'lucide-react';

interface SearchKnowledgeEngineProps {
  initialQuery?: string;
  onSelectBook: (novelId: string) => void;
  onSelectChapter: (novelId: string, chapterId: string) => void;
  onSelectArticle: (articleId: string) => void;
  searchResults?: UnifiedSearchResult[];
  results?: UnifiedSearchResult[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedTypeFilter: 'all' | 'book' | 'study' | 'article' | 'translated_article' | 'chapter';
  onTypeFilterChange: (type: 'all' | 'book' | 'study' | 'article' | 'translated_article' | 'chapter') => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  allCategories?: string[];
  categories?: string[];
  stats?: {
    booksCount: number;
    studiesCount: number;
    articlesCount: number;
    translationsCount: number;
    chaptersCount: number;
  };
  onRandomPick?: () => void;
  onOpenAddArticle?: () => void;
}

export const SearchKnowledgeEngine: React.FC<SearchKnowledgeEngineProps> = ({
  searchResults: propSearchResults,
  results: propResults,
  searchQuery = '',
  onSearchChange,
  selectedTypeFilter = 'all',
  onTypeFilterChange,
  selectedCategory = 'all',
  onCategoryChange,
  allCategories: propAllCategories,
  categories: propCategories,
  onSelectBook,
  onSelectChapter,
  onSelectArticle,
  stats,
  onRandomPick,
  onOpenAddArticle,
}) => {
  const searchResults = propSearchResults || propResults || [];
  const allCategories = propAllCategories || propCategories || [];

  const safeStats = stats || {
    booksCount: 0,
    studiesCount: 0,
    articlesCount: 0,
    translationsCount: 0,
    chaptersCount: 0,
  };

  // Track which book cards have their chapters accordion expanded
  const [expandedBookIds, setExpandedBookIds] = useState<Record<string, boolean>>({});

  const toggleBookAccordion = (bookId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedBookIds(prev => ({
      ...prev,
      [bookId]: !prev[bookId],
    }));
  };

  // Helper to highlight query inside text
  const renderHighlighted = (text: string, query: string) => {
    if (!text) return '';
    if (!query || !query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-amber-100 text-amber-900 font-bold px-1 rounded-xs">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const filterTabs: Array<{
    id: 'all' | 'book' | 'study' | 'article' | 'translated_article' | 'chapter';
    label: string;
    count?: number;
    icon: React.ReactNode;
  }> = [
    { id: 'all', label: 'كافة المعارف', icon: <Compass className="w-4 h-4" /> },
    { id: 'book', label: 'الكتب والمؤلفات', count: safeStats.booksCount, icon: <Book className="w-4 h-4" /> },
    { id: 'study', label: 'الدراسات والأبحاث', count: safeStats.studiesCount, icon: <FileText className="w-4 h-4" /> },
    { id: 'article', label: 'المقالات الفكرية', count: safeStats.articlesCount, icon: <Sparkles className="w-4 h-4" /> },
    { id: 'translated_article', label: 'المقالات المترجمة', count: safeStats.translationsCount, icon: <Languages className="w-4 h-4" /> },
    { id: 'chapter', label: 'فصول الكتب', count: safeStats.chaptersCount, icon: <Layers className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full bg-[#FDFCF8] text-[#2C2C2C]">
      {/* Hero Knowledge Search Bar Section */}
      <section className="relative overflow-hidden pt-8 pb-10 sm:pt-14 sm:pb-12 border-b border-[#E5E2D9] bg-[#FAF8F5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          {/* Encyclopedia Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#4A5D4E]/10 text-[#4A5D4E] border border-[#4A5D4E]/20 mb-4">
            <Library className="w-3.5 h-3.5" />
            <span>محرك البحث الفكري والمستودع المعرفي الشامل</span>
          </div>

          <h1 className="font-amiri font-bold text-3xl sm:text-5xl text-[#2C2C2C] mb-3 tracking-tight">
            ابحث في كافة الكتب والدراسات والمقالات الفكرية
          </h1>
          <p className="text-sm sm:text-base text-[#6E6A64] max-w-2xl mx-auto mb-7 font-cairo leading-relaxed">
            مستودع بحثي معرفي يضم مؤلفات وروايات، أبحاثاً محكمة، مقالات نقدية وفلسفية، ومقالات ودراسات مترجمة ومحققة
          </p>

          {/* Prominent Search Bar */}
          <div className="relative max-w-3xl mx-auto">
            <div className="relative flex items-center shadow-xs hover:shadow-md transition-shadow rounded-2xl bg-white border border-[#E5E2D9] focus-within:border-[#4A5D4E]">
              <div className="pr-4 pl-2 text-[#8E8A83]">
                <Search className="w-5 h-5 text-[#4A5D4E]" />
              </div>

              <input
                type="text"
                id="main-knowledge-search-input"
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                placeholder="ابحث عن: عنوان كتاب، دراسة، مفهوم فلسفي، مقالة مترجمة، اسم باحث..."
                className="w-full py-3.5 sm:py-4 pr-2 pl-12 text-sm sm:text-base font-cairo bg-transparent outline-hidden text-[#2C2C2C] placeholder:text-[#8E8A83]"
                autoComplete="off"
              />

              {searchQuery && (
                <button
                  type="button"
                  id="clear-search-btn"
                  onClick={() => onSearchChange('')}
                  className="absolute left-24 text-[#8E8A83] hover:text-[#2C2C2C] p-1.5 rounded-lg hover:bg-[#F7F5EE] cursor-pointer"
                  title="مسح البحث"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Add Article from readers button */}
              {onOpenAddArticle && (
                <button
                  type="button"
                  id="search-add-article-btn"
                  onClick={onOpenAddArticle}
                  className="ml-1 px-3 py-1.5 text-xs font-bold text-[#4A5D4E] hover:text-[#3C4C3F] bg-[#4A5D4E]/10 hover:bg-[#4A5D4E]/20 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border border-[#4A5D4E]/20"
                  title="إضافة مقال أو دراسة من القراء"
                >
                  <FileText className="w-3.5 h-3.5 text-[#4A5D4E]" />
                  <span className="hidden sm:inline">أضف مقالاً</span>
                </button>
              )}

              {/* Random / Surprise me button */}
              <button
                type="button"
                id="random-knowledge-btn"
                onClick={onRandomPick}
                className="ml-2 pl-3 pr-2 text-xs font-bold text-[#6E6A64] hover:text-[#4A5D4E] flex items-center gap-1.5 border-r border-[#E5E2D9] py-2 cursor-pointer shrink-0"
                title="تصفح مادة عشوائية مثل ويكيبيديا"
              >
                <Shuffle className="w-3.5 h-3.5 text-[#4A5D4E]" />
                <span className="hidden sm:inline">مادة عشوائية</span>
              </button>
            </div>

            {/* Live Knowledge Statistics Counter Bar */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-4 text-xs font-medium text-[#6E6A64]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#4A5D4E]"></span>
                <span><strong>{safeStats.booksCount}</strong> كتب وروايات</span>
              </span>
              <span className="text-[#D5D2C9]">•</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#4A5D4E]"></span>
                <span><strong>{safeStats.studiesCount}</strong> دراسات بحثية</span>
              </span>
              <span className="text-[#D5D2C9]">•</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#4A5D4E]"></span>
                <span><strong>{safeStats.articlesCount}</strong> مقالات فكرية</span>
              </span>
              <span className="text-[#D5D2C9]">•</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#4A5D4E]"></span>
                <span><strong>{safeStats.translationsCount}</strong> مقالات مترجمة</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Results Body */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[#E5E2D9] mb-6">
          {filterTabs.map(tab => {
            const isActive = selectedTypeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                id={`filter-tab-${tab.id}`}
                onClick={() => onTypeFilterChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#4A5D4E] text-white shadow-xs'
                    : 'bg-white text-[#5A5751] border border-[#E5E2D9] hover:bg-[#F7F5EE] hover:text-[#2C2C2C]'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-[#4A5D4E]'}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[#F5F2EB] text-[#6E6A64]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Category Pills Bar */}
        {allCategories.length > 0 && (
          <div className="mb-6 p-3.5 rounded-2xl bg-white border border-[#E5E2D9] shadow-2xs">
            <div className="flex items-center gap-2 mb-2 px-1">
              <Filter className="w-3.5 h-3.5 text-[#4A5D4E]" />
              <span className="text-xs font-bold text-[#5A5751]">
                التصنيف والحقل المعرفي:
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              <button
                type="button"
                id="cat-all-btn"
                onClick={() => onCategoryChange('all')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-[#4A5D4E] text-white shadow-2xs'
                    : 'bg-[#F7F5EE] text-[#5A5751] hover:bg-[#EFECE5] border border-transparent hover:border-[#E5E2D9]'
                }`}
              >
                كافة التصنيفات
              </button>
              {allCategories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  id={`cat-btn-${cat}`}
                  onClick={() => onCategoryChange(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#4A5D4E] text-white shadow-2xs'
                      : 'bg-[#F7F5EE] text-[#5A5751] hover:bg-[#EFECE5] border border-transparent hover:border-[#E5E2D9]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results Summary Header */}
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#E5E2D9]">
          <p className="text-xs sm:text-sm font-semibold text-[#6E6A64]">
            {searchQuery ? (
              <>
                نتائج البحث عن: <strong className="text-[#2C2C2C]">"{searchQuery}"</strong> (
                {searchResults.length} مادة معرفية)
              </>
            ) : (
              <>عرض كافة المواد المعرفية المفهرسة ({searchResults.length} مادة)</>
            )}
          </p>

          <span className="text-xs text-[#8E8A83] hidden sm:inline">
            اضغط على أي عنوان لقراءة المادة أو استعراض الفصول
          </span>
        </div>

        {/* Search Results List */}
        {searchResults.length === 0 ? (
          <div className="py-16 text-center rounded-3xl border border-dashed border-stone-300 p-8 bg-white">
            <Search className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="font-amiri font-bold text-xl text-stone-800 mb-2">
              لم نعثر على مادة تطابق استعلامك "{searchQuery}"
            </h3>
            <p className="text-sm text-stone-500 max-w-md mx-auto mb-6 font-cairo">
              جرب البحث بكلمات عامة مثل "وعي"، "فلسفة"، "خفاش"، "مكان"، أو اختر أحد تصنيفات المعرفة أعلاه.
            </p>
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                onTypeFilterChange('all');
                onCategoryChange('all');
              }}
              className="px-4 py-2 rounded-xl bg-[#4A5D4E] text-white text-xs font-bold hover:bg-[#3d4d40] transition-colors cursor-pointer"
            >
              عرض كافة المعارف والمؤلفات
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {searchResults.map(item => {
              const isBook = item.type === 'book';
              const isStudy = item.type === 'study';
              const isArticle = item.type === 'article';
              const isTranslated = item.type === 'translated_article';
              const isChapter = item.type === 'chapter';
              const isExpanded = !!expandedBookIds[item.id];

              return (
                <article
                  key={`${item.type}-${item.id}`}
                  className="group rounded-2xl border border-[#E5E2D9] bg-white hover:border-[#4A5D4E]/50 transition-all p-5 sm:p-6 shadow-2xs hover:shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Badge / Type line */}
                      <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
                        {isBook && (
                          <span className="px-2.5 py-0.5 rounded-full font-bold bg-[#4A5D4E]/10 text-[#4A5D4E] border border-[#4A5D4E]/25 flex items-center gap-1">
                            <Book className="w-3 h-3" />
                            <span>كتاب ومؤلف كامل</span>
                          </span>
                        )}
                        {isStudy && (
                          <span className="px-2.5 py-0.5 rounded-full font-bold bg-amber-50 text-[#8C5E45] border border-amber-200/70 flex items-center gap-1">
                            <FileText className="w-3 h-3 text-[#8C5E45]" />
                            <span>دراسة بحثية محكمة</span>
                          </span>
                        )}
                        {isArticle && (
                          <span className="px-2.5 py-0.5 rounded-full font-bold bg-[#C88A3B]/10 text-[#8A5A1B] border border-[#C88A3B]/25 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-[#8A5A1B]" />
                            <span>مقال فكري وفلسفي</span>
                          </span>
                        )}
                        {isTranslated && (
                          <span className="px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-800 border border-indigo-200/70 flex items-center gap-1">
                            <Languages className="w-3 h-3 text-indigo-700" />
                            <span>مقال / دراسة مترجمة</span>
                          </span>
                        )}
                        {isChapter && (
                          <span className="px-2.5 py-0.5 rounded-full font-bold bg-[#F7F5EE] text-[#4A5D4E] border border-[#E5E2D9] flex items-center gap-1">
                            <Layers className="w-3 h-3 text-[#4A5D4E]" />
                            <span>فصل في كتاب</span>
                          </span>
                        )}

                        <span className="px-2.5 py-0.5 rounded-full bg-[#FAF8F5] text-[#5A5751] border border-[#E5E2D9] font-medium">
                          {item.category}
                        </span>

                        {item.readingTimeMinutes && (
                          <span className="text-[#8E8A83] flex items-center gap-1 text-[11px]">
                            <Clock className="w-3 h-3" />
                            <span>{item.readingTimeMinutes} دقيقة</span>
                          </span>
                        )}
                      </div>

                      {/* Main Title (Clickable) */}
                      <h2
                        onClick={() => {
                          if (isBook) {
                            toggleBookAccordion(item.id);
                          } else if (isChapter && item.novelId && item.chapterId) {
                            onSelectChapter(item.novelId, item.chapterId);
                          } else {
                            onSelectArticle(item.id);
                          }
                        }}
                        className="font-amiri font-bold text-lg sm:text-2xl text-[#2C2C2C] group-hover:text-[#4A5D4E] transition-colors cursor-pointer mb-2 leading-snug"
                      >
                        {renderHighlighted(item.title, searchQuery)}
                      </h2>

                      {/* Subtitle / Author details */}
                      <div className="text-xs sm:text-sm text-[#5A5751] mb-3 space-y-0.5 font-cairo">
                        {isTranslated && (
                          <p>
                            المؤلف الأصلي: <strong className="text-[#2C2C2C]">{item.originalAuthor}</strong> • ترجمة وتحقيق: <strong className="text-[#4A5D4E]">{item.translator || 'أيمن كناني'}</strong>
                          </p>
                        )}
                        {isBook && (
                          <p>
                            المؤلف: <strong className="text-[#4A5D4E]">{item.author}</strong> • يتضمن ({item.chapters?.length || 0}) فصول مفهرسة
                          </p>
                        )}
                        {isStudy && (
                          <p>
                            الباحث: <strong className="text-[#4A5D4E]">{item.author}</strong>
                          </p>
                        )}
                        {isArticle && (
                          <p>
                            بقلم: <strong className="text-[#4A5D4E]">{item.author}</strong>
                          </p>
                        )}
                        {isChapter && item.novelTitle && (
                          <p>
                            من مؤلف: <strong className="text-[#4A5D4E]">{item.novelTitle}</strong>
                          </p>
                        )}
                      </div>

                      {/* Snippet / Abstract */}
                      <p className="text-xs sm:text-sm text-[#6E6A64] line-clamp-3 leading-relaxed font-cairo">
                        {renderHighlighted(item.snippet, searchQuery)}
                      </p>
                    </div>

                    {/* Left Action Buttons */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 shrink-0 self-stretch sm:self-auto justify-between sm:justify-start pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E5E2D9]">
                      {isBook && (
                        <>
                          <button
                            type="button"
                            id={`expand-book-btn-${item.id}`}
                            onClick={e => toggleBookAccordion(item.id, e)}
                            className="px-3 py-1.5 rounded-xl bg-[#4A5D4E]/10 text-[#4A5D4E] hover:bg-[#4A5D4E]/20 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <span>فصول الكتاب ({item.chapters?.length || 0})</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            type="button"
                            id={`view-book-detail-${item.id}`}
                            onClick={() => onSelectBook(item.id)}
                            className="px-3 py-1.5 rounded-xl border border-[#E5E2D9] hover:bg-[#F7F5EE] text-xs font-semibold text-[#5A5751] cursor-pointer"
                          >
                            صفحة الكتاب
                          </button>
                        </>
                      )}

                      {(isStudy || isArticle || isTranslated) && (
                        <button
                          type="button"
                          id={`read-article-btn-${item.id}`}
                          onClick={() => onSelectArticle(item.id)}
                          className="px-4 py-2 rounded-xl bg-[#4A5D4E] hover:bg-[#3D4E41] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                        >
                          <span>{isStudy ? 'قراءة البحث' : isTranslated ? 'قراءة الترجمة' : 'قراءة المقال'}</span>
                          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                        </button>
                      )}

                      {isChapter && item.novelId && item.chapterId && (
                        <button
                          type="button"
                          id={`read-chapter-btn-${item.id}`}
                          onClick={() => onSelectChapter(item.novelId!, item.chapterId!)}
                          className="px-4 py-2 rounded-xl bg-[#4A5D4E] hover:bg-[#3D4E41] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                        >
                          <span>قراءة الفصل مباشرة</span>
                          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Accordion: Chapters expansion */}
                  {isBook && isExpanded && item.chapters && item.chapters.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[#E5E2D9] bg-[#FAF8F5] -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 p-4 sm:p-5 rounded-b-2xl animate-fadeIn">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-amiri font-bold text-sm text-[#4A5D4E] flex items-center gap-2">
                          <Layers className="w-4 h-4" />
                          <span>فهرس فصول كتاب "{item.title}" (اضغط للقراءة الفورية):</span>
                        </h4>
                        <span className="text-[11px] text-[#8E8A83] font-cairo">
                          {item.chapters.length} فصول منشورة
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {item.chapters.map(chap => (
                          <div
                            key={chap.id}
                            onClick={() => onSelectChapter(item.id, chap.id)}
                            className="p-2.5 sm:p-3 rounded-xl bg-white border border-[#E5E2D9] hover:border-[#4A5D4E] hover:bg-[#F7F5EE] transition-all cursor-pointer flex items-center justify-between gap-3 group/chap"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-6 h-6 rounded-lg bg-[#4A5D4E]/10 text-[#4A5D4E] text-xs font-mono font-bold flex items-center justify-center shrink-0">
                                {chap.chapterNumber}
                              </span>
                              <span className="font-amiri font-bold text-xs sm:text-sm text-[#2C2C2C] group-hover/chap:text-[#4A5D4E] truncate">
                                {chap.title}
                              </span>
                            </div>

                            <span className="text-[11px] font-semibold text-[#4A5D4E] shrink-0 opacity-0 group-hover/chap:opacity-100 transition-opacity flex items-center gap-1">
                              <span>قراءة</span>
                              <ArrowRight className="w-3 h-3 rotate-180" />
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 text-center">
                        <button
                          type="button"
                          onClick={() => onSelectBook(item.id)}
                          className="text-xs font-bold text-[#6E6A64] hover:text-[#4A5D4E] underline cursor-pointer font-cairo"
                        >
                          الانتقال إلى صفحة تفاصيل الكتاب والتصدير والأعمال المصاحبة ←
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
