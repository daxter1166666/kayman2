import React from 'react';
import { Smartphone, Share, PlusSquare, MoreVertical, CheckCircle2, X, Download, ShieldCheck } from 'lucide-react';
import { SiteBranding } from '../types';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNativeInstall?: () => void;
  canNativeInstall: boolean;
  siteBranding?: SiteBranding;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  onNativeInstall,
  canNativeInstall,
  siteBranding,
}) => {
  if (!isOpen) return null;

  const appName = siteBranding?.siteName ? siteBranding.siteName.split('|')[0].trim() : 'أيمن كناني';
  const subtitle = siteBranding?.siteSubtitle || 'المنصة الرسمية لنشر المؤلفات والكتب';
  const iconSrc = siteBranding?.pwaIconUrl?.trim() || 
                  siteBranding?.faviconUrl?.trim() || 
                  siteBranding?.logoUrl?.trim() || 
                  '/pwa-512.png';

  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div 
      id="pwa-install-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="pwa-install-modal-dialog"
        className="bg-[#FDFCF8] rounded-3xl border border-[#E5E2D9] max-w-md w-full p-6 shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Close Button */}
        <button
          id="pwa-modal-close-btn"
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full hover:bg-[#E5E2D9]/40 text-[#6E6A64] hover:text-[#2C2C2C] transition-colors"
          title="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* App Identity Banner */}
        <div className="flex items-center gap-4 mb-6">
          <img
            src={iconSrc}
            alt={appName}
            className="w-16 h-16 rounded-2xl object-cover shadow-md border-2 border-white"
            referrerPolicy="no-referrer"
          />
          <div>
            <h3 className="font-amiri font-bold text-xl text-[#2C2C2C]">{appName}</h3>
            <p className="text-xs font-cairo text-[#6E6A64] mt-0.5 line-clamp-1">{subtitle}</p>
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-[#4A5D4E] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>تطبيق ويب تقدمي خفيف وآمن (PWA)</span>
            </div>
          </div>
        </div>

        {/* Action Button if Native Install Prompt is Available */}
        {canNativeInstall && onNativeInstall ? (
          <div className="mb-6">
            <button
              id="pwa-native-install-button"
              type="button"
              onClick={() => {
                onNativeInstall();
                onClose();
              }}
              className="w-full py-3.5 px-4 bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8] font-cairo font-bold rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تثبيت التطبيق على الشاشة الرئيسية الآن</span>
            </button>
          </div>
        ) : null}

        {/* Step-by-Step Instructions for Mobile Browsers */}
        <div className="space-y-4 font-cairo">
          <h4 className="text-xs font-bold text-[#8E8A83] uppercase tracking-wider">
            طريقة التثبيت على الهواتف الذكية:
          </h4>

          {/* iOS Safari Guide */}
          <div className={`p-3.5 rounded-2xl border transition-all ${isIOS ? 'bg-[#4A5D4E]/5 border-[#4A5D4E]/30' : 'bg-white border-[#E5E2D9]'}`}>
            <div className="flex items-center gap-2 text-xs font-bold text-[#2C2C2C] mb-2">
              <Smartphone className="w-4 h-4 text-[#4A5D4E]" />
              <span>هواتف آبل آيفون (Safari):</span>
              {isIOS && <span className="bg-[#4A5D4E] text-white text-[10px] px-2 py-0.5 rounded-full font-normal">جهازك الحالي</span>}
            </div>
            <ol className="text-xs text-[#524E48] space-y-1.5 pr-4 list-decimal">
              <li className="flex items-start gap-1.5">
                <span>1. اضغط على زر <strong>المشاركة</strong></span>
                <Share className="w-3.5 h-3.5 text-[#4A5D4E] inline-block shrink-0 mt-0.5" />
                <span>في أسفل نافذة متصفح Safari.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span>2. مرر للأسفل واضغط على <strong>«إضافة إلى الصفحة الرئيسية»</strong></span>
                <PlusSquare className="w-3.5 h-3.5 text-[#4A5D4E] inline-block shrink-0 mt-0.5" />
              </li>
              <li>
                <span>3. اضغط على <strong>«إضافة» (Add)</strong> في الزاوية العلوية ليظهر التطبيق بأيقونته الرسمية على شاشتك.</span>
              </li>
            </ol>
          </div>

          {/* Android Chrome Guide */}
          <div className={`p-3.5 rounded-2xl border transition-all ${!isIOS ? 'bg-[#4A5D4E]/5 border-[#4A5D4E]/30' : 'bg-white border-[#E5E2D9]'}`}>
            <div className="flex items-center gap-2 text-xs font-bold text-[#2C2C2C] mb-2">
              <Smartphone className="w-4 h-4 text-[#4A5D4E]" />
              <span>هواتف أندرويد (Google Chrome / Edge):</span>
              {!isIOS && <span className="bg-[#4A5D4E] text-white text-[10px] px-2 py-0.5 rounded-full font-normal">نظام أندرويد</span>}
            </div>
            <ol className="text-xs text-[#524E48] space-y-1.5 pr-4 list-decimal">
              <li className="flex items-start gap-1.5">
                <span>1. اضغط على قائمة النقاط الثلاث</span>
                <MoreVertical className="w-3.5 h-3.5 text-[#4A5D4E] inline-block shrink-0 mt-0.5" />
                <span>في أعلى المتصفح.</span>
              </li>
              <li>
                <span>2. اختر <strong>«تثبيت التطبيق»</strong> أو <strong>«إضافة إلى الشاشة الرئيسية»</strong> (Install App).</span>
              </li>
              <li>
                <span>3. أكّد التثبيت ليظهر التطبيق باسم <strong>«{appName}»</strong> وأيقونته الكاملة.</span>
              </li>
            </ol>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#6E6A64] bg-[#F7F5EE] p-3 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-[#4A5D4E] shrink-0" />
            <span>يعمل التطبيق بدون الحاجة لمتجر تطبيقات، بحجم خفيف جداً، مع إمكانية القراءة دون اتصال بالإنترنت.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
