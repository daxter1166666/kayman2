import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Novel, Chapter } from '../types';
import { formatDeweyDisplay } from '../utils/deweyDecimal';
import { extractCleanParagraphs } from '../utils/textCleaner';

export interface PdfExportOptions {
  fontFamily: 'amiri' | 'cairo' | 'readex' | 'tajawal';
  fontSize: 'small' | 'medium' | 'large';
  includeCover: boolean;
  includeCopyright?: boolean;
  includeToc: boolean;
  onProgress?: (progress: number, stage: string) => void;
}

interface ChapterPageData {
  chapter: Chapter;
  pageIndexInChapter: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  paragraphs: string[];
}

/**
 * Safely converts an image URL into a Base64 data URL to prevent CORS/taint errors in jsPDF and html2canvas.
 */
async function getBase64Image(url: string): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('data:image/')) return url;

  // 1. Try standard fetch
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (res.ok) {
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    }
  } catch {
    // Continue to canvas fallback
  }

  // 2. Try Image object drawing to canvas with crossOrigin
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 800;
        canvas.height = img.naturalHeight || 1200;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.95));
        } else {
          resolve(url);
        }
      } catch {
        resolve(url);
      }
    };
    img.onerror = () => resolve(url);
    img.src = url;
  });
}

/**
 * Accurately paginates chapters so that EVERY page is filled with text from top to bottom margin.
 * When a paragraph exceeds the remaining space on a page, it is cleanly split at word boundaries,
 * with the first part filling the page to the bottom and the second part starting the next page.
 */
function paginateChaptersWithDomMeasurement(
  chapters: Chapter[],
  options: {
    fontCss: string;
    bodyFontSize: string;
    lineHeight: string;
  }
): {
  chapterPages: ChapterPageData[];
  chapterStartIndices: Record<string, number>;
  totalChapterPages: number;
} {
  // Create offscreen measurement box with identical container width
  const measureBox = document.createElement('div');
  measureBox.id = 'pdf-pagination-measure-box';
  measureBox.style.position = 'fixed';
  measureBox.style.top = '0';
  measureBox.style.left = '0';
  measureBox.style.width = '664px'; // 794px A4 width - 130px padding (65px * 2)
  measureBox.style.boxSizing = 'border-box';
  measureBox.style.fontFamily = options.fontCss;
  measureBox.style.fontSize = options.bodyFontSize;
  measureBox.style.lineHeight = options.lineHeight;
  measureBox.style.direction = 'rtl';
  measureBox.style.textAlign = 'justify';
  measureBox.style.letterSpacing = 'normal';
  measureBox.style.wordSpacing = 'normal';
  measureBox.style.opacity = '0';
  measureBox.style.pointerEvents = 'none';
  measureBox.style.zIndex = '-99999';
  document.body.appendChild(measureBox);

  const measureHeight = (paras: string[]): number => {
    if (paras.length === 0) return 0;
    measureBox.innerHTML = paras
      .map((p, idx) => {
        const isLast = idx === paras.length - 1;
        return `<p style="margin: 0 0 ${isLast ? '0' : '16px'} 0; font-size: ${options.bodyFontSize}; line-height: ${options.lineHeight}; direction: rtl; text-align: justify; unicode-bidi: isolate; word-break: break-word;">${p}</p>`;
      })
      .join('');
    return measureBox.offsetHeight;
  };

  // Available content height:
  // A4 = 1123px. Padding: top 50px, bottom 50px = 100px.
  // Running Header = ~32px. Running Footer = ~32px. Buffer = 14px.
  // Standard page max text height = 945px.
  // First page of chapter has centered title header (~145px), so max text height = 800px.
  const MAX_HEIGHT_STANDARD = 935;
  const MAX_HEIGHT_FIRST_PAGE = 795;

  const allChapterPages: ChapterPageData[] = [];
  const chapterStartIndices: Record<string, number> = {};

  for (const ch of chapters) {
    chapterStartIndices[ch.id] = allChapterPages.length;

    const rawParas = extractCleanParagraphs(ch.content || '');
    const paras = rawParas.length > 0 ? rawParas : ['(لا يوجد نص مسجل في هذا الفصل)'];

    let isFirstPage = true;
    let currentParas: string[] = [];
    const paraQueue = [...paras];

    while (paraQueue.length > 0) {
      const maxHeight = isFirstPage ? MAX_HEIGHT_FIRST_PAGE : MAX_HEIGHT_STANDARD;
      const p = paraQueue.shift()!;
      const testParas = [...currentParas, p];
      const testHeight = measureHeight(testParas);

      if (testHeight <= maxHeight) {
        currentParas.push(p);
      } else {
        // Paragraph `p` does not fit entirely.
        // Try to split `p` into words to fill the remaining space on the current page.
        const words = p.split(/\s+/).filter(Boolean);

        if (words.length > 10) {
          let low = 1;
          let high = words.length - 1;
          let bestK = 0;

          while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            const part = words.slice(0, mid).join(' ');
            const h = measureHeight([...currentParas, part]);
            if (h <= maxHeight) {
              bestK = mid;
              low = mid + 1;
            } else {
              high = mid - 1;
            }
          }

          // If at least 6 words fit and at least 3 words remain
          if (bestK >= 6 && words.length - bestK >= 3) {
            const firstPart = words.slice(0, bestK).join(' ');
            const remainder = words.slice(bestK).join(' ');

            currentParas.push(firstPart);
            allChapterPages.push({
              chapter: ch,
              pageIndexInChapter: allChapterPages.length - chapterStartIndices[ch.id],
              isFirstPage,
              isLastPage: false,
              paragraphs: [...currentParas]
            });

            isFirstPage = false;
            currentParas = [];
            // Push remainder back to be processed on the next page
            paraQueue.unshift(remainder);
            continue;
          }
        }

        // If we couldn't split or current page is already well-filled
        if (currentParas.length > 0) {
          allChapterPages.push({
            chapter: ch,
            pageIndexInChapter: allChapterPages.length - chapterStartIndices[ch.id],
            isFirstPage,
            isLastPage: false,
            paragraphs: [...currentParas]
          });
          isFirstPage = false;
          currentParas = [];
          // Put `p` back to start on the new page
          paraQueue.unshift(p);
        } else {
          // Even on a brand new page, single paragraph exceeds maxHeight! Split it aggressively.
          const words = p.split(/\s+/).filter(Boolean);
          let low = 1;
          let high = words.length - 1;
          let bestK = 1;

          while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            const part = words.slice(0, mid).join(' ');
            const h = measureHeight([part]);
            if (h <= maxHeight) {
              bestK = mid;
              low = mid + 1;
            } else {
              high = mid - 1;
            }
          }

          const splitK = Math.max(bestK, 15);
          allChapterPages.push({
            chapter: ch,
            pageIndexInChapter: allChapterPages.length - chapterStartIndices[ch.id],
            isFirstPage,
            isLastPage: false,
            paragraphs: [words.slice(0, splitK).join(' ')]
          });
          isFirstPage = false;
          currentParas = [];
          if (splitK < words.length) {
            paraQueue.unshift(words.slice(splitK).join(' '));
          }
        }
      }
    }

    // Final page of this chapter
    if (currentParas.length > 0) {
      allChapterPages.push({
        chapter: ch,
        pageIndexInChapter: allChapterPages.length - chapterStartIndices[ch.id],
        isFirstPage,
        isLastPage: true,
        paragraphs: [...currentParas]
      });
    }
  }

  // Cleanup measurement box
  if (document.body.contains(measureBox)) {
    document.body.removeChild(measureBox);
  }

  return {
    chapterPages: allChapterPages,
    chapterStartIndices,
    totalChapterPages: allChapterPages.length
  };
}

export class PdfExportService {
  /**
   * Generates and downloads a complete, publication-grade PDF book.
   * - Full-bleed cover from original image (no overlays or extra text)
   * - Centered, dignified chapter titles with generous breathing room
   * - Clean, literary copyright imprint (no web form boxes or tables)
   * - Classical Table of Contents with true page numbers and dotted leaders
   * - Dynamic pagination where every page is 100% filled before moving to the next
   */
  public async downloadNovelFullBookPdf(
    novel: Novel,
    chapters: Chapter[],
    options: PdfExportOptions = {
      fontFamily: 'amiri',
      fontSize: 'medium',
      includeCover: true,
      includeCopyright: true,
      includeToc: true
    }
  ): Promise<void> {
    const sortedChapters = [...chapters]
      .filter(c => c.novelId === novel.id && c.status !== 'DRAFT')
      .sort((a, b) => a.chapterNumber - b.chapterNumber);

    options.onProgress?.(5, 'تهيئة صفحات ومحتوى الرواية بالخطوط العربية...');

    if (document.fonts) {
      try {
        await document.fonts.ready;
      } catch {
        // Font readiness check
      }
    }

    // Prepare cover image
    let coverBase64: string | null = null;
    if (novel.coverImage && options.includeCover) {
      options.onProgress?.(10, 'تجهيز غلاف الرواية الأصلي بدقة كاملة...');
      coverBase64 = await getBase64Image(novel.coverImage);
    }

    // Determine font family
    let fontCss = "'Amiri', serif, system-ui";
    if (options.fontFamily === 'cairo') {
      fontCss = "'Cairo', system-ui, sans-serif";
    } else if (options.fontFamily === 'readex') {
      fontCss = "'Readex Pro', system-ui, sans-serif";
    } else if (options.fontFamily === 'tajawal') {
      fontCss = "'Tajawal', system-ui, sans-serif";
    }

    let bodyFontSize = '15px';
    let lineHeight = '1.85';
    if (options.fontSize === 'small') {
      bodyFontSize = '13.5px';
      lineHeight = '1.8';
    } else if (options.fontSize === 'large') {
      bodyFontSize = '16.5px';
      lineHeight = '1.95';
    }

    const deweyText = formatDeweyDisplay(novel.deweyDecimal, novel.deweyCategoryName);

    options.onProgress?.(15, 'حساب وتوزيع النصوص لملء الصفحات كاملة...');

    // Run dynamic DOM measurement pagination
    const { chapterPages, chapterStartIndices } = paginateChaptersWithDomMeasurement(
      sortedChapters,
      {
        fontCss,
        bodyFontSize,
        lineHeight
      }
    );

    // Calculate exact document page numbering:
    // Page 1: Cover (if included)
    // Page 2: Copyright / Imprint page (if included)
    // Page 3..: Table of contents (15 items per page)
    // Chapter pages follow sequentially
    let pageCounter = 1;
    if (options.includeCover) {
      pageCounter++;
    }

    const copyrightPageNum = options.includeCopyright !== false ? pageCounter++ : 0;

    const TOC_ITEMS_PER_PAGE = 15;
    const tocPageCount = options.includeToc
      ? Math.max(1, Math.ceil(sortedChapters.length / TOC_ITEMS_PER_PAGE))
      : 0;

    const tocStartPageNum = options.includeToc ? pageCounter : 0;
    if (options.includeToc) {
      pageCounter += tocPageCount;
    }

    // Exact chapter start pages
    const chapterStartPages: Record<string, number> = {};
    for (const ch of sortedChapters) {
      const offsetInChapterPages = chapterStartIndices[ch.id] || 0;
      chapterStartPages[ch.id] = pageCounter + offsetInChapterPages;
    }

    // Build pages HTML array
    const pagesHtml: { html: string; pageType: string; isCover?: boolean }[] = [];

    // 1. COVER PAGE (if no cover image provided, elegant typography fallback)
    if (options.includeCover && !coverBase64) {
      pagesHtml.push({
        pageType: 'cover',
        isCover: true,
        html: `
          <div class="pdf-page" style="width: 794px; height: 1123px; min-height: 1123px; max-height: 1123px; position: relative; background: #FAF9F6; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 60px; box-sizing: border-box; direction: rtl; text-align: center; font-family: ${fontCss}; overflow: hidden;">
            <div style="border: 2px solid #2C2C2C; padding: 60px 40px; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; box-sizing: border-box;">
              <h1 style="font-size: 38px; font-weight: 800; color: #1A1A1A; margin: 0 0 20px 0; line-height: 1.35; font-family: 'Amiri', serif;">
                ${novel.title}
              </h1>
              <div style="width: 60px; height: 2px; background: #2C2C2C; margin: 0 auto 24px auto;"></div>
              <p style="font-size: 22px; font-weight: 600; color: #444444; margin: 0; font-family: 'Amiri', serif;">
                تأليف: ${novel.author || 'أيمن كناني'}
              </p>
            </div>
          </div>
        `
      });
    }

    // 2. COPYRIGHT / IMPRINT PAGE (Dignified literary page, no SaaS boxes or tables)
    if (options.includeCopyright !== false) {
      pagesHtml.push({
        pageType: 'copyright',
        html: `
          <div class="pdf-page" style="width: 794px; height: 1123px; min-height: 1123px; max-height: 1123px; position: relative; padding: 65px 70px; box-sizing: border-box; background: #FFFFFF; display: flex; flex-direction: column; justify-content: space-between; direction: rtl; text-align: center; font-family: ${fontCss}; overflow: hidden;">
            <div style="font-size: 11px; color: #888888; border-bottom: 1px solid #EEEEEE; padding-bottom: 8px; text-align: right;">
              <span>رواية: ${novel.title}</span>
            </div>

            <div style="margin: auto 0; width: 100%; max-width: 520px; margin-left: auto; margin-right: auto;">
              <h1 style="font-family: 'Amiri', serif; font-size: 32px; font-weight: 700; color: #111111; margin: 0 0 12px 0;">
                ${novel.title}
              </h1>
              <p style="font-family: 'Amiri', serif; font-size: 19px; color: #444444; margin: 0 0 35px 0;">
                تأليف: ${novel.author || 'أيمن كناني'}
              </p>

              <div style="width: 45px; height: 1.5px; background: #222222; margin: 0 auto 35px auto;"></div>

              <div style="font-size: 13.5px; line-height: 2.3; color: #333333; margin-bottom: 35px;">
                <p style="margin: 0;"><strong>رواية أدبية عربية</strong></p>
                ${deweyText ? `<p style="margin: 0;">التصنيف المكتبي: ${deweyText}</p>` : ''}
                <p style="margin: 0;">الناشر: المنصة الرسمية للكاتب أيمن كناني</p>
                <p style="margin: 0;">الموقع الرسمي: aymankinani.com</p>
                <p style="margin: 0;">الطبعة الإلكترونية الأولى — ${new Date().getFullYear()}م</p>
              </div>

              <div style="width: 30px; height: 1px; background: #CCCCCC; margin: 0 auto 30px auto;"></div>

              <div style="font-size: 12px; line-height: 2.0; color: #666666; max-width: 460px; margin: 0 auto;">
                <p style="margin: 0 0 6px 0; font-weight: bold; color: #222222;">
                  جميع حقوق الملكية الفكرية والنشر والتأليف محفوظة للمؤلف © ${new Date().getFullYear()}م
                </p>
                <p style="margin: 0;">
                  هذا العمل منشور لأغراض القراءة الشخصية. يُحظر تماماً نسخ أو بيع أو اقتباس أجزاء من الرواية لأي غرض تجاري دون إذن كتابي رسمي مسبق من المؤلف.
                </p>
              </div>
            </div>

            <div style="font-size: 11px; color: #888888; border-top: 1px solid #EEEEEE; padding-top: 10px; text-align: center;">
              — بيانات النشر والتوثيق —
            </div>
          </div>
        `
      });
    }

    // 3. TABLE OF CONTENTS (فهرس الفصول) - Clean, literary dotted leaders
    if (options.includeToc) {
      for (let tIdx = 0; tIdx < tocPageCount; tIdx++) {
        const pageChapters = sortedChapters.slice(
          tIdx * TOC_ITEMS_PER_PAGE,
          (tIdx + 1) * TOC_ITEMS_PER_PAGE
        );

        pagesHtml.push({
          pageType: 'toc',
          html: `
            <div class="pdf-page" style="width: 794px; height: 1123px; min-height: 1123px; max-height: 1123px; position: relative; padding: 55px 70px; box-sizing: border-box; background: #FFFFFF; display: flex; flex-direction: column; justify-content: space-between; direction: rtl; text-align: right; font-family: ${fontCss}; overflow: hidden;">
              <div>
                <!-- Running Header -->
                <div style="display: flex; justify-content: space-between; font-size: 11px; color: #888888; border-bottom: 1px solid #EEEEEE; padding-bottom: 8px; margin-bottom: 35px;">
                  <span>رواية: ${novel.title}</span>
                  <span>فهرس الفصول ${tocPageCount > 1 ? `(${tIdx + 1}/${tocPageCount})` : ''}</span>
                </div>

                <!-- Title Header -->
                <div style="text-align: center; margin-bottom: 40px;">
                  <h2 style="font-family: 'Amiri', serif; font-size: 26px; font-weight: 700; color: #111111; margin: 0 0 12px 0;">
                    فهرس الفصول
                  </h2>
                  <div style="width: 45px; height: 1.5px; background: #222222; margin: 0 auto;"></div>
                </div>

                <!-- Chapter Rows with clean dotted lines -->
                <div style="display: flex; flex-direction: column; gap: 16px;">
                  ${pageChapters.map(ch => `
                    <div style="display: flex; align-items: baseline; justify-content: space-between; font-size: 15px; line-height: 1.6; direction: rtl;">
                      <span style="font-weight: 700; color: #222222; max-width: 520px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; letter-spacing: normal;">
                        الفصل ${ch.chapterNumber}: ${ch.title}
                      </span>
                      <span style="flex-grow: 1; border-bottom: 1.5px dotted #888888; margin: 0 14px; height: 1px;"></span>
                      <span style="font-family: 'Amiri', serif; font-size: 15px; font-weight: 700; color: #333333; white-space: nowrap; letter-spacing: normal;">
                        ${chapterStartPages[ch.id]}
                      </span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Footer -->
              <div style="text-align: center; font-size: 11px; color: #888888; border-top: 1px solid #EEEEEE; padding-top: 10px;">
                — ${tocStartPageNum + tIdx} —
              </div>
            </div>
          `
        });
      }
    }

    // 4. CHAPTER PAGES (صفحات الفصول مع ملء كامل للصفحة وتنسيق رصين)
    for (let cIdx = 0; cIdx < chapterPages.length; cIdx++) {
      const pageData = chapterPages[cIdx];
      const ch = pageData.chapter;
      const isFirstPage = pageData.isFirstPage;
      const isLastPage = pageData.isLastPage;
      const pageNum = pageCounter + cIdx;

      pagesHtml.push({
        pageType: 'chapter',
        html: `
          <div class="pdf-page" style="width: 794px; height: 1123px; min-height: 1123px; max-height: 1123px; position: relative; padding: 50px 65px; box-sizing: border-box; background: #FFFFFF; display: flex; flex-direction: column; justify-content: space-between; direction: rtl; text-align: right; font-family: ${fontCss}; overflow: hidden;">
            <div style="width: 100%; flex: 1; display: flex; flex-direction: column;">
              ${!isFirstPage ? `
                <!-- Clean Running Header (Subsequent pages only, NO awkward "(تابع)") -->
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #777777; border-bottom: 1px solid #EEEEEE; padding-bottom: 8px; margin-bottom: 22px;">
                  <span>رواية: ${novel.title}</span>
                  <span>${ch.title}</span>
                </div>
              ` : ''}

              ${isFirstPage ? `
                <!-- Dignified Centered Chapter Title on the first page -->
                <div style="text-align: center; margin: 25px 0 35px 0;">
                  <div style="font-size: 13.5px; font-weight: 600; color: #555555; margin-bottom: 8px; letter-spacing: normal;">
                    — الفصل ${ch.chapterNumber} —
                  </div>
                  <h2 style="font-family: 'Amiri', serif; font-size: 26px; font-weight: 700; color: #111111; margin: 0 0 14px 0; line-height: 1.4; letter-spacing: normal;">
                    ${ch.title}
                  </h2>
                  <div style="width: 45px; height: 1.5px; background: #222222; margin: 0 auto;"></div>
                </div>
              ` : ''}

              <!-- Content Paragraphs that fill the page completely -->
              <div style="width: 100%; font-family: ${fontCss}; font-size: ${bodyFontSize}; line-height: ${lineHeight}; color: #1A1A1A;">
                ${pageData.paragraphs.map((p, pIdx) => {
                  const isSplitBottom = !isLastPage && pIdx === pageData.paragraphs.length - 1;
                  return `
                    <p style="margin: 0 0 ${isSplitBottom ? '0' : '16px'} 0; font-size: ${bodyFontSize}; line-height: ${lineHeight}; text-align: justify; text-justify: inter-word; direction: rtl; unicode-bidi: isolate; word-break: break-word; letter-spacing: normal;">
                      ${p}
                    </p>
                  `;
                }).join('')}
              </div>

              ${isLastPage && ch.authorNote ? `
                <div style="margin-top: 24px; padding: 12px 16px; background: #FAF9F6; border-right: 3px solid #4A5D4E; border-radius: 4px; font-size: 12px; line-height: 1.8; color: #555555;">
                  <strong style="color: #1A1A1A;">ملاحظة الكاتب:</strong> ${ch.authorNote}
                </div>
              ` : ''}
            </div>

            <!-- Clean Running Footer with Page Number -->
            <div style="text-align: center; font-size: 11px; color: #777777; border-top: 1px solid #EEEEEE; padding-top: 8px; margin-top: 10px;">
              — ${pageNum} —
            </div>
          </div>
        `
      });
    }

    // --- Mount offscreen rendering container ---
    const container = document.createElement('div');
    container.id = 'pdf-render-scratchpad';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '794px';
    container.style.height = '1123px';
    container.style.overflow = 'hidden';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '-99999';
    container.style.background = '#FFFFFF';
    container.style.direction = 'rtl';
    container.style.letterSpacing = 'normal';
    container.style.wordSpacing = 'normal';
    document.body.appendChild(container);

    try {
      options.onProgress?.(25, 'بدء تجميع صفحات الـ PDF بجودة عالية...');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      let pageIdxInPdf = 0;

      // 1. Cover image full-bleed 100% on page 1
      if (options.includeCover && coverBase64) {
        options.onProgress?.(30, 'تضمين غلاف الرواية الأصلي بكامل الصفحة الأولى...');
        const imageFormat = coverBase64.startsWith('data:image/png') ? 'PNG' : 'JPEG';
        pdf.addImage(coverBase64, imageFormat, 0, 0, 210, 297, undefined, 'FAST');
        pageIdxInPdf++;
      }

      // 2. Render each generated page individually into the scratchpad
      const totalHtmlPages = pagesHtml.length;

      for (let i = 0; i < totalHtmlPages; i++) {
        const pageObj = pagesHtml[i];
        const progressPercent = Math.round(30 + ((i + 1) / totalHtmlPages) * 65);
        options.onProgress?.(progressPercent, `تنسيق الصفحة ${i + 1} من ${totalHtmlPages}...`);

        container.innerHTML = `
          <style>
            #pdf-render-scratchpad,
            .pdf-page,
            .pdf-page *,
            .pdf-page h1,
            .pdf-page h2,
            .pdf-page h3,
            .pdf-page p,
            .pdf-page div,
            .pdf-page span {
              letter-spacing: normal !important;
              word-spacing: normal !important;
              text-rendering: optimizeLegibility !important;
              font-feature-settings: "liga" 1, "calt" 1 !important;
              -webkit-font-smoothing: antialiased !important;
            }
            .pdf-page {
              box-sizing: border-box !important;
              width: 794px !important;
              height: 1123px !important;
              min-height: 1123px !important;
              max-height: 1123px !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              direction: rtl !important;
              text-align: right !important;
            }
            .pdf-page p {
              text-indent: 0px !important;
            }
          </style>
          ${pageObj.html}
        `;

        const pageEl = container.querySelector('.pdf-page') as HTMLElement;
        if (!pageEl) continue;

        // Brief delay for DOM reflow
        await new Promise(r => setTimeout(r, 50));

        const canvas = await html2canvas(pageEl, {
          scale: 2, // 2x high resolution
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#FFFFFF',
          logging: false,
          width: 794,
          height: 1123,
          x: 0,
          y: 0,
          scrollX: 0,
          scrollY: 0
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        if (pageIdxInPdf > 0) {
          pdf.addPage('a4', 'portrait');
        }

        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
        pageIdxInPdf++;
      }

      options.onProgress?.(96, 'جاري حفظ الملف وتحميله...');

      const cleanTitle = novel.title.replace(/[\\/:*?"<>|]/g, '_').trim();
      const filename = `رواية_${cleanTitle}_النسخة_الرسمية.pdf`;
      pdf.save(filename);

      options.onProgress?.(100, 'تم تحميل الكتاب بنجاح!');
    } finally {
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    }
  }

  /**
   * Opens the browser's native print engine with identical 100% full-page filling,
   * centered chapter titles, and dignified copyright/TOC typography.
   */
  public async openPrintBookView(
    novel: Novel,
    chapters: Chapter[],
    options: PdfExportOptions = {
      fontFamily: 'amiri',
      fontSize: 'medium',
      includeCover: true,
      includeCopyright: true,
      includeToc: true
    }
  ): Promise<void> {
    const sortedChapters = [...chapters]
      .filter(c => c.novelId === novel.id && c.status !== 'DRAFT')
      .sort((a, b) => a.chapterNumber - b.chapterNumber);

    let fontCss = "'Amiri', serif, system-ui";
    if (options.fontFamily === 'cairo') {
      fontCss = "'Cairo', system-ui, sans-serif";
    } else if (options.fontFamily === 'readex') {
      fontCss = "'Readex Pro', system-ui, sans-serif";
    } else if (options.fontFamily === 'tajawal') {
      fontCss = "'Tajawal', system-ui, sans-serif";
    }

    let bodyFontSize = '15px';
    let lineHeight = '1.85';
    if (options.fontSize === 'small') {
      bodyFontSize = '13.5px';
      lineHeight = '1.8';
    } else if (options.fontSize === 'large') {
      bodyFontSize = '16.5px';
      lineHeight = '1.95';
    }

    const deweyText = formatDeweyDisplay(novel.deweyDecimal, novel.deweyCategoryName);

    // Run dynamic pagination
    const { chapterPages, chapterStartIndices } = paginateChaptersWithDomMeasurement(
      sortedChapters,
      {
        fontCss,
        bodyFontSize,
        lineHeight
      }
    );

    let pageCounter = 1;
    if (options.includeCover) pageCounter++;
    if (options.includeCopyright !== false) pageCounter++;

    const TOC_ITEMS_PER_PAGE = 15;
    const tocPageCount = options.includeToc
      ? Math.max(1, Math.ceil(sortedChapters.length / TOC_ITEMS_PER_PAGE))
      : 0;
    const tocStartPageNum = pageCounter;
    if (options.includeToc) pageCounter += tocPageCount;

    const chapterStartPages: Record<string, number> = {};
    for (const ch of sortedChapters) {
      const offsetInChapterPages = chapterStartIndices[ch.id] || 0;
      chapterStartPages[ch.id] = pageCounter + offsetInChapterPages;
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '1000px';
    iframe.style.height = '1000px';
    iframe.style.border = 'none';

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      return;
    }

    const printHtml = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>رواية ${novel.title} - نسخة الطباعة وحفظ PDF</title>
        <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;600;700&family=Readex+Pro:wght@400;600;700&family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
        <style>
          @page {
            size: A4 portrait;
            margin: 0;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            margin: 0;
            padding: 0;
            direction: rtl;
            text-align: right;
            font-family: ${fontCss};
            color: #1A1A1A;
            background: #FFFFFF;
          }
          .book-page {
            width: 210mm;
            height: 297mm;
            min-height: 297mm;
            max-height: 297mm;
            page-break-after: always;
            break-after: page;
            position: relative;
            overflow: hidden;
            box-sizing: border-box;
          }
          .book-cover-page {
            width: 210mm;
            height: 297mm;
            page-break-after: always;
            break-after: page;
            margin: 0;
            padding: 0;
            overflow: hidden;
            background: #FFFFFF;
          }
          .book-cover-page img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }
          .inner-page {
            padding: 16mm 18mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 100%;
          }
          p {
            margin: 0 0 16px 0;
            font-size: ${bodyFontSize};
            line-height: ${lineHeight};
            text-align: justify !important;
            text-justify: inter-word !important;
            direction: rtl !important;
            unicode-bidi: isolate !important;
            letter-spacing: 0 !important;
            word-spacing: 0 !important;
            text-indent: 0 !important;
          }
        </style>
      </head>
      <body>
        ${options.includeCover ? `
          ${novel.coverImage ? `
            <div class="book-cover-page">
              <img src="${novel.coverImage}" alt="غلاف الرواية" />
            </div>
          ` : `
            <div class="book-page" style="background: #FAF9F6; display: flex; align-items: center; justify-content: center; padding: 25mm;">
              <div style="border: 2px solid #2C2C2C; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20mm;">
                <h1 style="font-size: 36px; font-weight: 800; margin: 0 0 18px 0; font-family: 'Amiri', serif;">${novel.title}</h1>
                <div style="width: 50px; height: 2px; background: #2C2C2C; margin: 0 auto 20px auto;"></div>
                <p style="font-size: 20px; font-weight: 600; color: #444444; margin: 0;">تأليف: ${novel.author || 'أيمن كناني'}</p>
              </div>
            </div>
          `}
        ` : ''}

        ${options.includeCopyright !== false ? `
          <div class="book-page" style="background: #FFFFFF;">
            <div class="inner-page" style="text-align: center;">
              <div style="font-size: 11px; color: #888888; border-bottom: 1px solid #EEEEEE; padding-bottom: 6px; text-align: right;">
                <span>رواية: ${novel.title}</span>
              </div>
              <div style="margin: auto 0; max-width: 520px; margin-left: auto; margin-right: auto;">
                <h1 style="font-family: 'Amiri', serif; font-size: 30px; font-weight: 700; margin: 0 0 10px 0;">${novel.title}</h1>
                <p style="font-size: 18px; color: #444444; margin: 0 0 30px 0;">تأليف: ${novel.author || 'أيمن كناني'}</p>
                <div style="width: 45px; height: 1.5px; background: #222222; margin: 0 auto 30px auto;"></div>
                <div style="font-size: 13.5px; line-height: 2.3; color: #333333; margin-bottom: 30px;">
                  <p style="margin: 0;"><strong>رواية أدبية عربية</strong></p>
                  ${deweyText ? `<p style="margin: 0;">التصنيف المكتبي: ${deweyText}</p>` : ''}
                  <p style="margin: 0;">الناشر: المنصة الرسمية للكاتب أيمن كناني</p>
                  <p style="margin: 0;">الطبعة الإلكترونية الأولى — ${new Date().getFullYear()}م</p>
                </div>
                <div style="width: 30px; height: 1px; background: #CCCCCC; margin: 0 auto 25px auto;"></div>
                <div style="font-size: 12px; line-height: 2.0; color: #666666;">
                  <p style="margin: 0 0 6px 0; font-weight: bold; color: #222222;">جميع حقوق النشر والملكية الفكرية محفوظة للمؤلف © ${new Date().getFullYear()}م</p>
                  <p style="margin: 0;">هذا المصنف مخصص للقراءة الشخصية ولا يجوز استغلاله أو طباعته تجارياً دون موافقة كتابية مسبقة.</p>
                </div>
              </div>
              <div style="font-size: 11px; color: #888888; border-top: 1px solid #EEEEEE; padding-top: 6px;">
                — بيانات النشر والتوثيق —
              </div>
            </div>
          </div>
        ` : ''}

        ${options.includeToc ? Array.from({ length: tocPageCount }).map((_, tIdx) => {
          const pageChapters = sortedChapters.slice(tIdx * TOC_ITEMS_PER_PAGE, (tIdx + 1) * TOC_ITEMS_PER_PAGE);
          return `
            <div class="book-page" style="background: #FFFFFF;">
              <div class="inner-page">
                <div>
                  <div style="display: flex; justify-content: space-between; font-size: 11px; color: #888888; border-bottom: 1px solid #EEEEEE; padding-bottom: 6px; margin-bottom: 30px;">
                    <span>رواية: ${novel.title}</span>
                    <span>فهرس الفصول ${tocPageCount > 1 ? `(${tIdx + 1}/${tocPageCount})` : ''}</span>
                  </div>
                  <div style="text-align: center; margin-bottom: 35px;">
                    <h2 style="font-family: 'Amiri', serif; font-size: 26px; font-weight: bold; margin: 0 0 10px 0;">فهرس الفصول</h2>
                    <div style="width: 45px; height: 1.5px; background: #222222; margin: 0 auto;"></div>
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 14px;">
                    ${pageChapters.map(ch => `
                      <div style="display: flex; justify-content: space-between; align-items: baseline; font-size: 14px;">
                        <span style="font-weight: 700; color: #222222; white-space: nowrap;">الفصل ${ch.chapterNumber}: ${ch.title}</span>
                        <span style="flex-grow: 1; border-bottom: 1.5px dotted #999999; margin: 0 12px; height: 1px;"></span>
                        <span style="font-family: 'Amiri', serif; font-size: 14.5px; font-weight: bold; color: #333333; white-space: nowrap;">${chapterStartPages[ch.id]}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
                <div style="text-align: center; font-size: 11px; color: #888888; border-top: 1px solid #EEEEEE; padding-top: 6px;">
                  — ${tocStartPageNum + tIdx} —
                </div>
              </div>
            </div>
          `;
        }).join('') : ''}

        ${chapterPages.map((pageData, pIdx) => {
          const ch = pageData.chapter;
          const isFirstPage = pageData.isFirstPage;
          const isLastPage = pageData.isLastPage;
          const pageNum = pageCounter + pIdx;

          return `
            <div class="book-page" style="background: #FFFFFF;">
              <div class="inner-page">
                <div style="width: 100%; flex: 1; display: flex; flex-direction: column;">
                  ${!isFirstPage ? `
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #777777; border-bottom: 1px solid #EEEEEE; padding-bottom: 6px; margin-bottom: 20px;">
                      <span>رواية: ${novel.title}</span>
                      <span>${ch.title}</span>
                    </div>
                  ` : ''}

                  ${isFirstPage ? `
                    <div style="text-align: center; margin: 20px 0 30px 0;">
                      <div style="font-size: 13px; font-weight: 600; color: #666666; margin-bottom: 6px;">— الفصل ${ch.chapterNumber} —</div>
                      <h2 style="font-family: 'Amiri', serif; font-size: 26px; font-weight: 700; color: #111111; margin: 0 0 12px 0;">${ch.title}</h2>
                      <div style="width: 45px; height: 1.5px; background: #222222; margin: 0 auto;"></div>
                    </div>
                  ` : ''}

                  <div style="width: 100%; font-family: ${fontCss}; font-size: ${bodyFontSize}; line-height: ${lineHeight}; color: #1A1A1A;">
                    ${pageData.paragraphs.map((p, idx) => {
                      const isSplitBottom = !isLastPage && idx === pageData.paragraphs.length - 1;
                      return `
                        <p style="margin: 0 0 ${isSplitBottom ? '0' : '16px'} 0;">
                          ${p}
                        </p>
                      `;
                    }).join('')}
                  </div>

                  ${isLastPage && ch.authorNote ? `
                    <div style="margin-top: 20px; padding: 12px 16px; background: #FAF9F6; border-right: 3px solid #4A5D4E; border-radius: 4px; font-size: 12px; line-height: 1.8; color: #555555;">
                      <strong style="color: #1A1A1A;">ملاحظة الكاتب:</strong> ${ch.authorNote}
                    </div>
                  ` : ''}
                </div>

                <div style="text-align: center; font-size: 11px; color: #777777; border-top: 1px solid #EEEEEE; padding-top: 6px; margin-top: 8px;">
                  — ${pageNum} —
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </body>
      </html>
    `;

    doc.open();
    doc.write(printHtml);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error('Print trigger error:', err);
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 5000);
      }
    }, 800);
  }
}

export const pdfExportService = new PdfExportService();
