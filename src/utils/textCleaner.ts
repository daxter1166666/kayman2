/**
 * Utility functions for cleaning and sanitizing literary text, chapter contents,
 * and preserving rich Arabic formatting (headings, bold, italic, quotes, lists, fonts)
 * while removing junk tags, malicious scripts, and external pasted artifacts.
 */

// Decode common HTML entities
export function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#160;/g, ' ')
    .replace(/&rlm;/g, '')
    .replace(/&lrm;/g, '');
}

/**
 * Checks if content contains HTML markup
 */
export function isRichHtml(content: string): boolean {
  if (!content) return false;
  return /<(?:p|h[1-6]|blockquote|b|strong|i|em|u|s|ul|ol|li|hr|div|span|br)[^>]*>/i.test(content);
}

/**
 * Checks if a string contains raw HTML junk tags, CSS styling remnants, or copied editor attributes
 * (such as Microsoft Word, Notion, or raw dumped style blocks)
 */
export function hasHtmlOrStyleResidue(text: string): boolean {
  if (!text) return false;
  return (
    /<(?:script|style|iframe|object|embed)[^>]*>/i.test(text) ||
    /mso-[a-z-]+:/i.test(text) ||
    /data-pm-slice=/i.test(text) ||
    /(?:class|style)=["'][^"']*(?:feature-clig-off|direction-rtl|block-font)[^"']*["']/i.test(text) ||
    /(?:^|\s)(?:p|span|div)\s+class=["'][^"']*["']/i.test(text)
  );
}

/**
 * Sanitizes rich HTML content, preserving valuable formatting:
 * - Headings: h1, h2, h3, h4, h5, h6
 * - Formatting: b, strong, i, em, u, s, strike, sub, sup, mark
 * - Blocks: p, br, hr, blockquote, div, span, font
 * - Lists: ul, ol, li
 * - Allowed styles: color, background-color, text-align, font-size, font-family
 * Strips dangerous tags (script, iframe, style, object) and cleans messy attributes.
 */
export function sanitizeRichHtml(rawHtml: string): string {
  if (!rawHtml) return '';

  let html = String(rawHtml).trim();

  // If running in browser environment, use DOMParser for safe parsing
  if (typeof window !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // 1. Remove dangerous or unwanted elements completely
      const dangerousTags = ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'svg', 'canvas'];
      dangerousTags.forEach(tag => {
        const elements = doc.querySelectorAll(tag);
        elements.forEach(el => el.remove());
      });

      // 2. Clean all elements and their attributes
      const allElements = doc.querySelectorAll('*');
      allElements.forEach(el => {
        // Remove event handlers (onclick, onload, etc.)
        Array.from(el.attributes).forEach(attr => {
          const name = attr.name.toLowerCase();
          const value = attr.value;

          if (name.startsWith('on') || value.includes('javascript:')) {
            el.removeAttribute(attr.name);
            return;
          }

          // Strip Microsoft Word and editor junk attributes
          if (
            name.startsWith('mso-') ||
            name.startsWith('data-pm') ||
            name.startsWith('data-draft') ||
            name === 'data-slate-node' ||
            name === 'data-slate-leaf'
          ) {
            el.removeAttribute(attr.name);
            return;
          }

          // Clean style attribute: keep only safe typography rules
          if (name === 'style') {
            const safeStyles: string[] = [];
            const declarations = value.split(';');
            declarations.forEach(decl => {
              const [prop, val] = decl.split(':').map(s => s?.trim());
              if (!prop || !val) return;
              const cleanProp = prop.toLowerCase();
              if (
                ['color', 'background-color', 'text-align', 'font-size', 'font-family', 'font-weight', 'font-style', 'text-decoration', 'line-height'].includes(cleanProp) &&
                !val.includes('url(') &&
                !val.includes('expression(')
              ) {
                safeStyles.push(`${cleanProp}: ${val}`);
              }
            });

            if (safeStyles.length > 0) {
              el.setAttribute('style', safeStyles.join('; '));
            } else {
              el.removeAttribute('style');
            }
          }

          // Clean classes: remove messy classes like feature-clig-off
          if (name === 'class') {
            const cleanedClasses = value
              .split(/\s+/)
              .filter(c => !c.includes('feature-clig') && !c.includes('block-font') && !c.includes('mso-') && !c.includes('align-'))
              .join(' ');
            if (cleanedClasses) {
              el.setAttribute('class', cleanedClasses);
            } else {
              el.removeAttribute('class');
            }
          }
        });
      });

      return doc.body.innerHTML.trim();
    } catch {
      // Fallback if DOMParser fails
    }
  }

  // Regex fallback: strip scripts & dangerous tags
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '');
}

/**
 * Sanitizes chapter content:
 * - If the text contains rich HTML tags, cleans it while PRESERVING all formatting (bold, headings, quotes, lists).
 * - If the text is plain text with newlines, normalizes line breaks and whitespace cleanly.
 */
export function cleanChapterContent(rawText: string): string {
  if (!rawText) return '';

  const text = String(rawText).trim();

  // If text has HTML tags, sanitize and keep formatting
  if (isRichHtml(text)) {
    return sanitizeRichHtml(text);
  }

  // If text is plain text, normalize spacing and decode entities
  let clean = decodeHtmlEntities(text);

  // Fix broken opening tags like `p class="..."` where `<` was omitted or lost
  clean = clean.replace(/(?:^|\n)\s*p\s+class=["'][^"']*["'][^>]*>/gi, '\n');
  clean = clean.replace(/(?:^|\n)\s*span\s+class=["'][^"']*["'][^>]*>/gi, '');
  clean = clean.replace(/(?:^|\n)\s*div\s+class=["'][^"']*["'][^>]*>/gi, '\n');

  // Strip residual tags
  clean = clean.replace(/<[^>]*>/g, ' ');

  // Clean whitespace
  const lines = clean.split('\n').map(l => l.trim());
  const paragraphs: string[] = [];
  let buffer = '';

  for (const line of lines) {
    if (!line) {
      if (buffer) {
        paragraphs.push(buffer);
        buffer = '';
      }
    } else {
      if (/^[>"';:\s]+$/.test(line)) continue;
      if (buffer) {
        buffer += ' ' + line;
      } else {
        buffer = line;
      }
    }
  }

  if (buffer) {
    paragraphs.push(buffer);
  }

  return paragraphs.join('\n\n');
}

/**
 * Extracts pure plain text for calculating word count, character count, and reading time
 */
export function extractPlainText(content: string): string {
  if (!content) return '';

  if (typeof window !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      return (doc.body.textContent || '').trim();
    } catch {
      // Fallback to regex
    }
  }

  return content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Splits chapter content into displayable blocks for the Reader:
 * - If HTML, splits into top-level blocks (<p>, <h2>, <h3>, <blockquote>, <ul>, <ol>, etc.)
 * - If plain text, splits by double newlines into paragraphs
 */
export function extractCleanParagraphs(content: string): string[] {
  if (!content) return [];

  const trimmed = content.trim();

  // If it's rich HTML, parse blocks
  if (isRichHtml(trimmed)) {
    if (typeof window !== 'undefined') {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(trimmed, 'text/html');
        const blocks: string[] = [];

        Array.from(doc.body.children).forEach(child => {
          const html = child.outerHTML.trim();
          if (html) {
            blocks.push(html);
          }
        });

        if (blocks.length > 0) {
          return blocks;
        }
      } catch {
        // Fall through to regex
      }
    }

    // Fallback: split by closing block tags
    const blocks = trimmed
      .split(/(?=<(?:p|h[1-6]|blockquote|ul|ol|hr)\b)/i)
      .map(b => b.trim())
      .filter(Boolean);

    if (blocks.length > 0) {
      return blocks;
    }
  }

  // Plain text split by paragraphs
  return trimmed
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
}
