import React, { useState } from 'react';
import { AlertTriangle, RotateCcw, X, Loader2, CheckCircle2 } from 'lucide-react';
import { storageService } from '../../services/storageService';

interface ResetDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ResetDataModal: React.FC<ResetDataModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isResetting, setIsResetting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleReset = async () => {
    setIsResetting(true);
    try {
      storageService.resetAllData();
      // Short delay for user feedback
      await new Promise((resolve) => setTimeout(resolve, 500));
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to reset data:', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div
      id="reset-data-modal-backdrop"
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-cairo animate-in fade-in duration-200 overflow-y-auto"
    >
      {/* Click outside to cancel */}
      <div className="absolute inset-0" onClick={isResetting ? undefined : onClose} />

      <div
        id="reset-data-modal-dialog"
        className="relative w-full max-w-md bg-[#FFFFFF] border border-[#E5E2D9] rounded-3xl shadow-2xl p-6 sm:p-7 text-right z-10 overflow-hidden my-auto"
      >
        {/* Top Warning Stripe */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-amber-500" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-amiri font-bold text-xl text-[#2C2C2C]">
                إعادة ضبط البيانات
              </h3>
              <p className="text-xs text-[#6E6A64]">
                استعادة البيانات الافتراضية وتحديث الكاش
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isResetting}
            className="p-2 text-[#6E6A64] hover:text-[#2C2C2C] hover:bg-[#F2EFE9] rounded-full transition-colors cursor-pointer disabled:opacity-50"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Details */}
        <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#E5E2D9] mb-5 space-y-2.5 text-xs text-[#5A5751] leading-relaxed">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p>
              سيؤدي هذا الإجراء إلى مسح التخزين المؤقت في المتصفح وإعادة تحميل بيانات الروايات والفصول الافتراضية الأصلية المحدثة.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[#4A5D4E]">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>سيتم الاحتفاظ بهوية الموقع وإعدادات الأمان الأساسية.</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isResetting}
            className="px-4 py-2.5 rounded-xl border border-[#E5E2D9] text-xs font-bold text-[#6E6A64] hover:bg-[#F2EFE9] transition-all cursor-pointer disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            type="button"
            id="confirm-reset-data-btn"
            onClick={handleReset}
            disabled={isResetting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {isResetting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري استعادة البيانات...</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>تأكيد إعادة الضبط</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
