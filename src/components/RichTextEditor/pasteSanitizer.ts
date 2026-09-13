/**
 * pasteSanitizer.ts
 * Cleans and sanitizes rich content pasted from Microsoft Word, Google Docs,
 * external web pages, PDFs, and plain text, ensuring it is 100% editable,
 * adheres to the active Arabic literary typography, and doesn't lock fonts/sizes.
 */

export function sanitizePastedHtml(rawHtml: string): string {
  if (!rawHtml || typeof rawHtml !== 'string') return '';

  // 1. Remove MS Word comments, XML blocks, style and script tags
  let cleaned = rawHtml
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<xml[\s\S]*?<\/xml>/gi, '')
    .replace(/<\/?o:[a-z]+[^>]*>/gi, '')
    .replace(/<\/?w:[a-z]+[^>]*>/gi, '')
    .replace(/<\/?m:[a-z]+[^>]*>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<meta[^>]*>/gi, '')
    .replace(/<link[^>]*>/gi, '');

  const parser = new DOMParser();
  const doc = parser.parseFromString(cleaned, 'text/html');
  const body = doc.body;

  // 2. Process all nodes recursively or bottom-up
  const allElements = Array.from(body.querySelectorAll('*'));

  for (const el of allElements) {
    const tagName = el.tagName.toLowerCase();

    // Remove unwanted tags completely
    if (['script', 'style', 'meta', 'link', 'xml', 'title', 'head', 'base'].includes(tagName)) {
      el.remove();
      continue;
    }

    // Clean class names (remove MsoNormal, WordSection, external CSS classes)
    const className = el.getAttribute('class') || '';
    if (className) {
      const keptClasses = className
        .split(/\s+/)
        .filter(c => c.startsWith('book-') || c.startsWith('font-'))
        .join(' ');
      if (keptClasses) {
        el.setAttribute('class', keptClasses);
      } else {
        el.removeAttribute('class');
      }
    }

    // Strip IDs and non-essential attributes
    el.removeAttribute('id');
    el.removeAttribute('lang');
    el.removeAttribute('v:shapes');

    // Strip inline styles that lock font, size, color, background, and margins
    if (el.hasAttribute('style')) {
      const style = (el as HTMLElement).style;
      style.removeProperty('font-family');
      style.removeProperty('font-size');
      style.removeProperty('line-height');
      style.removeProperty('color');
      style.removeProperty('background');
      style.removeProperty('background-color');
      style.removeProperty('margin');
      style.removeProperty('margin-top');
      style.removeProperty('margin-bottom');
      style.removeProperty('margin-left');
      style.removeProperty('margin-right');
      style.removeProperty('padding');
      style.removeProperty('text-indent');
      style.removeProperty('mso-bidi-font-family');
      style.removeProperty('mso-ascii-font-family');
      style.removeProperty('mso-hansi-font-family');
      style.removeProperty('mso-font-kerning');

      // Strip font-weight: normal if set by Word (so bold isn't negated)
      if (style.fontWeight === 'normal' || style.fontWeight === '400') {
        style.removeProperty('font-weight');
      }

      if (!el.getAttribute('style')?.trim()) {
        el.removeAttribute('style');
      }
    }

    // Replace <font> tags with their inner content
    if (tagName === 'font') {
      const parent = el.parentNode;
      while (el.firstChild) {
        parent?.insertBefore(el.firstChild, el);
      }
      el.remove();
      continue;
    }

    // Unwrap empty or generic spans without useful attributes
    if (tagName === 'span') {
      const hasMeaningfulAttr =
        el.getAttribute('class') ||
        el.getAttribute('data-font') ||
        el.getAttribute('style');

      if (!hasMeaningfulAttr) {
        const parent = el.parentNode;
        while (el.firstChild) {
          parent?.insertBefore(el.firstChild, el);
        }
        el.remove();
        continue;
      }
    }

    // Convert non-styled generic <div> elements to <p>
    if (tagName === 'div' && !el.classList.contains('book-poetry-couplet') && !el.classList.contains('book-divider')) {
      const p = doc.createElement('p');
      while (el.firstChild) {
        p.appendChild(el.firstChild);
      }
      el.parentNode?.replaceChild(p, el);
    }
  }

  // Trim leading/trailing whitespace
  let finalHtml = body.innerHTML.trim();

  // If result is empty or just text without wrapping paragraphs, wrap in <p>
  if (finalHtml && !/<(p|h[1-6]|blockquote|div|ul|ol|table)/i.test(finalHtml)) {
    finalHtml = `<p>${finalHtml}</p>`;
  }

  return finalHtml;
}

export function cleanPlainTextToHtml(plainText: string): string {
  if (!plainText || typeof plainText !== 'string') return '';

  const paragraphs = plainText
    .split(/\r?\n\s*\r?\n/)
    .map(p => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    const single = plainText.trim().replace(/\r?\n/g, '<br>');
    return single ? `<p>${single}</p>` : '';
  }

  return paragraphs
    .map(p => `<p>${p.replace(/\r?\n/g, '<br>')}</p>`)
    .join('');
}

/**
 * Strips all foreign font, size, color, and Word locks from the editor's existing DOM
 * and re-synchronizes with the selected font, size, and line height.
 */
export function sanitizeEditorDom(
  editorEl: HTMLElement,
  currentFontFamily: string,
  currentFontSize: string,
  currentLineHeight: string
): number {
  let cleanedCount = 0;

  const allDescendants = Array.from(editorEl.querySelectorAll('*'));

  for (const node of allDescendants) {
    const el = node as HTMLElement;
    const tagName = el.tagName.toLowerCase();

    // Remove legacy font tags
    if (tagName === 'font') {
      const parent = el.parentNode;
      while (el.firstChild) {
        parent?.insertBefore(el.firstChild, el);
      }
      el.remove();
      cleanedCount++;
      continue;
    }

    // Remove foreign classes
    const className = el.getAttribute('class') || '';
    if (className) {
      const kept = className
        .split(/\s+/)
        .filter(c => c.startsWith('book-') || c.startsWith('font-'))
        .join(' ');
      if (kept !== className) {
        if (kept) el.setAttribute('class', kept);
        else el.removeAttribute('class');
        cleanedCount++;
      }
    }

    // Remove locked inline styles from pasted elements
    if (el.hasAttribute('style')) {
      if (el.style.fontFamily) {
        el.style.removeProperty('font-family');
        cleanedCount++;
      }
      if (el.style.fontSize && !el.classList.contains('book-divider')) {
        el.style.removeProperty('font-size');
        cleanedCount++;
      }
      if (el.style.color && !el.classList.contains('book-divider')) {
        el.style.removeProperty('color');
        cleanedCount++;
      }
      if (el.style.lineHeight) {
        el.style.removeProperty('line-height');
        cleanedCount++;
      }
      if (el.style.background || el.style.backgroundColor) {
        el.style.removeProperty('background');
        el.style.removeProperty('background-color');
        cleanedCount++;
      }
      el.style.removeProperty('margin');
      el.style.removeProperty('padding');
      el.style.removeProperty('text-indent');

      if (!el.getAttribute('style')?.trim()) {
        el.removeAttribute('style');
      }
    }

    // Unwrap empty spans
    if (tagName === 'span' && !el.hasAttributes()) {
      const parent = el.parentNode;
      while (el.firstChild) {
        parent?.insertBefore(el.firstChild, el);
      }
      el.remove();
      cleanedCount++;
    }
  }

  // Re-apply editor's base typography
  editorEl.style.fontFamily = currentFontFamily;
  editorEl.style.fontSize = currentFontSize;
  editorEl.style.lineHeight = currentLineHeight;

  // Ensure blocks have consistent font
  editorEl.querySelectorAll('p, h1, h2, h3, h4, blockquote').forEach(b => {
    (b as HTMLElement).style.fontFamily = currentFontFamily;
    (b as HTMLElement).style.fontSize = currentFontSize;
    (b as HTMLElement).style.lineHeight = currentLineHeight;
  });

  return cleanedCount;
}
