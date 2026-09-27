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

  // 1. Replace <title>
  if (title) {
    html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  }

  // 2. Inject Meta Tags before </head>
  const headInjection = `
    ${metaTags}
    <script id="ssr-json-ld" type="application/ld+json">
      ${jsonLd}
    </script>
  `;
  html = html.replace('</head>', `${headInjection}\n</head>`);

  // 3. Inject Rendered React HTML inside <div id="root">
  html = html.replace('<div id="root"></div>', `<div id="root">${renderedHtml}</div>`);

  // 4. Inject Initial State Script before </body>
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
