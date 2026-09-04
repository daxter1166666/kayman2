import React, { useState } from 'react';
import { Novel, NovelStatus, Genre, Category } from '../../types';
import { storageService } from '../../services/storageService';
import { supabaseService } from '../../services/supabaseService';
import { ImageUploadInput } from '../ImageUploadInput';
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
  FileText
} from 'lucide-react';

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
    setIsCreating(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      });
      const updated = storageService.getNovels().find(n => n.id === editingNovelId);
      if (updated) {
        supabaseService.saveNovelToSupabase(updated).then(res => {
          if (res) {
            showToast('تم تحديث بيانات الكتاب ومزامنته سحابياً مع سوباباس!');
          } else {
            showToast('تم الحفظ محلياً. تنبيه: لم يتم التحديث في سوباباس (تأكد من كود الصلاحيات).');
          }
        });
      } else {
        showToast('تم تحديث بيانات الكتاب بنجاح!');
      }
    } else {
      storageService.addNovel({
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
      });
      const created = storageService.getNovels().find(n => n.slug === slug);
      if (created) {
        supabaseService.saveNovelToSupabase(created).then(res => {
          if (res) {
            showToast('تمت إضافة الكتاب ومزامنته بنجاح مع سوباباس!');
          } else {
            showToast('تمت الإضافة محلياً. تنبيه: لم يتم الإرسال لسوباباس (تأكد من كود الصلاحيات).');
          }
        });
      } else {
        showToast('تمت إضافة الكتاب الجديد بنجاح!');
      }
    }

    setIsCreating(false);
    onRefreshData();
  };

  const handleDeleteNovel = async (id: string, novelTitle: string) => {
    if (window.confirm(`هل أنت متأكد من حذف عمل "${novelTitle}" وجميع فصوله ومراجعاته نهائياً؟`)) {
      storageService.deleteNovel(id);
      onRefreshData();
      showToast('جاري حذف الكتاب والفصول من سوباباس...');
      const cloudSuccess = await supabaseService.deleteNovelFromSupabase(id);
      if (cloudSuccess) {
        showToast(`تم حذف "${novelTitle}" وفصوله نهائياً من المتصفح وقاعدة البيانات السحابية!`);
      } else {
        showToast('تم الحذف محلياً. تنبيه: لم يتم الحذف من سوباباس (تأكد من كود الصلاحيات).');
      }
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
                    src={novel.coverImage}
                    alt={novel.title}
                    className="w-20 h-28 object-cover rounded-xl border border-[#E5E2D9] shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F7F5EE] text-[#4A5D4E] border border-[#E5E2D9]">
                        {novel.status === 'ONGOING' ? 'مستمر' : 'مكتمل'}
                      </span>
                      {novel.isFeatured && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#C88A3B] text-white">
                          مميز
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
    </div>
  );
};
