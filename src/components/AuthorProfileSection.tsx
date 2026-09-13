import React, { useState } from 'react';
import { AuthorProfile, Novel, DonationSettings } from '../types';
import {
  Heart,
  Mail,
  Quote,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
  Sparkles,
  Award
} from 'lucide-react';

interface AuthorProfileSectionProps {
  authorProfile: AuthorProfile;
  novels: Novel[];
  donationSettings?: DonationSettings;
  onOpenDonationModal: () => void;
  onOpenContactPage: () => void;
}

export const AuthorProfileSection: React.FC<AuthorProfileSectionProps> = ({
  authorProfile,
  novels,
  donationSettings,
  onOpenDonationModal,
  onOpenContactPage,
}) => {
  const [showFullBio, setShowFullBio] = useState<boolean>(false);

  // Statistics
  const totalBooks = novels.length;
  const totalViews = novels.reduce((sum, n) => sum + (n.totalViews || 0), 0);
  const totalLikes = novels.reduce((sum, n) => sum + (n.totalLikes || 0), 0);

  const social = authorProfile.socialLinks || {};

  return (
    <section id="author-bio-section" className="mb-10 font-cairo">
      <div className="rounded-2xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs hover:border-[#D5D2C9] transition-all overflow-hidden">
        {/* Compact Header Gradient Strip */}
        <div className="h-2 bg-linear-to-r from-[#2C382F] via-[#4A5D4E] to-[#C88A3B]" />

        <div className="p-5 sm:p-7">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            {/* Left: Author Identity (Avatar + Name + Title + Short Bio) */}
            <div className="flex items-start gap-4 sm:gap-5 flex-1 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={authorProfile.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop'}
                  alt={authorProfile.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#E5E2D9] shadow-sm bg-[#F7F5EE]"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute -bottom-1 -left-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" title="الكاتب متواجد" />
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#2C2C2C] font-amiri tracking-wide">
                    {authorProfile.name}
                  </h2>
                  {authorProfile.englishName && (
                    <span className="text-xs font-medium text-[#6E6A64] font-mono">
                      {authorProfile.englishName}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full bg-[#4A5D4E]/10 text-[#4A5D4E] text-[10px] font-bold">
                    المؤلف الأصلي
                  </span>
                </div>

                <p className="text-xs font-bold text-[#4A5D4E]">
                  {authorProfile.title || 'كاتب، باحث، ومؤلف'}
                </p>

                <p className="text-xs text-[#6E6A64] leading-relaxed max-w-2xl">
                  {authorProfile.shortBio}
                </p>
              </div>
            </div>

            {/* Right: Quick Action Buttons & Stats */}
            <div className="flex flex-wrap md:flex-col items-center md:items-end gap-2.5 shrink-0 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-[#E5E2D9]">
              {/* Support Button */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {donationSettings?.enabled !== false && (
                  <button
                    type="button"
                    id="author-support-btn"
                    onClick={onOpenDonationModal}
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-98"
                  >
                    <Heart className="w-3.5 h-3.5 fill-white" />
                    <span>دعم الكاتب</span>
                  </button>
                )}

                <button
                  type="button"
                  id="author-contact-page-btn"
                  onClick={onOpenContactPage}
                  className="px-3.5 py-2 rounded-xl border border-[#E5E2D9] bg-[#FDFCF8] hover:bg-[#F7F5EE] text-[#2C2C2C] text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-98"
                  title="مراسلة الكاتب عبر نموذج التواصل الرسمي"
                >
                  <Mail className="w-3.5 h-3.5 text-[#4A5D4E]" />
                  <span>تواصل مع الكاتب</span>
                </button>
              </div>

              {/* Compact Stats Badges */}
              <div className="flex items-center gap-2 text-[11px] text-[#6E6A64] font-medium bg-[#F7F5EE] px-3 py-1.5 rounded-xl border border-[#E5E2D9] w-full sm:w-auto justify-between sm:justify-end">
                <span>📚 <strong>{totalBooks}</strong> مؤلفات</span>
                <span className="text-[#E5E2D9]">•</span>
                <span>👁️ <strong>{totalViews.toLocaleString('ar-EG')}</strong> قراءة</span>
                <span className="text-[#E5E2D9]">•</span>
                <span className="text-rose-600">❤️ <strong>{totalLikes.toLocaleString('ar-EG')}</strong></span>
              </div>
            </div>
          </div>

          {/* Collapsible Bio Details */}
          {(authorProfile.fullBio || authorProfile.vision) && (
            <div className="mt-4 pt-4 border-t border-[#E5E2D9]/80 space-y-3">
              {authorProfile.fullBio && (
                <div>
                  <p className={`text-xs text-[#4A4742] leading-relaxed ${!showFullBio ? 'line-clamp-2' : ''}`}>
                    {authorProfile.fullBio}
                  </p>

                  {authorProfile.fullBio.length > 150 && (
                    <button
                      type="button"
                      onClick={() => setShowFullBio(!showFullBio)}
                      className="text-[11px] font-bold text-[#4A5D4E] hover:underline mt-1.5 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>{showFullBio ? 'عرض أقل' : 'عرض النبذة الكاملة...'}</span>
                      {showFullBio ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              )}

              {authorProfile.vision && showFullBio && (
                <div className="p-3 rounded-xl bg-[#4A5D4E]/5 border border-[#4A5D4E]/15 flex items-start gap-2.5 text-xs text-[#2C2C2C]">
                  <Quote className="w-3.5 h-3.5 text-[#4A5D4E] shrink-0 mt-0.5" />
                  <p className="italic font-serif">
                    "{authorProfile.vision}"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Compact Social Channels Bar */}
          <div className="mt-4 pt-3.5 border-t border-[#E5E2D9]/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-[11px] font-bold text-[#6E6A64]">
              حسابات ومنصات الكاتب:
            </span>

            <div className="flex flex-wrap items-center gap-1.5">
              {social.twitter && (
                <a
                  href={social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-[#2C2C2C] text-white text-[11px] font-bold hover:opacity-85 transition-all flex items-center gap-1"
                >
                  <span>X (تويتر)</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              )}
              {social.facebook && (
                <a
                  href={social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-bold hover:opacity-85 transition-all flex items-center gap-1"
                >
                  <span>فيسبوك</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              )}
              {social.instagram && (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[11px] font-bold hover:opacity-85 transition-all flex items-center gap-1"
                >
                  <span>انستغرام</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              )}
              {social.youtube && (
                <a
                  href={social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-[11px] font-bold hover:opacity-85 transition-all flex items-center gap-1"
                >
                  <span>يوتيوب</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              )}
              {social.telegram && (
                <a
                  href={social.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-sky-500 text-white text-[11px] font-bold hover:opacity-85 transition-all flex items-center gap-1"
                >
                  <span>تيليجرام</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              )}
              {social.linkedin && (
                <a
                  href={social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-blue-700 text-white text-[11px] font-bold hover:opacity-85 transition-all flex items-center gap-1"
                >
                  <span>لينكد إن</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              )}
              {social.goodreads && (
                <a
                  href={social.goodreads}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-amber-800 text-white text-[11px] font-bold hover:opacity-85 transition-all flex items-center gap-1"
                >
                  <span>جودريدز</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              )}
              {social.whatsapp && (
                <a
                  href={social.whatsapp.startsWith('http') ? social.whatsapp : `https://wa.me/${social.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold hover:opacity-85 transition-all flex items-center gap-1"
                >
                  <span>واتساب</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
