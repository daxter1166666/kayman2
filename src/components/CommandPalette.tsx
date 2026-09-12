import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Book,
  FileText,
  Bookmark,
  Sparkles,
  Command,
  ArrowRight,
  SlidersHorizontal,
  FolderTree,
  User,
  ExternalLink,
  PenTool,
  X,
  Compass,
  Check,
  Moon,
  Layers
} from 'lucide-react';
import { Novel, Chapter, IntellectualItem, Category } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  novels: Novel[];
  chapters: Chapter[];
  articles: IntellectualItem[];
  categories: Category[];
  onSelectBook: (novelId: string) => void;
  onSelectChapter: (novelId: string, chapterId: string) => void;
  onSelectArticle: (articleId: string) => void;
  onOpenControlPanel: () => void;
  onOpenAdminLogin: () => void;
  onOpenHighlightsDrawer: () => void;
  onScrollToAuthor: () => void;
  onOpenAddArticle?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  novels,
  chapters,
  articles,
  categories,
  onSelectBook,
  onSelectChapter,
  onSelectArticle,
  onOpenControlPanel,
  onOpenAdminLogin,
  onOpenHighlightsDrawer,
  onScrollToAuthor,
  onOpenAddArticle,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled by parent or state
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered Results
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list: Array<{
      id: string;
      title: string;
      subtitle: string;
      type: 'book' | 'chapter' | 'study' | 'article' | 'action' | 'category';
      icon: React.ReactNode;
      badge: string;
      onSelect: () => void;
    }> = [];

    // Quick Actions if query matches or empty
    const quickActions = [
      {
        id: 'action-highlights',
        title: 'دفتر التظليلات وهوامش الباحث',
        subtitle: 'عرض كافة الاقتباسات والملاحظات المحفوظة وتصديرها',
        type: 'action' as const,
        icon: <Bookmark className="w-4 h-4 text-amber-600" />,
        badge: 'أداة بحثية',
        onSelect: () => {
          onOpenHighlightsDrawer();
          onClose();
        },
      },
      {
        id: 'action-author-login',
        title: 'بوابة الكاتب والناشر (الدخول السريع بالكود السري)',
        subtitle: 'تسجيل الدخول وإدارة المؤلفات والمقالات من أي هاتف',
        type: 'action' as const,
        icon: <User className="w-4 h-4 text-[#4A5D4E]" />,
        badge: 'إدارة وتأليف',
        onSelect: () => {
          onOpenAdminLogin();
          onClose();
        },
      },
      {
        id: 'action-control-panel',
        title: 'لوحة التحكم والمحتوى الكاملة',
        subtitle: 'إدارة الروايات، المقالات، الإعلانات وتصنيفات ديوي',
        type: 'action' as const,
        icon: <Layers className="w-4 h-4 text-[#4A5D4E]" />,
        badge: 'لوحة التحكم',
        onSelect: () => {
          onOpenControlPanel();
          onClose();
        },
      },
      {
        id: 'action-add-article',
        title: 'كتابة مقال أو دراسة فكرية جديدة',
        subtitle: 'استخدام المحرر العلمي المدمج لنشر بحث جديد',
        type: 'action' as const,
        icon: <PenTool className="w-4 h-4 text-emerald-600" />,
        badge: 'نشر فوري',
        onSelect: () => {
          if (onOpenAddArticle) onOpenAddArticle();
          onClose();
        },
      },
      {
        id: 'action-author-profile',
        title: 'السيرة الذاتية والأدبية للمؤلف (أيمن كناني)',
        subtitle: 'الانتقال إلى بطاقة الكاتب والرسالة الفكرية',
        type: 'action' as const,
        icon: <Compass className="w-4 h-4 text-[#C88A3B]" />,
        badge: 'عن الكاتب',
        onSelect: () => {
          onScrollToAuthor();
          onClose();
        },
      },
    ];

    if (!q) {
      // Empty query shows quick actions + featured books
      list.push(...quickActions);
      novels.slice(0, 4).forEach(novel => {
        list.push({
          id: `novel-${novel.id}`,
          title: novel.title,
          subtitle: novel.synopsis?.slice(0, 60) + '...' || 'كتاب / رواية أدبية',
          type: 'book',
          icon: <Book className="w-4 h-4 text-[#4A5D4E]" />,
          badge: 'كتاب / رواية',
          onSelect: () => {
            onSelectBook(novel.id);
            onClose();
          },
        });
      });
      articles.slice(0, 3).forEach(art => {
        list.push({
          id: `art-${art.id}`,
          title: art.title,
          subtitle: art.abstract?.slice(0, 60) + '...' || art.category,
          type: art.type === 'study' ? 'study' : 'article',
          icon: <FileText className="w-4 h-4 text-blue-600" />,
          badge: art.type === 'study' ? 'دراسة محكمة' : 'مقال فكري',
          onSelect: () => {
            onSelectArticle(art.id);
            onClose();
          },
        });
      });
      return list;
    }

    // Filter quick actions
    quickActions.forEach(qa => {
      if (qa.title.toLowerCase().includes(q) || qa.subtitle.toLowerCase().includes(q)) {
        list.push(qa);
      }
    });

    // Filter Novels
    novels.forEach(novel => {
      if (
        novel.title.toLowerCase().includes(q) ||
        novel.synopsis?.toLowerCase().includes(q) ||
        novel.genres?.some(g => g.toLowerCase().includes(q))
      ) {
        list.push({
          id: `novel-${novel.id}`,
          title: novel.title,
          subtitle: `${novel.author || 'أيمن كناني'} • ${novel.genres?.join(', ') || 'أدب'}`,
          type: 'book',
          icon: <Book className="w-4 h-4 text-[#4A5D4E]" />,
          badge: 'رواية / كتاب',
          onSelect: () => {
            onSelectBook(novel.id);
            onClose();
          },
        });
      }
    });

    // Filter Chapters
    chapters.forEach(ch => {
      if (ch.title.toLowerCase().includes(q) || ch.content?.toLowerCase().includes(q)) {
        const parentNovel = novels.find(n => n.id === ch.novelId);
        list.push({
          id: `chapter-${ch.id}`,
          title: `الفصل ${ch.chapterNumber}: ${ch.title}`,
          subtitle: parentNovel ? `من رواية: ${parentNovel.title}` : 'فصل روائي',
          type: 'chapter',
          icon: <FileText className="w-4 h-4 text-amber-700" />,
          badge: 'فصل',
          onSelect: () => {
            onSelectChapter(ch.novelId, ch.id);
            onClose();
          },
        });
      }
    });

    // Filter Articles & Studies
    articles.forEach(art => {
      if (
        art.title.toLowerCase().includes(q) ||
        art.abstract?.toLowerCase().includes(q) ||
        art.content?.toLowerCase().includes(q) ||
        art.tags?.some(t => t.toLowerCase().includes(q)) ||
        art.category?.toLowerCase().includes(q)
      ) {
        list.push({
          id: `art-${art.id}`,
          title: art.title,
          subtitle: `${art.category} • ${art.author || 'أيمن كناني'}`,
          type: art.type === 'study' ? 'study' : 'article',
          icon: <FileText className="w-4 h-4 text-blue-600" />,
          badge: art.type === 'study' ? 'دراسة علمية' : 'مقال فكري',
          onSelect: () => {
            onSelectArticle(art.id);
            onClose();
          },
        });
      }
    });

    return list.slice(0, 16);
  }, [query, novels, chapters, articles, onOpenHighlightsDrawer, onOpenAdminLogin, onOpenControlPanel, onOpenAddArticle, onScrollToAuthor, onSelectBook, onSelectChapter, onSelectArticle, onClose]);

  // Keyboard navigation inside list
  const handleKeyDownList = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        results[selectedIndex].onSelect();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150 font-cairo"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white border border-[#E5E2D9] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDownList}
      >
        {/* Top Search Input Box */}
        <div className="relative flex items-center px-4 sm:px-6 py-4 border-b border-[#E5E2D9] bg-[#FAF9F5]">
          <Search className="w-5 h-5 text-[#8E8A83] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="ابحث عن رواية، فصل، دراسة، مفهوم فلسفي، أو أمر سريع..."
            className="w-full mx-3 bg-transparent text-sm sm:text-base text-[#2C2C2C] placeholder-[#8E8A83] outline-none font-cairo"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-[#8E8A83] hover:text-[#2C2C2C] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-1 text-[11px] text-[#8E8A83] bg-white border border-[#E5E2D9] px-2 py-0.5 rounded-lg shadow-2xs">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          )}
        </div>

        {/* Results Count & Shortcuts Bar */}
        <div className="flex items-center justify-between px-5 py-2 bg-[#F7F5EE] border-b border-[#E5E2D9] text-[11px] text-[#6E6A64]">
          <div className="flex items-center gap-2">
            <span>النتائج المرتبطة: <strong className="text-[#2C2C2C]">{results.length}</strong></span>
          </div>
          <div className="flex items-center gap-3">
            <span>↑↓ للتنقل</span>
            <span>↵ للاختيار</span>
            <span>Esc للإغلاق</span>
          </div>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-[#E5E2D9]/40"
        >
          {results.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Search className="w-8 h-8 text-[#8E8A83] mx-auto mb-2 opacity-50" />
              <p className="text-sm font-bold text-[#2C2C2C]">لا توجد نتائج مطابقة لـ "{query}"</p>
              <p className="text-xs text-[#8E8A83] mt-1">
                جرب البحث بكلمات مفتاحية أخرى أو تصفح الأقسام من لوحة التحكم
              </p>
            </div>
          ) : (
            results.map((res, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={res.id}
                  onClick={res.onSelect}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#4A5D4E] text-white shadow-xs'
                      : 'hover:bg-[#F7F5EE] text-[#2C2C2C]'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-[#F0EEE6] text-[#4A5D4E]'
                      }`}
                    >
                      {res.icon}
                    </div>
                    <div className="truncate">
                      <p className={`text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-[#2C2C2C]'}`}>
                        {res.title}
                      </p>
                      <p className={`text-xs truncate ${isSelected ? 'text-white/80' : 'text-[#8E8A83]'}`}>
                        {res.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pr-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-[#EAE7DD] text-[#4A5D4E]'
                      }`}
                    >
                      {res.badge}
                    </span>
                    <ArrowRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        isSelected ? 'text-white translate-x-0.5' : 'text-[#8E8A83]'
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
