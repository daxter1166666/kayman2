import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  AlignRight,
  AlignCenter,
  AlignJustify,
  Link as LinkIcon,
  Highlighter,
  Palette,
  Eye,
  Save,
  Check,
  Plus,
  Trash2,
  Layers,
  Sparkles,
  BookOpenCheck,
  HelpCircle,
  ExternalLink,
  Type,
  ChevronDown,
  X,
  FileText,
  Clock,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { IntellectualItem } from '../types';

export interface ArticleDocumentEditorProps {
  // Document state
  title: string;
  onTitleChange: (val: string) => void;
  subtitle: string;
  onSubtitleChange: (val: string) => void;
  abstract: string;
  onAbstractChange: (val: string) => void;
  content: string;
  onContentChange: (val: string) => void;
  author: string;
  onAuthorChange: (val: string) => void;
  category: string;
  onCategoryChange: (val: string) => void;
  tags: string;
  onTagsChange: (val: string) => void;
  status: 'DRAFT' | 'PUBLISHED';
  articleType: 'article' | 'study' | 'translated_article';
  onArticleTypeChange: (val: 'article' | 'study' | 'translated_article') => void;
  
  // Citations & Footnotes
  footnotes: { id: number; text: string }[];
  onFootnotesChange: (val: { id: number; text: string }[]) => void;
  references: string[];
  onReferencesChange: (val: string[]) => void;

  // Commentary Studies
  commentaryStudies?: Array<{ id: string; title: string; author: string; studyType?: string; content?: string; articleId?: string }>;
  onCommentaryStudiesChange?: (studies: Array<{ id: string; title: string; author: string; studyType?: string; content?: string; articleId?: string }>) => void;

  // Actions
  onSave: (status: 'DRAFT' | 'PUBLISHED') => void;
  onPreview: () => void;
  availableCategories: string[];
  allArticles: IntellectualItem[];
}

// Curated scholarly text colors
const TEXT_COLORS = [
  { name: 'حبري كلاسيكي', hex: '#1F2937', preview: '#1F2937' },
  { name: 'أخضر أكاديمي', hex: '#4A5D4E', preview: '#4A5D4E' },
  { name: 'عنابي أندلسي', hex: '#8C2D19', preview: '#8C2D19' },
  { name: 'كهرماني أدبي', hex: '#B45309', preview: '#B45309' },
  { name: 'كحلي ملكي', hex: '#1E3A8A', preview: '#1E3A8A' },
  { name: 'زمردي نضر', hex: '#059669', preview: '#059669' },
  { name: 'بنفسجي فكري', hex: '#6B21A8', preview: '#6B21A8' },
];

// Curated highlight strips (أشرطة ملونة على الخطوط)
const HIGHLIGHT_STRIPS = [
  { name: 'شريط أصفر فسفوري', hex: '#FEF08A', label: 'أصفر' },
  { name: 'شريط أخضر مائي', hex: '#BBF7D0', label: 'أخضر' },
  { name: 'شريط برتقالي مشرق', hex: '#FED7AA', label: 'برتقالي' },
  { name: 'شريط وردي ناعم', hex: '#FBCFE8', label: 'وردي' },
  { name: 'شريط سماوي شفاف', hex: '#BAE6FD', label: 'سماوي' },
  { name: 'شريط بنفسجي هادئ', hex: '#E9D5FF', label: 'لافندر' },
];

/**
 * Converts initial markdown string to clean visual HTML
 */
function markdownToHtml(md: string): string {
  if (!md) return '<p><br></p>';
  // If it already looks like HTML, return as is
  if (/<(p|div|h[1-6]|blockquote|ul|ol|table|span|mark)[\s>]/i.test(md)) {
    return md;
  }

  const lines = md.split('\n');
  const result: string[] = [];
  let inList = false;
  let inNumberedList = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      if (inList) { result.push('</ul>'); inList = false; }
      if (inNumberedList) { result.push('</ol>'); inNumberedList = false; }
      continue;
    }

    if (trimmed.startsWith('# ')) {
      if (inList) { result.push('</ul>'); inList = false; }
      if (inNumberedList) { result.push('</ol>'); inNumberedList = false; }
      result.push(`<h1 style="font-size: 1.8em; font-weight: bold; margin: 1em 0 0.5em; border-bottom: 2px solid #E5E2D9; padding-bottom: 0.3em; color: #2C2C2C;">${formatInlineMarkdown(trimmed.slice(2))}</h1>`);
      continue;
    }
    if (trimmed.startsWith('## ')) {
      if (inList) { result.push('</ul>'); inList = false; }
      if (inNumberedList) { result.push('</ol>'); inNumberedList = false; }
      result.push(`<h2 style="font-size: 1.45em; font-weight: bold; margin: 1.2em 0 0.4em; color: #4A5D4E;">${formatInlineMarkdown(trimmed.slice(3))}</h2>`);
      continue;
    }
    if (trimmed.startsWith('### ')) {
      if (inList) { result.push('</ul>'); inList = false; }
      if (inNumberedList) { result.push('</ol>'); inNumberedList = false; }
      result.push(`<h3 style="font-size: 1.25em; font-weight: bold; margin: 1em 0 0.3em; color: #2C2C2C;">${formatInlineMarkdown(trimmed.slice(4))}</h3>`);
      continue;
    }
    if (trimmed.startsWith('> ')) {
      if (inList) { result.push('</ul>'); inList = false; }
      if (inNumberedList) { result.push('</ol>'); inNumberedList = false; }
      result.push(`<blockquote style="margin: 1.4em 0; padding: 1.1em 1.5em; border-right: 4px solid #4A5D4E; background-color: #F7F5EE; border-radius: 8px; font-style: italic; color: #3C4C3F; line-height: 1.9;">« ${formatInlineMarkdown(trimmed.slice(2))} »</blockquote>`);
      continue;
    }
    if (trimmed === '---' || trimmed === '***') {
      if (inList) { result.push('</ul>'); inList = false; }
      if (inNumberedList) { result.push('</ol>'); inNumberedList = false; }
      result.push('<hr style="margin: 2em 0; border: none; border-top: 1px solid #E5E2D9;" />');
      continue;
    }
    if (/^[*-]\s+/.test(trimmed)) {
      if (!inList) { result.push('<ul style="list-style-type: disc; padding-right: 1.5em; margin: 0.8em 0;">'); inList = true; }
      result.push(`<li style="margin-bottom: 0.4em;">${formatInlineMarkdown(trimmed.replace(/^[*-]\s+/, ''))}</li>`);
      continue;
    }
    if (/^\d+\.\s+/.test(trimmed)) {
      if (!inNumberedList) { result.push('<ol style="list-style-type: decimal; padding-right: 1.5em; margin: 0.8em 0;">'); inNumberedList = true; }
      result.push(`<li style="margin-bottom: 0.4em;">${formatInlineMarkdown(trimmed.replace(/^\d+\.\s+/, ''))}</li>`);
      continue;
    }

    if (inList) { result.push('</ul>'); inList = false; }
    if (inNumberedList) { result.push('</ol>'); inNumberedList = false; }
    result.push(`<p style="margin-bottom: 1.2em; line-height: 2.1;">${formatInlineMarkdown(trimmed)}</p>`);
  }

  if (inList) result.push('</ul>');
  if (inNumberedList) result.push('</ol>');

  return result.join('\n');
}

function formatInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.*?)\*/g, '<i>$1</i>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color: #4A5D4E; text-decoration: underline; font-weight: bold;">$1</a>');
}

export const ArticleDocumentEditor: React.FC<ArticleDocumentEditorProps> = ({
  title,
  onTitleChange,
  subtitle,
  onSubtitleChange,
  abstract,
  onAbstractChange,
  content,
  onContentChange,
  author,
  onAuthorChange,
  category,
  onCategoryChange,
  tags,
  onTagsChange,
  status,
  articleType,
  onArticleTypeChange,
  footnotes,
  onFootnotesChange,
  references,
  onReferencesChange,
  commentaryStudies = [],
  onCommentaryStudiesChange,
  onSave,
  onPreview,
  availableCategories,
  allArticles
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInternalUpdatingRef = useRef<boolean>(false);

  // Typography & Appearance
  const [activeFont, setActiveFont] = useState<'font-amiri' | 'font-cairo' | 'font-serif'>('font-amiri');
  const [fontSize, setFontSize] = useState<string>('text-lg sm:text-xl');

  // Floating Toolbar coordinates
  const [floatingPos, setFloatingPos] = useState<{ top: number; left: number } | null>(null);
  const [hasSelection, setHasSelection] = useState<boolean>(false);

  // Popover menus
  const [showColorMenu, setShowColorMenu] = useState<boolean>(false);
  const [showHighlightMenu, setShowHighlightMenu] = useState<boolean>(false);
  const [showLinkModal, setShowLinkModal] = useState<boolean>(false);
  const [linkUrl, setLinkUrl] = useState<string>('https://');
  const [linkText, setLinkText] = useState<string>('');

  // Cross-link to other articles modal
  const [showCrossLinkModal, setShowCrossLinkModal] = useState<boolean>(false);
  const [crossLinkSearch, setCrossLinkSearch] = useState<string>('');

  // Dedicated Commentary Studies modal (زر الدراسات التعقيبية)
  const [showCommentaryModal, setShowCommentaryModal] = useState<boolean>(false);
  const [commentaryTab, setCommentaryTab] = useState<'insert_inline' | 'link_existing'>('insert_inline');
  const [commTitle, setCommTitle] = useState<string>('');
  const [commAuthor, setCommAuthor] = useState<string>('د. باحث معقّب');
  const [commMethodology, setCommMethodology] = useState<string>('استدراك فينومينولوجي نقدي');
  const [commContent, setCommContent] = useState<string>('');

  // Abstract expand state
  const [isAbstractExpanded, setIsAbstractExpanded] = useState<boolean>(Boolean(abstract));

  // Footnote addition input
  const [newFootnoteText, setNewFootnoteText] = useState<string>('');
  const [newRefText, setNewRefText] = useState<string>('');

  // Initialize editor content with visual HTML
  useEffect(() => {
    if (editorRef.current && !isInternalUpdatingRef.current) {
      const initialHtml = markdownToHtml(content);
      if (editorRef.current.innerHTML !== initialHtml) {
        editorRef.current.innerHTML = initialHtml;
      }
    }
  }, [content]);

  // Handle content change in contentEditable
  const handleEditorInput = useCallback(() => {
    if (editorRef.current) {
      isInternalUpdatingRef.current = true;
      const html = editorRef.current.innerHTML;
      onContentChange(html);
      setTimeout(() => {
        isInternalUpdatingRef.current = false;
      }, 50);
    }
  }, [onContentChange]);

  // Track selection for floating toolbar
  const updateSelectionStatus = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !editorRef.current) {
      setHasSelection(false);
      setFloatingPos(null);
      return;
    }

    // Check if selection is inside editor
    if (!editorRef.current.contains(selection.anchorNode)) {
      setHasSelection(false);
      setFloatingPos(null);
      return;
    }

    try {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();

      if (rect && containerRect) {
        setHasSelection(true);
        const top = Math.max(10, rect.top - containerRect.top - 54);
        const left = Math.min(
          containerRect.width - 240,
          Math.max(20, rect.left - containerRect.left + rect.width / 2 - 160)
        );
        setFloatingPos({ top, left });
      }
    } catch {
      setHasSelection(false);
    }
  }, []);

  useEffect(() => {
    const handleMouseUp = () => {
      setTimeout(updateSelectionStatus, 10);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Shift'].includes(e.key)) {
        setTimeout(updateSelectionStatus, 10);
      }
    };

    document.addEventListener('selectionchange', updateSelectionStatus);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('selectionchange', updateSelectionStatus);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [updateSelectionStatus]);

  // Format commands
  const exec = (command: string, arg?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    handleEditorInput();
  };

  const applyTextColor = (colorHex: string) => {
    exec('foreColor', colorHex);
    setShowColorMenu(false);
  };

  const applyHighlightStrip = (colorHex: string) => {
    editorRef.current?.focus();
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedContent = range.extractContents();
      const mark = document.createElement('mark');
      mark.style.backgroundColor = colorHex;
      mark.style.color = 'inherit';
      mark.style.padding = '2px 6px';
      mark.style.borderRadius = '4px';
      mark.style.fontWeight = '500';
      mark.appendChild(selectedContent);
      range.insertNode(mark);
      handleEditorInput();
    } else {
      exec('hiliteColor', colorHex);
    }
    setShowHighlightMenu(false);
  };

  const removeHighlight = () => {
    exec('hiliteColor', 'transparent');
    setShowHighlightMenu(false);
  };

  // Insert Custom Academic Blockquote
  const insertPhilosophicalQuote = () => {
    editorRef.current?.focus();
    const selection = window.getSelection();
    const selectedText = selection?.toString() || 'اكتب هنا الاقتباس الفكري أو الشاهد الفلسفي المأثور...';
    const html = `<blockquote style="margin: 1.6em 0; padding: 1.2em 1.8em; border-right: 4px solid #4A5D4E; background-color: #F7F5EE; font-style: italic; color: #3C4C3F; border-radius: 8px; font-size: 1.05em; line-height: 2;">« ${selectedText} »</blockquote><p><br></p>`;
    document.execCommand('insertHTML', false, html);
    handleEditorInput();
  };

  // Insert Footnote citation in-place
  const insertFootnoteReference = () => {
    const nextId = footnotes.length + 1;
    const placeholderText = `هامش توثيقي رقم [${nextId}]`;
    const updated = [...footnotes, { id: nextId, text: placeholderText }];
    onFootnotesChange(updated);

    editorRef.current?.focus();
    const html = `<sup style="margin: 0 4px; font-weight: bold; color: #4A5D4E; background: #EBF3ED; padding: 1px 6px; border-radius: 4px; border: 1px solid #C8DEC9; font-size: 0.75em;" contenteditable="false">[^${nextId}]</sup> `;
    document.execCommand('insertHTML', false, html);
    handleEditorInput();
  };

  // Open Link Dialog
  const handleOpenLinkModal = () => {
    const selection = window.getSelection();
    const selectedText = selection?.toString() || '';
    setLinkText(selectedText);
    setLinkUrl('https://');
    setShowLinkModal(true);
  };

  // Insert Link
  const handleApplyLink = () => {
    if (!linkUrl.trim()) return;
    editorRef.current?.focus();
    const textToUse = linkText.trim() || linkUrl.trim();
    const html = `<a href="${linkUrl.trim()}" target="_blank" rel="noopener noreferrer" style="color: #4A5D4E; text-decoration: underline; font-weight: bold;">${textToUse}</a>`;
    document.execCommand('insertHTML', false, html);
    handleEditorInput();
    setShowLinkModal(false);
  };

  // Apply Cross-link to another article
  const handleInsertCrossLink = (art: IntellectualItem) => {
    editorRef.current?.focus();
    const linkLabel = `«${art.title}»`;
    const html = `<a href="/?article=${art.id}" data-article-id="${art.id}" style="color: #4A5D4E; text-decoration: underline; font-weight: bold; background: #EBF3ED; padding: 2px 6px; border-radius: 6px;">${linkLabel}</a> `;
    document.execCommand('insertHTML', false, html);
    handleEditorInput();
    setShowCrossLinkModal(false);
  };

  // Insert Inline Commentary Study Box (زر الدراسات التعقيبية)
  const handleInsertCommentaryStudy = () => {
    if (!commTitle.trim() || !commContent.trim()) return;
    editorRef.current?.focus();

    const studyBoxHtml = `
      <div class="commentary-study-card" style="margin: 1.8em 0; padding: 1.3em 1.6em; border-right: 5px solid #8C5E45; background-color: #FAF7F2; border-radius: 12px; border: 1px solid #EADBCE; box-shadow: 0 1px 3px rgba(0,0,0,0.03);" contenteditable="false">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #D5C5B5; padding-bottom: 10px; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.3em;">⚖️</span>
            <strong style="color: #8C5E45; font-size: 1.1em; font-family: Amiri, serif;">دراسة تعقيبية: ${commTitle.trim()}</strong>
            ${commMethodology ? `<span style="font-size: 0.75em; background: #8C5E45; color: white; padding: 2px 8px; border-radius: 9999px; font-weight: bold;">${commMethodology.trim()}</span>` : ''}
          </div>
          <span style="font-size: 0.85em; color: #6E6A64; font-weight: bold;">الباحث: ${commAuthor.trim() || 'باحث معقّب'}</span>
        </div>
        <div style="font-size: 0.98em; color: #3A3834; line-height: 2.1; font-family: Amiri, serif;">${commContent.trim()}</div>
      </div>
      <p><br></p>
    `;

    document.execCommand('insertHTML', false, studyBoxHtml);
    handleEditorInput();

    // Also register in commentary studies state if available
    if (onCommentaryStudiesChange) {
      const newStudy = {
        id: `comm-${Date.now()}`,
        title: commTitle.trim(),
        author: commAuthor.trim() || 'باحث معقّب',
        studyType: commMethodology.trim() || 'دراسة تعقيبية',
        content: commContent.trim()
      };
      onCommentaryStudiesChange([...commentaryStudies, newStudy]);
    }

    setCommTitle('');
    setCommContent('');
    setShowCommentaryModal(false);
  };

  // Link existing study from encyclopedia
  const handleLinkExistingStudy = (study: IntellectualItem) => {
    if (onCommentaryStudiesChange) {
      if (!commentaryStudies.some(c => c.id === study.id)) {
        onCommentaryStudiesChange([
          ...commentaryStudies,
          {
            id: study.id,
            title: study.title,
            author: study.author || 'أيمن كناني',
            studyType: study.category || 'دراسة محكمة',
            content: study.abstract || study.content?.slice(0, 200) || '',
            articleId: study.id
          }
        ]);
      }
    }
    // Also insert a badge in text
    editorRef.current?.focus();
    const html = `<div style="margin: 1.5em 0; padding: 1em 1.4em; border-right: 4px solid #8C5E45; background: #FAF7F2; border-radius: 10px; border: 1px solid #EADBCE;" contenteditable="false"><span style="font-size: 1.1em;">📚</span> <strong style="color: #8C5E45;">دراسة تعقيبية مرتبطة:</strong> <a href="/?article=${study.id}" style="color: #8C5E45; text-decoration: underline; font-weight: bold;">${study.title}</a> <span style="font-size: 0.85em; color: #6E6A64;">— بقلم: ${study.author}</span></div><p><br></p>`;
    document.execCommand('insertHTML', false, html);
    handleEditorInput();
    setShowCommentaryModal(false);
  };

  // Calculate word count
  const rawText = editorRef.current?.innerText || content.replace(/<[^>]+>/g, ' ');
  const wordCount = rawText.trim() ? rawText.trim().split(/\s+/).length : 0;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 180));

  return (
    <div ref={containerRef} className="relative w-full font-cairo">
      {/* ------------------------------------------------------------- */}
      {/* TOP STUDIO TOOLBAR & ACTION HEADER (مربوط بصفحة الكتابة) */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white border border-[#E5E2D9] rounded-2xl p-3.5 mb-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Left: Article Metadata Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-[#4A5D4E] bg-[#EBF3ED] px-3 py-1.5 rounded-xl border border-[#C8DEC9] flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{articleType === 'study' ? 'دراسة بحثية محكمة' : 'مقال فكري'}</span>
          </span>

          <span className="text-[#5A5751] bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-[#E5E2D9] flex items-center gap-1.5 font-bold">
            <FileText className="w-3.5 h-3.5 text-[#4A5D4E]" />
            <span>{wordCount} كلمة</span>
          </span>

          <span className="text-[#5A5751] bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-[#E5E2D9] flex items-center gap-1.5 font-bold">
            <Clock className="w-3.5 h-3.5 text-[#8C5E45]" />
            <span>{readTimeMinutes} دقيقة قراءة</span>
          </span>

          <span
            className={`px-3 py-1 rounded-full font-bold border ${
              status === 'DRAFT'
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-emerald-100 text-emerald-900 border-emerald-300'
            }`}
          >
            {status === 'DRAFT' ? 'مسودة قيد الكتابة' : 'منشور رسمي بالموسوعة'}
          </span>
        </div>

        {/* Right: Dedicated Action Buttons (Preview, Save Draft, Publish) */}
        <div className="flex flex-wrap items-center gap-2 justify-end">
          {/* DEDICATED PREVIEW BUTTON (زر معاينة لوحده دون تقسيم الشاشة) */}
          <button
            type="button"
            id="article-dedicated-preview-btn"
            onClick={onPreview}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-[#4A5D4E] bg-[#FAF8F5] hover:bg-white text-[#4A5D4E] flex items-center gap-2 cursor-pointer shadow-2xs transition-all hover:shadow-xs"
            title="معاينة كاملة للمقال كما سيراه القارئ مع خيارات القراءة المريحة"
          >
            <Eye className="w-4 h-4 text-[#4A5D4E]" />
            <span>معاينة المقال للقارئ</span>
          </button>

          {/* DEDICATED SAVE DRAFT BUTTON */}
          <button
            type="button"
            id="article-save-draft-btn"
            onClick={() => onSave('DRAFT')}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
            title="حفظ المقال كمسودة للعودة إليها لاحقاً دون نشرها للعامة"
          >
            <Save className="w-3.5 h-3.5" />
            <span>حفظ كمسودة</span>
          </button>

          {/* DEDICATED PUBLISH BUTTON */}
          <button
            type="button"
            id="article-publish-encyclopedia-btn"
            onClick={() => onSave('PUBLISHED')}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-[#4A5D4E] hover:bg-[#3D4E41] text-white flex items-center gap-2 cursor-pointer shadow-xs transition-all"
            title="اعتماد ونشر المقال رسمياً في الموسوعة لجميع القراء والباحثين"
          >
            <Check className="w-4 h-4" />
            <span>نشر رسمي بالموسوعة</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* FLOATING & PINNED RICH TEXT FORMATTING TOOLBAR */}
      {/* (شريط أدوات عائم يتيح تنسيق الخطوط، إضافة الروابط، وتنسيق الفقرات) */}
      {/* ------------------------------------------------------------- */}
      <div
        className={`z-30 transition-all duration-200 ${
          hasSelection && floatingPos
            ? 'absolute shadow-xl border border-[#4A5D4E]/30 animate-fadeIn'
            : 'sticky top-2 shadow-xs border border-[#E5E2D9] mb-4'
        } bg-white/95 backdrop-blur-md rounded-2xl p-1.5 flex flex-wrap items-center gap-1 max-w-full`}
        style={
          hasSelection && floatingPos
            ? { top: `${floatingPos.top}px`, left: `${floatingPos.left}px` }
            : {}
        }
      >
        {/* 1. Font Family Switcher */}
        <select
          value={activeFont}
          onChange={e => setActiveFont(e.target.value as any)}
          className="px-2 py-1.5 text-xs font-bold rounded-lg border border-[#E5E2D9] bg-[#FAF8F5] text-[#2C2C2C] focus:outline-none cursor-pointer"
          title="تغيير نوع الخط للمتن"
        >
          <option value="font-amiri">خط الأميري (فلسفي رصين)</option>
          <option value="font-cairo">خط كايرو (عصري واضح)</option>
          <option value="font-serif">خط النسخ (تراثي أصيل)</option>
        </select>

        <div className="h-5 w-px bg-[#E5E2D9] mx-0.5" />

        {/* 2. Font Style Controls (Bold, Italic, Underline, Strikethrough) */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => exec('bold')}
            className="p-1.5 rounded-lg hover:bg-[#FAF8F5] text-[#2C2C2C] transition-colors"
            title="عريض (Bold)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('italic')}
            className="p-1.5 rounded-lg hover:bg-[#FAF8F5] text-[#2C2C2C] transition-colors"
            title="مائل (Italic)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('underline')}
            className="p-1.5 rounded-lg hover:bg-[#FAF8F5] text-[#2C2C2C] transition-colors"
            title="تسطير (Underline)"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('strikeThrough')}
            className="p-1.5 rounded-lg hover:bg-[#FAF8F5] text-[#5A5751] transition-colors"
            title="شطب (Strikethrough)"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
        </div>

        <div className="h-5 w-px bg-[#E5E2D9] mx-0.5" />

        {/* 3. TEXT COLOR PICKER (تلوين الخطوط) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowColorMenu(!showColorMenu);
              setShowHighlightMenu(false);
            }}
            className="px-2 py-1.5 rounded-lg hover:bg-[#FAF8F5] text-[#2C2C2C] text-xs font-bold flex items-center gap-1 transition-colors"
            title="تلوين الخط (Font Color)"
          >
            <Palette className="w-4 h-4 text-[#8C5E45]" />
            <span className="hidden sm:inline">لون الخط</span>
            <ChevronDown className="w-3 h-3 text-[#5A5751]" />
          </button>

          {showColorMenu && (
            <div className="absolute top-full mt-1.5 right-0 bg-white border border-[#E5E2D9] rounded-xl p-2 shadow-lg z-50 w-52 space-y-1 animate-fadeIn">
              <span className="block text-[11px] font-bold text-[#5A5751] px-1 pb-1 border-b border-[#E5E2D9]">
                اختر لون الخط:
              </span>
              <div className="grid grid-cols-2 gap-1 pt-1">
                {TEXT_COLORS.map(c => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => applyTextColor(c.hex)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#FAF8F5] text-xs text-right cursor-pointer"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0" style={{ backgroundColor: c.preview }} />
                    <span className="truncate">{c.name}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => applyTextColor('#2C2C2C')}
                className="w-full text-center text-xs py-1 text-stone-500 hover:bg-[#FAF8F5] rounded-lg mt-1 pt-1 border-t border-[#E5E2D9]"
              >
                إعادة ضبط (تلقائي)
              </button>
            </div>
          )}
        </div>

        {/* 4. HIGHLIGHT STRIP PICKER (وضع شريط ملون على الخطوط) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowHighlightMenu(!showHighlightMenu);
              setShowColorMenu(false);
            }}
            className="px-2 py-1.5 rounded-lg hover:bg-[#FAF8F5] text-[#2C2C2C] text-xs font-bold flex items-center gap-1 transition-colors"
            title="وضع شريط ملون على الخطوط (Highlight)"
          >
            <Highlighter className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">شريط ملون</span>
            <ChevronDown className="w-3 h-3 text-[#5A5751]" />
          </button>

          {showHighlightMenu && (
            <div className="absolute top-full mt-1.5 right-0 bg-white border border-[#E5E2D9] rounded-xl p-2 shadow-lg z-50 w-56 space-y-1 animate-fadeIn">
              <span className="block text-[11px] font-bold text-[#5A5751] px-1 pb-1 border-b border-[#E5E2D9]">
                وضع شريط ملون على الخطوط:
              </span>
              <div className="grid grid-cols-2 gap-1 pt-1">
                {HIGHLIGHT_STRIPS.map(h => (
                  <button
                    key={h.hex}
                    type="button"
                    onClick={() => applyHighlightStrip(h.hex)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#FAF8F5] text-xs text-right cursor-pointer"
                  >
                    <span
                      className="w-4 h-3 rounded-sm border border-black/10 shrink-0"
                      style={{ backgroundColor: h.hex }}
                    />
                    <span className="truncate">{h.label}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={removeHighlight}
                className="w-full text-center text-xs py-1 text-stone-500 hover:bg-[#FAF8F5] rounded-lg mt-1 pt-1 border-t border-[#E5E2D9]"
              >
                مسح الشريط الملون (شفاف)
              </button>
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-[#E5E2D9] mx-0.5" />

        {/* 5. Paragraph Headings & Quotes (تنسيق الفقرات) */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => exec('formatBlock', '<h1>')}
            className="p-1.5 rounded-lg hover:bg-[#FAF8F5] text-[#2C2C2C] text-xs font-bold"
            title="عنوان رئيسي (H1)"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('formatBlock', '<h2>')}
            className="p-1.5 rounded-lg hover:bg-[#FAF8F5] text-[#2C2C2C] text-xs font-bold"
            title="عنوان فرعي (H2)"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('formatBlock', '<h3>')}
            className="p-1.5 rounded-lg hover:bg-[#FAF8F5] text-[#2C2C2C] text-xs font-bold"
            title="مبحث فكري (H3)"
          >
            <Heading3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('formatBlock', '<p>')}
            className="p-1.5 rounded-lg hover:bg-[#FAF8F5] text-[#2C2C2C] text-xs font-bold"
            title="فقرة عادية (Normal Paragraph)"
          >
            <Type className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={insertPhilosophicalQuote}
            className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-800 text-xs font-bold"
            title="اقتباس فلسفي (Blockquote)"
          >
            <Quote className="w-4 h-4" />
          </button>
        </div>

        <div className="h-5 w-px bg-[#E5E2D9] mx-0.5" />

        {/* 6. Alignment & Lists */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => exec('justifyRight')}
            className="p-1.5 rounded-lg hover:bg-[#FAF8F5] text-[#5A5751] hover:text-[#2C2C2C]"
            title="محاذاة لليمين"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('justifyCenter')}
            className="p-1.5 rounded-lg hover:bg-[#FAF8F5] text-[#5A5751] hover:text-[#2C2C2C]"
            title="توسيط"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('justifyFull')}
            className="p-1.5 rounded-lg hover:bg-[#FAF8F5] text-[#5A5751] hover:text-[#2C2C2C]"
            title="ضبط المتن (Justify)"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('insertUnorderedList')}
            className="p-1.5 rounded-lg hover:bg-[#FAF8F5] text-[#5A5751] hover:text-[#2C2C2C]"
            title="قائمة نقطية"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('insertOrderedList')}
            className="p-1.5 rounded-lg hover:bg-[#FAF8F5] text-[#5A5751] hover:text-[#2C2C2C]"
            title="قائمة مرقمة"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>

        <div className="h-5 w-px bg-[#E5E2D9] mx-0.5" />

        {/* 7. Links & Cross-linking (إضافة الروابط والربط بالمقالات) */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleOpenLinkModal}
            className="p-1.5 rounded-lg hover:bg-[#FAF8F5] text-[#4A5D4E] hover:text-[#2C2C2C] flex items-center gap-1 text-xs font-bold"
            title="إدراج رابط مباشر (Hyperlink)"
          >
            <LinkIcon className="w-4 h-4" />
            <span className="hidden lg:inline">رابط</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCrossLinkModal(true)}
            className="px-2 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
            title="ربط بمقال آخر في الموسوعة"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">ربط بمقال</span>
          </button>

          <button
            type="button"
            onClick={insertFootnoteReference}
            className="px-2 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
            title="إدراج رقم هامش أكاديمي [^]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>هامش</span>
          </button>
        </div>

        <div className="h-5 w-px bg-[#E5E2D9] mx-0.5" />

        {/* 8. DEDICATED COMMENTARY STUDIES BUTTON (زر الدراسات التعقيبية) */}
        <button
          type="button"
          id="commentary-studies-dedicated-btn"
          onClick={() => setShowCommentaryModal(true)}
          className="px-3 py-1.5 rounded-xl bg-[#8C5E45] hover:bg-[#724B36] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all hover:scale-[1.02]"
          title="إدراج دراسة تعقيبية أو ربط دراسة نقدية استدراكية بالمقال"
        >
          <BookOpenCheck className="w-4 h-4" />
          <span>الدراسات التعقيبية</span>
          {commentaryStudies.length > 0 && (
            <span className="bg-white/20 text-white px-1.5 py-0.2 rounded-full text-[10px]">
              {commentaryStudies.length}
            </span>
          )}
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SEAMLESS MANUSCRIPT DOCUMENT CANVAS (المحرر مربوط بصفحة الكتابة) */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-3xl border border-[#E5E2D9] shadow-sm max-w-4xl mx-auto p-6 sm:p-12 space-y-6 min-h-[750px] relative transition-all">
        
        {/* Document Header Line: Category & Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E5E2D9]/80 text-xs text-[#5A5751]">
          <div className="flex items-center gap-2">
            <span className="font-bold">المجال المعرفي:</span>
            <select
              value={category}
              onChange={e => onCategoryChange(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-[#E5E2D9] bg-[#FAF8F5] font-bold text-[#2C2C2C] focus:outline-none"
            >
              {availableCategories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold">الباحث / الكاتب:</span>
            <input
              type="text"
              value={author}
              onChange={e => onAuthorChange(e.target.value)}
              placeholder="اسم الباحث..."
              className="px-2.5 py-1 rounded-lg border border-[#E5E2D9] bg-[#FAF8F5] text-xs font-bold text-[#2C2C2C] focus:outline-none w-36"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold">الوسوم:</span>
            <input
              type="text"
              value={tags}
              onChange={e => onTagsChange(e.target.value)}
              placeholder="فلسفة، معرفة، عقل..."
              className="px-2.5 py-1 rounded-lg border border-[#E5E2D9] bg-[#FAF8F5] text-xs text-[#2C2C2C] focus:outline-none w-44"
            />
          </div>
        </div>

        {/* Article Title Input (Integrated seamlessly as the document headline) */}
        <div>
          <input
            type="text"
            id="article-document-title-input"
            value={title}
            onChange={e => onTitleChange(e.target.value)}
            placeholder="أدخل عنوان المقالة الفكرية أو الدراسة هنا..."
            className="w-full font-amiri font-bold text-2xl sm:text-4xl text-[#2C2C2C] placeholder:text-[#8E8A83]/50 focus:outline-none leading-tight border-none p-0 bg-transparent"
          />
        </div>

        {/* Subtitle / Conceptual Epigraph */}
        <div>
          <input
            type="text"
            id="article-document-subtitle-input"
            value={subtitle}
            onChange={e => onSubtitleChange(e.target.value)}
            placeholder="العنوان الفرعي أو التوصيف المعرفي (مثال: قراءة نقدية في حدود النماذج التوليدية)..."
            className="w-full font-amiri text-lg sm:text-xl text-[#5A5751] placeholder:text-[#8E8A83]/40 focus:outline-none border-none p-0 bg-transparent"
          />
        </div>

        {/* Academic Abstract Accordion */}
        <div className="rounded-2xl border border-[#E5E2D9] bg-[#FAF8F5] p-4 transition-all">
          <button
            type="button"
            onClick={() => setIsAbstractExpanded(!isAbstractExpanded)}
            className="w-full flex items-center justify-between text-xs font-bold text-[#4A5D4E] cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#4A5D4E]" />
              <span>المستخلص الأكاديمي المكثف (Abstract)</span>
              {abstract.trim() && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  مكتمل
                </span>
              )}
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isAbstractExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isAbstractExpanded && (
            <div className="pt-3 animate-fadeIn">
              <textarea
                rows={3}
                value={abstract}
                onChange={e => onAbstractChange(e.target.value)}
                placeholder="ملخص موجز لجوهر الأطروحة والنتائج الفكرية التي تعالجها الدراسة..."
                className="w-full p-3 rounded-xl border border-[#E5E2D9] bg-white text-xs leading-relaxed text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E]"
              />
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* WYSIWYG REAL-TIME CONTENT CANVAS (بدون ظهور أكواد ماركداون) */}
        {/* ------------------------------------------------------------- */}
        <div className="pt-2">
          <div
            ref={editorRef}
            id="article-wysiwyg-content-area"
            contentEditable
            suppressContentEditableWarning
            onInput={handleEditorInput}
            className={`min-h-[460px] focus:outline-none text-[#2C2C2C] leading-loose text-justify ${activeFont} ${fontSize}`}
            style={{
              outline: 'none',
              wordBreak: 'break-word',
            }}
          />
        </div>

        {/* ------------------------------------------------------------- */}
        {/* INTEGRATED FOOTNOTES & REFERENCES DOCK AT PAGE BOTTOM */}
        {/* ------------------------------------------------------------- */}
        <div className="pt-8 border-t border-[#E5E2D9] space-y-6">
          {/* 1. Footnotes Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-amiri font-bold text-base text-[#2C2C2C] flex items-center gap-2">
                <Quote className="w-4 h-4 text-[#4A5D4E]" />
                <span>الهوامش التوثيقية التابعة للمقال ({footnotes.length}):</span>
              </h4>
            </div>

            {/* Input to add footnote */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newFootnoteText}
                onChange={e => setNewFootnoteText(e.target.value)}
                placeholder="أضف هامشاً أو توثيقاً إحائياً..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#E5E2D9] bg-[#FAF8F5]"
              />
              <button
                type="button"
                onClick={() => {
                  if (!newFootnoteText.trim()) return;
                  const nextId = footnotes.length + 1;
                  onFootnotesChange([...footnotes, { id: nextId, text: newFootnoteText.trim() }]);
                  setNewFootnoteText('');
                }}
                className="px-4 py-2 bg-[#FAF8F5] border border-[#E5E2D9] text-xs font-bold text-[#4A5D4E] rounded-xl hover:bg-white cursor-pointer"
              >
                + إضافة هامش
              </button>
            </div>

            {footnotes.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto pt-1">
                {footnotes.map((fn, idx) => (
                  <div
                    key={fn.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5] text-xs text-[#5A5751] border border-[#E5E2D9]"
                  >
                    <span>
                      <strong className="text-[#4A5D4E] ml-1">[{fn.id}]</strong> {fn.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => onFootnotesChange(footnotes.filter((_, i) => i !== idx))}
                      className="text-rose-500 hover:text-rose-700 cursor-pointer p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. References Section */}
          <div className="space-y-3 pt-4 border-t border-[#E5E2D9]/60">
            <h4 className="font-amiri font-bold text-base text-[#2C2C2C] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#8C5E45]" />
              <span>قائمة المصادر والمراجع الأكاديمية ({references.length}):</span>
            </h4>

            <div className="flex gap-2">
              <input
                type="text"
                value={newRefText}
                onChange={e => setNewRefText(e.target.value)}
                placeholder="أضف مرجعاً ببليوغرافياً (مثال: ابن رشد، تهافت التهافت، دار المعارف)..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#E5E2D9] bg-[#FAF8F5]"
              />
              <button
                type="button"
                onClick={() => {
                  if (!newRefText.trim()) return;
                  onReferencesChange([...references, newRefText.trim()]);
                  setNewRefText('');
                }}
                className="px-4 py-2 bg-[#FAF8F5] border border-[#E5E2D9] text-xs font-bold text-[#8C5E45] rounded-xl hover:bg-white cursor-pointer"
              >
                + إضافة مرجع
              </button>
            </div>

            {references.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto pt-1">
                {references.map((ref, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5] text-xs text-[#5A5751] border border-[#E5E2D9]"
                  >
                    <span>• {ref}</span>
                    <button
                      type="button"
                      onClick={() => onReferencesChange(references.filter((_, i) => i !== idx))}
                      className="text-rose-500 hover:text-rose-700 cursor-pointer p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: ADD HYPERLINK (إضافة رابط) */}
      {/* ------------------------------------------------------------- */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-cairo animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-[#E5E2D9] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E2D9]">
              <h4 className="font-bold text-sm text-[#2C2C2C] flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-[#4A5D4E]" />
                <span>إضافة رابط مباشر للنص</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#5A5751] mb-1">النص المعروض:</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={e => setLinkText(e.target.value)}
                  placeholder="نص الرابط..."
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E2D9] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#5A5751] mb-1">عنوان الرابط (URL):</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={e => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E2D9] dir-ltr text-left focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E2D9]">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 rounded-xl border border-[#E5E2D9] text-xs font-bold text-[#5A5751]"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleApplyLink}
                className="px-5 py-2 rounded-xl bg-[#4A5D4E] hover:bg-[#3D4E41] text-white text-xs font-bold"
              >
                إدراج الرابط
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: CROSS-LINK TO ENCYCLOPEDIA ARTICLE (ربط بمقال آخر) */}
      {/* ------------------------------------------------------------- */}
      {showCrossLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-cairo animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 border border-[#E5E2D9] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E2D9]">
              <h4 className="font-bold text-sm text-[#2C2C2C] flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-[#4A5D4E]" />
                <span>ربط بمقال أو دراسة أخرى من الموسوعة (Cross-linking)</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowCrossLinkModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              value={crossLinkSearch}
              onChange={e => setCrossLinkSearch(e.target.value)}
              placeholder="ابحث عن عنوان المقالة أو اسم الكاتب..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E2D9] bg-[#FAF8F5] focus:outline-none"
            />

            <div className="max-h-60 overflow-y-auto space-y-1.5">
              {allArticles
                .filter(a =>
                  !crossLinkSearch.trim() ||
                  a.title.toLowerCase().includes(crossLinkSearch.toLowerCase()) ||
                  (a.author && a.author.toLowerCase().includes(crossLinkSearch.toLowerCase()))
                )
                .map(art => (
                  <button
                    key={art.id}
                    type="button"
                    onClick={() => handleInsertCrossLink(art)}
                    className="w-full p-2.5 rounded-xl hover:bg-[#FAF8F5] border border-[#E5E2D9]/60 text-right flex items-center justify-between gap-3 cursor-pointer group transition-colors"
                  >
                    <div>
                      <h5 className="font-bold text-xs text-[#2C2C2C] group-hover:text-[#4A5D4E]">
                        {art.title}
                      </h5>
                      <span className="text-[11px] text-[#8E8A83]">
                        {art.author || 'أيمن كناني'} • {art.category}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#4A5D4E] shrink-0 bg-emerald-50 px-2 py-1 rounded-lg">
                      إدراج إحالة
                    </span>
                  </button>
                ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#E5E2D9]">
              <button
                type="button"
                onClick={() => setShowCrossLinkModal(false)}
                className="px-4 py-2 rounded-xl border border-[#E5E2D9] text-xs font-bold text-[#5A5751]"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: COMMENTARY STUDIES (زر الدراسات التعقيبية) */}
      {/* ------------------------------------------------------------- */}
      {showCommentaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-cairo animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 border border-[#E5E2D9] shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E2D9]">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#8C5E45]/10 text-[#8C5E45] flex items-center justify-center font-bold text-base">
                  ⚖️
                </span>
                <div>
                  <h4 className="font-bold text-base text-[#2C2C2C]">
                    الدراسات التعقيبية والملحقات النقدية
                  </h4>
                  <p className="text-xs text-[#6E6A64]">
                    إدراج استدراك نقدي أو ربط دراسة مقارنة تعقيبية بالمقال
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCommentaryModal(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center gap-2 border-b border-[#E5E2D9] pb-2 text-xs">
              <button
                type="button"
                onClick={() => setCommentaryTab('insert_inline')}
                className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${
                  commentaryTab === 'insert_inline'
                    ? 'bg-[#8C5E45] text-white'
                    : 'bg-[#FAF8F5] text-[#5A5751] hover:bg-stone-100'
                }`}
              >
                ✍️ صياغة دراسة تعقيبية وإدراجها في المتن
              </button>
              <button
                type="button"
                onClick={() => setCommentaryTab('link_existing')}
                className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${
                  commentaryTab === 'link_existing'
                    ? 'bg-[#8C5E45] text-white'
                    : 'bg-[#FAF8F5] text-[#5A5751] hover:bg-stone-100'
                }`}
              >
                🔗 ربط بدراسة تعقيبية منشورة بالموسوعة
              </button>
            </div>

            {/* TAB 1: INSERT INLINE COMMENTARY STUDY */}
            {commentaryTab === 'insert_inline' && (
              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-[#5A5751] mb-1">
                    عنوان الدراسة التعقيبية:
                  </label>
                  <input
                    type="text"
                    value={commTitle}
                    onChange={e => setCommTitle(e.target.value)}
                    placeholder="مثال: تعقيب نقدي على مسألة الإدراك الحسي والوعي الذاتي..."
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E2D9] focus:outline-none focus:ring-1 focus:ring-[#8C5E45]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#5A5751] mb-1">
                      اسم الباحث / المعقّب:
                    </label>
                    <input
                      type="text"
                      value={commAuthor}
                      onChange={e => setCommAuthor(e.target.value)}
                      placeholder="د. باحث معقّب"
                      className="w-full px-3 py-2 rounded-xl border border-[#E5E2D9] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#5A5751] mb-1">
                      المنهجية الفكرية:
                    </label>
                    <input
                      type="text"
                      value={commMethodology}
                      onChange={e => setCommMethodology(e.target.value)}
                      placeholder="استدراك فينومينولوجي نقدي"
                      className="w-full px-3 py-2 rounded-xl border border-[#E5E2D9] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#5A5751] mb-1">
                    متن التعقيب الفكري وملاحظات الدراسة:
                  </label>
                  <textarea
                    rows={4}
                    value={commContent}
                    onChange={e => setCommContent(e.target.value)}
                    placeholder="اكتب هنا تفاصيل الحاشية النقدية أو التعقيب الأكاديمي..."
                    className="w-full p-3 rounded-xl border border-[#E5E2D9] focus:outline-none focus:ring-1 focus:ring-[#8C5E45] leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E2D9]">
                  <button
                    type="button"
                    onClick={() => setShowCommentaryModal(false)}
                    className="px-4 py-2 rounded-xl border border-[#E5E2D9] text-xs font-bold text-[#5A5751]"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={handleInsertCommentaryStudy}
                    disabled={!commTitle.trim() || !commContent.trim()}
                    className="px-5 py-2 rounded-xl bg-[#8C5E45] hover:bg-[#724B36] text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
                  >
                    إدراج بالمتن في الوقت الفعلي
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: LINK EXISTING STUDY */}
            {commentaryTab === 'link_existing' && (
              <div className="space-y-3 text-xs">
                <p className="text-stone-600">
                  اختر دراسة منشورة بالموسوعة لربطها كدراسة تعقيبية مرافقة لهذا العمل:
                </p>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {allArticles
                    .filter(a => a.type === 'study')
                    .map(study => (
                      <div
                        key={study.id}
                        className="p-3 rounded-xl border border-[#E5E2D9] bg-[#FAF8F5] flex items-center justify-between gap-3"
                      >
                        <div>
                          <h5 className="font-bold text-xs text-[#2C2C2C]">{study.title}</h5>
                          <span className="text-[11px] text-[#6E6A64]">
                            {study.author || 'أيمن كناني'} • {study.category}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleLinkExistingStudy(study)}
                          className="px-3 py-1.5 rounded-lg bg-[#8C5E45] text-white font-bold text-xs hover:bg-[#724B36] cursor-pointer shrink-0"
                        >
                          ربط كدراسة تعقيبية
                        </button>
                      </div>
                    ))}
                </div>
                <div className="flex justify-end pt-2 border-t border-[#E5E2D9]">
                  <button
                    type="button"
                    onClick={() => setShowCommentaryModal(false)}
                    className="px-4 py-2 rounded-xl border border-[#E5E2D9] text-xs font-bold text-[#5A5751]"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
