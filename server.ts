import express from 'express';
import path from 'path';
import fs from 'fs';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer as createViteServer } from 'vite';

import {
  fetchChapterFromSupabaseForSSR,
  fetchNovelFromSupabaseForSSR,
  fetchAllForSitemap,
  getServerSupabase,
  serverSaveNovel,
  serverDeleteNovel,
  serverFetchAllNovels,
  serverSaveChapter,
  serverDeleteChapter,
  serverFetchAllChapters,
  serverFetchAllSyncData,
  serverIncrementView,
} from './src/server/supabaseServer';

import {
  ServerChapterView,
  ServerNovelView,
  generateChapterSeoTags,
  generateNovelSeoTags,
  injectSsrIntoTemplate,
} from './src/server/ssrRenderer';

async function startServer() {
  const app = express();
  const PORT = 3000;
  const isProd = process.env.NODE_ENV === 'production';
  const distPath = path.resolve(process.cwd(), 'dist');

  app.use(express.json({ limit: '25mb' }));

  // Setup Vite in development or static serving in production
  let vite: any = null;
  if (!isProd) {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
  } else {
    // In production, serve static assets from dist
    app.use(
      express.static(distPath, {
        index: false,
        maxAge: '1d',
      })
    );
  }

  /**
   * Helper to load and prepare the base index.html template
   */
  async function getBaseTemplate(url: string): Promise<string> {
    if (!isProd && vite) {
      const templatePath = path.resolve(process.cwd(), 'index.html');
      let template = fs.readFileSync(templatePath, 'utf-8');
      template = await vite.transformIndexHtml(url, template);
      return template;
    } else {
      const templatePath = path.resolve(distPath, 'index.html');
      return fs.readFileSync(templatePath, 'utf-8');
    }
  }

  // ==========================================
  // 1. Core Health & Info Endpoints
  // ==========================================
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'ayman-kinani-novels-platform',
      ssrEnabled: true,
      nodeVersion: process.version,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/ssr-status', async (_req, res) => {
    try {
      const client = getServerSupabase();
      const [nRes, cRes] = await Promise.all([
        client.from('novels').select('id, title, slug').limit(10),
        client.from('chapters').select('id, title, chapter_number, novel_id').limit(10),
      ]);

      res.json({
        ssrEnabled: true,
        databaseConnected: !nRes.error && !cRes.error,
        novelsCount: nRes.data?.length || 0,
        chaptersCount: cRes.data?.length || 0,
        sampleNovels: nRes.data || [],
        sampleChapters: cRes.data || [],
      });
    } catch (err: any) {
      res.status(500).json({
        ssrEnabled: true,
        databaseConnected: false,
        error: err?.message || err,
      });
    }
  });

  app.get('/api/server-info', (_req, res) => {
    res.json({
      platform: 'Node.js + Express SSR Architecture',
      nodeVersion: process.version,
      rendering: 'Server-Side Rendering (SSR) with React 19 renderToString + Hydration',
      frontend: 'React 19 + TypeScript + Tailwind CSS',
      environment: process.env.NODE_ENV || 'development',
      features: [
        'True Server-Side Rendering for Novel Chapters',
        'Supabase Real-time Cloud Data Fetching on the Server',
        'Full HTML generation for Web Crawlers & Social Bots',
        'Dynamic Open Graph & Twitter Cards',
        'Schema.org Article and Book JSON-LD Generation',
        'Dynamic sitemap.xml with live Supabase URLs',
        'Dynamic robots.txt',
      ],
    });
  });

  // ==========================================
  // 1.5. Full-Stack Data & Supabase Sync APIs
  // ==========================================
  app.get('/api/novels', async (_req, res) => {
    try {
      const novels = await serverFetchAllNovels();
      res.json({ success: true, novels });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || String(err) });
    }
  });

  app.post('/api/novels', async (req, res) => {
    try {
      const result = await serverSaveNovel(req.body);
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || String(err) });
    }
  });

  app.put('/api/novels/:id', async (req, res) => {
    try {
      const result = await serverSaveNovel({ ...req.body, id: req.params.id });
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || String(err) });
    }
  });

  app.delete('/api/novels/:id', async (req, res) => {
    try {
      const result = await serverDeleteNovel(req.params.id);
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || String(err) });
    }
  });

  app.get('/api/chapters', async (_req, res) => {
    try {
      const chapters = await serverFetchAllChapters();
      res.json({ success: true, chapters });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || String(err) });
    }
  });

  app.post('/api/chapters', async (req, res) => {
    try {
      const result = await serverSaveChapter(req.body);
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || String(err) });
    }
  });

  app.put('/api/chapters/:id', async (req, res) => {
    try {
      const result = await serverSaveChapter({ ...req.body, id: req.params.id });
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || String(err) });
    }
  });

  app.delete('/api/chapters/:id', async (req, res) => {
    try {
      const result = await serverDeleteChapter(req.params.id);
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || String(err) });
    }
  });

  app.get('/api/sync', async (_req, res) => {
    try {
      const data = await serverFetchAllSyncData();
      if (data) {
        res.json({ success: true, ...data });
      } else {
        res.status(500).json({ success: false, error: 'Failed to fetch sync bundle from Supabase' });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || String(err) });
    }
  });

  app.post('/api/sync/push', async (req, res) => {
    try {
      const { novels, chapters } = req.body || {};
      const results: { novels: any[]; chapters: any[] } = { novels: [], chapters: [] };

      if (Array.isArray(novels)) {
        for (const n of novels) {
          const r = await serverSaveNovel(n);
          results.novels.push({ id: n.id, success: r.success, error: r.error });
        }
      }

      if (Array.isArray(chapters)) {
        for (const c of chapters) {
          const r = await serverSaveChapter(c);
          results.chapters.push({ id: c.id, success: r.success, error: r.error });
        }
      }

      res.json({ success: true, results });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || String(err) });
    }
  });

  app.post('/api/views/increment', async (req, res) => {
    try {
      const { novelId, chapterId } = req.body || {};
      const result = await serverIncrementView(novelId, chapterId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || String(err) });
    }
  });

  // Helper to determine accurate public domain (always strictly https://www.aymankinani.org for production SEO consistency)
  function getRequestDomain(_req?: express.Request): string {
    return 'https://www.aymankinani.org';
  }

  // Helper to escape XML characters
  function escapeXml(unsafe: string): string {
    if (!unsafe) return '';
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  // ==========================================
  // 2. SEO Files: robots.txt, sitemap.xml, rss.xml, atom.xml
  // ==========================================
  app.get('/robots.txt', (req, res) => {
    const domain = getRequestDomain(req);
    const robots = [
      'User-agent: *',
      'Allow: /',
      'Disallow: /admin',
      'Disallow: /?admin=true',
      '',
      `Sitemap: ${domain}/sitemap.xml`,
      `Sitemap: ${domain}/rss.xml`,
      `Sitemap: ${domain}/atom.xml`,
    ].join('\n');

    res.type('text/plain; charset=utf-8').send(robots);
  });

  app.get('/sitemap.xml', async (req, res) => {
    try {
      const domain = getRequestDomain(req);
      const { novels, chapters } = await fetchAllForSitemap();

      const urlsXml = [
        `  <url>`,
        `    <loc>${domain}/</loc>`,
        `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>`,
        `    <changefreq>daily</changefreq>`,
        `    <priority>1.0</priority>`,
        `  </url>`,
      ];

      // Add novels
      for (const novel of novels) {
        const novelUrl = `${domain}/book/${encodeURIComponent(novel.slug)}`;
        const hasValidHttpImage = novel.coverImage && novel.coverImage.startsWith('http') && !novel.coverImage.startsWith('data:');
        urlsXml.push(
          `  <url>`,
          `    <loc>${novelUrl}</loc>`,
          `    <lastmod>${novel.updatedAt.split('T')[0]}</lastmod>`,
          `    <changefreq>weekly</changefreq>`,
          `    <priority>0.9</priority>`,
          ...(hasValidHttpImage ? [
            `    <image:image>`,
            `      <image:loc>${escapeXml(novel.coverImage)}</image:loc>`,
            `      <image:title>${escapeXml(novel.title)}</image:title>`,
            `    </image:image>`,
          ] : []),
          `  </url>`
        );
      }

      // Add chapters (clean single canonical URL per chapter to avoid duplicates)
      for (const ch of chapters) {
        const novelSlugPart = ch.novelSlug || ch.novelId;
        const chapterUrl = `${domain}/book/${encodeURIComponent(novelSlugPart)}/chapter/${encodeURIComponent(ch.slug)}`;
        urlsXml.push(
          `  <url>`,
          `    <loc>${chapterUrl}</loc>`,
          `    <lastmod>${ch.updatedAt.split('T')[0]}</lastmod>`,
          `    <changefreq>monthly</changefreq>`,
          `    <priority>0.8</priority>`,
          `  </url>`
        );
      }

      const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlsXml.join('\n')}
</urlset>`;

      res.type('application/xml; charset=utf-8').send(sitemapXml);
    } catch (err) {
      console.error('sitemap generation error:', err);
      res.status(500).type('text/plain').send('Error generating sitemap');
    }
  });

  // Handler for RSS 2.0 Feed (/rss.xml, /feed.xml, /feed)
  async function handleRssFeed(req: express.Request, res: express.Response) {
    try {
      const domain = getRequestDomain(req);
      const { novels, chapters } = await fetchAllForSitemap();

      const itemsXml: string[] = [];

      // Add novel items
      for (const n of novels) {
        const novelUrl = `${domain}/book/${encodeURIComponent(n.slug)}`;
        itemsXml.push(`    <item>
      <title>${escapeXml(n.title)} - بقلم ${escapeXml(n.author || 'أيمن كناني')}</title>
      <link>${novelUrl}</link>
      <guid isPermaLink="true">${novelUrl}</guid>
      <pubDate>${new Date(n.updatedAt).toUTCString()}</pubDate>
      <description>${escapeXml(n.synopsis || `كتاب ${n.title} للمؤلف أيمن كناني. قراءة وتحميل مجاني.`)}</description>
    </item>`);
      }

      // Add recent chapters (sorted latest first)
      const sortedChapters = [...chapters].reverse();
      for (const ch of sortedChapters) {
        const chUrl = `${domain}/book/${encodeURIComponent(ch.novelSlug)}/chapter/${encodeURIComponent(ch.slug)}`;
        itemsXml.push(`    <item>
      <title>${escapeXml(ch.novelTitle)} - ${escapeXml(ch.title)}</title>
      <link>${chUrl}</link>
      <guid isPermaLink="true">${chUrl}</guid>
      <pubDate>${new Date(ch.updatedAt).toUTCString()}</pubDate>
      <description>${escapeXml(`قراءة ${ch.title} من ${ch.novelTitle} للمؤلف أيمن كناني على المنصة الرسمية.`)}</description>
    </item>`);
      }

      const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>أيمن كناني (Ayman Kinani) - المنصة الرسمية لنشر المؤلفات والكتب</title>
    <link>${domain}/</link>
    <description>المنصة الرسمية المعتمدة لنشر وقراءة مؤلفات وكتب وروايات الكاتب أيمن كناني مجاناً</description>
    <language>ar</language>
    <atom:link href="${domain}/rss.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${itemsXml.join('\n')}
  </channel>
</rss>`;

      res.type('application/rss+xml; charset=utf-8').send(rssXml);
    } catch (err) {
      console.error('RSS generation error:', err);
      res.status(500).type('text/plain').send('Error generating RSS feed');
    }
  }

  app.get('/rss.xml', handleRssFeed);
  app.get('/feed.xml', handleRssFeed);
  app.get('/feed', handleRssFeed);

  // Handler for Atom 1.0 Feed (/atom.xml)
  app.get('/atom.xml', async (req, res) => {
    try {
      const domain = getRequestDomain(req);
      const { novels, chapters } = await fetchAllForSitemap();

      const entriesXml: string[] = [];

      for (const n of novels) {
        const novelUrl = `${domain}/book/${encodeURIComponent(n.slug)}`;
        entriesXml.push(`  <entry>
    <title>${escapeXml(n.title)}</title>
    <link href="${novelUrl}" />
    <id>${novelUrl}</id>
    <updated>${new Date(n.updatedAt).toISOString()}</updated>
    <summary>${escapeXml(n.synopsis || `كتاب ${n.title} للمؤلف أيمن كناني.`)}</summary>
    <author>
      <name>${escapeXml(n.author || 'أيمن كناني')}</name>
    </author>
  </entry>`);
      }

      const sortedChapters = [...chapters].reverse();
      for (const ch of sortedChapters) {
        const chUrl = `${domain}/book/${encodeURIComponent(ch.novelSlug)}/chapter/${encodeURIComponent(ch.slug)}`;
        entriesXml.push(`  <entry>
    <title>${escapeXml(ch.novelTitle)} - ${escapeXml(ch.title)}</title>
    <link href="${chUrl}" />
    <id>${chUrl}</id>
    <updated>${new Date(ch.updatedAt).toISOString()}</updated>
    <summary>${escapeXml(`قراءة ${ch.title} من ${ch.novelTitle} بقلم أيمن كناني.`)}</summary>
    <author>
      <name>أيمن كناني</name>
    </author>
  </entry>`);
      }

      const atomXml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>أيمن كناني (Ayman Kinani) - المنصة الرسمية</title>
  <subtitle>المنصة الرسمية لنشر وقراءة مؤلفات وكتب الكاتب أيمن كناني</subtitle>
  <link href="${domain}/" />
  <link rel="self" href="${domain}/atom.xml" />
  <id>${domain}/</id>
  <updated>${new Date().toISOString()}</updated>
  <author>
    <name>أيمن كناني</name>
    <uri>${domain}/</uri>
  </author>
${entriesXml.join('\n')}
</feed>`;

      res.type('application/atom+xml; charset=utf-8').send(atomXml);
    } catch (err) {
      console.error('Atom generation error:', err);
      res.status(500).type('text/plain').send('Error generating Atom feed');
    }
  });

  // ==========================================
  // 3. SERVER-SIDE RENDERING (SSR) HANDLERS
  // ==========================================

  /**
   * SSR Chapter Handler for:
   * - /novel/:novelId/chapter/:chapterId
   * - /novel/:novelId/chapter-:num
   * - /novel/chapter-:num  (e.g., /novel/chapter-5)
   * - /chapter/:chapterId
   */
  async function handleChapterSSR(
    req: express.Request,
    res: express.Response,
    novelIdentifier: string | null,
    chapterIdentifier: string
  ) {
    try {
      const domain = getRequestDomain(req);

      // 1. Fetch from Supabase
      const ssrData = await fetchChapterFromSupabaseForSSR(novelIdentifier, chapterIdentifier);

      if (!ssrData) {
        // Fallback or 404
        const template = await getBaseTemplate(req.originalUrl);
        const notFoundHtml = `
          <div style="font-family: 'Cairo', sans-serif; direction: rtl; text-align: center; padding: 60px 20px; background: #FDFCF8; min-height: 100vh;">
            <div style="max-width: 480px; margin: 0 auto; background: white; padding: 32px; border-radius: 16px; border: 1px solid #E5E2D9; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
              <h1 style="font-size: 24px; color: #2C2C2C; margin-bottom: 12px;">الفصل غير متوفر حالياً</h1>
              <p style="font-size: 14px; color: #6E6A64; margin-bottom: 24px; line-height: 1.6;">
                لم نتمكن من العثور على الفصل المطلوب (${chapterIdentifier}) في قاعدة بيانات الروايات.
              </p>
              <a href="/" style="display: inline-block; background: #4A5D4E; color: white; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: bold; font-size: 14px;">
                العودة إلى المكتبة الرئيسية
              </a>
            </div>
          </div>
        `;
        const rendered = template
          .replace(/<title>.*?<\/title>/i, `<title>الفصل غير موجود - منصة أيمن كناني</title>`)
          .replace('<div id="root"></div>', `<div id="root">${notFoundHtml}</div>`);

        return res.status(404).set({ 'Content-Type': 'text/html; charset=utf-8' }).send(rendered);
      }

      const { novel, chapter, prevChapter, nextChapter, totalChapters } = ssrData;

      // 2. Render React Component to full HTML string via renderToString
      const renderedComponentHtml = renderToString(
        React.createElement(ServerChapterView, {
          novel,
          chapter,
          prevChapter,
          nextChapter,
          totalChapters,
          reqUrl: req.originalUrl,
        })
      );

      // 3. Generate High-Fidelity SEO Tags (Open Graph, Twitter, Schema.org Article JSON-LD)
      const { title, metaTags, jsonLd } = generateChapterSeoTags({
        novel,
        chapter,
        reqUrl: req.originalUrl,
        domain,
      });

      // 4. Initial state payload for client hydration
      const initialData = {
        currentView: 'reader',
        novel,
        chapter,
        prevChapter: prevChapter ? { id: prevChapter.id, chapterNumber: prevChapter.chapterNumber, title: prevChapter.title } : null,
        nextChapter: nextChapter ? { id: nextChapter.id, chapterNumber: nextChapter.chapterNumber, title: nextChapter.title } : null,
      };

      // 5. Inject into template and send
      const template = await getBaseTemplate(req.originalUrl);
      const fullHtml = injectSsrIntoTemplate({
        template,
        title,
        metaTags,
        jsonLd,
        renderedHtml: renderedComponentHtml,
        initialData,
      });

      return res
        .status(200)
        .set({
          'Content-Type': 'text/html; charset=utf-8',
          'X-Rendered-By': 'NodeJS-Express-React-SSR',
        })
        .send(fullHtml);
    } catch (err: any) {
      console.error('SSR Chapter Handler Exception:', err);
      // If error occurs, fallback gracefully to base template
      const template = await getBaseTemplate(req.originalUrl);
      return res.status(200).send(template);
    }
  }

  /**
   * SSR Novel Overview Handler for /novel/:novelId
   */
  async function handleNovelSSR(req: express.Request, res: express.Response, novelIdentifier: string) {
    try {
      const domain = getRequestDomain(req);

      const novelData = await fetchNovelFromSupabaseForSSR(novelIdentifier);

      if (!novelData) {
        const template = await getBaseTemplate(req.originalUrl);
        return res.status(200).send(template);
      }

      const { novel, chapters } = novelData;

      // Render React component via renderToString
      const renderedComponentHtml = renderToString(
        React.createElement(ServerNovelView, {
          novel,
          chapters,
          reqUrl: req.originalUrl,
        })
      );

      const { title, metaTags, jsonLd } = generateNovelSeoTags({
        novel,
        chapters,
        reqUrl: req.originalUrl,
        domain,
      });

      const initialData = {
        currentView: 'novel_detail',
        novel,
        chapters,
      };

      const template = await getBaseTemplate(req.originalUrl);
      const fullHtml = injectSsrIntoTemplate({
        template,
        title,
        metaTags,
        jsonLd,
        renderedHtml: renderedComponentHtml,
        initialData,
      });

      return res
        .status(200)
        .set({
          'Content-Type': 'text/html; charset=utf-8',
          'X-Rendered-By': 'NodeJS-Express-React-SSR',
        })
        .send(fullHtml);
    } catch (err) {
      console.error('SSR Novel Handler Exception:', err);
      const template = await getBaseTemplate(req.originalUrl);
      return res.status(200).send(template);
    }
  }

  // --- Express SSR Route Registrations ---

  // Specific user-requested pattern: /book/chapter-5 or /novel/chapter-5
  app.get(['/book/chapter-:num', '/novel/chapter-:num'], (req, res) => {
    const chapterIdent = `chapter-${req.params.num}`;
    return handleChapterSSR(req, res, null, chapterIdent);
  });

  // Pattern: /book/:novelId/chapter/:chapterId or /novel/:novelId/chapter/:chapterId
  app.get(['/book/:novelId/chapter/:chapterId', '/novel/:novelId/chapter/:chapterId'], (req, res) => {
    return handleChapterSSR(req, res, req.params.novelId, req.params.chapterId);
  });

  // Pattern: /book/:novelId/chapter-:num or /novel/:novelId/chapter-:num
  app.get(['/book/:novelId/chapter-:num', '/novel/:novelId/chapter-:num'], (req, res) => {
    const chapterIdent = `chapter-${req.params.num}`;
    return handleChapterSSR(req, res, req.params.novelId, chapterIdent);
  });

  // Pattern: /chapter/:chapterId
  app.get('/chapter/:chapterId', (req, res) => {
    return handleChapterSSR(req, res, null, req.params.chapterId);
  });

  // Pattern: /book/:novelId or /novel/:novelId (Book/Novel overview page)
  app.get(['/book/:novelId', '/novel/:novelId'], (req, res) => {
    // If the novelId itself looks like "chapter-5", route to chapter SSR
    if (req.params.novelId.startsWith('chapter-')) {
      return handleChapterSSR(req, res, null, req.params.novelId);
    }
    return handleNovelSSR(req, res, req.params.novelId);
  });

  // Check query params (?novel=...&chapter=...)
  app.use(async (req, res, next) => {
    if (req.query.chapter) {
      const chapterIdent = String(req.query.chapter);
      const novelIdent = req.query.novel ? String(req.query.novel) : null;
      return handleChapterSSR(req, res, novelIdent, chapterIdent);
    }
    next();
  });

  // Mount Vite middleware for dev assets and SPA HMR modules
  if (!isProd && vite) {
    app.use(vite.middlewares);
  }

  // ==========================================
  // 4. Default Fallback SPA Routing
  // ==========================================
  app.get('*', async (req, res) => {
    try {
      const template = await getBaseTemplate(req.originalUrl);
      res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).send(template);
    } catch (err: any) {
      console.error('Fallback error:', err);
      res.status(500).send('Server Error');
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Node.js Express SSR server running on http://0.0.0.0:${PORT}`);
    console.log(`✨ Server-Side Rendering (SSR) enabled for all novels & chapters!`);
  });
}

startServer();
