import React from 'react';
import { BookOpen, Bookmark, User, Download, Heart, CheckCircle2 } from 'lucide-react';
import { SiteBranding } from '../types';

interface MobileBottomNavProps {
  currentView: string;
  onNavigateHome: () => void;
  onOpenBookmarks: () => void;
  bookmarkCount: number;
  onScrollToAuthor: () => void;
  onOpenInstallModal: () => void;
  onOpenDonationModal: () => void;
  isStandalone: boolean;
  siteBranding?: SiteBranding;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onNavigateHome,
  onOpenBookmarks,
  bookmarkCount,
  onScrollToAuthor,
  onOpenInstallModal,
  onOpenDonationModal,
  isStandalone,
  siteBranding,
}) => {
  // Hide on reader view to keep reading distraction-free
  if (currentView === 'reader' || currentView === 'control_panel') {
    return null;
  }

  const appIcon = siteBranding?.pwaIconUrl?.trim() || 
                  siteBranding?.faviconUrl?.trim() || 
                  siteBranding?.logoUrl?.trim() || 
                  '/pwa-192.png';

  const isHome = currentView === 'home' || currentView === 'novel_detail';

  return (
    <nav 
      id="mobile-bottom-navigation"
      aria-label="شريط التنقل السفلي للهاتف"
      className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-[#FDFCF8]/95 backdrop-blur-md border-t border-[#E5E2D9] px-2 py-1.5 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      dir="rtl"
    >
      <div className="flex items-center justify-around max-w-md mx-auto font-cairo text-[11px]">
        {/* Home */}
        <button
          type="button"
          id="mobile-tab-home"
          onClick={onNavigateHome}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer min-w-[56px] ${
            isHome ? 'text-[#4A5D4E] font-bold' : 'text-[#6E6A64] hover:text-[#2C2C2C]'
          }`}
        >
          <BookOpen className={`w-5 h-5 mb-0.5 ${isHome ? 'text-[#4A5D4E]' : 'text-[#8E8A83]'}`} />
          <span>المؤلفات</span>
        </button>

        {/* Bookmarks */}
        <button
          type="button"
          id="mobile-tab-bookmarks"
          onClick={onOpenBookmarks}
          className="relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[#6E6A64] hover:text-[#2C2C2C] transition-all cursor-pointer min-w-[56px]"
        >
          <div className="relative">
            <Bookmark className="w-5 h-5 mb-0.5 text-[#8E8A83]" />
            {bookmarkCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#C88A3B] text-white text-[9px] font-bold flex items-center justify-center font-mono">
                {bookmarkCount}
              </span>
            )}
          </div>
          <span>مكتبتي</span>
        </button>

        {/* Center Prominent Direct Download & Install App Button */}
        <button
          type="button"
          id="mobile-tab-install-app"
          onClick={onOpenInstallModal}
          className="relative -top-2 flex flex-col items-center justify-center p-1 cursor-pointer group"
          title="تنزيل مباشر للتطبيق على هاتفك"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#4A5D4E] to-[#5C7261] p-0.5 shadow-lg border-2 border-white flex items-center justify-center transition-transform active:scale-95 group-hover:shadow-xl">
            <img
              src={appIcon}
              alt="أيقونة تطبيق أيمن كناني"
              className="w-full h-full object-cover rounded-[14px]"
              referrerPolicy="no-referrer"
            />
            {!isStandalone && (
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#C88A3B] text-white flex items-center justify-center shadow-xs">
                <Download className="w-2.5 h-2.5 stroke-[2.5]" />
              </span>
            )}
          </div>
          <span className="mt-0.5 text-[10px] font-bold text-[#4A5D4E] whitespace-nowrap">
            {isStandalone ? 'تطبيق مثبت' : 'تنزيل مباشر'}
          </span>
        </button>

        {/* Author Bio */}
        <button
          type="button"
          id="mobile-tab-author"
          onClick={onScrollToAuthor}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[#6E6A64] hover:text-[#2C2C2C] transition-all cursor-pointer min-w-[56px]"
        >
          <User className="w-5 h-5 mb-0.5 text-[#8E8A83]" />
          <span>عن الكاتب</span>
        </button>

        {/* Support / Donation */}
        <button
          type="button"
          id="mobile-tab-donate"
          onClick={onOpenDonationModal}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-rose-700 hover:text-rose-800 transition-all cursor-pointer min-w-[56px]"
        >
          <Heart className="w-5 h-5 mb-0.5 fill-rose-500 text-rose-500" />
          <span>دعم الكاتب</span>
        </button>
      </div>
    </nav>
  );
};
