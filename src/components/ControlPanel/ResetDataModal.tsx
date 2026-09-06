import React, { useState } from 'react';
import { RotateCcw, AlertTriangle, CheckCircle2, RefreshCw, X, Shield, Database, Sparkles } from 'lucide-react';
import { supabaseService } from '../../services/supabaseService';

interface ResetDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ResetDataModal: React.FC<ResetDataModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    novelsCount: number;
    chaptersCount: number;
  } | null>(null);

  if (!isOpen) return null;

  const handleExecuteReset = async () => {
    setIsLoading(true);
    setResult(null);
    try {
      const res = await supabaseService.forceResetAndPullFromSupabase();
      setResult(res);
      if (res.success) {
        onSuccess();
      }
    } catch (err: any) {
      setResult({
        success: false,
        message: `حدث خطأ غير متوقع: ${err?.message || err}`,
        novelsCount: 0,
        chaptersCount: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    setResult(null);
    onClose();
  };

  return (
    <div
      id="reset-data-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-cairo animate-fade-in"
      onClick={handleClose}
    >
      <div
        id="reset-data-modal-container"
        className="relative w-full max-w-lg bg-[#FFFFFF] rounded-3xl border border-[#E5E2D9] shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-rose-50 to-[#FDFCF8] border-b border-[#E5E2D9] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold shadow-2xs">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-amiri font-bold text-lg text-[#2C2C2C]">
                إعادة ضبط البيانات وتطهير الذاكرة
              </h3>
              <p className="text-[11px] text-[#6E6A64]">
                مسح التخزين المحلي وإعادة السحب الإجباري من Supabase
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-xl bg-[#F7F5EE] hover:bg-[#EAE7DC] text-[#6E6A64] hover:text-[#2C2C2C] flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
            title="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {!result ? (
            <>
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs leading-relaxed space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>ماذا تفعل هذه الخاصية؟</span>
                </div>
                <ul className="space-y-1.5 list-disc list-inside text-[11px] text-amber-900/90 pr-1">
                  <li>
                    <strong>مسح التخزين المحلي (localStorage):</strong> إزالة أي نسخ كاش مؤقتة أو مكررة في متصفحك الحالي قد تسبب تكرار الكتب أو الفصول.
                  </li>
                  <li>
                    <strong>سحب نظيف من Supabase:</strong> الاتصال المباشر بالسيرفر السحابي وسحب الكتب والفصول المعتمدة فقط دون استرجاع أي كتب تجريبية أو محذوفة.
                  </li>
                  <li>
                    <strong>أمان تسجيل الدخول:</strong> لن يتم تسجيل خروجك وسيبقى اتصالك باللوحة آمناً.
                  </li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F7F5EE] border border-[#E5E2D9] text-xs text-[#5C5954] flex items-center gap-2.5">
                <Database className="w-4 h-4 text-[#4A5D4E] shrink-0" />
                <span>
                  تُستخدم هذه العملية عند ملاحظة تكرار في عناوين الكتب أو الرغبة في مزامنة المتصفح فوراً مع ما هو موجود في قاعدة البيانات.
                </span>
              </div>
            </>
          ) : (
            <div
              className={`p-5 rounded-2xl text-xs font-bold border space-y-2 ${
                result.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-center gap-2 text-sm">
                {result.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <span>{result.success ? 'اكتملت العملية بنجاح!' : 'فشلت العملية'}</span>
              </div>
              <p className="font-normal text-[11px] leading-relaxed text-[#2C2C2C]">
                {result.message}
              </p>
              {result.success && (
                <div className="pt-2 border-t border-emerald-200 flex items-center justify-between text-[11px] text-emerald-800">
                  <span>الكتب المعتمدة الآن: <strong>{result.novelsCount}</strong></span>
                  <span>الفصول المسجلة: <strong>{result.chaptersCount}</strong></span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-[#FDFCF8] border-t border-[#E5E2D9] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl bg-[#F7F5EE] hover:bg-[#EAE7DC] text-[#2C2C2C] text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            {result?.success ? 'إغلاق' : 'إلغاء'}
          </button>

          {!result?.success && (
            <button
              type="button"
              id="confirm-force-reset-btn"
              onClick={handleExecuteReset}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جارٍ مسح الكاش والسحب من Supabase...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>مسح التخزين المحلي وإعادة السحب الآن</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
