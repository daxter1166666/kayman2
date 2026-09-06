import React from 'react';
import { renderToString } from 'react-dom/server';
import type { Novel, Chapter } from '../types';

interface ChapterSSRProps {
  novel: Novel;
  chapter: Chapter;
  prevChapter: Chapter | null;
  nextChapter: Chapter | null;
  totalChapters: number;
  reqUrl: string;
}

/**
 * Clean text for meta tags (strip markdown, html, extra spaces)
 */
function cleanExcerpt(text: string, maxLen = 160): string {
  if (!text) return '';
  const cleaned = text
    .replace(/[#*_`~>\[\]()!-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (cleaned.length <= maxLen) return cleaned;
  return cleaned.substring(0, maxLen).trim() + '...';
}

function estimateReadingTime(words: number): number {
  return Math.max(1, Math.ceil(words / 180));
}

/**
 * Pure React Component for Server-Side Rendering of Chapter Reader
 * Guaranteed to execute seamlessly in Node without window/DOM dependencies
 */
export const ServerChapterView: React.FC<ChapterSSRProps> = ({
  novel,
  chapter,
  prevChapter,
  nextChapter,
  totalChapters,
}) => {
  const readingTime = estimateReadingTime(chapter.wordCount || 1000);
  const paragraphs = (chapter.content || '')
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);

  const prevUrl = prevChapter
    ? `/novel/${novel.slug || novel.id}/chapter/${prevChapter.slug || prevChapter.chapterNumber}`
    : null;
  const nextUrl = nextChapter
    ? `/novel/${novel.slug || novel.id}/chapter/${nextChapter.slug || nextChapter.chapterNumber}`
    : null;
  const novelUrl = `/novel/${novel.slug || novel.id}`;

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#2C2C2C] font-cairo antialiased flex flex-col" dir="rtl">
      {/* 1. Reader Header */}
      <header className="sticky top-0 z-30 bg-[#FDFCF8]/95 backdrop-blur-md border-b border-[#E5E2D9] px-4 py-3 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4A5D4E] hover:underline"
              title="العودة للرئيسية"
            >
              <span>← الرئيسية</span>
            </a>
            <span className="text-[#E5E2D9]">|</span>
            <a
              href={novelUrl}
              className="text-xs font-semibold text-[#6E6A64] hover:text-[#2C2C2C] truncate max-w-[140px] sm:max-w-xs"
              title={novel.title}
            >
              {novel.title}
            </a>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-[#4A5D4E]/10 text-[#4A5D4E] text-[11px] font-bold">
              فصل {chapter.chapterNumber} من {totalChapters}
            </span>
            <a
              href={novelUrl}
              className="hidden sm:inline-flex px-3 py-1 rounded-lg border border-[#E5E2D9] text-xs font-semibold hover:bg-[#F7F5EE]"
            >
              فهرس الفصول
            </a>
          </div>
        </div>
      </header>

      {/* 2. Main Chapter Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumbs for SEO and Visitors */}
        <nav aria-label="مسار الصفحة" className="mb-6 text-xs text-[#6E6A64] flex items-center gap-2 flex-wrap">
          <a href="/" className="hover:text-[#2C2C2C]">الرئيسية</a>
          <span>›</span>
          <a href={novelUrl} className="hover:text-[#2C2C2C]">{novel.title}</a>
          <span>›</span>
          <span className="text-[#2C2C2C] font-bold">{chapter.title}</span>
        </nav>

        <article className="font-amiri">
          {/* Chapter Header */}
          <header className="text-center mb-10 pb-6 border-b border-[#E5E2D9]">
            <div className="inline-block px-3 py-1 rounded-full bg-[#C88A3B]/10 text-[#C88A3B] text-xs font-cairo font-bold mb-3">
              الفصل {chapter.chapterNumber}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#2C2C2C] mb-4 leading-tight">
              {chapter.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-cairo text-[#6E6A64]">
              <span>بقلم: <strong className="text-[#2C2C2C]">{novel.author || 'أيمن كناني'}</strong></span>
              <span>•</span>
              <span>⏱️ {readingTime} دقائق قراءة تقريبية</span>
              <span>•</span>
              <span>{chapter.wordCount.toLocaleString()} كلمة</span>
            </div>
          </header>

          {/* Chapter Text Paragraphs */}
          <div className="chapter-body space-y-6 text-[#2C2C2C] text-lg sm:text-xl leading-relaxed sm:leading-loose text-justify">
            {paragraphs.map((p, idx) => (
              <p key={idx} className="tracking-wide">
                {p}
              </p>
            ))}
          </div>

          {/* Author Note */}
          {chapter.authorNote && (
            <aside className="my-10 p-5 rounded-2xl bg-[#F7F5EE] border border-[#E5E2D9] font-cairo text-sm text-[#2C2C2C]">
              <div className="font-bold text-[#C88A3B] mb-2 flex items-center gap-1.5">
                <span>📝 ملاحظة الكاتب:</span>
              </div>
              <p className="leading-relaxed whitespace-pre-wrap">{chapter.authorNote}</p>
            </aside>
          )}

          {/* End of Chapter Ornament */}
          <div className="my-12 text-center text-[#C88A3B] text-xl tracking-widest opacity-60">
            ❦ ❦ ❦
          </div>

          {/* Chapter Bottom Navigation */}
          <nav className="font-cairo flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-6 border-t border-[#E5E2D9]">
            {prevUrl ? (
              <a
                href={prevUrl}
                className="flex-1 py-3 px-4 rounded-xl border border-[#E5E2D9] bg-white hover:bg-[#F7F5EE] text-center text-xs sm:text-sm font-bold text-[#2C2C2C] transition-all"
              >
                ← الفصل السابق ({prevChapter?.title})
              </a>
            ) : (
              <div className="flex-1" />
            )}

            <a
              href={novelUrl}
              className="py-3 px-5 rounded-xl bg-[#F7F5EE] hover:bg-[#ECE8DC] text-center text-xs sm:text-sm font-bold text-[#4A5D4E] transition-all"
            >
              فهرس فصول الرواية
            </a>

            {nextUrl ? (
              <a
                href={nextUrl}
                className="flex-1 py-3 px-4 rounded-xl bg-[#4A5D4E] hover:bg-[#3C4C3F] text-center text-xs sm:text-sm font-bold text-white shadow-sm transition-all"
              >
                الفصل التالي ({nextChapter?.title}) →
              </a>
            ) : (
              <div className="flex-1 text-center py-3 text-xs text-[#6E6A64]">
                نهاية الفصول المنشورة حالياً
              </div>
            )}
          </nav>
        </article>
      </main>

      {/* 3. Footer */}
      <footer className="mt-16 bg-[#1C1B19] text-[#A8A49E] text-xs font-cairo py-8 px-4 text-center border-t border-white/10">
        <div className="max-w-4xl mx-auto space-y-2">
          <p className="text-white font-bold">{novel.title} - بقلم {novel.author}</p>
          <p>جميع الحقوق محفوظة للمؤلف © {new Date().getFullYear()}</p>
          <p className="text-white/60">
            <a href="/" className="hover:underline text-[#C88A3B]">المنصة الرسمية لنشر المؤلفات والكتب الأدبية</a>
          </p>
        </div>
      </footer>
    </div>
  );
};

interface NovelSSRProps {
  novel: Novel;
  chapters: Chapter[];
  reqUrl: string;
}

/**
 * Server-Side Rendered Novel Detail Page
 */
export const ServerNovelView: React.FC<NovelSSRProps> = ({ novel, chapters }) => {
  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#2C2C2C] font-cairo antialiased flex flex-col" dir="rtl">
      <header className="sticky top-0 z-30 bg-[#FDFCF8]/95 backdrop-blur-md border-b border-[#E5E2D9] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="/" className="text-xs font-bold text-[#4A5D4E] hover:underline">
            ← العودة للمكتبة الرئيسية
          </a>
          <span className="text-xs font-bold text-[#2C2C2C]">{novel.title}</span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
          {novel.coverImage && (
            <img
              src={novel.coverImage}
              alt={novel.title}
              className="w-48 sm:w-56 h-72 sm:h-80 object-cover rounded-2xl shadow-lg border border-[#E5E2D9] mx-auto md:mx-0 shrink-0"
            />
          )}

          <div className="flex-1 text-center md:text-right">
            <div className="flex flex-wrap gap-1.5 justify-center md:justify-start mb-3">
              {novel.genres.map(g => (
                <span key={g} className="px-2.5 py-0.5 rounded-full bg-[#4A5D4E]/10 text-[#4A5D4E] text-xs font-bold">
                  {g}
                </span>
              ))}
            </div>

            <h1 className="font-amiri font-bold text-3xl sm:text-4xl text-[#2C2C2C] mb-3">
              {novel.title}
            </h1>

            <p className="text-sm text-[#6E6A64] mb-4">
              بقلم المؤلف: <strong className="text-[#2C2C2C]">{novel.author}</strong>
            </p>

            <p className="text-sm leading-relaxed text-[#2C2C2C]/90 mb-6 max-w-2xl whitespace-pre-wrap">
              {novel.synopsis}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              {chapters.length > 0 && (
                <a
                  href={`/novel/${novel.slug || novel.id}/chapter/${chapters[0].slug || chapters[0].chapterNumber}`}
                  className="px-6 py-3 rounded-xl bg-[#4A5D4E] hover:bg-[#3C4C3F] text-white font-bold text-sm shadow-md transition-all"
                >
                  ابدأ قراءة الفصل الأول ({chapters[0].title})
                </a>
              )}
              {novel.pdfDownloadUrl && (
                <a
                  href={novel.pdfDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-xl bg-[#C88A3B] hover:bg-[#B3782E] text-white font-bold text-sm shadow-sm transition-all"
                >
                  تحميل الكتاب PDF {novel.pdfFileSize ? `(${novel.pdfFileSize})` : ''}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Chapters Table */}
        <section className="mt-8">
          <h2 className="font-amiri font-bold text-2xl text-[#2C2C2C] mb-4">
            فصول الرواية ({chapters.length} فصول)
          </h2>

          <div className="space-y-2">
            {chapters.map(ch => (
              <a
                key={ch.id}
                href={`/novel/${novel.slug || novel.id}/chapter/${ch.slug || ch.chapterNumber}`}
                className="flex items-center justify-between p-4 rounded-xl border border-[#E5E2D9] bg-white hover:bg-[#F7F5EE] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#4A5D4E]/10 text-[#4A5D4E] font-bold text-xs flex items-center justify-center">
                    {ch.chapterNumber}
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-[#2C2C2C] group-hover:text-[#4A5D4E] transition-colors">
                      {ch.title}
                    </h3>
                    <p className="text-[11px] text-[#6E6A64]">
                      {ch.wordCount ? `${ch.wordCount.toLocaleString()} كلمة` : ''}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#4A5D4E] group-hover:translate-x-1 transition-transform">
                  قراءة ←
                </span>
              </a>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-16 bg-[#1C1B19] text-[#A8A49E] text-xs font-cairo py-8 px-4 text-center border-t border-white/10">
        <p>جميع الحقوق محفوظة للمؤلف © {new Date().getFullYear()} - {novel.title}</p>
      </footer>
    </div>
  );
};

/**
 * Builds dynamic Open Graph, Twitter Card, and Schema.org JSON-LD tags for Chapter SSR
 */
export function generateChapterSeoTags({
  novel,
  chapter,
  reqUrl,
  domain,
}: {
  novel: Novel;
  chapter: Chapter;
  reqUrl: string;
  domain: string;
}): {
  title: string;
  metaTags: string;
  jsonLd: string;
} {
  const pageTitle = chapter.seo?.metaTitle?.trim()
    ? chapter.seo.metaTitle.trim()
    : `${chapter.title} - ${novel.title} | ${novel.author || 'أيمن كناني'}`;
  const excerpt = chapter.seo?.metaDescription?.trim()
    || cleanExcerpt(chapter.content, 180)
    || `${chapter.title} من رواية ${novel.title} بقلم ${novel.author}. قراءة مباشرة كاملة مجاناً.`;
  const canonicalUrl = chapter.seo?.canonicalUrl?.trim() || `${domain}${reqUrl}`;
  const coverImage = chapter.seo?.ogImage?.trim()
    || novel.bannerImage
    || novel.coverImage
    || 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&auto=format&fit=crop&q=80';
  const isNoIndex = Boolean(chapter.seo?.noIndex || novel.seo?.noIndex);
  const keywordsStr = chapter.seo?.focusKeywords?.trim()
    ? chapter.seo.focusKeywords.trim()
    : [chapter.title, novel.title, novel.author || 'أيمن كناني', ...(novel.genres || [])].join(', ');

  const metaTags = `
    <!-- Dynamic SSR Meta Tags generated for Chapter ${chapter.chapterNumber} (Custom Chapter-Level SEO) -->
    <meta name="description" content="${escapeHtml(excerpt)}" />
    <meta name="keywords" content="${escapeHtml(keywordsStr)}" />
    <meta name="author" content="${escapeHtml(novel.author || 'أيمن كناني')}" />
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
    ${isNoIndex ? '<meta name="robots" content="noindex, nofollow" />' : '<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />'}

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapeHtml(pageTitle)}" />
    <meta property="og:description" content="${escapeHtml(excerpt)}" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:image" content="${escapeHtml(coverImage)}" />
    <meta property="og:site_name" content="أيمن كناني - المنصة الرسمية" />
    <meta property="article:published_time" content="${escapeHtml(chapter.publishedAt)}" />
    <meta property="article:author" content="${escapeHtml(novel.author || 'أيمن كناني')}" />
    <meta property="article:section" content="${escapeHtml(novel.genres?.[0] || 'روايات')}" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(excerpt)}" />
    <meta name="twitter:image" content="${escapeHtml(coverImage)}" />
  `;

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'الرئيسية',
            item: `${domain}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: novel.title,
            item: `${domain}/novel/${novel.slug || novel.id}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: chapter.title,
            item: canonicalUrl,
          },
        ],
      },
      {
        '@type': 'Article',
        '@id': `${canonicalUrl}#article`,
        isPartOf: {
          '@type': 'Book',
          name: novel.title,
          url: `${domain}/novel/${novel.slug || novel.id}`,
          author: {
            '@type': 'Person',
            name: novel.author,
          },
        },
        headline: chapter.title,
        description: excerpt,
        articleSection: novel.genres?.[0] || 'روايات',
        wordCount: chapter.wordCount,
        inLanguage: 'ar',
        datePublished: chapter.publishedAt,
        author: {
          '@type': 'Person',
          name: novel.author || 'أيمن كناني',
        },
        publisher: {
          '@type': 'Organization',
          name: 'أيمن كناني - المنصة الرسمية لنشر المؤلفات والكتب',
          url: domain,
        },
        mainEntityOfPage: canonicalUrl,
      },
    ],
  });

  return { title: pageTitle, metaTags, jsonLd };
}

/**
 * Builds dynamic Open Graph, Twitter Card, and Schema.org JSON-LD tags for Novel SSR
 */
export function generateNovelSeoTags({
  novel,
  chapters,
  reqUrl,
  domain,
}: {
  novel: Novel;
  chapters: Chapter[];
  reqUrl: string;
  domain: string;
}): {
  title: string;
  metaTags: string;
  jsonLd: string;
} {
  const pageTitle = novel.seo?.metaTitle?.trim() || `${novel.title} | بقلم ${novel.author || 'أيمن كناني'}`;
  const excerpt = novel.seo?.metaDescription?.trim() || cleanExcerpt(novel.synopsis, 180) || `رواية ${novel.title} للمؤلف ${novel.author}. تصفح الفصول واقرأ مباشرة على المنصة الرسمية.`;
  const canonicalUrl = novel.seo?.canonicalUrl?.trim() || `${domain}${reqUrl}`;
  const coverImage = novel.seo?.ogImage?.trim() || novel.coverImage || 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&auto=format&fit=crop&q=80';
  const authorName = novel.seo?.authorName?.trim() || novel.author || 'أيمن كناني';
  const robotsDirective = novel.seo?.noIndex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large';

  const keywordsList = [
    novel.seo?.focusKeywords,
    ...(novel.genres || []),
    ...(novel.tags || []),
    'روايات عربية',
    'تحميل PDF'
  ].filter(Boolean).join(', ');

  const metaTags = `
    <!-- Dynamic SSR Meta Tags for Book/Novel (Individual Novel SEO) -->
    <meta name="description" content="${escapeHtml(excerpt)}" />
    <meta name="author" content="${escapeHtml(authorName)}" />
    <meta name="keywords" content="${escapeHtml(keywordsList)}" />
    <meta name="robots" content="${escapeHtml(robotsDirective)}" />
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />

    <!-- Open Graph -->
    <meta property="og:type" content="book" />
    <meta property="og:title" content="${escapeHtml(pageTitle)}" />
    <meta property="og:description" content="${escapeHtml(excerpt)}" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:image" content="${escapeHtml(coverImage)}" />
    <meta property="og:image:alt" content="${escapeHtml(novel.title)}" />
    <meta property="og:locale" content="ar_AR" />
    <meta property="book:author" content="${escapeHtml(authorName)}" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(excerpt)}" />
    <meta name="twitter:image" content="${escapeHtml(coverImage)}" />
  `;

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Book',
    '@id': `${canonicalUrl}#book`,
    name: novel.seo?.metaTitle || novel.title,
    headline: novel.seo?.metaTitle || novel.title,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    description: excerpt,
    image: coverImage,
    genre: novel.genres,
    keywords: keywordsList,
    inLanguage: 'ar',
    numberOfPages: chapters.length,
    url: canonicalUrl,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: novel.rating || 5.0,
      bestRating: 5,
      worstRating: 1,
      ratingCount: novel.ratingCount || 1,
    }
  });

  return { title: pageTitle, metaTags, jsonLd };
}

/**
 * Injects rendered React HTML, Meta tags, and Initial Data into HTML template
 */
export function injectSsrIntoTemplate({
  template,
  title,
  metaTags,
  jsonLd,
  renderedHtml,
  initialData,
}: {
  template: string;
  title: string;
  metaTags: string;
  jsonLd: string;
  renderedHtml: string;
  initialData: any;
}): string {
  let html = template;

  // 1. Replace <title>
  if (title) {
    html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  }

  // 2. Inject Meta Tags before </head>
  const headInjection = `
    ${metaTags}
    <script id="ssr-json-ld" type="application/ld+json">
      ${jsonLd}
    </script>
  `;
  html = html.replace('</head>', `${headInjection}\n</head>`);

  // 3. Inject Rendered React HTML inside <div id="root">
  html = html.replace('<div id="root"></div>', `<div id="root">${renderedHtml}</div>`);

  // 4. Inject Initial State Script before </body>
  const serializedState = JSON.stringify(initialData).replace(/</g, '\\u003c');
  const stateScript = `<script id="__INITIAL_DATA__">window.__INITIAL_DATA__ = ${serializedState};</script>`;
  html = html.replace('</body>', `${stateScript}\n</body>`);

  return html;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
