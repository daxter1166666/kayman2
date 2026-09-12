import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UnifiedSearchResult, IntellectualItem, Novel, Chapter } from '../types';
import { SmartEditorsSuite } from './SmartEditorsSuite';
import { ImageLightboxModal } from './ImageLightboxModal';
import {
  Search,
  Book,
  FileText,
  Sparkles,
  ArrowRight,
  Eye,
  Clock,
  X,
  BookOpen,
  Shuffle,
  ChevronLeft,
  Filter,
  SlidersHorizontal,
  GraduationCap,
  Globe,
  ExternalLink,
  Layers,
  Feather,
  PlusCircle,
  PenTool,
  Bookmark,
  Maximize2,
  ZoomIn
} from 'lucide-react';

export interface SearchKnowledgeEngineProps {
  initialQuery?: string;
  onSelectBook: (novelId: string) => void;
  onSelectChapter: (novelId: string, chapterId: string) => void;
  onSelectArticle: (articleId: string) => void;
  searchResults?: UnifiedSearchResult[];
  results?: UnifiedSearchResult[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedTypeFilter: 'all' | 'book' | 'study' | 'article' | 'translated_article' | 'chapter' | 'smart_editors';
  onTypeFilterChange: (type: 'all' | 'book' | 'study' | 'article' | 'translated_article' | 'chapter' | 'smart_editors') => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  allCategories?: string[];
  categories?: string[];
  novels?: Novel[];
  chapters?: Chapter[];
  articles?: IntellectualItem[];
  onRefreshData?: () => void;
  stats?: {
    booksCount: number;
    studiesCount: number;
    articlesCount: number;
    translationsCount: number;
    chaptersCount: number;
  };
  onRandomPick?: () => void;
  onOpenAddArticle?: () => void;
  onOpenSmartEditor?: (item?: { type: 'article' | 'study' | 'book' | 'chapter'; id?: string }) => void;
  onOpenAuthorPortal?: () => void;
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
  novels = [],
  chapters = [],
  articles = [],
  onRefreshData = () => {},
  onSelectBook,
  onSelectChapter,
  onSelectArticle,
  stats,
  onRandomPick,
  onOpenAddArticle,
  onOpenSmartEditor,
  onOpenAuthorPortal,
}) => {
  const searchResults = propSearchResults || propResults || [];
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [localQuery, setLocalQuery] = useState(searchQuery);

  // Lightbox modal state for full-control-panel image magnification
  const [lightboxImg, setLightboxImg] = useState<{
    url: string;
    title?: string;
    author?: string;
    caption?: string;
  } | null>(null);

  // Isolated Editor Studio State: 'article' | 'chapter' | null
  const [isolatedStudioMode, setIsolatedStudioMode] = useState<'article' | 'book' | null>(null);

  // Sync external search query
  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  // Focus search input on mount or shortcut '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape' && searchQuery) {
        onSearchChange('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery, onSearchChange]);

  // Sample article titles (أمثلة مقالات فقط عناوين)
  const sampleArticleTitles = useMemo(() => {
    const titles: string[] = [];
    if (articles && articles.length > 0) {
      articles.forEach(a => {
        if (a.title && !titles.includes(a.title)) {
          titles.push(a.title);
        }
      });
    }
    if (novels && novels.length > 0) {
      novels.forEach(n => {
        if (n.title && !titles.includes(n.title)) {
          titles.push(n.title);
        }
      });
    }
    const fallbacks = [
      'الوعي المأزوم وسؤال المعنى في الفلسفة المعاصرة',
      'الهرمنيوطيقا والتأويل الثقافي للنصوص الأدبية',
      'نقد الحداثة وما بعد الحداثة في الفكر العربي',
      'جدلية الشرق والغرب في الفكر المقارن',
      'فلسفة الأخلاق والعدالة في العصر الرقمي',
      'الرواية البوليفونية وتشظي الهوية السردية'
    ];
    fallbacks.forEach(f => {
      if (!titles.includes(f) && titles.length < 8) {
        titles.push(f);
      }
    });
    return titles.slice(0, 7);
  }, [articles, novels]);

  // Highlight query keywords in search snippets
  const highlightMatch = (text: string, query: string) => {
    if (!text || !query.trim()) return text;
    const cleanQ = query.trim();
    const parts = text.split(new RegExp(`(${cleanQ.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === cleanQ.toLowerCase() ? (
        <mark key={i} className="bg-amber-100 text-amber-950 font-semibold px-0.5 rounded-xs">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSearchChange(localQuery.trim());
  };

  const handleClear = () => {
    setLocalQuery('');
    onSearchChange('');
    searchInputRef.current?.focus();
  };

  const handlePickSample = (title: string) => {
    setLocalQuery(title);
    onSearchChange(title);
  };

  const handleLuckyPick = () => {
    if (sampleArticleTitles.length > 0) {
      const randomIndex = Math.floor(Math.random() * sampleArticleTitles.length);
      const chosen = sampleArticleTitles[randomIndex];
      setLocalQuery(chosen);
      onSearchChange(chosen);
    } else if (onRandomPick) {
      onRandomPick();
    }
  };

  const handleResultClick = (item: UnifiedSearchResult) => {
    if (item.type === 'book') {
      onSelectBook(item.id);
    } else if (item.type === 'chapter' && item.novelId && item.chapterId) {
      onSelectChapter(item.novelId, item.chapterId);
    } else {
      onSelectArticle(item.id);
    }
  };

  // Launch isolated article creation
  const handleOpenNewArticleStudio = () => {
    setIsolatedStudioMode('article');
  };

  // Launch isolated chapter creation
  const handleOpenNewChapterStudio = () => {
    setIsolatedStudioMode('book');
  };

  // Exit isolated studio back to search engine
  const handleExitStudio = () => {
    setIsolatedStudioMode(null);
    if (selectedTypeFilter === 'smart_editors') {
      onTypeFilterChange('all');
    }
  };

  // ---------------------------------------------------------------------------
  // 0. ISOLATED PROFESSIONAL EDITING STUDIO (Completely Isolated from Search)
  // ---------------------------------------------------------------------------
  if (isolatedStudioMode !== null || selectedTypeFilter === 'smart_editors') {
    const activeStudio = isolatedStudioMode || 'article';
    return (
      <div className="w-full bg-[#FDFCF8] min-h-screen py-5 px-3 sm:px-6 font-cairo">
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Top Return Banner (Ensures Complete Isolation) */}
          <div className="flex items-center justify-between bg-white border border-[#E5E2D9] p-3 sm:p-4 rounded-2xl shadow-xs">
            <button
              type="button"
              id="return-to-search-btn"
              onClick={handleExitStudio}
              className="px-4 py-2.5 rounded-xl bg-[#2C2C2C] hover:bg-[#1A1A1A] text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة إلى محرك البحث الرئيسي</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#4A5D4E] bg-[#4A5D4E]/10 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5" />
                <span>
                  {activeStudio === 'book'
                    ? 'بيئة تأليف وتحرير فصول الكتب والروايات (معزولة تماماً)'
                    : 'بيئة تحرير المقالات والدراسات الفكرية (معزولة تماماً)'}
                </span>
              </span>
            </div>
          </div>

          {/* Dedicated Smart Editors Suite */}
          <SmartEditorsSuite
            novels={novels}
            chapters={chapters}
            articles={articles}
            onRefreshData={onRefreshData}
            initialMode={activeStudio}
            modeFilter={activeStudio === 'book' ? 'books_only' : 'articles_only'}
            onPreviewArticle={onSelectArticle}
            onPreviewChapter={onSelectChapter}
            onPreviewBook={onSelectBook}
            onClose={handleExitStudio}
          />
        </div>
      </div>
    );
  }

  const isSearchActive = Boolean(searchQuery.trim());

  // ---------------------------------------------------------------------------
  // 1. GOOGLE SEARCH RESULTS VIEW (When user typed or clicked a title)
  // ---------------------------------------------------------------------------
  if (isSearchActive) {
    return (
      <div className="w-full bg-[#FFFFFF] min-h-[85vh] font-cairo text-[#2C2C2C]">
        {/* Google-Style Top Search Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-[#E5E2D9] px-4 sm:px-8 py-3 shadow-2xs">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-4 flex-1">
              {/* Home Brand Logo / Name */}
              <button
                type="button"
                onClick={handleClear}
                className="shrink-0 text-right group cursor-pointer"
                title="العودة للصفحة الرئيسية لمحرك البحث"
              >
                <span className="font-amiri font-bold text-xl text-[#2C2C2C] group-hover:text-[#4A5D4E] transition-colors block leading-none">
                  أيمن كناني
                </span>
                <span className="text-[10px] text-[#8E8A83] block mt-0.5">
                  محرك البحث الفكري
                </span>
              </button>

              {/* Active Search Bar with SUBMIT BUTTON INSIDE */}
              <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl">
                <div className="relative flex items-center w-full bg-white rounded-full border border-[#D5D0C5] hover:border-[#B5B0A4] focus-within:border-[#4A5D4E] focus-within:ring-2 focus-within:ring-[#4A5D4E]/20 shadow-xs p-1">
                  <div className="pr-3 text-[#70757a]">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    id="google-search-results-input"
                    value={localQuery}
                    onChange={e => {
                      setLocalQuery(e.target.value);
                      onSearchChange(e.target.value);
                    }}
                    placeholder="ابحث في المقالات والبحوث والمؤلفات..."
                    className="flex-1 bg-transparent border-none text-sm text-[#2C2C2C] placeholder-[#8E8A83] focus:outline-none px-2 text-right"
                  />
                  {localQuery && (
                    <button
                      type="button"
                      id="google-clear-search-btn"
                      onClick={handleClear}
                      className="p-1 text-[#8E8A83] hover:text-[#2C2C2C] rounded-full cursor-pointer ml-1"
                      title="مسح البحث"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {/* Search Button INSIDE the Input Box */}
                  <button
                    type="submit"
                    id="results-search-btn-inside"
                    className="px-3.5 py-1.5 rounded-full bg-[#4A5D4E] hover:bg-[#3C4C3F] text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 shadow-2xs"
                  >
                    <span>بحث</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Prominent Quick-Action Creation Buttons (Isolated Environment) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="results-header-add-article-btn"
                onClick={handleOpenNewArticleStudio}
                className="px-3 py-1.5 rounded-xl bg-[#EBF3ED] hover:bg-[#DFECE2] text-[#245037] border border-[#245037]/20 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                title="فتح محرر المقالات والدراسات في بيئة معزولة"
              >
                <FileText className="w-3.5 h-3.5 text-[#245037]" />
                <span>+ إنشاء مقال جديد</span>
              </button>

              <button
                type="button"
                id="results-header-add-chapter-btn"
                onClick={handleOpenNewChapterStudio}
                className="px-3 py-1.5 rounded-xl bg-[#FFF8E7] hover:bg-[#FDF0D0] text-[#8C5D0B] border border-[#8C5D0B]/20 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                title="فتح محرر فصول الكتب في بيئة معزولة"
              >
                <Book className="w-3.5 h-3.5 text-[#8C5D0B]" />
                <span>+ إضافة فصل كتاب</span>
              </button>

              {onOpenAuthorPortal && (
                <button
                  type="button"
                  onClick={onOpenAuthorPortal}
                  className="px-3 py-1.5 rounded-xl bg-[#FAF8F2] hover:bg-[#F0ECE1] text-[#2C2C2C] border border-[#E5E2D9] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  title="بوابة الكتّاب والمؤلفين - تسجيل الدخول ونشر المؤلفات"
                >
                  <Feather className="w-3.5 h-3.5 text-[#C88A3B]" />
                  <span>بوابة الكتّاب</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs (الكل | مقالات | دراسات | كتب) */}
          <div className="max-w-6xl mx-auto flex items-center gap-6 mt-3 pt-2 text-xs font-semibold overflow-x-auto no-scrollbar border-t border-[#F0ECE1]">
            <button
              type="button"
              onClick={() => onTypeFilterChange('all')}
              className={`pb-2.5 transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                selectedTypeFilter === 'all'
                  ? 'border-[#4A5D4E] text-[#4A5D4E] font-bold'
                  : 'border-transparent text-[#6E6A64] hover:text-[#2C2C2C]'
              }`}
            >
              الكل ({searchResults.length})
            </button>
            <button
              type="button"
              onClick={() => onTypeFilterChange('article')}
              className={`pb-2.5 transition-all cursor-pointer whitespace-nowrap border-b-2 flex items-center gap-1.5 ${
                selectedTypeFilter === 'article'
                  ? 'border-[#4A5D4E] text-[#4A5D4E] font-bold'
                  : 'border-transparent text-[#6E6A64] hover:text-[#2C2C2C]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>مقالات فكرية</span>
            </button>
            <button
              type="button"
              onClick={() => onTypeFilterChange('study')}
              className={`pb-2.5 transition-all cursor-pointer whitespace-nowrap border-b-2 flex items-center gap-1.5 ${
                selectedTypeFilter === 'study'
                  ? 'border-[#4A5D4E] text-[#4A5D4E] font-bold'
                  : 'border-transparent text-[#6E6A64] hover:text-[#2C2C2C]'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>دراسات أكاديمية</span>
            </button>
            <button
              type="button"
              onClick={() => onTypeFilterChange('book')}
              className={`pb-2.5 transition-all cursor-pointer whitespace-nowrap border-b-2 flex items-center gap-1.5 ${
                selectedTypeFilter === 'book'
                  ? 'border-[#4A5D4E] text-[#4A5D4E] font-bold'
                  : 'border-transparent text-[#6E6A64] hover:text-[#2C2C2C]'
              }`}
            >
              <Book className="w-3.5 h-3.5" />
              <span>الكتب والروايات</span>
            </button>
          </div>
        </header>

        {/* Results Body */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          {/* Stats Bar (Like Google: حوالي X من النتائج 0.02 ثانية) */}
          <div className="text-[12px] text-[#70757a] mb-6 flex items-center justify-between">
            <span>
              تم العثور على {searchResults.length} نتيجة بحث لـ «{searchQuery}» (0.02 ثانية)
            </span>
          </div>

          {/* Results List */}
          {searchResults.length > 0 ? (
            <div className="space-y-7">
              {searchResults.map((item, idx) => {
                const categoryName = item.category || 'فكر وثقافة';
                const typeLabel =
                  item.type === 'study'
                    ? 'دراسة'
                    : item.type === 'book'
                    ? 'كتاب'
                    : item.type === 'chapter'
                    ? 'فصل'
                    : item.type === 'translated_article'
                    ? 'ترجمة'
                    : 'مقال';

                const coverImg = item.coverImage;

                return (
                  <article
                    key={item.id || idx}
                    className="group max-w-3xl flex flex-col-reverse sm:flex-row items-start justify-between gap-4 p-3.5 rounded-2xl hover:bg-[#FAF9F5] transition-all border border-transparent hover:border-[#E5E2D9]"
                  >
                    <div className="flex-1 min-w-0">
                      {/* Type and Category Badges (Clean, no fake URLs) */}
                      <div className="flex items-center gap-2 text-xs mb-1.5 font-cairo">
                        <span className="px-2 py-0.5 rounded-md bg-[#4A5D4E]/10 text-[#4A5D4E] font-bold text-[11px]">
                          {typeLabel}
                        </span>
                        <span className="text-[#8E8A83] text-xs">•</span>
                        <span className="text-[#6E6A64] font-medium text-xs truncate max-w-[220px]">
                          {categoryName}
                        </span>
                      </div>

                      {/* Result Title Link (Google Blue) */}
                      <h2 className="text-lg sm:text-xl font-bold font-amiri leading-snug mb-1.5">
                        <button
                          type="button"
                          onClick={() => handleResultClick(item)}
                          className="text-[#1a0dab] hover:underline text-right group-hover:text-[#174ea6] transition-colors cursor-pointer"
                        >
                          {item.title}
                        </button>
                      </h2>

                      {/* Excerpt / Snippet */}
                      <p className="text-sm text-[#4d5156] leading-relaxed line-clamp-2 sm:line-clamp-3 mb-2 font-cairo">
                        {highlightMatch(item.snippet || item.subtitle || '', searchQuery)}
                      </p>

                      {/* Meta info tags */}
                      <div className="flex items-center gap-3 text-[11px] text-[#70757a]">
                        {item.author && (
                          <span>الكاتب: {item.author}</span>
                        )}
                        {item.readingTimeMinutes && (
                          <span>• {item.readingTimeMinutes} دقيقة قراءة</span>
                        )}
                        {item.chaptersCount && item.type === 'book' && (
                          <span>• {item.chaptersCount} فصول</span>
                        )}
                      </div>
                    </div>

                    {/* Image Thumbnail with Click-to-Magnify to Full Screen */}
                    {coverImg && (
                      <div className="relative group/thumb shrink-0 self-center sm:self-start">
                        <img
                          src={coverImg}
                          alt={item.title}
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl shadow-2xs border border-[#E5E2D9] group-hover/thumb:brightness-90 transition-all cursor-pointer"
                          onClick={() =>
                            setLightboxImg({
                              url: coverImg,
                              title: item.title,
                              author: item.author,
                              caption: item.subtitle || item.snippet,
                            })
                          }
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setLightboxImg({
                              url: coverImg,
                              title: item.title,
                              author: item.author,
                              caption: item.subtitle || item.snippet,
                            })
                          }
                          className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-black/75 hover:bg-[#4A5D4E] text-white flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-all cursor-pointer shadow-lg"
                          title="تكبير صورة البحث حتى تملأ لوحة التحكم والشاشة بأكملها"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            /* No Results Found View */
            <div className="py-12 text-right">
              <p className="text-base text-[#2C2C2C] mb-3">
                لم يتم العثور على أي نتائج مطابقة لـ <strong className="text-red-700">«{searchQuery}»</strong>.
              </p>
              <p className="text-xs text-[#70757a] mb-6 leading-relaxed">
                اقتراحات:
                <br />• تأكد من كتابة الكلمات بشكل صحيح دون أخطاء إملائية.
                <br />• جرب استخدام كلمات بحث أكثر عمومية أو مصطلحات فكرية بديلة.
                <br />• جرب النقر على أحد العناوين المقترحة أدناه:
              </p>

              {/* Sample Titles to pick when no results */}
              <div className="pt-4 border-t border-[#E5E2D9]">
                <span className="text-xs font-bold text-[#4A5D4E] block mb-3">
                  أمثلة مقالات مقترحة:
                </span>
                <div className="flex flex-wrap gap-2">
                  {sampleArticleTitles.map((title, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handlePickSample(title)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#F5F2EA] hover:bg-[#EBE7DC] text-[#2C2C2C] transition-all cursor-pointer"
                    >
                      {title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Sample Titles (أمثلة مقالات إضافية) */}
          {searchResults.length > 0 && (
            <div className="mt-12 pt-6 border-t border-[#E5E2D9]">
              <span className="text-xs font-bold text-[#70757a] block mb-3">
                بحوث ومقالات أخرى قد تهمك (انقر للبحث الفوري):
              </span>
              <div className="flex flex-wrap gap-2">
                {sampleArticleTitles.map((title, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handlePickSample(title)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#F8F7F2] hover:bg-[#EAE6DA] text-[#3D3A34] transition-all cursor-pointer border border-[#E5E2D9]"
                  >
                    {title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Image Lightbox Modal */}
        <ImageLightboxModal
          isOpen={Boolean(lightboxImg)}
          onClose={() => setLightboxImg(null)}
          imageUrl={lightboxImg?.url || ''}
          title={lightboxImg?.title}
          author={lightboxImg?.author}
          caption={lightboxImg?.caption}
        />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. THE PURE GOOGLE HOMEPAGE (Search Bar + Inside Search Button + Sample Titles)
  // ---------------------------------------------------------------------------
  return (
    <div className="w-full min-h-[82vh] flex flex-col justify-between bg-[#FDFCF8] font-cairo text-[#2C2C2C] px-4">
      {/* Top Bar with SEPARATE DISTINCT ACTION BUTTONS FOR CREATION */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between pt-5 text-xs text-[#8E8A83]">
        <span className="font-medium text-[11px] text-[#4A5D4E]">
          الموسوعة الرسمية للكاتب والباحث أيمن كناني
        </span>

        {/* Distinct Action Buttons for Creating Articles & Book Chapters */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            id="home-create-article-btn"
            onClick={handleOpenNewArticleStudio}
            className="px-3.5 py-1.5 rounded-xl bg-[#EBF3ED] hover:bg-[#DFECE2] text-[#245037] border border-[#245037]/25 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
            title="الانتقال إلى محرر المقالات الفكرية في بيئة عمل معزولة"
          >
            <FileText className="w-3.5 h-3.5 text-[#245037]" />
            <span>+ إنشاء مقال جديد</span>
          </button>

          <button
            type="button"
            id="home-create-chapter-btn"
            onClick={handleOpenNewChapterStudio}
            className="px-3.5 py-1.5 rounded-xl bg-[#FFF8E7] hover:bg-[#FDF0D0] text-[#8C5D0B] border border-[#8C5D0B]/25 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
            title="الانتقال إلى محرر فصول الكتب في بيئة عمل معزولة"
          >
            <Book className="w-3.5 h-3.5 text-[#8C5D0B]" />
            <span>+ إضافة فصل كتاب جديد</span>
          </button>

          {onOpenAuthorPortal && (
            <button
              type="button"
              id="home-author-portal-btn"
              onClick={onOpenAuthorPortal}
              className="px-3.5 py-1.5 rounded-xl bg-[#FAF8F2] hover:bg-[#F0ECE1] text-[#2C2C2C] border border-[#E5E2D9] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
              title="بوابة الكتّاب والمؤلفين - تسجيل الدخول ونشر المؤلفات"
            >
              <Feather className="w-3.5 h-3.5 text-[#C88A3B]" />
              <span>بوابة الكتّاب</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Google-Style Center Container */}
      <div className="w-full max-w-2xl mx-auto my-auto py-10 flex flex-col items-center text-center">
        {/* Brand Display Title (Google Logo Equivalent) */}
        <div className="mb-7 select-none">
          <h1 className="font-amiri font-bold text-4xl sm:text-6xl text-[#2C2C2C] tracking-tight mb-2">
            أيمن كناني
          </h1>
          <p className="font-cairo text-sm sm:text-base text-[#4A5D4E] font-medium tracking-wide">
            محرك البحث الفكري والمعرفي
          </p>
        </div>

        {/* Google-Style Search Input Form WITH SEARCH BUTTON INSIDE (داخل المربع) */}
        <form onSubmit={handleSearchSubmit} className="w-full">
          <div className="relative flex items-center w-full bg-white rounded-full border border-[#D5D0C5] hover:border-[#B5B0A4] focus-within:border-[#4A5D4E] focus-within:ring-2 focus-within:ring-[#4A5D4E]/20 shadow-xs hover:shadow-md transition-all p-1.5 sm:p-2 group">
            {/* Magnifying Glass on the right */}
            <div className="pr-3 text-[#70757a] group-focus-within:text-[#4A5D4E] transition-colors">
              <Search className="w-5 h-5" />
            </div>

            {/* Search Input Text Field */}
            <input
              ref={searchInputRef}
              type="text"
              id="google-main-search-input"
              value={localQuery}
              onChange={e => setLocalQuery(e.target.value)}
              placeholder="ابحث في المقالات، الدراسات، والكتب..."
              className="flex-1 bg-transparent border-none text-sm sm:text-base text-[#2C2C2C] placeholder-[#8E8A83] focus:outline-none px-3 text-right"
              autoFocus
            />

            {/* Clear Button Inside (if query exists) */}
            {localQuery && (
              <button
                type="button"
                id="clear-main-input-btn"
                onClick={handleClear}
                className="p-1.5 text-[#8E8A83] hover:text-[#2C2C2C] rounded-full cursor-pointer ml-1 transition-colors"
                title="مسح النص"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* DEDICATED SEARCH BUTTON INSIDE THE INPUT BOX (كما طلب المستخدم تماماً) */}
            <button
              type="submit"
              id="google-inside-search-btn"
              className="px-5 sm:px-7 py-2.5 rounded-full bg-[#4A5D4E] hover:bg-[#3C4C3F] text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
              title="بحث فوري في الموسوعة"
            >
              <Search className="w-4 h-4" />
              <span>بحث</span>
            </button>
          </div>
        </form>

        {/* ------------------------------------------------------------- */}
        {/* EXACT USER SPECIFICATION: بضع العناوين أمثلة مقالات فقط عناوين */}
        {/* ------------------------------------------------------------- */}
        <div className="w-full mt-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="h-[1px] w-8 bg-[#E5E2D9]"></span>
            <span className="text-xs font-bold text-[#6E6A64]">
              أمثلة مقالات (انقر على أي عنوان للبحث الفوري):
            </span>
            <span className="h-[1px] w-8 bg-[#E5E2D9]"></span>
          </div>

          <div className="flex flex-wrap justify-center gap-2.5 max-w-xl mx-auto">
            {sampleArticleTitles.map((title, idx) => (
              <button
                key={idx}
                type="button"
                id={`sample-article-title-${idx}`}
                onClick={() => handlePickSample(title)}
                className="px-4 py-2 rounded-full text-xs font-medium bg-white hover:bg-[#FAF8F5] border border-[#E5E2D9] hover:border-[#4A5D4E] text-[#2C2C2C] hover:text-[#4A5D4E] shadow-2xs hover:shadow-xs transition-all cursor-pointer leading-snug text-center"
              >
                {title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Google-Style Footer */}
      <footer className="w-full max-w-5xl mx-auto py-4 border-t border-[#E5E2D9] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#8E8A83] gap-2">
        <div>
          <span>الموقع الرسمي للكاتب أيمن كناني • جميع الحقوق محفوظة</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleOpenNewArticleStudio}
            className="hover:text-[#4A5D4E] hover:underline cursor-pointer text-emerald-800 font-semibold"
          >
            محرر المقالات المعزول
          </button>
          <button
            type="button"
            onClick={handleOpenNewChapterStudio}
            className="hover:text-[#4A5D4E] hover:underline cursor-pointer text-amber-800 font-semibold"
          >
            محرر فصول الكتب المعزول
          </button>
          {onRandomPick && (
            <button
              type="button"
              onClick={handleLuckyPick}
              className="hover:text-[#4A5D4E] hover:underline cursor-pointer flex items-center gap-1"
            >
              <Shuffle className="w-3 h-3" />
              <span>مقال عشوائي</span>
            </button>
          )}
        </div>
      </footer>

      {/* Image Lightbox Modal */}
      <ImageLightboxModal
        isOpen={Boolean(lightboxImg)}
        onClose={() => setLightboxImg(null)}
        imageUrl={lightboxImg?.url || ''}
        title={lightboxImg?.title}
        author={lightboxImg?.author}
        caption={lightboxImg?.caption}
      />
    </div>
  );
};
