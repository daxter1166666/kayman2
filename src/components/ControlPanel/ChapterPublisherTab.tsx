import React, { useState, useEffect } from 'react';
import { Novel, Chapter, ChapterStatus, ChapterSeoMeta } from '../../types';
import { storageService } from '../../services/storageService';
import { supabaseService } from '../../services/supabaseService';
import { RichTextEditor } from '../RichTextEditor/RichTextEditor';
import { ChapterSeoStudio } from './ChapterSeoStudio';
import {
  FilePlus,
  Edit3,
  Trash2,
  Eye,
  CheckCircle2,
  Sparkles,
  Send,
  Save,
  FileText,
  Undo2,
  AlertCircle,
  ArrowRight,
  Search,
  ChevronDown,
  ChevronUp,
  Globe,
  RefreshCw
} from 'lucide-react';

interface ChapterPublisherTabProps {
  novels: Novel[];
  chapters: Chapter[];
  onRefreshData: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const ChapterPublisherTab: React.FC<ChapterPublisherTabProps> = ({
  novels,
  chapters,
  onRefreshData,
  onNavigateTab,
}) => {
  const [selectedNovelId, setSelectedNovelId] = useState<string>(novels[0]?.id || '');
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);

  // Auto-select first novel if not set or novel list changed
  useEffect(() => {
    if ((!selectedNovelId || !novels.some(n => n.id === selectedNovelId)) && novels.length > 0) {
      setSelectedNovelId(novels[0].id);
    }
  }, [novels, selectedNovelId]);

  // Form fields
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [authorNote, setAuthorNote] = useState<string>('');
  const [status, setStatus] = useState<ChapterStatus>('PUBLISHED');
  const [activeView, setActiveView] = useState<'editor' | 'preview'>('editor');
  const [notification, setNotification] = useState<string | null>(null);
  const [chapterToDelete, setChapterToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Chapter-Level SEO State
  const [seoMetaTitle, setSeoMetaTitle] = useState<string>('');
  const [seoMetaDescription, setSeoMetaDescription] = useState<string>('');
  const [seoFocusKeywords, setSeoFocusKeywords] = useState<string>('');
  const [seoCanonicalUrl, setSeoCanonicalUrl] = useState<string>('');
  const [seoOgImage, setSeoOgImage] = useState<string>('');
  const [seoNoIndex, setSeoNoIndex] = useState<boolean>(false);
  const [isSeoStudioOpen, setIsSeoStudioOpen] = useState<boolean>(false);

  // Filtered chapters for current novel
  const currentNovelChapters = chapters
    .filter(c => c.novelId === selectedNovelId)
    .sort((a, b) => a.chapterNumber - b.chapterNumber);

  // Next calculated chapter number
  const nextChapterNumber = currentNovelChapters.length > 0
    ? Math.max(...currentNovelChapters.map(c => c.chapterNumber)) + 1
    : 1;

  // Selected novel object
  const currentNovel = novels.find(n => n.id === selectedNovelId);

  // Live metrics
  const plainText = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const paragraphCount = plainText ? plainText.split(/\n+/).filter(Boolean).length : 0;

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleStartNew = () => {
    setEditingChapterId(null);
    setTitle('');
    setContent('');
    setAuthorNote('');
    setStatus('PUBLISHED');
    setActiveView('editor');
    setSeoMetaTitle('');
    setSeoMetaDescription('');
    setSeoFocusKeywords('');
    setSeoCanonicalUrl('');
    setSeoOgImage('');
    setSeoNoIndex(false);
    setIsSeoStudioOpen(false);
  };

  const handleEditChapter = (ch: Chapter, openSeo: boolean = false) => {
    setEditingChapterId(ch.id);
    setSelectedNovelId(ch.novelId);
    setTitle(ch.title);
    setContent(ch.content);
    setAuthorNote(ch.authorNote || '');
    setStatus(ch.status);
    setActiveView('editor');
    setSeoMetaTitle(ch.seo?.metaTitle || '');
    setSeoMetaDescription(ch.seo?.metaDescription || '');
    setSeoFocusKeywords(ch.seo?.focusKeywords || '');
    setSeoCanonicalUrl(ch.seo?.canonicalUrl || '');
    setSeoOgImage(ch.seo?.ogImage || '');
    setSeoNoIndex(Boolean(ch.seo?.noIndex));
    setIsSeoStudioOpen(openSeo || Boolean(ch.seo?.metaTitle || ch.seo?.metaDescription));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteChapter = (chId: string, chTitle: string) => {
    setChapterToDelete({ id: chId, title: chTitle });
  };

  const handleConfirmDeleteChapter = async () => {
    if (!chapterToDelete) return;
    setIsDeleting(true);
    const { id: chId, title: chTitle } = chapterToDelete;

    try {
      storageService.deleteChapter(chId);
      if (editingChapterId === chId) {
        handleStartNew();
      }
      onRefreshData();

      showToast(`جاري حذف فصل "${chTitle}" من قاعدة البيانات السحابية...`);
      const cloudSuccess = await supabaseService.deleteChapterFromSupabase(chId);
      if (cloudSuccess) {
        showToast(`تم حذف الفصل "${chTitle}" نهائياً من المتصفح وقاعدة البيانات السحابية!`);
      } else {
        showToast('تم الحذف من المتصفح. تنبيه: لم يتم الحذف السحابي.');
      }
    } catch (err) {
      console.error('Delete chapter error:', err);
      showToast('حدث خطأ أثناء حذف الفصل.');
    } finally {
      setIsDeleting(false);
      setChapterToDelete(null);
      onRefreshData();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('يرجى كتابة عنوان الفصل');
      return;
    }
    if (!content.trim()) {
      alert('يرجى كتابة نص ومحتوى الفصل');
      return;
    }
    if (!selectedNovelId) {
      alert('يرجى اختيار الرواية أولاً');
      return;
    }

    setIsSaving(true);
    try {
      const hasCustomSeo = Boolean(
        seoMetaTitle.trim() ||
        seoMetaDescription.trim() ||
        seoFocusKeywords.trim() ||
        seoCanonicalUrl.trim() ||
        seoOgImage.trim() ||
        seoNoIndex
      );
      const seoData: ChapterSeoMeta | undefined = hasCustomSeo ? {
        metaTitle: seoMetaTitle.trim() || undefined,
        metaDescription: seoMetaDescription.trim() || undefined,
        focusKeywords: seoFocusKeywords.trim() || undefined,
        canonicalUrl: seoCanonicalUrl.trim() || undefined,
        ogImage: seoOgImage.trim() || undefined,
        noIndex: seoNoIndex,
      } : undefined;

      if (editingChapterId) {
        // Update existing
        storageService.updateChapter(editingChapterId, {
          title: title.trim(),
          content: content.trim(),
          authorNote: authorNote.trim() || undefined,
          status,
          seo: seoData,
        });
        const updatedCh = storageService.getChapters().find(c => c.id === editingChapterId);
        if (updatedCh) {
          const res = await supabaseService.saveChapterToSupabase(updatedCh);
          if (res) {
            showToast('تم تحديث بيانات وسيو الفصل ومزامنته سحابياً مع سوباباس!');
          } else {
            showToast('تم حفظ تعديلات الفصل بنجاح!');
          }
        } else {
          showToast('تم تحديث وحفظ تعديلات الفصل بنجاح!');
        }
      } else {
        // Create new
        const newlyAdded = storageService.addChapter({
          novelId: selectedNovelId,
          title: title.trim(),
          content: content.trim(),
          authorNote: authorNote.trim() || undefined,
          status,
          seo: seoData,
        });
        if (newlyAdded) {
          const res = await supabaseService.saveChapterToSupabase(newlyAdded);
          if (res) {
            showToast(`تم نشر الفصل ${nextChapterNumber} ومزامنته مع سوباباس بنجاح!`);
          } else {
            showToast(`تم نشر الفصل ${nextChapterNumber} ومحفوظ بأمان!`);
          }
        } else {
          showToast(`تم نشر الفصل ${nextChapterNumber} بنجاح!`);
        }
        handleStartNew();
      }

      onRefreshData();
    } catch (err: any) {
      console.error('Error saving chapter:', err);
      showToast('حدث خطأ أثناء حفظ الفصل: ' + (err?.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleInsertTemplate = () => {
    const sample = `سقط الغسق سريعاً فوق الشرفات الخارجية للقصر، كاسياً الأبراج الحجرية بظلال بنفسجية حالكة.\n\nشدّ رداءه الأسود فوق جبينه، بينما كانت كل حواسه وخبرته الطويلة في المغامرات تحذره من أن عيوناً تراقبه من برج الأجراس القديم.\n\nهمس صوت مألوف من خلف الأعمدة الرخامية: "لقد تأخرت كثيراً."\n\nلم يلتفت إلى الوراء، بل أجاب بهدوء وثقة: "كان لابد من تغيير المسار، فقد ضاعف الحرس الإمبراطوري دوريات النهر."`;
    setContent(sample);
  };

  return (
    <div className="space-y-8 text-[#2C2C2C] font-cairo">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 left-6 z-50 bg-[#4A5D4E] text-[#FDFCF8] px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Warning if no novels exist */}
      {novels.length === 0 && (
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-amber-700 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">تنبيه: لا توجد كتب أو مؤلفات مسجلة بعد</h4>
              <p className="text-xs text-amber-800/90 mt-0.5">
                يجب إضافة كتاب أو رواية أولاً في الكتالوج لتتمكن من نشر الفصول والمقالات وربطها به.
              </p>
            </div>
          </div>
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('novels')}
              className="px-4 py-2 bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8] text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <span>الانتقال لإضافة أول كتاب</span>
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          )}
        </div>
      )}

      {/* Header & Novel Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs">
        <div>
          <h2 className="font-amiri font-bold text-xl text-[#2C2C2C] flex items-center gap-2">
            <FilePlus className="w-5 h-5 text-[#4A5D4E]" />
            <span>{editingChapterId ? 'تعديل فصل حالي' : 'محرر وناشر الفصول الجديد'}</span>
          </h2>
          <p className="text-xs text-[#6E6A64]">
            اكتب، ونسق، وانشر فصول كتبك وأعمالك لتظهر فوراً وبشكل منسق لجميع القراء.
          </p>
        </div>

        {/* Novel Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-bold text-[#6E6A64] shrink-0">النشر في كتاب:</label>
          <select
            id="publisher-select-novel"
            value={selectedNovelId}
            onChange={e => {
              setSelectedNovelId(e.target.value);
              if (editingChapterId) handleStartNew();
            }}
            className="w-full sm:w-64 px-3 py-2 text-xs rounded-xl bg-[#F7F5EE] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] font-bold cursor-pointer"
          >
            {novels.map(n => (
              <option key={n.id} value={n.id}>
                {n.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Composer Form */}
      <form onSubmit={handleSave} className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E5E2D9] space-y-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E2D9] pb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-[#4A5D4E]/15 text-[#4A5D4E] font-mono text-xs font-bold border border-[#4A5D4E]/30">
              {editingChapterId ? 'وضع التعديل' : `الفصل التالي: فصل رقم ${nextChapterNumber}`}
            </span>

            {editingChapterId && (
              <button
                type="button"
                id="cancel-edit-ch-btn"
                onClick={handleStartNew}
                className="text-xs text-[#6E6A64] hover:text-[#2C2C2C] flex items-center gap-1 cursor-pointer font-bold"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>إلغاء وبدء فصل جديد</span>
              </button>
            )}
          </div>

          {/* Editor vs Preview Mode Switch */}
          <div className="flex items-center gap-1 bg-[#F7F5EE] p-1 rounded-xl border border-[#E5E2D9] text-xs font-bold">
            <button
              type="button"
              id="view-mode-editor-btn"
              onClick={() => setActiveView('editor')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeView === 'editor'
                  ? 'bg-[#4A5D4E] text-[#FDFCF8] shadow-xs'
                  : 'text-[#6E6A64] hover:text-[#2C2C2C]'
              }`}
            >
              الكتابة والمحرر
            </button>
            <button
              type="button"
              id="view-mode-preview-btn"
              onClick={() => setActiveView('preview')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                activeView === 'preview'
                  ? 'bg-[#4A5D4E] text-[#FDFCF8] shadow-xs'
                  : 'text-[#6E6A64] hover:text-[#2C2C2C]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>معاينة القارئ الحية</span>
            </button>
          </div>
        </div>

        {activeView === 'editor' ? (
          <>
            {/* Title & Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-[#2C2C2C] block mb-2">
                  عنوان الفصل *
                </label>
                <input
                  type="text"
                  id="chapter-title-input"
                  placeholder="مثال: أسرار المخطوطة القديمة في برج الزمان"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] font-amiri font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#2C2C2C] block mb-2">
                  حالة النشر
                </label>
                <select
                  id="chapter-status-select"
                  value={status}
                  onChange={e => setStatus(e.target.value as ChapterStatus)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] font-bold cursor-pointer"
                >
                  <option value="PUBLISHED">منشور (متاح فوراً للقراء)</option>
                  <option value="DRAFT">مسودة (للكاتب فقط)</option>
                  <option value="SCHEDULED">مجدول لاحقاً</option>
                </select>
              </div>
            </div>

            {/* Author's Note (Optional) */}
            <div>
              <label className="text-xs font-bold text-[#2C2C2C] block mb-1">
                ملاحظة الكاتب للقراء (اختياري)
              </label>
              <input
                type="text"
                id="chapter-author-note-input"
                placeholder="مثال: شكراً لتفاعلكم الرائع! ما رأيكم في التحول المفاجئ في نهاية هذا الفصل؟..."
                value={authorNote}
                onChange={e => setAuthorNote(e.target.value)}
                className="w-full px-4 py-2 text-xs rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E]"
              />
            </div>

            {/* Chapter Body Visual Rich WYSIWYG Composer */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#2C2C2C]">
                  نص ومحتوى الفصل (محرر مرئي متكامل يطبق التنسيقات فورياً) *
                </label>
                <button
                  type="button"
                  id="insert-template-btn"
                  onClick={handleInsertTemplate}
                  className="text-xs text-[#4A5D4E] hover:underline cursor-pointer flex items-center gap-1 font-bold"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>إدراج نص أدبي تجريبي</span>
                </button>
              </div>

              {/* Real-time WYSIWYG Rich Editor */}
              <RichTextEditor
                value={content}
                onChange={setContent}
                novelTitle={novels.find(n => n.id === selectedNovelId)?.title}
                chapterTitle={title}
                authorName="الكاتب أيمن كناني"
                minHeight="380px"
              />
            </div>

            {/* Chapter-Level SEO Studio Section */}
            <div className="pt-2 border-t border-[#E5E2D9]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#F7F5EE] border border-[#E5E2D9] mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#4A5D4E]/10 text-[#4A5D4E] flex items-center justify-center shrink-0">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-[#2C2C2C]">
                        سيو وأرشفة هذا الفصل في Google (Chapter-Level SEO)
                      </span>
                      {seoNoIndex ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          مستبعد NoIndex
                        </span>
                      ) : (seoMetaTitle.trim() || seoMetaDescription.trim()) ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>مخصص ونشط</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#FFFFFF] text-[#6E6A64] border border-[#E5E2D9]">
                          تلقائي
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#6E6A64] mt-0.5">
                      تخصيص عنوان ميتا ووصف مستقل وكلمات مفتاحية لأحداث هذا الفصل لجلب قراء مستهدفين
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSeoStudioOpen(!isSeoStudioOpen)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FDFCF8] text-[#2C2C2C] border border-[#E5E2D9] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <Search className="w-3.5 h-3.5 text-[#4A5D4E]" />
                  <span>{isSeoStudioOpen ? 'إخفاء استوديو السيو' : 'تخصيص السيو والمعاينة'}</span>
                  {isSeoStudioOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {isSeoStudioOpen && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <ChapterSeoStudio
                    metaTitle={seoMetaTitle}
                    setMetaTitle={setSeoMetaTitle}
                    metaDescription={seoMetaDescription}
                    setMetaDescription={setSeoMetaDescription}
                    focusKeywords={seoFocusKeywords}
                    setFocusKeywords={setSeoFocusKeywords}
                    canonicalUrl={seoCanonicalUrl}
                    setCanonicalUrl={setSeoCanonicalUrl}
                    ogImage={seoOgImage}
                    setOgImage={setSeoOgImage}
                    noIndex={seoNoIndex}
                    setNoIndex={setSeoNoIndex}
                    chapterNumber={editingChapterId ? (chapters.find(c => c.id === editingChapterId)?.chapterNumber || 1) : nextChapterNumber}
                    chapterTitle={title}
                    chapterContent={content}
                    novelTitle={currentNovel?.title || ''}
                    novelAuthor={currentNovel?.author || 'أيمن كناني'}
                    novelSlug={currentNovel?.slug}
                    novelCoverImage={currentNovel?.coverImage}
                    novelBannerImage={currentNovel?.bannerImage}
                    novelId={selectedNovelId}
                    chapterId={editingChapterId || undefined}
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          /* Live Reader Preview Pane */
          <div className="p-6 sm:p-8 rounded-2xl bg-[#FDFCF8] text-[#2C2C2C] border border-[#E5E2D9] font-amiri shadow-inner">
            <div className="text-center pb-6 mb-6 border-b border-[#E5E2D9]">
              <span className="text-xs text-[#4A5D4E] font-cairo font-bold">
                {novels.find(n => n.id === selectedNovelId)?.title}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold mt-1 text-[#2C2C2C]">
                {title || 'فصل بدون عنوان'}
              </h2>
              <div className="text-xs text-[#6E6A64] mt-1 font-cairo">
                {wordCount.toLocaleString()} كلمة · {readingTime} دقائق قراءة
              </div>
            </div>

            {authorNote && (
              <div className="p-3.5 rounded-lg bg-[#F7F5EE] text-xs italic font-cairo mb-6 text-[#2C2C2C] border border-[#E5E2D9]">
                <strong>كلمة الكاتب:</strong> {authorNote}
              </div>
            )}

            <div className="space-y-4 text-base leading-relaxed text-[#2C2C2C]">
              {content ? (
                /<[a-z][\s\S]*>/i.test(content) ? (
                  <div
                    className="book-reader-content space-y-6 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                ) : (
                  content.split('\n\n').filter(p => p.trim()).map((p, i) => (
                    <p key={i}>
                      {p}
                    </p>
                  ))
                )
              ) : (
                <p className="text-[#6E6A64] italic text-center py-8 font-cairo">
                  لم يتم كتابة أي نص بعد. انتقل إلى وضع المحرر للبدء في الكتابة!
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Submit Buttons */}
        <div className="pt-4 border-t border-[#E5E2D9] flex items-center justify-between">
          <button
            type="button"
            id="clear-composer-btn"
            onClick={handleStartNew}
            className="px-4 py-2 text-xs text-[#6E6A64] hover:text-[#2C2C2C] cursor-pointer font-bold"
          >
            مسح الحقول / جديد
          </button>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              id="save-chapter-btn"
              disabled={isSaving}
              className="px-6 py-2.5 bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8] font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : editingChapterId ? (
                <Save className="w-4 h-4" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>
                {isSaving
                  ? 'جاري حفظ ومزامنة الفصل سحابياً...'
                  : editingChapterId
                  ? 'حفظ تعديلات الفصل'
                  : 'نشر الفصل الآن'}
              </span>
            </button>
          </div>
        </div>
      </form>

      {/* Existing Chapters Table for current novel */}
      <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-amiri font-bold text-lg text-[#2C2C2C] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#4A5D4E]" />
            <span>
              فصول رواية "{novels.find(n => n.id === selectedNovelId)?.title}" ({currentNovelChapters.length})
            </span>
          </h3>
          <button
            type="button"
            id="composer-new-ch-btn"
            onClick={handleStartNew}
            className="text-xs text-[#4A5D4E] hover:underline cursor-pointer font-bold"
          >
            + إضافة فصل جديد
          </button>
        </div>

        {currentNovelChapters.length === 0 ? (
          <div className="text-center py-10 text-[#6E6A64] text-xs italic">
            لا توجد فصول منشورة لهذه الرواية بعد. استخدم المحرر أعلاه لنشر الفصل الأول!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs font-cairo">
              <thead>
                <tr className="border-b border-[#E5E2D9] text-[#6E6A64] text-[11px] font-bold">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">العنوان</th>
                  <th className="py-2.5 px-3">الحالة</th>
                  <th className="py-2.5 px-3">سيو Google</th>
                  <th className="py-2.5 px-3">الكلمات</th>
                  <th className="py-2.5 px-3">المشاهدات</th>
                  <th className="py-2.5 px-3">الإعجابات</th>
                  <th className="py-2.5 px-3 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2D9]">
                {currentNovelChapters.map(ch => (
                  <tr key={ch.id} className="hover:bg-[#F7F5EE] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#4A5D4E]">
                      {ch.chapterNumber}
                    </td>
                    <td className="py-3 px-3 font-bold text-[#2C2C2C]">
                      {ch.title}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#4A5D4E]/15 text-[#4A5D4E] border border-[#4A5D4E]/30">
                        {ch.status === 'PUBLISHED' ? 'منشور' : ch.status === 'DRAFT' ? 'مسودة' : 'مجدول'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {ch.seo?.noIndex ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          مستبعد
                        </span>
                      ) : (ch.seo?.metaTitle || ch.seo?.metaDescription) ? (
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 w-fit"
                          title={ch.seo.metaTitle || ch.seo.metaDescription}
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>سيو مخصص</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#F7F5EE] text-[#6E6A64] border border-[#E5E2D9]">
                          تلقائي
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-[#6E6A64]">
                      {ch.wordCount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-mono text-[#2C2C2C] font-bold">
                      {ch.views.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-mono text-rose-500 font-bold">
                      {ch.likes.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-left space-x-1.5 space-x-reverse">
                      <button
                        type="button"
                        id={`seo-btn-${ch.id}`}
                        onClick={() => handleEditChapter(ch, true)}
                        className="px-2 py-1 bg-[#4A5D4E]/10 hover:bg-[#4A5D4E]/20 text-[#4A5D4E] border border-[#4A5D4E]/30 rounded-lg text-xs transition-colors cursor-pointer"
                        title="تخصيص سيو هذا الفصل ومحركات البحث"
                      >
                        <Search className="w-3.5 h-3.5 inline" />
                      </button>
                      <button
                        type="button"
                        id={`edit-btn-${ch.id}`}
                        onClick={() => handleEditChapter(ch, false)}
                        className="px-2.5 py-1 bg-[#F7F5EE] hover:bg-[#E5E2D9] text-[#2C2C2C] border border-[#E5E2D9] rounded-lg text-xs transition-colors cursor-pointer"
                        title="تعديل الفصل"
                      >
                        <Edit3 className="w-3.5 h-3.5 inline" />
                      </button>
                      <button
                        type="button"
                        id={`delete-btn-${ch.id}`}
                        onClick={() => handleDeleteChapter(ch.id, ch.title)}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs transition-colors cursor-pointer"
                        title="حذف الفصل"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {chapterToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E5E2D9] rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 font-cairo">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-amiri font-bold text-xl text-[#2C2C2C] text-center mb-2">
              تأكيد حذف الفصل نهائياً
            </h3>
            <p className="text-xs text-[#6E6A64] text-center leading-relaxed mb-6">
              هل أنت متأكد من رغبتك في حذف فصل <strong className="text-[#2C2C2C]">"{chapterToDelete.title}"</strong>؟
              <br />
              <span className="text-rose-600 font-semibold block mt-1.5">
                سيتم حذفه من قاعدة البيانات السحابية والمتصفح ولن يتمكن القراء من قراءته بعد الآن.
              </span>
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setChapterToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-[#E5E2D9] text-[#2C2C2C] text-xs font-bold hover:bg-[#F7F5EE] transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeleteChapter}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>جاري الحذف...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>نعم، احذف نهائياً</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
