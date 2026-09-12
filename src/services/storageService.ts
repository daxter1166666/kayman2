import { Novel, Chapter, Comment, AdSettings, ReaderSettings, Bookmark, ReadingHistoryItem, Category, LegalDocuments, ContactMessage, AuthorProfile, SiteBranding, SeoSettings, DonationSettings, SupabaseConfig, ChapterSeoMeta, NovelSeoMeta, TableOfContentItem, IntellectualItem, UnifiedSearchResult, ArticleReaderNote, MarginNote } from '../types';
import { INITIAL_NOVELS, INITIAL_CHAPTERS, INITIAL_COMMENTS, INITIAL_AD_SETTINGS, INITIAL_READER_SETTINGS, INITIAL_CATEGORIES, INITIAL_LEGAL_DOCUMENTS, INITIAL_AUTHOR_PROFILE, INITIAL_SITE_BRANDING, INITIAL_SEO_SETTINGS, INITIAL_DONATION_SETTINGS, INITIAL_SUPABASE_CONFIG, INITIAL_MARGIN_NOTES } from '../data/initialData';
import { INITIAL_INTELLECTUAL_ITEMS, INITIAL_FEATURED_NOVELS_SAMPLE } from '../data/initialIntellectualData';
import { cleanChapterContent, hasHtmlOrStyleResidue } from '../utils/textCleaner';
import { toArabicGenre } from '../utils/genreHelper';

const KEYS = {
  NOVELS: 'ayman_novels_v2',
  CHAPTERS: 'ayman_chapters_v2',
  COMMENTS: 'ayman_comments_v2',
  AD_SETTINGS: 'ayman_ads_v2',
  READER_SETTINGS: 'ayman_reader_settings_v2',
  BOOKMARKS: 'ayman_bookmarks_v2',
  READ_HISTORY: 'ayman_history_v2',
  USER_LIKED_CHAPTERS: 'ayman_user_liked_chapters_v2',
  USER_LIKED_COMMENTS: 'ayman_user_liked_comments_v2',
  USER_RATINGS: 'ayman_user_ratings_v2',
  ADMIN_AUTH: 'ayman_admin_auth_v3',
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
  ARTICLES: 'ayman_intellectual_articles_v1',
  READER_NOTES: 'ayman_article_reader_notes_v1',
};

// Clean legacy mock keys if present in browser storage
try {
  const legacyKeys = [
    'ayman_admin_auth_v2',
    'novelia_novels_v1',
    'novelia_chapters_v1',
    'novelia_comments_v1',
    'novelia_bookmarks_v1',
    'novelia_history_v1',
    'novelia_user_liked_chapters_v1',
    'novelia_user_liked_comments_v1',
    'novelia_user_ratings_v1',
    'novelia_contact_messages_v1',
  ];
  legacyKeys.forEach(k => localStorage.removeItem(k));
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

export const storageService = {
  // --- Novels ---
  getNovels(): Novel[] {
    const raw = getStored<Novel[]>(KEYS.NOVELS, INITIAL_NOVELS);
    const deleted = new Set(this.getDeletedNovelIds());
    const valid = deleted.size === 0 ? raw : raw.filter(n => !deleted.has(n.id));
    if (valid.length === 0 && deleted.size === 0 && INITIAL_FEATURED_NOVELS_SAMPLE.length > 0) {
      const sampleNovels: Novel[] = INITIAL_FEATURED_NOVELS_SAMPLE.map(n => {
        const { chapters, ...rest } = n;
        return rest as unknown as Novel;
      });
      const sampleChapters: Chapter[] = [];
      INITIAL_FEATURED_NOVELS_SAMPLE.forEach(n => {
        n.chapters.forEach(ch => {
          sampleChapters.push({
            id: ch.id,
            novelId: n.id,
            chapterNumber: ch.chapterNumber,
            title: ch.title,
            slug: `chap-${ch.chapterNumber}`,
            content: ch.content,
            publishedAt: n.createdAt,
            views: 450 + ch.chapterNumber * 120,
            likes: 45 + ch.chapterNumber * 10,
            wordCount: ch.content.split(/\s+/).length,
            status: 'PUBLISHED',
          });
        });
      });
      this.saveNovels(sampleNovels);
      this.saveChapters(sampleChapters);
      return sampleNovels;
    }
    return valid;
  },

  saveNovels(novels: Novel[]): void {
    const deleted = new Set(this.getDeletedNovelIds());
    const valid = deleted.size > 0 ? novels.filter(n => !deleted.has(n.id)) : novels;
    setStored(KEYS.NOVELS, valid);
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
    // Mark as deleted FIRST so any concurrent fetch or get immediately filters it out
    this.markNovelDeleted(id);
    const novels = this.getNovels().filter(n => n.id !== id);
    this.saveNovels(novels);
    // Also delete chapters & comments belonging to this novel
    const chapters = this.getChapters().filter(c => c.novelId !== id);
    this.saveChapters(chapters);
    const comments = this.getComments().filter(c => c.novelId !== id);
    this.saveComments(comments);
    // Also clean bookmarks & reading history belonging to this novel
    const bookmarks = this.getBookmarks().filter(b => b.novelId !== id);
    this.saveBookmarks(bookmarks);
    const history = this.getReadingHistory().filter(h => h.novelId !== id);
    this.saveReadingHistory(history);
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
    const rawChapters = getStored<Chapter[]>(KEYS.CHAPTERS, INITIAL_CHAPTERS);
    let mutated = false;
    const chapters = rawChapters.map(c => {
      if (c.content && hasHtmlOrStyleResidue(c.content)) {
        mutated = true;
        const cleaned = cleanChapterContent(c.content);
        const words = cleaned.trim().split(/\s+/).filter(Boolean).length;
        return { ...c, content: cleaned, wordCount: words };
      }
      return c;
    });

    if (mutated) {
      setStored(KEYS.CHAPTERS, chapters);
    }

    const deletedChapters = new Set(this.getDeletedChapterIds());
    const deletedNovels = new Set(this.getDeletedNovelIds());
    const valid = chapters.filter(c => !deletedChapters.has(c.id) && !deletedNovels.has(c.novelId));
    if (novelId) {
      return valid
        .filter(c => c.novelId === novelId)
        .sort((a, b) => a.chapterNumber - b.chapterNumber);
    }
    return valid;
  },

  saveChapters(chapters: Chapter[]): void {
    const deletedChapters = new Set(this.getDeletedChapterIds());
    const deletedNovels = new Set(this.getDeletedNovelIds());
    const sanitized = chapters.map(c => {
      if (c.content && hasHtmlOrStyleResidue(c.content)) {
        const cleaned = cleanChapterContent(c.content);
        const words = cleaned.trim().split(/\s+/).filter(Boolean).length;
        return { ...c, content: cleaned, wordCount: words };
      }
      return c;
    });
    const valid = sanitized.filter(c => !deletedChapters.has(c.id) && !deletedNovels.has(c.novelId));
    setStored(KEYS.CHAPTERS, valid);
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

    const cleanedContent = cleanChapterContent(data.content);
    const words = cleanedContent.trim().split(/\s+/).filter(Boolean).length;
    const newChapter: Chapter = {
      id: `ch-${data.novelId}-${Date.now()}`,
      novelId: data.novelId,
      chapterNumber: nextChapterNumber,
      title: data.title,
      slug: `chapter-${nextChapterNumber}-${data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      content: cleanedContent,
      authorNote: data.authorNote,
      publishedAt: new Date().toISOString(),
      views: 0,
      likes: 0,
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
    
    const sanitizedUpdates = { ...updates };
    if (sanitizedUpdates.content) {
      sanitizedUpdates.content = cleanChapterContent(sanitizedUpdates.content);
      sanitizedUpdates.wordCount = sanitizedUpdates.content.trim().split(/\s+/).filter(Boolean).length;
    }

    chapters[index] = { ...chapters[index], ...sanitizedUpdates };
    this.saveChapters(chapters);
    return chapters[index];
  },

  deleteChapter(id: string): void {
    const chapters = this.getChapters().filter(c => c.id !== id);
    this.saveChapters(chapters);
    this.markChapterDeleted(id);
    const comments = this.getComments().filter(c => c.chapterId !== id);
    this.saveComments(comments);
    const bookmarks = this.getBookmarks().filter(b => b.chapterId !== id);
    this.saveBookmarks(bookmarks);
    const history = this.getReadingHistory().filter(h => h.chapterId !== id);
    this.saveReadingHistory(history);
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

  incrementChapterView(chapterId: string, novelId: string): void {
    const chapters = this.getChapters();
    const chapter = chapters.find(c => c.id === chapterId);
    if (chapter) {
      chapter.views += 1;
      this.saveChapters(chapters);
    }

    const novels = this.getNovels();
    const novel = novels.find(n => n.id === novelId);
    if (novel) {
      novel.totalViews += 1;
      this.saveNovels(novels);
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

  saveBookmarks(bookmarks: Bookmark[]): void {
    setStored(KEYS.BOOKMARKS, bookmarks);
  },

  getReadingHistory(): ReadingHistoryItem[] {
    return getStored<ReadingHistoryItem[]>(KEYS.READ_HISTORY, []);
  },

  saveReadingHistory(history: ReadingHistoryItem[]): void {
    setStored(KEYS.READ_HISTORY, history);
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

  // --- Admin Authentication ---
  getAdminCredentials(): { username: string; passwordHash: string } {
    return getStored<{ username: string; passwordHash: string }>(KEYS.ADMIN_CREDS, {
      username: 'aymankinani',
      passwordHash: 'aymanpassword2026',
    });
  },

  async syncAdminCredentialsFromServer(): Promise<void> {
    try {
      const res = await fetch('/api/admin/credentials');
      if (res.ok) {
        const data = await res.json();
        if (data?.username && data?.passwordHash) {
          setStored(KEYS.ADMIN_CREDS, {
            username: String(data.username).trim(),
            passwordHash: String(data.passwordHash).trim(),
          });
        }
      }
    } catch (e) {
      // Ignore background fetch error
    }
  },

  isAdminLoggedIn(): boolean {
    return getStored<boolean>(KEYS.ADMIN_AUTH, false);
  },

  loginAdmin(usernameInput: string, passwordInput: string): boolean {
    const creds = this.getAdminCredentials();
    const cleanUser = usernameInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    // Match either stored credentials or default aymankinani / admin fallback
    const matchesUser = cleanUser === creds.username.toLowerCase() || cleanUser === 'aymankinani' || cleanUser === 'admin';
    const matchesPass = cleanPass === creds.passwordHash || (cleanPass === 'aymanpassword2026');

    if (matchesUser && matchesPass) {
      setStored(KEYS.ADMIN_AUTH, true);
      return true;
    }
    return false;
  },

  async loginAdminAsync(usernameInput: string, passwordInput: string): Promise<boolean> {
    // 1. Check local storage first
    if (this.loginAdmin(usernameInput, passwordInput)) {
      return true;
    }

    // 2. Check server-side centralized credentials in case changed from another browser/device
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.authorized) {
          setStored(KEYS.ADMIN_CREDS, {
            username: usernameInput.trim(),
            passwordHash: passwordInput.trim(),
          });
          setStored(KEYS.ADMIN_AUTH, true);
          return true;
        }
      }
    } catch (err) {
      console.warn('Server verify note:', err);
    }

    return false;
  },

  setAdminLoggedIn(val: boolean): void {
    setStored(KEYS.ADMIN_AUTH, val);
  },

  logoutAdmin(): void {
    setStored(KEYS.ADMIN_AUTH, false);
  },

  updateAdminCredentials(newUsername: string, newPassword: string): boolean {
    if (!newUsername.trim() || !newPassword.trim()) return false;
    const creds = {
      username: newUsername.trim(),
      passwordHash: newPassword.trim(),
    };
    setStored(KEYS.ADMIN_CREDS, creds);

    // Sync to centralized server so other browsers/devices get updated automatically
    fetch('/api/admin/credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creds),
    }).catch(err => console.warn('Could not sync admin creds to server:', err));

    return true;
  },

  // --- Author Profile Management ---
  getAuthorProfile(): AuthorProfile {
    return getStored<AuthorProfile>(KEYS.AUTHOR_PROFILE, INITIAL_AUTHOR_PROFILE);
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
    return getStored<SeoSettings>(KEYS.SEO_SETTINGS, INITIAL_SEO_SETTINGS);
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
    if (!config || !config.url || !config.anonKey) {
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
    return getStored<LegalDocuments>(KEYS.LEGAL_DOCS, INITIAL_LEGAL_DOCUMENTS);
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

  // --- Intellectual Articles, Studies & Translations ---
  getArticles(): IntellectualItem[] {
    const raw = getStored<IntellectualItem[]>(KEYS.ARTICLES, INITIAL_INTELLECTUAL_ITEMS);
    // Enrich with initial multilingualAbstract and citations if not present in cached items
    const enriched = raw.map(item => {
      const initialMatch = INITIAL_INTELLECTUAL_ITEMS.find(init => init.id === item.id);
      if (initialMatch) {
        return {
          ...item,
          multilingualAbstract: item.multilingualAbstract || initialMatch.multilingualAbstract,
          footnotes: item.footnotes || initialMatch.footnotes,
          references: item.references || initialMatch.references,
          content: (!item.content.includes('[1]') && initialMatch.content.includes('[1]')) ? initialMatch.content : item.content,
        };
      }
      return item;
    });
    return enriched;
  },

  saveArticles(articles: IntellectualItem[]): void {
    setStored(KEYS.ARTICLES, articles);
  },

  getArticleById(id: string): IntellectualItem | undefined {
    return this.getArticles().find(a => a.id === id);
  },

  getArticleBySlug(slug: string): IntellectualItem | undefined {
    return this.getArticles().find(a => a.slug === slug);
  },

  // --- Reader Notes & Marginalia (هوامش وملاحظات القراء التفاعلية) ---
  getAllMarginNotes(): MarginNote[] {
    return getStored<MarginNote[]>(KEYS.READER_NOTES, INITIAL_MARGIN_NOTES);
  },

  saveAllMarginNotes(notes: MarginNote[]): void {
    setStored(KEYS.READER_NOTES, notes);
  },

  getMarginNotes(targetType: 'article' | 'chapter', targetId: string): MarginNote[] {
    const all = this.getAllMarginNotes();
    return all.filter(n => {
      if (n.targetType === targetType && n.targetId === targetId) return true;
      // Backwards compatibility for legacy articleId field
      if (targetType === 'article' && (n as any).articleId === targetId) return true;
      return false;
    });
  },

  addMarginNote(note: Omit<MarginNote, 'id' | 'createdAt' | 'likes'>): MarginNote {
    const all = this.getAllMarginNotes();
    const newNote: MarginNote = {
      ...note,
      id: `margin-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      likes: 0,
      userLiked: false,
    };
    all.unshift(newNote);
    this.saveAllMarginNotes(all);
    return newNote;
  },

  deleteMarginNote(noteId: string): boolean {
    const all = this.getAllMarginNotes();
    const filtered = all.filter(n => n.id !== noteId);
    this.saveAllMarginNotes(filtered);
    return true;
  },

  toggleLikeMarginNote(noteId: string): { liked: boolean; likes: number } {
    const all = this.getAllMarginNotes();
    const note = all.find(n => n.id === noteId);
    if (!note) return { liked: false, likes: 0 };
    const currentLikes = note.likes || 0;
    const currentlyLiked = !!note.userLiked;
    note.userLiked = !currentlyLiked;
    note.likes = currentlyLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;
    this.saveAllMarginNotes(all);
    return { liked: note.userLiked, likes: note.likes };
  },

  getArticleReaderNotes(articleId: string): ArticleReaderNote[] {
    return this.getMarginNotes('article', articleId);
  },

  addArticleReaderNote(note: { articleId: string; selectedText?: string; note: string; authorName?: string; paragraphIndex?: number }): ArticleReaderNote {
    return this.addMarginNote({
      targetType: 'article',
      targetId: note.articleId,
      selectedText: note.selectedText || '',
      paragraphIndex: note.paragraphIndex,
      note: note.note,
      authorName: note.authorName || 'قارئ مهتم',
    });
  },

  deleteArticleReaderNote(noteId: string): boolean {
    return this.deleteMarginNote(noteId);
  },

  addArticleFootnote(articleId: string, text: string): boolean {
    const articles = this.getArticles();
    const item = articles.find(a => a.id === articleId);
    if (!item) return false;
    const currentFootnotes = item.footnotes || [];
    const nextId = currentFootnotes.length > 0 ? Math.max(...currentFootnotes.map(f => f.id)) + 1 : 1;
    item.footnotes = [...currentFootnotes, { id: nextId, text }];
    this.saveArticles(articles);
    return true;
  },

  addArticle(item: Omit<IntellectualItem, 'id' | 'views' | 'likes' | 'publishedAt'>): IntellectualItem {
    const articles = this.getArticles();
    const newArticle: IntellectualItem = {
      ...item,
      id: `intellectual-${Date.now()}`,
      views: 0,
      likes: 0,
      publishedAt: new Date().toISOString().split('T')[0],
    };
    articles.unshift(newArticle);
    this.saveArticles(articles);
    return newArticle;
  },

  updateArticle(id: string, updates: Partial<IntellectualItem>): boolean {
    const articles = this.getArticles();
    const idx = articles.findIndex(a => a.id === id);
    if (idx === -1) return false;
    articles[idx] = { ...articles[idx], ...updates };
    this.saveArticles(articles);
    return true;
  },

  deleteArticle(id: string): boolean {
    const articles = this.getArticles().filter(a => a.id !== id);
    this.saveArticles(articles);
    return true;
  },

  incrementArticleViews(id: string): void {
    const articles = this.getArticles();
    const item = articles.find(a => a.id === id);
    if (item) {
      item.views = (item.views || 0) + 1;
      this.saveArticles(articles);
    }
  },

  toggleArticleLike(id: string): { likes: number; userLiked: boolean } {
    const likedKey = `liked_article_${id}`;
    const alreadyLiked = localStorage.getItem(likedKey) === 'true';
    const articles = this.getArticles();
    const item = articles.find(a => a.id === id);
    if (!item) return { likes: 0, userLiked: false };

    if (alreadyLiked) {
      item.likes = Math.max(0, (item.likes || 0) - 1);
      localStorage.removeItem(likedKey);
    } else {
      item.likes = (item.likes || 0) + 1;
      localStorage.setItem(likedKey, 'true');
    }
    this.saveArticles(articles);
    return { likes: item.likes, userLiked: !alreadyLiked };
  },

  isArticleLiked(id: string): boolean {
    return localStorage.getItem(`liked_article_${id}`) === 'true';
  },

  // --- Unified Knowledge Base Search Engine ---
  searchUnifiedKnowledge(
    query: string,
    typeFilter: 'all' | 'book' | 'study' | 'article' | 'translated_article' | 'chapter' = 'all',
    categoryFilter: string = 'all'
  ): UnifiedSearchResult[] {
    const cleanQ = query.trim().toLowerCase();
    const results: UnifiedSearchResult[] = [];

    const novels = this.getNovels();
    const chapters = this.getChapters();
    const articles = this.getArticles();

    // 1. Books / Novels
    if (typeFilter === 'all' || typeFilter === 'book') {
      novels.forEach(novel => {
        const bookChapters = chapters
          .filter(c => c.novelId === novel.id)
          .sort((a, b) => a.chapterNumber - b.chapterNumber);

        const textMatches = !cleanQ ||
          (novel.title || '').toLowerCase().includes(cleanQ) ||
          (novel.synopsis || '').toLowerCase().includes(cleanQ) ||
          (novel.author || '').toLowerCase().includes(cleanQ) ||
          (novel.genres || []).some(g => (g || '').toLowerCase().includes(cleanQ)) ||
          (novel.tags || []).some(t => (t || '').toLowerCase().includes(cleanQ)) ||
          bookChapters.some(c => (c.title || '').toLowerCase().includes(cleanQ));

        const categoryMatches = categoryFilter === 'all' ||
          (novel.genres || []).some(g => g === categoryFilter || toArabicGenre(g) === categoryFilter);

        if (textMatches && categoryMatches) {
          results.push({
            id: novel.id,
            type: 'book',
            title: novel.title,
            subtitle: `كتاب ومؤلف كامل (${bookChapters.length} فصول)`,
            author: novel.author || 'أيمن كناني',
            category: novel.genres?.[0] ? toArabicGenre(novel.genres[0]) : 'كتب ومؤلفات',
            snippet: novel.synopsis,
            date: novel.updatedAt || novel.createdAt,
            coverImage: novel.coverImage,
            views: novel.totalViews,
            likes: novel.totalLikes,
            chapters: bookChapters.map(c => ({
              id: c.id,
              chapterNumber: c.chapterNumber,
              title: c.title,
              views: c.views
            })),
            pdfDownloadUrl: novel.pdfDownloadUrl,
          });
        }
      });
    }

    // 2. Intellectual Articles, Studies & Translations
    articles.forEach(art => {
      if (typeFilter !== 'all' && typeFilter !== art.type) return;

      const textMatches = !cleanQ ||
        (art.title || '').toLowerCase().includes(cleanQ) ||
        (art.subtitle && art.subtitle.toLowerCase().includes(cleanQ)) ||
        (art.abstract && art.abstract.toLowerCase().includes(cleanQ)) ||
        (art.author || '').toLowerCase().includes(cleanQ) ||
        (art.originalAuthor && art.originalAuthor.toLowerCase().includes(cleanQ)) ||
        (art.translator && art.translator.toLowerCase().includes(cleanQ)) ||
        (art.tags || []).some(t => (t || '').toLowerCase().includes(cleanQ)) ||
        (art.content || '').toLowerCase().includes(cleanQ);

      const categoryMatches = categoryFilter === 'all' || art.category === categoryFilter;

      if (textMatches && categoryMatches) {
        results.push({
          id: art.id,
          type: art.type,
          title: art.title,
          subtitle: art.subtitle,
          author: art.author,
          originalAuthor: art.originalAuthor,
          translator: art.translator,
          category: art.category,
          snippet: art.abstract || (art.content || '').slice(0, 200) + '...',
          date: art.publishedAt,
          coverImage: art.coverImage,
          views: art.views,
          likes: art.likes,
          readingTimeMinutes: art.readingTimeMinutes,
          referencesCount: Array.isArray(art.references) ? art.references.length : 0,
          slug: art.slug,
        });
      }
    });

    // 3. Chapters within Books (if searching specifically for chapters or in 'all' when query is typed)
    if (typeFilter === 'chapter' || (typeFilter === 'all' && cleanQ.length > 0)) {
      chapters.forEach(ch => {
        const parentNovel = novels.find(n => n.id === ch.novelId);
        if (!parentNovel) return;

        const textMatches = !cleanQ ||
          (ch.title || '').toLowerCase().includes(cleanQ) ||
          (ch.content || '').toLowerCase().includes(cleanQ);

        const categoryMatches = categoryFilter === 'all' ||
          (parentNovel.genres || []).some(g => g === categoryFilter || toArabicGenre(g) === categoryFilter);

        if (textMatches && categoryMatches) {
          let snippet = '';
          const lowerContent = ch.content.toLowerCase();
          const matchIdx = cleanQ ? lowerContent.indexOf(cleanQ) : -1;
          if (matchIdx !== -1) {
            const start = Math.max(0, matchIdx - 60);
            const end = Math.min(ch.content.length, matchIdx + cleanQ.length + 90);
            snippet = (start > 0 ? '...' : '') + ch.content.substring(start, end).replace(/\n+/g, ' ') + (end < ch.content.length ? '...' : '');
          } else {
            snippet = ch.content.slice(0, 150).replace(/\n+/g, ' ') + '...';
          }

          results.push({
            id: ch.id,
            type: 'chapter',
            title: `الفصل ${ch.chapterNumber}: ${ch.title}`,
            subtitle: `من كتاب: ${parentNovel.title}`,
            author: parentNovel.author || 'أيمن كناني',
            category: 'فصل في كتاب',
            snippet: snippet,
            date: ch.publishedAt,
            views: ch.views,
            likes: ch.likes,
            novelId: parentNovel.id,
            novelTitle: parentNovel.title,
            chapterNumber: ch.chapterNumber,
            chapterId: ch.id,
            coverImage: parentNovel.coverImage,
          });
        }
      });
    }

    // Sort by relevance / views / date
    return results;
  },

  // Reset to initial demo data
  resetAllData(): void {
    localStorage.removeItem(KEYS.ARTICLES);
    localStorage.removeItem(KEYS.NOVELS);
    localStorage.removeItem(KEYS.CHAPTERS);
    localStorage.removeItem(KEYS.COMMENTS);
    localStorage.removeItem(KEYS.AD_SETTINGS);
    localStorage.removeItem(KEYS.READER_SETTINGS);
    localStorage.removeItem(KEYS.BOOKMARKS);
    localStorage.removeItem(KEYS.READ_HISTORY);
    localStorage.removeItem(KEYS.USER_LIKED_CHAPTERS);
    localStorage.removeItem(KEYS.USER_LIKED_COMMENTS);
    localStorage.removeItem(KEYS.USER_RATINGS);
    localStorage.removeItem(KEYS.ADMIN_AUTH);
    localStorage.removeItem(KEYS.ADMIN_CREDS);
    localStorage.removeItem(KEYS.CATEGORIES);
    localStorage.removeItem(KEYS.LEGAL_DOCS);
    localStorage.removeItem(KEYS.CONTACT_MESSAGES);
    localStorage.removeItem(KEYS.AUTHOR_PROFILE);
    localStorage.removeItem(KEYS.SITE_BRANDING);
    localStorage.removeItem(KEYS.DONATION_SETTINGS);
    localStorage.removeItem(KEYS.SUPABASE_CONFIG);
    localStorage.removeItem(KEYS.DELETED_NOVEL_IDS);
    localStorage.removeItem(KEYS.DELETED_CHAPTER_IDS);
  }
};
