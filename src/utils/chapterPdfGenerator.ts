import { toCanvas } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Novel, Chapter } from '../types';

/**
 * Sanitizes a string for safe use in file names across Windows, macOS, and Linux
 */
function sanitizeFileName(name: string): string {
  return name
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 100);
}

export interface GeneratePdfOptions {
  onProgress?: (status: string) => void;
  fontFamily?: string;
}

/**
 * Generates a beautifully formatted, book-quality PDF for a chapter
 * with fully connected, authentic Arabic cursive typography,
 * and triggers automatic browser download.
 */
export async function downloadChapterPdf(
  novel: Novel,
  chapter: Chapter,
  options: GeneratePdfOptions = {}
): Promise<void> {
  const { onProgress } = options;

  if (onProgress) onProgress('جاري تحضير وتنسيق صفحات الفصل...');

  // Create temporary container for pristine print rendering
  // We keep it in viewport bounds with opacity 0.01 so the browser layout and font shaping engines (HarfBuzz)
  // accurately render connected Arabic ligatures without breaking them.
  const container = document.createElement('div');
  container.id = `chapter-pdf-print-${Date.now()}`;
  container.setAttribute('dir', 'rtl');
  container.setAttribute('lang', 'ar');
  container.style.position = 'fixed';
  container.style.left = '0';
  container.style.top = '0';
  container.style.width = '800px';
  container.style.background = '#FFFFFF';
  container.style.color = '#1A1A1A';
  container.style.fontFamily = "'Amiri', 'Cairo', 'Traditional Arabic', 'Segoe UI', Tahoma, sans-serif";
  container.style.padding = '44px 52px';
  container.style.boxSizing = 'border-box';
  container.style.lineHeight = '2.2';
  container.style.fontSize = '18px';
  container.style.zIndex = '-9999';
  container.style.opacity = '0.01';
  container.style.pointerEvents = 'none';
  container.style.direction = 'rtl';
  container.style.letterSpacing = 'normal';
  container.style.wordSpacing = 'normal';

  // Format content: convert plain text to paragraphs or keep HTML
  const isHtml = /<[a-z][\s\S]*>/i.test(chapter.content);
  let formattedContentHtml = '';

  if (isHtml) {
    formattedContentHtml = chapter.content;
  } else {
    const paragraphs = chapter.content
      .split('\n\n')
      .map(p => p.trim())
      .filter(Boolean);
    formattedContentHtml = paragraphs
      .map(p => `<p style="margin-bottom: 1.4rem; text-indent: 1.5rem; text-align: justify; text-justify: inter-word; letter-spacing: normal; word-break: normal; line-height: 2.2;">${p}</p>`)
      .join('');
  }

  // Calculate approximate reading time
  const readingTime = Math.max(1, Math.ceil(chapter.wordCount / 200));

  container.innerHTML = `
    <div style="direction: rtl; text-align: right; color: #1f2421; font-family: 'Amiri', 'Cairo', 'Traditional Arabic', serif; letter-spacing: normal; word-spacing: normal;">
      <!-- Header Banner / Title Section -->
      <div style="text-align: center; border-bottom: 2px solid #4A5D4E; padding-bottom: 24px; margin-bottom: 32px;">
        <div style="display: inline-block; background-color: #F3F6F4; color: #354738; font-size: 14px; font-weight: bold; padding: 4px 18px; border-radius: 9999px; border: 1px solid #D1DED4; margin-bottom: 14px; font-family: 'Cairo', sans-serif; letter-spacing: normal;">
          ${novel.title}
        </div>
        
        <h1 style="font-size: 30px; font-weight: bold; margin: 0 0 12px 0; color: #1a1a1a; line-height: 1.5; font-family: 'Amiri', serif; letter-spacing: normal;">
          الفصل ${chapter.chapterNumber}: ${chapter.title}
        </h1>

        <div style="font-size: 13px; color: #5a625e; font-family: 'Cairo', sans-serif; display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; margin-top: 8px; letter-spacing: normal;">
          <span><strong>المؤلف:</strong> ${novel.author || 'أيمن كناني'}</span>
          <span>·</span>
          <span><strong>عدد الكلمات:</strong> ${chapter.wordCount.toLocaleString()} كلمة</span>
          <span>·</span>
          <span><strong>وقت القراءة:</strong> حوالي ${readingTime} دقائق</span>
          <span>·</span>
          <span><strong>المنصة الرسمية:</strong> aymankinani.org</span>
        </div>

        <div style="margin-top: 14px; color: #C88A3B; font-size: 16px; letter-spacing: 4px;">
          ✦ ✦ ✦
        </div>
      </div>

      <!-- Author Note (if present) -->
      ${
        chapter.authorNote
          ? `
        <div style="background-color: #FAF8F5; border-right: 4px solid #C88A3B; padding: 14px 20px; border-radius: 8px; margin-bottom: 28px; font-size: 15px; color: #3c3832; font-family: 'Cairo', sans-serif; letter-spacing: normal;">
          <div style="font-weight: bold; color: #965A15; margin-bottom: 4px; font-size: 13px;">
            ملاحظة الكاتب (${novel.author || 'أيمن كناني'}):
          </div>
          <div style="font-style: italic; line-height: 1.8; letter-spacing: normal;">
            ${chapter.authorNote}
          </div>
        </div>
      `
          : ''
      }

      <!-- Chapter Body Content -->
      <div class="pdf-chapter-body" style="font-size: 18px; line-height: 2.2; color: #1a1a1a; text-align: justify; text-justify: inter-word; letter-spacing: normal; word-break: normal;">
        ${formattedContentHtml}
      </div>

      <!-- Book End Decorative Separator -->
      <div style="text-align: center; margin: 40px 0 24px 0; color: #4A5D4E; font-size: 18px; letter-spacing: 6px;">
        ❖ ❖ ❖
      </div>

      <!-- Book Footer & Rights Section -->
      <div style="border-top: 1px solid #E5E2D9; padding-top: 20px; margin-top: 32px; font-size: 12px; color: #6E6A64; font-family: 'Cairo', sans-serif; text-align: center; line-height: 1.7; letter-spacing: normal;">
        <p style="margin: 0 0 6px 0; font-weight: bold; color: #2C2C2C;">
          جميع الحقوق محفوظة © للكاتب ${novel.author || 'أيمن كناني'} · مرخّص برخصة المشاع الإبداعي CC BY-NC 4.0
        </p>
        <p style="margin: 0; font-size: 11px;">
          تم تنزيل هذا الفصل من المنصة الرسمية المعتمدة لنشر الروايات والكتب الأدبية: <strong style="color: #4A5D4E;">www.aymankinani.org</strong>
        </p>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    if (onProgress) onProgress('جاري معالجة الخطوط وتنسيق النص العربي...');

    // Wait for fonts to be ready
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    await new Promise(resolve => setTimeout(resolve, 300));

    if (onProgress) onProgress('جاري التقاط صفحات الكتاب بدقة عالية...');

    // Use html-to-image (SVG foreignObject) so the browser's native text shaping engine
    // draws connected Arabic ligatures perfectly without splitting letters!
    let canvas: HTMLCanvasElement;
    try {
      canvas = await toCanvas(container, {
        pixelRatio: 2,
        backgroundColor: '#FFFFFF',
        style: {
          opacity: '1',
          visibility: 'visible',
        },
      });
    } catch (fontErr) {
      console.warn('First render failed, retrying with fallback settings:', fontErr);
      canvas = await toCanvas(container, {
        pixelRatio: 2,
        backgroundColor: '#FFFFFF',
        skipFonts: true,
        style: {
          opacity: '1',
          visibility: 'visible',
        },
      });
    }

    if (onProgress) onProgress('جاري تقسيم الصفحات وتنسيق ملف الـ PDF...');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidthMm = 210;
    const pageHeightMm = 297;
    const marginXMm = 14;
    const marginTopMm = 16;
    const marginBottomMm = 16;

    const contentWidthMm = pageWidthMm - marginXMm * 2; // 182mm
    const contentHeightMm = pageHeightMm - marginTopMm - marginBottomMm; // 265mm

    const pxPerMm = canvas.width / contentWidthMm;
    const maxPageCanvasHeight = Math.floor(contentHeightMm * pxPerMm);

    const ctx = canvas.getContext('2d');
    let currentY = 0;
    const totalCanvasHeight = canvas.height;

    // Helper: find clean white gap between paragraphs near the page boundary
    const findSmartCutY = (startScanY: number, targetHeight: number): number => {
      const idealCutY = startScanY + targetHeight;
      if (idealCutY >= totalCanvasHeight) {
        return totalCanvasHeight;
      }

      if (!ctx) return idealCutY;

      // Scan upward up to 140 canvas pixels looking for a clear empty line between paragraphs
      const minScan = Math.max(startScanY + 100, idealCutY - 140);
      let bestY = idealCutY;
      let minDarkPixels = Infinity;

      for (let y = idealCutY; y >= minScan; y -= 2) {
        try {
          const rowData = ctx.getImageData(0, y, canvas.width, 1).data;
          let darkCount = 0;

          // Check luminance of pixels across the row
          for (let i = 0; i < rowData.length; i += 16) {
            const r = rowData[i];
            const g = rowData[i + 1];
            const b = rowData[i + 2];
            if (r < 240 || g < 240 || b < 240) {
              darkCount++;
            }
          }

          if (darkCount === 0) {
            // Found a completely blank line between paragraphs!
            return y;
          }

          if (darkCount < minDarkPixels) {
            minDarkPixels = darkCount;
            bestY = y;
          }
        } catch {
          return idealCutY;
        }
      }

      return bestY;
    };

    // Calculate pages
    const pageSlices: { startY: number; endY: number }[] = [];
    while (currentY < totalCanvasHeight) {
      const nextCutY = findSmartCutY(currentY, maxPageCanvasHeight);
      pageSlices.push({ startY: currentY, endY: nextCutY });
      currentY = nextCutY;
      if (nextCutY >= totalCanvasHeight) break;
    }

    const totalPages = pageSlices.length;

    // Draw each page
    for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
      const { startY, endY } = pageSlices[pageIdx];
      const sliceHeight = endY - startY;

      if (pageIdx > 0) {
        pdf.addPage();
      }

      // Create canvas for this page slice
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight;
      const pageCtx = pageCanvas.getContext('2d');

      if (pageCtx) {
        pageCtx.fillStyle = '#FFFFFF';
        pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        pageCtx.drawImage(
          canvas,
          0,
          startY,
          canvas.width,
          sliceHeight,
          0,
          0,
          canvas.width,
          sliceHeight
        );

        const imgData = pageCanvas.toDataURL('image/jpeg', 0.95);
        const renderedHeightMm = sliceHeight / pxPerMm;

        // Draw top subtle running header on pages after the first page
        if (pageIdx > 0) {
          pdf.setFontSize(8);
          pdf.setTextColor(120, 120, 120);
          pdf.text(
            `${novel.title} - الفصل ${chapter.chapterNumber}`,
            pageWidthMm - marginXMm,
            marginTopMm - 5,
            { align: 'right' }
          );
          pdf.setDrawColor(225, 225, 225);
          pdf.setLineWidth(0.2);
          pdf.line(marginXMm, marginTopMm - 3, pageWidthMm - marginXMm, marginTopMm - 3);
        }

        // Draw the chapter slice content
        pdf.addImage(
          imgData,
          'JPEG',
          marginXMm,
          marginTopMm,
          contentWidthMm,
          renderedHeightMm,
          undefined,
          'FAST'
        );

        // Draw running footer at bottom
        pdf.setFontSize(8);
        pdf.setTextColor(130, 130, 130);
        pdf.text(
          `صفحة ${pageIdx + 1} من ${totalPages}`,
          pageWidthMm / 2,
          pageHeightMm - marginBottomMm + 7,
          { align: 'center' }
        );
        pdf.text(
          `aymankinani.org`,
          marginXMm,
          pageHeightMm - marginBottomMm + 7,
          { align: 'left' }
        );
      }
    }

    if (onProgress) onProgress('جاري بدء تنزيل الملف...');

    const rawFileName = `${novel.title} - الفصل ${chapter.chapterNumber} - ${chapter.title}.pdf`;
    const cleanFileName = sanitizeFileName(rawFileName) || `Chapter-${chapter.chapterNumber}.pdf`;

    pdf.save(cleanFileName);

    if (onProgress) onProgress('تم تنزيل الفصل بنجاح!');
  } finally {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}

/**
 * Native browser print / save as PDF function with 100% crisp vector Arabic typography.
 */
export function printChapterDocument(novel: Novel, chapter: Chapter): void {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  iframe.style.opacity = '0';
  document.body.appendChild(iframe);

  const isHtml = /<[a-z][\s\S]*>/i.test(chapter.content);
  let bodyHtml = '';
  if (isHtml) {
    bodyHtml = chapter.content;
  } else {
    bodyHtml = chapter.content
      .split('\n\n')
      .map(p => `<p>${p.trim()}</p>`)
      .join('');
  }

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <title>${novel.title} - الفصل ${chapter.chapterNumber}: ${chapter.title}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        @page {
          size: A4 portrait;
          margin: 20mm 15mm 20mm 15mm;
        }
        body {
          font-family: 'Amiri', 'Cairo', 'Traditional Arabic', serif;
          font-size: 15pt;
          line-height: 2.3;
          color: #1a1a1a;
          direction: rtl;
          text-align: justify;
          margin: 0;
          padding: 0;
        }
        h1 {
          font-family: 'Amiri', serif;
          font-size: 24pt;
          text-align: center;
          margin: 8px 0 12px 0;
          color: #111;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #4A5D4E;
          padding-bottom: 20px;
          margin-bottom: 28px;
        }
        .novel-badge {
          display: inline-block;
          background: #F3F6F4;
          color: #354738;
          font-size: 11pt;
          font-weight: bold;
          padding: 3px 16px;
          border-radius: 9999px;
          border: 1px solid #D1DED4;
          font-family: 'Cairo', sans-serif;
          margin-bottom: 8px;
        }
        .meta {
          font-family: 'Cairo', sans-serif;
          font-size: 10pt;
          color: #666;
          margin-top: 8px;
        }
        .author-note {
          background: #FAF8F5;
          border-right: 4px solid #C88A3B;
          padding: 12px 18px;
          border-radius: 6px;
          margin-bottom: 24px;
          font-size: 11pt;
          font-family: 'Cairo', sans-serif;
        }
        p {
          margin-bottom: 1.2rem;
          text-indent: 1.6rem;
        }
        .footer {
          border-top: 1px solid #ddd;
          padding-top: 16px;
          margin-top: 36px;
          text-align: center;
          font-size: 9pt;
          color: #666;
          font-family: 'Cairo', sans-serif;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="novel-badge">${novel.title}</div>
        <h1>الفصل ${chapter.chapterNumber}: ${chapter.title}</h1>
        <div class="meta">
          المؤلف: ${novel.author || 'أيمن كناني'} · عدد الكلمات: ${chapter.wordCount.toLocaleString()} كلمة · aymankinani.org
        </div>
      </div>
      ${chapter.authorNote ? `<div class="author-note"><strong>ملاحظة الكاتب:</strong><br>${chapter.authorNote}</div>` : ''}
      <div class="content">${bodyHtml}</div>
      <div class="footer">
        جميع الحقوق محفوظة © للكاتب ${novel.author || 'أيمن كناني'} · aymankinani.org
      </div>
    </body>
    </html>
  `);
  doc.close();

  iframe.contentWindow?.focus();
  setTimeout(() => {
    iframe.contentWindow?.print();
    setTimeout(() => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    }, 4000);
  }, 600);
}
