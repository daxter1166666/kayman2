import React, { useState, useMemo, useRef } from 'react';
import { IntellectualItem, MarginNote, ParallelSegment } from '../types';
import {
  Languages,
  Columns,
  Rows,
  Sparkles,
  Copy,
  Check,
  PenLine,
  Volume2,
  VolumeX,
  Eye,
  Info,
  ArrowRightLeft,
  Quote,
  Maximize2,
  ExternalLink,
} from 'lucide-react';

interface BilingualReaderViewProps {
  article: IntellectualItem;
  fontSize: number;
  theme: 'paper' | 'sepia' | 'sage';
  marginNotes: MarginNote[];
  onOpenAddMarginModal: (paragraphIndex: number, text: string) => void;
  onOpenMarginPopover: (paragraphIndex: number, text: string, notes: MarginNote[]) => void;
}

export const BilingualReaderView: React.FC<BilingualReaderViewProps> = ({
  article,
  fontSize,
  theme,
  marginNotes,
  onOpenAddMarginModal,
  onOpenMarginPopover,
}) => {
  const [layoutMode, setLayoutMode] = useState<'split' | 'interleaved'>('split');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoveredOrigin, setHoveredOrigin] = useState<'original' | 'translated' | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);

  // Compute aligned segments: Prefer article.parallelSegments, or auto-align paragraphs from originalContent & content
  const segments: ParallelSegment[] = useMemo(() => {
    if (article.parallelSegments && article.parallelSegments.length > 0) {
      return article.parallelSegments;
    }

    const origParas = (article.originalContent || '')
      .split('\n\n')
      .map(p => p.trim())
      .filter(p => p.length > 0 && !p.startsWith('#'));

    const transParas = (article.content || '')
      .split('\n\n')
      .map(p => p.trim())
      .filter(p => p.length > 0 && !p.startsWith('#') && !p.startsWith('---'));

    const maxLen = Math.max(origParas.length, transParas.length);
    const result: ParallelSegment[] = [];

    for (let i = 0; i < maxLen; i++) {
      result.push({
        id: `auto-seg-${i}`,
        originalText: origParas[i] || '—',
        translatedText: transParas[i] || '—',
      });
    }

    return result;
  }, [article]);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string, lang: string, index: number) => {
    if (!('speechSynthesis' in window)) return;
    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang.includes('فرنسية') || lang.includes('Français') ? 'fr-FR' : 'en-US';
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);
    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  // Get notes for a segment
  const getNotesForSegment = (index: number) => {
    return marginNotes.filter(n => n.paragraphIndex === index);
  };

  return (
    <div className="bilingual-reader-container font-cairo space-y-6">
      {/* Top Banner & Control Strip for Bilingual Reading */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#4A5D4E]/10 via-[#F7F5F0] to-[#6B5268]/10 border border-[#4A5D4E]/20 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4A5D4E] text-white flex items-center justify-center shadow-xs">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-stone-900">
                وضع القراءة المزدوجة التزامنية (Bilingual Parallel Reading)
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-[#4A5D4E]/15 text-[#4A5D4E] text-xs font-bold font-mono">
                {segments.length} فقرة متقابلة
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-0.5">
              مرر مؤشر الفأرة على أي نص باللغة الأصلية لرؤية شريط الترجمة الفوري المقابل له تلقائياً
            </p>
          </div>
        </div>

        {/* Layout Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-stone-600 hidden sm:inline">طريقة العرض:</span>
          <div className="flex items-center p-1 rounded-xl bg-white border border-stone-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setLayoutMode('split')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                layoutMode === 'split'
                  ? 'bg-[#4A5D4E] text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
              title="عرض متوازي جنب إلى جنب (عمودان)"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>عمودان متوازيان</span>
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('interleaved')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                layoutMode === 'interleaved'
                  ? 'bg-[#4A5D4E] text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
              title="عرض فقرة بفقرة متتابعة"
            >
              <Rows className="w-3.5 h-3.5" />
              <span>فقرة بفقرة متبادلة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Meta Bar: Details about original language & source */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-3.5 rounded-xl border border-[#E5E2D9]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-stone-700">اللغة الأصلية للمصدر:</span>
          <span className="px-2 py-0.5 rounded-md bg-stone-100 font-semibold text-stone-800">
            {article.originalLanguage || 'الإنجليزية (English)'}
          </span>
          {article.originalAuthor && (
            <span className="text-stone-500 font-serif">
              بقلم: {article.originalAuthor}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 sm:justify-end">
          <span className="font-bold text-stone-700">الترجمة والتحقيق:</span>
          <span className="px-2 py-0.5 rounded-md bg-[#4A5D4E]/10 font-semibold text-[#4A5D4E]">
            {article.translator || 'أيمن كناني'}
          </span>
          <span className="text-stone-500 font-sans">
            (العربية الفصحى المحققة)
          </span>
        </div>
      </div>

      {/* SEGMENTS LIST */}
      {layoutMode === 'split' ? (
        /* SPLIT TWO-COLUMN VIEW */
        <div className="space-y-6">
          {/* Header row for columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2 border-b-2 border-stone-200 font-bold text-xs">
            <div className="flex items-center justify-between text-stone-800 pr-2">
              <span className="flex items-center gap-1.5 text-sm font-amiri text-[#4A5D4E]">
                <span>النص العربي المترجم المحقق (RTL)</span>
              </span>
              <span className="text-[11px] text-stone-400 font-normal">
                انقر على الهامش لإضافة تعقيب
              </span>
            </div>
            <div className="flex items-center justify-between text-stone-800 pl-2 text-left" dir="ltr">
              <span className="flex items-center gap-1.5 text-sm font-serif text-[#6B5268]">
                <span>Original Source Text ({article.originalLanguage || 'Source'})</span>
              </span>
              <span className="text-[11px] text-stone-400 font-normal">
                Hover to reveal translation ribbon
              </span>
            </div>
          </div>

          {/* Segments mapping */}
          {segments.map((seg, idx) => {
            const isHovered = hoveredIndex === idx;
            const segNotes = getNotesForSegment(idx);

            return (
              <div
                key={seg.id || idx}
                id={`bilingual-pair-${idx}`}
                className="relative group transition-all duration-200"
              >
                {seg.sectionTitle && (
                  <div className="my-4 py-2 border-y border-stone-200 text-center font-amiri font-bold text-base text-[#4A5D4E] bg-stone-100/60 rounded-xl">
                    {seg.sectionTitle}
                  </div>
                )}

                <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch p-3 sm:p-4 rounded-2xl border transition-all duration-200 ${
                  isHovered
                    ? 'border-[#4A5D4E] bg-emerald-50/30 ring-2 ring-[#4A5D4E]/20 shadow-md'
                    : 'border-stone-200/80 bg-white hover:border-stone-300'
                }`}>
                  {/* ARABIC TRANSLATED COLUMN (RIGHT - RTL) */}
                  <div
                    onMouseEnter={() => {
                      setHoveredIndex(idx);
                      setHoveredOrigin('translated');
                    }}
                    onMouseLeave={() => {
                      setHoveredIndex(null);
                      setHoveredOrigin(null);
                    }}
                    className={`relative flex flex-col justify-between p-3.5 rounded-xl transition-colors ${
                      isHovered && hoveredOrigin === 'original'
                        ? 'bg-emerald-100/40 ring-1 ring-[#4A5D4E]/40'
                        : 'bg-[#FDFCF8]'
                    }`}
                  >
                    {/* Synchronized Ribbon if user is hovering over the original text */}
                    {isHovered && hoveredOrigin === 'original' && (
                      <div className="mb-3 p-2.5 rounded-xl bg-[#4A5D4E] text-white text-xs shadow-md animate-fadeIn flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Languages className="w-4 h-4 text-emerald-300 shrink-0" />
                          <span>شريط الترجمة المقابلة للنص الأصلي الممرر عليه:</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyText(seg.translatedText, `trans-${idx}`)}
                          className="px-2 py-0.5 rounded-md bg-white/20 hover:bg-white/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === `trans-${idx}` ? <Check className="w-3 h-3 text-emerald-200" /> : <Copy className="w-3 h-3" />}
                          <span>نسخ</span>
                        </button>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="w-5 h-5 rounded-md bg-stone-100 text-stone-600 text-[11px] font-mono font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          {segNotes.length > 0 && (
                            <button
                              type="button"
                              onClick={() => onOpenMarginPopover(idx, seg.translatedText, segNotes)}
                              className="px-2 py-0.5 rounded-full bg-[#4A5D4E]/15 text-[#4A5D4E] hover:bg-[#4A5D4E]/25 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <span>📌</span>
                              <span>هوامش ({segNotes.length})</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onOpenAddMarginModal(idx, seg.translatedText)}
                            className="p-1 rounded-md text-stone-400 hover:text-[#4A5D4E] hover:bg-[#4A5D4E]/10 transition-colors cursor-pointer"
                            title="إضافة هامش أو تعقيب على هذا النص"
                          >
                            <PenLine className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p
                        style={{ fontSize: `${fontSize}px`, lineHeight: '2' }}
                        className="font-amiri text-stone-900 text-justify leading-relaxed"
                      >
                        {seg.translatedText}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                      <span>الترجمة العربية</span>
                      <button
                        type="button"
                        onClick={() => handleCopyText(seg.translatedText, `seg-ar-${idx}`)}
                        className="hover:text-stone-700 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === `seg-ar-${idx}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>نسخ النص</span>
                      </button>
                    </div>
                  </div>

                  {/* ORIGINAL SOURCE COLUMN (LEFT - LTR) */}
                  <div
                    dir="ltr"
                    onMouseEnter={() => {
                      setHoveredIndex(idx);
                      setHoveredOrigin('original');
                    }}
                    onMouseLeave={() => {
                      setHoveredIndex(null);
                      setHoveredOrigin(null);
                    }}
                    className={`relative flex flex-col justify-between p-3.5 rounded-xl transition-colors ${
                      isHovered && hoveredOrigin === 'translated'
                        ? 'bg-purple-50 ring-1 ring-[#6B5268]/40'
                        : 'bg-stone-50/60'
                    }`}
                  >
                    {/* SYNCHRONIZED TRANSLATION RIBBON WHEN HOVERING ORIGINAL */}
                    {isHovered && hoveredOrigin === 'original' && (
                      <div
                        dir="rtl"
                        className="mb-3 p-3 rounded-xl bg-gradient-to-l from-[#4A5D4E] to-[#38493C] text-white text-xs shadow-lg animate-fadeIn border border-emerald-300/30"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold flex items-center gap-1.5 text-emerald-200">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>شريط الترجمة الفوري المقابل للنص الأصلي:</span>
                          </span>
                          <span className="text-[10px] opacity-75 font-mono">الفقرة #{idx + 1}</span>
                        </div>
                        <p className="font-amiri text-sm leading-relaxed text-emerald-50">
                          {seg.translatedText}
                        </p>
                      </div>
                    )}

                    {/* Synchronized Original Ribbon if user hovers translated text */}
                    {isHovered && hoveredOrigin === 'translated' && (
                      <div
                        dir="ltr"
                        className="mb-3 p-2.5 rounded-xl bg-[#6B5268] text-white text-xs shadow-md animate-fadeIn flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-1.5 font-bold">
                          <Languages className="w-4 h-4 text-purple-200 shrink-0" />
                          <span>Corresponding Original Text:</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyText(seg.originalText, `orig-${idx}`)}
                          className="px-2 py-0.5 rounded-md bg-white/20 hover:bg-white/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === `orig-${idx}` ? <Check className="w-3 h-3 text-emerald-200" /> : <Copy className="w-3 h-3" />}
                          <span>Copy</span>
                        </button>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="w-5 h-5 rounded-md bg-stone-200 text-stone-600 text-[11px] font-mono font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleSpeak(seg.originalText, article.originalLanguage || 'en', idx)}
                            className={`p-1 rounded-md transition-colors cursor-pointer ${
                              speakingIndex === idx
                                ? 'text-amber-600 bg-amber-100'
                                : 'text-stone-400 hover:text-stone-700 hover:bg-stone-200'
                            }`}
                            title="استماع للنطق الصوتي بالنص الأصلي"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p
                        style={{ fontSize: `${Math.max(14, fontSize - 2)}px`, lineHeight: '1.85' }}
                        className="font-serif text-stone-800 text-justify leading-relaxed"
                      >
                        {seg.originalText}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-stone-200/80 flex items-center justify-between text-xs text-stone-400">
                      <span>Original Text</span>
                      <button
                        type="button"
                        onClick={() => handleCopyText(seg.originalText, `seg-en-${idx}`)}
                        className="hover:text-stone-700 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === `seg-en-${idx}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* INTERLEAVED (STACKED) VIEW */
        <div className="space-y-6">
          {segments.map((seg, idx) => {
            const isHovered = hoveredIndex === idx;
            const segNotes = getNotesForSegment(idx);

            return (
              <div
                key={seg.id || idx}
                id={`interleaved-seg-${idx}`}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 space-y-3 ${
                  isHovered
                    ? 'border-[#4A5D4E] bg-white shadow-md ring-2 ring-[#4A5D4E]/20'
                    : 'border-stone-200 bg-white/70 hover:border-stone-300'
                }`}
              >
                {seg.sectionTitle && (
                  <div className="py-1.5 border-b border-stone-200 font-amiri font-bold text-base text-[#4A5D4E]">
                    {seg.sectionTitle}
                  </div>
                )}

                {/* ORIGINAL TEXT ROW (LTR) */}
                <div
                  dir="ltr"
                  className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 relative"
                >
                  <div className="flex items-center justify-between mb-1.5 text-xs text-stone-500">
                    <span className="font-semibold flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full bg-stone-200 text-stone-700 text-[10px] font-mono flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span>Source Text ({article.originalLanguage || 'Original'})</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSpeak(seg.originalText, article.originalLanguage || 'en', idx)}
                        className="text-stone-400 hover:text-stone-700 cursor-pointer"
                        title="استماع صوتي"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyText(seg.originalText, `stacked-en-${idx}`)}
                        className="hover:text-stone-700 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === `stacked-en-${idx}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  <p
                    style={{ fontSize: `${Math.max(14, fontSize - 2)}px`, lineHeight: '1.8' }}
                    className="font-serif text-stone-800 text-justify"
                  >
                    {seg.originalText}
                  </p>
                </div>

                {/* TRANSLATED TEXT ROW (RTL) */}
                <div
                  dir="rtl"
                  className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-100 relative"
                >
                  <div className="flex items-center justify-between mb-1.5 text-xs text-stone-600">
                    <span className="font-bold text-[#4A5D4E] flex items-center gap-1.5">
                      <Languages className="w-3.5 h-3.5" />
                      <span>الترجمة العربية المحققة:</span>
                    </span>

                    <div className="flex items-center gap-2">
                      {segNotes.length > 0 && (
                        <button
                          type="button"
                          onClick={() => onOpenMarginPopover(idx, seg.translatedText, segNotes)}
                          className="px-2 py-0.5 rounded-full bg-[#4A5D4E]/15 text-[#4A5D4E] text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span>📌</span>
                          <span>هوامش ({segNotes.length})</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onOpenAddMarginModal(idx, seg.translatedText)}
                        className="text-xs text-[#4A5D4E] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <PenLine className="w-3 h-3" />
                        <span>إضافة هامش</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyText(seg.translatedText, `stacked-ar-${idx}`)}
                        className="hover:text-stone-700 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === `stacked-ar-${idx}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  <p
                    style={{ fontSize: `${fontSize}px`, lineHeight: '2' }}
                    className="font-amiri text-stone-900 text-justify"
                  >
                    {seg.translatedText}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
