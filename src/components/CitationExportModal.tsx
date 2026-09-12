import React, { useState } from 'react';
import {
  Quote,
  Copy,
  Check,
  Download,
  X,
  BookOpen,
  FileText,
  ExternalLink,
  Sparkles,
  Share2,
  CheckCircle2
} from 'lucide-react';
import { IntellectualItem, Novel, Chapter, AuthorProfile } from '../types';

interface CitationExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    type: 'article' | 'study' | 'translated_article' | 'novel' | 'chapter';
    title: string;
    author: string;
    publishedDate?: string;
    url?: string;
    doi?: string;
    originalAuthor?: string;
    translator?: string;
    category?: string;
    novelTitle?: string;
    chapterNumber?: number;
  };
  authorProfile?: AuthorProfile;
}

export const CitationExportModal: React.FC<CitationExportModalProps> = ({
  isOpen,
  onClose,
  item,
  authorProfile,
}) => {
  const [activeFormat, setActiveFormat] = useState<'APA' | 'MLA' | 'Chicago' | 'Harvard' | 'BibTeX'>('APA');
  const [copied, setCopied] = useState<boolean>(false);
  const [downloaded, setDownloaded] = useState<'ris' | 'bib' | null>(null);

  if (!isOpen) return null;

  const currentYear = item.publishedDate
    ? new Date(item.publishedDate).getFullYear()
    : new Date().getFullYear();
  const authorName = item.author || authorProfile?.name || 'أيمن كناني';
  const fullUrl = item.url || (typeof window !== 'undefined' ? window.location.href : 'https://aymankinani.com');
  const accessedDate = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

  // Generate Academic Citations in 5 formats
  const citations: Record<'APA' | 'MLA' | 'Chicago' | 'Harvard' | 'BibTeX', string> = {
    APA: `${authorName}. (${currentYear}). ${item.title}. المنصة الرسمية لنشر المؤلفات والكتب. ${fullUrl}`,
    MLA: `${authorName}. "${item.title}." المنصة الرسمية لنشر المؤلفات والكتب، ${currentYear}، ${fullUrl}. تاريخ الوصول: ${accessedDate}.`,
    Chicago: `${authorName}. "${item.title}." المنصة الرسمية لنشر المؤلفات والكتب. ${currentYear}. ${fullUrl}.`,
    Harvard: `${authorName}, ${currentYear}. ${item.title}. المنصة الرسمية لأيمن كناني. متاح عبر: <${fullUrl}> [تاريخ الوصول: ${accessedDate}].`,
    BibTeX: `@misc{kinani_${currentYear}_${item.title.replace(/[^\w\u0621-\u064A]/g, '').slice(0, 10)},
  author       = {${authorName}},
  title        = {{${item.title}}},
  year         = {${currentYear}},
  howpublished = {\\url{${fullUrl}}},
  note         = {المنصة الرسمية لنشر المؤلفات والكتب (أيمن كناني)}
}`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(citations[activeFormat]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Download RIS for Zotero / Mendeley / EndNote
  const downloadRis = () => {
    const risContent = `TY  - ELEC
TI  - ${item.title}
AU  - ${authorName}
PY  - ${currentYear}
DA  - ${item.publishedDate || new Date().toISOString().slice(0, 10)}
PB  - المنصة الرسمية لأيمن كناني
UR  - ${fullUrl}
${item.doi ? `DO  - ${item.doi}\n` : ''}${item.category ? `KW  - ${item.category}\n` : ''}ER  - `;

    const blob = new Blob([risContent], { type: 'application/x-research-info-systems;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${item.title.slice(0, 20).replace(/\s+/g, '_')}_citation.ris`;
    link.click();
    setDownloaded('ris');
    setTimeout(() => setDownloaded(null), 2500);
  };

  // Download BibTeX file
  const downloadBib = () => {
    const bibContent = citations.BibTeX;
    const blob = new Blob([bibContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${item.title.slice(0, 20).replace(/\s+/g, '_')}_citation.bib`;
    link.click();
    setDownloaded('bib');
    setTimeout(() => setDownloaded(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 font-cairo">
      <div
        className="relative w-full max-w-2xl bg-[#FFFFFF] border-2 border-[#E5E2D9] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Decorative header border */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#4A5D4E] via-[#C88A3B] to-[#4A5D4E]" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-full text-[#8E8A83] hover:text-[#2C2C2C] hover:bg-[#F7F5EE] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#4A5D4E]/10 text-[#4A5D4E] flex items-center justify-center shrink-0 shadow-inner">
            <Quote className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#4A5D4E] px-2.5 py-0.5 rounded-full bg-[#4A5D4E]/10">
                توثيق أكاديمي معتمد
              </span>
              <span className="text-xs text-[#8E8A83]">
                {item.category || 'دراسات وأبحاث'}
              </span>
            </div>
            <h3 className="font-amiri font-bold text-xl sm:text-2xl text-[#2C2C2C] mt-1 leading-snug">
              {item.title}
            </h3>
            <p className="text-xs text-[#6E6A64] mt-0.5">
              بقلم الباحث: <span className="font-bold text-[#2C2C2C]">{authorName}</span>
            </p>
          </div>
        </div>

        {/* Format Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-[#F7F5EE] rounded-2xl border border-[#E5E2D9] mb-4 overflow-x-auto">
          {(['APA', 'MLA', 'Chicago', 'Harvard', 'BibTeX'] as const).map(fmt => (
            <button
              key={fmt}
              type="button"
              onClick={() => setActiveFormat(fmt)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeFormat === fmt
                  ? 'bg-white text-[#4A5D4E] shadow-xs border border-[#E5E2D9]'
                  : 'text-[#6E6A64] hover:text-[#2C2C2C]'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>

        {/* Citation Display Box */}
        <div className="relative p-4 sm:p-5 rounded-2xl bg-[#FAF9F5] border border-[#E5E2D9] mb-5">
          <pre
            dir={activeFormat === 'BibTeX' ? 'ltr' : 'rtl'}
            className={`font-amiri text-sm sm:text-base text-[#2C2C2C] leading-relaxed whitespace-pre-wrap break-words ${
              activeFormat === 'BibTeX' ? 'font-mono text-xs text-stone-800' : ''
            }`}
          >
            {citations[activeFormat]}
          </pre>

          {/* Floating Copy Button */}
          <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#E5E2D9]/80">
            <span className="text-[11px] text-[#8E8A83]">
              صيغة {activeFormat} معتمدة في الجامعات ومراكز البحوث
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#4A5D4E] text-white hover:bg-[#3C4C3F] transition-all shadow-xs cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>تم نسخ التوثيق!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>نسخ التوثيق</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Zotero & Mendeley Direct Packages Export */}
        <div className="bg-white rounded-2xl border border-[#E5E2D9] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C88A3B]" />
              <h4 className="text-xs sm:text-sm font-bold text-[#2C2C2C]">
                تصدير المراجع إلى Zotero وMendeley
              </h4>
            </div>
            <span className="text-[11px] text-[#8E8A83]">حزم إدارة المراجع المباشرة</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={downloadRis}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#E5E2D9] bg-[#FDFCF8] hover:bg-[#F7F5EE] text-[#2C2C2C] text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              <Download className="w-4 h-4 text-[#4A5D4E]" />
              <span>{downloaded === 'ris' ? 'جاري التحميل...' : 'تحميل حزمة RIS (Zotero/Mendeley)'}</span>
            </button>

            <button
              type="button"
              onClick={downloadBib}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#E5E2D9] bg-[#FDFCF8] hover:bg-[#F7F5EE] text-[#2C2C2C] text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              <Download className="w-4 h-4 text-[#C88A3B]" />
              <span>{downloaded === 'bib' ? 'جاري التحميل...' : 'تحميل ملف BibTeX (.bib)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
