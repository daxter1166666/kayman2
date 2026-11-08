import fs from 'fs';
import path from 'path';

const publishedPath = path.resolve(process.cwd(), 'src/data/publishedChapters.json');
const chapters = JSON.parse(fs.readFileSync(publishedPath, 'utf8'));

const srcChaptersDir = path.resolve(process.cwd(), 'src/data/chapters');
const publicChaptersDir = path.resolve(process.cwd(), 'public/chapters');

if (!fs.existsSync(srcChaptersDir)) fs.mkdirSync(srcChaptersDir, { recursive: true });
if (!fs.existsSync(publicChaptersDir)) fs.mkdirSync(publicChaptersDir, { recursive: true });

chapters.forEach(c => {
  const num = c.chapterNumber;
  
  // 1. Write individual JSON file in src/data/chapters/
  const jsonPath = path.join(srcChaptersDir, `chapter-${num}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(c, null, 2), 'utf8');

  // 2. Write individual JSON file in public/chapters/
  const publicJsonPath = path.join(publicChaptersDir, `chapter-${num}.json`);
  fs.writeFileSync(publicJsonPath, JSON.stringify(c, null, 2), 'utf8');

  // 3. Write individual Markdown file in src/data/chapters/
  const mdContent = `---
id: "${c.id}"
novelId: "${c.novelId}"
chapterNumber: ${num}
title: "${c.title}"
slug: "${c.slug}"
partName: "${c.partName || ''}"
publishedAt: "${c.publishedAt || ''}"
wordCount: ${c.wordCount || 0}
---

# ${c.title}

${c.content}
`;
  const mdPath = path.join(srcChaptersDir, `chapter-${num}.md`);
  fs.writeFileSync(mdPath, mdContent, 'utf8');
});

// Generate index.ts in src/data/chapters/
const imports = [];
const exportsList = [];
chapters.forEach(c => {
  const num = c.chapterNumber;
  imports.push(`import ch${num} from './chapter-${num}.json';`);
  exportsList.push(`ch${num}`);
});

const indexContent = `import { Chapter } from '../../types';
${imports.join('\n')}

export const ALL_INDIVIDUAL_PHYSICAL_CHAPTERS: Chapter[] = [
  ${exportsList.join(',\n  ')}
] as Chapter[];
`;

fs.writeFileSync(path.join(srcChaptersDir, 'index.ts'), indexContent, 'utf8');

console.log('Successfully created 40 physical JSON files, 40 physical MD files, and index.ts in src/data/chapters/ and public/chapters/');
