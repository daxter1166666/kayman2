import { Chapter, Novel } from '../types';
import bakedJson from './publishedChapters.json';

export const BAKED_CHAPTERS: Chapter[] = bakedJson as Chapter[];

export const BAKED_NOVELS: Novel[] = [
  {
    id: 'novel-1788556252989',
    title: 'أخلاق الباحث المسلم المعاصر',
    slug: 'أخلاق-الباحث-المسلم-المعاصر',
    author: 'أيمن كناني',
    authorBio: 'كاتب وباحث في الفكر الإسلامي والمنهجية العلمية المعاصرة',
    synopsis: 'دراسة منهجية وأخلاقية شاملة تؤصل لقواعد البحث والتفكير النقدي للباحث المسلم في العصر الرقمي، مع استعراض ضوابط التعامل مع النص الشرعي والمنهج العلمي.',
    coverImage: '/book-akhlaq-cover.svg',
    bannerImage: '/author-cover.jpg',
    genres: ['فكر إسلامي', 'منهجية البحث', 'فلسفة وأخلاق'],
    tags: ['أخلاق البحث', 'المنهج العلمي', 'الفكر المعاصر', 'أيمن كناني'],
    status: 'ONGOING',
    totalViews: 0,
    totalLikes: 0,
    rating: 5.0,
    ratingCount: 0,
    isFeatured: true,
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
];
