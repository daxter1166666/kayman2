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
  DonationSettings,
  IntellectualItem
} from './types';
import { storageService } from './services/storageService';
import { supabaseService } from './services/supabaseService';
import { seoService, updateSeo } from './services/seoService';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { NovelCard } from './components/NovelCard';
import { NovelDetailView } from './components/NovelDetailView';
import { ChapterReader } from './components/ChapterReader';
import { ArticleReader } from './components/ArticleReader';
import { SearchKnowledgeEngine } from './components/SearchKnowledgeEngine';
import { ControlPanel } from './components/ControlPanel/ControlPanel';
import { LegalPages } from './components/Legal/LegalPages';
import { AdSlot } from './components/AdSlot';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AuthorProfileSection } from './components/AuthorProfileSection';
import { DonationModal } from './components/DonationModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { applyBrandingToPWA } from './utils/pwaHelper';
import { toArabicGenre } from './utils/genreHelper';
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
  Lock
} from 'lucide-react';

export default function App() {
  // Global Data State
  const [novels, setNovels] = useState<Novel[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<IntellectualItem[]>(() => storageService.getArticles());
  const [adSettings, setAdSettings] = useState<AdSettings>(() => storageService.getAdSettings());
  const [readerSettings, setReaderSettings] = useState<ReaderSettings>(() => storageService.getReaderSettings());
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [authorProfile, setAuthorProfile] = useState<AuthorProfile>(() => storageService.getAuthorProfile());
  const [siteBranding, setSiteBranding] = useState<SiteBranding>(() => storageService.getSiteBranding());
  const [donationSettings, setDonationSettings] = useState<DonationSettings>(() => storageService.getDonationSettings());

  // Navigation View State - default to catalog (home view for all readers)
  const [currentView, setCurrentView] = useState<'catalog' | 'novel_detail' | 'reader' | 'control_panel' | 'legal' | 'article_reader'>('catalog');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => storageService.isAdminLoggedIn());
  const [selectedNovelId, setSelectedNovelId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [legalPage, setLegalPage] = useState<'terms' | 'privacy' | 'dmca' | 'licenses' | 'contact' | 'ads_txt'>('terms');
  
  // Modals & Drawers
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'latest'>('popular');
  const [showBookmarksDrawer, setShowBookmarksDrawer] = useState<boolean>(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);
  const [showDonationModal, setShowDonationModal] = useState<boolean>(false);

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstallPwa, setCanInstallPwa] = useState<boolean>(false);
  const [showPwaBanner, setShowPwaBanner] = useState<boolean>(true);
  const [showPwaInstallModal, setShowPwaInstallModal] = useState<boolean>(false);

  // Load initial data
  const refreshData = () => {
    setNovels(storageService.getNovels());
    setChapters(storageService.getChapters());
    setComments(storageService.getComments());
    setCategories(storageService.getCategories());
    setArticles(storageService.getArticles());
    setAdSettings(storageService.getAdSettings());
    setBookmarks(storageService.getBookmarks());
    setAuthorProfile(storageService.getAuthorProfile());
    setSiteBranding(storageService.getSiteBranding());
    setDonationSettings(storageService.getDonationSettings());
  };

  useEffect(() => {
    refreshData();

    // Cross-browser cloud synchronization with Supabase
    // Fetch latest books, chapters, and tombstones for all readers across phones and browsers
    const doPull = () => {
      supabaseService.pullAllFromSupabase().then(res => {
        if (res) {
          refreshData();
        }
      }).catch(err => {
        console.warn('Supabase pull note:', err);
      });
    };

    doPull();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        doPull();
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key || e.key.startsWith('ayman_')) {
        refreshData();
      }
    };

    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', doPull);
    window.addEventListener('pageshow', doPull);
    window.addEventListener('storage', handleStorageChange);
    const syncInterval = setInterval(doPull, 8000);

    // Check for URL triggers (?admin=true, ?article=xyz, ?novel=xyz)
    const urlParams = new URLSearchParams(window.location.search);
    const isPathAdmin = window.location.pathname === '/admin' || window.location.pathname.endsWith('/admin');
    const isHashAdmin = window.location.hash === '#admin';
    const isQueryAdmin = urlParams.get('admin') === 'true' || urlParams.get('dashboard') === 'true';

    if (isQueryAdmin || isPathAdmin || isHashAdmin) {
      if (storageService.isAdminLoggedIn()) {
        setIsAdminLoggedIn(true);
        setCurrentView('control_panel');
      } else {
        setShowAdminLoginModal(true);
      }
    } else {
      const articleParam = urlParams.get('article');
      if (articleParam) {
        const found = storageService.getArticleById(articleParam) || storageService.getArticleBySlug(articleParam);
        if (found) {
          setSelectedArticleId(found.id);
          setCurrentView('article_reader');
        }
      }
    }

    // Dynamic document title, favicons, Apple touch icons, and Web App Manifest (PWA)
    applyBrandingToPWA(storageService.getSiteBranding());

    // PWA Install prompt listener
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstallPwa(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', doPull);
      window.removeEventListener('pageshow', doPull);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearInterval(syncInterval);
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
        const jsonLd = seoService.buildNovelJsonLd(novel, authorProfile);
        seoService.updateHead({
          title: `رواية ${novel.title} - تأليف ${novel.author}`,
          description: novel.synopsis?.slice(0, 160) || `قراءة وتحميل رواية ${novel.title} للكاتب ${novel.author} أونلاين بصيغة PDF.`,
          keywords: [...(novel.genres || []), ...(novel.tags || []), 'تحميل رواية PDF', 'قراءة رواية'],
          ogType: 'book',
          ogImage: novel.coverImage,
          url: `/?novel=${novel.id}`,
          author: novel.author,
          publishedTime: novel.createdAt,
          modifiedTime: novel.updatedAt,
          section: novel.genres?.[0] || 'روايات',
          tags: novel.tags,
          structuredData: jsonLd,
        });
        return;
      }
    }

    if (currentView === 'reader' && selectedNovelId && selectedChapterId) {
      const novel = novels.find(n => n.id === selectedNovelId);
      const chapter = chapters.find(c => c.id === selectedChapterId);
      if (novel && chapter) {
        const jsonLd = seoService.buildChapterJsonLd(chapter, novel, authorProfile);
        const excerpt = chapter.content?.slice(0, 160).replace(/\n/g, ' ') || '';
        seoService.updateHead({
          title: `${chapter.title} - رواية ${novel.title}`,
          description: `قراءة ${chapter.title} من رواية ${novel.title} للكاتب ${novel.author}. ${excerpt}`,
          keywords: [chapter.title, novel.title, novel.author, ...(novel.genres || [])],
          ogType: 'article',
          ogImage: novel.bannerImage || novel.coverImage,
          url: `/?novel=${novel.id}&chapter=${chapter.id}`,
          author: novel.author,
          publishedTime: chapter.publishedAt,
          section: novel.title,
          structuredData: jsonLd,
        });
        return;
      }
    }

    if (currentView === 'article_reader' && selectedArticleId) {
      const art = articles.find(a => a.id === selectedArticleId);
      if (art) {
        seoService.updateHead({
          title: `${art.title} - ${art.author}`,
          description: art.abstract?.slice(0, 160) || art.content?.slice(0, 160).replace(/\n/g, ' ') || '',
          keywords: [art.title, art.author, art.category, ...(art.tags || []), 'دراسات', 'مقالات مترجمة', 'فلسفة'],
          ogType: 'article',
          ogImage: art.coverImage,
          url: `/?article=${art.id}`,
          author: art.author,
          publishedTime: art.publishedAt,
          section: art.category,
        });
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

  // Re-apply dynamic branding to Web App Manifest, browser tabs, and Apple Touch Icon
  useEffect(() => {
    applyBrandingToPWA(siteBranding);
  }, [siteBranding]);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setCanInstallPwa(false);
          setShowPwaBanner(false);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.warn('Install prompt error:', err);
        setShowPwaInstallModal(true);
      }
    } else {
      setShowPwaInstallModal(true);
    }
  };

  // Update reader settings handler
  const handleUpdateReaderSettings = (newSettings: ReaderSettings) => {
    setReaderSettings(newSettings);
    storageService.saveReaderSettings(newSettings);
  };

  // Admin Control Panel Handlers
  const handleOpenControlPanel = () => {
    if (currentView === 'control_panel') {
      handleNavigateHome();
      return;
    }
    if (storageService.isAdminLoggedIn()) {
      setIsAdminLoggedIn(true);
      setCurrentView('control_panel');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
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
    setSelectedArticleId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectNovel = (novelId: string) => {
    setSelectedNovelId(novelId);
    setCurrentView('novel_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectArticle = (articleId: string) => {
    setSelectedArticleId(articleId);
    setCurrentView('article_reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRandomPick = () => {
    const allItems: Array<{ type: 'article' | 'book'; id: string }> = [
      ...articles.map(a => ({ type: 'article' as const, id: a.id })),
      ...novels.map(n => ({ type: 'book' as const, id: n.id }))
    ];
    if (allItems.length === 0) return;
    const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
    if (randomItem.type === 'article') {
      handleSelectArticle(randomItem.id);
    } else {
      handleSelectNovel(randomItem.id);
    }
  };

  const handleSelectChapter = (firstArg: string, secondArg?: string) => {
    const chapterId = secondArg || firstArg;
    const passedNovelId = secondArg ? firstArg : undefined;
    const chapter = storageService.getChapterById(chapterId);
    if (chapter) {
      setSelectedNovelId(chapter.novelId || passedNovelId || '');
      setSelectedChapterId(chapter.id);
      setCurrentView('reader');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (passedNovelId) {
      const chapters = storageService.getChapters(passedNovelId);
      const targetChap = chapters.find(c => c.id === chapterId) || chapters[0];
      if (targetChap) {
        setSelectedNovelId(passedNovelId);
        setSelectedChapterId(targetChap.id);
        setCurrentView('reader');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
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

  const [showAuthorBioModal, setShowAuthorBioModal] = useState<boolean>(false);

  const handleScrollToAuthorBio = () => {
    setShowAuthorBioModal(true);
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
          const cat = categories.find(c => c.name === selectedGenre || c.arabicName === selectedGenre);
          const match = novel.genres.some(g => {
            return g === selectedGenre ||
                   toArabicGenre(g) === selectedGenre ||
                   (cat && (g === cat.name || g === cat.arabicName || toArabicGenre(g) === cat.arabicName));
          });
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

  // Active novel & chapter & article objects
  const currentNovel = selectedNovelId ? novels.find(n => n.id === selectedNovelId) : (novels[0] || null);
  const currentChapter = chapters.find(c => c.id === selectedChapterId);
  const currentNovelChapters = selectedNovelId ? chapters.filter(c => c.novelId === selectedNovelId) : [];
  const currentArticle = useMemo(() => {
    return articles.find(a => a.id === selectedArticleId) || null;
  }, [articles, selectedArticleId]);

  // Knowledge search engine state and results
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'book' | 'study' | 'article' | 'translated_article' | 'chapter' | 'smart_editors'>('all');
  const [selectedKnowledgeCategory, setSelectedKnowledgeCategory] = useState<string>('all');

  const unifiedSearchResults = useMemo(() => {
    if (selectedTypeFilter === 'smart_editors') return [];
    return storageService.searchUnifiedKnowledge(searchQuery, selectedTypeFilter as any, selectedKnowledgeCategory);
  }, [searchQuery, selectedTypeFilter, selectedKnowledgeCategory, novels, chapters, articles]);

  const knowledgeStats = useMemo(() => {
    return {
      booksCount: novels?.length || 0,
      studiesCount: (articles || []).filter(a => a.type === 'study').length,
      articlesCount: (articles || []).filter(a => a.type === 'article').length,
      translationsCount: (articles || []).filter(a => a.type === 'translated_article').length,
      chaptersCount: chapters?.length || 0,
    };
  }, [novels, articles, chapters]);

  const allKnowledgeCategories = useMemo(() => {
    const cats = new Set<string>();
    (articles || []).forEach(a => {
      if (a.category) cats.add(a.category);
    });
    (novels || []).forEach(n => {
      (n.genres || []).forEach(g => cats.add(toArabicGenre(g)));
    });
    return Array.from(cats);
  }, [articles, novels]);

  // Auto-redirect if currently viewed novel was deleted
  useEffect(() => {
    if (selectedNovelId && !novels.some(n => n.id === selectedNovelId)) {
      setSelectedNovelId(null);
      setSelectedChapterId(null);
      if (currentView === 'reader' || currentView === 'novel_detail') {
        setCurrentView('catalog');
      }
    }
  }, [novels, selectedNovelId, currentView]);

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#2C2C2C] flex flex-col selection:bg-[#4A5D4E]/20 selection:text-[#2C2C2C]">
      {/* PWA Mobile Installation Prompt Banner */}
      {showPwaBanner && currentView !== 'catalog' && (
        <div id="pwa-install-banner" className="bg-[#4A5D4E] text-[#FDFCF8] text-xs font-cairo px-4 py-2 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5 max-w-2xl">
            {(siteBranding.pwaIconUrl || siteBranding.faviconUrl || siteBranding.logoUrl) ? (
              <img
                src={siteBranding.pwaIconUrl || siteBranding.faviconUrl || siteBranding.logoUrl}
                alt="App Icon"
                className="w-5 h-5 rounded-md object-cover shrink-0 border border-white/40 shadow-xs"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Smartphone className="w-4 h-4 shrink-0 text-amber-200" />
            )}
            <span>
              <strong>تطبيق {siteBranding.siteName ? siteBranding.siteName.split('|')[0].trim() : 'أيمن كناني'} متاح الآن:</strong> يمكنك تثبيت المنصة كتطبيق خفيف وسريع على شاشة هاتفك الرئيسية.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="pwa-banner-install-btn"
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
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminLoginModal={() => setShowAdminLoginModal(true)}
        onInstallPwa={handleInstallPwa}
        canInstallPwa={canInstallPwa}
        siteBranding={siteBranding}
        onOpenDonationModal={() => setShowDonationModal(true)}
        onScrollToAuthor={handleScrollToAuthorBio}
        hideSearchBar={currentView === 'catalog'}
        onOpenSmartEditors={() => {
          setSelectedTypeFilter('smart_editors');
          if (currentView !== 'catalog') {
            setCurrentView('catalog');
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
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

      {/* PWA Mobile Installation Guide Modal */}
      <PWAInstallModal
        isOpen={showPwaInstallModal}
        onClose={() => setShowPwaInstallModal(false)}
        onNativeInstall={handleInstallPwa}
        canNativeInstall={Boolean(deferredPrompt)}
        siteBranding={siteBranding}
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

        {/* 3. AUTHOR & ADMIN CONTROL PANEL */}
        {currentView === 'control_panel' && (
          isAdminLoggedIn ? (
            <ControlPanel
              novels={novels}
              chapters={chapters}
              comments={comments}
              adSettings={adSettings}
              onRefreshData={refreshData}
              onExitControlPanel={handleNavigateHome}
              onAdminLogout={handleAdminLogout}
              onOpenLegalPage={handleOpenLegalPage}
              onOpenArticle={handleSelectArticle}
            />
          ) : (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center font-cairo bg-[#FDFCF8]">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mb-4 shadow-xs">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold font-amiri text-[#2C2C2C] mb-2">لوحة التحكم مقفلة</h2>
              <p className="text-sm text-[#6E6A64] max-w-md mb-6 leading-relaxed">
                هذه المنطقة مخصصة لإدارة ونشر المؤلفات من قبل الكاتب فقط. يرجى تسجيل الدخول للوصول إليها.
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  id="lockscreen-login-btn"
                  onClick={() => setShowAdminLoginModal(true)}
                  className="px-6 py-2.5 bg-[#4A5D4E] hover:bg-[#3C4C3F] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all"
                >
                  تسجيل دخول الإدارة
                </button>
                <button
                  type="button"
                  id="lockscreen-home-btn"
                  onClick={handleNavigateHome}
                  className="px-6 py-2.5 border border-[#E5E2D9] text-[#2C2C2C] font-bold text-xs rounded-xl hover:bg-[#F7F5EE] cursor-pointer transition-all"
                >
                  العودة للموقع
                </button>
              </div>
            </div>
          )
        )}

        {/* 4. INTELLECTUAL ARTICLE & STUDY READER VIEW */}
        {currentView === 'article_reader' && currentArticle && (
          <ArticleReader
            article={currentArticle}
            onBack={handleNavigateHome}
            onSelectArticle={handleSelectArticle}
            allArticles={articles}
          />
        )}

        {/* 5. LEGAL & COMPLIANCE PAGES */}
        {currentView === 'legal' && (
          <LegalPages page={legalPage} onBack={handleNavigateHome} />
        )}

        {/* 6. MAIN RESEARCH BROWSER & KNOWLEDGE SEARCH ENGINE VIEW (GOOGLE STYLE) */}
        {currentView === 'catalog' && (
          <main className="w-full">
            <SearchKnowledgeEngine
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedTypeFilter={selectedTypeFilter}
              onTypeFilterChange={setSelectedTypeFilter}
              selectedCategory={selectedKnowledgeCategory}
              onCategoryChange={setSelectedKnowledgeCategory}
              allCategories={allKnowledgeCategories}
              categories={allKnowledgeCategories}
              novels={novels}
              chapters={chapters}
              articles={articles}
              onRefreshData={refreshData}
              searchResults={unifiedSearchResults}
              results={unifiedSearchResults}
              onSelectBook={handleSelectNovel}
              onSelectChapter={handleSelectChapter}
              onSelectArticle={handleSelectArticle}
              onRandomPick={handleRandomPick}
              stats={knowledgeStats}
              onOpenSmartEditor={() => {
                setSelectedTypeFilter('smart_editors');
              }}
            />
          </main>
        )}
      </div>

      {/* Author Bio Modal */}
      {showAuthorBioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-cairo animate-fadeIn">
          <div className="bg-[#FFFFFF] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[#E5E2D9] shadow-2xl p-6 sm:p-8 relative">
            <button
              type="button"
              id="close-author-modal-btn"
              onClick={() => setShowAuthorBioModal(false)}
              className="absolute top-5 left-5 text-[#8E8A83] hover:text-[#2C2C2C] p-2 rounded-xl hover:bg-[#FAF8F5] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <AuthorProfileSection
              authorProfile={authorProfile}
              novels={novels}
              donationSettings={donationSettings}
              onOpenDonationModal={() => {
                setShowAuthorBioModal(false);
                setShowDonationModal(true);
              }}
              onOpenContactPage={() => {
                setShowAuthorBioModal(false);
                handleOpenLegalPage('contact');
              }}
            />
          </div>
        </div>
      )}

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
                                src={book.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop'}
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

      {/* Global Footer with legal links & AdSlot (Only on sub-views; Search has its own minimalist footer) */}
      {currentView !== 'catalog' && (
        <Footer
          onOpenLegalPage={handleOpenLegalPage}
          adSettings={adSettings}
          siteBranding={siteBranding}
          onOpenAdminLoginModal={() => setShowAdminLoginModal(true)}
        />
      )}
    </div>
  );
}
