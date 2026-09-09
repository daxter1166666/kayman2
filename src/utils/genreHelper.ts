import { Category } from '../types';

/**
 * Maps English or mixed genre/category identifiers to clean, dignified Arabic names.
 */
export const GENRE_TRANSLATIONS: Record<string, string> = {
  // Arabic book categories & thought
  'ethics': 'أخلاق وقيم',
  'morals': 'أخلاق وقيم',
  'islamic': 'فكر إسلامي ومعاصر',
  'islamic thought': 'فكر إسلامي ومعاصر',
  'research': 'منهجية البحث العلمي',
  'research methodology': 'منهجية البحث العلمي',
  'methodology': 'منهجية البحث العلمي',
  'academic': 'دراسات وبحوث',
  'studies': 'دراسات وبحوث',
  'thought': 'فكر وفلسفة',
  'philosophy': 'فكر وفلسفة',
  'philosophy & thought': 'فكر وفلسفة',
  'self-development': 'تطوير الذات والوعي',
  'self development': 'تطوير الذات والوعي',
  'novels & literature': 'روايات وأدب',
  'novels': 'روايات وأدب',
  'novel': 'روايات وأدب',
  'literature': 'روايات وأدب',
  'history': 'تاريخ وتراث',
  'historical': 'تاريخ وتراث',
  'historical fiction': 'تاريخ وتراث',
  'poetry': 'شعر ونصوص وجدانية',
  'poetry & prose': 'شعر ونصوص وجدانية',
  'fantasy': 'أخلاق وقيم',
  'fantasy & thought': 'فكر إسلامي ومعاصر',
  'sci-fi': 'خيال علمي وفضاء',
  'science fiction': 'خيال علمي وفضاء',
  'mystery': 'غموض وتشويق',
  'mystery & thriller': 'غموض وتشويق',
  'thriller': 'تشويق وإثارة',
  'contemporary': 'فكر معاصر',
  'all': 'جميع المؤلفات والكتب',
};

/**
 * Converts any genre string (English, code, ID, or Arabic) into its canonical Arabic display name.
 */
export function toArabicGenre(genre: string, categories?: Category[]): string {
  if (!genre) return '';
  const trimmed = genre.trim();

  // If already contains Arabic characters, keep it!
  const hasArabic = /[\u0600-\u06FF]/.test(trimmed);
  if (hasArabic) {
    return trimmed;
  }

  // Check matching Category array if provided
  if (categories && categories.length > 0) {
    const found = categories.find(
      c =>
        c.name.toLowerCase() === trimmed.toLowerCase() ||
        c.id.toLowerCase() === trimmed.toLowerCase() ||
        c.arabicName.toLowerCase() === trimmed.toLowerCase()
    );
    if (found?.arabicName) {
      return found.arabicName;
    }
  }

  // Check translation dictionary (case-insensitive)
  const lower = trimmed.toLowerCase();
  if (GENRE_TRANSLATIONS[lower]) {
    return GENRE_TRANSLATIONS[lower];
  }

  // Look for partial matches in dictionary
  for (const [enKey, arVal] of Object.entries(GENRE_TRANSLATIONS)) {
    if (lower.includes(enKey) || enKey.includes(lower)) {
      return arVal;
    }
  }

  // Default fallback if no match found
  return trimmed;
}

/**
 * Translates an array of genres to Arabic
 */
export function toArabicGenres(genres: string[] = [], categories?: Category[]): string[] {
  if (!Array.isArray(genres)) return [];
  const translated = genres.map(g => toArabicGenre(g, categories));
  // Remove duplicates
  return Array.from(new Set(translated));
}
