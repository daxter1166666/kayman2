import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Novel, Chapter, SiteBranding } from '../types';

const DEFAULT_SUPABASE_URL = 'https://kepuolqhropozwfwwwbb.supabase.co';
const DEFAULT_SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlcHVvbHFocm9wb3p3Znd3d2JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMzcyMDgsImV4cCI6MjEwMzkxMzIwOH0.8JfpG8bw-dxwFn64-pAbeRBAxBR9WiaNKQAcJAVCeJw';

let supabaseServerClient: SupabaseClient | null = null;

export function getServerSupabase(): SupabaseClient {
  if (!supabaseServerClient) {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;
    supabaseServerClient = createClient(url.trim(), key.trim());
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
  };
}
