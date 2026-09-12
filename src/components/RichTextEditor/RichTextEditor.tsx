import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  AlignRight,
  AlignCenter,
  AlignLeft,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Sparkles,
  Maximize2,
  Minimize2,
  Undo,
  Redo,
  Copy,
  Check,
  Download,
  Trash2,
  Eye,
  Edit3,
  FileText,
  Type,
  Palette,
  Search,
  Highlighter,
  Sliders,
  Feather
} from 'lucide-react';
import { cleanChapterContent } from '../../utils/textCleaner';

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  onSave?: () => void;
  title?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'ابدأ بكتابة نص الرواية أو الفصل هنا... يمكنك استخدام باقة الخطوط العربية وأدوات التنسيق الأدبي العلوية...',
  minHeight = '460px',
  onSave,
  title,
}) => {
  const [activeMode, setActiveMode] = useState<'visual' | 'code' | 'preview'>('visual');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Typography state
  const [fontFamily, setFontFamily] = useState<string>('font-readex');
  const [fontSize, setFontSize] = useState<string>('text-lg');
  const [lineHeight, setLineHeight] = useState<string>('leading-loose');
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState<boolean>(false);
  const [showFindReplace, setShowFindReplace] = useState<boolean>(false);
  const [findText, setFindText] = useState<string>('');
  const [replaceText, setReplaceText] = useState<string>('');
  const [replaceMsg, setReplaceMsg] = useState<string | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef<boolean>(false);

  // Sync value into contentEditable without breaking cursor position
  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      isUpdatingRef.current = true;
      const html = editorRef.current.innerHTML;
      onChange(html);
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 50);
    }
  };

  const execCommand = (command: string, arg: string | undefined = undefined) => {
    if (activeMode !== 'visual') return;
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    handleInput();
  };

  const applyTextColor = (colorHex: string) => {
    execCommand('foreColor', colorHex);
    setShowColorPicker(false);
  };

  const applyHighlight = (colorHex: string) => {
    execCommand('hiliteColor', colorHex);
    setShowHighlightPicker(false);
  };

  const insertCustomBlock = (
    type: 'quote' | 'poetry' | 'divider' | 'dialogue' | 'dropcap' | 'ornament'
  ) => {
    if (activeMode !== 'visual') return;
    editorRef.current?.focus();
    const selection = window.getSelection();
    const selectedText = selection?.toString() || '';

    let htmlToInsert = '';
    if (type === 'quote') {
      htmlToInsert = `<blockquote style="margin: 1.6em 0; padding: 1.2em 1.8em; border-right: 4px solid #4A5D4E; background-color: #F7F5EE; font-style: italic; color: #3C4C3F; border-radius: 8px; font-size: 1.05em; line-height: 1.9;">« ${selectedText || 'اكتب هنا الاقتباس الأدبي المؤثر أو الحكمة الفلسفية المعبرة...'} »</blockquote><p><br></p>`;
    } else if (type === 'poetry') {
      htmlToInsert = `<div class="poetry-verse" style="text-align: center; margin: 1.8em auto; padding: 1.2em 1.5em; background: #FAF9F5; border: 1px dashed #D5D1C6; border-radius: 12px; font-weight: bold; max-width: 560px; line-height: 2.3;">
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 24px; font-size: 1.15em; color: #2C2C2C;">
          <span style="flex: 1; text-align: right;">${selectedText || 'صَدْرُ البَيْتِ هُنَا يَسْرِي بِلَهْفَتِهِ'}</span>
          <span style="color: #8C5E45; font-size: 1.2em; padding: 0 10px;">❖ ❖ ❖</span>
          <span style="flex: 1; text-align: left;">${'وَعَجْزُهُ فِي صَمِيمِ القَلْبِ يَسْتَعِرُ'}</span>
        </div>
      </div><p><br></p>`;
    } else if (type === 'divider') {
      htmlToInsert = `<div style="text-align: center; margin: 2.2em 0; color: #8C5E45; font-size: 1.4em; letter-spacing: 0.5em;" contenteditable="false">✦ ❖ ✦</div><p><br></p>`;
    } else if (type === 'ornament') {
      htmlToInsert = `<div style="text-align: center; margin: 2.2em 0; color: #4A5D4E; font-size: 1.4em; letter-spacing: 0.4em;" contenteditable="false">─── ✤ ───</div><p><br></p>`;
    } else if (type === 'dialogue') {
      htmlToInsert = `<p style="margin: 0.9em 0; line-height: 1.9;">— ${selectedText || 'بدأ بالحديث بصوت هادئ ونبرة عميقة...'}</p>`;
    } else if (type === 'dropcap') {
      const firstChar = selectedText ? selectedText.charAt(0) : 'كـ';
      const rest = selectedText ? selectedText.slice(1) : 'ـان ذلك اليوم مختلفاً عن سائر الأيام...';
      htmlToInsert = `<p style="line-height: 2;"><span style="float: right; font-size: 2.8em; line-height: 0.9; padding: 4px 8px 0 12px; font-weight: 900; color: #4A5D4E; font-family: serif;">${firstChar}</span>${rest}</p><p><br></p>`;
    }

    document.execCommand('insertHTML', false, htmlToInsert);
    handleInput();
  };

  const handleCleanText = () => {
    if (!editorRef.current) return;
    const currentHtml = editorRef.current.innerHTML;
    const cleaned = cleanChapterContent(currentHtml);
    const paragraphs = cleaned
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(Boolean)
      .map(p => `<p style="margin-bottom: 1.2em; line-height: 2;">${p}</p>`)
      .join('');

    editorRef.current.innerHTML = paragraphs || '<p><br></p>';
    handleInput();
  };

  const handleFindReplace = () => {
    if (!findText.trim() || !editorRef.current) return;
    const currentHtml = editorRef.current.innerHTML;
    const regex = new RegExp(findText, 'g');
    const matches = currentHtml.match(regex);
    if (!matches) {
      setReplaceMsg('لم يتم العثور على الكلمة المحددة.');
      setTimeout(() => setReplaceMsg(null), 3000);
      return;
    }
    const newHtml = currentHtml.replace(regex, replaceText);
    editorRef.current.innerHTML = newHtml;
    handleInput();
    setReplaceMsg(`تم استبدال ${matches.length} تطابق بنجاح.`);
    setTimeout(() => setReplaceMsg(null), 3000);
  };

  const handleCopy = () => {
    const rawText = editorRef.current?.innerText || value;
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = (format: 'txt' | 'html' | 'md') => {
    const filename = `${title || 'فصل_رواية'}.${format}`;
    let fileContent = value;
    let mimeType = 'text/html';
    if (format === 'txt') {
      fileContent = editorRef.current?.innerText || cleanChapterContent(value);
      mimeType = 'text/plain';
    } else if (format === 'md') {
      fileContent = cleanChapterContent(value);
      mimeType = 'text/markdown';
    }
    const blob = new Blob([fileContent], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Metrics
  const plainText = editorRef.current?.innerText || cleanChapterContent(value);
  const words = plainText.trim() ? plainText.trim().split(/\s+/).filter(Boolean).length : 0;
  const chars = plainText.length;
  const paragraphs = plainText.split(/\n\s*\n/).filter(p => p.trim()).length;
  const readTime = Math.max(1, Math.ceil(words / 200));

  const textColors = [
    { label: 'حبري كلاسيكي', hex: '#2C2C2C' },
    { label: 'زيتي غابي', hex: '#3C4C3F' },
    { label: 'بني عتيق', hex: '#8C5E45' },
    { label: 'كحلي داكن', hex: '#1E293B' },
    { label: 'ياقوتي قرمزي', hex: '#991B1B' },
    { label: 'ذهبي كهرماني', hex: '#B45309' },
  ];

  const highlightColors = [
    { label: 'أصفر مخطوطات', hex: '#FEF08A' },
    { label: 'أخضر مائي', hex: '#BBF7D0' },
    { label: 'سماوي رائق', hex: '#BAE6FD' },
    { label: 'وردي لطيف', hex: '#FBCFE8' },
    { label: 'بيج رملي', hex: '#E5E2D9' },
  ];

  return (
    <div
      className={`bg-[#FFFFFF] border border-[#E5E2D9] rounded-2xl shadow-sm transition-all flex flex-col ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none h-screen w-screen p-4 sm:p-8 bg-[#FDFCF8] overflow-y-auto'
          : 'relative w-full'
      }`}
    >
      {/* Top Bar: Title & Mode Switchers */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-[#E5E2D9] bg-[#FAF9F5] rounded-t-2xl">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#4A5D4E]/10 border border-[#4A5D4E]/20 flex items-center justify-center text-[#4A5D4E]">
            <Feather className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-[#2C2C2C] flex items-center gap-2 font-cairo">
              <span>محرر النصوص واستوديو التنسيق الأدبي الشامل</span>
              <span className="px-2 py-0.5 rounded-full bg-[#4A5D4E] text-[#FDFCF8] text-[10px] font-bold">
                Readex & Arabic Typography
              </span>
            </h3>
            {title && <p className="text-[11px] text-[#6E6A64] truncate max-w-xs">{title}</p>}
          </div>
        </div>

        {/* Action buttons on top right */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-[#EBE8DF] p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveMode('visual')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMode === 'visual'
                  ? 'bg-[#FFFFFF] text-[#4A5D4E] shadow-xs'
                  : 'text-[#6E6A64] hover:text-[#2C2C2C]'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>المحرر المرئي</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('code')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMode === 'code'
                  ? 'bg-[#FFFFFF] text-[#4A5D4E] shadow-xs'
                  : 'text-[#6E6A64] hover:text-[#2C2C2C]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>كود HTML</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('preview')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMode === 'preview'
                  ? 'bg-[#4A5D4E] text-[#FDFCF8] shadow-xs'
                  : 'text-[#6E6A64] hover:text-[#2C2C2C]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>معاينة القراءة</span>
            </button>
          </div>

          {/* Fullscreen toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl text-[#5C5954] hover:text-[#2C2C2C] hover:bg-[#EBE8DF] border border-[#E5E2D9] bg-[#FFFFFF] transition-all cursor-pointer"
            title={isFullscreen ? 'الخروج من وضع ملء الشاشة' : 'وضع التركيز الأدبي بملء الشاشة'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Toolbar (Visual mode) */}
      {activeMode === 'visual' && (
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 p-2 sm:p-2.5 border-b border-[#E5E2D9] bg-[#FDFCF8]">
          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5 border-l border-[#E5E2D9] pl-1 ml-1">
            <button
              type="button"
              onClick={() => execCommand('undo')}
              className="p-1.5 rounded-lg hover:bg-[#EBE8DF] text-[#5C5954] transition-colors cursor-pointer"
              title="تراجع (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCommand('redo')}
              className="p-1.5 rounded-lg hover:bg-[#EBE8DF] text-[#5C5954] transition-colors cursor-pointer"
              title="إعادة (Ctrl+Y)"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>

          {/* Typography Formatting */}
          <div className="flex items-center gap-0.5 border-l border-[#E5E2D9] pl-1 ml-1">
            <button
              type="button"
              onClick={() => execCommand('bold')}
              className="p-1.5 rounded-lg hover:bg-[#EBE8DF] text-[#2C2C2C] font-bold transition-colors cursor-pointer"
              title="عريض (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCommand('italic')}
              className="p-1.5 rounded-lg hover:bg-[#EBE8DF] text-[#2C2C2C] italic transition-colors cursor-pointer"
              title="مائل (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCommand('underline')}
              className="p-1.5 rounded-lg hover:bg-[#EBE8DF] text-[#2C2C2C] underline transition-colors cursor-pointer"
              title="تسطير (Ctrl+U)"
            >
              <Underline className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCommand('strikeThrough')}
              className="p-1.5 rounded-lg hover:bg-[#EBE8DF] text-[#5C5954] transition-colors cursor-pointer"
              title="يتوسطه خط"
            >
              <Strikethrough className="w-4 h-4" />
            </button>
          </div>

          {/* Heading Levels */}
          <div className="flex items-center gap-0.5 border-l border-[#E5E2D9] pl-1 ml-1">
            <button
              type="button"
              onClick={() => execCommand('formatBlock', '<h1>')}
              className="px-2 py-1 rounded-lg hover:bg-[#EBE8DF] text-[#2C2C2C] font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
              title="عنوان رئيسي H1"
            >
              <Heading1 className="w-4 h-4" />
              <span className="hidden md:inline text-[11px]">رئيسي</span>
            </button>
            <button
              type="button"
              onClick={() => execCommand('formatBlock', '<h2>')}
              className="px-2 py-1 rounded-lg hover:bg-[#EBE8DF] text-[#2C2C2C] font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
              title="عنوان فرعي H2"
            >
              <Heading2 className="w-4 h-4" />
              <span className="hidden md:inline text-[11px]">فرعي</span>
            </button>
            <button
              type="button"
              onClick={() => execCommand('formatBlock', '<h3>')}
              className="px-2 py-1 rounded-lg hover:bg-[#EBE8DF] text-[#2C2C2C] font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
              title="عنوان مقطع H3"
            >
              <Heading3 className="w-4 h-4" />
              <span className="hidden md:inline text-[11px]">مقطع</span>
            </button>
            <button
              type="button"
              onClick={() => execCommand('formatBlock', '<p>')}
              className="px-2 py-1 rounded-lg hover:bg-[#EBE8DF] text-[#5C5954] text-[11px] font-bold transition-colors cursor-pointer"
              title="فقرة عادية"
            >
              فقرة
            </button>
          </div>

          {/* Alignments */}
          <div className="flex items-center gap-0.5 border-l border-[#E5E2D9] pl-1 ml-1">
            <button
              type="button"
              onClick={() => execCommand('justifyRight')}
              className="p-1.5 rounded-lg hover:bg-[#EBE8DF] text-[#2C2C2C] transition-colors cursor-pointer"
              title="محاذاة لليمين"
            >
              <AlignRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCommand('justifyCenter')}
              className="p-1.5 rounded-lg hover:bg-[#EBE8DF] text-[#5C5954] transition-colors cursor-pointer"
              title="توسيط"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCommand('justifyLeft')}
              className="p-1.5 rounded-lg hover:bg-[#EBE8DF] text-[#5C5954] transition-colors cursor-pointer"
              title="محاذاة لليسار"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCommand('justifyFull')}
              className="p-1.5 rounded-lg hover:bg-[#EBE8DF] text-[#5C5954] transition-colors cursor-pointer"
              title="ضبط النص الكامل (Justify)"
            >
              <AlignJustify className="w-4 h-4" />
            </button>
          </div>

          {/* Literary Block Inserts */}
          <div className="flex items-center gap-1 border-l border-[#E5E2D9] pl-1 ml-1">
            <button
              type="button"
              onClick={() => insertCustomBlock('quote')}
              className="px-2.5 py-1 rounded-lg bg-[#FAF9F5] hover:bg-[#EBE8DF] border border-[#E5E2D9] text-[#3C4C3F] font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
              title="إدراج اقتباس أدبي مائل"
            >
              <Quote className="w-3.5 h-3.5 text-[#4A5D4E]" />
              <span>اقتباس</span>
            </button>

            <button
              type="button"
              onClick={() => insertCustomBlock('poetry')}
              className="px-2.5 py-1 rounded-lg bg-[#FAF9F5] hover:bg-[#EBE8DF] border border-[#E5E2D9] text-[#8C5E45] font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
              title="إدراج بيت شعر بشطرين متقابلين"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>بيت شعر</span>
            </button>

            <button
              type="button"
              onClick={() => insertCustomBlock('divider')}
              className="px-2 py-1 rounded-lg bg-[#FAF9F5] hover:bg-[#EBE8DF] border border-[#E5E2D9] text-[#8C5E45] text-xs font-mono font-bold transition-colors cursor-pointer"
              title="فاصل فصول ✦ ❖ ✦"
            >
              ✦❖✦
            </button>

            <button
              type="button"
              onClick={() => insertCustomBlock('ornament')}
              className="px-2 py-1 rounded-lg bg-[#FAF9F5] hover:bg-[#EBE8DF] border border-[#E5E2D9] text-[#4A5D4E] text-xs font-mono font-bold transition-colors cursor-pointer"
              title="زخرفة فواصل ── ✤ ──"
            >
              ──✤──
            </button>

            <button
              type="button"
              onClick={() => insertCustomBlock('dialogue')}
              className="px-2 py-1 rounded-lg bg-[#FAF9F5] hover:bg-[#EBE8DF] border border-[#E5E2D9] text-[#5C5954] text-xs font-bold transition-colors cursor-pointer"
              title="شرطة حوار روائي (—)"
            >
              — حوار
            </button>

            <button
              type="button"
              onClick={() => insertCustomBlock('dropcap')}
              className="px-2 py-1 rounded-lg bg-[#FAF9F5] hover:bg-[#EBE8DF] border border-[#E5E2D9] text-[#4A5D4E] text-xs font-bold transition-colors cursor-pointer"
              title="حرف استهلالي كبير لفاتحة الفصل"
            >
              استهلال
            </button>
          </div>

          {/* Font Family - All Top Arabic Fonts */}
          <div className="flex items-center gap-1.5 border-l border-[#E5E2D9] pl-1 ml-1">
            <select
              value={fontFamily}
              onChange={e => setFontFamily(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg border border-[#4A5D4E]/30 bg-[#FFFFFF] text-[#2C2C2C] font-bold cursor-pointer hover:border-[#4A5D4E]"
              title="اختر الخط العربي المفضل للنص"
            >
              <option value="font-readex">خط ريدكس برو (Readex Pro - عصري فائق الوضوح)</option>
              <option value="font-amiri">الخط الأميري (Amiri - أدبي روائي)</option>
              <option value="font-cairo">خط كايرو (Cairo - رصين صحفي)</option>
              <option value="font-tajawal">خط تجوال (Tajawal - ناعم متوازن)</option>
              <option value="font-almarai">خط المراعي (Almarai - انسيابي دقيق)</option>
              <option value="font-noto-naskh">خط النسخ (Noto Naskh - رسمي أكاديمي)</option>
              <option value="font-noto-kufi">خط كوفي (Noto Kufi - هندسي فخم)</option>
              <option value="font-aref">خط الرقعة (Aref Ruqaa - أصيل شاعري)</option>
              <option value="font-markazi">خط مركزي (Markazi Text - كتب ومطابع)</option>
              <option value="font-messiri">خط المسيري (El Messiri - بلاغي جمالي)</option>
              <option value="font-scheherazade">خط شهرزاد (Scheherazade - عثماني تراثي)</option>
            </select>

            {/* Font Size selector */}
            <select
              value={fontSize}
              onChange={e => setFontSize(e.target.value)}
              className="px-2 py-1 text-xs rounded-lg border border-[#E5E2D9] bg-[#FFFFFF] text-[#2C2C2C] font-bold cursor-pointer"
            >
              <option value="text-sm">صغير (14px)</option>
              <option value="text-base">عادي (16px)</option>
              <option value="text-lg">مريح (18px)</option>
              <option value="text-xl">كبير (20px)</option>
              <option value="text-2xl">عريض (24px)</option>
            </select>

            {/* Line Height Selector */}
            <select
              value={lineHeight}
              onChange={e => setLineHeight(e.target.value)}
              className="px-2 py-1 text-xs rounded-lg border border-[#E5E2D9] bg-[#FFFFFF] text-[#2C2C2C] font-bold cursor-pointer"
              title="تباعد الأسطر"
            >
              <option value="leading-normal">أسطر عادية</option>
              <option value="leading-relaxed">أسطر مريحة</option>
              <option value="leading-loose">أسطر رحبة أدبية</option>
            </select>
          </div>

          {/* Color & Highlight Pickers */}
          <div className="relative flex items-center gap-1 border-l border-[#E5E2D9] pl-1 ml-1">
            <button
              type="button"
              onClick={() => {
                setShowColorPicker(!showColorPicker);
                setShowHighlightPicker(false);
              }}
              className="p-1.5 rounded-lg hover:bg-[#EBE8DF] text-[#2C2C2C] transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
              title="لون الخط"
            >
              <Palette className="w-3.5 h-3.5 text-[#4A5D4E]" />
              <span className="text-[11px] hidden sm:inline">لون النص</span>
            </button>

            {showColorPicker && (
              <div className="absolute top-full right-0 mt-2 p-2 bg-[#FFFFFF] border border-[#E5E2D9] rounded-xl shadow-lg z-20 flex flex-col gap-1 w-36">
                <span className="text-[10px] text-[#6E6A64] font-bold mb-1 px-1">محبرة الكاتب:</span>
                {textColors.map(c => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => applyTextColor(c.hex)}
                    className="flex items-center gap-2 p-1 rounded-md hover:bg-[#FAF9F5] text-right text-xs cursor-pointer"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: c.hex }} />
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setShowHighlightPicker(!showHighlightPicker);
                setShowColorPicker(false);
              }}
              className="p-1.5 rounded-lg hover:bg-[#EBE8DF] text-[#2C2C2C] transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
              title="تظليل النص المختار"
            >
              <Highlighter className="w-3.5 h-3.5 text-[#8C5E45]" />
              <span className="text-[11px] hidden sm:inline">تظليل</span>
            </button>

            {showHighlightPicker && (
              <div className="absolute top-full right-0 mt-2 p-2 bg-[#FFFFFF] border border-[#E5E2D9] rounded-xl shadow-lg z-20 flex flex-col gap-1 w-36">
                <span className="text-[10px] text-[#6E6A64] font-bold mb-1 px-1">ألوان التظليل:</span>
                {highlightColors.map(c => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => applyHighlight(c.hex)}
                    className="flex items-center gap-2 p-1 rounded-md hover:bg-[#FAF9F5] text-right text-xs cursor-pointer"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: c.hex }} />
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search & Clean Text Tools */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowFindReplace(!showFindReplace)}
              className="px-2 py-1 rounded-lg hover:bg-[#EBE8DF] text-[#5C5954] text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              title="بحث واستبدال داخل النص"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">بحث واستبدال</span>
            </button>

            <button
              type="button"
              onClick={handleCleanText}
              className="px-2.5 py-1 rounded-lg bg-[#4A5D4E]/10 hover:bg-[#4A5D4E]/20 text-[#4A5D4E] font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
              title="تنظيف وتطهير النص من التنسيقات المشوهة والرموز الدخيلة"
            >
              <span>🧹 تنظيف الشوائب</span>
            </button>
          </div>
        </div>
      )}

      {/* Find and Replace Mini Panel */}
      {showFindReplace && activeMode === 'visual' && (
        <div className="p-3 bg-[#FAF9F5] border-b border-[#E5E2D9] flex flex-wrap items-center gap-2 text-xs">
          <input
            type="text"
            placeholder="الكلمة المراد البحث عنها..."
            value={findText}
            onChange={e => setFindText(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-[#E5E2D9] bg-[#FFFFFF] text-right text-xs flex-1 min-w-[140px]"
          />
          <input
            type="text"
            placeholder="الكلمة البديلة الجديدة..."
            value={replaceText}
            onChange={e => setReplaceText(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-[#E5E2D9] bg-[#FFFFFF] text-right text-xs flex-1 min-w-[140px]"
          />
          <button
            type="button"
            onClick={handleFindReplace}
            className="px-4 py-1.5 rounded-lg bg-[#4A5D4E] text-[#FDFCF8] font-bold cursor-pointer hover:bg-[#3C4C3F]"
          >
            استبدال الكل
          </button>
          {replaceMsg && <span className="text-xs text-[#4A5D4E] font-bold px-2">{replaceMsg}</span>}
        </div>
      )}

      {/* Editor Content Body */}
      <div className="p-4 sm:p-6 flex-1 flex flex-col">
        {activeMode === 'visual' && (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onBlur={handleInput}
            style={{ minHeight }}
            data-placeholder={placeholder}
            className={`w-full outline-none text-[#2C2C2C] ${fontFamily} ${fontSize} ${lineHeight} text-right dir-rtl empty:before:content-[attr(data-placeholder)] empty:before:text-[#A8A29E] empty:before:pointer-events-none focus:outline-none`}
          />
        )}

        {activeMode === 'code' && (
          <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            style={{ minHeight }}
            dir="ltr"
            className="w-full font-mono text-xs p-4 rounded-xl bg-[#1E293B] text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed overflow-y-auto"
            placeholder="<html><body>...</body></html>"
          />
        )}

        {activeMode === 'preview' && (
          <div
            style={{ minHeight }}
            className={`w-full p-6 sm:p-10 rounded-2xl bg-[#FAF9F5] border border-[#E5E2D9] text-[#2C2C2C] ${fontFamily} ${fontSize} ${lineHeight} shadow-inner overflow-y-auto text-justify`}
            dangerouslySetInnerHTML={{
              __html: value || '<p class="text-[#8C827A] italic text-center py-10">لا يوجد نص للمعاينة بعد...</p>'
            }}
          />
        )}
      </div>

      {/* Bottom Bar: Metrics, Actions, Export */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-t border-[#E5E2D9] bg-[#FAF9F5] text-xs text-[#6E6A64] rounded-b-2xl">
        {/* Real-time Literary Statistics */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <span className="font-bold text-[#2C2C2C]">
            <strong className="text-[#4A5D4E]">{words.toLocaleString('ar-EG')}</strong> كلمة
          </span>
          <span>
            <strong>{chars.toLocaleString('ar-EG')}</strong> حرف
          </span>
          <span>
            <strong>{paragraphs}</strong> فقرة
          </span>
          <span className="text-[#8C5E45] font-bold">
            ⏱️ {readTime} دقيقة قراءة مقدرة
          </span>
        </div>

        {/* Export & Save Shortcuts */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="px-2.5 py-1 rounded-lg hover:bg-[#EBE8DF] text-[#5C5954] font-medium transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
            title="نسخ النص كاملاً"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
          </button>

          <div className="flex items-center gap-1 border-r border-[#E5E2D9] pr-1 mr-1">
            <button
              type="button"
              onClick={() => handleDownload('txt')}
              className="px-2 py-0.5 rounded-md hover:bg-[#EBE8DF] text-[#6E6A64] text-[11px] cursor-pointer"
              title="تصدير كنص عادي TXT"
            >
              TXT
            </button>
            <button
              type="button"
              onClick={() => handleDownload('md')}
              className="px-2 py-0.5 rounded-md hover:bg-[#EBE8DF] text-[#6E6A64] text-[11px] cursor-pointer"
              title="تصدير كـ Markdown"
            >
              MD
            </button>
            <button
              type="button"
              onClick={() => handleDownload('html')}
              className="px-2 py-0.5 rounded-md hover:bg-[#EBE8DF] text-[#6E6A64] text-[11px] cursor-pointer"
              title="تصدير كـ HTML منسق"
            >
              HTML
            </button>
          </div>

          {onSave && (
            <button
              type="button"
              onClick={onSave}
              className="px-4 py-1.5 rounded-xl bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8] font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 text-xs mr-2"
            >
              <Check className="w-3.5 h-3.5" />
              <span>حفظ الفصل</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
