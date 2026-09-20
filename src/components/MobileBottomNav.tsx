import React from 'react';
import { BookOpen, Bookmark, User, Download, Heart, CheckCircle2, FileText } from 'lucide-react';
import { SiteBranding } from '../types';

interface MobileBottomNavProps {
  currentView: string;
  onNavigateHome: () => void;
  onNavigateArticles?: () => void;
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
  onNavigateArticles,
  onOpenBookmarks,
  bookmarkCount,
  onScrollToAuthor,
  onOpenInstallModal,
  onOpenDonationModal,
  isStandalone,
  siteBranding,
}) => {
  // Hide on reader view to keep reading distraction-free
  if (currentView === 'reader' || currentView === 'control_panel' || currentView === 'article_reader') {
    return null;
  }

  const appIcon = siteBranding?.pwaIconUrl?.trim() || 
                  siteBranding?.faviconUrl?.trim() || 
                  siteBranding?.logoUrl?.trim() || 
                  '/pwa-192.png';

  const isHome = currentView === 'catalog' || currentView === 'home' || currentView === 'novel_detail';
  const isArticles = currentView === 'articles';

  return (
    <nav 
      id="mobile-bottom-navigation"
      aria-label="شريط التنقل السفلي للهاتف"
      className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-[#FDFCF8]/95 backdrop-blur-md border-t border-[#E5E2D9] px-2 py-1.5 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      dir="rtl"
    >
      <div className="flex items-center justify-around max-w-md mx-auto font-cairo text-[11px]">
        {/* Home / Book */}
        <button
          type="button"
          id="mobile-tab-home"
          onClick={onNavigateHome}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer min-w-[50px] ${
            isHome ? 'text-[#4A5D4E] font-bold' : 'text-[#6E6A64] hover:text-[#2C2C2C]'
          }`}
        >
          <BookOpen className={`w-5 h-5 mb-0.5 ${isHome ? 'text-[#4A5D4E]' : 'text-[#8E8A83]'}`} />
          <span>الكتاب</span>
        </button>

        {/* Articles */}
        {onNavigateArticles && (
          <button
            type="button"
            id="mobile-tab-articles"
            onClick={onNavigateArticles}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer min-w-[50px] ${
              isArticles ? 'text-[#4A5D4E] font-bold' : 'text-[#6E6A64] hover:text-[#2C2C2C]'
            }`}
          >
            <FileText className={`w-5 h-5 mb-0.5 ${isArticles ? 'text-[#4A5D4E]' : 'text-[#8E8A83]'}`} />
            <span>المقالات</span>
          </button>
        )}

        {/* Bookmarks */}
        <button
          type="button"
          id="mobile-tab-bookmarks"
          onClick={onOpenBookmarks}
          className="relative flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[#6E6A64] hover:text-[#2C2C2C] transition-all cursor-pointer min-w-[50px]"
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

        {/* Author Bio */}
        <button
          type="button"
          id="mobile-tab-author"
          onClick={onScrollToAuthor}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[#6E6A64] hover:text-[#2C2C2C] transition-all cursor-pointer min-w-[50px]"
        >
          <User className="w-5 h-5 mb-0.5 text-[#8E8A83]" />
          <span>الكاتب</span>
        </button>
      </div>
    </nav>
  );
};
