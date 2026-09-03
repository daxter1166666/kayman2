import React, { useState } from 'react';
import {
  Search,
  Globe,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Download,
  Share2,
  FileCode,
  Smartphone,
  Monitor,
  ExternalLink,
  ShieldCheck,
  Layers,
  Star
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { seoService } from '../../services/seoService';
import { SeoSettings, Novel, Chapter } from '../../types';

interface SeoTabProps {
  novels: Novel[];
  chapters: Chapter[];
  onRefreshData: () => void;
}

export const SeoTab: React.FC<SeoTabProps> = ({ novels, chapters, onRefreshData }) => {
  const [settings, setSettings] = useState<SeoSettings>(() => storageService.getSeoSettings());
  const [copiedSitemap, setCopiedSitemap] = useState<boolean>(false);
  const [copiedRobots, setCopiedRobots] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [selectedPreviewNovelId, setSelectedPreviewNovelId] = useState<string>(novels[0]?.id || '');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveSeoSettings(settings);
    seoService.updateHead();
    showToast('تم حفظ وتطبيق إعدادات السيو ومحركات البحث بنجاح!');
    onRefreshData();
  };

  const currentBaseUrl = (settings.canonicalBaseUrl || window.location.origin).replace(/\/$/, '');
  const sitemapUrl = `${currentBaseUrl}/sitemap.xml`;
  const robotsUrl = `${currentBaseUrl}/robots.txt`;

  const handleCopy = (text: string, type: 'sitemap' | 'robots') => {
    navigator.clipboard.writeText(text);
    if (type === 'sitemap') {
      setCopiedSitemap(true);
      setTimeout(() => setCopiedSitemap(false), 2500);
    } else {
      setCopiedRobots(true);
      setTimeout(() => setCopiedRobots(false), 2500);
    }
  };

  const handleDownloadSitemap = () => {
    const xml = seoService.generateSitemapXml(novels, chapters, currentBaseUrl);
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    a.click();
    URL.revokeObjectURL(url);
    showToast('تم إنشاء وتحميل ملف sitemap.xml المحدث بنجاح!');
  };

  // Preview novel calculation
  const previewNovel = novels.find(n => n.id === selectedPreviewNovelId) || novels[0];
  const previewTitle = previewNovel
    ? settings.siteTitleTemplate.replace('%title%', `رواية ${previewNovel.title}`)
    : settings.defaultTitle;
  const previewDesc = previewNovel?.synopsis || settings.defaultDescription;
  const descCharCount = settings.defaultDescription.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* SEO Health Overview */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#E5E2D9] pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#2C2C2C]">تحسين محركات البحث والأرشفة (SEO & Google)</h2>
              <p className="text-xs text-[#6E6A64] mt-0.5">
                إدارة وسوم الميتا، خريطة الموقع sitemap، وملفات التوجيه لضمان تصدر مؤلفات الكاتب أيمن كناني في نتائج بحث Google.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadSitemap}
              className="px-4 py-2 bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8] rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل خريطة sitemap.xml ({novels.length + chapters.length + 8} رابط)</span>
            </button>
          </div>
        </div>

        {/* Status Checklist Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 text-xs">
          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-2.5 text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold block">ملف robots.txt</span>
              <span className="text-[11px] text-emerald-700">نشط ومهيأ لمحركات البحث</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-2.5 text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold block">البيانات المنظمة JSON-LD</span>
              <span className="text-[11px] text-emerald-700">Book & Article Schemas</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-2.5 text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold block">بطاقات OpenGraph</span>
              <span className="text-[11px] text-emerald-700">جاهزة للمشاركة في واتساب وتويتر</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-2.5 text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold block">العناوين الديناميكية</span>
              <span className="text-[11px] text-emerald-700">تتغير تلقائياً لكل كتاب وفصل</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Form & Live Google SERP Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Settings Form (7 cols) */}
        <form onSubmit={handleSaveSettings} className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs space-y-5">
            <h3 className="font-bold text-sm text-[#2C2C2C] flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#4A5D4E]" />
              <span>إعدادات العناوين والوصف والكلمات المفتاحية</span>
            </h3>

            {/* Site Title Template */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C2C2C] block">
                قالب عنوان الصفحات (Title Template):
              </label>
              <input
                type="text"
                value={settings.siteTitleTemplate}
                onChange={e => setSettings({ ...settings, siteTitleTemplate: e.target.value })}
                placeholder="%title% | الكاتب أيمن كناني"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2D9] bg-[#FDFCF8] text-xs focus:ring-2 focus:ring-[#4A5D4E]/30 focus:border-[#4A5D4E] outline-hidden"
              />
              <p className="text-[11px] text-[#6E6A64]">
                استخدم <code className="bg-[#E5E2D9]/40 px-1 py-0.5 rounded font-mono">%title%</code> ليتم استبداله تلقائياً باسم الرواية أو الفصل عند فتحه.
              </p>
            </div>

            {/* Default Page Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C2C2C] block">
                العنوان الافتراضي للصفحة الرئيسية (Default Meta Title):
              </label>
              <input
                type="text"
                value={settings.defaultTitle}
                onChange={e => setSettings({ ...settings, defaultTitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2D9] bg-[#FDFCF8] text-xs focus:ring-2 focus:ring-[#4A5D4E]/30 focus:border-[#4A5D4E] outline-hidden"
              />
            </div>

            {/* Default Meta Description with counter */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#2C2C2C]">
                  الوصف التعريفي العام (Meta Description):
                </label>
                <span className={`text-[11px] font-bold ${descCharCount >= 120 && descCharCount <= 165 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {descCharCount} / 160 حرف (المثالي لمحركات البحث: 120-160)
                </span>
              </div>
              <textarea
                rows={3}
                value={settings.defaultDescription}
                onChange={e => setSettings({ ...settings, defaultDescription: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2D9] bg-[#FDFCF8] text-xs focus:ring-2 focus:ring-[#4A5D4E]/30 focus:border-[#4A5D4E] outline-hidden resize-none leading-relaxed"
              />
            </div>

            {/* Keywords */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C2C2C] block">
                الكلمات المفتاحية العامة (Meta Keywords):
              </label>
              <input
                type="text"
                value={settings.keywords}
                onChange={e => setSettings({ ...settings, keywords: e.target.value })}
                placeholder="أيمن كناني, روايات أيمن كناني, كتب فلسفية, تحميل روايات PDF"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2D9] bg-[#FDFCF8] text-xs focus:ring-2 focus:ring-[#4A5D4E]/30 focus:border-[#4A5D4E] outline-hidden"
              />
              <p className="text-[11px] text-[#6E6A64]">
                افصل بين كل كلمة أو عبارة بفاصلة (، أو ,).
              </p>
            </div>

            {/* Canonical Base URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C2C2C] block">
                الرابط الأساسي المعتمد للموقع (Canonical Base URL):
              </label>
              <input
                type="url"
                value={settings.canonicalBaseUrl}
                onChange={e => setSettings({ ...settings, canonicalBaseUrl: e.target.value })}
                placeholder="https://aymankinani.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2D9] bg-[#FDFCF8] text-xs font-mono focus:ring-2 focus:ring-[#4A5D4E]/30 focus:border-[#4A5D4E] outline-hidden"
              />
              <p className="text-[11px] text-[#6E6A64]">
                يمنع تكرار المحتوى ويحدد لمحركات البحث النطاق الرسمي الأساسي لجميع الروابط.
              </p>
            </div>

            {/* Social & Sharing image */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2C2C] block">
                  معرف حساب تويتر/X (Twitter Handle):
                </label>
                <input
                  type="text"
                  value={settings.twitterHandle}
                  onChange={e => setSettings({ ...settings, twitterHandle: e.target.value })}
                  placeholder="@aymankinani"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2D9] bg-[#FDFCF8] text-xs focus:ring-2 focus:ring-[#4A5D4E]/30 focus:border-[#4A5D4E] outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2C2C] block">
                  اسم المؤلف الأساسي (Author Meta):
                </label>
                <input
                  type="text"
                  value={settings.authorName}
                  onChange={e => setSettings({ ...settings, authorName: e.target.value })}
                  placeholder="أيمن كناني"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2D9] bg-[#FDFCF8] text-xs focus:ring-2 focus:ring-[#4A5D4E]/30 focus:border-[#4A5D4E] outline-hidden"
                />
              </div>
            </div>

            {/* OG Default Image */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C2C2C] block">
                رابط صورة المشاركة الافتراضية (OpenGraph Image URL):
              </label>
              <input
                type="url"
                value={settings.ogDefaultImage}
                onChange={e => setSettings({ ...settings, ogDefaultImage: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2D9] bg-[#FDFCF8] text-xs focus:ring-2 focus:ring-[#4A5D4E]/30 focus:border-[#4A5D4E] outline-hidden"
              />
            </div>
          </div>

          {/* Search Engine Verification Codes (Google Search Console) */}
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-[#2C2C2C] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>إثبات ملكية محركات البحث (Google Search Console & Bing)</span>
            </h3>
            <p className="text-xs text-[#6E6A64] leading-relaxed">
              يمكنك ربط الموقع مباشرة مع Google Search Console لإرسال خريطة الموقع والاطلاع على الكلمات التي يبحث عنها القراء للوصول لكتبك.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C2C2C] block">
                رمز التحقق من Google (Google Site Verification Token):
              </label>
              <input
                type="text"
                value={settings.googleVerificationCode}
                onChange={e => setSettings({ ...settings, googleVerificationCode: e.target.value })}
                placeholder="مثال: abcdef123456xyz أو المحتوى داخل meta tag"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2D9] bg-[#FDFCF8] text-xs font-mono focus:ring-2 focus:ring-[#4A5D4E]/30 focus:border-[#4A5D4E] outline-hidden"
              />
              <p className="text-[11px] text-[#6E6A64]">
                سيتم وضعه تلقائياً في وسم: <code className="bg-[#E5E2D9]/40 px-1 py-0.5 rounded font-mono text-[10px]">&lt;meta name="google-site-verification" content="..." /&gt;</code>
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C2C2C] block">
                رمز التحقق من محرك Bing Webmaster:
              </label>
              <input
                type="text"
                value={settings.bingVerificationCode}
                onChange={e => setSettings({ ...settings, bingVerificationCode: e.target.value })}
                placeholder="رمز التحقق من Bing (msvalidate.01)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2D9] bg-[#FDFCF8] text-xs font-mono focus:ring-2 focus:ring-[#4A5D4E]/30 focus:border-[#4A5D4E] outline-hidden"
              />
            </div>
          </div>

          {/* Structured Data Toggle */}
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-[#2C2C2C]">تفعيل البيانات المنظمة (Schema.org JSON-LD)</h4>
                <p className="text-xs text-[#6E6A64] mt-0.5">
                  يُظهر كتبك في نتائج Google مع صورة الغلاف، التقييم بالنجوم، اسم الكاتب، وروابط التحميل.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableStructuredData}
                  onChange={e => setSettings({ ...settings, enableStructuredData: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8] rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>حفظ وتطبيق إعدادات السيو</span>
          </button>
        </form>

        {/* Live Previews & Sitemap links (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Google Search Preview Card */}
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-600" />
                <h4 className="font-bold text-xs text-[#2C2C2C]">معاينة حية في نتائج بحث Google</h4>
              </div>

              {/* Device Toggle */}
              <div className="flex items-center bg-[#F7F5EE] p-1 rounded-lg border border-[#E5E2D9]">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1 rounded-md text-xs cursor-pointer transition-all ${
                    previewDevice === 'mobile' ? 'bg-[#FFFFFF] text-[#4A5D4E] shadow-xs' : 'text-[#6E6A64]'
                  }`}
                  title="معاينة الجوال"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1 rounded-md text-xs cursor-pointer transition-all ${
                    previewDevice === 'desktop' ? 'bg-[#FFFFFF] text-[#4A5D4E] shadow-xs' : 'text-[#6E6A64]'
                  }`}
                  title="معاينة الكمبيوتر"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Select Novel for preview */}
            {novels.length > 0 && (
              <div className="space-y-1">
                <label className="text-[11px] text-[#6E6A64]">اختر عملاً للمعاينة:</label>
                <select
                  value={selectedPreviewNovelId}
                  onChange={e => setSelectedPreviewNovelId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#E5E2D9] text-xs bg-[#FDFCF8]"
                >
                  {novels.map(n => (
                    <option key={n.id} value={n.id}>
                      {n.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Google SERP Simulated Box */}
            <div
              className={`p-4 rounded-xl border border-gray-200 bg-[#FFFFFF] space-y-1.5 transition-all text-right font-sans ${
                previewDevice === 'mobile' ? 'max-w-sm mx-auto shadow-sm' : 'w-full shadow-xs'
              }`}
              dir="rtl"
            >
              {/* Breadcrumbs / Site info */}
              <div className="flex items-center gap-2 text-xs">
                <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px]">
                  أ
                </div>
                <div className="leading-tight">
                  <span className="text-[12px] font-medium text-[#202124] block">أيمن كناني (Ayman Kinani)</span>
                  <span className="text-[11px] text-[#4d5156] font-mono ltr:inline-block">
                    {currentBaseUrl.replace(/^https?:\/\//, '')} {previewNovel ? `› ${previewNovel.title}` : ''}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h5 className="text-[16px] text-[#1a0dab] hover:underline cursor-pointer font-medium leading-snug pt-0.5">
                {previewTitle}
              </h5>

              {/* Rich snippet stars */}
              {previewNovel && (
                <div className="flex items-center gap-1 text-[11px] text-[#4d5156]">
                  <div className="flex text-amber-500">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span>
                    التقييم: {previewNovel.rating || 5.0} · {previewNovel.ratingCount || 120} صوت · رواية إلكترونية
                  </span>
                </div>
              )}

              {/* Snippet Description */}
              <p className="text-[13px] text-[#4d5156] leading-relaxed line-clamp-2">
                {previewDesc}
              </p>
            </div>
          </div>

          {/* Social Share Preview (WhatsApp / Twitter card) */}
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-emerald-600" />
              <h4 className="font-bold text-xs text-[#2C2C2C]">معاينة مشاركة الرابط (WhatsApp & X)</h4>
            </div>

            <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50 max-w-sm mx-auto">
              <div className="aspect-video bg-gray-200 relative overflow-hidden">
                <img
                  src={previewNovel?.coverImage || settings.ogDefaultImage}
                  alt="OpenGraph preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3 bg-white space-y-1">
                <span className="text-[10px] text-gray-500 uppercase font-mono block">
                  {currentBaseUrl.replace(/^https?:\/\//, '')}
                </span>
                <h6 className="font-bold text-xs text-gray-900 line-clamp-1">{previewTitle}</h6>
                <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">{previewDesc}</p>
              </div>
            </div>
          </div>

          {/* Fast Sitemap & Robots.txt Links Box */}
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs space-y-4">
            <h4 className="font-bold text-xs text-[#2C2C2C] flex items-center gap-2">
              <FileCode className="w-4 h-4 text-[#4A5D4E]" />
              <span>ملفات التوجيه الرسمية المباشرة</span>
            </h4>

            <div className="space-y-3 text-xs">
              {/* Sitemap Item */}
              <div className="p-3 rounded-xl bg-[#F7F5EE] border border-[#E5E2D9] flex items-center justify-between gap-3">
                <div className="truncate">
                  <span className="font-bold block text-gray-900">خريطة الموقع (Sitemap XML)</span>
                  <a
                    href="/sitemap.xml"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 truncate"
                  >
                    <span>{sitemapUrl}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(sitemapUrl, 'sitemap')}
                  className="px-2.5 py-1.5 bg-white hover:bg-gray-100 border border-[#E5E2D9] rounded-lg text-[11px] font-bold shrink-0 cursor-pointer flex items-center gap-1"
                >
                  {copiedSitemap ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSitemap ? 'تم النسخ' : 'نسخ'}</span>
                </button>
              </div>

              {/* Robots Item */}
              <div className="p-3 rounded-xl bg-[#F7F5EE] border border-[#E5E2D9] flex items-center justify-between gap-3">
                <div className="truncate">
                  <span className="font-bold block text-gray-900">ملف التوجيه (Robots TXT)</span>
                  <a
                    href="/robots.txt"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 truncate"
                  >
                    <span>{robotsUrl}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(robotsUrl, 'robots')}
                  className="px-2.5 py-1.5 bg-white hover:bg-gray-100 border border-[#E5E2D9] rounded-lg text-[11px] font-bold shrink-0 cursor-pointer flex items-center gap-1"
                >
                  {copiedRobots ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedRobots ? 'تم النسخ' : 'نسخ'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
