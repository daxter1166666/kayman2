import React, { useState } from 'react';
import { Novel, Chapter } from '../types';
import { pdfExportService } from '../services/pdfExportService';
import { formatDeweyDisplay } from '../utils/deweyDecimal';
import {
  FileDown,
  X,
  BookOpen,
  Printer,
  Type,
  Sliders,
  AlertCircle,
  Check
} from 'lucide-react';

interface NovelPdfDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  novel: Novel;
  chapters: Chapter[];
}

export const NovelPdfDownloadModal: React.FC<NovelPdfDownloadModalProps> = ({
  isOpen,
  onClose,
  novel,
  chapters,
}) => {
  const [fontFamily, setFontFamily] = useState<'amiri' | 'cairo' | 'readex' | 'tajawal'>('amiri');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [includeCover, setIncludeCover] = useState<boolean>(true);
  const [includeToc, setIncludeToc] = useState<boolean>(true);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const novelChapters = chapters
    .filter(c => c.novelId === novel.id && c.status !== 'DRAFT')
    .sort((a, b) => a.chapterNumber - b.chapterNumber);

  const deweyLabel = formatDeweyDisplay(novel.deweyDecimal, novel.deweyCategoryName);

  const handleStartDirectDownload = async () => {
    if (novelChapters.length === 0) {
      setError('لا توجد فصول منشورة في هذه الرواية بعد لتضمينها في ملف الـ PDF.');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      setProgress(5);
      setStatusMessage('جاري بدء معالجة الرواية وتنسيق الصفحات...');

      await pdfExportService.downloadNovelFullBookPdf(novel, chapters, {
        fontFamily,
        fontSize,
        includeCover,
        includeCopyright: true,
        includeToc,
        onProgress: (pct, msg) => {
          setProgress(pct);
          setStatusMessage(msg);
        }
      });

      setTimeout(() => {
        setIsGenerating(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('PDF generation error:', err);
      setError('حدث خطأ أثناء تجميع ملف الـ PDF. يمكنك استخدام خيار "طباعة / حفظ كـ PDF عبر المتصفح" كبديل مباشر.');
      setIsGenerating(false);
    }
  };

  const handleOpenPrintEngine = async () => {
    if (novelChapters.length === 0) {
      setError('لا توجد فصول منشورة في هذه الرواية بعد.');
      return;
    }

    try {
      setError(null);
      await pdfExportService.openPrintBookView(novel, chapters, {
        fontFamily,
        fontSize,
        includeCover,
        includeCopyright: true,
        includeToc
      });
    } catch (err: any) {
      console.error('Print trigger error:', err);
      setError('تعذر فتح نافذة الطباعة. يرجى تجربة التنزيل المباشر.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#FFFFFF] rounded-2xl shadow-2xl border border-[#E5E2D9] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E2D9] bg-[#FAF9F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#4A5D4E]/10 border border-[#4A5D4E]/20 flex items-center justify-center text-[#4A5D4E]">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2C2C2C] font-cairo">
                تحميل وتصدير الرواية ككتاب PDF
              </h3>
              <p className="text-xs text-[#6E6A64]">
                تنسيق طباعي احترافي مع غلاف أصلي كامل وفهرس دقيق
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="p-2 rounded-xl text-[#6E6A64] hover:text-[#2C2C2C] hover:bg-[#EBE8DF] transition-all cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Novel Info Preview */}
          <div className="flex gap-4 p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E5E2D9]">
            {novel.coverImage ? (
              <img
                src={novel.coverImage}
                alt={novel.title}
                className="w-16 h-22 object-cover rounded-lg shadow-xs shrink-0 border border-[#E5E2D9]"
              />
            ) : (
              <div className="w-16 h-22 rounded-lg bg-[#E5E2D9] flex items-center justify-center text-[#6E6A64] shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-[#2C2C2C] truncate mb-1">
                {novel.title}
              </h4>
              <p className="text-xs text-[#4A5D4E] font-medium mb-1.5">
                بقلم: {novel.author || 'أيمن كناني'}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span className="px-2 py-0.5 rounded-full bg-[#E5E2D9] text-[#2C2C2C]">
                  {novelChapters.length} فصلاً أدبياً
                </span>
                {novel.deweyDecimal && (
                  <span className="px-2 py-0.5 rounded-full bg-[#4A5D4E]/10 text-[#4A5D4E] font-medium" title={deweyLabel}>
                    ديوي: {novel.deweyDecimal}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Configuration Options */}
          <div className="space-y-4">
            <h5 className="text-xs font-bold text-[#6E6A64] uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              <span>خيارات التنسيق والطباعة</span>
            </h5>

            {/* Font Family Selector */}
            <div>
              <label className="block text-xs font-bold text-[#2C2C2C] mb-1.5 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-[#4A5D4E]" />
                <span>الخط العربي المعتمد لصفحات الكتاب:</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFontFamily('amiri')}
                  disabled={isGenerating}
                  className={`p-2.5 rounded-xl border text-right text-xs transition-all cursor-pointer ${
                    fontFamily === 'amiri'
                      ? 'border-[#4A5D4E] bg-[#4A5D4E]/5 text-[#4A5D4E] font-bold shadow-xs'
                      : 'border-[#E5E2D9] bg-[#FFFFFF] text-[#2C2C2C] hover:bg-[#FAF9F5]'
                  }`}
                >
                  <div className="font-amiri font-bold text-sm">الخط الأميري (افتراضي)</div>
                  <div className="text-[10px] text-[#6E6A64] mt-0.5">وقار الروايات والكتب الأدبية العربية</div>
                </button>

                <button
                  type="button"
                  onClick={() => setFontFamily('cairo')}
                  disabled={isGenerating}
                  className={`p-2.5 rounded-xl border text-right text-xs transition-all cursor-pointer ${
                    fontFamily === 'cairo'
                      ? 'border-[#4A5D4E] bg-[#4A5D4E]/5 text-[#4A5D4E] font-bold shadow-xs'
                      : 'border-[#E5E2D9] bg-[#FFFFFF] text-[#2C2C2C] hover:bg-[#FAF9F5]'
                  }`}
                >
                  <div className="font-cairo font-bold text-sm">خط كايرو</div>
                  <div className="text-[10px] text-[#6E6A64] mt-0.5">رصين هندسي مريح وواضح</div>
                </button>

                <button
                  type="button"
                  onClick={() => setFontFamily('readex')}
                  disabled={isGenerating}
                  className={`p-2.5 rounded-xl border text-right text-xs transition-all cursor-pointer ${
                    fontFamily === 'readex'
                      ? 'border-[#4A5D4E] bg-[#4A5D4E]/5 text-[#4A5D4E] font-bold shadow-xs'
                      : 'border-[#E5E2D9] bg-[#FFFFFF] text-[#2C2C2C] hover:bg-[#FAF9F5]'
                  }`}
                >
                  <div className="font-readex font-bold text-sm">خط ريدكس برو</div>
                  <div className="text-[10px] text-[#6E6A64] mt-0.5">عصري فائق الوضوح والمقروئية</div>
                </button>

                <button
                  type="button"
                  onClick={() => setFontFamily('tajawal')}
                  disabled={isGenerating}
                  className={`p-2.5 rounded-xl border text-right text-xs transition-all cursor-pointer ${
                    fontFamily === 'tajawal'
                      ? 'border-[#4A5D4E] bg-[#4A5D4E]/5 text-[#4A5D4E] font-bold shadow-xs'
                      : 'border-[#E5E2D9] bg-[#FFFFFF] text-[#2C2C2C] hover:bg-[#FAF9F5]'
                  }`}
                >
                  <div className="font-tajawal font-bold text-sm">خط تجوال</div>
                  <div className="text-[10px] text-[#6E6A64] mt-0.5">متوازن وناعم للأعمال الأدبية</div>
                </button>
              </div>
            </div>

            {/* Font Size Selector */}
            <div>
              <label className="block text-xs font-bold text-[#2C2C2C] mb-1.5">
                حجم خط القراءة:
              </label>
              <div className="flex gap-2">
                {[
                  { id: 'small', label: 'صغير (13.5px)', desc: 'صفحات أقل' },
                  { id: 'medium', label: 'متوسط قياسي (15px)', desc: 'الموصى به للكتب' },
                  { id: 'large', label: 'كبير ومريح (16.5px)', desc: 'قراءة مريحة' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFontSize(opt.id as any)}
                    disabled={isGenerating}
                    className={`flex-1 p-2 rounded-xl border text-center text-xs transition-all cursor-pointer ${
                      fontSize === opt.id
                        ? 'border-[#4A5D4E] bg-[#4A5D4E] text-[#FDFCF8] font-bold shadow-xs'
                        : 'border-[#E5E2D9] bg-[#FFFFFF] text-[#2C2C2C] hover:bg-[#FAF9F5]'
                    }`}
                  >
                    <div>{opt.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Checkboxes: Cover & TOC */}
            <div className="space-y-2 pt-2 border-t border-[#E5E2D9]">
              <label className="flex items-start gap-2 text-xs text-[#2C2C2C] cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCover}
                  onChange={e => setIncludeCover(e.target.checked)}
                  disabled={isGenerating}
                  className="rounded text-[#4A5D4E] focus:ring-[#4A5D4E] mt-0.5"
                />
                <div>
                  <span className="font-bold block">تضمين غلاف الرواية الأصلي كصفحة أولى كاملة</span>
                  <span className="text-[11px] text-[#6E6A64]">
                    يغطي الصفحة الأولى 100% كما يظهر في الموقع، دون أي كتابة أو إضافات على الغلاف.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2 text-xs text-[#2C2C2C] cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeToc}
                  onChange={e => setIncludeToc(e.target.checked)}
                  disabled={isGenerating}
                  className="rounded text-[#4A5D4E] focus:ring-[#4A5D4E] mt-0.5"
                />
                <div>
                  <span className="font-bold block">تضمين بطاقة التوثيق وفهرس الفصول المرقم</span>
                  <span className="text-[11px] text-[#6E6A64]">
                    فهرس منسق بأرقام الصفحات الحقيقية وبطاقة الفهرسة الببليوغرافية وحقوق الكاتب.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Error notice */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Progress Bar while generating */}
          {isGenerating && (
            <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E5E2D9] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#4A5D4E]">
                <span>{statusMessage}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-[#E5E2D9] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#4A5D4E] transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[11px] text-[#6E6A64] text-center">
                تنسيق نصوص وخطوط الرواية بجودة عالية...
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E5E2D9] bg-[#FAF9F5] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleOpenPrintEngine}
            disabled={isGenerating || novelChapters.length === 0}
            className="px-4 py-2.5 rounded-xl border border-[#4A5D4E]/30 bg-[#FFFFFF] hover:bg-[#FAF9F5] text-[#4A5D4E] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="فتح نافذة الطباعة لحفظ الرواية بصيغة PDF بجودة فيكتور فائقة مع نصوص أصلية"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة / حفظ كـ PDF عبر المتصفح</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#6E6A64] hover:text-[#2C2C2C] hover:bg-[#EBE8DF] transition-colors cursor-pointer disabled:opacity-50"
            >
              إلغاء
            </button>

            <button
              type="button"
              onClick={handleStartDirectDownload}
              disabled={isGenerating || novelChapters.length === 0}
              className="px-5 py-2.5 rounded-xl bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8] text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#FFFFFF] border-t-transparent rounded-full animate-spin" />
                  <span>جاري تجهيز الكتاب...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>تنزيل ملف PDF المباشر</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
