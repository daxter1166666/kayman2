import React from 'react';
import { IntellectualItem } from '../types';
import { Network, ArrowLeft, BookOpen, Sparkles, Tag, GitCommit, Layers } from 'lucide-react';

interface ArticleKnowledgeMapProps {
  currentArticle: IntellectualItem;
  allArticles: IntellectualItem[];
  onSelectArticle?: (id: string) => void;
}

export const ArticleKnowledgeMap: React.FC<ArticleKnowledgeMapProps> = ({
  currentArticle,
  allArticles,
  onSelectArticle,
}) => {
  // Find connected articles based on category, tags, or cross-references
  const relatedArticles = React.useMemo(() => {
    return allArticles
      .filter(a => a.id !== currentArticle.id)
      .map(article => {
        let score = 0;
        const sharedTags = (article.tags || []).filter(t => (currentArticle.tags || []).includes(t));
        score += sharedTags.length * 2;
        if (article.category && currentArticle.category && article.category === currentArticle.category) {
          score += 3;
        }
        if (article.type === currentArticle.type) {
          score += 1;
        }
        return {
          article,
          score,
          sharedTags,
          relation: sharedTags.length > 0 ? `وسم مشترك: ${sharedTags[0]}` : article.category || 'حقل معرفي متصل'
        };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [currentArticle, allArticles]);

  if (relatedArticles.length === 0) return null;

  return (
    <section className="mt-14 p-5 sm:p-7 rounded-3xl border border-[#E5E2D9] bg-white/70 backdrop-blur-xs shadow-2xs font-cairo">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E2D9]">
        <div>
          <h3 className="font-amiri font-bold text-lg sm:text-xl text-[#2C2C2C] flex items-center gap-2">
            <Network className="w-5 h-5 text-[#4A5D4E]" />
            <span>خريطة المقالات والشبكة المعرفية المترابطة</span>
          </h3>
          <p className="text-xs text-[#70757a] mt-1">
            استكشف الروابط الفلسفية والمفاهيمية بين هذا البحث والمقالات الأخرى في الموسوعة
          </p>
        </div>

        <span className="text-[11px] font-bold text-[#4A5D4E] bg-[#4A5D4E]/10 px-3 py-1 rounded-full w-fit">
          {relatedArticles.length} محطات معرفية متصلة
        </span>
      </div>

      {/* Visual Radial / Connected Flow Layout */}
      <div className="py-6">
        {/* Central Root Node */}
        <div className="flex justify-center mb-6">
          <div className="max-w-md p-4 rounded-2xl bg-[#F4EEDD] border-2 border-[#C88A3B]/40 text-center shadow-xs">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C88A3B]/20 text-[#8C5D0B] mb-1.5 inline-block">
              المقال الحالي (المركز المعرفي)
            </span>
            <h4 className="font-amiri font-bold text-sm sm:text-base text-[#2C2C2C] leading-snug">
              {currentArticle.title}
            </h4>
            <div className="flex items-center justify-center gap-2 mt-2 text-[11px] text-[#6E6A64]">
              <span>{currentArticle.category || 'فكر عام'}</span>
              <span>•</span>
              <span>{(currentArticle.tags || []).slice(0, 2).join('، ')}</span>
            </div>
          </div>
        </div>

        {/* Connecting Lines Divider */}
        <div className="relative flex items-center justify-center my-3">
          <div className="w-full border-t border-dashed border-[#D5D0C5] absolute"></div>
          <span className="relative bg-white px-3 py-1 text-[11px] font-semibold text-[#8E8A83] rounded-full border border-[#E5E2D9] flex items-center gap-1">
            <GitCommit className="w-3.5 h-3.5 text-[#4A5D4E]" />
            <span>تفرعات المفاهيم والروابط الفكرية الممتدة</span>
          </span>
        </div>

        {/* Network Nodes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-5">
          {relatedArticles.map(({ article, relation, sharedTags }, idx) => (
            <div
              key={article.id || idx}
              onClick={() => onSelectArticle && onSelectArticle(article.id)}
              className="p-4 rounded-2xl border border-[#E5E2D9] bg-[#FAF8F5] hover:bg-white hover:border-[#4A5D4E] transition-all duration-200 cursor-pointer group flex flex-col justify-between shadow-2xs hover:shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#4A5D4E]/10 text-[#4A5D4E] group-hover:bg-[#4A5D4E] group-hover:text-white transition-colors">
                    {relation}
                  </span>
                  <span className="text-[10px] text-[#8E8A83]">
                    {article.type === 'study' ? 'دراسة' : 'مقال'}
                  </span>
                </div>

                <h5 className="font-amiri font-bold text-sm sm:text-base text-[#2C2C2C] group-hover:text-[#4A5D4E] transition-colors leading-snug line-clamp-2">
                  {article.title}
                </h5>

                {article.subtitle && (
                  <p className="text-xs text-[#70757a] mt-1 line-clamp-2 leading-relaxed">
                    {article.subtitle}
                  </p>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-[#EAE6DA] flex items-center justify-between text-xs">
                <span className="text-[11px] text-[#8E8A83] flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  <span>{sharedTags.length > 0 ? sharedTags.join('، ') : 'أفكار مشتركة'}</span>
                </span>

                <span className="font-bold text-[#4A5D4E] flex items-center gap-1 group-hover:-translate-x-1 transition-transform">
                  <span>قراءة المقال</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
