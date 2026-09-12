import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
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
  AlignLeft,
  AlignJustify,
  Maximize2,
  Minimize2,
  Eye,
  PenTool,
  Clock,
  Check,
  Palette,
  Type,
  ChevronDown,
  CornerUpLeft,
  Highlighter,
  FileCode,
  BookOpen,
  Sparkles,
  Link as LinkIcon,
  Table as TableIcon
} from 'lucide-react';

export interface ScholarlyIntegratedEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  label?: string;
  required?: boolean;
  id?: string;
  headerColorStrip?: string;
  onHeaderColorStripChange?: (strip: string) => void;
}

// Curated Arabic Fonts
export const ARABIC_FONTS = [
  { id: 'amiri', name: 'الخط الأميري (تراثي)', cssClass: 'font-amiri', preview: 'أبجد هوز' },
  { id: 'cairo', name: 'خط القاهرة (معاصر)', cssClass: 'font-cairo', preview: 'أبجد هوز' },
  { id: 'traditional', name: 'الخط النسخي المحكم', cssClass: 'font-serif', preview: 'أبجد هوز' },
  { id: 'noto', name: 'خط النسخ الرقمي الحديث', cssClass: 'font-sans font-medium', preview: 'أبجد هوز' },
  { id: 'tajawal', name: 'خط تجوّل العصري', cssClass: 'font-sans', preview: 'أبجد هوز' },
  { id: 'marhey', name: 'الخط الفني الأنيق', cssClass: 'font-amiri italic', preview: 'أبجد هوز' },
];

// Curated Decorative Accent Ribbons (أشرطة ملونة متصلة مباشرة بمربع الكتابة)
export const ACCENT_COLOR_STRIPS = [
  { id: 'emerald', name: 'أخضر أندلسي رصين', bg: 'bg-[#4A5D4E]', hex: '#4A5D4E' },
  { id: 'amber', name: 'ذهبي إمبراطوري ملكي', bg: 'bg-[#C88A3B]', hex: '#C88A3B' },
  { id: 'azure', name: 'أزرق لازوردي معرفي', bg: 'bg-[#205477]', hex: '#205477' },
  { id: 'crimson', name: 'عنابي قرمزي غرناطي', bg: 'bg-[#8E2638]', hex: '#8E2638' },
  { id: 'violet', name: 'بنفسجي فلسفي عميق', bg: 'bg-[#6B358E]', hex: '#6B358E' },
  { id: 'teal', name: 'تيل بحري أكاديمي', bg: 'bg-[#0F766E]', hex: '#0F766E' },
  { id: 'slate', name: 'رمادي حجري ماسي', bg: 'bg-[#2E3748]', hex: '#2E3748' },
  { id: 'none', name: 'بدون شريط ملون', bg: 'bg-transparent', hex: 'none' },
];

// Curated Font Colors for real-time application
export const TEXT_COLORS = [
  { id: 'black', name: 'حبري داكن', hex: '#1F2937' },
  { id: 'emerald', name: 'أخضر أندلسي', hex: '#4A5D4E' },
  { id: 'gold', name: 'ذهبي كهرماني', hex: '#B45309' },
  { id: 'crimson', name: 'عنابي محكم', hex: '#8E2638' },
  { id: 'azure', name: 'أزرق ملكي', hex: '#1E3A8A' },
  { id: 'teal', name: 'تيل معرفي', hex: '#0F766E' },
];

// Curated Highlight Ribbons
export const HIGHLIGHT_COLORS = [
  { id: 'yellow', name: 'تظليل أصفر', hex: '#FEF08A' },
  { id: 'green', name: 'تظليل أخضر نعناعي', hex: '#BBF7D0' },
  { id: 'orange', name: 'تظليل برتقالي دافئ', hex: '#FED7AA' },
  { id: 'cyan', name: 'تظليل سماوي هادئ', hex: '#BAE6FD' },
  { id: 'purple', name: 'تظليل لافندر', hex: '#E9D5FF' },
  { id: 'none', name: 'إزالة التظليل', hex: 'transparent' },
];

/**
 * Converts initial markdown string to clean visual HTML for WYSIWYG
 */
function markdownToWysiwygHtml(text: string): string {
  if (!text) return '<p><br></p>';
  // If already contains HTML markup, return as-is
  if (/<(p|div|h[1-6]|blockquote|ul|ol|table|span|mark|sup)[\s>]/i.test(text)) {
    return text;
  }

  const lines = text.split('\n');
  const result: string[] = [];
  let inUl = false;
  let inOl = false;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();

    if (!trimmed) {
      if (inUl) { result.push('</ul>'); inUl = false; }
      if (inOl) { result.push('</ol>'); inOl = false; }
      continue;
    }

    if (trimmed.startsWith('## ')) {
      if (inUl) { result.push('</ul>'); inUl = false; }
      if (inOl) { result.push('</ol>'); inOl = false; }
      const content = trimmed.substring(3);
      result.push(`<h2 style="font-size: 1.5em; font-weight: bold; color: #4A5D4E; margin: 1em 0 0.4em;">${formatInlineTokens(content)}</h2>`);
      continue;
    }

    if (trimmed.startsWith('### ')) {
      if (inUl) { result.push('</ul>'); inUl = false; }
      if (inOl) { result.push('</ol>'); inOl = false; }
      const content = trimmed.substring(4);
      result.push(`<h3 style="font-size: 1.25em; font-weight: bold; color: #2C2C2C; margin: 0.8em 0 0.3em;">${formatInlineTokens(content)}</h3>`);
      continue;
    }

    if (trimmed.startsWith('# ')) {
      if (inUl) { result.push('</ul>'); inUl = false; }
      if (inOl) { result.push('</ol>'); inOl = false; }
      const content = trimmed.substring(2);
      result.push(`<h1 style="font-size: 1.8em; font-weight: bold; color: #2C2C2C; margin: 1.2em 0 0.5em; border-bottom: 2px solid #E5E2D9; padding-bottom: 0.25em;">${formatInlineTokens(content)}</h1>`);
      continue;
    }

    if (trimmed.startsWith('> ')) {
      if (inUl) { result.push('</ul>'); inUl = false; }
      if (inOl) { result.push('</ol>'); inOl = false; }
      const content = trimmed.substring(2);
      result.push(`<blockquote style="border-right: 4px solid #4A5D4E; background: #FAF9F5; padding: 0.75em 1.25em; margin: 1em 0; border-radius: 0.5rem; font-style: italic; color: #4A5D4E;">${formatInlineTokens(content)}</blockquote>`);
      continue;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inUl) { result.push('<ul style="list-style-type: disc; padding-right: 1.5em; margin: 0.75em 0;">'); inUl = true; }
      result.push(`<li style="margin-bottom: 0.3em;">${formatInlineTokens(trimmed.substring(2))}</li>`);
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      if (!inOl) { result.push('<ol style="list-style-type: decimal; padding-right: 1.5em; margin: 0.75em 0;">'); inOl = true; }
      const content = trimmed.replace(/^\d+\.\s/, '');
      result.push(`<li style="margin-bottom: 0.3em;">${formatInlineTokens(content)}</li>`);
      continue;
    }

    if (inUl) { result.push('</ul>'); inUl = false; }
    if (inOl) { result.push('</ol>'); inOl = false; }

    result.push(`<p style="margin-bottom: 1em; line-height: 2;">${formatInlineTokens(trimmed)}</p>`);
  }

  if (inUl) result.push('</ul>');
  if (inOl) result.push('</ol>');

  return result.join('\n');
}

function formatInlineTokens(str: string): string {
  return str
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/__(.+?)__/g, '<u>$1</u>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    .replace(/\[\^(\d+)\]/g, '<sup style="color: #4A5D4E; font-weight: bold; padding: 0 2px;">[$1]</sup>');
}

export const ScholarlyIntegratedEditor: React.FC<ScholarlyIntegratedEditorProps> = ({
  value,
  onChange,
  placeholder = 'ابدأ بكتابة نص المقال أو الدراسة هنا مباشرة... جميع التنسيقات تطبق فورياً على النص في الوقت الفعلي.',
  minHeight = '380px',
  label,
  required = false,
  id = 'wysiwyg-scholarly-editor',
  headerColorStrip = 'emerald',
  onHeaderColorStripChange,
}) => {
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Real-time typography and ribbon states
  const [selectedFont, setSelectedFont] = useState<string>('amiri');
  const [fontSizePx, setFontSizePx] = useState<number>(19);
  const [activeStripId, setActiveStripId] = useState<string>(headerColorStrip || 'emerald');
  const [showFontMenu, setShowFontMenu] = useState<boolean>(false);
  const [showColorStripMenu, setShowColorStripMenu] = useState<boolean>(false);
  const [showTextColorMenu, setShowTextColorMenu] = useState<boolean>(false);
  const [showHighlightMenu, setShowHighlightMenu] = useState<boolean>(false);

  // contentEditable reference
  const editorRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef<boolean>(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Sync incoming value to contentEditable on initial mount
  useEffect(() => {
    if (editorRef.current && !isInitializedRef.current) {
      const initialHtml = markdownToWysiwygHtml(value || '');
      editorRef.current.innerHTML = initialHtml;
      isInitializedRef.current = true;
    }
  }, [value]);

  // Keep activeStripId in sync with prop
  useEffect(() => {
    if (headerColorStrip && headerColorStrip !== activeStripId) {
      setActiveStripId(headerColorStrip);
    }
  }, [headerColorStrip]);

  // Execute real-time browser formatting command on selection
  const execCmd = useCallback((command: string, arg: string | undefined = undefined) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    try {
      document.execCommand(command, false, arg);
      // Immediately notify parent with updated innerHTML
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    } catch {
      // Fallback
    }
  }, [onChange]);

  // Handle color strip selection
  const handleSelectStrip = (stripId: string) => {
    setActiveStripId(stripId);
    if (onHeaderColorStripChange) {
      onHeaderColorStripChange(stripId);
    }
    setShowColorStripMenu(false);
    showToast('تم تطبيق الشريط الملون في الوقت الفعلي');
  };

  // Handle real-time font change
  const handleSelectFont = (fontId: string) => {
    setSelectedFont(fontId);
    setShowFontMenu(false);
    showToast('تم تغيير الخط فورياً');
  };

  // Insert a styled Poetry Verse in real time
  const insertPoetryVerse = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const verseHtml = `
      <div class="poetry-verse" style="display: flex; justify-content: space-around; align-items: center; margin: 1.2em 0; padding: 1em 1.5em; background: #FAF9F5; border-radius: 0.75rem; border: 1px solid #E5E2D9; font-size: 1.05em; font-family: inherit;">
        <span style="font-weight: bold; color: #4A5D4E;" contenteditable="true">صدر البيت هنا</span>
        <span style="color: #B45309; font-weight: bold; padding: 0 0.5em;">...</span>
        <span style="color: #2C2C2C; font-style: italic;" contenteditable="true">عجز البيت هنا</span>
      </div>
      <p><br></p>
    `;
    document.execCommand('insertHTML', false, verseHtml);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
    showToast('تم إدراج بيت شعري مزدوج الشطرين');
  };

  // Insert an Academic Footnote in real time
  const insertFootnote = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const existingSup = editorRef.current.querySelectorAll('sup').length;
    const fnIndex = existingSup + 1;
    const footnoteHtml = `<sup style="color: #4A5D4E; font-weight: bold; font-family: sans-serif; cursor: pointer;" title="هامش توثيقي">[${fnIndex}]</sup> `;
    document.execCommand('insertHTML', false, footnoteHtml);

    // Also append the citation at the bottom
    const citationHtml = `
      <div class="footnote-item" style="font-size: 0.85em; color: #6E6A64; border-top: 1px dashed #E5E2D9; padding: 0.5em 0; margin-top: 1em;">
        <strong style="color: #4A5D4E;">[${fnIndex}]</strong> اسم المرجع أو الباحث، عنوان المصدر، دار النشر، سنة التوثيق، ص. 
      </div>
    `;
    editorRef.current.insertAdjacentHTML('beforeend', citationHtml);
    onChange(editorRef.current.innerHTML);
    showToast(`تم إدراج هامش مرجعي رقم [${fnIndex}]`);
  };

  // Insert a clean academic table
  const insertTable = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const tableHtml = `
      <table style="width: 100%; border-collapse: collapse; margin: 1.5em 0; font-size: 0.95em; border: 1px solid #E5E2D9; border-radius: 0.5rem; overflow: hidden;">
        <thead>
          <tr style="background-color: #4A5D4E; color: white; text-align: right;">
            <th style="padding: 10px; border: 1px solid #3C4C3F;">المفهوم / المحور</th>
            <th style="padding: 10px; border: 1px solid #3C4C3F;">التحليل والمقاربة الفكرية</th>
            <th style="padding: 10px; border: 1px solid #3C4C3F;">التوثيق المرجعي</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background-color: #FFFFFF;">
            <td style="padding: 8px 10px; border: 1px solid #E5E2D9;">المسألة الأولى</td>
            <td style="padding: 8px 10px; border: 1px solid #E5E2D9;">شرح الإشكالية وسياقها الفكري</td>
            <td style="padding: 8px 10px; border: 1px solid #E5E2D9;">ص. 45</td>
          </tr>
          <tr style="background-color: #FAF9F5;">
            <td style="padding: 8px 10px; border: 1px solid #E5E2D9;">المسألة الثانية</td>
            <td style="padding: 8px 10px; border: 1px solid #E5E2D9;">التطبيق في الواقع المعاصر</td>
            <td style="padding: 8px 10px; border: 1px solid #E5E2D9;">ص. 112</td>
          </tr>
        </tbody>
      </table>
      <p><br></p>
    `;
    document.execCommand('insertHTML', false, tableHtml);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
    showToast('تم إدراج جدول توثيقي');
  };

  // Insert Academic Quote Block
  const insertAcademicQuote = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const quoteHtml = `
      <blockquote style="border-right: 4px solid #4A5D4E; background: #FAF9F5; padding: 1em 1.5em; margin: 1.2em 0; border-radius: 0.5rem; font-style: italic; color: #2C2C2C; position: relative;">
        « اكتب هنا الاقتباس الفكري أو الفلسفي المحكم بدقة وأمانة علمية... »
        <div style="text-align: left; font-size: 0.85em; color: #6E6A64; margin-top: 0.5em; font-style: normal;">— اسم المفكر أو المصدر المستند إليه</div>
      </blockquote>
      <p><br></p>
    `;
    document.execCommand('insertHTML', false, quoteHtml);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
    showToast('تم إدراج كتلة اقتباس أكاديمي');
  };

  // Compute Word & Character Metrics in Real Time
  const metrics = useMemo(() => {
    const rawText = (value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!rawText) return { words: 0, chars: 0, readMinutes: 1 };
    const words = rawText.split(' ').filter(Boolean).length;
    const chars = rawText.length;
    const readMinutes = Math.max(1, Math.ceil(words / 180));
    return { words, chars, readMinutes };
  }, [value]);

  const currentFontObj = useMemo(() => {
    return ARABIC_FONTS.find(f => f.id === selectedFont) || ARABIC_FONTS[0];
  }, [selectedFont]);

  const currentStripObj = useMemo(() => {
    return ACCENT_COLOR_STRIPS.find(s => s.id === activeStripId) || ACCENT_COLOR_STRIPS[0];
  }, [activeStripId]);

  return (
    <div
      className={`w-full flex flex-col rounded-2xl border border-[#E5E2D9] bg-white overflow-hidden shadow-xs transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none h-screen bg-white' : ''
      }`}
    >
      {/* Toast Notification */}
      {toastMsg && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-[#2C2C2C] text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-fadeIn pointer-events-none">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. DECORATIVE COLOR STRIP ATTACHED DIRECTLY ON TOP OF WRITING BOX */}
      {currentStripObj.id !== 'none' && (
        <div
          id="editor-header-color-strip"
          className={`w-full h-3 transition-colors shrink-0 ${currentStripObj.bg}`}
          title={`الشريط الملون: ${currentStripObj.name}`}
        />
      )}

      {/* 2. ATTACHED TOOLBAR GLUED DIRECTLY TO THE WRITING BOX (NO SPACE / STICKY) */}
      <div className="w-full bg-[#FAF8F5] border-b border-[#E5E2D9] p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-2 sticky top-0 z-20 shadow-2xs font-cairo select-none">
        {/* Left Toolbar Cluster: Core Visual Text Formatting */}
        <div className="flex items-center gap-1 flex-wrap">
          {/* Bold */}
          <button
            type="button"
            onClick={() => execCmd('bold')}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-[#2C2C2C] hover:bg-[#EAE7DD] active:bg-[#4A5D4E] active:text-white transition-colors cursor-pointer flex items-center gap-1 font-bold text-xs"
            title="عريض (Bold) - يطبق فوراً في الوقت الفعلي"
          >
            <Bold className="w-4 h-4" />
            <span className="hidden md:inline font-bold">عريض</span>
          </button>

          {/* Italic */}
          <button
            type="button"
            onClick={() => execCmd('italic')}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-[#2C2C2C] hover:bg-[#EAE7DD] active:bg-[#4A5D4E] active:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs"
            title="مائل (Italic)"
          >
            <Italic className="w-4 h-4" />
            <span className="hidden md:inline italic">مائل</span>
          </button>

          {/* Underline */}
          <button
            type="button"
            onClick={() => execCmd('underline')}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-[#2C2C2C] hover:bg-[#EAE7DD] active:bg-[#4A5D4E] active:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs"
            title="تسطير (Underline)"
          >
            <Underline className="w-4 h-4" />
            <span className="hidden md:inline underline">تسطير</span>
          </button>

          <span className="w-px h-5 bg-[#E5E2D9] mx-1" />

          {/* Heading 2 */}
          <button
            type="button"
            onClick={() => execCmd('formatBlock', '<h2>')}
            className="px-2 py-1.5 rounded-lg text-[#4A5D4E] font-bold hover:bg-[#EAE7DD] transition-colors cursor-pointer text-xs flex items-center gap-1"
            title="عنوان رئيسي (H2) - يطبق حجم الخط فورياً"
          >
            <span className="text-sm font-black">H2</span>
            <span className="hidden lg:inline">عنوان رئيسي</span>
          </button>

          {/* Heading 3 */}
          <button
            type="button"
            onClick={() => execCmd('formatBlock', '<h3>')}
            className="px-2 py-1.5 rounded-lg text-[#2C2C2C] font-semibold hover:bg-[#EAE7DD] transition-colors cursor-pointer text-xs flex items-center gap-1"
            title="عنوان فرعي (H3)"
          >
            <span className="text-sm font-bold">H3</span>
            <span className="hidden lg:inline">عنوان فرعي</span>
          </button>

          {/* Normal Paragraph */}
          <button
            type="button"
            onClick={() => execCmd('formatBlock', '<p>')}
            className="px-2 py-1.5 rounded-lg text-[#6E6A64] hover:bg-[#EAE7DD] transition-colors cursor-pointer text-xs"
            title="فقرة عادية (Paragraph)"
          >
            <span>نص عادي</span>
          </button>

          <span className="w-px h-5 bg-[#E5E2D9] mx-1" />

          {/* Text Alignment */}
          <button
            type="button"
            onClick={() => execCmd('justifyRight')}
            className="p-1.5 rounded-lg text-[#2C2C2C] hover:bg-[#EAE7DD] transition-colors cursor-pointer"
            title="محاذاة لليمين"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('justifyCenter')}
            className="p-1.5 rounded-lg text-[#2C2C2C] hover:bg-[#EAE7DD] transition-colors cursor-pointer"
            title="محاذاة للوسط"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('justifyFull')}
            className="p-1.5 rounded-lg text-[#2C2C2C] hover:bg-[#EAE7DD] transition-colors cursor-pointer"
            title="ضبط الفقرة (Justify)"
          >
            <AlignJustify className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-[#E5E2D9] mx-1" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => execCmd('insertUnorderedList')}
            className="p-1.5 rounded-lg text-[#2C2C2C] hover:bg-[#EAE7DD] transition-colors cursor-pointer"
            title="قائمة نقطية"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('insertOrderedList')}
            className="p-1.5 rounded-lg text-[#2C2C2C] hover:bg-[#EAE7DD] transition-colors cursor-pointer"
            title="قائمة رقمية"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          {/* Academic Elements */}
          <button
            type="button"
            onClick={insertAcademicQuote}
            className="p-1.5 sm:px-2 rounded-lg text-[#4A5D4E] hover:bg-[#EAE7DD] transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
            title="إدراج اقتباس أكاديمي محكم"
          >
            <Quote className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">اقتباس</span>
          </button>

          <button
            type="button"
            onClick={insertPoetryVerse}
            className="p-1.5 sm:px-2 rounded-lg text-[#B45309] hover:bg-[#EAE7DD] transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
            title="إدراج بيت شعري موزون الشطرين"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">بيت شعري</span>
          </button>

          <button
            type="button"
            onClick={insertFootnote}
            className="p-1.5 sm:px-2 rounded-lg text-[#205477] hover:bg-[#EAE7DD] transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
            title="إدراج هامش وتوثيق مرجعي"
          >
            <span className="font-mono font-bold text-xs">[^]</span>
            <span className="hidden xl:inline">هامش</span>
          </button>

          <button
            type="button"
            onClick={insertTable}
            className="p-1.5 sm:px-2 rounded-lg text-[#6E6A64] hover:bg-[#EAE7DD] transition-colors cursor-pointer flex items-center gap-1 text-xs"
            title="إدراج جدول منظم"
          >
            <TableIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Toolbar Cluster: Real-time Settings (Font, Color Strip, Colors, Preview) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* REAL-TIME FONT PICKER */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowFontMenu(!showFontMenu);
                setShowColorStripMenu(false);
                setShowTextColorMenu(false);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-white border border-[#E5E2D9] hover:border-[#4A5D4E] text-[#2C2C2C] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              title="تغيير الخط العربي في الوقت الفعلي"
            >
              <Type className="w-3.5 h-3.5 text-[#4A5D4E]" />
              <span>{currentFontObj.name.split(' ')[1] || currentFontObj.name}</span>
              <ChevronDown className="w-3 h-3 text-[#8E8A83]" />
            </button>

            {showFontMenu && (
              <div className="absolute left-0 sm:right-0 mt-1.5 w-56 rounded-2xl bg-white border border-[#E5E2D9] shadow-xl p-2 z-50 animate-fadeIn">
                <span className="text-[11px] font-bold text-[#8E8A83] px-2 py-1 block border-b border-[#E5E2D9] mb-1">
                  اختر الخط العربي المفضل:
                </span>
                <div className="space-y-1">
                  {ARABIC_FONTS.map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => handleSelectFont(f.id)}
                      className={`w-full text-right p-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        selectedFont === f.id
                          ? 'bg-[#4A5D4E] text-white font-bold'
                          : 'hover:bg-[#FAF8F5] text-[#2C2C2C]'
                      }`}
                    >
                      <span className={f.cssClass}>{f.name}</span>
                      <span className="text-[11px] opacity-75">{f.preview}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* REAL-TIME COLOR STRIP PICKER (شريط ملون فوق الكتابة) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowColorStripMenu(!showColorStripMenu);
                setShowFontMenu(false);
                setShowTextColorMenu(false);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-white border border-[#E5E2D9] hover:border-[#4A5D4E] text-[#2C2C2C] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              title="اختيار شريط ملون فوق صفحة الكتابة"
            >
              <Palette className="w-3.5 h-3.5 text-[#C88A3B]" />
              <span className="hidden sm:inline">شريط الرأس:</span>
              <span
                className="w-3 h-3 rounded-full border border-black/10 inline-block"
                style={{ backgroundColor: currentStripObj.hex === 'none' ? '#ccc' : currentStripObj.hex }}
              />
              <ChevronDown className="w-3 h-3 text-[#8E8A83]" />
            </button>

            {showColorStripMenu && (
              <div className="absolute left-0 sm:right-0 mt-1.5 w-60 rounded-2xl bg-white border border-[#E5E2D9] shadow-xl p-2.5 z-50 animate-fadeIn">
                <span className="text-[11px] font-bold text-[#8E8A83] px-2 py-1 block border-b border-[#E5E2D9] mb-2">
                  اختر الشريط الملون أعلى مساحة الكتابة:
                </span>
                <div className="space-y-1.5">
                  {ACCENT_COLOR_STRIPS.map(strip => (
                    <button
                      key={strip.id}
                      type="button"
                      onClick={() => handleSelectStrip(strip.id)}
                      className={`w-full text-right p-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        activeStripId === strip.id
                          ? 'bg-[#4A5D4E]/10 border border-[#4A5D4E] font-bold text-[#4A5D4E]'
                          : 'hover:bg-[#FAF8F5] text-[#2C2C2C] border border-transparent'
                      }`}
                    >
                      <span>{strip.name}</span>
                      <span
                        className="w-4 h-4 rounded-full border border-black/15 shadow-2xs"
                        style={{ backgroundColor: strip.hex === 'none' ? 'transparent' : strip.hex }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* FONT SIZE CONTROLS */}
          <div className="hidden sm:flex items-center rounded-xl bg-white border border-[#E5E2D9] p-0.5">
            <button
              type="button"
              onClick={() => setFontSizePx(prev => Math.min(prev + 2, 32))}
              className="px-2 py-1 text-xs font-bold text-[#4A5D4E] hover:bg-[#FAF8F5] rounded-lg cursor-pointer"
              title="تكبير حجم الخط"
            >
              +A
            </button>
            <span className="text-[11px] px-1 font-mono text-[#8E8A83]">{fontSizePx}</span>
            <button
              type="button"
              onClick={() => setFontSizePx(prev => Math.max(prev - 2, 14))}
              className="px-2 py-1 text-xs font-bold text-[#4A5D4E] hover:bg-[#FAF8F5] rounded-lg cursor-pointer"
              title="تصغير حجم الخط"
            >
              -A
            </button>
          </div>

          {/* DEDICATED PREVIEW BUTTON (معاينة) */}
          <button
            type="button"
            id="editor-toggle-preview-btn"
            onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
            className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              viewMode === 'preview'
                ? 'bg-[#4A5D4E] text-white'
                : 'bg-white hover:bg-[#EAE7DD] text-[#2C2C2C] border border-[#E5E2D9]'
            }`}
            title="التبديل بين التحرير المباشر ومعاينة المقال الكامل"
          >
            <Eye className="w-3.5 h-3.5 text-current" />
            <span>{viewMode === 'preview' ? 'العودة للكتابة' : 'معاينة'}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-[#6E6A64] hover:text-[#2C2C2C] rounded-lg hover:bg-[#EAE7DD] cursor-pointer"
            title={isFullscreen ? 'تصغير الشاشة' : 'ملء الشاشة للتأليف الكامل'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 3. DEDICATED EXPANSIVE WRITING SURFACE (SINGLE FULL-WIDTH CANVAS) */}
      <div className="w-full flex-1 relative bg-white">
        {viewMode === 'edit' ? (
          /* REAL-TIME WYSIWYG EDITING AREA - Directly attached, zero lag, formatted text */
          <div
            className="w-full relative flex flex-col bg-white"
            style={{ minHeight: isFullscreen ? 'calc(100vh - 160px)' : minHeight }}
          >
            <div
              ref={editorRef}
              id={id}
              contentEditable
              dir="rtl"
              onInput={() => {
                if (editorRef.current) {
                  onChange(editorRef.current.innerHTML);
                }
              }}
              onBlur={() => {
                if (editorRef.current) {
                  onChange(editorRef.current.innerHTML);
                }
              }}
              style={{
                minHeight: isFullscreen ? 'calc(100vh - 170px)' : minHeight,
                fontSize: `${fontSizePx}px`,
                lineHeight: '2.1',
              }}
              data-placeholder={placeholder}
              className={`w-full p-5 sm:p-8 outline-none text-[#2C2C2C] bg-white text-justify ${currentFontObj.cssClass} focus:ring-0 empty:before:content-[attr(data-placeholder)] empty:before:text-[#8E8A83] empty:before:pointer-events-none`}
            />
          </div>
        ) : (
          /* PREVIEW MODE: Formatted Full Article Preview */
          <div
            style={{ minHeight: isFullscreen ? 'calc(100vh - 160px)' : minHeight }}
            className="p-6 sm:p-10 bg-[#FAF9F5] overflow-y-auto max-h-[75vh]"
          >
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#E5E2D9]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#4A5D4E] flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  <span>معاينة المقال بالخط المحدد:</span>
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#4A5D4E]/10 text-[#4A5D4E]">
                  {currentFontObj.name}
                </span>
              </div>

              {/* Single Button to return to writing */}
              <button
                type="button"
                onClick={() => setViewMode('edit')}
                className="px-4 py-2 rounded-xl bg-[#4A5D4E] hover:bg-[#38493C] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <CornerUpLeft className="w-3.5 h-3.5" />
                <span>العودة للكتابة والتحرير</span>
              </button>
            </div>

            {/* Article Preview Container */}
            <div
              className={`max-w-3xl mx-auto space-y-4 text-justify ${currentFontObj.cssClass}`}
              style={{ fontSize: `${fontSizePx}px`, lineHeight: '2.1' }}
              dangerouslySetInnerHTML={{ __html: value || '<p class="text-stone-400 italic">لا يوجد محتوى لمعاينته بعد...</p>' }}
            />
          </div>
        )}
      </div>

      {/* 4. METRICS & STATUS FOOTER */}
      <div className="px-4 py-2.5 bg-[#FAF8F5] border-t border-[#E5E2D9] flex flex-wrap items-center justify-between text-xs text-[#6E6A64] font-cairo">
        <div className="flex items-center gap-4 sm:gap-6">
          <span>الكلمات: <strong className="text-[#2C2C2C] font-mono">{metrics.words.toLocaleString()}</strong></span>
          <span>الحروف: <strong className="text-[#2C2C2C] font-mono">{metrics.chars.toLocaleString()}</strong></span>
          <span className="hidden sm:inline">الخط الحالي: <strong className="text-[#4A5D4E] font-medium">{currentFontObj.name}</strong></span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[#4A5D4E] font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>وقت القراءة: ~{metrics.readMinutes} دقيقة</span>
          </div>
        </div>
      </div>
    </div>
  );
};
