import { Novel, Chapter, Comment, AdSettings, ReaderSettings, AuthorProfile, SiteBranding, SeoSettings, DonationSettings, SupabaseConfig, LegalDocuments } from '../types';

export const DEFAULT_BOOK_COVER = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&auto=format&fit=crop&q=80';
export const DEFAULT_BANNER_IMAGE = 'https://images.unsplash.com/photo-1507842229451-79b1be886a29?w=1600&auto=format&fit=crop&q=80';

export const INITIAL_AUTHOR_PROFILE: AuthorProfile = {
  name: 'أيمن كناني',
  englishName: 'Ayman Kinani',
  title: 'كاتب، باحث، ومؤلف',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
  coverImage: 'https://images.unsplash.com/photo-1507842229451-79b1be886a29?q=80&w=1600&auto=format&fit=crop',
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
    website: 'https://aymankinani.com'
  }
};

export const INITIAL_SITE_BRANDING: SiteBranding = {
  siteName: 'أيمن كناني | Ayman Kinani',
  siteSubtitle: 'المنصة الرسمية لنشر المؤلفات والكتب والروايات',
  logoUrl: '',
  faviconUrl: '',
  footerText: 'الأعمال مرخصة بموجب رخصة المشاع الإبداعي (CC BY-NC 4.0) - الكاتب أيمن كناني © 2026',
};

export const INITIAL_SEO_SETTINGS: SeoSettings = {
  siteTitleTemplate: '%title% | الكاتب أيمن كناني',
  defaultTitle: 'أيمن كناني (Ayman Kinani) - المنصة الرسمية لنشر المؤلفات والكتب والروايات',
  defaultDescription: 'المنصة الرسمية المعتمدة لنشر وقراءة وتحميل مؤلفات وكتب وروايات ومقالات الكاتب أيمن كناني مجاناً بصيغة PDF وقراءة تفاعلية مباشرة.',
  keywords: 'أيمن كناني, Ayman Kinani, روايات أيمن كناني, كتب أيمن كناني, تحميل كتب PDF, قراءة روايات اونلاين, روايات عربية, أدب وفلسفة',
  canonicalBaseUrl: 'https://aymankinani.com',
  authorName: 'أيمن كناني',
  twitterHandle: '@aymankinani',
  googleVerificationCode: '',
  bingVerificationCode: '',
  ogDefaultImage: 'https://images.unsplash.com/photo-1507842229451-79b1be886a29?q=80&w=1600&auto=format&fit=crop',
  enableStructuredData: true,
  indexingPolicy: 'all',
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
  url: 'https://kepuolqhropozwfwwwbb.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlcHVvbHFocm9wb3p3Znd3d2JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMzcyMDgsImV4cCI6MjEwMzkxMzIwOH0.8JfpG8bw-dxwFn64-pAbeRBAxBR9WiaNKQAcJAVCeJw',
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
  { id: 'cat-1', name: 'Fantasy', arabicName: 'فانتازيا وخيال أسطوري', description: 'عوالم السحر والملحمات الأسطورية والآلات البخارية' },
  { id: 'cat-2', name: 'Sci-Fi', arabicName: 'خيال علمي وفضاء', description: 'أوبرا الفضاء، الذكاء الاصطناعي، والتقنيات المستقبلية' },
  { id: 'cat-3', name: 'Mystery & Thriller', arabicName: 'غموض وتشويق', description: 'تحقيقات الجرائم، الألغاز المعقدة، والتشويق النفسي' },
  { id: 'cat-4', name: 'Historical Fiction', arabicName: 'تاريخ وتراث', description: 'أحداث تاريخية ملحمية، حضارات قديمة، وسير وثائقية' },
  { id: 'cat-5', name: 'Philosophy & Thought', arabicName: 'فلسفة وفكر', description: 'دراسات فكرية، حوارات فلسفية، وتحليلات أدبية عميقة' },
  { id: 'cat-6', name: 'Self-Development', arabicName: 'تطوير الذات والوعي', description: 'بناء العادات، النجاح، الفكر الريادي، والاتزان النفسي' },
  { id: 'cat-7', name: 'Novels & Literature', arabicName: 'روايات وأدب عالمي', description: 'أدب مترجم، كلاسيكيات السرد، والقصص الواقعية المؤثرة' },
  { id: 'cat-8', name: 'Poetry & Prose', arabicName: 'شعر ونصوص أدبية', description: 'قصائد ديوانية، نصوص وجدانية، وشعر حديث وكلاسيكي' },
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

export const INITIAL_NOVELS: Novel[] = [];

export const INITIAL_CHAPTERS: Chapter[] = [];

export const INITIAL_COMMENTS: Comment[] = [];

export const INITIAL_AD_SETTINGS: AdSettings = {
  googleAdSense: {
    enabled: true,
    publisherId: 'ca-pub-9842103859124012',
    autoAds: true,
    testMode: true,
    adsTxtContent: `google.com, pub-9842103859124012, DIRECT, f08c47fec0942fa0\n# Novelia Verified Publisher ads.txt\n# Configured for Google AdSense & Authorized Exchange Partners`,
  },
  adsterra: {
    enabled: true,
    popunderScript: '',
    socialBarScript: '',
    directLinkUrl: '',
    nativeBannerScript: '',
  },
  placements: {
    header: {
      id: 'place-header',
      name: 'شريط الإعلانات العلوي للرواية (Leaderboard)',
      location: 'header',
      enabled: true,
      type: 'corporate',
      adSlotId: '1092837465',
      adFormat: 'horizontal',
      corporateSponsorId: 'corp-1',
    },
    sidebar: {
      id: 'place-sidebar',
      name: 'الإعلان الجانبي لصفحة الرواية',
      location: 'sidebar',
      enabled: true,
      type: 'corporate',
      corporateSponsorId: 'corp-2',
      adSlotId: '2983746510',
      adFormat: 'rectangle',
    },
    mid_chapter: {
      id: 'place-mid',
      name: 'فاصل قراءة منتصف الفصل',
      location: 'mid_chapter',
      enabled: true,
      type: 'adsense',
      adSlotId: '3948571029',
      adFormat: 'rectangle',
      corporateSponsorId: 'corp-3',
    },
    chapter_end: {
      id: 'place-end',
      name: 'بنر نهاية الفصل والراعي الرسمي',
      location: 'chapter_end',
      enabled: true,
      type: 'corporate',
      corporateSponsorId: 'corp-1',
      adSlotId: '4839201948',
      adFormat: 'horizontal',
    },
    footer: {
      id: 'place-footer',
      name: 'بنر التذييل العام للموقع',
      location: 'footer',
      enabled: true,
      type: 'adsense',
      adSlotId: '5738291049',
      adFormat: 'horizontal',
    }
  },
  corporateSponsors: [
    {
      id: 'corp-1',
      sponsorName: 'منصة لومينا للكتب الصوتية والإلكترونية',
      tagline: 'استمتع بآلاف الروايات المسموعة الفاخرة باللغة العربية مع مؤثرات صوتية مكانية غامرة وأداء درامي محترف.',
      badge: 'الشريك الأدبي المميز',
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
      targetUrl: 'https://luminaaudio.example.com/ar/deal',
      ctaText: 'احصل على اشتراك تجريبي 30 يوماً مجاناً',
      active: true,
      impressions: 0,
      clicks: 0,
    },
    {
      id: 'corp-2',
      sponsorName: 'أقلام الريشة والمجلد الأثرية (Quill & Tome)',
      tagline: 'أقلام حبر فاخرة مصنوعة يدوياً من التيتانيوم وخشب الأبنوس، مصممة خصيصاً للروائيين وكتاب المذكرات.',
      badge: 'الأداة الرسمية للكتابة',
      imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=800&auto=format&fit=crop',
      targetUrl: 'https://quillandtome.example.com/ar',
      ctaText: 'استكشف التشكيلة الحصرية',
      active: true,
      impressions: 0,
      clicks: 0,
    },
    {
      id: 'corp-3',
      sponsorName: 'أكاديمية سحر السرد وصناعة الرواية',
      tagline: 'تعلّم بناء العوالم الفانتازية الملحمية، وتطوير الشخصيات، والنشر الرقمي على يد كبار الروائيين العرب.',
      badge: 'أكاديمية الكتاب',
      imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=800&auto=format&fit=crop',
      targetUrl: 'https://wordsmithcraft.example.com/ar',
      ctaText: 'انضم للدفعة القادمة',
      active: true,
      impressions: 0,
      clicks: 0,
    }
  ]
};

