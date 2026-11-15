const { createClient } = require('@supabase/supabase-js');
const client = createClient('https://ddotnksrmwpsfxmgduji.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkb3Rua3NybXdwc2Z4bWdkdWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4ODc0ODAsImV4cCI6MjEwNTQ2MzQ4MH0.AlKIT-493mepn41UF3JpocS5xgDLeqnafxEyLww31JE');

async function run() {
  const { data, error } = await client.from('chapters').select('chapter_number, title, content').order('chapter_number', { ascending: true });
  if (error) {
    console.log('Error:', error);
  } else {
    data.forEach(c => {
      console.log(`Ch ${c.chapter_number}: ${c.title} (Length: ${c.content ? c.content.length : 0})`);
    });
  }
}
run();
