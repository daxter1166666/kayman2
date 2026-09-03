import { Novel, Chapter, Comment, AdSettings, ReaderSettings, Bookmark, ReadingHistoryItem, Category, LegalDocuments, ContactMessage, AuthorProfile, SiteBranding, SeoSettings, DonationSettings, SupabaseConfig } from '../types';
import { INITIAL_NOVELS, INITIAL_CHAPTERS, INITIAL_COMMENTS, INITIAL_AD_SETTINGS, INITIAL_READER_SETTINGS, INITIAL_CATEGORIES, INITIAL_LEGAL_DOCUMENTS, INITIAL_AUTHOR_PROFILE, INITIAL_SITE_BRANDING, INITIAL_SEO_SETTINGS, INITIAL_DONATION_SETTINGS, INITIAL_SUPABASE_CONFIG } from '../data/initialData';

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
  ADMIN_AUTH: 'ayman_admin_auth_v2',
  ADMIN_CREDS: 'ayman_admin_creds_v2',
  CATEGORIES: 'ayman_categories_v2',
  LEGAL_DOCS: 'ayman_legal_docs_v2',
  CONTACT_MESSAGES: 'ayman_contact_messages_v2',
  AUTHOR_PROFILE: 'ayman_author_profile_v1',
  SITE_BRANDING: 'ayman_site_branding_v1',
  SEO_SETTINGS: 'ayman_seo_settings_v1',
  DONATION_SETTINGS: 'ayman_donation_settings_v1',
  SUPABASE_CONFIG: 'ayman_supabase_config_v1',
};

// Clean legacy mock keys if present in browser storage
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
    return getStored<Novel[]>(KEYS.NOVELS, INITIAL_NOVELS);
  },

  saveNovels(novels: Novel[]): void {
    setStored(KEYS.NOVELS, novels);
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
    // Also delete chapters & comments belonging to this novel
    const chapters = this.getChapters().filter(c => c.novelId !== id);
    this.saveChapters(chapters);
    const comments = this.getComments().filter(c => c.novelId !== id);
    this.saveComments(comments);
  },

  // --- Chapters ---
  getChapters(novelId?: string): Chapter[] {
    const chapters = getStored<Chapter[]>(KEYS.CHAPTERS, INITIAL_CHAPTERS);
    if (novelId) {
      return chapters
        .filter(c => c.novelId === novelId)
        .sort((a, b) => a.chapterNumber - b.chapterNumber);
    }
    return chapters;
  },

  saveChapters(chapters: Chapter[]): void {
    setStored(KEYS.CHAPTERS, chapters);
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
  }): Chapter {
    const chapters = this.getChapters();
    const novelChapters = chapters.filter(c => c.novelId === data.novelId);
    const nextChapterNumber = novelChapters.length > 0 
      ? Math.max(...novelChapters.map(c => c.chapterNumber)) + 1 
      : 1;

    const words = data.content.trim().split(/\s+/).filter(Boolean).length;
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
      wordCount: words,
      status: data.status || 'PUBLISHED',
    };

    chapters.push(newChapter);
    this.saveChapters(chapters);

    // Update novel updatedAt
    this.updateNovel(data.novelId, {});
    return newChapter;
  },

  updateChapter(id: string, updates: Partial<Chapter>): Chapter | undefined {
    const chapters = this.getChapters();
    const index = chapters.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    
    if (updates.content) {
      updates.wordCount = updates.content.trim().split(/\s+/).filter(Boolean).length;
    }
    chapters[index] = { ...chapters[index], ...updates };
    this.saveChapters(chapters);
    return chapters[index];
  },

  deleteChapter(id: string): void {
    const chapters = this.getChapters().filter(c => c.id !== id);
    this.saveChapters(chapters);
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
    return getStored<SupabaseConfig>(KEYS.SUPABASE_CONFIG, INITIAL_SUPABASE_CONFIG);
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

  // Reset to initial demo data
  resetAllData(): void {
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
  }
};
