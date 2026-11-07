import React from 'react';
import { renderToString } from 'react-dom/server';
import type { Novel, Chapter, AuthorProfile, SiteBranding } from '../types';

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
    .replace(/<[^>]*>/g, ' ')
    .replace(/[#*_`~>\[\]()!-]/g, ' ')
    .replace(/&nbsp;/g, ' ')
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
  const isHtmlContent = chapter.content && /<[a-z][\s\S]*>/i.test(chapter.content);

  const prevUrl = prevChapter
    ? `/book/${novel.slug || novel.id}/chapter/${prevChapter.slug || prevChapter.chapterNumber}`
    : null;
  const nextUrl = nextChapter
    ? `/book/${novel.slug || novel.id}/chapter/${nextChapter.slug || nextChapter.chapterNumber}`
    : null;
  const novelUrl = `/book/${novel.slug || novel.id}`;

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
              <span>{(chapter.wordCount || 1000).toLocaleString()} كلمة</span>
            </div>
          </header>

          {/* Chapter Text Paragraphs */}
          {isHtmlContent ? (
            <div
              className="chapter-body space-y-6 text-[#2C2C2C] text-lg sm:text-xl leading-relaxed sm:leading-loose text-justify"
              dangerouslySetInnerHTML={{ __html: chapter.content }}
            />
          ) : (
            <div className="chapter-body space-y-6 text-[#2C2C2C] text-lg sm:text-xl leading-relaxed sm:leading-loose text-justify">
              {(chapter.content || '')
                .split(/\n\s*\n/)
                .map(p => p.trim())
                .filter(Boolean)
                .map((p, idx) => (
                  <p key={idx} className="tracking-wide">
                    {p}
                  </p>
                ))}
            </div>
          )}

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
              فهرس فصول الكتاب
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
            <a href="/" className="hover:underline text-[#C88A3B]">المنصة الرسمية لنشر المؤلفات والكتب الأدبية والفكرية</a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export interface HomeSSRProps {
  novel: Novel;
  chapters: Chapter[];
  authorProfile?: AuthorProfile;
  siteBranding?: SiteBranding;
  reqUrl: string;
}

/**
 * Server-Side Rendered Home Page Component
 * Renders complete HTML for crawlers, social bots, and instant visitor paint.
 */
export const ServerHomeView: React.FC<HomeSSRProps> = ({
  novel,
  chapters,
  authorProfile,
  siteBranding,
}) => {
  const authorName = authorProfile?.name || novel?.author || 'أيمن كناني';
  const authorTitle = authorProfile?.title || 'كاتب، باحث، ومؤلف';
  const authorVision = authorProfile?.vision || 'السعي نحو إثراء المشهد الثقافي والفكري العربي بمؤلفات تجمع بين عمق الفكرة ورشاقة الأسلوب وسهولة الوصول لكافة القراء.';
  const siteTitle = siteBranding?.siteName || 'أيمن كناني | Ayman Kinani';
  const novelUrl = novel ? `/book/${novel.slug || novel.id}` : '/';

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#2C2C2C] font-cairo antialiased flex flex-col" dir="rtl">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-30 bg-[#FDFCF8]/95 backdrop-blur-md border-b border-[#E5E2D9] px-4 py-3 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2 text-decoration-none">
              <span className="w-8 h-8 rounded-full bg-[#4A5D4E] text-white flex items-center justify-center font-bold text-sm">
                ك
              </span>
              <span className="font-bold text-base sm:text-lg text-[#2C2C2C]">
                {siteTitle}
              </span>
            </a>
          </div>

          <nav className="hidden md:flex items-center gap-5 text-xs font-bold text-[#6E6A64]">
            <a href="/" className="text-[#4A5D4E] hover:underline">الرئيسية</a>
            <a href={novelUrl} className="hover:text-[#2C2C2C]">كتاب أخلاق الباحث المسلم</a>
            <a href="#chapters" className="hover:text-[#2C2C2C]">فهرس الفصول ({chapters.length})</a>
            <a href="#about" className="hover:text-[#2C2C2C]">عن المؤلف</a>
          </nav>

          <div className="flex items-center gap-2">
            {chapters.length > 0 && (
              <a
                href={`/book/${novel.slug || novel.id}/chapter/${chapters[0].slug || chapters[0].chapterNumber}`}
                className="px-4 py-2 rounded-xl bg-[#4A5D4E] hover:bg-[#3C4C3F] text-white text-xs font-bold shadow-xs transition-all"
              >
                ابدأ القراءة
              </a>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="bg-gradient-to-b from-[#F4F1EA] to-[#FDFCF8] border-b border-[#E5E2D9] py-12 sm:py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4A5D4E]/10 text-[#4A5D4E] text-xs font-bold mb-4">
            <span>✨ المنصة الرسمية المعتمدة للمؤلفات والكتب</span>
          </div>

          <h1 className="font-amiri font-bold text-4xl sm:text-5xl md:text-6xl text-[#2C2C2C] mb-4 leading-tight">
            {authorName}
          </h1>

          <p className="text-base sm:text-lg text-[#6E6A64] font-medium max-w-2xl mx-auto mb-6">
            {authorTitle} — {authorVision}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-bold">
            <span className="px-3 py-1.5 rounded-lg bg-white border border-[#E5E2D9] text-[#2C2C2C] shadow-2xs">
              📚 مؤلفات فكرية ومنهجية
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-white border border-[#E5E2D9] text-[#2C2C2C] shadow-2xs">
              🔓 قراءة وتحميل مجاني ومفتوح
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-white border border-[#E5E2D9] text-[#2C2C2C] shadow-2xs">
              ⚖️ رخصة المشاع الإبداعي (CC BY-NC)
            </span>
          </div>
        </div>
      </section>

      {/* 3. Main Content Showcase */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14 space-y-12">
        {/* Featured Book */}
        {novel && (
          <section className="bg-white rounded-3xl border border-[#E5E2D9] p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {novel.coverImage && (
                <img
                  src={novel.coverImage}
                  alt={novel.title}
                  className="w-48 sm:w-56 h-72 sm:h-80 object-cover rounded-2xl shadow-md border border-[#E5E2D9] mx-auto md:mx-0 shrink-0"
                  loading="eager"
                />
              )}

              <div className="flex-1 text-center md:text-right">
                <div className="flex flex-wrap gap-1.5 justify-center md:justify-start mb-3">
                  {(novel.genres || []).map(g => (
                    <span key={g} className="px-2.5 py-0.5 rounded-full bg-[#4A5D4E]/10 text-[#4A5D4E] text-xs font-bold">
                      {g}
                    </span>
                  ))}
                  <span className="px-2.5 py-0.5 rounded-full bg-[#C88A3B]/10 text-[#C88A3B] text-xs font-bold">
                    تصنيف ديوي: 211.4 أخلاق البحث
                  </span>
                </div>

                <h2 className="font-amiri font-bold text-3xl sm:text-4xl text-[#2C2C2C] mb-3">
                  {novel.title}
                </h2>

                <p className="text-sm text-[#6E6A64] mb-4">
                  تأليف: <strong className="text-[#2C2C2C]">{novel.author}</strong> • يتضمن {chapters.length} فصلاً وباباً
                </p>

                <p className="text-sm leading-relaxed text-[#2C2C2C]/90 mb-6 whitespace-pre-wrap">
                  {novel.synopsis}
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  {chapters.length > 0 && (
                    <a
                      href={`/book/${novel.slug || novel.id}/chapter/${chapters[0].slug || chapters[0].chapterNumber}`}
                      className="px-6 py-3 rounded-xl bg-[#4A5D4E] hover:bg-[#3C4C3F] text-white font-bold text-sm shadow-sm transition-all"
                    >
                      ابدأ القراءة الآن ({chapters[0].title})
                    </a>
                  )}
                  <a
                    href={novelUrl}
                    className="px-5 py-3 rounded-xl border border-[#E5E2D9] bg-[#F7F5EE] hover:bg-[#ECE8DC] text-[#2C2C2C] font-bold text-sm transition-all"
                  >
                    تصفح تفاصيل وفهرس الكتاب
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Chapters Index Directory */}
        <section id="chapters" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-amiri font-bold text-2xl sm:text-3xl text-[#2C2C2C]">
                فهرس فصول الكتاب ({chapters.length} فصلاً)
              </h2>
              <p className="text-xs sm:text-sm text-[#6E6A64]">
                جميع الفصول منشورة ومتاحة للقراءة المباشرة مجاناً
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {chapters.map(ch => (
              <a
                key={ch.id}
                href={`/book/${novel.slug || novel.id}/chapter/${ch.slug || ch.chapterNumber}`}
                className="flex items-center justify-between p-4 rounded-2xl border border-[#E5E2D9] bg-white hover:bg-[#F7F5EE] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-[#4A5D4E]/10 text-[#4A5D4E] font-bold text-xs flex items-center justify-center shrink-0">
                    {ch.chapterNumber}
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-[#2C2C2C] group-hover:text-[#4A5D4E] transition-colors line-clamp-1">
                      {ch.title}
                    </h3>
                    <p className="text-[11px] text-[#6E6A64]">
                      {ch.wordCount ? `${ch.wordCount.toLocaleString()} كلمة` : 'فصل كامل'} • قراءة مباشرة
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#4A5D4E] shrink-0 group-hover:translate-x-1 transition-transform">
                  قراءة ←
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="bg-[#F4F1EA] rounded-3xl border border-[#E5E2D9] p-6 sm:p-8">
          <h2 className="font-amiri font-bold text-2xl text-[#2C2C2C] mb-3">
            حول الكاتب والمنصة الرسمية
          </h2>
          <p className="text-sm leading-relaxed text-[#2C2C2C]/90 mb-4">
            تهدف منصة الكاتب أيمن كناني إلى ترسيخ قيم التفكير المنهجي والنقدي وأخلاقيات البحث العلمي الرصين في الفكر الإسلامي والعربي المعاصر، مع إتاحة كافة الأعمال والمؤلفات لعموم الباحثين والقراء بصورة حرة ومفتوحة بدون قيود.
          </p>
          <div className="flex flex-wrap gap-4 text-xs font-bold text-[#4A5D4E]">
            <a href="https://t.me/aymankinani" target="_blank" rel="noopener noreferrer" className="hover:underline">
              📢 قناة التليجرام الرسمية
            </a>
            <span>•</span>
            <a href="https://web.facebook.com/profile.php?id=61590131123276" target="_blank" rel="noopener noreferrer" className="hover:underline">
              📘 صفحة الفيسبوك
            </a>
            <span>•</span>
            <a href="mailto:aymankinani.author@gmail.com" className="hover:underline">
              ✉️ التواصل المباشر
            </a>
          </div>
        </section>
      </main>

      {/* 4. Footer */}
      <footer className="mt-16 bg-[#1C1B19] text-[#A8A49E] text-xs font-cairo py-10 px-4 text-center border-t border-white/10">
        <div className="max-w-4xl mx-auto space-y-3">
          <p className="text-white font-bold text-sm">{siteTitle}</p>
          <p>جميع المؤلفات والأعمال مرخصة بموجب رخصة المشاع الإبداعي (CC BY-NC 4.0) © {new Date().getFullYear()}</p>
          <p className="text-white/60">
            صُمم وطُوّر وفق أعلى معايير الأداء وعمارة الخادم (Server-Side Rendering SSR).
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
 * Server-Side Rendered Novel/Book Detail Page
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
                  href={`/book/${novel.slug || novel.id}/chapter/${chapters[0].slug || chapters[0].chapterNumber}`}
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
            فصول الكتاب ({chapters.length} فصول)
          </h2>

          <div className="space-y-2">
            {chapters.map(ch => (
              <a
                key={ch.id}
                href={`/book/${novel.slug || novel.id}/chapter/${ch.slug || ch.chapterNumber}`}
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

export interface SectionSSRProps {
  section: 'about' | 'author' | 'articles' | 'support' | 'donate' | 'contact' | 'privacy' | 'terms' | 'dmca' | 'licenses' | 'books';
  novel?: Novel | null;
  chapters?: Chapter[];
  articles?: any[];
  reqUrl: string;
}

/**
 * Server-Side Rendered View for Specific Pages (About, Privacy, Terms, DMCA, Licenses, Contact, Support, Articles)
 */
export const ServerSectionView: React.FC<SectionSSRProps> = ({
  section,
  novel,
  chapters = [],
  articles = [],
  reqUrl,
}) => {
  const normSection = (section === 'author' ? 'about' : section === 'donate' ? 'support' : section);

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#2C2C2C] font-cairo antialiased flex flex-col" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#FDFCF8]/95 backdrop-blur-md border-b border-[#E5E2D9] px-4 py-3 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="/" className="text-xs font-bold text-[#4A5D4E] hover:underline">
            ← العودة للمكتبة الرئيسية
          </a>
          <nav className="flex items-center gap-3 text-xs font-bold">
            <a href="/books" className="text-[#6E6A64] hover:text-[#2C2C2C]">الكتب</a>
            <a href="/articles" className="text-[#6E6A64] hover:text-[#2C2C2C]">المقالات</a>
            <a href="/about" className="text-[#6E6A64] hover:text-[#2C2C2C]">عن الكاتب</a>
          </nav>
        </div>
      </header>

      {/* Main Content Body for Search Bots and Instant Paint */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav aria-label="مسار الصفحة" className="mb-6 text-xs text-[#6E6A64] flex items-center gap-2">
          <a href="/" className="hover:text-[#2C2C2C]">الرئيسية</a>
          <span>›</span>
          <span className="text-[#2C2C2C] font-bold">
            {normSection === 'about' && 'عن الكاتب والمنصة (من نحن)'}
            {normSection === 'privacy' && 'سياسة الخصوصية وملفات الكوكيز'}
            {normSection === 'terms' && 'الشروط والأحكام العامة'}
            {normSection === 'dmca' && 'حقوق الملكية الفكرية (DMCA)'}
            {normSection === 'licenses' && 'رخصة المشاع الإبداعي (CC BY-NC 4.0)'}
            {normSection === 'contact' && 'تواصل مع الكاتب والناشر'}
            {normSection === 'support' && 'دعم الكاتب ورعاية النشر الحر'}
            {normSection === 'articles' && 'المقالات والدراسات الفكرية والنقدية'}
            {normSection === 'books' && 'مكتبة الكتب والمؤلفات'}
          </span>
        </nav>

        {/* 1. ABOUT PAGE */}
        {normSection === 'about' && (
          <article className="space-y-6 bg-white border border-[#E5E2D9] p-6 sm:p-10 rounded-3xl shadow-xs">
            <div className="border-b border-[#E5E2D9] pb-4">
              <span className="text-xs uppercase font-bold text-[#4A5D4E]">السيرة الذاتية والرؤية الفكرية</span>
              <h1 className="text-3xl sm:text-4xl font-amiri font-bold text-[#2C2C2C] mt-2">
                عن الكاتب أيمن كناني والمنصة الرسمية (من نحن)
              </h1>
              <p className="text-xs sm:text-sm text-[#6E6A64] mt-1">Ayman Kinani — Official Literature Platform</p>
            </div>

            <p className="text-sm leading-relaxed text-[#2C2C2C]/90">
              أيمن كناني (Ayman Kinani) كاتب، باحث، ومؤلف عربي يركز في أطروحاته على ترسيخ قيم التفكير المنهجي والنقدي وأخلاقيات البحث العلمي الرصين في الفكر الإسلامي والعربي المعاصر، مع إتاحة كافة الأعمال والمؤلفات لعموم الباحثين والقراء بصورة حرة ومفتوحة بدون قيود بموجب رخصة المشاع الإبداعي (CC BY-NC 4.0).
            </p>

            <div className="bg-[#FAF8F2] p-6 rounded-2xl border border-[#E5DFD0] space-y-3">
              <h3 className="font-bold text-sm text-[#2C2C2C]">الرؤية والرسالة المعرفية:</h3>
              <p className="text-xs sm:text-sm text-[#6E6A64] leading-relaxed">
                السعي نحو إثراء المشهد الثقافي والفكري العربي بمؤلفات تجمع بين عمق الفكرة ورشاقة الأسلوب وتأصيل قواعد البحث النزيه المتجرد من الأهواء والعصبيات الفكرية.
              </p>
            </div>
          </article>
        )}

        {/* 2. PRIVACY POLICY */}
        {normSection === 'privacy' && (
          <article className="space-y-6 bg-white border border-[#E5E2D9] p-6 sm:p-10 rounded-3xl shadow-xs">
            <div className="border-b border-[#E5E2D9] pb-4">
              <span className="text-xs uppercase font-bold text-[#4A5D4E]">الخصوصية وأمان البيانات</span>
              <h1 className="text-2xl sm:text-3xl font-amiri font-bold text-[#2C2C2C] mt-1">
                سياسة الخصوصية وملفات تعريف الارتباط (Privacy Policy)
              </h1>
              <p className="text-xs text-[#6E6A64] mt-1">متوافقة مع Google AdSense و GDPR و CCPA</p>
            </div>

            <div className="space-y-4 text-sm text-[#2C2C2C] leading-relaxed">
              <p>
                نحن في منصة الكاتب أيمن كناني نلتزم التزاماً صارماً باحترام وحماية خصوصية جميع زوارنا وقرائنا. لا نطلب أي معلومات شخصية حساسة للوصول إلى قراءة الكتب والمقالات أو تحميل ملفات PDF.
              </p>
              <h3 className="font-bold text-base text-[#2C2C2C]">ملفات تعريف الارتباط وإعلانات الطرف الثالث:</h3>
              <p>
                قد تستخدم جهات خارجية مثل Google AdSense ملفات تعريف الارتباط (Cookies) لعرض إعلانات مخصصة للمستخدمين بناءً على زياراتهم السابقة لهذا الموقع أو لمواقع أخرى على شبكة الإنترنت. يمكن للمستخدمين تعطيل ملفات تعريف الارتباط المخصصة عبر إعدادات المتصفح أو زيارة صفحة إعدادات إعلانات Google.
              </p>
            </div>
          </article>
        )}

        {/* 3. TERMS OF SERVICE */}
        {normSection === 'terms' && (
          <article className="space-y-6 bg-white border border-[#E5E2D9] p-6 sm:p-10 rounded-3xl shadow-xs">
            <div className="border-b border-[#E5E2D9] pb-4">
              <span className="text-xs uppercase font-bold text-[#4A5D4E]">اتفاقية الاستخدام والناشر</span>
              <h1 className="text-2xl sm:text-3xl font-amiri font-bold text-[#2C2C2C] mt-1">
                الشروط والأحكام العامة للموقع
              </h1>
            </div>
            <p className="text-sm text-[#2C2C2C] leading-relaxed">
              باستخدامك لمنصة الكاتب أيمن كناني، فإنك توافق على الالتزام بشروط الاستخدام المعمول بها ورخصة المشاع الإبداعي (CC BY-NC 4.0) التي تحكم قراءة ومشاركة المحتوى للأغراض المعرفية وغير التجارية.
            </p>
          </article>
        )}

        {/* 4. DMCA */}
        {normSection === 'dmca' && (
          <article className="space-y-6 bg-white border border-[#E5E2D9] p-6 sm:p-10 rounded-3xl shadow-xs">
            <div className="border-b border-[#E5E2D9] pb-4">
              <span className="text-xs uppercase font-bold text-[#4A5D4E]">حماية الملكية الفكرية</span>
              <h1 className="text-2xl sm:text-3xl font-amiri font-bold text-[#2C2C2C] mt-1">
                حقوق الملكية الفكرية وقانون DMCA
              </h1>
            </div>
            <p className="text-sm text-[#2C2C2C] leading-relaxed">
              كافة النصوص والمؤلفات المنشورة هي أعمال أصلية للكاتب أيمن كناني. نرحب بالاقتباس والاستشهاد الأكاديمي والتعليمي مع وجوب عزو العمل لصاحبه الأصلي ورابط المنصة الرسمية.
            </p>
          </article>
        )}

        {/* 5. LICENSES */}
        {normSection === 'licenses' && (
          <article className="space-y-6 bg-white border border-[#E5E2D9] p-6 sm:p-10 rounded-3xl shadow-xs">
            <div className="border-b border-[#E5E2D9] pb-4">
              <span className="text-xs uppercase font-bold text-[#4A5D4E]">رخصة النشر والاستخدام</span>
              <h1 className="text-2xl sm:text-3xl font-amiri font-bold text-[#2C2C2C] mt-1">
                التراخيص ورخصة المشاع الإبداعي (CC BY-NC 4.0)
              </h1>
            </div>
            <p className="text-sm text-[#2C2C2C] leading-relaxed">
              هذا العمل مرخّص بموجب رخصة المشاع الإبداعي (نسب المصنف - غير تجاري 4.0 دولي) CC BY-NC 4.0. يُسمح بنسخ وتوزيع وتدريس العمل والاستشهاد به بحرية تامة للأغراض غير التجارية مع ذكر اسم المؤلف.
            </p>
          </article>
        )}

        {/* 6. CONTACT */}
        {normSection === 'contact' && (
          <article className="space-y-6 bg-white border border-[#E5E2D9] p-6 sm:p-10 rounded-3xl shadow-xs">
            <div className="border-b border-[#E5E2D9] pb-4">
              <span className="text-xs uppercase font-bold text-[#4A5D4E]">الناشر والتواصل المباشر</span>
              <h1 className="text-2xl sm:text-3xl font-amiri font-bold text-[#2C2C2C] mt-1">
                تواصل مع الكاتب أيمن كناني
              </h1>
            </div>
            <p className="text-sm text-[#2C2C2C] leading-relaxed">
              لأي استفسارات فكرية، مقترحات بحثية، أو استفسارات حول المؤلفات والتراخيص، يمكنكم مراسلة الكاتب والناشر مباشرة عبر البريد الإلكتروني أو قنوات التواصل الرسمية.
            </p>
          </article>
        )}

        {/* 7. SUPPORT */}
        {normSection === 'support' && (
          <article className="space-y-6 bg-white border border-[#E5E2D9] p-6 sm:p-10 rounded-3xl shadow-xs">
            <div className="border-b border-[#E5E2D9] pb-4">
              <span className="text-xs uppercase font-bold text-rose-700">دعم المحتوى الفكري الحر</span>
              <h1 className="text-2xl sm:text-3xl font-amiri font-bold text-[#2C2C2C] mt-1">
                دعم الكاتب والمنصة (Support Ayman Kinani)
              </h1>
            </div>
            <p className="text-sm text-[#2C2C2C] leading-relaxed">
              نحن نؤمن بأن المعرفة حق إنساني أصيل، لذا نتيح كافة أعمال الكاتب أيمن كناني للقراءة والتحميل مجاناً دون حواجز مادية. دعمكم المباشر يساعد على استمرار النشر والتفرغ التام للبحث والتأليف.
            </p>
          </article>
        )}

        {/* 8. ARTICLES */}
        {normSection === 'articles' && (
          <section className="space-y-6">
            <div className="border-b border-[#E5E2D9] pb-4">
              <h1 className="text-3xl font-amiri font-bold text-[#2C2C2C]">
                المقالات والدراسات الفكرية والنقدية
              </h1>
              <p className="text-xs sm:text-sm text-[#6E6A64] mt-1">
                مجموعة مقالات وأبحاث ودراسات نقدية بقلم الكاتب أيمن كناني
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {articles.map((art: any) => (
                <a
                  key={art.id}
                  href={`/article/${art.slug || art.id}`}
                  className="p-5 rounded-2xl border border-[#E5E2D9] bg-white hover:bg-[#F7F5EE] transition-all block space-y-2"
                >
                  <h3 className="font-bold text-base text-[#2C2C2C] hover:text-[#4A5D4E]">{art.title}</h3>
                  <p className="text-xs text-[#6E6A64] line-clamp-2">{art.synopsis || cleanExcerpt(art.content, 120)}</p>
                  <span className="text-xs font-bold text-[#4A5D4E] block pt-2">قراءة المقال ←</span>
                </a>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="mt-16 bg-[#1C1B19] text-[#A8A49E] text-xs font-cairo py-8 px-4 text-center border-t border-white/10">
        <p>جميع الحقوق محفوظة للمؤلف © {new Date().getFullYear()} - أيمن كناني</p>
      </footer>
    </div>
  );
};

export interface ArticleSSRProps {
  article: any;
  reqUrl: string;
}

/**
 * Server-Side Rendered View for Single Article (/article/:slug)
 */
export const ServerArticleView: React.FC<ArticleSSRProps> = ({ article }) => {
  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#2C2C2C] font-cairo antialiased flex flex-col" dir="rtl">
      <header className="sticky top-0 z-30 bg-[#FDFCF8]/95 backdrop-blur-md border-b border-[#E5E2D9] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="/articles" className="text-xs font-bold text-[#4A5D4E] hover:underline">
            ← العودة لجميع المقالات
          </a>
          <span className="text-xs font-bold text-[#2C2C2C] truncate max-w-xs">{article.title}</span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        <nav aria-label="مسار الصفحة" className="mb-6 text-xs text-[#6E6A64] flex items-center gap-2">
          <a href="/" className="hover:text-[#2C2C2C]">الرئيسية</a>
          <span>›</span>
          <a href="/articles" className="hover:text-[#2C2C2C]">المقالات</a>
          <span>›</span>
          <span className="text-[#2C2C2C] font-bold">{article.title}</span>
        </nav>

        <article className="font-amiri">
          <header className="text-center mb-8 pb-6 border-b border-[#E5E2D9]">
            <span className="inline-block px-3 py-1 rounded-full bg-[#4A5D4E]/10 text-[#4A5D4E] text-xs font-cairo font-bold mb-3">
              {article.category || 'دراسة فكرية'}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#2C2C2C] mb-4 leading-tight">
              {article.title}
            </h1>
            <p className="text-xs font-cairo text-[#6E6A64]">
              بقلم: <strong className="text-[#2C2C2C]">{article.author || 'أيمن كناني'}</strong>
            </p>
          </header>

          <div
            className="space-y-6 text-[#2C2C2C] text-lg leading-relaxed text-justify"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>
      </main>

      <footer className="mt-16 bg-[#1C1B19] text-[#A8A49E] text-xs font-cairo py-8 px-4 text-center border-t border-white/10">
        <p>جميع الحقوق محفوظة للمؤلف © {new Date().getFullYear()} - أيمن كناني</p>
      </footer>
    </div>
  );
};

/**
 * Builds dynamic SEO Tags for Single Article SSR
 */
export function generateArticleSeoTags({
  article,
  reqUrl,
  domain,
}: {
  article: any;
  reqUrl: string;
  domain: string;
}): {
  title: string;
  metaTags: string;
  jsonLd: string;
} {
  const pageTitle = article.seo?.metaTitle?.trim() || `${article.title} | الكاتب ${article.author || 'أيمن كناني'}`;
  const excerpt = article.seo?.metaDescription?.trim() || cleanExcerpt(article.synopsis || article.content, 180) || `قراءة ${article.title} بقلم ${article.author || 'أيمن كناني'}.`;
  const rawCanonical = article.seo?.canonicalUrl?.trim() || `${domain}${reqUrl}`;
  const canonicalUrl = rawCanonical.replace(/https?:\/\/(?:www\.)?aymankinani\.com/g, 'https://www.aymankinani.org');
  const coverImage = article.seo?.ogImage?.trim() || article.coverImage || 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&auto=format&fit=crop&q=80';
  const authorName = article.author || 'أيمن كناني';

  const metaTags = `
    <!-- Dynamic SSR Meta Tags for Article -->
    <meta name="description" content="${escapeHtml(excerpt)}" />
    <meta name="author" content="${escapeHtml(authorName)}" />
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />

    <!-- Open Graph -->
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapeHtml(pageTitle)}" />
    <meta property="og:description" content="${escapeHtml(excerpt)}" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:image" content="${escapeHtml(coverImage)}" />
    <meta property="og:site_name" content="أيمن كناني - المنصة الرسمية" />
    <meta property="og:locale" content="ar_AR" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(excerpt)}" />
    <meta name="twitter:image" content="${escapeHtml(coverImage)}" />
  `;

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${canonicalUrl}#article`,
    headline: article.title,
    description: excerpt,
    url: canonicalUrl,
    inLanguage: 'ar',
    datePublished: article.publishedAt || article.createdAt,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'المنصة الرسمية للكاتب أيمن كناني',
      url: domain,
    },
  });

  return { title: pageTitle, metaTags, jsonLd };
}

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
    : `${chapter.title} - كتاب ${novel.title} | ${novel.author || 'أيمن كناني'}`;
  const excerpt = chapter.seo?.metaDescription?.trim()
    || cleanExcerpt(chapter.content, 180)
    || `${chapter.title} من كتاب ${novel.title} بقلم ${novel.author}. قراءة مباشرة كاملة مجاناً.`;
  const rawCanonical = chapter.seo?.canonicalUrl?.trim() || `${domain}${reqUrl}`;
  const canonicalUrl = rawCanonical.replace(/https?:\/\/(?:www\.)?aymankinani\.com/g, 'https://www.aymankinani.org');
  const coverImage = chapter.seo?.ogImage?.trim()
    || novel.bannerImage
    || novel.coverImage
    || 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&auto=format&fit=crop&q=80';
  const isNoIndex = Boolean(chapter.seo?.noIndex || novel.seo?.noIndex);
  const keywordsStr = chapter.seo?.focusKeywords?.trim()
    ? chapter.seo.focusKeywords.trim()
    : [chapter.title, `كتاب ${novel.title}`, `فصل ${chapter.chapterNumber}`, novel.author || 'أيمن كناني', ...(novel.genres || [])].join(', ');

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
    <meta property="article:section" content="${escapeHtml(novel.genres?.[0] || 'كتب')}" />

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
            item: `${domain}/book/${novel.slug || novel.id}`,
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
          url: `${domain}/book/${novel.slug || novel.id}`,
          author: {
            '@type': 'Person',
            name: novel.author,
          },
        },
        headline: chapter.title,
        description: excerpt,
        articleSection: novel.genres?.[0] || 'كتب',
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
  const pageTitle = novel.seo?.metaTitle?.trim() || `كتاب ${novel.title} | بقلم ${novel.author || 'أيمن كناني'}`;
  const excerpt = novel.seo?.metaDescription?.trim() || cleanExcerpt(novel.synopsis, 180) || `كتاب ${novel.title} للمؤلف ${novel.author}. تصفح الفصول واقرأ مباشرة على المنصة الرسمية.`;
  const rawCanonical = novel.seo?.canonicalUrl?.trim() || `${domain}${reqUrl}`;
  const canonicalUrl = rawCanonical.replace(/https?:\/\/(?:www\.)?aymankinani\.com/g, 'https://www.aymankinani.org');
  const coverImage = novel.seo?.ogImage?.trim() || novel.coverImage || 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&auto=format&fit=crop&q=80';
  const authorName = novel.seo?.authorName?.trim() || novel.author || 'أيمن كناني';
  const robotsDirective = novel.seo?.noIndex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large';

  const keywordsList = [
    novel.seo?.focusKeywords,
    `كتاب ${novel.title}`,
    `تحميل كتاب ${novel.title} PDF`,
    `قراءة كتاب ${novel.title}`,
    'كتب عربية',
    'تحميل PDF',
    ...(novel.genres || []),
    ...(novel.tags || [])
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
    <meta property="og:site_name" content="أيمن كناني - المنصة الرسمية" />
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
 * Builds dynamic Open Graph, Twitter Card, and Schema.org JSON-LD tags for Home Page SSR
 */
export function generateHomeSeoTags({
  novel,
  chapters,
  domain,
}: {
  novel: Novel;
  chapters: Chapter[];
  domain: string;
}): {
  title: string;
  metaTags: string;
  jsonLd: string;
} {
  const pageTitle = 'أيمن كناني (Ayman Kinani) - المنصة الرسمية لنشر المؤلفات والكتب والروايات';
  const excerpt = 'المنصة الرسمية المعتمدة لنشر وقراءة وتحميل مؤلفات وكتب وروايات ومقالات الكاتب أيمن كناني مجاناً بصيغة PDF وقراءة تفاعلية مباشرة.';
  const canonicalUrl = `${domain}/`;
  const coverImage = novel?.coverImage || 'https://images.unsplash.com/photo-1507842229451-79b1be886a29?q=80&w=1600&auto=format&fit=crop';
  const authorName = 'أيمن كناني';

  const keywordsList = [
    'أيمن كناني',
    'Ayman Kinani',
    'أخلاق الباحث المسلم المعاصر',
    'روايات أيمن كناني',
    'كتب أيمن كناني',
    'تحميل كتب PDF',
    'قراءة روايات اونلاين',
    'فكر إسلامي',
    'منهجية البحث',
    'فلسفة وأخلاق',
    'قراءة مجانية'
  ].join(', ');

  const metaTags = `
    <!-- Dynamic SSR Meta Tags for Homepage -->
    <meta name="description" content="${escapeHtml(excerpt)}" />
    <meta name="author" content="${escapeHtml(authorName)}" />
    <meta name="keywords" content="${escapeHtml(keywordsList)}" />
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtml(pageTitle)}" />
    <meta property="og:description" content="${escapeHtml(excerpt)}" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:image" content="${escapeHtml(coverImage)}" />
    <meta property="og:site_name" content="أيمن كناني - المنصة الرسمية" />
    <meta property="og:locale" content="ar_AR" />

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
        '@type': 'WebSite',
        '@id': `${domain}/#website`,
        url: `${domain}/`,
        name: 'أيمن كناني | Ayman Kinani',
        description: excerpt,
        inLanguage: 'ar',
        publisher: {
          '@type': 'Person',
          name: authorName,
          url: `${domain}/`,
        },
      },
      {
        '@type': 'Person',
        '@id': `${domain}/#author`,
        name: authorName,
        alternateName: 'Ayman Kinani',
        url: `${domain}/`,
        jobTitle: 'كاتب، باحث، ومؤلف',
        description: 'مؤلف وباحث في الفكر الإسلامي والمنهجية العلمية المعاصرة.',
        sameAs: [
          'https://t.me/aymankinani',
          'https://web.facebook.com/profile.php?id=61590131123276',
        ],
      },
      ...(novel ? [{
        '@type': 'Book',
        '@id': `${domain}/book/${novel.slug || novel.id}#book`,
        name: novel.title,
        url: `${domain}/book/${novel.slug || novel.id}`,
        author: {
          '@type': 'Person',
          name: authorName,
        },
        description: novel.synopsis,
        image: coverImage,
        inLanguage: 'ar',
        numberOfPages: chapters.length,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: novel.rating || 5.0,
          ratingCount: novel.ratingCount || 1,
        }
      }] : []),
      {
        '@type': 'CollectionPage',
        '@id': `${domain}/#chapters`,
        name: `فهرس فصول ${novel?.title || 'المؤلفات'}`,
        url: `${domain}/#chapters`,
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: chapters.length,
          itemListElement: chapters.map((ch, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: ch.title,
            url: `${domain}/book/${novel?.slug || novel?.id || 'novel'}/chapter/${ch.slug || ch.chapterNumber}`,
          })),
        },
      },
    ],
  });

  return { title: pageTitle, metaTags, jsonLd };
}

/**
 * Builds dynamic Open Graph, Twitter Card, and Schema.org JSON-LD tags for Static / Section Pages
 */
export function generateSectionSeoTags({
  section,
  domain,
  reqUrl,
}: {
  section: 'about' | 'author' | 'articles' | 'support' | 'donate' | 'contact' | 'privacy' | 'terms' | 'dmca' | 'books';
  domain: string;
  reqUrl: string;
}): {
  title: string;
  metaTags: string;
  jsonLd: string;
} {
  const authorName = 'أيمن كناني';
  const coverImage = 'https://images.unsplash.com/photo-1507842229451-79b1be886a29?q=80&w=1600&auto=format&fit=crop';
  const canonicalUrl = `${domain}${reqUrl.split('?')[0]}`;

  let pageTitle = 'أيمن كناني (Ayman Kinani) - المنصة الرسمية لنشر المؤلفات والكتب';
  let excerpt = 'المنصة الرسمية المعتمدة لنشر وقراءة مؤلفات وأبحاث الكاتب أيمن كناني مجاناً.';
  let keywords = 'أيمن كناني, Ayman Kinani, كتب, أبحاث, فكر إسلامي';
  let schemaType = 'WebPage';

  switch (section) {
    case 'about':
    case 'author':
      pageTitle = 'عن الكاتب أيمن كناني (Ayman Kinani) - السيرة الذاتية والمؤلفات الفكرية';
      excerpt = 'تعرف على الكاتب والباحث أيمن كناني، سيرته الفكرية، مؤلفاته في الفلسفة والفكر الإسلامي والمنهجية العلمية المعاصرة، ورؤيته الثقافية والأدبية.';
      keywords = 'أيمن كناني, سيرة أيمن كناني, Ayman Kinani, باحث فكري, كاتب عربي, مؤلفات أيمن كناني, من هو أيمن كناني';
      schemaType = 'ProfilePage';
      break;

    case 'articles':
      pageTitle = 'المقالات والدراسات الفكرية والنقدية | الكاتب أيمن كناني';
      excerpt = 'مجموعة المقالات والدراسات النقدية والفكرية المعاصرة بقلم الكاتب والباحث أيمن كناني، تناقش قضايا المنهج والمعرفة والفلسفة.';
      keywords = 'مقالات أيمن كناني, دراسات فكرية, نقد منهجي, مقالات فلسفية, فكر معاصر, أيمن كناني';
      schemaType = 'CollectionPage';
      break;

    case 'support':
    case 'donate':
      pageTitle = 'دعم الكاتب والمنصة (Support Ayman Kinani) | استمرار النشر المجاني';
      excerpt = 'ساهم في رعاية واستمرار منصة الكاتب أيمن كناني لنشر المؤلفات والكتب والأبحاث الرصينة مجاناً لجميع القراء والباحثين بدون قيود.';
      keywords = 'دعم أيمن كناني, رعاية المحتوى الفكري, Support Ayman Kinani, تبرع للمنصة, النشر الحر';
      break;

    case 'contact':
      pageTitle = 'تواصل مع الكاتب أيمن كناني | المنصة الرسمية والمراسلة المباشرة';
      excerpt = 'صفحة التواصل والمراسلة المباشرة مع الكاتب والباحث أيمن كناني للاستفسارات الفكرية، التعاون البحثي، والملاحظات المنهجية.';
      keywords = 'تواصل مع أيمن كناني, مراسلة الكاتب, إيميل أيمن كناني, تليجرام أيمن كناني, قنوات التواصل';
      schemaType = 'ContactPage';
      break;

    case 'privacy':
      pageTitle = 'سياسة الخصوصية وحماية البيانات | منصة الكاتب أيمن كناني';
      excerpt = 'سياسة الخصوصية المعتمدة في منصة الكاتب أيمن كناني؛ التزام تام بحماية بيانات القراء وعدم جمع أي معلومات شخصية دون موافقة.';
      keywords = 'سياسة الخصوصية, حماية البيانات, Privacy Policy, خصوصية القارئ, منصة أيمن كناني';
      break;

    case 'terms':
      pageTitle = 'شروط الاستخدام ورخصة المشاع الإبداعي (CC BY-NC 4.0) | منصة أيمن كناني';
      excerpt = 'شروط استخدام منصة أيمن كناني وتفاصيل رخصة المشاع الإبداعي (CC BY-NC 4.0) التي تتيح القراءة والمشاركة غير التجارية بحرية.';
      keywords = 'شروط الاستخدام, رخصة المشاع الإبداعي, CC BY-NC 4.0, شروط النشر, حقوق القراءة';
      break;

    case 'dmca':
      pageTitle = 'حقوق الملكية الفكرية والنشر (DMCA) | المنصة الرسمية لأيمن كناني';
      excerpt = 'سياسة حقوق الملكية الفكرية وحماية حقوق النشر والتأليف (DMCA) الخاصة بكتب ومؤلفات الكاتب أيمن كناني.';
      keywords = 'حقوق الملكية الفكرية, DMCA, حماية حق المؤلف, الملكية الأدبية, أيمن كناني';
      break;

    case 'books':
      pageTitle = 'مكتبة مؤلفات وكتب الكاتب أيمن كناني (Ayman Kinani)';
      excerpt = 'تصفح كافة مؤلفات وكتب وروايات الكاتب أيمن كناني؛ قراءة تفاعلية مباشرة وتحميل نسخ PDF عالية الجودة مجاناً.';
      keywords = 'كتب أيمن كناني, مؤلفات أيمن كناني, تحميل كتب PDF, قراءة كتب أونلاين, مكتبة أيمن كناني';
      schemaType = 'CollectionPage';
      break;
  }

  const metaTags = `
    <!-- Dynamic SSR Meta Tags for Section: ${section} -->
    <meta name="description" content="${escapeHtml(excerpt)}" />
    <meta name="author" content="${escapeHtml(authorName)}" />
    <meta name="keywords" content="${escapeHtml(keywords)}" />
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtml(pageTitle)}" />
    <meta property="og:description" content="${escapeHtml(excerpt)}" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:image" content="${escapeHtml(coverImage)}" />
    <meta property="og:site_name" content="أيمن كناني - المنصة الرسمية" />
    <meta property="og:locale" content="ar_AR" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(excerpt)}" />
    <meta name="twitter:image" content="${escapeHtml(coverImage)}" />
  `;

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': schemaType,
    '@id': `${canonicalUrl}#${section}`,
    name: pageTitle,
    headline: pageTitle,
    description: excerpt,
    url: canonicalUrl,
    inLanguage: 'ar',
    mainEntityOfPage: canonicalUrl,
    publisher: {
      '@type': 'Person',
      name: authorName,
      url: domain,
    },
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

  // 1. Remove old static SEO tags from index.html template
  html = html
    .replace(/<meta\s+name=["']description["'][^>]*>/gi, '')
    .replace(/<meta\s+name=["']keywords["'][^>]*>/gi, '')
    .replace(/<meta\s+name=["']author["'][^>]*>/gi, '')
    .replace(/<meta\s+name=["']robots["'][^>]*>/gi, '')
    .replace(/<link\s+rel=["']canonical["'][^>]*>/gi, '')
    .replace(/<meta\s+property=["']og:[^"']+["'][^>]*>/gi, '')
    .replace(/<meta\s+name=["']twitter:[^"']+["'][^>]*>/gi, '')
    .replace(/<meta\s+property=["']article:[^"']+["'][^>]*>/gi, '')
    .replace(/<meta\s+property=["']book:[^"']+["'][^>]*>/gi, '')
    .replace(/<script\s+id=["']seo-json-ld["'][^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<script\s+id=["']ssr-json-ld["'][^>]*>[\s\S]*?<\/script>/gi, '');

  // 2. Replace <title>
  if (title) {
    html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  }

  // 3. Inject pristine, unique SEO Meta Tags and JSON-LD before </head>
  const headInjection = `
    ${metaTags.trim()}
    <script id="ssr-json-ld" type="application/ld+json">
      ${jsonLd}
    </script>
  `;
  html = html.replace('</head>', `${headInjection}\n</head>`);

  // 4. Inject Rendered React HTML inside <div id="root">
  html = html.replace('<div id="root"></div>', `<div id="root">${renderedHtml}</div>`);

  // 5. Inject Initial State Script before </body>
  const serializedState = JSON.stringify(initialData).replace(/</g, '\\u003c');
  const stateScript = `<script id="__INITIAL_DATA__">window.__INITIAL_DATA__ = ${serializedState};</script>`;
  html = html.replace('</body>', `${stateScript}\n</body>`);

  return html;
}

/**
 * Generates llms.txt standard file (Markdown index for AI tools, LLMs, and crawlers)
 */
export function generateLlmsTxt({
  novel,
  chapters,
  domain,
}: {
  novel: Novel;
  chapters: Chapter[];
  domain: string;
}): string {
  const authorName = novel?.author || 'أيمن كناني';
  const bookTitle = novel?.title || 'أخلاق الباحث المسلم المعاصر';
  const synopsis = novel?.synopsis || 'دراسة منهجية وأخلاقية شاملة تؤصل لقواعد البحث والتفكير النقدي في الفكر الإسلامي والمنهج العلمي المعاصر.';

  const lines = [
    `# ${bookTitle}`,
    `> بقلم: ${authorName} | المنصة الرسمية المعتمدة لنشر المؤلفات والكتب`,
    ``,
    `## نبذة عن الكتاب`,
    synopsis,
    ``,
    `## معلومات الإصدار والتصنيف`,
    `- **المؤلف:** ${authorName} (Ayman Kinani)`,
    `- **التصنيف:** فكر إسلامي، منهجية البحث، فلسفة وأخلاق المعرفة`,
    `- **تصنيف ديوي العشري:** 211.4 (أخلاق البحث والتفكير)`,
    `- **إجمالي الفصول المنشورة:** ${chapters.length} فصلاً وباباً`,
    `- **الرخصة:** مشاع إبداعي (CC BY-NC 4.0) - قراءة وتحميل مجاني بدون قيود`,
    `- **الرابط الرئيسي:** ${domain}/book/${novel?.slug || 'أخلاق-الباحث-المسلم-المعاصر'}`,
    `- **ملف الكتاب الكامل لـ LLMs:** ${domain}/llms-full.txt`,
    `- **خلاصة RSS:** ${domain}/rss.xml`,
    `- **خريطة الموقع Sitemap:** ${domain}/sitemap.xml`,
    ``,
    `## فهرس الفصول ومحتوياتها (مع الروابط المباشرة)`,
    ``,
  ];

  chapters.forEach((ch, idx) => {
    const chUrl = `${domain}/book/${novel?.slug || 'أخلاق-الباحث-المسلم-المعاصر'}/chapter/${ch.slug || ch.chapterNumber}`;
    const wordInfo = ch.wordCount ? `(${ch.wordCount.toLocaleString()} كلمة)` : '';
    lines.push(`${idx + 1}. [${ch.title}](${chUrl}) ${wordInfo}`);
  });

  lines.push(
    ``,
    `---`,
    `تم إنتاج هذا الملف طبقاً لمعيار llms.txt لتمكين محركات الذكاء الاصطناعي (ChatGPT, Claude, Perplexity, Gemini) من فهرسة وقراءة الكتاب بالكامل بدقة متناهية.`
  );

  return lines.join('\n');
}

/**
 * Generates llms-full.txt containing the entire book with all 24 chapters in pristine Markdown
 */
export function generateLlmsFullTxt({
  novel,
  chapters,
  domain,
}: {
  novel: Novel;
  chapters: Chapter[];
  domain: string;
}): string {
  const authorName = novel?.author || 'أيمن كناني';
  const bookTitle = novel?.title || 'أخلاق الباحث المسلم المعاصر';

  const sections: string[] = [
    `# كتاب: ${bookTitle}`,
    `## تأليف: ${authorName}`,
    `> المنصة الرسمية: ${domain}/`,
    `> الترخيص: رخصة المشاع الإبداعي (CC BY-NC 4.0) - متاح للجميع مجاناً`,
    ``,
    `---`,
    `### مقدمة وتعريف بالكتاب`,
    novel?.synopsis || '',
    `---`,
    ``,
  ];

  chapters.forEach((ch) => {
    const rawContent = (ch.content || '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .trim();

    sections.push(
      `# ${ch.title}`,
      `**الرابط:** ${domain}/book/${novel?.slug || 'novel'}/chapter/${ch.slug || ch.chapterNumber}`,
      `**عدد الكلمات:** ${(ch.wordCount || 1000).toLocaleString()}`,
      ``,
      rawContent,
      ``,
      ch.authorNote ? `> 📝 ملاحظة الكاتب: ${ch.authorNote}\n` : '',
      `---`,
      ``
    );
  });

  return sections.join('\n');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
