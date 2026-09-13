import React, { useRef, useEffect, useState, useCallback } from 'react';
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
  Minus,
  RotateCcw,
  RotateCw,
  RemoveFormatting,
  Code,
  Maximize2,
  Minimize2,
  Type,
  Palette,
  Highlighter,
  Sparkles,
} from 'lucide-react';
import { sanitizeRichHtml, extractPlainText } from '../utils/textCleaner';

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  defaultFont?: 'cairo' | 'amiri' | 'tajawal' | 'readex' | 'scheherazade';
  onFontChange?: (font: string) => void;
}

const FONTS = [
  { id: 'cairo', name: 'خط القاهرة (عصري ومقروء للمقالات)', class: 'font-cairo', family: "'Cairo', system-ui, sans-serif" },
  { id: 'amiri', name: 'الخط الأميري (أدبي وروايات)', class: 'font-amiri', family: "'Amiri', serif" },
  { id: 'tajawal', name: 'خط تجوال (أنيق وسلس)', class: 'font-tajawal', family: "'Tajawal', system-ui, sans-serif" },
  { id: 'readex', name: 'خط ريديكس (حديث ونقي للشاشات)', class: 'font-readex', family: "'Readex Pro', system-ui, sans-serif" },
  { id: 'scheherazade', name: 'خط شهرزاد (تراثي ملحمي)', class: 'font-scheherazade', family: "'Scheherazade New', serif" },
];

const TEXT_COLORS = [
  { label: 'الافتراضي (فحمي)', value: '#2C2C2C' },
  { label: 'الأخضر المريمي الأدبي', value: '#4A5D4E' },
  { label: 'القرميدي والتراكوتا', value: '#8C5E45' },
  { label: 'الذهبي التراثي', value: '#C88A3B' },
  { label: 'الكحلي العميق', value: '#1E293B' },
  { label: 'الرمادي الهادئ', value: '#6E6A64' },
];

const HIGHLIGHT_COLORS = [
  { label: 'بدون تظليل', value: 'transparent' },
  { label: 'تظليل أصفر دافئ', value: '#FEF08A' },
  { label: 'تظليل أخضر نعناعي', value: '#D1FAE5' },
  { label: 'تظليل ترابي ناعم', value: '#FDE68A' },
  { label: 'تظليل وردي هادئ', value: '#FCE7F3' },
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'ابدأ بكتابة المقال أو الفصل هنا... يمكنك استخدام شريط الأدوات لتنسيق العناوين والاقتباسات والخطوط...',
  minHeight = '360px',
  defaultFont = 'cairo',
  onFontChange,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSourceMode, setIsSourceMode] = useState<boolean>(false);
  const [sourceCode, setSourceCode] = useState<string>(value);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState<boolean>(false);
  
  // Font family state with localStorage persistence
  const [selectedFont, setSelectedFont] = useState<string>(() => {
    return localStorage.getItem('ayman_author_preferred_font') || defaultFont;
  });

  // Font size in pixels
  const [fontSize, setFontSize] = useState<number>(18);

  // Sync font change to parent & localStorage
  const handleFontSelect = (fontId: string) => {
    setSelectedFont(fontId);
    localStorage.setItem('ayman_author_preferred_font', fontId);
    if (onFontChange) {
      onFontChange(fontId);
    }
  };

  // Sync external value to editor HTML when not typing
  useEffect(() => {
    const isFocused = typeof document !== 'undefined' && editorRef.current && document.activeElement === editorRef.current;
    if (editorRef.current && !isSourceMode && !isFocused) {
      // Only update innerHTML if it's genuinely different to avoid cursor jumps
      const currentHtml = editorRef.current.innerHTML;
      if (value !== currentHtml) {
        // If empty, set empty string
        if (!value) {
          editorRef.current.innerHTML = '';
        } else {
          // If value looks like plain text without tags, wrap lines in paragraphs
          if (!/<[a-z][\s\S]*>/i.test(value)) {
            const formatted = value
              .split(/\n\s*\n/)
              .map(p => `<p>${p.trim().replace(/\n/g, '<br>')}</p>`)
              .join('');
            editorRef.current.innerHTML = formatted;
          } else {
            editorRef.current.innerHTML = value;
          }
        }
      }
    }
    setSourceCode(value);
  }, [value, isSourceMode]);

  // Execute formatting command on contentEditable
  const executeCommand = useCallback((command: string, arg?: string) => {
    if (isSourceMode) return;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, arg);
    handleEditorInput();
  }, [isSourceMode]);

  // Handle input event from contentEditable
  const handleEditorInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const sanitized = sanitizeRichHtml(html);
      setSourceCode(sanitized);
      onChange(sanitized);
    }
  };

  // Handle source code manual changes
  const handleSourceCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setSourceCode(newCode);
    onChange(newCode);
  };

  // Toggle between visual WYSIWYG and HTML source
  const handleToggleSourceMode = () => {
    if (isSourceMode) {
      // Switching from source to visual
      if (editorRef.current) {
        editorRef.current.innerHTML = sourceCode;
      }
      setIsSourceMode(false);
    } else {
      // Switching from visual to source
      if (editorRef.current) {
        setSourceCode(editorRef.current.innerHTML);
      }
      setIsSourceMode(true);
    }
  };

  // Format block elements (P, H2, H3, Blockquote)
  const formatBlock = (tag: string) => {
    if (isSourceMode) return;
    executeCommand('formatBlock', tag);
  };

  // Insert decorative divider
  const insertOrnamentalDivider = () => {
    if (isSourceMode) return;
    executeCommand('insertHTML', '<div style="text-align: center; margin: 2rem 0; color: #8C5E45; font-size: 1.25rem; letter-spacing: 0.5em; user-select: none;">✦ ✦ ✦</div><p><br></p>');
  };

  // Insert quotes around selection
  const insertArabicQuotes = () => {
    if (isSourceMode) return;
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      const selectedText = selection.toString();
      executeCommand('insertHTML', `«${selectedText}»`);
    } else {
      executeCommand('insertHTML', '«اقتباس جديد»');
    }
  };

  // Real-time statistics
  const plainText = extractPlainText(value);
  const wordCount = plainText ? plainText.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = plainText ? plainText.length : 0;
  const readingTime = Math.ceil(wordCount / 200) || 1;

  const currentFontObj = FONTS.find(f => f.id === selectedFont) || FONTS[0];

  return (
    <div
      className={`border border-[#E5E2D9] rounded-2xl bg-[#FFFFFF] shadow-sm flex flex-col transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none bg-[#FDFCF8] p-4 sm:p-8 overflow-y-auto'
          : 'relative w-full'
      }`}
    >
      {/* Top Main Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 p-2 sm:p-3 border-b border-[#E5E2D9] bg-[#F7F5EE] rounded-t-2xl">
        {/* Group 1: Typography (Font Family & Font Size) */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Font Family Dropdown */}
          <div className="relative inline-flex items-center">
            <select
              value={selectedFont}
              onChange={(e) => handleFontSelect(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-[#FFFFFF] border border-[#E5E2D9] text-[#2C2C2C] hover:border-[#4A5D4E] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] cursor-pointer shadow-xs"
              title="اختر نوع الخط للكتابة والمقالات"
            >
              {FONTS.map(font => (
                <option key={font.id} value={font.id} className={font.class}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size Dropdown */}
          <div className="relative inline-flex items-center">
            <select
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="px-2 py-1.5 text-xs font-mono font-bold rounded-xl bg-[#FFFFFF] border border-[#E5E2D9] text-[#2C2C2C] hover:border-[#4A5D4E] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] cursor-pointer shadow-xs"
              title="حجم الخط"
            >
              {[15, 16, 17, 18, 20, 22, 24, 26, 28, 32].map(sz => (
                <option key={sz} value={sz}>
                  {sz}px
                </option>
              ))}
            </select>
          </div>

          {/* Heading / Block Style Selector */}
          <div className="relative inline-flex items-center">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  formatBlock(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
              className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-[#FFFFFF] border border-[#E5E2D9] text-[#2C2C2C] hover:border-[#4A5D4E] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] cursor-pointer shadow-xs"
              title="نمط الفقرة أو العنوان"
            >
              <option value="" disabled>
                العناوين والأنماط...
              </option>
              <option value="<p>">فقرة عادية</option>
              <option value="<h2>">عنوان رئيسي للمقال (H2)</option>
              <option value="<h3>">عنوان فرعي (H3)</option>
              <option value="<h4>">عنوان قسم جانبي (H4)</option>
              <option value="<blockquote>">اقتباس أدبي راقي (Quote)</option>
            </select>
          </div>
        </div>

        {/* Group 2: Inline Formatting Buttons */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => executeCommand('bold')}
            disabled={isSourceMode}
            className="p-1.5 rounded-lg text-[#2C2C2C] hover:bg-[#E5E2D9] hover:text-[#4A5D4E] transition-colors cursor-pointer disabled:opacity-40"
            title="عريض (Bold) Ctrl+B"
          >
            <Bold className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => executeCommand('italic')}
            disabled={isSourceMode}
            className="p-1.5 rounded-lg text-[#2C2C2C] hover:bg-[#E5E2D9] hover:text-[#4A5D4E] transition-colors cursor-pointer disabled:opacity-40"
            title="مائل (Italic) Ctrl+I"
          >
            <Italic className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => executeCommand('underline')}
            disabled={isSourceMode}
            className="p-1.5 rounded-lg text-[#2C2C2C] hover:bg-[#E5E2D9] hover:text-[#4A5D4E] transition-colors cursor-pointer disabled:opacity-40"
            title="تسطير (Underline) Ctrl+U"
          >
            <Underline className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => executeCommand('strikeThrough')}
            disabled={isSourceMode}
            className="p-1.5 rounded-lg text-[#2C2C2C] hover:bg-[#E5E2D9] hover:text-[#4A5D4E] transition-colors cursor-pointer disabled:opacity-40"
            title="شطب (Strikethrough)"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-[#E5E2D9] mx-1" />

          {/* Color Picker Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowColorPicker(!showColorPicker);
                setShowHighlightPicker(false);
              }}
              disabled={isSourceMode}
              className="p-1.5 rounded-lg text-[#2C2C2C] hover:bg-[#E5E2D9] hover:text-[#4A5D4E] transition-colors cursor-pointer disabled:opacity-40 flex items-center gap-0.5"
              title="تلوين النص"
            >
              <Palette className="w-4 h-4 text-[#4A5D4E]" />
            </button>

            {showColorPicker && (
              <div className="absolute top-full mt-1 right-0 z-30 p-2 rounded-xl bg-white border border-[#E5E2D9] shadow-xl grid grid-cols-3 gap-1.5 w-36">
                {TEXT_COLORS.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => {
                      executeCommand('foreColor', c.value);
                      setShowColorPicker(false);
                    }}
                    className="w-8 h-8 rounded-lg border border-black/10 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Highlight Color Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowHighlightPicker(!showHighlightPicker);
                setShowColorPicker(false);
              }}
              disabled={isSourceMode}
              className="p-1.5 rounded-lg text-[#2C2C2C] hover:bg-[#E5E2D9] hover:text-[#8C5E45] transition-colors cursor-pointer disabled:opacity-40"
              title="تمييز وتظليل النص (Highlight)"
            >
              <Highlighter className="w-4 h-4 text-[#C88A3B]" />
            </button>

            {showHighlightPicker && (
              <div className="absolute top-full mt-1 right-0 z-30 p-2 rounded-xl bg-white border border-[#E5E2D9] shadow-xl grid grid-cols-3 gap-1.5 w-36">
                {HIGHLIGHT_COLORS.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => {
                      executeCommand('hiliteColor', c.value);
                      setShowHighlightPicker(false);
                    }}
                    className="w-8 h-8 rounded-lg border border-black/15 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer text-[10px] font-bold"
                    style={{ backgroundColor: c.value === 'transparent' ? '#ffffff' : c.value }}
                    title={c.label}
                  >
                    {c.value === 'transparent' ? '✕' : ''}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-[#E5E2D9] mx-1" />

          {/* Alignment Buttons */}
          <button
            type="button"
            onClick={() => executeCommand('justifyRight')}
            disabled={isSourceMode}
            className="p-1.5 rounded-lg text-[#2C2C2C] hover:bg-[#E5E2D9] hover:text-[#4A5D4E] transition-colors cursor-pointer disabled:opacity-40"
            title="محاذاة لليمين"
          >
            <AlignRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => executeCommand('justifyCenter')}
            disabled={isSourceMode}
            className="p-1.5 rounded-lg text-[#2C2C2C] hover:bg-[#E5E2D9] hover:text-[#4A5D4E] transition-colors cursor-pointer disabled:opacity-40"
            title="محاذاة للوسط"
          >
            <AlignCenter className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => executeCommand('justifyLeft')}
            disabled={isSourceMode}
            className="p-1.5 rounded-lg text-[#2C2C2C] hover:bg-[#E5E2D9] hover:text-[#4A5D4E] transition-colors cursor-pointer disabled:opacity-40"
            title="محاذاة لليسار"
          >
            <AlignLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => executeCommand('justifyFull')}
            disabled={isSourceMode}
            className="p-1.5 rounded-lg text-[#2C2C2C] hover:bg-[#E5E2D9] hover:text-[#4A5D4E] transition-colors cursor-pointer disabled:opacity-40"
            title="ضبط متساوي (Justify)"
          >
            <AlignJustify className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-[#E5E2D9] mx-1" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => executeCommand('insertUnorderedList')}
            disabled={isSourceMode}
            className="p-1.5 rounded-lg text-[#2C2C2C] hover:bg-[#E5E2D9] hover:text-[#4A5D4E] transition-colors cursor-pointer disabled:opacity-40"
            title="قائمة نقطية"
          >
            <List className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => executeCommand('insertOrderedList')}
            disabled={isSourceMode}
            className="p-1.5 rounded-lg text-[#2C2C2C] hover:bg-[#E5E2D9] hover:text-[#4A5D4E] transition-colors cursor-pointer disabled:opacity-40"
            title="قائمة رقمية"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          {/* Blockquote Button */}
          <button
            type="button"
            onClick={() => formatBlock('<blockquote>')}
            disabled={isSourceMode}
            className="p-1.5 rounded-lg text-[#2C2C2C] hover:bg-[#E5E2D9] hover:text-[#4A5D4E] transition-colors cursor-pointer disabled:opacity-40"
            title="اقتباس أدبي مميز"
          >
            <Quote className="w-4 h-4" />
          </button>

          {/* Insert Arabic Quotes « » */}
          <button
            type="button"
            onClick={insertArabicQuotes}
            disabled={isSourceMode}
            className="px-2 py-1 rounded-lg text-[#8C5E45] font-bold text-xs hover:bg-[#E5E2D9] transition-colors cursor-pointer disabled:opacity-40"
            title="إدراج أقواس اقتباس عربية « »"
          >
            « »
          </button>

          {/* Ornamental Divider */}
          <button
            type="button"
            onClick={insertOrnamentalDivider}
            disabled={isSourceMode}
            className="p-1.5 rounded-lg text-[#8C5E45] hover:bg-[#E5E2D9] transition-colors cursor-pointer disabled:opacity-40"
            title="فاصل زخرفي أدبي (✦ ✦ ✦)"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-[#E5E2D9] mx-1" />

          {/* Undo / Redo */}
          <button
            type="button"
            onClick={() => executeCommand('undo')}
            disabled={isSourceMode}
            className="p-1.5 rounded-lg text-[#2C2C2C] hover:bg-[#E5E2D9] hover:text-[#4A5D4E] transition-colors cursor-pointer disabled:opacity-40"
            title="تراجع (Ctrl+Z)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => executeCommand('redo')}
            disabled={isSourceMode}
            className="p-1.5 rounded-lg text-[#2C2C2C] hover:bg-[#E5E2D9] hover:text-[#4A5D4E] transition-colors cursor-pointer disabled:opacity-40"
            title="إعادة (Ctrl+Y)"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Clear Extra Formatting */}
          <button
            type="button"
            onClick={() => executeCommand('removeFormat')}
            disabled={isSourceMode}
            className="p-1.5 rounded-lg text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-40"
            title="مسح التنسيقات غير المرغوبة"
          >
            <RemoveFormatting className="w-4 h-4" />
          </button>
        </div>

        {/* Group 3: View Toggles & Fullscreen */}
        <div className="flex items-center gap-1.5 mt-1 sm:mt-0">
          <button
            type="button"
            onClick={handleToggleSourceMode}
            className={`px-2.5 py-1 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              isSourceMode
                ? 'bg-[#4A5D4E] text-[#FDFCF8] border-[#4A5D4E] shadow-sm'
                : 'bg-white text-[#2C2C2C] border-[#E5E2D9] hover:bg-[#FDFCF8]'
            }`}
            title="التبديل بين المحرر المرئي وكود HTML"
          >
            <Code className="w-3.5 h-3.5" />
            <span>{isSourceMode ? 'المحرر المرئي' : 'كود HTML'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-xl border border-[#E5E2D9] bg-white text-[#2C2C2C] hover:bg-[#FDFCF8] hover:text-[#4A5D4E] transition-all cursor-pointer shadow-xs"
            title={isFullscreen ? 'تصغير المحرر' : 'ملء الشاشة للكتابة بتركيز'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="relative flex-1 p-2 sm:p-4 bg-[#FDFCF8] rounded-b-2xl">
        {isSourceMode ? (
          <textarea
            value={sourceCode}
            onChange={handleSourceCodeChange}
            dir="ltr"
            className="w-full h-full min-h-[360px] p-4 text-xs font-mono bg-[#1E1E1E] text-[#E0E0E0] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] leading-relaxed resize-y"
            placeholder="أدخل كود HTML المنسق هنا..."
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleEditorInput}
            onBlur={handleEditorInput}
            dir="rtl"
            className={`rich-editor-content w-full p-4 rounded-xl focus:outline-none min-h-[360px] text-[#2C2C2C] leading-relaxed sm:leading-loose ${currentFontObj.class}`}
            style={{
              minHeight,
              fontSize: `${fontSize}px`,
              fontFamily: currentFontObj.family,
              lineHeight: 1.85,
            }}
            data-placeholder={placeholder}
          />
        )}
      </div>

      {/* Bottom Statistics & Information Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 border-t border-[#E5E2D9] bg-[#F7F5EE] text-xs text-[#6E6A64] rounded-b-2xl">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1">
            <span>الخط النشط:</span>
            <strong className="text-[#4A5D4E] font-bold">{currentFontObj.name.split('(')[0]}</strong>
          </span>
          <span>·</span>
          <span>
            الكلمات: <strong className="text-[#2C2C2C] font-mono font-bold">{wordCount.toLocaleString()}</strong>
          </span>
          <span>·</span>
          <span>
            الأحرف: <strong className="text-[#2C2C2C] font-mono font-bold">{charCount.toLocaleString()}</strong>
          </span>
          <span>·</span>
          <span>
            زمن القراءة التقديري: <strong className="text-[#8C5E45] font-bold font-mono">{readingTime} دقيقة</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#6E6A64]">
          <span className="px-2 py-0.5 rounded-md bg-white border border-[#E5E2D9]">
            {isSourceMode ? 'نمط كود المصدر HTML' : 'محرر مرئي منسق WYSIWYG'}
          </span>
        </div>
      </div>
    </div>
  );
};
