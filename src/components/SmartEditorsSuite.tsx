import React, { useState, useEffect, useMemo, useRef } from 'react';
import Markdown from 'react-markdown';
import { Novel, Chapter, IntellectualItem } from '../types';
import { storageService } from '../services/storageService';
import { cleanChapterContent } from '../utils/textCleaner';
import { DEWEY_DECIMAL_CATEGORIES } from '../utils/deweyDecimal';
import { ArticleDocumentEditor } from './ArticleDocumentEditor';
import { ArticleReader } from './ArticleReader';
import {
  Edit3,
  FileText,
  BookOpen,
  Book,
  GraduationCap,
  Sparkles,
  Save,
  CheckCircle2,
  Trash2,
  Eye,
  Plus,
  ArrowRight,
  ArrowLeft,
  Layers,
  Quote,
  Clock,
  ListOrdered,
  List,
  Wand2,
  Copy,
  Check,
  RotateCcw,
  BookMarked,
  Sliders,
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Link,
  Image as ImageIcon,
  Minus,
  Maximize2,
  Minimize2,
  Columns,
  Bookmark,
  Hash,
  AlignRight,
  Type,
  X
} from 'lucide-react';

interface SmartEditorsSuiteProps {
  novels: Novel[];
  chapters: Chapter[];
  articles: IntellectualItem[];
  onRefreshData: () => void;
  onClose?: () => void;
  initialMode?: 'article' | 'study' | 'book' | 'tools';
  modeFilter?: 'all' | 'articles_only' | 'books_only';
  targetItem?: {
    type: 'article' | 'study' | 'book' | 'chapter';
    id?: string;
  } | null;
  onPreviewArticle?: (articleId: string) => void;
  onPreviewChapter?: (novelId: string, chapterId: string) => void;
  onPreviewBook?: (novelId: string) => void;
}

const ARTICLE_CATEGORIES = [
  'دراسات نقدية وأدبية',
  'فلسفة وفكر معاصر',
  'علم الاجتماع الثقافي',
  'تاريخ وحضارات',
  'ترجمات عالمية',
  'علوم إنسانية وملاحظات',
  'لسانيات وفقه لغة',
  'فن وجماليات'
];

export const SmartEditorsSuite: React.FC<SmartEditorsSuiteProps> = ({
  novels,
  chapters,
  articles,
  onRefreshData,
  onClose,
  initialMode = 'article',
  modeFilter = 'all',
  targetItem,
  onPreviewArticle,
  onPreviewChapter,
  onPreviewBook,
}) => {
  // Navigation Tabs: 'article' | 'study' | 'book' | 'tools'
  const [activeTab, setActiveTab] = useState<'article' | 'study' | 'book' | 'tools'>(() => {
    if (modeFilter === 'books_only') return 'book';
    if (modeFilter === 'articles_only' && initialMode === 'book') return 'article';
    return initialMode;
  });

  // View Mode: 'edit' (Pure editor) | 'split' (Editor & live preview side by side) | 'preview' (Live rendered markdown)
  const [viewMode, setViewMode] = useState<'edit' | 'split' | 'preview'>('split');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'draft' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'draft' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3800);
  };

  // Textarea Refs for Rich Text Insertion
  const articleTextareaRef = useRef<HTMLTextAreaElement>(null);
  const chapterTextareaRef = useRef<HTMLTextAreaElement>(null);

  // -------------------------------------------------------------
  // 1. ARTICLE & STUDY EDITOR STATE
  // -------------------------------------------------------------
  const [selectedArticleId, setSelectedArticleId] = useState<string>('new');
  const [artTitle, setArtTitle] = useState('');
  const [artSubtitle, setArtSubtitle] = useState('');
  const [artAuthor, setArtAuthor] = useState('أيمن كناني');
  const [artType, setArtType] = useState<'article' | 'study' | 'translated_article'>('article');
  const [artCategory, setArtCategory] = useState(ARTICLE_CATEGORIES[0]);
  const [artTags, setArtTags] = useState('');
  const [artAbstract, setArtAbstract] = useState('');
  const [artContent, setArtContent] = useState('');
  const [artStatus, setArtStatus] = useState<'PUBLISHED' | 'DRAFT'>('DRAFT');
  const [artCoverImage, setArtCoverImage] = useState('');
  const [artOriginalAuthor, setArtOriginalAuthor] = useState('');
  const [artTranslator, setArtTranslator] = useState('أيمن كناني');
  const [artOriginalLanguage, setArtOriginalLanguage] = useState('');
  const [artFootnotes, setArtFootnotes] = useState<{ id: number; text: string }[]>([]);
  const [artReferences, setArtReferences] = useState<string[]>([]);
  const [artNewFootnoteInput, setArtNewFootnoteInput] = useState('');
  const [artNewRefInput, setArtNewRefInput] = useState('');
  const [studyMethodology, setStudyMethodology] = useState('منهج تحليلي نقدي مقارن');
  const [studyPeerReviewed, setStudyPeerReviewed] = useState(true);

  // Article Cross-linking State (ربط بين المقالات)
  const [isLinkArticleModalOpen, setIsLinkArticleModalOpen] = useState(false);
  const [articleSearchTerm, setArticleSearchTerm] = useState('');

  // -------------------------------------------------------------
  // 2. BOOK & CHAPTER EDITOR STATE
  // -------------------------------------------------------------
  const [selectedBookId, setSelectedBookId] = useState<string>(novels[0]?.id || 'new');
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('أيمن كناني');
  const [bookSynopsis, setBookSynopsis] = useState('');
  const [bookCoverImage, setBookCoverImage] = useState('');
  const [bookGenres, setBookGenres] = useState('رواية، فلسفة، أدب');
  const [bookDeweyCode, setBookDeweyCode] = useState('813');

  // Chapter specific state
  const [selectedChapterId, setSelectedChapterId] = useState<string>('new');
  const [chapTitle, setChapTitle] = useState('');
  const [chapSubtitle, setChapSubtitle] = useState('');
  const [chapNumber, setChapNumber] = useState<number>(1);
  const [chapContent, setChapContent] = useState('');
  const [chapAuthorNote, setChapAuthorNote] = useState('');
  const [chapStatus, setChapStatus] = useState<'PUBLISHED' | 'DRAFT'>('DRAFT');

  // -------------------------------------------------------------
  // 3. EDITORIAL & TYPOGRAPHY TOOLS STATE
  // -------------------------------------------------------------
  const [rawTextToClean, setRawTextToClean] = useState('');
  const [cleanedResultText, setCleanedResultText] = useState('');
  const [copiedCleaned, setCopiedCleaned] = useState(false);

  // Citation Generator Form
  const [citationSourceType, setCitationSourceType] = useState<'book' | 'article' | 'web'>('book');
  const [citeAuthor, setCiteAuthor] = useState('');
  const [citeTitle, setCiteTitle] = useState('');
  const [citePublisher, setCitePublisher] = useState('');
  const [citeYear, setCiteYear] = useState('');
  const [citePages, setCitePages] = useState('');
  const [generatedCitation, setGeneratedCitation] = useState('');
  const [copiedCitation, setCopiedCitation] = useState(false);

  // Sync with targetItem if passed externally
  useEffect(() => {
    if (targetItem) {
      if (targetItem.type === 'study') {
        setActiveTab('study');
        setArtType('study');
        if (targetItem.id) loadArticleIntoEditor(targetItem.id);
      } else if (targetItem.type === 'article') {
        setActiveTab('article');
        setArtType('article');
        if (targetItem.id) loadArticleIntoEditor(targetItem.id);
      } else if (targetItem.type === 'book') {
        setActiveTab('book');
        if (targetItem.id) {
          setSelectedBookId(targetItem.id);
          loadBookIntoEditor(targetItem.id);
        }
      } else if (targetItem.type === 'chapter') {
        setActiveTab('book');
        const chap = chapters.find(c => c.id === targetItem.id);
        if (chap) {
          setSelectedBookId(chap.novelId);
          loadBookIntoEditor(chap.novelId);
          setSelectedChapterId(chap.id);
          loadChapterIntoEditor(chap);
        }
      }
    }
  }, [targetItem]);

  // Load article into state
  const loadArticleIntoEditor = (artId: string) => {
    setSelectedArticleId(artId);
    if (artId === 'new') {
      setArtTitle('');
      setArtSubtitle('');
      setArtAuthor('أيمن كناني');
      setArtType(activeTab === 'study' ? 'study' : 'article');
      setArtCategory(ARTICLE_CATEGORIES[0]);
      setArtTags('');
      setArtAbstract('');
      setArtContent('');
      setArtStatus('DRAFT');
      setArtCoverImage('');
      setArtFootnotes([]);
      setArtReferences([]);
      return;
    }
    const found = articles.find(a => a.id === artId);
    if (found) {
      setArtTitle(found.title);
      setArtSubtitle(found.subtitle || '');
      setArtAuthor(found.author || 'أيمن كناني');
      setArtType(found.type);
      setArtCategory(found.category || ARTICLE_CATEGORIES[0]);
      setArtTags((found.tags || []).join('، '));
      setArtAbstract(found.abstract || '');
      setArtContent(found.content || '');
      setArtStatus(found.status || 'PUBLISHED');
      setArtCoverImage(found.coverImage || '');
      setArtOriginalAuthor(found.originalAuthor || '');
      setArtTranslator(found.translator || '');
      setArtOriginalLanguage(found.originalLanguage || '');
      setArtFootnotes(found.footnotes || []);
      setArtReferences(found.references || []);
    }
  };

  // Load book into state
  const loadBookIntoEditor = (bId: string) => {
    setSelectedBookId(bId);
    if (bId === 'new') {
      setBookTitle('');
      setBookAuthor('أيمن كناني');
      setBookSynopsis('');
      setBookCoverImage('');
      setBookGenres('رواية، فلسفة، أدب');
      setBookDeweyCode('813');
      setSelectedChapterId('new');
      setChapTitle('');
      setChapSubtitle('');
      setChapNumber(1);
      setChapContent('');
      setChapStatus('DRAFT');
      return;
    }
    const novel = novels.find(n => n.id === bId);
    if (novel) {
      setBookTitle(novel.title);
      setBookAuthor(novel.author || 'أيمن كناني');
      setBookSynopsis(novel.synopsis || '');
      setBookCoverImage(novel.coverImage || '');
      setBookGenres((novel.genres || []).join('، '));
      setBookDeweyCode((novel as any).deweyCategory?.code || novel.deweyDecimal || '813');

      // Load first chapter or prepare new
      const bookChaps = chapters.filter(c => c.novelId === bId).sort((a, b) => a.chapterNumber - b.chapterNumber);
      if (bookChaps.length > 0) {
        loadChapterIntoEditor(bookChaps[0]);
      } else {
        initNewChapterForCurrentBook(bId);
      }
    }
  };

  const loadChapterIntoEditor = (chap: Chapter) => {
    setSelectedChapterId(chap.id);
    setChapTitle(chap.title);
    setChapSubtitle(chap.seo?.metaDescription || '');
    setChapNumber(chap.chapterNumber);
    setChapContent(chap.content);
    setChapAuthorNote(chap.authorNote || '');
    setChapStatus(chap.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT');
  };

  // Dedicated action: Initialize a new chapter for current book
  const initNewChapterForCurrentBook = (bookIdToUse?: string) => {
    const targetBookId = bookIdToUse || selectedBookId;
    const currentBookChaps = chapters.filter(c => c.novelId === targetBookId);
    const nextNum = currentBookChaps.length > 0
      ? Math.max(...currentBookChaps.map(c => c.chapterNumber)) + 1
      : 1;

    setSelectedChapterId('new');
    setChapNumber(nextNum);
    setChapTitle(`الفصل ${nextNum}: `);
    setChapSubtitle('');
    setChapContent('');
    setChapAuthorNote('');
    setChapStatus('DRAFT');

    // Focus chapter input after state update
    setTimeout(() => {
      const input = document.getElementById('chapter-title-input');
      input?.focus();
    }, 100);

    showToast(`تم فتح جلسة تأليف جديدة للفصل رقم (${nextNum}). المحرر جاهز للتنسيق والكتابة!`, 'info');
  };

  // Real-time Text Statistics
  const activeContentText = activeTab === 'book' ? chapContent : artContent;

  const textStats = useMemo(() => {
    const trimmed = activeContentText.trim();
    if (!trimmed) {
      return { words: 0, chars: 0, paragraphs: 0, readTime: 1 };
    }
    const words = trimmed.split(/\s+/).filter(Boolean).length;
    const chars = trimmed.length;
    const paragraphs = trimmed.split(/\n\s*\n/).filter(Boolean).length;
    const readTime = Math.max(1, Math.ceil(words / 180));
    return { words, chars, paragraphs, readTime };
  }, [activeContentText]);

  // Current book chapters list
  const currentBookChapters = useMemo(() => {
    if (!selectedBookId || selectedBookId === 'new') return [];
    return chapters.filter(c => c.novelId === selectedBookId).sort((a, b) => a.chapterNumber - b.chapterNumber);
  }, [chapters, selectedBookId]);

  // -------------------------------------------------------------
  // RICH TEXT / MARKDOWN FORMATTING DISPATCHER
  // -------------------------------------------------------------
  const applyFormatting = (formatType: string) => {
    const isBook = activeTab === 'book';
    const textarea = isBook ? chapterTextareaRef.current : articleTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = textarea.value;
    const selectedText = currentVal.substring(start, end);

    let prefix = '';
    let suffix = '';
    let placeholder = '';

    switch (formatType) {
      case 'bold':
        prefix = '**';
        suffix = '**';
        placeholder = 'نص عريض';
        break;
      case 'italic':
        prefix = '*';
        suffix = '*';
        placeholder = 'نص مائل';
        break;
      case 'strike':
        prefix = '~~';
        suffix = '~~';
        placeholder = 'نص مشطوب';
        break;
      case 'h1':
        prefix = '\n# ';
        suffix = '\n';
        placeholder = 'عنوان رئيسي أول';
        break;
      case 'h2':
        prefix = '\n## ';
        suffix = '\n';
        placeholder = 'عنوان فرعي ثان';
        break;
      case 'h3':
        prefix = '\n### ';
        suffix = '\n';
        placeholder = 'عنوان فرعي ثالث';
        break;
      case 'quote':
        prefix = '\n> ';
        suffix = '\n';
        placeholder = 'اقتباس فكري أو مقولة رصينة...';
        break;
      case 'bullet':
        prefix = '\n- ';
        suffix = '\n';
        placeholder = 'بند نقطي';
        break;
      case 'numbered':
        prefix = '\n1. ';
        suffix = '\n';
        placeholder = 'بند رقمي';
        break;
      case 'code':
        prefix = '`';
        suffix = '`';
        placeholder = 'رمز أو مصطلح';
        break;
      case 'codeblock':
        prefix = '\n```\n';
        suffix = '\n```\n';
        placeholder = 'نص مقتبس بصيغة كود أو شعر حر';
        break;
      case 'link':
        prefix = '[';
        suffix = '](https://example.com)';
        placeholder = 'نص الرابط';
        break;
      case 'image':
        prefix = '![';
        suffix = '](https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800)';
        placeholder = 'وصف الصورة';
        break;
      case 'hr':
        prefix = '\n\n---\n\n';
        break;
      case 'ornament':
        prefix = '\n\n❦ ❦ ❦\n\n';
        break;
      case 'arabic_quotes':
        prefix = '«';
        suffix = '»';
        placeholder = 'نص الحوار أو الاقتباس';
        break;
      case 'arabic_comma':
        prefix = '، ';
        break;
      case 'arabic_semicolon':
        prefix = '؛ ';
        break;
      case 'footnote_ref': {
        const nextId = artFootnotes.length + 1;
        prefix = `[^${nextId}]`;
        setArtFootnotes(prev => [...prev, { id: nextId, text: `توثيق الهامش رقم ${nextId}` }]);
        break;
      }
      default:
        break;
    }

    const insertion = selectedText ? `${prefix}${selectedText}${suffix}` : `${prefix}${placeholder}${suffix}`;
    const newContent = currentVal.substring(0, start) + insertion + currentVal.substring(end);

    if (isBook) {
      setChapContent(newContent);
    } else {
      setArtContent(newContent);
    }

    // Reposition cursor and refocus
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + insertion.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  // Cross-link an article directly into the markdown content
  const handleInsertArticleLink = (targetArticle: IntellectualItem) => {
    const isBook = activeTab === 'book';
    const textarea = isBook ? chapterTextareaRef.current : articleTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = textarea.value;
    const selectedText = currentVal.substring(start, end);
    const linkText = selectedText.trim() || targetArticle.title;
    const insertion = `[${linkText}](?article=${targetArticle.id})`;

    const newContent = currentVal.substring(0, start) + insertion + currentVal.substring(end);
    if (isBook) {
      setChapContent(newContent);
    } else {
      setArtContent(newContent);
    }

    setIsLinkArticleModalOpen(false);
    showToast(`تم ربط مقال «${targetArticle.title}» بنجاح!`, 'success');
    setTimeout(() => {
      textarea.focus();
      const pos = start + insertion.length;
      textarea.setSelectionRange(pos, pos);
    }, 50);
  };

  // -------------------------------------------------------------
  // SAVE ARTICLE OR STUDY (DRAFT OR PUBLISHED)
  // -------------------------------------------------------------
  const handleSaveArticle = (statusToSave: 'PUBLISHED' | 'DRAFT') => {
    if (!artTitle.trim()) {
      showToast('يرجى كتابة عنوان المقالة أو الدراسة أولاً', 'info');
      return;
    }
    if (!artContent.trim()) {
      showToast('يرجى كتابة محتوى النص الفكري', 'info');
      return;
    }

    const tagsArray = artTags.split(/[,،]/).map(t => t.trim()).filter(Boolean);
    const isDraft = statusToSave === 'DRAFT';

    if (selectedArticleId === 'new') {
      const created = storageService.addArticle({
        title: artTitle.trim(),
        subtitle: artSubtitle.trim() || undefined,
        slug: artTitle.trim().toLowerCase().replace(/[\s\W-]+/g, '-') || `art-${Date.now()}`,
        author: artAuthor.trim() || 'أيمن كناني',
        type: artType,
        category: artCategory,
        tags: tagsArray,
        abstract: artAbstract.trim() || undefined,
        content: artContent,
        status: statusToSave,
        wordCount: textStats.words,
        coverImage: artCoverImage.trim() || undefined,
        readingTimeMinutes: textStats.readTime,
        references: artReferences.length > 0 ? artReferences : undefined,
        footnotes: artFootnotes.length > 0 ? artFootnotes : undefined,
        originalAuthor: artOriginalAuthor.trim() || undefined,
        translator: artTranslator.trim() || undefined,
        originalLanguage: artOriginalLanguage.trim() || undefined,
      });
      setSelectedArticleId(created.id);
      setArtStatus(statusToSave);
      showToast(
        isDraft
          ? 'تم حفظ المقالة كمسودة غير منشورة بنجاح! يمكنك العودة إليها واستكمالها في أي وقت.'
          : `تم نشر ${artType === 'study' ? 'الدراسة البحثية' : 'المقالة'} رسمياً في الموسوعة بنجاح!`,
        isDraft ? 'draft' : 'success'
      );
    } else {
      storageService.updateArticle(selectedArticleId, {
        title: artTitle.trim(),
        subtitle: artSubtitle.trim() || undefined,
        author: artAuthor.trim() || 'أيمن كناني',
        type: artType,
        category: artCategory,
        tags: tagsArray,
        abstract: artAbstract.trim() || undefined,
        content: artContent,
        status: statusToSave,
        coverImage: artCoverImage.trim() || undefined,
        wordCount: textStats.words,
        readingTimeMinutes: textStats.readTime,
        references: artReferences.length > 0 ? artReferences : undefined,
        footnotes: artFootnotes.length > 0 ? artFootnotes : undefined,
        originalAuthor: artOriginalAuthor.trim() || undefined,
        translator: artTranslator.trim() || undefined,
        originalLanguage: artOriginalLanguage.trim() || undefined,
      });
      setArtStatus(statusToSave);
      showToast(
        isDraft
          ? 'تم تحديث وحفظ المسودة بنجاح!'
          : `تم حفظ وتحديث ونشر ${artType === 'study' ? 'الدراسة' : 'المقالة'} بنجاح!`,
        isDraft ? 'draft' : 'success'
      );
    }

    onRefreshData();
  };

  // -------------------------------------------------------------
  // SAVE BOOK & CHAPTER (DRAFT OR PUBLISHED)
  // -------------------------------------------------------------
  const handleSaveBookAndChapter = (chapterStatusToSave: 'PUBLISHED' | 'DRAFT') => {
    if (!bookTitle.trim()) {
      showToast('يرجى إدخال عنوان الكتاب أو الرواية أولاً', 'info');
      return;
    }

    const genreList = bookGenres.split(/[,،]/).map(g => g.trim()).filter(Boolean);
    const deweyObj = DEWEY_DECIMAL_CATEGORIES.find(d => d.code === bookDeweyCode);
    let currentNovelId = selectedBookId;

    // 1. Create novel if new
    if (selectedBookId === 'new') {
      const newNovel: Novel = {
        id: `novel-${Date.now()}`,
        slug: bookTitle.trim().toLowerCase().replace(/[\s\W-]+/g, '-') || `novel-${Date.now()}`,
        title: bookTitle.trim(),
        author: bookAuthor.trim() || 'أيمن كناني',
        authorBio: 'الكاتب والباحث أيمن كناني',
        synopsis: bookSynopsis.trim(),
        coverImage: bookCoverImage.trim() || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
        bannerImage: bookCoverImage.trim() || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
        genres: genreList,
        tags: genreList,
        status: 'ONGOING',
        deweyDecimal: bookDeweyCode,
        deweyCategoryName: deweyObj ? deweyObj.name : '813 - الروايات والقصص العربية',
        totalViews: 1,
        totalLikes: 1,
        rating: 5,
        ratingCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const allNovels = storageService.getNovels();
      allNovels.unshift(newNovel);
      storageService.saveNovels(allNovels);
      currentNovelId = newNovel.id;
      setSelectedBookId(newNovel.id);
    } else {
      storageService.updateNovel(selectedBookId, {
        title: bookTitle.trim(),
        author: bookAuthor.trim(),
        synopsis: bookSynopsis.trim(),
        coverImage: bookCoverImage.trim() || undefined,
        genres: genreList,
        deweyDecimal: bookDeweyCode,
        deweyCategoryName: deweyObj ? deweyObj.name : undefined,
      });
    }

    // 2. Save Active Chapter
    if (chapTitle.trim() && chapContent.trim() && currentNovelId && currentNovelId !== 'new') {
      const isDraft = chapterStatusToSave === 'DRAFT';

      if (selectedChapterId === 'new') {
        const newChap: Chapter = {
          id: `chap-${Date.now()}`,
          novelId: currentNovelId,
          chapterNumber: chapNumber,
          slug: `chapter-${chapNumber}-${Date.now()}`,
          title: chapTitle.trim(),
          content: chapContent,
          wordCount: textStats.words,
          authorNote: chapAuthorNote.trim() || undefined,
          status: chapterStatusToSave,
          publishedAt: new Date().toISOString(),
          views: 1,
          likes: 0,
          seo: chapSubtitle ? { metaDescription: chapSubtitle } : undefined,
        };
        const allChaps = storageService.getChapters();
        allChaps.push(newChap);
        storageService.saveChapters(allChaps);
        setSelectedChapterId(newChap.id);
        setChapStatus(chapterStatusToSave);
        showToast(
          isDraft
            ? `تم حفظ الفصل (${chapNumber}) كمسودة فصل داخل مسودة الكتاب بنجاح!`
            : `تم نشر وتنسيق الفصل (${chapNumber}) بنجاح داخل الكتاب!`,
          isDraft ? 'draft' : 'success'
        );
      } else {
        const allChaps = storageService.getChapters();
        const chIdx = allChaps.findIndex(c => c.id === selectedChapterId);
        if (chIdx !== -1) {
          allChaps[chIdx] = {
            ...allChaps[chIdx],
            title: chapTitle.trim(),
            chapterNumber: chapNumber,
            content: chapContent,
            authorNote: chapAuthorNote.trim() || undefined,
            status: chapterStatusToSave,
            seo: chapSubtitle ? { metaDescription: chapSubtitle } : allChaps[chIdx].seo,
          };
          storageService.saveChapters(allChaps);
          setChapStatus(chapterStatusToSave);
          showToast(
            isDraft
              ? `تم تحديث مسودة الفصل (${chapNumber}) بنجاح!`
              : `تم تحديث ونشر الفصل (${chapNumber}) في الرواية بنجاح!`,
            isDraft ? 'draft' : 'success'
          );
        }
      }
    } else if (!chapTitle.trim()) {
      showToast('تم حفظ بيانات الكتاب، يرجى كتابة عنوان الفصل لحفظه', 'info');
    }

    onRefreshData();
  };

  // -------------------------------------------------------------
  // TEXT CLEANING & CITATION UTILITIES
  // -------------------------------------------------------------
  const handleRunTextClean = () => {
    if (!rawTextToClean.trim()) {
      showToast('يرجى إدخال أو لصق النص المعالج أولاً', 'info');
      return;
    }
    let cleaned = cleanChapterContent(rawTextToClean);
    cleaned = cleaned.replace(/"([^"]+)"/g, '«$1»');
    cleaned = cleaned.replace(/[ \t]+/g, ' ');
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    setCleanedResultText(cleaned);
    showToast('تم تنقيح وتدقيق النص وضبط علامات الترقيم العربية بنجاح!', 'success');
  };

  const handleCopyCleaned = () => {
    if (!cleanedResultText) return;
    navigator.clipboard.writeText(cleanedResultText);
    setCopiedCleaned(true);
    setTimeout(() => setCopiedCleaned(false), 2000);
    showToast('تم نسخ النص المنقح إلى الحافظة', 'success');
  };

  const handleGenerateCitation = () => {
    if (!citeAuthor || !citeTitle) {
      showToast('يرجى ملء اسم المؤلف وعنوان المرجع على الأقل', 'info');
      return;
    }
    let citation = '';
    const yearPart = citeYear ? ` (${citeYear}). ` : '. ';
    const pagesPart = citePages ? `، ص ص. ${citePages}.` : '.';

    if (citationSourceType === 'book') {
      citation = `${citeAuthor}${yearPart}«${citeTitle}». ${citePublisher || 'دار النشر'}${pagesPart}`;
    } else if (citationSourceType === 'article') {
      citation = `${citeAuthor}${yearPart}"${citeTitle}"، مجلة الدراسات والبحوث الفكرية، ${citePublisher || ''}${pagesPart}`;
    } else {
      citation = `${citeAuthor}${yearPart}«${citeTitle}»، متاح على الإنترنت، مسترجع بتاريخ ${new Date().toLocaleDateString('ar-EG')}.`;
    }

    setGeneratedCitation(citation);
  };

  const handleCopyCitation = () => {
    if (!generatedCitation) return;
    navigator.clipboard.writeText(generatedCitation);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2000);
    showToast('تم نسخ التوثيق الأكاديمي المنسق', 'success');
  };

  return (
    <div
      className={`w-full bg-[#FAF8F5] border border-[#E5E2D9] overflow-hidden transition-all duration-300 font-cairo shadow-lg ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none overflow-y-auto bg-[#FAF8F5]' : 'rounded-3xl'
      }`}
    >
      {/* ------------------------------------------------------------- */}
      {/* STUDIO CHROME BAR (بيئة منعزلة تماماً عن البحث) */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white border-b border-[#E5E2D9] px-4 sm:px-6 py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2C2C2C] text-white flex items-center justify-center shadow-xs">
            <Edit3 className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-amiri font-bold text-lg text-[#2C2C2C] leading-none">
                استوديو التحرير والتأليف الاحترافي
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-sans font-bold flex items-center gap-1 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>بيئة منعزلة عن البحث</span>
              </span>
            </div>
            <p className="text-[11px] text-[#6E6A64] mt-0.5">
              محرر نصوص غني بالمعايير المطبعية، صياغة المقالات، وتأليف فصول الكتب بالماركداون
            </p>
          </div>
        </div>

        {/* Studio Controls: Exit, Fullscreen, Mode Tabs */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          {/* Main Studio Mode Tabs */}
          <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#E5E2D9] text-xs font-bold">
            {(modeFilter === 'all' || modeFilter === 'articles_only') && (
              <>
                <button
                  type="button"
                  id="tab-article-studio-btn"
                  onClick={() => {
                    setActiveTab('article');
                    setArtType('article');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'article'
                      ? 'bg-[#4A5D4E] text-white shadow-2xs'
                      : 'text-[#5A5751] hover:bg-white hover:text-[#2C2C2C]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>محرر المقالات</span>
                </button>

                <button
                  type="button"
                  id="tab-study-studio-btn"
                  onClick={() => {
                    setActiveTab('study');
                    setArtType('study');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'study'
                      ? 'bg-[#8C5E45] text-white shadow-2xs'
                      : 'text-[#5A5751] hover:bg-white hover:text-[#2C2C2C]'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>الدراسات المحكمة</span>
                </button>
              </>
            )}

            {(modeFilter === 'all' || modeFilter === 'books_only') && (
              <button
                type="button"
                id="tab-book-studio-btn"
                onClick={() => setActiveTab('book')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'book'
                    ? 'bg-[#2C2C2C] text-white shadow-2xs'
                    : 'text-[#5A5751] hover:bg-white hover:text-[#2C2C2C]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>تأليف فصول الكتب</span>
              </button>
            )}

            <button
              type="button"
              id="tab-tools-studio-btn"
              onClick={() => setActiveTab('tools')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'tools'
                  ? 'bg-[#4A5D4E] text-white shadow-2xs'
                  : 'text-[#5A5751] hover:bg-white hover:text-[#2C2C2C]'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">أدوات التوثيق</span>
            </button>
          </div>

          {/* Fullscreen & Exit */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl text-[#6E6A64] hover:text-[#2C2C2C] hover:bg-[#F5F2EA] border border-[#E5E2D9] transition-all cursor-pointer"
              title={isFullscreen ? 'تصغير الشاشة' : 'تكبير الشاشة للتركيز'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl bg-[#2C2C2C] hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-98"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>العودة للمتصفح</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Floating Notification Toast */}
      {notification && (
        <div
          className={`text-xs font-bold px-6 py-2.5 text-center transition-all animate-in fade-in flex items-center justify-center gap-2 ${
            notification.type === 'draft'
              ? 'bg-amber-600 text-white'
              : notification.type === 'info'
              ? 'bg-blue-600 text-white'
              : 'bg-[#4A5D4E] text-white'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* WRITING DIAGNOSTICS HUD BAR (إحصاءات الكتابة الحية) */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#F5F2EA]/90 border-b border-[#E5E2D9] px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 text-[#5A5751]">
          <span className="flex items-center gap-1 font-semibold">
            <Type className="w-3.5 h-3.5 text-[#4A5D4E]" />
            <span>عدد الكلمات:</span>
            <strong className="text-[#2C2C2C]">{textStats.words}</strong>
          </span>
          <span className="flex items-center gap-1 font-semibold">
            <Hash className="w-3.5 h-3.5 text-[#4A5D4E]" />
            <span>الحروف:</span>
            <strong className="text-[#2C2C2C]">{textStats.chars}</strong>
          </span>
          <span className="flex items-center gap-1 font-semibold hidden sm:flex">
            <Layers className="w-3.5 h-3.5 text-[#4A5D4E]" />
            <span>الفقرات:</span>
            <strong className="text-[#2C2C2C]">{textStats.paragraphs}</strong>
          </span>
          <span className="flex items-center gap-1 font-semibold">
            <Clock className="w-3.5 h-3.5 text-[#C88A3B]" />
            <span>القراءة التقديرية:</span>
            <strong className="text-[#2C2C2C]">{textStats.readTime} دقيقة</strong>
          </span>
        </div>

        {/* View Mode Switcher: Edit / Split / Preview */}
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-[#E5E2D9]">
          <button
            type="button"
            onClick={() => setViewMode('edit')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'edit'
                ? 'bg-[#2C2C2C] text-white shadow-2xs'
                : 'text-[#6E6A64] hover:text-[#2C2C2C]'
            }`}
          >
            تحرير فقط
          </button>
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              viewMode === 'split'
                ? 'bg-[#2C2C2C] text-white shadow-2xs'
                : 'text-[#6E6A64] hover:text-[#2C2C2C]'
            }`}
          >
            <Columns className="w-3 h-3" />
            <span>شاشة منقسمة</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              viewMode === 'preview'
                ? 'bg-[#4A5D4E] text-white shadow-2xs'
                : 'text-[#6E6A64] hover:text-[#2C2C2C]'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>معاينة القارئ</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* RICH TEXT FORMATTING TOOLBAR (Markdown Live Toolbar) */}
      {/* ------------------------------------------------------------- */}
      {(activeTab === 'article' || activeTab === 'study' || activeTab === 'book') && (
        <div className="bg-white border-b border-[#E5E2D9] px-3 sm:px-6 py-2 flex flex-wrap items-center gap-1 overflow-x-auto no-scrollbar">
          {/* Text Styling */}
          <div className="flex items-center gap-0.5 pl-2 border-l border-[#E5E2D9]">
            <button
              type="button"
              onClick={() => applyFormatting('bold')}
              className="p-1.5 rounded-lg hover:bg-[#FAF8F5] text-[#5A5751] hover:text-[#2C2C2C] transition-colors"
              title="نص عريض (**Bold**)"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => applyFormatting('italic')}
              className="p-1.5 rounded-lg hover:bg-[#FAF8F5] text-[#5A5751] hover:text-[#2C2C2C] transition-colors"
              title="نص مائل (*Italic*)"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => applyFormatting('strike')}
              className="p-1.5 rounded-lg hover:bg-[#FAF8F5] text-[#5A5751] hover:text-[#2C2C2C] transition-colors"
              title="نص مشطوب (~~Strikethrough~~)"
            >
              <Strikethrough className="w-4 h-4" />
            </button>
          </div>

          {/* Headings */}
          <div className="flex items-center gap-0.5 px-2 border-l border-[#E5E2D9]">
            <button
              type="button"
              onClick={() => applyFormatting('h1')}
              className="p-1.5 rounded-lg hover:bg-[#FAF8F5] text-[#5A5751] hover:text-[#2C2C2C] font-bold text-xs"
              title="عنوان رئيسي كبير (# H1)"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => applyFormatting('h2')}
              className="p-1.5 rounded-lg hover:bg-[#FAF8F5] text-[#5A5751] hover:text-[#2C2C2C] font-bold text-xs"
              title="عنوان فرعي (## H2)"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => applyFormatting('h3')}
              className="p-1.5 rounded-lg hover:bg-[#FAF8F5] text-[#5A5751] hover:text-[#2C2C2C] font-bold text-xs"
              title="عنوان قسم (### H3)"
            >
              <Heading3 className="w-4 h-4" />
            </button>
          </div>

          {/* Quotes, Lists, Dividers */}
          <div className="flex items-center gap-0.5 px-2 border-l border-[#E5E2D9]">
            <button
              type="button"
              onClick={() => applyFormatting('quote')}
              className="p-1.5 rounded-lg hover:bg-[#FAF8F5] text-[#5A5751] hover:text-[#2C2C2C] transition-colors"
              title="كتلة اقتباس (> Quote)"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => applyFormatting('bullet')}
              className="p-1.5 rounded-lg hover:bg-[#FAF8F5] text-[#5A5751] hover:text-[#2C2C2C] transition-colors"
              title="قائمة نقطية (- List)"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => applyFormatting('numbered')}
              className="p-1.5 rounded-lg hover:bg-[#FAF8F5] text-[#5A5751] hover:text-[#2C2C2C] transition-colors"
              title="قائمة مرقمة (1. List)"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => applyFormatting('hr')}
              className="p-1.5 rounded-lg hover:bg-[#FAF8F5] text-[#5A5751] hover:text-[#2C2C2C] transition-colors"
              title="خط فاصل أفقي (---)"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => applyFormatting('ornament')}
              className="px-2 py-1 rounded-lg hover:bg-amber-50 text-amber-800 text-xs font-serif transition-colors"
              title="فاصل زخرفي أدبي وفصول الروايات (❦ ❦ ❦)"
            >
              ❦ فاصل أدبي
            </button>
          </div>

          {/* Arabic Typography & Quotation Helpers */}
          <div className="flex items-center gap-1 px-2 border-l border-[#E5E2D9]">
            <button
              type="button"
              onClick={() => applyFormatting('arabic_quotes')}
              className="px-2 py-1 rounded-lg hover:bg-emerald-50 text-emerald-800 text-xs font-bold transition-colors"
              title="علامات تنصيص عربية (« نص »)"
            >
              « » اقتباس
            </button>
            <button
              type="button"
              onClick={() => applyFormatting('arabic_comma')}
              className="px-2 py-1 rounded-lg hover:bg-[#FAF8F5] text-[#5A5751] text-xs font-bold transition-colors"
              title="فاصلة عربية (،)"
            >
              ، فاصلة
            </button>
            <button
              type="button"
              onClick={() => applyFormatting('arabic_semicolon')}
              className="px-2 py-1 rounded-lg hover:bg-[#FAF8F5] text-[#5A5751] text-xs font-bold transition-colors"
              title="فاصلة منقوطة (؛)"
            >
              ؛ منقوطة
            </button>
            {activeTab !== 'book' && (
              <button
                type="button"
                onClick={() => applyFormatting('footnote_ref')}
                className="px-2 py-1 rounded-lg hover:bg-blue-50 text-blue-700 text-xs font-bold transition-colors"
                title="إدراج هامش أكاديمي [^1]"
              >
                + هامش [^]
              </button>
            )}
          </div>

          {/* Links & Media */}
          <div className="flex items-center gap-0.5 px-2">
            <button
              type="button"
              onClick={() => applyFormatting('link')}
              className="p-1.5 rounded-lg hover:bg-[#FAF8F5] text-[#5A5751] hover:text-[#2C2C2C] transition-colors"
              title="إدراج رابط ([نص](url))"
            >
              <Link className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsLinkArticleModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
              title="ربط بمقال آخر في الموسوعة (Cross-linking)"
            >
              <Link className="w-3.5 h-3.5" />
              <span>ربط بمقال</span>
            </button>
            <button
              type="button"
              onClick={() => applyFormatting('image')}
              className="p-1.5 rounded-lg hover:bg-[#FAF8F5] text-[#5A5751] hover:text-[#2C2C2C] transition-colors"
              title="إدراج صورة (![وصف](url))"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => applyFormatting('code')}
              className="p-1.5 rounded-lg hover:bg-[#FAF8F5] text-[#5A5751] hover:text-[#2C2C2C] transition-colors"
              title="رمز مضمن (`Code`)"
            >
              <Code className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MAIN STUDIO WORKSPACE */}
      {/* ------------------------------------------------------------- */}
      <div className="p-4 sm:p-6 space-y-6">

        {/* ============================================================= */}
        {/* TRACK 1 & 2: PROFESSIONAL ARTICLE & STUDY STUDIO */}
        {/* ============================================================= */}
        {(activeTab === 'article' || activeTab === 'study') && (
          <div className="space-y-6">
            {/* Top Selector & DRAFT SAVE BUTTONS BAR */}
            <div className="bg-white p-4 rounded-2xl border border-[#E5E2D9] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-2xs">
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <span className="text-xs font-bold text-[#5A5751] shrink-0">
                  {activeTab === 'study' ? 'اختر دراسة للتحرير:' : 'اختر مقالاً للتحرير:'}
                </span>
                <select
                  value={selectedArticleId}
                  onChange={e => loadArticleIntoEditor(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-[#E5E2D9] bg-[#FAF8F5] font-bold text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] max-w-sm w-full"
                >
                  <option value="new">➕ صياغة {activeTab === 'study' ? 'دراسة بحثية جديدة' : 'مقال فكري جديد'}</option>
                  {articles
                    .filter(a => activeTab === 'study' ? a.type === 'study' : (a.type === 'article' || a.type === 'translated_article'))
                    .map(a => (
                      <option key={a.id} value={a.id}>
                        {a.status === 'DRAFT' ? '📝 [مسودة] ' : '✓ [منشور] '} {a.title} ({a.category || 'عام'})
                      </option>
                    ))}
                </select>

                {/* Status Indicator Badge */}
                <span
                  className={`text-xs px-3 py-1 rounded-full font-bold border ${
                    artStatus === 'DRAFT'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  }`}
                >
                  {artStatus === 'DRAFT' ? 'مسودة قيد الكتابة' : 'منشور رسمي بالموسوعة'}
                </span>
              </div>

              {/* DEDICATED BUTTONS: SAVE AS DRAFT vs PUBLISH TO ENCYCLOPEDIA */}
              <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
                {selectedArticleId !== 'new' && onPreviewArticle && (
                  <button
                    type="button"
                    onClick={() => onPreviewArticle(selectedArticleId)}
                    className="px-3.5 py-2 text-xs font-bold rounded-xl border border-[#E5E2D9] bg-[#FAF8F5] hover:bg-white text-[#4A5D4E] flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>معاينة بالقارئ</span>
                  </button>
                )}

                {/* DEDICATED BUTTON 1: SAVE AS DRAFT */}
                <button
                  type="button"
                  id="save-article-draft-btn"
                  onClick={() => handleSaveArticle('DRAFT')}
                  className="px-4 py-2.5 text-xs font-bold rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-98"
                  title="حفظ المقالة كمسودة بدون نشرها للجمهور"
                >
                  <Bookmark className="w-4 h-4 text-amber-700" />
                  <span>حفظ كمسودة (غير منشورة)</span>
                </button>

                {/* DEDICATED BUTTON 2: PUBLISH */}
                <button
                  type="button"
                  id="publish-article-btn"
                  onClick={() => handleSaveArticle('PUBLISHED')}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#4A5D4E] hover:bg-[#3C4C3F] text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-98"
                  title="نشر المقالة رسمياً في الموسوعة"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>نشر فوري في الموسوعة</span>
                </button>
              </div>
            </div>

            {/* Editor Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Content Writing Area (Col Span 2) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-[#E5E2D9] space-y-4 shadow-2xs">
                  <div>
                    <label className="block text-xs font-bold text-[#5A5751] mb-1.5">
                      عنوان {activeTab === 'study' ? 'الدراسة البحثية الأكاديمية' : 'المقالة الفكرية'}:
                    </label>
                    <input
                      type="text"
                      id="article-title-input"
                      value={artTitle}
                      onChange={e => setArtTitle(e.target.value)}
                      placeholder="أدخل عنواناً رصيناً ومعبراً..."
                      className="w-full px-4 py-3 rounded-xl border border-[#E5E2D9] font-amiri font-bold text-xl text-[#2C2C2C] focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#5A5751] mb-1.5">
                      العنوان الفرعي أو التوصيف المعرفي:
                    </label>
                    <input
                      type="text"
                      value={artSubtitle}
                      onChange={e => setArtSubtitle(e.target.value)}
                      placeholder="مثال: قراءة تأويلية في فلسفة العقل والميتافيزيقا المعاصرة"
                      className="w-full px-4 py-2 rounded-xl border border-[#E5E2D9] text-xs text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#5A5751] mb-1.5">
                      المستخلص المكثف (Abstract):
                    </label>
                    <textarea
                      rows={3}
                      value={artAbstract}
                      onChange={e => setArtAbstract(e.target.value)}
                      placeholder="ملخص موجز لجوهر الأطروحة والنتائج الفكرية..."
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2D9] text-xs leading-relaxed text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E]"
                    />
                  </div>

                  {/* Markdown Editor & Live Preview Split Screen */}
                  <div>
                    <label className="block text-xs font-bold text-[#5A5751] mb-1.5">
                      المتن الكامل (يدعم التنسيق المباشر بالماركداون):
                    </label>

                    <div className={`grid ${viewMode === 'split' ? 'grid-cols-1 md:grid-cols-2 gap-4' : 'grid-cols-1'}`}>
                      {/* Editor Pane */}
                      {(viewMode === 'edit' || viewMode === 'split') && (
                        <div className="space-y-1">
                          <div className="text-[11px] font-mono text-[#8E8A83] flex items-center justify-between pb-1">
                            <span>محرر Markdown المباشر:</span>
                            <span>سطور: {artContent.split('\n').length}</span>
                          </div>
                          <textarea
                            ref={articleTextareaRef}
                            id="article-content-textarea"
                            rows={16}
                            value={artContent}
                            onChange={e => setArtContent(e.target.value)}
                            placeholder="اكتب هنا المتن الفكري باستخدام الماركداون أو شريط الأدوات أعلاه. يدعم العناوين والاقتباسات والروابط..."
                            className="w-full p-4 rounded-xl border border-[#E5E2D9] font-amiri text-base sm:text-lg leading-relaxed text-[#2C2C2C] focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/20 bg-white"
                          />
                        </div>
                      )}

                      {/* Live Preview Pane */}
                      {(viewMode === 'preview' || viewMode === 'split') && (
                        <div className="space-y-1">
                          <div className="text-[11px] font-bold text-[#4A5D4E] flex items-center justify-between pb-1">
                            <span>المعاينة المباشرة للقارئ (Live Preview):</span>
                            <span>{textStats.words} كلمة</span>
                          </div>
                          <div className="w-full p-5 rounded-xl border border-[#E5E2D9] bg-[#FAF8F5] min-h-[380px] max-h-[500px] overflow-y-auto">
                            {artContent.trim() ? (
                              <div className="font-amiri text-base sm:text-lg text-[#2C2C2C] leading-loose space-y-4">
                                <Markdown>{artContent}</Markdown>
                              </div>
                            ) : (
                              <div className="text-center py-20 text-[#8E8A83] text-xs">
                                ستظهر هنا المعاينة الحية المنسقة فور بدء الكتابة...
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footnotes & Citations Box */}
                <div className="bg-white p-5 rounded-2xl border border-[#E5E2D9] space-y-4 shadow-2xs">
                  <h4 className="font-amiri font-bold text-base text-[#2C2C2C] flex items-center gap-2">
                    <Quote className="w-4 h-4 text-[#4A5D4E]" />
                    <span>الهوامش التوثيقية والمراجع الأكاديمية</span>
                  </h4>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="أضف هامشاً أو تعليقاً حاشياً..."
                      value={artNewFootnoteInput}
                      onChange={e => setArtNewFootnoteInput(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-[#E5E2D9] text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!artNewFootnoteInput.trim()) return;
                        const nextId = artFootnotes.length + 1;
                        setArtFootnotes([...artFootnotes, { id: nextId, text: artNewFootnoteInput.trim() }]);
                        setArtNewFootnoteInput('');
                      }}
                      className="px-4 py-2 bg-[#FAF8F5] border border-[#E5E2D9] text-xs font-bold text-[#4A5D4E] rounded-xl hover:bg-white cursor-pointer"
                    >
                      + إضافة هامش
                    </button>
                  </div>

                  {artFootnotes.length > 0 && (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {artFootnotes.map((fn, idx) => (
                        <div key={fn.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5] text-xs text-[#5A5751] border border-[#E5E2D9]/60">
                          <span>[{fn.id}] {fn.text}</span>
                          <button
                            type="button"
                            onClick={() => setArtFootnotes(artFootnotes.filter((_, i) => i !== idx))}
                            className="text-rose-500 hover:text-rose-700 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Reference */}
                  <div className="flex gap-2 pt-2 border-t border-[#E5E2D9]">
                    <input
                      type="text"
                      placeholder="أضف مرجعاً ببليوغرافياً (مثال: ابن رشد، تهافت التهافت، دار المعارف)..."
                      value={artNewRefInput}
                      onChange={e => setArtNewRefInput(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-[#E5E2D9] text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!artNewRefInput.trim()) return;
                        setArtReferences([...artReferences, artNewRefInput.trim()]);
                        setArtNewRefInput('');
                      }}
                      className="px-4 py-2 bg-[#FAF8F5] border border-[#E5E2D9] text-xs font-bold text-[#4A5D4E] rounded-xl hover:bg-white cursor-pointer"
                    >
                      + إضافة مرجع
                    </button>
                  </div>

                  {artReferences.length > 0 && (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {artReferences.map((ref, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5] text-xs text-[#5A5751] border border-[#E5E2D9]/60">
                          <span>• {ref}</span>
                          <button
                            type="button"
                            onClick={() => setArtReferences(artReferences.filter((_, i) => i !== idx))}
                            className="text-rose-500 hover:text-rose-700 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar Metadata (Col Span 1) */}
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-[#E5E2D9] space-y-4 shadow-2xs">
                  <h4 className="font-amiri font-bold text-base text-[#2C2C2C] flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#4A5D4E]" />
                    <span>البيانات الوصفية والمعايير الفكرية</span>
                  </h4>

                  <div>
                    <label className="block text-xs font-bold text-[#5A5751] mb-1">اسم الباحث / الكاتب:</label>
                    <input
                      type="text"
                      value={artAuthor}
                      onChange={e => setArtAuthor(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E5E2D9] text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#5A5751] mb-1">الحقل والمجال المعرفي:</label>
                    <select
                      value={artCategory}
                      onChange={e => setArtCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E5E2D9] text-xs font-bold bg-[#FAF8F5]"
                    >
                      {ARTICLE_CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#5A5751] mb-1">نوع المصنف:</label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setArtType('article')}
                        className={`p-2 rounded-xl border text-center font-bold cursor-pointer transition-colors ${
                          artType === 'article' ? 'bg-[#4A5D4E] text-white border-[#4A5D4E]' : 'border-[#E5E2D9] bg-[#FAF8F5]'
                        }`}
                      >
                        مقال فكري
                      </button>
                      <button
                        type="button"
                        onClick={() => setArtType('study')}
                        className={`p-2 rounded-xl border text-center font-bold cursor-pointer transition-colors ${
                          artType === 'study' ? 'bg-[#8C5E45] text-white border-[#8C5E45]' : 'border-[#E5E2D9] bg-[#FAF8F5]'
                        }`}
                      >
                        دراسة محكمة
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#5A5751] mb-1">الوسوم والكلمات الدلالية:</label>
                    <input
                      type="text"
                      value={artTags}
                      onChange={e => setArtTags(e.target.value)}
                      placeholder="وجود، معرفة، حداثة"
                      className="w-full px-3 py-2 rounded-xl border border-[#E5E2D9] text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#5A5751] mb-1">رابط صورة الغلاف (اختياري):</label>
                    <input
                      type="text"
                      value={artCoverImage}
                      onChange={e => setArtCoverImage(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-xl border border-[#E5E2D9] text-xs"
                    />
                  </div>

                  {artType === 'study' && (
                    <div className="pt-3 border-t border-[#E5E2D9] space-y-3">
                      <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/80 text-xs space-y-2.5">
                        <div className="font-bold text-[#8C5E45] flex items-center gap-1.5">
                          <GraduationCap className="w-4 h-4" />
                          <span>معايير البحث العلمي المحكم</span>
                        </div>
                        <div>
                          <label className="block text-[11px] text-[#5A5751] mb-1">المنهجية المتبعة:</label>
                          <input
                            type="text"
                            value={studyMethodology}
                            onChange={e => setStudyMethodology(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-amber-200 text-xs"
                          />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={studyPeerReviewed}
                            onChange={e => setStudyPeerReviewed(e.target.checked)}
                            className="rounded text-[#8C5E45] focus:ring-0 cursor-pointer"
                          />
                          <span className="text-[11px] font-bold text-[#8C5E45]">دراسة محكمة قابلة للاستشهاد</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* TRACK 3: DEDICATED BOOK & CHAPTER AUTHORING STUDIO */}
        {/* ============================================================= */}
        {activeTab === 'book' && (
          <div className="space-y-6">
            {/* Dedicated Chapter Top Navigation Bar */}
            <div className="bg-white p-4 rounded-2xl border border-[#E5E2D9] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-2xs">
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <span className="text-xs font-bold text-[#5A5751] shrink-0">الكتاب / الرواية المستهدفة:</span>
                <select
                  value={selectedBookId}
                  onChange={e => loadBookIntoEditor(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-[#E5E2D9] bg-[#FAF8F5] font-bold text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] max-w-sm w-full"
                >
                  <option value="new">➕ تأليف وإضافة كتاب أو رواية جديدة</option>
                  {novels.map(n => (
                    <option key={n.id} value={n.id}>
                      {n.title} (بقلم: {n.author})
                    </option>
                  ))}
                </select>

                {/* DEDICATED BUTTON: CREATE & FORMAT NEW CHAPTER */}
                <button
                  type="button"
                  id="create-new-chapter-btn"
                  onClick={() => initNewChapterForCurrentBook()}
                  className="px-4 py-2 rounded-xl bg-[#2C2C2C] hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-98"
                  title="بدء تأليف وتنسيق فصل جديد لهذا الكتاب"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>إنشاء وتنسيق فصل جديد</span>
                </button>
              </div>

              {/* Action Buttons for Book & Chapter */}
              <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
                {selectedBookId !== 'new' && onPreviewBook && (
                  <button
                    type="button"
                    onClick={() => onPreviewBook(selectedBookId)}
                    className="px-3 py-2 text-xs font-bold rounded-xl border border-[#E5E2D9] bg-[#FAF8F5] hover:bg-white text-[#4A5D4E] flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>معاينة الكتاب</span>
                  </button>
                )}

                {/* SAVE CHAPTER AS DRAFT */}
                <button
                  type="button"
                  id="save-chapter-draft-btn"
                  onClick={() => handleSaveBookAndChapter('DRAFT')}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-98"
                >
                  <Bookmark className="w-3.5 h-3.5 text-amber-700" />
                  <span>حفظ الفصل كمسودة</span>
                </button>

                {/* SAVE & PUBLISH CHAPTER */}
                <button
                  type="button"
                  id="save-publish-chapter-btn"
                  onClick={() => handleSaveBookAndChapter('PUBLISHED')}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#C88A3B] hover:bg-amber-700 text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-98"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>حفظ ونشر الفصل في الكتاب</span>
                </button>
              </div>
            </div>

            {/* Chapter Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Active Chapter Drafting Canvas (Col Span 2) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-[#E5E2D9] space-y-4 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between border-b border-[#E5E2D9] pb-3 gap-2">
                    <h4 className="font-amiri font-bold text-lg text-[#2C2C2C] flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-600" />
                      <span>استوديو تأليف الفصول السردية والأدبية</span>
                    </h4>

                    {/* Chapter selector */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[#8E8A83]">فصول الكتاب:</span>
                      <select
                        value={selectedChapterId}
                        onChange={e => {
                          const val = e.target.value;
                          setSelectedChapterId(val);
                          if (val === 'new') {
                            initNewChapterForCurrentBook();
                          } else {
                            const c = chapters.find(ch => ch.id === val);
                            if (c) loadChapterIntoEditor(c);
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg border border-[#E5E2D9] text-xs font-bold bg-[#FAF8F5]"
                      >
                        <option value="new">➕ إنشاء فصل جديد...</option>
                        {currentBookChapters.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.status === 'DRAFT' ? '📝 [مسودة] ' : '✓ '} الفصل {c.chapterNumber}: {c.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-1">
                      <label className="block text-xs font-bold text-[#5A5751] mb-1">رقم الفصل:</label>
                      <input
                        type="number"
                        min={1}
                        value={chapNumber}
                        onChange={e => setChapNumber(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-[#E5E2D9] text-xs font-mono font-bold"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-bold text-[#5A5751] mb-1">عنوان الفصل:</label>
                      <input
                        type="text"
                        id="chapter-title-input"
                        value={chapTitle}
                        onChange={e => setChapTitle(e.target.value)}
                        placeholder="مثال: الفصل الأول: في البدء كان السؤال"
                        className="w-full px-3 py-2 rounded-xl border border-[#E5E2D9] text-sm font-amiri font-bold text-[#2C2C2C]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#5A5751] mb-1">
                      افتتاحية الفصل أو استشهاد أدبي (Epigraph / Subtitle):
                    </label>
                    <input
                      type="text"
                      value={chapSubtitle}
                      onChange={e => setChapSubtitle(e.target.value)}
                      placeholder="بيت شعر أو اقتباس فلسفي يمهد لأجواء الفصل..."
                      className="w-full px-3 py-2 rounded-xl border border-[#E5E2D9] text-xs text-[#2C2C2C]"
                    />
                  </div>

                  {/* Chapter Content Editor & Split Preview */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-[#5A5751]">
                        متن الفصل السردي (يدعم الحوار « » وفواصل الفصول ❦ ❦ ❦):
                      </label>
                      <span className="text-[11px] text-[#8E8A83]">
                        {textStats.words} كلمة • {textStats.readTime} دقائق قراءة
                      </span>
                    </div>

                    <div className={`grid ${viewMode === 'split' ? 'grid-cols-1 md:grid-cols-2 gap-4' : 'grid-cols-1'}`}>
                      {/* Editor View */}
                      {(viewMode === 'edit' || viewMode === 'split') && (
                        <textarea
                          ref={chapterTextareaRef}
                          id="chapter-content-textarea"
                          rows={16}
                          value={chapContent}
                          onChange={e => setChapContent(e.target.value)}
                          placeholder="اكتب أحداث الفصل، الحوارات الأدبية، والتأملات الفلسفية هنا..."
                          className="w-full p-4 rounded-xl border border-[#E5E2D9] font-amiri text-base sm:text-lg leading-relaxed text-[#2C2C2C] focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-white"
                        />
                      )}

                      {/* Live Reader Preview for Chapter */}
                      {(viewMode === 'preview' || viewMode === 'split') && (
                        <div className="w-full p-5 rounded-xl border border-[#E5E2D9] bg-[#FAF8F5] min-h-[380px] max-h-[500px] overflow-y-auto">
                          {chapContent.trim() ? (
                            <div className="font-amiri text-base sm:text-lg text-[#2C2C2C] leading-loose space-y-4">
                              <Markdown>{chapContent}</Markdown>
                            </div>
                          ) : (
                            <div className="text-center py-20 text-[#8E8A83] text-xs">
                              ستظهر هنا معاينة قراءة الفصل السردي مباشرة...
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#5A5751] mb-1">
                      ملاحظة أو إهداء المؤلف في خاتمة الفصل (اختياري):
                    </label>
                    <input
                      type="text"
                      value={chapAuthorNote}
                      onChange={e => setChapAuthorNote(e.target.value)}
                      placeholder="كلمة خاصة أو إحالة تاريخية في نهاية الفصل..."
                      className="w-full px-3 py-2 rounded-xl border border-[#E5E2D9] text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Book Metadata & Chapter Index (Col Span 1) */}
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-[#E5E2D9] space-y-4 shadow-2xs">
                  <h4 className="font-amiri font-bold text-base text-[#2C2C2C] flex items-center gap-2">
                    <BookMarked className="w-4 h-4 text-amber-700" />
                    <span>بيانات الكتاب والمصنف الكامل</span>
                  </h4>

                  <div>
                    <label className="block text-xs font-bold text-[#5A5751] mb-1">عنوان الكتاب:</label>
                    <input
                      type="text"
                      value={bookTitle}
                      onChange={e => setBookTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E5E2D9] text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#5A5751] mb-1">المؤلف:</label>
                    <input
                      type="text"
                      value={bookAuthor}
                      onChange={e => setBookAuthor(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E5E2D9] text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#5A5751] mb-1">تصنيف ديوي العشري (Dewey):</label>
                    <select
                      value={bookDeweyCode}
                      onChange={e => setBookDeweyCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E5E2D9] text-xs font-bold bg-[#FAF8F5]"
                    >
                      {DEWEY_DECIMAL_CATEGORIES.map(cat => (
                        <option key={cat.code} value={cat.code}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#5A5751] mb-1">الأنواع الأدبية:</label>
                    <input
                      type="text"
                      value={bookGenres}
                      onChange={e => setBookGenres(e.target.value)}
                      placeholder="رواية، فلسفة، تاريخ"
                      className="w-full px-3 py-2 rounded-xl border border-[#E5E2D9] text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#5A5751] mb-1">نبذة عن الرواية (Synopsis):</label>
                    <textarea
                      rows={4}
                      value={bookSynopsis}
                      onChange={e => setBookSynopsis(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E5E2D9] text-xs leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#5A5751] mb-1">رابط صورة الغلاف:</label>
                    <input
                      type="text"
                      value={bookCoverImage}
                      onChange={e => setBookCoverImage(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-xl border border-[#E5E2D9] text-xs"
                    />
                  </div>
                </div>

                {/* Chapters Index of Selected Book */}
                {currentBookChapters.length > 0 && (
                  <div className="bg-white p-4 rounded-2xl border border-[#E5E2D9] space-y-2 shadow-2xs">
                    <div className="text-xs font-bold text-[#2C2C2C] flex items-center justify-between">
                      <span>فصول الكتاب الحالية ({currentBookChapters.length})</span>
                      <button
                        type="button"
                        onClick={() => initNewChapterForCurrentBook()}
                        className="text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1 text-[11px] cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>فصل جديد</span>
                      </button>
                    </div>

                    <div className="space-y-1 max-h-48 overflow-y-auto pt-1">
                      {currentBookChapters.map(chap => (
                        <div
                          key={chap.id}
                          onClick={() => loadChapterIntoEditor(chap)}
                          className={`p-2 rounded-lg flex items-center justify-between text-xs cursor-pointer transition-colors ${
                            selectedChapterId === chap.id
                              ? 'bg-amber-100 text-amber-900 font-bold border border-amber-200'
                              : 'hover:bg-[#FAF8F5] text-[#5A5751]'
                          }`}
                        >
                          <span className="truncate">
                            فصل {chap.chapterNumber}: {chap.title}
                          </span>
                          <span className="text-[10px] text-[#8E8A83] shrink-0 mr-2">
                            {chap.status === 'DRAFT' ? 'مسودة' : `${chap.wordCount || 0} ك`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* TRACK 4: SMART EDITORIAL & TYPOGRAPHY TOOLS */}
        {/* ============================================================= */}
        {activeTab === 'tools' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tool 1: Arabic Typography & Text Cleaner */}
            <div className="bg-white p-6 rounded-2xl border border-[#E5E2D9] space-y-4 shadow-2xs">
              <div className="flex items-center gap-2 border-b border-[#E5E2D9] pb-3">
                <Wand2 className="w-5 h-5 text-[#4A5D4E]" />
                <div>
                  <h3 className="font-amiri font-bold text-lg text-[#2C2C2C]">
                    مدقق ومحسن النص العربي الذكي
                  </h3>
                  <p className="text-xs text-[#6E6A64]">
                    إزالة شوائب النسخ من Word أو Notion، توحيد علامات التنصيص « » وضبط المسافات والفواصل.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5A5751] mb-1.5">
                  الصق النص الخام هنا:
                </label>
                <textarea
                  rows={6}
                  value={rawTextToClean}
                  onChange={e => setRawTextToClean(e.target.value)}
                  placeholder="الصق أي فقرة منسوخة لمعالجتها وضبطها طباعياً وفق المعايير العربية..."
                  className="w-full p-3.5 rounded-xl border border-[#E5E2D9] text-xs leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRunTextClean}
                  className="px-4 py-2 bg-[#4A5D4E] hover:bg-[#3C4C3F] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>تنقيح وضبط النص الآن</span>
                </button>
              </div>

              {cleanedResultText && (
                <div className="pt-3 border-t border-[#E5E2D9] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#4A5D4E]">النتيجة المنقحة:</span>
                    <button
                      type="button"
                      onClick={handleCopyCleaned}
                      className="text-xs text-[#4A5D4E] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      {copiedCleaned ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCleaned ? 'تم النسخ' : 'نسخ النص'}</span>
                    </button>
                  </div>
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5E2D9] font-amiri text-sm leading-relaxed max-h-48 overflow-y-auto">
                    {cleanedResultText}
                  </div>
                </div>
              )}
            </div>

            {/* Tool 2: Academic Citation Generator */}
            <div className="bg-white p-6 rounded-2xl border border-[#E5E2D9] space-y-4 shadow-2xs">
              <div className="flex items-center gap-2 border-b border-[#E5E2D9] pb-3">
                <Quote className="w-5 h-5 text-[#8C5E45]" />
                <div>
                  <h3 className="font-amiri font-bold text-lg text-[#2C2C2C]">
                    مولد التوثيق الأكاديمي والببليوغرافي
                  </h3>
                  <p className="text-xs text-[#6E6A64]">
                    صياغة وتوليد مراجع الكتب والدراسات وفق المعايير الأكاديمية بنقرة واحدة.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setCitationSourceType('book')}
                  className={`p-2 rounded-xl border font-bold text-center cursor-pointer transition-colors ${
                    citationSourceType === 'book' ? 'bg-[#8C5E45] text-white border-[#8C5E45]' : 'border-[#E5E2D9] bg-[#FAF8F5]'
                  }`}
                >
                  كتاب مطبوع
                </button>
                <button
                  type="button"
                  onClick={() => setCitationSourceType('article')}
                  className={`p-2 rounded-xl border font-bold text-center cursor-pointer transition-colors ${
                    citationSourceType === 'article' ? 'bg-[#8C5E45] text-white border-[#8C5E45]' : 'border-[#E5E2D9] bg-[#FAF8F5]'
                  }`}
                >
                  مقال في دورية
                </button>
                <button
                  type="button"
                  onClick={() => setCitationSourceType('web')}
                  className={`p-2 rounded-xl border font-bold text-center cursor-pointer transition-colors ${
                    citationSourceType === 'web' ? 'bg-[#8C5E45] text-white border-[#8C5E45]' : 'border-[#E5E2D9] bg-[#FAF8F5]'
                  }`}
                >
                  موقع إلكتروني
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[#5A5751] font-bold mb-1">اسم المؤلف/الباحث:</label>
                  <input
                    type="text"
                    value={citeAuthor}
                    onChange={e => setCiteAuthor(e.target.value)}
                    placeholder="مثال: الجابري، محمد عابد"
                    className="w-full px-2.5 py-1.5 border border-[#E5E2D9] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[#5A5751] font-bold mb-1">عنوان المصنف:</label>
                  <input
                    type="text"
                    value={citeTitle}
                    onChange={e => setCiteTitle(e.target.value)}
                    placeholder="تكوين العقل العربي"
                    className="w-full px-2.5 py-1.5 border border-[#E5E2D9] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[#5A5751] font-bold mb-1">دار النشر أو الدورية:</label>
                  <input
                    type="text"
                    value={citePublisher}
                    onChange={e => setCitePublisher(e.target.value)}
                    placeholder="مركز دراسات الوحدة العربية"
                    className="w-full px-2.5 py-1.5 border border-[#E5E2D9] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[#5A5751] font-bold mb-1">سنة النشر والصفحات:</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="text"
                      value={citeYear}
                      onChange={e => setCiteYear(e.target.value)}
                      placeholder="1984"
                      className="w-full px-2 py-1.5 border border-[#E5E2D9] rounded-xl text-center"
                    />
                    <input
                      type="text"
                      value={citePages}
                      onChange={e => setCitePages(e.target.value)}
                      placeholder="ص 45-50"
                      className="w-full px-2 py-1.5 border border-[#E5E2D9] rounded-xl text-center"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateCitation}
                className="w-full py-2.5 bg-[#8C5E45] hover:bg-[#724a35] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>توليد التوثيق الأكاديمي</span>
              </button>

              {generatedCitation && (
                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#8C5E45]">التوثيق المنسق:</span>
                    <button
                      type="button"
                      onClick={handleCopyCitation}
                      className="text-xs text-[#8C5E45] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      {copiedCitation ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCitation ? 'تم النسخ' : 'نسخ التوثيق'}</span>
                    </button>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-amber-200/60 font-amiri text-sm leading-relaxed">
                    {generatedCitation}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Cross-link Article Modal */}
      {isLinkArticleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-cairo animate-fadeIn">
          <div className="bg-white rounded-2xl border border-[#E5E2D9] max-w-md w-full p-5 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E2D9]">
              <h3 className="font-bold text-sm text-[#2C2C2C] flex items-center gap-2">
                <Link className="w-4 h-4 text-[#4A5D4E]" />
                <span>ربط مقال آخر في المتن (Cross-Reference)</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsLinkArticleModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              value={articleSearchTerm}
              onChange={e => setArticleSearchTerm(e.target.value)}
              placeholder="ابحث عن المقال بالعنوان أو الكلمات المفتاحية..."
              className="w-full p-2.5 rounded-xl border border-[#E5E2D9] text-xs outline-none focus:border-[#4A5D4E]"
              autoFocus
            />

            <div className="max-h-64 overflow-y-auto space-y-2 text-xs">
              {articles
                .filter(a => !articleSearchTerm.trim() || a.title.toLowerCase().includes(articleSearchTerm.toLowerCase()))
                .map(a => (
                  <div
                    key={a.id}
                    onClick={() => handleInsertArticleLink(a)}
                    className="p-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F0EDE6] border border-[#E5E2D9] cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <h4 className="font-bold text-stone-900 line-clamp-1 group-hover:text-[#4A5D4E]">{a.title}</h4>
                      <p className="text-[10px] text-stone-500">{a.category || 'فكر وفلسفة'}</p>
                    </div>
                    <span className="text-[11px] font-bold text-[#4A5D4E] bg-white border border-[#4A5D4E]/30 px-2.5 py-1 rounded-lg shadow-2xs group-hover:bg-[#4A5D4E] group-hover:text-white transition-colors shrink-0">
                      إدراج الرابط
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
