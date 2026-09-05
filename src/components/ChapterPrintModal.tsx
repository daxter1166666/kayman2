import React, { useEffect, useRef } from 'react';
import { Novel, Chapter } from '../types';
import { Printer, Download, X, BookOpen, Check, FileText, Sparkles } from 'lucide-react';

interface ChapterPrintModalProps {
  novel: Novel;
  chapter: Chapter;
  isOpen: boolean;
  onClose: () => void;
}

export const ChapterPrintModal: React.FC<ChapterPrintModalProps> = ({
  novel,
  chapter,
  isOpen,
  onClose,
}) => {
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const readingTime = Math.max(1, Math.ceil(chapter.wordCount / 200));

  // Direct trigger browser print dialog
  const handlePrint = () => {
    window.print();
  };

  const isHtml = /<[a-z][\s\S]*>/i.test(chapter.content);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="print-modal-title"
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#FDFCF8] rounded-2xl shadow-2xl border border-[#E5E2D9] overflow-hidden text-[#1A1A1A]"
      >
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print flex items-center justify-between px-5 py-4 bg-white border-b border-[#E5E2D9] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#4A5D4E]/10 text-[#4A5D4E] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 id="print-modal-title" className="font-bold text-sm sm:text-base text-[#1A1A1A] font-cairo">
                معاينة وتحميل الفصل كـ PDF جاهز للطباعة
              </h3>
              <p className="text-xs text-[#6E6A64]">
                خط عربي متصل وأصيل 100% بدون أي تفكك في الحروف أو انعكاس
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="modal-trigger-print-btn"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#4A5D4E] hover:bg-[#3C4C3F] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
              title="انقر هنا ثم اختر حفظ بتنسيق PDF (Save as PDF)"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة / حفظ كـ PDF</span>
            </button>

            <button
              type="button"
              id="modal-close-print-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-[#6E6A64] hover:text-[#1A1A1A] hover:bg-black/5 transition-colors cursor-pointer"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Informative Tip (Hidden on print) */}
        <div className="no-print bg-[#F4F7F4] border-b border-[#D8E2D9] px-5 py-2.5 flex items-center justify-between text-xs text-[#2D4532]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#4A5D4E] shrink-0" />
            <span>
              <strong>نصيحة للحصول على أفضل جودة:</strong> عند الضغط على زر <strong>طباعة / حفظ كـ PDF</strong>، تأكد من اختيار <em>"حفظ بتنسيق PDF" (Save as PDF)</em> وتفعيل خيار <em>"رسومات الخلفية" (Background graphics)</em>.
            </span>
          </div>
        </div>

        {/* Scrollable Document Preview / Print Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#EFECE6]/50 flex justify-center">
          <div 
            ref={previewRef}
            id="printable-chapter-area"
            className="w-full max-w-[780px] bg-white text-[#1A1A1A] p-6 sm:p-12 md:p-16 rounded-xl shadow-md border border-[#E5E2D9] print:border-none print:shadow-none print:p-0 print:m-0"
            style={{ 
              direction: 'rtl',
              textAlign: 'justify',
              fontFamily: "'Amiri', 'Cairo', 'Traditional Arabic', serif",
              lineHeight: '2.3',
              fontSize: '18px'
            }}
          >
            {/* Print Header */}
            <div className="text-center border-b-2 border-[#4A5D4E] pb-6 mb-8 print:mb-6">
              <div className="inline-block bg-[#F3F6F4] text-[#354738] text-xs sm:text-sm font-bold px-4 py-1 rounded-full border border-[#D1DED4] mb-3 font-cairo print:border-[#354738]">
                {novel.title}
              </div>
              
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-[#111] leading-tight font-amiri">
                الفصل {chapter.chapterNumber}: {chapter.title}
              </h1>

              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-[#5a625e] font-cairo">
                <span>المؤلف: <strong>{novel.author || 'أيمن كناني'}</strong></span>
                <span>·</span>
                <span>عدد الكلمات: <strong>{chapter.wordCount.toLocaleString()}</strong> كلمة</span>
                <span>·</span>
                <span>وقت القراءة: حوالي <strong>{readingTime}</strong> دقائق</span>
                <span>·</span>
                <span>المنصة: <strong>aymankinani.org</strong></span>
              </div>

              <div className="mt-3 text-[#C88A3B] text-base tracking-widest print:text-[#4A5D4E]">
                ✦ ✦ ✦
              </div>
            </div>

            {/* Author Note */}
            {chapter.authorNote && (
              <div className="bg-[#FAF8F5] border-r-4 border-[#C88A3B] p-4 sm:p-5 rounded-lg mb-8 text-sm sm:text-base text-[#3c3832] font-cairo print:bg-[#FDFCF8] print:border-[#4A5D4E]">
                <div className="font-bold text-[#965A15] mb-1.5 text-xs sm:text-sm print:text-[#111]">
                  ملاحظة الكاتب ({novel.author || 'أيمن كناني'}):
                </div>
                <div className="italic leading-relaxed">
                  {chapter.authorNote}
                </div>
              </div>
            )}

            {/* Chapter Body Content */}
            <div className="chapter-print-content text-base sm:text-lg leading-[2.3] text-[#1A1A1A] space-y-6">
              {isHtml ? (
                <div 
                  dangerouslySetInnerHTML={{ __html: chapter.content }}
                  className="space-y-6"
                />
              ) : (
                chapter.content
                  .split('\n\n')
                  .map((paragraph, idx) => (
                    <p 
                      key={idx} 
                      className="indent-6 sm:indent-8 text-justify leading-[2.3] mb-5"
                      style={{ textJustify: 'inter-word' }}
                    >
                      {paragraph.trim()}
                    </p>
                  ))
              )}
            </div>

            {/* Book End Separator */}
            <div className="text-center my-10 text-[#4A5D4E] text-xl tracking-widest">
              ❖ ❖ ❖
            </div>

            {/* Footer & Copyright */}
            <div className="border-t border-[#E5E2D9] pt-6 mt-10 text-center text-xs text-[#6E6A64] font-cairo leading-relaxed print:border-[#CCC]">
              <p className="font-bold text-[#2C2C2C] mb-1.5 text-xs sm:text-sm">
                جميع الحقوق محفوظة © للكاتب {novel.author || 'أيمن كناني'} · مرخّص برخصة المشاع الإبداعي CC BY-NC 4.0
              </p>
              <p className="text-[11px] text-[#777]">
                تم تنزيل هذا الفصل من المنصة الرسمية المعتمدة لنشر الروايات والكتب الأدبية: <span className="font-bold text-[#4A5D4E]">www.aymankinani.org</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
