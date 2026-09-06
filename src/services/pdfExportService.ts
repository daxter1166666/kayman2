import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Novel, Chapter } from '../types';
import { formatDeweyDisplay } from '../utils/deweyDecimal';
import { extractCleanParagraphs } from '../utils/textCleaner';

export interface PdfExportOptions {
  fontFamily: 'readex' | 'amiri' | 'cairo' | 'tajawal';
  fontSize: 'small' | 'medium' | 'large';
  includeCover: boolean;
  includeCopyright?: boolean;
  includeToc: boolean;
  onProgress?: (progress: number, stage: string) => void;
}

/**
 * Safely converts an image URL into a Base64 data URL to prevent CORS/taint errors in html2canvas.
 */
async function getBase64Image(url: string): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('data:image/')) return url;

  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn('Could not convert image to base64, using fallback:', err);
    return null;
  }
}

export class PdfExportService {
  /**
   * Generates and downloads a complete, beautifully formatted multi-page PDF book of all novel chapters.
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

    options.onProgress?.(5, 'تهيئة محتوى الرواية والخطوط العربية الأصيلة...');

    // Wait for document fonts to be 100% loaded to prevent disjointed/inverted Arabic glyphs
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    // Pre-convert cover image to base64 data URL to avoid CORS / canvas taint
    let coverBase64: string | null = null;
    if (novel.coverImage) {
      options.onProgress?.(10, 'تجهيز غلاف الرواية بدقة متناهية...');
      coverBase64 = await getBase64Image(novel.coverImage);
    }

    // Create temporary hidden scratchpad inside body so layout engine shapes Arabic correctly
    const container = document.createElement('div');
    container.id = 'pdf-render-scratchpad';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '794px';
    container.style.opacity = '0';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '-9999';
    container.style.backgroundColor = '#FFFFFF';
    container.style.color = '#2C2C2C';
    container.style.direction = 'rtl';
    container.style.textAlign = 'right';
    container.style.boxSizing = 'border-box';

    // Map font family
    let fontCss = "'Amiri', serif, system-ui";
    if (options.fontFamily === 'readex') {
      fontCss = "'Readex Pro', system-ui, sans-serif";
    } else if (options.fontFamily === 'cairo') {
      fontCss = "'Cairo', system-ui, sans-serif";
    } else if (options.fontFamily === 'tajawal') {
      fontCss = "'Tajawal', system-ui, sans-serif";
    }

    container.style.fontFamily = fontCss;

    const deweyText = formatDeweyDisplay(novel.deweyDecimal, novel.deweyCategoryName);
    const pagesHtml: string[] = [];

    // 1. PAGE 1: Luxury Full-Bleed Ebook Cover (غلاف يملأ كامل الصفحة 100%)
    if (options.includeCover) {
      const coverSrc = coverBase64 || novel.coverImage;
      pagesHtml.push(`
        <div class="pdf-page" style="width: 794px; height: 1123px; position: relative; overflow: hidden; background: #121A15; box-sizing: border-box; margin: 0; padding: 0; page-break-after: always; direction: rtl; text-align: right;">
          ${coverSrc ? `
            <img src="${coverSrc}" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1;" crossorigin="anonymous" />
            <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(14,22,17,0.88) 0%, rgba(14,22,17,0.32) 32%, rgba(14,22,17,0.48) 60%, rgba(12,18,14,0.96) 100%); z-index: 2;"></div>
          ` : `
            <div style="position: absolute; inset: 0; background: radial-gradient(circle at 50% 30%, #2A3E31 0%, #121A15 100%); z-index: 1;"></div>
          `}

          <!-- Elegant Golden Border Framing (Inner Margin) -->
          <div style="position: absolute; inset: 24px; border: 2px solid rgba(200, 138, 59, 0.7); pointer-events: none; z-index: 3; box-sizing: border-box;">
            <div style="position: absolute; inset: 4px; border: 1px solid rgba(255, 255, 255, 0.25);"></div>
          </div>

          <!-- Cover Typography & Elements Overlay -->
          <div style="position: relative; z-index: 4; height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 55px 48px; box-sizing: border-box; color: #FFFFFF; text-align: center;">
            <!-- Top Header Badge -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255, 255, 255, 0.22); padding-bottom: 14px;">
              <span style="font-size: 13px; font-weight: bold; color: #EAE6DF; letter-spacing: 0.5px;">المنصة الأدبية الرسمية • الكاتب أيمن كناني</span>
              ${novel.deweyDecimal ? `
                <span style="font-size: 12px; font-weight: bold; background: #C88A3B; color: #FFFFFF; padding: 4px 14px; border-radius: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.4);">
                  تصنيف ديوي: ${novel.deweyDecimal}
                </span>
              ` : ''}
            </div>

            <!-- Main Title & Author (Center) -->
            <div style="margin: auto 0; padding: 25px 0;">
              <div style="display: inline-block; padding: 5px 18px; border-radius: 24px; background: rgba(0, 0, 0, 0.45); border: 1px solid rgba(200, 138, 59, 0.6); color: #E5B26E; font-size: 13px; font-weight: bold; margin-bottom: 24px;">
                رِوَايَــة عَرَبِيَّــة كَامِلَــة
              </div>

              <h1 style="font-size: 44px; font-weight: 900; color: #FFFFFF; line-height: 1.35; margin: 0 0 20px 0; text-shadow: 0 4px 16px rgba(0,0,0,0.85); font-family: 'Amiri', serif; letter-spacing: normal;">
                ${novel.title}
              </h1>

              <div style="width: 90px; height: 3px; background: #C88A3B; margin: 0 auto 22px auto; border-radius: 2px;"></div>

              <p style="font-size: 23px; color: #F0EDE6; font-weight: 700; margin: 0; text-shadow: 0 2px 10px rgba(0,0,0,0.8); font-family: 'Amiri', serif;">
                بقلم الكاتب والروائي / ${novel.author || 'أيمن كناني'}
              </p>
            </div>

            <!-- Bottom Metadata & Official Seal -->
            <div style="border-top: 1px solid rgba(255, 255, 255, 0.22); padding-top: 18px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 12px; color: #D5CEBE;">
              <div style="text-align: right; line-height: 1.7;">
                <div><strong>التصنيف المكتبي:</strong> ${deweyText || 'الروايات والقصص الأدبية العربية (813)'}</div>
                <div><strong>إجمالي الفصول:</strong> ${sortedChapters.length} فصلاً أدبياً كاملاً</div>
              </div>
              <div style="text-align: left; font-weight: bold; color: #E5B26E; line-height: 1.7;">
                طبعة رقمية رسمية معتمدة<br>
                جميع الحقوق محفوظة © ${new Date().getFullYear()}م
              </div>
            </div>
          </div>
        </div>
      `);
    }

    // 2. PAGE 2: Formal Copyright & Intellectual Property Card (صفحة حقوق الملكية الفكرية والبيانات الببليوغرافية)
    if (options.includeCopyright !== false) {
      pagesHtml.push(`
        <div class="pdf-page" style="width: 794px; height: 1123px; position: relative; padding: 75px 65px; box-sizing: border-box; background: #FAF9F5; display: flex; flex-direction: column; justify-content: space-between; direction: rtl; text-align: right; page-break-after: always; font-family: ${fontCss};">
          <!-- Running Top Header -->
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: #8C827A; border-bottom: 1px solid #E5E2D9; padding-bottom: 8px;">
            <span>صفحة حقوق الملكية الفكرية والتوثيق</span>
            <span>رواية: ${novel.title}</span>
          </div>

          <!-- Copyright & CIP Core -->
          <div style="margin: auto 0; space-y: 24px;">
            <!-- Book Heading -->
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="font-size: 26px; font-weight: 800; color: #2C2C2C; margin: 0 0 8px 0; font-family: 'Amiri', serif;">
                ${novel.title}
              </h2>
              <p style="font-size: 15px; color: #4A5D4E; font-weight: bold; margin: 0;">
                المؤلف: ${novel.author || 'أيمن كناني'}
              </p>
              <div style="width: 50px; height: 2px; background: #C88A3B; margin: 14px auto 0 auto;"></div>
            </div>

            <!-- Legal Rights Box -->
            <div style="background: #FFFFFF; border: 1px solid #E5E2D9; border-radius: 12px; padding: 22px 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.02); margin-bottom: 22px;">
              <h3 style="font-size: 14px; font-weight: bold; color: #4A5D4E; margin: 0 0 12px 0;">
                ✦ حقوق النشر والتأليف والملكية الفكرية
              </h3>
              <p style="font-size: 13px; line-height: 2.1; color: #3A3A3A; margin: 0 0 12px 0; text-align: right !important; direction: rtl !important; letter-spacing: normal !important; word-break: normal !important;">
                جميع حقوق النشر والملكية الفكرية لهذا العمل الروائي محفوظة بالكامل للكاتب والمؤلف <strong>أيمن كناني (Ayman Kinani) © ${new Date().getFullYear()}م</strong>.
              </p>
              <p style="font-size: 12px; line-height: 2.0; color: #6E6A64; margin: 0; text-align: right !important; direction: rtl !important; letter-spacing: normal !important; word-break: normal !important;">
                <strong>شروط الاستخدام والترخيص:</strong> هذا العمل منشور ومرخص بموجب رخصة المشاع الإبداعي <strong>CC BY-NC 4.0 (نسب المصنف - غير تجاري 4.0 دولي)</strong>. يُتاح هذا الملف لأغراض القراءة الشخصية والاطلاع غير التجاري مع وجوب ذكر اسم الكاتب ومصدر النشر الأصلي. يُحظر تماماً البيع أو التربح التجاري أو إعادة النشر المطبوع أو تعديل المحتوى دون إذن كتابي رسمي مسبق من المؤلف.
              </p>
            </div>

            <!-- CIP / Dewey Bibliographical Table -->
            <div style="background: #FFFFFF; border: 1px solid #E5E2D9; border-radius: 12px; padding: 20px 24px;">
              <h4 style="font-size: 13px; font-weight: bold; color: #2C2C2C; margin: 0 0 12px 0; border-bottom: 1px dashed #D5CEBE; padding-bottom: 8px;">
                بطاقة الفهرسة أثناء النشر (Cataloging-in-Publication - CIP)
              </h4>
              <table style="width: 100%; font-size: 12px; line-height: 2.1; color: #333333; border-collapse: collapse; direction: rtl; text-align: right;">
                <tbody>
                  <tr>
                    <td style="width: 145px; color: #6E6A64; font-weight: bold;">عنوان العمل:</td>
                    <td><strong>${novel.title}</strong></td>
                  </tr>
                  <tr>
                    <td style="color: #6E6A64; font-weight: bold;">المؤلف:</td>
                    <td>${novel.author || 'أيمن كناني'}</td>
                  </tr>
                  <tr>
                    <td style="color: #6E6A64; font-weight: bold;">تصنيف ديوي العشري (DDC):</td>
                    <td>
                      <span style="font-family: monospace; font-weight: bold; background: #FAF0E6; color: #8C5E45; padding: 2px 8px; border-radius: 4px;">
                        ${novel.deweyDecimal || '813'}
                      </span>
                      &nbsp;•&nbsp; ${novel.deweyCategoryName || 'الروايات والقصص الأدبية العربية'}
                    </td>
                  </tr>
                  <tr>
                    <td style="color: #6E6A64; font-weight: bold;">الموضوع والنوع:</td>
                    <td>${(novel.genres || []).join(' • ') || 'رواية أدبية عربية'}</td>
                  </tr>
                  <tr>
                    <td style="color: #6E6A64; font-weight: bold;">لغة العمل:</td>
                    <td>العربية الفصحى (Arabic)</td>
                  </tr>
                  <tr>
                    <td style="color: #6E6A64; font-weight: bold;">المنصة الرسمية المعتمدة:</td>
                    <td>المنصة الرسمية للكاتب أيمن كناني (aymankinani.com)</td>
                  </tr>
                  <tr>
                    <td style="color: #6E6A64; font-weight: bold;">تاريخ الإصدار الرقمي:</td>
                    <td>${new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' })}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Running Bottom Footer -->
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: #A8A29E; border-top: 1px solid #E5E2D9; padding-top: 10px;">
            <span>طبعة رقمية رسمية</span>
            <span>صفحة التوثيق [ أ ]</span>
          </div>
        </div>
      `);
    }

    // 3. PAGE 3: Table of Contents (فهرس الفصول)
    if (options.includeToc) {
      pagesHtml.push(`
        <div class="pdf-page" style="width: 794px; height: 1123px; position: relative; padding: 75px 65px; box-sizing: border-box; background: #FFFFFF; display: flex; flex-direction: column; justify-content: space-between; direction: rtl; text-align: right; page-break-after: always; font-family: ${fontCss};">
          <div>
            <!-- Running Top Header -->
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: #8C827A; border-bottom: 1px solid #E5E2D9; padding-bottom: 8px; margin-bottom: 35px;">
              <span>فهرس فصول الرواية</span>
              <span>رواية: ${novel.title}</span>
            </div>

            <!-- Title & Ornament -->
            <div style="text-align: center; margin-bottom: 35px;">
              <h2 style="font-size: 24px; font-weight: bold; color: #2C2C2C; margin: 0 0 10px 0; font-family: 'Amiri', serif;">
                فهرس فصول العمل الأدبي
              </h2>
              <div style="width: 45px; height: 2px; background: #C88A3B; margin: 0 auto;"></div>
            </div>

            <!-- Chapter List -->
            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${sortedChapters.map((ch) => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-bottom: 1px dotted #D5CEBE; font-size: 13px;">
                  <span style="font-weight: bold; color: #2C2C2C; text-align: right;">
                    الفصل ${ch.chapterNumber}: ${ch.title}
                  </span>
                  <span style="color: #6E6A64; font-size: 12px; shrink: 0;">
                    ${ch.wordCount || 0} كلمة
                  </span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Running Bottom Footer -->
          <div style="text-align: center; font-size: 11px; color: #A8A29E; border-top: 1px solid #E5E2D9; padding-top: 10px;">
            الصفحة [ ب ] • الفهرس العام
          </div>
        </div>
      `);
    }

    // 4. CHAPTER PAGES: Clean Paragraphs, Paginated & No Inverted Letters
    let bodyFontSize = '15px';
    let lineHeight = '2.1';
    if (options.fontSize === 'small') {
      bodyFontSize = '13.5px';
      lineHeight = '2.0';
    } else if (options.fontSize === 'large') {
      bodyFontSize = '16.5px';
      lineHeight = '2.25';
    }

    let globalPageCounter = 1;

    for (let cIdx = 0; cIdx < sortedChapters.length; cIdx++) {
      const ch = sortedChapters[cIdx];
      // Clean and segment chapter content into distinct, small paragraphs
      const rawParagraphs = extractCleanParagraphs(ch.content || '');
      const paragraphs = rawParagraphs.length > 0 ? rawParagraphs : ['(لا يوجد محتوى في هذا الفصل)'];

      // Paginate paragraphs across pages:
      // Page 1 of chapter has the Chapter Title header, so it fits ~3-4 paragraphs (approx 1400 chars).
      // Subsequent continuation pages fit ~5-6 paragraphs (approx 2000 chars).
      const chapterPages: string[][] = [];
      let currentPage: string[] = [];
      let currentLength = 0;
      const isFirstPage = (idx: number) => idx === 0;

      for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
        const para = paragraphs[pIdx];
        const paraLen = para.length;
        const pageLimit = chapterPages.length === 0 ? 1400 : 2000;

        if (currentPage.length > 0 && (currentLength + paraLen > pageLimit || currentPage.length >= (chapterPages.length === 0 ? 4 : 6))) {
          chapterPages.push(currentPage);
          currentPage = [para];
          currentLength = paraLen;
        } else {
          currentPage.push(para);
          currentLength += paraLen;
        }
      }

      if (currentPage.length > 0) {
        chapterPages.push(currentPage);
      }

      // Generate HTML for each paginated page of the chapter
      for (let pageIdx = 0; pageIdx < chapterPages.length; pageIdx++) {
        const pageParas = chapterPages[pageIdx];
        const isChapterFirstPage = pageIdx === 0;
        const isChapterLastPage = pageIdx === chapterPages.length - 1;

        pagesHtml.push(`
          <div class="pdf-page" style="width: 794px; height: 1123px; position: relative; padding: 60px 65px 65px 65px; box-sizing: border-box; background: #FFFFFF; display: flex; flex-direction: column; justify-content: space-between; direction: rtl; text-align: right; page-break-after: always; font-family: ${fontCss};">
            <div>
              <!-- Running Top Header -->
              <div style="display: flex; justify-content: space-between; font-size: 11px; color: #8C827A; border-bottom: 1px solid #E5E2D9; padding-bottom: 8px; margin-bottom: 22px;">
                <span>رواية: ${novel.title} • الفصل ${ch.chapterNumber}${pageIdx > 0 ? ` (تابع صفحة ${pageIdx + 1})` : ''}</span>
                <span>المؤلف: ${novel.author || 'أيمن كناني'}</span>
              </div>

              ${isChapterFirstPage ? `
                <!-- Chapter Opening Banner -->
                <div style="text-align: center; margin-bottom: 25px; padding-bottom: 16px; border-bottom: 1px dashed #E5E2D9;">
                  <span style="font-size: 12.5px; font-weight: bold; color: #4A5D4E; background: #FAF9F5; padding: 4px 16px; border-radius: 20px; border: 1px solid #E5E2D9;">
                    الفصل ${ch.chapterNumber}
                  </span>
                  <h2 style="font-size: 23px; font-weight: 800; color: #2C2C2C; margin: 12px 0 8px 0; font-family: 'Amiri', serif;">
                    ${ch.title}
                  </h2>
                  <div style="font-size: 13px; color: #C88A3B;">
                    ✦ ❖ ✦
                  </div>
                </div>
              ` : ''}

              <!-- Chapter Paragraphs Body -->
              <div style="direction: rtl !important; text-align: right !important;">
                ${pageParas.map(p => `
                  <p style="margin: 0 0 16px 0; font-size: ${bodyFontSize}; line-height: ${lineHeight}; color: #2C2C2C; text-align: right !important; direction: rtl !important; letter-spacing: normal !important; word-break: normal !important; overflow-wrap: normal !important; text-indent: 1.6em;">
                    ${p}
                  </p>
                `).join('')}
              </div>

              ${isChapterLastPage && ch.authorNote ? `
                <div style="margin-top: 24px; padding: 14px 18px; background: #FAF9F5; border-right: 3px solid #C88A3B; border-radius: 6px; font-size: 12px; line-height: 1.8; color: #555555; text-align: right !important; direction: rtl !important;">
                  <strong style="color: #4A5D4E;">ملاحظة الكاتب:</strong> ${ch.authorNote}
                </div>
              ` : ''}

              ${isChapterLastPage ? `
                <div style="text-align: center; margin-top: 20px; font-size: 13px; color: #C88A3B;">
                  ✦ نهاية الفصل ${ch.chapterNumber} ✦
                </div>
              ` : ''}
            </div>

            <!-- Running Bottom Footer with Page Counter -->
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: #A8A29E; border-top: 1px solid #E5E2D9; padding-top: 10px;">
              <span>الفصل ${ch.chapterNumber}: ${ch.title}</span>
              <span>صفحة ${globalPageCounter++}</span>
            </div>
          </div>
        `);
      }
    }

    container.innerHTML = pagesHtml.join('');
    document.body.appendChild(container);

    try {
      options.onProgress?.(10, 'جاري تحميل الخطوط العربية وتثبيت تراكيب الكلمات...');

      // Ensure all Arabic Google Fonts (Amiri, Readex Pro, Cairo, Tajawal) have finished rendering
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      // Short delay for browser font rasterization and layout reflow
      await new Promise(resolve => setTimeout(resolve, 250));

      options.onProgress?.(20, 'معالجة الصفحات بدقة عالية وضبط التنسيق...');

      const pageElements = container.querySelectorAll('.pdf-page');
      const totalPages = pageElements.length;

      // Initialize jsPDF A4 portrait
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      for (let i = 0; i < totalPages; i++) {
        const pageEl = pageElements[i] as HTMLElement;
        const progressPercent = Math.round(15 + ((i + 1) / totalPages) * 75);
        options.onProgress?.(progressPercent, `توليد وضبط الصفحة ${i + 1} من ${totalPages}...`);

        // Render page element to high-DPI canvas
        const canvas = await html2canvas(pageEl, {
          scale: 2, // 2x retina clarity
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#FFFFFF',
          logging: false
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        if (i > 0) {
          pdf.addPage('a4', 'portrait');
        }

        // A4 page width = 210mm, height = 297mm
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      }

      options.onProgress?.(95, 'جاري حفظ وتحميل ملف الـ PDF...');

      const cleanTitle = novel.title.replace(/[\\/:*?"<>|]/g, '_').trim();
      const filename = `رواية_${cleanTitle}_النسخة_الكاملة.pdf`;
      pdf.save(filename);

      options.onProgress?.(100, 'تم تنزيل الكتاب الإلكتروني بنجاح!');
    } finally {
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    }
  }

  /**
   * Opens the browser's native print engine with 100% vector typography, perfect Arabic text shaping,
   * full-bleed cover, and dedicated page breaks. Allows saving as pristine vector PDF.
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
    if (options.fontFamily === 'readex') {
      fontCss = "'Readex Pro', system-ui, sans-serif";
    } else if (options.fontFamily === 'cairo') {
      fontCss = "'Cairo', system-ui, sans-serif";
    } else if (options.fontFamily === 'tajawal') {
      fontCss = "'Tajawal', system-ui, sans-serif";
    }

    let bodyFontSize = '15px';
    let lineHeight = '2.1';
    if (options.fontSize === 'small') {
      bodyFontSize = '13.5px';
      lineHeight = '2.0';
    } else if (options.fontSize === 'large') {
      bodyFontSize = '16.5px';
      lineHeight = '2.25';
    }

    const deweyText = formatDeweyDisplay(novel.deweyDecimal, novel.deweyCategoryName);

    // Create an invisible iframe for native vector printing
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
        <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Readex+Pro:wght@400;600;700&family=Cairo:wght@400;600;700&family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
        <style>
          @page {
            size: A4 portrait;
            margin: 0;
          }
          @page :left { margin: 0; }
          @page :right { margin: 0; }
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
            color: #2C2C2C;
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
          .inner-page {
            padding: 22mm 20mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 100%;
          }
          p {
            margin: 0 0 16px 0;
            font-size: ${bodyFontSize};
            line-height: ${lineHeight};
            text-align: right !important;
            direction: rtl !important;
            letter-spacing: normal !important;
            word-break: normal !important;
            text-indent: 1.5em;
          }
        </style>
      </head>
      <body>
        ${options.includeCover ? `
          <div class="book-page" style="background: #121A15; color: #FFFFFF; position: relative; margin: 0; padding: 0;">
            ${novel.coverImage ? `
              <img src="${novel.coverImage}" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1;" />
              <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(14,22,17,0.88) 0%, rgba(14,22,17,0.32) 32%, rgba(14,22,17,0.48) 60%, rgba(12,18,14,0.96) 100%); z-index: 2;"></div>
            ` : `
              <div style="position: absolute; inset: 0; background: radial-gradient(circle at 50% 30%, #2A3E31 0%, #121A15 100%); z-index: 1;"></div>
            `}
            <div style="position: absolute; inset: 12mm; border: 2px solid rgba(200, 138, 59, 0.7); z-index: 3;">
              <div style="position: absolute; inset: 2mm; border: 1px solid rgba(255, 255, 255, 0.25);"></div>
            </div>
            <div style="position: relative; z-index: 4; height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 22mm 18mm; text-align: center;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.25); padding-bottom: 4mm;">
                <span style="font-size: 13px; font-weight: bold; color: #EAE6DF;">المنصة الأدبية الرسمية • الكاتب أيمن كناني</span>
                <span style="font-size: 12px; font-weight: bold; background: #C88A3B; color: #FFFFFF; padding: 3px 12px; border-radius: 15px;">ديوي: ${novel.deweyDecimal || '813'}</span>
              </div>
              <div style="margin: auto 0;">
                <div style="display: inline-block; padding: 4px 16px; border-radius: 20px; background: rgba(0,0,0,0.45); border: 1px solid rgba(200,138,59,0.6); color: #E5B26E; font-size: 13px; font-weight: bold; margin-bottom: 18px;">رِوَايَــة عَرَبِيَّــة كَامِلَــة</div>
                <h1 style="font-size: 42px; font-weight: 900; margin: 0 0 16px 0; font-family: 'Amiri', serif;">${novel.title}</h1>
                <div style="width: 80px; height: 3px; background: #C88A3B; margin: 0 auto 18px auto;"></div>
                <p style="font-size: 22px; font-weight: 700; color: #F0EDE6; margin: 0; font-family: 'Amiri', serif;">بقلم الكاتب / ${novel.author || 'أيمن كناني'}</p>
              </div>
              <div style="border-top: 1px solid rgba(255,255,255,0.25); padding-top: 4mm; display: flex; justify-content: space-between; align-items: flex-end; font-size: 12px; color: #D5CEBE;">
                <div style="text-align: right;">
                  <div><strong>التصنيف:</strong> ${deweyText || 'روايات عربية'}</div>
                  <div><strong>الفصول:</strong> ${sortedChapters.length} فصلاً كاملاً</div>
                </div>
                <div style="text-align: left; color: #E5B26E; font-weight: bold;">
                  طبعة رقمية رسمية معتمدة<br>جميع الحقوق محفوظة © ${new Date().getFullYear()}م
                </div>
              </div>
            </div>
          </div>
        ` : ''}

        ${options.includeCopyright !== false ? `
          <div class="book-page" style="background: #FAF9F5;">
            <div class="inner-page">
              <div style="display: flex; justify-content: space-between; font-size: 11px; color: #8C827A; border-bottom: 1px solid #E5E2D9; padding-bottom: 6px;">
                <span>صفحة حقوق الملكية الفكرية والتوثيق</span>
                <span>رواية: ${novel.title}</span>
              </div>
              <div style="margin: auto 0;">
                <div style="text-align: center; margin-bottom: 24px;">
                  <h2 style="font-size: 24px; font-weight: 800; margin: 0 0 8px 0; font-family: 'Amiri', serif;">${novel.title}</h2>
                  <p style="font-size: 15px; color: #4A5D4E; font-weight: bold; margin: 0;">المؤلف: ${novel.author || 'أيمن كناني'}</p>
                  <div style="width: 45px; height: 2px; background: #C88A3B; margin: 12px auto 0 auto;"></div>
                </div>
                <div style="background: #FFFFFF; border: 1px solid #E5E2D9; border-radius: 10px; padding: 18px 22px; margin-bottom: 18px;">
                  <h3 style="font-size: 13px; font-weight: bold; color: #4A5D4E; margin: 0 0 10px 0;">✦ حقوق النشر والتأليف والملكية الفكرية</h3>
                  <p style="font-size: 12.5px; line-height: 2.0; color: #3A3A3A; margin: 0 0 10px 0; text-indent: 0;">
                    جميع حقوق النشر والملكية الفكرية لهذا العمل الروائي محفوظة بالكامل للكاتب والمؤلف <strong>أيمن كناني (Ayman Kinani) © ${new Date().getFullYear()}م</strong>.
                  </p>
                  <p style="font-size: 12px; line-height: 1.9; color: #6E6A64; margin: 0; text-indent: 0;">
                    <strong>شروط الاستخدام والترخيص:</strong> هذا العمل منشور ومرخص بموجب رخصة المشاع الإبداعي <strong>CC BY-NC 4.0 (نسب المصنف - غير تجاري 4.0 دولي)</strong>. يُتاح هذا الملف لأغراض القراءة الشخصية والاطلاع غير التجاري مع وجوب ذكر اسم الكاتب ومصدر النشر الأصلي. يُحظر تماماً البيع أو التربح التجاري أو إعادة النشر المطبوع دون إذن كتابي مسبق.
                  </p>
                </div>
                <div style="background: #FFFFFF; border: 1px solid #E5E2D9; border-radius: 10px; padding: 18px 22px;">
                  <h4 style="font-size: 13px; font-weight: bold; color: #2C2C2C; margin: 0 0 10px 0; border-bottom: 1px dashed #D5CEBE; padding-bottom: 6px;">
                    بيانات الفهرسة أثناء النشر (CIP Cataloging)
                  </h4>
                  <table style="width: 100%; font-size: 12px; line-height: 2.0; color: #333333; border-collapse: collapse;">
                    <tr><td style="width: 140px; color: #6E6A64; font-weight: bold;">عنوان العمل:</td><td><strong>${novel.title}</strong></td></tr>
                    <tr><td style="color: #6E6A64; font-weight: bold;">المؤلف:</td><td>${novel.author || 'أيمن كناني'}</td></tr>
                    <tr><td style="color: #6E6A64; font-weight: bold;">تصنيف ديوي (DDC):</td><td>${novel.deweyDecimal || '813'} - ${novel.deweyCategoryName || 'الروايات والقصص الأدبية العربية'}</td></tr>
                    <tr><td style="color: #6E6A64; font-weight: bold;">المنصة الرسمية:</td><td>المنصة الرسمية للكاتب أيمن كناني (aymankinani.com)</td></tr>
                  </table>
                </div>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 11px; color: #A8A29E; border-top: 1px solid #E5E2D9; padding-top: 8px;">
                <span>طبعة رقمية رسمية</span>
                <span>صفحة التوثيق [ أ ]</span>
              </div>
            </div>
          </div>
        ` : ''}

        ${options.includeToc ? `
          <div class="book-page" style="background: #FFFFFF;">
            <div class="inner-page">
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 11px; color: #8C827A; border-bottom: 1px solid #E5E2D9; padding-bottom: 6px; margin-bottom: 25px;">
                  <span>فهرس فصول الرواية</span>
                  <span>رواية: ${novel.title}</span>
                </div>
                <div style="text-align: center; margin-bottom: 25px;">
                  <h2 style="font-size: 22px; font-weight: bold; margin: 0 0 8px 0; font-family: 'Amiri', serif;">فهرس الفصول</h2>
                  <div style="width: 40px; height: 2px; background: #C88A3B; margin: 0 auto;"></div>
                </div>
                <div>
                  ${sortedChapters.map(ch => `
                    <div style="display: flex; justify-content: space-between; padding: 8px 12px; border-bottom: 1px dotted #D5CEBE; font-size: 13px;">
                      <span style="font-weight: bold;">الفصل ${ch.chapterNumber}: ${ch.title}</span>
                      <span style="color: #6E6A64;">${ch.wordCount || 0} كلمة</span>
                    </div>
                  `).join('')}
                </div>
              </div>
              <div style="text-align: center; font-size: 11px; color: #A8A29E; border-top: 1px solid #E5E2D9; padding-top: 8px;">
                الصفحة [ ب ] • الفهرس العام
              </div>
            </div>
          </div>
        ` : ''}

        ${sortedChapters.map(ch => {
          const rawParas = extractCleanParagraphs(ch.content || '');
          const paras = rawParas.length > 0 ? rawParas : ['(لا يوجد محتوى في هذا الفصل)'];
          
          // Split paragraphs into chunks for pagination
          const pages: string[][] = [];
          let current: string[] = [];
          let curLen = 0;
          for (let p of paras) {
            const pLen = p.length;
            const limit = pages.length === 0 ? 1400 : 2000;
            if (current.length > 0 && (curLen + pLen > limit || current.length >= (pages.length === 0 ? 4 : 6))) {
              pages.push(current);
              current = [p];
              curLen = pLen;
            } else {
              current.push(p);
              curLen += pLen;
            }
          }
          if (current.length > 0) pages.push(current);

          return pages.map((pageParas, pIdx) => `
            <div class="book-page" style="background: #FFFFFF;">
              <div class="inner-page">
                <div>
                  <div style="display: flex; justify-content: space-between; font-size: 11px; color: #8C827A; border-bottom: 1px solid #E5E2D9; padding-bottom: 6px; margin-bottom: 20px;">
                    <span>رواية: ${novel.title} • الفصل ${ch.chapterNumber}${pIdx > 0 ? ` (تابع ${pIdx + 1})` : ''}</span>
                    <span>المؤلف: ${novel.author || 'أيمن كناني'}</span>
                  </div>

                  ${pIdx === 0 ? `
                    <div style="text-align: center; margin-bottom: 22px; padding-bottom: 14px; border-bottom: 1px dashed #E5E2D9;">
                      <span style="font-size: 12px; font-weight: bold; color: #4A5D4E; background: #FAF9F5; padding: 3px 14px; border-radius: 15px; border: 1px solid #E5E2D9;">
                        الفصل ${ch.chapterNumber}
                      </span>
                      <h2 style="font-size: 22px; font-weight: 800; margin: 10px 0 6px 0; font-family: 'Amiri', serif;">${ch.title}</h2>
                      <div style="font-size: 13px; color: #C88A3B;">✦ ❖ ✦</div>
                    </div>
                  ` : ''}

                  <div>
                    ${pageParas.map(p => `<p>${p}</p>`).join('')}
                  </div>

                  ${pIdx === pages.length - 1 && ch.authorNote ? `
                    <div style="margin-top: 20px; padding: 12px 16px; background: #FAF9F5; border-right: 3px solid #C88A3B; border-radius: 6px; font-size: 12px; line-height: 1.8; color: #555555;">
                      <strong style="color: #4A5D4E;">ملاحظة الكاتب:</strong> ${ch.authorNote}
                    </div>
                  ` : ''}
                </div>

                <div style="display: flex; justify-content: space-between; font-size: 11px; color: #A8A29E; border-top: 1px solid #E5E2D9; padding-top: 8px;">
                  <span>الفصل ${ch.chapterNumber}: ${ch.title}</span>
                  <span>الجزء الأدبي المعتمد</span>
                </div>
              </div>
            </div>
          `).join('');
        }).join('')}
      </body>
      </html>
    `;

    doc.open();
    doc.write(printHtml);
    doc.close();

    // Wait for fonts inside iframe to load then trigger print
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
    }, 1000);
  }
}

export const pdfExportService = new PdfExportService();
