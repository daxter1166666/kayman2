import { Category } from '../types';

/**
 * Maps English or mixed genre/category identifiers to clean, dignified Arabic names.
 */
export const GENRE_TRANSLATIONS: Record<string, string> = {
  // Common Fiction & Non-Fiction genres
  'fantasy': 'فانتازيا وخيال أسطوري',
  'fantasy & thought': 'فانتازيا وفكر',
  'sci-fi': 'خيال علمي وفضاء',
  'science fiction': 'خيال علمي',
  'mystery': 'غموض وتشويق',
  'mystery & thriller': 'غموض وتشويق',
  'thriller': 'تشويق وإثارة',
  'historical fiction': 'تاريخ وتراث',
  'history': 'تاريخ وحضارة',
  'historical': 'تاريخي وتراثي',
  'philosophy': 'فلسفة وفكر',
  'philosophy & thought': 'فلسفة وفكر',
  'thought': 'فكر ودراسات',
  'self-development': 'تطوير الذات والوعي',
  'self development': 'تطوير الذات',
  'novels & literature': 'روايات وأدب عالمي',
  'literature': 'أدب وروايات',
  'novels': 'روايات وقصص',
  'novel': 'رواية',
  'poetry': 'شعر ونصوص وجدانية',
  'poetry & prose': 'شعر ونصوص أدبية',
  'islamic': 'فكر إسلامي وأخلاق',
  'islamic thought': 'فكر إسلامي ومعاصر',
  'ethics': 'أخلاق وفكر',
  'morals': 'أخلاق وسلوك',
  'contemporary': 'معاصر وفكر حديث',
  'academic': 'دراسات وبحوث',
  'research': 'أبحاث ودراسات',
  'romance': 'روايات وجدانية',
  'drama': 'دراما اجتماعية',
  'adventure': 'مغامرات وأسفار',
  'horror': 'رعب وخوارق',
  'action': 'حركة وتشويق',
  'all': 'جميع المؤلفات',
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
