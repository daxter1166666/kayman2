import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Bookmark,
  Feather,
  LayoutDashboard,
  Menu,
  X,
  Smartphone,
  Heart,
  User
} from 'lucide-react';
import { SiteBranding } from '../types';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNavigateHome: () => void;
  onOpenControlPanel: () => void;
  onOpenBookmarks: () => void;
  bookmarkCount: number;
  isControlPanelOpen: boolean;
  isAdminLoggedIn: boolean;
  onOpenAdminLoginModal: () => void;
  onInstallPwa?: () => void;
  canInstallPwa?: boolean;
  siteBranding?: SiteBranding;
  onOpenDonationModal?: () => void;
  onScrollToAuthor?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  onNavigateHome,
  onOpenControlPanel,
  onOpenBookmarks,
  bookmarkCount,
  isControlPanelOpen,
  isAdminLoggedIn,
  onOpenAdminLoginModal,
  onInstallPwa,
  canInstallPwa,
  siteBranding,
  onOpenDonationModal,
  onScrollToAuthor,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const brandName = siteBranding?.siteName || 'أيمن كناني | Ayman Kinani';
  const brandSubtitle = siteBranding?.siteSubtitle || 'المنصة الرسمية لنشر المؤلفات والكتب';
  const logoUrl = siteBranding?.logoUrl;

  return (
    <header className="sticky top-0 z-40 bg-[#FDFCF8]/95 backdrop-blur-md border-b border-[#E5E2D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-18 sm:h-20 gap-4 py-2">
          {/* Logo & Brand */}
          <div
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer group min-w-0"
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={brandName}
                className="h-10 sm:h-14 max-h-[56px] w-auto max-w-[130px] sm:max-w-[220px] object-contain rounded-xl transition-transform duration-300 group-hover:scale-105 shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#4A5D4E] flex items-center justify-center text-[#FDFCF8] shadow-md group-hover:bg-[#3C4C3F] transition-all shrink-0">
                <Feather className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
            )}
            <div className="min-w-0">
              <span className="font-amiri font-bold text-base sm:text-2xl tracking-tight text-[#2C2C2C] group-hover:text-[#4A5D4E] transition-colors leading-tight block truncate">
                {brandName}
              </span>
              <span className="text-[10px] sm:text-xs font-cairo text-[#4A5D4E] block mt-0.5 font-semibold truncate max-w-[150px] sm:max-w-none">
                {brandSubtitle}
              </span>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E8A83]" />
              <input
                type="text"
                id="global-search-input"
                placeholder="ابحث في مؤلفات وكتب الكاتب أيمن كناني..."
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                className="w-full pr-10 pl-8 py-2 text-xs rounded-xl bg-[#F7F5EE] border border-[#E5E2D9] focus:border-[#4A5D4E] focus:ring-1 focus:ring-[#4A5D4E] text-[#2C2C2C] placeholder-[#8E8A83] focus:outline-none transition-all font-cairo text-right"
              />
              {searchQuery && (
                <button
                  type="button"
                  id="clear-search-btn"
                  onClick={() => onSearchChange('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#8E8A83] hover:text-[#2C2C2C] p-1 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Desktop Navigation Actions */}
          <div className="hidden lg:flex items-center gap-2 font-cairo">
            <button
              type="button"
              id="nav-browse-btn"
              onClick={onNavigateHome}
              className="px-3 py-2 rounded-lg text-xs font-semibold text-[#6E6A64] hover:text-[#2C2C2C] hover:bg-[#F7F5EE] transition-all cursor-pointer"
            >
              المؤلفات والكتب
            </button>

            {onScrollToAuthor && (
              <button
                type="button"
                onClick={onScrollToAuthor}
                className="px-3 py-2 rounded-lg text-xs font-semibold text-[#6E6A64] hover:text-[#2C2C2C] hover:bg-[#F7F5EE] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-[#4A5D4E]" />
                <span>عن الكاتب</span>
              </button>
            )}

            <button
              type="button"
              id="nav-bookmarks-btn"
              onClick={onOpenBookmarks}
              className="px-3 py-2 rounded-lg text-xs font-semibold text-[#6E6A64] hover:text-[#2C2C2C] hover:bg-[#F7F5EE] transition-all flex items-center gap-1.5 cursor-pointer relative"
            >
              <Bookmark className="w-3.5 h-3.5 text-[#4A5D4E]" />
              <span>مكتبتي</span>
              {bookmarkCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#C88A3B] text-[#FDFCF8] font-bold text-[10px] font-mono">
                  {bookmarkCount}
                </span>
              )}
            </button>

            {/* Support Author Button */}
            {onOpenDonationModal && (
              <button
                type="button"
                id="nav-support-btn"
                onClick={onOpenDonationModal}
                className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-98"
              >
                <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                <span>دعم الكاتب</span>
              </button>
            )}

            {/* PWA Install Button */}
            {canInstallPwa && onInstallPwa && (
              <button
                type="button"
                id="install-pwa-nav-btn"
                onClick={onInstallPwa}
                className="px-3 py-2 rounded-xl border border-[#4A5D4E]/30 bg-[#4A5D4E]/10 hover:bg-[#4A5D4E]/20 text-[#4A5D4E] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="تنزيل الموقع كتطبيق على الشاشة الرئيسية"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>تثبيت التطبيق</span>
              </button>
            )}

            {/* Admin Button ONLY shown if user is authenticated admin or already in control panel */}
            {isAdminLoggedIn && (
              <button
                type="button"
                id="nav-control-panel-btn"
                onClick={onOpenControlPanel}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer mr-2 ${
                  isControlPanelOpen
                    ? 'bg-[#2C2C2C] text-[#FDFCF8]'
                    : 'bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8]'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>{isControlPanelOpen ? 'الرجوع للموقع' : 'لوحة التحكم الإدارية'}</span>
              </button>
            )}
          </div>

          {/* Mobile Menu & Quick Actions Button */}
          <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
            {/* Quick Mobile Bookmarks Button */}
            <button
              type="button"
              id="mobile-nav-bookmarks-btn"
              onClick={onOpenBookmarks}
              className="relative p-2 sm:p-2.5 rounded-xl bg-[#F7F5EE] border border-[#E5E2D9] text-[#2C2C2C] hover:bg-[#EFECE4] transition-colors cursor-pointer"
              title="مكتبتي المحفوظة"
            >
              <Bookmark className="w-4 h-4 text-[#4A5D4E]" />
              {bookmarkCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 bg-[#C88A3B] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {bookmarkCount}
                </span>
              )}
            </button>

            {onOpenDonationModal && (
              <button
                type="button"
                onClick={onOpenDonationModal}
                className="p-2 sm:p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1 font-cairo cursor-pointer"
                title="دعم الكاتب"
              >
                <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
              </button>
            )}

            {/* Admin Button ONLY shown if user is actually authenticated */}
            {isAdminLoggedIn && (
              <button
                type="button"
                id="mobile-cp-btn"
                onClick={onOpenControlPanel}
                className="px-2.5 py-2 bg-[#4A5D4E] text-[#FDFCF8] font-bold text-xs rounded-xl flex items-center gap-1 font-cairo shadow-xs cursor-pointer"
                title="لوحة التحكم"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">التحكم</span>
              </button>
            )}

            <button
              type="button"
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 sm:p-2.5 rounded-xl bg-[#F7F5EE] border border-[#E5E2D9] text-[#2C2C2C] hover:bg-[#EFECE4] transition-colors cursor-pointer flex items-center justify-center"
              aria-label="القائمة الرئيسية"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#2C2C2C]" /> : <Menu className="w-5 h-5 text-[#2C2C2C]" />}
            </button>
          </div>
        </div>

        {/* Mobile Search & Menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-[#E5E2D9] space-y-3 animate-in fade-in duration-150 font-cairo">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E8A83]" />
              <input
                type="text"
                placeholder="ابحث في مؤلفات وكتب الكاتب أيمن كناني..."
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                className="w-full pr-10 pl-8 py-2.5 text-xs rounded-xl bg-[#F7F5EE] border border-[#E5E2D9] focus:border-[#4A5D4E] text-[#2C2C2C] text-right font-cairo"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#8E8A83] p-1"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  onNavigateHome();
                  setMobileMenuOpen(false);
                }}
                className="p-3 rounded-xl bg-[#FFFFFF] text-[#2C2C2C] text-right font-bold border border-[#E5E2D9] shadow-xs active:bg-[#F7F5EE] flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-[#4A5D4E]" />
                <span>المؤلفات والكتب</span>
              </button>

              {onScrollToAuthor && (
                <button
                  type="button"
                  onClick={() => {
                    onScrollToAuthor();
                    setMobileMenuOpen(false);
                  }}
                  className="p-3 rounded-xl bg-[#FFFFFF] text-[#2C2C2C] text-right font-bold border border-[#E5E2D9] shadow-xs active:bg-[#F7F5EE] flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-[#4A5D4E]" />
                  <span>عن الكاتب أيمن</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onOpenBookmarks();
                  setMobileMenuOpen(false);
                }}
                className="p-3 rounded-xl bg-[#FFFFFF] text-[#2C2C2C] text-right font-bold flex items-center justify-between border border-[#E5E2D9] shadow-xs active:bg-[#F7F5EE]"
              >
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-[#4A5D4E]" />
                  <span>مكتبتي المحفوظة</span>
                </div>
                {bookmarkCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-[#C88A3B] text-white font-bold text-[10px]">
                    {bookmarkCount}
                  </span>
                )}
              </button>

              {onOpenDonationModal && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenDonationModal();
                    setMobileMenuOpen(false);
                  }}
                  className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-center font-bold flex items-center justify-center gap-1.5 shadow-xs active:bg-rose-100"
                >
                  <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
                  <span>دعم الكاتب</span>
                </button>
              )}

              {canInstallPwa && onInstallPwa && (
                <button
                  type="button"
                  onClick={() => {
                    onInstallPwa();
                    setMobileMenuOpen(false);
                  }}
                  className="col-span-2 p-3 rounded-xl bg-[#4A5D4E]/10 text-[#4A5D4E] border border-[#4A5D4E]/30 text-center font-bold flex items-center justify-center gap-2 shadow-xs"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>تثبيت تطبيق المنصة على هاتفك</span>
                </button>
              )}

              {isAdminLoggedIn && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenControlPanel();
                    setMobileMenuOpen(false);
                  }}
                  className="col-span-2 p-3 rounded-xl bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8] text-center font-bold flex items-center justify-center gap-2 shadow-sm"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>لوحة التحكم الإدارية</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
