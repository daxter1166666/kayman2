import React, { useState } from 'react';
import { Smartphone, Share, PlusSquare, MoreVertical, CheckCircle2, X, Download, ShieldCheck, Laptop, Copy, Check, ExternalLink } from 'lucide-react';
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
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const appName = 'أيمن كناني';
  const subtitle = siteBranding?.siteSubtitle || 'المنصة الرسمية لنشر المؤلفات والكتب والروايات';
  const iconSrc = siteBranding?.pwaIconUrl?.trim() || 
                  siteBranding?.faviconUrl?.trim() || 
                  siteBranding?.logoUrl?.trim() || 
                  '/pwa-512.png';

  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);
  const isDesktop = !isIOS && !isAndroid;

  const handleDirectDownload = () => {
    // 1. If native prompt is available, trigger it immediately
    if (canNativeInstall && onNativeInstall) {
      onNativeInstall();
    }

    // 2. Download direct standalone application launcher file
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.aymankinani.org';
      const fileContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appName}</title>
  <link rel="icon" href="${iconSrc}">
  <link rel="apple-touch-icon" href="${iconSrc}">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-title" content="${appName}">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 40px 20px; background: #FDFCF8; color: #2C2C2C; }
    .card { max-width: 420px; margin: 20px auto; background: white; padding: 32px 24px; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #E5E2D9; }
    .btn { display: inline-block; padding: 14px 28px; background: #4A5D4E; color: white; border-radius: 14px; text-decoration: none; font-weight: bold; margin-top: 20px; }
  </style>
  <script>
    window.location.replace("${origin}?source=direct_app");
  </script>
</head>
<body>
  <div class="card">
    <img src="${iconSrc}" alt="${appName}" style="width: 80px; height: 80px; border-radius: 18px; margin-bottom: 12px; object-fit: cover;">
    <h2 style="margin: 0 0 8px 0;">${appName}</h2>
    <p style="color: #6E6A64; font-size: 14px;">المنصة الرسمية المعتمدة للكاتب</p>
    <a href="${origin}" class="btn">فتح تطبيق أيمن كناني</a>
  </div>
</body>
</html>`;

      const blob = new Blob([fileContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'أيمن_كناني.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleCopyDirectLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      const url = typeof window !== 'undefined' ? window.location.origin : 'https://www.aymankinani.org';
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

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
          className="absolute top-4 left-4 p-2 rounded-full hover:bg-[#E5E2D9]/40 text-[#6E6A64] hover:text-[#2C2C2C] transition-colors cursor-pointer"
          title="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* App Identity Banner */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <img
              src={iconSrc}
              alt={appName}
              className="w-18 h-18 rounded-2xl object-cover shadow-md border-2 border-white ring-2 ring-[#4A5D4E]/20"
              referrerPolicy="no-referrer"
            />
            <span className="absolute -bottom-1.5 -left-1.5 w-6 h-6 rounded-full bg-[#4A5D4E] text-white flex items-center justify-center shadow-xs text-xs font-bold">
              ✓
            </span>
          </div>
          <div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#4A5D4E]/10 text-[#4A5D4E] text-[10px] font-bold font-cairo mb-1">
              <ShieldCheck className="w-3 h-3" />
              <span>تطبيق رسمي معتمد (PWA)</span>
            </div>
            <h3 className="font-amiri font-bold text-2xl text-[#2C2C2C] leading-tight">{appName}</h3>
            <p className="text-xs font-cairo text-[#6E6A64] mt-0.5 line-clamp-1">{subtitle}</p>
          </div>
        </div>

        {/* Prominent Direct Download & Install Action Button */}
        <div className="mb-6 space-y-2.5">
          <button
            id="pwa-direct-download-primary-btn"
            type="button"
            onClick={handleDirectDownload}
            className="w-full py-4 px-5 bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8] font-cairo font-bold rounded-2xl transition-all shadow-md hover:shadow-xl flex items-center justify-between text-sm sm:text-base cursor-pointer active:scale-98 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Download className="w-5 h-5 text-amber-200" />
              </div>
              <div className="text-right">
                <span className="block font-bold text-sm sm:text-base">تنزيل مباشر للتطبيق الآن</span>
                <span className="block text-[10px] text-white/80 font-normal">
                  {canNativeInstall ? 'تثبيت مباشر بنقرة واحدة على هاتفك' : 'تنزيل فوري لملف التطبيق والتثبيت'}
                </span>
              </div>
            </div>
            <span className="text-[11px] bg-white/25 px-2.5 py-1 rounded-lg font-bold shrink-0">
              تنزيل مباشر ⚡
            </span>
          </button>

          {downloadSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-cairo flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>تم بدء التنزيل المباشر بنجاح! تفقد مجلد التنزيلات على جهازك.</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyDirectLink}
              className="flex-1 py-2 px-3 rounded-xl border border-[#E5E2D9] bg-white hover:bg-[#F7F5EE] text-[#4A4742] text-xs font-semibold font-cairo flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">تم نسخ الرابط المباشر!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#6E6A64]" />
                  <span>نسخ الرابط المباشر</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDirectDownload}
              className="py-2 px-3 rounded-xl border border-[#4A5D4E]/30 bg-[#4A5D4E]/5 hover:bg-[#4A5D4E]/10 text-[#4A5D4E] text-xs font-bold font-cairo flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="تنزيل ملف المشغل المباشر"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تنزيل الملف المباشر (.html)</span>
            </button>
          </div>
        </div>

        {/* Step-by-Step Instructions for Devices */}
        <div className="space-y-4 font-cairo">
          <h4 className="text-xs font-bold text-[#8E8A83] uppercase tracking-wider">
            طريقة التنزيل والتثبيت على هاتفك:
          </h4>

          {/* iOS Safari Guide */}
          <div className={`p-4 rounded-2xl border transition-all ${isIOS ? 'bg-[#4A5D4E]/5 border-[#4A5D4E]/40 shadow-xs' : 'bg-white border-[#E5E2D9]'}`}>
            <div className="flex items-center justify-between text-xs font-bold text-[#2C2C2C] mb-2.5">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#4A5D4E]" />
                <span>أجهزة آبل (iPhone / iPad - متصفح Safari):</span>
              </div>
              {isIOS && <span className="bg-[#4A5D4E] text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold">جهازك الآن</span>}
            </div>
            <ol className="text-xs text-[#524E48] space-y-2 pr-4 list-decimal">
              <li className="flex items-start gap-2">
                <span>1. اضغط على زر <strong>«المشاركة»</strong></span>
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-sky-100 text-sky-700 shrink-0">
                  <Share className="w-3.5 h-3.5" />
                </span>
                <span>في أسفل متصفح Safari.</span>
              </li>
              <li className="flex items-start gap-2">
                <span>2. مرر للأسفل واضغط على <strong>«إضافة إلى الصفحة الرئيسية»</strong></span>
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-gray-100 text-gray-700 shrink-0">
                  <PlusSquare className="w-3.5 h-3.5" />
                </span>
              </li>
              <li>
                <span>3. اضغط على <strong>«إضافة» (Add)</strong> بالأعلى لتظهر أيقونة التطبيق الرسمية باسم <strong>«أيمن كناني»</strong>.</span>
              </li>
            </ol>
          </div>

          {/* Android Chrome Guide */}
          <div className={`p-4 rounded-2xl border transition-all ${isAndroid ? 'bg-[#4A5D4E]/5 border-[#4A5D4E]/40 shadow-xs' : 'bg-white border-[#E5E2D9]'}`}>
            <div className="flex items-center justify-between text-xs font-bold text-[#2C2C2C] mb-2.5">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#4A5D4E]" />
                <span>أجهزة أندرويد (Chrome / Edge / Samsung):</span>
              </div>
              {isAndroid && <span className="bg-[#4A5D4E] text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold">جهازك الآن</span>}
            </div>
            <ol className="text-xs text-[#524E48] space-y-2 pr-4 list-decimal">
              <li className="flex items-start gap-2">
                <span>1. اضغط على قائمة النقاط الثلاث</span>
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-gray-100 text-gray-700 shrink-0">
                  <MoreVertical className="w-3.5 h-3.5" />
                </span>
                <span>في أعلى المتصفح.</span>
              </li>
              <li>
                <span>2. اختر <strong>«تثبيت التطبيق»</strong> أو <strong>«إضافة إلى الشاشة الرئيسية»</strong> (Install App).</span>
              </li>
              <li>
                <span>3. أكّد التثبيت ليظهر التطبيق بأيقونته الكاملة على شاشتك الرئيسية فوراً.</span>
              </li>
            </ol>
          </div>

          {/* Desktop Computer Guide */}
          {isDesktop && (
            <div className="p-3.5 rounded-2xl border bg-white border-[#E5E2D9]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#2C2C2C] mb-1.5">
                <Laptop className="w-4 h-4 text-[#4A5D4E]" />
                <span>أجهزة الكمبيوتر واللابتوب (Chrome / Edge):</span>
              </div>
              <p className="text-xs text-[#524E48]">
                اضغط على أيقونة التثبيت <Download className="w-3 h-3 inline text-[#4A5D4E] mx-1" /> الموجودة في نهاية شريط العنوان (Address Bar) بالأعلى لتثبيت التطبيق كنافذة مستقلة وسريعة.
              </p>
            </div>
          )}

          {/* Value Props Pills */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-[#4A5D4E]">
            <div className="flex items-center gap-1.5 bg-[#4A5D4E]/10 p-2.5 rounded-xl font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>يعمل بدون اتصال بالإنترنت</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#4A5D4E]/10 p-2.5 rounded-xl font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>حجم خفيف جداً وتصفح فوري</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

