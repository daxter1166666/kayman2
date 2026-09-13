import React, { useState } from 'react';
import {
  X,
  Download,
  Printer,
  Type,
  Check,
  Info,
  BookOpen,
  Layers,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import type { Chapter, Novel } from '../types';
import {
  printChapterAsPdf,
  printFullBookAsPdf,
  getFontDefinition,
} from '../utils/chapterPdfExport';

interface ChapterDownloadPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter?: Chapter;
  novel: Novel;
  allChapters?: Chapter[];
  initialMode?: 'single' | 'full';
  currentReaderFont?: 'amiri' | 'cairo' | 'tajawal' | 'readex' | 'scheherazade';
}

export const ChapterDownloadPdfModal: React.FC<ChapterDownloadPdfModalProps> = ({
  isOpen,
  onClose,
  chapter,
  novel,
  allChapters = [],
  initialMode = 'single',
  currentReaderFont = 'amiri',
}) => {
  const canDownloadFullBook = allChapters && allChapters.length > 0;
  const [downloadMode, setDownloadMode] = useState<'single' | 'full'>(
    !chapter && canDownloadFullBook ? 'full' : initialMode
  );
  const [selectedFont, setSelectedFont] = useState<
    'amiri' | 'cairo' | 'tajawal' | 'readex' | 'scheherazade'
  >(currentReaderFont);
  const [fontSizePt, setFontSizePt] = useState<number>(16);
  const [lineHeight, setLineHeight] = useState<number>(2.1);
  const [includeAuthorNote, setIncludeAuthorNote] = useState<boolean>(true);
  const [includeHeaderBadge, setIncludeHeaderBadge] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const fontDef = getFontDefinition(selectedFont);

  const fontOptions: Array<{
    id: 'amiri' | 'cairo' | 'tajawal' | 'readex' | 'scheherazade';
    name: string;
    sample: string;
    fontFamilyClass: string;
  }> = [
    { id: 'amiri', name: 'الخط الأميري (الأصيل)', sample: 'أبجد هوز حطي كلمن', fontFamilyClass: 'font-amiri' },
    { id: 'cairo', name: 'خط القاهرة (الحديث)', sample: 'أبجد هوز حطي كلمن', fontFamilyClass: 'font-cairo' },
    { id: 'tajawal', name: 'خط تجوال (المريح)', sample: 'أبجد هوز حطي كلمن', fontFamilyClass: 'font-tajawal' },
    { id: 'readex', name: 'خط ريديكس (العصري)', sample: 'أبجد هوز حطي كلمن', fontFamilyClass: 'font-readex' },
    { id: 'scheherazade', name: 'خط شهرزاد (القرآني)', sample: 'أبجد هوز حطي كلمن', fontFamilyClass: 'font-scheherazade' },
  ];

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      let ok = false;
      const siteUrl = typeof window !== 'undefined' ? window.location.hostname : 'aymankinani.com';

      if (downloadMode === 'full' && canDownloadFullBook) {
        ok = await printFullBookAsPdf({
          novel,
          chapters: allChapters,
          fontFamily: selectedFont,
          fontSizePt,
          lineHeight,
          includeAuthorNote,
          siteUrl,
        });
      } else if (chapter) {
        ok = await printChapterAsPdf({
          chapter,
          novel,
          fontFamily: selectedFont,
          fontSizePt,
          lineHeight,
          includeAuthorNote,
          includeHeaderBadge,
          siteUrl,
        });
      } else if (canDownloadFullBook) {
        ok = await printFullBookAsPdf({
          novel,
          chapters: allChapters,
          fontFamily: selectedFont,
          fontSizePt,
          lineHeight,
          includeAuthorNote,
          siteUrl,
        });
      }

      if (ok) {
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 4000);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const currentChapterObj = chapter || allChapters[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto"
      dir="rtl"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-2xl bg-[#FDFCF8] rounded-3xl border border-[#E5E2D9] shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="bg-[#4A5D4E] text-[#FDFCF8] p-4 sm:p-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/15">
              <Download className="w-5 h-5 text-amber-200" />
            </div>
            <div className="min-w-0">
              <h3 className="font-amiri font-bold text-xl sm:text-2xl text-white truncate">
                {downloadMode === 'full' ? 'تنزيل الكتاب كاملاً بصيغة PDF' : 'تنزيل الفصل بصيغة PDF'}
              </h3>
              <p className="text-xs text-white/80 mt-0.5 truncate">
                كتاب: {novel.title} • بقلم: {novel.author}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Scope Selector: Single Chapter vs Full Book */}
          {canDownloadFullBook && chapter && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#4A5D4E] mb-2">
                نطاق التنزيل:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  id="pdf-download-mode-single-btn"
                  onClick={() => setDownloadMode('single')}
                  className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between ${
                    downloadMode === 'single'
                      ? 'border-[#4A5D4E] bg-[#4A5D4E]/10 ring-1 ring-[#4A5D4E]'
                      : 'border-[#E5E2D9] bg-white hover:bg-[#F7F5EE]'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-[#2C2C2C] flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#4A5D4E]" />
                      <span>تنزيل هذا الفصل فقط</span>
                    </div>
                    <div className="text-[11px] text-[#6E6A64] mt-0.5 truncate">
                      الفصل {chapter.chapterNumber}: {chapter.title}
                    </div>
                  </div>
                  {downloadMode === 'single' && (
                    <div className="w-5 h-5 rounded-full bg-[#4A5D4E] text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  id="pdf-download-mode-full-btn"
                  onClick={() => setDownloadMode('full')}
                  className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between ${
                    downloadMode === 'full'
                      ? 'border-[#4A5D4E] bg-[#4A5D4E]/10 ring-1 ring-[#4A5D4E]'
                      : 'border-[#E5E2D9] bg-white hover:bg-[#F7F5EE]'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-[#2C2C2C] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-amber-700" />
                      <span>تنزيل الكتاب كاملاً (النسخة الكاملة)</span>
                    </div>
                    <div className="text-[11px] text-[#6E6A64] mt-0.5 truncate">
                      شاملاً الغلاف، الفهرس وجميع الـ ({allChapters.length}) فصول
                    </div>
                  </div>
                  {downloadMode === 'full' && (
                    <div className="w-5 h-5 rounded-full bg-[#4A5D4E] text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Golden Tip for Clean PDF without headers/footers */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[#82520E] text-xs leading-relaxed flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold text-amber-900 mb-0.5 text-sm">
                نصيحة لمنع ظهور الروابط والرموز في أسفل الصفحة:
              </strong>
              عندما تفتح لك نافذة الحفظ بالمتصفح، تأكد من إلغاء تفعيل خيار «<strong>الرؤوس والتذييلات (Headers & Footers)</strong>» لكي يخرج ملف الـ PDF نقياً ومطبوعاً بجودة الكتب الفاخرة.
            </div>
          </div>

          {/* Mandatory Author & License Badge (Always Included) */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-[#4A5D4E]/10 border border-[#4A5D4E]/30 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#4A5D4E] shrink-0" />
            <div className="text-xs text-[#2C2C2C] leading-snug">
              <span className="font-bold text-[#4A5D4E]">اسم الكاتب ورخصة المشاع الإبداعي: </span>
              مثبتة ومضمّنة إلزامياً لحفظ الحقوق الفكرية للكاتب (<strong>{novel.author}</strong>) برخصة (CC BY-NC 4.0) ولن تظهر أي تواريخ أو أوقات في الملف.
            </div>
          </div>

          {/* Font Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#4A5D4E] mb-2 flex items-center gap-1.5">
              <Type className="w-4 h-4" />
              <span>اختر نوع الخط العربي لملف الـ PDF:</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {fontOptions.map((opt) => {
                const isSelected = selectedFont === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedFont(opt.id)}
                    className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-[#4A5D4E] bg-[#4A5D4E]/10 shadow-xs'
                        : 'border-[#E5E2D9] bg-white hover:bg-[#F7F5EE]'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-[#2C2C2C]">{opt.name}</div>
                      <div className={`text-xs text-[#6E6A64] mt-0.5 ${opt.fontFamilyClass}`}>
                        {opt.sample}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-[#4A5D4E] text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Font Size & Line Spacing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#4A5D4E] mb-1.5">
                حجم خط القراءة في الـ PDF:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { pt: 14, label: '14pt مضغوط' },
                  { pt: 16, label: '16pt قياسي' },
                  { pt: 18, label: '18pt مريح' },
                ].map((s) => (
                  <button
                    key={s.pt}
                    type="button"
                    onClick={() => setFontSizePt(s.pt)}
                    className={`py-1.5 px-1 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                      fontSizePt === s.pt
                        ? 'bg-[#4A5D4E] text-white border-[#4A5D4E]'
                        : 'bg-white border-[#E5E2D9] text-[#6E6A64] hover:bg-[#F7F5EE]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4A5D4E] mb-1.5">
                تباعد الأسطر:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { val: 1.8, label: 'متوسط (1.8)' },
                  { val: 2.1, label: 'واسع وأدبي (2.1)' },
                ].map((lh) => (
                  <button
                    key={lh.val}
                    type="button"
                    onClick={() => setLineHeight(lh.val)}
                    className={`py-1.5 px-1 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                      lineHeight === lh.val
                        ? 'bg-[#4A5D4E] text-white border-[#4A5D4E]'
                        : 'bg-white border-[#E5E2D9] text-[#6E6A64] hover:bg-[#F7F5EE]'
                    }`}
                  >
                    {lh.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Preview Card */}
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-[#E5E2D9]">
              <div className="text-xs font-bold text-[#4A5D4E] flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>
                  {downloadMode === 'full'
                    ? 'معاينة خط غلاف وفصول الكتاب:'
                    : 'معاينة حية لشكل الخط والتنسيق:'}
                </span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#4A5D4E]/10 text-[#4A5D4E] font-bold">
                {fontDef.label}
              </span>
            </div>
            <div
              className="text-right leading-loose select-none"
              style={{
                fontFamily: fontDef.fontStack,
                fontSize: `${fontSizePt}px`,
                lineHeight: lineHeight,
              }}
            >
              {downloadMode === 'full' ? (
                <div className="flex items-start gap-3">
                  {novel.coverImage && (
                    <img
                      src={novel.coverImage}
                      alt={novel.title}
                      className="w-14 h-20 object-cover rounded-lg shadow-sm border border-[#E5E2D9] shrink-0"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-base text-[#111] mb-1">
                      كتاب: {novel.title}
                    </h4>
                    <p className="text-xs text-[#4A5D4E] font-bold mb-1.5">
                      بقلم الكاتب: {novel.author} • يشمل صفحة الغلاف الكاملة، الفهرس مباشرة وجميع الـ ({allChapters.length}) فصول
                    </p>
                    <p className="text-[#444] text-justify text-xs line-clamp-2 opacity-90">
                      نسخة إلكترونية كاملة تبدأ بغلاف كامل الصفحة يليه فهرس الفصول وجميع الفصول المنسقة.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <h4 className="font-bold text-base text-[#111] mb-1">
                    الفصل {currentChapterObj?.chapterNumber}: {currentChapterObj?.title}
                  </h4>
                  <p className="text-xs text-[#4A5D4E] font-bold mb-1">
                    بقلم: {novel.author}
                  </p>
                  <p className="text-[#444] text-justify text-xs line-clamp-2 opacity-90">
                    {currentChapterObj?.content
                      ? currentChapterObj.content.replace(/<[^>]*>?/gm, '').substring(0, 180) + '...'
                      : 'معاينة نص الفصل بالخط المختار.'}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-4 sm:p-5 bg-[#F7F5EE] border-t border-[#E5E2D9] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#E5E2D9] text-xs font-bold text-[#6E6A64] hover:bg-white hover:text-[#2C2C2C] transition-colors cursor-pointer"
          >
            إلغاء
          </button>

          <button
            type="button"
            id="modal-confirm-download-pdf-btn"
            onClick={handleDownload}
            disabled={isExporting}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#4A5D4E] hover:bg-[#3C4C3F] active:scale-98 text-[#FDFCF8] text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>
                  {downloadMode === 'full'
                    ? 'جاري تجهيز الكتاب كاملاً مع الفهرس...'
                    : 'جاري تحضير ملف الفصل...'}
                </span>
              </>
            ) : exportSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>تم فتح نافذة الحفظ بنجاح!</span>
              </>
            ) : (
              <>
                <Printer className="w-4 h-4 text-amber-200" />
                <span>
                  {downloadMode === 'full'
                    ? `تنزيل الكتاب كاملاً PDF (${allChapters.length} فصول + الفهرس)`
                    : 'تنزيل هذا الفصل بصيغة PDF'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
