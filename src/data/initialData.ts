import { Novel, Chapter, Comment, AdSettings, ReaderSettings, AuthorProfile, SiteBranding, SeoSettings, DonationSettings, SupabaseConfig, LegalDocuments } from '../types';
import { BAKED_NOVELS, BAKED_CHAPTERS } from './bakedContent';

export const DEFAULT_BOOK_COVER = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&auto=format&fit=crop&q=80';
export const DEFAULT_BANNER_IMAGE = '/author-cover.jpg';

export const INITIAL_AUTHOR_PROFILE: AuthorProfile = {
  name: 'أيمن كناني',
  englishName: 'Ayman Kinani',
  title: 'كاتب، باحث، ومؤلف',
  avatar: '/author-avatar.jpg',
  coverImage: '/author-cover.jpg',
  shortBio: 'مؤلف وباحث شغوف بالكتابة الإبداعية، الفكر الفلسفي، وسرد العوالم القصصية والأدبية الثرية.',
  fullBio: 'أيمن كناني (Ayman Kinani) كاتب وباحث عربي يركز في أعماله على سبر أغوار الفكر الإنساني وتجسيد الأسئلة الوجودية في قوالب روائية وأدبية بديعة. تضم مؤلفاته أعمالاً في الفلسفة، الرواية المعاصرة، الخيال العلمي، والتراث الفكري. تهدف هذه المنصة الرسمية إلى تقديم جميع مؤلفاته وكتبه ومقالاته بتجربة قراءة تفاعلية مفتوحة ومباشرة للقراء في كل مكان.',
  location: 'الوطن العربي',
  vision: 'السعي نحو إثراء المشهد الثقافي العربي بمؤلفات تجمع بين عمق الفكرة ورشاقة الأسلوب وسهولة الوصول لكافة القراء.',
  contactEmail: 'aymankinani.author@gmail.com',
  socialLinks: {
    twitter: 'https://twitter.com/aymankinani',
    facebook: 'https://facebook.com/aymankinani.official',
    instagram: 'https://instagram.com/aymankinani',
    youtube: 'https://youtube.com/@aymankinani',
    telegram: 'https://t.me/aymankinani',
    linkedin: 'https://linkedin.com/in/aymankinani',
    tiktok: 'https://tiktok.com/@aymankinani',
    goodreads: 'https://goodreads.com/aymankinani',
    whatsapp: 'https://wa.me/966500000000',
    email: 'aymankinani.author@gmail.com',
    website: 'https://www.aymankinani.org'
  }
};

export const INITIAL_SITE_BRANDING: SiteBranding = {
  siteName: 'أيمن كناني | Ayman Kinani',
  siteSubtitle: 'المنصة الرسمية لنشر المؤلفات والكتب والروايات',
  logoUrl: '/pwa-512.png',
  faviconUrl: '/favicon.ico',
  pwaIconUrl: '/pwa-512.png',
  footerText: 'الأعمال مرخصة بموجب رخصة المشاع الإبداعي (CC BY-NC 4.0) - الكاتب أيمن كناني © 2026',
};

export const INITIAL_SEO_SETTINGS: SeoSettings = {
  siteTitleTemplate: '%title% | الكاتب أيمن كناني',
  defaultTitle: 'أيمن كناني (Ayman Kinani) - المنصة الرسمية لنشر المؤلفات والكتب والروايات',
  defaultDescription: 'المنصة الرسمية المعتمدة لنشر وقراءة وتحميل مؤلفات وكتب وروايات ومقالات الكاتب أيمن كناني مجاناً بصيغة PDF وقراءة تفاعلية مباشرة.',
  keywords: 'أيمن كناني, Ayman Kinani, روايات أيمن كناني, كتب أيمن كناني, تحميل كتب PDF, قراءة روايات اونلاين, روايات عربية, أدب وفلسفة',
  canonicalBaseUrl: 'https://www.aymankinani.org',
  authorName: 'أيمن كناني',
  twitterHandle: '@aymankinani',
  googleVerificationCode: '',
  bingVerificationCode: '',
  ogDefaultImage: 'https://images.unsplash.com/photo-1507842229451-79b1be886a29?q=80&w=1600&auto=format&fit=crop',
  enableStructuredData: true,
  indexingPolicy: 'all',
  googleAnalyticsId: '',
};

export const INITIAL_DONATION_SETTINGS: DonationSettings = {
  enabled: true,
  title: 'دعم الكاتب والمنصة (Support Ayman Kinani)',
  description: 'إذا كنت تستمتع بقراءة هذه المؤلفات والكتب وترغب في دعم استمرارية وتطوير هذا المشروع الأدبي والفكري، يمكنك المساهمة عبر وسائل الدعم المباشرة أدناه:',
  paypalEmailOrLink: 'https://paypal.me/aymankinani',
  buyMeACoffeeUrl: 'https://buymeacoffee.com/aymankinani',
  patreonUrl: 'https://patreon.com/aymankinani',
  kofiUrl: 'https://ko-fi.com/aymankinani',
  bankAccountDetails: 'IBAN: SA0380000000608010167519 - الحساب الرسمي',
  cryptoWallet: 'USDT (TRC20): TXYz1234567890aymankinanicryptoaddr',
  customPaymentLink: '',
  customPaymentTitle: 'وسيلة دعم أخرى',
};

export const INITIAL_SUPABASE_CONFIG: SupabaseConfig = {
  enabled: true,
  url: 'https://ddotnksrmwpsfxmgduji.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkb3Rua3NybXdwc2Z4bWdkdWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4ODc0ODAsImV4cCI6MjEwNTQ2MzQ4MH0.AlKIT-493mepn41UF3JpocS5xgDLeqnafxEyLww31JE',
  autoSync: true,
  connected: true,
};

export const INITIAL_READER_SETTINGS: ReaderSettings = {
  fontFamily: 'amiri',
  fontSize: 20,
  lineHeight: 'relaxed',
  theme: 'paper',
  contentWidth: 'standard',
  textAlign: 'right',
  paragraphSpacing: 'normal',
  bionicReading: false,
  autoScrollSpeed: 0,
};

export const INITIAL_CATEGORIES: Array<{ id: string; name: string; arabicName: string; description: string }> = [
  { id: 'cat-1', name: 'Islamic Thought & Methodology', arabicName: 'فكر إسلامي ومنهجية البحث', description: 'تأصيل قواعد البحث العلمي والتفكير النقدي في الفكر الإسلامي المعاصر' },
  { id: 'cat-2', name: 'Philosophy & Ethics', arabicName: 'فلسفة وأخلاق', description: 'دراسات في الأخلاقيات المعرفية وفلسفة العلوم والمنطق' },
  { id: 'cat-3', name: 'Critical Studies', arabicName: 'دراسات نقدية ومعرفية', description: 'قراءات تحليلية ونقدية في المناهج والأفكار المعاصرة' },
  { id: 'cat-4', name: 'Thought & Heritage', arabicName: 'تراث وفكر', description: 'أصول التعامل مع النص الشرعي والتراث الفكري الأصيل' },
  { id: 'cat-5', name: 'Articles & Research', arabicName: 'مقالات وبحوث علمية', description: 'أوراق بحثية ومقالات محكمة في المنهجية والأمانة المعرفية' },
];

export const INITIAL_LEGAL_DOCUMENTS: LegalDocuments = {
  termsOfService: `أهلاً بكم في المنصة الرسمية للمؤلف والكاتب أيمن كناني (Ayman Kinani). بمجرد تصفحك للموقع أو قراءة الكتب والمؤلفات المنشورة عليه، فإنك تقر وتوافق بالالتزام بهذه الشروط والأحكام وشروط رخصة المشاع الإبداعي المحددة.
جميع المؤلفات والكتب والروايات والمقالات والفصول المنشورة في الموقع هي حقوق فكرية وأدبية للكاتب أيمن كناني، ومتاحة للاستفادة والتعلم وفق ترخيص المشاع الإبداعي (CC BY-NC 4.0).`,
  privacyPolicy: `نحن في منصة الكاتب أيمن كناني نحترم خصوصية مستخدمينا وقرائنا التامة.
- ملفات تعريف الارتباط (Cookies): يستخدم الموقع ملفات الكوكيز لتقديم تجربة تصفح وقراءة مخصصة (مثل حفظ تفضيلات الخطوط، نمط القراءة، ومكان التوقف في الفصول).
- إعلانات Google AdSense: يعرض الموقع إعلانات عبر شبكة جوجل أدسنس وشركائها وفق المعايير والسياسات الرسمية.
- لا نقوم ببيع أو مشاركة بياناتك الشخصية مع أي أطراف ثالثة.`,
  dmcaPolicy: `تحترم المنصة حقوق الملكية الفكرية وتلتزم بقانون الألفية الجديدة لحقوق طبع ونشر المواد الرقمية (DMCA).
إذا كانت لديك أي استفسارات أو ملاحظات حول الملكية الأدبية، يرجى التواصل مع الكاتب عبر البريد الرسمي aymankinani.author@gmail.com وسيتم الرد فوراً وبشكل حاسم.`,
  licensesPolicy: `عن هذا العمل:
أسمح بتدريسه والاستشهاد به ونشره للفائدة، شريطة نسبته لصاحبه الأصلي وعدم استغلاله تجاريًا.

الأفكار والرؤية في هذا العمل نابعة مني بالكامل. أستعين بأدوات الذكاء الاصطناعي لتوسيع الأفكار وصياغتها الأولية، مع مراجعتي وإشرافي الكامل على كل نص قبل نشره.

الترخيص:
هذا العمل مرخّص بموجب رخصة المشاع الإبداعي (نسب المصنف - غير تجاري 4.0 دولي)
CC BY-NC 4.0

بيان الترخيص وحق المؤلف:
هذا العمل مرخّص بموجب CC BY-NC 4.0 لإعادة النشر والاستخدام غير التجاري من قبل الجمهور. بصفتي المؤلف الأصلي لهذا المحتوى، أعرض إعلانات وخيارات دعم لتأمين دخل يعينني على العيش والاستمرار في الكتابة، وهذا حق أصيل لا يتعارض مع الترخيص الممنوح للقراء.

يعني هذا أنك تستطيع:
✅ نسخ العمل وإعادة توزيعه بأي وسيلة
✅ تدريسه واستخدامه في الدورات والمناهج
✅ الاقتباس منه والبناء عليه وتطويره

❌ بشرط: نسبة العمل إلى أيمن كناني
❌ بشرط: عدم استخدامه لأغراض تجارية دون إذن مسبق

© 2026 أيمن كناني — جميع الاستخدامات وفق شروط الرخصة أعلاه.`,
  publisherInfo: `المنصة الرسمية لنشر المؤلفات والكتب والروايات والدراسات الفكرية للكاتب والباحث أيمن كناني (Ayman Kinani).
تهدف المنصة إلى إثراء المحتوى الفكري والأدبي العربي وتقديم تجربة قراءة تفاعلية مفتوحة ومباشرة لكافة القراء.
البريد الإلكتروني للكاتب والإدارة: aymankinani.author@gmail.com`,
  contactEmail: 'aymankinani.author@gmail.com',
  supportEmail: 'aymankinani.author@gmail.com',
  lastUpdated: new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }),
};

export const INITIAL_NOVELS: Novel[] = BAKED_NOVELS;

export const INITIAL_CHAPTERS: Chapter[] = BAKED_CHAPTERS;

export const INITIAL_COMMENTS: Comment[] = [];

export const INITIAL_AD_SETTINGS: AdSettings = {
  googleAdSense: {
    enabled: false,
    publisherId: '',
    autoAds: false,
    testMode: false,
    adsTxtContent: '',
  },
  adsterra: {
    enabled: false,
    popunderScript: '',
    socialBarScript: '',
    directLinkUrl: '',
    nativeBannerScript: '',
  },
  placements: {
    header: {
      id: 'place-header',
      name: 'شريط الإعلانات العلوي',
      location: 'header',
      enabled: false,
      type: 'adsense',
      adSlotId: '',
      adFormat: 'horizontal',
    },
    sidebar: {
      id: 'place-sidebar',
      name: 'الإعلان الجانبي لصفحة الكتاب',
      location: 'sidebar',
      enabled: false,
      type: 'adsense',
      adSlotId: '',
      adFormat: 'rectangle',
    },
    mid_chapter: {
      id: 'place-mid',
      name: 'فاصل قراءة منتصف الفصل',
      location: 'mid_chapter',
      enabled: false,
      type: 'adsense',
      adSlotId: '',
      adFormat: 'rectangle',
    },
    chapter_end: {
      id: 'place-end',
      name: 'بنر نهاية الفصل',
      location: 'chapter_end',
      enabled: false,
      type: 'adsense',
      adSlotId: '',
      adFormat: 'horizontal',
    },
    footer: {
      id: 'place-footer',
      name: 'بنر التذييل العام للموقع',
      location: 'footer',
      enabled: false,
      type: 'adsense',
      adSlotId: '',
      adFormat: 'horizontal',
    }
  },
  corporateSponsors: []
};

