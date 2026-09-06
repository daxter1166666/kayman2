export type NovelStatus = 'ONGOING' | 'COMPLETED' | 'HIATUS';
export type ChapterStatus = 'PUBLISHED' | 'DRAFT' | 'SCHEDULED';
export type Genre = string;

export interface Category {
  id: string;
  name: string;
  arabicName: string;
  description?: string;
  icon?: string;
}

export interface AuthorSocialLinks {
  twitter?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  telegram?: string;
  linkedin?: string;
  tiktok?: string;
  goodreads?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
}

export interface AuthorProfile {
  name: string;
  englishName: string;
  title: string;
  avatar: string;
  coverImage?: string;
  shortBio: string;
  fullBio: string;
  location: string;
  vision?: string;
  socialLinks: AuthorSocialLinks;
  contactEmail: string;
}

export interface SiteBranding {
  siteName: string;
  siteSubtitle: string;
  logoUrl: string;
  faviconUrl: string;
  pwaIconUrl?: string;
  footerText: string;
}

export interface SeoSettings {
  siteTitleTemplate: string;
  defaultTitle: string;
  defaultDescription: string;
  keywords: string;
  canonicalBaseUrl: string;
  authorName: string;
  twitterHandle: string;
  googleVerificationCode: string;
  bingVerificationCode: string;
  ogDefaultImage: string;
  enableStructuredData: boolean;
  indexingPolicy: 'all' | 'noindex';
  googleAnalyticsId?: string; // معرف Google Analytics 4 (مثال: G-XXXXXXXXXX)
}

export interface DonationSettings {
  enabled: boolean;
  title: string;
  description: string;
  paypalEmailOrLink: string;
  buyMeACoffeeUrl: string;
  patreonUrl: string;
  kofiUrl: string;
  bankAccountDetails: string;
  cryptoWallet: string;
  customPaymentLink: string;
  customPaymentTitle: string;
}

export interface SupabaseConfig {
  enabled: boolean;
  url: string;
  anonKey: string;
  lastSyncTime?: string;
  autoSync: boolean;
  connected?: boolean;
}

export interface LegalDocuments {
  termsOfService: string;
  privacyPolicy: string;
  dmcaPolicy: string;
  licensesPolicy?: string;
  publisherInfo: string;
  contactEmail: string;
  supportEmail: string;
  lastUpdated: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface NovelSeoMeta {
  metaTitle?: string; // عنوان مخصص للظهور في نتائج بحث Google (SEO Meta Title)
  metaDescription?: string; // وصف تعريفي مخصص للرواية في Google (140-160 حرف)
  focusKeywords?: string; // الكلمات المفتاحية المستهدفة الخاصة بالرواية (مفصولة بفواصل)
  canonicalUrl?: string; // الرابط الأساسي المخصص (Canonical URL)
  ogImage?: string; // صورة مخصصة للمشاركة في شبكات التواصل (WhatsApp, X, Facebook)
  noIndex?: boolean; // خيار استبعاد الرواية من الفهرسة في محركات البحث
  authorName?: string; // اسم المؤلف المخصص لوسوم الميتا
}

export interface Novel {
  id: string;
  title: string;
  slug: string;
  author: string;
  authorBio: string;
  synopsis: string;
  coverImage: string;
  bannerImage: string;
  genres: Genre[];
  tags: string[];
  status: NovelStatus;
  totalViews: number;
  totalLikes: number;
  rating: number; // 1-5
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
  isFeatured?: boolean;
  pdfDownloadUrl?: string; // Direct PDF link or Drive/Cloud download URL
  pdfFileSize?: string; // e.g. "12.4 MB"
  downloadButtonText?: string; // e.g. "تحميل الكتاب PDF" or custom text
  tableOfContents?: TableOfContentItem[]; // Manual Table of Contents / فهرس محتويات الكتاب
  seo?: NovelSeoMeta; // إعدادات السيو المخصصة للرواية
}

export interface TableOfContentItem {
  id: string;
  title: string;
  pageNumber?: string;
  description?: string;
  linkUrl?: string;
}

export interface ChapterSeoMeta {
  metaTitle?: string; // عنوان مخصص للظهور في نتائج بحث Google (SEO Meta Title للفصل)
  metaDescription?: string; // وصف تعريفي مخصص للفصل وأحداثه البارزة في Google (140-160 حرف)
  focusKeywords?: string; // كلمات مفتاحية خاصة بأحداث الفصل وشخصياته
  canonicalUrl?: string; // رابط أساسي مخصص
  ogImage?: string; // صورة مشاركة مخصصة لهذا الفصل
  noIndex?: boolean; // استبعاد هذا الفصل تحديداً من محركات البحث
}

export interface Chapter {
  id: string;
  novelId: string;
  chapterNumber: number;
  title: string;
  slug: string;
  content: string;
  authorNote?: string;
  publishedAt: string;
  views: number;
  likes: number;
  rating?: number; // معدل تقييم الفصل (1-5 نجوم)
  ratingCount?: number; // إجمالي عدد تقييمات هذا الفصل
  wordCount: number;
  status: ChapterStatus;
  seo?: ChapterSeoMeta; // إعدادات وسوم السيو المخصصة لهذا الفصل
}

export interface Comment {
  id: string;
  chapterId: string;
  novelId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  likes: number;
  userLiked?: boolean;
  isAuthor?: boolean;
  isPinned?: boolean;
  parentId?: string; // for nested replies
}

export type ReaderFontFamily = 'amiri' | 'cairo' | 'tajawal' | 'scheherazade' | 'readex' | 'lora' | 'jakarta';
export type ReaderTheme = 'paper' | 'sepia' | 'slate' | 'obsidian' | 'emerald';
export type ReaderWidth = 'narrow' | 'standard' | 'wide' | 'full';
export type ReaderLineHeight = 'tight' | 'normal' | 'relaxed';

export interface ReaderSettings {
  fontFamily: ReaderFontFamily;
  fontSize: number; // 14 to 32
  lineHeight: ReaderLineHeight;
  theme: ReaderTheme;
  contentWidth: ReaderWidth;
  textAlign: 'right' | 'justify' | 'left';
  paragraphSpacing: 'normal' | 'spacious';
  bionicReading: boolean;
  autoScrollSpeed?: number; // 0 = off, 1-5 = slow to fast
}

export type AdType = 'adsense' | 'adsterra' | 'corporate' | 'custom_banner';

export interface AdPlacement {
  id: string;
  name: string;
  location: 'header' | 'sidebar' | 'mid_chapter' | 'chapter_end' | 'footer' | 'floating_bottom';
  enabled: boolean;
  type: AdType;
  adSlotId?: string; // AdSense slot ID
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  corporateSponsorId?: string;
  customHtml?: string;
  adsterraKey?: string;
  adsterraScript?: string;
  adsterraBannerSize?: '728x90' | '300x250' | '160x600' | '320x50' | '468x60' | 'native';
}

export interface CorporateSponsor {
  id: string;
  sponsorName: string;
  tagline: string;
  badge: string;
  imageUrl: string;
  targetUrl: string;
  ctaText: string;
  active: boolean;
  impressions: number;
  clicks: number;
}

export interface GoogleAdSenseConfig {
  enabled: boolean;
  publisherId: string; // e.g. ca-pub-1234567890123456
  autoAds: boolean;
  testMode: boolean;
  adsTxtContent: string;
}

export interface AdsterraConfig {
  enabled: boolean;
  popunderScript?: string;
  socialBarScript?: string;
  directLinkUrl?: string;
  nativeBannerScript?: string;
}

export interface AdSettings {
  googleAdSense: GoogleAdSenseConfig;
  adsterra?: AdsterraConfig;
  placements: Record<string, AdPlacement>;
  corporateSponsors: CorporateSponsor[];
}

export interface Bookmark {
  novelId: string;
  chapterId: string;
  chapterNumber: number;
  chapterTitle: string;
  updatedAt: string;
}

export interface ReadingHistoryItem {
  novelId: string;
  chapterId: string;
  chapterNumber: number;
  chapterTitle: string;
  readAt: string;
  progressPercent: number;
}
