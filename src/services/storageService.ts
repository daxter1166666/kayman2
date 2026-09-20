import { Novel, Chapter, ChapterSeoMeta, Comment, AdSettings, ReaderSettings, Bookmark, ReadingHistoryItem, Category, LegalDocuments, ContactMessage, AuthorProfile, SiteBranding, SeoSettings, DonationSettings, SupabaseConfig, IntellectualItem, MarginNote, AuthorAccount, UserHighlight } from '../types';
import { INITIAL_NOVELS, INITIAL_CHAPTERS, INITIAL_COMMENTS, INITIAL_AD_SETTINGS, INITIAL_READER_SETTINGS, INITIAL_CATEGORIES, INITIAL_LEGAL_DOCUMENTS, INITIAL_AUTHOR_PROFILE, INITIAL_SITE_BRANDING, INITIAL_SEO_SETTINGS, INITIAL_DONATION_SETTINGS, INITIAL_SUPABASE_CONFIG } from '../data/initialData';
import { INITIAL_INTELLECTUAL_ITEMS } from '../data/initialIntellectualData';

const DEFAULT_AUTHOR_ACCOUNTS: AuthorAccount[] = [
  {
    id: 'author-ayman',
    name: 'أيمن كناني',
    penName: 'أيمن كناني',
    email: 'ayman@aymankinani.com',
    specialization: 'روايات ودراسات فكرية وفلسفية',
    bio: 'كاتب وروائي ومفكر عربي مهتم بالفلسفة المعاصرة وفلسفة العقل والأدب الروائي السردي.',
    secretPasscode: 'AK-2026-AUTH',
    role: 'admin',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

const KEYS = {
  NOVELS: 'ayman_novels_v4',
  CHAPTERS: 'ayman_chapters_v4',
  COMMENTS: 'ayman_comments_v2',
  AD_SETTINGS: 'ayman_ads_v2',
  READER_SETTINGS: 'ayman_reader_settings_v2',
  BOOKMARKS: 'ayman_bookmarks_v2',
  READ_HISTORY: 'ayman_history_v2',
  USER_LIKED_CHAPTERS: 'ayman_user_liked_chapters_v2',
  USER_LIKED_COMMENTS: 'ayman_user_liked_comments_v2',
  USER_RATINGS: 'ayman_user_ratings_v2',
  USER_CHAPTER_RATINGS: 'ayman_user_chapter_ratings_v1',
  ADMIN_AUTH: 'ayman_admin_session_v4',
  ADMIN_CREDS: 'ayman_admin_creds_v2',
  CATEGORIES: 'ayman_categories_v2',
  LEGAL_DOCS: 'ayman_legal_docs_v2',
  CONTACT_MESSAGES: 'ayman_contact_messages_v2',
  AUTHOR_PROFILE: 'ayman_author_profile_v1',
  SITE_BRANDING: 'ayman_site_branding_v1',
  SEO_SETTINGS: 'ayman_seo_settings_v1',
  DONATION_SETTINGS: 'ayman_donation_settings_v1',
  SUPABASE_CONFIG: 'ayman_supabase_config_v1',
  DELETED_NOVEL_IDS: 'ayman_deleted_novel_ids_v1',
  DELETED_CHAPTER_IDS: 'ayman_deleted_chapter_ids_v1',
  DELETED_ARTICLE_IDS: 'ayman_deleted_article_ids_v1',
  ARTICLES: 'ayman_articles_v2',
  ARTICLE_LIKES: 'ayman_article_likes_v1',
  ARTICLE_READER_NOTES: 'ayman_article_reader_notes_v1',
  USER_HIGHLIGHTS: 'ayman_user_highlights_v1',
  REGISTERED_AUTHORS: 'ayman_registered_authors_v1',
  ACTIVE_AUTHOR: 'ayman_active_author_v1',
};

// Clean legacy mock keys if present in browser storage across all user devices
try {
  const legacyKeys = [
    'novelia_novels_v1',
    'novelia_chapters_v1',
    'novelia_comments_v1',
    'novelia_bookmarks_v1',
    'novelia_history_v1',
    'novelia_user_liked_chapters_v1',
    'novelia_user_liked_comments_v1',
    'novelia_user_ratings_v1',
    'novelia_contact_messages_v1',
    'ayman_admin_auth_v2',
    'ayman_admin_auth',
    'ayman_novels_v1',
    'ayman_novels_v2',
    'ayman_novels_v3',
    'ayman_chapters_v1',
    'ayman_chapters_v2',
    'ayman_chapters_v3',
  ];
  legacyKeys.forEach(k => {
    try {
      localStorage.removeItem(k);
    } catch {
      // ignore
    }
  });

  // Temporarily reset / flush cached local books and chapters once on session startup
  // to force fresh re-synchronization with Supabase across all browsers & devices
  const sessionFlushKey = 'ayman_startup_synced_session_v6';
  if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
    if (!sessionStorage.getItem(sessionFlushKey)) {
      localStorage.removeItem(KEYS.NOVELS);
      localStorage.removeItem(KEYS.CHAPTERS);
      localStorage.removeItem(KEYS.ARTICLES);
      localStorage.removeItem(KEYS.ARTICLE_LIKES);
      localStorage.removeItem(KEYS.COMMENTS);
      localStorage.removeItem(KEYS.USER_LIKED_CHAPTERS);
      localStorage.setItem(KEYS.ARTICLES, JSON.stringify([]));
      sessionStorage.setItem(sessionFlushKey, 'true');
    }
  }
} catch {
  // Ignore in SSR/sandboxes
}

// Safe localStorage helper
function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.warn(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error writing ${key} to localStorage:`, err);
  }
}

function deduplicateById<T extends { id: string }>(items: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of items) {
    if (item && item.id) {
      map.set(item.id, item);
    }
  }
  return Array.from(map.values());
}

export const storageService = {
  // --- Novels ---
  getNovels(): Novel[] {
    this.purgeNonAkhlaqNovels();
    const raw = getStored<Novel[]>(KEYS.NOVELS, INITIAL_NOVELS);
    const deletedIds = new Set(this.getDeletedNovelIds());
    const isAkhlaqBook = (n: Novel) => {
      if (!n || !n.id) return false;
      if (deletedIds.has(n.id)) return false;
      if (n.id === 'novel-1788556252989') return true;
      if (n.title && n.title.includes('أخلاق الباحث المسلم')) return true;
      if (n.slug && n.slug.includes('أخلاق-الباحث-المسلم')) return true;
      return false;
    };

    const filtered = raw.filter(isAkhlaqBook);

    if (filtered.length === 0) {
      const akhlaq = INITIAL_NOVELS.filter(n => n.id === 'novel-1788556252989' || (n.title && n.title.includes('أخلاق الباحث المسلم')));
      return akhlaq.length > 0 ? akhlaq : INITIAL_NOVELS.slice(0, 1);
    }
    return deduplicateById(filtered);
  },

  saveNovels(novels: Novel[]): void {
    const isUnwantedLegacyNovel = (id: string) => {
      if (['novel-1', 'novel-2', 'novel-3', 'novel-4', 'novel-5', 'novel-6', 'novel-7', 'novel-8', 'novel-9', 'novel-10', 'novel-demo-1', 'novel-demo-2'].includes(id)) return true;
      if (id.startsWith('novel-1') && id !== 'novel-1788556252989' && id.length < 15) return true;
      if (id.startsWith('novel-') && id !== 'novel-1788556252989') return true;
      return false;
    };

    const cleaned = deduplicateById(novels).filter(n => {
      if (!n || !n.id) return false;
      if (isUnwantedLegacyNovel(n.id)) return false;
      return true;
    });
    setStored(KEYS.NOVELS, cleaned);
  },

  /**
   * Purges all locally stored novels and their chapters except for the book 'أخلاق الباحث المسلم'
   * or its dedicated ID ('novel-1788556252989').
   */
  purgeNonAkhlaqNovels(): void {
    try {
      const rawNovels = getStored<Novel[]>(KEYS.NOVELS, INITIAL_NOVELS);
      const isAkhlaqBook = (n: Novel) => {
        if (!n) return false;
        if (n.id === 'novel-1788556252989') return true;
        if (n.title && n.title.includes('أخلاق الباحث المسلم')) return true;
        if (n.slug && n.slug.includes('أخلاق-الباحث-المسلم')) return true;
        return false;
      };

      const keptNovels = rawNovels.filter(isAkhlaqBook);
      const finalNovels = keptNovels.length > 0 ? deduplicateById(keptNovels) : INITIAL_NOVELS;
      setStored(KEYS.NOVELS, finalNovels);

      // Keep only chapters that belong to the preserved Akhlaq book
      const allowedNovelIds = new Set(finalNovels.map(n => n.id));
      const rawChapters = getStored<Chapter[]>(KEYS.CHAPTERS, INITIAL_CHAPTERS);
      const keptChapters = rawChapters.filter(c => c && allowedNovelIds.has(c.novelId));
      const finalChapters = keptChapters.length > 0 ? deduplicateById(keptChapters) : INITIAL_CHAPTERS;
      setStored(KEYS.CHAPTERS, finalChapters);
    } catch (err) {
      console.warn('Error purging non-Akhlaq books:', err);
    }
  },

  getNovelById(id: string): Novel | undefined {
    const novels = this.getNovels();
    return novels.find(n => n.id === id);
  },

  addNovel(novel: Omit<Novel, 'id' | 'createdAt' | 'updatedAt' | 'totalViews' | 'totalLikes' | 'rating' | 'ratingCount'>): Novel {
    const novels = this.getNovels();
    const newNovel: Novel = {
      ...novel,
      id: `novel-${Date.now()}`,
      totalViews: 0,
      totalLikes: 0,
      rating: 5.0,
      ratingCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    novels.unshift(newNovel);
    this.saveNovels(novels);
    this.unmarkNovelDeleted(newNovel.id);
    return newNovel;
  },

  updateNovel(id: string, updates: Partial<Novel>): Novel | undefined {
    const novels = this.getNovels();
    const index = novels.findIndex(n => n.id === id);
    if (index === -1) return undefined;
    novels[index] = { ...novels[index], ...updates, updatedAt: new Date().toISOString() };
    this.saveNovels(novels);
    return novels[index];
  },

  deleteNovel(id: string): void {
    const novels = this.getNovels().filter(n => n.id !== id);
    this.saveNovels(novels);
    // Mark as deleted so pulling from remote doesn't re-add it
    this.markNovelDeleted(id);
    // Also delete chapters & comments belonging to this novel
    const chapters = this.getChapters().filter(c => c.novelId !== id);
    this.saveChapters(chapters);
    const comments = this.getComments().filter(c => c.novelId !== id);
    this.saveComments(comments);
  },

  getDeletedNovelIds(): string[] {
    return getStored<string[]>(KEYS.DELETED_NOVEL_IDS, []);
  },

  markNovelDeleted(id: string): void {
    const deleted = new Set(this.getDeletedNovelIds());
    deleted.add(id);
    setStored(KEYS.DELETED_NOVEL_IDS, Array.from(deleted));
  },

  unmarkNovelDeleted(id: string): void {
    const deleted = new Set(this.getDeletedNovelIds());
    deleted.delete(id);
    setStored(KEYS.DELETED_NOVEL_IDS, Array.from(deleted));
  },

  // --- Chapters ---
  getChapters(novelId?: string): Chapter[] {
    const chapters = getStored<Chapter[]>(KEYS.CHAPTERS, INITIAL_CHAPTERS);
    const deletedChapterIds = new Set(this.getDeletedChapterIds());
    const deletedNovelIds = new Set(this.getDeletedNovelIds());
    const valid = chapters.filter(c => !deletedChapterIds.has(c.id) && !deletedNovelIds.has(c.novelId));
    if (novelId) {
      return valid
        .filter(c => c.novelId === novelId)
        .sort((a, b) => a.chapterNumber - b.chapterNumber);
    }
    return valid;
  },

  saveChapters(chapters: Chapter[]): void {
    setStored(KEYS.CHAPTERS, deduplicateById(chapters));
  },

  getChapterById(id: string): Chapter | undefined {
    const chapters = this.getChapters();
    return chapters.find(c => c.id === id);
  },

  addChapter(data: {
    novelId: string;
    title: string;
    content: string;
    authorNote?: string;
    status?: 'PUBLISHED' | 'DRAFT' | 'SCHEDULED';
    seo?: ChapterSeoMeta;
  }): Chapter {
    const chapters = this.getChapters();
    const novelChapters = chapters.filter(c => c.novelId === data.novelId);
    const nextChapterNumber = novelChapters.length > 0 
      ? Math.max(...novelChapters.map(c => c.chapterNumber)) + 1 
      : 1;

    const plainText = data.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
    const newChapter: Chapter = {
      id: `ch-${data.novelId}-${Date.now()}`,
      novelId: data.novelId,
      chapterNumber: nextChapterNumber,
      title: data.title,
      slug: `chapter-${nextChapterNumber}-${data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      content: data.content,
      authorNote: data.authorNote,
      publishedAt: new Date().toISOString(),
      views: 0,
      likes: 0,
      rating: 5.0,
      ratingCount: 0,
      wordCount: words,
      status: data.status || 'PUBLISHED',
      seo: data.seo,
    };

    chapters.push(newChapter);
    this.saveChapters(chapters);
    this.unmarkChapterDeleted(newChapter.id);

    // Update novel updatedAt
    this.updateNovel(data.novelId, {});
    return newChapter;
  },

  updateChapter(id: string, updates: Partial<Chapter>): Chapter | undefined {
    const chapters = this.getChapters();
    const index = chapters.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    
    if (updates.content) {
      const plainText = updates.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      updates.wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
    }
    chapters[index] = { ...chapters[index], ...updates };
    this.saveChapters(chapters);
    return chapters[index];
  },

  deleteChapter(id: string): void {
    const chapters = this.getChapters().filter(c => c.id !== id);
    this.saveChapters(chapters);
    this.markChapterDeleted(id);
  },

  getDeletedChapterIds(): string[] {
    return getStored<string[]>(KEYS.DELETED_CHAPTER_IDS, []);
  },

  markChapterDeleted(id: string): void {
    const deleted = new Set(this.getDeletedChapterIds());
    deleted.add(id);
    setStored(KEYS.DELETED_CHAPTER_IDS, Array.from(deleted));
  },

  unmarkChapterDeleted(id: string): void {
    const deleted = new Set(this.getDeletedChapterIds());
    deleted.delete(id);
    setStored(KEYS.DELETED_CHAPTER_IDS, Array.from(deleted));
  },

  incrementNovelView(novelId: string): void {
    let updatedNovelViews = 0;
    const novels = this.getNovels();
    const novel = novels.find(n => n.id === novelId);
    if (novel) {
      novel.totalViews = (novel.totalViews || 0) + 1;
      updatedNovelViews = novel.totalViews;
      this.saveNovels(novels);
    }

    if (typeof window !== 'undefined') {
      try {
        fetch('/api/views/increment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ novelId }),
        }).catch(() => {});
      } catch {
        // ignore
      }

      window.dispatchEvent(
        new CustomEvent('novel-view-incremented', {
          detail: {
            novelId,
            novelViews: updatedNovelViews,
          },
        })
      );
    }
  },

  incrementChapterView(chapterId: string, novelId: string): void {
    let updatedNovelViews = 0;
    let updatedChapterViews = 0;

    const chapters = this.getChapters();
    const chapter = chapters.find(c => c.id === chapterId);
    if (chapter) {
      chapter.views = (chapter.views || 0) + 1;
      updatedChapterViews = chapter.views;
      this.saveChapters(chapters);
    }

    const novels = this.getNovels();
    const novel = novels.find(n => n.id === novelId);
    if (novel) {
      novel.totalViews = (novel.totalViews || 0) + 1;
      updatedNovelViews = novel.totalViews;
      this.saveNovels(novels);
    }

    if (typeof window !== 'undefined') {
      try {
        fetch('/api/views/increment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ novelId, chapterId }),
        }).catch(() => {});
      } catch {
        // ignore
      }

      window.dispatchEvent(
        new CustomEvent('novel-view-incremented', {
          detail: {
            novelId,
            chapterId,
            novelViews: updatedNovelViews,
            chapterViews: updatedChapterViews,
          },
        })
      );
    }
  },

  toggleChapterLike(chapterId: string, novelId: string): { liked: boolean; newCount: number } {
    const likedSet = new Set(getStored<string[]>(KEYS.USER_LIKED_CHAPTERS, []));
    const isLiked = likedSet.has(chapterId);

    const chapters = this.getChapters();
    const chapter = chapters.find(c => c.id === chapterId);
    let newCount = chapter ? chapter.likes : 0;

    if (isLiked) {
      likedSet.delete(chapterId);
      if (chapter && chapter.likes > 0) chapter.likes -= 1;
    } else {
      likedSet.add(chapterId);
      if (chapter) chapter.likes += 1;
    }

    newCount = chapter ? chapter.likes : 0;
    setStored(KEYS.USER_LIKED_CHAPTERS, Array.from(likedSet));
    this.saveChapters(chapters);

    // Update novel total likes
    const novelChapters = this.getChapters(novelId);
    const totalNovelLikes = novelChapters.reduce((acc, c) => acc + c.likes, 0);
    this.updateNovel(novelId, { totalLikes: totalNovelLikes });

    return { liked: !isLiked, newCount };
  },

  isChapterLikedByUser(chapterId: string): boolean {
    const likedSet = new Set(getStored<string[]>(KEYS.USER_LIKED_CHAPTERS, []));
    return likedSet.has(chapterId);
  },

  // --- Comments ---
  getComments(chapterId?: string): Comment[] {
    const comments = getStored<Comment[]>(KEYS.COMMENTS, INITIAL_COMMENTS);
    if (chapterId) {
      return comments.filter(c => c.chapterId === chapterId);
    }
    return comments;
  },

  saveComments(comments: Comment[]): void {
    setStored(KEYS.COMMENTS, comments);
  },

  addComment(data: {
    chapterId: string;
    novelId: string;
    authorName: string;
    content: string;
    parentId?: string;
    isAuthor?: boolean;
  }): Comment {
    const comments = this.getComments();
    const newComment: Comment = {
      id: `com-${Date.now()}`,
      chapterId: data.chapterId,
      novelId: data.novelId,
      authorName: data.authorName.trim() || 'Avid Reader',
      authorAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.authorName)}`,
      content: data.content,
      createdAt: new Date().toISOString(),
      likes: 0,
      userLiked: false,
      isAuthor: data.isAuthor || false,
      isPinned: false,
      parentId: data.parentId,
    };
    comments.push(newComment);
    this.saveComments(comments);
    return newComment;
  },

  toggleCommentLike(commentId: string): { liked: boolean; count: number } {
    const likedSet = new Set(getStored<string[]>(KEYS.USER_LIKED_COMMENTS, []));
    const isLiked = likedSet.has(commentId);

    const comments = this.getComments();
    const comment = comments.find(c => c.id === commentId);
    let count = comment ? comment.likes : 0;

    if (isLiked) {
      likedSet.delete(commentId);
      if (comment && comment.likes > 0) comment.likes -= 1;
    } else {
      likedSet.add(commentId);
      if (comment) comment.likes += 1;
    }

    count = comment ? comment.likes : 0;
    setStored(KEYS.USER_LIKED_COMMENTS, Array.from(likedSet));
    this.saveComments(comments);
    return { liked: !isLiked, count };
  },

  deleteComment(commentId: string): void {
    const comments = this.getComments().filter(c => c.id !== commentId && c.parentId !== commentId);
    this.saveComments(comments);
  },

  togglePinComment(commentId: string): void {
    const comments = this.getComments();
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      comment.isPinned = !comment.isPinned;
      this.saveComments(comments);
    }
  },

  // --- Reader Settings ---
  getReaderSettings(): ReaderSettings {
    return getStored<ReaderSettings>(KEYS.READER_SETTINGS, INITIAL_READER_SETTINGS);
  },

  saveReaderSettings(settings: ReaderSettings): void {
    setStored(KEYS.READER_SETTINGS, settings);
  },

  // --- Ads & Sponsors ---
  getAdSettings(): AdSettings {
    return getStored<AdSettings>(KEYS.AD_SETTINGS, INITIAL_AD_SETTINGS);
  },

  saveAdSettings(settings: AdSettings): void {
    setStored(KEYS.AD_SETTINGS, settings);
  },

  recordSponsorImpression(sponsorId: string): void {
    const settings = this.getAdSettings();
    const sponsor = settings.corporateSponsors.find(s => s.id === sponsorId);
    if (sponsor) {
      sponsor.impressions += 1;
      this.saveAdSettings(settings);
    }
  },

  recordSponsorClick(sponsorId: string): void {
    const settings = this.getAdSettings();
    const sponsor = settings.corporateSponsors.find(s => s.id === sponsorId);
    if (sponsor) {
      sponsor.clicks += 1;
      this.saveAdSettings(settings);
    }
  },

  // --- Bookmarks & History ---
  getBookmarks(): Bookmark[] {
    return getStored<Bookmark[]>(KEYS.BOOKMARKS, []);
  },

  toggleBookmark(novelId: string, chapterId: string, chapterNumber: number, chapterTitle: string): boolean {
    const bookmarks = this.getBookmarks();
    const index = bookmarks.findIndex(b => b.novelId === novelId);
    let bookmarked = false;

    if (index !== -1) {
      // If same chapter, remove; if different, update
      if (bookmarks[index].chapterId === chapterId) {
        bookmarks.splice(index, 1);
        bookmarked = false;
      } else {
        bookmarks[index] = {
          novelId,
          chapterId,
          chapterNumber,
          chapterTitle,
          updatedAt: new Date().toISOString(),
        };
        bookmarked = true;
      }
    } else {
      bookmarks.push({
        novelId,
        chapterId,
        chapterNumber,
        chapterTitle,
        updatedAt: new Date().toISOString(),
      });
      bookmarked = true;
    }

    setStored(KEYS.BOOKMARKS, bookmarks);
    return bookmarked;
  },

  isBookmarked(novelId: string, chapterId?: string): boolean {
    const bookmarks = this.getBookmarks();
    const match = bookmarks.find(b => b.novelId === novelId);
    if (!match) return false;
    if (chapterId) return match.chapterId === chapterId;
    return true;
  },

  // --- Star Ratings ---
  getUserRatings(): Record<string, number> {
    return getStored<Record<string, number>>(KEYS.USER_RATINGS, {});
  },

  getUserRatingForNovel(novelId: string): number | null {
    const ratings = this.getUserRatings();
    return ratings[novelId] || null;
  },

  rateNovel(novelId: string, score: number): { rating: number; ratingCount: number; userRating: number } {
    const clampedScore = Math.max(1, Math.min(5, score));
    const userRatings = this.getUserRatings();
    const previousUserRating = userRatings[novelId] || null;

    const novels = this.getNovels();
    const novelIndex = novels.findIndex(n => n.id === novelId);
    
    if (novelIndex === -1) {
      return { rating: 5, ratingCount: 1, userRating: clampedScore };
    }

    const novel = novels[novelIndex];
    let newRating = novel.rating;
    let newRatingCount = novel.ratingCount;

    if (previousUserRating !== null) {
      // User changed their previous rating
      const totalPoints = (novel.rating * novel.ratingCount) - previousUserRating + clampedScore;
      newRating = Number((totalPoints / novel.ratingCount).toFixed(1));
    } else {
      // New rating from user
      const totalPoints = (novel.rating * novel.ratingCount) + clampedScore;
      newRatingCount = novel.ratingCount + 1;
      newRating = Number((totalPoints / newRatingCount).toFixed(1));
    }

    // Save user rating
    userRatings[novelId] = clampedScore;
    setStored(KEYS.USER_RATINGS, userRatings);

    // Save updated novel
    novels[novelIndex] = {
      ...novel,
      rating: newRating,
      ratingCount: newRatingCount,
      updatedAt: new Date().toISOString(),
    };
    this.saveNovels(novels);

    return { rating: newRating, ratingCount: newRatingCount, userRating: clampedScore };
  },

  // --- Chapter Star Ratings ---
  getUserChapterRatings(): Record<string, number> {
    return getStored<Record<string, number>>(KEYS.USER_CHAPTER_RATINGS, {});
  },

  getUserRatingForChapter(chapterId: string): number | null {
    const ratings = this.getUserChapterRatings();
    return ratings[chapterId] || null;
  },

  rateChapter(chapterId: string, score: number): { rating: number; ratingCount: number; userRating: number } {
    const clampedScore = Math.max(1, Math.min(5, score));
    const userRatings = this.getUserChapterRatings();
    const previousUserRating = userRatings[chapterId] || null;

    const chapters = this.getChapters();
    const chapterIndex = chapters.findIndex(c => c.id === chapterId);

    if (chapterIndex === -1) {
      return { rating: clampedScore, ratingCount: 1, userRating: clampedScore };
    }

    const chapter = chapters[chapterIndex];
    const currentRating = typeof chapter.rating === 'number' && chapter.rating > 0 ? chapter.rating : 5.0;
    const currentCount = typeof chapter.ratingCount === 'number' ? chapter.ratingCount : 0;

    let newRating = currentRating;
    let newRatingCount = currentCount;

    if (previousUserRating !== null) {
      // User changed their previous rating for this chapter
      const totalPoints = (currentRating * (currentCount || 1)) - previousUserRating + clampedScore;
      newRating = Number((totalPoints / Math.max(1, currentCount)).toFixed(1));
    } else {
      // New rating from user for this chapter
      const totalPoints = currentCount === 0 ? clampedScore : (currentRating * currentCount) + clampedScore;
      newRatingCount = currentCount + 1;
      newRating = Number((totalPoints / newRatingCount).toFixed(1));
    }

    // Save user vote in local storage
    userRatings[chapterId] = clampedScore;
    setStored(KEYS.USER_CHAPTER_RATINGS, userRatings);

    // Save updated chapter
    chapters[chapterIndex] = {
      ...chapter,
      rating: newRating,
      ratingCount: newRatingCount,
    };
    this.saveChapters(chapters);

    return { rating: newRating, ratingCount: newRatingCount, userRating: clampedScore };
  },

  // --- Admin Authentication ---
  getAdminCredentials(): { username: string; passwordHash: string } {
    return getStored<{ username: string; passwordHash: string }>(KEYS.ADMIN_CREDS, {
      username: 'aymankinani',
      passwordHash: 'aymanpassword2026',
    });
  },

  isAdminLoggedIn(): boolean {
    return getStored<boolean>(KEYS.ADMIN_AUTH, false);
  },

  loginAdmin(usernameInput: string, passwordInput: string): boolean {
    const creds = this.getAdminCredentials();
    const cleanUser = usernameInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    // Match either stored credentials or default aymankinani
    const matchesUser = cleanUser === creds.username.toLowerCase() || cleanUser === 'aymankinani';
    const matchesPass = cleanPass === creds.passwordHash || (cleanPass === 'aymanpassword2026');

    if (matchesUser && matchesPass) {
      setStored(KEYS.ADMIN_AUTH, true);
      return true;
    }
    return false;
  },

  logoutAdmin(): void {
    setStored(KEYS.ADMIN_AUTH, false);
  },

  updateAdminCredentials(newUsername: string, newPassword: string): boolean {
    if (!newUsername.trim() || !newPassword.trim()) return false;
    setStored(KEYS.ADMIN_CREDS, {
      username: newUsername.trim(),
      passwordHash: newPassword.trim(),
    });
    return true;
  },

  // --- Author Profile Management ---
  getAuthorProfile(): AuthorProfile {
    const profile = getStored<AuthorProfile>(KEYS.AUTHOR_PROFILE, INITIAL_AUTHOR_PROFILE);
    const resolved = {
      ...INITIAL_AUTHOR_PROFILE,
      ...(profile || {}),
      socialLinks: {
        ...INITIAL_AUTHOR_PROFILE.socialLinks,
        ...(profile?.socialLinks || {}),
      },
    };
    if (resolved.socialLinks.website && resolved.socialLinks.website.includes('aymankinani.com')) {
      resolved.socialLinks.website = resolved.socialLinks.website.replace('aymankinani.com', 'www.aymankinani.org');
    }
    return resolved;
  },

  saveAuthorProfile(profile: Partial<AuthorProfile>): AuthorProfile {
    const current = this.getAuthorProfile();
    const updated = { ...current, ...profile };
    setStored(KEYS.AUTHOR_PROFILE, updated);
    return updated;
  },

  // --- Site Branding Management ---
  getSiteBranding(): SiteBranding {
    return getStored<SiteBranding>(KEYS.SITE_BRANDING, INITIAL_SITE_BRANDING);
  },

  saveSiteBranding(branding: Partial<SiteBranding>): SiteBranding {
    const current = this.getSiteBranding();
    const updated = { ...current, ...branding };
    setStored(KEYS.SITE_BRANDING, updated);
    return updated;
  },

  // --- SEO & Search Engines Settings ---
  getSeoSettings(): SeoSettings {
    const stored = getStored<SeoSettings>(KEYS.SEO_SETTINGS, INITIAL_SEO_SETTINGS);
    const settings = {
      ...INITIAL_SEO_SETTINGS,
      ...(stored || {}),
    };
    if (settings.canonicalBaseUrl && settings.canonicalBaseUrl.includes('aymankinani.com')) {
      settings.canonicalBaseUrl = settings.canonicalBaseUrl.replace('aymankinani.com', 'www.aymankinani.org');
    }
    return settings;
  },

  saveSeoSettings(settings: Partial<SeoSettings>): SeoSettings {
    const current = this.getSeoSettings();
    const updated: SeoSettings = { ...current, ...settings };
    setStored(KEYS.SEO_SETTINGS, updated);
    return updated;
  },

  // --- Donation Settings Management ---
  getDonationSettings(): DonationSettings {
    return getStored<DonationSettings>(KEYS.DONATION_SETTINGS, INITIAL_DONATION_SETTINGS);
  },

  saveDonationSettings(settings: Partial<DonationSettings>): DonationSettings {
    const current = this.getDonationSettings();
    const updated = { ...current, ...settings };
    setStored(KEYS.DONATION_SETTINGS, updated);
    return updated;
  },

  // --- Supabase Integration Config ---
  getSupabaseConfig(): SupabaseConfig {
    const config = getStored<SupabaseConfig>(KEYS.SUPABASE_CONFIG, INITIAL_SUPABASE_CONFIG);
    if (!config || !config.url || !config.anonKey || config.url.includes('kepuolqhropozwfwwwbb')) {
      return INITIAL_SUPABASE_CONFIG;
    }
    return config;
  },

  saveSupabaseConfig(config: Partial<SupabaseConfig>): SupabaseConfig {
    const current = this.getSupabaseConfig();
    const updated = { ...current, ...config };
    setStored(KEYS.SUPABASE_CONFIG, updated);
    return updated;
  },

  // --- Categories Management ---
  getCategories(): Category[] {
    return getStored<Category[]>(KEYS.CATEGORIES, INITIAL_CATEGORIES);
  },

  saveCategories(categories: Category[]): void {
    setStored(KEYS.CATEGORIES, categories);
  },

  addCategory(category: Omit<Category, 'id'>): Category {
    const categories = this.getCategories();
    const newCategory: Category = {
      ...category,
      id: `cat-${Date.now()}`,
    };
    categories.push(newCategory);
    this.saveCategories(categories);
    return newCategory;
  },

  updateCategory(id: string, updates: Partial<Category>): Category | undefined {
    const categories = this.getCategories();
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    categories[index] = { ...categories[index], ...updates };
    this.saveCategories(categories);
    return categories[index];
  },

  deleteCategory(id: string): void {
    const categories = this.getCategories().filter(c => c.id !== id);
    this.saveCategories(categories);
  },

  // --- Legal Documents & Publisher Information ---
  getLegalDocuments(): LegalDocuments {
    const docs = getStored<LegalDocuments>(KEYS.LEGAL_DOCS, INITIAL_LEGAL_DOCUMENTS);
    let modified = false;

    if (docs.licensesPolicy && docs.licensesPolicy.includes('أضع هذا العمل ابتغاء وجه الله، وأسمح')) {
      docs.licensesPolicy = docs.licensesPolicy.replace(
        'أضع هذا العمل ابتغاء وجه الله، وأسمح',
        'أسمح'
      );
      modified = true;
    }

    const authorRightsStatement = 'بصفتي المؤلف الأصلي لهذا المحتوى، أعرض إعلانات وخيارات دعم لتأمين دخل يعينني على العيش والاستمرار في الكتابة، وهذا حق أصيل لا يتعارض مع الترخيص الممنوح للقراء';
    if (docs.licensesPolicy && !docs.licensesPolicy.includes(authorRightsStatement)) {
      docs.licensesPolicy = `${docs.licensesPolicy}\n\nبيان الترخيص وحق المؤلف:\nهذا العمل مرخّص بموجب CC BY-NC 4.0 لإعادة النشر والاستخدام غير التجاري من قبل الجمهور. بصفتي المؤلف الأصلي لهذا المحتوى، أعرض إعلانات وخيارات دعم لتأمين دخل يعينني على العيش والاستمرار في الكتابة، وهذا حق أصيل لا يتعارض مع الترخيص الممنوح للقراء.`;
      modified = true;
    }

    if (modified) {
      setStored(KEYS.LEGAL_DOCS, docs);
    }
    return docs;
  },

  saveLegalDocuments(docs: Partial<LegalDocuments>): LegalDocuments {
    const current = this.getLegalDocuments();
    const updated: LegalDocuments = {
      ...current,
      ...docs,
      lastUpdated: new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }),
    };
    setStored(KEYS.LEGAL_DOCS, updated);
    return updated;
  },

  // --- Contact Messages ---
  getContactMessages(): ContactMessage[] {
    return getStored<ContactMessage[]>(KEYS.CONTACT_MESSAGES, []);
  },

  saveContactMessages(messages: ContactMessage[]): void {
    setStored(KEYS.CONTACT_MESSAGES, messages);
  },

  sendContactMessage(name: string, email: string, message: string, subject?: string): ContactMessage {
    const messages = this.getContactMessages();
    const newMsg: ContactMessage = {
      id: `msg-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      subject: subject?.trim() || 'رسالة جديدة من القارئ',
      message: message.trim(),
      createdAt: new Date().toISOString(),
      read: false,
    };
    messages.unshift(newMsg);
    this.saveContactMessages(messages);
    return newMsg;
  },

  markContactMessageRead(id: string, read: boolean = true): void {
    const messages = this.getContactMessages();
    const msg = messages.find(m => m.id === id);
    if (msg) {
      msg.read = read;
      this.saveContactMessages(messages);
    }
  },

  deleteContactMessage(id: string): void {
    const messages = this.getContactMessages().filter(m => m.id !== id);
    this.saveContactMessages(messages);
  },

  // --- Articles / Studies ---
  getDeletedArticleIds(): string[] {
    return getStored<string[]>(KEYS.DELETED_ARTICLE_IDS, []);
  },

  markArticleDeleted(id: string): void {
    const deleted = new Set(this.getDeletedArticleIds());
    deleted.add(id);
    setStored(KEYS.DELETED_ARTICLE_IDS, Array.from(deleted));
  },

  unmarkArticleDeleted(id: string): void {
    const deleted = new Set(this.getDeletedArticleIds());
    deleted.delete(id);
    setStored(KEYS.DELETED_ARTICLE_IDS, Array.from(deleted));
  },

  getArticles(): IntellectualItem[] {
    const deletedIds = new Set(this.getDeletedArticleIds());
    const rawStored = typeof window !== 'undefined' ? localStorage.getItem(KEYS.ARTICLES) : null;
    let stored: IntellectualItem[];

    if (rawStored === null) {
      // Empty by default as requested (no dummy/mock articles)
      stored = [];
      setStored(KEYS.ARTICLES, stored);
      return stored;
    } else {
      try {
        const parsed = JSON.parse(rawStored);
        stored = Array.isArray(parsed) ? parsed : [];
      } catch {
        stored = [];
      }
    }

    const cleanStored = stored.filter(a => a && a.id && !deletedIds.has(a.id) && !a.id.startsWith('study-') && !a.id.startsWith('article-demo'));
    if (cleanStored.length !== stored.length) {
      setStored(KEYS.ARTICLES, cleanStored);
    }
    return cleanStored;
  },

  saveArticles(articles: IntellectualItem[]): void {
    const deletedIds = new Set(this.getDeletedArticleIds());
    const cleaned = deduplicateById(articles).filter(a => a && a.id && !deletedIds.has(a.id) && a.type !== 'translated_article' && !a.id.startsWith('trans-'));
    setStored(KEYS.ARTICLES, cleaned);
  },

  getArticleById(id: string): IntellectualItem | undefined {
    const articles = this.getArticles();
    return articles.find(a => a.id === id || a.slug === id);
  },

  addArticle(article: Omit<IntellectualItem, 'id' | 'views' | 'likes' | 'publishedAt'> & { publishedAt?: string }): IntellectualItem {
    const articles = this.getArticles();
    const newArticle: IntellectualItem = {
      ...article,
      id: `article-${Date.now()}`,
      views: 0,
      likes: 0,
      publishedAt: article.publishedAt || new Date().toISOString().slice(0, 10),
    };
    this.unmarkArticleDeleted(newArticle.id);
    articles.unshift(newArticle);
    this.saveArticles(articles);
    return newArticle;
  },

  updateArticle(id: string, updates: Partial<IntellectualItem>): IntellectualItem | undefined {
    const articles = this.getArticles();
    const idx = articles.findIndex(a => a.id === id);
    if (idx === -1) return undefined;
    articles[idx] = { ...articles[idx], ...updates };
    this.saveArticles(articles);
    return articles[idx];
  },

  deleteArticle(id: string): void {
    this.markArticleDeleted(id);
    const articles = this.getArticles().filter(a => a.id !== id);
    this.saveArticles(articles);
    this.deleteArticleReaderNotesForArticle(id);
  },

  incrementArticleViews(id: string): void {
    const articles = this.getArticles();
    const article = articles.find(a => a.id === id);
    if (article) {
      article.views = (article.views || 0) + 1;
      this.saveArticles(articles);
    }
  },

  isArticleLiked(id: string): boolean {
    const liked = getStored<string[]>(KEYS.ARTICLE_LIKES, []);
    return liked.includes(id);
  },

  toggleArticleLike(id: string): { liked: boolean; newCount: number; likes: number; userLiked: boolean } {
    const likedList = getStored<string[]>(KEYS.ARTICLE_LIKES, []);
    const isCurrentlyLiked = likedList.includes(id);
    let newLikedList: string[];
    let delta = 0;

    if (isCurrentlyLiked) {
      newLikedList = likedList.filter(item => item !== id);
      delta = -1;
    } else {
      newLikedList = [...likedList, id];
      delta = 1;
    }
    setStored(KEYS.ARTICLE_LIKES, newLikedList);

    const articles = this.getArticles();
    const article = articles.find(a => a.id === id);
    let newCount = 0;
    if (article) {
      article.likes = Math.max(0, (article.likes || 0) + delta);
      newCount = article.likes;
      this.saveArticles(articles);
    }

    const liked = !isCurrentlyLiked;
    return { liked, newCount, likes: newCount, userLiked: liked };
  },

  addArticleFootnote(articleId: string, text: string): boolean {
    const articles = this.getArticles();
    const article = articles.find(a => a.id === articleId);
    if (!article) return false;
    const footnotes = article.footnotes || [];
    const nextId = footnotes.length > 0 ? Math.max(...footnotes.map(f => f.id)) + 1 : 1;
    footnotes.push({ id: nextId, text });
    article.footnotes = footnotes;
    this.saveArticles(articles);
    return true;
  },

  // --- Article Reader Notes & Marginalia ---
  getArticleReaderNotes(articleId: string): MarginNote[] {
    const allNotes = getStored<MarginNote[]>(KEYS.ARTICLE_READER_NOTES, []);
    return allNotes.filter(n => n.targetId === articleId || n.targetType === 'article');
  },

  addArticleReaderNote(
    noteOrArticleId: string | { articleId?: string; targetId?: string; targetType?: string; authorName?: string; note: string; selectedText?: string; noteType?: 'comment' | 'critique' | 'reference' | 'correction'; paragraphIndex?: number },
    maybeNote?: Omit<MarginNote, 'id' | 'createdAt' | 'likes' | 'userLiked'>
  ): MarginNote {
    const allNotes = getStored<MarginNote[]>(KEYS.ARTICLE_READER_NOTES, []);
    let newNote: MarginNote;
    if (typeof noteOrArticleId === 'string' && maybeNote) {
      newNote = {
        ...maybeNote,
        id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        targetId: noteOrArticleId,
        targetType: 'article',
        createdAt: new Date().toISOString(),
        likes: 0,
        userLiked: false,
      };
    } else {
      const obj = noteOrArticleId as any;
      newNote = {
        id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        targetId: obj.targetId || obj.articleId || '',
        targetType: obj.targetType || 'article',
        paragraphIndex: obj.paragraphIndex,
        selectedText: obj.selectedText || '',
        authorName: obj.authorName || 'قارئ وباحث',
        note: obj.note || '',
        noteType: obj.noteType || 'comment',
        createdAt: new Date().toISOString(),
        likes: 0,
        userLiked: false,
      };
    }
    allNotes.unshift(newNote);
    setStored(KEYS.ARTICLE_READER_NOTES, allNotes);
    return newNote;
  },

  addMarginNote(note: {
    targetType?: string;
    targetId?: string;
    selectedText?: string;
    paragraphIndex?: number;
    note: string;
    authorName?: string;
    noteType?: 'comment' | 'critique' | 'reference' | 'correction';
  }): MarginNote {
    return this.addArticleReaderNote(note as any);
  },

  deleteArticleReaderNote(noteId: string): void {
    const allNotes = getStored<MarginNote[]>(KEYS.ARTICLE_READER_NOTES, []);
    const filtered = allNotes.filter(n => n.id !== noteId);
    setStored(KEYS.ARTICLE_READER_NOTES, filtered);
  },

  deleteArticleReaderNotesForArticle(articleId: string): void {
    const allNotes = getStored<MarginNote[]>(KEYS.ARTICLE_READER_NOTES, []);
    const filtered = allNotes.filter(n => n.targetId !== articleId);
    setStored(KEYS.ARTICLE_READER_NOTES, filtered);
  },

  deleteMarginNote(noteId: string): void {
    this.deleteArticleReaderNote(noteId);
  },

  toggleArticleNoteLike(noteId: string): { liked: boolean; count: number } {
    const allNotes = getStored<MarginNote[]>(KEYS.ARTICLE_READER_NOTES, []);
    const note = allNotes.find(n => n.id === noteId);
    if (!note) return { liked: false, count: 0 };
    note.userLiked = !note.userLiked;
    note.likes = Math.max(0, (note.likes || 0) + (note.userLiked ? 1 : -1));
    setStored(KEYS.ARTICLE_READER_NOTES, allNotes);
    return { liked: Boolean(note.userLiked), count: note.likes };
  },

  toggleLikeMarginNote(noteId: string): { liked: boolean; count: number; likes: number } {
    const res = this.toggleArticleNoteLike(noteId);
    return { liked: res.liked, count: res.count, likes: res.count };
  },

  // --- User Highlights & Quotations ---
  getUserHighlights(): UserHighlight[] {
    return getStored<UserHighlight[]>(KEYS.USER_HIGHLIGHTS, []);
  },

  addUserHighlight(highlight: Omit<UserHighlight, 'id' | 'createdAt'>): UserHighlight {
    const highlights = this.getUserHighlights();
    const newHighlight: UserHighlight = {
      ...highlight,
      id: `hl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    highlights.unshift(newHighlight);
    setStored(KEYS.USER_HIGHLIGHTS, highlights);
    return newHighlight;
  },

  deleteUserHighlight(id: string): void {
    const highlights = this.getUserHighlights().filter(h => h.id !== id);
    setStored(KEYS.USER_HIGHLIGHTS, highlights);
  },

  clearUserHighlights(): void {
    setStored(KEYS.USER_HIGHLIGHTS, []);
  },

  // --- Author Portal & Accounts ---
  getRegisteredAuthors(): AuthorAccount[] {
    return getStored<AuthorAccount[]>(KEYS.REGISTERED_AUTHORS, DEFAULT_AUTHOR_ACCOUNTS);
  },

  getActiveAuthor(): AuthorAccount | null {
    return getStored<AuthorAccount | null>(KEYS.ACTIVE_AUTHOR, DEFAULT_AUTHOR_ACCOUNTS[0]);
  },

  loginAuthorAccount(identifier: string, passcode: string): AuthorAccount | null {
    const authors = this.getRegisteredAuthors();
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = passcode.trim().toUpperCase();

    const author = authors.find(
      a =>
        (a.name.toLowerCase() === cleanId || a.email.toLowerCase() === cleanId || (a.penName && a.penName.toLowerCase() === cleanId)) &&
        a.secretPasscode.toUpperCase() === cleanPass
    );

    if (author) {
      setStored(KEYS.ACTIVE_AUTHOR, author);
      return author;
    }
    return null;
  },

  registerAuthor(data: Omit<AuthorAccount, 'id' | 'createdAt'>): AuthorAccount {
    const authors = this.getRegisteredAuthors();
    const newAuthor: AuthorAccount = {
      ...data,
      id: `author-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    authors.push(newAuthor);
    setStored(KEYS.REGISTERED_AUTHORS, authors);
    setStored(KEYS.ACTIVE_AUTHOR, newAuthor);
    return newAuthor;
  },

  logoutAuthor(): void {
    localStorage.removeItem(KEYS.ACTIVE_AUTHOR);
  },

  getAuthorSecretAuth(): { authorName: string; secretPasscode: string; email?: string } {
    const active = this.getActiveAuthor();
    if (active) {
      return {
        authorName: active.name,
        secretPasscode: active.secretPasscode,
        email: active.email,
      };
    }
    return {
      authorName: 'أيمن كناني',
      secretPasscode: 'AK-2026-AUTH',
      email: 'ayman@aymankinani.com',
    };
  },

  /**
   * Clears local storage data caches (novels, chapters, comments, reading state, etc.)
   * while safely preserving essential admin credentials and Supabase connectivity keys.
   * Ensures novels and chapters are set to empty arrays so no duplicate or stale mock data resurfaces.
   */
  clearLocalDataCaches(): void {
    try {
      const adminAuth = localStorage.getItem(KEYS.ADMIN_AUTH);
      const adminCreds = localStorage.getItem(KEYS.ADMIN_CREDS);
      const supabaseConfig = localStorage.getItem(KEYS.SUPABASE_CONFIG);

      const keysToPurge = [
        KEYS.NOVELS,
        KEYS.CHAPTERS,
        KEYS.COMMENTS,
        KEYS.AD_SETTINGS,
        KEYS.READER_SETTINGS,
        KEYS.BOOKMARKS,
        KEYS.READ_HISTORY,
        KEYS.USER_LIKED_CHAPTERS,
        KEYS.USER_LIKED_COMMENTS,
        KEYS.USER_RATINGS,
        KEYS.CATEGORIES,
        KEYS.LEGAL_DOCS,
        KEYS.CONTACT_MESSAGES,
        KEYS.AUTHOR_PROFILE,
        KEYS.SITE_BRANDING,
        KEYS.SEO_SETTINGS,
        KEYS.DONATION_SETTINGS,
        KEYS.ARTICLES,
        KEYS.ARTICLE_LIKES,
        KEYS.ARTICLE_READER_NOTES,
        KEYS.USER_HIGHLIGHTS,
        KEYS.REGISTERED_AUTHORS,
        KEYS.ACTIVE_AUTHOR,
      ];

      keysToPurge.forEach(k => {
        try {
          localStorage.removeItem(k);
        } catch {
          // ignore
        }
      });

      // Explicitly initialize novels and chapters to empty arrays
      localStorage.setItem(KEYS.NOVELS, JSON.stringify([]));
      localStorage.setItem(KEYS.CHAPTERS, JSON.stringify([]));
      localStorage.setItem(KEYS.COMMENTS, JSON.stringify([]));
      localStorage.setItem(KEYS.ARTICLES, JSON.stringify([]));

      // Restore preserved admin credentials and Supabase configurations
      if (adminAuth) localStorage.setItem(KEYS.ADMIN_AUTH, adminAuth);
      if (adminCreds) localStorage.setItem(KEYS.ADMIN_CREDS, adminCreds);
      if (supabaseConfig) localStorage.setItem(KEYS.SUPABASE_CONFIG, supabaseConfig);
    } catch (err) {
      console.warn('Error executing clearLocalDataCaches:', err);
    }
  },

  // Reset to initial demo data
  resetAllData(): void {
    this.clearLocalDataCaches();
    localStorage.removeItem(KEYS.ADMIN_AUTH);
    localStorage.removeItem(KEYS.ADMIN_CREDS);
    localStorage.removeItem(KEYS.SUPABASE_CONFIG);
    localStorage.removeItem(KEYS.DELETED_NOVEL_IDS);
    localStorage.removeItem(KEYS.DELETED_CHAPTER_IDS);
  }
};
