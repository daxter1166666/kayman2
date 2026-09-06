import { createClient, SupabaseClient } from '@supabase/supabase-js';
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

const DEFAULT_SUPABASE_URL = 'https://kepuolqhropozwfwwwbb.supabase.co';
const DEFAULT_SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlcHVvbHFocm9wb3p3Znd3d2JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMzcyMDgsImV4cCI6MjEwMzkxMzIwOH0.8JfpG8bw-dxwFn64-pAbeRBAxBR9WiaNKQAcJAVCeJw';

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
          // Prevent hung connections in serverless environments (Vercel / Node)
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
 * Fetches a chapter and its novel directly from Supabase for Server-Side Rendering
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

    let targetNovel: Novel | null = null;

    // 1. If novelIdentifier is supplied, resolve the novel first
    if (novelIdentifier && novelIdentifier !== 'undefined' && novelIdentifier !== 'all') {
      const cleanNovelIdent = decodeURIComponent(novelIdentifier).trim();
      const { data: nRow } = await client
        .from('novels')
        .select('*')
        .or(`id.eq.${cleanNovelIdent},slug.eq.${cleanNovelIdent}`)
        .maybeSingle();

      if (nRow) {
        targetNovel = mapNovelRow(nRow);
      }
    }

    // 2. Query the chapter
    let chapterQuery = client.from('chapters').select('*');

    if (targetNovel) {
      chapterQuery = chapterQuery.eq('novel_id', targetNovel.id);
    }

    if (parsedNum !== null) {
      // Look up by chapter_number or slug/id
      chapterQuery = chapterQuery.or(
        `chapter_number.eq.${parsedNum},slug.eq.${cleanChapterIdent},id.eq.${cleanChapterIdent}`
      );
    } else {
      // Look up by exact slug or id
      chapterQuery = chapterQuery.or(`slug.eq.${cleanChapterIdent},id.eq.${cleanChapterIdent}`);
    }

    const { data: rawChapters, error: cErr } = await chapterQuery.limit(1);

    if (cErr || !rawChapters || rawChapters.length === 0) {
      // If not found with targetNovel or specific query, try loose lookup by chapter number if available
      if (parsedNum !== null && !targetNovel) {
        const { data: fallbackChs } = await client
          .from('chapters')
          .select('*')
          .eq('chapter_number', parsedNum)
          .limit(1);
        if (fallbackChs && fallbackChs.length > 0) {
          const chRow = fallbackChs[0];
          const { data: nRow } = await client
            .from('novels')
            .select('*')
            .eq('id', chRow.novel_id)
            .maybeSingle();
          if (nRow) {
            targetNovel = mapNovelRow(nRow);
            const chapter = mapChapterRow(chRow);
            const surroundings = await fetchSurroundingChapters(client, chapter.novelId, chapter.chapterNumber);
            return {
              chapter,
              novel: targetNovel,
              prevChapter: surroundings.prev,
              nextChapter: surroundings.next,
              totalChapters: surroundings.total,
            };
          }
        }
      }
      return null;
    }

    const currentChRow = rawChapters[0];
    const chapter = mapChapterRow(currentChRow);

    // If we didn't have the novel yet, query it using chapter's novel_id
    if (!targetNovel) {
      const { data: nRow } = await client
        .from('novels')
        .select('*')
        .eq('id', chapter.novelId)
        .maybeSingle();
      if (nRow) {
        targetNovel = mapNovelRow(nRow);
      } else {
        // Fallback default novel container
        targetNovel = {
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
    }

    // 3. Fetch surrounding chapters for pagination
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
 * Fetches surrounding previous and next chapters for navigation
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
 * Fetches novel and its chapters for SSR of novel overview page
 */
export async function fetchNovelFromSupabaseForSSR(
  novelIdentifier: string
): Promise<{ novel: Novel; chapters: Chapter[] } | null> {
  const client = getServerSupabase();
  try {
    const cleanIdent = decodeURIComponent(novelIdentifier).trim();
    const { data: nRow, error } = await client
      .from('novels')
      .select('*')
      .or(`id.eq.${cleanIdent},slug.eq.${cleanIdent}`)
      .maybeSingle();

    if (error || !nRow) return null;

    const novel = mapNovelRow(nRow);

    const { data: cRows } = await client
      .from('chapters')
      .select('*')
      .eq('novel_id', novel.id)
      .order('chapter_number', { ascending: true });

    const chapters = (cRows || []).map(mapChapterRow);

    return { novel, chapters };
  } catch (err) {
    console.error('fetchNovelFromSupabaseForSSR error:', err);
    return null;
  }
}

/**
 * Fetches all published novels and chapters for dynamic sitemap.xml
 */
export async function fetchAllForSitemap(): Promise<{
  novels: { id: string; slug: string; updatedAt: string }[];
  chapters: { id: string; novelId: string; novelSlug?: string; slug: string; chapterNumber: number; updatedAt: string }[];
}> {
  const client = getServerSupabase();
  try {
    const [nRes, cRes] = await Promise.all([
      client.from('novels').select('id, slug, updated_at, created_at'),
      client.from('chapters').select('id, novel_id, slug, chapter_number, published_at, updated_at'),
    ]);

    const novels = (nRes.data || []).map((n: any) => ({
      id: n.id,
      slug: n.slug || n.id,
      updatedAt: n.updated_at || n.created_at || new Date().toISOString(),
    }));

    const novelSlugMap = new Map(novels.map(n => [n.id, n.slug]));

    const chapters = (cRes.data || []).map((c: any) => ({
      id: c.id,
      novelId: c.novel_id,
      novelSlug: novelSlugMap.get(c.novel_id),
      slug: c.slug || `chapter-${c.chapter_number}`,
      chapterNumber: c.chapter_number || 1,
      updatedAt: c.updated_at || c.published_at || new Date().toISOString(),
    }));

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
 * Server-side save novel directly to Supabase with automatic column fallback and metadata preservation
 */
export async function serverSaveNovel(novel: Novel): Promise<{ success: boolean; novel?: Novel; error?: string }> {
  try {
    const client = getServerSupabase();
    if (!novel || !novel.id || !novel.title) {
      return { success: false, error: 'Invalid novel payload: id and title are required' };
    }

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

    // 3. Upsert with resilient missing column retry
    let currentPayload = { ...row };
    let maxAttempts = 6;
    let lastError: any = null;

    while (maxAttempts > 0) {
      const res = await client.from('novels').upsert(currentPayload);
      lastError = res.error;
      if (!lastError) break;

      const missingColMatch = lastError.message?.match(/Could not find the '([^']+)' column/i);
      if (missingColMatch && missingColMatch[1]) {
        delete currentPayload[missingColMatch[1]];
        maxAttempts--;
        continue;
      }
      break;
    }

    if (lastError) {
      console.error('Server saveNovel error:', lastError);
      return { success: false, error: lastError.message || String(lastError) };
    }

    // 4. Save metadata (TOC, SEO) in site_settings so rich structure is never lost
    if (novel.tableOfContents || novel.seo) {
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
          updatedAt: new Date().toISOString(),
        };

        await client.from('site_settings').upsert({
          id: 'novels_metadata',
          data: existingMap,
        });
      } catch (metaErr) {
        console.warn('Could not save novels_metadata in site_settings:', metaErr);
      }
    }

    return { success: true, novel };
  } catch (err: any) {
    console.error('serverSaveNovel exception:', err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Server-side delete novel directly from Supabase
 */
export async function serverDeleteNovel(novelId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getServerSupabase();
    if (!novelId) return { success: false, error: 'novelId is required' };

    // 1. Delete comments and chapters belonging to this novel
    await client.from('comments').delete().eq('novel_id', novelId);
    await client.from('chapters').delete().eq('novel_id', novelId);

    // 2. Delete the novel itself
    const { error } = await client.from('novels').delete().eq('id', novelId);
    if (error) {
      console.error('serverDeleteNovel Supabase error:', error);
      return { success: false, error: error.message };
    }

    // 3. Remove from novels_metadata
    try {
      const { data: currentMeta } = await client
        .from('site_settings')
        .select('data')
        .eq('id', 'novels_metadata')
        .maybeSingle();
      if (currentMeta?.data && currentMeta.data[novelId]) {
        delete currentMeta.data[novelId];
        await client.from('site_settings').upsert({
          id: 'novels_metadata',
          data: currentMeta.data,
        });
      }
    } catch {
      // ignore
    }

    // 4. Add to deleted_records
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

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Server-side fetch all novels with metadata and deleted filtering
 */
export async function serverFetchAllNovels(): Promise<Novel[]> {
  try {
    const client = getServerSupabase();
    const [novelsRes, metaRes, delRes] = await Promise.all([
      client.from('novels').select('*').order('created_at', { ascending: false }),
      client.from('site_settings').select('data').eq('id', 'novels_metadata').maybeSingle(),
      client.from('site_settings').select('data').eq('id', 'deleted_records').maybeSingle(),
    ]);

    if (novelsRes.error || !novelsRes.data) {
      console.warn('serverFetchAllNovels error:', novelsRes.error);
      return [];
    }

    const deletedIds = new Set<string>(Array.isArray(delRes.data?.data?.novels) ? delRes.data.data.novels : []);
    const metaMap = metaRes.data?.data && typeof metaRes.data.data === 'object' ? metaRes.data.data : {};

    return novelsRes.data
      .filter((r: any) => !deletedIds.has(r.id))
      .map((r: any) => {
        const base = mapNovelRow(r);
        const extra = metaMap[base.id];
        if (extra) {
          base.tableOfContents = base.tableOfContents || extra.tableOfContents;
          base.seo = base.seo || extra.seo;
        }
        return base;
      });
  } catch (err) {
    console.error('serverFetchAllNovels exception:', err);
    return [];
  }
}

/**
 * Server-side save chapter directly to Supabase
 */
export async function serverSaveChapter(chapter: Chapter): Promise<{ success: boolean; chapter?: Chapter; error?: string }> {
  try {
    const client = getServerSupabase();
    if (!chapter || !chapter.id || !chapter.novelId || !chapter.content) {
      return { success: false, error: 'Invalid chapter payload: id, novelId, and content are required' };
    }

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

    // 2. Prepare payload
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
      updated_at: new Date().toISOString(),
    };

    let currentPayload = { ...row };
    let maxAttempts = 6;
    let lastError: any = null;

    while (maxAttempts > 0) {
      const res = await client.from('chapters').upsert(currentPayload);
      lastError = res.error;
      if (!lastError) break;

      const missingColMatch = lastError.message?.match(/Could not find the '([^']+)' column/i);
      if (missingColMatch && missingColMatch[1]) {
        delete currentPayload[missingColMatch[1]];
        maxAttempts--;
        continue;
      }
      break;
    }

    if (lastError) {
      console.error('Server saveChapter error:', lastError);
      return { success: false, error: lastError.message || String(lastError) };
    }

    // 3. Save SEO in chapters_metadata
    if (chapter.seo) {
      try {
        const { data: currentMeta } = await client
          .from('site_settings')
          .select('data')
          .eq('id', 'chapters_metadata')
          .maybeSingle();

        const existingMap = currentMeta?.data && typeof currentMeta.data === 'object' ? currentMeta.data : {};
        existingMap[chapter.id] = chapter.seo;

        await client.from('site_settings').upsert({
          id: 'chapters_metadata',
          data: existingMap,
        });
      } catch (metaErr) {
        console.warn('Could not save chapters_metadata in site_settings:', metaErr);
      }
    }

    return { success: true, chapter };
  } catch (err: any) {
    console.error('serverSaveChapter exception:', err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Server-side delete chapter directly from Supabase
 */
export async function serverDeleteChapter(chapterId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getServerSupabase();
    if (!chapterId) return { success: false, error: 'chapterId is required' };

    const { error } = await client.from('chapters').delete().eq('id', chapterId);
    if (error) {
      console.error('serverDeleteChapter error:', error);
      return { success: false, error: error.message };
    }

    // Add to deleted_records
    try {
      const { data: currentDel } = await client
        .from('site_settings')
        .select('data')
        .eq('id', 'deleted_records')
        .maybeSingle();

      const existingChapters: string[] = Array.isArray(currentDel?.data?.chapters) ? currentDel.data.chapters : [];
      if (!existingChapters.includes(chapterId)) {
        existingChapters.push(chapterId);
      }

      await client.from('site_settings').upsert({
        id: 'deleted_records',
        data: {
          novels: Array.isArray(currentDel?.data?.novels) ? currentDel.data.novels : [],
          chapters: existingChapters,
          updatedAt: new Date().toISOString(),
        },
      });
    } catch {
      // ignore
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Server-side fetch all chapters
 */
export async function serverFetchAllChapters(): Promise<Chapter[]> {
  try {
    const client = getServerSupabase();
    const [chapRes, delRes, metaRes] = await Promise.all([
      client.from('chapters').select('*').order('chapter_number', { ascending: true }),
      client.from('site_settings').select('data').eq('id', 'deleted_records').maybeSingle(),
      client.from('site_settings').select('data').eq('id', 'chapters_metadata').maybeSingle(),
    ]);

    if (chapRes.error || !chapRes.data) return [];

    const deletedChapterIds = new Set<string>(Array.isArray(delRes.data?.data?.chapters) ? delRes.data.data.chapters : []);
    const deletedNovelIds = new Set<string>(Array.isArray(delRes.data?.data?.novels) ? delRes.data.data.novels : []);
    const metaMap = metaRes.data?.data && typeof metaRes.data.data === 'object' ? metaRes.data.data : {};

    return chapRes.data
      .filter((c: any) => !deletedChapterIds.has(c.id) && !deletedNovelIds.has(c.novel_id))
      .map((c: any) => {
        const base = mapChapterRow(c);
        if (metaMap[base.id]) {
          base.seo = base.seo || metaMap[base.id];
        }
        return base;
      });
  } catch (err) {
    console.error('serverFetchAllChapters exception:', err);
    return [];
  }
}

/**
 * Server-side complete sync bundle
 */
export async function serverFetchAllSyncData() {
  try {
    const client = getServerSupabase();
    const [novels, chapters, commentsRes, settingsRes] = await Promise.all([
      serverFetchAllNovels(),
      serverFetchAllChapters(),
      client.from('comments').select('*').order('created_at', { ascending: false }),
      client.from('site_settings').select('*'),
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

    return {
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
    };
  } catch (err) {
    console.error('serverFetchAllSyncData exception:', err);
    return null;
  }
}

export async function serverIncrementView(
  novelId: string,
  chapterId?: string
): Promise<{ success: boolean; totalViews?: number; chapterViews?: number; error?: string }> {
  try {
    const client = getServerSupabase();
    let updatedTotalViews: number | undefined;
    let updatedChapterViews: number | undefined;

    if (novelId) {
      const { data: novelRow } = await client
        .from('novels')
        .select('total_views')
        .eq('id', novelId)
        .maybeSingle();

      const currentTotal = Number(novelRow?.total_views || 0);
      updatedTotalViews = currentTotal + 1;

      await client
        .from('novels')
        .update({
          total_views: updatedTotalViews,
          updated_at: new Date().toISOString(),
        })
        .eq('id', novelId);
    }

    if (chapterId) {
      const { data: chapterRow } = await client
        .from('chapters')
        .select('views')
        .eq('id', chapterId)
        .maybeSingle();

      const currentChapter = Number(chapterRow?.views || 0);
      updatedChapterViews = currentChapter + 1;

      await client
        .from('chapters')
        .update({
          views: updatedChapterViews,
        })
        .eq('id', chapterId);
    }

    return {
      success: true,
      totalViews: updatedTotalViews,
      chapterViews: updatedChapterViews,
    };
  } catch (err: any) {
    console.warn('serverIncrementView exception:', err);
    return { success: false, error: err?.message || String(err) };
  }
}
