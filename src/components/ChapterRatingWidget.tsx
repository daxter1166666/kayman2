import React, { useState, useEffect } from 'react';
import { Star, Sparkles, CheckCircle2, Award, Heart, MessageSquare } from 'lucide-react';
import { storageService } from '../services/storageService';

interface ChapterRatingWidgetProps {
  chapterId: string;
  chapterNumber: number;
  chapterTitle: string;
  novelId: string;
  currentRating?: number;
  ratingCount?: number;
  onRatingUpdated?: (newRating: number, newCount: number) => void;
  themeMode?: 'paper' | 'sepia' | 'slate' | 'obsidian' | 'emerald';
}

const RATING_DESCRIPTIONS: Record<number, { label: string; hint: string }> = {
  1: { label: 'نجمة واحدة', hint: 'يحتاج الفصل لمراجعة في الصياغة أو الإيقاع' },
  2: { label: 'نجمتان', hint: 'فصل مقبول وفيه أفكار سردية واعدة' },
  3: { label: '3 نجوم', hint: 'فصل جيد وممتع مع تسلسل أحداث متوازن' },
  4: { label: '4 نجوم', hint: 'فصل رائع ومشوق ويحمل حبكة مؤثرة جداً' },
  5: { label: '5 نجوم ⭐', hint: 'تحفة استثنائية، صياغة أدبية باهرة وعقدة متقنة' },
};

export const ChapterRatingWidget: React.FC<ChapterRatingWidgetProps> = ({
  chapterId,
  chapterNumber,
  chapterTitle,
  novelId,
  currentRating = 5.0,
  ratingCount = 0,
  onRatingUpdated,
  themeMode = 'paper',
}) => {
  const [hoverScore, setHoverScore] = useState<number | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [rating, setRating] = useState<number>(currentRating || 5.0);
  const [count, setCount] = useState<number>(ratingCount || 0);
  const [justSubmitted, setJustSubmitted] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Sync with storage on mount and when chapter changes
  useEffect(() => {
    const existingUserVote = storageService.getUserRatingForChapter(chapterId);
    setUserRating(existingUserVote);

    const storedChapter = storageService.getChapterById(chapterId);
    if (storedChapter) {
      setRating(typeof storedChapter.rating === 'number' ? storedChapter.rating : 5.0);
      setCount(typeof storedChapter.ratingCount === 'number' ? storedChapter.ratingCount : 0);
    } else {
      setRating(currentRating || 5.0);
      setCount(ratingCount || 0);
    }
    setJustSubmitted(false);
  }, [chapterId, currentRating, ratingCount]);

  const handleRate = (score: number) => {
    setSubmitting(true);
    try {
      const result = storageService.rateChapter(chapterId, score);
      setRating(result.rating);
      setCount(result.ratingCount);
      setUserRating(result.userRating);
      setJustSubmitted(true);

      if (onRatingUpdated) {
        onRatingUpdated(result.rating, result.ratingCount);
      }

      // Hide temporary success banner after 6 seconds
      setTimeout(() => {
        setJustSubmitted(false);
      }, 6000);
    } catch (err) {
      console.error('Error submitting chapter rating:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const isDark = themeMode === 'slate' || themeMode === 'obsidian' || themeMode === 'emerald';
  const activeHoverOrUser = hoverScore !== null ? hoverScore : (userRating !== null ? userRating : 0);
  const activeDesc = activeHoverOrUser > 0 ? RATING_DESCRIPTIONS[activeHoverOrUser] : null;

  return (
    <div
      id={`chapter-rating-card-${chapterId}`}
      className={`rounded-2xl border p-5 sm:p-7 transition-all ${
        isDark
          ? 'bg-[#181C24]/80 border-[#2E3440] text-[#E5E9F0]'
          : 'bg-[#FFFFFF] border-[#E5E2D9] text-[#2C2C2C] shadow-xs'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left/Header Column: Title & Explanation */}
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#C88A3B]/10 text-[#C88A3B] border border-[#C88A3B]/20">
              <Award className="w-3.5 h-3.5" />
              <span>تقييم القراء للفصل</span>
            </span>
            <span className={`text-xs ${isDark ? 'text-[#8892B0]' : 'text-[#8E8A83]'}`}>
              الفصل {chapterNumber}
            </span>
          </div>

          <h3 className="font-amiri font-bold text-xl sm:text-2xl leading-snug">
            ما رأيك وتقييمك للفصل «{chapterTitle}»؟
          </h3>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#A0AEC0]' : 'text-[#6E6A64]'}`}>
            رأيك الصادق بمثابة بوصلة للكاتب أيمن كناني لتطوير الأحداث والسرد، ويساعد زوار الموقع في استكشاف جودة الفصول.
          </p>
        </div>

        {/* Right Column: Score Summary */}
        <div
          className={`flex items-center gap-4 px-4 py-3 rounded-xl border shrink-0 ${
            isDark
              ? 'bg-[#202530] border-[#2E3440]'
              : 'bg-[#F7F5EE] border-[#E5E2D9]'
          }`}
        >
          <div className="text-center">
            <div className="font-mono font-bold text-3xl text-[#C88A3B] flex items-center justify-center gap-1">
              <span>{rating.toFixed(1)}</span>
              <span className="text-sm font-normal text-[#C88A3B]/70">/ 5</span>
            </div>
            <div className={`text-[10px] font-medium mt-0.5 ${isDark ? 'text-[#8892B0]' : 'text-[#8E8A83]'}`}>
              {count === 0 ? 'في انتظار أول تقييم' : `${count} ${count === 1 ? 'تقييم' : 'تقييمات'}`}
            </div>
          </div>

          <div className="h-10 w-[1px] bg-[#E5E2D9] dark:bg-[#2E3440] opacity-60" />

          <div className="text-right text-xs space-y-1">
            <div className="flex items-center gap-1 text-[#C88A3B]">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${
                    star <= Math.round(rating)
                      ? 'fill-[#C88A3B] text-[#C88A3B]'
                      : isDark
                      ? 'text-[#4A5568]'
                      : 'text-[#D0CCC2]'
                  }`}
                />
              ))}
            </div>
            <div className={`text-[11px] ${isDark ? 'text-[#A0AEC0]' : 'text-[#6E6A64]'}`}>
              {count > 0 ? 'معدل رضا القراء ممتاز' : 'كن أول من يقيّم'}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Stars Section */}
      <div className="mt-6 pt-5 border-t border-[#E5E2D9]/70 dark:border-[#2E3440] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2" onMouseLeave={() => setHoverScore(null)}>
            {[1, 2, 3, 4, 5].map((score) => {
              const isFilled =
                hoverScore !== null
                  ? score <= hoverScore
                  : userRating !== null
                  ? score <= userRating
                  : false;

              return (
                <button
                  key={score}
                  type="button"
                  id={`rate-chapter-star-${score}`}
                  disabled={submitting}
                  onMouseEnter={() => setHoverScore(score)}
                  onClick={() => handleRate(score)}
                  aria-label={`تقييم الفصل ${score} من 5`}
                  className={`p-2 rounded-xl transition-all transform hover:scale-115 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#C88A3B]/50 cursor-pointer ${
                    isFilled
                      ? 'bg-[#C88A3B]/15 text-[#C88A3B]'
                      : isDark
                      ? 'bg-[#202530] text-[#4A5568] hover:text-[#C88A3B] hover:bg-[#C88A3B]/10'
                      : 'bg-[#F7F5EE] text-[#D0CCC2] hover:text-[#C88A3B] hover:bg-[#C88A3B]/10'
                  }`}
                >
                  <Star
                    className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors ${
                      isFilled ? 'fill-[#C88A3B]' : ''
                    }`}
                  />
                </button>
              );
            })}

            {userRating !== null && (
              <span className={`text-xs font-medium mr-2 ${isDark ? 'text-[#8892B0]' : 'text-[#8E8A83]'}`}>
                تقييمك: <strong className="text-[#C88A3B]">{userRating} / 5</strong>
              </span>
            )}
          </div>

          {/* Dynamic description of the hovered/selected star */}
          <div className="min-h-[22px] flex items-center gap-1.5 text-xs">
            {activeDesc ? (
              <>
                <span className="font-bold text-[#C88A3B]">{activeDesc.label}:</span>
                <span className={isDark ? 'text-[#CBD5E0]' : 'text-[#6E6A64]'}>
                  {activeDesc.hint}
                </span>
              </>
            ) : (
              <span className={`italic ${isDark ? 'text-[#718096]' : 'text-[#8E8A83]'}`}>
                مرر الفأرة فوق النجوم ثم انقر لتسجيل تقييمك لهذا الفصل
              </span>
            )}
          </div>
        </div>

        {/* User Vote Status or Direct Action */}
        <div className="shrink-0 flex items-center gap-2">
          {justSubmitted ? (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold animate-in fade-in zoom-in-95">
              <CheckCircle2 className="w-4 h-4" />
              <span>تم حفظ تقييمك بنجاح! شكراً لك</span>
            </div>
          ) : userRating !== null ? (
            <div className={`text-xs px-3 py-1.5 rounded-lg border ${
              isDark ? 'bg-[#202530] border-[#2E3440] text-[#A0AEC0]' : 'bg-[#F7F5EE] border-[#E5E2D9] text-[#6E6A64]'
            }`}>
              يمكنك تغيير تقييمك بالنقر على أي نجمة أعلاه
            </div>
          ) : (
            <div className="text-[11px] text-[#C88A3B] font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>تقييم فوري دون الحاجة لتسجيل دخول</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
