import React, { useState, useEffect } from 'react';
import { Novel, NovelSeoMeta, TableOfContentItem, Chapter } from '../../types';
import { storageService } from '../../services/storageService';
import { supabaseService } from '../../services/supabaseService';
import { seoService } from '../../services/seoService';
import { DEWEY_DECIMAL_CATEGORIES, formatDeweyDisplay } from '../../utils/deweyDecimal';
import {
  BookOpen,
  Search,
  Globe,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Eye,
  Smartphone,
  Monitor,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  ExternalLink,
  Link,
  Layers,
  FileText
} from 'lucide-react';

interface NovelSeoStudioProps {
  novels: Novel[];
  chapters?: Chapter[];
  onRefreshData: () => void;
  initialNovelId?: string;
}

export const NovelSeoStudio: React.FC<NovelSeoStudioProps> = ({
  novels,
  chapters = [],
  onRefreshData,
  initialNovelId,
}) => {
  const [selectedNovelId, setSelectedNovelId] = useState<string>(
    initialNovelId || novels[0]?.id || ''
  );
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [notification, setNotification] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [copiedTocId, setCopiedTocId] = useState<string | null>(null);

  // Form states for the selected novel's SEO
  const currentNovel = novels.find(n => n.id === selectedNovelId);

  const [metaTitle, setMetaTitle] = useState<string>('');
  const [metaDescription, setMetaDescription] = useState<string>('');
  const [focusKeywords, setFocusKeywords] = useState<string>('');
  const [canonicalUrl, setCanonicalUrl] = useState<string>('');
  const [ogImage, setOgImage] = useState<string>('');
  const [authorName, setAuthorName] = useState<string>('');
  const [noIndex, setNoIndex] = useState<boolean>(false);
  const [structuredDataType, setStructuredDataType] = useState<'Book' | 'CreativeWork' | 'Article'>('Book');
  const [tableOfContents, setTableOfContents] = useState<TableOfContentItem[]>([]);
  const [newTocTitle, setNewTocTitle] = useState<string>('');
  const [newTocUrl, setNewTocUrl] = useState<string>('');
  const [deweyDecimal, setDeweyDecimal] = useState<string>('');
  const [deweyCategoryName, setDeweyCategoryName] = useState<string>('');

  // Load SEO fields whenever selected novel changes
  useEffect(() => {
    if (currentNovel) {
      const seo = currentNovel.seo || {};
      setMetaTitle(seo.metaTitle || '');
      setMetaDescription(seo.metaDescription || '');
      setFocusKeywords(seo.focusKeywords || (currentNovel.tags || []).join('، '));
      setCanonicalUrl(seo.canonicalUrl || '');
      setOgImage(seo.ogImage || currentNovel.coverImage || '');
      setAuthorName(seo.authorName || currentNovel.author || 'أيمن كناني');
      setNoIndex(Boolean(seo.noIndex));
      setStructuredDataType(seo.structuredDataType || 'Book');
      setTableOfContents(currentNovel.tableOfContents || seo.tableOfContents || []);
      setDeweyDecimal(currentNovel.deweyDecimal || seo.deweyDecimal || '');
      setDeweyCategoryName(currentNovel.deweyCategoryName || seo.deweyCategoryName || '');
    }
  }, [selectedNovelId, currentNovel]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleCopyTocUrl = (item: TableOfContentItem) => {
    const urlToCopy = item.url || (item.chapterId ? `${window.location.origin}/?novel=${currentNovel?.id}&chapter=${item.chapterId}` : window.location.href);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(urlToCopy);
      setCopiedTocId(item.id);
      setTimeout(() => setCopiedTocId(null), 2000);
    }
  };

  const handleAutoGenerate = () => {
    if (!currentNovel) return;
    const novelChapters = chapters.filter(c => c.novelId === currentNovel.id);
    const autoSeo = seoService.generateNovelAutoSeo(currentNovel, novelChapters);

    setMetaTitle(autoSeo.metaTitle || '');
    setMetaDescription(autoSeo.metaDescription || '');
    setFocusKeywords(autoSeo.focusKeywords || '');
    setCanonicalUrl(autoSeo.canonicalUrl || '');
    setOgImage(autoSeo.ogImage || currentNovel.bannerImage || currentNovel.coverImage || '');
    setAuthorName(autoSeo.authorName || currentNovel.author || 'أيمن كناني');
    setNoIndex(false);
    if (autoSeo.tableOfContents && autoSeo.tableOfContents.length > 0) {
      setTableOfContents(autoSeo.tableOfContents);
    }
    if (autoSeo.deweyDecimal) {
      setDeweyDecimal(autoSeo.deweyDecimal);
      setDeweyCategoryName(autoSeo.deweyCategoryName || '');
    }

    showToast('تم توليد وتحديث سيو الرواية وفهرس الفصول والروابط تلقائياً! يمكنك تعديل أي حقل.');
  };

  const handleAddTocItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTocTitle.trim()) return;
    const newItem: TableOfContentItem = {
      id: `toc-${Date.now()}`,
      title: newTocTitle.trim(),
      anchor: `section-${tableOfContents.length + 1}`,
      level: 1,
      url: newTocUrl.trim() || undefined,
    };
    setTableOfContents([...tableOfContents, newItem]);
    setNewTocTitle('');
    setNewTocUrl('');
  };

  const handleRemoveTocItem = (id: string) => {
    setTableOfContents(tableOfContents.filter(t => t.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentNovel) return;

    setIsSaving(true);
    const seoData: NovelSeoMeta = {
      metaTitle: metaTitle.trim() || undefined,
      metaDescription: metaDescription.trim() || undefined,
      focusKeywords: focusKeywords.trim() || undefined,
      canonicalUrl: canonicalUrl.trim() || undefined,
      ogImage: ogImage.trim() || undefined,
      authorName: authorName.trim() || undefined,
      noIndex,
      structuredDataType,
      tableOfContents,
      deweyDecimal: deweyDecimal.trim() || undefined,
      deweyCategoryName: deweyCategoryName.trim() || undefined,
    };

    try {
      const updated = storageService.updateNovel(currentNovel.id, {
        seo: seoData,
        tableOfContents,
        deweyDecimal: deweyDecimal.trim() || undefined,
        deweyCategoryName: deweyCategoryName.trim() || undefined,
      });

      if (updated) {
        await supabaseService.saveNovelToSupabase(updated);
      }

      showToast(`تم حفظ وتطبيق سيو رواية "${currentNovel.title}" ومزامنته سحابياً بنجاح!`);
      onRefreshData();
    } catch (err) {
      console.error('Error saving novel SEO:', err);
      showToast('حدث خطأ أثناء حفظ السيو، يرجى المحاولة ثانية.');
    } finally {
      setIsSaving(false);
    }
  };

  // Live preview calculations
  const defaultSiteUrl = (storageService.getSeoSettings().canonicalBaseUrl || window.location.origin).replace(/\/$/, '');
  const previewUrl = canonicalUrl || `${defaultSiteUrl}/?novel=${currentNovel?.id || ''}`;
  const displayTitle = metaTitle || (currentNovel ? `رواية ${currentNovel.title} | بقلم ${currentNovel.author}` : 'عنوان الرواية في محركات البحث');
  const displayDescription = metaDescription || (currentNovel?.synopsis ? currentNovel.synopsis.slice(0, 155) : 'وصف الكتاب في نتائج بحث جوجل...');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {notification && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header and Novel Switcher */}
      <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-amiri font-bold text-xl text-[#2C2C2C] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#4A5D4E]" />
            <span>سيو المؤلفات والكتب (Novel & Book SEO Studio)</span>
          </h2>
          <p className="text-xs text-[#6E6A64]">
            تخصيص الكلمات المفتاحية، وعنوان البحث، ووصف الميتا، وفهرس المحتويات Schema.org لكل كتاب على حدة.
          </p>
        </div>

        {/* Novel Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-bold text-[#6E6A64] shrink-0">اختر الكتاب:</label>
          <select
            value={selectedNovelId}
            onChange={e => setSelectedNovelId(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 text-xs rounded-xl bg-[#FAF9F5] border border-[#E5E2D9] text-[#2C2C2C] font-bold focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] cursor-pointer"
          >
            {novels.map(n => (
              <option key={n.id} value={n.id}>
                {n.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Google Live Search Preview Card */}
      <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3 border-b border-[#E5E2D9] pb-3">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[#4A5D4E]" />
            <h3 className="text-xs sm:text-sm font-bold text-[#2C2C2C]">
              معاينة حية في نتائج بحث جوجل (Google Search Snippet Preview)
            </h3>
          </div>

          {/* Mobile / Desktop switcher */}
          <div className="flex items-center bg-[#FAF9F5] p-1 rounded-xl border border-[#E5E2D9] text-xs font-bold">
            <button
              type="button"
              onClick={() => setPreviewDevice('mobile')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                previewDevice === 'mobile'
                  ? 'bg-[#4A5D4E] text-white shadow-xs'
                  : 'text-[#6E6A64] hover:text-[#2C2C2C]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>جوال</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('desktop')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                previewDevice === 'desktop'
                  ? 'bg-[#4A5D4E] text-white shadow-xs'
                  : 'text-[#6E6A64] hover:text-[#2C2C2C]'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>حاسوب</span>
            </button>
          </div>
        </div>

        {/* The Google Card representation */}
        <div
          className={`mx-auto p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E2D9] text-right font-sans transition-all ${
            previewDevice === 'mobile' ? 'max-w-md' : 'max-w-2xl'
          }`}
          dir="rtl"
        >
          {/* Site brand and URL */}
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-[#4A5D4E]/10 flex items-center justify-center text-[#4A5D4E] font-bold text-xs">
              أ
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-[#202124]">
                {authorName || currentNovel?.author || 'أيمن كناني'} - المنصة الرسمية
              </span>
              <span className="text-[11px] text-[#4d5156] font-mono truncate max-w-xs" dir="ltr">
                {previewUrl}
              </span>
            </div>
          </div>

          {/* Title */}
          <h4 className="text-base sm:text-lg font-normal text-[#1a0dab] hover:underline cursor-pointer leading-snug line-clamp-2">
            {displayTitle}
          </h4>

          {/* Rating stars if available */}
          {currentNovel && (
            <div className="flex items-center gap-1.5 text-xs text-[#70757a] my-0.5">
              <span className="text-amber-500 font-bold">★ 5.0</span>
              <span>(تقييم القراء)</span>
              <span>·</span>
              <span>تاريخ النشر: {new Date(currentNovel.createdAt).toLocaleDateString('ar-EG')}</span>
            </div>
          )}

          {/* Meta Description */}
          <p className="text-xs sm:text-sm text-[#4d5156] leading-relaxed line-clamp-3 mt-1">
            {displayDescription}
          </p>

          {/* NoIndex Alert */}
          {noIndex && (
            <div className="mt-3 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>تنبيه: أنت مفعل وسم (noindex) - لن تظهر هذه الرواية في محركات البحث!</span>
            </div>
          )}
        </div>
      </div>

      {/* SEO Configuration Form */}
      <form onSubmit={handleSave} className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E2D9] pb-4">
          <div>
            <h3 className="text-sm font-bold text-[#2C2C2C]">
              إعدادات السيو وتفاصيل الميتا (Meta Tags) لرواية: {currentNovel?.title}
            </h3>
            <p className="text-xs text-[#6E6A64]">
              تحكّم بالعناوين والأوصاف المخصصة التي تقرأها عناكب أرشفة محركات البحث ووسائل التواصل الاجتماعي.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAutoGenerate}
            className="px-3.5 py-1.5 bg-[#FAF9F5] hover:bg-[#EBE8DF] border border-[#E5E2D9] text-[#4A5D4E] text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>توليد واقتراح ذكي للسيو</span>
          </button>
        </div>

        {/* Meta Title */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <label className="text-xs font-bold text-[#2C2C2C]">
              عنوان السيو المخصص في محركات البحث (Meta Title)
            </label>
            <span
              className={`text-[11px] font-mono ${
                metaTitle.length > 60 ? 'text-amber-700 font-bold' : 'text-[#6E6A64]'
              }`}
            >
              {metaTitle.length} / 60 حرف (المثالي: 40-60)
            </span>
          </div>
          <input
            type="text"
            value={metaTitle}
            onChange={e => setMetaTitle(e.target.value)}
            placeholder={`رواية ${currentNovel?.title || ''} | بقلم ${currentNovel?.author || 'أيمن كناني'}`}
            className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#FAF9F5] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] font-bold"
          />
        </div>

        {/* Meta Description */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <label className="text-xs font-bold text-[#2C2C2C]">
              وصف الميتا لمحتوى الكتاب (Meta Description)
            </label>
            <span
              className={`text-[11px] font-mono ${
                metaDescription.length > 160 ? 'text-amber-700 font-bold' : 'text-[#6E6A64]'
              }`}
            >
              {metaDescription.length} / 160 حرف (المثالي: 120-160)
            </span>
          </div>
          <textarea
            rows={3}
            value={metaDescription}
            onChange={e => setMetaDescription(e.target.value)}
            placeholder="اكتب ملخصاً جذاباً يشوق القارئ ويحتوي على الكلمات المفتاحية الأساسية للرواية..."
            className="w-full p-3 text-xs rounded-xl bg-[#FAF9F5] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] leading-relaxed"
          />
        </div>

        {/* Focus Keywords */}
        <div>
          <label className="text-xs font-bold text-[#2C2C2C] block mb-1.5">
            الكلمات المفتاحية المستهدفة (Focus Keywords - مفصولة بفواصل)
          </label>
          <input
            type="text"
            value={focusKeywords}
            onChange={e => setFocusKeywords(e.target.value)}
            placeholder="روايات غموض، أدب رعب، تحميل رواية PDF، أيمن كناني، قراءة أونلاين..."
            className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#FAF9F5] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E]"
          />
        </div>

        {/* Canonical URL & OG Image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-[#2C2C2C] block mb-1.5">
              الرابط الأساسي المعتمد (Canonical URL)
            </label>
            <input
              type="url"
              value={canonicalUrl}
              onChange={e => setCanonicalUrl(e.target.value)}
              placeholder={`${defaultSiteUrl}/?novel=${currentNovel?.id || ''}`}
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#FAF9F5] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#2C2C2C] block mb-1.5">
              صورة المشاركة لوسائل التواصل (OG Share Image URL)
            </label>
            <input
              type="url"
              value={ogImage}
              onChange={e => setOgImage(e.target.value)}
              placeholder="https://.../cover.jpg"
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#FAF9F5] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] font-mono"
            />
          </div>
        </div>

        {/* Dewey Decimal Classification (فهرس ديوي العشري للكتب) */}
        <div className="border-t border-[#E5E2D9] pt-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold text-[#2C2C2C] flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#4A5D4E]" />
                <span>فهرس ديوي العشري للكتب (Dewey Decimal Classification - DDC)</span>
              </h4>
              <p className="text-[11px] text-[#6E6A64]">
                التصنيف الببليوغرافي المعتمد عالمياً في المكتبات وفهارس الأرشفة والمخططات الهيكلية.
              </p>
            </div>
            {deweyDecimal && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#4A5D4E]/10 text-[#4A5D4E] border border-[#4A5D4E]/25">
                {formatDeweyDisplay(deweyDecimal, deweyCategoryName)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Quick Dropdown Preset */}
            <div>
              <label className="text-[11px] font-bold text-[#2C2C2C] block mb-1">
                اختر تصنيفاً جاهزاً من ديوي:
              </label>
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) return;
                  const item = DEWEY_DECIMAL_CATEGORIES.find(c => c.code === val);
                  if (item) {
                    setDeweyDecimal(item.code);
                    setDeweyCategoryName(item.name);
                  }
                }}
                value={DEWEY_DECIMAL_CATEGORIES.some(c => c.code === deweyDecimal) ? deweyDecimal : ''}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF9F5] border border-[#E5E2D9] text-[#2C2C2C] cursor-pointer"
              >
                <option value="">-- اختر من قائمة تصنيفات ديوي --</option>
                {DEWEY_DECIMAL_CATEGORIES.map(cat => (
                  <option key={cat.code} value={cat.code}>
                    {cat.code} - {cat.name} ({cat.categoryGroup})
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Dewey Code */}
            <div>
              <label className="text-[11px] font-bold text-[#2C2C2C] block mb-1">
                رمز ديوي الرقمي (Dewey Code):
              </label>
              <input
                type="text"
                value={deweyDecimal}
                onChange={e => setDeweyDecimal(e.target.value)}
                placeholder="مثال: 813 أو 810 أو 100"
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF9F5] border border-[#E5E2D9] text-[#2C2C2C] font-mono font-bold"
              />
            </div>

            {/* Custom Category Name */}
            <div>
              <label className="text-[11px] font-bold text-[#2C2C2C] block mb-1">
                اسم الفئة أو الفرع الببليوغرافي:
              </label>
              <input
                type="text"
                value={deweyCategoryName}
                onChange={e => setDeweyCategoryName(e.target.value)}
                placeholder="مثال: الروايات والقصص الأدبية العربية"
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF9F5] border border-[#E5E2D9] text-[#2C2C2C]"
              />
            </div>
          </div>
        </div>

        {/* Structured Data Type & Indexing Directives */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="text-xs font-bold text-[#2C2C2C] block mb-1.5">
              نوع المخطط الهيكلي (Schema.org Structured Data)
            </label>
            <select
              value={structuredDataType}
              onChange={e => setStructuredDataType(e.target.value as any)}
              className="w-full px-3 py-2.5 text-xs rounded-xl bg-[#FAF9F5] border border-[#E5E2D9] text-[#2C2C2C] font-bold focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] cursor-pointer"
            >
              <option value="Book">كتاب كامل (Schema: Book / EBook)</option>
              <option value="CreativeWork">عمل إبداعي أدبي (Schema: CreativeWork)</option>
              <option value="Article">مقالة وسلسلة (Schema: Article)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#2C2C2C] block mb-1.5">
              سياسة فهرسة محركات البحث (Robots Indexing Directive)
            </label>
            <div className="flex items-center gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                <input
                  type="checkbox"
                  checked={noIndex}
                  onChange={e => setNoIndex(e.target.checked)}
                  className="rounded text-[#4A5D4E] focus:ring-[#4A5D4E] w-4 h-4 cursor-pointer"
                />
                <span className={noIndex ? 'text-rose-700' : 'text-[#2C2C2C]'}>
                  منع الفهرسة (noindex, nofollow)
                </span>
              </label>
              <span className="text-[11px] text-[#6E6A64]">
                {noIndex ? 'لن يظهر في جوجل' : 'مفهرس ومتاح لجميع محركات البحث'}
              </span>
            </div>
          </div>
        </div>

        {/* Structured Table of Contents (فهرس المحتويات: عنوان الفصل مع رابط الفصل) */}
        <div className="border-t border-[#E5E2D9] pt-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold text-[#2C2C2C] flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#4A5D4E]" />
                <span>فهرس المحتويات: عنوان الفصل مع رابط الفصل المباشر</span>
              </h4>
              <p className="text-[11px] text-[#6E6A64]">
                ربط كل فصل برابطه المباشر ليظهر في روابط جوجل السريعة (Sitelinks) وتسهيل قراءة وتنزيل الفصول.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!currentNovel) return;
                const novelChapters = chapters.filter(c => c.novelId === currentNovel.id);
                const baseUrl = (storageService.getSeoSettings().canonicalBaseUrl || window.location.origin).replace(/\/$/, '');
                const generatedToc: TableOfContentItem[] = novelChapters
                  .sort((a, b) => a.chapterNumber - b.chapterNumber)
                  .map(ch => ({
                    id: `toc-${ch.id}`,
                    title: `الفصل ${ch.chapterNumber}: ${ch.title}`,
                    anchor: `chapter-${ch.chapterNumber}`,
                    level: 1,
                    url: `${baseUrl}/?novel=${currentNovel.id}&chapter=${ch.id}`,
                    chapterId: ch.id,
                  }));
                setTableOfContents(generatedToc);
                showToast(`تم مزامنة ${generatedToc.length} فصل مع روابطها المباشرة في الفهرس!`);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#FAF9F5] hover:bg-[#EBE8DF] border border-[#E5E2D9] text-[#4A5D4E] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>مزامنة فصول الرواية مع الروابط تلقائياً</span>
            </button>
          </div>

          {/* Add custom TOC item with title and URL */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            <input
              type="text"
              value={newTocTitle}
              onChange={e => setNewTocTitle(e.target.value)}
              placeholder="عنوان الفصل أو الباب (مثال: الفصل الأول: البداية)"
              className="sm:col-span-2 px-3 py-2 text-xs rounded-xl bg-[#FAF9F5] border border-[#E5E2D9] text-[#2C2C2C]"
            />
            <input
              type="url"
              value={newTocUrl}
              onChange={e => setNewTocUrl(e.target.value)}
              placeholder="رابط الفصل (اختياري، مثلاً: https://.../?novel=...&chapter=...)"
              className="sm:col-span-2 px-3 py-2 text-xs rounded-xl bg-[#FAF9F5] border border-[#E5E2D9] text-[#2C2C2C] font-mono text-[11px]"
            />
            <button
              type="button"
              onClick={handleAddTocItem}
              className="px-3 py-2 bg-[#4A5D4E] hover:bg-[#3C4C3F] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة للفهرس</span>
            </button>
          </div>

          {tableOfContents.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {tableOfContents.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-[#FAF9F5] border border-[#E5E2D9] text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="w-6 h-6 rounded-md bg-[#4A5D4E]/10 text-[#4A5D4E] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-[#2C2C2C] block truncate">
                        {item.title}
                      </span>
                      {item.url && (
                        <span className="text-[11px] text-[#6E6A64] font-mono block truncate" dir="ltr">
                          {item.url}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyTocUrl(item)}
                      className="px-2 py-1 rounded-lg border border-[#E5E2D9] bg-white hover:bg-[#F7F5EE] text-[#4A5D4E] text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      title="نسخ رابط الفصل"
                    >
                      {copiedTocId === item.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">تم النسخ</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>نسخ الرابط</span>
                        </>
                      )}
                    </button>

                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-[#6E6A64] hover:text-[#4A5D4E] cursor-pointer"
                        title="فتح رابط الفصل في تبويب جديد"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemoveTocItem(item.id)}
                      className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                      title="حذف هذا القسم"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#8C827A] italic">
              لم يتم إضافة عناصر فهرس بعد. اضغط "مزامنة فصول الرواية مع الروابط تلقائياً" لجلب الفصول وروابطها فوراً.
            </p>
          )}
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end pt-4 border-t border-[#E5E2D9]">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-[#4A5D4E] hover:bg-[#3C4C3F] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'جارٍ الحفظ والمزامنة...' : 'حفظ سيو الكتاب الآن'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
