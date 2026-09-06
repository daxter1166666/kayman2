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

export interface NovelSeoStudioProps {
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
  authorName: string;
  setAuthorName: (val: string) => void;

  // Novel context
  novelTitle: string;
  novelAuthor: string;
  novelSynopsis: string;
  novelGenres: string[];
  novelCoverImage: string;
  novelId?: string;
  pdfDownloadUrl?: string;
}

export const NovelSeoStudio: React.FC<NovelSeoStudioProps> = ({
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
  authorName,
  setAuthorName,
  novelTitle,
  novelAuthor,
  novelSynopsis,
  novelGenres,
  novelCoverImage,
  novelId,
  pdfDownloadUrl,
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
    if (!novelTitle.trim()) return 'عنوان الرواية أو العمل الأدبي';
    if (seoSettings.siteTitleTemplate && seoSettings.siteTitleTemplate.includes('%title%')) {
      return seoSettings.siteTitleTemplate.replace('%title%', `رواية ${novelTitle}`);
    }
    return `رواية ${novelTitle} - تأليف ${novelAuthor || 'أيمن كناني'} | ${branding.siteName || 'أيمن كناني'}`;
  }, [metaTitle, novelTitle, novelAuthor, seoSettings.siteTitleTemplate, branding.siteName]);

  // Computed displayed description
  const displayDescription = useMemo(() => {
    if (metaDescription.trim()) return metaDescription.trim();
    if (novelSynopsis.trim()) {
      return novelSynopsis.trim().slice(0, 155) + (novelSynopsis.length > 155 ? '...' : '');
    }
    return `قراءة وتحميل رواية ${novelTitle || 'المؤلف'} كاملة للمؤلف ${novelAuthor || 'أيمن كناني'} أونلاين بصيغة PDF مجاناً.`;
  }, [metaDescription, novelSynopsis, novelTitle, novelAuthor]);

  // Computed display URL
  const displayUrl = useMemo(() => {
    if (canonicalUrl.trim()) return canonicalUrl.trim();
    if (novelId) return `${siteDomain}/?novel=${novelId}`;
    return `${siteDomain}/?novel=example`;
  }, [canonicalUrl, novelId, siteDomain]);

  // Computed display image
  const displayImage = ogImage.trim() || novelCoverImage || seoSettings.ogDefaultImage || '';

  // Calculate SEO Health Score (0 to 100)
  const seoAudit = useMemo(() => {
    let score = 0;
    const checks: { title: string; passed: boolean; tip: string }[] = [];

    // Title Check
    const titleLen = displayTitle.length;
    const titleGood = titleLen >= 30 && titleLen <= 65;
    if (titleGood) score += 25;
    else if (titleLen > 0) score += 10;
    checks.push({
      title: `طول عنوان الميتا (${titleLen} حرف)`,
      passed: titleGood,
      tip: titleLen < 30 ? 'العنوان قصير جداً، يفضل أن يكون بين 30 و 65 حرفاً' : titleLen > 65 ? 'العنوان طويل وقد يُقتطع في Google' : 'طول العنوان مثالي لنتائج البحث',
    });

    // Description Check
    const descLen = displayDescription.length;
    const descGood = descLen >= 110 && descLen <= 165;
    if (descGood) score += 25;
    else if (descLen > 0) score += 12;
    checks.push({
      title: `طول وصف الميتا (${descLen} حرف)`,
      passed: descGood,
      tip: descLen < 110 ? 'الوصف قصير، أضف تفاصيل أكثر لجذب القارئ في Google' : descLen > 165 ? 'الوصف طويل وقد يُقتطع بنقاط (...)' : 'طول الوصف ممتاز وجذاب',
    });

    // Keywords Check
    const kwList = (focusKeywords || '')
      .split(/[,،]/)
      .map(k => k.trim())
      .filter(Boolean);
    const kwGood = kwList.length >= 2;
    if (kwGood) score += 20;
    else if (kwList.length > 0) score += 10;
    checks.push({
      title: `الكلمات المفتاحية المستهدفة (${kwList.length} كلمات)`,
      passed: kwGood,
      tip: kwGood ? 'تم تحديد كلمات دلالية مناسبة' : 'أضف كلمتين مفتاحيتين على الأقل (مثل: رواية خيال، تحميل رواية PDF)',
    });

    // Cover Image Check
    const hasImage = Boolean(displayImage);
    if (hasImage) score += 15;
    checks.push({
      title: 'صورة الغلاف والمشاركة الاجتماعية (OG Image)',
      passed: hasImage,
      tip: hasImage ? 'متوفرة وتضمن ظهور غلاف الرواية في Google Discover والمشاركات' : 'أضف غلاف الرواية لظهور بطاقة المشاركة الغنية',
    });

    // PDF / Rich Content
    const hasPdf = Boolean(pdfDownloadUrl);
    if (hasPdf) score += 15;
    checks.push({
      title: 'رابط التحميل المباشر PDF (Google Schema workExample)',
      passed: hasPdf,
      tip: hasPdf ? 'يساعد محركات البحث على تصنيف الرواية ككتاب إلكتروني EBook قابل للتحميل' : 'إضافة رابط PDF يعزز الفهرسة في نتائج تحميل الكتب',
    });

    return { score: Math.min(score, 100), checks };
  }, [displayTitle, displayDescription, focusKeywords, displayImage, pdfDownloadUrl]);

  // Smart Auto-Generator
  const handleAutoGenerateSeo = () => {
    if (!novelTitle.trim()) {
      alert('يرجى كتابة عنوان الرواية أولاً لتوليد بيانات السيو');
      return;
    }

    // 1. Generate Title (ideal ~50-60 chars)
    const authorStr = novelAuthor.trim() || 'أيمن كناني';
    let generatedTitle = `رواية ${novelTitle.trim()} - للكاتب ${authorStr} | قراءة وتحميل`;
    if (generatedTitle.length > 60) {
      generatedTitle = `رواية ${novelTitle.trim()} - ${authorStr}`;
    }
    setMetaTitle(generatedTitle);

    // 2. Generate Description (ideal ~140-155 chars)
    let cleanSyn = (novelSynopsis || '').replace(/\s+/g, ' ').trim();
    let generatedDesc = '';
    if (cleanSyn) {
      const intro = `قراءة وتحميل رواية "${novelTitle.trim()}" للكاتب ${authorStr}. `;
      const remaining = 155 - intro.length;
      generatedDesc = intro + (cleanSyn.length > remaining ? cleanSyn.slice(0, remaining - 3) + '...' : cleanSyn);
    } else {
      generatedDesc = `اقرأ رواية ${novelTitle.trim()} للكاتب والروائي ${authorStr} كاملة أونلاين مجاناً. تصفح الفصول وحمل نسخة PDF بجودة عالية.`;
    }
    setMetaDescription(generatedDesc);

    // 3. Generate Keywords
    const autoKw = [
      `رواية ${novelTitle.trim()}`,
      `تحميل رواية ${novelTitle.trim()} PDF`,
      `قراءة رواية ${novelTitle.trim()}`,
      novelAuthor.trim() || 'أيمن كناني',
      ...(novelGenres || []),
      'روايات عربية',
      'كتب أدبية'
    ].filter(Boolean);
    setFocusKeywords(Array.from(new Set(autoKw)).join('، '));

    // 4. Set Author
    if (!authorName.trim() && novelAuthor.trim()) {
      setAuthorName(novelAuthor.trim());
    }

    // 5. Set OG Image
    if (!ogImage.trim() && novelCoverImage.trim()) {
      setOgImage(novelCoverImage.trim());
    }

    setToastMsg('تم توليد بيانات السيو المثالية بنجاح بناءً على تفاصيل الرواية!');
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCopySnippetUrl = () => {
    navigator.clipboard.writeText(displayUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-[#FDFCF8] border-2 border-[#4A5D4E]/30 space-y-6 shadow-xs font-cairo">
      {/* Toast */}
      {toastMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header with Title & Auto-Gen Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E2D9] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#4A5D4E]/10 text-[#4A5D4E] flex items-center justify-center">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-amiri font-bold text-base sm:text-lg text-[#2C2C2C] flex items-center gap-2">
              <span>استوديو السيو وفهرسة الرواية (Novel SEO Studio)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#4A5D4E] text-white font-mono font-bold">
                مخصص
              </span>
            </h3>
            <p className="text-xs text-[#6E6A64]">
              خصص وسوم الميتا، كلمات البحث، ومعاينة مظهر الرواية على Google وشبكات التواصل.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAutoGenerateSeo}
          className="px-3.5 py-2 bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8] text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#C88A3B]" />
          <span>توليد سيو ذكي تلقائياً</span>
        </button>
      </div>

      {/* SEO Health Bar & Score */}
      <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E5E2D9] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#2C2C2C]">مؤشر جودة وقوة السيو للرواية:</span>
            <span className={`text-xs font-mono font-black px-2.5 py-0.5 rounded-full ${
              seoAudit.score >= 80 ? 'bg-emerald-100 text-emerald-800' :
              seoAudit.score >= 50 ? 'bg-amber-100 text-amber-800' :
              'bg-rose-100 text-rose-800'
            }`}>
              {seoAudit.score}% {seoAudit.score >= 80 ? 'ممتاز' : seoAudit.score >= 50 ? 'متوسط' : 'يحتاج تحسين'}
            </span>
          </div>
          <span className="text-[11px] text-[#6E6A64]">
            {seoAudit.checks.filter(c => c.passed).length} من {seoAudit.checks.length} معايير مكتملة
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-[#F1EFE9] rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              seoAudit.score >= 80 ? 'bg-emerald-500' :
              seoAudit.score >= 50 ? 'bg-amber-500' :
              'bg-rose-500'
            }`}
            style={{ width: `${seoAudit.score}%` }}
          />
        </div>

        {/* Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#F1EFE9]">
          {seoAudit.checks.map((check, idx) => (
            <div key={idx} className="flex items-start gap-2 text-[11px]">
              {check.passed ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div>
                <span className={`font-bold ${check.passed ? 'text-[#2C2C2C]' : 'text-amber-800'}`}>
                  {check.title}
                </span>
                <span className="text-[#6E6A64] block text-[10px] leading-tight">
                  {check.tip}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live SERP Preview Box */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E2D9] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E2D9] pb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#2C2C2C]">
            <Globe className="w-4 h-4 text-[#4A5D4E]" />
            <span>معاينة حية لشكل الرواية في نتائج بحث Google وشبكات التواصل</span>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#F7F5EE] p-0.5 rounded-lg border border-[#E5E2D9] text-xs">
              <button
                type="button"
                onClick={() => setActivePreview('google')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activePreview === 'google' ? 'bg-[#FFFFFF] text-[#2C2C2C] shadow-2xs' : 'text-[#6E6A64]'
                }`}
              >
                <Search className="w-3 h-3" />
                <span>Google SERP</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePreview('social')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activePreview === 'social' ? 'bg-[#FFFFFF] text-[#2C2C2C] shadow-2xs' : 'text-[#6E6A64]'
                }`}
              >
                <Share2 className="w-3 h-3" />
                <span>مشاركة التواصل</span>
              </button>
            </div>

            {/* Device Toggle (Google SERP only) */}
            {activePreview === 'google' && (
              <div className="flex items-center bg-[#F7F5EE] p-0.5 rounded-lg border border-[#E5E2D9] text-xs">
                <button
                  type="button"
                  onClick={() => setDeviceView('mobile')}
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                    deviceView === 'mobile' ? 'bg-[#FFFFFF] text-[#4A5D4E] shadow-2xs' : 'text-[#6E6A64]'
                  }`}
                  title="معاينة الهاتف المحمول"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceView('desktop')}
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                    deviceView === 'desktop' ? 'bg-[#FFFFFF] text-[#4A5D4E] shadow-2xs' : 'text-[#6E6A64]'
                  }`}
                  title="معاينة الحاسوب"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Google SERP Display */}
        {activePreview === 'google' ? (
          <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E5E2D9] font-sans text-right" dir="rtl">
            <div className={`space-y-1.5 ${deviceView === 'mobile' ? 'max-w-md mx-auto p-3 bg-gray-50/50 rounded-xl border border-gray-200/60' : 'max-w-xl'}`}>
              {/* Site source header */}
              <div className="flex items-center gap-2 text-xs text-[#202124]">
                <div className="w-6 h-6 rounded-full bg-[#4A5D4E] text-[#FDFCF8] flex items-center justify-center font-bold text-[10px] shrink-0">
                  {branding.siteName?.[0] || 'أ'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-medium text-[#202124] truncate">
                    {branding.siteName || 'أيمن كناني'}
                  </div>
                  <div className="text-[11px] text-[#5f6368] truncate font-mono" dir="ltr">
                    {displayUrl}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopySnippetUrl}
                  className="p-1 text-[#5f6368] hover:text-[#202124] rounded cursor-pointer"
                  title="نسخ الرابط"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Title link in Google blue */}
              <h4 className="text-[18px] sm:text-[19px] leading-snug font-normal text-[#1a0dab] hover:underline cursor-pointer">
                {displayTitle}
              </h4>

              {/* Schema Rich Snippet (Ratings & Publication info) */}
              <div className="flex items-center gap-2 text-[12px] text-[#5f6368] font-sans">
                <span className="text-[#e37400] font-bold">★★★★★</span>
                <span>تقييم: 5.0</span>
                <span>•</span>
                <span>تأليف: {authorName.trim() || novelAuthor || 'أيمن كناني'}</span>
                {pdfDownloadUrl && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-700 font-medium">متاح تحميل PDF</span>
                  </>
                )}
              </div>

              {/* Meta Description */}
              <p className="text-[13px] leading-relaxed text-[#4d5156]">
                {displayDescription}
              </p>
            </div>
          </div>
        ) : (
          /* Social Media Card Preview (WhatsApp / X / Facebook) */
          <div className="max-w-md mx-auto bg-[#FDFCF8] rounded-2xl border border-[#E5E2D9] overflow-hidden shadow-sm">
            <div className="aspect-[1.91/1] w-full bg-gray-100 relative overflow-hidden flex items-center justify-center">
              {displayImage ? (
                <img
                  src={displayImage}
                  alt={novelTitle}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4 text-gray-400">
                  <ImageIcon className="w-8 h-8 mx-auto mb-1" />
                  <span className="text-xs">لا توجد صورة مشاركة محددة</span>
                </div>
              )}
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold font-mono">
                OG CARD
              </div>
            </div>
            <div className="p-3.5 bg-white border-t border-gray-100 space-y-1">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-mono block truncate">
                {siteDomain.replace(/^https?:\/\//, '')}
              </span>
              <h5 className="font-bold text-sm text-[#2C2C2C] line-clamp-1">
                {displayTitle}
              </h5>
              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                {displayDescription}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SEO Form Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        {/* 1. Meta Title */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-[#2C2C2C] flex items-center gap-1">
              <span>عنوان الميتا المخصص للرواية (SEO Meta Title)</span>
              <span className="text-[10px] font-normal text-[#6E6A64]">(يظهر باللون الأزرق في Google)</span>
            </label>
            <span className={`text-[11px] font-mono font-bold ${
              metaTitle.length === 0 ? 'text-[#6E6A64]' :
              metaTitle.length >= 30 && metaTitle.length <= 65 ? 'text-emerald-700' :
              'text-amber-700'
            }`}>
              {metaTitle.length}/65 حرف {metaTitle.length >= 30 && metaTitle.length <= 65 ? '✓ مثالي' : ''}
            </span>
          </div>
          <input
            type="text"
            id="novel-seo-meta-title"
            placeholder={`مثال: رواية ${novelTitle || 'البداية'} - ${novelAuthor || 'أيمن كناني'} | قراءة وتحميل PDF`}
            value={metaTitle}
            onChange={e => setMetaTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FFFFFF] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] font-medium"
          />
          <p className="text-[11px] text-[#6E6A64] mt-1">
            إذا تركته فارغاً، سيتم توليده تلقائياً كـ: "رواية {novelTitle || 'اسم الرواية'} - تأليف {novelAuthor || 'أيمن كناني'}".
          </p>
        </div>

        {/* 2. Meta Description */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-[#2C2C2C] flex items-center gap-1">
              <span>وصف الميتا التعريفي في محركات البحث (Meta Description)</span>
              <span className="text-[10px] font-normal text-[#6E6A64]">(الموجز الترويجي أسفل العنوان في Google)</span>
            </label>
            <span className={`text-[11px] font-mono font-bold ${
              metaDescription.length === 0 ? 'text-[#6E6A64]' :
              metaDescription.length >= 110 && metaDescription.length <= 165 ? 'text-emerald-700' :
              'text-amber-700'
            }`}>
              {metaDescription.length}/160 حرف {metaDescription.length >= 110 && metaDescription.length <= 165 ? '✓ مثالي' : ''}
            </span>
          </div>
          <textarea
            id="novel-seo-meta-description"
            rows={3}
            placeholder={`مثال: اقرأ رواية ${novelTitle || 'اسم الرواية'} للكاتب ${novelAuthor || 'أيمن كناني'} كاملة أونلاين مجاناً. تصفح الفصول أو حمّل نسخة PDF...`}
            value={metaDescription}
            onChange={e => setMetaDescription(e.target.value)}
            className="w-full p-3 text-xs rounded-xl bg-[#FFFFFF] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] leading-relaxed font-medium"
          />
          <p className="text-[11px] text-[#6E6A64] mt-1">
            إذا تركته فارغاً، سيستخدم محرك البحث أول 160 حرفاً من نبذة الرواية تلقائياً.
          </p>
        </div>

        {/* 3. Focus Keywords */}
        <div className="md:col-span-2">
          <label className="text-xs font-bold text-[#2C2C2C] block mb-1">
            الكلمات المفتاحية المستهدفة للرواية (Focus Keywords - مفصولة بفواصل)
          </label>
          <div className="relative">
            <input
              type="text"
              id="novel-seo-focus-keywords"
              placeholder="مثال: رواية خيال علمي، تحميل رواية PDF، أيمن كناني، قراءة أونلاين"
              value={focusKeywords}
              onChange={e => setFocusKeywords(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FFFFFF] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E]"
            />
          </div>
          {/* Keyword tags pills */}
          {focusKeywords.trim() && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {focusKeywords.split(/[,،]/).map(k => k.trim()).filter(Boolean).map((kw, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#4A5D4E]/10 text-[#4A5D4E] text-[10px] font-bold border border-[#4A5D4E]/20">
                  <Tag className="w-2.5 h-2.5" />
                  <span>{kw}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 4. Social Sharing Image (OG Image) */}
        <div>
          <label className="text-xs font-bold text-[#2C2C2C] block mb-1">
            رابط صورة المشاركة المخصصة (OG / Social Image)
          </label>
          <input
            type="url"
            id="novel-seo-og-image"
            placeholder="اتركه فارغاً لاستخدام غلاف الرواية تلقائياً"
            value={ogImage}
            onChange={e => setOgImage(e.target.value)}
            className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#FFFFFF] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] font-mono"
            dir="ltr"
          />
          <p className="text-[11px] text-[#6E6A64] mt-1">
            تظهر عند إرسال رابط الرواية في واتساب، تيليغرام، فيسبوك، أو تويتر.
          </p>
        </div>

        {/* 5. Custom Author Schema Name */}
        <div>
          <label className="text-xs font-bold text-[#2C2C2C] block mb-1">
            اسم المؤلف المعتمد في وسوم الميتا و Schema.org
          </label>
          <input
            type="text"
            id="novel-seo-author-name"
            placeholder={novelAuthor || 'أيمن كناني'}
            value={authorName}
            onChange={e => setAuthorName(e.target.value)}
            className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#FFFFFF] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E]"
          />
          <p className="text-[11px] text-[#6E6A64] mt-1">
            المؤلف المعتمد في بيانات الكتاب المنظم (JSON-LD Author).
          </p>
        </div>

        {/* 6. Canonical URL */}
        <div className="md:col-span-2">
          <label className="text-xs font-bold text-[#2C2C2C] block mb-1">
            الرابط الأساسي المعتمد (Canonical URL - اختياري)
          </label>
          <input
            type="url"
            id="novel-seo-canonical-url"
            placeholder={`${siteDomain}/?novel=${novelId || 'id'}`}
            value={canonicalUrl}
            onChange={e => setCanonicalUrl(e.target.value)}
            className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#FFFFFF] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] font-mono"
            dir="ltr"
          />
          <p className="text-[11px] text-[#6E6A64] mt-1">
            يمنع المحتوى المكرر في Google إذا كان للرواية روابط متعددة أو دومين مخصص.
          </p>
        </div>

        {/* 7. No-Index Option */}
        <div className="md:col-span-2 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              id="novel-seo-noindex-checkbox"
              checked={noIndex}
              onChange={e => setNoIndex(e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-rose-600 rounded"
            />
            <div>
              <span className="text-xs font-bold text-amber-950 block">
                استبعاد هذه الرواية من الفهرسة في محركات البحث (noindex, nofollow)
              </span>
              <span className="text-[11px] text-amber-800 leading-relaxed block mt-0.5">
                فعل هذا الخيار فقط إذا كانت الرواية قيد المراجعة أو مسودة خاصة ولا تريد أن تظهر في نتائج Google أو في خريطة الموقع Sitemap.
              </span>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};
