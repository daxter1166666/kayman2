import type { Chapter, Novel } from '../types';

export interface ChapterPdfOptions {
  chapter: Chapter;
  novel: Novel;
  fontFamily?: 'amiri' | 'cairo' | 'tajawal' | 'readex' | 'scheherazade';
  fontSizePt?: number;
  lineHeight?: number;
  includeAuthorNote?: boolean;
  includeHeaderBadge?: boolean;
  siteUrl?: string;
}

export interface FullBookPdfOptions {
  novel: Novel;
  chapters: Chapter[];
  fontFamily?: 'amiri' | 'cairo' | 'tajawal' | 'readex' | 'scheherazade';
  fontSizePt?: number;
  lineHeight?: number;
  includeAuthorNote?: boolean;
  siteUrl?: string;
}

const FONT_DEFINITIONS: Record<
  string,
  { label: string; fontStack: string; googleFontName: string }
> = {
  amiri: {
    label: 'الخط الأميري الأصيل',
    fontStack: "'Amiri', 'Traditional Arabic', 'Scheherazade New', serif",
    googleFontName: 'Amiri:ital,wght@0,400;0,700;1,400;1,700',
  },
  cairo: {
    label: 'خط القاهرة الحديث',
    fontStack: "'Cairo', system-ui, -apple-system, sans-serif",
    googleFontName: 'Cairo:wght@400;600;700;800',
  },
  tajawal: {
    label: 'خط تجوال الأنيق',
    fontStack: "'Tajawal', system-ui, -apple-system, sans-serif",
    googleFontName: 'Tajawal:wght@400;500;700;800',
  },
  readex: {
    label: 'خط ريديكس برو',
    fontStack: "'Readex Pro', system-ui, -apple-system, sans-serif",
    googleFontName: 'Readex+Pro:wght@400;600;700',
  },
  scheherazade: {
    label: 'خط شهرزاد القرآني',
    fontStack: "'Scheherazade New', 'Traditional Arabic', serif",
    googleFontName: 'Scheherazade+New:wght@400;700',
  },
};

export function getFontDefinition(fontKey = 'amiri') {
  return FONT_DEFINITIONS[fontKey] || FONT_DEFINITIONS.amiri;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatChapterContentToHtml(content: string): string {
  const isHtml = /<[a-z][\s\S]*>/i.test(content || '');
  if (isHtml) {
    return content || '';
  }
  const paras = (content || '')
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);
  return paras
    .map(p => `<p class="chapter-para">${escapeHtml(p)}</p>`)
    .join('\n');
}

/**
 * Builds a standalone, high-fidelity printable HTML document for a SINGLE chapter.
 * - Always includes Author Name and CC BY-NC 4.0 License.
 * - Completely excludes all dates and timestamps.
 */
export function generateChapterPdfHtml(options: ChapterPdfOptions): string {
  const {
    chapter,
    novel,
    fontFamily = 'amiri',
    fontSizePt = 16,
    lineHeight = 2.1,
    includeAuthorNote = true,
    includeHeaderBadge = true,
    siteUrl = 'aymankinani.com',
  } = options;

  const fontDef = getFontDefinition(fontFamily);
  const bodyContentHtml = formatChapterContentToHtml(chapter.content || '');
  const cleanDocTitle = `${chapter.title} - ${novel.title} - ${novel.author}`;

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(cleanDocTitle)}</title>

  <!-- Google Fonts: Embedded explicitly for print engine -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@400;600;700;800&family=Readex+Pro:wght@400;600;700&family=Scheherazade+New:wght@400;700&family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet" />

  <style>
    /* CSS Reset & Print Variables */
    :root {
      --primary-font: ${fontDef.fontStack};
      --text-color: #1A1A1A;
      --accent-color: #3C4C3F;
      --gold-color: #A36A18;
      --border-color: #D6D2C4;
      --bg-tint: #FAF8F2;
    }

    *, *::before, *::after {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      background: #FFFFFF;
      color: var(--text-color);
      font-family: var(--primary-font);
      direction: rtl;
      text-align: justify;
      text-justify: inter-word;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* Page Definition for PDF output */
    @page {
      size: A4 portrait;
      margin: 16mm 16mm 18mm 16mm;
    }

    @media print {
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .no-print {
        display: none !important;
      }
    }

    .doc-container {
      max-width: 780px;
      margin: 0 auto;
      padding: 8px 12px;
    }

    /* Document Top Header */
    .doc-header {
      text-align: center;
      margin-bottom: 24px;
      padding-bottom: 18px;
      border-bottom: 1.5px solid var(--border-color);
    }

    .chapter-origin-banner {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 14px;
      margin-bottom: 12px;
      padding: 6px 14px;
      background: var(--bg-tint);
      border: 1px solid var(--border-color);
      border-radius: 24px;
    }

    .chapter-origin-cover-thumb {
      width: 36px;
      height: 50px;
      object-fit: cover;
      border-radius: 4px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      border: 1px solid var(--border-color);
      flex-shrink: 0;
    }

    .chapter-origin-info {
      text-align: right;
    }

    .platform-emblem {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 9.5pt;
      color: var(--accent-color);
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .book-origin-badge {
      display: inline-block;
      color: #333;
      font-size: 11pt;
      font-weight: 700;
      margin-top: 1px;
    }

    .chapter-main-title {
      font-size: 24pt;
      font-weight: 700;
      color: #111111;
      margin: 10px 0 14px 0;
      line-height: 1.4;
    }

    .chapter-meta-strip {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      gap: 12px;
      font-size: 11pt;
      color: #444;
      margin-top: 6px;
    }

    .meta-separator {
      color: var(--border-color);
    }

    /* Author Note Box */
    .author-note-card {
      background: var(--bg-tint);
      border: 1px solid var(--border-color);
      border-right: 4px solid var(--accent-color);
      border-radius: 8px;
      padding: 14px 18px;
      margin: 18px 0 28px 0;
      font-size: 12pt;
      line-height: 1.8;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .author-note-title {
      font-weight: 700;
      color: var(--accent-color);
      font-size: 11.5pt;
      margin-bottom: 6px;
    }

    /* Chapter Reading Body */
    .chapter-body {
      font-size: ${fontSizePt}pt;
      line-height: ${lineHeight};
      color: #1A1A1A;
      margin-top: 20px;
    }

    .chapter-para, .chapter-body p {
      margin: 0 0 1.4em 0;
      text-indent: 1.8em;
      text-align: justify;
      text-justify: inter-word;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .chapter-body h1, .chapter-body h2, .chapter-body h3, .chapter-body h4 {
      color: #111;
      margin-top: 1.6em;
      margin-bottom: 0.6em;
      font-weight: 700;
      page-break-after: avoid;
      break-after: avoid;
    }

    .chapter-body h2 { font-size: 18pt; border-bottom: 1px solid var(--border-color); padding-bottom: 4px; }
    .chapter-body h3 { font-size: 15pt; }

    /* Literary formatting elements */
    .book-poetry-couplet {
      margin: 22px auto;
      text-align: center;
      max-width: 86%;
      padding: 14px 20px;
      border: 1px solid var(--border-color);
      background: var(--bg-tint);
      border-radius: 10px;
      font-size: 14pt;
      line-height: 2.2;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .book-quote-block {
      margin: 18px 0;
      padding: 12px 18px;
      border-right: 4px solid var(--accent-color);
      background: var(--bg-tint);
      font-style: italic;
      border-radius: 4px;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .book-divider {
      text-align: center;
      margin: 24px 0;
      color: var(--gold-color);
      font-size: 16pt;
      letter-spacing: 6px;
    }

    /* Permanent Document Footer (Always visible) */
    .doc-footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1.5px solid var(--border-color);
      text-align: center;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .ornament-flourish {
      color: var(--gold-color);
      font-size: 14pt;
      margin-bottom: 12px;
      letter-spacing: 8px;
    }

    .copyright-text {
      font-size: 11pt;
      color: #222;
      margin: 4px 0;
      font-weight: 700;
    }

    .license-badge-box {
      display: inline-block;
      margin: 8px auto;
      padding: 6px 16px;
      background: var(--bg-tint);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      font-size: 10pt;
      color: #3C4C3F;
      font-weight: 600;
    }

    .download-source-text {
      font-size: 9.5pt;
      color: #666;
      margin: 4px 0 0 0;
    }
  </style>
</head>
<body>
  <div class="doc-container">
    <!-- Header -->
    <header class="doc-header">
      ${
        includeHeaderBadge
          ? `<div class="chapter-origin-banner">
              ${novel.coverImage ? `<img src="${escapeHtml(novel.coverImage)}" alt="${escapeHtml(novel.title)}" class="chapter-origin-cover-thumb" crossOrigin="anonymous" referrerpolicy="no-referrer" />` : ''}
              <div class="chapter-origin-info">
                <div class="platform-emblem">❖ المنصة الرسمية لنشر المؤلفات والكتب الأدبية ❖</div>
                <div class="book-origin-badge">من كتاب: «${escapeHtml(novel.title)}»</div>
              </div>
            </div>`
          : ''
      }
      <h1 class="chapter-main-title">
        الفصل ${chapter.chapterNumber}: ${escapeHtml(chapter.title)}
      </h1>
      <div class="chapter-meta-strip">
        <span>بقلم المؤلف: <strong>${escapeHtml(novel.author)}</strong></span>
        <span class="meta-separator">•</span>
        <span>عدد الكلمات: ${chapter.wordCount || '—'} كلمة</span>
      </div>
    </header>

    <!-- Optional Author Note -->
    ${
      includeAuthorNote && chapter.authorNote
        ? `<div class="author-note-card">
            <div class="author-note-title">ملاحظة الكاتب (${escapeHtml(novel.author)}):</div>
            <div>${escapeHtml(chapter.authorNote)}</div>
          </div>`
        : ''
    }

    <!-- Chapter Content Body -->
    <main class="chapter-body">
      ${bodyContentHtml}
    </main>

    <!-- Mandatory Literary Footer & Copyright (Always Included) -->
    <footer class="doc-footer">
      <div class="ornament-flourish">❖ ❖ ❖</div>
      <p class="copyright-text">جميع الحقوق محفوظة © للكاتب: <strong>${escapeHtml(novel.author)}</strong></p>
      <div class="license-badge-box">
        مرخّص برخصة المشاع الإبداعي: نسب المصنف - غير تجاري 4.0 دولي (CC BY-NC 4.0)
      </div>
      <p class="download-source-text">تم تنزيل هذا الفصل بصيغة مقروءة من المنصة الرسمية المعتمدة: ${escapeHtml(siteUrl)}</p>
    </footer>
  </div>

  <script>
    function triggerPrintWhenReady() {
      var imgs = Array.from(document.images);
      var imgPromises = imgs.map(function(img) {
        if (img.complete) return Promise.resolve();
        return new Promise(function(resolve) {
          img.onload = resolve;
          img.onerror = resolve;
        });
      });

      Promise.all(imgPromises).then(function() {
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(function() {
            setTimeout(function() {
              window.focus();
              window.print();
            }, 300);
          });
        } else {
          setTimeout(function() {
            window.focus();
            window.print();
          }, 500);
        }
      });
    }

    if (document.readyState === 'complete') {
      triggerPrintWhenReady();
    } else {
      window.addEventListener('load', triggerPrintWhenReady);
    }
  </script>
</body>
</html>`;
}

/**
 * Builds a comprehensive, high-fidelity printable HTML document for the ENTIRE BOOK.
 * Includes:
 * 1. Book Cover & Title Page (Title, Author, Genre, Synopsis, License)
 * 2. Table of Contents (فهرس فصول الكتاب)
 * 3. All Chapters rendered sequentially with page breaks
 * 4. Book Closing Page with Author Copyright & Creative Commons License
 * - Completely excludes all dates and timestamps.
 */
export function generateFullBookPdfHtml(options: FullBookPdfOptions): string {
  const {
    novel,
    chapters,
    fontFamily = 'amiri',
    fontSizePt = 16,
    lineHeight = 2.1,
    includeAuthorNote = true,
    siteUrl = 'aymankinani.com',
  } = options;

  const fontDef = getFontDefinition(fontFamily);
  const sortedChapters = [...chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);
  const totalWords = chapters.reduce((acc, c) => acc + (c.wordCount || 0), 0);
  const cleanDocTitle = `كتاب ${novel.title} كاملاً - بقلم ${novel.author}`;

  // Build Table of Contents rows
  const tocRowsHtml = sortedChapters
    .map(
      (ch) => `
        <div class="toc-item">
          <span class="toc-chapter-num">الفصل ${ch.chapterNumber}</span>
          <span class="toc-dots"></span>
          <span class="toc-chapter-title">${escapeHtml(ch.title)}</span>
          <span class="toc-words">${ch.wordCount ? `${ch.wordCount} كلمة` : ''}</span>
        </div>`
    )
    .join('\n');

  // Build all sequential chapters
  const chaptersHtml = sortedChapters
    .map((ch) => {
      const chapterContentHtml = formatChapterContentToHtml(ch.content || '');
      const authorNoteHtml =
        includeAuthorNote && ch.authorNote
          ? `<div class="author-note-card">
              <div class="author-note-title">ملاحظة الكاتب (${escapeHtml(novel.author)}):</div>
              <div>${escapeHtml(ch.authorNote)}</div>
            </div>`
          : '';

      return `
        <section class="book-chapter-block">
          <div class="chapter-page-header">
            <div class="chapter-top-crumb">من كتاب: ${escapeHtml(novel.title)} • بقلم الكاتب: ${escapeHtml(novel.author)}</div>
            <h2 class="chapter-heading">الفصل ${ch.chapterNumber}: ${escapeHtml(ch.title)}</h2>
            <div class="chapter-separator-line"></div>
          </div>

          ${authorNoteHtml}

          <div class="chapter-body">
            ${chapterContentHtml}
          </div>

          <div class="chapter-end-ornament">❖ ❖ ❖</div>
        </section>
      `;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(cleanDocTitle)}</title>

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@400;600;700;800&family=Readex+Pro:wght@400;600;700&family=Scheherazade+New:wght@400;700&family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet" />

  <style>
    :root {
      --primary-font: ${fontDef.fontStack};
      --text-color: #1A1A1A;
      --accent-color: #3C4C3F;
      --gold-color: #A36A18;
      --border-color: #D6D2C4;
      --bg-tint: #FAF8F2;
    }

    *, *::before, *::after {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      background: #FFFFFF;
      color: var(--text-color);
      font-family: var(--primary-font);
      direction: rtl;
      text-align: justify;
      text-justify: inter-word;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    @page {
      size: A4 portrait;
      margin: 16mm 16mm 18mm 16mm;
    }

    @page :first {
      margin: 0 !important;
    }

    @media print {
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .book-cover-fullscreen {
        width: 100vw !important;
        height: 100vh !important;
        max-width: 100vw !important;
        max-height: 100vh !important;
        margin: 0 !important;
        padding: 0 !important;
        page-break-before: avoid !important;
        page-break-after: always !important;
        break-after: page !important;
      }
      .cover-full-image {
        width: 100vw !important;
        height: 100vh !important;
        max-width: 100vw !important;
        max-height: 100vh !important;
        object-fit: cover !important;
        display: block !important;
      }
      .no-print {
        display: none !important;
      }
    }

    .doc-container {
      max-width: 780px;
      margin: 0 auto;
      padding: 8px 12px;
    }

    /* ====================================================
       1. FULL-PAGE BOOK COVER (ONLY COVER, FILLS 100% OF PAGE 1)
       ==================================================== */
    .book-cover-fullscreen {
      width: 100%;
      height: 100vh;
      min-height: 100vh;
      max-height: 100vh;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      page-break-before: avoid;
      page-break-after: always;
      break-after: page;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #000000;
      position: relative;
    }

    .cover-full-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      display: block;
      margin: 0;
      padding: 0;
    }

    /* Fallback if no cover image was provided */
    .book-cover-text-fallback {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 60px 40px;
      background: var(--bg-tint);
    }

    .cover-platform-badge {
      font-size: 11pt;
      font-weight: 700;
      color: var(--accent-color);
      letter-spacing: 1px;
      margin-bottom: 24px;
    }

    .cover-novel-title {
      font-size: 34pt;
      font-weight: 700;
      color: #111111;
      margin: 16px 0;
      line-height: 1.3;
    }

    .cover-novel-category {
      display: inline-block;
      padding: 6px 20px;
      background: #FFFFFF;
      border: 1px solid var(--border-color);
      border-radius: 20px;
      font-size: 12pt;
      color: var(--accent-color);
      font-weight: 600;
      margin-bottom: 24px;
    }

    .cover-author-block {
      font-size: 18pt;
      color: #222;
      margin: 18px 0;
      font-weight: 700;
    }

    .cover-author-block strong {
      color: var(--accent-color);
      border-bottom: 2px solid var(--gold-color);
      padding-bottom: 2px;
    }

    .cover-license-stamp {
      margin-top: 36px;
      padding: 14px 24px;
      border-top: 1.5px solid var(--border-color);
      font-size: 11pt;
      color: #333;
      line-height: 1.6;
    }

    /* ====================================================
       2. TABLE OF CONTENTS (فهرس الكتاب)
       ==================================================== */
    .book-toc-page {
      page-break-after: always;
      break-after: always;
      padding: 24px 10px;
    }

    .toc-header {
      text-align: center;
      margin-bottom: 28px;
      padding-bottom: 16px;
      border-bottom: 2px solid var(--border-color);
    }

    .toc-main-title {
      font-size: 24pt;
      font-weight: 700;
      color: #111;
      margin: 0 0 8px 0;
    }

    .toc-subtitle {
      font-size: 11.5pt;
      color: #555;
    }

    .toc-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 720px;
      margin: 0 auto;
    }

    .toc-item {
      display: flex;
      align-items: baseline;
      gap: 10px;
      font-size: 12.5pt;
      color: #222;
      padding: 4px 0;
    }

    .toc-chapter-num {
      font-weight: 700;
      color: var(--accent-color);
      white-space: nowrap;
      min-width: 80px;
    }

    .toc-chapter-title {
      font-weight: 600;
      white-space: nowrap;
    }

    .toc-dots {
      flex: 1;
      border-bottom: 1.5px dotted #BBB;
      margin: 0 6px;
      min-width: 40px;
    }

    .toc-words {
      font-size: 10pt;
      color: #777;
      white-space: nowrap;
    }

    /* ====================================================
       3. SEQUENTIAL CHAPTERS
       ==================================================== */
    .book-chapter-block {
      page-break-before: always;
      break-before: always;
      padding-top: 14px;
      margin-bottom: 30px;
    }

    .chapter-page-header {
      text-align: center;
      margin-bottom: 24px;
    }

    .chapter-top-crumb {
      font-size: 10.5pt;
      color: #666;
      margin-bottom: 6px;
    }

    .chapter-heading {
      font-size: 22pt;
      font-weight: 700;
      color: #111;
      margin: 6px 0 12px 0;
      line-height: 1.4;
    }

    .chapter-separator-line {
      width: 120px;
      height: 2px;
      background: var(--gold-color);
      margin: 10px auto;
    }

    .author-note-card {
      background: var(--bg-tint);
      border: 1px solid var(--border-color);
      border-right: 4px solid var(--accent-color);
      border-radius: 8px;
      padding: 14px 18px;
      margin: 18px 0 24px 0;
      font-size: 12pt;
      line-height: 1.8;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .author-note-title {
      font-weight: 700;
      color: var(--accent-color);
      font-size: 11.5pt;
      margin-bottom: 6px;
    }

    .chapter-body {
      font-size: ${fontSizePt}pt;
      line-height: ${lineHeight};
      color: #1A1A1A;
    }

    .chapter-para, .chapter-body p {
      margin: 0 0 1.4em 0;
      text-indent: 1.8em;
      text-align: justify;
      text-justify: inter-word;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .chapter-body h1, .chapter-body h2, .chapter-body h3 {
      color: #111;
      margin-top: 1.5em;
      margin-bottom: 0.6em;
      font-weight: 700;
      page-break-after: avoid;
    }

    .book-poetry-couplet {
      margin: 22px auto;
      text-align: center;
      max-width: 86%;
      padding: 14px 20px;
      border: 1px solid var(--border-color);
      background: var(--bg-tint);
      border-radius: 10px;
      font-size: 14pt;
      line-height: 2.2;
      page-break-inside: avoid;
    }

    .book-quote-block {
      margin: 18px 0;
      padding: 12px 18px;
      border-right: 4px solid var(--accent-color);
      background: var(--bg-tint);
      font-style: italic;
      border-radius: 4px;
      page-break-inside: avoid;
    }

    .book-divider {
      text-align: center;
      margin: 24px 0;
      color: var(--gold-color);
      font-size: 16pt;
      letter-spacing: 6px;
    }

    .chapter-end-ornament {
      text-align: center;
      margin: 36px 0 12px 0;
      color: var(--gold-color);
      font-size: 14pt;
      letter-spacing: 8px;
      page-break-inside: avoid;
    }

    /* ====================================================
       4. BOOK CLOSING PAGE
       ==================================================== */
    .book-closing-page {
      page-break-before: always;
      break-before: always;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      min-height: 70vh;
      padding: 40px 20px;
      border: 2px solid var(--border-color);
      background: var(--bg-tint);
      border-radius: 16px;
      margin-top: 30px;
    }

    .closing-title {
      font-size: 26pt;
      font-weight: 700;
      color: #111;
      margin-bottom: 16px;
    }

    .closing-novel-name {
      font-size: 18pt;
      color: var(--accent-color);
      font-weight: 700;
      margin-bottom: 24px;
    }

    .closing-license-box {
      max-width: 580px;
      background: #FFFFFF;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 20px 24px;
      margin: 20px auto;
      text-align: center;
    }

    .closing-license-box h4 {
      margin: 0 0 10px 0;
      font-size: 13pt;
      color: #111;
      font-weight: 700;
    }

    .closing-license-box p {
      margin: 6px 0;
      font-size: 11pt;
      color: #444;
      line-height: 1.7;
    }
  </style>
</head>
<body>
  <!-- 1. FULL-PAGE COVER (PAGE 1) - ONLY THE COVER FILLS 100% OF THE PAGE -->
  <div class="book-cover-fullscreen">
    ${
      novel.coverImage
        ? `<img src="${escapeHtml(novel.coverImage)}" alt="${escapeHtml(novel.title)}" class="cover-full-image" crossOrigin="anonymous" referrerpolicy="no-referrer" />`
        : `<div class="book-cover-text-fallback">
            <div class="cover-platform-badge">❖ المنصة الرسمية لنشر المؤلفات والكتب الأدبية ❖</div>
            <h1 class="cover-novel-title">${escapeHtml(novel.title)}</h1>
            ${novel.genres && novel.genres.length > 0 ? `<div class="cover-novel-category">${escapeHtml(novel.genres.join(' • '))}</div>` : ''}
            <div class="cover-author-block">بقلم الكاتب: <strong>${escapeHtml(novel.author)}</strong></div>
            <div class="cover-license-stamp">
              <strong>جميع الحقوق محفوظة © للكاتب ${escapeHtml(novel.author)}</strong><br />
              مرخّص برخصة المشاع الإبداعي: نسب المصنف - غير تجاري 4.0 دولي (CC BY-NC 4.0) • النسخة الكاملة الرسمية
            </div>
          </div>`
    }
  </div>

  <div class="doc-container">
    <!-- 2. TABLE OF CONTENTS PAGE (DIRECTLY AFTER FULL COVER, NO SYNOPSIS) -->
    <div class="book-toc-page">
      <div class="toc-header">
        <h2 class="toc-main-title">فهرس فصول الكتاب</h2>
        <div class="toc-subtitle">قائمة الفصول المرتبة لعمل: ${escapeHtml(novel.title)} • بقلم الكاتب: ${escapeHtml(novel.author)}</div>
      </div>
      <div class="toc-list">
        ${tocRowsHtml}
      </div>
    </div>

    <!-- 3. ALL CHAPTERS SEQUENTIALLY -->
    ${chaptersHtml}

    <!-- 4. CLOSING PAGE WITH MANDATORY LICENSE & AUTHOR NAME -->
    <div class="book-closing-page">
      <div style="font-size: 20pt; color: var(--gold-color); margin-bottom: 12px; letter-spacing: 8px;">❖ ❖ ❖</div>
      <h2 class="closing-title">تم بحمد الله</h2>
      <div class="closing-novel-name">اكتملت قراءة كتاب: «${escapeHtml(novel.title)}»</div>

      <div class="closing-license-box">
        <h4>بيانات الملكية الفكرية ورخصة النشر</h4>
        <p>جميع الحقوق الأدبية والفكرية محفوظة © للكاتب: <strong>${escapeHtml(novel.author)}</strong></p>
        <p>مرخّص بموجب رخصة المشاع الإبداعي الدولية: <strong>نسب المصنف - غير تجاري 4.0 (CC BY-NC 4.0)</strong></p>
        <p style="font-size: 9.5pt; color: #666; margin-top: 10px;">يحظر الاستغلال التجاري لهذا العمل أو إعادة نشره بصورة تجارية دون إذن كتابي صريح من الكاتب.</p>
      </div>

      <p style="font-size: 10pt; color: #777; margin-top: 16px;">تم تنزيل النسخة الكاملة من المنصة الرسمية المعتمدة: ${escapeHtml(siteUrl)}</p>
    </div>
  </div>

  <script>
    function triggerPrintWhenReady() {
      var imgs = Array.from(document.images);
      var imgPromises = imgs.map(function(img) {
        if (img.complete) return Promise.resolve();
        return new Promise(function(resolve) {
          img.onload = resolve;
          img.onerror = resolve;
        });
      });

      Promise.all(imgPromises).then(function() {
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(function() {
            setTimeout(function() {
              window.focus();
              window.print();
            }, 350);
          });
        } else {
          setTimeout(function() {
            window.focus();
            window.print();
          }, 600);
        }
      });
    }

    if (document.readyState === 'complete') {
      triggerPrintWhenReady();
    } else {
      window.addEventListener('load', triggerPrintWhenReady);
    }
  </script>
</body>
</html>`;
}

/**
 * Triggers the high-fidelity print-to-PDF flow for a single chapter
 */
export async function printChapterAsPdf(options: ChapterPdfOptions): Promise<boolean> {
  try {
    const html = generateChapterPdfHtml(options);
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      return printViaHiddenIframe(html);
    }
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    return true;
  } catch (err) {
    console.error('Error printing chapter as PDF:', err);
    return false;
  }
}

/**
 * Triggers the high-fidelity print-to-PDF flow for the entire book
 */
export async function printFullBookAsPdf(options: FullBookPdfOptions): Promise<boolean> {
  try {
    const html = generateFullBookPdfHtml(options);
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      return printViaHiddenIframe(html);
    }
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    return true;
  } catch (err) {
    console.error('Error printing full book as PDF:', err);
    return false;
  }
}

/**
 * Fallback print mechanism using an invisible iframe
 */
function printViaHiddenIframe(html: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.visibility = 'hidden';

      document.body.appendChild(iframe);

      const frameDoc = iframe.contentWindow?.document;
      if (!frameDoc) {
        document.body.removeChild(iframe);
        resolve(false);
        return;
      }

      frameDoc.open();
      frameDoc.write(html);
      frameDoc.close();

      iframe.onload = () => {
        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            setTimeout(() => {
              if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
              }
              resolve(true);
            }, 1000);
          } catch (e) {
            console.error('Iframe print error:', e);
            resolve(false);
          }
        }, 500);
      };
    } catch (e) {
      console.error('printViaHiddenIframe error:', e);
      resolve(false);
    }
  });
}
