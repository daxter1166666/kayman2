const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const url = 'https://ddotnksrmwpsfxmgduji.supabase.co';
const serverContent = fs.readFileSync('src/server/supabaseServer.ts', 'utf8');
const keyMatch = serverContent.match(/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/);
const client = createClient(url, keyMatch[0]);

(async () => {
  const published = JSON.parse(fs.readFileSync('src/data/publishedChapters.json', 'utf8'));
  const ch36 = published.find(c => c.chapterNumber === 36);
  if (!ch36) {
    console.log('Chapter 36 not found in publishedChapters.json');
    return;
  }

  // 1. Upsert to chapters table
  const { error } = await client.from('chapters').upsert({
    id: ch36.id,
    novel_id: ch36.novelId,
    chapter_number: ch36.chapterNumber,
    title: ch36.title,
    slug: ch36.slug,
    content: ch36.content,
    author_note: ch36.authorNote || '',
    published_at: ch36.publishedAt,
    views: ch36.views || 0,
    likes: ch36.likes || 0,
    word_count: ch36.wordCount || 250,
    status: ch36.status || 'PUBLISHED',
  });
  if (error) {
    console.error('Error upserting chapter 36 to Supabase:', error);
  } else {
    console.log('Successfully upserted Chapter 36 to Supabase chapters table!');
  }

  // 2. Also update published_chapters_store in site_settings
  const { data: storeRow } = await client.from('site_settings').select('data').eq('id', 'published_chapters_store').maybeSingle();
  const storeMap = storeRow?.data && typeof storeRow.data === 'object' ? storeRow.data : {};
  storeMap[ch36.id] = ch36;
  
  await client.from('site_settings').upsert({
    id: 'published_chapters_store',
    data: storeMap,
    updated_at: new Date().toISOString(),
  });
  console.log('Successfully updated published_chapters_store in site_settings!');
})();
