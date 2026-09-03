import { Novel, Chapter, AuthorProfile, SiteBranding, SeoSettings } from '../types';
import { storageService } from './storageService';

export interface SeoMetaOptions {
  title?: string;
  description?: string;
  keywords?: string | string[];
  author?: string;
  ogType?: 'website' | 'book' | 'article' | 'profile';
  ogImage?: string;
  url?: string;
  canonicalUrl?: string;
  robots?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  structuredData?: Record<string, any> | Array<Record<string, any>>;
}

class SeoService {
  /**
   * Updates all document meta tags, OpenGraph tags, Twitter Card tags, canonical URL, and Schema.org JSON-LD.
   */
  public updateHead(options: SeoMetaOptions = {}): void {
    if (typeof document === 'undefined') return;

    const seoSettings = storageService.getSeoSettings();
    const branding = storageService.getSiteBranding();

    // 1. Resolve Title
    let finalTitle = seoSettings.defaultTitle;
    if (options.title) {
      if (seoSettings.siteTitleTemplate && seoSettings.siteTitleTemplate.includes('%title%')) {
        finalTitle = seoSettings.siteTitleTemplate.replace('%title%', options.title);
      } else {
        finalTitle = `${options.title} | ${branding.siteName || 'أيمن كناني'}`;
      }
    }
    document.title = finalTitle;

    // 2. Resolve Description
    const finalDesc = options.description?.trim() || seoSettings.defaultDescription;

    // 3. Resolve Keywords
    let finalKeywords = seoSettings.keywords;
    if (options.keywords) {
      const extraKw = Array.isArray(options.keywords) ? options.keywords.join(', ') : options.keywords;
      finalKeywords = `${extraKw}, ${seoSettings.keywords}`;
    }

    // 4. Resolve Canonical URL & Page URL
    const baseUrl = (seoSettings.canonicalBaseUrl || window.location.origin).replace(/\/$/, '');
    const currentPath = options.url || (window.location.pathname + window.location.search);
    const fullUrl = options.canonicalUrl || `${baseUrl}${currentPath}`;

    // 5. Resolve Share Image
    const shareImage = options.ogImage || seoSettings.ogDefaultImage || branding.logoUrl || '';

    // 6. Robots Indexing
    let robotsContent = 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';
    if (seoSettings.indexingPolicy === 'noindex' || options.robots) {
      robotsContent = options.robots || 'noindex, nofollow';
    }

    // --- Apply Standard Meta Tags ---
    this.setMetaTag('name', 'description', finalDesc);
    this.setMetaTag('name', 'keywords', finalKeywords);
    this.setMetaTag('name', 'author', options.author || seoSettings.authorName || 'أيمن كناني');
    this.setMetaTag('name', 'robots', robotsContent);

    // Search Engine Verifications (Google & Bing)
    if (seoSettings.googleVerificationCode) {
      this.setMetaTag('name', 'google-site-verification', seoSettings.googleVerificationCode);
    }
    if (seoSettings.bingVerificationCode) {
      this.setMetaTag('name', 'msvalidate.01', seoSettings.bingVerificationCode);
    }

    // --- Apply OpenGraph (Facebook, WhatsApp, LinkedIn, Telegram) Tags ---
    this.setMetaTag('property', 'og:title', finalTitle);
    this.setMetaTag('property', 'og:description', finalDesc);
    this.setMetaTag('property', 'og:type', options.ogType || 'website');
    this.setMetaTag('property', 'og:url', fullUrl);
    this.setMetaTag('property', 'og:site_name', branding.siteName || 'أيمن كناني (Ayman Kinani)');
    this.setMetaTag('property', 'og:locale', 'ar_AR');
    if (shareImage) {
      this.setMetaTag('property', 'og:image', shareImage);
      this.setMetaTag('property', 'og:image:alt', options.title || branding.siteName || 'أيمن كناني');
    }

    // Book/Article Specific OpenGraph
    if (options.publishedTime) {
      this.setMetaTag('property', 'article:published_time', options.publishedTime);
    }
    if (options.modifiedTime) {
      this.setMetaTag('property', 'article:modified_time', options.modifiedTime);
    }
    if (options.author) {
      this.setMetaTag('property', 'article:author', options.author);
    }
    if (options.section) {
      this.setMetaTag('property', 'article:section', options.section);
    }

    // --- Apply Twitter Card Tags ---
    this.setMetaTag('name', 'twitter:card', 'summary_large_image');
    this.setMetaTag('name', 'twitter:title', finalTitle);
    this.setMetaTag('name', 'twitter:description', finalDesc);
    if (shareImage) {
      this.setMetaTag('name', 'twitter:image', shareImage);
    }
    if (seoSettings.twitterHandle) {
      const handle = seoSettings.twitterHandle.startsWith('@') ? seoSettings.twitterHandle : `@${seoSettings.twitterHandle}`;
      this.setMetaTag('name', 'twitter:site', handle);
      this.setMetaTag('name', 'twitter:creator', handle);
    }

    // --- Canonical Link ---
    this.setCanonicalLink(fullUrl);

    // --- Structured Data (Schema.org JSON-LD) ---
    if (seoSettings.enableStructuredData) {
      this.setJsonLd(options.structuredData);
    } else {
      this.removeJsonLd();
    }
  }

  /**
   * Helper to set or create a <meta> element.
   */
  private setMetaTag(attrName: 'name' | 'property', attrValue: string, content: string): void {
    if (!content) return;
    let element = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attrName, attrValue);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  }

  /**
   * Helper to set or update <link rel="canonical">.
   */
  private setCanonicalLink(url: string): void {
    if (!url) return;
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  /**
   * Injects or updates the <script id="seo-json-ld" type="application/ld+json"> tag.
   */
  public setJsonLd(data?: Record<string, any> | Array<Record<string, any>>): void {
    if (!data) {
      // Default to WebSite schema
      const branding = storageService.getSiteBranding();
      const seoSettings = storageService.getSeoSettings();
      const baseUrl = (seoSettings.canonicalBaseUrl || window.location.origin).replace(/\/$/, '');
      data = this.buildWebSiteJsonLd(branding, baseUrl);
    }

    let script = document.getElementById('seo-json-ld') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'seo-json-ld';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data, null, 2);
  }

  /**
   * Removes JSON-LD if disabled.
   */
  public removeJsonLd(): void {
    const script = document.getElementById('seo-json-ld');
    if (script && script.parentNode) {
      script.parentNode.removeChild(script);
    }
  }

  // --- Schema.org Generators ---

  /**
   * Generates Schema.org WebSite JSON-LD with search capability.
   */
  public buildWebSiteJsonLd(branding: SiteBranding, baseUrl: string) {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': branding.siteName || 'أيمن كناني (Ayman Kinani)',
      'alternateName': ['المنصة الرسمية للكاتب أيمن كناني', 'Ayman Kinani Official Platform'],
      'url': baseUrl,
      'description': branding.siteSubtitle || 'المنصة الرسمية لنشر وقراءة كتب ومؤلفات الكاتب أيمن كناني',
      'inLanguage': 'ar',
      'potentialAction': {
        '@type': 'SearchAction',
        'target': `${baseUrl}/?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };
  }

  /**
   * Generates Schema.org Person (Author) JSON-LD.
   */
  public buildAuthorJsonLd(author: AuthorProfile, baseUrl: string) {
    const sameAsList: string[] = Object.values(author.socialLinks || {}).filter(Boolean);

    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      'name': author.name || 'أيمن كناني',
      'alternateName': author.englishName || 'Ayman Kinani',
      'jobTitle': author.title || 'كاتب وباحث ومؤلف',
      'description': author.shortBio || author.fullBio,
      'image': author.avatar,
      'url': baseUrl,
      'sameAs': sameAsList,
      'worksFor': {
        '@type': 'Organization',
        'name': 'المنصة الأدبية للكاتب أيمن كناني'
      }
    };
  }

  /**
   * Generates Schema.org Book JSON-LD with Ratings and Download links.
   */
  public buildNovelJsonLd(novel: Novel, authorProfile?: AuthorProfile, baseUrl?: string) {
    const rootUrl = (baseUrl || storageService.getSeoSettings().canonicalBaseUrl || window.location.origin).replace(/\/$/, '');
    const novelUrl = `${rootUrl}/?novel=${novel.id}`;

    const schemas: any[] = [
      {
        '@context': 'https://schema.org',
        '@type': 'Book',
        'name': novel.title,
        'url': novelUrl,
        'image': novel.coverImage,
        'description': novel.synopsis,
        'inLanguage': 'ar',
        'bookFormat': 'https://schema.org/EBook',
        'genre': novel.genres || [],
        'keywords': (novel.tags || []).join(', '),
        'datePublished': novel.createdAt,
        'dateModified': novel.updatedAt,
        'author': {
          '@type': 'Person',
          'name': novel.author || authorProfile?.name || 'أيمن كناني',
          'url': `${rootUrl}/?view=about`
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'المنصة الرسمية للكاتب أيمن كناني'
        },
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': novel.rating || 5.0,
          'bestRating': 5,
          'worstRating': 1,
          'ratingCount': novel.ratingCount || 1,
        }
      },
      // Breadcrumbs schema for Google Search results
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'الرئيسية',
            'item': rootUrl
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'المؤلفات والكتب',
            'item': `${rootUrl}/?view=novels`
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': novel.title,
            'item': novelUrl
          }
        ]
      }
    ];

    if (novel.pdfDownloadUrl) {
      schemas[0]['workExample'] = {
        '@type': 'Book',
        'bookFormat': 'https://schema.org/PDF',
        'url': novel.pdfDownloadUrl,
        'fileSize': novel.pdfFileSize || undefined
      };
    }

    return schemas;
  }

  /**
   * Generates Schema.org Article/Chapter JSON-LD for individual chapters.
   */
  public buildChapterJsonLd(chapter: Chapter, novel: Novel, authorProfile?: AuthorProfile, baseUrl?: string) {
    const rootUrl = (baseUrl || storageService.getSeoSettings().canonicalBaseUrl || window.location.origin).replace(/\/$/, '');
    const chapterUrl = `${rootUrl}/?novel=${novel.id}&chapter=${chapter.id}`;

    return [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': `${chapter.title} - ${novel.title}`,
        'name': chapter.title,
        'url': chapterUrl,
        'articleBody': chapter.content.slice(0, 400),
        'wordCount': chapter.wordCount || chapter.content.split(/\s+/).length,
        'inLanguage': 'ar',
        'datePublished': chapter.publishedAt,
        'isPartOf': {
          '@type': 'Book',
          'name': novel.title,
          'url': `${rootUrl}/?novel=${novel.id}`
        },
        'author': {
          '@type': 'Person',
          'name': novel.author || authorProfile?.name || 'أيمن كناني',
          'url': `${rootUrl}/?view=about`
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'الرئيسية',
            'item': rootUrl
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': novel.title,
            'item': `${rootUrl}/?novel=${novel.id}`
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': chapter.title,
            'item': chapterUrl
          }
        ]
      }
    ];
  }

  /**
   * Generates a complete dynamic XML sitemap containing all static views, novels, and chapters.
   */
  public generateSitemapXml(novels: Novel[], chapters: Chapter[], baseUrl?: string): string {
    const rootUrl = (baseUrl || storageService.getSeoSettings().canonicalBaseUrl || window.location.origin).replace(/\/$/, '');
    const today = new Date().toISOString().slice(0, 10);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    // 1. Static Core Pages
    const staticPages = [
      { loc: `${rootUrl}/`, changefreq: 'daily', priority: '1.0', lastmod: today },
      { loc: `${rootUrl}/?view=novels`, changefreq: 'daily', priority: '0.9', lastmod: today },
      { loc: `${rootUrl}/?view=about`, changefreq: 'weekly', priority: '0.8', lastmod: today },
      { loc: `${rootUrl}/?view=donate`, changefreq: 'monthly', priority: '0.7', lastmod: today },
      { loc: `${rootUrl}/?view=contact`, changefreq: 'monthly', priority: '0.6', lastmod: today },
      { loc: `${rootUrl}/?view=terms`, changefreq: 'yearly', priority: '0.4', lastmod: today },
      { loc: `${rootUrl}/?view=privacy`, changefreq: 'yearly', priority: '0.4', lastmod: today },
      { loc: `${rootUrl}/?view=dmca`, changefreq: 'yearly', priority: '0.4', lastmod: today },
    ];

    for (const page of staticPages) {
      xml += `  <url>\n`;
      xml += `    <loc>${page.loc}</loc>\n`;
      xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    // 2. Dynamic Novel Pages
    for (const novel of novels) {
      const novelLoc = `${rootUrl}/?novel=${novel.id}`;
      const novelDate = (novel.updatedAt || novel.createdAt || today).slice(0, 10);
      xml += `  <url>\n`;
      xml += `    <loc>${novelLoc}</loc>\n`;
      xml += `    <lastmod>${novelDate}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      if (novel.coverImage) {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${novel.coverImage}</image:loc>\n`;
        xml += `      <image:title>${novel.title.replace(/&/g, '&amp;')}</image:title>\n`;
        xml += `    </image:image>\n`;
      }
      xml += `  </url>\n`;
    }

    // 3. Dynamic Chapter Pages
    for (const chapter of chapters) {
      if (chapter.status === 'DRAFT') continue;
      const chLoc = `${rootUrl}/?novel=${chapter.novelId}&amp;chapter=${chapter.id}`;
      const chDate = (chapter.publishedAt || today).slice(0, 10);
      xml += `  <url>\n`;
      xml += `    <loc>${chLoc}</loc>\n`;
      xml += `    <lastmod>${chDate}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;
    return xml;
  }
}

export const seoService = new SeoService();
export const updateSeo = (options?: SeoMetaOptions) => seoService.updateHead(options);

if (typeof window !== 'undefined') {
  (window as any).seoService = seoService;
  (window as any).updateSeo = updateSeo;
}

export default seoService;
