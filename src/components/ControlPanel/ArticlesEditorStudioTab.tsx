import React, { useState, useEffect, useMemo } from 'react';
import { IntellectualItem } from '../../types';
import { storageService } from '../../services/storageService';
import { supabaseService } from '../../services/supabaseService';
import { RichTextEditor } from '../RichTextEditor/RichTextEditor';
import { ChapterSeoStudio } from './ChapterSeoStudio';
import {
  FileText,
  Save,
  Sparkles,
  FilePlus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Tag,
  BookOpen,
  GraduationCap,
  Lightbulb,
  Feather,
  Compass,
  Atom,
  Eye,
  Trash2,
  RotateCcw,
  Check,
  Bookmark,
  Share2,
  Search,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

interface ArticlesEditorStudioTabProps {
  onRefreshData?: () => void;
  onNavigateTab?: (tab: string) => void;
}

const PRESET_CATEGORIES = [
  { label: 'فكر وفلسفة', icon: Lightbulb },
  { label: 'دراسات وبحوث', icon: GraduationCap },
  { label: 'أدب ونقد', icon: Feather },
  { label: 'مقالات دينية وفكر إسلامي', icon: Compass },
  { label: 'مقالات علمية ومعرفية', icon: Atom },
];

export const ArticlesEditorStudioTab: React.FC<ArticlesEditorStudioTabProps> = ({
  onRefreshData,
  onNavigateTab,
}) => {
  const [articles, setArticles] = useState<IntellectualItem[]>(() => {
    return storageService.getArticles().filter(a => a.type === 'article' || a.type === 'study');
  });

  const [selectedArticleId, setSelectedArticleId] = useState<string>('new');
  const [type, setType] = useState<'article' | 'study'>('article');
  const [title, setTitle] = useState<string>('');
  const [subtitle, setSubtitle] = useState<string>('');
  const [author, setAuthor] = useState<string>('أيمن كناني');
  const [category, setCategory] = useState<string>('فكر وفلسفة');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [isCustomCategory, setIsCustomCategory] = useState<boolean>(false);
  const [tagsInput, setTagsInput] = useState<string>('فلسفة, فكر معاصر, وعي');
  const [readingTime, setReadingTime] = useState<number>(10);
  const [coverImage, setCoverImage] = useState<string>('');
  const [abstract, setAbstract] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [referencesInput, setReferencesInput] = useState<string>('');
  const [deweyDecimal, setDeweyDecimal] = useState<string>('');
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  // Article-Level SEO State
  const [seoMetaTitle, setSeoMetaTitle] = useState<string>('');
  const [seoMetaDescription, setSeoMetaDescription] = useState<string>('');
  const [seoFocusKeywords, setSeoFocusKeywords] = useState<string>('');
  const [seoCanonicalUrl, setSeoCanonicalUrl] = useState<string>('');
  const [seoOgImage, setSeoOgImage] = useState<string>('');
  const [seoNoIndex, setSeoNoIndex] = useState<boolean>(false);
  const [isSeoStudioOpen, setIsSeoStudioOpen] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshArticleList = () => {
    const list = storageService.getArticles().filter(a => a.type === 'article' || a.type === 'study');
    setArticles(list);
    if (onRefreshData) onRefreshData();
  };

  // When selection changes
  const handleSelectArticle = (id: string) => {
    setSelectedArticleId(id);
    if (id === 'new') {
      setType('article');
      setTitle('');
      setSubtitle('');
      setAuthor('أيمن كناني');
      setCategory('فكر وفلسفة');
      setIsCustomCategory(false);
      setCustomCategory('');
      setTagsInput('فكر, فلسفة, وعي');
      setReadingTime(10);
      setCoverImage('');
      setAbstract('');
      setContent('');
      setReferencesInput('');
      setDeweyDecimal('');
      setIsFeatured(false);
      setSeoMetaTitle('');
      setSeoMetaDescription('');
      setSeoFocusKeywords('');
      setSeoCanonicalUrl('');
      setSeoOgImage('');
      setSeoNoIndex(false);
      setIsSeoStudioOpen(false);
    } else {
      const item = articles.find(a => a.id === id);
      if (item) {
        setType(item.type === 'study' ? 'study' : 'article');
        setTitle(item.title);
        setSubtitle(item.subtitle || '');
        setAuthor(item.author || 'أيمن كناني');
        const matchPreset = PRESET_CATEGORIES.some(c => c.label === item.category);
        if (matchPreset) {
          setCategory(item.category);
          setIsCustomCategory(false);
          setCustomCategory('');
        } else {
          setCategory('custom');
          setIsCustomCategory(true);
          setCustomCategory(item.category);
        }
        setTagsInput(item.tags ? item.tags.join(', ') : '');
        setReadingTime(item.readingTimeMinutes || 10);
        setCoverImage(item.coverImage || '');
        setAbstract(item.abstract || '');
        setContent(item.content || '');
        setReferencesInput(item.references ? item.references.join('\n') : '');
        setDeweyDecimal(item.deweyDecimal || '');
        setIsFeatured(Boolean(item.isFeatured));
        setSeoMetaTitle(item.seo?.metaTitle || '');
        setSeoMetaDescription(item.seo?.metaDescription || '');
        setSeoFocusKeywords(item.seo?.focusKeywords || '');
        setSeoCanonicalUrl(item.seo?.canonicalUrl || '');
        setSeoOgImage(item.seo?.ogImage || '');
        setSeoNoIndex(Boolean(item.seo?.noIndex));
      }
    }
  };

  // Auto-calculate estimated reading time based on content length
  useEffect(() => {
    const textLength = content.replace(/<[^>]*>?/gm, '').length;
    if (textLength > 100) {
      const estimatedMinutes = Math.max(3, Math.round(textLength / 450));
      setReadingTime(estimatedMinutes);
    }
  }, [content]);

  // Handle Save
  const handleSaveArticle = async () => {
    if (!title.trim()) {
      showToast('يرجى كتابة عنوان المقال أو الدراسة أولاً.');
      return;
    }
    if (!content.trim()) {
      showToast('يرجى كتابة محتوى المقال في المحرر قبل الحفظ.');
      return;
    }

    const finalCategory = isCustomCategory ? (customCategory.trim() || 'فكر عام') : category;
    const tags = tagsInput
      .split(/[,،]/)
      .map(t => t.trim())
      .filter(Boolean);
    const references = referencesInput
      .split('\n')
      .map(r => r.trim())
      .filter(Boolean);

    const seoMeta = {
      metaTitle: seoMetaTitle.trim() || undefined,
      metaDescription: seoMetaDescription.trim() || undefined,
      focusKeywords: seoFocusKeywords.trim() || undefined,
      canonicalUrl: seoCanonicalUrl.trim() || undefined,
      ogImage: seoOgImage.trim() || undefined,
      noIndex: seoNoIndex,
    };

    setIsSaving(true);

    try {
      if (selectedArticleId !== 'new') {
        // Update existing
        storageService.updateArticle(selectedArticleId, {
          title: title.trim(),
          subtitle: subtitle.trim() || undefined,
          type,
          author: author.trim() || 'أيمن كناني',
          category: finalCategory,
          tags,
          readingTimeMinutes: readingTime,
          coverImage: coverImage.trim() || undefined,
          abstract: abstract.trim() || undefined,
          content: content.trim(),
          references,
          deweyDecimal: deweyDecimal.trim() || undefined,
          isFeatured,
          seo: seoMeta,
        });

        const updated = storageService.getArticleById(selectedArticleId);
        if (updated) {
          await supabaseService.saveArticleToSupabase(updated);
        }
        showToast('تم حفظ التعديلات وتحديث المقال ومزامنته سحابياً بنجاح!');
      } else {
        // Create new article/study
        const slug = title
          .trim()
          .toLowerCase()
          .replace(/[^\u0621-\u064A\w]+/g, '-')
          .replace(/^-+|-+$/g, '') || `article-${Date.now()}`;

        const newArticle = storageService.addArticle({
          title: title.trim(),
          subtitle: subtitle.trim() || undefined,
          slug,
          type,
          author: author.trim() || 'أيمن كناني',
          category: finalCategory,
          tags,
          readingTimeMinutes: readingTime,
          coverImage: coverImage.trim() || undefined,
          abstract: abstract.trim() || undefined,
          content: content.trim(),
          references,
          deweyDecimal: deweyDecimal.trim() || undefined,
          isFeatured,
          seo: seoMeta,
          publishedAt: new Date().toISOString().split('T')[0],
        });

        await supabaseService.saveArticleToSupabase(newArticle);
        setSelectedArticleId(newArticle.id);
        showToast('تم إنشاء المقال الجديد ونشره ومزامنته سحابياً بنجاح!');
      }

      refreshArticleList();
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء الحفظ. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete article confirmation & execution
  const handleConfirmDelete = async () => {
    if (selectedArticleId === 'new') return;
    setIsDeleting(true);
    try {
      const articleToDeleteId = selectedArticleId;
      // 1. Delete from local storage & mark blacklisted
      storageService.deleteArticle(articleToDeleteId);
      // 2. Delete / blacklist in Supabase
      await supabaseService.deleteArticleFromSupabase(articleToDeleteId);
      
      showToast('تم حذف المقال نهائياً من الموقع وقاعدة البيانات بنجاح!');
      setShowDeleteModal(false);
      handleSelectArticle('new');
      refreshArticleList();
    } catch (err) {
      console.error('Error deleting article:', err);
      showToast('حدث خطأ أثناء حذف المقال. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Load sample article template
  const handleLoadSampleTemplate = () => {
    if (content.trim() && !window.confirm('هل تريد استبدال النص الحالي بنموذج مقال فكري منظم؟')) {
      return;
    }
    setTitle('جدلية الوعي والحرية في الفكر المعاصر');
    setSubtitle('تأملات نقدية في شروط الاستقلال الفكري وتحديات التنميط الرقمي');
    setType('article');
    setCategory('فكر وفلسفة');
    setTagsInput('فلسفة, وعي ذاتي, حرية الإرادة, نقد الفكر');
    setAbstract('دراسة استكشافية تفكك العلاقة التفاعلية بين تشكل الوعي الفردي والحرية الوجودية في مواجهة محركات الهيمنة السلوكية والتنميط الثقافي المعاصر.');
    setContent(`<h2>1. الاستهلال المعرفي: سؤال البداهة المفقودة</h2>
<p>ما الذي يتبقى من حرية الإنسان حين تُصبح رغباته وأفكاره وتفضيلاته نتاجاً مباشراً لخوارزميات التنبؤ السلوكي؟ إن الحرية الفكرية ليست مجرد خيار ظاهري بين بدائل معروضة، بل هي <strong>القدرة على نقد البدائل ذاتها</strong> والتساؤل حول مشروعيتها الفلسفية والأخلاقية.</p>

<blockquote class="poetry-verse">
  <p>«العقلُ ليس وعاءً يُملأ، بل شعلةٌ تُوقَدُ بالمساءلة والاستبصار»</p>
</blockquote>

<h2>2. تشريح التنميط الذهني في العصر الرقمي</h2>
<p>في المجتمعات المعرفية فائقة السرعة، يتقلص الفضاء المخصص للتأمل البطيء لصالح الإثارة الحسية المباشرة. تبرز هنا ثلاث ظواهر تقيد استقلالية الوعي:</p>
<ul>
  <li><strong>غرف الصدى (Echo Chambers):</strong> حيث لا يسمع المرء إلا صدى آرائه المسبقة.</li>
  <li><strong>تفكك التركيز العميق:</strong> عجز الذهن عن معالجة الأفكار المركبة.</li>
  <li><strong>الوهم المعرفي:</strong> الخلط بين حيازة المعلومة وبين هضمها وإدراك مغزاها.</li>
</ul>

<h2>3. نحو تحرير الإرادة وبناء الوعي النقدي</h2>
<p>إن إعادة الاعتبار للحرية تبدأ من العودة إلى الصمت والتفكر، وقراءة أمهات الكتب بتؤدة، وممارسة الشك المنهجي الذي يمهد الطريق لليقين الإيماني والفلسفي الرصين.</p>`);
    setReferencesInput(`كناني، أيمن (2025). مدخل إلى فلسفة الوعي المعاصر.\nسارتر، جان بول (1966). الوجود والعدم. ترجمة د. عبد الرحمن بدوي.\nفروم، إريك (1971). الخوف من الحرية.`);
    showToast('تم تحميل نموذج المقال الفكري في المحرر بنجاح!');
  };

  return (
    <div className="space-y-6 text-[#2C2C2C] font-cairo" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-[#4A5D4E] text-white px-5 py-3 rounded-2xl shadow-xl border border-white/20 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#F7F5EE] via-[#FAF8F2] to-[#ECE8DE] p-6 sm:p-8 rounded-3xl border border-[#E5E2D9] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4A5D4E]/10 text-[#4A5D4E] text-xs font-bold mb-3">
              <FileText className="w-4 h-4" />
              <span>محرر المقالات والدراسات الفكرية المخصص (WYSIWYG)</span>
            </div>
            <h1 className="font-amiri font-bold text-2xl sm:text-3xl text-[#2C2C2C]">
              استوديو كتابة وتحرير المقالات والأبحاث
            </h1>
            <p className="text-xs sm:text-sm text-[#6E6A64] mt-2 max-w-2xl leading-relaxed">
              اكتب ونسق مقالاتك الفكرية، أبحاثك المحكّمة، مقالاتك الدينية والعلمية والأدبية بنفس محرر الكتب الغني، مع إمكانية التنسيق المتقدم، إضافة المقتطفات، والشواهد، وحفظها مباشرة للموقع وسوباباس.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedArticleId !== 'new' && (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                disabled={isSaving || isDeleting}
                className="px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-98 disabled:opacity-50"
                title="حذف هذا المقال نهائياً من الموقع"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
                <span>حذف المقال</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleLoadSampleTemplate}
              className="px-4 py-2.5 rounded-xl border border-[#E5E2D9] bg-white hover:bg-[#FAF8F2] text-xs font-bold text-[#4A5D4E] flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-98"
              title="تحميل هيكل مقال فكري نموذجي منظم"
            >
              <Sparkles className="w-4 h-4 text-[#C88A3B]" />
              <span>نموذج مقال فكري</span>
            </button>

            <button
              type="button"
              onClick={handleSaveArticle}
              disabled={isSaving || isDeleting}
              className="px-5 py-2.5 rounded-xl bg-[#4A5D4E] hover:bg-[#3C4C3F] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-98 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'جارٍ الحفظ والمزامنة...' : selectedArticleId === 'new' ? 'حفظ ونشر المقال' : 'حفظ التعديلات الفكرية'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Article Selector & Type Switcher Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5E2D9] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Selector dropdown */}
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <label className="text-xs font-bold text-[#4A5D4E] shrink-0 flex items-center gap-1.5">
            <Bookmark className="w-4 h-4 text-[#4A5D4E]" />
            <span>اختر مقالاً أو ابدأ جديداً:</span>
          </label>
          <select
            value={selectedArticleId}
            onChange={e => handleSelectArticle(e.target.value)}
            className="flex-1 px-3 py-2 text-xs rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] font-bold focus:outline-none focus:border-[#4A5D4E] cursor-pointer"
          >
            <option value="new">✨ + كتابة مقال / دراسة جديدة</option>
            <optgroup label="المقالات والأبحاث المحفوظة">
              {articles.map(a => (
                <option key={a.id} value={a.id}>
                  {a.type === 'study' ? '[دراسة]' : '[مقال]'} {a.title} ({a.category || 'عام'})
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Material Type Switcher */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs text-[#8E8A83] font-bold">نوع المادة:</span>
          <div className="flex items-center bg-[#F7F5EE] p-1 rounded-xl border border-[#E5E2D9]">
            <button
              type="button"
              onClick={() => setType('article')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                type === 'article'
                  ? 'bg-white text-[#4A5D4E] shadow-xs'
                  : 'text-[#8E8A83] hover:text-[#2C2C2C]'
              }`}
            >
              مقال فكري
            </button>
            <button
              type="button"
              onClick={() => setType('study')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                type === 'study'
                  ? 'bg-white text-[#4A5D4E] shadow-xs'
                  : 'text-[#8E8A83] hover:text-[#2C2C2C]'
              }`}
            >
              دراسة محكّمة
            </button>
          </div>
        </div>
      </div>

      {/* Metadata Inputs Grid */}
      <div className="bg-[#FDFCF8] p-5 sm:p-6 rounded-2xl border border-[#E5E2D9] shadow-xs space-y-4">
        {/* Title and Subtitle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#4A5D4E] mb-1.5">
              عنوان المقال أو البحث <span className="text-rose-500">*</span>:
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="مثال: مقاصد الشريعة وتجديد النظر الفقهي..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-white border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E] font-amiri font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#6E6A64] mb-1.5">
              العنوان الفرعي أو التوصيف المعرفي (اختياري):
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={e => setSubtitle(e.target.value)}
              placeholder="مثال: قراءة معاصرة في نظرية الشاطبي وابن عاشور..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-white border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E]"
            />
          </div>
        </div>

        {/* Category, Author, and Reading Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#4A5D4E] mb-1.5">
              تصنيف المادة الفكرية:
            </label>
            <select
              value={isCustomCategory ? 'custom' : category}
              onChange={e => {
                if (e.target.value === 'custom') {
                  setIsCustomCategory(true);
                } else {
                  setIsCustomCategory(false);
                  setCategory(e.target.value);
                }
              }}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-[#E5E2D9] text-[#2C2C2C] font-bold focus:outline-none focus:border-[#4A5D4E] cursor-pointer"
            >
              {PRESET_CATEGORIES.map(c => (
                <option key={c.label} value={c.label}>
                  {c.label}
                </option>
              ))}
              <option value="custom">✏️ كتابة تصنيف مخصص...</option>
            </select>

            {isCustomCategory && (
              <input
                type="text"
                value={customCategory}
                onChange={e => setCustomCategory(e.target.value)}
                placeholder="اكتب اسم التصنيف الجديد هنا..."
                className="mt-2 w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-[#4A5D4E] text-[#2C2C2C] focus:outline-none"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#6E6A64] mb-1.5">
              الكاتب / الباحث:
            </label>
            <input
              type="text"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#6E6A64] mb-1.5 flex items-center justify-between">
              <span>وقت القراءة المقدر (بالدقائق):</span>
              <span className="text-[11px] text-[#8E8A83] font-mono">{readingTime} دقيقة</span>
            </label>
            <input
              type="number"
              min={1}
              max={180}
              value={readingTime}
              onChange={e => setReadingTime(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E]"
            />
          </div>
        </div>

        {/* Tags, Dewey Decimal, and Featured */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-[#6E6A64] mb-1.5">
              الوسوم والكلمات المفتاحية (مفصولة بفواصل):
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="مثال: مقالات دينية, فكر إسلامي, مقاصد"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#6E6A64] mb-1.5">
              رابط صورة الغلاف (اختياري):
            </label>
            <input
              type="url"
              value={coverImage}
              onChange={e => setCoverImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E]"
            />
          </div>

          <div className="flex items-center gap-4 pt-5">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#2C2C2C]">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={e => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-[#4A5D4E] focus:ring-[#4A5D4E]"
              />
              <span>تثبيت كمقال مميز في الواجهة</span>
            </label>
          </div>
        </div>

        {/* Abstract */}
        <div>
          <label className="block text-xs font-bold text-[#4A5D4E] mb-1.5">
            المستخلص / ملخص الفكرة المركزية (Abstract):
          </label>
          <textarea
            value={abstract}
            onChange={e => setAbstract(e.target.value)}
            rows={2}
            placeholder="ملخص موجز يوضح محاور المقال وأطروحته الرئيسية في فقرة أو فقرتين..."
            className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E] leading-relaxed"
          />
        </div>
      </div>

      {/* Core Rich Text Editor Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <label className="text-sm font-bold text-[#2C2C2C] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#4A5D4E]" />
            <span>نص ومحتوى المقال / الدراسة الفكرية:</span>
          </label>
          <span className="text-xs text-[#8E8A83]">
            يدعم الخطوط العربية، العناوين، الاقتباسات، الأبيات الشعرية، والجداول
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E2D9] overflow-hidden shadow-xs">
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="ابدأ بكتابة أفكارك وبحوثك هنا... يمكنك تقسيم المقال إلى عناوين وفقرات واقتباسات فكرية من شريط الأدوات أعلاه."
            novelTitle={isCustomCategory ? customCategory : category}
            chapterTitle={title || 'مقال جديد'}
            authorName={author}
            minHeight="480px"
          />
        </div>
      </div>

      {/* References Section */}
      <div className="bg-[#FDFCF8] p-5 rounded-2xl border border-[#E5E2D9] shadow-xs">
        <label className="block text-xs font-bold text-[#4A5D4E] mb-1.5">
          المراجع والمصادر الأكاديمية (كل مرجع في سطر منفصل):
        </label>
        <textarea
          value={referencesInput}
          onChange={e => setReferencesInput(e.target.value)}
          rows={3}
          placeholder="الشاطبي، أبو إسحاق (1997). الموافقات في أصول الشريعة...&#10;ابن عاشور، محمد الطاهر (2001). مقاصد الشريعة الإسلامية..."
          className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E] font-mono text-[11px] leading-relaxed"
        />
      </div>

      {/* Article-Level SEO Studio Section */}
      <div className="pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#F7F5EE] border border-[#E5E2D9] mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#4A5D4E]/10 text-[#4A5D4E] flex items-center justify-center shrink-0">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-[#2C2C2C]">
                  سيو وأرشفة هذا المقال في Google (Article-Level SEO)
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
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white text-[#6E6A64] border border-[#E5E2D9]">
                    تلقائي
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#6E6A64] mt-0.5">
                تخصيص عنوان ميتا ووصف مستقل وكلمات مفتاحية لمقالك لتصدر نتائج البحث في محركات البحث
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSeoStudioOpen(!isSeoStudioOpen)}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#FDFCF8] text-[#2C2C2C] border border-[#E5E2D9] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
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
              chapterNumber={1}
              chapterTitle={title}
              chapterContent={content || abstract}
              novelTitle={isCustomCategory ? customCategory : category}
              novelAuthor={author}
              novelCoverImage={coverImage}
              novelId="articles"
              chapterId={selectedArticleId !== 'new' ? selectedArticleId : undefined}
            />
          </div>
        )}
      </div>

      {/* Footer Bottom Actions */}
      <div className="p-4 bg-white rounded-2xl border border-[#E5E2D9] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-[#8E8A83] flex items-center gap-2">
          <span>الحالة:</span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
            {selectedArticleId === 'new' ? 'مادة جديدة' : 'مادة منشورة'}
          </span>
          <span className="text-stone-300">|</span>
          <span>عدد الكلمات التقريبي:</span>
          <span className="font-mono font-bold text-[#2C2C2C]">
            {content.replace(/<[^>]*>?/gm, ' ').split(/\s+/).filter(Boolean).length}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
          {selectedArticleId !== 'new' && (
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              disabled={isSaving || isDeleting}
              className="px-4 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-98 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              <span>حذف المقال</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSelectArticle('new')}
            className="px-4 py-2 rounded-xl border border-[#E5E2D9] text-xs font-bold text-[#6E6A64] hover:bg-[#F7F5EE] transition-all cursor-pointer"
          >
            إعادة تعيين وبدء جديد
          </button>

          <button
            type="button"
            onClick={handleSaveArticle}
            disabled={isSaving || isDeleting}
            className="px-6 py-2.5 rounded-xl bg-[#4A5D4E] hover:bg-[#3C4C3F] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-98 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'جارٍ الحفظ...' : 'حفظ ونشر المادة الفكرية'}</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-cairo">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#E5E2D9] shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
              <Trash2 className="w-7 h-7" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg sm:text-xl font-bold text-[#2C2C2C] font-amiri">
                تأكيد حذف المقال نهائياً
              </h3>
              <p className="text-xs text-[#6E6A64] leading-relaxed">
                هل أنت متأكد تماماً من رغبتك في حذف المقال:
              </p>
              <div className="p-3 bg-[#F7F5EE] rounded-xl border border-[#E5E2D9] text-xs font-bold text-[#2C2C2C] text-center">
                "{title || 'المقال المحدد'}"
              </div>
              <p className="text-[11px] text-red-600 font-bold">
                ⚠️ سيتم حذف المقال نهائياً من الموقع ومن التخزين ومن قاعدة بيانات سوباباس ولن يظهر بعد الآن.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'جارٍ الحذف نهائياً...' : 'نعم، احذف المقال نهائياً'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl border border-[#E5E2D9] bg-stone-50 hover:bg-stone-100 text-[#2C2C2C] text-xs font-bold transition-all cursor-pointer"
              >
                إلغاء التراجع
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
