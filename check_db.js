const fs = require('fs');
const content = fs.readFileSync('src/server/supabaseServer.ts', 'utf8');
const urlMatch = content.match(/DEFAULT_SUPABASE_URL = '(.*?)'/);
const keyMatch = content.match(/DEFAULT_SUPABASE_KEY =\s*'([^']+)'/);

if (urlMatch && keyMatch) {
  const { createClient } = require('@supabase/supabase-js');
  const sb = createClient(urlMatch[1], keyMatch[1]);
  sb.from('chapters').select('id, chapter_number, title, created_at').order('chapter_number', { ascending: true }).then(res => {
    if (res.error) {
      console.log('DB error:', res.error);
    } else {
      console.log('DB chapters count:', res.data.length);
      res.data.filter(c => c.chapter_number >= 30).forEach(c => console.log(c.chapter_number, c.title));
    }
    process.exit(0);
  });
} else {
  console.log('Could not parse URL or key');
  process.exit(1);
}
