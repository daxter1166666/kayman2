import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Novel, Chapter, Comment, ReaderSettings, AdSettings } from '../types';
import { storageService } from '../services/storageService';
import { AdSlot } from './AdSlot';
import { StarRatingWidget } from './StarRatingWidget';
import confetti from 'canvas-confetti';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageSquare,
  Eye,
  Settings2,
  Bookmark as BookmarkIcon,
  BookmarkCheck,
  Share2,
  List,
  Sparkles,
  Send,
  CornerDownLeft,
  Pin,
  Clock,
  BookOpen,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  ExternalLink,
  Copy,
  Download,
  Check,
} from 'lucide-react';

interface ChapterReaderProps {
  novel: Novel;
  chapter: Chapter;
  allChapters: Chapter[];
  onSelectChapter: (chapterId: string) => void;
  onBackToNovel: () => void;
  adSettings: AdSettings;
  readerSettings: ReaderSettings;
  onUpdateReaderSettings: (settings: ReaderSettings) => void;
}

export const ChapterReader: React.FC<ChapterReaderProps> = ({
  novel,
  chapter,
  allChapters,
  onSelectChapter,
  onBackToNovel,
  adSettings,
  readerSettings,
  onUpdateReaderSettings,
}) => {
  const [likesCount, setLikesCount] = useState<number>(chapter.likes);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);
  const [showChapterMenu, setShowChapterMenu] = useState<boolean>(false);
  
  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentName, setNewCommentName] = useState<string>('');
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [commentSort, setCommentSort] = useState<'newest' | 'most_liked'>('newest');
  
  // Reading Progress state
  const [readingProgress, setReadingProgress] = useState<number>(0);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Initialize chapter state on mount or change
  useEffect(() => {
    // Record view counter
    storageService.incrementChapterView(chapter.id, novel.id);
    
    // Check if liked & bookmarked
    setIsLiked(storageService.isChapterLikedByUser(chapter.id));
    setLikesCount(chapter.likes);
    setIsBookmarked(storageService.isBookmarked(novel.id, chapter.id));

    // Load comments
    setComments(storageService.getComments(chapter.id));

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [chapter.id, novel.id]);

  // Scroll Progress listener
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setReadingProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sorted chapters
  const sortedChapters = useMemo(() => {
    return [...allChapters].sort((a, b) => a.chapterNumber - b.chapterNumber);
  }, [allChapters]);

  const currentIndex = sortedChapters.findIndex(c => c.id === chapter.id);
  const prevChapter = currentIndex > 0 ? sortedChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < sortedChapters.length - 1 ? sortedChapters[currentIndex + 1] : null;

  // Estimated read time
  const readingTimeMinutes = Math.max(1, Math.ceil(chapter.wordCount / 180));

  // Toggle Like with animation
  const handleToggleLike = () => {
    const result = storageService.toggleChapterLike(chapter.id, novel.id);
    setIsLiked(result.liked);
    setLikesCount(result.newCount);

    if (result.liked) {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.85 },
          colors: ['#4A5D4E', '#C88A3B', '#8C5E45'],
        });
      } catch {
        // Fallback gracefully
      }
    }
  };

  // Toggle Bookmark
  const handleToggleBookmark = () => {
    const bookmarked = storageService.toggleBookmark(novel.id, chapter.id, chapter.chapterNumber, chapter.title);
    setIsBookmarked(bookmarked);
  };

  // Post new Comment
  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const authorName = newCommentName.trim() || 'قارئ شغوف';
    const newComment = storageService.addComment({
      chapterId: chapter.id,
      novelId: novel.id,
      authorName,
      content: newCommentText.trim(),
    });

    setComments(prev => [...prev, newComment]);
    setNewCommentText('');
  };

  // Reply to a comment
  const handlePostReply = (parentId: string) => {
    if (!replyText.trim()) return;

    const authorName = newCommentName.trim() || 'قارئ';
    const newReply = storageService.addComment({
      chapterId: chapter.id,
      novelId: novel.id,
      authorName,
      content: replyText.trim(),
      parentId,
    });

    setComments(prev => [...prev, newReply]);
    setReplyText('');
    setReplyingToId(null);
  };

  // Like comment
  const handleLikeComment = (commentId: string) => {
    const result = storageService.toggleCommentLike(commentId);
    setComments(prev =>
      prev.map(c => (c.id === commentId ? { ...c, likes: result.count, userLiked: result.liked } : c))
    );
  };

  // Share Chapter
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    }
  };

  // Filtered comments (roots vs replies)
  const rootComments = useMemo(() => {
    const roots = comments.filter(c => !c.parentId);
    if (commentSort === 'most_liked') {
      return [...roots].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || b.likes - a.likes);
    }
    return [...roots].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [comments, commentSort]);

  // Reader Theme Style Classes Mapping
  const themeStyles = {
    paper: {
      bg: 'bg-[#FDFCF8]',
      text: 'text-[#2C2C2C]',
      border: 'border-[#E5E2D9]',
      subtext: 'text-[#6E6A64]',
      card: 'bg-[#F7F5EE]',
      accent: 'text-[#4A5D4E]',
      headerBg: 'bg-[#FDFCF8]/95 border-[#E5E2D9]',
    },
    sepia: {
      bg: 'bg-[#f4ecd8]',
      text: 'text-[#433422]',
      border: 'border-[#dfd3b8]',
      subtext: 'text-[#7d6547]',
      card: 'bg-[#ebdcb9]',
      accent: 'text-[#8C5E45]',
      headerBg: 'bg-[#f4ecd8]/95 border-[#dfd3b8]',
    },
    slate: {
      bg: 'bg-[#1e232a]',
      text: 'text-[#d8dee9]',
      border: 'border-[#2e3440]',
      subtext: 'text-[#9aa5b6]',
      card: 'bg-[#282e39]',
      accent: 'text-[#4A5D4E]',
      headerBg: 'bg-[#1e232a]/95 border-[#2e3440]',
    },
    obsidian: {
      bg: 'bg-[#0f0e0e]',
      text: 'text-[#e5e5e5]',
      border: 'border-[#262626]',
      subtext: 'text-[#a3a3a3]',
      card: 'bg-[#171717]',
      accent: 'text-[#4A5D4E]',
      headerBg: 'bg-[#0f0e0e]/95 border-[#262626]',
    },
    emerald: {
      bg: 'bg-[#061e18]',
      text: 'text-[#d6ede4]',
      border: 'border-[#0f3d32]',
      subtext: 'text-[#7fb8a4]',
      card: 'bg-[#0c2b23]',
      accent: 'text-emerald-400',
      headerBg: 'bg-[#061e18]/95 border-[#0f3d32]',
    },
  }[readerSettings.theme];

  // Font family class
  const fontClass = {
    amiri: 'font-amiri',
    cairo: 'font-cairo',
    tajawal: 'font-tajawal',
    readex: 'font-readex',
    scheherazade: 'font-scheherazade',
    lora: 'font-serif',
    merriweather: 'font-serif',
    playfair: 'font-serif',
    jakarta: 'font-cairo',
    mono: 'font-mono',
  }[readerSettings.fontFamily] || 'font-amiri';

  // Line height class
  const lineHeightClass = {
    tight: 'leading-relaxed',
    normal: 'leading-loose',
    relaxed: 'leading-[2.4]',
  }[readerSettings.lineHeight];

  // Width class
  const widthClass = {
    narrow: 'max-w-2xl',
    standard: 'max-w-3xl',
    wide: 'max-w-4xl',
    full: 'max-w-5xl',
  }[readerSettings.contentWidth];

  // Split chapter content for mid-chapter ad insertion if long
  const paragraphs = chapter.content.split('\n\n').filter(p => p.trim());
  const midPoint = Math.floor(paragraphs.length / 2);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeStyles.bg} ${themeStyles.text} font-cairo`}>
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-black/10 z-50">
        <div
          className="h-full bg-[#4A5D4E] transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Sticky Reader Navigation Bar */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-md border-b px-4 py-2.5 transition-colors duration-300 ${themeStyles.headerBg}`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          {/* Back & Novel Info */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              id="reader-back-to-novel-btn"
              onClick={onBackToNovel}
              className={`p-2 rounded-xl border ${themeStyles.border} hover:bg-black/5 dark:hover:bg-white/5 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer`}
              title="العودة لصفحة الرواية"
            >
              <ArrowRight className="w-4 h-4 text-[#4A5D4E]" />
              <span className="hidden sm:inline">نظرة عامة</span>
            </button>

            <div className="min-w-0">
              <h2 className="text-xs font-medium opacity-75 truncate max-w-[200px] sm:max-w-xs font-amiri">
                {novel.title}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold truncate font-amiri text-[#4A5D4E]">
                  الفصل {chapter.chapterNumber}: {chapter.title}
                </span>
              </div>
            </div>
          </div>

          {/* Controls: Chapter Selector, Bookmark, Settings */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Chapter Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                id="reader-chapter-menu-btn"
                onClick={() => setShowChapterMenu(!showChapterMenu)}
                className={`p-2 rounded-xl border ${themeStyles.border} hover:bg-black/5 dark:hover:bg-white/5 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer`}
                title="اختيار الفصل"
              >
                <List className="w-4 h-4 text-[#4A5D4E]" />
                <span className="hidden md:inline">فصل {chapter.chapterNumber}</span>
              </button>

              {showChapterMenu && (
                <div
                  className={`absolute left-0 mt-2 w-72 max-h-96 overflow-y-auto rounded-2xl shadow-2xl border ${themeStyles.border} ${themeStyles.card} z-50 p-2 text-right`}
                >
                  <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider border-b border-black/10 dark:border-white/10 mb-1">
                    فهرس الفصول ({allChapters.length} فصول)
                  </div>
                  <div className="space-y-1">
                    {sortedChapters.map(ch => {
                      const isCurrent = ch.id === chapter.id;
                      return (
                        <button
                          key={ch.id}
                          type="button"
                          id={`select-chapter-item-${ch.id}`}
                          onClick={() => {
                            onSelectChapter(ch.id);
                            setShowChapterMenu(false);
                          }}
                          className={`w-full text-right px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-[#4A5D4E] text-[#FDFCF8] font-bold'
                              : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-90'
                          }`}
                        >
                          <span className="truncate font-amiri font-bold">
                            {ch.chapterNumber}. {ch.title}
                          </span>
                          <span className="text-[10px] opacity-75 mr-2 shrink-0">
                            {ch.wordCount} كلمة
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {novel.pdfDownloadUrl && (
              <a
                href={novel.pdfDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                id="reader-download-book-btn"
                className="px-2.5 py-1.5 rounded-xl bg-[#C88A3B] hover:bg-[#B3782E] text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                title={`تحميل الكتاب (${novel.pdfFileSize || 'نسخة إلكترونية'})`}
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">تحميل الكتاب</span>
              </a>
            )}

            {/* Bookmark button */}
            <button
              type="button"
              id="reader-bookmark-btn"
              onClick={handleToggleBookmark}
              className={`p-2 rounded-xl border ${themeStyles.border} ${
                isBookmarked
                  ? 'bg-[#4A5D4E]/20 text-[#4A5D4E] border-[#4A5D4E]/40'
                  : 'hover:bg-black/5 dark:hover:bg-white/5'
              } transition-all cursor-pointer`}
              title={isBookmarked ? 'محفوظ في مكتبتك' : 'حفظ الفصل'}
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-4 h-4 text-[#4A5D4E]" />
              ) : (
                <BookmarkIcon className="w-4 h-4" />
              )}
            </button>

            {/* Share button */}
            <button
              type="button"
              id="reader-share-btn"
              onClick={handleShare}
              className={`p-2 rounded-xl border ${themeStyles.border} hover:bg-black/5 dark:hover:bg-white/5 transition-all relative cursor-pointer`}
              title="مشاركة رابط الفصل"
            >
              <Share2 className="w-4 h-4" />
              {copiedNotification && (
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-[#4A5D4E] text-[#FDFCF8] text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap">
                  تم نسخ الرابط!
                </span>
              )}
            </button>

            {/* Customization Settings Drawer Toggle */}
            <button
              type="button"
              id="reader-settings-drawer-btn"
              onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
              className={`px-3 py-2 rounded-xl border ${
                showSettingsDrawer
                  ? 'bg-[#4A5D4E] text-[#FDFCF8] border-[#4A5D4E] font-bold'
                  : `${themeStyles.border} hover:bg-black/5 dark:hover:bg-white/5`
              } transition-all text-xs flex items-center gap-1.5 cursor-pointer`}
              title="تخصيص الخط وثيم القراءة"
            >
              <Settings2 className="w-4 h-4" />
              <span className="hidden sm:inline">أ خيارات الخط والمظهر</span>
            </button>
          </div>
        </div>

        {/* Reader Customization Settings Popdown Drawer */}
        {showSettingsDrawer && (
          <div
            id="reader-customization-panel"
            className={`mt-3 max-w-4xl mx-auto p-4 sm:p-5 rounded-2xl border ${themeStyles.border} ${themeStyles.card} shadow-xl animate-in fade-in slide-in-from-top-2 duration-200`}
          >
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#4A5D4E]" />
                <h3 className="font-bold text-sm">تخصيص تجربة القراءة والخطوط</h3>
              </div>
              <button
                type="button"
                id="close-reader-settings-btn"
                onClick={() => setShowSettingsDrawer(false)}
                className="text-xs text-[#6E6A64] hover:text-[#2C2C2C] px-3 py-1 rounded-lg bg-black/5 hover:bg-black/10 cursor-pointer font-bold"
              >
                إغلاق
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* 1. Font Family */}
              <div>
                <label className="text-xs font-bold block mb-2 opacity-80">نوع الخط العربي والأدبي</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    { id: 'amiri', label: 'الخط الأميري (أدبي تراثي)', font: 'font-amiri' },
                    { id: 'cairo', label: 'خط القاهرة (عصري ومريح)', font: 'font-cairo' },
                    { id: 'tajawal', label: 'خط تجوال (أنيق وسلس)', font: 'font-tajawal' },
                    { id: 'readex', label: 'خط ريديكس (واضح للشاشات)', font: 'font-readex' },
                    { id: 'scheherazade', label: 'خط شهرزاد (روايات وملاحم)', font: 'font-scheherazade' },
                  ].map(font => (
                    <button
                      key={font.id}
                      type="button"
                      id={`font-opt-${font.id}`}
                      onClick={() =>
                        onUpdateReaderSettings({
                          ...readerSettings,
                          fontFamily: font.id as any,
                        })
                      }
                      className={`px-2.5 py-1.5 text-xs rounded-lg border text-right transition-all cursor-pointer ${font.font} ${
                        readerSettings.fontFamily === font.id
                          ? 'bg-[#4A5D4E] text-[#FDFCF8] font-bold border-[#4A5D4E] shadow-sm'
                          : `border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5`
                      }`}
                    >
                      {font.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Font Size & Spacing */}
              <div>
                <label className="text-xs font-bold block mb-2 opacity-80">
                  حجم الخط: <span className="font-mono text-[#4A5D4E] font-bold">{readerSettings.fontSize}px</span>
                </label>
                <div className="flex items-center gap-2 mb-3">
                  <button
                    type="button"
                    id="font-size-dec-btn"
                    onClick={() =>
                      onUpdateReaderSettings({
                        ...readerSettings,
                        fontSize: Math.max(14, readerSettings.fontSize - 1),
                      })
                    }
                    className={`flex-1 py-1.5 rounded-lg border border-black/10 dark:border-white/10 text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer`}
                  >
                    أ-
                  </button>
                  <input
                    type="range"
                    id="font-size-slider"
                    min={14}
                    max={32}
                    step={1}
                    value={readerSettings.fontSize}
                    onChange={e =>
                      onUpdateReaderSettings({
                        ...readerSettings,
                        fontSize: Number(e.target.value),
                      })
                    }
                    className="w-24 accent-[#4A5D4E] cursor-pointer"
                  />
                  <button
                    type="button"
                    id="font-size-inc-btn"
                    onClick={() =>
                      onUpdateReaderSettings({
                        ...readerSettings,
                        fontSize: Math.min(32, readerSettings.fontSize + 1),
                      })
                    }
                    className={`flex-1 py-1.5 rounded-lg border border-black/10 dark:border-white/10 text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer`}
                  >
                    أ+
                  </button>
                </div>

                <label className="text-xs font-bold block mb-1 opacity-80">تباعد الأسطر</label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'tight', label: 'مضغوط' },
                    { id: 'normal', label: 'متوسط' },
                    { id: 'relaxed', label: 'مريح' },
                  ].map(lh => (
                    <button
                      key={lh.id}
                      type="button"
                      id={`line-height-${lh.id}`}
                      onClick={() =>
                        onUpdateReaderSettings({
                          ...readerSettings,
                          lineHeight: lh.id as any,
                        })
                      }
                      className={`py-1 text-xs rounded-lg border transition-all cursor-pointer ${
                        readerSettings.lineHeight === lh.id
                          ? 'bg-[#4A5D4E] text-[#FDFCF8] font-bold border-[#4A5D4E]'
                          : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      {lh.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Color Theme Palettes */}
              <div>
                <label className="text-xs font-bold block mb-2 opacity-80">أجواء وثيم الصفحة</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    { id: 'paper', label: 'الورق الطبيعي العاجي', swatch: 'bg-[#faf7f2] text-[#2b2725] border-[#dfd3b8]' },
                    { id: 'sepia', label: 'سيبيا كلاسيكي دافئ', swatch: 'bg-[#f4ecd8] text-[#433422] border-[#dfd3b8]' },
                    { id: 'slate', label: 'رمادي ليلي مهدئ', swatch: 'bg-[#1e232a] text-[#d8dee9] border-[#3b4252]' },
                    { id: 'obsidian', label: 'أسود ليلي داكن OLED', swatch: 'bg-[#0f0e0e] text-[#e5e5e5] border-[#333333]' },
                    { id: 'emerald', label: 'أخضر الغابة الزمردي', swatch: 'bg-[#061e18] text-[#d6ede4] border-[#0f3d32]' },
                  ].map(thm => (
                    <button
                      key={thm.id}
                      type="button"
                      id={`theme-opt-${thm.id}`}
                      onClick={() =>
                        onUpdateReaderSettings({
                          ...readerSettings,
                          theme: thm.id as any,
                        })
                      }
                      className={`px-3 py-1.5 text-xs rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                        thm.swatch
                      } ${
                        readerSettings.theme === thm.id
                          ? 'ring-2 ring-[#4A5D4E] font-bold shadow-md'
                          : 'opacity-90 hover:opacity-100'
                      }`}
                    >
                      <span>{thm.label}</span>
                      {readerSettings.theme === thm.id && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#4A5D4E]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Reading Width & Alignment */}
              <div>
                <label className="text-xs font-bold block mb-2 opacity-80">عرض محاذاة الصفحة</label>
                <div className="grid grid-cols-2 gap-1.5 mb-3">
                  {[
                    { id: 'narrow', label: 'مضغوط' },
                    { id: 'standard', label: 'قياسي' },
                    { id: 'wide', label: 'عريض' },
                    { id: 'full', label: 'كامل الصفحة' },
                  ].map(w => (
                    <button
                      key={w.id}
                      type="button"
                      id={`width-opt-${w.id}`}
                      onClick={() =>
                        onUpdateReaderSettings({
                          ...readerSettings,
                          contentWidth: w.id as any,
                        })
                      }
                      className={`px-2 py-1 text-xs rounded-lg border transition-all cursor-pointer ${
                        readerSettings.contentWidth === w.id
                          ? 'bg-[#4A5D4E] text-[#FDFCF8] font-bold border-[#4A5D4E]'
                          : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>

                <label className="text-xs font-bold block mb-1 opacity-80">محاذاة النص</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    id="text-align-right-btn"
                    onClick={() =>
                      onUpdateReaderSettings({
                        ...readerSettings,
                        textAlign: 'right',
                      })
                    }
                    className={`py-1 text-xs rounded-lg border transition-all cursor-pointer ${
                      readerSettings.textAlign === 'right' || readerSettings.textAlign === 'left'
                        ? 'bg-[#4A5D4E] text-[#FDFCF8] font-bold border-[#4A5D4E]'
                        : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    محاذاة لليمين
                  </button>
                  <button
                    type="button"
                    id="text-align-justify-btn"
                    onClick={() =>
                      onUpdateReaderSettings({
                        ...readerSettings,
                        textAlign: 'justify',
                      })
                    }
                    className={`py-1 text-xs rounded-lg border transition-all cursor-pointer ${
                      readerSettings.textAlign === 'justify'
                        ? 'bg-[#4A5D4E] text-[#FDFCF8] font-bold border-[#4A5D4E]'
                        : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    ضبط متساوي (Justify)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Chapter Content Container */}
      <main className={`mx-auto px-4 sm:px-6 py-8 sm:py-12 ${widthClass}`}>
        {/* Top Header Ad Placement */}
        <AdSlot location="header" adSettings={adSettings} className="mb-8" />

        {/* Chapter Title & Metadata Header */}
        <div className="text-center border-b border-black/10 dark:border-white/10 pb-8 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#4A5D4E]/15 text-[#2D4532] text-xs font-bold mb-3 border border-[#4A5D4E]/30">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{novel.title}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-amiri font-bold tracking-tight mb-3">
            الفصل {chapter.chapterNumber}: {chapter.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs opacity-75">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span>{(chapter.views + 1).toLocaleString()} قراءة</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{readingTimeMinutes} دقائق قراءة تقريبية ({chapter.wordCount} كلمة)</span>
            </span>
            <span>·</span>
            <span>بقلم المؤلف: {novel.author}</span>
          </div>

          {/* Reader Quick Actions: Copy Chapter Text & Download PDF */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4 pt-4 border-t border-black/5 dark:border-white/5">
            <button
              type="button"
              id="copy-chapter-text-btn"
              onClick={() => {
                const fullText = `${novel.title}\nالفصل ${chapter.chapterNumber}: ${chapter.title}\nبقلم الكاتب: ${novel.author}\n\n${chapter.content}\n\n---\nمرخص برخصة المشاع الإبداعي CC BY-NC 4.0 (الكاتب أيمن كناني)`;
                navigator.clipboard.writeText(fullText);
                setCopiedNotification(true);
                setTimeout(() => setCopiedNotification(false), 3000);
              }}
              className="px-3.5 py-1.5 rounded-xl border border-[#E5E2D9] dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
              title="نسخ نص هذا الفصل بالكامل مع حقوق الاقتباس"
            >
              {copiedNotification ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">تم نسخ نص الفصل بنجاح!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#4A5D4E]" />
                  <span>نسخ نص الفصل</span>
                </>
              )}
            </button>

            {novel.pdfDownloadUrl && (
              <a
                href={novel.pdfDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                id="chapter-download-pdf-btn"
                className="px-3.5 py-1.5 rounded-xl bg-[#C88A3B] hover:bg-[#B3782E] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                title="تحميل الكتاب كاملاً بصيغة PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تحميل الكتاب PDF {novel.pdfFileSize ? `(${novel.pdfFileSize})` : ''}</span>
              </a>
            )}
          </div>
        </div>

        {/* Author's Opening Note (if exists) */}
        {chapter.authorNote && (
          <div className={`p-4 rounded-2xl border ${themeStyles.border} ${themeStyles.card} mb-8 text-sm italic font-cairo shadow-xs`}>
            <div className="flex items-center gap-1.5 font-bold not-italic text-xs text-[#4A5D4E] mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ملاحظة الكاتب ({novel.author}):</span>
            </div>
            <p className="opacity-90">{chapter.authorNote}</p>
          </div>
        )}

        {/* Reading Text Body - Copy and Selection Fully Enabled */}
        <article
          ref={contentRef}
          className={`${fontClass} ${lineHeightClass} ${
            readerSettings.textAlign === 'justify' ? 'text-justify' : 'text-right'
          } space-y-6 sm:space-y-8 select-text cursor-text selection:bg-[#4A5D4E]/20`}
          style={{ fontSize: `${readerSettings.fontSize}px`, userSelect: 'text', WebkitUserSelect: 'text' }}
        >
          {/* Render first half */}
          {paragraphs.slice(0, midPoint > 0 ? midPoint : paragraphs.length).map((para, idx) => (
            <p key={`p1-${idx}`} className="leading-relaxed sm:leading-loose">
              {para}
            </p>
          ))}

          {/* Mid-Chapter Ad Placement */}
          {paragraphs.length > 2 && (
            <AdSlot location="mid_chapter" adSettings={adSettings} className="my-8" />
          )}

          {/* Render second half */}
          {paragraphs.length > 2 &&
            paragraphs.slice(midPoint).map((para, idx) => (
              <p key={`p2-${idx}`} className="leading-relaxed sm:leading-loose">
                {para}
              </p>
            ))}

          {/* Chapter License Notice */}
          <div className={`mt-10 p-4 sm:p-5 rounded-2xl border ${themeStyles.border} ${themeStyles.card} shadow-xs text-xs font-cairo`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#4A5D4E]/10 text-[#4A5D4E] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-sm">
                    هذا العمل مرخّص بـ <span className="font-mono text-[#4A5D4E]">CC BY-NC 4.0</span>
                  </p>
                  <p className="opacity-75 text-[11px] mt-0.5">
                    رخصة المشاع الإبداعي: نسب المصنف - غير تجاري 4.0 دولي | للكاتب أيمن كناني
                  </p>
                </div>
              </div>

              <a
                href="https://creativecommons.org/licenses/by-nc/4.0/deed.ar"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8] text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
              >
                <span>شروط الرخصة</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </article>

        {/* Decorative Section Separator */}
        <div className="flex items-center justify-center gap-3 my-12 opacity-40">
          <span className="h-px w-16 bg-current" />
          <span className="text-[#C88A3B]">✦ ✦ ✦</span>
          <span className="h-px w-16 bg-current" />
        </div>

        {/* Chapter End Ad Placement */}
        <AdSlot location="chapter_end" adSettings={adSettings} className="mb-8" />

        {/* Interactive Reader Actions Bar (Like, Prev/Next Chapters) */}
        <div
          id="reader-actions-footer"
          className={`p-5 sm:p-6 rounded-2xl border ${themeStyles.border} ${themeStyles.card} shadow-lg mb-10`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Like Chapter Button */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
              <button
                type="button"
                id="like-chapter-button"
                onClick={handleToggleLike}
                className={`px-6 py-3 rounded-xl border flex items-center gap-2.5 font-bold text-sm transition-all transform active:scale-95 cursor-pointer shadow-md ${
                  isLiked
                    ? 'bg-rose-600 text-white border-rose-500 shadow-rose-900/40'
                    : 'bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8] border-[#4A5D4E]'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current animate-pulse' : ''}`} />
                <span>{isLiked ? 'أعجبك هذا الفصل!' : 'إعجاب بالفصل'}</span>
                <span className="px-2 py-0.5 rounded-full bg-black/20 text-xs font-mono">
                  {likesCount}
                </span>
              </button>
            </div>

            {/* Chapter Step Navigation (RTL: Prev goes Right, Next goes Left) */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
              {prevChapter ? (
                <button
                  type="button"
                  id="reader-prev-chapter-btn"
                  onClick={() => onSelectChapter(prevChapter.id)}
                  className={`px-4 py-2.5 rounded-xl border ${themeStyles.border} hover:bg-black/5 dark:hover:bg-white/5 transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer`}
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>الفصل السابق</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="px-4 py-2.5 rounded-xl border border-dashed opacity-40 text-xs font-medium cursor-not-allowed flex items-center gap-1"
                >
                  <span>أول فصل</span>
                </button>
              )}

              {nextChapter ? (
                <button
                  type="button"
                  id="reader-next-chapter-btn"
                  onClick={() => onSelectChapter(nextChapter.id)}
                  className="px-5 py-2.5 rounded-xl bg-[#C88A3B] hover:bg-[#B3792E] text-[#FDFCF8] text-xs font-bold transition-all flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <span>الفصل التالي</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              ) : (
                <div className="px-4 py-2.5 rounded-xl bg-emerald-900/40 text-emerald-300 border border-emerald-700/40 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>وصلت لآخر فصل منشور!</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reader Rating Box at Chapter End */}
        <div className="mt-8">
          <StarRatingWidget
            novelId={novel.id}
            currentRating={novel.rating}
            ratingCount={novel.ratingCount}
          />
        </div>

        {/* Interactive Comments & Discussions Section */}
        <section id="chapter-comments-section" className="mt-10 pt-8 border-t border-black/10 dark:border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#4A5D4E]" />
              <h3 className="font-amiri font-bold text-xl sm:text-2xl">
                نقاشات القراء وآراؤهم ({comments.length})
              </h3>
            </div>

            <div className="flex items-center gap-1 text-xs">
              <span className="opacity-60 ml-1">ترتيب حسب:</span>
              <button
                type="button"
                id="comment-sort-newest-btn"
                onClick={() => setCommentSort('newest')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer font-semibold ${
                  commentSort === 'newest'
                    ? 'bg-[#4A5D4E] text-[#FDFCF8]'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                الأحدث
              </button>
              <button
                type="button"
                id="comment-sort-liked-btn"
                onClick={() => setCommentSort('most_liked')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer font-semibold ${
                  commentSort === 'most_liked'
                    ? 'bg-[#4A5D4E] text-[#FDFCF8]'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                الأكثر إعجاباً
              </button>
            </div>
          </div>

          {/* Add Comment Form */}
          <form
            onSubmit={handlePostComment}
            className={`p-4 sm:p-5 rounded-2xl border ${themeStyles.border} ${themeStyles.card} mb-8 shadow-sm`}
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A5D4E] mb-3">
              أضف تعليقك وانطباعك عن الفصل {chapter.chapterNumber}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <input
                type="text"
                id="comment-author-input"
                placeholder="اسم القارئ (مثلاً: سارة، أحمد...)"
                value={newCommentName}
                onChange={e => setNewCommentName(e.target.value)}
                className={`sm:col-span-1 px-3.5 py-2 text-xs rounded-xl border ${themeStyles.border} bg-black/5 dark:bg-white/5 focus:outline-none focus:ring-1 focus:ring-[#4A5D4E]`}
              />
              <span className="text-[11px] opacity-60 self-center hidden sm:inline">
                شارك في النقاش وتبادل التحليلات مع القراء
              </span>
            </div>

            <textarea
              id="comment-content-textarea"
              rows={3}
              placeholder="ما رأيك في أحداث وتطورات هذا الفصل؟ شاركنا توقعاتك للفصل القادم..."
              value={newCommentText}
              onChange={e => setNewCommentText(e.target.value)}
              className={`w-full p-3.5 text-xs sm:text-sm rounded-xl border ${themeStyles.border} bg-black/5 dark:bg-white/5 focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] mb-3 resize-none`}
            />

            <div className="flex justify-between items-center">
              <p className="text-[11px] opacity-60">
                يرجى الالتزام بالنقاش البناء وتجنب حرق الأحداث غير المصرح به.
              </p>
              <button
                type="submit"
                id="submit-comment-btn"
                disabled={!newCommentText.trim()}
                className="px-5 py-2.5 bg-[#4A5D4E] hover:bg-[#3C4C3F] disabled:opacity-40 disabled:cursor-not-allowed text-[#FDFCF8] font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>نشر التعليق</span>
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {rootComments.length === 0 ? (
              <div className="text-center py-10 opacity-60 text-xs sm:text-sm italic">
                كن أول قارئ يترك تعليقاً على هذا الفصل!
              </div>
            ) : (
              rootComments.map(comment => {
                const replies = comments.filter(c => c.parentId === comment.id);

                return (
                  <div
                    key={comment.id}
                    className={`p-4 rounded-xl border ${themeStyles.border} ${themeStyles.card} transition-all`}
                  >
                    {comment.isPinned && (
                      <div className="flex items-center gap-1 text-[11px] text-[#C88A3B] font-bold mb-2">
                        <Pin className="w-3 h-3" />
                        <span>تعليق مثبت من المؤلف</span>
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={comment.authorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(comment.authorName)}`}
                          alt={comment.authorName}
                          className="w-8 h-8 rounded-full bg-[#4A5D4E]/20 border border-[#4A5D4E]/30 object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold">
                              {comment.authorName}
                            </span>
                            {comment.isAuthor && (
                              <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-[#4A5D4E] text-[#FDFCF8]">
                                الكاتب
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] opacity-60">
                            {new Date(comment.createdAt).toLocaleDateString('ar-EG', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Comment Like Button */}
                      <button
                        type="button"
                        id={`like-comment-${comment.id}`}
                        onClick={() => handleLikeComment(comment.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-all cursor-pointer ${
                          comment.userLiked
                            ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                            : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-75 hover:opacity-100'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${comment.userLiked ? 'fill-current' : ''}`} />
                        <span>{comment.likes}</span>
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm mt-2.5 leading-relaxed opacity-90 pr-10">
                      {comment.content}
                    </p>

                    {/* Reply Toggle */}
                    <div className="pr-10 mt-2 flex items-center gap-3">
                      <button
                        type="button"
                        id={`reply-toggle-btn-${comment.id}`}
                        onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                        className="text-[11px] text-[#4A5D4E] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                      >
                        <CornerDownLeft className="w-3 h-3" />
                        <span>{replyingToId === comment.id ? 'إلغاء الرد' : 'رد'}</span>
                      </button>
                    </div>

                    {/* Inline Reply Form */}
                    {replyingToId === comment.id && (
                      <div className="pr-10 mt-3 pt-3 border-t border-black/5 dark:border-white/5">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            id={`reply-input-${comment.id}`}
                            placeholder={`الرد على ${comment.authorName}...`}
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            className={`flex-1 px-3 py-1.5 text-xs rounded-xl border ${themeStyles.border} bg-black/5 dark:bg-white/5 focus:outline-none focus:ring-1 focus:ring-[#4A5D4E]`}
                          />
                          <button
                            type="button"
                            id={`submit-reply-btn-${comment.id}`}
                            onClick={() => handlePostReply(comment.id)}
                            disabled={!replyText.trim()}
                            className="px-4 py-1.5 bg-[#4A5D4E] hover:bg-[#3C4C3F] disabled:opacity-40 text-[#FDFCF8] text-xs font-bold rounded-xl cursor-pointer transition-all"
                          >
                            إرسال
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Nested Replies */}
                    {replies.length > 0 && (
                      <div className="pr-10 mt-3 pt-3 border-t border-black/5 dark:border-white/5 space-y-2.5">
                        {replies.map(reply => (
                          <div
                            key={reply.id}
                            className={`p-3 rounded-xl bg-black/5 dark:bg-white/5 border ${themeStyles.border}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <img
                                  src={reply.authorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(reply.authorName)}`}
                                  alt={reply.authorName}
                                  className="w-6 h-6 rounded-full bg-[#4A5D4E]/20"
                                />
                                <span className="text-xs font-bold">{reply.authorName}</span>
                                {reply.isAuthor && (
                                  <span className="px-1.5 py-0.5 text-[8px] font-bold rounded bg-[#4A5D4E] text-[#FDFCF8]">
                                    الكاتب
                                  </span>
                                )}
                                <span className="text-[10px] opacity-60">
                                  {new Date(reply.createdAt).toLocaleDateString('ar-EG')}
                                </span>
                              </div>

                              <button
                                type="button"
                                id={`like-reply-${reply.id}`}
                                onClick={() => handleLikeComment(reply.id)}
                                className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg cursor-pointer ${
                                  reply.userLiked ? 'text-rose-500 font-bold' : 'opacity-70 hover:opacity-100'
                                }`}
                              >
                                <Heart className={`w-3 h-3 ${reply.userLiked ? 'fill-current' : ''}`} />
                                <span>{reply.likes}</span>
                              </button>
                            </div>
                            <p className="text-xs mt-1.5 pr-8 opacity-90">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
};
