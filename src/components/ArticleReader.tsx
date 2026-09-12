import React, { useState, useEffect, useMemo, useRef } from 'react';
import { IntellectualItem, ArticleReaderNote, MarginNote } from '../types';
import { storageService } from '../services/storageService';
import { AddMarginNoteModal, MarginNotesPopover } from './MarginaliaSystem';
import { BilingualReaderView } from './BilingualReaderView';
import { ArticleKnowledgeMap } from './ArticleKnowledgeMap';
import { ArticleReplies } from './ArticleReplies';
import {
  ArrowRight,
  Clock,
  Eye,
  Heart,
  BookOpen,
  Share2,
  Printer,
  Copy,
  Check,
  Languages,
  FileText,
  Bookmark,
  Sparkles,
  Quote,
  AlignRight,
  Type,
  ExternalLink,
  ListTree,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Plus,
  Trash2,
  CornerUpRight,
  Globe,
  PenLine,
  BookmarkCheck,
  Columns,
  BookMarked,
  Maximize2,
  Minimize2,
  Palette,
  Layers,
  X,
  PanelRightOpen,
  PanelRightClose
} from 'lucide-react';

interface ArticleReaderProps {
  article: IntellectualItem;
  onBack: () => void;
  onSelectArticle?: (id: string) => void;
  allArticles?: IntellectualItem[];
}

export const ArticleReader: React.FC<ArticleReaderProps> = ({
  article,
  onBack,
  onSelectArticle,
  allArticles = [],
}) => {
  const [likes, setLikes] = useState<number>(article.likes || 0);
  const [isLiked, setIsLiked] = useState<boolean>(() => storageService.isArticleLiked(article.id));
  const [copiedCitation, setCopiedCitation] = useState<boolean>(false);
  const [copiedAbstract, setCopiedAbstract] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Reading Comfort States (تكبير، خطوط، ألوان، هوامش عائمة)
  const [fontSize, setFontSize] = useState<number>(19);
  const [theme, setTheme] = useState<'paper' | 'sepia' | 'sage' | 'night' | 'pristine'>('paper');
  const [currentFont, setCurrentFont] = useState<'amiri' | 'cairo' | 'traditional'>('amiri');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isFloatingMarginDrawerOpen, setIsFloatingMarginDrawerOpen] = useState<boolean>(false);

  // Multilingual Abstract state
  const availableLangs = useMemo(() => {
    const langs: Array<{ code: 'ar' | 'en' | 'fr'; label: string; flag: string; dir: 'rtl' | 'ltr' }> = [];
    if (article.multilingualAbstract?.ar || article.abstract) {
      langs.push({ code: 'ar', label: 'العربية (AR)', flag: '🇸🇦', dir: 'rtl' });
    }
    if (article.multilingualAbstract?.en) {
      langs.push({ code: 'en', label: 'English (EN)', flag: '🇬🇧', dir: 'ltr' });
    }
    if (article.multilingualAbstract?.fr) {
      langs.push({ code: 'fr', label: 'Français (FR)', flag: '🇫🇷', dir: 'ltr' });
    }
    return langs.length > 0 ? langs : [{ code: 'ar' as const, label: 'العربية (AR)', flag: '🇸🇦', dir: 'rtl' as const }];
  }, [article]);

  const [activeLang, setActiveLang] = useState<'ar' | 'en' | 'fr'>('ar');

  const currentAbstractText = useMemo(() => {
    if (article.multilingualAbstract) {
      return article.multilingualAbstract[activeLang] || article.abstract || '';
    }
    return article.abstract || '';
  }, [article, activeLang]);

  // Table of Contents State
  const [isTocOpen, setIsTocOpen] = useState<boolean>(true);
  const [isHeaderTocOpen, setIsHeaderTocOpen] = useState<boolean>(false);

  // Dynamic TOC parsed from markdown headings
  const tableOfContents = useMemo(() => {
    const headings: Array<{ id: string; title: string; level: number }> = [];
    const lines = article.content.split('\n');
    let hIdx = 0;
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('## ')) {
        headings.push({
          id: `heading-${hIdx++}`,
          title: trimmed.replace('## ', ''),
          level: 2,
        });
      } else if (trimmed.startsWith('### ')) {
        headings.push({
          id: `heading-${hIdx++}`,
          title: trimmed.replace('### ', ''),
          level: 3,
        });
      }
    });
    return headings;
  }, [article.content]);

  // Footnote and Citation interactive jump & highlight state
  const [highlightedFootnote, setHighlightedFootnote] = useState<number | null>(null);

  // Reader Notes & Marginalia State
  const [readerNotes, setReaderNotes] = useState<MarginNote[]>(() =>
    storageService.getArticleReaderNotes(article.id)
  );
  const [newNoteAuthor, setNewNoteAuthor] = useState<string>('');
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [newNoteQuote, setNewNoteQuote] = useState<string>('');
  const [isAddingNote, setIsAddingNote] = useState<boolean>(false);
  const [noteSuccessMsg, setNoteSuccessMsg] = useState<string>('');

  // Marginalia Modal & Popover Interactive State
  const [isMarginModalOpen, setIsMarginModalOpen] = useState<boolean>(false);
  const [isMarginPopoverOpen, setIsMarginPopoverOpen] = useState<boolean>(false);
  const [activeMarginParagraph, setActiveMarginParagraph] = useState<number | undefined>(undefined);
  const [activeMarginQuote, setActiveMarginQuote] = useState<string>('');
  const [activePopoverNotes, setActivePopoverNotes] = useState<MarginNote[]>([]);
  const [hoveredParagraphIdx, setHoveredParagraphIdx] = useState<number | null>(null);

  // Floating text selection toolbar for marginalia
  const [floatingSelection, setFloatingSelection] = useState<{ x: number; y: number; text: string } | null>(null);

  // Bilingual Parallel Reading Mode State
  const isBilingualAvailable = Boolean(
    article.type === 'translated_article' ||
    article.originalContent ||
    (article.parallelSegments && article.parallelSegments.length > 0)
  );
  const [isBilingualMode, setIsBilingualMode] = useState<boolean>(isBilingualAvailable);

  // Footnotes from article (dynamically updated if author adds a footnote)
  const [articleFootnotes, setArticleFootnotes] = useState(article.footnotes || []);
  const [newFootnoteText, setNewFootnoteText] = useState<string>('');
  const [isAddingFootnote, setIsAddingFootnote] = useState<boolean>(false);

  // Increment views on load
  useEffect(() => {
    storageService.incrementArticleViews(article.id);
  }, [article.id]);

  // Fullscreen escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Handle Text Selection for Floating Marginalia
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setFloatingSelection(null);
        return;
      }
      const text = selection.toString().trim();
      if (text.length > 3 && text.length < 500) {
        try {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setFloatingSelection({
            x: rect.left + rect.width / 2,
            y: rect.top + window.scrollY - 10,
            text,
          });
        } catch {
          setFloatingSelection(null);
        }
      } else {
        setFloatingSelection(null);
      }
    };

    document.addEventListener('mouseup', handleSelectionChange);
    return () => document.removeEventListener('mouseup', handleSelectionChange);
  }, []);

  const handleLike = () => {
    const result = storageService.toggleArticleLike(article.id);
    setLikes(result.likes);
    setIsLiked(result.userLiked);
  };

  const handleCopyCitation = () => {
    const citation = `كناني، أيمن. (${new Date(article.publishedAt || Date.now()).getFullYear()}). "${article.title}". الموسوعة الفكرية والأدبية. aymankanani.com`;
    navigator.clipboard.writeText(citation);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 3000);
  };

  const handleCopyAbstract = () => {
    if (!currentAbstractText) return;
    navigator.clipboard.writeText(currentAbstractText);
    setCopiedAbstract(true);
    setTimeout(() => setCopiedAbstract(false), 3000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Scroll to section smoothly
  const scrollToSection = (id: string) => {
    setIsHeaderTocOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Jump to specific footnote in footnotes section
  const jumpToFootnote = (fnId: number) => {
    setHighlightedFootnote(fnId);
    const element = document.getElementById(`footnote-${fnId}`) || document.getElementById(`reference-${fnId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => setHighlightedFootnote(null), 4000);
  };

  // Jump back to citation link in the text
  const jumpBackToCitation = (citationId: number) => {
    const element = document.getElementById(`citation-ref-${citationId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('ring-4', 'ring-amber-300', 'bg-amber-100');
      setTimeout(() => {
        element.classList.remove('ring-4', 'ring-amber-300', 'bg-amber-100');
      }, 2500);
    }
  };

  // Save Footnote from Author
  const handleSaveFootnote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFootnoteText.trim()) return;
    const ok = storageService.addArticleFootnote(article.id, newFootnoteText.trim());
    if (ok) {
      const nextId = articleFootnotes.length > 0 ? Math.max(...articleFootnotes.map(f => f.id)) + 1 : 1;
      setArticleFootnotes(prev => [...prev, { id: nextId, text: newFootnoteText.trim() }]);
      setNewFootnoteText('');
      setIsAddingFootnote(false);
    }
  };

  // Save Reader Note
  const handleSaveReaderNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const saved = storageService.addArticleReaderNote({
      articleId: article.id,
      authorName: newNoteAuthor.trim() || 'قارئ وباحث',
      note: newNoteText.trim(),
      selectedText: newNoteQuote.trim(),
    });

    setReaderNotes(prev => [saved, ...prev]);
    setNewNoteText('');
    setNewNoteQuote('');
    setIsAddingNote(false);
    setNoteSuccessMsg('تم حفظ هامشك وملاحظتك بنجاح!');
    setTimeout(() => setNoteSuccessMsg(''), 4000);
  };

  // Save Margin from Floating Modal
  const handleSaveMarginFromModal = (data: { authorName: string; note: string; selectedText: string; noteType?: any }) => {
    const saved = storageService.addMarginNote({
      targetType: 'article',
      targetId: article.id,
      selectedText: data.selectedText,
      paragraphIndex: activeMarginParagraph,
      note: data.note,
      authorName: data.authorName,
      noteType: data.noteType,
    });
    setReaderNotes(prev => [saved, ...prev]);
    setIsMarginModalOpen(false);
    setNoteSuccessMsg('تم حفظ الهامش الحاشي على الفقرة بنجاح!');
    setTimeout(() => setNoteSuccessMsg(''), 4000);
  };

  const openAddMarginModal = (paragraphIndex?: number, quote?: string) => {
    setActiveMarginParagraph(paragraphIndex);
    setActiveMarginQuote(quote || '');
    setIsMarginModalOpen(true);
  };

  const openMarginPopover = (paragraphIndex: number, quote: string, notes: MarginNote[]) => {
    setActiveMarginParagraph(paragraphIndex);
    setActiveMarginQuote(quote);
    setActivePopoverNotes(notes);
    setIsMarginPopoverOpen(true);
  };

  const handleLikeMargin = (noteId: string) => {
    const result = storageService.toggleLikeMarginNote(noteId);
    setReaderNotes(prev =>
      prev.map(n => (n.id === noteId ? { ...n, likes: result.likes, userLiked: result.liked } : n))
    );
    setActivePopoverNotes(prev =>
      prev.map(n => (n.id === noteId ? { ...n, likes: result.likes, userLiked: result.liked } : n))
    );
  };

  const handleDeleteMargin = (noteId: string) => {
    storageService.deleteMarginNote(noteId);
    setReaderNotes(prev => prev.filter(n => n.id !== noteId));
    setActivePopoverNotes(prev => prev.filter(n => n.id !== noteId));
  };

  // Theme Styles (5 themes)
  const themeStyles = {
    paper: 'bg-[#FDFCF8] text-[#2C2C2C]',
    sepia: 'bg-[#F4EEDD] text-[#3D332A]',
    sage: 'bg-[#EBF3ED] text-[#1E3A2F]',
    night: 'bg-[#18181B] text-[#E4E4E7]',
    pristine: 'bg-[#FFFFFF] text-[#1F2937]',
  };

  // Font Styles
  const fontClassNames = {
    amiri: 'font-amiri leading-[2.2]',
    cairo: 'font-cairo leading-[2.0]',
    traditional: 'font-serif leading-[2.3]',
  };

  // Helper to parse footnote references `[^1]` or `[1]` in markdown text with full HTML support
  const renderTextWithCitations = (text: string) => {
    const parts = text.split(/(\[\^[0-9]+\]|\[[0-9]+\])/g);
    return parts.map((part, idx) => {
      const match = part.match(/\[\^?([0-9]+)\]/);
      if (match) {
        const citationId = parseInt(match[1], 10);
        return (
          <sup key={idx} className="mx-1 select-none">
            <button
              type="button"
              id={`citation-ref-${citationId}`}
              onClick={() => jumpToFootnote(citationId)}
              className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1 text-[11px] font-mono font-bold text-[#4A5D4E] bg-white border border-[#4A5D4E]/30 rounded-md hover:bg-[#4A5D4E] hover:text-white transition-all cursor-pointer shadow-2xs"
              title={`انتقال للهامش رقم [${citationId}]`}
            >
              [{citationId}]
            </button>
          </sup>
        );
      }
      // If part contains HTML tags (such as font colors, highlight strips, bold, links, marks)
      if (/<[a-z][\s\S]*>/i.test(part)) {
        return <span key={idx} dangerouslySetInnerHTML={{ __html: part }} />;
      }
      return part;
    });
  };

  let headingCounter = 0;

  return (
    <article
      className={`min-h-screen transition-colors duration-300 font-cairo pb-20 ${themeStyles[theme]} ${
        isFullscreen ? 'fixed inset-0 z-50 overflow-y-auto' : ''
      }`}
    >
      {/* ------------------------------------------------------------- */}
      {/* TOP FLOATING / STICKY ACTION BAR & READING COMFORT TOOLBAR */}
      {/* ------------------------------------------------------------- */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-inherit/95 border-b border-black/10 px-3 sm:px-6 py-2.5 shadow-2xs">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
          {/* Back Button */}
          <button
            type="button"
            id="article-back-btn"
            onClick={isFullscreen ? () => setIsFullscreen(false) : onBack}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold opacity-80 hover:opacity-100 px-3 py-1.5 rounded-xl border border-current/20 hover:bg-black/5 transition-all cursor-pointer shrink-0"
          >
            <ArrowRight className="w-4 h-4" />
            <span>{isFullscreen ? 'الخروج من ملء الشاشة' : 'العودة للمحرك'}</span>
          </button>

          {/* Center Title in Fullscreen */}
          {isFullscreen && (
            <span className="hidden md:inline font-amiri font-bold text-sm truncate max-w-sm opacity-90">
              {article.title}
            </span>
          )}

          {/* Reading Controls Group */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {/* TOC Quick Jump Button */}
            {tableOfContents.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  id="header-toc-btn"
                  onClick={() => setIsHeaderTocOpen(prev => !prev)}
                  className="px-2.5 py-1.5 rounded-xl border border-current/20 hover:bg-black/5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  title="فهرس المحاور والانتقال السريع"
                >
                  <ListTree className="w-3.5 h-3.5 text-[#4A5D4E]" />
                  <span className="hidden sm:inline">الفهرس ({tableOfContents.length})</span>
                </button>

                {/* Dropdown TOC */}
                {isHeaderTocOpen && (
                  <div className="absolute left-0 mt-2 w-72 sm:w-80 rounded-2xl shadow-xl border border-stone-200 bg-white text-stone-900 p-3 z-50 animate-fadeIn">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-200">
                      <span className="text-xs font-bold font-amiri text-[#4A5D4E] flex items-center gap-1.5">
                        <ListTree className="w-3.5 h-3.5" />
                        فهرس محاور المقال
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsHeaderTocOpen(false)}
                        className="text-xs text-stone-400 hover:text-stone-600 cursor-pointer"
                      >
                        إغلاق ✕
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-1 text-xs">
                      {tableOfContents.map((h, i) => (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => scrollToSection(h.id)}
                          className={`w-full text-right p-1.5 rounded-lg hover:bg-stone-100 transition-colors flex items-center gap-2 cursor-pointer ${
                            h.level === 3 ? 'pr-4 text-stone-600' : 'font-semibold text-stone-800'
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full bg-[#4A5D4E]/10 text-[#4A5D4E] text-[10px] font-mono flex items-center justify-center shrink-0">
                            {i + 1}
                          </span>
                          <span className="truncate">{h.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bilingual Parallel Reading Toggle */}
            {isBilingualAvailable && (
              <button
                type="button"
                id="toggle-bilingual-mode-btn"
                onClick={() => setIsBilingualMode(prev => !prev)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isBilingualMode
                    ? 'bg-[#4A5D4E] text-white border-[#4A5D4E] shadow-2xs'
                    : 'border-current/20 hover:bg-black/5 text-inherit'
                }`}
                title="تبديل وضع القراءة المزدوجة المتزامنة (النص الأصلي والمترجم معاً)"
              >
                <Languages className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {isBilingualMode ? 'المتن الفردي' : 'القراءة المزدوجة'}
                </span>
              </button>
            )}

            {/* 1. Font Selector (تغيير الخطوط: أميري | كايرو | نسخ أدبي) */}
            <div className="flex items-center border border-current/20 rounded-xl overflow-hidden text-xs p-0.5">
              <button
                type="button"
                onClick={() => setCurrentFont('amiri')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  currentFont === 'amiri' ? 'bg-[#4A5D4E] text-white' : 'hover:bg-black/5'
                }`}
                title="الخط الأميري الأكاديمي"
              >
                أميري
              </button>
              <button
                type="button"
                onClick={() => setCurrentFont('cairo')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  currentFont === 'cairo' ? 'bg-[#4A5D4E] text-white' : 'hover:bg-black/5'
                }`}
                title="خط كايرو الرقمي"
              >
                كايرو
              </button>
              <button
                type="button"
                onClick={() => setCurrentFont('traditional')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  currentFont === 'traditional' ? 'bg-[#4A5D4E] text-white' : 'hover:bg-black/5'
                }`}
                title="خط النسخ التراثي"
              >
                نسخ
              </button>
            </div>

            {/* 2. Font Size Adjusters (A- / A+) */}
            <div className="flex items-center border border-current/20 rounded-xl overflow-hidden text-xs">
              <button
                type="button"
                id="font-decrease-btn"
                onClick={() => setFontSize(prev => Math.max(15, prev - 2))}
                className="px-2 py-1 hover:bg-black/5 font-bold cursor-pointer"
                title="تصغير الخط"
              >
                A-
              </button>
              <span className="px-1.5 py-1 font-mono text-[11px] opacity-70 border-x border-current/20">
                {fontSize}
              </span>
              <button
                type="button"
                id="font-increase-btn"
                onClick={() => setFontSize(prev => Math.min(28, prev + 2))}
                className="px-2 py-1 hover:bg-black/5 font-bold cursor-pointer"
                title="تكبير الخط"
              >
                A+
              </button>
            </div>

            {/* 3. Theme Picker (تغيير لون خلفية المقالة) */}
            <div className="flex items-center gap-1 border border-current/20 rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => setTheme('paper')}
                className={`w-5 h-5 rounded-lg text-[9px] font-bold ${
                  theme === 'paper' ? 'ring-2 ring-[#4A5D4E]' : ''
                } bg-[#FDFCF8] text-[#2C2C2C] border border-black/20`}
                title="فاتح ورقي عاجي"
              >
                ورق
              </button>
              <button
                type="button"
                onClick={() => setTheme('sepia')}
                className={`w-5 h-5 rounded-lg text-[9px] font-bold ${
                  theme === 'sepia' ? 'ring-2 ring-[#C88A3B]' : ''
                } bg-[#F4EEDD] text-[#3D332A] border border-black/20`}
                title="بردي دافئ"
              >
                برد
              </button>
              <button
                type="button"
                onClick={() => setTheme('sage')}
                className={`w-5 h-5 rounded-lg text-[9px] font-bold ${
                  theme === 'sage' ? 'ring-2 ring-[#4A5D4E]' : ''
                } bg-[#EBF3ED] text-[#1E3A2F] border border-black/20`}
                title="أخضر مريح للعين"
              >
                عين
              </button>
              <button
                type="button"
                onClick={() => setTheme('night')}
                className={`w-5 h-5 rounded-lg text-[9px] font-bold ${
                  theme === 'night' ? 'ring-2 ring-white' : ''
                } bg-[#18181B] text-[#E4E4E7] border border-white/20`}
                title="ليلي داكن مريح"
              >
                ليل
              </button>
            </div>

            {/* 4. Floating Margin Notes Drawer Toggle (قراءة الهوامش العائمة) */}
            <button
              type="button"
              id="toggle-floating-margins-btn"
              onClick={() => setIsFloatingMarginDrawerOpen(prev => !prev)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isFloatingMarginDrawerOpen
                  ? 'bg-[#4A5D4E] text-white border-[#4A5D4E] shadow-2xs'
                  : 'border-current/20 hover:bg-black/5 text-inherit'
              }`}
              title="عرض وقراءة الهوامش العائمة والإحالات في لوحة جانبية"
            >
              <PanelRightOpen className="w-3.5 h-3.5" />
              <span className="hidden md:inline">
                الهوامش العائمة ({articleFootnotes.length + readerNotes.length})
              </span>
            </button>

            {/* 5. Fullscreen Toggle (تكبير حجم المقالة بكامل الصفحة) */}
            <button
              type="button"
              id="article-fullscreen-btn"
              onClick={() => setIsFullscreen(prev => !prev)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-current/20 hover:bg-black/5 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              title={isFullscreen ? 'الخروج من ملء الشاشة (Esc)' : 'قراءة بملء الشاشة وتكبير المقالة'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isFullscreen ? 'تصغير' : 'ملء الشاشة'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* FLOATING MARGIN NOTES SLIDE-OVER DRAWER (قراءة الهوامش العائمة) */}
      {/* ------------------------------------------------------------- */}
      {isFloatingMarginDrawerOpen && (
        <aside
          id="floating-margins-drawer"
          className="fixed left-4 top-16 bottom-6 w-80 sm:w-96 bg-white/95 text-stone-900 border border-[#E5E2D9] rounded-3xl shadow-2xl z-40 backdrop-blur-md p-4 flex flex-col font-cairo animate-fadeIn"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E2D9]">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-[#4A5D4E]/10 text-[#4A5D4E] flex items-center justify-center font-bold">
                📌
              </span>
              <div>
                <h4 className="font-bold text-sm text-stone-900">الهوامش العائمة والإحالات</h4>
                <p className="text-[10px] text-stone-500">
                  {articleFootnotes.length} هامش أكاديمي • {readerNotes.length} ملاحظة قارئ
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsFloatingMarginDrawerOpen(false)}
              className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 cursor-pointer"
              title="إغلاق اللوحة العائمة"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 text-xs">
            {/* Academic Footnotes */}
            {articleFootnotes.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#4A5D4E] flex items-center gap-1">
                  <Quote className="w-3 h-3" />
                  <span>الهوامش التوثيقية للمؤلف:</span>
                </span>
                {articleFootnotes.map(fn => (
                  <div
                    key={fn.id}
                    onClick={() => jumpToFootnote(fn.id)}
                    className="p-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F2EFE8] border border-[#E5E2D9] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-mono font-bold text-[#4A5D4E] bg-white px-1.5 py-0.5 rounded-md border border-current/20 text-[10px]">
                        [{fn.id}]
                      </span>
                      <span className="text-[10px] text-stone-400 group-hover:text-[#4A5D4E] flex items-center gap-0.5">
                        <span>انتقال للموضع</span>
                        <CornerUpRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                    <p className="leading-relaxed text-stone-700">{fn.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Reader Notes */}
            <div className="space-y-2 pt-2 border-t border-[#E5E2D9]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-700 flex items-center gap-1">
                  <PenLine className="w-3 h-3 text-[#4A5D4E]" />
                  <span>ملاحظات وهوامش القراء:</span>
                </span>
                <button
                  type="button"
                  onClick={() => openAddMarginModal()}
                  className="text-[10px] font-bold text-[#4A5D4E] hover:underline cursor-pointer"
                >
                  + إضافة
                </button>
              </div>

              {readerNotes.length === 0 ? (
                <p className="text-[11px] text-stone-400 py-3 text-center">
                  لا توجد هوامش قراء بعد. يمكنك إضافة أول هامش!
                </p>
              ) : (
                readerNotes.map(n => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-xl bg-white border border-[#E5E2D9] space-y-1.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-stone-800">{n.authorName}</span>
                      <button
                        type="button"
                        onClick={() => handleLikeMargin(n.id)}
                        className={`flex items-center gap-0.5 text-[10px] ${
                          n.userLiked ? 'text-rose-600' : 'text-stone-400 hover:text-stone-700'
                        }`}
                      >
                        <Heart className="w-2.5 h-2.5 fill-current" />
                        <span>{n.likes || 0}</span>
                      </button>
                    </div>
                    {n.selectedText && (
                      <p className="text-[10px] text-stone-500 italic bg-[#FAF8F5] p-1 rounded-md border-r-2 border-[#4A5D4E]">
                        «{n.selectedText}»
                      </p>
                    )}
                    <p className="leading-relaxed text-stone-700">{n.note}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-[#E5E2D9]">
            <button
              type="button"
              onClick={() => openAddMarginModal()}
              className="w-full py-2 rounded-xl bg-[#4A5D4E] hover:bg-[#3C4C3F] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة هامش أو ملاحظة على المقال</span>
            </button>
          </div>
        </aside>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MAIN ARTICLE BODY (القارئ المريح) */}
      {/* ------------------------------------------------------------- */}
      <div className={`mx-auto px-4 sm:px-6 pt-8 sm:pt-12 transition-all ${isFullscreen ? 'max-w-4xl' : 'max-w-3xl'}`}>
        {/* Type Badge & Category */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {article.type === 'study' && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#4A5D4E]/10 text-[#4A5D4E] border border-[#4A5D4E]/25 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>دراسة بحثية محكمة</span>
            </span>
          )}
          {article.type === 'translated_article' && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#245037]/10 text-[#245037] border border-[#245037]/25 flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5" />
              <span>ترجمة نقدية مقارنة</span>
            </span>
          )}
          {article.type === 'article' && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-200/60 text-stone-800 border border-stone-300 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>مقال فكري وتحليلي</span>
            </span>
          )}

          {article.category && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-current/5 border border-current/15 opacity-80">
              {article.category}
            </span>
          )}

          {article.readingTimeMinutes && (
            <span className="px-3 py-1 rounded-full text-xs opacity-70 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{article.readingTimeMinutes} دقيقة قراءة</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="font-amiri font-bold text-3xl sm:text-5xl leading-tight sm:leading-snug mb-3">
          {article.title}
        </h1>

        {/* Subtitle / Original Title */}
        {article.subtitle && (
          <p className="font-amiri text-lg sm:text-xl opacity-80 mb-4 leading-relaxed">
            {article.subtitle}
          </p>
        )}

        {article.originalTitle && (
          <p className="text-xs sm:text-sm font-sans opacity-70 italic mb-4 dir-ltr text-right">
            Original: {article.originalTitle}
          </p>
        )}

        {/* Author Info & Date */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-3 my-4 border-y border-current/15 text-xs opacity-80">
          <div className="flex items-center gap-2">
            <span className="font-bold">{article.author || 'أيمن كناني'}</span>
            <span>•</span>
            <span>{article.publishedAt}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span>{article.views || 0} قراءة</span>
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" />
              <span>{likes} إعجاب</span>
            </span>
          </div>
        </div>

        {/* Multilingual Abstract Box */}
        {currentAbstractText && (
          <div className="my-8 p-5 sm:p-6 rounded-2xl border border-current/20 bg-current/5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-current/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#4A5D4E]" />
                <h3 className="font-amiri font-bold text-base">
                  المستخلص الأكاديمي (Abstract)
                </h3>
              </div>

              {/* Language switcher tabs */}
              {availableLangs.length > 1 && (
                <div className="flex items-center gap-1">
                  {availableLangs.map(l => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => setActiveLang(l.code)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        activeLang === l.code
                          ? 'bg-[#4A5D4E] text-white'
                          : 'hover:bg-black/5 opacity-70'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <p
              className={`text-sm sm:text-base leading-relaxed opacity-90 ${
                activeLang === 'en' || activeLang === 'fr' ? 'font-sans dir-ltr text-left' : 'font-cairo'
              }`}
            >
              {currentAbstractText}
            </p>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleCopyAbstract}
                className="text-xs font-semibold opacity-70 hover:opacity-100 flex items-center gap-1 cursor-pointer"
              >
                {copiedAbstract ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedAbstract ? 'تم نسخ المستخلص' : 'نسخ المستخلص'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* BILINGUAL OR SINGLE TEXT VIEW */}
        {/* ------------------------------------------------------------- */}
        {isBilingualMode && isBilingualAvailable ? (
          <BilingualReaderView
            article={article}
            fontSize={fontSize}
            theme={theme === 'night' || theme === 'pristine' ? 'paper' : theme}
            marginNotes={readerNotes}
            onOpenAddMarginModal={(pIdx, text) => openAddMarginModal(pIdx, text)}
            onOpenMarginPopover={(pIdx, text, notes) => openMarginPopover(pIdx, text, notes)}
          />
        ) : (
          /* Single Article Body with Marginalia paragraph markers */
          <section
            className={`space-y-6 pt-4 text-justify ${fontClassNames[currentFont]}`}
            style={{ fontSize: `${fontSize}px` }}
          >
            {article.content.split('\n\n').map((para, idx) => {
              const trimmed = para.trim();
              if (!trimmed) return null;

              // Check for Headings
              if (trimmed.startsWith('# ')) {
                return (
                  <h1 key={idx} className="font-amiri font-bold text-2xl sm:text-3xl pt-6 pb-2 border-b border-current/15">
                    {trimmed.replace('# ', '')}
                  </h1>
                );
              }
              if (trimmed.startsWith('## ')) {
                const headingId = `heading-${headingCounter++}`;
                return (
                  <h2
                    key={idx}
                    id={headingId}
                    className="font-amiri font-bold text-xl sm:text-2xl pt-6 pb-1 text-[#4A5D4E] flex items-center gap-2"
                  >
                    <span>{trimmed.replace('## ', '')}</span>
                  </h2>
                );
              }
              if (trimmed.startsWith('### ')) {
                const headingId = `heading-${headingCounter++}`;
                return (
                  <h3
                    key={idx}
                    id={headingId}
                    className="font-amiri font-bold text-lg sm:text-xl pt-4 pb-1 opacity-90"
                  >
                    {trimmed.replace('### ', '')}
                  </h3>
                );
              }

              // Quotes
              if (trimmed.startsWith('> ')) {
                return (
                  <blockquote
                    key={idx}
                    className="p-4 sm:p-5 my-4 border-r-4 border-[#4A5D4E] bg-current/5 rounded-l-2xl italic font-amiri text-lg leading-loose"
                  >
                    {renderTextWithCitations(trimmed.replace('> ', ''))}
                  </blockquote>
                );
              }

              // Divider
              if (trimmed === '---' || trimmed === '***') {
                return <hr key={idx} className="my-8 border-current/20" />;
              }

              // Custom HTML blocks (such as Commentary Study Cards, Blockquotes, HRs)
              if (trimmed.startsWith('<div') || trimmed.startsWith('<blockquote') || trimmed.startsWith('<hr')) {
                return (
                  <div
                    key={idx}
                    className="my-5"
                    dangerouslySetInnerHTML={{ __html: trimmed }}
                  />
                );
              }

              // Paragraph with Marginalia markers
              const paraNotes = readerNotes.filter(n => n.paragraphIndex === idx);
              const isHovered = hoveredParagraphIdx === idx;
              const cleanContent = trimmed.replace(/^<p[^>]*>/i, '').replace(/<\/p>$/i, '');

              return (
                <div
                  key={idx}
                  id={`paragraph-${idx}`}
                  onMouseEnter={() => setHoveredParagraphIdx(idx)}
                  onMouseLeave={() => setHoveredParagraphIdx(null)}
                  className="relative group transition-colors py-1 rounded-xl px-2 -mx-2 hover:bg-black/[0.02]"
                >
                  {/* Floating Action Buttons for Paragraph Marginalia */}
                  <div
                    className={`absolute left-0 top-1 transition-opacity duration-200 flex items-center gap-1 ${
                      isHovered || paraNotes.length > 0 ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {paraNotes.length > 0 && (
                      <button
                        type="button"
                        onClick={() => openMarginPopover(idx, cleanContent, paraNotes)}
                        className="px-2 py-1 rounded-lg bg-[#4A5D4E] hover:bg-[#3D4E41] text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer transition-transform hover:scale-105"
                        title="عرض هوامش وملاحظات القراء على هذه الفقرة"
                      >
                        <span>📌</span>
                        <span>هوامش ({paraNotes.length})</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openAddMarginModal(idx, cleanContent)}
                      className="px-2 py-1 rounded-lg bg-white/95 hover:bg-white text-stone-700 hover:text-[#4A5D4E] text-xs font-semibold flex items-center gap-1 border border-stone-300 shadow-xs cursor-pointer transition-transform hover:scale-105"
                      title="إضافة هامش أو تعقيب على هذه الفقرة"
                    >
                      <PenLine className="w-3 h-3 text-[#4A5D4E]" />
                      <span className="hidden sm:inline">إضافة هامش</span>
                    </button>
                  </div>

                  <p className="leading-loose indent-6">
                    {renderTextWithCitations(cleanContent)}
                  </p>
                </div>
              );
            })}
          </section>
        )}

        {/* ------------------------------------------------------------- */}
        {/* NUMBERED FOOTNOTES SECTION (الهوامش والإحالات) */}
        {/* ------------------------------------------------------------- */}
        {articleFootnotes && articleFootnotes.length > 0 && (
          <section
            id="footnotes-section"
            className="mt-12 p-5 sm:p-7 rounded-3xl border border-[#E5E2D9] bg-white text-stone-900 text-xs space-y-3 shadow-2xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E2D9]">
              <h4 className="font-amiri font-bold text-base text-stone-900 flex items-center gap-2">
                <Quote className="w-4 h-4 text-[#4A5D4E]" />
                <span>الهوامش والإحالات التوثيقية ({articleFootnotes.length}):</span>
              </h4>

              <button
                type="button"
                onClick={() => setIsAddingFootnote(prev => !prev)}
                className="text-[11px] font-bold text-[#4A5D4E] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>إضافة هامش توضيحي</span>
              </button>
            </div>

            {/* Form to add an author/researcher footnote */}
            {isAddingFootnote && (
              <form onSubmit={handleSaveFootnote} className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5E2D9] space-y-2">
                <label className="block text-xs font-bold text-stone-700">نص الهامش أو الإحالة الجديدة:</label>
                <textarea
                  rows={2}
                  value={newFootnoteText}
                  onChange={e => setNewFootnoteText(e.target.value)}
                  placeholder="اكتب التوضيح أو المرجع الإضافي..."
                  className="w-full p-2 text-xs rounded-lg border border-stone-300 bg-white text-stone-900 font-cairo outline-hidden"
                  required
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingFootnote(false)}
                    className="px-2.5 py-1 rounded-lg text-xs text-stone-500 hover:bg-stone-200 cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded-lg bg-[#4A5D4E] text-white text-xs font-bold cursor-pointer"
                  >
                    حفظ الهامش
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2.5 pt-1">
              {articleFootnotes.map(fn => {
                const isHighlight = highlightedFootnote === fn.id;
                return (
                  <div
                    key={fn.id}
                    id={`footnote-${fn.id}`}
                    className={`p-3 rounded-2xl transition-all flex items-start justify-between gap-3 ${
                      isHighlight
                        ? 'bg-[#4A5D4E]/15 border border-[#4A5D4E] ring-2 ring-[#4A5D4E]/30'
                        : 'bg-[#FAF8F5] border border-[#E5E2D9]/60'
                    }`}
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <span className="font-mono font-bold text-[#4A5D4E] bg-white px-2 py-0.5 rounded-md border border-current/20 text-xs shrink-0">
                        [{fn.id}]
                      </span>
                      <p className="opacity-90 leading-relaxed font-cairo text-stone-800">
                        {fn.text}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => jumpBackToCitation(fn.id)}
                      className="text-[11px] font-bold text-[#4A5D4E] hover:underline flex items-center gap-1 shrink-0 p-1.5 rounded-md hover:bg-black/5 cursor-pointer"
                      title="العودة لموضع الهامش في متن النص"
                    >
                      <span>العودة للنص</span>
                      <CornerUpRight className="w-3.5 h-3.5 rotate-180" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------- */}
        {/* USER SPECIFICATION: ردود على المقالات (Article Replies & Discussions) */}
        {/* ------------------------------------------------------------- */}
        <ArticleReplies
          articleId={article.id}
          articleTitle={article.title}
        />

        {/* ------------------------------------------------------------- */}
        {/* USER SPECIFICATION: خريطة مقالات ربط بين مقالات (Knowledge Map) */}
        {/* ------------------------------------------------------------- */}
        <ArticleKnowledgeMap
          currentArticle={article}
          allArticles={allArticles}
          onSelectArticle={onSelectArticle}
        />

        {/* Floating Quick Marginalia Button for Selected Text */}
        {floatingSelection && (
          <div
            style={{
              position: 'absolute',
              left: `${floatingSelection.x}px`,
              top: `${floatingSelection.y}px`,
              transform: 'translate(-50%, -100%)',
            }}
            className="z-50 animate-fadeIn"
          >
            <button
              type="button"
              onClick={() => openAddMarginModal(undefined, floatingSelection.text)}
              className="px-4 py-2 rounded-full bg-[#4A5D4E] hover:bg-[#38493C] text-white text-xs font-bold shadow-xl flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer ring-2 ring-white"
            >
              <PenLine className="w-3.5 h-3.5 text-emerald-300" />
              <span>إضافة هامش وملاحظة على النص المحدد</span>
            </button>
          </div>
        )}
      </div>

      {/* Add Margin Note Modal */}
      <AddMarginNoteModal
        isOpen={isMarginModalOpen}
        onClose={() => setIsMarginModalOpen(false)}
        onSave={handleSaveMarginFromModal}
        targetType="article"
        targetId={article.id}
        paragraphIndex={activeMarginParagraph}
        selectedText={activeMarginQuote}
      />

      {/* View Margin Notes Popover Modal */}
      <MarginNotesPopover
        isOpen={isMarginPopoverOpen}
        onClose={() => setIsMarginPopoverOpen(false)}
        paragraphIndex={activeMarginParagraph}
        quoteText={activeMarginQuote}
        notes={activePopoverNotes}
        onLikeNote={handleLikeMargin}
        onDeleteNote={handleDeleteMargin}
        onAddAnotherNote={() => {
          setIsMarginPopoverOpen(false);
          setIsMarginModalOpen(true);
        }}
      />
    </article>
  );
};
