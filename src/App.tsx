import React, { useState, useEffect, useMemo } from 'react';
import {
  Novel,
  Chapter,
  Comment,
  AdSettings,
  ReaderSettings,
  Bookmark,
  Category,
  AuthorProfile,
  SiteBranding,
  DonationSettings
} from './types';
import { storageService } from './services/storageService';
import { supabaseService } from './services/supabaseService';
import { seoService, updateSeo } from './services/seoService';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { NovelCard } from './components/NovelCard';
import { NovelDetailView } from './components/NovelDetailView';
import { ChapterReader } from './components/ChapterReader';
import { ControlPanel } from './components/ControlPanel/ControlPanel';
import { LegalPages } from './components/Legal/LegalPages';
import { AdSlot } from './components/AdSlot';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AuthorProfileSection } from './components/AuthorProfileSection';
import { DonationModal } from './components/DonationModal';
import {
  Sparkles,
  BookOpen,
  TrendingUp,
  Star,
  Layers,
  Filter,
  Bookmark as BookmarkIcon,
  X,
  ChevronRight,
  ShieldCheck,
  Award,
  Clock,
  Compass,
  Smartphone,
  Check,
  Heart,
  Lock,
  User
} from 'lucide-react';

export default function App() {
  // Read SSR Initial Payload if delivered by Server-Side Rendering
  const initialSSR = typeof window !== 'undefined' ? (window as any).__INITIAL_DATA__ : null;

  // Global Data State seeded with SSR data if available
  const [novels, setNovels] = useState<Novel[]>(() => {
    const local = storageService.getNovels();
    if (initialSSR?.novel) {
      const merged = [initialSSR.novel, ...local.filter(n => n.id !== initialSSR.novel.id)];
      storageService.saveNovels(merged);
      return merged;
    }
    return local;
  });

  const [chapters, setChapters] = useState<Chapter[]>(() => {
    const local = storageService.getChapters();
    if (initialSSR?.chapter) {
      const merged = [initialSSR.chapter, ...local.filter(c => c.id !== initialSSR.chapter.id)];
      storageService.saveChapters(merged);
      return merged;
    }
    return local;
  });

  const [comments, setComments] = useState<Comment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [adSettings, setAdSettings] = useState<AdSettings>(() => storageService.getAdSettings());
  const [readerSettings, setReaderSettings] = useState<ReaderSettings>(() => storageService.getReaderSettings());
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [authorProfile, setAuthorProfile] = useState<AuthorProfile>(() => storageService.getAuthorProfile());
  const [siteBranding, setSiteBranding] = useState<SiteBranding>(() => storageService.getSiteBranding());
  const [donationSettings, setDonationSettings] = useState<DonationSettings>(() => storageService.getDonationSettings());

  // Navigation View State initialized with SSR state or pathname
  const [currentView, setCurrentView] = useState<'catalog' | 'novel_detail' | 'reader' | 'control_panel' | 'legal'>(() => {
    if (initialSSR?.currentView) return initialSSR.currentView;
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      if (p.includes('/chapter') || p.match(/\/novel\/chapter-\d+/)) return 'reader';
      if (p.startsWith('/novel/') && !p.endsWith('/novel/')) return 'novel_detail';
    }
    return 'catalog';
  });

  const [selectedNovelId, setSelectedNovelId] = useState<string | null>(() => {
    if (initialSSR?.novel?.id) return initialSSR.novel.id;
    if (initialSSR?.chapter?.novelId) return initialSSR.chapter.novelId;
    return null;
  });

  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(() => {
    if (initialSSR?.chapter?.id) return initialSSR.chapter.id;
    return null;
  });

  const [legalPage, setLegalPage] = useState<'terms' | 'privacy' | 'dmca' | 'licenses' | 'contact' | 'ads_txt'>('terms');
  
  // Modals & Drawers
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'latest'>('popular');
  const [showBookmarksDrawer, setShowBookmarksDrawer] = useState<boolean>(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);
  const [showDonationModal, setShowDonationModal] = useState<boolean>(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => storageService.isAdminLoggedIn());

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstallPwa, setCanInstallPwa] = useState<boolean>(false);
  const [showPwaBanner, setShowPwaBanner] = useState<boolean>(true);

  // Load initial data
  const refreshData = () => {
    setNovels(storageService.getNovels());
    setChapters(storageService.getChapters());
    setComments(storageService.getComments());
    setCategories(storageService.getCategories());
    setAdSettings(storageService.getAdSettings());
    setBookmarks(storageService.getBookmarks());
    setAuthorProfile(storageService.getAuthorProfile());
    setSiteBranding(storageService.getSiteBranding());
    setDonationSettings(storageService.getDonationSettings());
  };

  useEffect(() => {
    refreshData();

    // Cross-browser cloud synchronization with Supabase (throttled & non-blocking)
    let lastPullTime = 0;
    const doPull = (force = false) => {
      const now = Date.now();
      // Minimum 4 minutes cooldown between automatic pulls unless forced
      if (!force && now - lastPullTime < 240000) {
        return;
      }
      lastPullTime = now;

      supabaseService.pullAllFromSupabase().then(res => {
        if (res) {
          refreshData();
        }
      }).catch(err => {
        console.warn('Supabase pull note:', err);
      });
    };

    // Initial pull on mount
    doPull(true);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        doPull(false);
      }
    };

    window.addEventListener('visibilitychange', handleVisibility);
    // Relaxed 5-minute background check
    const syncInterval = setInterval(() => doPull(false), 300000);

    // Check for admin URL triggers (?admin=true, /admin, #admin)
    const urlParams = new URLSearchParams(window.location.search);
    const isPathAdmin = window.location.pathname === '/admin' || window.location.pathname.endsWith('/admin');
    const isHashAdmin = window.location.hash === '#admin';
    const isQueryAdmin = urlParams.get('admin') === 'true' || urlParams.get('dashboard') === 'true';

    if (isQueryAdmin || isPathAdmin || isHashAdmin) {
      if (storageService.isAdminLoggedIn()) {
        setIsAdminLoggedIn(true);
        setCurrentView('control_panel');
      } else {
        setIsAdminLoggedIn(false);
        setShowAdminLoginModal(true);
      }
    } else if (initialSSR?.currentView === 'reader' && initialSSR.chapter) {
      setSelectedNovelId(initialSSR.novel?.id || initialSSR.chapter.novelId);
      setSelectedChapterId(initialSSR.chapter.id);
      setCurrentView('reader');
    } else if (initialSSR?.currentView === 'novel_detail' && initialSSR.novel) {
      setSelectedNovelId(initialSSR.novel.id);
      setCurrentView('novel_detail');
    } else {
      const pathname = window.location.pathname;
      const chapterMatch = pathname.match(/\/novel\/(?:[^/]+\/)?chapter[/-]([^/]+)/i) || pathname.match(/\/chapter\/([^/]+)/i);
      const novelMatch = pathname.match(/\/novel\/([^/]+)$/i) || pathname.match(/\/book\/([^/]+)$/i);

      const novelParam = urlParams.get('novel');
      const chapterParam = urlParams.get('chapter');
      const legalParam = urlParams.get('legal');

      if (chapterMatch) {
        const chIdent = decodeURIComponent(chapterMatch[1]);
        const ch = storageService.getChapters().find(c => c.slug === chIdent || c.id === chIdent || `chapter-${c.chapterNumber}` === chIdent || String(c.chapterNumber) === chIdent);
        if (ch) {
          setSelectedNovelId(ch.novelId);
          setSelectedChapterId(ch.id);
          setCurrentView('reader');
        }
      } else if (chapterParam) {
        const chapter = storageService.getChapterById(chapterParam);
        if (chapter) {
          setSelectedNovelId(chapter.novelId);
          setSelectedChapterId(chapterParam);
          setCurrentView('reader');
        }
      } else if (novelMatch && !novelMatch[1].startsWith('chapter-')) {
        const novIdent = decodeURIComponent(novelMatch[1]);
        const nov = storageService.getNovels().find(n => n.slug === novIdent || n.id === novIdent);
        if (nov) {
          setSelectedNovelId(nov.id);
          setCurrentView('novel_detail');
        }
      } else if (novelParam) {
        setSelectedNovelId(novelParam);
        setCurrentView('novel_detail');
      } else if (legalParam && ['terms', 'privacy', 'dmca', 'licenses', 'contact', 'ads_txt'].includes(legalParam)) {
        setLegalPage(legalParam as any);
        setCurrentView('legal');
      }
    }

    // Dynamic document title & favicon
    const currentBranding = storageService.getSiteBranding();
    if (currentBranding.siteName && !initialSSR) {
      document.title = `${currentBranding.siteName} - ${currentBranding.siteSubtitle}`;
    }
    if (currentBranding.faviconUrl) {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = currentBranding.faviconUrl;
      document.getElementsByTagName('head')[0].appendChild(link);
    }

    // PWA Install prompt listener
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstallPwa(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(syncInterval);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // --- Dynamic SEO Engine (Meta tags, OpenGraph, Twitter Cards, Schema.org JSON-LD) ---
  useEffect(() => {
    if (currentView === 'control_panel') {
      // Admin area should NEVER be indexed by search engines
      seoService.updateHead({
        title: 'لوحة التحكم الإدارية',
        robots: 'noindex, nofollow',
      });
      return;
    }

    if (currentView === 'novel_detail' && selectedNovelId) {
      const novel = novels.find(n => n.id === selectedNovelId);
      if (novel) {
        seoService.updateHeadForNovel(novel, authorProfile);
        return;
      }
    }

    if (currentView === 'reader' && selectedNovelId && selectedChapterId) {
      const novel = novels.find(n => n.id === selectedNovelId);
      const chapter = chapters.find(c => c.id === selectedChapterId);
      if (novel && chapter) {
        seoService.updateHeadForChapter(chapter, novel, authorProfile);
        return;
      }
    }

    if (currentView === 'legal') {
      const legalTitles: Record<string, string> = {
        terms: 'شروط الاستخدام وحقوق الملكية الفكرية',
        privacy: 'سياسة الخصوصية وملفات تعريف الارتباط',
        dmca: 'سياسة حماية حقوق النشر (DMCA)',
        licenses: 'التراخيص والاعتماد الأدبي',
        contact: 'اتصل بنا ورسائل القراء',
        ads_txt: 'ملف ads.txt والناشرين',
      };
      seoService.updateHead({
        title: legalTitles[legalPage] || 'الوثائق القانونية',
        description: `الصفحة الرسمية لـ ${legalTitles[legalPage] || 'الوثائق القانونية'} في المنصة الرسمية للكاتب أيمن كناني.`,
        url: `/?legal=${legalPage}`,
        robots: 'index, follow',
      });
      return;
    }

    // Default Catalog / Home view
    const homeJsonLd = [
      seoService.buildWebSiteJsonLd(siteBranding, storageService.getSeoSettings().canonicalBaseUrl || window.location.origin),
      seoService.buildAuthorJsonLd(authorProfile, storageService.getSeoSettings().canonicalBaseUrl || window.location.origin)
    ];

    seoService.updateHead({
      title: siteBranding.siteName ? `${siteBranding.siteName} - ${siteBranding.siteSubtitle}` : undefined,
      description: siteBranding.siteSubtitle ? `${siteBranding.siteName}: ${siteBranding.siteSubtitle}. اكتشف جميع الروايات والكتب الفلسفية والأدبية وقراءتها مباشرة أو تحميلها PDF.` : undefined,
      ogType: 'website',
      ogImage: authorProfile.avatar || authorProfile.coverImage,
      url: '/',
      structuredData: homeJsonLd,
    });
  }, [currentView, selectedNovelId, selectedChapterId, legalPage, novels, chapters, authorProfile, siteBranding]);

  // Adsterra Social Bar & Popunder injection effect
  useEffect(() => {
    if (adSettings.adsterra?.enabled) {
      // Social bar script injection if present
      if (adSettings.adsterra.socialBarScript) {
        const srcMatch = adSettings.adsterra.socialBarScript.match(/src=['"]([^'"]+)['"]/);
        if (srcMatch && srcMatch[1]) {
          const script = document.createElement('script');
          script.src = srcMatch[1];
          script.async = true;
          script.id = 'adsterra-socialbar-script';
          document.body.appendChild(script);
        }
      }
      // Popunder script injection if present
      if (adSettings.adsterra.popunderScript) {
        const srcMatch = adSettings.adsterra.popunderScript.match(/src=['"]([^'"]+)['"]/);
        if (srcMatch && srcMatch[1]) {
          const script = document.createElement('script');
          script.src = srcMatch[1];
          script.async = true;
          script.id = 'adsterra-popunder-script';
          document.body.appendChild(script);
        }
      }
    }
  }, [adSettings.adsterra]);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setCanInstallPwa(false);
      }
      setDeferredPrompt(null);
    } else {
      alert('لتثبيت التطبيق على هاتفك: اضغط على خيارات المتصفح (⋮ أو زر المشاركة في سفاري) ثم اختر "إضافة إلى الشاشة الرئيسية (Add to Home screen)".');
    }
  };

  // Update reader settings handler
  const handleUpdateReaderSettings = (newSettings: ReaderSettings) => {
    setReaderSettings(newSettings);
    storageService.saveReaderSettings(newSettings);
  };

  // Admin Control Panel Handlers
  const handleOpenControlPanel = () => {
    if (storageService.isAdminLoggedIn()) {
      setIsAdminLoggedIn(true);
      setCurrentView('control_panel');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsAdminLoggedIn(false);
      setShowAdminLoginModal(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setShowAdminLoginModal(false);
    setCurrentView('control_panel');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLogout = () => {
    storageService.logoutAdmin();
    setIsAdminLoggedIn(false);
    setCurrentView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigation handlers
  const handleNavigateHome = () => {
    refreshData();
    setCurrentView('catalog');
    setSelectedNovelId(null);
    setSelectedChapterId(null);
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectNovel = (novelId: string) => {
    setSelectedNovelId(novelId);
    setCurrentView('novel_detail');
    const novel = novels.find(n => n.id === novelId) || storageService.getNovelById(novelId);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `/novel/${novel?.slug || novelId}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectChapter = (chapterId: string) => {
    const chapter = chapters.find(c => c.id === chapterId) || storageService.getChapterById(chapterId);
    if (chapter) {
      setSelectedNovelId(chapter.novelId);
      setSelectedChapterId(chapterId);
      setCurrentView('reader');
      const novel = novels.find(n => n.id === chapter.novelId) || storageService.getNovelById(chapter.novelId);
      if (typeof window !== 'undefined') {
        window.history.pushState(
          {},
          '',
          `/novel/${novel?.slug || chapter.novelId}/chapter/${chapter.slug || chapter.chapterNumber}`
        );
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleReadFirstChapter = (novelId: string) => {
    const novelChapters = storageService.getChapters(novelId);
    if (novelChapters.length > 0) {
      handleSelectChapter(novelChapters[0].id);
    } else {
      handleSelectNovel(novelId);
    }
  };

  const handleOpenLegalPage = (page: 'terms' | 'privacy' | 'dmca' | 'licenses' | 'contact' | 'ads_txt') => {
    setLegalPage(page);
    setCurrentView('legal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToAuthorBio = () => {
    if (currentView !== 'catalog') {
      setCurrentView('catalog');
    }
    setTimeout(() => {
      const el = document.getElementById('author-bio-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Dynamic category list for filter pills
  const filterPills = useMemo(() => {
    const currentCats = storageService.getCategories();
    return [
      { key: 'All', label: 'جميع التصنيفات' },
      ...currentCats.map(c => ({ key: c.name, label: c.arabicName }))
    ];
  }, [categories]);

  // Filtered & Sorted Books for Catalog
  const filteredNovels = useMemo(() => {
    return novels
      .filter(novel => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = novel.title.toLowerCase().includes(q);
          const matchesAuthor = novel.author.toLowerCase().includes(q);
          const matchesGenre = novel.genres.some(g => g.toLowerCase().includes(q));
          const matchesTags = novel.tags.some(t => t.toLowerCase().includes(q));
          const matchesSynopsis = novel.synopsis.toLowerCase().includes(q);
          if (!matchesTitle && !matchesAuthor && !matchesGenre && !matchesTags && !matchesSynopsis) {
            return false;
          }
        }
        // Category filter
        if (selectedGenre !== 'All') {
          const cat = categories.find(c => c.name === selectedGenre);
          const match = novel.genres.includes(selectedGenre as any) || (cat && novel.genres.includes(cat.arabicName as any));
          if (!match) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') return b.totalViews - a.totalViews;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'latest') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        return 0;
      });
  }, [novels, searchQuery, selectedGenre, sortBy, categories]);

  // Featured Hero Book
  const featuredNovel = novels.find(n => n.isFeatured) || novels[0];

  // Active novel & chapter objects
  const currentNovel = novels.find(n => n.id === selectedNovelId) || novels[0];
  const currentChapter = chapters.find(c => c.id === selectedChapterId);
  const currentNovelChapters = chapters.filter(c => c.novelId === selectedNovelId);

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#2C2C2C] flex flex-col selection:bg-[#4A5D4E]/20 selection:text-[#2C2C2C] pb-16 md:pb-0">
      {/* PWA Mobile Installation Prompt Banner */}
      {showPwaBanner && (
        <div className="bg-[#4A5D4E] text-[#FDFCF8] text-xs font-cairo px-4 py-2 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 max-w-2xl">
            <Smartphone className="w-4 h-4 shrink-0 text-amber-200" />
            <span>
              <strong>تطبيق {siteBranding.siteName} متاح الآن:</strong> يمكنك تثبيت المنصة كتطبيق خفيف وسريع على شاشة هاتفك الرئيسية.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleInstallPwa}
              className="px-3 py-1 bg-white text-[#4A5D4E] font-bold rounded-lg hover:bg-amber-50 transition-colors text-[11px] cursor-pointer shadow-xs whitespace-nowrap"
            >
              تثبيت على الهاتف
            </button>
            <button
              type="button"
              onClick={() => setShowPwaBanner(false)}
              className="p-1 hover:bg-[#3C4C3F] rounded text-white/80"
              title="إغلاق الإشعار"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNavigateHome={handleNavigateHome}
        onOpenControlPanel={handleOpenControlPanel}
        onOpenBookmarks={() => setShowBookmarksDrawer(true)}
        bookmarkCount={bookmarks.length}
        isControlPanelOpen={currentView === 'control_panel'}
        isAdminLoggedIn={isAdminLoggedIn && storageService.isAdminLoggedIn()}
        onOpenAdminLoginModal={() => setShowAdminLoginModal(true)}
        onInstallPwa={handleInstallPwa}
        canInstallPwa={canInstallPwa}
        siteBranding={siteBranding}
        onOpenDonationModal={() => setShowDonationModal(true)}
        onScrollToAuthor={handleScrollToAuthorBio}
      />

      {/* Admin Login Dialog Modal */}
      <AdminLoginModal
        isOpen={showAdminLoginModal}
        onClose={() => setShowAdminLoginModal(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Support / Donation Dialog Modal */}
      <DonationModal
        isOpen={showDonationModal}
        onClose={() => setShowDonationModal(false)}
        donationSettings={donationSettings}
      />

      {/* VIEW ROUTER */}
      <div className="flex-1">
        {/* 1. READER VIEW (Full screen reading experience) */}
        {currentView === 'reader' && currentNovel && currentChapter && (
          <ChapterReader
            novel={currentNovel}
            chapter={currentChapter}
            allChapters={currentNovelChapters}
            onSelectChapter={handleSelectChapter}
            onBackToNovel={() => {
              refreshData();
              setCurrentView('novel_detail');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            adSettings={adSettings}
            readerSettings={readerSettings}
            onUpdateReaderSettings={handleUpdateReaderSettings}
          />
        )}

        {/* 2. NOVEL / BOOK DETAIL VIEW */}
        {currentView === 'novel_detail' && currentNovel && (
          <NovelDetailView
            novel={currentNovel}
            chapters={currentNovelChapters}
            onSelectChapter={handleSelectChapter}
            onBack={handleNavigateHome}
            onRefreshNovelData={refreshData}
            adSettings={adSettings}
          />
        )}

        {/* 3. AUTHOR & ADMIN CONTROL PANEL (Strictly Protected) */}
        {currentView === 'control_panel' && (
          isAdminLoggedIn && storageService.isAdminLoggedIn() ? (
            <ControlPanel
              novels={novels}
              chapters={chapters}
              comments={comments}
              adSettings={adSettings}
              onRefreshData={refreshData}
              onExitControlPanel={handleNavigateHome}
              onAdminLogout={handleAdminLogout}
              onOpenLegalPage={handleOpenLegalPage}
            />
          ) : (
            <div className="max-w-md mx-auto px-4 py-20 text-center font-cairo">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mb-4 shadow-sm">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="font-amiri font-bold text-2xl text-[#2C2C2C] mb-2">
                منطقة محمية - تسجيل دخول الإدارة مطلوب
              </h2>
              <p className="text-xs text-[#6E6A64] mb-6 leading-relaxed">
                لوحة التحكم الإدارية مخصصة للكاتب والناشر فقط لإدارة الأعمال الأدبية والفصول وإعدادات الموقع.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  id="protected-admin-login-btn"
                  onClick={() => setShowAdminLoginModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#4A5D4E] hover:bg-[#3C4C3F] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  تسجيل الدخول كمدير
                </button>
                <button
                  type="button"
                  onClick={handleNavigateHome}
                  className="px-4 py-2.5 rounded-xl border border-[#E5E2D9] text-[#2C2C2C] font-semibold text-xs hover:bg-[#F7F5EE] transition-all cursor-pointer"
                >
                  العودة للرئيسية
                </button>
              </div>
            </div>
          )
        )}

        {/* 4. LEGAL & COMPLIANCE PAGES */}
        {currentView === 'legal' && (
          <LegalPages page={legalPage} onBack={handleNavigateHome} />
        )}

        {/* 5. MAIN BROWSE / CATALOG VIEW */}
        {currentView === 'catalog' && (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
            {/* Top Leaderboard Ad */}
            <AdSlot location="header" adSettings={adSettings} className="mb-8" />

            {/* Author Profile & Biography Hero Section */}
            {!searchQuery && selectedGenre === 'All' && (
              <AuthorProfileSection
                authorProfile={authorProfile}
                novels={novels}
                donationSettings={donationSettings}
                onOpenDonationModal={() => setShowDonationModal(true)}
                onOpenContactPage={() => handleOpenLegalPage('contact')}
              />
            )}

            {/* Featured Book Hero Spotlight (if not searching) */}
            {!searchQuery && selectedGenre === 'All' && featuredNovel && (
              <section className="relative rounded-3xl overflow-hidden border border-[#E5E2D9] bg-[#F7F5EE] shadow-xs mb-12">
                <div className="absolute inset-0 z-0">
                  <img
                    src={featuredNovel.bannerImage || featuredNovel.coverImage}
                    alt={featuredNovel.title}
                    className="w-full h-full object-cover opacity-10 blur-sm scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-[#F7F5EE] via-[#F7F5EE]/90 to-transparent" />
                </div>

                <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row items-center gap-8">
                  <img
                    src={featuredNovel.coverImage}
                    alt={featuredNovel.title}
                    onClick={() => handleSelectNovel(featuredNovel.id)}
                    className="w-40 sm:w-52 aspect-[2/3] object-cover rounded-2xl shadow-md border-2 border-[#E5E2D9] hover:scale-102 transition-transform cursor-pointer shrink-0"
                    referrerPolicy="no-referrer"
                  />

                  <div className="flex-1 text-center md:text-right font-cairo">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                      <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-[#4A5D4E] text-[#FDFCF8]">
                        إصدار مميز للكاتب
                      </span>
                      {featuredNovel.genres.map(g => (
                        <span
                          key={g}
                          className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFFFFF] text-[#6E6A64] border border-[#E5E2D9]"
                        >
                          {g}
                        </span>
                      ))}
                    </div>

                    <h2
                      onClick={() => handleSelectNovel(featuredNovel.id)}
                      className="font-amiri font-bold text-2xl sm:text-4xl text-[#2C2C2C] hover:text-[#4A5D4E] transition-colors cursor-pointer mb-2"
                    >
                      {featuredNovel.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-[#4A5D4E] mb-3 font-semibold">
                      بقلم المؤلف: <strong className="text-[#2C2C2C]">{featuredNovel.author}</strong>
                    </p>

                    <p className="text-xs sm:text-sm text-[#6E6A64] leading-relaxed line-clamp-3 mb-6 max-w-2xl">
                      {featuredNovel.synopsis}
                    </p>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                      <button
                        type="button"
                        id="hero-read-first-btn"
                        onClick={() => handleReadFirstChapter(featuredNovel.id)}
                        className="px-6 py-3 bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8] font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>ابدأ قراءة الفصل الأول الآن</span>
                      </button>
                      <button
                        type="button"
                        id="hero-novel-details-btn"
                        onClick={() => handleSelectNovel(featuredNovel.id)}
                        className="px-5 py-3 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] hover:bg-[#F7F5EE] text-[#2C2C2C] text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs"
                      >
                        عرض فهرس الفصول والتفاصيل
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Catalog Filter & Sorting Bar */}
            {novels.length > 0 && (
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 font-cairo">
                {/* Dynamic Category / Genre Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-2 md:pb-0 scrollbar-none">
                  {filterPills.map(genre => (
                    <button
                      key={genre.key}
                      type="button"
                      id={`filter-genre-${genre.key.replace(/\s+/g, '-')}`}
                      onClick={() => setSelectedGenre(genre.key)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                        selectedGenre === genre.key
                          ? 'bg-[#4A5D4E] text-[#FDFCF8] border-[#4A5D4E] shadow-xs'
                          : 'bg-[#FFFFFF] text-[#6E6A64] border-[#E5E2D9] hover:border-[#4A5D4E]/50 hover:text-[#2C2C2C]'
                      }`}
                    >
                      {genre.label}
                    </button>
                  ))}
                </div>

                {/* Sort By Dropdown */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-auto text-xs font-cairo">
                  <span className="text-[#6E6A64] font-bold">ترتيب حسب:</span>
                  <select
                    id="catalog-sort-select"
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#E5E2D9] text-[#2C2C2C] text-xs focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] font-bold cursor-pointer"
                  >
                    <option value="popular">الأكثر قراءة وشعبية</option>
                    <option value="rating">الأعلى تقييماً</option>
                    <option value="latest">أحدث التحديثات</option>
                  </select>
                </div>
              </div>
            )}

            {/* Books & Literature Grid */}
            {novels.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between font-cairo">
                  <h3 className="font-amiri font-bold text-xl text-[#2C2C2C] flex items-center gap-2">
                    <Compass className="w-5 h-5 text-[#4A5D4E]" />
                    <span>
                      {selectedGenre === 'All' ? `مؤلفات وكتب الكاتب ${authorProfile.name}` : `كتب وتصنيف: ${filterPills.find(p => p.key === selectedGenre)?.label || selectedGenre}`}
                    </span>
                    <span className="text-xs text-[#6E6A64] font-normal">
                      ({filteredNovels.length} {filteredNovels.length === 1 ? 'مؤلَف' : 'مؤلفات'})
                    </span>
                  </h3>
                </div>

                {filteredNovels.length === 0 ? (
                  <div className="p-12 text-center rounded-3xl bg-[#F7F5EE] border border-[#E5E2D9] font-cairo max-w-2xl mx-auto space-y-4">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-[#4A5D4E]/10 text-[#4A5D4E] flex items-center justify-center">
                      <BookOpen className="w-7 h-7" />
                    </div>
                    <p className="text-[#6E6A64] text-sm">
                      لم يتم العثور على كتب أو مؤلفات مطابقة لبحثك "{searchQuery}".
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedGenre('All');
                      }}
                      className="px-4 py-2 bg-[#4A5D4E] text-[#FDFCF8] text-xs font-bold rounded-xl cursor-pointer"
                    >
                      إعادة ضبط الفلاتر والبحث
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {filteredNovels.map(novel => {
                      const count = chapters.filter(c => c.novelId === novel.id).length;
                      return (
                        <NovelCard
                          key={novel.id}
                          novel={novel}
                          chapterCount={count}
                          onSelectNovel={handleSelectNovel}
                          onReadFirstChapter={handleReadFirstChapter}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Mid-Catalog Corporate Sponsor / Ad Unit */}
            <AdSlot location="mid_chapter" adSettings={adSettings} className="my-12" />
          </main>
        )}
      </div>

      {/* Bookmarks Slide-over Drawer */}
      {showBookmarksDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden font-cairo">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setShowBookmarksDrawer(false)}
          />
          <div className="fixed inset-y-0 left-0 max-w-full flex">
            <div className="w-screen max-w-md bg-[#FFFFFF] border-r border-[#E5E2D9] shadow-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#E5E2D9] mb-6">
                  <div className="flex items-center gap-2">
                    <BookmarkIcon className="w-5 h-5 text-[#4A5D4E]" />
                    <h3 className="font-amiri font-bold text-xl text-[#2C2C2C]">مكتبتي المحفوظة</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBookmarksDrawer(false)}
                    className="p-1 rounded-lg text-[#8E8A83] hover:text-[#2C2C2C] hover:bg-[#F7F5EE]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {bookmarks.length === 0 ? (
                  <div className="text-center py-12 text-[#8E8A83]">
                    <BookmarkIcon className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#4A5D4E]" />
                    <p className="text-sm font-semibold">لا توجد كتب أو فصول محفوظة حالياً</p>
                    <p className="text-xs mt-1">اضغط على زر "حفظ في مكتبتي" بأي كتاب للوصول السريع إليه هنا.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[calc(100vh-180px)] overflow-y-auto pr-1">
                    {bookmarks.map(b => {
                      const book = novels.find(n => n.id === b.novelId);
                      return (
                        <div
                          key={b.novelId}
                          className="p-3.5 rounded-2xl bg-[#F7F5EE] border border-[#E5E2D9] flex items-center justify-between gap-3 group hover:border-[#4A5D4E]/40 transition-all"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            {book && (
                              <img
                                src={book.coverImage}
                                alt={book.title}
                                className="w-12 h-16 object-cover rounded-lg shrink-0 border border-[#E5E2D9]"
                                referrerPolicy="no-referrer"
                              />
                            )}
                            <div className="min-w-0">
                              <h4
                                onClick={() => {
                                  setShowBookmarksDrawer(false);
                                  handleSelectNovel(b.novelId);
                                }}
                                className="font-amiri font-bold text-base text-[#2C2C2C] truncate hover:text-[#4A5D4E] cursor-pointer"
                              >
                                {book?.title || 'كتاب محفوظ'}
                              </h4>
                              <p className="text-xs text-[#6E6A64] truncate">
                                آخر قراءة: فصل {b.chapterNumber} ({b.chapterTitle})
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setShowBookmarksDrawer(false);
                              handleSelectChapter(b.chapterId);
                            }}
                            className="px-3 py-1.5 bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8] text-xs font-bold rounded-lg cursor-pointer shrink-0"
                          >
                            متابعة
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowBookmarksDrawer(false)}
                className="w-full py-2.5 border border-[#E5E2D9] rounded-xl text-xs font-bold text-[#6E6A64] hover:bg-[#F7F5EE]"
              >
                إغلاق القائمة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Footer with legal links & AdSlot */}
      <Footer
        onOpenLegalPage={handleOpenLegalPage}
        adSettings={adSettings}
        siteBranding={siteBranding}
        onOpenAdminLoginModal={() => setShowAdminLoginModal(true)}
      />

      {/* Mobile Sticky Bottom App Bar (Only when not reading a chapter) */}
      {currentView !== 'reader' && (
        <nav
          id="mobile-bottom-app-bar"
          className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#FDFCF8]/95 backdrop-blur-md border-t border-[#E5E2D9] shadow-lg px-2 py-1 pb-safe"
        >
          <div className="grid grid-cols-5 items-center max-w-md mx-auto text-[10px] font-cairo">
            {/* 1. Home */}
            <button
              type="button"
              id="mobile-nav-home"
              onClick={handleNavigateHome}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer ${
                currentView === 'catalog' && !selectedGenre && !searchQuery
                  ? 'text-[#4A5D4E] font-bold'
                  : 'text-[#6E6A64] hover:text-[#2C2C2C]'
              }`}
            >
              <BookOpen className="w-4 h-4 mb-0.5" />
              <span>الرئيسية</span>
            </button>

            {/* 2. Catalog Books */}
            <button
              type="button"
              id="mobile-nav-catalog"
              onClick={() => {
                if (currentView !== 'catalog') {
                  handleNavigateHome();
                }
                setTimeout(() => {
                  const el = document.getElementById('catalog-books-section');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  }
                }, 100);
              }}
              className="flex flex-col items-center justify-center py-1 rounded-xl text-[#6E6A64] hover:text-[#2C2C2C] transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4 mb-0.5" />
              <span>المكتبة</span>
            </button>

            {/* 3. Bookmarks with live badge */}
            <button
              type="button"
              id="mobile-nav-bookmarks"
              onClick={() => setShowBookmarksDrawer(true)}
              className="relative flex flex-col items-center justify-center py-1 rounded-xl text-[#6E6A64] hover:text-[#2C2C2C] transition-all cursor-pointer"
            >
              <BookmarkIcon className="w-4 h-4 mb-0.5 text-[#4A5D4E]" />
              <span>المحفوظات</span>
              {bookmarks.length > 0 && (
                <span className="absolute top-0.5 right-2 min-w-[15px] h-[15px] px-1 bg-[#C88A3B] text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {bookmarks.length}
                </span>
              )}
            </button>

            {/* 4. Author Bio */}
            <button
              type="button"
              id="mobile-nav-author"
              onClick={handleScrollToAuthorBio}
              className="flex flex-col items-center justify-center py-1 rounded-xl text-[#6E6A64] hover:text-[#2C2C2C] transition-all cursor-pointer"
            >
              <User className="w-4 h-4 mb-0.5" />
              <span>الكاتب</span>
            </button>

            {/* 5. Support / Donation */}
            <button
              type="button"
              id="mobile-nav-support"
              onClick={() => setShowDonationModal(true)}
              className="flex flex-col items-center justify-center py-1 rounded-xl text-rose-600 font-semibold transition-all cursor-pointer"
            >
              <Heart className="w-4 h-4 mb-0.5 fill-rose-600/20" />
              <span>دعم</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
