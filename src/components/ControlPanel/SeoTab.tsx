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
  Star,
  TrendingUp,
  Lightbulb,
  Compass,
  FileText
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { seoService } from '../../services/seoService';
import { supabaseService } from '../../services/supabaseService';
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
  const [selectedChapterNovelId, setSelectedChapterNovelId] = useState<string>(novels[0]?.id || 'all');
  const [inspectedChapterId, setInspectedChapterId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveSeoSettings(settings);
    supabaseService.saveSeoSettingsToSupabase(settings);
    seoService.updateHead();
    showToast('تم حفظ وتطبيق إعدادات السيو ومحركات البحث بنجاح ومزامنتها سحابياً!');
    onRefreshData();
  };

  const currentBaseUrl = ((settings?.canonicalBaseUrl) || window.location.origin).replace(/\/$/, '');
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

  const handleGenerateSmartKeywords = () => {
    const bookTitles = novels.map(n => n.title).filter(Boolean);
    const authorKeywords = [
      'أيمن كناني',
      'Ayman Kinani',
      'كتب أيمن كناني',
      'مؤلفات أيمن كناني',
      'تحميل كتب أيمن كناني PDF',
      'روايات أيمن كناني',
      'كتب وروايات عربية مجانية',
      'قراءة أونلاين',
      'كتب فلسفة وفكر',
      'دار نشر أيمن كناني'
    ];
    const combined = Array.from(new Set([...authorKeywords, ...bookTitles])).join('، ');
    setSettings(prev => ({ ...prev, keywords: combined }));
    showToast('تم توليد الكلمات المفتاحية الذكية الأكثر بحثاً في Google!');
  };

  // Preview novel calculation
  const previewNovel = novels.find(n => n.id === selectedPreviewNovelId) || novels[0];
  const template = settings?.siteTitleTemplate || '%title% | الكاتب أيمن كناني';
  const previewTitle = previewNovel?.seo?.metaTitle?.trim()
    ? previewNovel.seo.metaTitle.trim()
    : previewNovel
      ? template.replace('%title%', `كتاب ${previewNovel.title}`)
      : (settings?.defaultTitle || 'الكاتب أيمن كناني');
  const previewDesc = previewNovel?.seo?.metaDescription?.trim()
    || previewNovel?.synopsis?.slice(0, 160)
    || settings?.defaultDescription
    || 'المنصة الرسمية لنشر وتحميل كتب وروايات الكاتب أيمن كناني';
  const descCharCount = (settings?.defaultDescription || '').length;

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
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#2C2C2C] block">
                  الكلمات المفتاحية العامة (Meta Keywords):
                </label>
                <button
                  type="button"
                  onClick={handleGenerateSmartKeywords}
                  className="px-2.5 py-1 rounded-lg bg-[#4A5D4E]/10 hover:bg-[#4A5D4E]/20 text-[#4A5D4E] text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#4A5D4E]/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>توليد واقتراح كلمات مفتاحية ذكية</span>
                </button>
              </div>
              <input
                type="text"
                value={settings.keywords}
                onChange={e => setSettings({ ...settings, keywords: e.target.value })}
                placeholder="أيمن كناني, كتب أيمن كناني, مؤلفات أيمن كناني, كتب فلسفية, تحميل كتب PDF"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2D9] bg-[#FDFCF8] text-xs focus:ring-2 focus:ring-[#4A5D4E]/30 focus:border-[#4A5D4E] outline-hidden"
              />
              <p className="text-[11px] text-[#6E6A64]">
                افصل بين كل كلمة أو عبارة بفاصلة (، أو ,). تشمل اسم المؤلف، أسماء الكتب، ونوع المؤلفات لضمان الفهرسة السريعة.
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

          {/* Google Analytics 4 (GA4) Integration */}
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#2C2C2C]">ربط الموقع مع إحصائيات غوغل (Google Analytics 4)</h4>
                  <p className="text-[11px] text-[#6E6A64]">
                    تتبع عدد الزوار الفعلي، مشاهدات الروايات، وقراءات الفصول، ونقرات تحميل الكتب PDF
                  </p>
                </div>
              </div>

              {settings.googleAnalyticsId?.trim() ? (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>متصل ومفعل</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                  غير مربوط بعد
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C2C2C] flex items-center justify-between">
                <span>معرف قياس Google Analytics (Measurement ID):</span>
                <span className="text-[10px] text-[#6E6A64] font-normal font-mono">يبدأ دائماً بـ G-</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={settings.googleAnalyticsId || ''}
                  onChange={e => setSettings({ ...settings, googleAnalyticsId: e.target.value.trim() })}
                  placeholder="مثال: G-XXXXXXXXXX"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E5E2D9] bg-[#FDFCF8] text-xs font-mono focus:ring-2 focus:ring-[#4A5D4E]/30 focus:border-[#4A5D4E] outline-hidden"
                />
                {settings.googleAnalyticsId?.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      seoService.syncGoogleAnalytics(settings.googleAnalyticsId);
                      seoService.trackEvent('test_ping', { timestamp: new Date().toISOString() });
                      showToast('تم إرسال إشارة اختبار ناجحة إلى Google Analytics 4!');
                    }}
                    className="px-3.5 py-2 bg-[#F7F5EE] hover:bg-[#E5E2D9] text-[#2C2C2C] rounded-xl text-xs font-bold border border-[#E5E2D9] cursor-pointer transition-colors"
                    title="فحص عمل التتبع وإرسال حدث تجريبي"
                  >
                    فحص التتبع
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[#6E6A64] leading-relaxed">
                خطوات الربط: ادخل إلى <a href="https://analytics.google.com" target="_blank" rel="noreferrer" className="text-[#4A5D4E] font-bold underline">Google Analytics</a> › اختر <strong>المسؤول (Admin)</strong> › <strong>تدفقات البيانات (Data Streams)</strong> › اضغط على موقع الويب وانسخ <strong>معرّف القياس (Measurement ID)</strong> وضعه هنا ثم اضغط "حفظ وتطبيق".
              </p>
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

          {/* Google Top Ranking Playbook (دليل تصدر نتائج بحث Google الأولى) */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#FAF8F2] to-[#FFFFFF] border-2 border-[#4A5D4E]/20 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-[#2C2C2C]">
              <div className="w-8 h-8 rounded-xl bg-[#4A5D4E]/10 text-[#4A5D4E] flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm">
                  خارطة طريق تصدر كتبك في نتائج Google الأولى
                </h4>
                <p className="text-[11px] text-[#6E6A64]">
                  خطوات عملية ومجربة لرفع تصنيف مؤلفات وكتب الكاتب أيمن كناني
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {/* Step 1 */}
              <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E2D9] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-[#4A5D4E] text-white text-[11px] font-bold flex items-center justify-center font-mono">
                    1
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    أولوية قصوى
                  </span>
                </div>
                <h5 className="font-bold text-xs text-[#2C2C2C]">
                  تقديم خريطة الموقع لـ Google Search Console
                </h5>
                <p className="text-[11px] text-[#6E6A64] leading-relaxed">
                  انسخ رابط <code className="bg-[#F7F5EE] px-1 py-0.5 rounded font-mono text-[10px]">sitemap.xml</code> أعلاه وقم بإضافته في قسم "Sitemaps" داخل Search Console حتى يتعرف Google على جميع كتبك فوراً.
                </p>
                <a
                  href="https://search.google.com/search-console"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4A5D4E] hover:underline pt-1"
                >
                  <span>فتح Google Search Console</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E2D9] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-[#4A5D4E] text-white text-[11px] font-bold flex items-center justify-center font-mono">
                    2
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    النتائج الغنية
                  </span>
                </div>
                <h5 className="font-bold text-xs text-[#2C2C2C]">
                  التحقق من بيانات النجوم والغلاف (Rich Snippets)
                </h5>
                <p className="text-[11px] text-[#6E6A64] leading-relaxed">
                  يقوم الموقع بحقن بيانات Schema.org تلقائياً لكل كتاب. افحص أي صفحة كتاب في أداة Google للتأكد من ظهور نجوم التقييم وصورة الغلاف في نتائج البحث.
                </p>
                <a
                  href="https://search.google.com/test/rich-results"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4A5D4E] hover:underline pt-1"
                >
                  <span>فحص في Google Rich Results</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E2D9] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-[#4A5D4E] text-white text-[11px] font-bold flex items-center justify-center font-mono">
                    3
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    المحتوى والفهرس
                  </span>
                </div>
                <h5 className="font-bold text-xs text-[#2C2C2C]">
                  إثراء فهارس ونبذة الكتب المباشرة
                </h5>
                <p className="text-[11px] text-[#6E6A64] leading-relaxed">
                  الكتب التي تحتوي على فهرس محتويات يدوي ونبذة غنية بالكلمات الدلالية تتصدر كلمات البحث الطويلة مثل (تحميل كتاب... وقراءة فصول...).
                </p>
                <div className="pt-1 text-[10px] text-[#8E8A83]">
                  نصيحة: احرص على تضمين اسم الكاتب "أيمن كناني" في نبذة كل كتاب.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Novel SEO Status Registry (سجل ومراجعة سيو كل رواية ومؤلف) */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E2D9] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#2C2C2C]">
                فهرس وحالة سيو مؤلفات وروايات الكاتب (Novel SEO Registry)
              </h3>
              <p className="text-[11px] text-[#6E6A64]">
                مراجعة العناوين، الكلمات المفتاحية المستهدفة، وحالة الأرشفة الفردية لكل كتاب على حدة
              </p>
            </div>
          </div>

          <div className="text-xs text-[#6E6A64]">
            إجمالي الأعمال: <strong className="text-[#2C2C2C]">{novels.length}</strong> · سيو مخصص: <strong className="text-emerald-700">{novels.filter(n => n.seo?.metaTitle || n.seo?.metaDescription).length}</strong>
          </div>
        </div>

        {novels.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#6E6A64]">
            لا توجد كتب مضافة بعد لعرض حالة السيو الخاصة بها.
          </div>
        ) : (
          <div className="divide-y divide-[#E5E2D9]">
            {novels.map(novel => {
              const hasCustomSeo = Boolean(novel.seo?.metaTitle || novel.seo?.metaDescription || novel.seo?.focusKeywords);
              const titleTag = novel.seo?.metaTitle || `كتاب ${novel.title} | الكاتب أيمن كناني`;
              const descTag = novel.seo?.metaDescription || novel.synopsis?.slice(0, 140) + '...';
              const kwList = novel.seo?.focusKeywords ? novel.seo.focusKeywords.split(/[,،]/).map(k => k.trim()).filter(Boolean) : (novel.genres || []);

              return (
                <div key={novel.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <img
                      src={novel.coverImage}
                      alt={novel.title}
                      className="w-12 h-16 object-cover rounded-lg border border-[#E5E2D9] shrink-0"
                    />
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-amiri font-bold text-sm text-[#2C2C2C] truncate">
                          {novel.title}
                        </h4>
                        {hasCustomSeo ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            <span>سيو مخصص مكتمل</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F7F5EE] text-[#6E6A64] border border-[#E5E2D9]">
                            سيو تلقائي (Default)
                          </span>
                        )}
                        {novel.seo?.noIndex && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            مستبعد من الفهرسة (noindex)
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-[#1a0dab] font-medium truncate">
                        Google Title: {titleTag}
                      </div>
                      <p className="text-[11px] text-[#6E6A64] line-clamp-1 leading-relaxed">
                        {descTag}
                      </p>

                      <div className="flex flex-wrap items-center gap-1 pt-0.5">
                        <span className="text-[10px] text-[#8E8A83]">الكلمات المستهدفة:</span>
                        {kwList.slice(0, 5).map((kw, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded text-[9px] bg-[#F7F5EE] text-[#4A5D4E] border border-[#E5E2D9]">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPreviewNovelId(novel.id);
                        window.scrollTo({ top: 350, behavior: 'smooth' });
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#4A5D4E] hover:bg-[#4A5D4E]/10 border border-[#E5E2D9] flex items-center gap-1 cursor-pointer transition-colors"
                      title="معاينة ظهور هذا العمل في محرك Google"
                    >
                      <Search className="w-3 h-3" />
                      <span>معاينة SERP</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Chapters SEO Registry & Inspector */}
      {(() => {
        const filteredChapters = chapters.filter(c => 
          selectedChapterNovelId === 'all' ? true : c.novelId === selectedChapterNovelId
        ).sort((a, b) => a.chapterNumber - b.chapterNumber);

        const customSeoCount = chapters.filter(c => Boolean(c.seo?.metaTitle || c.seo?.metaDescription)).length;
        const noIndexCount = chapters.filter(c => Boolean(c.seo?.noIndex)).length;
        const inspectedChapter = chapters.find(c => c.id === inspectedChapterId);
        const inspectedNovel = inspectedChapter ? novels.find(n => n.id === inspectedChapter.novelId) : null;

        return (
          <div className="rounded-2xl bg-[#FFFFFF] border border-[#E5E2D9] p-6 space-y-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E2D9] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4A5D4E]/10 text-[#4A5D4E] flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-amiri font-bold text-lg text-[#2C2C2C] flex items-center gap-2">
                    <span>سجل أرشفة وسيو الفصول الفردية (Chapters SEO Inspector)</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#4A5D4E]/15 text-[#4A5D4E] border border-[#4A5D4E]/30 font-cairo">
                      {chapters.length} فصول
                    </span>
                  </h3>
                  <p className="text-xs text-[#6E6A64] mt-0.5">
                    متابعة جاهزية وسوم السيو لكل فصل، عناوين Google، الكلمات المفتاحية المستهدفة، وحالة الفهرسة
                  </p>
                </div>
              </div>

              {/* Novel Filter Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#6E6A64] font-bold shrink-0">تصفية حسب الرواية:</span>
                <select
                  value={selectedChapterNovelId}
                  onChange={e => setSelectedChapterNovelId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-[#E5E2D9] bg-[#FDFCF8] text-xs font-bold text-[#2C2C2C] focus:ring-1 focus:ring-[#4A5D4E] outline-hidden cursor-pointer"
                >
                  <option value="all">كل الروايات والأعمال ({chapters.length} فصول)</option>
                  {novels.map(n => (
                    <option key={n.id} value={n.id}>
                      {n.title} ({chapters.filter(c => c.novelId === n.id).length} فصل)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-center">
                <div className="text-xl font-bold font-mono text-[#2C2C2C]">{chapters.length}</div>
                <div className="text-[11px] text-[#6E6A64]">إجمالي الفصول</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center">
                <div className="text-xl font-bold font-mono text-emerald-800">{customSeoCount}</div>
                <div className="text-[11px] text-emerald-800 font-bold">فصول بسيو مخصص</div>
              </div>
              <div className="p-3 rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-center">
                <div className="text-xl font-bold font-mono text-[#6E6A64]">{chapters.length - customSeoCount}</div>
                <div className="text-[11px] text-[#6E6A64]">فصول بسيو تلقائي</div>
              </div>
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-center">
                <div className="text-xl font-bold font-mono text-amber-800">{noIndexCount}</div>
                <div className="text-[11px] text-amber-800">مستبعدة (noindex)</div>
              </div>
            </div>

            {/* Inspected Chapter Modal / Box */}
            {inspectedChapter && inspectedNovel && (
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F7F5EE] border-2 border-[#4A5D4E]/30 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#4A5D4E]" />
                    <span className="font-bold text-xs text-[#2C2C2C]">
                      معاينة نتيجة بحث Google للفصل {inspectedChapter.chapterNumber}: "{inspectedChapter.title}"
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInspectedChapterId(null)}
                    className="text-xs text-[#6E6A64] hover:text-[#2C2C2C] font-bold cursor-pointer"
                  >
                    إغلاق المعاينة ✕
                  </button>
                </div>

                {/* Google Snippet */}
                <div className="p-4 rounded-xl bg-white border border-[#E5E2D9] space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-5 h-5 rounded-full bg-[#4A5D4E] text-white flex items-center justify-center text-[10px] font-bold">
                      أ
                    </div>
                    <div className="text-[11px] text-[#5f6368] font-mono truncate" dir="ltr">
                      {currentBaseUrl.replace(/^https?:\/\//, '')}/?novel={inspectedNovel.id}&amp;chapter={inspectedChapter.id}
                    </div>
                  </div>
                  <h4 className="text-[#1a0dab] hover:underline text-sm font-medium font-sans" dir="rtl">
                    {inspectedChapter.seo?.metaTitle?.trim() || `${inspectedChapter.title} - رواية ${inspectedNovel.title} | ${inspectedNovel.author || 'أيمن كناني'}`}
                  </h4>
                  <p className="text-[12px] text-[#4d5156] leading-relaxed font-sans" dir="rtl">
                    <span className="text-[#70757a] text-[11px] ml-1">قبل أيام — </span>
                    {inspectedChapter.seo?.metaDescription?.trim() || `قراءة ${inspectedChapter.title} من رواية ${inspectedNovel.title} للكاتب ${inspectedNovel.author || 'أيمن كناني'}. ${inspectedChapter.content.replace(/<[^>]+>/g, ' ').slice(0, 130)}...`}
                  </p>
                </div>
              </div>
            )}

            {/* Chapters List */}
            {filteredChapters.length === 0 ? (
              <div className="text-center py-8 text-[#6E6A64] text-xs italic">
                لا توجد فصول مطابقة لهذا الاختيار.
              </div>
            ) : (
              <div className="divide-y divide-[#E5E2D9]">
                {filteredChapters.map(ch => {
                  const parentNovel = novels.find(n => n.id === ch.novelId);
                  const hasCustom = Boolean(ch.seo?.metaTitle || ch.seo?.metaDescription);
                  const titleTag = ch.seo?.metaTitle?.trim() || `${ch.title} - رواية ${parentNovel?.title || ''} | ${parentNovel?.author || 'أيمن كناني'}`;
                  const descTag = ch.seo?.metaDescription?.trim() || ch.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 140) + '...';

                  return (
                    <div key={ch.id} className="py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:bg-[#FDFCF8] px-2 rounded-xl transition-colors">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#4A5D4E] bg-[#4A5D4E]/10 px-2 py-0.5 rounded">
                            فصل {ch.chapterNumber}
                          </span>
                          <h5 className="font-bold text-xs text-[#2C2C2C]">
                            {ch.title}
                          </h5>
                          {parentNovel && (
                            <span className="text-[11px] text-[#8E8A83]">
                              ({parentNovel.title})
                            </span>
                          )}
                          {ch.seo?.noIndex ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              مستبعد noindex
                            </span>
                          ) : hasCustom ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                              <span>سيو مخصص</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#F7F5EE] text-[#6E6A64] border border-[#E5E2D9]">
                              تلقائي
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-[#1a0dab] font-medium truncate">
                          {titleTag}
                        </div>
                        <p className="text-[11px] text-[#6E6A64] line-clamp-1 leading-relaxed">
                          {descTag}
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center gap-2 self-end md:self-center">
                        <button
                          type="button"
                          onClick={() => setInspectedChapterId(inspectedChapterId === ch.id ? null : ch.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#4A5D4E] hover:bg-[#4A5D4E]/10 border border-[#E5E2D9] flex items-center gap-1 cursor-pointer transition-colors"
                          title="معاينة شكل نتيجة هذا الفصل في محرك بحث Google"
                        >
                          <Search className="w-3 h-3" />
                          <span>{inspectedChapterId === ch.id ? 'إخفاء' : 'معاينة Google'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};
