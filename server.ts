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

  // ==========================================
  // 2. SEO Files: robots.txt & Dynamic sitemap.xml
  // ==========================================
  app.get('/robots.txt', (req, res) => {
    const host = req.get('host') || 'aymankinani.com';
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const robots = [
      'User-agent: *',
      'Allow: /',
      'Disallow: /admin',
      'Disallow: /?admin=true',
      '',
      `Sitemap: ${protocol}://${host}/sitemap.xml`,
    ].join('\n');

    res.type('text/plain').send(robots);
  });

  app.get('/sitemap.xml', async (req, res) => {
    try {
      const host = req.get('host') || 'aymankinani.com';
      const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
      const domain = `${protocol}://${host}`;

      const { novels, chapters } = await fetchAllForSitemap();

      const urlsXml = [
        `  <url>`,
        `    <loc>${domain}/</loc>`,
        `    <changefreq>daily</changefreq>`,
        `    <priority>1.0</priority>`,
        `  </url>`,
      ];

      // Add novels
      for (const novel of novels) {
        urlsXml.push(
          `  <url>`,
          `    <loc>${domain}/novel/${encodeURIComponent(novel.slug)}</loc>`,
          `    <lastmod>${novel.updatedAt.split('T')[0]}</lastmod>`,
          `    <changefreq>weekly</changefreq>`,
          `    <priority>0.9</priority>`,
          `  </url>`
        );
      }

      // Add chapters
      for (const ch of chapters) {
        const novelSlugPart = ch.novelSlug || ch.novelId;
        urlsXml.push(
          `  <url>`,
          `    <loc>${domain}/novel/${encodeURIComponent(novelSlugPart)}/chapter/${encodeURIComponent(ch.slug)}</loc>`,
          `    <lastmod>${ch.updatedAt.split('T')[0]}</lastmod>`,
          `    <changefreq>monthly</changefreq>`,
          `    <priority>0.8</priority>`,
          `  </url>`,
          `  <url>`,
          `    <loc>${domain}/novel/chapter-${ch.chapterNumber}</loc>`,
          `    <lastmod>${ch.updatedAt.split('T')[0]}</lastmod>`,
          `    <changefreq>monthly</changefreq>`,
          `    <priority>0.7</priority>`,
          `  </url>`
        );
      }

      const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml.join('\n')}
</urlset>`;

      res.type('application/xml').send(sitemapXml);
    } catch (err) {
      console.error('sitemap generation error:', err);
      res.status(500).type('text/plain').send('Error generating sitemap');
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
      const host = req.get('host') || 'aymankinani.com';
      const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
      const domain = `${protocol}://${host}`;

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
      const host = req.get('host') || 'aymankinani.com';
      const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
      const domain = `${protocol}://${host}`;

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

  // Specific user-requested pattern: /novel/chapter-5 or /novel/chapter-1
  app.get('/novel/chapter-:num', (req, res) => {
    const chapterIdent = `chapter-${req.params.num}`;
    return handleChapterSSR(req, res, null, chapterIdent);
  });

  // Pattern: /novel/:novelId/chapter/:chapterId
  app.get('/novel/:novelId/chapter/:chapterId', (req, res) => {
    return handleChapterSSR(req, res, req.params.novelId, req.params.chapterId);
  });

  // Pattern: /novel/:novelId/chapter-:num
  app.get('/novel/:novelId/chapter-:num', (req, res) => {
    const chapterIdent = `chapter-${req.params.num}`;
    return handleChapterSSR(req, res, req.params.novelId, chapterIdent);
  });

  // Pattern: /chapter/:chapterId
  app.get('/chapter/:chapterId', (req, res) => {
    return handleChapterSSR(req, res, null, req.params.chapterId);
  });

  // Pattern: /novel/:novelId (Novel overview page)
  app.get('/novel/:novelId', (req, res) => {
    // If the novelId itself looks like "chapter-5", route to chapter SSR
    if (req.params.novelId.startsWith('chapter-')) {
      return handleChapterSSR(req, res, null, req.params.novelId);
    }
    return handleNovelSSR(req, res, req.params.novelId);
  });

  // Pattern: /book/:novelId
  app.get('/book/:novelId', (req, res) => {
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
