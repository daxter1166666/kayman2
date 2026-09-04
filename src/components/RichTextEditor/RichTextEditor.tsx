import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignRight,
  AlignCenter,
  AlignLeft,
  AlignJustify,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Sparkles,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Minus,
  RotateCcw,
  RotateCw,
  Search,
  Maximize2,
  Minimize2,
  Columns,
  Eye,
  Type,
  Palette,
  Highlighter,
  Check,
  Copy,
  Download,
  Printer,
  FileCode,
  BookOpen,
  Feather,
  HelpCircle,
  X,
  Plus
} from 'lucide-react';

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  showLivePreview?: boolean;
  novelTitle?: string;
  chapterTitle?: string;
  authorName?: string;
}

// Preset Ink Colors
const TEXT_COLORS = [
  { label: 'حبري كلاسيكي', color: '#2C2C2C', bg: 'bg-[#2C2C2C]' },
  { label: 'أخضر ميرمية أدبي', color: '#4A5D4E', bg: 'bg-[#4A5D4E]' },
  { label: 'ترابي محروق', color: '#8C5E45', bg: 'bg-[#8C5E45]' },
  { label: 'ذهبي أندلسي', color: '#C88A3B', bg: 'bg-[#C88A3B]' },
  { label: 'أحمر قرمزي', color: '#9B1D20', bg: 'bg-[#9B1D20]' },
  { label: 'أزرق نيلي ملكي', color: '#1E3A8A', bg: 'bg-[#1E3A8A]' },
  { label: 'رمادي خافت', color: '#6E6A64', bg: 'bg-[#6E6A64]' },
];

// Preset Highlighters
const HIGHLIGHT_COLORS = [
  { label: 'بدون تظليل', color: 'transparent', bg: 'bg-transparent border border-gray-300' },
  { label: 'ماركر ذهبي', color: '#FEF08A', bg: 'bg-amber-200' },
  { label: 'ماركر نعناعي', color: '#BBF7D0', bg: 'bg-emerald-200' },
  { label: 'ماركر خوخي', color: '#FED7AA', bg: 'bg-orange-200' },
  { label: 'ماركر سماوي', color: '#BAE6FD', bg: 'bg-sky-200' },
  { label: 'ماركر وردي', color: '#FBCFE8', bg: 'bg-pink-200' },
];

// Preset Fonts
const FONTS = [
  { id: 'Amiri', name: 'خط أميري كلاسيكي (الأدب والشعر)', family: "'Amiri', 'Lora', serif" },
  { id: 'Scheherazade New', name: 'خط شهرزاد (نسخ تراثي فاخر)', family: "'Scheherazade New', serif" },
  { id: 'Cairo', name: 'خط القاهرة (عصري متوازن)', family: "'Cairo', system-ui, sans-serif" },
  { id: 'Tajawal', name: 'خط تجوال (أنيق وسلس)', family: "'Tajawal', system-ui, sans-serif" },
  { id: 'Readex Pro', name: 'خط ريديكس (واضح ومريح)', family: "'Readex Pro', system-ui, sans-serif" },
];

// Preset Dividers
const ORNAMENTAL_DIVIDERS = [
  { label: 'نجوم ذهبية كلاسيكية', html: '<div class="book-divider my-8 text-center text-lg tracking-widest text-[#C88A3B] select-none font-bold">✦ &nbsp; ✦ &nbsp; ✦</div>' },
  { label: 'معينات أندلسية', html: '<div class="book-divider my-8 text-center text-lg tracking-widest text-[#4A5D4E] select-none font-bold">❖ &nbsp; ❖ &nbsp; ❖</div>' },
  { label: 'زخارف تراثية', html: '<div class="book-divider my-8 text-center text-xl tracking-widest text-[#C88A3B] select-none font-bold">۞ &nbsp; ۞ &nbsp; ۞</div>' },
  { label: 'ورود زهرية ناعمة', html: '<div class="book-divider my-8 text-center text-xl tracking-widest text-[#8C5E45] select-none font-bold">❦ &nbsp; ❦ &nbsp; ❦</div>' },
  { label: 'خط مزخرف مع زهرة', html: '<div class="book-divider my-8 flex items-center justify-center gap-4 text-[#6E6A64] opacity-70 select-none"><span class="h-px w-20 bg-current"></span><span class="text-[#C88A3B] text-base">✦</span><span class="h-px w-20 bg-current"></span></div>' },
];

// Preset Literary Templates
const LITERARY_TEMPLATES = [
  {
    title: 'بداية فصل غامض ومشوق',
    desc: 'مقدمة سردية تبدأ بوصف أجواء الليل والغسق مع حركة درامية.',
    html: `<p><span class="book-drop-cap">س</span>قط الغسق سريعاً فوق الشرفات الخارجية للقلعة الحجرية، كاسياً الأبراج العتيقة بظلال أرجوانية كثيفة. كانت الرياح تهب من جهة الوادي حاملة معها رائحة المطر العتيق ورائحة أوراق الخريف المتساقطة.</p><p>وقف مشدود القامة فوق الحاجز الصخري، وقد أحكم إغلاق رداءه الشتوي. كانت كل حواسه وخبرته الطويلة تنبئه بأن شيئاً غير مألوف على وشك الحدوث هذه الليلة.</p><div class="book-divider my-8 text-center text-lg tracking-widest text-[#C88A3B] select-none font-bold">✦ &nbsp; ✦ &nbsp; ✦</div><div class="book-dialogue pr-4 border-r-2 border-[#4A5D4E] my-4"><p><strong>الصوت المجهول:</strong> "هل تظن حقاً أنك قادر على عبور المضيق وحدك قبل شروق الشمس؟"</p><p><strong>البطل:</strong> "لم أعتد الانتظار حين يتعلق الأمر بإنقاذ الأبرياء."</p></div>`
  },
  {
    title: 'أبيات شعرية مع تقديم أدبي',
    desc: 'تقديم نثري يليه بيتان شعريان منسقان بنمط الشطر والعجز.',
    html: `<p>وفي تلك السويعات الخوالي، حين استبد به الحنين إلى ربوع الأندلس ونواويرها العاطرة، أنشد مستحضراً ذكريات لا تمحوها صروف الدهر:</p><div class="book-poetry-couplet my-6 p-4 rounded-2xl bg-[#4A5D4E]/5 border border-[#4A5D4E]/25 text-center font-amiri text-lg max-w-xl mx-auto shadow-xs"><div class="flex flex-col sm:flex-row justify-between items-center gap-4 py-2 border-b border-[#4A5D4E]/15"><div class="flex-1 text-center font-bold text-[#2C2C2C]">سَكَنَ اللَّيْلُ وَالأَمَانِي غِرَارُ</div><div class="text-[#C88A3B] text-sm select-none">✦</div><div class="flex-1 text-center font-bold text-[#2C2C2C]">وَفُؤَادِي بِذِكْرِكُمْ سَهَّارُ</div></div><div class="flex flex-col sm:flex-row justify-between items-center gap-4 py-2"><div class="flex-1 text-center font-bold text-[#2C2C2C]">كُلَّمَا رُمْتُ سَلْوَةً عَنْ هَوَاكُمْ</div><div class="text-[#C88A3B] text-sm select-none">✦</div><div class="flex-1 text-center font-bold text-[#2C2C2C]">هَدَّ صَبْرِي وَلَهْفَتِي التَّذْكَارُ</div></div></div><p>ثم أطبق عينيه في صمت، بينما واصلت قطرات المطر العزف الرتيب على نوافذ حجرته.</p>`
  },
  {
    title: 'اقتباس فكري أو فلسفي',
    desc: 'بطاقة اقتباس منسقة مع اسم القائل ومرجعه.',
    html: `<p>إن أعظم معارك الإنسان في هذه الحياة ليست تلك التي يخوضها ضد قوى العالم الخارجي، بل هي تلك الصامتة التي تدور رحاها في أعماق وجدانه:</p><blockquote class="book-quote-block my-6 p-5 rounded-2xl bg-[#F7F5EE] border-r-4 border-[#4A5D4E] italic font-amiri text-lg text-[#2C2C2C] shadow-xs"><p className="mb-2">"الكتب ليست مجرد أوراقٍ وأحبار، بل هي أرواحٌ حية تتنفس عبر القرون، تأخذ بيد القارئ لتعيد تشكيل وعيه بحقيقة الوجود."</p><cite class="block text-left text-xs not-italic font-bold text-[#4A5D4E] mt-3 font-cairo">— أيمن كناني، تأملات في الأدب والحياة</cite></blockquote><p>ولهذا يظل الحرف المكتوب هو الأثر الأبقى الذي يتحدى فناء الأيام وعوادي الزمان.</p>`
  },
  {
    title: 'مشهد حواري روائي متكامل',
    desc: 'قالب حوار متسلسل مع أوصاف ردود الأفعال.',
    html: `<p>جلس كلاهما أمام المدفأة الحجرية بينما كانت النيران ترسل ومضاتها الدافئة عبر الغرفة شبه المظلمة.</p><div class="book-dialogue pr-4 border-r-2 border-[#4A5D4E] my-4 space-y-3"><p><strong>الأستاذ:</strong> "ألم تفكر يوماً في الثمن الذي قد تدفعه حين تفتح باباً كان موصداً منذ ألف عام؟"</p><p><strong>الشاب (بلهجة ملؤها التحدي):</strong> "الجهل أغلى ثمناً يا أستاذي. والمعرفة حتى وإن كانت مريرة، تظل أفضل من عمى مطمئن."</p><p><strong>الأستاذ (مبتسماً في وقار):</strong> "كنت أعلم أنك ستقول هذا... خذ هذه المخطوطة إذن، واقرأ ما سُطر في صفحتها التاسعة."</p></div><p>تناول الشاب المخطوطة بوجل، وكانت أطراف أصابعه ترتجف لملامسة رق الغزال العتيق.</p>`
  }
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'ابدأ بكتابة نص الفصل وتنسيقه هنا مباشرة وبشكل حي...',
  minHeight = '420px',
  showLivePreview = true,
  novelTitle = 'الكتاب',
  chapterTitle = 'الفصل الحالي',
  authorName = 'الكاتب أيمن كناني'
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef<boolean>(false);
  const savedSelectionRef = useRef<Range | null>(null);

  // View state
  const [viewMode, setViewMode] = useState<'visual' | 'split' | 'source'>('visual');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [sourceCode, setSourceCode] = useState<string>(value || '');
  const [currentFont, setCurrentFont] = useState<string>('Amiri');
  const [currentFontSize, setCurrentFontSize] = useState<string>('18px');
  const [currentLineHeight, setCurrentLineHeight] = useState<string>('1.8');
  const [previewTheme, setPreviewTheme] = useState<'paper' | 'sepia' | 'dark' | 'emerald'>('paper');

  // Toolbar toggles
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState<boolean>(false);
  const [showDividerPicker, setShowDividerPicker] = useState<boolean>(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState<boolean>(false);
  const [showPoetryModal, setShowPoetryModal] = useState<boolean>(false);
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [showLinkModal, setShowLinkModal] = useState<boolean>(false);
  const [showTableModal, setShowTableModal] = useState<boolean>(false);
  const [showFindReplaceModal, setShowFindReplaceModal] = useState<boolean>(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);

  // Poetry modal inputs
  const [poetryShatr1, setPoetryShatr1] = useState<string>('');
  const [poetryShatr2, setPoetryShatr2] = useState<string>('');
  const [poetryShatr3, setPoetryShatr3] = useState<string>('');
  const [poetryShatr4, setPoetryShatr4] = useState<string>('');
  const [poetryDivider, setPoetryDivider] = useState<string>('✦');

  // Image modal inputs
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageCaption, setImageCaption] = useState<string>('');

  // Link modal inputs
  const [linkUrl, setLinkUrl] = useState<string>('https://');
  const [linkText, setLinkText] = useState<string>('');

  // Table modal inputs
  const [tableRows, setTableRows] = useState<number>(3);
  const [tableCols, setTableCols] = useState<number>(3);

  // Find & Replace inputs
  const [findWord, setFindWord] = useState<string>('');
  const [replaceWord, setReplaceWord] = useState<string>('');
  const [findCount, setFindCount] = useState<number | null>(null);

  // Feedback notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastAutoSave, setLastAutoSave] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Convert plain text newlines into HTML paragraphs if initial value doesn't have tags
  const normalizeInitialHtml = useCallback((raw: string): string => {
    if (!raw) return '';
    if (/<[a-z][\s\S]*>/i.test(raw)) {
      return raw;
    }
    // Plain text: convert paragraphs
    return raw
      .split('\n\n')
      .filter(p => p.trim())
      .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
      .join('');
  }, []);

  // Sync incoming value to editor contentEditable
  useEffect(() => {
    if (!editorRef.current) return;
    if (isUpdatingRef.current) return;

    const currentInner = editorRef.current.innerHTML;
    const normalized = normalizeInitialHtml(value);

    if (currentInner !== normalized) {
      editorRef.current.innerHTML = normalized;
      setSourceCode(normalized);
    }
  }, [value, normalizeInitialHtml]);

  // Handle content changes from typing or formatting
  const handleContentChange = () => {
    if (!editorRef.current) return;
    isUpdatingRef.current = true;
    const html = editorRef.current.innerHTML;
    setSourceCode(html);
    onChange(html);

    // Auto-save draft backup to localStorage
    try {
      localStorage.setItem('ayman_kinani_editor_draft', html);
      localStorage.setItem('ayman_kinani_editor_draft_time', new Date().toLocaleTimeString('ar-EG'));
      setLastAutoSave(new Date().toLocaleTimeString('ar-EG'));
    } catch {
      // Storage unavailable or full
    }

    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 50);
  };

  // Save and restore text selections
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    if (!savedSelectionRef.current) return;
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(savedSelectionRef.current);
    }
  };

  // Execute native document command
  const executeCommand = (command: string, arg: string | undefined = undefined) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    restoreSelection();
    document.execCommand(command, false, arg);
    handleContentChange();
  };

  // Insert custom HTML fragment at caret position
  const insertHtmlAtCaret = (html: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    restoreSelection();

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.deleteContents();

      const el = document.createElement('div');
      el.innerHTML = html;
      const frag = document.createDocumentFragment();
      let node: ChildNode | null = null;
      let lastNode: ChildNode | null = null;

      while ((node = el.firstChild)) {
        lastNode = frag.appendChild(node);
      }

      range.insertNode(frag);

      if (lastNode) {
        const newRange = range.cloneRange();
        newRange.setStartAfter(lastNode);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);
      }
    } else {
      // Fallback: append to end
      editorRef.current.innerHTML += html;
    }

    handleContentChange();
  };

  // Text alignment helper
  const handleAlign = (alignment: 'right' | 'center' | 'left' | 'justify') => {
    if (alignment === 'justify') {
      executeCommand('justifyFull');
    } else if (alignment === 'center') {
      executeCommand('justifyCenter');
    } else if (alignment === 'left') {
      executeCommand('justifyLeft');
    } else {
      executeCommand('justifyRight');
    }
  };

  // Block format (Heading, Paragraph)
  const handleFormatBlock = (tag: string) => {
    executeCommand('formatBlock', tag);
  };

  // Insert Poetry Couplet (شطر وعجز)
  const handleInsertPoetry = () => {
    if (!poetryShatr1.trim() && !poetryShatr2.trim()) {
      showToast('يرجى إدخال الشطر الأول والعجز على الأقل.');
      return;
    }

    let rowsHtml = `
      <div class="flex flex-col sm:flex-row justify-between items-center gap-4 py-2 border-b border-[#4A5D4E]/15">
        <div class="flex-1 text-center font-bold text-[#2C2C2C]">${poetryShatr1.trim() || '...'}</div>
        <div class="text-[#C88A3B] text-sm select-none">${poetryDivider}</div>
        <div class="flex-1 text-center font-bold text-[#2C2C2C]">${poetryShatr2.trim() || '...'}</div>
      </div>
    `;

    if (poetryShatr3.trim() || poetryShatr4.trim()) {
      rowsHtml += `
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4 py-2">
          <div class="flex-1 text-center font-bold text-[#2C2C2C]">${poetryShatr3.trim() || '...'}</div>
          <div class="text-[#C88A3B] text-sm select-none">${poetryDivider}</div>
          <div class="flex-1 text-center font-bold text-[#2C2C2C]">${poetryShatr4.trim() || '...'}</div>
        </div>
      `;
    }

    const poetryHtml = `
      <div class="book-poetry-couplet my-6 p-4 rounded-2xl bg-[#4A5D4E]/5 border border-[#4A5D4E]/25 text-center font-amiri text-lg max-w-xl mx-auto shadow-xs">
        ${rowsHtml}
      </div>
      <p><br></p>
    `;

    insertHtmlAtCaret(poetryHtml);
    setPoetryShatr1('');
    setPoetryShatr2('');
    setPoetryShatr3('');
    setPoetryShatr4('');
    setShowPoetryModal(false);
    showToast('تم إدراج البيت الشعري بنجاح!');
  };

  // Insert Quote Card
  const handleInsertQuote = () => {
    saveSelection();
    const sel = window.getSelection();
    const selectedText = sel ? sel.toString().trim() : '';
    const quoteText = selectedText || 'ضع نص الاقتباس الأدبي الحكيم هنا...';

    const quoteHtml = `
      <blockquote class="book-quote-block my-6 p-5 rounded-2xl bg-[#F7F5EE] border-r-4 border-[#4A5D4E] italic font-amiri text-lg text-[#2C2C2C] shadow-xs">
        <p class="mb-2">"${quoteText}"</p>
        <cite class="block text-left text-xs not-italic font-bold text-[#4A5D4E] mt-3 font-cairo">— اسم الكاتب أو المصدر</cite>
      </blockquote>
      <p><br></p>
    `;
    insertHtmlAtCaret(quoteHtml);
    showToast('تم إدراج بطاقة الاقتباس الأدبي!');
  };

  // Insert Drop Cap (حرف استهلالي كبير مزخرف)
  const handleInsertDropCap = () => {
    saveSelection();
    const sel = window.getSelection();
    const selectedText = sel ? sel.toString().trim() : '';
    const firstChar = selectedText ? selectedText.charAt(0) : 'ك';
    const restText = selectedText ? selectedText.slice(1) : 'انت تلك الليلة نقطة التحول الكبرى في مجرى الأحداث...';

    const dropCapHtml = `
      <p><span class="book-drop-cap float-right text-4xl sm:text-5xl leading-none pl-3 pt-1 font-amiri font-bold text-[#4A5D4E] select-none">${firstChar}</span>${restText}</p>
    `;
    insertHtmlAtCaret(dropCapHtml);
    showToast('تم تفعيل الاستهلال المزخرف (Drop Cap)!');
  };

  // Insert Dialogue block
  const handleInsertDialogue = () => {
    const dialogueHtml = `
      <div class="book-dialogue pr-4 border-r-2 border-[#4A5D4E] my-4 space-y-2">
        <p><strong>الشخصية الأولى:</strong> "نص الحوار الأول يكتب هنا..."</p>
        <p><strong>الشخصية الثانية:</strong> "الرد والتعقيب على الحوار يكتب هنا..."</p>
      </div>
      <p><br></p>
    `;
    insertHtmlAtCaret(dialogueHtml);
    showToast('تم إدراج صندوق المشهد والحوار!');
  };

  // Insert Author Note / Marginal Footnote
  const handleInsertAuthorNote = () => {
    const noteHtml = `
      <div class="book-author-note my-6 p-4 rounded-xl bg-[#C88A3B]/10 border border-dashed border-[#C88A3B]/40 text-xs sm:text-sm font-cairo text-[#2C2C2C]">
        <div class="flex items-center gap-1.5 font-bold text-[#C88A3B] mb-1">
          <span>✦ هامش وملاحظة الكاتب:</span>
        </div>
        <p>اكتب هنا التوضيح التاريخي أو الشرح الأدبي للهامش أو الملاحظة الخاصة بالقارئ...</p>
      </div>
      <p><br></p>
    `;
    insertHtmlAtCaret(noteHtml);
    showToast('تم إدراج صندوق الهامش والملاحظة!');
  };

  // Insert Image
  const handleInsertImage = () => {
    if (!imageUrl.trim()) {
      showToast('يرجى وضع رابط الصورة أو اختيار صورة جاهزة.');
      return;
    }

    const captionHtml = imageCaption.trim()
      ? `<figcaption class="text-center text-xs text-[#6E6A64] mt-2 font-cairo">${imageCaption.trim()}</figcaption>`
      : '';

    const imgHtml = `
      <figure class="my-6 text-center">
        <img src="${imageUrl.trim()}" alt="${imageCaption || 'صورة توضيحية'}" class="max-w-full sm:max-w-lg mx-auto rounded-2xl border border-[#E5E2D9] shadow-sm object-cover" />
        ${captionHtml}
      </figure>
      <p><br></p>
    `;

    insertHtmlAtCaret(imgHtml);
    setImageUrl('');
    setImageCaption('');
    setShowImageModal(false);
    showToast('تم إدراج الصورة بنجاح!');
  };

  // Insert Table
  const handleInsertTable = () => {
    let tableHtml = `<table class="my-6 w-full border-collapse border border-[#E5E2D9] rounded-xl overflow-hidden text-sm font-cairo"><thead><tr class="bg-[#F7F5EE]">`;
    for (let c = 1; c <= tableCols; c++) {
      tableHtml += `<th class="border border-[#E5E2D9] p-2.5 text-right font-bold text-[#2C2C2C]">عنوان ${c}</th>`;
    }
    tableHtml += `</tr></thead><tbody>`;

    for (let r = 1; r <= tableRows; r++) {
      tableHtml += `<tr>`;
      for (let c = 1; c <= tableCols; c++) {
        tableHtml += `<td class="border border-[#E5E2D9] p-2.5 text-right text-[#2C2C2C]">بيان ${r}-${c}</td>`;
      }
      tableHtml += `</tr>`;
    }

    tableHtml += `</tbody></table><p><br></p>`;

    insertHtmlAtCaret(tableHtml);
    setShowTableModal(false);
    showToast('تم إدراج الجدول بنجاح!');
  };

  // Insert Link
  const handleInsertLink = () => {
    if (!linkUrl.trim()) return;
    const textToUse = linkText.trim() || linkUrl.trim();
    const linkHtml = `<a href="${linkUrl.trim()}" target="_blank" rel="noopener noreferrer" class="text-[#4A5D4E] underline font-bold hover:text-[#3C4C3F]">${textToUse}</a>`;
    insertHtmlAtCaret(linkHtml);
    setLinkUrl('https://');
    setLinkText('');
    setShowLinkModal(false);
    showToast('تم إدراج الرابط!');
  };

  // Find and Replace
  const handleFindAndReplace = () => {
    if (!editorRef.current || !findWord.trim()) return;
    const html = editorRef.current.innerHTML;

    // Count occurrences in plain text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const text = tempDiv.innerText || '';
    const regex = new RegExp(findWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = text.match(regex);
    const count = matches ? matches.length : 0;
    setFindCount(count);

    if (replaceWord !== undefined && count > 0) {
      // Safe replacement within innerHTML
      const replacedHtml = html.replace(regex, replaceWord);
      editorRef.current.innerHTML = replacedHtml;
      handleContentChange();
      showToast(`تم استبدال ${count} تطابق بنجاح!`);
    } else if (count === 0) {
      showToast('لم يتم العثور على أي تطابق للكلمة.');
    }
  };

  // Restore Draft Backup
  const handleRestoreDraft = () => {
    try {
      const draft = localStorage.getItem('ayman_kinani_editor_draft');
      if (draft && editorRef.current) {
        editorRef.current.innerHTML = draft;
        handleContentChange();
        showToast('تمت استعادة المسودة بنجاح!');
      } else {
        showToast('لا توجد مسودة محفوظة حالياً.');
      }
    } catch {
      showToast('تعذر استعادة المسودة.');
    }
  };

  // Live Metrics Calculation
  const getEditorStats = () => {
    if (!editorRef.current) {
      return { words: 0, chars: 0, paragraphs: 0, readTime: 1 };
    }
    const text = editorRef.current.innerText || '';
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    const paragraphs = trimmed ? trimmed.split(/\n+/).filter(Boolean).length : 0;
    const readTime = Math.max(1, Math.ceil(words / 190));
    return { words, chars, paragraphs, readTime };
  };

  const stats = getEditorStats();

  // Print Formatted Chapter
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('يرجى السماح بالنوافذ المنبثقة للطباعة.');
      return;
    }
    const htmlContent = editorRef.current?.innerHTML || '';
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="utf-8">
          <title>${chapterTitle} - ${novelTitle}</title>
          <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Amiri', serif; font-size: 16pt; line-height: 2; margin: 3cm 2cm; color: #111; direction: rtl; }
            h1 { font-size: 22pt; text-align: center; margin-bottom: 0.5cm; }
            .header-meta { text-align: center; font-size: 11pt; color: #555; margin-bottom: 1.5cm; border-bottom: 1px solid #ccc; padding-bottom: 0.5cm; }
            .book-poetry-couplet { margin: 1.5cm auto; text-align: center; max-width: 80%; border: 1px solid #aaa; padding: 0.5cm; border-radius: 8px; }
            .book-quote-block { margin: 1cm 0; padding: 0.5cm; border-right: 4px solid #333; background: #f9f9f9; font-style: italic; }
            .book-divider { text-align: center; margin: 1cm 0; font-size: 14pt; }
            @page { size: A4; margin: 2cm; }
          </style>
        </head>
        <body>
          <h1>${chapterTitle}</h1>
          <div class="header-meta">
            <span>من كتاب: ${novelTitle}</span> |
            <span>بقلم: ${authorName}</span> |
            <span>أيمن كناني</span>
          </div>
          <div>${htmlContent}</div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Copy Formatted Content
  const handleCopyFormatted = () => {
    if (editorRef.current) {
      navigator.clipboard.writeText(editorRef.current.innerHTML);
      showToast('تم نسخ كود HTML المنسق إلى الحافظة!');
    }
  };

  return (
    <div
      className={`rounded-3xl border border-[#E5E2D9] bg-[#FFFFFF] shadow-sm transition-all text-[#2C2C2C] flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none bg-[#FDFCF8] overflow-auto' : 'relative'
      }`}
    >
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#4A5D4E] text-[#FDFCF8] px-5 py-2.5 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <Check className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP BAR: Title, Mode switcher, Zen mode, Auto-save notice */}
      <div className="p-3 sm:px-4 border-b border-[#E5E2D9] bg-[#F7F5EE]/70 flex flex-wrap items-center justify-between gap-2.5 rounded-t-3xl">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[#4A5D4E]/15 text-[#4A5D4E] flex items-center justify-center font-bold">
            <Feather className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#2C2C2C] flex items-center gap-1.5">
              <span>محرر الكتب والنصوص الأدبي المرئي (WYSIWYG)</span>
              <span className="px-2 py-0.5 rounded-full bg-[#4A5D4E]/10 text-[#4A5D4E] text-[10px] font-mono">
                مباشر وفوري
              </span>
            </h3>
            {lastAutoSave && (
              <span className="text-[10px] text-[#6E6A64]">
                حفظ مسودة تلقائية: {lastAutoSave}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* View Modes */}
          <div className="flex items-center bg-[#FFFFFF] border border-[#E5E2D9] p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setViewMode('visual')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'visual'
                  ? 'bg-[#4A5D4E] text-[#FDFCF8] shadow-xs'
                  : 'text-[#6E6A64] hover:text-[#2C2C2C]'
              }`}
              title="المحرر المرئي المباشر"
            >
              <Type className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">محرر مرئي</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'split'
                  ? 'bg-[#4A5D4E] text-[#FDFCF8] shadow-xs'
                  : 'text-[#6E6A64] hover:text-[#2C2C2C]'
              }`}
              title="معاينة حية جنباً إلى جنب"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">معاينة مزدوجة</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (viewMode !== 'source' && editorRef.current) {
                  setSourceCode(editorRef.current.innerHTML);
                }
                setViewMode(viewMode === 'source' ? 'visual' : 'source');
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'source'
                  ? 'bg-[#4A5D4E] text-[#FDFCF8] shadow-xs'
                  : 'text-[#6E6A64] hover:text-[#2C2C2C]'
              }`}
              title="كود HTML المصدري"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">HTML</span>
            </button>
          </div>

          {/* Templates Button */}
          <button
            type="button"
            onClick={() => setShowTemplatesModal(true)}
            className="px-2.5 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F4F1EA] border border-[#E5E2D9] text-[#4A5D4E] font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-xs"
            title="قوالب أدبية وشعرية جاهزة"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C88A3B]" />
            <span className="hidden md:inline">قوالب جاهزة</span>
          </button>

          {/* Shortcuts Help */}
          <button
            type="button"
            onClick={() => setShowShortcutsModal(true)}
            className="p-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F4F1EA] border border-[#E5E2D9] text-[#6E6A64] hover:text-[#2C2C2C] cursor-pointer transition-all"
            title="اختصارات لوحة المفاتيح"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Zen Mode */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F4F1EA] border border-[#E5E2D9] text-[#6E6A64] hover:text-[#2C2C2C] cursor-pointer transition-all"
            title={isFullscreen ? 'تصغير وضع ملء الشاشة' : 'وضع التركيز الكامل (Zen Mode)'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* RICH RIBBON TOOLBAR (Always Visible in Visual/Split Mode) */}
      {viewMode !== 'source' && (
        <div className="p-2 sm:p-2.5 border-b border-[#E5E2D9] bg-[#FFFFFF] flex flex-wrap items-center gap-1 sm:gap-1.5 text-xs text-[#2C2C2C]">
          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5 pl-1.5 border-l border-[#E5E2D9]">
            <button
              type="button"
              onClick={() => executeCommand('undo')}
              className="p-1.5 rounded-lg hover:bg-[#F7F5EE] text-[#6E6A64] hover:text-[#2C2C2C] cursor-pointer transition-colors"
              title="تراجع (Ctrl+Z)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('redo')}
              className="p-1.5 rounded-lg hover:bg-[#F7F5EE] text-[#6E6A64] hover:text-[#2C2C2C] cursor-pointer transition-colors"
              title="إعادة (Ctrl+Y)"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Font Family Selector */}
          <div className="flex items-center">
            <select
              value={currentFont}
              onChange={e => {
                const selected = FONTS.find(f => f.id === e.target.value);
                if (selected) {
                  setCurrentFont(selected.id);
                  if (editorRef.current) {
                    editorRef.current.style.fontFamily = selected.family;
                  }
                  executeCommand('fontName', selected.family);
                }
              }}
              className="px-2 py-1.5 text-xs font-bold rounded-lg border border-[#E5E2D9] bg-[#FDFCF8] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] cursor-pointer"
              title="نوع الخط العربي"
            >
              {FONTS.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Heading Levels */}
          <div className="flex items-center">
            <select
              onChange={e => handleFormatBlock(e.target.value)}
              defaultValue="p"
              className="px-2 py-1.5 text-xs font-bold rounded-lg border border-[#E5E2D9] bg-[#FDFCF8] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] cursor-pointer"
              title="تنسيق الفقرة والعناوين"
            >
              <option value="p">نص عادي (فقرة)</option>
              <option value="h1">عنوان باب رئيسي (H1)</option>
              <option value="h2">عنوان فصل كبير (H2)</option>
              <option value="h3">عنوان مقطع متوسط (H3)</option>
              <option value="h4">عنوان فرعي صغير (H4)</option>
            </select>
          </div>

          {/* Font Size Selector */}
          <div className="flex items-center border border-[#E5E2D9] rounded-lg bg-[#FDFCF8] overflow-hidden">
            <select
              value={currentFontSize}
              onChange={e => {
                const size = e.target.value;
                setCurrentFontSize(size);
                if (editorRef.current) {
                  editorRef.current.style.fontSize = size;
                }
              }}
              className="px-2 py-1 text-xs font-bold bg-transparent text-[#2C2C2C] focus:outline-none cursor-pointer"
              title="حجم الخط الأساسي"
            >
              <option value="14px">14px</option>
              <option value="16px">16px</option>
              <option value="18px">18px (مثالي)</option>
              <option value="20px">20px (كبير)</option>
              <option value="24px">24px (عريض)</option>
              <option value="28px">28px</option>
              <option value="32px">32px</option>
            </select>
          </div>

          {/* Line Height Selector */}
          <div className="flex items-center">
            <select
              value={currentLineHeight}
              onChange={e => {
                const lh = e.target.value;
                setCurrentLineHeight(lh);
                if (editorRef.current) {
                  editorRef.current.style.lineHeight = lh;
                }
              }}
              className="px-2 py-1.5 text-xs font-bold rounded-lg border border-[#E5E2D9] bg-[#FDFCF8] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] cursor-pointer"
              title="تباعد الأسطر"
            >
              <option value="1.5">أسطر مضغوطة (1.5)</option>
              <option value="1.8">تباعد متوازن (1.8)</option>
              <option value="2.2">تباعد رائق ومريح (2.2)</option>
            </select>
          </div>

          {/* Basic Text Formatting Group */}
          <div className="flex items-center gap-0.5 px-1 border-x border-[#E5E2D9]">
            <button
              type="button"
              onClick={() => executeCommand('bold')}
              className="p-1.5 rounded-lg hover:bg-[#F7F5EE] text-[#2C2C2C] font-bold cursor-pointer transition-colors"
              title="غامق (Ctrl+B)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('italic')}
              className="p-1.5 rounded-lg hover:bg-[#F7F5EE] text-[#2C2C2C] italic cursor-pointer transition-colors"
              title="مائل (Ctrl+I)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('underline')}
              className="p-1.5 rounded-lg hover:bg-[#F7F5EE] text-[#2C2C2C] underline cursor-pointer transition-colors"
              title="تسطير (Ctrl+U)"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('strikeThrough')}
              className="p-1.5 rounded-lg hover:bg-[#F7F5EE] text-[#6E6A64] hover:text-[#2C2C2C] line-through cursor-pointer transition-colors"
              title="شطب"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Colors & Highlighters */}
          <div className="flex items-center gap-1 relative">
            {/* Text Color Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  saveSelection();
                  setShowColorPicker(!showColorPicker);
                  setShowHighlightPicker(false);
                }}
                className="p-1.5 rounded-lg hover:bg-[#F7F5EE] text-[#4A5D4E] flex items-center gap-1 cursor-pointer transition-colors"
                title="لون الحبر والخط"
              >
                <Palette className="w-3.5 h-3.5" />
              </button>

              {showColorPicker && (
                <div className="absolute top-full mt-1.5 right-0 z-30 p-2.5 rounded-2xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xl w-48 space-y-1.5">
                  <span className="text-[11px] font-bold text-[#6E6A64] block px-1">
                    اختر لون الحبر الأدبي:
                  </span>
                  <div className="grid grid-cols-4 gap-1.5 p-1">
                    {TEXT_COLORS.map(c => (
                      <button
                        key={c.color}
                        type="button"
                        onClick={() => {
                          executeCommand('foreColor', c.color);
                          setShowColorPicker(false);
                        }}
                        className={`w-7 h-7 rounded-lg ${c.bg} hover:scale-110 transition-transform cursor-pointer shadow-xs`}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Highlighter Marker Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  saveSelection();
                  setShowHighlightPicker(!showHighlightPicker);
                  setShowColorPicker(false);
                }}
                className="p-1.5 rounded-lg hover:bg-[#F7F5EE] text-[#C88A3B] flex items-center gap-1 cursor-pointer transition-colors"
                title="تظليل النص بالماركر"
              >
                <Highlighter className="w-3.5 h-3.5" />
              </button>

              {showHighlightPicker && (
                <div className="absolute top-full mt-1.5 right-0 z-30 p-2.5 rounded-2xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xl w-48 space-y-1.5">
                  <span className="text-[11px] font-bold text-[#6E6A64] block px-1">
                    اختر لون الماركر:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 p-1">
                    {HIGHLIGHT_COLORS.map(c => (
                      <button
                        key={c.color}
                        type="button"
                        onClick={() => {
                          executeCommand('hiliteColor', c.color);
                          setShowHighlightPicker(false);
                        }}
                        className={`h-7 rounded-lg ${c.bg} text-[10px] font-bold text-[#2C2C2C] flex items-center justify-center cursor-pointer`}
                        title={c.label}
                      >
                        {c.color === 'transparent' ? 'مسح' : ''}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Text Alignment */}
          <div className="flex items-center gap-0.5 px-1 border-x border-[#E5E2D9]">
            <button
              type="button"
              onClick={() => handleAlign('right')}
              className="p-1.5 rounded-lg hover:bg-[#F7F5EE] text-[#2C2C2C] cursor-pointer transition-colors"
              title="محاذاة لليمين"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleAlign('center')}
              className="p-1.5 rounded-lg hover:bg-[#F7F5EE] text-[#2C2C2C] cursor-pointer transition-colors"
              title="توسيط"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleAlign('left')}
              className="p-1.5 rounded-lg hover:bg-[#F7F5EE] text-[#2C2C2C] cursor-pointer transition-colors"
              title="محاذاة لليسار"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleAlign('justify')}
              className="p-1.5 rounded-lg hover:bg-[#F7F5EE] text-[#2C2C2C] cursor-pointer transition-colors"
              title="ضبط كشيدة (Justify)"
            >
              <AlignJustify className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-0.5 pl-1 border-l border-[#E5E2D9]">
            <button
              type="button"
              onClick={() => executeCommand('insertUnorderedList')}
              className="p-1.5 rounded-lg hover:bg-[#F7F5EE] text-[#2C2C2C] cursor-pointer transition-colors"
              title="قائمة نقطية"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('insertOrderedList')}
              className="p-1.5 rounded-lg hover:bg-[#F7F5EE] text-[#2C2C2C] cursor-pointer transition-colors"
              title="قائمة مرقمة"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* LITERARY SPECIAL COMPONENTS (Poetry, Quotes, Dividers, Dialogue, Drop Cap) */}
          <div className="flex items-center gap-1 px-1 bg-[#F7F5EE]/60 p-1 rounded-xl border border-[#E5E2D9]/80">
            {/* Poetry Couplet Modal Trigger */}
            <button
              type="button"
              onClick={() => {
                saveSelection();
                setShowPoetryModal(true);
              }}
              className="px-2 py-1 rounded-lg bg-[#FFFFFF] hover:bg-[#4A5D4E] hover:text-white text-[#4A5D4E] border border-[#E5E2D9] font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
              title="إدراج بيت شعري (شطر وعجز)"
            >
              <Feather className="w-3 h-3 text-[#C88A3B]" />
              <span>بيت شعر</span>
            </button>

            {/* Blockquote Button */}
            <button
              type="button"
              onClick={handleInsertQuote}
              className="px-2 py-1 rounded-lg bg-[#FFFFFF] hover:bg-[#4A5D4E] hover:text-white text-[#2C2C2C] border border-[#E5E2D9] font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
              title="إدراج بطاقة اقتباس أدبي فاخر"
            >
              <Quote className="w-3 h-3 text-[#4A5D4E]" />
              <span>اقتباس</span>
            </button>

            {/* Ornamental Dividers Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  saveSelection();
                  setShowDividerPicker(!showDividerPicker);
                }}
                className="px-2 py-1 rounded-lg bg-[#FFFFFF] hover:bg-[#4A5D4E] hover:text-white text-[#C88A3B] border border-[#E5E2D9] font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                title="إدراج فاصل فصول مزخرف"
              >
                <span>✦ فواصل</span>
              </button>

              {showDividerPicker && (
                <div className="absolute top-full mt-1.5 right-0 z-30 p-2.5 rounded-2xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xl w-56 space-y-1">
                  <span className="text-[11px] font-bold text-[#6E6A64] block px-1 pb-1 border-b border-[#E5E2D9]">
                    فواصل وزخارف الفصول:
                  </span>
                  {ORNAMENTAL_DIVIDERS.map((d, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        insertHtmlAtCaret(d.html);
                        setShowDividerPicker(false);
                      }}
                      className="w-full text-right px-2.5 py-1.5 rounded-lg hover:bg-[#F7F5EE] text-xs font-bold text-[#2C2C2C] flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <span>{d.label}</span>
                      <span className="text-[#C88A3B] font-mono">✦</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Drop Cap */}
            <button
              type="button"
              onClick={handleInsertDropCap}
              className="p-1 rounded-lg hover:bg-[#FFFFFF] text-[#4A5D4E] font-bold text-xs cursor-pointer transition-colors"
              title="استهلال مزخرف لأول حرف في الفقرة (Drop Cap)"
            >
              <span>[كـ]</span>
            </button>

            {/* Dialogue */}
            <button
              type="button"
              onClick={handleInsertDialogue}
              className="p-1 rounded-lg hover:bg-[#FFFFFF] text-[#2C2C2C] font-bold text-xs cursor-pointer transition-colors"
              title="إدراج مشهد حوار روائي"
            >
              <span>حوار</span>
            </button>

            {/* Author Note */}
            <button
              type="button"
              onClick={handleInsertAuthorNote}
              className="p-1 rounded-lg hover:bg-[#FFFFFF] text-[#C88A3B] font-bold text-xs cursor-pointer transition-colors"
              title="إدراج صندوق هامش أو ملاحظة الكاتب"
            >
              <span>هامش</span>
            </button>
          </div>

          {/* Media & Embeds: Image, Table, Link */}
          <div className="flex items-center gap-0.5 pl-1 border-l border-[#E5E2D9]">
            <button
              type="button"
              onClick={() => {
                saveSelection();
                setShowImageModal(true);
              }}
              className="p-1.5 rounded-lg hover:bg-[#F7F5EE] text-[#4A5D4E] cursor-pointer transition-colors"
              title="إدراج صورة توضيحية داخل الفصل"
            >
              <ImageIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                saveSelection();
                setShowTableModal(true);
              }}
              className="p-1.5 rounded-lg hover:bg-[#F7F5EE] text-[#2C2C2C] cursor-pointer transition-colors"
              title="إدراج جدول منسق"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                saveSelection();
                setShowLinkModal(true);
              }}
              className="p-1.5 rounded-lg hover:bg-[#F7F5EE] text-[#2C2C2C] cursor-pointer transition-colors"
              title="إدراج رابط تشعبي"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search / Replace & Print Utilities */}
          <div className="flex items-center gap-0.5 mr-auto">
            <button
              type="button"
              onClick={() => setShowFindReplaceModal(true)}
              className="p-1.5 rounded-lg hover:bg-[#F7F5EE] text-[#6E6A64] hover:text-[#2C2C2C] cursor-pointer transition-colors"
              title="بحث واستبدال الكلمات عبر كامل النص"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 rounded-lg hover:bg-[#F7F5EE] text-[#6E6A64] hover:text-[#2C2C2C] cursor-pointer transition-colors"
              title="طباعة الفصل بشكل أنيق"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleCopyFormatted}
              className="p-1.5 rounded-lg hover:bg-[#F7F5EE] text-[#6E6A64] hover:text-[#2C2C2C] cursor-pointer transition-colors"
              title="نسخ كود الفصل المنسق"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA: Visual / Split / Source */}
      <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-[#E5E2D9] overflow-hidden">
        {/* EDITING PANE (Visual or Source) */}
        <div className={`flex-1 flex flex-col min-w-0 ${viewMode === 'split' ? 'md:w-1/2' : 'w-full'}`}>
          {viewMode === 'source' ? (
            /* HTML Raw Code View */
            <div className="p-4 flex-1 bg-[#1E1E1E] text-[#D4D4D4] font-mono text-xs overflow-auto">
              <textarea
                value={sourceCode}
                onChange={e => {
                  setSourceCode(e.target.value);
                  onChange(e.target.value);
                }}
                className="w-full h-full min-h-[400px] bg-transparent text-[#D4D4D4] focus:outline-none resize-none leading-relaxed"
                placeholder="<!-- اكتب كود HTML هنا مباشرة -->"
                dir="ltr"
              />
            </div>
          ) : (
            /* Direct Visual contentEditable Canvas */
            <div className="p-6 sm:p-8 flex-1 overflow-auto bg-[#FDFCF8] cursor-text">
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleContentChange}
                onBlur={handleContentChange}
                onKeyUp={saveSelection}
                onMouseUp={saveSelection}
                data-placeholder={placeholder}
                style={{
                  minHeight,
                  fontFamily: FONTS.find(f => f.id === currentFont)?.family || "'Amiri', serif",
                  fontSize: currentFontSize,
                  lineHeight: currentLineHeight,
                }}
                className="rich-editor-canvas outline-none select-text focus:outline-none text-[#2C2C2C] selection:bg-[#4A5D4E]/20 space-y-4 empty:before:text-[#A8A29E] empty:before:content-[attr(data-placeholder)] empty:before:pointer-events-none"
              />
            </div>
          )}
        </div>

        {/* SPLIT VIEW: Live Reader Simulation Pane */}
        {viewMode === 'split' && (
          <div className="flex-1 md:w-1/2 flex flex-col bg-[#F7F5EE]/40 border-t md:border-t-0 border-[#E5E2D9] overflow-hidden">
            {/* Live Reader Header Controls */}
            <div className="p-3 border-b border-[#E5E2D9] bg-[#FFFFFF] flex items-center justify-between gap-2 text-xs">
              <span className="font-bold text-[#4A5D4E] flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>معاينة القارئ الحية في نفس اللحظة</span>
              </span>

              {/* Theme quick toggle */}
              <div className="flex items-center gap-1 bg-[#F7F5EE] p-0.5 rounded-lg border border-[#E5E2D9]">
                {[
                  { id: 'paper', label: 'ورقي' },
                  { id: 'sepia', label: 'سيبيا' },
                  { id: 'dark', label: 'ليلي' },
                  { id: 'emerald', label: 'زمرد' },
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setPreviewTheme(t.id as any)}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer transition-all ${
                      previewTheme === t.id
                        ? 'bg-[#4A5D4E] text-[#FDFCF8]'
                        : 'text-[#6E6A64] hover:text-[#2C2C2C]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reader Simulation Viewport */}
            <div
              className={`p-6 sm:p-8 flex-1 overflow-auto transition-colors ${
                previewTheme === 'sepia'
                  ? 'bg-[#f4ecd8] text-[#433422]'
                  : previewTheme === 'dark'
                  ? 'bg-[#0f0e0e] text-[#e5e5e5]'
                  : previewTheme === 'emerald'
                  ? 'bg-[#061e18] text-[#d6ede4]'
                  : 'bg-[#FDFCF8] text-[#2C2C2C]'
              }`}
            >
              <div className="max-w-xl mx-auto">
                <div className="text-center pb-6 mb-6 border-b border-current/15">
                  <span className="text-xs font-bold opacity-75 font-cairo block mb-1">
                    {novelTitle}
                  </span>
                  <h2 className="text-2xl font-bold font-amiri tracking-tight">
                    {chapterTitle || 'عنوان الفصل'}
                  </h2>
                  <div className="text-xs opacity-60 mt-1 font-cairo">
                    {stats.words.toLocaleString()} كلمة · {stats.readTime} دقائق قراءة · بقلم {authorName}
                  </div>
                </div>

                <div
                  className="book-reader-content space-y-6 leading-relaxed font-amiri select-text text-base sm:text-lg"
                  dangerouslySetInnerHTML={{ __html: sourceCode || '<p class="opacity-50 italic text-center py-10 font-cairo">ابدأ بكتابة النص لتراه يظهر هنا فوراً بكل تنسيقاته وأبياته وزخارفه...</p>' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM STATUS BAR: Real-time Word Counts & Quick Utilities */}
      <div className="p-2.5 sm:px-4 border-t border-[#E5E2D9] bg-[#F7F5EE] flex flex-wrap items-center justify-between gap-3 text-xs text-[#6E6A64] rounded-b-3xl">
        <div className="flex flex-wrap items-center gap-3 sm:gap-5 font-mono">
          <span>
            الكلمات: <strong className="text-[#4A5D4E] font-bold">{stats.words.toLocaleString()}</strong>
          </span>
          <span>
            الحروف: <strong className="text-[#2C2C2C]">{stats.chars.toLocaleString()}</strong>
          </span>
          <span>
            الفقرات: <strong className="text-[#2C2C2C]">{stats.paragraphs}</strong>
          </span>
          <span>
            وقت القراءة المقدر: <strong className="text-[#C88A3B]">{stats.readTime} دقيقة</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-cairo">
          <button
            type="button"
            onClick={handleRestoreDraft}
            className="text-[#4A5D4E] hover:underline cursor-pointer font-bold"
            title="استعادة المسودة من المتصفح"
          >
            استعادة المسودة السابقة
          </button>
          <span>·</span>
          <span>التنسيق فوري وتلقائي</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODALS & DIALOGS                                          */}
      {/* ========================================================= */}

      {/* 1. POETRY COUPLET MODAL (إدراج بيت شعري شطر وعجز) */}
      {showPoetryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E5E2D9] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 font-cairo">
            <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-3">
              <h4 className="text-base font-bold text-[#2C2C2C] flex items-center gap-2">
                <Feather className="w-4 h-4 text-[#C88A3B]" />
                <span>إدراج بيت شعري منسق (شطر وعجز)</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowPoetryModal(false)}
                className="p-1 text-[#6E6A64] hover:text-[#2C2C2C] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#6E6A64]">
              يتم تنسيق الأبيات آلياً بنمط الشطر والعجز المتوازن مع فاصل وزخرفة أدبية تليق بكتب الشعر والأدب.
            </p>

            {/* Bayt 1 */}
            <div className="space-y-3 p-4 rounded-2xl bg-[#F7F5EE] border border-[#E5E2D9]">
              <span className="text-xs font-bold text-[#4A5D4E] block">البيت الأول:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#6E6A64] block mb-1">الصدر (الشطر الأول):</label>
                  <input
                    type="text"
                    placeholder="مثال: سَكَنَ اللَّيْلُ وَالأَمَانِي غِرَارُ"
                    value={poetryShatr1}
                    onChange={e => setPoetryShatr1(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E5E2D9] font-amiri font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#6E6A64] block mb-1">العجز (الشطر الثاني):</label>
                  <input
                    type="text"
                    placeholder="مثال: وَفُؤَادِي بِذِكْرِكُمْ سَهَّارُ"
                    value={poetryShatr2}
                    onChange={e => setPoetryShatr2(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E5E2D9] font-amiri font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Bayt 2 (Optional) */}
            <div className="space-y-3 p-4 rounded-2xl bg-[#F7F5EE] border border-[#E5E2D9]">
              <span className="text-xs font-bold text-[#6E6A64] block">البيت الثاني (اختياري):</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#6E6A64] block mb-1">الصدر:</label>
                  <input
                    type="text"
                    placeholder="مثال: كُلَّمَا رُمْتُ سَلْوَةً عَنْ هَوَاكُمْ"
                    value={poetryShatr3}
                    onChange={e => setPoetryShatr3(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E5E2D9] font-amiri font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#6E6A64] block mb-1">العجز:</label>
                  <input
                    type="text"
                    placeholder="مثال: هَدَّ صَبْرِي وَلَهْفَتِي التَّذْكَارُ"
                    value={poetryShatr4}
                    onChange={e => setPoetryShatr4(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E5E2D9] font-amiri font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Divider symbol */}
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-[#6E6A64] shrink-0">زخرفة الفاصل بين الشطرين:</label>
              <select
                value={poetryDivider}
                onChange={e => setPoetryDivider(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-[#E5E2D9] font-bold bg-white cursor-pointer"
              >
                <option value="✦">✦ نجمة كلاسيكية</option>
                <option value="❖">❖ معين أندلسي</option>
                <option value="۞">۞ نقش عثماني</option>
                <option value="❦">❦ وردة أدبية</option>
                <option value="*">* نجمة بسيطة</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E2D9]">
              <button
                type="button"
                onClick={() => setShowPoetryModal(false)}
                className="px-4 py-2 text-xs font-bold text-[#6E6A64] hover:text-[#2C2C2C] cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleInsertPoetry}
                className="px-5 py-2 rounded-xl bg-[#4A5D4E] hover:bg-[#3C4C3F] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                إدراج البيت في النص
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. TEMPLATES MODAL (قوالب أدبية وشعرية جاهزة) */}
      {showTemplatesModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E5E2D9] rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 font-cairo">
            <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-3">
              <h4 className="text-base font-bold text-[#2C2C2C] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C88A3B]" />
                <span>قوالب أدبية وروائية جاهزة للتنسيق</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowTemplatesModal(false)}
                className="p-1 text-[#6E6A64] hover:text-[#2C2C2C] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#6E6A64]">
              اختر قالباً منسقاً لتطعيم الفصل بمشاهد وحوارات وأشعار وأبيات منسقة مسبقاً:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LITERARY_TEMPLATES.map((tmpl, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#F7F5EE] hover:bg-[#F0EDE1] border border-[#E5E2D9] flex flex-col justify-between transition-all"
                >
                  <div>
                    <h5 className="font-bold text-xs text-[#4A5D4E] mb-1 flex items-center gap-1.5">
                      <span>{tmpl.title}</span>
                    </h5>
                    <p className="text-[11px] text-[#6E6A64] mb-3 leading-relaxed">
                      {tmpl.desc}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      insertHtmlAtCaret(tmpl.html);
                      setShowTemplatesModal(false);
                      showToast(`تم إدراج قالب "${tmpl.title}" بنجاح!`);
                    }}
                    className="w-full py-2 bg-white hover:bg-[#4A5D4E] hover:text-white border border-[#E5E2D9] text-[#2C2C2C] text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
                  >
                    إدراج هذا القالب
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-[#E5E2D9]">
              <button
                type="button"
                onClick={() => setShowTemplatesModal(false)}
                className="px-4 py-2 text-xs font-bold text-[#6E6A64] hover:text-[#2C2C2C] cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. IMAGE MODAL (إدراج صورة توضيحية) */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E5E2D9] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 font-cairo">
            <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-3">
              <h4 className="text-base font-bold text-[#2C2C2C] flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#4A5D4E]" />
                <span>إدراج صورة توضيحية داخل الفصل</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="p-1 text-[#6E6A64] hover:text-[#2C2C2C] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#2C2C2C] block mb-1">رابط الصورة (URL):</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E2D9] focus:ring-1 focus:ring-[#4A5D4E]"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#2C2C2C] block mb-1">تعليق توضيحي أسفل الصورة (اختياري):</label>
                <input
                  type="text"
                  placeholder="مثال: مخطوطة برج الزمان القديمة في القرن السابع عشر..."
                  value={imageCaption}
                  onChange={e => setImageCaption(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E2D9] focus:ring-1 focus:ring-[#4A5D4E]"
                />
              </div>

              {/* Preset illustrations */}
              <div>
                <span className="text-[11px] font-bold text-[#6E6A64] block mb-1.5">أو اختر من صور أدبية مقترحة:</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'مخطوطة عتيقة', url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80' },
                    { label: 'مكتبة كلاسيكية', url: 'https://images.unsplash.com/photo-1507842229451-79730e71a52e?w=800&auto=format&fit=crop&q=80' },
                    { label: 'قلم وحبر عتيق', url: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=800&auto=format&fit=crop&q=80' },
                  ].map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setImageUrl(p.url);
                        setImageCaption(p.label);
                      }}
                      className="p-1.5 text-center text-[10px] font-bold rounded-xl border border-[#E5E2D9] hover:bg-[#F7F5EE] cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E2D9]">
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="px-4 py-2 text-xs font-bold text-[#6E6A64] hover:text-[#2C2C2C] cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleInsertImage}
                className="px-5 py-2 rounded-xl bg-[#4A5D4E] hover:bg-[#3C4C3F] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                إدراج الصورة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. FIND & REPLACE MODAL */}
      {showFindReplaceModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E5E2D9] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 font-cairo">
            <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-3">
              <h4 className="text-base font-bold text-[#2C2C2C] flex items-center gap-2">
                <Search className="w-4 h-4 text-[#4A5D4E]" />
                <span>البحث والاستبدال عبر النص</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowFindReplaceModal(false)}
                className="p-1 text-[#6E6A64] hover:text-[#2C2C2C] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#2C2C2C] block mb-1">الكلمة أو العبارة المطلوب البحث عنها:</label>
                <input
                  type="text"
                  placeholder="مثال: القصر القديم..."
                  value={findWord}
                  onChange={e => setFindWord(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E2D9] focus:ring-1 focus:ring-[#4A5D4E]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#2C2C2C] block mb-1">استبدالها بـ:</label>
                <input
                  type="text"
                  placeholder="مثال: البرج العاجي..."
                  value={replaceWord}
                  onChange={e => setReplaceWord(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E2D9] focus:ring-1 focus:ring-[#4A5D4E]"
                />
              </div>

              {findCount !== null && (
                <div className="p-2.5 rounded-xl bg-[#F7F5EE] border border-[#E5E2D9] text-xs font-bold text-[#4A5D4E]">
                  تم العثور على {findCount} تطابق في النص الحالي.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E2D9]">
              <button
                type="button"
                onClick={() => setShowFindReplaceModal(false)}
                className="px-4 py-2 text-xs font-bold text-[#6E6A64] hover:text-[#2C2C2C] cursor-pointer"
              >
                إغلاق
              </button>
              <button
                type="button"
                onClick={handleFindAndReplace}
                className="px-5 py-2 rounded-xl bg-[#4A5D4E] hover:bg-[#3C4C3F] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                استبدال الكل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. TABLE MODAL */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E5E2D9] rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 font-cairo">
            <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-3">
              <h4 className="text-base font-bold text-[#2C2C2C] flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-[#4A5D4E]" />
                <span>إدراج جدول منسق</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowTableModal(false)}
                className="p-1 text-[#6E6A64] hover:text-[#2C2C2C] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#2C2C2C] block mb-1">عدد الصفوف:</label>
                <input
                  type="number"
                  min={1}
                  max={15}
                  value={tableRows}
                  onChange={e => setTableRows(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E2D9]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#2C2C2C] block mb-1">عدد الأعمدة:</label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={tableCols}
                  onChange={e => setTableCols(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E2D9]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E2D9]">
              <button
                type="button"
                onClick={() => setShowTableModal(false)}
                className="px-4 py-2 text-xs font-bold text-[#6E6A64] hover:text-[#2C2C2C] cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleInsertTable}
                className="px-5 py-2 rounded-xl bg-[#4A5D4E] hover:bg-[#3C4C3F] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                إدراج الجدول
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. LINK MODAL */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E5E2D9] rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 font-cairo">
            <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-3">
              <h4 className="text-base font-bold text-[#2C2C2C] flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-[#4A5D4E]" />
                <span>إدراج رابط تشعبي</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="p-1 text-[#6E6A64] hover:text-[#2C2C2C] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#2C2C2C] block mb-1">الرابط (URL):</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={linkUrl}
                  onChange={e => setLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E2D9]"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#2C2C2C] block mb-1">نص الرابط المعروض (اختياري):</label>
                <input
                  type="text"
                  placeholder="مثال: موقع الكاتب الرسمي"
                  value={linkText}
                  onChange={e => setLinkText(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E2D9]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E2D9]">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 text-xs font-bold text-[#6E6A64] hover:text-[#2C2C2C] cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleInsertLink}
                className="px-5 py-2 rounded-xl bg-[#4A5D4E] hover:bg-[#3C4C3F] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                إدراج الرابط
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. SHORTCUTS MODAL */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E5E2D9] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 font-cairo">
            <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-3">
              <h4 className="text-base font-bold text-[#2C2C2C] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#4A5D4E]" />
                <span>اختصارات لوحة المفاتيح المفيدة للمؤلف</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="p-1 text-[#6E6A64] hover:text-[#2C2C2C] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { key: 'Ctrl + B', label: 'خط عريض (Bold)' },
                { key: 'Ctrl + I', label: 'خط مائل (Italic)' },
                { key: 'Ctrl + U', label: 'تسطير تحت النص (Underline)' },
                { key: 'Ctrl + Z', label: 'تراجع عن آخر تعديل (Undo)' },
                { key: 'Ctrl + Y', label: 'إعادة التعديل المتراجع عنه (Redo)' },
                { key: 'Shift + Enter', label: 'سطر جديد بدون مسافة فقرة' },
                { key: 'Enter', label: 'فقرة جديدة تامة' },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-[#F7F5EE]">
                  <span className="text-[#2C2C2C] font-bold">{s.label}</span>
                  <kbd className="px-2 py-1 rounded-md bg-white border border-[#E5E2D9] font-mono text-[11px] font-bold text-[#4A5D4E]">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-[#E5E2D9]">
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="px-4 py-2 text-xs font-bold text-[#6E6A64] hover:text-[#2C2C2C] cursor-pointer"
              >
                فهمت، حسناً
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
