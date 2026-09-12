import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Languages,
  BookOpen,
  Send,
  Eye,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  Quote,
  ListOrdered,
  Globe,
  CornerUpLeft,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { IntellectualItem, MultilingualAbstract, NovelSeoMeta, ParallelSegment } from '../types';
import { ScholarlyIntegratedEditor } from './RichTextEditor/ScholarlyIntegratedEditor';
import { ArticleSeoStudio } from './ArticleSeoStudio';
import { BilingualReaderView } from './BilingualReaderView';
import { storageService } from '../services/storageService';

interface AddArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onArticleCreated: (newArticle: IntellectualItem) => void;
}

const CATEGORIES = [
  'دراسات نقدية وأدبية',
  'فلسفة وفكر معاصر',
  'علم الاجتماع الثقافي',
  'تاريخ وحضارات',
  'ترجمات عالمية',
  'علوم إنسانية وملاحظات',
  'لسانيات وفقه لغة',
  'فن وجماليات'
];

export const AddArticleModal: React.FC<AddArticleModalProps> = ({
  isOpen,
  onClose,
  onArticleCreated,
}) => {
  // Modes: 'editor' (single large canvas), 'seo' (SEO studio), 'preview' (full article preview)
  const [activeTab, setActiveTab] = useState<'editor' | 'seo' | 'preview'>('editor');

  // Core Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [author, setAuthor] = useState('');
  const [type, setType] = useState<'article' | 'study' | 'translated_article'>('article');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tagsInput, setTagsInput] = useState('');
  const [content, setContent] = useState('');
  const [headerColorStrip, setHeaderColorStrip] = useState<string>('emerald');

  // English / Parallel Translation State (خامسا: إمكانية إضافة ترجمة للموضوع)
  const [showTranslation, setShowTranslation] = useState<boolean>(false);
  const [translatedTitle, setTranslatedTitle] = useState('');
  const [translatedLanguage, setTranslatedLanguage] = useState('English');
  const [translator, setTranslator] = useState('');
  const [translatedContent, setTranslatedContent] = useState('');
  const [originalAuthor, setOriginalAuthor] = useState('');
  const [originalLanguage, setOriginalLanguage] = useState('العربية');
  const [originalSource, setOriginalSource] = useState('');
  const [originalYear, setOriginalYear] = useState('');

  // Article SEO State
  const [seo, setSeo] = useState<NovelSeoMeta>({
    metaTitle: '',
    metaDescription: '',
    focusKeywords: '',
    canonicalUrl: '',
    ogImage: '',
    noIndex: false,
  });

  // Multilingual Abstract
  const [abstractAr, setAbstractAr] = useState('');
  const [abstractEn, setAbstractEn] = useState('');
  const [abstractFr, setAbstractFr] = useState('');

  // References & Footnotes
  const [references, setReferences] = useState<string[]>(['']);
  const [footnotes, setFootnotes] = useState<{ id: number; text: string }[]>([
    { id: 1, text: '' }
  ]);

  // UI helpers
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Auto pre-fill author name from session
  useEffect(() => {
    if (isOpen) {
      const active = storageService.getActiveAuthor();
      if (active?.name) {
        setAuthor(active.name);
        if (!translator) setTranslator(active.name);
      } else {
        const secretAuth = storageService.getAuthorSecretAuth();
        const fallbackName = secretAuth.authorName || 'أيمن كناني';
        setAuthor(fallbackName);
        if (!translator) setTranslator(fallbackName);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Words & reading time calculation
  const cleanRawText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = cleanRawText ? cleanRawText.split(/\s+/).length : 0;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 180));

  const handleAddReference = () => {
    setReferences(prev => [...prev, '']);
  };

  const handleUpdateReference = (index: number, val: string) => {
    setReferences(prev => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleRemoveReference = (index: number) => {
    setReferences(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddFootnote = () => {
    setFootnotes(prev => {
      const nextId = prev.length > 0 ? Math.max(...prev.map(f => f.id)) + 1 : 1;
      return [...prev, { id: nextId, text: '' }];
    });
  };

  const handleUpdateFootnote = (index: number, text: string) => {
    setFootnotes(prev => {
      const next = [...prev];
      next[index] = { ...next[index], text };
      return next;
    });
  };

  const handleRemoveFootnote = (index: number) => {
    setFootnotes(prev => prev.filter((_, i) => i !== index));
  };

  // Auto-generate parallel segments from Arabic and English text
  const generateAlignedSegments = (): ParallelSegment[] => {
    const cleanParas = (raw: string): string[] => {
      if (!raw) return [];
      if (/<(p|div|h[1-6]|blockquote|li)[\s>]/i.test(raw)) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = raw;
        const blocks = tempDiv.querySelectorAll('p, h1, h2, h3, h4, h5, h6, blockquote, li');
        if (blocks.length > 0) {
          const res: string[] = [];
          blocks.forEach(b => {
            const txt = b.textContent?.trim();
            if (txt && txt.length > 0) res.push(txt);
          });
          return res;
        }
        return [tempDiv.textContent?.trim() || ''].filter(Boolean);
      }
      return raw
        .split('\n\n')
        .map(p => p.trim())
        .filter(p => p.length > 0 && !p.startsWith('#') && !p.startsWith('---'));
    };

    const transParas = cleanParas(content);
    const origParas = cleanParas(translatedContent);
    const maxLen = Math.max(origParas.length, transParas.length);
    const res: ParallelSegment[] = [];

    for (let i = 0; i < maxLen; i++) {
      res.push({
        id: `parallel-seg-${i}`,
        originalText: origParas[i] || '—',
        translatedText: transParas[i] || '—',
      });
    }
    return res;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!title.trim()) {
      setSubmitError('يرجى كتابة عنوان المقال.');
      return;
    }

    if (!content.trim()) {
      setSubmitError('يرجى كتابة محتوى المقال في المساحة المخصصة.');
      return;
    }

    const tags = tagsInput
      .split(/[,،]/)
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const cleanReferences = references.map(r => r.trim()).filter(Boolean);
    const cleanFootnotes = footnotes.filter(f => f.text.trim().length > 0);

    const multilingualAbstract: MultilingualAbstract = {};
    if (abstractAr.trim()) multilingualAbstract.ar = abstractAr.trim();
    if (abstractEn.trim()) multilingualAbstract.en = abstractEn.trim();
    if (abstractFr.trim()) multilingualAbstract.fr = abstractFr.trim();

    // Auto align parallel segments if translation exists
    const hasTranslationData = Boolean(translatedContent.trim() || translatedTitle.trim());
    const parallelSegments = hasTranslationData ? generateAlignedSegments() : undefined;

    const newArticleData: Omit<IntellectualItem, 'id' | 'views' | 'likes' | 'publishedAt'> = {
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      slug: title.trim().toLowerCase().replace(/[\s/\\#?]+/g, '-').slice(0, 80) + '-' + Date.now().toString().slice(-4),
      type: hasTranslationData ? 'translated_article' : type,
      author: author.trim(),
      originalAuthor: originalAuthor.trim() || undefined,
      translator: translator.trim() || (hasTranslationData ? author.trim() : undefined),
      originalLanguage: originalLanguage.trim() || 'العربية',
      translatedLanguage: hasTranslationData ? translatedLanguage.trim() : undefined,
      translatedTitle: translatedTitle.trim() || undefined,
      translatedContent: translatedContent.trim() || undefined,
      originalContent: translatedContent.trim() || undefined,
      parallelSegments: parallelSegments && parallelSegments.length > 0 ? parallelSegments : undefined,
      originalSource: originalSource.trim() || undefined,
      originalYear: originalYear.trim() || undefined,
      abstract: abstractAr.trim() || undefined,
      multilingualAbstract: Object.keys(multilingualAbstract).length > 0 ? multilingualAbstract : undefined,
      content: content.trim(),
      category: category || 'دراسات ومقالات',
      tags: tags.length > 0 ? tags : ['مساهمات القراء', category],
      readingTimeMinutes,
      wordCount,
      references: cleanReferences.length > 0 ? cleanReferences : undefined,
      footnotes: cleanFootnotes.length > 0 ? cleanFootnotes : undefined,
      coverImage: coverImageUrl.trim() || undefined,
      isReaderContribution: true,
      headerColorStrip: headerColorStrip || 'emerald',
      seo: seo?.metaTitle || seo?.metaDescription ? seo : undefined,
    };

    try {
      const created = storageService.addArticle(newArticleData);
      onArticleCreated(created);
      onClose();
    } catch {
      setSubmitError('حدث خطأ أثناء حفظ المقال، يرجى المحاولة ثانية.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#2C2C2C]/50 backdrop-blur-xs font-cairo">
      <div
        id="add-article-modal-container"
        className="bg-[#FDFCF8] border border-[#E5E2D9] rounded-3xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-3 sm:p-5 border-b border-[#E5E2D9] bg-[#F7F5EE] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#4A5D4E] text-[#FDFCF8] flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-amiri font-bold text-lg sm:text-2xl text-[#2C2C2C]">
                كتابة ونشر مقال جديد
              </h2>
              <p className="text-xs text-[#6E6A64]">
                مساحة كتابة واسعة متكاملة تدعم التنسيق الفوري، السيو، والترجمة المزدوجة المتزامنة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Action Tabs: Edit, Preview, SEO */}
            <div className="flex rounded-xl bg-[#FDFCF8] p-1 border border-[#E5E2D9]">
              <button
                type="button"
                id="tab-btn-editor"
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'editor'
                    ? 'bg-[#4A5D4E] text-[#FDFCF8]'
                    : 'text-[#6E6A64] hover:text-[#2C2C2C]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>الكتابة والتحرير</span>
              </button>

              {/* Dedicated Preview Toggle Button */}
              <button
                type="button"
                id="tab-btn-preview"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'preview'
                    ? 'bg-[#4A5D4E] text-[#FDFCF8]'
                    : 'text-[#6E6A64] hover:text-[#2C2C2C]'
                }`}
                title="معاينة المقال بكامل مساحة الشاشة"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>معاينة المقال</span>
              </button>

              <button
                type="button"
                id="tab-btn-seo"
                onClick={() => setActiveTab('seo')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'seo'
                    ? 'bg-[#4A5D4E] text-[#FDFCF8]'
                    : 'text-[#6E6A64] hover:text-[#2C2C2C]'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>تهيئة السيو (SEO)</span>
              </button>
            </div>

            <button
              type="button"
              id="close-add-article-modal-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-[#6E6A64] hover:text-[#2C2C2C] hover:bg-[#EAE7DD] transition-all cursor-pointer"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {submitError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
              <X className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {activeTab === 'seo' ? (
            /* SEO Studio Tab */
            <div className="space-y-4">
              <ArticleSeoStudio
                articleTitle={title}
                articleSubtitle={subtitle}
                articleContent={content}
                articleCategory={category}
                articleAuthor={author}
                seo={seo}
                onChange={setSeo}
              />
              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('editor')}
                  className="px-5 py-2.5 rounded-xl bg-[#4A5D4E] hover:bg-[#3C4C3F] text-white text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <CornerUpLeft className="w-4 h-4" />
                  <span>العودة لمساحة الكتابة</span>
                </button>
              </div>
            </div>
          ) : activeTab === 'preview' ? (
            /* FULL PREVIEW MODE (Single Expansive Preview Canvas) */
            <div className="space-y-6 p-4 sm:p-6 rounded-2xl border border-[#E5E2D9] bg-[#FFFFFF]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E2D9]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#4A5D4E] flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    <span>معاينة المقال الكاملة قبل النشر</span>
                  </span>
                  {translatedContent && (
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[11px] font-bold">
                      يتضمن ترجمة إنجليزية متزامنة
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('editor')}
                  className="px-4 py-2 rounded-xl bg-[#4A5D4E] hover:bg-[#3C4C3F] text-white text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <CornerUpLeft className="w-3.5 h-3.5" />
                  <span>العودة لمتابعة الكتابة</span>
                </button>
              </div>

              {/* Header Title Section */}
              <div className="text-center pb-6 border-b border-[#E5E2D9]">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4A5D4E]/15 text-[#2D4532] text-xs font-bold mb-3">
                  <span>{category}</span>
                  <span>·</span>
                  <span>{translatedContent ? 'مقال ثنائي اللغة (مترجم)' : 'مقال فكري'}</span>
                </div>
                <h1 className="font-amiri font-bold text-2xl sm:text-3xl text-[#2C2C2C] mb-2">
                  {title || 'عنوان المقال التجريبي'}
                </h1>
                {subtitle && (
                  <p className="text-sm font-amiri text-[#6E6A64] mb-3">{subtitle}</p>
                )}
                {translatedTitle && (
                  <p className="text-sm font-serif text-blue-900 mb-3" dir="ltr">
                    {translatedTitle}
                  </p>
                )}
                <div className="flex items-center justify-center gap-3 text-xs text-[#6E6A64]">
                  <span>بقلم: <strong className="text-[#2C2C2C]">{author || 'اسم الكاتب'}</strong></span>
                  <span>·</span>
                  <span>{wordCount} كلمة</span>
                  <span>·</span>
                  <span>قراءة {readingTimeMinutes} دقائق</span>
                </div>
              </div>

              {/* If translation exists, show interactive bilingual reader view in preview */}
              {translatedContent ? (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>معاينة القراءة المزدوجة (مرر الفأرة على النص العربي لمشاهدة شريط الترجمة الإنجليزية):</span>
                    </span>
                  </div>

                  <BilingualReaderView
                    article={{
                      id: 'preview-article',
                      title: title || 'المقال',
                      slug: 'preview',
                      type: 'translated_article',
                      author: author || 'المؤلف',
                      category: category,
                      tags: [],
                      readingTimeMinutes,
                      wordCount,
                      views: 0,
                      likes: 0,
                      publishedAt: new Date().toISOString(),
                      content: content,
                      originalContent: translatedContent,
                      originalLanguage: originalLanguage || 'العربية',
                      parallelSegments: generateAlignedSegments(),
                    }}
                    fontSize={18}
                    theme="paper"
                    marginNotes={[]}
                    onOpenAddMarginModal={() => {}}
                    onOpenMarginPopover={() => {}}
                  />
                </div>
              ) : (
                /* Standard Single Canvas Article Content */
                <div
                  className="max-w-3xl mx-auto space-y-4 text-justify font-amiri leading-loose text-base sm:text-lg text-[#2C2C2C]"
                  dangerouslySetInnerHTML={{ __html: content || '<p class="text-stone-400 italic">لا يوجد محتوى مكتوب بعد...</p>' }}
                />
              )}

              {references.filter(Boolean).length > 0 && (
                <div className="pt-4 border-t border-[#E5E2D9]">
                  <h4 className="text-xs font-bold text-[#4A5D4E] mb-2">المراجع والمصادر:</h4>
                  <ul className="list-disc list-inside text-xs space-y-1 text-[#6E6A64]">
                    {references.filter(Boolean).map((ref, idx) => (
                      <li key={idx}>{ref}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            /* SINGLE-CANVAS EXPANSIVE WRITING MODE (جهة واحدة كبيرة للكتابة بدون تقسيم الشاشة) */
            <form id="reader-article-form" onSubmit={handleSubmit} className="space-y-6">
              {/* 1. Core Metadata Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold block mb-1 text-[#2C2C2C]">
                    عنوان المقال أو البحث الرئيسي <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="new-article-title-input"
                    placeholder="مثلاً: فلسفة المعنى وتأويل النص عند فلاسفة الأندلس..."
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/30 focus:border-[#4A5D4E] text-[#2C2C2C]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1 text-[#2C2C2C]">
                    العنوان الفرعي أو التوضيحي (اختياري)
                  </label>
                  <input
                    type="text"
                    id="new-article-subtitle-input"
                    placeholder="مثلاً: قراءة في البناء المفاهيمي والنقدي"
                    value={subtitle}
                    onChange={e => setSubtitle(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/30 focus:border-[#4A5D4E] text-[#2C2C2C]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1 text-[#2C2C2C]">
                    اسم الكاتب / الباحث <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="new-article-author-input"
                    placeholder="اسمك الكامل"
                    value={author}
                    onChange={e => setAuthor(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/30 focus:border-[#4A5D4E] text-[#2C2C2C]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1 text-[#2C2C2C]">
                    التصنيف المعرفي
                  </label>
                  <select
                    id="new-article-category-select"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/30 focus:border-[#4A5D4E] text-[#2C2C2C]"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1 text-[#2C2C2C]">
                    رابط صورة الغلاف (اختياري)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={coverImageUrl}
                    onChange={e => setCoverImageUrl(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/30 focus:border-[#4A5D4E] text-[#2C2C2C]"
                  />
                </div>
              </div>

              {/* 2. DEDICATED FULL-WIDTH WRITING CANVAS (جهة واحدة كبيرة لكتابة المقالة) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2C2C2C] flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#4A5D4E]" />
                    <span>مساحة كتابة المقال (محرر متقدم مدمج يطبق التنسيق في الوقت الفعلي) <span className="text-rose-500">*</span></span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className="text-xs font-bold text-[#4A5D4E] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>معاينة المقال كاملاً</span>
                  </button>
                </div>

                <ScholarlyIntegratedEditor
                  id="new-article-content-wysiwyg"
                  value={content}
                  onChange={setContent}
                  required
                  minHeight="380px"
                  headerColorStrip={headerColorStrip}
                  onHeaderColorStripChange={setHeaderColorStrip}
                  placeholder="ابدأ بكتابة نص المقال أو الدراسة هنا مباشرة... التنسيقات والخطوط والشريط الملون تطبق فورياً على النص في الوقت الفعلي."
                />
              </div>

              {/* 3. BILINGUAL TRANSLATION SECTION (خامسا: إمكانية إضافة ترجمة للموضوع بالإنجليزية) */}
              <div className="p-4 sm:p-5 rounded-2xl border border-[#E5E2D9] bg-[#F7F5EE] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-700 text-white flex items-center justify-center">
                      <Languages className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1E3A8A] flex items-center gap-1.5">
                        <span>إضافة ترجمة للموضوع باللغة الإنجليزية (English Translation)</span>
                      </h4>
                      <p className="text-[11px] text-[#6E6A64]">
                        تتيح للقراء مطالعة المقال بوضعية القراءة المقارنة المزدوجة مع شريط الترجمة المتزامن
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowTranslation(!showTranslation)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      showTranslation
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'bg-white border border-[#E5E2D9] text-[#1E3A8A] hover:bg-blue-50'
                    }`}
                  >
                    <span>{showTranslation ? 'إخفاء قسم الترجمة' : '+ تفعيل الترجمة الإنجليزية'}</span>
                    {showTranslation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {showTranslation && (
                  <div className="space-y-4 pt-2 border-t border-[#E5E2D9] animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold block mb-1 text-blue-950">
                          عنوان المقال المترجم (English Title):
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          placeholder="e.g. The Philosophy of Language and Semantics..."
                          value={translatedTitle}
                          onChange={e => setTranslatedTitle(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-blue-200 bg-[#FFFFFF] text-left font-serif"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold block mb-1 text-blue-950">
                          اسم المترجم (Translator):
                        </label>
                        <input
                          type="text"
                          placeholder="اسم المترجم"
                          value={translator}
                          onChange={e => setTranslator(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-blue-200 bg-[#FFFFFF]"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-bold text-blue-950">
                          نص الترجمة الكامل باللغة الإنجليزية (English Content):
                        </label>
                        <span className="text-[10px] text-blue-700">
                          يمكنك كتابة الفقرات الإنجليزية لتتطابق سطرياً مع الفقرات العربية
                        </span>
                      </div>
                      <textarea
                        dir="ltr"
                        rows={8}
                        value={translatedContent}
                        onChange={e => setTranslatedContent(e.target.value)}
                        placeholder="Paste or write the English translation here... Paragraphs will automatically align with the Arabic text for interactive side-by-side reading."
                        className="w-full p-3 text-xs sm:text-sm rounded-xl border border-blue-200 bg-[#FFFFFF] font-serif focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-stone-900 leading-relaxed text-left"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 4. References & Footnotes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* References */}
                <div className="p-4 rounded-2xl border border-[#E5E2D9] bg-[#F7F5EE] space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#4A5D4E] flex items-center gap-1.5">
                      <ListOrdered className="w-3.5 h-3.5" />
                      <span>قائمة المراجع والمصادر</span>
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddReference}
                      className="text-[11px] font-bold text-[#4A5D4E] hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>إضافة مرجع</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {references.map((ref, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          placeholder={`المرجع ${idx + 1}: اسم الكتاب أو الورقة، المؤلف، سنة النشر`}
                          value={ref}
                          onChange={e => handleUpdateReference(idx, e.target.value)}
                          className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-[#E5E2D9] bg-[#FFFFFF]"
                        />
                        {references.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveReference(idx)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footnotes */}
                <div className="p-4 rounded-2xl border border-[#E5E2D9] bg-[#F7F5EE] space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#C88A3B] flex items-center gap-1.5">
                      <Quote className="w-3.5 h-3.5" />
                      <span>الهوامش التوضيحية [1] [2]</span>
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddFootnote}
                      className="text-[11px] font-bold text-[#C88A3B] hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>إضافة هامش</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {footnotes.map((fn, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-6 text-center text-xs font-bold text-[#C88A3B]">
                          [{fn.id}]
                        </span>
                        <input
                          type="text"
                          placeholder={`نص الهامش رقم ${fn.id}`}
                          value={fn.text}
                          onChange={e => handleUpdateFootnote(idx, e.target.value)}
                          className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-[#E5E2D9] bg-[#FFFFFF]"
                        />
                        {footnotes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveFootnote(idx)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5. Tags */}
              <div>
                <label className="text-xs font-bold block mb-1 text-[#2C2C2C]">
                  الكلمات الدلالية / الوسوم (مفصولة بفواصل)
                </label>
                <input
                  type="text"
                  placeholder="مثلاً: فلسفة، فكر عربي، نقد، إبستمولوجيا"
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/30 focus:border-[#4A5D4E] text-[#2C2C2C]"
                />
              </div>

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-[#E5E2D9] flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] text-[#6E6A64]">
                  سيتم حفظ مقالك ونشره فوراً، مع تفعيل القراءة المزدوجة المتزامنة في حال إضافة الترجمة.
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl border border-[#E5E2D9] text-[#2C2C2C] text-xs font-bold hover:bg-[#EAE7DD] transition-all cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className="px-4 py-2.5 rounded-xl border border-[#4A5D4E] text-[#4A5D4E] text-xs font-bold hover:bg-[#4A5D4E]/10 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>معاينة قبل النشر</span>
                  </button>
                  <button
                    type="submit"
                    id="submit-new-article-btn"
                    className="px-6 py-2.5 rounded-xl bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8] text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>نشر المقال الآن</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
