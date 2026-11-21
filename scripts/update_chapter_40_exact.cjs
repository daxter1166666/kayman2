const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const newContent = `<p dir="RTL" style="direction:rtl;"><strong>الفصل 40: مقدمة الباب</strong></p>
<p dir="RTL" style="direction:rtl;">بعد أن استعرضت الأبواب الستة السابقة المبادئ النظرية للأمانة الفكرية، مدعومة بأمثلة تاريخية موزعة عبر الفصول، يخصص هذا الباب مساحة أوسع وأعمق لخمسة نماذج تراثية بارزة، كل منها يجسّد بشكل متكامل جانبًا محوريًا من منهج هذا الكتاب: ابن رشد ومنهجه في الجمع بين الحكمة والشريعة، الغزالي وتجربته في الشك المنهجي، ابن تيمية وأدب الرد على المخالف رغم شدة لهجته أحيانًا، الشاطبي ومقاصد الشريعة كأداة ضبط، وعلماء الحديث ومنهجهم الصارم في التثبت.</p>
<p dir="RTL" style="direction:rtl;">هذه ليست سِيَرًا تاريخية عامة، بل دراسات حالة منهجية: كيف طبّق كل عَلَم من هؤلاء، عمليًا وفي سياق زمانه، مبادئ قريبة جدًا مما ناقشه هذا الكتاب نظريًا.</p>`;

const plainText = newContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const words = plainText.split(/\s+/).filter(Boolean).length;
console.log('Chapter 40 Exact Word Count:', words);

// 1. Update publishedChapters.json
const pubPath = path.resolve(__dirname, '../src/data/publishedChapters.json');
const pubData = JSON.parse(fs.readFileSync(pubPath, 'utf8'));
const ch40Index = pubData.findIndex(c => c.chapterNumber === 40);
if (ch40Index !== -1) {
  pubData[ch40Index].content = newContent;
  pubData[ch40Index].wordCount = words;
  pubData[ch40Index].title = "الباب السابع: نماذج تطبيقية من التراث الإسلامي";
  fs.writeFileSync(pubPath, JSON.stringify(pubData, null, 2), 'utf8');
  console.log('✅ Updated src/data/publishedChapters.json');
}

// 2. Update src/data/chapters/chapter-40.json
const ch40JsonPath = path.resolve(__dirname, '../src/data/chapters/chapter-40.json');
if (fs.existsSync(ch40JsonPath)) {
  const jsonContent = JSON.parse(fs.readFileSync(ch40JsonPath, 'utf8'));
  jsonContent.content = newContent;
  jsonContent.wordCount = words;
  jsonContent.title = "الباب السابع: نماذج تطبيقية من التراث الإسلامي";
  fs.writeFileSync(ch40JsonPath, JSON.stringify(jsonContent, null, 2), 'utf8');
  console.log('✅ Updated src/data/chapters/chapter-40.json');
}

// 3. Update public/chapters/chapter-40.json
const pubStaticJsonPath = path.resolve(__dirname, '../public/chapters/chapter-40.json');
if (fs.existsSync(pubStaticJsonPath)) {
  const jsonContent = JSON.parse(fs.readFileSync(pubStaticJsonPath, 'utf8'));
  jsonContent.content = newContent;
  jsonContent.wordCount = words;
  jsonContent.title = "الباب السابع: نماذج تطبيقية من التراث الإسلامي";
  fs.writeFileSync(pubStaticJsonPath, JSON.stringify(jsonContent, null, 2), 'utf8');
  console.log('✅ Updated public/chapters/chapter-40.json');
}

// 4. Update src/data/chapters/chapter-40.md
const ch40MdPath = path.resolve(__dirname, '../src/data/chapters/chapter-40.md');
if (fs.existsSync(ch40MdPath)) {
  const mdText = `---
id: "ch-novel-1788556252989-1793537706860"
novelId: "novel-1788556252989"
chapterNumber: 40
title: "الباب السابع: نماذج تطبيقية من التراث الإسلامي"
slug: "الباب-السابع-نماذج-تطبيقية-من-التراث-الإسلامي"
partName: "الباب السابع: نماذج تطبيقية من التراث الإسلامي"
publishedAt: "2026-11-01T12:55:06.86+00:00"
wordCount: ${words}
status: "PUBLISHED"
---

${newContent}
`;
  fs.writeFileSync(ch40MdPath, mdText, 'utf8');
  console.log('✅ Updated src/data/chapters/chapter-40.md');
}

// 5. Sync to Supabase
async function syncToSupabase() {
  const client = createClient('https://ddotnksrmwpsfxmgduji.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkb3Rua3NybXdwc2Z4bWdkdWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4ODc0ODAsImV4cCI6MjEwNTQ2MzQ4MH0.AlKIT-493mepn41UF3JpocS5xgDLeqnafxEyLww31JE');
  const chapterRow = pubData[ch40Index];
  if (chapterRow) {
    const { error } = await client.from('chapters').upsert({
      id: chapterRow.id,
      novel_id: chapterRow.novelId,
      chapter_number: chapterRow.chapterNumber,
      title: chapterRow.title,
      slug: chapterRow.slug,
      content: chapterRow.content,
      author_note: chapterRow.authorNote || '',
      published_at: chapterRow.publishedAt,
      views: chapterRow.views || 0,
      likes: chapterRow.likes || 0,
      word_count: chapterRow.wordCount,
      status: chapterRow.status || 'PUBLISHED'
    });
    console.log('Supabase upsert result for Chapter 40:', error ? error : 'SUCCESS');
  }
}
syncToSupabase();
