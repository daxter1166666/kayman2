import React, { useState, useEffect } from 'react';
import { IntellectualItem } from '../../types';
import { storageService } from '../../services/storageService';
import { supabaseService } from '../../services/supabaseService';
import { RichTextEditor } from '../RichTextEditor/RichTextEditor';
import {
  Languages,
  Save,
  Sparkles,
  FilePlus,
  CheckCircle2,
  Bookmark,
  Clock,
  BookOpen,
  Calendar,
  Globe,
  Quote,
  FileText,
  HelpCircle
} from 'lucide-react';

interface TranslationsEditorStudioTabProps {
  onRefreshData?: () => void;
  onNavigateTab?: (tab: string) => void;
}

const COMMON_LANGUAGES = [
  'الإنجليزية (English)',
  'الفرنسية (Français)',
  'الألمانية (Deutsch)',
  'الإسبانية (Español)',
  'الإيطالية (Italiano)',
  'الروسية (Русский)',
  'اللاتينية / الإغريقية القديمة',
  'أخرى'
];

export const TranslationsEditorStudioTab: React.FC<TranslationsEditorStudioTabProps> = ({
  onRefreshData,
  onNavigateTab,
}) => {
  const [translations, setTranslations] = useState<IntellectualItem[]>(() => {
    return storageService.getArticles().filter(a => a.type === 'translated_article');
  });

  const [selectedId, setSelectedId] = useState<string>('new');
  const [title, setTitle] = useState<string>('');
  const [subtitle, setSubtitle] = useState<string>('');
  const [originalTitle, setOriginalTitle] = useState<string>('');
  const [originalAuthor, setOriginalAuthor] = useState<string>('');
  const [translator, setTranslator] = useState<string>('أيمن كناني');
  const [originalLanguage, setOriginalLanguage] = useState<string>('الإنجليزية (English)');
  const [originalSource, setOriginalSource] = useState<string>('');
  const [originalYear, setOriginalYear] = useState<string>('');
  const [category, setCategory] = useState<string>('فلسفة وترجمة فكرية');
  const [tagsInput, setTagsInput] = useState<string>('ترجمة فكرية, فلسفة العقل, نصوص كلاسيكية');
  const [readingTime, setReadingTime] = useState<number>(18);
  const [coverImage, setCoverImage] = useState<string>('');
  const [abstractAr, setAbstractAr] = useState<string>('');
  const [abstractEn, setAbstractEn] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [referencesInput, setReferencesInput] = useState<string>('');
  const [footnotesInput, setFootnotesInput] = useState<string>('');
  const [deweyDecimal, setDeweyDecimal] = useState<string>('128.2');
  const [isFeatured, setIsFeatured] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshList = () => {
    const list = storageService.getArticles().filter(a => a.type === 'translated_article');
    setTranslations(list);
    if (onRefreshData) onRefreshData();
  };

  // Select a translation
  const handleSelectTranslation = (id: string) => {
    setSelectedId(id);
    if (id === 'new') {
      setTitle('');
      setSubtitle('');
      setOriginalTitle('');
      setOriginalAuthor('');
      setTranslator('أيمن كناني');
      setOriginalLanguage('الإنجليزية (English)');
      setOriginalSource('');
      setOriginalYear('');
      setCategory('فلسفة وترجمة فكرية');
      setTagsInput('ترجمة فكرية, فلسفة العقل');
      setReadingTime(15);
      setCoverImage('');
      setAbstractAr('');
      setAbstractEn('');
      setContent('');
      setReferencesInput('');
      setFootnotesInput('');
      setDeweyDecimal('128.2');
      setIsFeatured(false);
    } else {
      const item = translations.find(t => t.id === id);
      if (item) {
        setTitle(item.title);
        setSubtitle(item.subtitle || '');
        setOriginalTitle(item.originalTitle || '');
        setOriginalAuthor(item.originalAuthor || item.author || '');
        setTranslator(item.translator || 'أيمن كناني');
        setOriginalLanguage(item.originalLanguage || 'الإنجليزية (English)');
        setOriginalSource(item.originalSource || '');
        setOriginalYear(item.originalYear || '');
        setCategory(item.category || 'فلسفة وترجمة فكرية');
        setTagsInput(item.tags ? item.tags.join(', ') : '');
        setReadingTime(item.readingTimeMinutes || 15);
        setCoverImage(item.coverImage || '');
        setAbstractAr(item.multilingualAbstract?.ar || item.abstract || '');
        setAbstractEn(item.multilingualAbstract?.en || '');
        setContent(item.content || '');
        setReferencesInput(item.references ? item.references.join('\n') : '');
        setFootnotesInput(
          item.footnotes ? item.footnotes.map(f => `[${f.id}] ${f.text}`).join('\n') : ''
        );
        setDeweyDecimal(item.deweyDecimal || '');
        setIsFeatured(Boolean(item.isFeatured));
      }
    }
  };

  // Auto reading time
  useEffect(() => {
    const textLength = content.replace(/<[^>]*>?/gm, '').length;
    if (textLength > 100) {
      const estimatedMinutes = Math.max(4, Math.round(textLength / 420));
      setReadingTime(estimatedMinutes);
    }
  }, [content]);

  // Handle Save
  const handleSave = async () => {
    if (!title.trim()) {
      showToast('يرجى كتابة عنوان الترجمة العربية.');
      return;
    }
    if (!originalTitle.trim()) {
      showToast('يرجى كتابة العنوان الأصلي للدراسة.');
      return;
    }
    if (!content.trim()) {
      showToast('يرجى كتابة نص الترجمة في المحرر قبل الحفظ.');
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

    const parsedFootnotes = footnotesInput
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map((line, idx) => {
        const match = line.match(/^\[(\d+)\]\s*(.*)$/);
        if (match) {
          return { id: parseInt(match[1], 10), text: match[2] };
        }
        return { id: idx + 1, text: line };
      });

    setIsSaving(true);

    try {
      if (selectedId !== 'new') {
        // Update
        storageService.updateArticle(selectedId, {
          title: title.trim(),
          subtitle: subtitle.trim() || undefined,
          originalTitle: originalTitle.trim(),
          originalAuthor: originalAuthor.trim() || undefined,
          translator: translator.trim() || 'أيمن كناني',
          originalLanguage: originalLanguage.trim(),
          originalSource: originalSource.trim() || undefined,
          originalYear: originalYear.trim() || undefined,
          category: category.trim(),
          tags,
          readingTimeMinutes: readingTime,
          coverImage: coverImage.trim() || undefined,
          abstract: abstractAr.trim() || undefined,
          multilingualAbstract: {
            ar: abstractAr.trim(),
            en: abstractEn.trim(),
          },
          content: content.trim(),
          references,
          footnotes: parsedFootnotes.length > 0 ? parsedFootnotes : undefined,
          deweyDecimal: deweyDecimal.trim() || undefined,
          isFeatured,
        });

        const updated = storageService.getArticleById(selectedId);
        if (updated) {
          await supabaseService.saveArticleToSupabase(updated);
        }
        showToast('تم حفظ التعديلات على الدراسة المترجمة بنجاح ومزامنتها سحابياً!');
      } else {
        // Add new translated article
        const slug = title
          .trim()
          .toLowerCase()
          .replace(/[^\u0621-\u064A\w]+/g, '-')
          .replace(/^-+|-+$/g, '') || `trans-${Date.now()}`;

        const newTrans = storageService.addArticle({
          title: title.trim(),
          subtitle: subtitle.trim() || undefined,
          originalTitle: originalTitle.trim(),
          originalAuthor: originalAuthor.trim() || undefined,
          translator: translator.trim() || 'أيمن كناني',
          originalLanguage: originalLanguage.trim(),
          originalSource: originalSource.trim() || undefined,
          originalYear: originalYear.trim() || undefined,
          slug,
          type: 'translated_article',
          author: originalAuthor.trim() || translator.trim(),
          category: category.trim(),
          tags,
          readingTimeMinutes: readingTime,
          coverImage: coverImage.trim() || undefined,
          abstract: abstractAr.trim() || undefined,
          multilingualAbstract: {
            ar: abstractAr.trim(),
            en: abstractEn.trim(),
          },
          content: content.trim(),
          references,
          footnotes: parsedFootnotes.length > 0 ? parsedFootnotes : undefined,
          deweyDecimal: deweyDecimal.trim() || undefined,
          isFeatured,
          publishedAt: new Date().toISOString().split('T')[0],
        });

        await supabaseService.saveArticleToSupabase(newTrans);
        setSelectedId(newTrans.id);
        showToast('تم نشر الدراسة المترجمة الجديدة وحفظها في سوباباس بنجاح!');
      }

      refreshList();
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء الحفظ. يرجى المحاولة ثانية.');
    } finally {
      setIsSaving(false);
    }
  };

  // Load sample template
  const handleLoadSample = () => {
    if (content.trim() && !window.confirm('هل تريد استبدال النص الحالي بنموذج دراسة مترجمة ومحققة؟')) {
      return;
    }
    setTitle('الوعي والظاهراتية: سبر أغوار الخبرة الذاتية عند هوسرل وميرلوبونتي');
    setSubtitle('ترجمة تحليلية محققة من الفلسفة الظاهراتية مع دراسة استقصائية لمفهوم القصدية');
    setOriginalTitle('Consciousness and the Phenomenological Turn: Intentionality and the Lived Body');
    setOriginalAuthor('موريس ميرلوبونتي (Maurice Merleau-Ponty)');
    setTranslator('أيمن كناني');
    setOriginalLanguage('الفرنسية (Français)');
    setOriginalSource('Revue de Métaphysique et de Morale, Vol. 58, No. 2, pp. 132-155');
    setOriginalYear('1953');
    setCategory('فلسفة وترجمة فكرية');
    setTagsInput('ميرلوبونتي, ظاهراتية, الجسد المعاش, القصدية, ترجمة فلسفية');
    setAbstractAr('تقدم هذه الدراسة المترجمة مراجعة فلسفية نقدية لأطروحة ميرلوبونتي حول "الجسد المعاش" (Corps Vécu) وكيف أن الإدراك الحسي ليس مجرد تسجيل ميكانيكي للمؤثرات، بل حوار وجودي فاعل مع العالم المحيط.');
    setAbstractEn('This translated text investigates Merleau-Ponty’s phenomenology of perception, focusing on the lived body as the primary vehicle of being in the world.');
    setContent(`<h2>مقدمة المترجم: في استعادة الجسد كأفق للمعنى</h2>
<p>تمثل الفينومينولوجيا (الظاهراتية) واحدة من أخصب الثورات الفلسفية في القرن العشرين، إذ نقلت التفكير من التجريد الميتافيزيقي المنفصل إلى <em>"العودة إلى الأشياء ذاتها كما تتجلى للوعي"</em>.</p>

<blockquote class="poetry-verse">
  <p>«ليس الوعي حيزاً مغلقاً يسكنه الفكر، بل هو حركة خروج دائمة نحو العالم»</p>
</blockquote>

<h2>1. نص الدراسة: وهم الموضوعية الخالصة</h2>
<p>حين ننظر إلى شجرة في بستان، فإننا لا نرى كتلة فيزيائية مجردة من الأطوال الموجية والانعكاسات الضوئية، بل ندرك حضوراً حياً له كثافة، وظلال، وعلاقة بحركتنا وإحساسنا بالنسيم [1]. إن النزعة العلموية الاختزالية حاولت مصادرة هذه الخبرة الأصلية، واعتبار الإدراك الحسي مجرد عمليات كهروكيميائية عمياء.</p>

<h2>2. الجسد الفاعل لا الآلة المادية</h2>
<p>الجسد في رؤية ميرلوبونتي ليس مجرد "أداة" تحركها الروح كما زعم ديكارت، بل هو ركيزة وجودنا في العالم (Être-au-monde) ومصدر كل دلالة رمزية ومعرفية يمارسها العقل البشري [2].</p>`);
    setReferencesInput(`Merleau-Ponty, Maurice (1945). Phénoménologie de la perception. Paris: Gallimard.\nHusserl, Edmund (1931). Méditations cartésiennes. Vrin.`);
    setFootnotesInput(`[1] ملاحظة المترجم: يقصد المؤلف هنا التفريق بين "العالم الموضوعي" كما يرسمه العلم المجرد، و"عالم الحياة" (Lebenswelt) كما يعيشه الإنسان فعلياً.\n[2] يشدد المترجم على أن مصطلح (Lived Body) يترجم دقيقاً بـ "الجسد المعاش" تمييزاً له عن الجثة أو الجسم البيولوجي الصرف.`);
    showToast('تم تحميل نموذج الدراسة المترجمة بنجاح!');
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
              <Languages className="w-4 h-4" />
              <span>محرر الدراسات والترجمات الفكرية المخصص (WYSIWYG)</span>
            </div>
            <h1 className="font-amiri font-bold text-2xl sm:text-3xl text-[#2C2C2C]">
              استوديو الترجمات والدراسات المقارنة
            </h1>
            <p className="text-xs sm:text-sm text-[#6E6A64] mt-2 max-w-2xl leading-relaxed">
              تحرير وتوثيق النصوص المترجمة، توثيق المؤلف الأصلي، بيانات النشر، هوامش المترجم وحواشيه النقدية، مع محرر نصوص غني بالخطوط العربية والأبيات الشعرية.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSample}
              className="px-4 py-2.5 rounded-xl border border-[#E5E2D9] bg-white hover:bg-[#FAF8F2] text-xs font-bold text-[#4A5D4E] flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-98"
              title="تحميل هيكل دراسة مترجمة ومحققة"
            >
              <Sparkles className="w-4 h-4 text-[#C88A3B]" />
              <span>نموذج ترجمة محققة</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-[#4A5D4E] hover:bg-[#3C4C3F] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-98 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'جارٍ الحفظ...' : selectedId === 'new' ? 'نشر الدراسة المترجمة' : 'حفظ التعديلات'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Translation Selector Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5E2D9] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <label className="text-xs font-bold text-[#4A5D4E] shrink-0 flex items-center gap-1.5">
            <Bookmark className="w-4 h-4 text-[#4A5D4E]" />
            <span>اختر دراسة مترجمة أو ابدأ عملاً جديداً:</span>
          </label>
          <select
            value={selectedId}
            onChange={e => handleSelectTranslation(e.target.value)}
            className="flex-1 px-3 py-2 text-xs rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] font-bold focus:outline-none focus:border-[#4A5D4E] cursor-pointer"
          >
            <option value="new">✨ + إضافة دراسة / ترجمة فكرية جديدة</option>
            <optgroup label="الدراسات المترجمة في المنصة">
              {translations.map(t => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.originalAuthor || 'ترجمة فكرية'})
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        <button
          type="button"
          onClick={() => handleSelectTranslation('new')}
          className="px-4 py-2 rounded-xl bg-[#F7F5EE] border border-[#E5E2D9] hover:bg-[#ECE8DE] text-xs font-bold text-[#4A5D4E] flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
        >
          <FilePlus className="w-4 h-4" />
          <span>بدء عمل مترجم جديد</span>
        </button>
      </div>

      {/* Metadata Form */}
      <div className="bg-[#FDFCF8] p-5 sm:p-6 rounded-2xl border border-[#E5E2D9] shadow-xs space-y-4">
        {/* Arabic Title & Original Title */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#4A5D4E] mb-1.5">
              عنوان الترجمة بالعربية <span className="text-rose-500">*</span>:
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="مثال: ما الذي يعنيه أن تكون خفاشاً؟ سبر أغوار الوعي الذاتي..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-white border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E] font-amiri font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#4A5D4E] mb-1.5">
              العنوان باللغة الأصلية (Original Title) <span className="text-rose-500">*</span>:
            </label>
            <input
              type="text"
              value={originalTitle}
              onChange={e => setOriginalTitle(e.target.value)}
              placeholder="e.g. What Is It Like to Be a Bat?"
              dir="ltr"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-white border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E] font-mono text-left"
            />
          </div>
        </div>

        {/* Authors & Translator */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#6E6A64] mb-1.5">
              المؤلف الأصلي:
            </label>
            <input
              type="text"
              value={originalAuthor}
              onChange={e => setOriginalAuthor(e.target.value)}
              placeholder="توماس ناغل (Thomas Nagel)"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#4A5D4E] mb-1.5">
              المترجم والمحقق:
            </label>
            <input
              type="text"
              value={translator}
              onChange={e => setTranslator(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E] font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#6E6A64] mb-1.5">
              لغة النص الأصلي:
            </label>
            <select
              value={originalLanguage}
              onChange={e => setOriginalLanguage(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E] cursor-pointer"
            >
              {COMMON_LANGUAGES.map(lang => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Publication Source & Year */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#6E6A64] mb-1.5">
              مصدر النشر الأصلي (دورية، دار نشر، مجلد):
            </label>
            <input
              type="text"
              value={originalSource}
              onChange={e => setOriginalSource(e.target.value)}
              placeholder="The Philosophical Review, Vol. 83, pp. 435-450"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#6E6A64] mb-1.5">
              سنة الصدور الأصلية:
            </label>
            <input
              type="text"
              value={originalYear}
              onChange={e => setOriginalYear(e.target.value)}
              placeholder="1974"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E] font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#6E6A64] mb-1.5 flex items-center justify-between">
              <span>وقت القراءة المقدر:</span>
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

        {/* Abstract Arabic & English */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#4A5D4E] mb-1.5">
              المستخلص بالعربية (مقدمة تلخيصية للأطروحة):
            </label>
            <textarea
              value={abstractAr}
              onChange={e => setAbstractAr(e.target.value)}
              rows={2}
              placeholder="نبذة تشرح أهمية النص الفلسفي المترجم..."
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E] leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#6E6A64] mb-1.5">
              Abstract (English Summary - optional):
            </label>
            <textarea
              value={abstractEn}
              onChange={e => setAbstractEn(e.target.value)}
              rows={2}
              dir="ltr"
              placeholder="A brief English abstract of the translated paper..."
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E] font-mono text-[11px] leading-relaxed text-left"
            />
          </div>
        </div>
      </div>

      {/* Core Rich Text Editor Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <label className="text-sm font-bold text-[#2C2C2C] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#4A5D4E]" />
            <span>نص الترجمة الفكرية الكامل (التحقيق والصياغة العربية):</span>
          </label>
          <span className="text-xs text-[#8E8A83]">
            شامل تنسيقات الفقرات، العناوين، والشواهد، وإشارات الهوامش [1]
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E2D9] overflow-hidden shadow-xs">
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="اكتب أو الصق نص الترجمة العربية المحققة هنا..."
            novelTitle="الدراسات المترجمة"
            chapterTitle={title || 'ترجمة جديدة'}
            authorName={translator}
            minHeight="520px"
          />
        </div>
      </div>

      {/* Translator Footnotes & Academic References */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Footnotes */}
        <div className="bg-[#FDFCF8] p-5 rounded-2xl border border-[#E5E2D9] shadow-xs">
          <label className="block text-xs font-bold text-[#4A5D4E] mb-1.5">
            هوامش وحواشي المترجم (كل هامش في سطر، مثال: [1] نص الهامش):
          </label>
          <textarea
            value={footnotesInput}
            onChange={e => setFootnotesInput(e.target.value)}
            rows={4}
            placeholder="[1] ملاحظة المترجم: العبارة اللاتينية تعني...&#10;[2] يوضح المترجم أن المصطلح الألماني Dasein..."
            className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E] leading-relaxed"
          />
        </div>

        {/* Academic References */}
        <div className="bg-[#FDFCF8] p-5 rounded-2xl border border-[#E5E2D9] shadow-xs">
          <label className="block text-xs font-bold text-[#4A5D4E] mb-1.5">
            المراجع الأجنبية والمصادر الببليوغرافية (كل مرجع في سطر):
          </label>
          <textarea
            value={referencesInput}
            onChange={e => setReferencesInput(e.target.value)}
            rows={4}
            placeholder="Nagel, Thomas (1974). What Is It Like to Be a Bat?...&#10;Jackson, Frank (1982). Epiphenomenal Qualia..."
            dir="ltr"
            className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E] font-mono text-[11px] leading-relaxed text-left"
          />
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-4 bg-white rounded-2xl border border-[#E5E2D9] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-[#8E8A83] flex items-center gap-2">
          <span>الحالة:</span>
          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold border border-purple-200">
            {selectedId === 'new' ? 'عمل مترجم جديد' : 'ترجمة منشورة'}
          </span>
          <span className="text-stone-300">|</span>
          <span>عدد الكلمات:</span>
          <span className="font-mono font-bold text-[#2C2C2C]">
            {content.replace(/<[^>]*>?/gm, ' ').split(/\s+/).filter(Boolean).length}
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => handleSelectTranslation('new')}
            className="px-4 py-2 rounded-xl border border-[#E5E2D9] text-xs font-bold text-[#6E6A64] hover:bg-[#F7F5EE] transition-all cursor-pointer"
          >
            إعادة تعيين
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-[#4A5D4E] hover:bg-[#3C4C3F] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-98 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'جارٍ الحفظ والمزامنة...' : 'حفظ ونشر الترجمة'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
