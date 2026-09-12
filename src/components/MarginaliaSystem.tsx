import React, { useState } from 'react';
import { MarginNote } from '../types';
import {
  PenLine,
  MessageSquare,
  Heart,
  Trash2,
  X,
  Check,
  Quote,
  Plus,
  Bookmark,
  Share2,
  User,
  Sparkles,
  CornerDownLeft,
} from 'lucide-react';

interface AddMarginNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { authorName: string; note: string; selectedText: string; noteType?: 'comment' | 'critique' | 'reference' | 'correction' }) => void;
  defaultText?: string;
  selectedText?: string;
  targetType?: 'novel' | 'chapter' | 'article' | string;
  targetId?: string;
  paragraphIndex?: number;
  itemTitle?: string;
}

export const AddMarginNoteModal: React.FC<AddMarginNoteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultText = '',
  selectedText: propSelectedText,
  targetType,
  targetId,
  paragraphIndex,
  itemTitle,
}) => {
  const initialText = propSelectedText !== undefined ? propSelectedText : defaultText;
  const [authorName, setAuthorName] = useState('');
  const [note, setNote] = useState('');
  const [selectedText, setSelectedText] = useState(initialText);
  const [noteType, setNoteType] = useState<'comment' | 'critique' | 'reference' | 'correction'>('comment');

  React.useEffect(() => {
    setSelectedText(propSelectedText !== undefined ? propSelectedText : defaultText);
  }, [defaultText, propSelectedText]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    onSave({
      authorName: authorName.trim() || 'قارئ وباحث',
      note: note.trim(),
      selectedText: selectedText.trim(),
      noteType,
    });
    setNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn font-cairo">
      <div className="bg-[#FDFCF8] text-[#2C2C2C] border border-[#E5E2D9] rounded-2xl shadow-2xl max-w-lg w-full p-5 sm:p-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute left-4 top-4 p-1.5 rounded-xl hover:bg-black/5 text-stone-500 hover:text-stone-800 transition-colors"
          title="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[#E5E2D9]">
          <div className="w-9 h-9 rounded-xl bg-[#4A5D4E]/10 text-[#4A5D4E] flex items-center justify-center shrink-0">
            <PenLine className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-stone-900">
              إضافة هامش أو ملاحظة قارئ
            </h3>
            {itemTitle && (
              <p className="text-xs text-stone-500 truncate max-w-xs sm:max-w-sm">
                على: {itemTitle} {paragraphIndex !== undefined && `(الفقرة ${paragraphIndex + 1})`}
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quoted text display */}
          {selectedText && (
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                <Quote className="w-3.5 h-3.5 text-[#4A5D4E]" />
                <span>النص المقتبس الموجه إليه الهامش:</span>
              </label>
              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs font-amiri leading-relaxed text-stone-800 max-h-24 overflow-y-auto italic">
                "{selectedText}"
              </div>
            </div>
          )}

          {/* Author Name */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              <span>اسم القارئ / الباحث (اختياري):</span>
            </label>
            <input
              type="text"
              value={authorName}
              onChange={e => setAuthorName(e.target.value)}
              placeholder="مثال: د. باحث فلسفي، قارئ متأمل..."
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 bg-white text-stone-900 focus:ring-2 focus:ring-[#4A5D4E]/30 focus:border-[#4A5D4E] outline-hidden"
            />
          </div>

          {/* Note Type Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">نوع الهامش:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setNoteType('comment')}
                className={`p-1.5 rounded-lg border text-center transition-all ${
                  noteType === 'comment'
                    ? 'bg-[#4A5D4E] text-white border-[#4A5D4E] font-bold'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                تعليق تحليلي
              </button>
              <button
                type="button"
                onClick={() => setNoteType('critique')}
                className={`p-1.5 rounded-lg border text-center transition-all ${
                  noteType === 'critique'
                    ? 'bg-[#8A6D3B] text-white border-[#8A6D3B] font-bold'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                نقد أو تعقيب
              </button>
              <button
                type="button"
                onClick={() => setNoteType('reference')}
                className={`p-1.5 rounded-lg border text-center transition-all ${
                  noteType === 'reference'
                    ? 'bg-[#5B4258] text-white border-[#5B4258] font-bold'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                إحالة مرجعية
              </button>
              <button
                type="button"
                onClick={() => setNoteType('correction')}
                className={`p-1.5 rounded-lg border text-center transition-all ${
                  noteType === 'correction'
                    ? 'bg-blue-700 text-white border-blue-700 font-bold'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                تصويب لغوي
              </button>
            </div>
          </div>

          {/* Note Body */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              نص الهامش أو الملاحظة: <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="اكتب تعقيبك، تحليلك، أو إحالتك المرجعية هنا ليستفيد منها سائر القراء والباحثين..."
              className="w-full p-3 text-xs sm:text-sm rounded-xl border border-stone-300 bg-white text-stone-900 focus:ring-2 focus:ring-[#4A5D4E]/30 focus:border-[#4A5D4E] outline-hidden leading-relaxed"
              required
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-[#E5E2D9]">
            <p className="text-[11px] text-stone-500">
              * سيظهر هذا الهامش للجميع عند النقر على زر الهامش عند هذا النص.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#4A5D4E] hover:bg-[#3D4E41] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>حفظ ونشر الهامش</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

interface MarginNotesPopoverProps {
  notes: MarginNote[];
  isOpen: boolean;
  onClose: () => void;
  onAddMore?: () => void;
  onAddAnotherNote?: () => void;
  onLikeNote: (noteId: string) => void;
  onDeleteNote: (noteId: string) => void;
  paragraphText?: string;
  quoteText?: string;
  paragraphIndex?: number;
}

export const MarginNotesPopover: React.FC<MarginNotesPopoverProps> = ({
  notes,
  isOpen,
  onClose,
  onAddMore,
  onAddAnotherNote,
  onLikeNote,
  onDeleteNote,
  paragraphText,
  quoteText,
  paragraphIndex,
}) => {
  if (!isOpen) return null;
  const handleAdd = onAddAnotherNote || onAddMore;
  const activeQuote = quoteText || paragraphText;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-fadeIn font-cairo">
      <div className="bg-[#FDFCF8] text-[#2C2C2C] border border-[#E5E2D9] rounded-2xl shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E5E2D9] flex items-center justify-between bg-white/70">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-[#4A5D4E]/15 text-[#4A5D4E] flex items-center justify-center font-bold text-sm">
              📌
            </span>
            <div>
              <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
                <span>هوامش وملاحظات القراء</span>
                <span className="px-2 py-0.5 rounded-full bg-[#4A5D4E]/10 text-[#4A5D4E] text-xs font-mono font-bold">
                  {notes.length}
                </span>
              </h3>
              {paragraphIndex !== undefined && (
                <p className="text-xs text-stone-500">
                  مدونة على الفقرة رقم {paragraphIndex + 1}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quoted paragraph snippet */}
        {paragraphText && (
          <div className="px-4 py-2.5 bg-amber-50/60 border-b border-amber-100 text-xs font-amiri text-stone-700 italic max-h-20 overflow-y-auto">
            "{paragraphText.length > 180 ? `${paragraphText.slice(0, 180)}...` : paragraphText}"
          </div>
        )}

        {/* Notes List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1">
          {notes.length === 0 ? (
            <div className="text-center py-8 text-stone-500">
              <MessageSquare className="w-8 h-8 mx-auto text-stone-300 mb-2" />
              <p className="text-sm font-semibold">لا توجد هوامش مدونة على هذه الفقرة بعد</p>
              <p className="text-xs text-stone-400 mt-1">كن أول من يضيف هامشاً أو تعقيباً تحليلياً على هذا النص!</p>
            </div>
          ) : (
            notes.map(note => {
              const noteTypeLabels = {
                comment: { label: 'تعليق تحليلي', color: 'bg-[#4A5D4E]/10 text-[#4A5D4E]' },
                critique: { label: 'نقد وتعقيب', color: 'bg-[#8A6D3B]/10 text-[#8A6D3B]' },
                reference: { label: 'إحالة مرجعية', color: 'bg-[#5B4258]/10 text-[#5B4258]' },
                correction: { label: 'تصويب لغوي', color: 'bg-blue-50 text-blue-700' },
              };
              const badge = note.noteType && noteTypeLabels[note.noteType]
                ? noteTypeLabels[note.noteType]
                : noteTypeLabels.comment;

              return (
                <div
                  key={note.id}
                  className="p-3.5 sm:p-4 rounded-xl border border-[#E5E2D9] bg-white hover:border-[#4A5D4E]/30 transition-all shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#4A5D4E]/10 text-[#4A5D4E] text-xs font-bold flex items-center justify-center">
                        {note.authorName?.charAt(0) || 'ق'}
                      </div>
                      <span className="font-bold text-xs sm:text-sm text-stone-900">
                        {note.authorName || 'قارئ مهتم'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>

                    <span className="text-[10px] text-stone-400 font-mono">
                      {note.createdAt ? new Date(note.createdAt).toLocaleDateString('ar-EG') : 'حديث'}
                    </span>
                  </div>

                  {note.selectedText && (
                    <div className="text-[11px] p-2 rounded-lg bg-stone-50 border-r-2 border-[#4A5D4E] text-stone-600 font-amiri italic">
                      "{note.selectedText}"
                    </div>
                  )}

                  <p className="text-xs sm:text-sm font-cairo text-stone-800 leading-relaxed text-justify">
                    {note.note}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-xs">
                    <button
                      type="button"
                      onClick={() => onLikeNote(note.id)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                        note.userLiked
                          ? 'text-rose-600 bg-rose-50 font-bold'
                          : 'text-stone-500 hover:text-rose-600 hover:bg-stone-50'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${note.userLiked ? 'fill-rose-600' : ''}`} />
                      <span className="font-mono text-xs">{note.likes || 0}</span>
                      <span className="text-[11px]">مفيد</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteNote(note.id)}
                      className="p-1 text-stone-300 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="حذف الهامش"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-[#E5E2D9] bg-white/70 flex items-center justify-between gap-3">
          <p className="text-xs text-stone-500 hidden sm:block">
            الهوامش تثري النص بالقراءات النقدية المتعددة
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
            >
              إغلاق
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (handleAdd) handleAdd();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#4A5D4E] hover:bg-[#3D4E41] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة هامش جديد على هذا النص</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
