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
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1507842229451-79b1be886a29?w=1600&auto=format&fit=crop&q=80',
    genres: ['فكر إسلامي', 'منهجية البحث', 'فلسفة وأخلاق'],
    tags: ['أخلاق البحث', 'المنهج العلمي', 'الفكر المعاصر', 'أيمن كناني'],
    status: 'ONGOING',
    totalViews: 1250,
    totalLikes: 340,
    rating: 5.0,
    ratingCount: 85,
    isFeatured: true,
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
];
