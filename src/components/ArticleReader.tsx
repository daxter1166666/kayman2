import React, { useState, useEffect, useMemo } from 'react';
import { IntellectualItem, ArticleReaderNote } from '../types';
import { storageService } from '../services/storageService';
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
  BookmarkCheck
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
  const [fontSize, setFontSize] = useState<number>(19);
  const [theme, setTheme] = useState<'paper' | 'sepia' | 'sage'>('paper');

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
  const [readerNotes, setReaderNotes] = useState<ArticleReaderNote[]>(() =>
    storageService.getArticleReaderNotes(article.id)
  );
  const [newNoteAuthor, setNewNoteAuthor] = useState<string>('');
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [newNoteQuote, setNewNoteQuote] = useState<string>('');
  const [isAddingNote, setIsAddingNote] = useState<boolean>(false);
  const [noteSuccessMsg, setNoteSuccessMsg] = useState<string>('');

  // Footnotes from article (dynamically updated if author adds a footnote)
  const [articleFootnotes, setArticleFootnotes] = useState(article.footnotes || []);
  const [newFootnoteText, setNewFootnoteText] = useState<string>('');
  const [isAddingFootnote, setIsAddingFootnote] = useState<boolean>(false);

  // Increment views on load
  useEffect(() => {
    storageService.incrementArticleViews(article.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [article.id]);

  const handleLike = () => {
    const res = storageService.toggleArticleLike(article.id);
    setLikes(res.likes);
    setIsLiked(res.userLiked);
  };

  const handleCopyCitation = () => {
    let citation = '';
    const year = article.publishedAt ? new Date(article.publishedAt).getFullYear() : '2026';
    if (article.type === 'translated_article') {
      citation = `${article.originalAuthor || article.author} (${article.originalYear || year}). ${article.title}. ترجمة: ${article.translator || 'أيمن كناني'}. المنصة الفكرية لأيمن كناني.`;
    } else if (article.type === 'study') {
      citation = `${article.author} (${year}). ${article.title}. دراسة بحثية محكمة. المنصة الفكرية لأيمن كناني. DOI: ${article.doi || '10.1000/aymankinani.study'}`;
    } else {
      citation = `${article.author} (${year}). ${article.title}. مقال فكري. المنصة الرسمية لأيمن كناني.`;
    }

    navigator.clipboard.writeText(citation);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2500);
  };

  const handleCopyAbstract = () => {
    if (!currentAbstractText) return;
    navigator.clipboard.writeText(currentAbstractText);
    setCopiedAbstract(true);
    setTimeout(() => setCopiedAbstract(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  // Jump to section in content
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsHeaderTocOpen(false);
    }
  };

  // Jump to specific footnote or reference from small citation number
  const jumpToFootnote = (num: number) => {
    setHighlightedFootnote(num);
    const target = document.getElementById(`footnote-${num}`) || document.getElementById(`reference-${num}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => {
      setHighlightedFootnote(null);
    }, 3500);
  };

  // Jump back from footnote to original position in the text
  const jumpBackToCitation = (num: number) => {
    const marker = document.getElementById(`citation-marker-${num}`);
    if (marker) {
      marker.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Handle adding reader note
  const handleSaveReaderNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const saved = storageService.addArticleReaderNote({
      articleId: article.id,
      note: newNoteText.trim(),
      authorName: newNoteAuthor.trim() || 'قارئ وباحث مهتم',
      selectedText: newNoteQuote.trim() || undefined,
    });

    setReaderNotes(prev => [saved, ...prev]);
    setNewNoteText('');
    setNewNoteQuote('');
    setIsAddingNote(false);
    setNoteSuccessMsg('تم حفظ الملاحظة بنجاح!');
    setTimeout(() => setNoteSuccessMsg(''), 3000);
  };

  // Handle deleting reader note
  const handleDeleteReaderNote = (id: string) => {
    storageService.deleteArticleReaderNote(id);
    setReaderNotes(prev => prev.filter(n => n.id !== id));
  };

  // Handle adding academic footnote
  const handleSaveFootnote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFootnoteText.trim()) return;

    storageService.addArticleFootnote(article.id, newFootnoteText.trim());
    const updated = storageService.getArticleById(article.id);
    if (updated?.footnotes) {
      setArticleFootnotes(updated.footnotes);
    }
    setNewFootnoteText('');
    setIsAddingFootnote(false);
  };

  // Helper to parse citations `[n]` inside text and render small clickable superscript references
  const renderTextWithCitations = (text: string) => {
    const parts = text.split(/(\[\d+\])/g);
    return parts.map((part, pIdx) => {
      const match = part.match(/^\[(\d+)\]$/);
      if (match) {
        const num = parseInt(match[1], 10);
        return (
          <button
            key={`cite-${pIdx}`}
            id={`citation-marker-${num}`}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              jumpToFootnote(num);
            }}
            className="inline-flex items-center justify-center font-mono font-bold text-xs text-[#4A5D4E] hover:text-white hover:bg-[#4A5D4E] bg-[#4A5D4E]/10 px-1.5 py-0.5 rounded-md align-super mx-0.5 transition-all cursor-pointer border border-[#4A5D4E]/25 shadow-2xs group"
            title={`انتقال إلى المرجع/الهامش رقم [${num}]`}
          >
            <span>[{num}]</span>
          </button>
        );
      }
      return part;
    });
  };

  // Theme Styles (Always light, warm literary tones, no black)
  const themeStyles = {
    paper: 'bg-[#FDFCF8] text-[#2C2C2C]',
    sepia: 'bg-[#F4EEDD] text-[#3D332A]',
    sage: 'bg-[#F2F5F3] text-[#243328]',
  };

  // Related articles in same category
  const relatedArticles = allArticles
    .filter(a => a.id !== article.id && (a.category === article.category || a.type === article.type))
    .slice(0, 3);

  let headingCounter = 0;

  return (
    <article className={`min-h-screen transition-colors duration-300 font-cairo pb-20 ${themeStyles[theme]}`}>
      {/* Top Floating Action Bar */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-inherit/90 border-b border-black/10 px-4 sm:px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            id="article-back-btn"
            onClick={onBack}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold opacity-80 hover:opacity-100 px-3 py-1.5 rounded-xl border border-current/20 hover:bg-black/5 transition-all cursor-pointer shrink-0"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للمحرك</span>
          </button>

          {/* Quick Header Navigation: Table of Contents button & Reading Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
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

            {/* Font Size Adjusters */}
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
              <span className="px-2 py-1 font-mono text-[11px] opacity-70 border-x border-current/20">{fontSize}</span>
              <button
                type="button"
                id="font-increase-btn"
                onClick={() => setFontSize(prev => Math.min(26, prev + 2))}
                className="px-2 py-1 hover:bg-black/5 font-bold cursor-pointer"
                title="تكبير الخط"
              >
                A+
              </button>
            </div>

            {/* Theme Picker */}
            <div className="hidden sm:flex items-center gap-1 border border-current/20 rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => setTheme('paper')}
                className={`w-6 h-6 rounded-lg text-[10px] font-bold ${theme === 'paper' ? 'ring-2 ring-[#4A5D4E]' : ''} bg-[#FDFCF8] text-[#2C2C2C] border border-black/20`}
                title="فاتح ورقي"
              >
                و
              </button>
              <button
                type="button"
                onClick={() => setTheme('sepia')}
                className={`w-6 h-6 rounded-lg text-[10px] font-bold ${theme === 'sepia' ? 'ring-2 ring-[#C88A3B]' : ''} bg-[#F4EEDD] text-[#3D332A] border border-black/20`}
                title="بيج دافئ"
              >
                د
              </button>
              <button
                type="button"
                onClick={() => setTheme('sage')}
                className={`w-6 h-6 rounded-lg text-[10px] font-bold ${theme === 'sage' ? 'ring-2 ring-[#4A5D4E]' : ''} bg-[#F2F5F3] text-[#243328] border border-black/20`}
                title="زيتوني هادئ"
              >
                ز
              </button>
            </div>

            {/* Print button */}
            <button
              type="button"
              id="article-print-btn"
              onClick={handlePrint}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-current/20 hover:bg-black/5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              title="طباعة المقال / حفظ كـ PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">طباعة</span>
            </button>

            {/* Copy Citation */}
            <button
              type="button"
              id="article-cite-btn"
              onClick={handleCopyCitation}
              className="px-2.5 py-1.5 rounded-xl border border-current/20 hover:bg-black/5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              title="نسخ التوثيق العلمي والمصدري (Citation)"
            >
              {copiedCitation ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Quote className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedCitation ? 'تم النسخ!' : 'توثيق واقتباس'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        {/* Type Badge & Category */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {article.type === 'study' && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#4A5D4E]/10 text-[#4A5D4E] dark:bg-emerald-950/40 dark:text-emerald-300 border border-[#4A5D4E]/25 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>دراسة بحثية محكمة</span>
            </span>
          )}
          {article.type === 'translated_article' && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#6B5268]/10 text-[#5B4258] dark:bg-purple-950/40 dark:text-purple-300 border border-[#6B5268]/25 flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5" />
              <span>مقال / دراسة مترجمة ومحققة</span>
            </span>
          )}
          {article.type === 'article' && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#8A6D3B]/10 text-[#6E5528] border border-[#8A6D3B]/25 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>مقالة فكرية وفلسفية</span>
            </span>
          )}

          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black/5 border border-current/10">
            {article.category}
          </span>

          {article.deweyDecimal && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono opacity-70 bg-black/5">
              ديوي: {article.deweyDecimal}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="font-amiri font-bold text-2xl sm:text-4xl lg:text-5xl leading-tight mb-4">
          {article.title}
        </h1>

        {/* Subtitle */}
        {article.subtitle && (
          <p className="text-base sm:text-lg opacity-80 mb-6 font-medium leading-relaxed">
            {article.subtitle}
          </p>
        )}

        {/* Author / Translator Metadata Box */}
        <div className="p-4 sm:p-5 rounded-2xl border border-current/15 bg-black/[0.02] mb-8 space-y-3 text-xs sm:text-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-current/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#4A5D4E] text-white flex items-center justify-center font-amiri font-bold text-lg shrink-0">
                {article.author.slice(0, 1)}
              </div>
              <div>
                <p className="font-bold">
                  {article.type === 'translated_article' ? `المؤلف الأصلي: ${article.originalAuthor || article.author}` : `بقلم: ${article.author}`}
                </p>
                {article.type === 'translated_article' && (
                  <p className="text-xs text-[#4A5D4E] font-semibold">
                    ترجمة وتحقيق: <strong>{article.translator || 'أيمن كناني'}</strong>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs opacity-75">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{article.readingTimeMinutes} دقيقة قراءة</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span>{article.views} قراءة</span>
              </span>
              <span>{article.publishedAt}</span>
            </div>
          </div>

          {/* Translation Details Callout if Translated */}
          {article.type === 'translated_article' && (
            <div className="text-xs opacity-85 leading-relaxed bg-[#6B5268]/10 p-3 rounded-xl border border-[#6B5268]/20 space-y-1">
              <div className="font-bold text-[#5B4258] flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5" />
                <span>بيانات المصنف الأصلي والترجمة:</span>
              </div>
              {article.originalLanguage && (
                <p>• اللغة الأصلية: <strong>{article.originalLanguage}</strong></p>
              )}
              {article.originalSource && (
                <p>• المصدر وجهة النشر الأصلية: <em>{article.originalSource}</em></p>
              )}
              {article.originalYear && (
                <p>• سنة الإصدار الأصلي: {article.originalYear}م</p>
              )}
            </div>
          )}

          {/* DOI if Study */}
          {article.type === 'study' && article.doi && (
            <div className="text-xs font-mono opacity-80 flex items-center gap-2">
              <span className="font-bold">معرف الكائن الرقمي (DOI):</span>
              <span className="underline">{article.doi}</span>
            </div>
          )}
        </div>

        {/* 1. Multilingual Abstract Box (المستخلص متعدد اللغات - عربي / إنجليزي / فرنسي) */}
        {currentAbstractText && (
          <section className="p-5 sm:p-6 rounded-2xl bg-[#FAF8F5] border-r-4 border-r-[#4A5D4E] border border-[#E5E2D9] mb-8 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-[#E5E2D9]">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#4A5D4E]" />
                <h2 className="font-amiri font-bold text-lg text-[#4A5D4E]">
                  مستخلص {article.type === 'study' ? 'البحث الأكاديمي' : 'المقال'} (Abstract)
                </h2>
              </div>

              {/* Language Switcher Tabs */}
              <div className="flex items-center gap-1.5">
                {availableLangs.map(lang => (
                  <button
                    key={lang.code}
                    type="button"
                    id={`abstract-lang-${lang.code}`}
                    onClick={() => setActiveLang(lang.code)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      activeLang === lang.code
                        ? 'bg-[#4A5D4E] text-white shadow-2xs'
                        : 'bg-white text-stone-700 border border-[#E5E2D9] hover:bg-[#F2EFE9]'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}

                <button
                  type="button"
                  id="copy-abstract-btn"
                  onClick={handleCopyAbstract}
                  className="p-1.5 rounded-lg border border-[#E5E2D9] hover:bg-white text-xs text-stone-600 transition-colors cursor-pointer"
                  title="نسخ المستخلص"
                >
                  {copiedAbstract ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <p
              dir={availableLangs.find(l => l.code === activeLang)?.dir || 'rtl'}
              className={`text-sm sm:text-base leading-relaxed opacity-95 text-justify font-cairo ${
                activeLang !== 'ar' ? 'font-sans' : ''
              }`}
            >
              {currentAbstractText}
            </p>
          </section>
        )}

        {/* 2. Table of Contents Section (فهرس المقالات والدراسات والمحاور) */}
        {tableOfContents.length > 0 && (
          <section className="mb-10 p-5 rounded-2xl bg-white border border-[#E5E2D9] shadow-2xs">
            <div
              onClick={() => setIsTocOpen(prev => !prev)}
              className="flex items-center justify-between cursor-pointer select-none"
            >
              <h3 className="font-amiri font-bold text-base sm:text-lg text-stone-900 flex items-center gap-2">
                <ListTree className="w-4 h-4 text-[#4A5D4E]" />
                <span>فهرس المحتويات والمحاور ({tableOfContents.length} محاور)</span>
              </h3>
              <div className="flex items-center gap-1 text-xs text-[#4A5D4E] font-bold">
                <span>{isTocOpen ? 'طي الفهرس' : 'عرض الفهرس'}</span>
                {isTocOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>

            {isTocOpen && (
              <div className="mt-4 pt-3 border-t border-[#E5E2D9] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                {tableOfContents.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToSection(item.id)}
                    className={`text-right p-2.5 rounded-xl hover:bg-[#F7F5F0] transition-colors flex items-center gap-2.5 cursor-pointer border border-transparent hover:border-[#E5E2D9] ${
                      item.level === 3 ? 'pr-6 text-stone-600 text-xs' : 'font-semibold text-stone-900'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-md bg-[#4A5D4E]/10 text-[#4A5D4E] text-[11px] font-mono font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="truncate">{item.title}</span>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 3. Article Body Content with Interactive Numbered Citations */}
        <section
          style={{ fontSize: `${fontSize}px`, lineHeight: '2.1' }}
          className="article-rich-content font-amiri text-justify space-y-6 select-text mb-16"
        >
          {article.content.split('\n\n').map((block, idx) => {
            const trimmed = block.trim();
            if (!trimmed) return null;

            if (trimmed.startsWith('## ')) {
              const currentId = `heading-${headingCounter++}`;
              return (
                <h2
                  id={currentId}
                  key={idx}
                  className="font-bold text-xl sm:text-2xl mt-8 mb-4 pb-2 border-b border-current/15 text-[#4A5D4E] font-amiri scroll-mt-20"
                >
                  {trimmed.replace('## ', '')}
                </h2>
              );
            }

            if (trimmed.startsWith('### ')) {
              const currentId = `heading-${headingCounter++}`;
              return (
                <h3
                  id={currentId}
                  key={idx}
                  className="font-bold text-lg sm:text-xl mt-6 mb-3 text-inherit font-amiri scroll-mt-20"
                >
                  {trimmed.replace('### ', '')}
                </h3>
              );
            }

            if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
              const items = trimmed.split('\n');
              return (
                <ul key={idx} className="list-disc list-inside space-y-2 pr-4 my-4 opacity-95 text-base">
                  {items.map((item, iIdx) => (
                    <li key={iIdx}>{renderTextWithCitations(item.replace(/^[\*\-]\s+/, ''))}</li>
                  ))}
                </ul>
              );
            }

            if (trimmed.startsWith('---')) {
              return (
                <div key={idx} className="my-8 text-center opacity-40 font-serif">
                  ❖ ─── ✦ ─── ❖
                </div>
              );
            }

            return (
              <p key={idx} className="leading-loose indent-6">
                {renderTextWithCitations(trimmed)}
              </p>
            );
          })}
        </section>

        {/* 4. Numbered Footnotes & Citations Section (الهوامش والإحالات مع زر العودة للنص) */}
        {articleFootnotes && articleFootnotes.length > 0 && (
          <section
            id="footnotes-section"
            className="mt-10 p-5 sm:p-6 rounded-2xl border border-[#E5E2D9] bg-white text-xs space-y-3 shadow-2xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E2D9]">
              <h4 className="font-amiri font-bold text-base text-stone-900 flex items-center gap-2">
                <Quote className="w-4 h-4 text-[#4A5D4E]" />
                <span>الهوامش والإحالات التوضيحية ({articleFootnotes.length}):</span>
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
                    className={`p-2.5 rounded-xl transition-all flex items-start justify-between gap-3 ${
                      isHighlight
                        ? 'bg-[#4A5D4E]/15 border border-[#4A5D4E] ring-2 ring-[#4A5D4E]/30'
                        : 'bg-[#FAF8F5] border border-[#E5E2D9]/60'
                    }`}
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <span className="font-mono font-bold text-[#4A5D4E] bg-white px-1.5 py-0.5 rounded-md border border-current/20 text-xs shrink-0">
                        [{fn.id}]
                      </span>
                      <p className="opacity-90 leading-relaxed font-cairo text-stone-800">
                        {fn.text}
                      </p>
                    </div>

                    {/* Button to scroll back to citation in the text! */}
                    <button
                      type="button"
                      onClick={() => jumpBackToCitation(fn.id)}
                      className="text-[11px] font-bold text-[#4A5D4E] hover:underline flex items-center gap-1 shrink-0 p-1 rounded-md hover:bg-black/5 cursor-pointer"
                      title="العودة لموضع الهامش في متن النص"
                    >
                      <span>العودة للنص</span>
                      <CornerUpRight className="w-3 h-3 rotate-180" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 5. Academic References / Bibliography Section (المراجع والمصادر) */}
        {article.references && article.references.length > 0 && (
          <section className="mt-8 p-5 sm:p-6 rounded-2xl border border-[#E5E2D9] bg-white text-xs space-y-3 shadow-2xs">
            <h4 className="font-amiri font-bold text-base mb-1 text-stone-900 flex items-center gap-2">
              <Quote className="w-4 h-4 text-[#4A5D4E]" />
              <span>قائمة المراجع والمصادر الأكاديمية (References):</span>
            </h4>
            <ol className="space-y-2 pt-1 font-sans">
              {article.references.map((ref, rIdx) => {
                const refNum = rIdx + 1;
                const isHighlight = highlightedFootnote === refNum;
                return (
                  <li
                    key={rIdx}
                    id={`reference-${refNum}`}
                    className={`p-2 rounded-xl transition-all flex items-start justify-between gap-3 ${
                      isHighlight
                        ? 'bg-[#4A5D4E]/15 border border-[#4A5D4E] ring-2 ring-[#4A5D4E]/30'
                        : 'bg-[#FAF8F5] border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="font-mono font-bold text-[#4A5D4E] text-xs shrink-0">
                        [{refNum}]
                      </span>
                      <span className="opacity-90 leading-relaxed text-stone-800">
                        {ref}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => jumpBackToCitation(refNum)}
                      className="text-[11px] font-bold text-[#4A5D4E] hover:underline flex items-center gap-1 shrink-0 p-1 rounded-md hover:bg-black/5 cursor-pointer"
                      title="العودة لموضع الإحالة في المتن"
                    >
                      <span>العودة للنص</span>
                      <CornerUpRight className="w-3 h-3 rotate-180" />
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {/* 6. Reader Notes & Marginalia (هوامش وملاحظات القراء والباحثين) */}
        <section className="mt-12 p-5 sm:p-6 rounded-2xl border border-[#E5E2D9] bg-[#FAF8F5] shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E5E2D9]">
            <div>
              <h3 className="font-amiri font-bold text-lg text-stone-900 flex items-center gap-2">
                <PenLine className="w-4 h-4 text-[#4A5D4E]" />
                <span>هوامش وملاحظات القراء والباحثين</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                يمكنك تدوين انطباعاتك النقدية وملاحظاتك وهوامشك وحفظها على هذا المقال
              </p>
            </div>

            <button
              type="button"
              id="add-reader-note-btn"
              onClick={() => setIsAddingNote(prev => !prev)}
              className="px-3 py-1.5 rounded-xl bg-[#4A5D4E] hover:bg-[#3D4E41] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة هامش أو ملاحظة</span>
            </button>
          </div>

          {noteSuccessMsg && (
            <div className="my-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{noteSuccessMsg}</span>
            </div>
          )}

          {/* New Note Form */}
          {isAddingNote && (
            <form onSubmit={handleSaveReaderNote} className="mt-4 p-4 rounded-2xl bg-white border border-[#E5E2D9] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    اسم القارئ / الباحث (اختياري):
                  </label>
                  <input
                    type="text"
                    value={newNoteAuthor}
                    onChange={e => setNewNoteAuthor(e.target.value)}
                    placeholder="مثال: د. باحث فلسفي، قارئ مهتم..."
                    className="w-full p-2 text-xs rounded-xl border border-stone-200 bg-[#FDFCF8] text-stone-900 font-cairo outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    اقتباس أو موضع الهامش في المقال (اختياري):
                  </label>
                  <input
                    type="text"
                    value={newNoteQuote}
                    onChange={e => setNewNoteQuote(e.target.value)}
                    placeholder="مثال: تعليق على الفقرة الثانية أو مفهوم كذا..."
                    className="w-full p-2 text-xs rounded-xl border border-stone-200 bg-[#FDFCF8] text-stone-900 font-cairo outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  نص الملاحظة أو الهامش التحليلي:
                </label>
                <textarea
                  rows={3}
                  value={newNoteText}
                  onChange={e => setNewNoteText(e.target.value)}
                  placeholder="اكتب فكرتك أو ملاحظتك هنا..."
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 bg-[#FDFCF8] text-stone-900 font-cairo outline-hidden"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingNote(false)}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#4A5D4E] text-white text-xs font-bold hover:bg-[#3D4E41] transition-colors cursor-pointer"
                >
                  حفظ الملاحظة
                </button>
              </div>
            </form>
          )}

          {/* Reader Notes List */}
          <div className="mt-4 space-y-3">
            {readerNotes.length === 0 ? (
              <p className="text-xs text-stone-500 py-3 text-center">
                لا توجد هوامش مدونة بعد. كن أول من يضيف هامشاً أو تعقيباً فكرياً على هذه المادة!
              </p>
            ) : (
              readerNotes.map(note => (
                <div
                  key={note.id}
                  className="p-3.5 rounded-2xl bg-white border border-[#E5E2D9] shadow-2xs space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-800">
                        {note.authorName || 'قارئ وباحث'}
                      </span>
                      <span className="text-stone-400 text-[11px]">
                        {new Date(note.createdAt).toLocaleDateString('ar-EG')}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteReaderNote(note.id)}
                      className="text-stone-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                      title="حذف الملاحظة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {note.selectedText && (
                    <p className="text-xs text-[#4A5D4E] bg-[#4A5D4E]/5 px-2.5 py-1 rounded-lg border border-[#4A5D4E]/15 italic">
                      تعقيب على: "{note.selectedText}"
                    </p>
                  )}

                  <p className="text-xs sm:text-sm text-stone-700 font-cairo leading-relaxed">
                    {note.note}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Bottom Social & Action Bar */}
        <div className="mt-12 pt-6 border-t border-current/15 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              id="like-article-btn"
              onClick={handleLike}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isLiked
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'border border-current/20 hover:bg-black/5 opacity-80'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likes} إعجاب واستفادة</span>
            </button>

            <button
              type="button"
              id="share-article-btn"
              onClick={handleCopyLink}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-current/20 hover:bg-black/5 opacity-80 flex items-center gap-2 cursor-pointer transition-all"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedLink ? 'تم نسخ الرابط' : 'مشاركة الرابط'}</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(article.tags || []).map(tag => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-lg text-xs bg-black/5 border border-current/10 opacity-70"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Related Articles & Studies */}
        {relatedArticles.length > 0 && onSelectArticle && (
          <section className="mt-16 pt-8 border-t border-current/15">
            <h3 className="font-amiri font-bold text-xl mb-4 opacity-90">
              اقرأ أيضاً من نفس الحقل المعرفي:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedArticles.map(rel => (
                <div
                  key={rel.id}
                  onClick={() => onSelectArticle(rel.id)}
                  className="p-4 rounded-2xl border border-current/15 bg-black/[0.02] hover:bg-black/[0.05] transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/5 opacity-80 mb-2 inline-block">
                      {rel.type === 'study' ? 'دراسة' : rel.type === 'translated_article' ? 'ترجمة' : 'مقالة'}
                    </span>
                    <h4 className="font-amiri font-bold text-sm leading-snug line-clamp-2 mb-2">
                      {rel.title}
                    </h4>
                  </div>
                  <p className="text-[11px] opacity-70 mt-2 flex items-center gap-1 text-[#4A5D4E] font-semibold">
                    <span>قراءة المادة</span>
                    <ArrowRight className="w-3 h-3 rotate-180" />
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
};
