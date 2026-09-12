/**
 * Utility functions for cleaning and sanitizing literary text, chapter contents,
 * and converting raw pasted HTML / CSS formatting into clean, beautiful Arabic typography.
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
 * Checks if a string contains raw HTML tags, CSS styling remnants, or copied editor attributes
 */
export function hasHtmlOrStyleResidue(text: string): boolean {
  if (!text) return false;
  return (
    /<[a-z][\s\S]*>/i.test(text) ||
    /&[a-z0-9#]+;/i.test(text) ||
    /(?:class|style|dir|align)=["'][^"']*["']/i.test(text) ||
    /(?:^|\s)(?:p|span|div)\s+class=/i.test(text) ||
    /(?:font-family|font-feature|caret-color|line-height):/i.test(text)
  );
}

/**
 * Sanitizes chapter text copied from external rich-text editors (Notion, Google Docs, Word, Web pages)
 * and extracts pure, beautifully structured Arabic text paragraphs.
 */
export function cleanChapterContent(rawText: string): string {
  if (!rawText) return '';

  let text = String(rawText).trim();

  // 1. Decode HTML entities first
  text = decodeHtmlEntities(text);

  // 2. Fix broken opening tags like `p class="..."` where `<` was omitted or lost
  text = text.replace(/(?:^|\n)\s*p\s+class=["'][^"']*["'][^>]*>/gi, '\n');
  text = text.replace(/(?:^|\n)\s*span\s+class=["'][^"']*["'][^>]*>/gi, '');
  text = text.replace(/(?:^|\n)\s*div\s+class=["'][^"']*["'][^>]*>/gi, '\n');

  // 3. If running in browser and contains HTML markup, use DOMParser for accurate extraction
  if (typeof window !== 'undefined' && (text.includes('<') || text.includes('>'))) {
    try {
      const parser = new DOMParser();
      // Replace block tags with newlines before parsing
      const prepped = text
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<\/div>/gi, '\n\n')
        .replace(/<\/h[1-6]>/gi, '\n\n')
        .replace(/<\/li>/gi, '\n');

      const doc = parser.parseFromString(prepped, 'text/html');
      const extracted = doc.body.textContent || '';
      if (extracted.trim().length > 0) {
        text = extracted;
      }
    } catch {
      // Fallback to regex cleaning below
    }
  }

  // 4. Regex fallback: strip any remaining HTML tags
  text = text.replace(/<[^>]*>/g, ' ');

  // 5. Remove any leaked CSS / HTML attributes that weren't inside valid brackets
  // e.g. `feature-clig-off block-font-feature-calt-off direction-rtl align-justify`
  // `style="color: ..."`
  text = text.replace(/style=["'][^"']*["']/gi, '');
  text = text.replace(/class=["'][^"']*["']/gi, '');
  text = text.replace(/dir=["'][^"']*["']/gi, '');
  text = text.replace(/align=["'][^"']*["']/gi, '');
  text = text.replace(/--[a-zA-Z0-9_-]+:[^;]+;/gi, '');
  text = text.replace(/(?:color|background|font-family|font-size|caret-color|line-height):[^;]+;/gi, '');
  text = text.replace(/\b(?:block-font-kerning-normal|block-font-feature-liga-off|feature-clig-off|direction-rtl|align-justify)\b/gi, '');

  // 6. Decode entities once more in case double-escaped
  text = decodeHtmlEntities(text);

  // 7. Clean whitespace and normalize paragraphs
  // Split into lines, trim each line
  const lines = text.split('\n').map(l => l.trim());

  // Group into clean paragraphs (collapse multiple empty lines to max 2)
  const cleanedParagraphs: string[] = [];
  let buffer = '';

  for (const line of lines) {
    if (!line) {
      if (buffer) {
        cleanedParagraphs.push(buffer);
        buffer = '';
      }
    } else {
      // If line is just junk like `>` or empty quotes, skip
      if (/^[>"';:\s]+$/.test(line)) continue;

      if (buffer) {
        buffer += ' ' + line;
      } else {
        buffer = line;
      }
    }
  }

  if (buffer) {
    cleanedParagraphs.push(buffer);
  }

  // Join back into standard double-newline paragraphs
  return cleanedParagraphs.join('\n\n');
}

/**
 * Normalizes novel and chapter paragraphs for display in Reader
 */
export function extractCleanParagraphs(content: string): string[] {
  if (!content) return [];
  const cleaned = cleanChapterContent(content);
  return cleaned
    .split('\n\n')
    .map(p => p.trim())
    .filter(p => p.length > 0);
}
