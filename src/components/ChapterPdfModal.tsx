import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  X,
  CheckCircle2,
  Loader2,
  Sparkles,
  Type,
  Maximize2,
  ShieldCheck,
} from 'lucide-react';
import { Novel, Chapter, ReaderSettings } from '../types';
import { downloadChapterAsPdf, printChapterAsPdf, ChapterPdfOptions } from '../utils/chapterPdfGenerator';

interface ChapterPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  novel: Novel;
  chapter: Chapter;
  readerSettings: ReaderSettings;
}

export const ChapterPdfModal: React.FC<ChapterPdfModalProps> = ({
  isOpen,
  onClose,
  novel,
  chapter,
  readerSettings,
}) => {
  const [selectedFont, setSelectedFont] = useState<ReaderSettings['fontFamily']>(
    readerSettings.fontFamily || 'amiri'
  );
  const [fontSize, setFontSize] = useState<number>(16);
  const [lineHeight, setLineHeight] = useState<'tight' | 'normal' | 'relaxed'>('normal');
  const [includeAuthorNote, setIncludeAuthorNote] = useState<boolean>(true);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const fontOptions: Array<{ id: ReaderSettings['fontFamily']; name: string; sample: string }> = [
    { id: 'amiri', name: 'خط أميري كلاسيكي (Amiri)', sample: 'أبجد هوز - خط تراثي عريق' },
    { id: 'cairo', name: 'خط كايرو الحديث (Cairo)', sample: 'أبجد هوز - خط هندسي واضح' },
    { id: 'readex', name: 'خط ريديكس برو (Readex Pro)', sample: 'أبجد هوز - قراءة رقمية عصرية' },
    { id: 'tajawal', name: 'خط تجوال (Tajawal)', sample: 'أبجد هوز - خط صحفي رصين' },
    { id: 'scheherazade', name: 'خط شهرزاد الأصيل (Scheherazade)', sample: 'أبجد هوز - مظهر المخطوطات الفاخرة' },
  ];

  const handleDownload = async () => {
    setIsGenerating(true);
    setProgressPercent(10);
    setIsSuccess(false);
    setErrorMessage(null);

    const options: ChapterPdfOptions = {
      fontFamily: selectedFont,
      fontSize,
      lineHeight,
      includeAuthorNote,
    };

    try {
      const success = await downloadChapterAsPdf(novel, chapter, options, (pct) => {
        setProgressPercent(pct);
      });

      if (success) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 2200);
      } else {
        setErrorMessage('تعذر إنشاء الملف مباشرة، يمكنك استخدام خيار "طباعة وحفظ كـ PDF" كبديل فوري.');
      }
    } catch (err: any) {
      console.error('PDF error:', err);
      setErrorMessage('حدث خطأ غير متوقع أثناء معالجة الملف.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    const options: ChapterPdfOptions = {
      fontFamily: selectedFont,
      fontSize,
      lineHeight,
      includeAuthorNote,
    };
    printChapterAsPdf(novel, chapter, options);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-cairo animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="bg-[#FDFCF8] text-[#2C2C2C] w-full max-w-xl rounded-2xl border border-[#E5E2D9] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#E5E2D9] flex items-center justify-between bg-[#F7F5EE]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4A5D4E]/10 text-[#4A5D4E] flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1F2421]">تحميل وتنسيق الفصل كـ PDF</h3>
              <p className="text-xs text-[#6E6A64]">
                تنزيل نسخة كتابية أنيقة ومجهزة للطباعة بالخط العربي المعتمد
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#6E6A64] hover:bg-black/5 hover:text-[#2C2C2C] transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Chapter Overview Card */}
          <div className="p-4 rounded-xl bg-[#F7F5EE] border border-[#E5E2D9] space-y-2">
            <div className="flex items-center justify-between text-xs text-[#6E6A64]">
              <span className="font-semibold text-[#8C5E45]">كتاب: {novel.title}</span>
              <span>{chapter.wordCount || 0} كلمة</span>
            </div>
            <h4 className="font-bold text-base text-[#2C2C2C] leading-snug">{chapter.title}</h4>
            <div className="text-xs text-[#6E6A64] flex items-center gap-2 pt-1 border-t border-[#E5E2D9]/60">
              <span>بقلم: {novel.author || 'أيمن كناني'}</span>
              <span>•</span>
              <span>ترخيص المشاع الإبداعي CC BY-NC 4.0</span>
            </div>
          </div>

          {/* Font Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-[#2C2C2C] flex items-center gap-1.5">
              <Type className="w-4 h-4 text-[#4A5D4E]" />
              <span>نوع الخط العربي للـ PDF:</span>
              <span className="text-[11px] font-normal text-[#6E6A64]">
                (المحدد حالياً في الموقع: {fontOptions.find(f => f.id === readerSettings.fontFamily)?.name || 'أميري'})
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {fontOptions.map(font => {
                const isSelected = selectedFont === font.id;
                return (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => setSelectedFont(font.id)}
                    className={`p-3 text-right rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#4A5D4E] bg-[#4A5D4E]/10 text-[#1F2421] shadow-xs'
                        : 'border-[#E5E2D9] hover:bg-[#F7F5EE] text-[#4F4B45]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">{font.name}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#4A5D4E]" />}
                    </div>
                    <p className="text-[11px] opacity-75">{font.sample}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size and Spacing Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Font Size */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C2C2C] flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-[#8C5E45]" />
                <span>حجم خط النص:</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { size: 14, label: 'مضغوط (14)' },
                  { size: 16, label: 'قياسي (16)' },
                  { size: 18, label: 'كبير (18)' },
                ].map(item => (
                  <button
                    key={item.size}
                    type="button"
                    onClick={() => setFontSize(item.size)}
                    className={`py-2 px-1 text-center rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                      fontSize === item.size
                        ? 'bg-[#8C5E45] text-white border-[#8C5E45]'
                        : 'border-[#E5E2D9] hover:bg-[#F7F5EE] text-[#6E6A64]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Line Height */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C2C2C] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C88A3B]" />
                <span>تباعد الأسطر:</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { val: 'tight', label: 'عادي' },
                  { val: 'normal', label: 'مريح' },
                  { val: 'relaxed', label: 'فسيح' },
                ].map(item => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setLineHeight(item.val as any)}
                    className={`py-2 px-1 text-center rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                      lineHeight === item.val
                        ? 'bg-[#C88A3B] text-white border-[#C88A3B]'
                        : 'border-[#E5E2D9] hover:bg-[#F7F5EE] text-[#6E6A64]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Option: Author Note */}
          {chapter.authorNote && (
            <label className="flex items-center gap-2.5 text-xs text-[#2C2C2C] font-semibold cursor-pointer p-2.5 rounded-xl border border-[#E5E2D9] hover:bg-[#F7F5EE]">
              <input
                type="checkbox"
                checked={includeAuthorNote}
                onChange={e => setIncludeAuthorNote(e.target.checked)}
                className="w-4 h-4 rounded text-[#4A5D4E] focus:ring-[#4A5D4E] cursor-pointer"
              />
              <span>تضمين ملاحظة الكاتب الاستهلالية في بداية الفصل</span>
            </label>
          )}

          {/* Design Quality Badge */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              تم تنقيح وتطهير ملف الـ PDF من أي إعلانات أو أيقونات مشوهة أو أزرار، مع تضمين ترويسة وتذييل أدبي فاخر وتنسيق موحد.
            </span>
          </div>

          {/* Error Message if any */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Success Message */}
          {isSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-600 text-white flex items-center justify-center gap-2 text-xs font-bold shadow-md animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>تم إنشاء وتحميل ملف الـ PDF بنجاح! تفقد مجلد التنزيلات.</span>
            </div>
          )}

          {/* Progress Bar when Generating */}
          {isGenerating && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-[#6E6A64] font-bold">
                <span>جاري معالجة وتصدير ملف الـ PDF...</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-[#E5E2D9] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#4A5D4E] transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#E5E2D9] bg-[#F7F5EE]/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrint}
            disabled={isGenerating}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#4A5D4E]/40 text-[#4A5D4E] hover:bg-[#4A5D4E]/10 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            title="فتح نافذة الطباعة لاختيار حفظ كـ PDF بجودة المتجه A4"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة / حفظ كـ PDF (جودة المتجه)</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2.5 rounded-xl border border-[#E5E2D9] text-[#6E6A64] hover:bg-black/5 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
            >
              إلغاء
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#4A5D4E] hover:bg-[#3C4C3F] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري التجهيز...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>تنزيل ملف PDF فوري</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
