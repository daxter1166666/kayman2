import React, { useState, useEffect } from 'react';
import { Novel, Chapter } from '../../types';
import { storageService } from '../../services/storageService';
import { supabaseService } from '../../services/supabaseService';
import { RichTextEditor } from '../RichTextEditor/RichTextEditor';
import {
  Feather,
  BookOpen,
  Save,
  Send,
  Sparkles,
  FilePlus,
  CheckCircle2,
  AlertCircle,
  Copy,
  Printer,
  Undo2,
  Eye,
  ArrowRight
} from 'lucide-react';

interface RichEditorStudioTabProps {
  novels: Novel[];
  chapters: Chapter[];
  onRefreshData: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const RichEditorStudioTab: React.FC<RichEditorStudioTabProps> = ({
  novels,
  chapters,
  onRefreshData,
  onNavigateTab,
}) => {
  const [selectedNovelId, setSelectedNovelId] = useState<string>(novels[0]?.id || '');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('new');
  const [chapterTitle, setChapterTitle] = useState<string>('');
  const [authorNote, setAuthorNote] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [status, setStatus] = useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Novel chapters
  const currentNovelChapters = chapters
    .filter(c => c.novelId === selectedNovelId)
    .sort((a, b) => a.chapterNumber - b.chapterNumber);

  // When chapter selection changes
  const handleChapterSelect = (chId: string) => {
    setSelectedChapterId(chId);
    if (chId === 'new') {
      setChapterTitle('');
      setAuthorNote('');
      setContent('');
      setStatus('PUBLISHED');
    } else {
      const ch = chapters.find(c => c.id === chId);
      if (ch) {
        setChapterTitle(ch.title);
        setAuthorNote(ch.authorNote || '');
        setContent(ch.content);
        setStatus(ch.status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED');
      }
    }
  };

  // When novel selection changes
  const handleNovelSelect = (nId: string) => {
    setSelectedNovelId(nId);
    setSelectedChapterId('new');
    setChapterTitle('');
    setAuthorNote('');
    setContent('');
  };

  // Save or Publish chapter directly from the studio
  const handleSaveToBook = async () => {
    if (!selectedNovelId) {
      showToast('يرجى اختيار الكتاب أولاً.');
      return;
    }
    if (!chapterTitle.trim()) {
      showToast('يرجى كتابة عنوان الفصل.');
      return;
    }
    if (!content.trim()) {
      showToast('يرجى كتابة نص ومحتوى الفصل قبل الحفظ.');
      return;
    }

    setIsSaving(true);

    try {
      if (selectedChapterId !== 'new') {
        // Update existing chapter
        storageService.updateChapter(selectedChapterId, {
          title: chapterTitle.trim(),
          content: content.trim(),
          authorNote: authorNote.trim() || undefined,
          status,
        });

        const updated = storageService.getChapters().find(c => c.id === selectedChapterId);
        if (updated) {
          await supabaseService.saveChapterToSupabase(updated);
        }
        showToast('تم حفظ التنسيقات وتحديث الفصل بنجاح ومزامنته سحابياً!');
      } else {
        // Add new chapter
        const newlyAdded = storageService.addChapter({
          novelId: selectedNovelId,
          title: chapterTitle.trim(),
          content: content.trim(),
          authorNote: authorNote.trim() || undefined,
          status,
        });

        if (newlyAdded) {
          await supabaseService.saveChapterToSupabase(newlyAdded);
          setSelectedChapterId(newlyAdded.id);
          showToast(`تم نشر الفصل الجديد "${chapterTitle}" بنجاح في الكتاب!`);
        }
      }
      onRefreshData();
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء الحفظ.');
    } finally {
      setIsSaving(false);
    }
  };

  // Initial sample text if completely empty
  const handleLoadSample = () => {
    const sample = `
      <p><span class="book-drop-cap">ت</span>نفست المدينة الصعداء مع خيوط الفجر الأولى، بينما كانت المآذن والقباب تنعكس في صفحة النهر الهادئ كأنها لوحة مائية نسجتها يد فنان بارع.</p>
      <p>جلس الشاعر في شرفته العالية يرقب حركة القوافل القادمة من بلاد الشرق، وقد أحاطت به دفاتره ومحبرته النحاسية التي لم تجف منذ ليلتين.</p>
      <div class="book-divider my-8 text-center text-lg tracking-widest text-[#C88A3B] select-none font-bold">✦ &nbsp; ✦ &nbsp; ✦</div>
      <div class="book-poetry-couplet my-6 p-4 rounded-2xl bg-[#4A5D4E]/5 border border-[#4A5D4E]/25 text-center font-amiri text-lg max-w-xl mx-auto shadow-xs">
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4 py-2 border-b border-[#4A5D4E]/15">
          <div class="flex-1 text-center font-bold text-[#2C2C2C]">طَرِبْتُ وَعَادَتْنِي لِذِكْرَاكِ هِزَّةٌ</div>
          <div class="text-[#C88A3B] text-sm select-none">✦</div>
          <div class="flex-1 text-center font-bold text-[#2C2C2C]">كَمَا انْتَفَضَ العُصْفُورُ بَلَّلَهُ القَطْرُ</div>
        </div>
      </div>
      <blockquote class="book-quote-block my-6 p-5 rounded-2xl bg-[#F7F5EE] border-r-4 border-[#4A5D4E] italic font-amiri text-lg text-[#2C2C2C] shadow-xs">
        <p class="mb-2">"إن أبهى ما في الأدب أنه يمنحنا فرصة ثانية لنعيش حيواتٍ لم تكن لتتسع لها أيامنا القصيرة."</p>
        <cite class="block text-left text-xs not-italic font-bold text-[#4A5D4E] mt-3 font-cairo">— أيمن كناني</cite>
      </blockquote>
      <p>وهكذا، أدرك أن الكلمات ليست مجرد رموز على ورق، بل هي قبس من روح صاحبها تظل حية على مر الدهور.</p>
    `.trim();
    setContent(sample);
    if (!chapterTitle) {
      setChapterTitle('في ظلال الفجر والأدب العتيق');
    }
    showToast('تم تحميل نص أدبي نموذجي منسق مع أبيات واقتباسات وزخارف!');
  };

  const selectedNovel = novels.find(n => n.id === selectedNovelId);

  return (
    <div className="space-y-6 text-[#2C2C2C] font-cairo">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-[#4A5D4E] text-[#FDFCF8] px-5 py-3 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header & Book Selector */}
      <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4A5D4E]/10 text-[#4A5D4E] text-xs font-bold mb-2">
            <Feather className="w-3.5 h-3.5" />
            <span>محرر الكتب والنصوص الأدبي المتكامل (WYSIWYG)</span>
          </div>
          <h2 className="font-amiri font-bold text-2xl text-[#2C2C2C]">
            استوديو تنسيق وتحرير الفصول والكتب الفاخرة
          </h2>
          <p className="text-xs text-[#6E6A64] mt-1 max-w-2xl">
            محرر مرئي مباشر لا يتطلب كتابة أكواد؛ تظهر التنسيقات والأبيات الشعرية والاقتباسات والخطوط والألوان في الوقت الفعلي مع إمكانية المعاينة الحية الفورية والحفظ في كتبك.
          </p>
        </div>

        {/* Quick Sample & Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleLoadSample}
            className="px-3 py-2 rounded-xl bg-[#F7F5EE] hover:bg-[#EAE7DD] border border-[#E5E2D9] text-xs font-bold text-[#4A5D4E] flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="تجربة نص أدبي نموذجي"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C88A3B]" />
            <span>نص نموذجي جاهز</span>
          </button>

          <button
            type="button"
            onClick={handleSaveToBook}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-[#4A5D4E] hover:bg-[#3C4C3F] text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'جاري الحفظ...' : selectedChapterId === 'new' ? 'نشر الفصل في الكتاب' : 'تحديث الفصل وحفظ التنسيق'}</span>
          </button>
        </div>
      </div>

      {/* Book & Chapter Context Bar */}
      <div className="p-4 rounded-2xl bg-[#F7F5EE] border border-[#E5E2D9] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Novel Selector */}
        <div>
          <label className="font-bold text-[#6E6A64] block mb-1.5">الكتاب أو الرواية:</label>
          <select
            value={selectedNovelId}
            onChange={e => handleNovelSelect(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E2D9] font-bold text-[#2C2C2C] focus:ring-1 focus:ring-[#4A5D4E] cursor-pointer"
          >
            {novels.map(n => (
              <option key={n.id} value={n.id}>
                {n.title}
              </option>
            ))}
          </select>
        </div>

        {/* Chapter Selector (or New) */}
        <div>
          <label className="font-bold text-[#6E6A64] block mb-1.5">تحرير فصل موجود أو جديد:</label>
          <select
            value={selectedChapterId}
            onChange={e => handleChapterSelect(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E2D9] font-bold text-[#2C2C2C] focus:ring-1 focus:ring-[#4A5D4E] cursor-pointer"
          >
            <option value="new">+ إنشاء وتنسيق فصل جديد</option>
            {currentNovelChapters.map(ch => (
              <option key={ch.id} value={ch.id}>
                الفصل {ch.chapterNumber}: {ch.title}
              </option>
            ))}
          </select>
        </div>

        {/* Chapter Title */}
        <div>
          <label className="font-bold text-[#2C2C2C] block mb-1.5">عنوان الفصل المراد حفظه:</label>
          <input
            type="text"
            placeholder="مثال: في ظلال الأندلس وبرج الزمان..."
            value={chapterTitle}
            onChange={e => setChapterTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E2D9] font-amiri font-bold text-[#2C2C2C] focus:ring-1 focus:ring-[#4A5D4E]"
          />
        </div>

        {/* Publication Status */}
        <div>
          <label className="font-bold text-[#6E6A64] block mb-1.5">حالة النشر:</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E2D9] font-bold text-[#2C2C2C] focus:ring-1 focus:ring-[#4A5D4E] cursor-pointer"
          >
            <option value="PUBLISHED">منشور فوراً للقراء</option>
            <option value="DRAFT">مسودة مؤقتة</option>
          </select>
        </div>
      </div>

      {/* Author Note Input (Optional) */}
      <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#E5E2D9] flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <label className="text-xs font-bold text-[#6E6A64] shrink-0">ملاحظة الكاتب الافتتاحية (اختياري):</label>
        <input
          type="text"
          placeholder="مثال: أهلاً بكم في هذا الفصل الخاص، كتبت هذه الأبيات مستلهماً من رحلتي الأخيرة..."
          value={authorNote}
          onChange={e => setAuthorNote(e.target.value)}
          className="w-full px-3 py-1.5 text-xs rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] focus:ring-1 focus:ring-[#4A5D4E]"
        />
      </div>

      {/* FULL WYSIWYG RICH TEXT EDITOR WORKBENCH */}
      <div className="shadow-xs">
        <RichTextEditor
          value={content}
          onChange={setContent}
          novelTitle={selectedNovel?.title || 'كتاب غير محدد'}
          chapterTitle={chapterTitle || 'فصل جديد'}
          authorName={selectedNovel?.author || 'أيمن كناني'}
          placeholder="اكتب هنا مباشرة... اضغط على شريط الأدوات بالأعلى لتطبيق الخطوط والألوان والأبيات الشعرية والاقتباسات فورياً في نفس اللحظة..."
          minHeight="520px"
        />
      </div>

      {/* Quick Footer Action Bar */}
      <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E5E2D9] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#6E6A64]">
          <CheckCircle2 className="w-4 h-4 text-[#4A5D4E]" />
          <span>المحرر مدعوم بمزامنة سحابية فورية وحفظ مسودات تلقائي محلي</span>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('publish')}
              className="px-3 py-2 text-xs font-bold text-[#4A5D4E] hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>الانتقال لناشر الفصول الكامل</span>
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveToBook}
            disabled={isSaving}
            className="px-6 py-2 rounded-xl bg-[#4A5D4E] hover:bg-[#3C4C3F] text-white font-bold shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isSaving ? 'جاري الحفظ...' : 'حفظ ونشر التعديلات'}
          </button>
        </div>
      </div>
    </div>
  );
};
