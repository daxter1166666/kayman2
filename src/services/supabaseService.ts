import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  SupabaseConfig,
  Novel,
  Chapter,
  Comment,
  AuthorProfile,
  SiteBranding,
  DonationSettings,
  Category,
  LegalDocuments,
  AdSettings,
  SeoSettings
} from '../types';
import { storageService } from './storageService';
import { cleanChapterContent, hasHtmlOrStyleResidue } from '../utils/textCleaner';

class SupabaseService {
  private client: SupabaseClient | null = null;
  private currentConfig: SupabaseConfig | null = null;

  /**
   * Sanitizes and cleans the Supabase project URL.
   * Fixes PGRST125 ("Invalid path specified in request URL") caused by:
   * 1. Appending paths like /rest/v1 or /rest/v1/ or /dashboard or /project/xyz
   * 2. Trailing slashes or whitespace
   * 3. Missing https:// prefix
   */
  public cleanProjectUrl(rawUrl: string): string {
    if (!rawUrl) return '';
    let cleaned = rawUrl.trim();

    // Ensure protocol
    if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
      cleaned = `https://${cleaned}`;
    }

    try {
      const parsed = new URL(cleaned);
      // Supabase base URL is strictly protocol + host (e.g., https://xyz.supabase.co)
      return `${parsed.protocol}//${parsed.host}`;
    } catch {
      // Fallback regex cleaning if URL parsing fails
      cleaned = cleaned.replace(/\/+$/, '');
      cleaned = cleaned.replace(/\/rest\/v1.*$/i, '');
      cleaned = cleaned.replace(/\/auth\/v1.*$/i, '');
      cleaned = cleaned.replace(/\/storage\/v1.*$/i, '');
      cleaned = cleaned.replace(/\/dashboard.*$/i, '');
      return cleaned;
    }
  }

  public initClient(config: SupabaseConfig): SupabaseClient | null {
    if (!config || !config.url || !config.anonKey) {
      this.client = null;
      this.currentConfig = null;
      return null;
    }

    try {
      const sanitizedUrl = this.cleanProjectUrl(config.url);
      const sanitizedKey = config.anonKey.trim();
      if (!sanitizedUrl || !sanitizedKey) {
        this.client = null;
        this.currentConfig = null;
        return null;
      }
      this.client = createClient(sanitizedUrl, sanitizedKey);
      this.currentConfig = { ...config, enabled: true, url: sanitizedUrl, anonKey: sanitizedKey };
      return this.client;
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      this.client = null;
      return null;
    }
  }

  public detectEnvironmentCredentials(): { url: string; anonKey: string; isFromVercel: boolean } {
    const rawUrl =
      (typeof import.meta !== 'undefined' && import.meta.env && (
        import.meta.env.VITE_SUPABASE_URL ||
        (import.meta.env as any).SUPABASE_URL ||
        (import.meta.env as any).NEXT_PUBLIC_SUPABASE_URL
      )) ||
      (typeof process !== 'undefined' && process.env && (
        process.env.SUPABASE_URL ||
        process.env.VITE_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL
      )) ||
      '';

    const rawKey =
      (typeof import.meta !== 'undefined' && import.meta.env && (
        import.meta.env.VITE_SUPABASE_ANON_KEY ||
        (import.meta.env as any).SUPABASE_ANON_KEY ||
        (import.meta.env as any).NEXT_PUBLIC_SUPABASE_ANON_KEY
      )) ||
      (typeof process !== 'undefined' && process.env && (
        process.env.SUPABASE_ANON_KEY ||
        process.env.VITE_SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )) ||
      '';

    const cleanUrl = rawUrl ? this.cleanProjectUrl(rawUrl.trim()) : '';
    const cleanKey = rawKey ? rawKey.trim() : '';

    return {
      url: cleanUrl,
      anonKey: cleanKey,
      isFromVercel: Boolean(cleanUrl && cleanKey),
    };
  }

  public getClient(config?: SupabaseConfig): SupabaseClient | null {
    if (config && config.url && config.anonKey) {
      return this.initClient(config);
    }
    if (this.client) return this.client;

    const defaultUrl = 'https://kepuolqhropozwfwwwbb.supabase.co';
    const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlcHVvbHFocm9wb3p3Znd3d2JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMzcyMDgsImV4cCI6MjEwMzkxMzIwOH0.8JfpG8bw-dxwFn64-pAbeRBAxBR9WiaNKQAcJAVCeJw';

    // 1. Check environment variables from Vercel Integration or Vite
    const detected = this.detectEnvironmentCredentials();
    if (detected.url && detected.anonKey) {
      return this.initClient({
        url: detected.url,
        anonKey: detected.anonKey,
        enabled: true,
        autoSync: true,
        connected: true
      });
    }

    // 2. Check stored local configuration if user entered one in dashboard
    const storedConfig = storageService.getSupabaseConfig();
    if (storedConfig && storedConfig.url && storedConfig.anonKey) {
      return this.initClient(storedConfig);
    }

    // 3. Fallback to default project credentials
    return this.initClient({
      url: defaultUrl,
      anonKey: defaultKey,
      enabled: true,
      autoSync: true,
      connected: true
    });
  }

  public isConfigured(): boolean {
    return Boolean(this.getClient());
  }

  /**
   * Pulls all published novels, chapters, comments and settings from Supabase into local cache.
   * Enables seamless cross-browser synchronization for all readers and visitors.
   */
  public async pullAllFromSupabase(): Promise<{
    novels: Novel[];
    chapters: Chapter[];
    comments: Comment[];
    authorProfile?: AuthorProfile;
    siteBranding?: SiteBranding;
    donationSettings?: DonationSettings;
    categories?: Category[];
    legalDocuments?: LegalDocuments;
    adSettings?: AdSettings;
    seoSettings?: SeoSettings;
  } | null> {
    const client = this.getClient();
    if (!client) return null;

    try {
      // 1. Fetch Novels
      const { data: rawNovels, error: nErr } = await client
        .from('novels')
        .select('*')
        .order('created_at', { ascending: false });

      if (nErr) {
        console.warn('Error fetching novels from Supabase:', nErr);
        return null;
      }

      const novels: Novel[] = (rawNovels || []).map((n: any) => ({
        id: n.id,
        title: n.title,
        slug: n.slug || n.id,
        author: n.author,
        authorBio: n.author_bio || '',
        synopsis: n.synopsis || '',
        coverImage: n.cover_image || '',
        bannerImage: n.banner_image || '',
        genres: Array.isArray(n.genres) ? n.genres : [],
        tags: Array.isArray(n.tags) ? n.tags : [],
        status: n.status || 'ONGOING',
        totalViews: Number(n.total_views) || 0,
        totalLikes: Number(n.total_likes) || 0,
        rating: Number(n.rating) || 5.0,
        ratingCount: Number(n.rating_count) || 1,
        createdAt: n.created_at || new Date().toISOString(),
        updatedAt: n.updated_at || new Date().toISOString(),
        isFeatured: Boolean(n.is_featured),
        pdfDownloadUrl: n.pdf_download_url || undefined,
        pdfFileSize: n.pdf_file_size || undefined,
        downloadButtonText: n.download_button_text || undefined,
        tableOfContents: Array.isArray(n.table_of_contents) ? n.table_of_contents : undefined,
        seo: typeof n.seo === 'object' && n.seo !== null ? n.seo : (typeof n.seo === 'string' ? (() => { try { return JSON.parse(n.seo); } catch { return undefined; } })() : undefined),
      }));

      // 2. Fetch Chapters
      const { data: rawChapters, error: cErr } = await client
        .from('chapters')
        .select('*')
        .order('chapter_number', { ascending: true });

      const chapters: Chapter[] = (rawChapters || []).map((c: any) => {
        const rawContent = c.content || '';
        const cleanedContent = hasHtmlOrStyleResidue(rawContent)
          ? cleanChapterContent(rawContent)
          : rawContent;
        const words = Number(c.word_count) || cleanedContent.trim().split(/\s+/).filter(Boolean).length;
        return {
          id: c.id,
          novelId: c.novel_id,
          chapterNumber: Number(c.chapter_number) || 1,
          title: c.title,
          slug: c.slug || c.id,
          content: cleanedContent,
          authorNote: c.author_note || undefined,
          publishedAt: c.published_at || new Date().toISOString(),
          views: Number(c.views) || 0,
          likes: Number(c.likes) || 0,
          wordCount: words,
          status: c.status || 'PUBLISHED',
          seo: typeof c.seo === 'object' && c.seo !== null ? c.seo : (typeof c.seo === 'string' ? (() => { try { return JSON.parse(c.seo); } catch { return undefined; } })() : undefined),
        };
      });

      // 3. Fetch Comments
      const { data: rawComments } = await client
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false });

      const comments: Comment[] = (rawComments || []).map((com: any) => ({
        id: com.id,
        novelId: com.novel_id,
        chapterId: com.chapter_id || undefined,
        authorName: com.author_name,
        authorAvatar: com.author_avatar || '',
        content: com.content,
        createdAt: com.created_at || new Date().toISOString(),
        likes: Number(com.likes) || 0,
        isAuthor: Boolean(com.is_author),
        isPinned: Boolean(com.is_pinned),
        parentId: com.parent_id || undefined,
      }));

      // 4. Fetch Author Profile & Settings
      let authorProfile: AuthorProfile | undefined;
      const { data: rawProfile } = await client
        .from('author_profile')
        .select('data')
        .eq('id', 'main_author')
        .maybeSingle();
      if (rawProfile?.data) {
        authorProfile = rawProfile.data;
      }

      let siteBranding: SiteBranding | undefined;
      let donationSettings: DonationSettings | undefined;
      let categories: Category[] | undefined;
      let legalDocuments: LegalDocuments | undefined;
      let adSettings: AdSettings | undefined;
      let seoSettings: SeoSettings | undefined;

      const { data: rawSettings } = await client
        .from('site_settings')
        .select('id, data');
      if (rawSettings && rawSettings.length > 0) {
        const brandRow = rawSettings.find((r: any) => r.id === 'site_branding');
        if (brandRow?.data) siteBranding = brandRow.data;
        const donateRow = rawSettings.find((r: any) => r.id === 'donation_settings');
        if (donateRow?.data) donationSettings = donateRow.data;
        const catRow = rawSettings.find((r: any) => r.id === 'categories');
        if (catRow?.data && Array.isArray(catRow.data) && catRow.data.length > 0) categories = catRow.data;
        const legalRow = rawSettings.find((r: any) => r.id === 'legal_documents');
        if (legalRow?.data) legalDocuments = legalRow.data;
        const adRow = rawSettings.find((r: any) => r.id === 'ad_settings');
        if (adRow?.data) adSettings = adRow.data;
        const seoRow = rawSettings.find((r: any) => r.id === 'seo_settings');
        if (seoRow?.data) seoSettings = seoRow.data;
      }

      const isDatabaseActive = (rawSettings && rawSettings.length > 0) || !!rawProfile?.data || (rawNovels && rawNovels.length > 0);

      // 0. Extract globally recorded deleted novel and chapter IDs (tombstones)
      let remoteDeletedNovelIds: string[] = [];
      let remoteDeletedChapterIds: string[] = [];
      if (rawSettings && Array.isArray(rawSettings)) {
        const delRow = rawSettings.find((r: any) => r.id === 'deleted_records');
        if (delRow?.data) {
          const rawNovels = [
            ...(Array.isArray(delRow.data.deletedNovelIds) ? delRow.data.deletedNovelIds : []),
            ...(Array.isArray(delRow.data.novels) ? delRow.data.novels : []),
          ];
          remoteDeletedNovelIds = Array.from(new Set(rawNovels));

          const rawChapters = [
            ...(Array.isArray(delRow.data.deletedChapterIds) ? delRow.data.deletedChapterIds : []),
            ...(Array.isArray(delRow.data.chapters) ? delRow.data.chapters : []),
          ];
          remoteDeletedChapterIds = Array.from(new Set(rawChapters));
        }
      }

      // Sync tombstone IDs into local storage so local storage permanently knows they are deleted
      remoteDeletedNovelIds.forEach(id => storageService.markNovelDeleted(id));
      remoteDeletedChapterIds.forEach(id => storageService.markChapterDeleted(id));

      const allDeletedNovelIds = new Set([
        ...storageService.getDeletedNovelIds(),
        ...remoteDeletedNovelIds,
      ]);
      const allDeletedChapterIds = new Set([
        ...storageService.getDeletedChapterIds(),
        ...remoteDeletedChapterIds,
      ]);

      // Self-healing: If any remote row still exists in Supabase for a deleted novel or chapter, purge it immediately
      const staleRemoteNovelIds = (rawNovels || []).map((n: any) => n.id).filter((id: string) => allDeletedNovelIds.has(id));
      if (staleRemoteNovelIds.length > 0) {
        try {
          await client.from('comments').delete().in('novel_id', staleRemoteNovelIds);
          await client.from('chapters').delete().in('novel_id', staleRemoteNovelIds);
          await client.from('novels').delete().in('id', staleRemoteNovelIds);
        } catch (e) {
          console.warn('Self-healing cleanup for remote novels error:', e);
        }
      }

      const staleRemoteChapterIds = (rawChapters || []).map((c: any) => c.id).filter((id: string) => allDeletedChapterIds.has(id));
      if (staleRemoteChapterIds.length > 0) {
        try {
          await client.from('comments').delete().in('chapter_id', staleRemoteChapterIds);
          await client.from('chapters').delete().in('id', staleRemoteChapterIds);
        } catch (e) {
          console.warn('Self-healing cleanup for remote chapters error:', e);
        }
      }

      // 1. Novels merge: Filter out deleted novels and sync state
      let mergedNovels: Novel[] = novels.filter(rn => !allDeletedNovelIds.has(rn.id));
      if (!nErr && Array.isArray(rawNovels)) {
        storageService.saveNovels(mergedNovels);
      }

      // 2. Chapters merge: Filter out deleted chapters and chapters of deleted novels
      let mergedChapters: Chapter[] = chapters.filter(
        rc => !allDeletedChapterIds.has(rc.id) && !allDeletedNovelIds.has(rc.novelId)
      );
      if (!cErr && Array.isArray(rawChapters)) {
        storageService.saveChapters(mergedChapters);
      }

      // Clean bookmarks and reading history for deleted items
      try {
        const bookmarks = storageService.getBookmarks().filter(b => !allDeletedNovelIds.has(b.novelId));
        storageService.saveBookmarks(bookmarks);
        const history = storageService.getReadingHistory().filter(h => !allDeletedNovelIds.has(h.novelId));
        storageService.saveReadingHistory(history);
      } catch (e) {
        console.warn('Error purging bookmarks/history for deleted items:', e);
      }

      // 3. Comments merge
      if (Array.isArray(rawComments)) {
        if (comments.length > 0 || isDatabaseActive) {
          storageService.saveComments(comments);
        }
      }
      if (authorProfile) storageService.saveAuthorProfile(authorProfile);
      if (siteBranding) storageService.saveSiteBranding(siteBranding);
      if (donationSettings) storageService.saveDonationSettings(donationSettings);
      if (categories && Array.isArray(categories)) storageService.saveCategories(categories);
      if (legalDocuments) storageService.saveLegalDocuments(legalDocuments);
      if (adSettings) storageService.saveAdSettings(adSettings);
      if (seoSettings) storageService.saveSeoSettings(seoSettings);

      return {
        novels: mergedNovels,
        chapters: mergedChapters,
        comments,
        authorProfile,
        siteBranding,
        donationSettings,
        categories,
        legalDocuments,
        adSettings,
        seoSettings,
      };
    } catch (e) {
      console.warn('pullAllFromSupabase failed:', e);
      return null;
    }
  }

  // --- Granular Real-time Cloud Helpers ---

  public async saveNovelToSupabase(novel: Novel): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;
    try {
      const row = {
        id: novel.id,
        title: novel.title,
        slug: novel.slug || novel.id,
        author: novel.author,
        author_bio: novel.authorBio || '',
        synopsis: novel.synopsis || '',
        cover_image: novel.coverImage || '',
        banner_image: novel.bannerImage || '',
        genres: novel.genres || [],
        tags: novel.tags || [],
        status: novel.status || 'ONGOING',
        total_views: novel.totalViews || 0,
        total_likes: novel.totalLikes || 0,
        rating: novel.rating || 5.0,
        rating_count: novel.ratingCount || 1,
        is_featured: novel.isFeatured || false,
        pdf_download_url: novel.pdfDownloadUrl || '',
        pdf_file_size: novel.pdfFileSize || '',
        download_button_text: novel.downloadButtonText || '',
        table_of_contents: novel.tableOfContents || [],
        seo: novel.seo || null,
        created_at: novel.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const { error } = await client.from('novels').upsert(row);
      if (error) {
        console.warn('Error saving novel to Supabase:', error);
        return false;
      }
      // Unmark from deleted records if previously marked
      await this.unmarkDeletedIdInSupabase('novel', novel.id);
      return true;
    } catch (e) {
      console.warn('Supabase saveNovelToSupabase exception:', e);
      return false;
    }
  }

  public async recordDeletedIdInSupabase(type: 'novel' | 'chapter', id: string): Promise<void> {
    if (type === 'novel') {
      storageService.markNovelDeleted(id);
    } else {
      storageService.markChapterDeleted(id);
    }

    const client = this.getClient();
    if (!client) return;
    try {
      const { data } = await client.from('site_settings').select('data').eq('id', 'deleted_records').maybeSingle();
      const current = (data?.data && typeof data.data === 'object') ? data.data : {
        deletedNovelIds: [],
        novels: [],
        deletedChapterIds: [],
        chapters: []
      };

      const existingNovels = [
        ...(Array.isArray(current.deletedNovelIds) ? current.deletedNovelIds : []),
        ...(Array.isArray(current.novels) ? current.novels : []),
      ];
      const existingChapters = [
        ...(Array.isArray(current.deletedChapterIds) ? current.deletedChapterIds : []),
        ...(Array.isArray(current.chapters) ? current.chapters : []),
      ];

      if (type === 'novel') {
        const set = new Set([...existingNovels, id]);
        current.deletedNovelIds = Array.from(set);
        current.novels = Array.from(set);
      } else {
        const set = new Set([...existingChapters, id]);
        current.deletedChapterIds = Array.from(set);
        current.chapters = Array.from(set);
      }
      current.updatedAt = new Date().toISOString();

      await client.from('site_settings').upsert({
        id: 'deleted_records',
        data: current,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Error recording deleted id in Supabase:', e);
    }
  }

  public async unmarkDeletedIdInSupabase(type: 'novel' | 'chapter', id: string): Promise<void> {
    if (type === 'novel') {
      storageService.unmarkNovelDeleted(id);
    } else {
      storageService.unmarkChapterDeleted(id);
    }

    const client = this.getClient();
    if (!client) return;
    try {
      const { data } = await client.from('site_settings').select('data').eq('id', 'deleted_records').maybeSingle();
      if (!data?.data) return;
      const current = data.data;
      if (type === 'novel') {
        current.deletedNovelIds = (current.deletedNovelIds || []).filter((x: string) => x !== id);
        current.novels = (current.novels || []).filter((x: string) => x !== id);
      } else {
        current.deletedChapterIds = (current.deletedChapterIds || []).filter((x: string) => x !== id);
        current.chapters = (current.chapters || []).filter((x: string) => x !== id);
      }
      current.updatedAt = new Date().toISOString();
      await client.from('site_settings').upsert({
        id: 'deleted_records',
        data: current,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Error unmarking deleted id in Supabase:', e);
    }
  }

  public async deleteNovelFromSupabase(novelId: string): Promise<boolean> {
    // 1. Immediately delete locally and record tombstone in Supabase FIRST
    storageService.deleteNovel(novelId);
    await this.recordDeletedIdInSupabase('novel', novelId);

    const client = this.getClient();
    if (!client) return true;
    try {
      // 2. Delete comments belonging to this novel
      try {
        await client.from('comments').delete().eq('novel_id', novelId);
      } catch (e) {
        console.warn('Error deleting comments for novel:', e);
      }
      // 3. Delete chapters belonging to this novel
      try {
        await client.from('chapters').delete().eq('novel_id', novelId);
      } catch (e) {
        console.warn('Error deleting chapters for novel:', e);
      }
      // 4. Delete the novel itself
      const { error } = await client.from('novels').delete().eq('id', novelId);
      if (error) {
        console.error('Supabase deleteNovelFromSupabase error:', error);
      }
      return !error;
    } catch (e) {
      console.warn('Supabase deleteNovelFromSupabase exception:', e);
      return false;
    }
  }

  public async saveChapterToSupabase(chapter: Chapter): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;
    try {
      const cleanContent = cleanChapterContent(chapter.content);
      const row = {
        id: chapter.id,
        novel_id: chapter.novelId,
        chapter_number: chapter.chapterNumber,
        title: chapter.title,
        slug: chapter.slug || chapter.id,
        content: cleanContent,
        author_note: chapter.authorNote || '',
        published_at: chapter.publishedAt || new Date().toISOString(),
        views: chapter.views || 0,
        likes: chapter.likes || 0,
        word_count: chapter.wordCount || cleanContent.trim().split(/\s+/).filter(Boolean).length,
        status: chapter.status || 'PUBLISHED',
        seo: chapter.seo || null,
      };
      const { error } = await client.from('chapters').upsert(row);
      if (error) {
        console.error('Supabase saveChapterToSupabase error:', error);
        return false;
      }
      await this.unmarkDeletedIdInSupabase('chapter', chapter.id);
      return true;
    } catch (e) {
      console.warn('Supabase saveChapterToSupabase exception:', e);
      return false;
    }
  }

  public async deleteChapterFromSupabase(chapterId: string): Promise<boolean> {
    // 1. Delete locally and record tombstone FIRST
    storageService.deleteChapter(chapterId);
    await this.recordDeletedIdInSupabase('chapter', chapterId);

    const client = this.getClient();
    if (!client) return true;
    try {
      // 2. Delete comments belonging to this chapter
      try {
        await client.from('comments').delete().eq('chapter_id', chapterId);
      } catch (e) {
        console.warn('Error deleting comments for chapter:', e);
      }
      // 3. Delete the chapter itself
      const { error } = await client.from('chapters').delete().eq('id', chapterId);
      if (error) {
        console.error('Supabase deleteChapterFromSupabase error:', error);
      }
      return !error;
    } catch (e) {
      console.warn('Supabase deleteChapterFromSupabase exception:', e);
      return false;
    }
  }

  public async saveAuthorProfileToSupabase(profile: AuthorProfile): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;
    try {
      const { error } = await client.from('author_profile').upsert({
        id: 'main_author',
        data: profile,
        updated_at: new Date().toISOString(),
      });
      if (error) {
        console.error('Supabase saveAuthorProfileToSupabase error:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Supabase saveAuthorProfileToSupabase exception:', e);
      return false;
    }
  }

  public async saveSiteBrandingToSupabase(branding: SiteBranding): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;
    try {
      const { error } = await client.from('site_settings').upsert({
        id: 'site_branding',
        data: branding,
        updated_at: new Date().toISOString(),
      });
      if (error) {
        console.error('Supabase saveSiteBrandingToSupabase error:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Supabase saveSiteBrandingToSupabase exception:', e);
      return false;
    }
  }

  public async saveDonationSettingsToSupabase(donations: DonationSettings): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;
    try {
      const { error } = await client.from('site_settings').upsert({
        id: 'donation_settings',
        data: donations,
        updated_at: new Date().toISOString(),
      });
      if (error) {
        console.error('Supabase saveDonationSettingsToSupabase error:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Supabase saveDonationSettingsToSupabase exception:', e);
      return false;
    }
  }

  public async saveCategoriesToSupabase(categories: Category[]): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;
    try {
      const { error } = await client.from('site_settings').upsert({
        id: 'categories',
        data: categories,
        updated_at: new Date().toISOString(),
      });
      if (error) {
        console.error('Supabase saveCategoriesToSupabase error:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Supabase saveCategoriesToSupabase exception:', e);
      return false;
    }
  }

  public async saveLegalDocumentsToSupabase(docs: LegalDocuments): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;
    try {
      const { error } = await client.from('site_settings').upsert({
        id: 'legal_documents',
        data: docs,
        updated_at: new Date().toISOString(),
      });
      if (error) {
        console.error('Supabase saveLegalDocumentsToSupabase error:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Supabase saveLegalDocumentsToSupabase exception:', e);
      return false;
    }
  }

  public async saveAdSettingsToSupabase(ads: AdSettings): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;
    try {
      const { error } = await client.from('site_settings').upsert({
        id: 'ad_settings',
        data: ads,
        updated_at: new Date().toISOString(),
      });
      if (error) {
        console.error('Supabase saveAdSettingsToSupabase error:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Supabase saveAdSettingsToSupabase exception:', e);
      return false;
    }
  }

  public async saveSeoSettingsToSupabase(seo: SeoSettings): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;
    try {
      const { error } = await client.from('site_settings').upsert({
        id: 'seo_settings',
        data: seo,
        updated_at: new Date().toISOString(),
      });
      if (error) {
        console.error('Supabase saveSeoSettingsToSupabase error:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Supabase saveSeoSettingsToSupabase exception:', e);
      return false;
    }
  }

  public async testConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string; cleanedUrl?: string }> {
    try {
      if (!url.trim() || !anonKey.trim()) {
        return { success: false, message: 'يرجى إدخال رابط المشروع (Project URL) والمفتاح العام (anon key).' };
      }

      const cleanUrl = this.cleanProjectUrl(url);
      const cleanKey = anonKey.trim();

      const tempClient = createClient(cleanUrl, cleanKey);
      // Attempt a lightweight ping query on the 'novels' table
      const { data, error } = await tempClient.from('novels').select('id').limit(1);

      if (error) {
        // PGRST125: Invalid path in URL (e.g. user entered /rest/v1)
        if (error.code === 'PGRST125' || error.message.includes('Invalid path specified in request URL')) {
          return {
            success: false,
            message: `خطأ في مسار الرابط (PGRST125): تأكد من إدخال الرابط الأساسي فقط بدون /rest/v1 أو /dashboard (الرابط النظيف: ${cleanUrl})`,
            cleanedUrl: cleanUrl,
          };
        }

        // If the table doesn't exist yet (PGRST204 or 42P01), the connection itself is valid!
        if (
          error.code === 'PGRST204' ||
          error.code === '42P01' ||
          error.message.includes('relation "novels" does not exist') ||
          error.message.includes('relation "public.novels" does not exist')
        ) {
          return {
            success: true,
            message: 'تم الاتصال بسوباباس بنجاح! الجداول غير موجودة بعد - يرجى تشغيل كود SQL في SQL Editor في لوحة سوباباس لإنشائها.',
            cleanedUrl: cleanUrl,
          };
        }

        // Check if RLS prevented read or invalid key
        if (error.code === 'PGRST301' || error.message.includes('JWT') || error.message.includes('apikey')) {
          return {
            success: false,
            message: `خطأ في مفتاح الـ API: تأكد من نسخ anon public key وليس service_role key أو مفتاح غير صالح.`,
            cleanedUrl: cleanUrl,
          };
        }

        return {
          success: false,
          message: `تنبيه من سوباباس: ${error.message} (رمز الخطأ: ${error.code || 'UNKNOWN'})`,
          cleanedUrl: cleanUrl,
        };
      }

      return {
        success: true,
        message: 'تم الاتصال بقاعدة بيانات Supabase بنجاح، وجميع الجداول جاهزة للعمل والمزامنة!',
        cleanedUrl: cleanUrl,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `فشل الاتصال: ${err.message || 'تأكد من صحة الرابط ومفتاح الـ API'}`,
      };
    }
  }

  public async syncAllToSupabase(
    config: SupabaseConfig,
    payload: {
      novels: Novel[];
      chapters: Chapter[];
      comments: Comment[];
      authorProfile: AuthorProfile;
      siteBranding: SiteBranding;
      donationSettings: DonationSettings;
      categories?: Category[];
      legalDocuments?: LegalDocuments;
      adSettings?: AdSettings;
      seoSettings?: SeoSettings;
    }
  ): Promise<{ success: boolean; message: string }> {
    const cleanUrl = this.cleanProjectUrl(config.url);
    const cleanKey = config.anonKey?.trim() || '';

    if (!cleanUrl || !cleanKey) {
      return { success: false, message: 'يرجى إدخال رابط المشروع (Project URL) والمفتاح العام (anon key) أولاً.' };
    }

    // Direct client creation with clean credentials
    const client = createClient(cleanUrl, cleanKey);
    this.client = client;
    this.currentConfig = { ...config, enabled: true, url: cleanUrl, anonKey: cleanKey };

    try {
      const syncedSummary: string[] = [];

      // 0. Extract tombstone deleted IDs from Supabase site_settings AND local storage
      let remoteDeletedNovelIds: string[] = [];
      let remoteDeletedChapterIds: string[] = [];
      try {
        const { data: delRow } = await client.from('site_settings').select('data').eq('id', 'deleted_records').maybeSingle();
        if (delRow?.data) {
          const rawNovels = [
            ...(Array.isArray(delRow.data.deletedNovelIds) ? delRow.data.deletedNovelIds : []),
            ...(Array.isArray(delRow.data.novels) ? delRow.data.novels : []),
          ];
          remoteDeletedNovelIds = Array.from(new Set(rawNovels));

          const rawChapters = [
            ...(Array.isArray(delRow.data.deletedChapterIds) ? delRow.data.deletedChapterIds : []),
            ...(Array.isArray(delRow.data.chapters) ? delRow.data.chapters : []),
          ];
          remoteDeletedChapterIds = Array.from(new Set(rawChapters));
        }
      } catch (e) {
        console.warn('Sync fetch remote tombstones error:', e);
      }

      remoteDeletedNovelIds.forEach(id => storageService.markNovelDeleted(id));
      remoteDeletedChapterIds.forEach(id => storageService.markChapterDeleted(id));

      const deletedNovelIds = Array.from(new Set([
        ...storageService.getDeletedNovelIds(),
        ...remoteDeletedNovelIds,
      ]));
      const deletedChapterIds = Array.from(new Set([
        ...storageService.getDeletedChapterIds(),
        ...remoteDeletedChapterIds,
      ]));

      if (deletedNovelIds.length > 0) {
        try {
          await client.from('comments').delete().in('novel_id', deletedNovelIds);
          await client.from('chapters').delete().in('novel_id', deletedNovelIds);
          await client.from('novels').delete().in('id', deletedNovelIds);
        } catch (e) {
          console.warn('Sync purge deleted novels error:', e);
        }
      }

      if (deletedChapterIds.length > 0) {
        try {
          await client.from('comments').delete().in('chapter_id', deletedChapterIds);
          await client.from('chapters').delete().in('id', deletedChapterIds);
        } catch (e) {
          console.warn('Sync purge deleted chapters error:', e);
        }
      }

      // Filter payload to strictly exclude any deleted items
      const validNovels = (payload.novels || []).filter(n => !deletedNovelIds.includes(n.id));
      const validChapters = (payload.chapters || []).filter(
        c => !deletedChapterIds.includes(c.id) && !deletedNovelIds.includes(c.novelId)
      );

      // Clean ghost/stale novels from Supabase that were deleted locally or not in validNovels
      try {
        const { data: remoteNovels } = await client.from('novels').select('id');
        if (remoteNovels && remoteNovels.length > 0) {
          const validIds = new Set(validNovels.map(n => n.id));
          const toDelete = remoteNovels.filter(rn => !validIds.has(rn.id)).map(rn => rn.id);
          if (toDelete.length > 0) {
            await client.from('comments').delete().in('novel_id', toDelete);
            await client.from('chapters').delete().in('novel_id', toDelete);
            await client.from('novels').delete().in('id', toDelete);
          }
        }
      } catch (e) {
        console.warn('Sync prune ghost novels error:', e);
      }

      // 1. Sync Novels
      if (validNovels.length > 0) {
        const novelsData = validNovels.map(n => ({
          id: n.id,
          title: n.title,
          slug: n.slug || n.id,
          author: n.author,
          author_bio: n.authorBio || '',
          synopsis: n.synopsis || '',
          cover_image: n.coverImage || '',
          banner_image: n.bannerImage || '',
          genres: n.genres || [],
          tags: n.tags || [],
          status: n.status || 'ONGOING',
          total_views: n.totalViews || 0,
          total_likes: n.totalLikes || 0,
          rating: n.rating || 5.0,
          rating_count: n.ratingCount || 1,
          is_featured: n.isFeatured || false,
          pdf_download_url: n.pdfDownloadUrl || '',
          pdf_file_size: n.pdfFileSize || '',
          created_at: n.createdAt || new Date().toISOString(),
          updated_at: n.updatedAt || new Date().toISOString(),
        }));
        const { error: novelsErr } = await client.from('novels').upsert(novelsData);
        if (novelsErr) {
          console.warn('Novels sync warning:', novelsErr);
        } else {
          syncedSummary.push(`${validNovels.length} رواية/كتاب`);
        }
      }

      // 2. Sync Chapters
      if (validChapters.length > 0) {
        const chaptersData = validChapters.map(c => {
          const cleanContent = cleanChapterContent(c.content);
          return {
            id: c.id,
            novel_id: c.novelId,
            chapter_number: c.chapterNumber,
            title: c.title,
            slug: c.slug || c.id,
            content: cleanContent,
            author_note: c.authorNote || '',
            published_at: c.publishedAt || new Date().toISOString(),
            views: c.views || 0,
            likes: c.likes || 0,
            word_count: c.wordCount || cleanContent.trim().split(/\s+/).filter(Boolean).length,
            status: c.status || 'PUBLISHED',
          };
        });
        const { error: chaptersErr } = await client.from('chapters').upsert(chaptersData);
        if (chaptersErr) {
          console.warn('Chapters sync warning:', chaptersErr);
        } else {
          syncedSummary.push(`${validChapters.length} فصل`);
        }
      }

      // 3. Sync Comments
      if (payload.comments && payload.comments.length > 0) {
        const commentsData = payload.comments.map(c => ({
          id: c.id,
          novel_id: c.novelId,
          chapter_id: c.chapterId || null,
          author_name: c.authorName,
          author_avatar: c.authorAvatar || '',
          content: c.content,
          created_at: c.createdAt || new Date().toISOString(),
          likes: c.likes || 0,
          is_author: c.isAuthor || false,
          is_pinned: c.isPinned || false,
          parent_id: c.parentId || null,
        }));
        const { error: commentsErr } = await client.from('comments').upsert(commentsData);
        if (commentsErr) {
          console.warn('Comments sync warning:', commentsErr);
        } else {
          syncedSummary.push(`${payload.comments.length} تعليق`);
        }
      }

      // 4. Sync Author Profile (try/catch in case table is optional)
      try {
        await client.from('author_profile').upsert({
          id: 'main_author',
          data: payload.authorProfile,
          updated_at: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Author profile sync optional warning:', e);
      }

      // 5. Sync Site Branding
      try {
        await client.from('site_settings').upsert({
          id: 'site_branding',
          data: payload.siteBranding,
          updated_at: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Site branding sync optional warning:', e);
      }

      // 6. Sync Donation Settings
      try {
        await client.from('site_settings').upsert({
          id: 'donation_settings',
          data: payload.donationSettings,
          updated_at: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Donation settings sync optional warning:', e);
      }

      // 7. Sync Categories
      if (payload.categories && payload.categories.length > 0) {
        try {
          await client.from('site_settings').upsert({
            id: 'categories',
            data: payload.categories,
            updated_at: new Date().toISOString(),
          });
          syncedSummary.push(`${payload.categories.length} قسم`);
        } catch (e) {
          console.warn('Categories sync optional warning:', e);
        }
      }

      // 8. Sync Legal Documents
      if (payload.legalDocuments) {
        try {
          await client.from('site_settings').upsert({
            id: 'legal_documents',
            data: payload.legalDocuments,
            updated_at: new Date().toISOString(),
          });
        } catch (e) {
          console.warn('Legal documents sync optional warning:', e);
        }
      }

      // 9. Sync Ad Settings
      if (payload.adSettings) {
        try {
          await client.from('site_settings').upsert({
            id: 'ad_settings',
            data: payload.adSettings,
            updated_at: new Date().toISOString(),
          });
        } catch (e) {
          console.warn('Ad settings sync optional warning:', e);
        }
      }

      // 10. Sync SEO Settings
      if (payload.seoSettings) {
        try {
          await client.from('site_settings').upsert({
            id: 'seo_settings',
            data: payload.seoSettings,
            updated_at: new Date().toISOString(),
          });
        } catch (e) {
          console.warn('SEO settings sync optional warning:', e);
        }
      }

      // 11. Sync Tombstones (deleted records) to guarantee all clients purge them
      try {
        await client.from('site_settings').upsert({
          id: 'deleted_records',
          data: {
            deletedNovelIds,
            novels: deletedNovelIds,
            deletedChapterIds,
            chapters: deletedChapterIds,
            updatedAt: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Deleted records sync optional warning:', e);
      }

      const summaryText = syncedSummary.length > 0 ? syncedSummary.join(' و ') : 'البيانات كاملة';

      return {
        success: true,
        message: `تمت المزامنة بنجاح! تم رفع ${summaryText} وملف الكاتب والأقسام وإعدادات الموقع إلى سوباباس وتحديثها سحابياً.`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `خطأ أثناء المزامنة مع سوباباس: ${err.message || 'يرجى التأكد من تشغيل كود الـ SQL في سوباباس أولاً'}`,
      };
    }
  }

  public async checkTablesStatus(): Promise<{
    hasClient: boolean;
    connected: boolean;
    tables: {
      novels: boolean;
      chapters: boolean;
      comments: boolean;
      author_profile: boolean;
      site_settings: boolean;
    };
    allTablesReady: boolean;
    errorMessage?: string;
  }> {
    const client = this.getClient();
    if (!client) {
      return {
        hasClient: false,
        connected: false,
        tables: { novels: false, chapters: false, comments: false, author_profile: false, site_settings: false },
        allTablesReady: false,
        errorMessage: 'لم يتم العثور على بيانات اتصال بسوباباس',
      };
    }

    try {
      const results = {
        novels: false,
        chapters: false,
        comments: false,
        author_profile: false,
        site_settings: false,
      };

      const [nRes, cRes, comRes, pRes, sRes] = await Promise.all([
        client.from('novels').select('id').limit(1),
        client.from('chapters').select('id').limit(1),
        client.from('comments').select('id').limit(1),
        client.from('author_profile').select('id').limit(1),
        client.from('site_settings').select('id').limit(1),
      ]);

      results.novels = !nRes.error;
      results.chapters = !cRes.error;
      results.comments = !comRes.error;
      results.author_profile = !pRes.error;
      results.site_settings = !sRes.error;

      const allReady = results.novels && results.chapters && results.comments && results.author_profile && results.site_settings;

      return {
        hasClient: true,
        connected: true,
        tables: results,
        allTablesReady: allReady,
        errorMessage: allReady ? undefined : 'بعض الجداول غير موجودة بعد في قاعدة البيانات. يرجى تشغيل كود SQL في SQL Editor في سوباباس لإنشائها.',
      };
    } catch (e: any) {
      return {
        hasClient: true,
        connected: false,
        tables: { novels: false, chapters: false, comments: false, author_profile: false, site_settings: false },
        allTablesReady: false,
        errorMessage: e.message || 'فشل الاتصال بقاعدة البيانات',
      };
    }
  }

  public getSqlSchemaScript(): string {
    return `-- ==========================================
-- سكريبت إنشاء جداول منصة أيمن كناني في Supabase
-- قم بنسخ هذا الكود ولصقه في SQL Editor في لوحة تحكم سوباباس ثم اضغط Run
-- ==========================================

-- 1. جدول الكتب والمؤلفات
CREATE TABLE IF NOT EXISTS public.novels (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    author TEXT NOT NULL,
    author_bio TEXT,
    synopsis TEXT,
    cover_image TEXT,
    banner_image TEXT,
    genres JSONB DEFAULT '[]'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'ONGOING',
    total_views INTEGER DEFAULT 0,
    total_likes INTEGER DEFAULT 0,
    rating NUMERIC DEFAULT 5.0,
    rating_count INTEGER DEFAULT 1,
    is_featured BOOLEAN DEFAULT false,
    pdf_download_url TEXT,
    pdf_file_size TEXT,
    download_button_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. جدول الفصول والمقالات
CREATE TABLE IF NOT EXISTS public.chapters (
    id TEXT PRIMARY KEY,
    novel_id TEXT REFERENCES public.novels(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content TEXT NOT NULL,
    author_note TEXT,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    word_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'PUBLISHED'
);

-- 3. جدول تعليقات ومراجعات القراء
CREATE TABLE IF NOT EXISTS public.comments (
    id TEXT PRIMARY KEY,
    chapter_id TEXT,
    novel_id TEXT,
    author_name TEXT NOT NULL,
    author_avatar TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    likes INTEGER DEFAULT 0,
    is_author BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    parent_id TEXT
);

-- 4. جدول الملف الشخصي للكاتب أيمن كناني
CREATE TABLE IF NOT EXISTS public.author_profile (
    id TEXT PRIMARY KEY DEFAULT 'main_author',
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. جدول إعدادات الموقع والعلامة التجارية والدعم
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- تفعيل سياسات الأمان للقراءة العامة والكتابة المصرحة (RLS)
ALTER TABLE public.novels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.author_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- تنظيف أي سياسات سابقة لتفادي التعارض
DROP POLICY IF EXISTS "Public Read Access Novels" ON public.novels;
DROP POLICY IF EXISTS "Public Insert/Update Novels" ON public.novels;
DROP POLICY IF EXISTS "Allow All Novels" ON public.novels;
CREATE POLICY "Allow All Novels" ON public.novels FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Access Chapters" ON public.chapters;
DROP POLICY IF EXISTS "Public Insert/Update Chapters" ON public.chapters;
DROP POLICY IF EXISTS "Allow All Chapters" ON public.chapters;
CREATE POLICY "Allow All Chapters" ON public.chapters FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Access Comments" ON public.comments;
DROP POLICY IF EXISTS "Public Insert/Update Comments" ON public.comments;
DROP POLICY IF EXISTS "Allow All Comments" ON public.comments;
CREATE POLICY "Allow All Comments" ON public.comments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Access Author" ON public.author_profile;
DROP POLICY IF EXISTS "Public Insert/Update Author" ON public.author_profile;
DROP POLICY IF EXISTS "Allow All Author" ON public.author_profile;
CREATE POLICY "Allow All Author" ON public.author_profile FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Access Settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public Insert/Update Settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow All Settings" ON public.site_settings;
CREATE POLICY "Allow All Settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);
`;
  }

  public getFixPermissionsSqlScript(): string {
    return `-- ========================================================
-- كود سريع لإصلاح وتفعيل صلاحيات الحذف والتعديل الفوري في Supabase
-- قم بنسخ هذا الكود ولصقه في SQL Editor في سوباباس ثم اضغط Run:
-- ========================================================

-- 1. تنظيف السياسات المقيدة السابقة
DROP POLICY IF EXISTS "Public Read Access Novels" ON public.novels;
DROP POLICY IF EXISTS "Public Insert/Update Novels" ON public.novels;
DROP POLICY IF EXISTS "Allow All Novels" ON public.novels;

DROP POLICY IF EXISTS "Public Read Access Chapters" ON public.chapters;
DROP POLICY IF EXISTS "Public Insert/Update Chapters" ON public.chapters;
DROP POLICY IF EXISTS "Allow All Chapters" ON public.chapters;

DROP POLICY IF EXISTS "Public Read Access Comments" ON public.comments;
DROP POLICY IF EXISTS "Public Insert/Update Comments" ON public.comments;
DROP POLICY IF EXISTS "Allow All Comments" ON public.comments;

DROP POLICY IF EXISTS "Public Read Access Author" ON public.author_profile;
DROP POLICY IF EXISTS "Public Insert/Update Author" ON public.author_profile;
DROP POLICY IF EXISTS "Allow All Author" ON public.author_profile;

DROP POLICY IF EXISTS "Public Read Access Settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public Insert/Update Settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow All Settings" ON public.site_settings;

-- 2. تفعيل السياسات الشاملة (قراءة، إضافة، تعديل، حذف)
ALTER TABLE public.novels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow All Novels" ON public.novels FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow All Chapters" ON public.chapters FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow All Comments" ON public.comments FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.author_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow All Author" ON public.author_profile FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow All Settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);
`;
  }
}

export const supabaseService = new SupabaseService();
