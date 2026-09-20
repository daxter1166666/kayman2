import React, { useState, useMemo } from 'react';
import { IntellectualItem } from '../types';
import {
  FileText,
  Search,
  BookOpen,
  Clock,
  Eye,
  Heart,
  Calendar,
  Sparkles,
  ArrowLeft,
  Filter,
  Feather,
  Compass,
  Atom,
  Lightbulb,
  GraduationCap,
  SlidersHorizontal,
  X,
  BookMarked
} from 'lucide-react';

interface ArticlesSectionProps {
  articles: IntellectualItem[];
  onSelectArticle: (article: IntellectualItem) => void;
  onNavigateHome: () => void;
}

interface CategoryFilterOption {
  id: string;
  label: string;
  matchKeys?: string[];
  icon: React.ComponentType<{ className?: string }>;
}

export const ArticlesSection: React.FC<ArticlesSectionProps> = ({
  articles,
  onSelectArticle,
  onNavigateHome,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'latest' | 'views' | 'likes' | 'quick'>('latest');

  // Filter only regular articles and studies (exclude translations which have their dedicated tab)
  const regularArticles = useMemo(() => {
    return articles.filter(item => item.type === 'article' || item.type === 'study');
  }, [articles]);

  // Standard preset filters as requested (فكر، أدب، دراسات، مقالات دينية، مقالات علمية، وغيرها)
  const presetFilters: CategoryFilterOption[] = useMemo(() => [
    { id: 'all', label: 'الكل', icon: Sparkles },
    { id: 'thought', label: 'فكر وفلسفة', matchKeys: ['فكر', 'فلسف', 'تأمل', 'وعي'], icon: Lightbulb },
    { id: 'studies', label: 'دراسات وبحوث', matchKeys: ['دراسات', 'دراسة', 'بحث', 'أبحاث', 'محكّم'], icon: GraduationCap },
    { id: 'literature', label: 'أدب ونقد', matchKeys: ['أدب', 'نقد', 'سرد', 'رواية', 'شعر'], icon: Feather },
    { id: 'religious', label: 'مقالات دينية', matchKeys: ['دين', 'إسلام', 'فقه', 'شريع', 'قرآن', 'حديث', 'مقاصد'], icon: Compass },
    { id: 'scientific', label: 'مقالات علمية', matchKeys: ['علم', 'معرف', 'فيزياء', 'ذكاء', 'كوانتم', 'تقني', 'أعصاب'], icon: Atom },
  ], []);

  // Helper function to test if article matches a filter
  const articleMatchesFilter = (item: IntellectualItem, filter: CategoryFilterOption): boolean => {
    if (filter.id === 'all') return true;
    if (filter.matchKeys && filter.matchKeys.length > 0) {
      const cat = (item.category || '').toLowerCase();
      const title = item.title.toLowerCase();
      const tags = (item.tags || []).map(t => t.toLowerCase());

      const matchesKey = filter.matchKeys.some(k => {
        const key = k.toLowerCase();
        return (
          cat.includes(key) ||
          tags.some(t => t.includes(key)) ||
          title.includes(key) ||
          (filter.id === 'studies' && item.type === 'study')
        );
      });
      if (matchesKey) return true;
    }
    // Direct category name match fallback
    return (item.category || '').trim() === filter.label;
  };

  // Extract dynamic categories that are not covered by presets
  const allFilterOptions = useMemo(() => {
    const list: CategoryFilterOption[] = [...presetFilters];
    const coveredIds = new Set(list.map(f => f.id));

    regularArticles.forEach(item => {
      const cat = (item.category || '').trim();
      if (!cat) return;
      // Check if covered by any preset
      const isCovered = presetFilters.slice(1).some(f => articleMatchesFilter(item, f));
      if (!isCovered) {
        const id = `cat-${cat}`;
        if (!coveredIds.has(id)) {
          coveredIds.add(id);
          list.push({
            id,
            label: cat,
            matchKeys: [cat],
            icon: BookMarked,
          });
        }
      }
    });

    return list;
  }, [regularArticles, presetFilters]);

  // Compute counts for each category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allFilterOptions.forEach(filter => {
      counts[filter.id] = regularArticles.filter(item => articleMatchesFilter(item, filter)).length;
    });
    return counts;
  }, [allFilterOptions, regularArticles]);

  // Filter & Sort list
  const filteredArticles = useMemo(() => {
    const currentFilter = allFilterOptions.find(f => f.id === selectedCategoryId) || presetFilters[0];

    const result = regularArticles.filter(item => {
      const matchCat = articleMatchesFilter(item, currentFilter);
      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchCat;
      const matchSearch =
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        (item.abstract && item.abstract.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.tags && item.tags.some(t => t.toLowerCase().includes(q)));
      return matchCat && matchSearch;
    });

    // Sorting
    return result.sort((a, b) => {
      if (sortBy === 'views') return (b.views || 0) - (a.views || 0);
      if (sortBy === 'likes') return (b.likes || 0) - (a.likes || 0);
      if (sortBy === 'quick') {
        const timeA = a.readingTimeMinutes || 10;
        const timeB = b.readingTimeMinutes || 10;
        return timeA - timeB;
      }
      // default: latest
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [regularArticles, selectedCategoryId, allFilterOptions, presetFilters, searchQuery, sortBy]);

  const activeCategoryObject = allFilterOptions.find(f => f.id === selectedCategoryId) || presetFilters[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 font-cairo text-[#2C2C2C]" dir="rtl">
      {/* Header Banner */}
      <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#F7F5EE] via-[#FAF8F2] to-[#ECE8DE] border border-[#E5E2D9] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4A5D4E]/10 text-[#4A5D4E] text-xs font-bold mb-3">
              <FileText className="w-3.5 h-3.5" />
              <span>قسم المقالات والدراسات الفكرية</span>
            </div>
            <h1 className="font-amiri font-bold text-2xl sm:text-3xl lg:text-4xl text-[#2C2C2C] tracking-tight">
              المقالات والأبحاث الفكرية
            </h1>
            <p className="text-xs sm:text-sm text-[#6E6A64] mt-2 max-w-2xl leading-relaxed">
              مجموعة من المقالات الفلسفية، الأبحاث المنهجية، والمقالات الدينية والعلمية والأدبية للباحث والكاتب أيمن كناني في قضايا الفكر، الوعي، المنهج، وتجديد الرؤية.
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateHome}
            className="self-start sm:self-center px-4 py-2 rounded-xl bg-white border border-[#E5E2D9] hover:bg-[#FDFCF8] text-xs font-bold text-[#4A5D4E] flex items-center gap-2 shadow-2xs transition-all cursor-pointer shrink-0 active:scale-98"
          >
            <BookOpen className="w-4 h-4" />
            <span>العودة للكتاب الرئيسي</span>
          </button>
        </div>

        {/* Categories Bar & Search Filter Controls */}
        <div className="mt-6 pt-6 border-t border-[#E5E2D9] space-y-4">
          {/* Top Row: Search Input & Sort Selector */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E8A83]" />
              <input
                type="text"
                placeholder="ابحث في عناوين المقالات، الفكر، الدين، العلوم، الأدب..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-8 py-2.5 text-xs rounded-xl bg-white border border-[#E5E2D9] focus:border-[#4A5D4E] focus:ring-1 focus:ring-[#4A5D4E] text-[#2C2C2C] placeholder-[#8E8A83] focus:outline-none transition-all text-right shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#8E8A83] hover:text-[#2C2C2C] p-1 cursor-pointer"
                  title="مسح البحث"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <span className="text-xs text-[#8E8A83] flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>ترتيب حسب:</span>
              </span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-white border border-[#E5E2D9] text-xs font-bold text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] cursor-pointer shadow-2xs"
              >
                <option value="latest">الأحدث نشرًا</option>
                <option value="views">الأكثر قراءة</option>
                <option value="likes">الأكثر إعجابًا</option>
                <option value="quick">الأقصر وقتًا</option>
              </select>
            </div>
          </div>

          {/* Bottom Row: Categories Horizontal Pills with Badges & Counts */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
            <div className="flex items-center gap-1 text-xs font-bold text-[#4A5D4E] shrink-0 ml-1">
              <Filter className="w-3.5 h-3.5 text-[#4A5D4E]" />
              <span>التصنيف:</span>
            </div>

            {allFilterOptions.map(cat => {
              const IconComp = cat.icon;
              const count = categoryCounts[cat.id] || 0;
              const isSelected = selectedCategoryId === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 flex items-center gap-2 shadow-2xs ${
                    isSelected
                      ? 'bg-[#4A5D4E] text-white shadow-xs scale-102 ring-2 ring-[#4A5D4E]/20'
                      : 'bg-white text-[#6E6A64] hover:bg-[#EFECE4] hover:text-[#2C2C2C] border border-[#E5E2D9]'
                  }`}
                >
                  <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#8E8A83]'}`} />
                  <span>{cat.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-[#F7F5EE] text-[#8E8A83] border border-[#E5E2D9]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Filter Indicator Bar */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-2 text-xs text-[#6E6A64]">
          <span>عرض:</span>
          <strong className="text-[#2C2C2C] font-bold">
            {activeCategoryObject.label}
          </strong>
          {searchQuery && (
            <span className="text-[#4A5D4E] bg-[#4A5D4E]/10 px-2 py-0.5 rounded-md">
              مطابقة البحث: "{searchQuery}"
            </span>
          )}
          <span className="text-[#8E8A83] font-mono">({filteredArticles.length} مادة)</span>
        </div>

        {(selectedCategoryId !== 'all' || searchQuery) && (
          <button
            type="button"
            onClick={() => {
              setSelectedCategoryId('all');
              setSearchQuery('');
            }}
            className="text-xs text-[#4A5D4E] hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3 h-3" />
            <span>إعادة ضبط الفلاتر</span>
          </button>
        )}
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="py-16 text-center bg-[#FDFCF8] rounded-3xl border border-dashed border-[#E5E2D9] px-4">
          <FileText className="w-12 h-12 text-[#C88A3B]/60 mx-auto mb-3" />
          <h3 className="font-amiri font-bold text-xl text-[#2C2C2C]">لا توجد مقالات مطابقة في تصنيف "{activeCategoryObject.label}"</h3>
          <p className="text-xs text-[#8E8A83] mt-1 max-w-sm mx-auto">
            لم نتمكن من العثور على مقالات تطابق معايير البحث أو هذا التصنيف حالياً. يمكنك اختيار تصنيف آخر أو مسح عبارة البحث.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategoryId('all');
              }}
              className="px-4 py-2 rounded-xl bg-[#4A5D4E] text-white text-xs font-bold shadow-xs hover:bg-[#3C4C3F] transition-all cursor-pointer"
            >
              عرض جميع المقالات
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map(article => (
            <article
              key={article.id}
              onClick={() => onSelectArticle(article)}
              className="group bg-[#FDFCF8] rounded-2xl border border-[#E5E2D9] hover:border-[#4A5D4E]/50 hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer active:scale-[0.99]"
            >
              <div>
                {/* Optional Article Cover Image */}
                {article.coverImage && (
                  <div className="h-44 w-full overflow-hidden bg-[#ECE8DE] relative">
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <span className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-full bg-[#4A5D4E]/90 backdrop-blur-xs text-white text-[10px] font-bold">
                      {article.type === 'study' ? 'دراسة محكّمة' : 'مقال فكري'}
                    </span>
                  </div>
                )}

                <div className="p-5">
                  {/* Category & Date badge */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span
                      onClick={e => {
                        e.stopPropagation();
                        // Try to find matching preset filter or select directly
                        const matched = allFilterOptions.find(f => articleMatchesFilter(article, f) && f.id !== 'all');
                        if (matched) setSelectedCategoryId(matched.id);
                      }}
                      className="px-2.5 py-0.5 rounded-md bg-[#F7F5EE] text-[#4A5D4E] border border-[#E5E2D9] text-[11px] font-bold hover:bg-[#4A5D4E] hover:text-white transition-colors"
                      title="تصفية حسب هذا التصنيف"
                    >
                      {article.category || 'فكر عام'}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] text-[#8E8A83] font-mono">
                      <Calendar className="w-3 h-3 text-[#8E8A83]" />
                      <span>
                        {article.publishedAt
                          ? new Date(article.publishedAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short' })
                          : '2026'}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-amiri font-bold text-lg sm:text-xl text-[#2C2C2C] group-hover:text-[#4A5D4E] transition-colors leading-snug line-clamp-2">
                    {article.title}
                  </h3>

                  {/* Subtitle / Abstract */}
                  {article.subtitle && (
                    <h4 className="text-xs text-[#8E8A83] mt-1 font-semibold line-clamp-1">
                      {article.subtitle}
                    </h4>
                  )}

                  <p className="text-xs text-[#6E6A64] mt-2.5 leading-relaxed line-clamp-3">
                    {article.abstract || article.content.replace(/[#*`_]/g, '').slice(0, 160) + '...'}
                  </p>

                  {/* Tags */}
                  {article.tags && article.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {article.tags.slice(0, 4).map(tag => (
                        <span
                          key={tag}
                          onClick={e => {
                            e.stopPropagation();
                            setSearchQuery(tag);
                          }}
                          className="px-2 py-0.5 rounded text-[10px] bg-[#FAF8F2] text-[#8E8A83] border border-[#E5E2D9] hover:text-[#4A5D4E] hover:border-[#4A5D4E] transition-colors"
                          title={`بحث عن: #${tag}`}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer: Metadata & Read Action */}
              <div className="px-5 py-3.5 bg-[#F7F5EE]/60 border-t border-[#E5E2D9] flex items-center justify-between text-xs text-[#8E8A83]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1" title="وقت القراءة المقدر">
                    <Clock className="w-3 h-3 text-[#4A5D4E]" />
                    <span>{article.readingTimeMinutes || Math.max(3, Math.round((article.content.length || 1000) / 400))} دقيقة</span>
                  </span>
                  <span className="flex items-center gap-1" title="المشاهدات">
                    <Eye className="w-3 h-3 text-[#8E8A83]" />
                    <span className="font-mono">{article.views || 0}</span>
                  </span>
                  <span className="flex items-center gap-1" title="الإعجابات">
                    <Heart className="w-3 h-3 text-rose-500 fill-rose-500/20" />
                    <span className="font-mono">{article.likes || 0}</span>
                  </span>
                </div>

                <span className="font-bold text-[#4A5D4E] group-hover:translate-x-[-2px] transition-transform flex items-center gap-1">
                  <span>قراءة المقال</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
