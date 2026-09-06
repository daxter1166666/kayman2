import React, { useState, useEffect } from 'react';
import { Novel, Chapter, ChapterSeoMeta } from '../../types';
import { storageService } from '../../services/storageService';
import { supabaseService } from '../../services/supabaseService';
import { cleanChapterContent } from '../../utils/textCleaner';
import {
  FileText,
  Search,
  Sparkles,
  CheckCircle2,
  Save,
  Eye,
  Smartphone,
  Monitor,
  AlertCircle,
  ExternalLink,
  Layers
} from 'lucide-react';

interface ChapterSeoStudioProps {
  novels: Novel[];
  chapters: Chapter[];
  onRefreshData: () => void;
  initialNovelId?: string;
  initialChapterId?: string;
}

export const ChapterSeoStudio: React.FC<ChapterSeoStudioProps> = ({
  novels,
  chapters,
  onRefreshData,
  initialNovelId,
  initialChapterId,
}) => {
  const [selectedNovelId, setSelectedNovelId] = useState<string>(
    initialNovelId || novels[0]?.id || ''
  );
  const [selectedChapterId, setSelectedChapterId] = useState<string>(initialChapterId || '');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [notification, setNotification] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Form states
  const [metaTitle, setMetaTitle] = useState<string>('');
  const [metaDescription, setMetaDescription] = useState<string>('');
  const [focusKeywords, setFocusKeywords] = useState<string>('');
  const [canonicalUrl, setCanonicalUrl] = useState<string>('');
  const [ogImage, setOgImage] = useState<string>('');
  const [noIndex, setNoIndex] = useState<boolean>(false);

  const currentNovel = novels.find(n => n.id === selectedNovelId);
  const currentNovelChapters = chapters
    .filter(c => c.novelId === selectedNovelId)
    .sort((a, b) => a.chapterNumber - b.chapterNumber);

  // Auto-select chapter if none selected or if selected doesn't belong to novel
  useEffect(() => {
    if (currentNovelChapters.length > 0) {
      if (!selectedChapterId || !currentNovelChapters.some(c => c.id === selectedChapterId)) {
        setSelectedChapterId(currentNovelChapters[0].id);
      }
    } else {
      setSelectedChapterId('');
    }
  }, [selectedNovelId, currentNovelChapters, selectedChapterId]);

  const currentChapter = chapters.find(c => c.id === selectedChapterId);

  // Load SEO fields when selected chapter changes
  useEffect(() => {
    if (currentChapter) {
      const seo = currentChapter.seo || {};
      setMetaTitle(seo.metaTitle || '');
      setMetaDescription(seo.metaDescription || '');
      setFocusKeywords(seo.focusKeywords || '');
      setCanonicalUrl(seo.canonicalUrl || '');
      setOgImage(seo.ogImage || currentNovel?.bannerImage || currentNovel?.coverImage || '');
      setNoIndex(Boolean(seo.noIndex));
    } else {
      setMetaTitle('');
      setMetaDescription('');
      setFocusKeywords('');
      setCanonicalUrl('');
      setOgImage('');
      setNoIndex(false);
    }
  }, [selectedChapterId, currentChapter, currentNovel]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleAutoGenerate = () => {
    if (!currentChapter || !currentNovel) return;

    const genTitle = `${currentChapter.title} - رواية ${currentNovel.title} | ${currentNovel.author}`;
    const cleanText = cleanChapterContent(currentChapter.content).replace(/\s+/g, ' ').trim();
    const excerpt = cleanText.length > 155 ? cleanText.slice(0, 152) + '...' : cleanText;
    const genDesc = excerpt || `قراءة ${currentChapter.title} من رواية ${currentNovel.title} للكاتب ${currentNovel.author} عبر المنصة الرسمية.`;

    const genKeywords = [
      currentChapter.title,
      `فصل ${currentChapter.chapterNumber}`,
      currentNovel.title,
      currentNovel.author,
      ...(currentNovel.genres || []),
      'قراءة أونلاين مجاناً'
    ].filter(Boolean).join('، ');

    const seoSettings = storageService.getSeoSettings();
    const baseUrl = (seoSettings.canonicalBaseUrl || window.location.origin).replace(/\/$/, '');
    const genCanonical = `${baseUrl}/?novel=${currentNovel.id}&chapter=${currentChapter.id}`;

    setMetaTitle(genTitle);
    setMetaDescription(genDesc);
    setFocusKeywords(genKeywords);
    setCanonicalUrl(genCanonical);
    setOgImage(currentNovel.bannerImage || currentNovel.coverImage || '');
    setNoIndex(false);

    showToast('تم استخراج وتوليد بيانات سيو الفصل من المحتوى بنجاح!');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentChapter) {
      showToast('يرجى اختيار فصل أولاً.');
      return;
    }

    setIsSaving(true);
    const seoData: ChapterSeoMeta = {
      metaTitle: metaTitle.trim() || undefined,
      metaDescription: metaDescription.trim() || undefined,
      focusKeywords: focusKeywords.trim() || undefined,
      canonicalUrl: canonicalUrl.trim() || undefined,
      ogImage: ogImage.trim() || undefined,
      noIndex,
    };

    try {
      const updated = storageService.updateChapter(currentChapter.id, {
        seo: seoData,
      });

      if (updated) {
        await supabaseService.saveChapterToSupabase(updated);
      }

      showToast(`تم حفظ وتطبيق سيو الفصل "${currentChapter.title}" ومزامنته سحابياً بنجاح!`);
      onRefreshData();
    } catch (err) {
      console.error('Error saving chapter SEO:', err);
      showToast('حدث خطأ أثناء حفظ سيو الفصل.');
    } finally {
      setIsSaving(false);
    }
  };

  const defaultSiteUrl = (storageService.getSeoSettings().canonicalBaseUrl || window.location.origin).replace(/\/$/, '');
  const previewUrl = canonicalUrl || `${defaultSiteUrl}/?novel=${currentNovel?.id || ''}&chapter=${currentChapter?.id || ''}`;
  const displayTitle = metaTitle || (currentChapter && currentNovel ? `${currentChapter.title} - رواية ${currentNovel.title}` : 'عنوان الفصل في محركات البحث');
  const displayDescription = metaDescription || (currentChapter?.content ? cleanChapterContent(currentChapter.content).slice(0, 155) : 'وصف ومقتطف الفصل في نتائج محركات البحث...');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {notification && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header and Selectors */}
      <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs space-y-4">
        <div>
          <h2 className="font-amiri font-bold text-xl text-[#2C2C2C] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#4A5D4E]" />
            <span>سيو الفصول الفردية (Chapter-Level SEO Studio)</span>
          </h2>
          <p className="text-xs text-[#6E6A64]">
            تخصيص عنوان الميتا، ووصف البحث، والكلمات المفتاحية لكل فصل على حدة لتحقيق أقصى وصول في محركات البحث ومشاركات وسائل التواصل.
          </p>
        </div>

        {/* Novel & Chapter Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#E5E2D9]">
          <div>
            <label className="text-xs font-bold text-[#2C2C2C] block mb-1.5">
              1. اختر الكتاب أو الرواية:
            </label>
            <select
              value={selectedNovelId}
              onChange={e => setSelectedNovelId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF9F5] border border-[#E5E2D9] text-[#2C2C2C] font-bold focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] cursor-pointer"
            >
              {novels.map(n => (
                <option key={n.id} value={n.id}>
                  {n.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#2C2C2C] block mb-1.5">
              2. اختر الفصل المستهدف:
            </label>
            {currentNovelChapters.length > 0 ? (
              <select
                value={selectedChapterId}
                onChange={e => setSelectedChapterId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF9F5] border border-[#E5E2D9] text-[#2C2C2C] font-bold focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] cursor-pointer"
              >
                {currentNovelChapters.map(ch => (
                  <option key={ch.id} value={ch.id}>
                    فصل {ch.chapterNumber}: {ch.title} ({ch.wordCount || 0} كلمة)
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-2 text-xs text-[#8C827A] bg-[#FAF9F5] rounded-xl border border-[#E5E2D9]">
                لا توجد فصول منشورة في هذا الكتاب حتى الآن.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Google Search Result Preview */}
      {currentChapter && (
        <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-3 border-b border-[#E5E2D9] pb-3">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[#4A5D4E]" />
              <h3 className="text-xs sm:text-sm font-bold text-[#2C2C2C]">
                معاينة الفصل في نتائج بحث جوجل (Google Snippet Preview)
              </h3>
            </div>

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

          <div
            className={`mx-auto p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E2D9] text-right font-sans transition-all ${
              previewDevice === 'mobile' ? 'max-w-md' : 'max-w-2xl'
            }`}
            dir="rtl"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-[#4A5D4E]/10 flex items-center justify-center text-[#4A5D4E] font-bold text-xs">
                ف
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#202124]">
                  {currentNovel?.author || 'أيمن كناني'} · رواية {currentNovel?.title}
                </span>
                <span className="text-[11px] text-[#4d5156] font-mono truncate max-w-xs" dir="ltr">
                  {previewUrl}
                </span>
              </div>
            </div>

            <h4 className="text-base sm:text-lg font-normal text-[#1a0dab] hover:underline cursor-pointer leading-snug line-clamp-2">
              {displayTitle}
            </h4>

            <p className="text-xs sm:text-sm text-[#4d5156] leading-relaxed line-clamp-3 mt-1">
              {displayDescription}
            </p>

            {noIndex && (
              <div className="mt-3 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>تنبيه: أنت مفعل وسم (noindex) - لن يظهر هذا الفصل في محركات البحث!</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEO Fields Form */}
      {currentChapter ? (
        <form onSubmit={handleSave} className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E2D9] pb-4">
            <div>
              <h3 className="text-sm font-bold text-[#2C2C2C]">
                إعدادات السيو لفصل: {currentChapter.title}
              </h3>
              <p className="text-xs text-[#6E6A64]">
                فصل رقم {currentChapter.chapterNumber} · عدد الكلمات: {currentChapter.wordCount || 0}
              </p>
            </div>

            <button
              type="button"
              onClick={handleAutoGenerate}
              className="px-3.5 py-1.5 bg-[#FAF9F5] hover:bg-[#EBE8DF] border border-[#E5E2D9] text-[#4A5D4E] text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>توليد واقتراح ذكي من نص الفصل</span>
            </button>
          </div>

          {/* Meta Title */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <label className="text-xs font-bold text-[#2C2C2C]">
                عنوان الفصل المخصص لمحركات البحث (Meta Title)
              </label>
              <span
                className={`text-[11px] font-mono ${
                  metaTitle.length > 60 ? 'text-amber-700 font-bold' : 'text-[#6E6A64]'
                }`}
              >
                {metaTitle.length} / 60 حرف
              </span>
            </div>
            <input
              type="text"
              value={metaTitle}
              onChange={e => setMetaTitle(e.target.value)}
              placeholder={`${currentChapter.title} - رواية ${currentNovel?.title || ''}`}
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#FAF9F5] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] font-bold"
            />
          </div>

          {/* Meta Description */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <label className="text-xs font-bold text-[#2C2C2C]">
                وصف الميتا للفصل (Meta Description)
              </label>
              <span
                className={`text-[11px] font-mono ${
                  metaDescription.length > 160 ? 'text-amber-700 font-bold' : 'text-[#6E6A64]'
                }`}
              >
                {metaDescription.length} / 160 حرف
              </span>
            </div>
            <textarea
              rows={3}
              value={metaDescription}
              onChange={e => setMetaDescription(e.target.value)}
              placeholder="اكتب نبذة أو مقتطفاً مشوقاً من أحداث هذا الفصل لتظهر في بحث جوجل..."
              className="w-full p-3 text-xs rounded-xl bg-[#FAF9F5] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] leading-relaxed"
            />
          </div>

          {/* Focus Keywords */}
          <div>
            <label className="text-xs font-bold text-[#2C2C2C] block mb-1.5">
              الكلمات المفتاحية للفصل (Focus Keywords - مفصولة بفواصل)
            </label>
            <input
              type="text"
              value={focusKeywords}
              onChange={e => setFocusKeywords(e.target.value)}
              placeholder="اسم الفصل، أحداث الفصل، اسم الرواية، الكاتب..."
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#FAF9F5] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E]"
            />
          </div>

          {/* Canonical URL & OG Image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#2C2C2C] block mb-1.5">
                الرابط الأساسي للفصل (Canonical URL)
              </label>
              <input
                type="url"
                value={canonicalUrl}
                onChange={e => setCanonicalUrl(e.target.value)}
                placeholder={`${defaultSiteUrl}/?novel=${currentNovel?.id}&chapter=${currentChapter.id}`}
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#FAF9F5] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#2C2C2C] block mb-1.5">
                صورة المشاركة لوسائل التواصل (OG Image URL)
              </label>
              <input
                type="url"
                value={ogImage}
                onChange={e => setOgImage(e.target.value)}
                placeholder="https://.../chapter-banner.jpg"
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#FAF9F5] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] font-mono"
              />
            </div>
          </div>

          {/* Indexing Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
              <input
                type="checkbox"
                checked={noIndex}
                onChange={e => setNoIndex(e.target.checked)}
                className="rounded text-[#4A5D4E] focus:ring-[#4A5D4E] w-4 h-4 cursor-pointer"
              />
              <span className={noIndex ? 'text-rose-700' : 'text-[#2C2C2C]'}>
                منع عناكب البحث من أرشفة هذا الفصل (noindex, nofollow)
              </span>
            </label>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end pt-4 border-t border-[#E5E2D9]">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-[#4A5D4E] hover:bg-[#3C4C3F] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'جارٍ الحفظ والمزامنة...' : 'حفظ سيو الفصل الآن'}</span>
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
};
