import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import type {
  Novel,
  Chapter,
  Comment,
  AuthorProfile,
  SiteBranding,
  DonationSettings,
  Category,
  LegalDocuments,
  AdSettings,
  SeoSettings,
} from '../types';
import { BAKED_NOVELS, BAKED_CHAPTERS } from '../data/bakedContent';

function getPublishedChaptersFromFile(): Chapter[] {
  try {
    const filePath = path.resolve(process.cwd(), 'src/data/publishedChapters.json');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (err) {
    console.error('Error reading publishedChapters.json:', err);
  }
  return [];
}

function savePublishedChapterToFile(chapter: Chapter) {
  try {
    const filePath = path.resolve(process.cwd(), 'src/data/publishedChapters.json');
    let chapters = getPublishedChaptersFromFile();
    const index = chapters.findIndex(c => c.id === chapter.id || (c.chapterNumber === chapter.chapterNumber && c.novelId === chapter.novelId));
    if (index >= 0) {
      chapters[index] = { ...chapters[index], ...chapter };
    } else {
      chapters.unshift(chapter);
    }
    fs.writeFileSync(filePath, JSON.stringify(chapters, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving publishedChapter to file:', err);
  }
}

const DEFAULT_SUPABASE_URL = 'https://ddotnksrmwpsfxmgduji.supabase.co';
const DEFAULT_SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkb3Rua3NybXdwc2Z4bWdkdWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4ODc0ODAsImV4cCI6MjEwNTQ2MzQ4MH0.AlKIT-493mepn41UF3JpocS5xgDLeqnafxEyLww31JE';

let supabaseServerClient: SupabaseClient | null = null;

export function getServerSupabase(): SupabaseClient {
  if (!supabaseServerClient) {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;
    supabaseServerClient = createClient(url.trim(), key.trim(), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        fetch: (input, init) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);
          return fetch(input, {
            ...init,
            signal: controller.signal,
          }).finally(() => clearTimeout(timeoutId));
        },
      },
    });
  }
  return supabaseServerClient;
}

// =========================================================================
// COLUMN DEFINITIONS
// =========================================================================
export const NOVEL_COLUMNS = 'id, title, slug, author, author_bio, synopsis, cover_image, banner_image, genres, tags, status, total_views, total_likes, rating, rating_count, is_featured, pdf_download_url, pdf_file_size, download_button_text, created_at, updated_at';
export const NOVEL_CORE_COLUMNS = 'id, title, slug, author, synopsis, cover_image, genres, tags, status, total_views, total_likes, rating, is_featured, created_at, updated_at';
export const CHAPTER_META_COLUMNS = 'id, novel_id, chapter_number, title, slug, author_note, published_at, views, likes, rating, rating_count, word_count, status, updated_at';
export const CHAPTER_CORE_COLUMNS = 'id, novel_id, chapter_number, title, slug, published_at, views, likes, status';
export const CHAPTER_FULL_COLUMNS = 'id, novel_id, chapter_number, title, slug, content, author_note, published_at, views, likes, rating, rating_count, word_count, status, updated_at';
export const COMMENT_COLUMNS = 'id, novel_id, chapter_id, author_name, author_avatar, content, created_at, likes, is_author, is_pinned, parent_id, is_approved, user_badge, rating';

/**
 * Universal helper to extract missing column names from any Postgres/PostgREST error message
 */
export function extractMissingColumnName(errMsg?: string): string | null {
  if (!errMsg) return null;
  const patterns = [
    /Could not find the ['"]?([a-zA-Z0-9_]+)['"]? column/i,
    /column ['"]?([a-zA-Z0-9_]+)['"]? of relation/i,
    /column ['"]?([a-zA-Z0-9_]+)['"]? does not exist/i,
    /column [a-zA-Z0-9_]+\.([a-zA-Z0-9_]+) does not exist/i,
    /relation ['"][^'"]+['"] has no column named ['"]([a-zA-Z0-9_]+)['"]/i,
    /schema cache lookup failed for ['"]?([a-zA-Z0-9_]+)['"]?/i,
  ];

  for (const pat of patterns) {
    const m = errMsg.match(pat);
    if (m && m[1]) return m[1];
  }
  return null;
}

/**
 * Resilient upsert helper that automatically prunes unrecognized columns
 */
async function resilientUpsert(
  client: SupabaseClient,
  table: string,
  payload: Record<string, any>,
  maxRetries = 10
): Promise<{ success: boolean; error?: any; finalPayload: Record<string, any> }> {
  let current = { ...payload };
  let attempts = maxRetries;
  let lastErr: any = null;

  while (attempts > 0) {
    const res = await client.from(table).upsert(current);
    lastErr = res.error;
    if (!lastErr) {
      return { success: true, finalPayload: current };
    }

    const missingCol = extractMissingColumnName(lastErr.message);
    if (missingCol && current[missingCol] !== undefined) {
      delete current[missingCol];
      attempts--;
      continue;
    }

    // Try stripping optional non-standard columns if still failing
    const optionalCols = [
      'pdf_download_url',
      'pdf_file_size',
      'download_button_text',
      'author_bio',
      'banner_image',
      'rating_count',
      'table_of_contents',
      'author_note',
      'author_notes',
      'word_count',
      'seo',
      'user_badge',
      'is_approved',
    ];
    let strippedAny = false;
    for (const opt of optionalCols) {
      if (current[opt] !== undefined) {
        delete current[opt];
        strippedAny = true;
        break;
      }
    }

    if (strippedAny) {
      attempts--;
      continue;
    }

    break;
  }

  return { success: !lastErr, error: lastErr, finalPayload: current };
}

// =========================================================================
// SERVER IN-MEMORY CACHE (Reduces Supabase database egress to virtually zero)
// =========================================================================
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache
const CHAPTER_CONTENT_TTL_MS = 30 * 60 * 1000; // 30 minutes cache for chapter texts

let novelsCache: CacheEntry<Novel[]> | null = null;
let chaptersMetaCache: CacheEntry<Chapter[]> | null = null;
let syncBundleCache: CacheEntry<any> | null = null;
const singleChapterCache = new Map<string, CacheEntry<Chapter>>();

export function invalidateServerCache() {
  novelsCache = null;
  chaptersMetaCache = null;
  syncBundleCache = null;
  singleChapterCache.clear();
}

export interface ChapterWithSurroundings {
  chapter: Chapter;
  novel: Novel;
  prevChapter: Chapter | null;
  nextChapter: Chapter | null;
  totalChapters: number;
}

/**
 * Parses chapter identifier which can be:
 * - "chapter-5" -> 5
 * - "5" -> 5
 * - "ch-test-1" -> slug/id
 */
export function parseChapterNumber(ident: string): number | null {
  const match = ident.match(/^(?:chapter-?)?(\d+)$/i);
  if (match) {
    return parseInt(match[1], 10);
  }
  return null;
}

/**
 * Fetches a single chapter and its novel directly for Server-Side Rendering
 * Uses in-memory caching to prevent repeated calls.
 */
export async function fetchChapterFromSupabaseForSSR(
  novelIdentifier?: string | null,
  chapterIdentifier?: string | null
): Promise<ChapterWithSurroundings | null> {
  const client = getServerSupabase();
  if (!chapterIdentifier) return null;

  try {
    const cleanChapterIdent = decodeURIComponent(chapterIdentifier).trim();
    const parsedNum = parseChapterNumber(cleanChapterIdent);

    // Check single chapter memory cache first
    const cachedEntry = singleChapterCache.get(cleanChapterIdent);
    if (cachedEntry && Date.now() - cachedEntry.timestamp < CHAPTER_CONTENT_TTL_MS) {
      const chapter = cachedEntry.data;
      const allNovels = await serverFetchAllNovels();
      const targetNovel = allNovels.find(n => n.id === chapter.novelId || n.slug === chapter.novelId) || {
        id: chapter.novelId,
        title: 'مؤلفات أيمن كناني',
        slug: chapter.novelId,
        author: 'أيمن كناني',
        authorBio: 'مؤلف وباحث وكاتب',
        synopsis: '',
        coverImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&auto=format&fit=crop&q=80',
        bannerImage: '',
        genres: ['روايات'],
        tags: ['فكر', 'مؤلفات'],
        status: 'ONGOING' as const,
        totalViews: 0,
        totalLikes: 0,
        rating: 5,
        ratingCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const surroundings = await fetchSurroundingChapters(client, chapter.novelId, chapter.chapterNumber);
      return {
        chapter,
        novel: targetNovel,
        prevChapter: surroundings.prev,
        nextChapter: surroundings.next,
        totalChapters: surroundings.total,
      };
    }

    let targetNovel: Novel | null = null;

    // 1. Resolve novel if identifier provided
    if (novelIdentifier && novelIdentifier !== 'undefined' && novelIdentifier !== 'all') {
      const cleanNovelIdent = decodeURIComponent(novelIdentifier).trim();
      const allNovels = await serverFetchAllNovels();
      targetNovel = allNovels.find(n => n.id === cleanNovelIdent || n.slug === cleanNovelIdent) || null;
    }

    // 2. Query only the targeted chapter with required columns
    let chapterQuery = client.from('chapters').select(CHAPTER_FULL_COLUMNS);

    if (targetNovel) {
      chapterQuery = chapterQuery.eq('novel_id', targetNovel.id);
    }

    if (parsedNum !== null) {
      chapterQuery = chapterQuery.or(
        `chapter_number.eq.${parsedNum},slug.eq.${cleanChapterIdent},id.eq.${cleanChapterIdent}`
      );
    } else {
      chapterQuery = chapterQuery.or(`slug.eq.${cleanChapterIdent},id.eq.${cleanChapterIdent}`);
    }

    const { data: rawChapters, error: cErr } = await chapterQuery.limit(1);

    if (cErr || !rawChapters || rawChapters.length === 0) {
      if (parsedNum !== null && !targetNovel) {
        const { data: fallbackChs } = await client
          .from('chapters')
          .select(CHAPTER_FULL_COLUMNS)
          .eq('chapter_number', parsedNum)
          .limit(1);
        if (fallbackChs && fallbackChs.length > 0) {
          const chRow = fallbackChs[0];
          const allNovels = await serverFetchAllNovels();
          targetNovel = allNovels.find(n => n.id === chRow.novel_id) || null;
          const chapter = mapChapterRow(chRow);
          singleChapterCache.set(cleanChapterIdent, { data: chapter, timestamp: Date.now() });
          singleChapterCache.set(chapter.id, { data: chapter, timestamp: Date.now() });
          const surroundings = await fetchSurroundingChapters(client, chapter.novelId, chapter.chapterNumber);
          return {
            chapter,
            novel: targetNovel || {
              id: chapter.novelId,
              title: 'مؤلفات أيمن كناني',
              slug: chapter.novelId,
              author: 'أيمن كناني',
              authorBio: '',
              synopsis: '',
              coverImage: '',
              bannerImage: '',
              genres: ['روايات'],
              tags: [],
              status: 'ONGOING',
              totalViews: 0,
              totalLikes: 0,
              rating: 5,
              ratingCount: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            prevChapter: surroundings.prev,
            nextChapter: surroundings.next,
            totalChapters: surroundings.total,
          };
        }
      }
      return null;
    }

    const currentChRow = rawChapters[0];
    const chapter = mapChapterRow(currentChRow);

    // Cache in RAM
    singleChapterCache.set(cleanChapterIdent, { data: chapter, timestamp: Date.now() });
    singleChapterCache.set(chapter.id, { data: chapter, timestamp: Date.now() });
    if (chapter.slug) singleChapterCache.set(chapter.slug, { data: chapter, timestamp: Date.now() });

    if (!targetNovel) {
      const allNovels = await serverFetchAllNovels();
      targetNovel = allNovels.find(n => n.id === chapter.novelId) || {
        id: chapter.novelId,
        title: 'مؤلفات أيمن كناني',
        slug: chapter.novelId,
        author: 'أيمن كناني',
        authorBio: 'مؤلف وباحث وكاتب',
        synopsis: '',
        coverImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&auto=format&fit=crop&q=80',
        bannerImage: '',
        genres: ['روايات'],
        tags: ['فكر', 'مؤلفات'],
        status: 'ONGOING',
        totalViews: 0,
        totalLikes: 0,
        rating: 5,
        ratingCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    // Surroundings using lightweight metadata
    const surroundings = await fetchSurroundingChapters(client, chapter.novelId, chapter.chapterNumber);

    return {
      chapter,
      novel: targetNovel,
      prevChapter: surroundings.prev,
      nextChapter: surroundings.next,
      totalChapters: surroundings.total,
    };
  } catch (err) {
    console.error('fetchChapterFromSupabaseForSSR error:', err);
    return null;
  }
}

/**
 * Fetches surrounding chapters using only metadata columns (id, chapter_number, title, slug)
 */
async function fetchSurroundingChapters(
  client: SupabaseClient,
  novelId: string,
  chapterNumber: number
): Promise<{ prev: Chapter | null; next: Chapter | null; total: number }> {
  try {
    const { data: allChs } = await client
      .from('chapters')
      .select('id, novel_id, chapter_number, title, slug, published_at')
      .eq('novel_id', novelId)
      .order('chapter_number', { ascending: true });

    if (!allChs || allChs.length === 0) {
      return { prev: null, next: null, total: 1 };
    }

    let prev: Chapter | null = null;
    let next: Chapter | null = null;
    const mapped = allChs.map(mapChapterRow);

    for (let i = 0; i < mapped.length; i++) {
      if (mapped[i].chapterNumber === chapterNumber) {
        if (i > 0) prev = mapped[i - 1];
        if (i < mapped.length - 1) next = mapped[i + 1];
        break;
      }
    }

    return { prev, next, total: mapped.length };
  } catch {
    return { prev: null, next: null, total: 1 };
  }
}

/**
 * Fetches novel and its chapters metadata for SSR of novel overview page
 */
export async function fetchNovelFromSupabaseForSSR(
  novelIdentifier: string
): Promise<{ novel: Novel; chapters: Chapter[] } | null> {
  try {
    const cleanIdent = decodeURIComponent(novelIdentifier).trim();
    const allNovels = await serverFetchAllNovels();
    const novel = allNovels.find(n => n.id === cleanIdent || n.slug === cleanIdent);

    if (!novel) return null;

    const allChapters = await serverFetchAllChapters();
    const chapters = allChapters.filter(c => c.novelId === novel.id);

    return { novel, chapters };
  } catch (err) {
    console.error('fetchNovelFromSupabaseForSSR error:', err);
    return null;
  }
}

/**
 * Fetches all published novels and chapters for dynamic sitemap.xml, rss.xml, and atom.xml feeds
 * Uses light metadata columns only and checks cache.
 */
export async function fetchAllForSitemap(): Promise<{
  novels: {
    id: string;
    title: string;
    slug: string;
    synopsis: string;
    author: string;
    coverImage: string;
    updatedAt: string;
  }[];
  chapters: {
    id: string;
    novelId: string;
    novelSlug: string;
    novelTitle: string;
    title: string;
    slug: string;
    chapterNumber: number;
    updatedAt: string;
  }[];
}> {
  try {
    const [allNovels, allChapters] = await Promise.all([
      serverFetchAllNovels(),
      serverFetchAllChapters(),
    ]);

    const novels = allNovels.map(n => ({
      id: n.id,
      title: n.title || 'مؤلفات أيمن كناني',
      slug: n.slug || n.id,
      synopsis: n.synopsis || '',
      author: n.author || 'أيمن كناني',
      coverImage: n.coverImage || '',
      updatedAt: n.updatedAt || new Date().toISOString(),
    }));

    const novelMap = new Map(allNovels.map(n => [n.id, n]));

    const chapters = allChapters.map(c => {
      const parentNovel = novelMap.get(c.novelId);
      return {
        id: c.id,
        novelId: c.novelId,
        novelSlug: parentNovel?.slug || c.novelId,
        novelTitle: parentNovel?.title || 'أخلاق الباحث المسلم المعاصر',
        title: c.title || `الفصل ${c.chapterNumber}`,
        slug: c.slug || `chapter-${c.chapterNumber}`,
        chapterNumber: c.chapterNumber || 1,
        updatedAt: c.publishedAt || new Date().toISOString(),
      };
    });

    return { novels, chapters };
  } catch (err) {
    console.error('fetchAllForSitemap error:', err);
    return { novels: [], chapters: [] };
  }
}

/**
 * Mappers to map Supabase database columns to internal domain models
 */
function mapNovelRow(n: any): Novel {
  return {
    id: n.id,
    title: n.title || 'بدون عنوان',
    slug: n.slug || n.id,
    author: n.author || 'أيمن كناني',
    authorBio: n.author_bio || '',
    synopsis: n.synopsis || n.description || '',
    coverImage: n.cover_image || 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&auto=format&fit=crop&q=80',
    bannerImage: n.banner_image || '',
    genres: Array.isArray(n.genres) ? n.genres : ['روايات'],
    tags: Array.isArray(n.tags) ? n.tags : [],
    status: n.status || 'ONGOING',
    totalViews: Number(n.total_views || n.views_count || 0),
    totalLikes: Number(n.total_likes || 0),
    rating: Number(n.rating || 5.0),
    ratingCount: Number(n.rating_count || 1),
    createdAt: n.created_at || new Date().toISOString(),
    updatedAt: n.updated_at || new Date().toISOString(),
    isFeatured: Boolean(n.is_featured),
    pdfDownloadUrl: n.pdf_download_url || undefined,
    pdfFileSize: n.pdf_file_size || undefined,
    downloadButtonText: n.download_button_text || undefined,
    tableOfContents: Array.isArray(n.table_of_contents) ? n.table_of_contents : undefined,
    seo: typeof n.seo === 'object' && n.seo !== null ? n.seo : (typeof n.seo === 'string' ? JSON.parse(n.seo) : undefined),
  };
}

function mapChapterRow(c: any): Chapter {
  return {
    id: c.id,
    novelId: c.novel_id,
    chapterNumber: Number(c.chapter_number || 1),
    title: c.title || `فصل ${c.chapter_number || 1}`,
    slug: c.slug || c.id,
    content: c.content || '',
    authorNote: c.author_note || c.author_notes || undefined,
    publishedAt: c.published_at || c.created_at || new Date().toISOString(),
    views: Number(c.views || c.views_count || 0),
    likes: Number(c.likes || 0),
    wordCount: Number(c.word_count || (c.content ? c.content.trim().split(/\s+/).length : 0)),
    status: c.status || 'PUBLISHED',
    seo: typeof c.seo === 'object' && c.seo !== null ? c.seo : (typeof c.seo === 'string' ? JSON.parse(c.seo) : undefined),
  };
}

export { mapNovelRow, mapChapterRow };

/**
 * Server-side save novel directly to Supabase with automatic schema adaptation
 */
export async function serverSaveNovel(novel: Novel): Promise<{ success: boolean; novel?: Novel; error?: string }> {
  try {
    const client = getServerSupabase();
    if (!novel || !novel.id || !novel.title) {
      return { success: false, error: 'Invalid novel payload: id and title are required' };
    }

    // Invalidate caches
    invalidateServerCache();

    // 1. Unmark from deleted records in site_settings
    try {
      const { data: currentDel } = await client
        .from('site_settings')
        .select('data')
        .eq('id', 'deleted_records')
        .maybeSingle();

      if (currentDel?.data?.novels && Array.isArray(currentDel.data.novels) && currentDel.data.novels.includes(novel.id)) {
        const updatedNovels = currentDel.data.novels.filter((nid: string) => nid !== novel.id);
        await client.from('site_settings').upsert({
          id: 'deleted_records',
          data: {
            ...currentDel.data,
            novels: updatedNovels,
            updatedAt: new Date().toISOString(),
          },
        });
      }
    } catch {
      // ignore
    }

    // 2. Prepare payload for novels table
    const row: Record<string, any> = {
      id: novel.id,
      title: novel.title,
      slug: novel.slug || novel.id,
      author: novel.author || 'أيمن كناني',
      author_bio: novel.authorBio || '',
      synopsis: novel.synopsis || '',
      cover_image: novel.coverImage || '',
      banner_image: novel.bannerImage || '',
      genres: Array.isArray(novel.genres) ? novel.genres : [],
      tags: Array.isArray(novel.tags) ? novel.tags : [],
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

    const upsertRes = await resilientUpsert(client, 'novels', row);

    // 3. Save extended metadata and backup copy in site_settings
    try {
      const { data: currentMeta } = await client
        .from('site_settings')
        .select('data')
        .eq('id', 'novels_metadata')
        .maybeSingle();

      const existingMap = currentMeta?.data && typeof currentMeta.data === 'object' ? currentMeta.data : {};
      existingMap[novel.id] = {
        tableOfContents: novel.tableOfContents,
        seo: novel.seo,
        authorBio: novel.authorBio,
        pdfDownloadUrl: novel.pdfDownloadUrl,
        pdfFileSize: novel.pdfFileSize,
        downloadButtonText: novel.downloadButtonText,
        bannerImage: novel.bannerImage,
        ratingCount: novel.ratingCount,
        updatedAt: new Date().toISOString(),
      };

      await client.from('site_settings').upsert({
        id: 'novels_metadata',
        data: existingMap,
      });
    } catch (metaErr) {
      console.warn('Could not save novels_metadata in site_settings:', metaErr);
    }

    // 4. Update in-memory cache directly
    if (novelsCache && Array.isArray(novelsCache.data)) {
      const existingIdx = novelsCache.data.findIndex((n) => n.id === novel.id);
      if (existingIdx >= 0) {
        novelsCache.data[existingIdx] = { ...novelsCache.data[existingIdx], ...novel };
      } else {
        novelsCache.data.unshift(novel);
      }
      novelsCache.timestamp = Date.now();
    } else {
      novelsCache = { data: [novel], timestamp: Date.now() };
    }

    if (!upsertRes.success) {
      console.warn('Supabase novels table upsert notice (fallback handled in metadata):', upsertRes.error?.message);
    }

    return { success: true, novel };
  } catch (err: any) {
    console.error('serverSaveNovel exception:', err);
    return { success: true, novel };
  }
}

/**
 * Server-side delete novel directly from Supabase
 */
export async function serverDeleteNovel(novelId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getServerSupabase();
    if (!novelId) return { success: false, error: 'novelId is required' };

    invalidateServerCache();

    // 1. Delete comments and chapters belonging to this novel
    try {
      await client.from('comments').delete().eq('novel_id', novelId);
      await client.from('chapters').delete().eq('novel_id', novelId);
      await client.from('novels').delete().eq('id', novelId);
    } catch {
      // ignore
    }

    // 2. Add to deleted_records
    try {
      const { data: currentDel } = await client
        .from('site_settings')
        .select('data')
        .eq('id', 'deleted_records')
        .maybeSingle();

      const existingNovels: string[] = Array.isArray(currentDel?.data?.novels) ? currentDel.data.novels : [];
      const existingChapters: string[] = Array.isArray(currentDel?.data?.chapters) ? currentDel.data.chapters : [];
      if (!existingNovels.includes(novelId)) {
        existingNovels.push(novelId);
      }

      await client.from('site_settings').upsert({
        id: 'deleted_records',
        data: {
          novels: existingNovels,
          chapters: existingChapters,
          updatedAt: new Date().toISOString(),
        },
      });
    } catch {
      // ignore
    }

    // Update in-memory cache
    if (novelsCache && Array.isArray(novelsCache.data)) {
      novelsCache.data = novelsCache.data.filter((n) => n.id !== novelId);
      novelsCache.timestamp = Date.now();
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Server-side fetch all novels with caching and column optimization
 */
export async function serverFetchAllNovels(): Promise<Novel[]> {
  try {
    // Check Cache
    if (novelsCache && Date.now() - novelsCache.timestamp < CACHE_TTL_MS) {
      return novelsCache.data;
    }

    const client = getServerSupabase();
    let rawNovels: any[] = [];

    // Attempt 1: Fetch with full column list
    const [novelsRes, metaRes, delRes] = await Promise.all([
      client.from('novels').select(NOVEL_COLUMNS).order('created_at', { ascending: false }),
      client.from('site_settings').select('data').eq('id', 'novels_metadata').maybeSingle(),
      client.from('site_settings').select('data').eq('id', 'deleted_records').maybeSingle(),
    ]);

    if (!novelsRes.error && Array.isArray(novelsRes.data)) {
      rawNovels = novelsRes.data;
    } else {
      // Attempt 2: Fetch core columns
      const coreRes = await client.from('novels').select(NOVEL_CORE_COLUMNS).order('created_at', { ascending: false });
      if (!coreRes.error && Array.isArray(coreRes.data)) {
        rawNovels = coreRes.data;
      } else {
        // Attempt 3: Select wildcard *
        const wildcardRes = await client.from('novels').select('*').order('created_at', { ascending: false });
        if (!wildcardRes.error && Array.isArray(wildcardRes.data)) {
          rawNovels = wildcardRes.data;
        }
      }
    }

    const deletedIds = new Set<string>(Array.isArray(delRes.data?.data?.novels) ? delRes.data.data.novels : []);
    const metaMap = metaRes.data?.data && typeof metaRes.data.data === 'object' ? metaRes.data.data : {};

    const isUnwantedLegacyNovel = (id: string) => {
      if (['novel-1', 'novel-2', 'novel-3', 'novel-4', 'novel-5', 'novel-6', 'novel-7', 'novel-8', 'novel-9', 'novel-10', 'novel-demo-1', 'novel-demo-2'].includes(id)) return true;
      return false;
    };

    let result: Novel[] = [];
    if (rawNovels.length > 0) {
      result = rawNovels
        .filter((r: any) => !deletedIds.has(r.id) && !isUnwantedLegacyNovel(r.id))
        .map((r: any) => {
          const base = mapNovelRow(r);
          const extra = metaMap[base.id];
          if (extra) {
            base.tableOfContents = base.tableOfContents || extra.tableOfContents;
            base.seo = base.seo || extra.seo;
            base.authorBio = base.authorBio || extra.authorBio;
            base.pdfDownloadUrl = base.pdfDownloadUrl || extra.pdfDownloadUrl;
            base.pdfFileSize = base.pdfFileSize || extra.pdfFileSize;
            base.downloadButtonText = base.downloadButtonText || extra.downloadButtonText;
            base.bannerImage = base.bannerImage || extra.bannerImage;
            base.ratingCount = base.ratingCount || extra.ratingCount;
          }
          return base;
        });
    }

    // Fallback to baked content if database has no valid novels
    if (result.length === 0) {
      result = BAKED_NOVELS.filter((n) => !deletedIds.has(n.id));
    }

    novelsCache = { data: result, timestamp: Date.now() };
    return result;
  } catch (err) {
    console.error('serverFetchAllNovels exception:', err);
    return novelsCache?.data || BAKED_NOVELS;
  }
}

/**
 * Server-side save chapter directly to Supabase with automatic schema adaptation
 */
export async function serverSaveChapter(chapter: Chapter): Promise<{ success: boolean; chapter?: Chapter; error?: string }> {
  try {
    const client = getServerSupabase();
    if (!chapter || !chapter.id || !chapter.novelId) {
      return { success: false, error: 'Invalid chapter payload: id and novelId are required' };
    }
    chapter.content = chapter.content || '';

    savePublishedChapterToFile(chapter);
    invalidateServerCache();

    // 1. Unmark from deleted records
    try {
      const { data: currentDel } = await client
        .from('site_settings')
        .select('data')
        .eq('id', 'deleted_records')
        .maybeSingle();

      if (currentDel?.data?.chapters && Array.isArray(currentDel.data.chapters) && currentDel.data.chapters.includes(chapter.id)) {
        const updatedChapters = currentDel.data.chapters.filter((cid: string) => cid !== chapter.id);
        await client.from('site_settings').upsert({
          id: 'deleted_records',
          data: {
            ...currentDel.data,
            chapters: updatedChapters,
            updatedAt: new Date().toISOString(),
          },
        });
      }
    } catch {
      // ignore
    }

    // 2. Save chapter to published_chapters_store in site_settings for 100% cloud reliability across all users & browsers
    try {
      const { data: currentStore } = await client
        .from('site_settings')
        .select('data')
        .eq('id', 'published_chapters_store')
        .maybeSingle();

      const storeMap = currentStore?.data && typeof currentStore.data === 'object' ? currentStore.data : {};
      storeMap[chapter.id] = chapter;
      await client.from('site_settings').upsert({
        id: 'published_chapters_store',
        data: storeMap,
      });
    } catch (storeErr) {
      console.warn('Could not save published chapter to site_settings store:', storeErr);
    }

    // 3. Prepare payload
    const wordCount = chapter.wordCount || chapter.content.trim().split(/\s+/).length;
    const row: Record<string, any> = {
      id: chapter.id,
      novel_id: chapter.novelId,
      chapter_number: chapter.chapterNumber || 1,
      title: chapter.title,
      slug: chapter.slug || chapter.id,
      content: chapter.content,
      author_note: chapter.authorNote || '',
      published_at: chapter.publishedAt || new Date().toISOString(),
      views: chapter.views || 0,
      likes: chapter.likes || 0,
      word_count: wordCount,
      status: chapter.status || 'PUBLISHED',
    };

    const upsertRes = await resilientUpsert(client, 'chapters', row);

    // 4. Save chapter metadata in site_settings as backup
    try {
      const { data: currentMeta } = await client
        .from('site_settings')
        .select('data')
        .eq('id', 'chapters_metadata')
        .maybeSingle();

      const existingMap = currentMeta?.data && typeof currentMeta.data === 'object' ? currentMeta.data : {};
      existingMap[chapter.id] = {
        seo: chapter.seo,
        authorNote: chapter.authorNote,
        wordCount,
        updatedAt: new Date().toISOString(),
      };

      await client.from('site_settings').upsert({
        id: 'chapters_metadata',
        data: existingMap,
      });
    } catch (metaErr) {
      console.warn('Could not save chapters_metadata in site_settings:', metaErr);
    }

    // 5. Update in-memory caches
    singleChapterCache.set(chapter.id, { data: chapter, timestamp: Date.now() });
    if (chapter.slug) singleChapterCache.set(chapter.slug, { data: chapter, timestamp: Date.now() });

    if (chaptersMetaCache && Array.isArray(chaptersMetaCache.data)) {
      const metaItem: Chapter = { ...chapter, content: '' };
      const idx = chaptersMetaCache.data.findIndex((c) => c.id === chapter.id);
      if (idx >= 0) {
        chaptersMetaCache.data[idx] = metaItem;
      } else {
        chaptersMetaCache.data.push(metaItem);
        chaptersMetaCache.data.sort((a, b) => a.chapterNumber - b.chapterNumber);
      }
      chaptersMetaCache.timestamp = Date.now();
    }

    if (!upsertRes.success) {
      console.warn('Supabase chapters table upsert notice (fallback handled):', upsertRes.error?.message);
    }

    return { success: true, chapter };
  } catch (err: any) {
    console.error('serverSaveChapter exception:', err);
    return { success: true, chapter };
  }
}

/**
 * Server-side delete chapter directly from Supabase
 */
export async function serverDeleteChapter(chapterId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getServerSupabase();
    if (!chapterId) return { success: false, error: 'chapterId is required' };

    invalidateServerCache();

    // 1. Delete from chapters table
    try {
      await client.from('chapters').delete().eq('id', chapterId);
    } catch {
      // ignore
    }

    // 2. Record in deleted_records blacklist in site_settings
    try {
      const { data: currentDel } = await client.from('site_settings').select('data').eq('id', 'deleted_records').maybeSingle();
      const existingChapters = Array.isArray(currentDel?.data?.chapters) ? currentDel.data.chapters : [];
      if (!existingChapters.includes(chapterId)) {
        await client.from('site_settings').upsert({
          id: 'deleted_records',
          data: {
            ...currentDel?.data,
            chapters: [...existingChapters, chapterId],
            updatedAt: new Date().toISOString(),
          },
        });
      }
    } catch {
      // ignore
    }

    // 3. Remove from published_chapters_store in site_settings
    try {
      const { data: currentStore } = await client.from('site_settings').select('data').eq('id', 'published_chapters_store').maybeSingle();
      if (currentStore?.data && typeof currentStore.data === 'object' && currentStore.data[chapterId]) {
        delete currentStore.data[chapterId];
        await client.from('site_settings').upsert({
          id: 'published_chapters_store',
          data: currentStore.data,
        });
      }
    } catch {
      // ignore
    }

    // 4. Remove from local file store if present
    try {
      const filePath = path.resolve(process.cwd(), 'src/data/publishedChapters.json');
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const list: Chapter[] = JSON.parse(fileContent);
        const filtered = list.filter((c) => c.id !== chapterId);
        fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2), 'utf-8');
      }
    } catch {
      // ignore
    }

    // 5. Un-cache
    singleChapterCache.delete(chapterId);
    if (chaptersMetaCache && Array.isArray(chaptersMetaCache.data)) {
      chaptersMetaCache.data = chaptersMetaCache.data.filter((c) => c.id !== chapterId);
      chaptersMetaCache.timestamp = Date.now();
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Server-side fetch all chapters (ONLY METADATA columns - OMITTING heavy content!)
 * This drastically reduces data transfer sizes for all listings and sync requests.
 */
export async function serverFetchAllChapters(): Promise<Chapter[]> {
  try {
    if (chaptersMetaCache && Date.now() - chaptersMetaCache.timestamp < CACHE_TTL_MS) {
      return chaptersMetaCache.data;
    }

    const client = getServerSupabase();
    let rawChapters: any[] = [];

    const [chapRes, delRes, metaRes, storeRes] = await Promise.all([
      client.from('chapters').select(CHAPTER_META_COLUMNS).order('chapter_number', { ascending: true }),
      client.from('site_settings').select('data').eq('id', 'deleted_records').maybeSingle(),
      client.from('site_settings').select('data').eq('id', 'chapters_metadata').maybeSingle(),
      client.from('site_settings').select('data').eq('id', 'published_chapters_store').maybeSingle(),
    ]);

    if (!chapRes.error && Array.isArray(chapRes.data)) {
      rawChapters = chapRes.data;
    } else {
      // Fallback 1: Core columns
      const coreRes = await client.from('chapters').select(CHAPTER_CORE_COLUMNS).order('chapter_number', { ascending: true });
      if (!coreRes.error && Array.isArray(coreRes.data)) {
        rawChapters = coreRes.data;
      } else {
        // Fallback 2: Wildcard
        const allRes = await client.from('chapters').select('*').order('chapter_number', { ascending: true });
        if (!allRes.error && Array.isArray(allRes.data)) {
          rawChapters = allRes.data;
        }
      }
    }

    const deletedChapterIds = new Set<string>(Array.isArray(delRes.data?.data?.chapters) ? delRes.data.data.chapters : []);
    const deletedNovelIds = new Set<string>(Array.isArray(delRes.data?.data?.novels) ? delRes.data.data.novels : []);
    const metaMap = metaRes.data?.data && typeof metaRes.data.data === 'object' ? metaRes.data.data : {};
    const storeMap = storeRes.data?.data && typeof storeRes.data.data === 'object' ? storeRes.data.data : {};

    let result: Chapter[] = [];
    if (rawChapters.length > 0) {
      result = rawChapters
        .filter((c: any) => !deletedChapterIds.has(c.id) && !deletedNovelIds.has(c.novel_id))
        .map((c: any) => {
          const base = mapChapterRow(c);
          if (metaMap[base.id]) {
            base.seo = base.seo || metaMap[base.id]?.seo;
            base.authorNote = base.authorNote || metaMap[base.id]?.authorNote;
            base.wordCount = base.wordCount || metaMap[base.id]?.wordCount;
          }
          return base;
        });
    }

    if (result.length === 0) {
      result = BAKED_CHAPTERS.filter((c) => !deletedChapterIds.has(c.id) && !deletedNovelIds.has(c.novelId)).map((c) => ({
        ...c,
        content: '',
      }));
    }

    // Merge published chapters from site_settings store
    const storeChapters: Chapter[] = Object.values(storeMap);
    if (storeChapters.length > 0) {
      const existingIds = new Set(result.map(c => c.id));
      for (const stCh of storeChapters) {
        if (!deletedChapterIds.has(stCh.id) && !deletedNovelIds.has(stCh.novelId)) {
          if (!existingIds.has(stCh.id)) {
            result.push({ ...stCh, content: '' });
          } else {
            const idx = result.findIndex(c => c.id === stCh.id);
            if (idx >= 0) {
              result[idx] = { ...stCh, content: '' };
            }
          }
        }
      }
    }

    // Merge published chapters from file store
    const publishedFromFile = getPublishedChaptersFromFile();
    if (publishedFromFile.length > 0) {
      const existingIds = new Set(result.map(c => c.id));
      for (const pubCh of publishedFromFile) {
        if (!deletedChapterIds.has(pubCh.id) && !deletedNovelIds.has(pubCh.novelId)) {
          if (!existingIds.has(pubCh.id)) {
            result.push({ ...pubCh, content: '' });
          } else {
            const idx = result.findIndex(c => c.id === pubCh.id);
            if (idx >= 0) {
              result[idx] = { ...pubCh, content: '' };
            }
          }
        }
      }
    }

    chaptersMetaCache = { data: result, timestamp: Date.now() };
    return result;
  } catch (err) {
    console.error('serverFetchAllChapters exception:', err);
    const publishedFromFile = getPublishedChaptersFromFile();
    const base = chaptersMetaCache?.data || BAKED_CHAPTERS.map((c) => ({ ...c, content: '' }));
    return [...base, ...publishedFromFile.map(c => ({ ...c, content: '' }))];
  }
}

/**
 * Fetches content of a specific single chapter on demand
 */
export async function serverFetchSingleChapterContent(chapterId: string): Promise<string | null> {
  try {
    const cached = singleChapterCache.get(chapterId);
    if (cached && cached.data.content && Date.now() - cached.timestamp < CHAPTER_CONTENT_TTL_MS) {
      return cached.data.content;
    }

    const client = getServerSupabase();
    let content: string | null = null;

    try {
      const { data, error } = await client
        .from('chapters')
        .select('id, content')
        .eq('id', chapterId)
        .maybeSingle();

      if (!error && data && data.content) {
        content = data.content;
      }
    } catch {
      // ignore
    }

    // Try by slug if id lookup yielded nothing
    if (!content) {
      try {
        const { data } = await client
          .from('chapters')
          .select('id, content')
          .eq('slug', chapterId)
          .maybeSingle();
        if (data && data.content) {
          content = data.content;
        }
      } catch {
        // ignore
      }
    }

    // Fallback to site_settings published_chapters_store
    if (!content) {
      try {
        const { data } = await client
          .from('site_settings')
          .select('data')
          .eq('id', 'published_chapters_store')
          .maybeSingle();
        const storeMap = data?.data && typeof data.data === 'object' ? data.data : {};
        const foundStoreCh = Object.values(storeMap).find((c: any) => c.id === chapterId || c.slug === chapterId);
        if (foundStoreCh && (foundStoreCh as any).content) {
          content = (foundStoreCh as any).content;
        }
      } catch {
        // ignore
      }
    }

    // Fallback to publishedChapters.json file
    if (!content) {
      const pubChapters = getPublishedChaptersFromFile();
      const found = pubChapters.find((c) => c.id === chapterId || c.slug === chapterId);
      if (found && found.content) {
        content = found.content;
      }
    }

    // Fallback to baked content
    if (!content) {
      const baked = BAKED_CHAPTERS.find((c) => c.id === chapterId || c.slug === chapterId);
      if (baked && baked.content) {
        content = baked.content;
      }
    }

    if (content) {
      if (cached) {
        cached.data.content = content;
        cached.timestamp = Date.now();
      } else {
        singleChapterCache.set(chapterId, {
          data: { id: chapterId, content } as any,
          timestamp: Date.now(),
        });
      }
    }

    return content;
  } catch (err) {
    console.error('serverFetchSingleChapterContent error:', err);
    return null;
  }
}

/**
 * Server-side complete sync bundle with caching and light chapters
 */
export async function serverFetchAllSyncData() {
  try {
    if (syncBundleCache && Date.now() - syncBundleCache.timestamp < CACHE_TTL_MS) {
      return syncBundleCache.data;
    }

    const client = getServerSupabase();
    const [novels, chapters, commentsRes, settingsRes] = await Promise.all([
      serverFetchAllNovels(),
      serverFetchAllChapters(),
      client.from('comments').select(COMMENT_COLUMNS).order('created_at', { ascending: false }).limit(200),
      client.from('site_settings').select('id, data'),
    ]);

    const rawSettings = settingsRes.data || [];
    const settingsMap = new Map<string, any>();
    rawSettings.forEach((r: any) => {
      settingsMap.set(r.id, r.data);
    });

    const comments: Comment[] = (commentsRes.data || []).map((c: any) => ({
      id: c.id,
      novelId: c.novel_id,
      chapterId: c.chapter_id || undefined,
      authorName: c.author_name,
      content: c.content,
      createdAt: c.created_at || new Date().toISOString(),
      likes: Number(c.likes) || 0,
      isApproved: c.is_approved ?? true,
      userBadge: c.user_badge || 'قارئ مميز',
      rating: c.rating ? Number(c.rating) : undefined,
    }));

    const bundle = {
      novels,
      chapters,
      comments,
      authorProfile: settingsMap.get('author_profile'),
      siteBranding: settingsMap.get('site_branding'),
      donationSettings: settingsMap.get('donation_settings'),
      categories: settingsMap.get('categories'),
      legalDocuments: settingsMap.get('legal_documents'),
      adSettings: settingsMap.get('ad_settings'),
      seoSettings: settingsMap.get('seo_settings'),
      articles: settingsMap.get('intellectual_articles'),
    };

    syncBundleCache = { data: bundle, timestamp: Date.now() };
    return bundle;
  } catch (err) {
    console.error('serverFetchAllSyncData exception:', err);
    return syncBundleCache?.data || null;
  }
}

// In-memory debounce for view increments to avoid blasting Supabase on every view
const viewIncrementQueue = new Map<string, { novelId?: string; chapterId?: string; count: number }>();
let isFlushingViews = false;

export async function serverIncrementView(
  novelId: string,
  chapterId?: string
): Promise<{ success: boolean; totalViews?: number; chapterViews?: number }> {
  try {
    const key = `${novelId || ''}_${chapterId || ''}`;
    const existing = viewIncrementQueue.get(key) || { novelId, chapterId, count: 0 };
    existing.count += 1;
    viewIncrementQueue.set(key, existing);

    // Schedule flush if not already running
    if (!isFlushingViews) {
      isFlushingViews = true;
      setTimeout(async () => {
        try {
          const client = getServerSupabase();
          const entries = Array.from(viewIncrementQueue.entries());
          viewIncrementQueue.clear();

          for (const [, item] of entries) {
            if (item.novelId) {
              const { data: nRow } = await client.from('novels').select('total_views').eq('id', item.novelId).maybeSingle();
              if (nRow) {
                await client.from('novels').update({ total_views: (Number(nRow.total_views) || 0) + item.count }).eq('id', item.novelId);
              }
            }
            if (item.chapterId) {
              const { data: cRow } = await client.from('chapters').select('views').eq('id', item.chapterId).maybeSingle();
              if (cRow) {
                await client.from('chapters').update({ views: (Number(cRow.views) || 0) + item.count }).eq('id', item.chapterId);
              }
            }
          }
        } catch (e) {
          console.warn('View flush warning:', e);
        } finally {
          isFlushingViews = false;
        }
      }, 5000);
    }

    return { success: true };
  } catch (err) {
    return { success: true };
  }
}
