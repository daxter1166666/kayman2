/**
 * Utility functions for cleaning and sanitizing literary text, chapter contents,
 * and converting raw pasted HTML / CSS formatting into clean, beautiful Arabic typography.
 */

// Decode common HTML entities safely
export function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#160;/gi, ' ')
    .replace(/&rlm;/gi, '')
    .replace(/&lrm;/gi, '')
    .replace(/&zwnj;/gi, '')
    .replace(/&zwj;/gi, '');
}

/**
 * Checks if a string contains raw HTML tags, CSS styling remnants, or copied editor attributes
 */
export function hasHtmlOrStyleResidue(text: string): boolean {
  if (!text) return false;
  return (
    /<[a-z0-9/][\s\S]*>/i.test(text) ||
    /<\/[a-z0-9_-]+/i.test(text) ||
    /&[a-z0-9#]+;/i.test(text) ||
    /(?:class|style|dir|align)=["']?[^"'\s>]*["']?/i.test(text) ||
    /(?:^|\s)(?:p|span|div)\s+class=/i.test(text) ||
    /(?:direction|font-family|font-weight|font-size|font-feature|caret-color|line-height):/i.test(text) ||
    /(?:Readex Pro|system-ui|sans-serif|direction-rtl|align-justify)/i.test(text) ||
    /<\/?[a-zA-Z0-9_-]+\b/i.test(text)
  );
}

/**
 * Sanitizes chapter text copied from external rich-text editors (Notion, Google Docs, Word, Web pages)
 * and extracts pure, beautifully structured Arabic text paragraphs without any code, tags, or CSS symbols.
 */
export function cleanChapterContent(rawText: string): string {
  if (!rawText) return '';

  let text = String(rawText).trim();

  // 1. Convert block tags (and corrupted closing tags like </p/>", </span></p/>") into newlines
  text = text.replace(/<\s*\/?\s*(?:p|div|h[1-6]|li|blockquote|section|article|header|footer)\b[^>]*\/?>["']?/gi, '\n\n');
  text = text.replace(/<\s*br\s*\/?>/gi, '\n');

  // 2. Decode entities (including quotes, ampersands, non-breaking spaces)
  text = decodeHtmlEntities(text);

  // 3. Remove all remaining tags: <span ...>, </span>, <b>, </b>, etc.
  text = text.replace(/<[^>]+>/g, ' ');

  // 4. Remove leaked CSS properties and values (direction: rtl, font-family: ..., etc.)
  text = text.replace(/["']?(?:direction|font-family|font-size|font-weight|font-style|line-height|color|background(?:-color)?|text-align|caret-color|letter-spacing|word-spacing|margin|padding|border)\s*:[^;\n<>]+;?["']?>?/gi, ' ');

  // 5. Remove leaked font names or CSS technical keywords
  text = text.replace(/["']?(?:Readex Pro|Cairo|Amiri|Tajawal|Plus Jakarta Sans|system-ui|sans-serif|serif|sans-)[^;\n<>]*;?["']?>?/gi, ' ');
  text = text.replace(/\b(?:direction-rtl|align-justify|block-font-[a-z0-9_-]+|feature-[a-z0-9_-]+)\b/gi, ' ');
  text = text.replace(/\b(?:style|class|dir|align|contenteditable)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, ' ');

  // 6. Clean stray angle brackets and broken tag borders
  text = text.replace(/<\s*\/?\s*[a-zA-Z0-9_-]+\b/gi, ' ');
  text = text.replace(/[<>]/g, ' ');

  // 7. Remove empty quotes and isolated semicolons
  text = text.replace(/(?:^|\s)["'];+["']?(?:\s|$)/g, ' ');
  text = text.replace(/(?:^|\s)["']?[;>]+["']?(?:\s|$)/g, ' ');

  // 8. Split into lines and group into natural Arabic paragraphs
  const rawLines = text.split('\n');
  const paragraphs: string[] = [];
  let currentBuffer = '';

  for (let line of rawLines) {
    line = line.trim();
    if (!line) {
      if (currentBuffer) {
        paragraphs.push(currentBuffer.trim());
        currentBuffer = '';
      }
      continue;
    }

    // Strip leading/trailing junk punctuation from broken tag boundaries
    line = line
      .replace(/^[>"'`;:,\/\s-]+\s*/, '')
      .replace(/\s*[<"'`;:,\/\s-]+$/, '')
      .trim();

    // Skip lines with no Arabic text that only contain CSS words
    if (!/[\u0600-\u06FF]/.test(line) && /^(?:direction|font|color|style|class|span|div|serif|sans|bold|normal|px|pt|em|rem|readex|pro)+/i.test(line)) {
      continue;
    }

    if (!line) continue;

    if (currentBuffer) {
      currentBuffer += ' ' + line;
    } else {
      currentBuffer = line;
    }
  }

  if (currentBuffer) {
    paragraphs.push(currentBuffer.trim());
  }

  return paragraphs.join('\n\n');
}

/**
 * Normalizes novel and chapter paragraphs for display in Reader and PDF exports
 */
export function extractCleanParagraphs(content: string): string[] {
  if (!content) return [];
  const cleaned = cleanChapterContent(content);
  return cleaned
    .split('\n\n')
    .map(p => p.trim())
    .filter(p => p.length > 0);
}

/**
 * Extracts plain text from an HTML string or rich text markup
 */
export function extractPlainText(html: string): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Sanitizes rich HTML string, stripping dangerous tags and scripts while preserving
 * rich typography elements (paragraphs, headings, bold, italic, quotes, lists).
 */
export function sanitizeRichHtml(html: string): string {
  if (!html) return '';
  let sanitized = html
    // Remove scripts, styles, objects, embeds, iframes
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    // Remove event handlers like onclick, onload, onerror
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    // Remove javascript: hrefs
    .replace(/href\s*=\s*["']?javascript:[^"'>]+["']?/gi, 'href="#"');

  return sanitized;
}

