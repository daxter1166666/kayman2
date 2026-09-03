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
            className="flex items-center gap-3.5 cursor-pointer group shrink-0"
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={brandName}
                className="h-12 sm:h-15 max-h-[60px] w-auto max-w-[190px] sm:max-w-[240px] object-contain rounded-xl transition-transform duration-300 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#4A5D4E] flex items-center justify-center text-[#FDFCF8] shadow-md group-hover:bg-[#3C4C3F] transition-all">
                <Feather className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
            )}
            <div>
              <span className="font-amiri font-bold text-lg sm:text-2xl tracking-tight text-[#2C2C2C] group-hover:text-[#4A5D4E] transition-colors leading-tight block">
                {brandName}
              </span>
              <span className="text-[11px] sm:text-xs font-cairo text-[#4A5D4E] block mt-0.5 font-semibold">
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

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            {onOpenDonationModal && (
              <button
                type="button"
                onClick={onOpenDonationModal}
                className="p-2 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1 font-cairo"
                title="دعم الكاتب"
              >
                <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
              </button>
            )}

            {canInstallPwa && onInstallPwa && (
              <button
                type="button"
                onClick={onInstallPwa}
                className="p-2 rounded-lg bg-[#4A5D4E]/10 text-[#4A5D4E] font-bold text-xs flex items-center gap-1 font-cairo"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            )}

            {isAdminLoggedIn && (
              <button
                type="button"
                id="mobile-cp-btn"
                onClick={onOpenControlPanel}
                className="px-3 py-1.5 bg-[#4A5D4E] text-[#FDFCF8] font-bold text-xs rounded-lg flex items-center gap-1.5 font-cairo"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>التحكم</span>
              </button>
            )}

            <button
              type="button"
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-[#F7F5EE] border border-[#E5E2D9] text-[#2C2C2C] hover:bg-[#EFECE4]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search & Menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-[#E5E2D9] space-y-3 animate-in fade-in font-cairo">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E8A83]" />
              <input
                type="text"
                placeholder="ابحث في مؤلفات وكتب الكاتب أيمن كناني..."
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                className="w-full pr-10 pl-4 py-2 text-xs rounded-xl bg-[#F7F5EE] border border-[#E5E2D9] text-[#2C2C2C] text-right"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  onNavigateHome();
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-lg bg-[#F7F5EE] text-[#2C2C2C] text-right font-semibold border border-[#E5E2D9]"
              >
                المؤلفات والكتب
              </button>

              {onScrollToAuthor && (
                <button
                  type="button"
                  onClick={() => {
                    onScrollToAuthor();
                    setMobileMenuOpen(false);
                  }}
                  className="p-2.5 rounded-lg bg-[#F7F5EE] text-[#2C2C2C] text-right font-semibold border border-[#E5E2D9]"
                >
                  عن الكاتب أيمن كناني
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onOpenBookmarks();
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-lg bg-[#F7F5EE] text-[#2C2C2C] text-right font-semibold flex items-center justify-between border border-[#E5E2D9]"
              >
                <span>مكتبتي المحفوظة</span>
                {bookmarkCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-[#C88A3B] text-white font-bold text-[10px]">
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
                  className="p-2.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-center font-bold flex items-center justify-center gap-1.5"
                >
                  <Heart className="w-3.5 h-3.5 fill-rose-600" />
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
                  className="col-span-2 p-2.5 rounded-lg bg-[#4A5D4E]/10 text-[#4A5D4E] border border-[#4A5D4E]/30 text-center font-bold flex items-center justify-center gap-2"
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
                  className="col-span-2 p-2.5 rounded-lg bg-[#4A5D4E] text-[#FDFCF8] text-center font-bold"
                >
                  لوحة التحكم الإدارية
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
