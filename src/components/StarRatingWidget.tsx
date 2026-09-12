import React, { useState } from 'react';
import { Star, CheckCircle2, Award } from 'lucide-react';
import { storageService } from '../services/storageService';

interface StarRatingWidgetProps {
  novelId: string;
  currentRating: number;
  ratingCount: number;
  onRatingSubmitted?: (newRating: number, newCount: number) => void;
  size?: 'sm' | 'md' | 'lg';
  compact?: boolean;
}

const RATING_LABELS = [
  'اختر تقييمك',
  '1 - رواية ضعيفة',
  '2 - رواية مقبولة',
  '3 - رواية جيدة وممتعة',
  '4 - رواية رائعة جداً',
  '5 - تحفة أدبية استثنائية ⭐'
];

export const StarRatingWidget: React.FC<StarRatingWidgetProps> = ({
  novelId,
  currentRating,
  ratingCount,
  onRatingSubmitted,
  size = 'md',
  compact = false,
}) => {
  const existingUserRating = storageService.getUserRatingForNovel(novelId);
  const [userRating, setUserRating] = useState<number | null>(existingUserRating);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [justRated, setJustRated] = useState<boolean>(false);

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }[size];

  const handleRate = (score: number) => {
    const result = storageService.rateNovel(novelId, score);
    setUserRating(score);
    setJustRated(true);
    if (onRatingSubmitted) {
      onRatingSubmitted(result.rating, result.ratingCount);
    }
    setTimeout(() => setJustRated(false), 3000);
  };

  const displayedRating = hoverRating || userRating || Math.round(currentRating);

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 font-cairo">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(star => {
            const isFilled = star <= (hoverRating || userRating || Math.round(currentRating));
            return (
              <button
                key={star}
                type="button"
                id={`compact-star-${novelId}-${star}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRate(star);
                }}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-0.5 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                title={`${star} من 5 نجوم`}
              >
                <Star
                  className={`w-4 h-4 transition-colors ${
                    isFilled
                      ? 'fill-[#C88A3B] text-[#C88A3B]'
                      : 'text-[#D0CCC2] hover:text-[#C88A3B]'
                  }`}
                />
              </button>
            );
          })}
        </div>
        <span className="text-xs font-bold text-[#2C2C2C] font-mono">
          {currentRating.toFixed(1)}
        </span>
        <span className="text-[11px] text-[#6E6A64]">
          ({ratingCount})
        </span>
      </div>
    );
  }

  return (
    <div
      id={`star-rating-box-${novelId}`}
      className="p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs font-cairo"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#C88A3B]/15 text-[#C88A3B] flex items-center justify-center font-bold">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#2C2C2C] font-amiri">
              تقييمات القراء والرأي العام
            </h4>
            <p className="text-[11px] text-[#6E6A64]">
              {userRating ? 'شكراً لمشاركتك! يمكنك تعديل تقييمك بأي وقت.' : 'انقر على النجوم لتقييم هذه الرواية:'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#F7F5EE] px-3 py-1.5 rounded-xl border border-[#E5E2D9] self-start sm:self-auto">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-[#C88A3B] text-[#C88A3B]" />
            <span className="font-bold text-sm text-[#2C2C2C] font-mono">
              {currentRating.toFixed(1)}
            </span>
            <span className="text-xs text-[#6E6A64]">/ 5</span>
          </div>
          <span className="text-[#D0CCC2]">|</span>
          <span className="text-xs text-[#6E6A64]">
            {ratingCount} {ratingCount === 1 ? 'تقييم' : 'تقييمات'}
          </span>
        </div>
      </div>

      {/* Interactive Stars & Rating Label */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#F0ECE1]">
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map(star => {
            const isFilled = star <= displayedRating;
            return (
              <button
                key={star}
                type="button"
                id={`rating-star-btn-${novelId}-${star}`}
                onClick={() => handleRate(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 transition-all duration-150 hover:scale-125 active:scale-95 focus:outline-none cursor-pointer"
                title={`${star} نجوم`}
              >
                <Star
                  className={`${starSizes} transition-colors ${
                    isFilled
                      ? 'fill-[#C88A3B] text-[#C88A3B] drop-shadow-xs'
                      : 'text-[#D0CCC2] hover:text-[#C88A3B]'
                  }`}
                />
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          {justRated ? (
            <span className="text-emerald-700 flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>تم تسجيل تقييمك ({userRating} نجوم)!</span>
            </span>
          ) : (
            <span className="text-[#6E6A64]">
              {RATING_LABELS[hoverRating || userRating || 0]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
