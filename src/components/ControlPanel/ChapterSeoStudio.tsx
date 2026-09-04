import React, { useState, useMemo } from 'react';
import {
  Search,
  Globe,
  Share2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Monitor,
  Copy,
  Check,
  Tag,
  ShieldAlert,
  HelpCircle,
  BookOpen,
  Image as ImageIcon
} from 'lucide-react';
import { storageService } from '../../services/storageService';

export interface ChapterSeoStudioProps {
  metaTitle: string;
  setMetaTitle: (val: string) => void;
  metaDescription: string;
  setMetaDescription: (val: string) => void;
  focusKeywords: string;
  setFocusKeywords: (val: string) => void;
  canonicalUrl: string;
  setCanonicalUrl: (val: string) => void;
  ogImage: string;
  setOgImage: (val: string) => void;
  noIndex: boolean;
  setNoIndex: (val: boolean) => void;

  // Chapter & Novel context
  chapterNumber: number;
  chapterTitle: string;
  chapterContent: string;
  novelTitle: string;
  novelAuthor: string;
  novelSlug?: string;
  novelCoverImage?: string;
  novelBannerImage?: string;
  novelId?: string;
  chapterId?: string;
}

export const ChapterSeoStudio: React.FC<ChapterSeoStudioProps> = ({
  metaTitle,
  setMetaTitle,
  metaDescription,
  setMetaDescription,
  focusKeywords,
  setFocusKeywords,
  canonicalUrl,
  setCanonicalUrl,
  ogImage,
  setOgImage,
  noIndex,
  setNoIndex,
  chapterNumber,
  chapterTitle,
  chapterContent,
  novelTitle,
  novelAuthor,
  novelSlug,
  novelCoverImage,
  novelBannerImage,
  novelId,
  chapterId,
}) => {
  const [activePreview, setActivePreview] = useState<'google' | 'social'>('google');
  const [deviceView, setDeviceView] = useState<'mobile' | 'desktop'>('mobile');
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const seoSettings = storageService.getSeoSettings();
  const branding = storageService.getSiteBranding();
  const siteDomain = (seoSettings.canonicalBaseUrl || 'https://aymankinani.com').replace(/\/$/, '');

  // Computed displayed title (custom or fallback)
  const displayTitle = useMemo(() => {
    if (metaTitle.trim()) return metaTitle.trim();
    const chLabel = chapterTitle.trim() ? chapterTitle.trim() : `الفصل ${chapterNumber || 1}`;
    const nLabel = novelTitle.trim() ? `رواية ${novelTitle.trim()}` : 'رواية أدبية';
    const author = novelAuthor.trim() || 'أيمن كناني';
    return `${chLabel} - ${nLabel} | ${author}`;
  }, [metaTitle, chapterTitle, chapterNumber, novelTitle, novelAuthor]);

  // Clean chapter excerpt for description fallback
  const cleanExcerpt = useMemo(() => {
    return chapterContent
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }, [chapterContent]);

  // Computed displayed description
  const displayDescription = useMemo(() => {
    if (metaDescription.trim()) return metaDescription.trim();
    const chLabel = chapterTitle.trim() ? chapterTitle.trim() : `الفصل ${chapterNumber || 1}`;
    const nLabel = novelTitle.trim() ? `رواية ${novelTitle.trim()}` : 'الرواية';
    const author = novelAuthor.trim() || 'أيمن كناني';
    if (cleanExcerpt) {
      const excerptSnippet = cleanExcerpt.slice(0, 110) + (cleanExcerpt.length > 110 ? '...' : '');
      return `قراءة ${chLabel} من ${nLabel} للكاتب ${author}. ${excerptSnippet} تابع الأحداث كاملة مجاناً.`;
    }
    return `قراءة كاملة ومباشرة لـ ${chLabel} من ${nLabel} للكاتب ${author} بجودة عالية وبدون إعلانات مزعجة.`;
  }, [metaDescription, cleanExcerpt, chapterTitle, chapterNumber, novelTitle, novelAuthor]);

  // Computed display URL
  const displayUrl = useMemo(() => {
    if (canonicalUrl.trim()) return canonicalUrl.trim();
    if (novelId && chapterId) {
      return `${siteDomain}/?novel=${novelId}&chapter=${chapterId}`;
    }
    return `${siteDomain}/novel/${novelSlug || 'novel'}/chapter-${chapterNumber || 1}`;
  }, [canonicalUrl, siteDomain, novelId, chapterId, novelSlug, chapterNumber]);

  // Computed share image
  const displayImage = useMemo(() => {
    return ogImage.trim() || novelBannerImage || novelCoverImage || seoSettings.ogDefaultImage || 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&auto=format&fit=crop&q=80';
  }, [ogImage, novelBannerImage, novelCoverImage, seoSettings.ogDefaultImage]);

  // Metric status counters
  const titleLen = metaTitle.length;
  const descLen = metaDescription.length;

  const getTitleStatus = () => {
    if (titleLen === 0) return { color: 'text-[#6E6A64]', label: 'يتم استخدام العنوان التلقائي' };
    if (titleLen < 30) return { color: 'text-amber-600', label: 'قصير نسبياً (المثالي 40-60 حرفاً)' };
    if (titleLen <= 60) return { color: 'text-emerald-700 font-bold', label: 'طول مثالي لـ Google' };
    return { color: 'text-rose-600', label: 'طويل، قد يُقتطع جزء منه في شاشات الجوال' };
  };

  const getDescStatus = () => {
    if (descLen === 0) return { color: 'text-[#6E6A64]', label: 'يتم استخراج مقتطف تلقائي من بداية الفصل' };
    if (descLen < 80) return { color: 'text-amber-600', label: 'قصير (المثالي 120-160 حرفاً لنتائج Google)' };
    if (descLen <= 160) return { color: 'text-emerald-700 font-bold', label: 'طول ممتاز وجذاب للمشاهد' };
    return { color: 'text-rose-600', label: 'طويل جداً (أكثر من 160 حرفاً)' };
  };

  const titleStatus = getTitleStatus();
  const descStatus = getDescStatus();

  // Smart Auto-Generator for Chapter SEO
  const handleAutoGenerate = () => {
    const chName = chapterTitle.trim() || `الفصل ${chapterNumber || 1}`;
    const nName = novelTitle.trim() || 'الرواية';
    const author = novelAuthor.trim() || 'أيمن كناني';

    // 1. Auto Meta Title
    const generatedTitle = `قراءة ${chName} - رواية ${nName} | ${author}`;
    setMetaTitle(generatedTitle.slice(0, 60));

    // 2. Auto Meta Description focused on key plot points/excerpt
    let dramaticSnippet = '';
    if (cleanExcerpt) {
      // Find a sentence or two
      const sentences = cleanExcerpt.split(/[.!?؟]\s+/).filter(Boolean);
      dramaticSnippet = sentences.slice(0, 2).join('. ');
      if (dramaticSnippet.length > 80) dramaticSnippet = dramaticSnippet.slice(0, 80) + '...';
    }

    let generatedDesc = `قراءة الفصل ${chapterNumber || 1}: ${chName} من رواية ${nName} بقلم ${author}.`;
    if (dramaticSnippet) {
      generatedDesc += ` ${dramaticSnippet}`;
    }
    generatedDesc += ' استمتع بقراءة الأحداث كاملة مجاناً.';
    setMetaDescription(generatedDesc.slice(0, 160));

    // 3. Auto Focus Keywords
    const keywordsArray = [
      `فصل ${chapterNumber || 1}`,
      chName,
      `أحداث فصل ${chapterNumber || 1}`,
      `رواية ${nName}`,
      `قراءة رواية ${nName}`,
      author,
      'قراءة أونلاين',
      'فصول الرواية'
    ];
    setFocusKeywords(keywordsArray.join('، '));

    setToastMsg('تم توليد وتنسيق وسوم السيو الخاصة بهذا الفصل بنجاح!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(displayUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="rounded-2xl bg-[#FDFCF8] border border-[#E5E2D9] p-5 sm:p-6 space-y-6 text-[#2C2C2C] font-cairo">
      {/* Header with smart generate button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E2D9] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4A5D4E]/10 text-[#4A5D4E] flex items-center justify-center font-bold">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm sm:text-base text-[#2C2C2C]">
                استوديو سيو الفصل (Chapter-Level SEO Studio)
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#4A5D4E]/15 text-[#4A5D4E] border border-[#4A5D4E]/30">
                أرشفة Google متقدمة
              </span>
            </div>
            <p className="text-[11px] text-[#6E6A64] mt-0.5">
              تخصيص عنوان ووصف مستقل لهذا الفصل لاستهداف عمليات البحث المباشرة عن أحداثه، شخصياته، وعقدته الأدبية
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAutoGenerate}
          className="px-3.5 py-2 rounded-xl bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8] text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shrink-0"
          title="توليد عنوان جذاب ووصف وكلمات دلالية تلقائياً من نص وعنوان الفصل"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>توليد سيو ذكي للفصل</span>
        </button>
      </div>

      {toastMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* SEO Meta Title */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-[#2C2C2C] flex items-center gap-1.5">
                <span>عنوان الفصل لمحركات البحث (SEO Meta Title)</span>
                <span className="text-[10px] text-[#8E8A83] font-normal">(يظهر باللون الأزرق في Google)</span>
              </label>
              <span className={`font-mono text-[11px] ${titleLen > 60 ? 'text-rose-600 font-bold' : 'text-[#6E6A64]'}`}>
                {titleLen} / 60 حرف
              </span>
            </div>
            <input
              type="text"
              value={metaTitle}
              onChange={e => setMetaTitle(e.target.value)}
              placeholder={`مثال: قراءة الفصل ${chapterNumber || 1}: ${chapterTitle || 'العنوان'} - رواية ${novelTitle || 'الرواية'} | أيمن كناني`}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] text-xs focus:ring-2 focus:ring-[#4A5D4E]/30 focus:border-[#4A5D4E] outline-hidden"
            />
            <p className={`text-[11px] ${titleStatus.color}`}>
              {titleStatus.label}
            </p>
          </div>

          {/* SEO Meta Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-[#2C2C2C] flex items-center gap-1.5">
                <span>وصف الفصل في نتائج البحث (Meta Description)</span>
                <span className="text-[10px] text-[#8E8A83] font-normal">(يلخص أحداث وعقدة الفصل لجذب القارئ)</span>
              </label>
              <span className={`font-mono text-[11px] ${descLen > 160 ? 'text-rose-600 font-bold' : 'text-[#6E6A64]'}`}>
                {descLen} / 160 حرف
              </span>
            </div>
            <textarea
              rows={3}
              value={metaDescription}
              onChange={e => setMetaDescription(e.target.value)}
              placeholder="مثال: يواجه الأبطال في هذا الفصل مصيرهم الغامض في أبراج القلعة المظلمة بعد كشف اللغز القديم. اقرأ أحداث الفصل كاملة مجاناً أونلاين..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] text-xs leading-relaxed focus:ring-2 focus:ring-[#4A5D4E]/30 focus:border-[#4A5D4E] outline-hidden resize-none"
            />
            <p className={`text-[11px] ${descStatus.color}`}>
              {descStatus.label}
            </p>
          </div>

          {/* Focus Keywords */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-[#2C2C2C] flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-[#4A5D4E]" />
                <span>الكلمات المفتاحية المستهدفة لأحداث الفصل (Focus Keywords)</span>
              </label>
              <span className="text-[10px] text-[#8E8A83]">مفصولة بفواصل (،)</span>
            </div>
            <input
              type="text"
              value={focusKeywords}
              onChange={e => setFocusKeywords(e.target.value)}
              placeholder={`مثال: فصل ${chapterNumber || 1}, ${chapterTitle || 'عنوان الفصل'}, أحداث رواية ${novelTitle || 'الرواية'}, قراءة مباشرة`}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] text-xs focus:ring-2 focus:ring-[#4A5D4E]/30 focus:border-[#4A5D4E] outline-hidden"
            />
            {focusKeywords.trim() && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {focusKeywords.split(/[,،]/).map((k, i) => {
                  const cleaned = k.trim();
                  if (!cleaned) return null;
                  return (
                    <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-[#FFFFFF] border border-[#E5E2D9] text-[#4A5D4E] font-medium">
                      #{cleaned}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Advanced collapsible settings: Canonical URL, OG Image, NoIndex */}
          <div className="pt-2 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* OG Share Image */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2C2C2C] flex items-center gap-1">
                  <ImageIcon className="w-3 h-3 text-[#4A5D4E]" />
                  <span>صورة المشاركة لهذا الفصل (OG Image)</span>
                </label>
                <input
                  type="url"
                  value={ogImage}
                  onChange={e => setOgImage(e.target.value)}
                  placeholder="رابط صورة خاصة بمشهد الفصل (اختياري)"
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] text-xs font-mono focus:ring-2 focus:ring-[#4A5D4E]/30 focus:border-[#4A5D4E] outline-hidden"
                />
              </div>

              {/* Custom Canonical URL */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2C2C2C] flex items-center gap-1">
                  <Globe className="w-3 h-3 text-[#4A5D4E]" />
                  <span>الرابط الأساسي المخصص (Canonical URL)</span>
                </label>
                <input
                  type="url"
                  value={canonicalUrl}
                  onChange={e => setCanonicalUrl(e.target.value)}
                  placeholder="اتركه فارغاً للاستخدام التلقائي"
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] text-xs font-mono focus:ring-2 focus:ring-[#4A5D4E]/30 focus:border-[#4A5D4E] outline-hidden"
                />
              </div>
            </div>

            {/* NoIndex Toggle */}
            <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E2D9] flex items-start gap-3">
              <input
                type="checkbox"
                id="chapter-no-index"
                checked={noIndex}
                onChange={e => setNoIndex(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-[#E5E2D9] text-[#4A5D4E] focus:ring-[#4A5D4E] cursor-pointer"
              />
              <label htmlFor="chapter-no-index" className="cursor-pointer text-xs space-y-0.5">
                <span className="font-bold text-[#2C2C2C] flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-700 inline" />
                  <span>استبعاد هذا الفصل من الفهرسة في محركات البحث (noindex)</span>
                </span>
                <p className="text-[11px] text-[#6E6A64] leading-relaxed">
                  فعّل هذا الخيار إذا كان هذا الفصل مسودة خاصة، فصلاً تجريبياً، أو ملاحظة للكاتب لا ترغب في ظهورها في نتائج Google.
                </p>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Real-time Previews (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-2">
            <div className="flex items-center gap-1 bg-[#FFFFFF] p-1 rounded-xl border border-[#E5E2D9]">
              <button
                type="button"
                onClick={() => setActivePreview('google')}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  activePreview === 'google'
                    ? 'bg-[#4A5D4E] text-[#FDFCF8]'
                    : 'text-[#6E6A64] hover:text-[#2C2C2C]'
                }`}
              >
                <Search className="w-3 h-3" />
                <span>معاينة Google</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePreview('social')}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  activePreview === 'social'
                    ? 'bg-[#4A5D4E] text-[#FDFCF8]'
                    : 'text-[#6E6A64] hover:text-[#2C2C2C]'
                }`}
              >
                <Share2 className="w-3 h-3" />
                <span>معاينة المشاركة</span>
              </button>
            </div>

            {activePreview === 'google' && (
              <div className="flex items-center gap-1 text-[#6E6A64]">
                <button
                  type="button"
                  onClick={() => setDeviceView('mobile')}
                  className={`p-1.5 rounded-lg border border-[#E5E2D9] cursor-pointer transition-colors ${
                    deviceView === 'mobile' ? 'bg-[#4A5D4E] text-white' : 'bg-white hover:bg-[#F7F5EE]'
                  }`}
                  title="معاينة شاشات الجوال"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceView('desktop')}
                  className={`p-1.5 rounded-lg border border-[#E5E2D9] cursor-pointer transition-colors ${
                    deviceView === 'desktop' ? 'bg-[#4A5D4E] text-white' : 'bg-white hover:bg-[#F7F5EE]'
                  }`}
                  title="معاينة أجهزة الكمبيوتر"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Google Search Result Mockup */}
          {activePreview === 'google' && (
            <div className={`p-4 rounded-2xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs space-y-2.5 ${deviceView === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
              <div className="flex items-center justify-between text-[11px] text-[#6E6A64] pb-1 border-b border-[#F7F5EE]">
                <span className="font-bold">شكل النتيجة في Google:</span>
                <span className="font-mono text-[10px]">{deviceView === 'mobile' ? 'Mobile Snippet' : 'Desktop Snippet'}</span>
              </div>

              {/* Breadcrumbs */}
              <div className="flex items-center gap-2 text-xs">
                <div className="w-5 h-5 rounded-full bg-[#4A5D4E] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  {branding.siteName?.[0] || 'أ'}
                </div>
                <div className="min-w-0 flex-1 leading-tight font-sans text-right">
                  <div className="text-[12px] text-[#202124] font-medium truncate">
                    {branding.siteName || 'أيمن كناني'}
                  </div>
                  <div className="text-[10px] text-[#5f6368] font-mono truncate" dir="ltr">
                    {displayUrl.replace(/^https?:\/\//, '')}
                  </div>
                </div>
              </div>

              {/* Clickable Blue Google Title */}
              <h4 className="text-[#1a0dab] hover:underline text-sm font-medium leading-snug cursor-pointer font-sans" dir="rtl">
                {displayTitle}
              </h4>

              {/* Snippet Description */}
              <p className="text-[12px] text-[#4d5156] leading-relaxed line-clamp-3 font-sans" dir="rtl">
                <span className="text-[#70757a] text-[11px] ml-1">قبل ساعات — </span>
                {displayDescription}
              </p>

              {/* Quick Actions / Link Copy */}
              <div className="pt-2 flex items-center justify-between text-[10px] text-[#8E8A83] border-t border-[#F7F5EE]">
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Schema Article مدعوم</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="hover:text-[#2C2C2C] flex items-center gap-1 cursor-pointer font-medium"
                >
                  {copiedUrl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedUrl ? 'تم النسخ!' : 'نسخ الرابط'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Social Card Mockup */}
          {activePreview === 'social' && (
            <div className="rounded-2xl bg-[#FFFFFF] border border-[#E5E2D9] overflow-hidden shadow-xs">
              <div className="relative aspect-16/9 bg-[#2C2C2C] overflow-hidden">
                <img
                  src={displayImage}
                  alt={displayTitle}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3">
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#4A5D4E] text-white w-fit mb-1">
                    فصل {chapterNumber || 1}
                  </span>
                  <p className="text-white text-xs font-bold line-clamp-1">
                    {chapterTitle || 'عنوان الفصل'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 space-y-1 bg-[#FDFCF8]">
                <div className="text-[10px] text-[#6E6A64] font-mono uppercase tracking-wider">
                  {siteDomain.replace(/^https?:\/\//, '')}
                </div>
                <h5 className="font-bold text-xs text-[#2C2C2C] line-clamp-1">
                  {displayTitle}
                </h5>
                <p className="text-[11px] text-[#6E6A64] line-clamp-2 leading-relaxed">
                  {displayDescription}
                </p>
              </div>
            </div>
          )}

          {/* Pro-Tips Card */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[11px] text-amber-950">
              <HelpCircle className="w-3.5 h-3.5 text-amber-800 shrink-0" />
              <span>فائدة سيو الفصول الفردية في زيادة القراء:</span>
            </div>
            <p className="text-[11px] text-amber-900/90 leading-relaxed">
              الكثير من القرّاء يبحثون في Google عن عناوين فصول معينة (مثل: <em>"مواجهة القصر في رواية كذا"</em> أو <em>"نهاية الفصل 10"</em>). تخصيص وصف وعنوان فريد للفصل يجعله يظهر في نتائج البحث الأولى ويجلب آلاف الزيارات المباشرة إلى موقعك دون وساطة منصات خارجية!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
