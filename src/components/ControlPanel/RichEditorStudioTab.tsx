import React, { useState, useEffect } from 'react';
import { Novel, Chapter, ChapterStatus } from '../../types';
import { storageService } from '../../services/storageService';
import { supabaseService } from '../../services/supabaseService';
import { RichTextEditor } from '../RichTextEditor/RichTextEditor';
import {
  Edit3,
  BookOpen,
  Send,
  Save,
  CheckCircle2,
  Sparkles,
  FilePlus,
  Undo2,
  Trash2,
  Eye,
  AlertCircle
} from 'lucide-react';

interface RichEditorStudioTabProps {
  novels: Novel[];
  chapters: Chapter[];
  onRefreshData: () => void;
  onNavigateTab?: (tab: string) => void;
}

const DRAFT_STORAGE_KEY = 'ayman_rich_editor_draft_v1';

export const RichEditorStudioTab: React.FC<RichEditorStudioTabProps> = ({
  novels,
  chapters,
  onRefreshData,
  onNavigateTab,
}) => {
  const [selectedNovelId, setSelectedNovelId] = useState<string>(novels[0]?.id || '');
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);

  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [authorNote, setAuthorNote] = useState<string>('');
  const [status, setStatus] = useState<ChapterStatus>('PUBLISHED');
  const [notification, setNotification] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Auto-select first novel
  useEffect(() => {
    if ((!selectedNovelId || !novels.some(n => n.id === selectedNovelId)) && novels.length > 0) {
      setSelectedNovelId(novels[0].id);
    }
  }, [novels, selectedNovelId]);

  // Load draft if starting fresh
  useEffect(() => {
    if (!editingChapterId) {
      try {
        const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (parsed.content && !content) {
            setContent(parsed.content);
            if (parsed.title) setTitle(parsed.title);
            if (parsed.novelId && novels.some(n => n.id === parsed.novelId)) {
              setSelectedNovelId(parsed.novelId);
            }
          }
        }
      } catch {
        // Ignore
      }
    }
  }, [editingChapterId]);

  // Auto-save draft periodically
  useEffect(() => {
    if (!editingChapterId && (content || title)) {
      const timer = setTimeout(() => {
        try {
          localStorage.setItem(
            DRAFT_STORAGE_KEY,
            JSON.stringify({
              title,
              content,
              novelId: selectedNovelId,
              savedAt: new Date().toISOString(),
            })
          );
        } catch {
          // Ignore
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [content, title, selectedNovelId, editingChapterId]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const currentNovelChapters = chapters
    .filter(c => c.novelId === selectedNovelId)
    .sort((a, b) => a.chapterNumber - b.chapterNumber);

  const nextChapterNumber = currentNovelChapters.length > 0
    ? Math.max(...currentNovelChapters.map(c => c.chapterNumber)) + 1
    : 1;

  const handleSelectChapterToEdit = (chapterId: string) => {
    if (!chapterId) {
      handleStartNew();
      return;
    }
    const ch = chapters.find(c => c.id === chapterId);
    if (!ch) return;
    setEditingChapterId(ch.id);
    setSelectedNovelId(ch.novelId);
    setTitle(ch.title);
    setContent(ch.content);
    setAuthorNote(ch.authorNote || '');
    setStatus(ch.status);
    showToast(`تم تحميل "${ch.title}" في محرر النصوص المتقدم بنجاح.`);
  };

  const handleStartNew = () => {
    setEditingChapterId(null);
    setTitle('');
    setContent('');
    setAuthorNote('');
    setStatus('PUBLISHED');
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Ignore
    }
    showToast('تم فتح ورقة عمل ومسودة جديدة في المحرر.');
  };

  const handleInsertTemplate = (type: 'drama' | 'philosophical' | 'dialogue' | 'poetry') => {
    let template = '';
    if (type === 'drama') {
      template = `<h3>الفصل: نداء السكون العاصف</h3>
<p>كانت الرياح تعوي بين أروقة القلعة القديمة كأنها تستحضر أرواحاً نامت في طيات الزمان. وقف ناظراً عبر النافذة الضيقة نحو الوادي المغطى بطبقة كثيفة من الضباب، وفي عينيه التمعت ذكرى لم تستطع السنوات الطويلة إخماد جمرها.</p>
<blockquote style="margin: 1.5em 0; padding: 1em 1.5em; border-right: 4px solid #4A5D4E; background-color: #F7F5EE; font-style: italic; color: #3C4C3F; border-radius: 8px;">« إن الحقيقة ليست ما تراه أعيننا المجردة، بل ما يستقر في وجداننا حين تسكت جميع الأصوات. »</blockquote>
<p>اقترب من طاولة خشب البلوط، ومد يده المرتجفة نحو المخطوطة الملفوفة بشريط حريري باهت...</p>
<div style="text-align: center; margin: 2em 0; color: #8C5E45; font-size: 1.3em; letter-spacing: 0.4em;" contenteditable="false">✦ ✦ ✦</div>
<p>— أتعلم ما الذي نخشاه حقاً؟ — همس بذلك وهو يلتفت نحو رفيقه الذي كان يراقب بصمت مطبق.</p>`;
    } else if (type === 'poetry') {
      template = `<h3>شواهد شعرية في التأمل والوجدان</h3>
<p>تأملتُ في مسارات الفكر الإنساني فوجدتُ أن أبلغ ما يعبر عن حرقة التساؤل وخلود المعنى هو الشعر العذب الصافي:</p>
<div class="poetry-verse" style="text-align: center; margin: 1.5em auto; padding: 1em; background: #FAF9F5; border: 1px dashed #D5D1C6; border-radius: 12px; font-weight: bold; max-width: 520px; line-height: 2.2;">
  <div style="display: flex; justify-content: space-between; gap: 20px; font-size: 1.1em; color: #2C2C2C;">
    <span>تَمُرُّ اللَّيَالِي وَالمَعَانِي خَوَالِدُ</span>
    <span style="color: #4A5D4E; font-family: monospace;">***</span>
    <span>وَفِي كُلِّ سَطْرٍ لِلْمُعَنَّى شَوَاهِدُ</span>
  </div>
</div>
<p>وهكذا، تتلاقى الحروف مع نبضات القلوب لترسم لوحة باقية لا يعفو عليها التقادم.</p>`;
    } else {
      template = `<h3>مدخل حواري في طبيعة المعرفة</h3>
<p>جلس الكاتب وأمامه أوراق متناثرة يملؤها الشغف، فبادره صديقه بالتساؤل التالي:</p>
<p>— كيف تبدأ نسج أفكارك حين تتشابك السطور؟</p>
<p>— البداية دائماً شرارة إلهام، ثم يأتي العمل الصبور لصياغتها في قوالب لغوية تأسر الألباب.</p>`;
    }

    setContent(prev => (prev ? prev + '<br>' + template : template));
    showToast('تم إدراج النموذج الأدبي في المحرر.');
  };

  const handlePublish = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      showToast('يرجى كتابة عنوان الفصل أولاً.');
      return;
    }
    if (!content.trim()) {
      showToast('يرجى كتابة نص ومحتوى الفصل قبل النشر.');
      return;
    }
    if (!selectedNovelId) {
      showToast('يرجى تحديد الكتاب أو الرواية المستهدفة.');
      return;
    }

    setIsSaving(true);

    try {
      if (editingChapterId) {
        const updated = storageService.updateChapter(editingChapterId, {
          title: title.trim(),
          content: content.trim(),
          authorNote: authorNote.trim() || undefined,
          status,
        });
        if (updated) {
          await supabaseService.saveChapterToSupabase(updated);
        }
        showToast('تم حفظ وتحديث الفصل بنجاح ومزامنته سحابياً!');
      } else {
        const created = storageService.addChapter({
          novelId: selectedNovelId,
          title: title.trim(),
          content: content.trim(),
          authorNote: authorNote.trim() || undefined,
          status,
        });
        await supabaseService.saveChapterToSupabase(created);
        showToast(`تم نشر الفصل رقم (${created.chapterNumber}) بنجاح!`);
        // Clear draft on publish
        try {
          localStorage.removeItem(DRAFT_STORAGE_KEY);
        } catch {
          // Ignore
        }
      }

      onRefreshData();
    } catch (err) {
      console.error('Save chapter error:', err);
      showToast('حدث خطأ أثناء الحفظ، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {notification && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header & Book / Chapter Selector */}
      <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E2D9] pb-4">
          <div>
            <h2 className="font-amiri font-bold text-xl text-[#2C2C2C] flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-[#4A5D4E]" />
              <span>استوديو محرر النصوص وتنسيق الفصول</span>
            </h2>
            <p className="text-xs text-[#6E6A64]">
              محرر نصوص أدبي متكامل (WYSIWYG) لتنسيق العناوين، والاقتباسات، والأبيات الشعرية، وحوارات الرواية.
            </p>
          </div>

          {/* New Chapter / Reset Draft */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleStartNew}
              className="px-3.5 py-2 bg-[#FAF9F5] hover:bg-[#EBE8DF] border border-[#E5E2D9] text-[#2C2C2C] rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <FilePlus className="w-3.5 h-3.5 text-[#4A5D4E]" />
              <span>مسودة فصل جديدة</span>
            </button>
          </div>
        </div>

        {/* Selection Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Novel Target */}
          <div>
            <label className="text-xs font-bold text-[#2C2C2C] block mb-1.5">
              الكتاب أو الرواية المستهدفة *
            </label>
            <select
              value={selectedNovelId}
              onChange={e => {
                setSelectedNovelId(e.target.value);
                setEditingChapterId(null);
              }}
              className="w-full px-3 py-2.5 text-xs rounded-xl bg-[#FAF9F5] border border-[#E5E2D9] text-[#2C2C2C] font-bold focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] cursor-pointer"
            >
              {novels.map(n => (
                <option key={n.id} value={n.id}>
                  {n.title} ({chapters.filter(c => c.novelId === n.id).length} فصل)
                </option>
              ))}
            </select>
          </div>

          {/* Existing Chapter to Edit */}
          <div>
            <label className="text-xs font-bold text-[#2C2C2C] block mb-1.5">
              تحميل فصل سابق للتعديل بالمحرر (اختياري)
            </label>
            <select
              value={editingChapterId || ''}
              onChange={e => handleSelectChapterToEdit(e.target.value)}
              className="w-full px-3 py-2.5 text-xs rounded-xl bg-[#FAF9F5] border border-[#E5E2D9] text-[#2C2C2C] font-bold focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] cursor-pointer"
            >
              <option value="">-- إنشاء فصل جديد ({`فصل رقم ${nextChapterNumber}`}) --</option>
              {currentNovelChapters.map(ch => (
                <option key={ch.id} value={ch.id}>
                  فصل {ch.chapterNumber}: {ch.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Chapter Title, Status & Author Note */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-[#2C2C2C] block mb-1.5">
              عنوان الفصل *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="مثال: الفصل الأول: لغز السيف القرمزي في جبال الأطلس"
              className="w-full px-4 py-2.5 text-sm rounded-xl bg-[#FAF9F5] border border-[#E5E2D9] text-[#2C2C2C] font-amiri font-bold focus:outline-none focus:ring-1 focus:ring-[#4A5D4E]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#2C2C2C] block mb-1.5">
              حالة النشر
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as ChapterStatus)}
              className="w-full px-3 py-2.5 text-xs rounded-xl bg-[#FAF9F5] border border-[#E5E2D9] text-[#2C2C2C] font-bold focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] cursor-pointer"
            >
              <option value="PUBLISHED">منشور للقراء فوراً</option>
              <option value="DRAFT">مسودة غير منشورة</option>
              <option value="SCHEDULED">مجدول</option>
            </select>
          </div>
        </div>

        {/* Templates injector */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs font-bold text-[#6E6A64]">نماذج سريعة للإدراج:</span>
          <button
            type="button"
            onClick={() => handleInsertTemplate('drama')}
            className="px-2.5 py-1 rounded-lg bg-[#FAF9F5] hover:bg-[#EBE8DF] border border-[#E5E2D9] text-xs text-[#4A5D4E] font-bold cursor-pointer transition-colors"
          >
            مشهد سردي درامي
          </button>
          <button
            type="button"
            onClick={() => handleInsertTemplate('poetry')}
            className="px-2.5 py-1 rounded-lg bg-[#FAF9F5] hover:bg-[#EBE8DF] border border-[#E5E2D9] text-xs text-[#8C5E45] font-bold cursor-pointer transition-colors"
          >
            بيت شعر بشطرين
          </button>
          <button
            type="button"
            onClick={() => handleInsertTemplate('dialogue')}
            className="px-2.5 py-1 rounded-lg bg-[#FAF9F5] hover:bg-[#EBE8DF] border border-[#E5E2D9] text-xs text-[#2C2C2C] font-bold cursor-pointer transition-colors"
          >
            حوار روائي
          </button>
        </div>
      </div>

      {/* Main Rich Text Editor Component */}
      <RichTextEditor
        value={content}
        onChange={setContent}
        title={title || 'فصل جديد'}
        placeholder="ابدأ بكتابة نص الرواية أو الفصل هنا... يمكنك استخدام أدوات التنسيق العلوية لتنسيق الاقتباسات والأبيات الشعرية والعناوين..."
        minHeight="480px"
        onSave={handlePublish}
      />

      {/* Author Note and Publish Action Bar */}
      <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs space-y-4">
        <div>
          <label className="text-xs font-bold text-[#2C2C2C] block mb-1.5">
            ملاحظة الكاتب للقراء في نهاية الفصل (اختياري)
          </label>
          <input
            type="text"
            value={authorNote}
            onChange={e => setAuthorNote(e.target.value)}
            placeholder="مثال: ترقبوا في الفصل القادم الإجابة عن سر الباب المغلق! شاركوني آراءكم في التعليقات..."
            className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#FAF9F5] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E]"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-[#E5E2D9]">
          <div className="text-xs text-[#6E6A64]">
            {editingChapterId ? (
              <span className="text-amber-800 font-bold">
                أنت الآن تقوم بتعديل فصل حالي. الحفظ سيحدّث بيانات الفصل مباشرة.
              </span>
            ) : (
              <span>
                سيتم نشر هذا الفصل برقم <strong className="text-[#4A5D4E] font-mono">({nextChapterNumber})</strong> في الكتاب المحدد.
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {editingChapterId && (
              <button
                type="button"
                onClick={handleStartNew}
                className="px-4 py-2.5 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] hover:bg-[#FAF9F5] text-xs font-bold text-[#2C2C2C] cursor-pointer transition-colors"
              >
                إلغاء التعديل
              </button>
            )}

            <button
              type="button"
              disabled={isSaving}
              onClick={handlePublish}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#4A5D4E] hover:bg-[#3C4C3F] disabled:opacity-50 text-[#FDFCF8] font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSaving ? 'جارٍ الحفظ والمزامنة...' : editingChapterId ? 'حفظ وتحديث الفصل' : 'نشر الفصل الآن'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
