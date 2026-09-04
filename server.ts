import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 1. Core Health & Info Endpoints (Node.js API)
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'ayman-kinani-novels-platform',
      nodeVersion: process.version,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/server-info', (_req, res) => {
    res.json({
      platform: 'Node.js + Express Full-Stack Server',
      nodeVersion: process.version,
      architecture: 'Full-Stack Express with Vite Bridge',
      frontend: 'React 19 + TypeScript',
      environment: process.env.NODE_ENV || 'development',
      features: [
        'Server-Side API Routing',
        'High Performance Static Serving',
        'SEO Friendly Crawling Architecture',
        'Dynamic robots.txt and sitemap'
      ]
    });
  });

  // 2. Dynamic robots.txt
  app.get('/robots.txt', (req, res) => {
    const host = req.get('host') || 'aymankinani.com';
    const protocol = req.protocol || 'https';
    const robots = [
      'User-agent: *',
      'Allow: /',
      'Disallow: /?admin=true',
      '',
      `Sitemap: ${protocol}://${host}/sitemap.xml`,
    ].join('\n');

    res.type('text/plain').send(robots);
  });

  // 3. Vite middleware for development vs Production Static Serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Node.js Express server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
