import React, { useState, useEffect } from 'react';
import { Novel, Chapter, ChapterStatus } from '../../types';
import { storageService } from '../../services/storageService';
import { supabaseService } from '../../services/supabaseService';
import { ConfirmModal } from '../ConfirmModal';
import { cleanChapterContent, hasHtmlOrStyleResidue, extractCleanParagraphs, sanitizeRichHtml } from '../../utils/textCleaner';
import { RichTextEditor } from '../RichTextEditor';
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
  Search
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
  const [chapterToDelete, setChapterToDelete] = useState<Chapter | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

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
  const [fontFamily, setFontFamily] = useState<string>('cairo');
  const [showLivePreview, setShowLivePreview] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Filtered chapters for current novel
  const currentNovelChapters = chapters
    .filter(c => c.novelId === selectedNovelId)
    .sort((a, b) => a.chapterNumber - b.chapterNumber);

  // Next calculated chapter number
  const nextChapterNumber = currentNovelChapters.length > 0
    ? Math.max(...currentNovelChapters.map(c => c.chapterNumber)) + 1
    : 1;

  // Live metrics
  const wordCount = content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const paragraphCount = content.split('\n\n').filter(p => p.trim()).length;

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
    setFontFamily('cairo');
  };

  const handleEditChapter = (ch: Chapter) => {
    setEditingChapterId(ch.id);
    setSelectedNovelId(ch.novelId);
    setTitle(ch.title);
    setContent(ch.content || '');
    setAuthorNote(ch.authorNote || '');
    setStatus(ch.status);
    if (ch.fontFamily) {
      setFontFamily(ch.fontFamily);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmDeleteChapter = async () => {
    if (!chapterToDelete) return;
    const target = chapterToDelete;
    setIsDeleting(true);

    try {
      storageService.deleteChapter(target.id);
      window.dispatchEvent(new Event('storage'));
      if (editingChapterId === target.id) {
        handleStartNew();
      }
      onRefreshData();
      showToast(`جاري حذف الفصل "${target.title}" من واجهة القراء وسوباباس...`);

      const cloudSuccess = await supabaseService.deleteChapterFromSupabase(target.id);
      window.dispatchEvent(new Event('storage'));
      if (cloudSuccess) {
        showToast(`تم حذف الفصل "${target.title}" نهائياً من المتصفح وقاعدة البيانات السحابية!`);
      } else {
        showToast(`تم حذف الفصل "${target.title}" محلياً.`);
      }
    } catch (err) {
      console.warn('Error deleting chapter:', err);
      showToast(`تم حذف الفصل محلياً.`);
    } finally {
      setIsDeleting(false);
      setChapterToDelete(null);
      window.dispatchEvent(new Event('storage'));
      onRefreshData();
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('يرجى كتابة عنوان الفصل');
      return;
    }
    if (!content.trim()) {
      showToast('يرجى كتابة نص ومحتوى الفصل');
      return;
    }
    if (!selectedNovelId) {
      showToast('يرجى اختيار الرواية أولاً');
      return;
    }

    // Sanitize rich HTML if present, or clean plain text
    const isHtml = /<[a-z][\s\S]*>/i.test(content);
    const sanitizedContent = isHtml ? sanitizeRichHtml(content.trim()) : content.trim();

    if (editingChapterId) {
      // Update existing
      storageService.updateChapter(editingChapterId, {
        title: title.trim(),
        content: sanitizedContent,
        authorNote: authorNote.trim() || undefined,
        status,
        fontFamily,
      });
      const updatedCh = storageService.getChapters().find(c => c.id === editingChapterId);
      if (updatedCh) {
        supabaseService.saveChapterToSupabase(updatedCh).then(res => {
          if (res) {
            showToast('تم تحديث بيانات الفصل ومزامنته سحابياً مع سوباباس!');
          } else {
            showToast('تم التحديث محلياً. تنبيه: لم يتم التحديث في سوباباس (تأكد من كود الصلاحيات).');
          }
        });
      } else {
        showToast('تم تحديث وحفظ تعديلات الفصل بنجاح!');
      }
    } else {
      // Create new
      const newlyAdded = storageService.addChapter({
        novelId: selectedNovelId,
        title: title.trim(),
        content: sanitizedContent,
        authorNote: authorNote.trim() || undefined,
        status,
        fontFamily,
      });
      if (newlyAdded) {
        supabaseService.saveChapterToSupabase(newlyAdded).then(res => {
          if (res) {
            showToast(`تم نشر الفصل ${nextChapterNumber} ومزامنته مع سوباباس!`);
          } else {
            showToast(`تم نشر الفصل ${nextChapterNumber} ومحفوظ بأمان محلياً وسيتزامن تلقائياً.`);
          }
        });
      } else {
        showToast(`تم نشر الفصل ${nextChapterNumber} بنجاح!`);
      }
      handleStartNew();
    }

    onRefreshData();
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

        {/* Novel Selector and Shortcuts */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('chapter_seo')}
              className="px-3 py-2 text-xs rounded-xl bg-[#8C5E45]/10 hover:bg-[#8C5E45]/20 text-[#8C5E45] font-bold border border-[#8C5E45]/30 flex items-center gap-1.5 cursor-pointer transition-colors"
              title="الانتقال إلى استوديو سيو الفصول"
            >
              <Search className="w-3.5 h-3.5" />
              <span>سيو الفصول</span>
            </button>
          )}
          <label className="text-xs font-bold text-[#6E6A64] shrink-0">النشر في كتاب:</label>
          <select
            id="publisher-select-novel"
            value={selectedNovelId}
            onChange={e => {
              setSelectedNovelId(e.target.value);
              if (editingChapterId) handleStartNew();
            }}
            className="w-full sm:w-56 px-3 py-2 text-xs rounded-xl bg-[#F7F5EE] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] font-bold cursor-pointer"
          >
            {novels.map(n => (
              <option key={n.id} value={n.id}>
                {n.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Composer Form - Fully Integrated Rich Editor with Text Box */}
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

          <div className="text-xs text-[#6E6A64] flex items-center gap-2 font-bold">
            <span className="w-2 h-2 rounded-full bg-[#4A5D4E]" />
            <span>المحرر مدمج ومفعل دائماً في صندوق الكتابة</span>
          </div>
        </div>

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

        {/* Integrated Rich Text Editor Textbox */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-bold text-[#2C2C2C] flex items-center gap-1.5">
              <span>نص ومحتوى الفصل *</span>
              <span className="text-[11px] font-normal text-[#6E6A64]">
                (المحرر وأدوات التنسيق مرتبطة مباشرة بعلبة النص أعلاها)
              </span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="clean-content-btn"
                onClick={() => {
                  const cleaned = cleanChapterContent(content);
                  setContent(cleaned);
                  showToast('تم تنظيف النص من كافة الرموز وأكواد التنسيق بنجاح!');
                }}
                className="text-xs text-[#8C5E45] hover:text-[#2C2C2C] flex items-center gap-1 font-bold px-2.5 py-1 rounded-lg bg-[#F7F5EE] border border-[#E5E2D9] cursor-pointer transition-colors"
                title="إزالة وسوم HTML وأكواد التنسيق الغريبة من النص"
              >
                <span>🧹 تنظيف الرموز</span>
              </button>
              <button
                type="button"
                id="insert-template-btn"
                onClick={handleInsertTemplate}
                className="text-xs text-[#4A5D4E] hover:underline cursor-pointer flex items-center gap-1 font-bold px-2 py-1 rounded-lg hover:bg-[#F7F5EE]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>إدراج نص تجريبي</span>
              </button>
            </div>
          </div>

          {hasHtmlOrStyleResidue(content) && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>تم رصد أكواد خارجية أو بقايا تنسيق منسوخة قد تحتاج لتنظيف.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const cleaned = cleanChapterContent(content);
                  setContent(cleaned);
                  showToast('تم تنظيف النص بنجاح!');
                }}
                className="px-2.5 py-1 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors"
              >
                تنظيف النص الآن
              </button>
            </div>
          )}

          {/* Direct Rich Text Editor Component - Attached seamlessly to the textbox */}
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="ابدأ بكتابة أحداث الفصل هنا... يمكنك استخدام شريط الأدوات المدمج مباشرة بالأعلى لتنسيق العناوين، والخطوط، والفقرات، والاقتباسات..."
            minHeight="420px"
            defaultFont={fontFamily as any}
            onFontChange={setFontFamily}
          />
        </div>

        {/* Optional Collapsible Live Reader Preview Accordion */}
        <div className="rounded-2xl border border-[#E5E2D9] bg-[#FDFCF8] overflow-hidden transition-all shadow-2xs">
          <button
            type="button"
            id="toggle-live-preview-btn"
            onClick={() => setShowLivePreview(!showLivePreview)}
            className="w-full px-5 py-3.5 flex items-center justify-between bg-[#F7F5EE] hover:bg-[#EBE8DF] text-[#2C2C2C] text-xs font-bold transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#4A5D4E]" />
              <span>معاينة القارئ الحية (اختياري - انقر للعرض دون مغادرة المحرر)</span>
            </div>
            <span className="text-xs text-[#4A5D4E] font-bold">
              {showLivePreview ? 'إخفاء المعاينة ▲' : 'فتح المعاينة المباشرة ▼'}
            </span>
          </button>

          {showLivePreview && (
            <div className="p-6 text-[#2C2C2C] font-amiri border-t border-[#E5E2D9]">
              <div className="text-center pb-6 mb-6 border-b border-[#E5E2D9]">
                <span className="text-xs text-[#4A5D4E] font-cairo font-bold">
                  {novels.find(n => n.id === selectedNovelId)?.title}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold mt-1 text-[#2C2C2C]">
                  {title || 'فصل بدون عنوان'}
                </h2>
                <div className="text-xs text-[#6E6A64] mt-1 font-cairo">
                  {wordCount} كلمة · {readingTime} دقائق قراءة
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
                      className="rich-reading-content leading-relaxed sm:leading-loose space-y-4"
                      dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(content) }}
                    />
                  ) : (
                    extractCleanParagraphs(content).map((p, i) => (
                      <p key={i}>{p}</p>
                    ))
                  )
                ) : (
                  <p className="text-[#6E6A64] italic text-center py-8 font-cairo">
                    اكتب نص ومحتوى الفصل في علبة النص أعلاه لتظهر لك المعاينة فوراً هنا.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

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
              className="px-6 py-2.5 bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8] font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              {editingChapterId ? <Save className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              <span>{editingChapterId ? 'حفظ تعديلات الفصل' : 'نشر الفصل الآن'}</span>
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
                    <td className="py-3 px-3 font-mono text-[#6E6A64]">
                      {ch.wordCount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-mono text-[#2C2C2C] font-bold">
                      {ch.views.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-mono text-rose-500 font-bold">
                      {ch.likes.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-left space-x-2 space-x-reverse">
                      {onNavigateTab && (
                        <button
                          type="button"
                          onClick={() => onNavigateTab('chapter_seo')}
                          className="px-2.5 py-1 bg-[#8C5E45]/10 hover:bg-[#8C5E45]/20 text-[#8C5E45] border border-[#8C5E45]/30 rounded-lg text-xs transition-colors cursor-pointer"
                          title="تعديل سيو هذا الفصل لمحركات البحث"
                        >
                          <Search className="w-3.5 h-3.5 inline" />
                        </button>
                      )}
                      <button
                        type="button"
                        id={`edit-btn-${ch.id}`}
                        onClick={() => handleEditChapter(ch)}
                        className="px-2.5 py-1 bg-[#F7F5EE] hover:bg-[#E5E2D9] text-[#2C2C2C] border border-[#E5E2D9] rounded-lg text-xs transition-colors cursor-pointer"
                        title="تعديل الفصل"
                      >
                        <Edit3 className="w-3.5 h-3.5 inline" />
                      </button>
                      <button
                        type="button"
                        id={`delete-btn-${ch.id}`}
                        onClick={() => setChapterToDelete(ch)}
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

      {/* Confirmation Modal for Chapter Deletion */}
      <ConfirmModal
        isOpen={Boolean(chapterToDelete)}
        title="حذف الفصل نهائياً"
        message={`هل أنت متأكد من رغبتك في حذف الفصل "${chapterToDelete?.title}" (فصل ${chapterToDelete?.chapterNumber}) ومراجعاته وتعليقاته نهائياً؟ سيتم حذفه من واجهة القراء وقاعدة البيانات السحابية فوراً.`}
        confirmText="نعم، حذف الفصل نهائياً"
        cancelText="تراجع"
        isDestructive={true}
        isLoading={isDeleting}
        itemDetails={
          chapterToDelete
            ? {
                title: chapterToDelete.title,
                subtitle: `الفصل رقم ${chapterToDelete.chapterNumber} • ${chapterToDelete.wordCount} كلمة`,
              }
            : undefined
        }
        onConfirm={handleConfirmDeleteChapter}
        onCancel={() => {
          if (!isDeleting) setChapterToDelete(null);
        }}
      />
    </div>
  );
};
