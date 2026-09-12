import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  X,
  Trash2,
  Copy,
  Check,
  Download,
  ExternalLink,
  BookOpen,
  FileText,
  Search,
  Filter,
  Palette,
  Sparkles
} from 'lucide-react';
import { UserHighlight } from '../types';
import { storageService } from '../services/storageService';

interface UserHighlightsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToItem?: (type: 'novel' | 'chapter' | 'article', id: string, extraId?: string) => void;
}

export const UserHighlightsDrawer: React.FC<UserHighlightsDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateToItem,
}) => {
  const [highlights, setHighlights] = useState<UserHighlight[]>([]);
  const [filterColor, setFilterColor] = useState<'all' | 'gold' | 'emerald' | 'cyan' | 'rose'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setHighlights(storageService.getUserHighlights());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = (id: string) => {
    storageService.deleteUserHighlight(id);
    setHighlights(prev => prev.filter(h => h.id !== id));
  };

  const handleClearAll = () => {
    if (window.confirm('هل أنت متأكد من مسح جميع التظليلات وهوامش القراءة؟')) {
      storageService.clearUserHighlights();
      setHighlights([]);
    }
  };

  const handleCopyQuote = (h: UserHighlight) => {
    const textToCopy = `"${h.text}"\n\n— مقتبس من: ${h.targetTitle} (مؤلفات الكاتب أيمن كناني)\n${h.note ? `ملاحظة الباحث: ${h.note}` : ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(h.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportMarkdown = () => {
    if (highlights.length === 0) return;
    let md = `# دفتر تظليلات وهوامش الباحث\n`;
    md += `المصدر: المنصة الرسمية لنشر المؤلفات والكتب (أيمن كناني)\n`;
    md += `تاريخ التصدير: ${new Date().toLocaleDateString('ar-EG')}\n\n`;

    highlights.forEach((h, idx) => {
      md += `### ${idx + 1}. ${h.targetTitle}\n`;
      md += `> "${h.text}"\n\n`;
      if (h.note) {
        md += `* **ملاحظة:** ${h.note}\n`;
      }
      md += `* **التاريخ:** ${new Date(h.createdAt).toLocaleDateString('ar-EG')}\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ayman_kinani_research_highlights_${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
  };

  // Filtered highlights
  const filtered = highlights.filter(h => {
    const matchesColor = filterColor === 'all' || h.color === filterColor;
    const matchesQuery =
      !searchQuery.trim() ||
      h.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.targetTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.note && h.note.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesColor && matchesQuery;
  });

  const colorStyles: Record<'gold' | 'emerald' | 'cyan' | 'rose', { bg: string; border: string; badge: string; text: string }> = {
    gold: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-900', text: 'text-amber-800' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-900', text: 'text-emerald-800' },
    cyan: { bg: 'bg-sky-50', border: 'border-sky-200', badge: 'bg-sky-100 text-sky-900', text: 'text-sky-800' },
    rose: { bg: 'bg-rose-50', border: 'border-rose-200', badge: 'bg-rose-100 text-rose-900', text: 'text-rose-800' },
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200 font-cairo">
      <div
        className="w-full max-w-md sm:max-w-lg bg-white h-full shadow-2xl flex flex-col border-r border-[#E5E2D9] animate-in slide-in-from-left duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#E5E2D9] bg-[#FAF9F5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4A5D4E]/10 text-[#4A5D4E] flex items-center justify-center">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-amiri font-bold text-lg text-[#2C2C2C]">
                دفتر التظليلات وهوامش الباحث
              </h3>
              <p className="text-xs text-[#8E8A83]">
                {highlights.length} اقتباس محفوظ محلياً
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#8E8A83] hover:text-[#2C2C2C] rounded-lg hover:bg-[#F7F5EE] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search, Color Filters, Export */}
        <div className="p-4 border-b border-[#E5E2D9] space-y-3 bg-[#FDFCF8]">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8A83]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ابحث في الاقتباسات والملاحظات..."
              className="w-full pr-9 pl-3 py-2 text-xs rounded-xl bg-white border border-[#E5E2D9] text-[#2C2C2C] placeholder-[#8E8A83] outline-none"
            />
          </div>

          {/* Color filter chips */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {(['all', 'gold', 'emerald', 'cyan', 'rose'] as const).map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFilterColor(color)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterColor === color
                      ? 'bg-[#4A5D4E] text-white shadow-2xs'
                      : 'bg-white border border-[#E5E2D9] text-[#6E6A64] hover:bg-[#F7F5EE]'
                  }`}
                >
                  {color === 'all' && 'الكل'}
                  {color === 'gold' && 'ذهبي'}
                  {color === 'emerald' && 'زمردي'}
                  {color === 'cyan' && 'نيلي'}
                  {color === 'rose' && 'وردي'}
                </button>
              ))}
            </div>

            {/* Export Markdown */}
            {highlights.length > 0 && (
              <button
                type="button"
                onClick={handleExportMarkdown}
                title="تصدير كملف Markdown"
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg border border-[#E5E2D9] bg-white hover:bg-[#F7F5EE] text-[#4A5D4E] shrink-0 cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تصدير MD</span>
              </button>
            )}
          </div>
        </div>

        {/* Highlights List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {filtered.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Bookmark className="w-10 h-10 text-[#8E8A83] mx-auto mb-2 opacity-40" />
              <p className="text-sm font-bold text-[#2C2C2C]">لا توجد تظليلات محفوظة</p>
              <p className="text-xs text-[#8E8A83] mt-1 max-w-xs mx-auto">
                أثناء قراءة أي مقال أو فصل روائي، ظلل أي نص يثير اهتمامك واختر لون التظليل لحفظه هنا مع ملاحظاتك البحثية!
              </p>
            </div>
          ) : (
            filtered.map(h => {
              const style = colorStyles[h.color] || colorStyles.gold;
              return (
                <div
                  key={h.id}
                  className={`p-4 rounded-2xl border ${style.border} ${style.bg} transition-all relative group`}
                >
                  {/* Target Title & Date */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-[#2C2C2C] truncate">
                      {h.targetTitle}
                    </span>
                    <span className="text-[10px] text-[#8E8A83] shrink-0">
                      {new Date(h.createdAt).toLocaleDateString('ar-EG')}
                    </span>
                  </div>

                  {/* Highlighted Quote Text */}
                  <blockquote className="font-amiri text-sm sm:text-base text-[#2C2C2C] leading-relaxed mb-2 border-r-2 border-[#4A5D4E] pr-2.5">
                    "{h.text}"
                  </blockquote>

                  {/* Note if exists */}
                  {h.note && (
                    <div className="mt-2 p-2 bg-white/80 rounded-xl border border-[#E5E2D9] text-xs text-[#4A5D4E]">
                      <span className="font-bold">ملاحظة الباحث:</span> {h.note}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-black/5">
                    <button
                      type="button"
                      onClick={() => handleCopyQuote(h)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#4A5D4E] hover:text-[#3C4C3F] cursor-pointer"
                    >
                      {copiedId === h.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>تم النسخ!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>نسخ مع العزو</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(h.id)}
                      className="p-1 text-[#8E8A83] hover:text-red-600 transition-colors cursor-pointer"
                      title="حذف هذا الاقتباس"
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
        {highlights.length > 0 && (
          <div className="p-3 border-t border-[#E5E2D9] bg-[#FAF9F5] flex items-center justify-between text-xs">
            <span className="text-[#8E8A83]">
              المجموع: <strong>{highlights.length}</strong> اقتباس
            </span>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-red-600 hover:text-red-700 font-bold cursor-pointer"
            >
              مسح الكل
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
