import React from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  itemDetails?: {
    title?: string;
    subtitle?: string;
    image?: string;
  };
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'تأكيد الحذف',
  cancelText = 'إلغاء',
  isDestructive = true,
  isLoading = false,
  itemDetails,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="confirm-modal-backdrop"
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-cairo animate-in fade-in duration-200 overflow-y-auto"
    >
      {/* Click outside to cancel */}
      <div className="absolute inset-0" onClick={isLoading ? undefined : onCancel} />

      <div
        id="confirm-modal-dialog"
        className="relative w-full max-w-md bg-[#FFFFFF] border border-[#E5E2D9] rounded-3xl shadow-2xl p-6 sm:p-7 text-right z-10 overflow-hidden my-auto"
      >
        {/* Top Decorative Alert Bar */}
        <div className={`absolute top-0 inset-x-0 h-1.5 ${isDestructive ? 'bg-rose-500' : 'bg-[#4A5D4E]'}`} />

        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${isDestructive ? 'bg-rose-100 text-rose-600' : 'bg-[#4A5D4E]/10 text-[#4A5D4E]'}`}>
              {isDestructive ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-amiri font-bold text-xl text-[#2C2C2C]">
                {title}
              </h3>
            </div>
          </div>

          <button
            id="confirm-modal-close-btn"
            type="button"
            onClick={isLoading ? undefined : onCancel}
            disabled={isLoading}
            className="p-1.5 rounded-xl text-[#8E8A83] hover:text-[#2C2C2C] hover:bg-[#F7F5EE] transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-[#6E6A64] leading-relaxed mb-5">
          {message}
        </p>

        {/* Optional preview of the item being deleted */}
        {itemDetails && (itemDetails.title || itemDetails.image) && (
          <div className="p-3.5 rounded-2xl bg-[#F7F5EE] border border-[#E5E2D9] flex items-center gap-3 mb-6">
            {Boolean(itemDetails.image?.trim()) && (
              <img
                src={itemDetails.image}
                alt={itemDetails.title || ''}
                className="w-12 h-16 object-cover rounded-xl border border-[#E5E2D9] shrink-0"
                referrerPolicy="no-referrer"
              />
            )}
            <div className="min-w-0 flex-1">
              {itemDetails.title && (
                <h4 className="font-amiri font-bold text-sm text-[#2C2C2C] truncate">
                  {itemDetails.title}
                </h4>
              )}
              {itemDetails.subtitle && (
                <p className="text-xs text-[#8C5E45] truncate mt-0.5">
                  {itemDetails.subtitle}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            id="confirm-modal-cancel-btn"
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#6E6A64] hover:text-[#2C2C2C] hover:bg-[#F7F5EE] border border-[#E5E2D9] transition-all cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            id="confirm-modal-confirm-btn"
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-2 transition-all cursor-pointer active:scale-98 disabled:opacity-60 ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                : 'bg-[#4A5D4E] hover:bg-[#3C4C3F] shadow-[#4A5D4E]/20'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري الحذف...</span>
              </>
            ) : (
              <>
                {isDestructive && <Trash2 className="w-4 h-4" />}
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
