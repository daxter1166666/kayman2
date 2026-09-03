import React, { useState, useRef } from 'react';
import {
  KeyRound,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Database,
  Download,
  RotateCcw,
  Lock,
  Globe,
  Image as ImageIcon,
  Upload,
  Copy,
  Check,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { SiteBranding } from '../../types';

interface SettingsTabProps {
  onRefreshData: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ onRefreshData }) => {
  const currentCreds = storageService.getAdminCredentials();
  const [branding, setBranding] = useState<SiteBranding>(() => storageService.getSiteBranding());
  const [username, setUsername] = useState<string>(currentCreds.username);
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isDraggingLogo, setIsDraggingLogo] = useState<boolean>(false);
  const [isDraggingFavicon, setIsDraggingFavicon] = useState<boolean>(false);
  const [isDraggingPwaIcon, setIsDraggingPwaIcon] = useState<boolean>(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const pwaIconInputRef = useRef<HTMLInputElement>(null);

  const adminDirectUrl = `${window.location.origin}/?admin=true`;

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleCopyAdminUrl = () => {
    navigator.clipboard.writeText(adminDirectUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Image Upload helper from file
  const handleFileUpload = (file: File, type: 'logo' | 'favicon' | 'pwaIcon') => {
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح (PNG, SVG, ICO, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        if (type === 'logo') {
          setBranding(prev => ({ ...prev, logoUrl: result }));
        } else if (type === 'favicon') {
          setBranding(prev => ({ ...prev, faviconUrl: result }));
          // Update actual browser favicon dynamically
          const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
          link.type = 'image/x-icon';
          link.rel = 'shortcut icon';
          link.href = result;
          document.getElementsByTagName('head')[0].appendChild(link);
        } else if (type === 'pwaIcon') {
          setBranding(prev => ({ ...prev, pwaIconUrl: result }));
          // Update Apple Touch Icon & PWA app icon
          const appleLink = document.querySelector("link[rel*='apple-touch-icon']") as HTMLLinkElement || document.createElement('link');
          appleLink.rel = 'apple-touch-icon';
          appleLink.href = result;
          document.getElementsByTagName('head')[0].appendChild(appleLink);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveSiteBranding(branding);
    showToast('تم حفظ وتحديث هوية الموقع وشعار المنصة وأيقونة المتصفح بنجاح!');
    onRefreshData();
  };

  const handleUpdateCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim()) {
      setErrorMessage('اسم المستخدم لا يمكن أن يكون فارغاً');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMessage('كلمتا المرور غير متطابقتين');
      return;
    }

    const passwordToSave = newPassword.trim() || currentCreds.passwordHash;
    const success = storageService.updateAdminCredentials(username.trim(), passwordToSave);

    if (success) {
      setNewPassword('');
      setConfirmPassword('');
      showToast('تم تحديث بيانات دخول الإدارة بنجاح!');
    } else {
      setErrorMessage('حدث خطأ أثناء حفظ البيانات');
    }
  };

  const handleExportData = () => {
    const backup = {
      branding: storageService.getSiteBranding(),
      authorProfile: storageService.getAuthorProfile(),
      donationSettings: storageService.getDonationSettings(),
      supabaseConfig: storageService.getSupabaseConfig(),
      novels: storageService.getNovels(),
      chapters: storageService.getChapters(),
      comments: storageService.getComments(),
      adSettings: storageService.getAdSettings(),
      readerSettings: storageService.getReaderSettings(),
      exportDate: new Date().toISOString(),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ayman-kinani-backup-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('تم تصدير وحفظ نسخة احتياطية شاملة لكافة البيانات!');
  };

  const handleResetData = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في إعادة تعيين كافة البيانات إلى الحالة الافتراضية؟')) {
      storageService.resetAllData();
      onRefreshData();
      showToast('تمت استعادة البيانات الأولية بنجاح.');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-cairo text-[#2C2C2C]">
      {/* Toast */}
      {notification && (
        <div className="fixed bottom-6 left-6 z-50 bg-[#4A5D4E] text-[#FDFCF8] px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* 1. Branding & Identity Settings */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4A5D4E]/10 text-[#4A5D4E] flex items-center justify-center font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-amiri font-bold text-xl text-[#2C2C2C]">
                هوية الموقع، الشعار، والأيقونة (Branding & Logo)
              </h3>
              <p className="text-xs text-[#6E6A64]">
                تغيير اسم الموقع، الشعار الترويجي، وأيقونة المتصفح (Favicon) التي تظهر بجوار اسم الموقع في Google
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveBranding}
            className="px-5 py-2.5 bg-[#4A5D4E] hover:bg-[#3C4C3F] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>حفظ بيانات الهوية</span>
          </button>
        </div>

        <form onSubmit={handleSaveBranding} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C2C2C]">اسم الموقع والمنصة *</label>
              <input
                type="text"
                required
                value={branding.siteName}
                onChange={e => setBranding(prev => ({ ...prev, siteName: e.target.value }))}
                placeholder="مثال: أيمن كناني | Ayman Kinani"
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] focus:border-[#4A5D4E] focus:outline-none font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C2C2C]">العنوان الفرعي / الوصف المختصر</label>
              <input
                type="text"
                value={branding.siteSubtitle}
                onChange={e => setBranding(prev => ({ ...prev, siteSubtitle: e.target.value }))}
                placeholder="مثال: المنصة الرسمية لنشر المؤلفات والكتب"
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] focus:border-[#4A5D4E] focus:outline-none"
              />
            </div>
          </div>

          {/* Logo, Favicon, and PWA Web App Icon Upload via Drag & Drop */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            {/* Logo Upload Box */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2C2C2C] flex items-center justify-between">
                <span>لوغو الموقع (Site Logo)</span>
                <span className="text-[11px] text-[#6E6A64]">سحب وإفلات أو رابط</span>
              </label>

              <div
                onDragOver={(e) => { e.preventDefault(); setIsDraggingLogo(true); }}
                onDragLeave={() => setIsDraggingLogo(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingLogo(false);
                  if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0], 'logo');
                }}
                onClick={() => logoInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[110px] ${
                  isDraggingLogo ? 'border-[#4A5D4E] bg-[#4A5D4E]/10' : 'border-[#E5E2D9] bg-[#FDFCF8] hover:bg-[#F7F5EE]'
                }`}
              >
                <input
                  type="file"
                  ref={logoInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'logo');
                  }}
                />

                {branding.logoUrl ? (
                  <div className="flex items-center gap-3">
                    <img src={branding.logoUrl} alt="Logo" className="max-h-12 object-contain" referrerPolicy="no-referrer" />
                    <span className="text-xs text-[#4A5D4E] font-bold">انقر لتغيير اللوغو</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-2">
                    <Upload className="w-5 h-5 text-[#8E8A83] mb-1" />
                    <span className="text-xs font-bold text-[#2C2C2C]">اسحب وأفلت لوغو الموقع هنا</span>
                    <span className="text-[10px] text-[#8E8A83]">PNG, SVG, JPG شفاف ومميز</span>
                  </div>
                )}
              </div>

              <input
                type="url"
                value={branding.logoUrl}
                onChange={e => setBranding(prev => ({ ...prev, logoUrl: e.target.value }))}
                placeholder="أو الصق رابط صورة اللوغو (URL)..."
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-[#FFFFFF] border border-[#E5E2D9] text-[#2C2C2C] focus:border-[#4A5D4E] focus:outline-none"
              />
            </div>

            {/* Favicon Upload Box */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2C2C2C] flex items-center justify-between">
                <span>أيقونة المتصفح التبويبية (Favicon)</span>
                <span className="text-[11px] text-[#6E6A64]">تظهر في نافذة المتصفح وجوجل</span>
              </label>

              <div
                onDragOver={(e) => { e.preventDefault(); setIsDraggingFavicon(true); }}
                onDragLeave={() => setIsDraggingFavicon(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingFavicon(false);
                  if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0], 'favicon');
                }}
                onClick={() => faviconInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[110px] ${
                  isDraggingFavicon ? 'border-[#4A5D4E] bg-[#4A5D4E]/10' : 'border-[#E5E2D9] bg-[#FDFCF8] hover:bg-[#F7F5EE]'
                }`}
              >
                <input
                  type="file"
                  ref={faviconInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'favicon');
                  }}
                />

                {branding.faviconUrl ? (
                  <div className="flex items-center gap-3">
                    <img src={branding.faviconUrl} alt="Favicon" className="w-8 h-8 rounded-md object-contain border border-[#E5E2D9]" referrerPolicy="no-referrer" />
                    <span className="text-xs text-[#4A5D4E] font-bold">انقر لتغيير أيقونة Favicon</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-2">
                    <Sparkles className="w-5 h-5 text-amber-600 mb-1" />
                    <span className="text-xs font-bold text-[#2C2C2C]">اسحب وأفلت أيقونة Favicon هنا</span>
                    <span className="text-[10px] text-[#8E8A83]">PNG أو ICO مربعة (32x32)</span>
                  </div>
                )}
              </div>

              <input
                type="url"
                value={branding.faviconUrl}
                onChange={e => setBranding(prev => ({ ...prev, faviconUrl: e.target.value }))}
                placeholder="أو الصق رابط Favicon (URL)..."
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-[#FFFFFF] border border-[#E5E2D9] text-[#2C2C2C] focus:border-[#4A5D4E] focus:outline-none"
              />
            </div>

            {/* PWA Web App Icon Box */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2C2C2C] flex items-center justify-between">
                <span>أيقونة تطبيق الويب (PWA App Icon)</span>
                <span className="text-[11px] text-[#6E6A64]">أيقونة التثبيت على الهاتف والـ PWA</span>
              </label>

              <div
                onDragOver={(e) => { e.preventDefault(); setIsDraggingPwaIcon(true); }}
                onDragLeave={() => setIsDraggingPwaIcon(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingPwaIcon(false);
                  if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0], 'pwaIcon');
                }}
                onClick={() => pwaIconInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[110px] ${
                  isDraggingPwaIcon ? 'border-[#4A5D4E] bg-[#4A5D4E]/10' : 'border-[#E5E2D9] bg-[#FDFCF8] hover:bg-[#F7F5EE]'
                }`}
              >
                <input
                  type="file"
                  ref={pwaIconInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'pwaIcon');
                  }}
                />

                {branding.pwaIconUrl ? (
                  <div className="flex items-center gap-3">
                    <img src={branding.pwaIconUrl} alt="PWA Icon" className="w-10 h-10 rounded-xl object-cover border border-[#E5E2D9] shadow-xs" referrerPolicy="no-referrer" />
                    <span className="text-xs text-[#4A5D4E] font-bold">انقر لتغيير أيقونة التطبيق PWA</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-2">
                    <Globe className="w-5 h-5 text-[#4A5D4E] mb-1" />
                    <span className="text-xs font-bold text-[#2C2C2C]">اسحب وأفلت أيقونة تطبيق الويب PWA هنا</span>
                    <span className="text-[10px] text-[#8E8A83]">PNG مربعة عالية الدقة (192x192 أو 512x512)</span>
                  </div>
                )}
              </div>

              <input
                type="url"
                value={branding.pwaIconUrl || ''}
                onChange={e => setBranding(prev => ({ ...prev, pwaIconUrl: e.target.value }))}
                placeholder="أو الصق رابط أيقونة تطبيق الويب PWA (URL)..."
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-[#FFFFFF] border border-[#E5E2D9] text-[#2C2C2C] focus:border-[#4A5D4E] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-bold text-[#2C2C2C]">نص حقوق الملكية في أسفل الموقع (Footer Text)</label>
            <input
              type="text"
              value={branding.footerText}
              onChange={e => setBranding(prev => ({ ...prev, footerText: e.target.value }))}
              placeholder="جميع الحقوق محفوظة للكاتب أيمن كناني © 2026"
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] focus:border-[#4A5D4E] focus:outline-none"
            />
          </div>
        </form>
      </div>

      {/* 2. Admin Security & Hidden Access Link */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-[#E5E2D9] pb-4">
          <div className="w-10 h-10 rounded-xl bg-[#4A5D4E]/10 text-[#4A5D4E] flex items-center justify-center font-bold">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-amiri font-bold text-xl text-[#2C2C2C]">
              إعدادات أمان حساب الأدمن / الكاتب والرابط السري
            </h3>
            <p className="text-xs text-[#6E6A64]">
              تخصيص اسم المستخدم وكلمة المرور والحصول على رابط الدخول السري للوحة التحكم
            </p>
          </div>
        </div>

        {/* Secret URL Box */}
        <div className="p-4 bg-[#F7F5EE] border border-[#E5E2D9] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-[#2C2C2C] block">
              رابط الدخول المباشر والسري للوحة التحكم (خاص بك ككاتب):
            </span>
            <span className="text-xs font-mono text-[#4A5D4E] font-bold dir-ltr block mt-0.5">
              {adminDirectUrl}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyAdminUrl}
            className="px-4 py-2 bg-[#4A5D4E] hover:bg-[#3C4C3F] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'تم النسخ!' : 'نسخ الرابط'}</span>
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleUpdateCredentials} className="space-y-4 max-w-lg">
          <div>
            <label className="text-xs font-bold text-[#2C2C2C] block mb-1.5">
              اسم مستخدم الإدارة
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E8A83]" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full pr-10 pl-3.5 py-2.5 text-xs rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] focus:border-[#4A5D4E] focus:outline-none font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#2C2C2C] block mb-1.5">
              كلمة المرور الجديدة (اتركها فارغة للاحتفاظ بالحالية)
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E8A83]" />
              <input
                type="password"
                placeholder="أدخل كلمة مرور جديدة..."
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full pr-10 pl-3.5 py-2.5 text-xs rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] focus:border-[#4A5D4E] focus:outline-none font-mono"
              />
            </div>
          </div>

          {newPassword && (
            <div>
              <label className="text-xs font-bold text-[#2C2C2C] block mb-1.5">
                تأكيد كلمة المرور الجديدة
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E8A83]" />
                <input
                  type="password"
                  placeholder="أعد كتابة كلمة المرور..."
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full pr-10 pl-3.5 py-2.5 text-xs rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] focus:border-[#4A5D4E] focus:outline-none font-mono"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="px-6 py-2.5 bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8] font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>حفظ وتحديث بيانات الدخول</span>
          </button>
        </form>
      </div>

      {/* 3. Database & Backup Actions */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-[#E5E2D9] pb-4">
          <div className="w-10 h-10 rounded-xl bg-[#C88A3B]/10 text-[#C88A3B] flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-amiri font-bold text-xl text-[#2C2C2C]">
              النسخ الاحتياطي وإدارة البيانات
            </h3>
            <p className="text-xs text-[#6E6A64]">
              تصدير قاعدة بيانات المؤلفات والفصول والملف الشخصي بصيغة JSON أو إعادة التعيين
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-[#F7F5EE] border border-[#E5E2D9] flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-[#2C2C2C] mb-1">
                تنزيل نسخة احتياطية كاملة (Backup JSON)
              </h4>
              <p className="text-[11px] text-[#6E6A64] leading-relaxed mb-4">
                احفظ نسخة من مؤلفات الكاتب أيمن كناني وفصولها وإعدادات الموقع على جهازك.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportData}
              className="px-4 py-2 bg-[#FFFFFF] hover:bg-[#EAE7DC] text-[#2C2C2C] font-bold text-xs rounded-xl border border-[#E5E2D9] flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Download className="w-4 h-4 text-[#4A5D4E]" />
              <span>تصدير البيانات</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-rose-900 mb-1">
                إعادة ضبط البيانات الأولية
              </h4>
              <p className="text-[11px] text-rose-700 leading-relaxed mb-4">
                استعادة المؤلفات والفصول التجريبية الأصلية وتفريغ التقييمات.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetData}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>استعادة الحالة الافتراضية</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
