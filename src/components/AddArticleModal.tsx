import React, { useState } from 'react';
import {
  X,
  FileText,
  Languages,
  BookOpen,
  Send,
  Eye,
  Plus,
  Trash2,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  Quote,
  Hash,
  ListOrdered
} from 'lucide-react';
import { IntellectualItem, MultilingualAbstract } from '../types';

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
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [author, setAuthor] = useState('');
  const [type, setType] = useState<'article' | 'study' | 'translated_article'>('article');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tagsInput, setTagsInput] = useState('');
  const [content, setContent] = useState('');

  // Translation specific
  const [originalAuthor, setOriginalAuthor] = useState('');
  const [translator, setTranslator] = useState('');
  const [originalLanguage, setOriginalLanguage] = useState('');
  const [originalSource, setOriginalSource] = useState('');
  const [originalYear, setOriginalYear] = useState('');

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

  if (!isOpen) return null;

  // Words & reading time calculation
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
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

  const insertCitationTag = (num: number) => {
    setContent(prev => prev + ` [${num}] `);
  };

  const insertHeadingTag = () => {
    setContent(prev => prev + '\n\n## عنوان القسم الجديد\n');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!title.trim()) {
      setSubmitError('يرجى كتابة عنوان المقال أو الدراسة.');
      return;
    }

    if (!author.trim()) {
      setSubmitError('يرجى تحديد اسم الكاتب أو الباحث المشارك.');
      return;
    }

    if (!content.trim() || content.trim().length < 80) {
      setSubmitError('يرجى كتابة نص كافٍ للمقال (على الأقل بضعة أسطر مفيدة).');
      return;
    }

    const cleanReferences = references.map(r => r.trim()).filter(Boolean);
    const cleanFootnotes = footnotes
      .filter(f => f.text.trim())
      .map((f, idx) => ({ id: idx + 1, text: f.text.trim() }));

    const tags = tagsInput
      .split(/[,،]/)
      .map(t => t.trim())
      .filter(Boolean);

    const multilingualAbstract: MultilingualAbstract = {};
    if (abstractAr.trim()) multilingualAbstract.ar = abstractAr.trim();
    if (abstractEn.trim()) multilingualAbstract.en = abstractEn.trim();
    if (abstractFr.trim()) multilingualAbstract.fr = abstractFr.trim();

    const slug = title
      .trim()
      .toLowerCase()
      .replace(/[^\u0621-\u064A\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 50);

    const newArticleData: Omit<IntellectualItem, 'id' | 'views' | 'likes' | 'publishedAt'> = {
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      type,
      author: author.trim(),
      originalAuthor: originalAuthor.trim() || undefined,
      translator: translator.trim() || undefined,
      originalLanguage: originalLanguage.trim() || undefined,
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
    };

    try {
      // Direct call to onArticleCreated
      const fakeArticle: IntellectualItem = {
        ...newArticleData,
        id: `intellectual-${Date.now()}`,
        views: 1,
        likes: 1,
        publishedAt: new Date().toISOString().split('T')[0],
      };
      onArticleCreated(fakeArticle);
      onClose();
    } catch (err: any) {
      setSubmitError('حدث خطأ أثناء حفظ المقال، يرجى المحاولة ثانية.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#2C2C2C]/50 backdrop-blur-xs font-cairo">
      <div
        id="add-article-modal-container"
        className="bg-[#FDFCF8] border border-[#E5E2D9] rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-[#E5E2D9] bg-[#F7F5EE] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#4A5D4E] text-[#FDFCF8] flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-amiri font-bold text-lg sm:text-2xl text-[#2C2C2C]">
                إضافة مقال أو دراسة من القراء
              </h2>
              <p className="text-xs text-[#6E6A64]">
                شارك مقالاتك وأبحاثك الأدبية والفكرية ليقرأها الجميع في الموسوعة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex rounded-xl bg-[#FDFCF8] p-1 border border-[#E5E2D9]">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'editor'
                    ? 'bg-[#4A5D4E] text-[#FDFCF8]'
                    : 'text-[#6E6A64] hover:text-[#2C2C2C]'
                }`}
              >
                التحرير والكتابة
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeTab === 'preview'
                    ? 'bg-[#4A5D4E] text-[#FDFCF8]'
                    : 'text-[#6E6A64] hover:text-[#2C2C2C]'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>معاينة المقال</span>
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

          {activeTab === 'preview' ? (
            /* Live Preview Mode */
            <div className="space-y-6 p-4 rounded-2xl border border-[#E5E2D9] bg-[#FFFFFF]">
              <div className="text-center pb-6 border-b border-[#E5E2D9]">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4A5D4E]/15 text-[#2D4532] text-xs font-bold mb-3">
                  <span>{category}</span>
                  <span>·</span>
                  <span>
                    {type === 'study' ? 'دراسة أكاديمية' : type === 'translated_article' ? 'مقال مترجم' : 'مقال فكري'}
                  </span>
                </div>
                <h1 className="font-amiri font-bold text-2xl sm:text-3xl text-[#2C2C2C] mb-2">
                  {title || 'عنوان المقال التجريبي'}
                </h1>
                {subtitle && (
                  <p className="text-sm font-amiri text-[#6E6A64] mb-3">{subtitle}</p>
                )}
                <div className="flex items-center justify-center gap-3 text-xs text-[#6E6A64]">
                  <span>بقلم: <strong className="text-[#2C2C2C]">{author || 'اسم القارئ الباحث'}</strong></span>
                  <span>·</span>
                  <span>{wordCount} كلمة</span>
                  <span>·</span>
                  <span>قراءة {readingTimeMinutes} دقائق</span>
                </div>
              </div>

              {abstractAr && (
                <div className="p-4 rounded-xl bg-[#F7F5EE] border border-[#E5E2D9]">
                  <h4 className="text-xs font-bold text-[#4A5D4E] mb-1">ملخص المقال:</h4>
                  <p className="text-xs leading-relaxed text-[#2C2C2C]">{abstractAr}</p>
                </div>
              )}

              <div className="prose prose-stone max-w-none text-sm leading-relaxed text-[#2C2C2C] whitespace-pre-line font-amiri">
                {content || 'لا يوجد محتوى مكتوب بعد. اضغط على تبويب "التحرير والكتابة" لإضافة محتوى المقال.'}
              </div>

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
            /* Editor Form Mode */
            <form id="reader-article-form" onSubmit={handleSubmit} className="space-y-6">
              {/* 1. Core Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold block mb-1 text-[#2C2C2C]">
                    عنوان المقال أو البحث الرئيسي <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="new-article-title-input"
                    placeholder="مثلاً: فلسفة اللغة والرمز عند فلاسفة الأندلس..."
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/30 focus:border-[#4A5D4E] text-[#2C2C2C]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold block mb-1 text-[#2C2C2C]">
                    العنوان الفرعي أو التوضيحي (اختياري)
                  </label>
                  <input
                    type="text"
                    id="new-article-subtitle-input"
                    placeholder="مثلاً: قراءة تحليلية في المنهج والتأويل"
                    value={subtitle}
                    onChange={e => setSubtitle(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/30 focus:border-[#4A5D4E] text-[#2C2C2C]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1 text-[#2C2C2C]">
                    اسم الكاتب / الباحث القارئ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="new-article-author-input"
                    placeholder="اسمك الكامل أو اسمك المستعار"
                    value={author}
                    onChange={e => setAuthor(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/30 focus:border-[#4A5D4E] text-[#2C2C2C]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1 text-[#2C2C2C]">
                    نوع المحتوى
                  </label>
                  <select
                    id="new-article-type-select"
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/30 focus:border-[#4A5D4E] text-[#2C2C2C]"
                  >
                    <option value="article">مقال فكري وأدبي</option>
                    <option value="study">دراسة أكاديمية وبحث</option>
                    <option value="translated_article">مقال أو نص مترجم</option>
                  </select>
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

              {/* Translation Fields if translated_article */}
              {type === 'translated_article' && (
                <div className="p-4 rounded-2xl bg-[#F7F5EE] border border-[#E5E2D9] space-y-3">
                  <h4 className="text-xs font-bold text-[#4A5D4E] flex items-center gap-1.5">
                    <Languages className="w-4 h-4" />
                    <span>بيانات الترجمة والمؤلف الأصلي</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold block mb-1">المؤلف الأصلي</label>
                      <input
                        type="text"
                        placeholder="مثال: يورغن هابرماس"
                        value={originalAuthor}
                        onChange={e => setOriginalAuthor(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#E5E2D9] bg-[#FFFFFF]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold block mb-1">اسم المترجم</label>
                      <input
                        type="text"
                        placeholder="اسم المترجم"
                        value={translator}
                        onChange={e => setTranslator(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#E5E2D9] bg-[#FFFFFF]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold block mb-1">اللغة الأصلية</label>
                      <input
                        type="text"
                        placeholder="الألمانية، الإنجليزية..."
                        value={originalLanguage}
                        onChange={e => setOriginalLanguage(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#E5E2D9] bg-[#FFFFFF]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Multilingual Abstract */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2C2C2C] flex items-center gap-1.5">
                    <Languages className="w-4 h-4 text-[#4A5D4E]" />
                    <span>ملخص المقال / البحث (Multilingual Abstract)</span>
                  </label>
                  <span className="text-[11px] text-[#6E6A64]">
                    يدعم العرض بثلاث لغات لتسهيل الوصول الأكاديمي
                  </span>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-[11px] font-semibold text-[#4A5D4E] block mb-1">
                      الملخص باللغة العربية (أساسي):
                    </span>
                    <textarea
                      rows={2}
                      id="abstract-ar-input"
                      placeholder="مستخلص مركز في سطرين إلى ثلاثة أسطر يوضح أطروحة المقال وأهم نتائجه..."
                      value={abstractAr}
                      onChange={e => setAbstractAr(e.target.value)}
                      className="w-full p-3 text-xs rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/30 focus:border-[#4A5D4E] text-[#2C2C2C]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-[11px] font-semibold text-[#6E6A64] block mb-1">
                        Abstract in English (Optional):
                      </span>
                      <textarea
                        rows={2}
                        dir="ltr"
                        id="abstract-en-input"
                        placeholder="Brief summary in English..."
                        value={abstractEn}
                        onChange={e => setAbstractEn(e.target.value)}
                        className="w-full p-2.5 text-xs rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/30 text-[#2C2C2C]"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-[#6E6A64] block mb-1">
                        Résumé en Français (Facultatif):
                      </span>
                      <textarea
                        rows={2}
                        dir="ltr"
                        id="abstract-fr-input"
                        placeholder="Court résumé en français..."
                        value={abstractFr}
                        onChange={e => setAbstractFr(e.target.value)}
                        className="w-full p-2.5 text-xs rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/30 text-[#2C2C2C]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Full Content */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#2C2C2C] flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#4A5D4E]" />
                    <span>محتوى المقال الكامل <span className="text-rose-500">*</span></span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={insertHeadingTag}
                      className="px-2 py-1 text-[11px] font-bold rounded-lg border border-[#E5E2D9] bg-[#F7F5EE] hover:bg-[#EAE7DD] text-[#4A5D4E] flex items-center gap-1 cursor-pointer"
                      title="إضافة عنوان قسم فرعي"
                    >
                      <Hash className="w-3 h-3" />
                      <span>عنوان قسم (##)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => insertCitationTag(footnotes.length || 1)}
                      className="px-2 py-1 text-[11px] font-bold rounded-lg border border-[#E5E2D9] bg-[#F7F5EE] hover:bg-[#EAE7DD] text-[#C88A3B] flex items-center gap-1 cursor-pointer"
                      title="إدراج رقم مرجع صغير"
                    >
                      <Quote className="w-3 h-3" />
                      <span>رقم مرجع [1]</span>
                    </button>
                  </div>
                </div>

                <textarea
                  id="new-article-content-textarea"
                  rows={10}
                  placeholder="اكتب نص المقال أو الدراسة هنا... يمكنك استخدام ## لإنشاء عناوين فرعية تُدرج تلقائياً في الفهرس، واستخدام [1] للإحالة إلى الهوامش السفلية."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  required
                  className="w-full p-4 text-xs sm:text-sm font-amiri leading-relaxed rounded-2xl border border-[#E5E2D9] bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/30 focus:border-[#4A5D4E] text-[#2C2C2C]"
                />

                <div className="flex items-center justify-between text-[11px] text-[#6E6A64] mt-1.5 px-1">
                  <span>عدد الكلمات: <strong>{wordCount}</strong></span>
                  <span>وقت القراءة التقديري: <strong>{readingTimeMinutes} دقيقة</strong></span>
                </div>
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
                  سيتم نشر مقالك في المنصة فوراً مع وسم <strong>مساهمة من القراء</strong>.
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
