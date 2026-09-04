import React, { useState } from 'react';
import { Novel, NovelStatus, Genre, Category, TableOfContentItem, NovelSeoMeta } from '../../types';
import { storageService } from '../../services/storageService';
import { supabaseService } from '../../services/supabaseService';
import { DEFAULT_BOOK_COVER } from '../../data/initialData';
import { ImageUploadInput } from '../ImageUploadInput';
import { NovelSeoStudio } from './NovelSeoStudio';
import {
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  Sparkles,
  Star,
  Eye,
  Heart,
  Download,
  ExternalLink,
  FileText,
  RotateCcw,
  ListOrdered,
  ArrowUp,
  ArrowDown,
  FileCode,
  Layers,
  Bookmark,
  Search
} from 'lucide-react';
import { ResetDataModal } from './ResetDataModal';

interface NovelManagerTabProps {
  novels: Novel[];
  onRefreshData: () => void;
}

export const NovelManagerTab: React.FC<NovelManagerTabProps> = ({
  novels,
  onRefreshData,
}) => {
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [editingNovelId, setEditingNovelId] = useState<string | null>(null);

  const categories: Category[] = storageService.getCategories();

  // Form states
  const [title, setTitle] = useState<string>('');
  const [author, setAuthor] = useState<string>('');
  const [authorBio, setAuthorBio] = useState<string>('');
  const [synopsis, setSynopsis] = useState<string>('');
  const [coverImage, setCoverImage] = useState<string>('');
  const [bannerImage, setBannerImage] = useState<string>('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['فانتازيا وخيال']);
  const [tagsInput, setTagsInput] = useState<string>('');
  const [status, setStatus] = useState<NovelStatus>('ONGOING');
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [pdfDownloadUrl, setPdfDownloadUrl] = useState<string>('');
  const [pdfFileSize, setPdfFileSize] = useState<string>('');
  const [downloadButtonText, setDownloadButtonText] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);

  // Novel SEO states
  const [seoMetaTitle, setSeoMetaTitle] = useState<string>('');
  const [seoMetaDescription, setSeoMetaDescription] = useState<string>('');
  const [seoFocusKeywords, setSeoFocusKeywords] = useState<string>('');
  const [seoCanonicalUrl, setSeoCanonicalUrl] = useState<string>('');
  const [seoOgImage, setSeoOgImage] = useState<string>('');
  const [seoNoIndex, setSeoNoIndex] = useState<boolean>(false);
  const [seoAuthorName, setSeoAuthorName] = useState<string>('');

  // Table of Contents state
  const [tableOfContents, setTableOfContents] = useState<TableOfContentItem[]>([]);
  const [tocItemTitle, setTocItemTitle] = useState<string>('');
  const [tocItemPage, setTocItemPage] = useState<string>('');
  const [tocItemDesc, setTocItemDesc] = useState<string>('');
  const [tocItemUrl, setTocItemUrl] = useState<string>('');
  const [showBulkTocInput, setShowBulkTocInput] = useState<boolean>(false);
  const [tocBulkText, setTocBulkText] = useState<string>('');

  // Delete modal state
  const [novelToDelete, setNovelToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleStartCreate = () => {
    setEditingNovelId(null);
    setTitle('');
    setAuthor('أيمن كناني');
    setAuthorBio('مؤلف وباحث وكاتب');
    setSynopsis('');
    setCoverImage('');
    setBannerImage('');
    setSelectedGenres([categories[0]?.name || 'فكر وفلسفة']);
    setTagsInput('');
    setStatus('ONGOING');
    setIsFeatured(false);
    setPdfDownloadUrl('');
    setPdfFileSize('');
    setDownloadButtonText('');
    setTableOfContents([]);
    setTocItemTitle('');
    setTocItemPage('');
    setTocItemDesc('');
    setTocItemUrl('');
    // Reset SEO
    setSeoMetaTitle('');
    setSeoMetaDescription('');
    setSeoFocusKeywords('');
    setSeoCanonicalUrl('');
    setSeoOgImage('');
    setSeoNoIndex(false);
    setSeoAuthorName('');
    setIsCreating(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartEdit = (novel: Novel) => {
    setEditingNovelId(novel.id);
    setTitle(novel.title);
    setAuthor(novel.author);
    setAuthorBio(novel.authorBio);
    setSynopsis(novel.synopsis);
    setCoverImage(novel.coverImage);
    setBannerImage(novel.bannerImage);
    setSelectedGenres(novel.genres);
    setTagsInput(novel.tags.join('، '));
    setStatus(novel.status);
    setIsFeatured(novel.isFeatured || false);
    setPdfDownloadUrl(novel.pdfDownloadUrl || '');
    setPdfFileSize(novel.pdfFileSize || '');
    setDownloadButtonText(novel.downloadButtonText || '');
    setTableOfContents(novel.tableOfContents || []);
    setTocItemTitle('');
    setTocItemPage('');
    setTocItemDesc('');
    setTocItemUrl('');
    // Populate SEO
    setSeoMetaTitle(novel.seo?.metaTitle || '');
    setSeoMetaDescription(novel.seo?.metaDescription || '');
    setSeoFocusKeywords(novel.seo?.focusKeywords || '');
    setSeoCanonicalUrl(novel.seo?.canonicalUrl || '');
    setSeoOgImage(novel.seo?.ogImage || '');
    setSeoNoIndex(novel.seo?.noIndex || false);
    setSeoAuthorName(novel.seo?.authorName || '');
    setIsCreating(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Table of Contents Handlers
  const handleAddTocItem = () => {
    if (!tocItemTitle.trim()) return;
    const newItem: TableOfContentItem = {
      id: `toc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: tocItemTitle.trim(),
      pageNumber: tocItemPage.trim() || undefined,
      description: tocItemDesc.trim() || undefined,
      linkUrl: tocItemUrl.trim() || undefined,
    };
    setTableOfContents([...tableOfContents, newItem]);
    setTocItemTitle('');
    setTocItemPage('');
    setTocItemDesc('');
    setTocItemUrl('');
  };

  const handleRemoveTocItem = (id: string) => {
    setTableOfContents(tableOfContents.filter(item => item.id !== id));
  };

  const handleMoveTocItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= tableOfContents.length) return;
    const updated = [...tableOfContents];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setTableOfContents(updated);
  };

  const handleBulkParseToc = () => {
    if (!tocBulkText.trim()) return;
    const lines = tocBulkText.split('\n').map(l => l.trim()).filter(Boolean);
    const parsed: TableOfContentItem[] = [];

    lines.forEach((line, idx) => {
      let pageNumber = '';
      let title = line;

      const match = line.match(/(?:[-|–—:]\s*(?:ص|صفحة|page|p\.?)?\s*(\d+))|(?:(?:ص|صفحة)\s*(\d+))/i);
      if (match) {
        pageNumber = `ص ${match[1] || match[2]}`;
        title = line.replace(match[0], '').replace(/[-|–—:]\s*$/, '').trim();
      }

      parsed.push({
        id: `toc-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        title: title || line,
        pageNumber: pageNumber || undefined,
      });
    });

    if (parsed.length > 0) {
      setTableOfContents([...tableOfContents, ...parsed]);
      setTocBulkText('');
      setShowBulkTocInput(false);
      showToast(`تمت إضافة ${parsed.length} بنداً إلى فهرس الكتاب بنجاح!`);
    }
  };

  const handleGenreToggle = (genreName: string) => {
    if (selectedGenres.includes(genreName)) {
      if (selectedGenres.length > 1) {
        setSelectedGenres(selectedGenres.filter(g => g !== genreName));
      }
    } else {
      setSelectedGenres([...selectedGenres, genreName]);
    }
  };

  const handleSaveNovel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('يرجى إدخال عنوان الكتاب أو المؤلف');
      return;
    }
    if (!synopsis.trim()) {
      alert('يرجى كتابة نبذة وملخص عن الكتاب');
      return;
    }

    const tags = tagsInput
      .split(/[,،]/)
      .map(t => t.trim())
      .filter(Boolean);

    const slug = title.toLowerCase().replace(/[^a-z0-9\u0621-\u064A]+/g, '-');

    const novelSeo: NovelSeoMeta | undefined = (
      seoMetaTitle.trim() ||
      seoMetaDescription.trim() ||
      seoFocusKeywords.trim() ||
      seoCanonicalUrl.trim() ||
      seoOgImage.trim() ||
      seoNoIndex ||
      seoAuthorName.trim()
    ) ? {
      metaTitle: seoMetaTitle.trim() || undefined,
      metaDescription: seoMetaDescription.trim() || undefined,
      focusKeywords: seoFocusKeywords.trim() || undefined,
      canonicalUrl: seoCanonicalUrl.trim() || undefined,
      ogImage: seoOgImage.trim() || undefined,
      noIndex: seoNoIndex || undefined,
      authorName: seoAuthorName.trim() || undefined,
    } : undefined;

    if (editingNovelId) {
      storageService.updateNovel(editingNovelId, {
        title: title.trim(),
        slug,
        author: author.trim(),
        authorBio: authorBio.trim(),
        synopsis: synopsis.trim(),
        coverImage: coverImage.trim() || 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?q=80&w=800&auto=format&fit=crop',
        bannerImage: bannerImage.trim() || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
        genres: selectedGenres as any,
        tags,
        status,
        isFeatured,
        pdfDownloadUrl: pdfDownloadUrl.trim() || undefined,
        pdfFileSize: pdfFileSize.trim() || undefined,
        downloadButtonText: downloadButtonText.trim() || undefined,
        tableOfContents: tableOfContents.length > 0 ? tableOfContents : undefined,
        seo: novelSeo,
      });
      const updated = storageService.getNovels().find(n => n.id === editingNovelId);
      if (updated) {
        supabaseService.saveNovelToSupabase(updated).then(res => {
          if (res) {
            showToast('تم تحديث بيانات وسيو الكتاب ومزامنته سحابياً بنجاح!');
          } else {
            showToast('تم الحفظ محلياً. تنبيه: لم يتم التحديث في سوباباس (تأكد من كود الصلاحيات).');
          }
        });
      } else {
        showToast('تم تحديث بيانات الكتاب بنجاح!');
      }
    } else {
      const created = storageService.addNovel({
        title: title.trim(),
        slug,
        author: author.trim() || 'أيمن كناني',
        authorBio: authorBio.trim() || 'مؤلف معتمد على المنصة',
        synopsis: synopsis.trim(),
        coverImage: coverImage.trim() || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
        bannerImage: bannerImage.trim() || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop',
        genres: selectedGenres as any,
        tags: tags.length > 0 ? tags : ['فكر', 'مؤلفات'],
        status,
        isFeatured,
        pdfDownloadUrl: pdfDownloadUrl.trim() || undefined,
        pdfFileSize: pdfFileSize.trim() || undefined,
        downloadButtonText: downloadButtonText.trim() || undefined,
        tableOfContents: tableOfContents.length > 0 ? tableOfContents : undefined,
        seo: novelSeo,
      });
      if (created) {
        supabaseService.saveNovelToSupabase(created).then(res => {
          if (res) {
            showToast('تمت إضافة الكتاب وإعدادات السيو ومزامنته بنجاح مع سوباباس!');
          } else {
            showToast('تمت الإضافة ومحفوظ بأمان محلياً، وسيتزامن تلقائياً مع السحابة.');
          }
        });
      } else {
        showToast('تمت إضافة الكتاب الجديد بنجاح!');
      }
    }

    setIsCreating(false);
    onRefreshData();
  };

  const handleDeleteNovel = (id: string, novelTitle: string) => {
    setNovelToDelete({ id, title: novelTitle });
  };

  const handleConfirmDelete = async () => {
    if (!novelToDelete) return;
    setIsDeleting(true);
    const { id, title: delTitle } = novelToDelete;
    
    try {
      // 1. Immediately delete locally and refresh UI
      storageService.deleteNovel(id);
      onRefreshData();

      // 2. Delete permanently from Supabase
      showToast(`جاري حذف "${delTitle}" من قاعدة البيانات السحابية...`);
      const cloudSuccess = await supabaseService.deleteNovelFromSupabase(id);
      if (cloudSuccess) {
        showToast(`تم حذف كتاب "${delTitle}" وفصوله نهائياً من المتصفح وقاعدة البيانات السحابية!`);
      } else {
        showToast(`تم الحذف من المتصفح. تنبيه: لم يتم الحذف السحابي.`);
      }
    } catch (err) {
      console.error('Delete error:', err);
      showToast('حدث خطأ أثناء محاولة الحذف.');
    } finally {
      setIsDeleting(false);
      setNovelToDelete(null);
      onRefreshData();
    }
  };

  return (
    <div className="space-y-8 text-[#2C2C2C] font-cairo">
      {/* Toast */}
      {notification && (
        <div className="fixed bottom-6 left-6 z-50 bg-[#4A5D4E] text-[#FDFCF8] px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs">
        <div>
          <h2 className="font-amiri font-bold text-xl text-[#2C2C2C] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#4A5D4E]" />
            <span>إدارة الكتب والمؤلفات والكتالوج</span>
          </h2>
          <p className="text-xs text-[#6E6A64]">
            أنشئ مؤلفات جديدة، حدث الأغلفة العمودية الفاخرة، واكتب النبذات والملخصات لإثراء مكتبتك.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            id="novel-manager-reset-btn"
            onClick={() => setIsResetModalOpen(true)}
            className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="مسح التخزين المحلي وإعادة سحب الكتب المحدثة فقط من سوباباس"
          >
            <RotateCcw className="w-4 h-4 text-rose-600" />
            <span>إعادة ضبط وتحديث الكتب</span>
          </button>

          <button
            type="button"
            id="create-new-novel-btn"
            onClick={handleStartCreate}
            className="px-4 py-2.5 bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8] font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مؤلف / كتاب جديد</span>
          </button>
        </div>
      </div>

      {/* Create / Edit Form Modal / Panel */}
      {isCreating && (
        <form
          onSubmit={handleSaveNovel}
          className="p-6 rounded-3xl bg-[#FFFFFF] border-2 border-[#4A5D4E]/40 space-y-6 shadow-xl animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-3">
            <h3 className="font-amiri font-bold text-lg text-[#2C2C2C] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#4A5D4E]" />
              <span>{editingNovelId ? 'تعديل تفاصيل الكتاب' : 'إضافة كتاب / مؤلَف جديد'}</span>
            </h3>
            <button
              type="button"
              id="close-novel-form-btn"
              onClick={() => setIsCreating(false)}
              className="text-xs text-[#6E6A64] hover:text-[#2C2C2C] px-2.5 py-1 rounded-lg bg-[#F7F5EE] border border-[#E5E2D9] cursor-pointer font-bold"
            >
              إلغاء
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title */}
            <div>
              <label className="text-xs font-bold text-[#2C2C2C] block mb-1">
                عنوان الكتاب أو العمل *
              </label>
              <input
                type="text"
                id="novel-title-input"
                placeholder="مثال: رحلة في أعماق الفكر الإنساني"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] font-amiri font-bold"
                required
              />
            </div>

            {/* Author */}
            <div>
              <label className="text-xs font-bold text-[#2C2C2C] block mb-1">
                اسم الكاتب / المؤلف *
              </label>
              <input
                type="text"
                id="novel-author-input"
                placeholder="اسم الكاتب أو المترجم"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E]"
                required
              />
            </div>

            {/* Author Bio */}
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-[#2C2C2C] block mb-1">
                نبذة تعريفية عن المؤلف
              </label>
              <input
                type="text"
                id="novel-author-bio-input"
                placeholder="كاتب وباحث في الفكر العربي، صدرت له عدة مؤلفات..."
                value={authorBio}
                onChange={e => setAuthorBio(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C]"
              />
            </div>

            {/* Cover Image Upload (From Computer or URL) */}
            <div className="md:col-span-1">
              <ImageUploadInput
                label="غلاف الكتاب العمودي الفاخر (نسبة 2:3)"
                subLabel="ارفع صورة الغلاف مباشرة من حاسوبك أو ضع رابط صورة"
                value={coverImage}
                onChange={setCoverImage}
                aspectRatio="2/3"
                placeholder="https://images.unsplash.com/..."
                presets={[
                  { title: 'كتاب الفكر والتاريخ', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop' },
                  { title: 'العلوم والمستقبل', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop' },
                  { title: 'الأدب والفلسفة', url: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?q=80&w=800&auto=format&fit=crop' },
                  { title: 'روايات المغامرة', url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop' },
                ]}
              />
            </div>

            {/* Banner Image Upload (From Computer or URL) */}
            <div className="md:col-span-1">
              <ImageUploadInput
                label="صورة خلفية البانر العريض (لصفحة الكتاب)"
                subLabel="ارفع خلفية المشهد العريضة من حاسوبك أو ضع رابط صورة"
                value={bannerImage}
                onChange={setBannerImage}
                aspectRatio="16/9"
                placeholder="https://images.unsplash.com/..."
                presets={[
                  { title: 'مكتبة كلاسيكية', url: 'https://images.unsplash.com/photo-1507842229451-79b1be886a29?q=80&w=1600&auto=format&fit=crop' },
                  { title: 'الفضاء والنجوم', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop' },
                  { title: 'قلعة وحضارة', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop' },
                ]}
              />
            </div>

            {/* Status & Featured */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-xs font-bold text-[#2C2C2C] block mb-1">
                  حالة النشر
                </label>
                <select
                  id="novel-status-select"
                  value={status}
                  onChange={e => setStatus(e.target.value as NovelStatus)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] font-bold cursor-pointer"
                >
                  <option value="ONGOING">مستمرة (نشر أسبوعي/دوري فعال)</option>
                  <option value="COMPLETED">مكتملة</option>
                  <option value="HIATUS">متوقفة مؤقتاً</option>
                </select>
              </div>

              <div className="pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#2C2C2C]">
                  <input
                    type="checkbox"
                    id="novel-featured-checkbox"
                    checked={isFeatured}
                    onChange={e => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 accent-[#4A5D4E]"
                  />
                  <span>تمييز في الصفحة الرئيسية</span>
                </label>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="text-xs font-bold text-[#2C2C2C] block mb-1">
                الوسوم والكلمات الدلالية (مفصولة بفواصل)
              </label>
              <input
                type="text"
                id="novel-tags-input"
                placeholder="فكر, فلسفة, تاريخ, تطوير ذات"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C]"
              />
            </div>

            {/* Book Download Settings (PDF / Direct Cloud Link) */}
            <div className="md:col-span-2 p-4 sm:p-5 rounded-2xl bg-[#C88A3B]/5 border border-[#C88A3B]/25 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#965A15]">
                  <Download className="w-4 h-4 text-[#C88A3B]" />
                  <span>خاصية تنزيل وتحميل الكتاب للقراء (Book Download Link)</span>
                </div>
                <span className="text-[11px] text-[#6E6A64]">
                  (اختياري - سيظهر زر تنزيل بارز للقراء في صفحة الكتاب)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* Download URL */}
                <div className="sm:col-span-6">
                  <label className="text-[11px] font-bold text-[#2C2C2C] block mb-1">
                    رابط تحميل الكتاب المباشر (Google Drive / MediaFire / رابط سحابي) *
                  </label>
                  <input
                    type="url"
                    id="novel-pdf-url-input"
                    placeholder="https://drive.google.com/... أو https://mediafire.com/..."
                    value={pdfDownloadUrl}
                    onChange={e => setPdfDownloadUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FFFFFF] border border-[#E5E2D9] text-[#2C2C2C] focus:border-[#4A5D4E] focus:outline-none font-mono"
                    dir="ltr"
                  />
                </div>

                {/* Custom Button Text */}
                <div className="sm:col-span-3">
                  <label className="text-[11px] font-bold text-[#2C2C2C] block mb-1">
                    نص زر التنزيل
                  </label>
                  <input
                    type="text"
                    id="novel-download-btn-text-input"
                    placeholder="تحميل الكتاب PDF"
                    value={downloadButtonText}
                    onChange={e => setDownloadButtonText(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FFFFFF] border border-[#E5E2D9] text-[#2C2C2C] focus:border-[#4A5D4E] focus:outline-none"
                  />
                </div>

                {/* File Size */}
                <div className="sm:col-span-3">
                  <label className="text-[11px] font-bold text-[#2C2C2C] block mb-1">
                    حجم الملف (اختياري)
                  </label>
                  <input
                    type="text"
                    id="novel-pdf-size-input"
                    placeholder="مثال: 12.5 MB"
                    value={pdfFileSize}
                    onChange={e => setPdfFileSize(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FFFFFF] border border-[#E5E2D9] text-[#2C2C2C] focus:border-[#4A5D4E] focus:outline-none"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Test Download Link & Instructions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#C88A3B]/15">
                <p className="text-[11px] text-[#6E6A64] leading-relaxed">
                  💡 <strong>ملاحظة:</strong> عند وضع الرابط، سينتقل القارئ مباشرة إلى رابط التحميل أو سيبدأ تنزيل الملف فوراً عند الضغط على الزر.
                </p>
                {pdfDownloadUrl && (
                  <a
                    href={pdfDownloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-[#C88A3B] hover:bg-[#B3782E] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>تجربة واختبار رابط التنزيل</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Dynamic Categories Selection */}
          <div>
            <label className="text-xs font-bold text-[#2C2C2C] block mb-2">
              الأقسام والتصنيفات (اختر كل ما ينطبق)
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map(c => {
                const selected = selectedGenres.includes(c.name) || selectedGenres.includes(c.arabicName);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleGenreToggle(c.name)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                      selected
                        ? 'bg-[#4A5D4E] text-[#FDFCF8] border-[#4A5D4E]'
                        : 'bg-[#F7F5EE] text-[#6E6A64] border-[#E5E2D9] hover:border-[#4A5D4E]'
                    }`}
                  >
                    {c.arabicName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Synopsis */}
          <div>
            <label className="text-xs font-bold text-[#2C2C2C] block mb-1">
              نبذة وملخص عن الكتاب *
            </label>
            <textarea
              id="novel-synopsis-textarea"
              rows={4}
              placeholder="اكتب نبذة شيقة وموجزة عن فكرة الكتاب أو موضوعاته الرئيسية..."
              value={synopsis}
              onChange={e => setSynopsis(e.target.value)}
              className="w-full p-3.5 text-xs rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] leading-relaxed"
              required
            />
          </div>

          {/* Manual Table of Contents (فهرس محتويات الكتاب) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FDFCF8] border border-[#E5E2D9] space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E2D9] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#4A5D4E]/10 text-[#4A5D4E] flex items-center justify-center font-bold">
                  <ListOrdered className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#2C2C2C] flex items-center gap-2">
                    <span>فهرس محتويات وأبواب الكتاب (يدوي)</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#4A5D4E]/15 text-[#4A5D4E] font-bold">
                      {tableOfContents.length} بند
                    </span>
                  </h4>
                  <p className="text-[11px] text-[#6E6A64]">
                    مخصص للكتب التي لا تعتمد نظام الفصول (كتب كاملة، دراسات، إصدارات PDF، أو مؤلفات مقسمة لأبواب ومباحث).
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowBulkTocInput(!showBulkTocInput)}
                className="px-3 py-1.5 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] hover:bg-[#F7F5EE] text-[11px] font-bold text-[#4A5D4E] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs self-start sm:self-auto"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{showBulkTocInput ? 'إدخال بند ببند' : 'إضافة سريعة بالنسخ واللصق'}</span>
              </button>
            </div>

            {/* Bulk Mode vs Single Add Mode */}
            {showBulkTocInput ? (
              <div className="space-y-2 p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E2D9]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2C2C2C]">
                    الصق سطور الفهرس هنا (كل سطر يمثل بنداً أو فصلاً):
                  </label>
                  <span className="text-[10px] text-[#6E6A64]">
                    مثال: المقدمة - ص 5
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={tocBulkText}
                  onChange={e => setTocBulkText(e.target.value)}
                  placeholder={`المقدمة: مدخل عام - ص 7&#10;الباب الأول: تطور المفهوم والأصل التاريخي - ص 21&#10;الباب الثاني: النظريات والتحليل الفلسفي - ص 58&#10;خاتمة وتوصيات - ص 115`}
                  className="w-full p-3 text-xs rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] font-mono leading-relaxed"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleBulkParseToc}
                    disabled={!tocBulkText.trim()}
                    className="px-4 py-2 bg-[#4A5D4E] hover:bg-[#3C4C3F] disabled:opacity-50 text-[#FDFCF8] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>تحويل النص إلى بنود الفهرس</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E2D9] space-y-3">
                <span className="text-xs font-bold text-[#2C2C2C] block">
                  إضافة بند جديد للفهرس:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <div className="sm:col-span-6">
                    <input
                      type="text"
                      value={tocItemTitle}
                      onChange={e => setTocItemTitle(e.target.value)}
                      placeholder="عنوان الباب / الفصل / المبحث (مثال: المقدمة العامة)"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E]"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTocItem();
                        }
                      }}
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      value={tocItemPage}
                      onChange={e => setTocItemPage(e.target.value)}
                      placeholder="رقم الصفحة (مثال: ص 15)"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E]"
                    />
                  </div>
                  <div className="sm:col-span-3 flex">
                    <button
                      type="button"
                      onClick={handleAddTocItem}
                      disabled={!tocItemTitle.trim()}
                      className="w-full px-3 py-2 bg-[#4A5D4E] hover:bg-[#3C4C3F] disabled:opacity-50 text-[#FDFCF8] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة للفهرس</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <input
                    type="text"
                    value={tocItemDesc}
                    onChange={e => setTocItemDesc(e.target.value)}
                    placeholder="نبذة موجزة عن هذا البند (اختياري)"
                    className="w-full px-3 py-1.5 text-[11px] rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E]"
                  />
                  <input
                    type="url"
                    value={tocItemUrl}
                    onChange={e => setTocItemUrl(e.target.value)}
                    placeholder="رابط خارجي أو مرجع (اختياري)"
                    className="w-full px-3 py-1.5 text-[11px] rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E]"
                  />
                </div>
              </div>
            )}

            {/* TOC Items List */}
            {tableOfContents.length === 0 ? (
              <div className="text-center py-6 px-4 rounded-xl border border-dashed border-[#E5E2D9] bg-[#FFFFFF]/60">
                <Bookmark className="w-8 h-8 text-[#D0CCC2] mx-auto mb-2" />
                <p className="text-xs font-bold text-[#6E6A64]">
                  لا يوجد بنود في فهرس هذا الكتاب حتى الآن
                </p>
                <p className="text-[11px] text-[#8E8A83] mt-0.5">
                  أضف بنود الفهرس (الأبواب، المباحث، المقالات، أو أرقام الصفحات) لتظهر للقراء بوضوح وتسهل تصفح الكتاب.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {tableOfContents.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#FFFFFF] border border-[#E5E2D9] hover:border-[#4A5D4E]/40 transition-all shadow-2xs group"
                  >
                    <div className="flex items-center gap-2.5 truncate min-w-0 flex-1">
                      <span className="w-6 h-6 rounded-lg bg-[#F7F5EE] text-[#6E6A64] text-[11px] font-mono font-bold flex items-center justify-center shrink-0 border border-[#E5E2D9]">
                        {index + 1}
                      </span>
                      <div className="truncate min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#2C2C2C] truncate">
                            {item.title}
                          </span>
                          {item.pageNumber && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#C88A3B]/10 text-[#965A15] shrink-0 border border-[#C88A3B]/20 font-mono">
                              {item.pageNumber}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-[11px] text-[#6E6A64] truncate">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveTocItem(index, 'up')}
                        disabled={index === 0}
                        className="p-1 rounded-lg hover:bg-[#F7F5EE] disabled:opacity-30 text-[#6E6A64] cursor-pointer"
                        title="تحريك لأعلى"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveTocItem(index, 'down')}
                        disabled={index === tableOfContents.length - 1}
                        className="p-1 rounded-lg hover:bg-[#F7F5EE] disabled:opacity-30 text-[#6E6A64] cursor-pointer"
                        title="تحريك لأسفل"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveTocItem(item.id)}
                        className="p-1 rounded-lg hover:bg-rose-50 text-rose-600 cursor-pointer transition-colors"
                        title="حذف هذا البند"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Novel SEO Studio (إعدادات سيو وفهرسة هذه الرواية) */}
          <NovelSeoStudio
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
            authorName={seoAuthorName}
            setAuthorName={setSeoAuthorName}
            novelTitle={title}
            novelAuthor={author}
            novelSynopsis={synopsis}
            novelGenres={selectedGenres}
            novelCoverImage={coverImage}
            novelId={editingNovelId || undefined}
            pdfDownloadUrl={pdfDownloadUrl}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-[#E5E2D9]">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-xs font-bold text-[#6E6A64] hover:text-[#2C2C2C] cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              id="save-novel-submit-btn"
              className="px-6 py-2.5 bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8] text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              {editingNovelId ? 'حفظ التعديلات' : 'نشر العمل في المكتبة'}
            </button>
          </div>
        </form>
      )}

      {/* Novels List Grid */}
      {novels.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs">
          <BookOpen className="w-10 h-10 mx-auto text-[#4A5D4E]/40 mb-3" />
          <h4 className="font-amiri font-bold text-lg text-[#2C2C2C] mb-1">
            لا توجد كتب أو مؤلفات مسجلة بعد
          </h4>
          <p className="text-xs text-[#6E6A64] max-w-md mx-auto mb-4">
            الموقع مهيأ ونظيف تماماً بدون أي بيانات وهمية. انقر على زر "إضافة كتاب / مؤلف جديد" بالأعلى لإضافة أول كتاب حقيقي.
          </p>
          <button
            type="button"
            onClick={handleStartCreate}
            className="px-4 py-2 bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8] text-xs font-bold rounded-xl cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة أول كتاب الآن</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {novels.map(novel => (
            <div
              key={novel.id}
              className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs flex flex-col justify-between group hover:border-[#4A5D4E]/40 transition-all"
            >
              <div>
                <div className="flex gap-4 mb-4">
                  <img
                    src={novel.coverImage?.trim() || DEFAULT_BOOK_COVER}
                    alt={novel.title}
                    className="w-20 h-28 object-cover rounded-xl border border-[#E5E2D9] shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F7F5EE] text-[#4A5D4E] border border-[#E5E2D9]">
                        {novel.status === 'ONGOING' ? 'مستمر' : 'مكتمل'}
                      </span>
                      {novel.isFeatured && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#C88A3B] text-white">
                          مميز
                        </span>
                      )}
                      {novel.seo?.metaTitle || novel.seo?.metaDescription || novel.seo?.focusKeywords ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <Search className="w-2.5 h-2.5 text-emerald-600" />
                          <span>سيو مخصص</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F7F5EE] text-[#6E6A64] border border-[#E5E2D9] flex items-center gap-1">
                          <Search className="w-2.5 h-2.5 text-[#8E8A83]" />
                          <span>سيو تلقائي</span>
                        </span>
                      )}
                      {novel.seo?.noIndex && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          noindex
                        </span>
                      )}
                    </div>
                    <h3 className="font-amiri font-bold text-base text-[#2C2C2C] line-clamp-1">
                      {novel.title}
                    </h3>
                    <p className="text-xs text-[#8C5E45] mt-0.5">بقلم: {novel.author}</p>
                    <div className="flex items-center gap-3 text-[11px] text-[#6E6A64] mt-2">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-[#C88A3B] fill-[#C88A3B]" />
                        <span>{novel.rating.toFixed(1)}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-[#4A5D4E]" />
                        <span>{novel.totalViews}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-rose-500" />
                        <span>{novel.totalLikes}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#6E6A64] line-clamp-2 mb-4 leading-relaxed">
                  {novel.synopsis}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E2D9]">
                <button
                  type="button"
                  onClick={() => {
                    handleStartEdit(novel);
                    setTimeout(() => {
                      document.getElementById('novel-seo-meta-title')?.focus();
                    }, 150);
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#C88A3B] hover:bg-[#C88A3B]/10 flex items-center gap-1 cursor-pointer transition-colors"
                  title="تعديل وسوم سيو الرواية ومعاينة مظهرها في Google"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>السيو</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleStartEdit(novel)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#4A5D4E] hover:bg-[#4A5D4E]/10 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>تعديل</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteNovel(novel.id, novel.title)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-700 hover:bg-rose-50 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {novelToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E5E2D9] rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 font-cairo">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-amiri font-bold text-xl text-[#2C2C2C] text-center mb-2">
              تأكيد حذف الكتاب نهائياً
            </h3>
            <p className="text-xs text-[#6E6A64] text-center leading-relaxed mb-6">
              هل أنت متأكد من رغبتك في حذف عمل <strong className="text-[#2C2C2C]">"{novelToDelete.title}"</strong> وجميع فصوله ومراجعاته نهائياً؟
              <br />
              <span className="text-rose-600 font-semibold block mt-1.5">
                سيتم حذفه من قاعدة البيانات السحابية والمتصفح ولن يتمكن القراء من رؤيته بعد الآن.
              </span>
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setNovelToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-[#E5E2D9] text-[#2C2C2C] text-xs font-bold hover:bg-[#F7F5EE] transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
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

      {/* Reset Data Confirmation & Execution Modal */}
      <ResetDataModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onSuccess={() => {
          onRefreshData();
          showToast('تمت إعادة ضبط البيانات بنجاح وسحب الكتب المحدثة فقط!');
        }}
      />
    </div>
  );
};
