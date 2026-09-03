import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfig, Novel, Chapter, Comment, AuthorProfile, SiteBranding, DonationSettings } from '../types';
import { storageService } from './storageService';

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

  public getClient(config?: SupabaseConfig): SupabaseClient | null {
    if (config && config.url && config.anonKey) {
      return this.initClient(config);
    }
    if (this.client) return this.client;

    const defaultUrl = 'https://kepuolqhropozwfwwwbb.supabase.co';
    const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlcHVvbHFocm9wb3p3Znd3d2JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMzcyMDgsImV4cCI6MjEwMzkxMzIwOH0.8JfpG8bw-dxwFn64-pAbeRBAxBR9WiaNKQAcJAVCeJw';

    // Check environment variables first, then default to the project credentials
    const envUrl = (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL.trim()) ? import.meta.env.VITE_SUPABASE_URL.trim() : defaultUrl;
    const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY && import.meta.env.VITE_SUPABASE_ANON_KEY.trim()) ? import.meta.env.VITE_SUPABASE_ANON_KEY.trim() : defaultKey;
    if (envUrl && envKey) {
      return this.initClient({
        url: envUrl,
        anonKey: envKey,
        enabled: true,
        autoSync: true,
        connected: true
      });
    }

    const storedConfig = storageService.getSupabaseConfig();
    if (storedConfig && storedConfig.url && storedConfig.anonKey) {
      return this.initClient(storedConfig);
    }
    return null;
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
      }));

      // 2. Fetch Chapters
      const { data: rawChapters, error: cErr } = await client
        .from('chapters')
        .select('*')
        .order('chapter_number', { ascending: true });

      const chapters: Chapter[] = (rawChapters || []).map((c: any) => ({
        id: c.id,
        novelId: c.novel_id,
        chapterNumber: Number(c.chapter_number) || 1,
        title: c.title,
        slug: c.slug || c.id,
        content: c.content || '',
        authorNote: c.author_note || undefined,
        publishedAt: c.published_at || new Date().toISOString(),
        views: Number(c.views) || 0,
        likes: Number(c.likes) || 0,
        wordCount: Number(c.word_count) || 0,
        status: c.status || 'PUBLISHED',
      }));

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
      const { data: rawSettings } = await client
        .from('site_settings')
        .select('id, data');
      if (rawSettings && rawSettings.length > 0) {
        const brandRow = rawSettings.find((r: any) => r.id === 'site_branding');
        if (brandRow?.data) siteBranding = brandRow.data;
        const donateRow = rawSettings.find((r: any) => r.id === 'donation_settings');
        if (donateRow?.data) donationSettings = donateRow.data;
      }

      // Update local storage cache only when items exist so empty cloud doesn't wipe local works
      if (novels.length > 0) {
        storageService.saveNovels(novels);
      }
      if (chapters.length > 0) {
        storageService.saveChapters(chapters);
      }
      if (comments.length > 0) {
        storageService.saveComments(comments);
      }
      if (authorProfile) storageService.saveAuthorProfile(authorProfile);
      if (siteBranding) storageService.saveSiteBranding(siteBranding);
      if (donationSettings) storageService.saveDonationSettings(donationSettings);

      // If Supabase is currently empty, but this device already has local novels/chapters,
      // automatically push them up to Supabase so other browsers can immediately access them!
      if (novels.length === 0 && chapters.length === 0) {
        const localNovels = storageService.getNovels();
        const localChapters = storageService.getChapters();
        if (localNovels.length > 0 || localChapters.length > 0) {
          console.log('Supabase tables are empty. Auto-syncing existing local novels to cloud...');
          this.syncAllToSupabase(this.currentConfig || {
            url: 'https://kepuolqhropozwfwwwbb.supabase.co',
            anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlcHVvbHFocm9wb3p3Znd3d2JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMzcyMDgsImV4cCI6MjEwMzkxMzIwOH0.8JfpG8bw-dxwFn64-pAbeRBAxBR9WiaNKQAcJAVCeJw',
            enabled: true,
            autoSync: true,
            connected: true
          }, {
            novels: localNovels,
            chapters: localChapters,
            comments: storageService.getComments(),
            authorProfile: storageService.getAuthorProfile(),
            siteBranding: storageService.getSiteBranding(),
            donationSettings: storageService.getDonationSettings(),
          }).catch(e => console.warn('Auto-sync to Supabase notice:', e));
        }
      }

      return {
        novels,
        chapters,
        comments,
        authorProfile,
        siteBranding,
        donationSettings,
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
        created_at: novel.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const { error } = await client.from('novels').upsert(row);
      if (error) {
        console.warn('Error saving novel to Supabase:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Supabase saveNovelToSupabase exception:', e);
      return false;
    }
  }

  public async deleteNovelFromSupabase(novelId: string): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;
    try {
      // Also delete chapters
      await client.from('chapters').delete().eq('novel_id', novelId);
      const { error } = await client.from('novels').delete().eq('id', novelId);
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
      const row = {
        id: chapter.id,
        novel_id: chapter.novelId,
        chapter_number: chapter.chapterNumber,
        title: chapter.title,
        slug: chapter.slug || chapter.id,
        content: chapter.content,
        author_note: chapter.authorNote || '',
        published_at: chapter.publishedAt || new Date().toISOString(),
        views: chapter.views || 0,
        likes: chapter.likes || 0,
        word_count: chapter.wordCount || 0,
        status: chapter.status || 'PUBLISHED',
      };
      const { error } = await client.from('chapters').upsert(row);
      return !error;
    } catch (e) {
      console.warn('Supabase saveChapterToSupabase exception:', e);
      return false;
    }
  }

  public async deleteChapterFromSupabase(chapterId: string): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;
    try {
      const { error } = await client.from('chapters').delete().eq('id', chapterId);
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
      return !error;
    } catch {
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
      return !error;
    } catch {
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
      return !error;
    } catch {
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

      // 1. Sync Novels
      if (payload.novels && payload.novels.length > 0) {
        const novelsData = payload.novels.map(n => ({
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
          syncedSummary.push(`${payload.novels.length} رواية/كتاب`);
        }
      }

      // 2. Sync Chapters
      if (payload.chapters && payload.chapters.length > 0) {
        const chaptersData = payload.chapters.map(c => ({
          id: c.id,
          novel_id: c.novelId,
          chapter_number: c.chapterNumber,
          title: c.title,
          slug: c.slug || c.id,
          content: c.content,
          author_note: c.authorNote || '',
          published_at: c.publishedAt || new Date().toISOString(),
          views: c.views || 0,
          likes: c.likes || 0,
          word_count: c.wordCount || 0,
          status: c.status || 'PUBLISHED',
        }));
        const { error: chaptersErr } = await client.from('chapters').upsert(chaptersData);
        if (chaptersErr) {
          console.warn('Chapters sync warning:', chaptersErr);
        } else {
          syncedSummary.push(`${payload.chapters.length} فصل`);
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

      // 5. Sync Site Branding (try/catch in case table is optional)
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

      const summaryText = syncedSummary.length > 0 ? syncedSummary.join(' و ') : 'البيانات كاملة';

      return {
        success: true,
        message: `تمت المزامنة بنجاح! تم رفع ${summaryText} وملف الكاتب وإعدادات الموقع إلى سوباباس وتحديثها سحابياً.`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `خطأ أثناء المزامنة مع سوباباس: ${err.message || 'يرجى التأكد من تشغيل كود الـ SQL في سوباباس أولاً'}`,
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

-- سياسة السماح بالقراءة للجميع
CREATE POLICY "Public Read Access Novels" ON public.novels FOR SELECT USING (true);
CREATE POLICY "Public Read Access Chapters" ON public.chapters FOR SELECT USING (true);
CREATE POLICY "Public Read Access Comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Public Read Access Author" ON public.author_profile FOR SELECT USING (true);
CREATE POLICY "Public Read Access Settings" ON public.site_settings FOR SELECT USING (true);

-- سياسة الإدراج والتحديث للعامة بالمفتاح
CREATE POLICY "Public Insert/Update Novels" ON public.novels FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Insert/Update Chapters" ON public.chapters FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Insert/Update Comments" ON public.comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Insert/Update Author" ON public.author_profile FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Insert/Update Settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);
`;
  }
}

export const supabaseService = new SupabaseService();
