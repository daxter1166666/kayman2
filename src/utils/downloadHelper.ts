import { Novel, Chapter } from '../types';

/**
 * Converts common cloud sharing URLs (Google Drive, Dropbox, OneDrive) into direct download links.
 */
export function getDirectDownloadUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  const url = rawUrl.trim();

  // 1. Google Drive direct download
  const driveMatch = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
  }

  // 2. Dropbox direct download (replace dl=0 with dl=1)
  if (url.includes('dropbox.com')) {
    if (url.includes('dl=0')) {
      return url.replace('dl=0', 'dl=1');
    }
    if (!url.includes('dl=1')) {
      return url.includes('?') ? `${url}&dl=1` : `${url}?dl=1`;
    }
    return url;
  }

  // 3. OneDrive direct download
  if (url.includes('onedrive.live.com') && url.includes('redir?')) {
    return url.replace('redir?', 'download?');
  }

  return url;
}

/**
 * Formats raw text or HTML into well-structured literary paragraphs with proper Arabic spacing.
 */
function formatChapterBody(rawContent: string): string {
  if (!rawContent) return '<p class="paragraph">لا يوجد محتوى مدرج لهذا الفصل حتى الآن.</p>';

  // Check if content already contains HTML tags like <p>, <div>, <blockquote>
  const hasHtmlBlocks = /<(?:p|div|blockquote|h[1-6]|ul|ol|li)[^>]*>/i.test(rawContent);
  if (hasHtmlBlocks) {
    return rawContent;
  }

  // Convert plain text into styled paragraphs
  const paragraphs = rawContent
    .split(/\n{2,}|\r\n\r\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  if (paragraphs.length === 0) {
    return `<p class="paragraph">${rawContent.replace(/\n/g, '<br />')}</p>`;
  }

  return paragraphs
    .map(p => `<p class="paragraph">${p.replace(/\n/g, '<br />')}</p>`)
    .join('\n');
}

/**
 * Resolves the primary font family for the book.
 * Checks chapter-level settings, author preference, and reader settings.
 */
function resolvePrimaryFont(chapters: Chapter[], explicitFont?: string): string {
  if (explicitFont) return explicitFont;
  
  // Chapter-specific preference
  const chapterWithFont = chapters.find(c => c.fontFamily);
  if (chapterWithFont?.fontFamily) return chapterWithFont.fontFamily;

  // Browser storage preferences
  if (typeof window !== 'undefined') {
    const authorFont = localStorage.getItem('ayman_author_preferred_font');
    if (authorFont) return authorFont;

    try {
      const readerSettingsStr = localStorage.getItem('ayman_reader_settings_v2');
      if (readerSettingsStr) {
        const parsed = JSON.parse(readerSettingsStr);
        if (parsed.fontFamily) return parsed.fontFamily;
      }
    } catch {
      // ignore JSON parse error
    }
  }

  return 'cairo';
}

/**
 * Generates an exquisite, professional eBook edition matching publication standards:
 * - Page 1: Full-bleed book cover image covering the entire first page edge-to-edge.
 * - Page 2: Internal title page, publication registry, copyright, and Creative Commons (CC BY-NC 4.0) license.
 * - Page 3: Elegant Table of Contents with hyperlinked chapters.
 * - Pages 4+: Formatted chapters in the author's or reader's selected font (Amiri, Cairo, Scheherazade, Tajawal, Readex, Lora).
 * - Back page: Author credentials, official website imprint, and literary rights.
 */
export function generateBookHtml(novel: Novel, chapters: Chapter[], explicitFont?: string): string {
  const sortedChapters = [...chapters]
    .filter(c => c.novelId === novel.id)
    .sort((a, b) => a.chapterNumber - b.chapterNumber);

  const primaryFont = resolvePrimaryFont(chapters, explicitFont);
  const totalWords = sortedChapters.reduce((acc, ch) => acc + (ch.wordCount || 0), 0);
  const currentYear = new Date().getFullYear();

  const chaptersHtml = sortedChapters.map(ch => {
    const chFont = ch.fontFamily || primaryFont;
    const estMinutes = Math.max(1, Math.round((ch.wordCount || 350) / 200));

    return `
    <article class="page-chapter font-${chFont}" id="chapter-${ch.chapterNumber}" data-font="${chFont}">
      <header class="chapter-header">
        <div class="chapter-badge">الفصل ${ch.chapterNumber}</div>
        <h2 class="chapter-title">${ch.title}</h2>
        <div class="chapter-meta">
          <span>📖 ${ch.wordCount || 0} كلمة</span>
          <span>•</span>
          <span>⏱️ ${estMinutes} دقائق قراءة</span>
        </div>
        <div class="chapter-divider">❧ ❖ ❧</div>
      </header>

      ${ch.authorNote ? `
        <aside class="author-note-card">
          <div class="author-note-title">💡 ملحوظة من المؤلف</div>
          <div class="author-note-body">${ch.authorNote}</div>
        </aside>
      ` : ''}

      <div class="chapter-content font-${chFont}">
        ${formatChapterBody(ch.content)}
      </div>

      <footer class="chapter-footer">
        <div class="chapter-end-ornament">✦ ❖ ✦</div>
        <div class="chapter-end-label">تم بحمد الله الفصل ${ch.chapterNumber}</div>
      </footer>
    </article>
    `;
  }).join('');

  const tocHtml = sortedChapters.map(ch => `
    <li class="toc-item">
      <a href="#chapter-${ch.chapterNumber}" class="toc-link">
        <span class="toc-number">الفصل ${ch.chapterNumber}</span>
        <span class="toc-name">${ch.title}</span>
        <span class="toc-dots"></span>
        <span class="toc-words">${ch.wordCount || 0} كلمة</span>
      </a>
    </li>
  `).join('');

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${novel.title} - ${novel.author} | الطبعة الكاملة</title>
  
  <!-- Google Fonts: All supported Arabic literary typefaces -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@400;600;700;800;900&family=Readex+Pro:wght@400;500;600;700&family=Scheherazade+New:wght@400;700&family=Tajawal:wght@400;500;700;800&family=Lora:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">

  <style>
    :root {
      --primary-color: #2F4234;
      --primary-dark: #1E2D22;
      --accent-gold: #C88A3B;
      --accent-gold-dark: #9E641B;
      --text-main: #242424;
      --text-muted: #66625B;
      --border-color: #E2DFD6;
      --bg-canvas: #FDFCF8;
      --bg-card: #FFFFFF;
      --bg-alt: #F7F5EE;
    }

    /* Print Setup for A4 Physical & PDF Output */
    @page {
      size: A4 portrait;
      margin: 18mm 16mm;
      @bottom-center {
        content: counter(page);
        font-family: 'Cairo', sans-serif;
        font-size: 10pt;
        color: #777;
      }
      @top-center {
        content: '${novel.title} — ${novel.author}';
        font-family: 'Cairo', sans-serif;
        font-size: 9pt;
        color: #888;
        border-bottom: 0.5pt solid #E2DFD6;
        padding-bottom: 3mm;
      }
    }

    /* Cover Page - Absolutely Zero Margin for Full Bleed First Page */
    @page :first {
      margin: 0 !important;
      @bottom-center { content: none !important; }
      @top-center { content: none !important; }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      direction: rtl;
      text-align: right;
      background-color: var(--bg-canvas);
      color: var(--text-main);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    body {
      font-size: 19px;
      line-height: 2.2;
    }

    /* Font Classes */
    .font-amiri, [data-font="amiri"], .font-amiri * { font-family: 'Amiri', 'Traditional Arabic', serif !important; }
    .font-cairo, [data-font="cairo"], .font-cairo * { font-family: 'Cairo', 'Readex Pro', system-ui, sans-serif !important; }
    .font-tajawal, [data-font="tajawal"], .font-tajawal * { font-family: 'Tajawal', system-ui, sans-serif !important; }
    .font-scheherazade, [data-font="scheherazade"], .font-scheherazade * { font-family: 'Scheherazade New', 'Amiri', serif !important; }
    .font-readex, [data-font="readex"], .font-readex * { font-family: 'Readex Pro', system-ui, sans-serif !important; }
    .font-lora, [data-font="lora"], .font-lora * { font-family: 'Lora', serif !important; }

    /* Interactive Toolbar for Reading & PDF Export */
    .ebook-toolbar {
      position: sticky;
      top: 0;
      z-index: 999;
      background: rgba(253, 252, 248, 0.98);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--border-color);
      padding: 10px 20px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      font-family: 'Cairo', sans-serif;
      box-shadow: 0 4px 16px rgba(0,0,0,0.04);
    }

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .toolbar-title {
      font-weight: 700;
      font-size: 15px;
      color: var(--primary-color);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .toolbar-select {
      background: #FFFFFF;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 6px 12px;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-main);
      cursor: pointer;
      font-family: 'Cairo', sans-serif;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 16px;
      font-size: 13px;
      font-weight: 700;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
      font-family: 'Cairo', sans-serif;
    }

    .btn-gold {
      background: var(--accent-gold);
      color: #FFFFFF;
    }
    .btn-gold:hover {
      background: var(--accent-gold-dark);
      transform: translateY(-1px);
    }

    .btn-outline {
      background: #FFFFFF;
      border: 1px solid var(--border-color);
      color: var(--text-main);
    }
    .btn-outline:hover {
      background: var(--bg-alt);
    }

    /* Container */
    .ebook-container {
      max-width: 860px;
      margin: 0 auto;
      padding: 0 20px;
    }

    /* ------------------------------------------------------------- */
    /* PAGE 1: FULL-BLEED COVER PAGE                                 */
    /* ------------------------------------------------------------- */
    .cover-page {
      width: 100vw;
      height: 100vh;
      min-height: 100vh;
      position: relative;
      margin: 0 0 40px 0;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #161816;
      overflow: hidden;
      page-break-before: avoid;
      page-break-after: always;
      break-after: page;
    }

    .cover-image-full {
      width: 100%;
      height: 100%;
      max-width: 100%;
      max-height: 100%;
      object-fit: cover;
      object-position: center center;
      display: block;
    }

    /* Fallback Cover if no image is available */
    .cover-fallback {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(145deg, #1f2e24 0%, #111a14 100%);
      padding: 40px;
      text-align: center;
      color: #FDFCF8;
    }

    .cover-frame {
      border: 3px solid rgba(200, 138, 59, 0.6);
      border-radius: 16px;
      padding: 60px 40px;
      max-width: 600px;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: inset 0 0 30px rgba(0,0,0,0.5);
    }

    .cover-tag {
      background: var(--accent-gold);
      color: #FFFFFF;
      padding: 4px 18px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 30px;
      font-family: 'Cairo', sans-serif;
    }

    .cover-title {
      font-size: 44px;
      font-weight: 800;
      line-height: 1.3;
      margin-bottom: 20px;
      color: #FFFFFF;
    }

    .cover-divider {
      color: var(--accent-gold);
      font-size: 24px;
      margin: 20px 0;
    }

    .cover-author-title {
      font-size: 14px;
      color: #A3B899;
      margin-bottom: 6px;
      font-family: 'Cairo', sans-serif;
    }

    .cover-author {
      font-size: 26px;
      font-weight: 700;
      color: #FDFCF8;
      margin-bottom: 30px;
    }

    .cover-imprint {
      margin-top: auto;
      font-size: 12px;
      color: #8C998E;
      font-family: 'Cairo', sans-serif;
    }

    /* ------------------------------------------------------------- */
    /* PAGE 2: TITLE, COPYRIGHT, AND LEGAL LICENSE                   */
    /* ------------------------------------------------------------- */
    .title-license-page {
      padding: 60px 0 40px;
      margin-bottom: 50px;
      border-bottom: 1px solid var(--border-color);
      page-break-before: always;
      page-break-after: always;
      break-after: page;
      min-height: calc(100vh - 80px);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .inner-title-header {
      text-align: center;
      margin-bottom: 35px;
    }

    .inner-category-pill {
      display: inline-block;
      font-size: 13px;
      font-weight: 700;
      background: var(--bg-alt);
      border: 1px solid var(--border-color);
      color: var(--primary-color);
      padding: 4px 16px;
      border-radius: 999px;
      margin-bottom: 16px;
      font-family: 'Cairo', sans-serif;
    }

    .inner-title {
      font-size: 36px;
      font-weight: 800;
      color: var(--primary-color);
      margin-bottom: 10px;
      line-height: 1.3;
    }

    .inner-author {
      font-size: 20px;
      color: var(--text-muted);
      font-family: 'Cairo', sans-serif;
      font-weight: 600;
    }

    .inner-author strong {
      color: var(--text-main);
    }

    .inner-ornament {
      color: var(--accent-gold);
      font-size: 20px;
      margin: 16px 0;
    }

    /* Metadata Table */
    .publication-meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px 24px;
      background: #FFFFFF;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 18px 24px;
      margin-bottom: 30px;
      font-family: 'Cairo', sans-serif;
      font-size: 14px;
    }

    .meta-item {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }

    .meta-label {
      font-weight: 700;
      color: var(--text-muted);
      white-space: nowrap;
    }

    .meta-value {
      font-weight: 600;
      color: var(--text-main);
    }

    /* License & Rights Card */
    .license-card {
      background: #FAF8F2;
      border: 1.5px solid #DFC99E;
      border-radius: 12px;
      padding: 24px 28px;
      margin-bottom: 30px;
      font-family: 'Cairo', sans-serif;
    }

    .license-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #EFE4CA;
      color: #6E4814;
      padding: 4px 14px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 800;
      margin-bottom: 14px;
    }

    .license-card-title {
      font-size: 18px;
      font-weight: 800;
      color: var(--primary-color);
      margin-bottom: 10px;
    }

    .license-quote {
      font-size: 15px;
      line-height: 1.8;
      color: #3C3B37;
      font-style: italic;
      background: rgba(255, 255, 255, 0.7);
      padding: 12px 18px;
      border-right: 3px solid var(--accent-gold);
      border-radius: 0 8px 8px 0;
      margin-bottom: 16px;
    }

    .license-rules-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      margin-bottom: 16px;
      font-size: 13.5px;
    }

    .license-rule-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      line-height: 1.6;
    }

    .license-rule-item .icon {
      font-size: 16px;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .copyright-footer-line {
      font-size: 12.5px;
      color: var(--text-muted);
      border-top: 1px solid #DFC99E;
      padding-top: 12px;
      margin-top: 12px;
      text-align: center;
      line-height: 1.7;
    }

    /* Synopsis Box */
    .book-synopsis-box {
      background: #FFFFFF;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 22px 26px;
      margin-top: auto;
    }

    .synopsis-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--primary-color);
      margin-bottom: 8px;
      font-family: 'Cairo', sans-serif;
    }

    .synopsis-body {
      font-size: 16px;
      line-height: 2.0;
      color: #444;
      text-align: justify;
    }

    /* ------------------------------------------------------------- */
    /* PAGE 3: TABLE OF CONTENTS (فهرس فصول الكتاب)                  */
    /* ------------------------------------------------------------- */
    .toc-page {
      padding: 40px 0;
      margin-bottom: 50px;
      border-bottom: 1px solid var(--border-color);
      page-break-before: always;
      page-break-after: always;
      break-after: page;
      font-family: 'Cairo', sans-serif;
    }

    .toc-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .toc-title {
      font-size: 26px;
      font-weight: 800;
      color: var(--primary-color);
      margin-bottom: 8px;
    }

    .toc-stats {
      font-size: 13.5px;
      color: var(--text-muted);
    }

    .toc-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .toc-item {
      margin-bottom: 8px;
    }

    .toc-link {
      display: flex;
      align-items: baseline;
      text-decoration: none;
      color: var(--text-main);
      padding: 8px 12px;
      border-radius: 8px;
      transition: background 0.15s ease;
      font-size: 15px;
    }

    .toc-link:hover {
      background: var(--bg-alt);
      color: var(--accent-gold-dark);
    }

    .toc-number {
      font-weight: 700;
      color: var(--primary-color);
      min-width: 75px;
      flex-shrink: 0;
    }

    .toc-name {
      font-weight: 600;
      color: var(--text-main);
    }

    .toc-dots {
      flex: 1;
      border-bottom: 1px dotted #B0ACA3;
      margin: 0 12px;
      min-width: 20px;
    }

    .toc-words {
      font-size: 13px;
      color: var(--text-muted);
      flex-shrink: 0;
    }

    /* ------------------------------------------------------------- */
    /* CHAPTERS: LITERARY TYPOGRAPHY                                 */
    /* ------------------------------------------------------------- */
    .page-chapter {
      padding-top: 50px;
      margin-bottom: 70px;
      page-break-before: always;
      break-before: page;
    }

    .chapter-header {
      text-align: center;
      margin-bottom: 35px;
      padding-bottom: 25px;
      border-bottom: 1px solid var(--border-color);
    }

    .chapter-badge {
      display: inline-block;
      font-family: 'Cairo', sans-serif;
      font-size: 13px;
      font-weight: 800;
      color: #FFFFFF;
      background: var(--primary-color);
      padding: 4px 18px;
      border-radius: 999px;
      margin-bottom: 12px;
      letter-spacing: 0.5px;
    }

    .chapter-title {
      font-size: 32px;
      font-weight: 800;
      color: #1A1A1A;
      margin: 0 0 10px 0;
      line-height: 1.4;
    }

    .chapter-meta {
      font-family: 'Cairo', sans-serif;
      font-size: 13px;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 12px;
    }

    .chapter-divider {
      color: var(--accent-gold);
      font-size: 18px;
    }

    .author-note-card {
      background: #F8F7F2;
      border-right: 4px solid var(--accent-gold);
      border-radius: 0 8px 8px 0;
      padding: 16px 20px;
      margin: 0 0 30px 0;
      font-family: 'Cairo', sans-serif;
      font-size: 15px;
    }

    .author-note-title {
      font-weight: 700;
      color: var(--accent-gold-dark);
      margin-bottom: 6px;
    }

    .author-note-body {
      color: var(--text-main);
      line-height: 1.8;
    }

    /* Chapter Content Paragraphs */
    .chapter-content {
      text-align: justify;
      text-justify: inter-word;
      word-break: break-word;
    }

    .chapter-content p, .chapter-content .paragraph {
      margin-bottom: 1.8em;
      text-indent: 2.2em;
      line-height: 2.25;
      letter-spacing: 0.01em;
    }

    /* First paragraph has no indent, but has stylized opening */
    .chapter-content p:first-of-type, .chapter-content .paragraph:first-of-type {
      text-indent: 0;
    }

    .chapter-footer {
      text-align: center;
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px dashed var(--border-color);
      font-family: 'Cairo', sans-serif;
    }

    .chapter-end-ornament {
      color: var(--accent-gold);
      font-size: 16px;
      margin-bottom: 6px;
    }

    .chapter-end-label {
      font-size: 13px;
      color: var(--text-muted);
      font-weight: 600;
    }

    /* ------------------------------------------------------------- */
    /* BACK COVER / EPILOGUE PAGE                                    */
    /* ------------------------------------------------------------- */
    .back-cover-page {
      padding: 60px 0;
      margin-top: 80px;
      border-top: 2px solid var(--border-color);
      text-align: center;
      page-break-before: always;
      break-before: page;
      font-family: 'Cairo', sans-serif;
    }

    .back-author-title {
      font-size: 22px;
      font-weight: 800;
      color: var(--primary-color);
      margin-bottom: 10px;
    }

    .back-author-bio {
      font-size: 15px;
      line-height: 2.0;
      color: var(--text-muted);
      max-width: 650px;
      margin: 0 auto 24px;
    }

    .back-url-badge {
      display: inline-block;
      font-size: 14px;
      font-weight: 700;
      color: #FFFFFF;
      background: var(--primary-color);
      padding: 8px 24px;
      border-radius: 999px;
      margin-bottom: 20px;
    }

    .back-legal-note {
      font-size: 12px;
      color: var(--text-muted);
      line-height: 1.8;
    }

    /* ------------------------------------------------------------- */
    /* PRINT SPECIFIC STYLES                                         */
    /* ------------------------------------------------------------- */
    @media print {
      .ebook-toolbar {
        display: none !important;
      }

      html, body {
        background: #FFFFFF !important;
        color: #111111 !important;
        font-size: 14pt !important;
        line-height: 1.9 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      .ebook-container {
        max-width: 100% !important;
        padding: 0 !important;
        margin: 0 !important;
      }

      /* First Page: True Full Bleed Cover */
      .cover-page {
        width: 100vw !important;
        height: 100vh !important;
        min-height: 100vh !important;
        max-height: 100vh !important;
        margin: 0 !important;
        padding: 0 !important;
        page-break-before: avoid !important;
        page-break-after: always !important;
        break-after: page !important;
      }

      .cover-image-full {
        width: 100vw !important;
        height: 100vh !important;
        object-fit: cover !important;
        object-position: center !important;
      }

      .title-license-page {
        page-break-before: always !important;
        break-before: page !important;
        page-break-after: always !important;
        break-after: page !important;
        min-height: 90vh !important;
        padding-top: 15mm !important;
      }

      .toc-page {
        page-break-before: always !important;
        break-before: page !important;
        page-break-after: always !important;
        break-after: page !important;
        padding-top: 15mm !important;
      }

      .page-chapter {
        page-break-before: always !important;
        break-before: page !important;
        padding-top: 15mm !important;
      }

      .back-cover-page {
        page-break-before: always !important;
        break-before: page !important;
        padding-top: 25mm !important;
      }

      a {
        text-decoration: none !important;
        color: inherit !important;
      }

      .publication-meta-grid, .license-card, .book-synopsis-box {
        box-shadow: none !important;
        border: 1px solid #CCC !important;
      }
    }
  </style>
</head>
<body class="font-${primaryFont}">

  <!-- Interactive Reader & PDF Toolbar -->
  <aside class="ebook-toolbar" aria-label="أدوات قراءة وطباعة الكتاب">
    <div class="toolbar-left">
      <div class="toolbar-title">
        <span>📖</span>
        <span>${novel.title}</span>
        <span style="font-weight: normal; color: var(--text-muted); font-size: 13px;">| ${novel.author}</span>
      </div>
    </div>

    <div class="toolbar-actions">
      <!-- Font Switcher -->
      <select class="toolbar-select" id="fontSelector" onchange="changeBookFont(this.value)" title="اختر نوع الخط">
        <option value="cairo" ${primaryFont === 'cairo' ? 'selected' : ''}>خط كايرو (الافتراضي)</option>
        <option value="amiri" ${primaryFont === 'amiri' ? 'selected' : ''}>الخط الأميري (الأصيل)</option>
        <option value="scheherazade" ${primaryFont === 'scheherazade' ? 'selected' : ''}>خط شهرزاد (النسخي الفاخر)</option>
        <option value="tajawal" ${primaryFont === 'tajawal' ? 'selected' : ''}>خط تجوال (العصري)</option>
        <option value="readex" ${primaryFont === 'readex' ? 'selected' : ''}>خط ريدكس (المعاصر)</option>
        <option value="lora" ${primaryFont === 'lora' ? 'selected' : ''}>خط لورا (المترجم)</option>
      </select>

      <!-- Font Size Controller -->
      <button class="btn btn-outline" onclick="adjustFontSize(-1)" title="تصغير الخط">A-</button>
      <button class="btn btn-outline" onclick="adjustFontSize(1)" title="تكبير الخط">A+</button>

      <!-- Jump to Table of Contents -->
      <a href="#toc-section" class="btn btn-outline">📑 الفهرس</a>

      <!-- Direct PDF / Print Button -->
      <button onclick="window.print()" class="btn btn-gold" title="حفظ هذا الكتاب كملف PDF على جهازك أو طباعته">
        🖨️ حفظ كملف PDF / طباعة
      </button>
    </div>
  </aside>

  <!-- PAGE 1: FULL-PAGE BOOK COVER -->
  <section class="cover-page" id="book-cover">
    ${novel.coverImage ? `
      <img
        src="${novel.coverImage}"
        alt="${novel.title}"
        class="cover-image-full"
        loading="eager"
      />
    ` : `
      <div class="cover-fallback">
        <div class="cover-frame">
          <div class="cover-tag">${novel.genres?.[0] || 'مؤلَّف أدبي وفكري'}</div>
          <h1 class="cover-title">${novel.title}</h1>
          <div class="cover-divider">❦ ❖ ❦</div>
          <div class="cover-author-title">المؤلف والباحث</div>
          <div class="cover-author">${novel.author}</div>
          <div class="cover-imprint">المنصة الرسمية لنشر المؤلفات — aymankinani.com</div>
        </div>
      </div>
    `}
  </section>

  <div class="ebook-container">
    <!-- PAGE 2: INNER TITLE, REGISTRY, COPYRIGHT & CC BY-NC 4.0 LICENSE -->
    <section class="title-license-page">
      <div class="inner-title-header">
        <div class="inner-category-pill">${novel.genres?.join(' • ') || 'رواية وأدب'}</div>
        <h1 class="inner-title">${novel.title}</h1>
        <div class="inner-author">تأليف: <strong>${novel.author}</strong></div>
        <div class="inner-ornament">✦ ❖ ✦</div>
      </div>

      <!-- Publication Metadata -->
      <div class="publication-meta-grid">
        <div class="meta-item">
          <span class="meta-label">الجهة الناشرة:</span>
          <span class="meta-value">المنصة الرسمية للكاتب أيمن كناني (aymankinani.com)</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">سنة الإصدار:</span>
          <span class="meta-value">${currentYear}م — 1447هـ</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">رقم الطبعة:</span>
          <span class="meta-value">الطبعة الإلكترونية الأولى الكاملة</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">المعرّف الرقمي:</span>
          <span class="meta-value">ISBN-E: 978-AK-${novel.id.replace(/-/g, '').slice(0, 8).toUpperCase()}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">التصنيف:</span>
          <span class="meta-value">${novel.genres?.join(', ') || 'أدب عربي، فكر وروايات'}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">حالة العمل:</span>
          <span class="meta-value">${novel.status === 'COMPLETED' ? 'مؤلَّف مكتمل' : 'عمل أدبي قيد النشر'}</span>
        </div>
      </div>

      <!-- Creative Commons & Copyright License Card -->
      <div class="license-card">
        <div class="license-badge">
          <span>⚖️</span>
          <span>رخصة المشاع الإبداعي: نسب المصنف - غير تجاري 4.0 دولي (CC BY-NC 4.0)</span>
        </div>

        <h3 class="license-card-title">وثيقة الملكية الفكرية والترخيص الأدبي</h3>

        <blockquote class="license-quote">
          «أضع هذا العمل ابتغاء وجه الله، وأسمح بتدريسه والاستشهاد به ونشره للفائدة العامة ونشر العلم والأدب، شريطة نسبته لصاحبه الأصلي وعدم استغلاله تجارياً بأي وسيلة.»
        </blockquote>

        <div class="license-rules-grid">
          <div class="license-rule-item">
            <span class="icon">✅</span>
            <span><strong>حقوق المشاركة:</strong> يُسمح بنسخ وتوزيع وتدريس هذا العمل ونشره في أي وسيط أو صيغة، والاقتباس منه وتطويره للأغراض الثقافية والتعليمية.</span>
          </div>
          <div class="license-rule-item">
            <span class="icon">⚠️</span>
            <span><strong>إلزامية النسبة للمؤلف:</strong> يجب دائماً نسبة العمل بوضوح وأمانة إلى مؤلفه الأصلي: <strong>${novel.author}</strong> مع الإشارة للمنصة الرسمية (aymankinani.com).</span>
          </div>
          <div class="license-rule-item">
            <span class="icon">❌</span>
            <span><strong>حظر الاستغلال التجاري:</strong> يُحظر تماماً بيع أو المتاجرة بهذا المصنف أو أي فصل منه لأغراض ربحية دون إذن كتابي رسمي مسبق من المؤلف.</span>
          </div>
        </div>

        <div class="copyright-footer-line">
          جميع الحقوق الأدبية والفكرية محفوظة للمؤلف © ${currentYear} أيمن كناني.<br />
          All Literary & Intellectual Rights Reserved © ${currentYear} Ayman Kinani.
        </div>
      </div>

      ${novel.synopsis ? `
        <div class="book-synopsis-box">
          <h4 class="synopsis-title">مقدمة وتوطئة عن العمل</h4>
          <p class="synopsis-body">${novel.synopsis}</p>
        </div>
      ` : ''}
    </section>

    <!-- PAGE 3: TABLE OF CONTENTS -->
    ${sortedChapters.length > 0 ? `
      <section class="toc-page" id="toc-section">
        <header class="toc-header">
          <h2 class="toc-title">فهرس فصول الكتاب</h2>
          <div class="toc-stats">
            <span>إجمالي الفصول: ${sortedChapters.length} فصول</span>
            <span>•</span>
            <span>إجمالي الكلمات: ${totalWords.toLocaleString('ar-EG')} كلمة</span>
          </div>
        </header>

        <ul class="toc-list">
          ${tocHtml}
        </ul>
      </section>
    ` : ''}

    <!-- CHAPTERS -->
    <main>
      ${chaptersHtml}
    </main>

    <!-- BACK COVER / EPILOGUE -->
    <footer class="back-cover-page">
      <h3 class="back-author-title">عن الكاتب والباحث ${novel.author}</h3>
      <p class="back-author-bio">
        ${novel.authorBio || 'كاتب وباحث في الفكر والأدب والرواية العربية، يسعى لتقديم محتوى يجمع بين الأصالة الفكرية والعمق السردي.'}
      </p>
      <div>
        <span class="back-url-badge">aymankinani.com — المنصة الرسمية</span>
      </div>
      <p class="back-legal-note">
        تم تصدير هذه النسخة الرقمية الرسمية للقراءة والطباعة من منصة المؤلف.<br />
        جميع الحقوق محفوظة للمؤلف © ${currentYear}
      </p>
    </footer>
  </div>

  <script>
    // Live Font Changing for offline reader
    function changeBookFont(fontKey) {
      document.body.className = 'font-' + fontKey;
      var chapters = document.querySelectorAll('.page-chapter, .chapter-content');
      chapters.forEach(function(el) {
        el.className = el.className.replace(/font-\\w+/g, '') + ' font-' + fontKey;
      });
    }

    // Font size adjustment
    var currentFontSize = 19;
    function adjustFontSize(delta) {
      currentFontSize = Math.max(14, Math.min(30, currentFontSize + delta));
      document.body.style.fontSize = currentFontSize + 'px';
    }
  </script>
</body>
</html>`;
}

/**
 * Triggers a direct file download in the browser using Blob URL and simulated click on an invisible <a> element.
 */
export function triggerDirectDownload(blob: Blob, fileName: string): boolean {
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (a.parentNode) {
        a.parentNode.removeChild(a);
      }
      URL.revokeObjectURL(url);
    }, 15000);
    return true;
  } catch (err) {
    console.error('triggerDirectDownload failed:', err);
    return false;
  }
}

/**
 * Triggers the native browser print dialog safely via an invisible <iframe>
 * without running into popup blocker issues or breaking iframe sandbox.
 */
export function triggerIframePrint(htmlContent: string): void {
  try {
    const oldIframes = document.querySelectorAll('.print-temp-frame');
    oldIframes.forEach(el => el.remove());

    const iframe = document.createElement('iframe');
    iframe.className = 'print-temp-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    iframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.warn('Iframe print error:', e);
        }
        setTimeout(() => {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        }, 60000);
      }, 700);
    }
  } catch (err) {
    console.warn('triggerIframePrint error:', err);
  }
}

/**
 * Universal, rock-solid novel book download handler.
 * Generates the complete, beautifully formatted standalone e-book matching all publication standards
 * (full-page cover, legal copyright & license, hyperlinked TOC, custom literary fonts, and PDF print preview).
 */
export async function downloadNovelBook(
  novel: Novel,
  chapters: Chapter[],
  onStatus?: (msg: string) => void,
  explicitFont?: string
): Promise<boolean> {
  const safeTitle = novel.title.replace(/[/\\?%*:|"<>]/g, '-').trim() || 'كتاب';
  const directUrl = getDirectDownloadUrl(novel.pdfDownloadUrl || '');

  // 1. If author uploaded an explicit binary PDF (Data URL or pre-existing static file), check if preferred
  // Otherwise generate the new masterpiece electronic edition requested by the user
  if (directUrl && (directUrl.startsWith('data:application/pdf') || directUrl.endsWith('.pdf'))) {
    onStatus?.('جاري بدء تنزيل ملف الـ PDF...');
    if (directUrl.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = directUrl;
      a.download = `${safeTitle} - ${novel.author}.pdf`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => a.remove(), 1000);
      onStatus?.('تم بدء التنزيل بنجاح!');
      return true;
    }
  }

  // 2. Generate the full, beautifully styled electronic book edition (Cover + Rights & License + TOC + Formatted Chapters)
  onStatus?.('جاري تنسيق وإعداد كتابك الإلكتروني بالخط المختار والغلاف...');

  const bookHtml = generateBookHtml(novel, chapters, explicitFont);

  // A. Trigger instant download of the standalone offline eBook document (.html)
  const htmlBlob = new Blob([bookHtml], { type: 'text/html;charset=utf-8' });
  triggerDirectDownload(htmlBlob, `${safeTitle} - ${novel.author} (كتاب إلكتروني رسمي).html`);

  // B. Trigger Print-to-PDF dialog via iframe so user can save directly as PDF with full-page cover & license
  triggerIframePrint(bookHtml);

  onStatus?.('تم تنزيل نسخة الكتاب وفتح نافذة الحفظ كـ PDF بالغلاف والترخيص!');
  return true;
}
