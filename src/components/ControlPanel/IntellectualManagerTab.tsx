import React, { useState } from 'react';
import { IntellectualItem } from '../../types';
import { storageService } from '../../services/storageService';
import {
  FileText,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Languages,
  BookOpen,
  Search,
  Check,
  X,
  ExternalLink,
  Eye,
  Heart
} from 'lucide-react';

interface IntellectualManagerTabProps {
  onRefreshData?: () => void;
  onPreviewArticle?: (id: string) => void;
}

export const IntellectualManagerTab: React.FC<IntellectualManagerTabProps> = ({
  onRefreshData,
  onPreviewArticle,
}) => {
  const [articles, setArticles] = useState<IntellectualItem[]>(() => storageService.getArticles());
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState<string>('');
  const [subtitle, setSubtitle] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [type, setType] = useState<'study' | 'article' | 'translated_article'>('article');
  const [author, setAuthor] = useState<string>('أيمن كناني');
  const [originalAuthor, setOriginalAuthor] = useState<string>('');
  const [translator, setTranslator] = useState<string>('أيمن كناني');
  const [originalLanguage, setOriginalLanguage] = useState<string>('الإنجليزية');
  const [originalSource, setOriginalSource] = useState<string>('');
  const [originalYear, setOriginalYear] = useState<string>('');
  const [category, setCategory] = useState<string>('فلسفة وفكر');
  const [tagsInput, setTagsInput] = useState<string>('فلسفة, فكر, تأمل');
  const [readingTime, setReadingTime] = useState<number>(10);
  const [abstract, setAbstract] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [referencesInput, setReferencesInput] = useState<string>('');
  const [deweyDecimal, setDeweyDecimal] = useState<string>('');
  const [doi, setDoi] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const refreshList = () => {
    setArticles(storageService.getArticles());
    if (onRefreshData) onRefreshData();
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setTitle('');
    setSubtitle('');
    setSlug(`article-${Date.now()}`);
    setType('article');
    setAuthor('أيمن كناني');
    setOriginalAuthor('');
    setTranslator('أيمن كناني');
    setOriginalLanguage('الإنجليزية');
    setOriginalSource('');
    setOriginalYear('');
    setCategory('فلسفة وفكر');
    setTagsInput('فلسفة, فكر');
    setReadingTime(10);
    setAbstract('');
    setContent('');
    setReferencesInput('');
    setDeweyDecimal('');
    setDoi('');
    setIsEditing(true);
  };

  const handleOpenEdit = (item: IntellectualItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setSubtitle(item.subtitle || '');
    setSlug(item.slug || `article-${item.id}`);
    setType(item.type);
    setAuthor(item.author);
    setOriginalAuthor(item.originalAuthor || '');
    setTranslator(item.translator || 'أيمن كناني');
    setOriginalLanguage(item.originalLanguage || 'الإنجليزية');
    setOriginalSource(item.originalSource || '');
    setOriginalYear(item.originalYear || '');
    setCategory(item.category);
    setTagsInput(item.tags ? item.tags.join(', ') : '');
    setReadingTime(item.readingTimeMinutes || 10);
    setAbstract(item.abstract || '');
    setContent(item.content || '');
    setReferencesInput(item.references ? item.references.join('\n') : '');
    setDeweyDecimal(item.deweyDecimal || '');
    setDoi(item.doi || '');
    setIsEditing(true);
  };

  const handleDelete = (id: string, itemTitle: string) => {
    if (window.confirm(`هل أنت متأكد من حذف: "${itemTitle}"؟`)) {
      storageService.deleteArticle(id);
      refreshList();
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('يرجى كتابة عنوان المقال ومحتواه');
      return;
    }

    const tags = tagsInput
      .split(/[,،]/)
      .map(t => t.trim())
      .filter(Boolean);

    const references = referencesInput
      .split('\n')
      .map(r => r.trim())
      .filter(Boolean);

    const wordCount = content.split(/\s+/).length;

    if (editingId) {
      storageService.updateArticle(editingId, {
        title,
        subtitle,
        slug,
        type,
        author: type === 'translated_article' && originalAuthor ? originalAuthor : author,
        originalAuthor,
        translator: type === 'translated_article' ? translator : undefined,
        originalLanguage: type === 'translated_article' ? originalLanguage : undefined,
        originalSource: type === 'translated_article' ? originalSource : undefined,
        originalYear: type === 'translated_article' ? originalYear : undefined,
        category,
        tags,
        readingTimeMinutes: readingTime,
        wordCount,
        abstract,
        content,
        references,
        deweyDecimal,
        doi,
      });
      setSuccessMsg('تم تحديث المادة بنجاح!');
    } else {
      storageService.addArticle({
        title,
        subtitle,
        slug,
        type,
        author: type === 'translated_article' && originalAuthor ? originalAuthor : author,
        originalAuthor,
        translator: type === 'translated_article' ? translator : undefined,
        originalLanguage: type === 'translated_article' ? originalLanguage : undefined,
        originalSource: type === 'translated_article' ? originalSource : undefined,
        originalYear: type === 'translated_article' ? originalYear : undefined,
        category,
        tags,
        readingTimeMinutes: readingTime,
        wordCount,
        abstract,
        content,
        references,
        deweyDecimal,
        doi,
      });
      setSuccessMsg('تمت إضافة المادة المعرفية بنجاح إلى محرك البحث والموسوعة!');
    }

    refreshList();
    setIsEditing(false);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const filteredArticles = articles.filter(item => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#4A5D4E]/10 border border-[#4A5D4E]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-amiri font-bold text-xl sm:text-2xl text-[#2C2C2C] flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#4A5D4E]" />
            <span>إدارة الدراسات والأبحاث والمقالات المعرفية والمترجمة</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#2C2C2C]/70 mt-1">
            إضافة وتعديل المواد المعرفية والمقالات المترجمة المفهرسة في محرك البحث الموسوعي
          </p>
        </div>

        <button
          type="button"
          id="add-intellectual-btn"
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl bg-[#4A5D4E] text-white text-xs font-bold flex items-center gap-2 hover:bg-[#3d4d40] transition-all cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة دراسة أو مقال جديد</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Editor Modal / Section */}
      {isEditing && (
        <div className="p-6 rounded-2xl border-2 border-[#4A5D4E] bg-white shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <h3 className="font-amiri font-bold text-lg text-[#2C2C2C]">
              {editingId ? 'تعديل المادة المعرفية' : 'إضافة مادة جديدة للموسوعة ومحرك البحث'}
            </h3>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
            {/* Type selector */}
            <div>
              <label className="block font-bold mb-1.5 text-stone-700">نوع المادة المعرفية:</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setType('study')}
                  className={`p-3 rounded-xl border font-bold flex items-center justify-center gap-2 cursor-pointer ${
                    type === 'study'
                      ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-400'
                      : 'border-stone-200 bg-stone-50 text-stone-700'
                  }`}
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>دراسة بحثية محكمة</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType('article')}
                  className={`p-3 rounded-xl border font-bold flex items-center justify-center gap-2 cursor-pointer ${
                    type === 'article'
                      ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-400'
                      : 'border-stone-200 bg-stone-50 text-stone-700'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>مقال فكري وفلسفي</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType('translated_article')}
                  className={`p-3 rounded-xl border font-bold flex items-center justify-center gap-2 cursor-pointer ${
                    type === 'translated_article'
                      ? 'bg-purple-50 border-purple-500 text-purple-900 ring-2 ring-purple-400'
                      : 'border-stone-200 bg-stone-50 text-stone-700'
                  }`}
                >
                  <Languages className="w-4 h-4 text-purple-600" />
                  <span>مقال / دراسة مترجمة</span>
                </button>
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold mb-1 text-stone-700">عنوان المادة (رئيسي):</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="مثال: إشكالية الوعي والذكاء الاصطناعي..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-[#4A5D4E] outline-hidden text-sm"
                  required
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-stone-700">العنوان الفرعي (توضيحي):</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={e => setSubtitle(e.target.value)}
                  placeholder="مثال: قراءة في حدود النماذج التوليدية..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-[#4A5D4E] outline-hidden text-sm"
                />
              </div>
            </div>

            {/* Translation Specific fields */}
            {type === 'translated_article' && (
              <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 space-y-3">
                <h4 className="font-bold text-purple-900 flex items-center gap-1.5">
                  <Languages className="w-4 h-4" />
                  <span>بيانات الترجمة والمؤلف الأصلي:</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">المؤلف الأصلي:</label>
                    <input
                      type="text"
                      value={originalAuthor}
                      onChange={e => setOriginalAuthor(e.target.value)}
                      placeholder="توماس ناغل (Thomas Nagel)"
                      className="w-full p-2 rounded-lg border border-purple-300 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">اللغة الأصلية:</label>
                    <input
                      type="text"
                      value={originalLanguage}
                      onChange={e => setOriginalLanguage(e.target.value)}
                      placeholder="الإنجليزية"
                      className="w-full p-2 rounded-lg border border-purple-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">المترجم:</label>
                    <input
                      type="text"
                      value={translator}
                      onChange={e => setTranslator(e.target.value)}
                      placeholder="أيمن كناني"
                      className="w-full p-2 rounded-lg border border-purple-300 bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 mb-1">المصدر / المجلة الأصلية:</label>
                    <input
                      type="text"
                      value={originalSource}
                      onChange={e => setOriginalSource(e.target.value)}
                      placeholder="The Philosophical Review, Vol. 83"
                      className="w-full p-2 rounded-lg border border-purple-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">سنة النشر الأصلية:</label>
                    <input
                      type="text"
                      value={originalYear}
                      onChange={e => setOriginalYear(e.target.value)}
                      placeholder="1974"
                      className="w-full p-2 rounded-lg border border-purple-300 bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Category & Tags & Dewey & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold mb-1 text-stone-700">التصنيف / المجال:</label>
                <input
                  type="text"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  placeholder="فلسفة، علم نفس، نقد أدبي..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-stone-700">الكلمات المفتاحية (مفصولة بفاصلة):</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                  placeholder="وعي, ذكاء اصطناعي, ترجمة"
                  className="w-full p-2.5 rounded-xl border border-stone-300 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-stone-700">وقت القراءة المقدر (بالدقائق):</label>
                <input
                  type="number"
                  value={readingTime}
                  onChange={e => setReadingTime(Number(e.target.value))}
                  min={1}
                  className="w-full p-2.5 rounded-xl border border-stone-300 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-stone-700">تصنيف ديوي / DOI (اختياري):</label>
                <input
                  type="text"
                  value={deweyDecimal}
                  onChange={e => setDeweyDecimal(e.target.value)}
                  placeholder="128.2"
                  className="w-full p-2.5 rounded-xl border border-stone-300 outline-hidden"
                />
              </div>
            </div>

            {/* Abstract */}
            <div>
              <label className="block font-bold mb-1 text-stone-700">المستخلص / ملخص المادة (Abstract):</label>
              <textarea
                value={abstract}
                onChange={e => setAbstract(e.target.value)}
                rows={3}
                placeholder="نبذة موجزة تشرح الفكرة المركزية للمقال أو البحث..."
                className="w-full p-2.5 rounded-xl border border-stone-300 outline-hidden text-sm"
              />
            </div>

            {/* Full Content */}
            <div>
              <label className="block font-bold mb-1 text-stone-700">نص المقال / الدراسة الكامل (يدعم عناوين ## وقوائم *):</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={10}
                placeholder="اكتب المحتوى الفكري هنا..."
                className="w-full p-3 rounded-xl border border-stone-300 font-amiri text-base leading-relaxed outline-hidden"
                required
              />
            </div>

            {/* References */}
            <div>
              <label className="block font-bold mb-1 text-stone-700">المراجع الأكاديمية (كل مرجع في سطر منفصل):</label>
              <textarea
                value={referencesInput}
                onChange={e => setReferencesInput(e.target.value)}
                rows={3}
                placeholder="Chalmers, David (1996)...&#10;باشلار، غاستون (1984)..."
                className="w-full p-2.5 rounded-xl border border-stone-300 font-mono text-xs outline-hidden"
              />
            </div>

            {/* Submit & Cancel */}
            <div className="flex items-center gap-3 pt-3">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#4A5D4E] text-white text-xs font-bold hover:bg-[#3d4d40] transition-colors cursor-pointer"
              >
                {editingId ? 'حفظ التعديلات' : 'نشر المادة في الموسوعة'}
              </button>

              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-600 text-xs font-bold hover:bg-stone-100 cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'study', label: 'دراسات وأبحاث' },
            { id: 'article', label: 'مقالات فكرية' },
            { id: 'translated_article', label: 'مقالات مترجمة' },
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer ${
                filterType === f.id
                  ? 'bg-[#4A5D4E] text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="بحث في المواد..."
            className="w-full py-2 pr-8 pl-3 rounded-xl border border-stone-200 text-xs bg-white"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-3" />
        </div>
      </div>

      {/* Articles Table */}
      <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
        <table className="w-full text-right text-xs">
          <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold">
            <tr>
              <th className="p-3">النوع</th>
              <th className="p-3">العنوان</th>
              <th className="p-3">المؤلف / المترجم</th>
              <th className="p-3">التصنيف</th>
              <th className="p-3">القراءات / الإعجابات</th>
              <th className="p-3">تاريخ النشر</th>
              <th className="p-3 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filteredArticles.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-stone-400">
                  لا توجد مواد تطابق المعايير
                </td>
              </tr>
            ) : (
              filteredArticles.map(item => (
                <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="p-3">
                    {item.type === 'study' && (
                      <span className="px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800 text-[10px]">
                        دراسة
                      </span>
                    )}
                    {item.type === 'article' && (
                      <span className="px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 text-[10px]">
                        مقال فكري
                      </span>
                    )}
                    {item.type === 'translated_article' && (
                      <span className="px-2 py-0.5 rounded-full font-bold bg-purple-100 text-purple-800 text-[10px]">
                        ترجمة
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-amiri font-bold text-sm max-w-xs truncate">
                    {item.title}
                  </td>
                  <td className="p-3 text-stone-600">
                    {item.type === 'translated_article' ? (
                      <span>{item.originalAuthor} (ترجمة: {item.translator})</span>
                    ) : (
                      item.author
                    )}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-stone-500">
                    {item.views} قراءة • {item.likes} إعجاب
                  </td>
                  <td className="p-3 text-stone-400">
                    {item.publishedAt}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {onPreviewArticle && (
                        <button
                          type="button"
                          onClick={() => onPreviewArticle(item.id)}
                          className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600"
                          title="معاينة وقراءة"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-lg hover:bg-stone-100 text-blue-600"
                        title="تعديل"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.title)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
