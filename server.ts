import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import express from 'express';
import dotenv from 'dotenv';
import { getSupabaseConfigStatus } from './src/cms/supabaseClient.ts';
import {
  clearAdminSessionCookie,
  getSessionAdminFromRequest,
  requireAdminAuth,
  setAdminSessionCookie,
  signInAdminWithPassword,
} from './src/cms/auth.ts';
import type { AuthenticatedAdminRequest } from './src/cms/auth.ts';
import {
  createCategoryAdmin,
  createPostAdmin,
  createTagAdmin,
  deleteCategoryAdmin,
  deleteMediaAdmin,
  deletePostAdmin,
  deleteTagAdmin,
  getPostByIdAdmin,
  getPublishedPostBySlug,
  listAllPostsAdmin,
  listCategoriesAdmin,
  listMediaAdmin,
  listPublicCategories,
  listPublishedPosts,
  listTagsAdmin,
  updateCategoryAdmin,
  updateMediaAltAdmin,
  updatePostAdmin,
  uploadMediaAdmin,
} from './src/cms/supabaseRepository.ts';
import type { ArticleUpsertInput, CmsArticle } from './src/cms/types.ts';
import { getAllStaticSitemapPaths, normalizePathname } from './src/data/routes.ts';
import { siteConfig } from './src/config/site.ts';

dotenv.config();

const __dir = path.dirname(fileURLToPath(import.meta.url));
const __dirname = path.basename(__dir) === 'dist' ? path.resolve(__dir, '..') : __dir;
const isProduction = process.env.NODE_ENV === 'production';
const rawPort = process.env.PORT?.trim();
const port: number | string = rawPort ? (/^\d+$/.test(rawPort) ? Number(rawPort) : rawPort) : 3000;

interface ContactSubmission {
  referenceId: string;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  websiteUrl: string;
  serviceInterest: string;
  message: string;
  receivedAt: string;
}

const recentSubmissions: ContactSubmission[] = [];

function resolveBaseUrl(req: express.Request): string {
  if (process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL') {
    return process.env.APP_URL.replace(/\/+$/, '');
  }
  const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
  const host = req.headers['x-forwarded-host'] || req.get('host');
  if (host) {
    return `${proto}://${host}`;
  }
  return siteConfig.domain;
}

async function startServer() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '8mb' }));

  // Serve static public assets with 7-day cache in production
  const publicDir = path.resolve(__dirname, 'public');
  if (fs.existsSync(publicDir)) {
    app.use(
      express.static(publicDir, {
        index: false,
        maxAge: isProduction ? '7d' : 0,
      })
    );
  }

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: siteConfig.brandName });
  });

  // ===========================================================================
  // Public Supabase CMS Blog API (Published Posts Only)
  // ===========================================================================
  app.get('/api/blog', async (req, res) => {
    const categorySlug = typeof req.query.category === 'string' ? req.query.category : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const page = typeof req.query.page === 'string' ? Number(req.query.page) : 1;
    const pageSize = typeof req.query.pageSize === 'string' ? Number(req.query.pageSize) : 24;

    const result = await listPublishedPosts({ categorySlug, search, page, pageSize });
    res.json({
      ok: true,
      provider: 'supabase',
      ...result,
    });
  });

  app.get('/api/blog/:slug', async (req, res) => {
    const found = await getPublishedPostBySlug(req.params.slug);
    if (!found) {
      res.status(404).json({ ok: false, error: 'Article not found' });
      return;
    }
    res.json({ ok: true, post: found.post, relatedPosts: found.relatedPosts });
  });

  app.get('/api/categories', async (_req, res) => {
    const categories = await listPublicCategories();
    res.json({ ok: true, categories });
  });

  // ===========================================================================
  // Admin Authentication & Configuration Status API
  // ===========================================================================
  app.get('/api/admin/status', async (req, res) => {
    const cfg = getSupabaseConfigStatus();
    const user = cfg.configured ? await getSessionAdminFromRequest(req) : null;
    res.json({
      configured: cfg.configured,
      missingVars: cfg.missingVars,
      storageBucket: cfg.storageBucket,
      user,
    });
  });

  app.post('/api/admin/auth/login', async (req, res) => {
    const body = req.body as Record<string, unknown>;
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      res.status(400).json({ ok: false, error: 'Email and password are required.' });
      return;
    }

    const result = await signInAdminWithPassword(email, password);
    if ('error' in result) {
      res.status(result.status).json({ ok: false, error: result.error });
      return;
    }

    setAdminSessionCookie(res, result.accessToken, req);
    res.json({ ok: true, user: result.user, accessToken: result.accessToken });
  });

  app.post('/api/admin/auth/logout', (req, res) => {
    clearAdminSessionCookie(res, req);
    res.json({ ok: true });
  });

  // ===========================================================================
  // Protected Admin CMS Endpoints (Strictly Behind requireAdminAuth)
  // ===========================================================================
  app.get('/api/admin/posts', requireAdminAuth, async (req, res) => {
    try {
      const status = typeof req.query.status === 'string' ? req.query.status : undefined;
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;
      const posts = await listAllPostsAdmin({ status, search });
      res.json({ ok: true, posts });
    } catch (err) {
      res.status(500).json({ ok: false, error: (err as Error).message });
    }
  });

  app.get('/api/admin/posts/:id', requireAdminAuth, async (req, res) => {
    try {
      const post = await getPostByIdAdmin(String(req.params.id));
      if (!post) {
        res.status(404).json({ ok: false, error: 'Article not found' });
        return;
      }
      res.json({ ok: true, post });
    } catch (err) {
      res.status(500).json({ ok: false, error: (err as Error).message });
    }
  });

  app.post('/api/admin/posts', requireAdminAuth, async (req: AuthenticatedAdminRequest, res) => {
    try {
      const post = await createPostAdmin(req.body as ArticleUpsertInput, req.adminUser!);
      res.status(201).json({ ok: true, post });
    } catch (err) {
      res.status(400).json({ ok: false, error: (err as Error).message });
    }
  });

  app.put('/api/admin/posts/:id', requireAdminAuth, async (req: AuthenticatedAdminRequest, res) => {
    try {
      const post = await updatePostAdmin(
        String(req.params.id),
        req.body as ArticleUpsertInput,
        req.adminUser!
      );
      res.json({ ok: true, post });
    } catch (err) {
      res.status(400).json({ ok: false, error: (err as Error).message });
    }
  });

  app.delete('/api/admin/posts/:id', requireAdminAuth, async (req, res) => {
    try {
      await deletePostAdmin(String(req.params.id));
      res.json({ ok: true });
    } catch (err) {
      res.status(400).json({ ok: false, error: (err as Error).message });
    }
  });

  app.get('/api/admin/categories', requireAdminAuth, async (_req, res) => {
    try {
      const categories = await listCategoriesAdmin();
      res.json({ ok: true, categories });
    } catch (err) {
      res.status(500).json({ ok: false, error: (err as Error).message });
    }
  });

  app.post('/api/admin/categories', requireAdminAuth, async (req, res) => {
    try {
      const body = req.body as { name?: string; slug?: string; description?: string };
      const category = await createCategoryAdmin({
        name: body.name || '',
        slug: body.slug,
        description: body.description,
      });
      res.status(201).json({ ok: true, category });
    } catch (err) {
      res.status(400).json({ ok: false, error: (err as Error).message });
    }
  });

  app.put('/api/admin/categories/:id', requireAdminAuth, async (req, res) => {
    try {
      const body = req.body as { name?: string; slug?: string; description?: string };
      const category = await updateCategoryAdmin(String(req.params.id), {
        name: body.name || '',
        slug: body.slug,
        description: body.description,
      });
      res.json({ ok: true, category });
    } catch (err) {
      res.status(400).json({ ok: false, error: (err as Error).message });
    }
  });

  app.delete('/api/admin/categories/:id', requireAdminAuth, async (req, res) => {
    try {
      await deleteCategoryAdmin(String(req.params.id));
      res.json({ ok: true });
    } catch (err) {
      res.status(400).json({ ok: false, error: (err as Error).message });
    }
  });

  app.get('/api/admin/tags', requireAdminAuth, async (_req, res) => {
    try {
      const tags = await listTagsAdmin();
      res.json({ ok: true, tags });
    } catch (err) {
      res.status(500).json({ ok: false, error: (err as Error).message });
    }
  });

  app.post('/api/admin/tags', requireAdminAuth, async (req, res) => {
    try {
      const body = req.body as { name?: string; slug?: string };
      const tag = await createTagAdmin({ name: body.name || '', slug: body.slug });
      res.status(201).json({ ok: true, tag });
    } catch (err) {
      res.status(400).json({ ok: false, error: (err as Error).message });
    }
  });

  app.delete('/api/admin/tags/:id', requireAdminAuth, async (req, res) => {
    try {
      await deleteTagAdmin(String(req.params.id));
      res.json({ ok: true });
    } catch (err) {
      res.status(400).json({ ok: false, error: (err as Error).message });
    }
  });

  app.get('/api/admin/media', requireAdminAuth, async (_req, res) => {
    try {
      const media = await listMediaAdmin();
      res.json({ ok: true, media });
    } catch (err) {
      res.status(500).json({ ok: false, error: (err as Error).message });
    }
  });

  app.post('/api/admin/media', requireAdminAuth, async (req: AuthenticatedAdminRequest, res) => {
    try {
      const body = req.body as {
        base64Data?: string;
        fileName?: string;
        mimeType?: string;
        altText?: string;
      };
      const asset = await uploadMediaAdmin({
        base64Data: body.base64Data || '',
        fileName: body.fileName || 'image.jpg',
        mimeType: body.mimeType || 'image/jpeg',
        altText: body.altText || '',
        adminUser: req.adminUser!,
      });
      res.status(201).json({ ok: true, asset });
    } catch (err) {
      res.status(400).json({ ok: false, error: (err as Error).message });
    }
  });

  app.patch('/api/admin/media/:id', requireAdminAuth, async (req, res) => {
    try {
      const body = req.body as { altText?: string };
      const asset = await updateMediaAltAdmin(String(req.params.id), body.altText || '');
      res.json({ ok: true, asset });
    } catch (err) {
      res.status(400).json({ ok: false, error: (err as Error).message });
    }
  });

  app.delete('/api/admin/media/:id', requireAdminAuth, async (req, res) => {
    try {
      await deleteMediaAdmin(String(req.params.id));
      res.json({ ok: true });
    } catch (err) {
      res.status(400).json({ ok: false, error: (err as Error).message });
    }
  });

  // Lead Capture Endpoint
  app.post('/api/contact', (req, res) => {
    const body = req.body as Record<string, unknown>;
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const businessName = typeof body.businessName === 'string' ? body.businessName.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const websiteUrl = typeof body.websiteUrl === 'string' ? body.websiteUrl.trim() : '';
    const serviceInterest =
      typeof body.serviceInterest === 'string' ? body.serviceInterest.trim() : 'General';
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    if (name.length < 2) {
      res.status(400).json({ ok: false, error: 'Please provide your name.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ ok: false, error: 'Please provide a valid email address.' });
      return;
    }
    if (phone.length < 7) {
      res.status(400).json({ ok: false, error: 'Please provide a valid phone or WhatsApp number.' });
      return;
    }

    const referenceId = `IMK-${Date.now().toString(36).toUpperCase()}`;
    recentSubmissions.unshift({
      referenceId,
      name,
      businessName,
      email,
      phone,
      websiteUrl,
      serviceInterest,
      message,
      receivedAt: new Date().toISOString(),
    });
    if (recentSubmissions.length > 50) {
      recentSubmissions.length = 50;
    }

    res.status(201).json({
      ok: true,
      referenceId,
      message: 'Growth review enquiry recorded.',
    });
  });

  // Dynamic robots.txt (disallowing /admin/ and /api/)
  app.get('/robots.txt', (req, res) => {
    const baseUrl = resolveBaseUrl(req);
    const robots = [
      'User-agent: *',
      'Allow: /',
      'Disallow: /admin/',
      'Disallow: /api/',
      '',
      `Sitemap: ${baseUrl}/sitemap.xml`,
    ].join('\n');
    res.type('text/plain').send(robots);
  });

  // Dynamic XML Sitemap covering static/service/case-study routes + published Supabase articles
  app.get('/sitemap.xml', async (req, res) => {
    const baseUrl = resolveBaseUrl(req);
    const staticPaths = getAllStaticSitemapPaths();
    const published = await listPublishedPosts({ pageSize: 50 });
    const blogPaths = published.posts.map((post) => `/blog/${post.slug}/`);

    const allPaths = Array.from(new Set([...staticPaths, ...blogPaths]));
    const urlNodes = allPaths
      .map((routePath) => {
        const loc = `${baseUrl}${routePath === '/' ? '/' : routePath}`;
        const priority = routePath === '/' ? '1.0' : routePath.includes('seo') ? '0.9' : '0.8';
        return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
      })
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlNodes}\n</urlset>`;
    res.type('application/xml').send(xml);
  });

  // Setup Vite SSR in dev or static + SSR bundle in production
  let vite: Awaited<ReturnType<typeof import('vite')['createServer']>> | null = null;
  if (!isProduction) {
    const { createServer } = await import('vite');
    vite = await createServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
  } else {
    const clientDist = path.resolve(__dirname, 'dist/client');
    const clientAssets = path.resolve(clientDist, 'assets');
    if (fs.existsSync(clientAssets)) {
      app.use(
        '/assets',
        express.static(clientAssets, {
          index: false,
          maxAge: '365d',
          immutable: true,
        })
      );
    }
    if (fs.existsSync(clientDist)) {
      app.use(express.static(clientDist, { index: false, maxAge: '1h' }));
    }
  }

  // Server-Side Rendering for all public routes & protected /admin/ shell
  app.get('*', async (req, res, next) => {
    const reqPath = req.originalUrl.split('?')[0];
    if (/\.(js|css|png|jpg|jpeg|svg|webp|ico|woff2?|json|map)$/i.test(reqPath)) {
      next();
      return;
    }

    try {
      const baseUrl = resolveBaseUrl(req);
      const normalized = normalizePathname(req.originalUrl);

      let posts: CmsArticle[] = [];
      let activeArticle: CmsArticle | null = null;

      if (normalized !== '/admin/') {
        const result = await listPublishedPosts({ pageSize: 50 });
        posts = result.posts;

        if (normalized.startsWith('/blog/') && normalized !== '/blog/') {
          const slug = normalized.replace(/^\/blog\//, '').replace(/\/$/, '');
          const detail = await getPublishedPostBySlug(slug);
          activeArticle = detail?.post || null;
        }
      }

      let templateHtml = '';
      let renderFn: (
        url: string,
        bUrl: string,
        initialData: { posts: CmsArticle[]; activeArticle: CmsArticle | null }
      ) => { appHtml: string; headHtml: string; statusCode: number };

      if (!isProduction && vite) {
        const rawTemplate = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        templateHtml = await vite.transformIndexHtml(req.originalUrl, rawTemplate);
        const ssrModule = await vite.ssrLoadModule('/src/entry-server.tsx');
        renderFn = ssrModule.render;
      } else {
        templateHtml = fs.readFileSync(
          path.resolve(__dirname, 'dist/client/index.html'),
          'utf-8'
        );
        const ssrBundlePath = path.resolve(__dirname, 'dist/server/entry-server.js');
        const ssrModule = await import(pathToFileURL(ssrBundlePath).href);
        renderFn = ssrModule.render;
      }

      const { appHtml, headHtml, statusCode } = renderFn(req.originalUrl, baseUrl, {
        posts,
        activeArticle,
      });

      const serializedState = JSON.stringify({ posts, activeArticle }).replace(/</g, '\\u003c');
      const hydrationScript = `<script>window.__INITIAL_DATA__=${serializedState};</script>`;

      const finalHtml = templateHtml
        .replace('<!--seo-head-->', headHtml)
        .replace('<!--ssr-outlet-->', appHtml)
        .replace('</body>', `${hydrationScript}\n  </body>`);

      res.status(statusCode).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(finalHtml);
    } catch (err) {
      if (vite) {
        vite.ssrFixStacktrace(err as Error);
      }
      next(err);
    }
  });

  if (typeof port === 'string') {
    app.listen(port, () => {
      console.log(`Insight Marketing Kenya SSR server running on socket ${port}`);
    });
  } else {
    app.listen(port, '0.0.0.0', () => {
      console.log(`Insight Marketing Kenya SSR server running on http://0.0.0.0:${port}`);
    });
  }
}

startServer();
