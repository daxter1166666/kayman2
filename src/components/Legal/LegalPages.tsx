import React, { useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Mail,
  Lock,
  FileText,
  CheckCircle2,
  Send,
  Award,
  ExternalLink,
  Check,
  X as XIcon,
  BookOpen,
  User,
  Heart,
  Globe,
  Compass,
  Sparkles,
  Share2,
  MessageSquare,
  HelpCircle,
  Copy
} from 'lucide-react';
import { storageService } from '../../services/storageService';

export type LegalPageType = 'about' | 'author' | 'privacy' | 'terms' | 'dmca' | 'licenses' | 'contact' | 'support' | 'donate' | 'ads_txt';

interface LegalPagesProps {
  page: LegalPageType;
  onBack: () => void;
  onNavigateSection?: (section: LegalPageType) => void;
}

export const LegalPages: React.FC<LegalPagesProps> = ({ page, onBack, onNavigateSection }) => {
  const legalDocs = storageService.getLegalDocuments();
  const authorProfile = storageService.getAuthorProfile();
  const branding = storageService.getSiteBranding();
  const donationSettings = storageService.getDonationSettings();
  
  // Contact form state
  const [senderName, setSenderName] = useState<string>('');
  const [senderEmail, setSenderEmail] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSent, setIsSent] = useState<boolean>(false);
  const [copiedCrypto, setCopiedCrypto] = useState<string | null>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !senderEmail.trim() || !message.trim()) return;

    storageService.sendContactMessage(senderName, senderEmail, message, subject);
    setIsSent(true);
    setSenderName('');
    setSenderEmail('');
    setSubject('');
    setMessage('');
  };

  const handleCopy = (text: string, key: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedCrypto(key);
      setTimeout(() => setCopiedCrypto(null), 2000);
    }
  };

  const handleTabClick = (target: LegalPageType, e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateSection) {
      onNavigateSection(target);
    }
  };

  const normalizedPage = (page === 'author' ? 'about' : page === 'donate' ? 'support' : page);

  const tabs: { key: LegalPageType; label: string; href: string }[] = [
    { key: 'about', label: 'عن الكاتب والمنصة (من نحن)', href: '/about' },
    { key: 'privacy', label: 'سياسة الخصوصية', href: '/privacy' },
    { key: 'terms', label: 'شروط الاستخدام', href: '/terms' },
    { key: 'licenses', label: 'رخصة المشاع الإبداعي (CC BY-NC 4.0)', href: '/licenses' },
    { key: 'dmca', label: 'الملكية الفكرية (DMCA)', href: '/dmca' },
    { key: 'contact', label: 'تواصل معنا', href: '/contact' },
    { key: 'support', label: 'دعم المنصة', href: '/support' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-[#2C2C2C] font-cairo" dir="rtl">
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          type="button"
          id="legal-back-btn"
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] hover:bg-[#F7F5EE] text-[#2C2C2C] text-xs font-semibold cursor-pointer shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#4A5D4E]" />
          <span>العودة إلى المكتبة الرئيسية</span>
        </button>

        <nav className="text-xs text-[#6E6A64] flex items-center gap-1.5 flex-wrap">
          <a href="/" onClick={(e) => { e.preventDefault(); onBack(); }} className="hover:text-[#4A5D4E]">الرئيسية</a>
          <span>›</span>
          <span className="text-[#2C2C2C] font-bold">
            {tabs.find(t => t.key === normalizedPage)?.label || 'الوثائق والصفحات'}
          </span>
        </nav>
      </div>

      {/* Navigation Pills Bar for Fast Switching */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 border-b border-[#E5E2D9] scrollbar-none">
        {tabs.map(tab => (
          <a
            key={tab.key}
            href={tab.href}
            onClick={(e) => handleTabClick(tab.key, e)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              normalizedPage === tab.key
                ? 'bg-[#4A5D4E] text-white border-[#4A5D4E] shadow-xs'
                : 'bg-white text-[#6E6A64] border-[#E5E2D9] hover:bg-[#F7F5EE] hover:text-[#2C2C2C]'
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {/* 1. ABOUT US / AUTHOR BIOGRAPHY & VISION */}
      {normalizedPage === 'about' && (
        <article className="space-y-8 bg-[#FFFFFF] border border-[#E5E2D9] p-6 sm:p-10 rounded-3xl shadow-xs">
          <div className="border-b border-[#E5E2D9] pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4A5D4E]/10 text-[#4A5D4E] text-xs font-bold mb-3">
              <User className="w-3.5 h-3.5" />
              <span>السيرة الذاتية والرؤية الفكرية</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-amiri font-bold text-[#2C2C2C]">
              عن الكاتب أيمن كناني والمنصة الرسمية (من نحن)
            </h1>
            <p className="text-xs sm:text-sm text-[#6E6A64] mt-2">
              Ayman Kinani — Official Literature, Intellectual Studies & Academic Research Platform
            </p>
          </div>

          {/* Author Card Profile */}
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start bg-[#F7F5EE] p-6 rounded-2xl border border-[#E5E2D9]">
            <img
              src={authorProfile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
              alt={authorProfile.name}
              className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-2xl border-2 border-[#4A5D4E]/30 shadow-md shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 text-center sm:text-right space-y-2">
              <h2 className="text-2xl font-amiri font-bold text-[#2C2C2C]">
                {authorProfile.name}
                {authorProfile.englishName && (
                  <span className="text-sm font-sans font-normal text-[#6E6A64] block sm:inline sm:mr-2">
                    ({authorProfile.englishName})
                  </span>
                )}
              </h2>
              <p className="text-xs sm:text-sm font-bold text-[#4A5D4E]">
                {authorProfile.title || 'كاتب، باحث، ومؤلف فكري'}
              </p>
              <p className="text-xs text-[#6E6A64] leading-relaxed">
                {authorProfile.shortBio || authorProfile.fullBio}
              </p>
            </div>
          </div>

          {/* Vision & Mission Section */}
          <div className="space-y-4">
            <h3 className="font-amiri font-bold text-2xl text-[#2C2C2C] flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#4A5D4E]" />
              <span>الرسالة والأهداف الفكرية</span>
            </h3>
            <p className="text-sm leading-relaxed text-[#2C2C2C]/90 bg-[#FDFCF8] p-5 rounded-2xl border border-[#E5E2D9]">
              {authorProfile.vision || 'السعي نحو إثراء المشهد الثقافي والفكري العربي بمؤلفات تجمع بين عمق الفكرة ورشاقة الأسلوب وسهولة الوصول لكافة القراء والباحثين بدون حواجز مادية.'}
            </p>
          </div>

          {/* Core Intellectual Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-[#E5E2D9] space-y-2 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-[#4A5D4E]/10 text-[#4A5D4E] flex items-center justify-center font-bold">
                1
              </div>
              <h4 className="font-bold text-sm text-[#2C2C2C]">أخلاقيات البحث العلمي</h4>
              <p className="text-xs text-[#6E6A64] leading-relaxed">
                ترسيخ قواعد التجرد، النزاهة المعرفية، والابتعاد عن التحيّز والأهواء في دراسة القضايا الفكرية والتاريخية.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E5E2D9] space-y-2 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-[#C88A3B]/10 text-[#C88A3B] flex items-center justify-center font-bold">
                2
              </div>
              <h4 className="font-bold text-sm text-[#2C2C2C]">المنهج النقدي الرصين</h4>
              <p className="text-xs text-[#6E6A64] leading-relaxed">
                قراءة التراث والواقع المعاصر بأدوات التحليل المنهجي المقارن والحوار الحضاري المنفتح.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E5E2D9] space-y-2 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                3
              </div>
              <h4 className="font-bold text-sm text-[#2C2C2C]">النشر المفتوح والحر</h4>
              <p className="text-xs text-[#6E6A64] leading-relaxed">
                إتاحة كافة المؤلفات برخصة المشاع الإبداعي CC BY-NC 4.0 مجاناً للجميع بدون اشتراكات أو قيود وصول.
              </p>
            </div>
          </div>

          {/* Social Channels & Community */}
          <div className="bg-[#FAF8F2] p-6 rounded-2xl border border-[#E5DFD0] space-y-3">
            <h4 className="font-bold text-sm text-[#2C2C2C] flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#4A5D4E]" />
              <span>قنوات المتابعة والتواصل الرسمية</span>
            </h4>
            <div className="flex flex-wrap gap-3 text-xs font-bold">
              {authorProfile.socialLinks?.telegram && (
                <a
                  href={authorProfile.socialLinks.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-[#4A5D4E] text-white hover:bg-[#3C4C3F] transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <span>📢 قناة التليجرام الرسمية</span>
                </a>
              )}
              {authorProfile.socialLinks?.facebook && (
                <a
                  href={authorProfile.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-[#1877F2] text-white hover:bg-[#1565C0] transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <span>📘 صفحة الفيسبوك</span>
                </a>
              )}
              {authorProfile.socialLinks?.email && (
                <a
                  href={`mailto:${authorProfile.socialLinks.email}`}
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#E5E2D9] text-[#2C2C2C] hover:bg-[#F7F5EE] transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Mail className="w-3.5 h-3.5 text-[#4A5D4E]" />
                  <span>{authorProfile.socialLinks.email}</span>
                </a>
              )}
            </div>
          </div>
        </article>
      )}

      {/* 2. PRIVACY POLICY */}
      {normalizedPage === 'privacy' && (
        <article className="space-y-6 bg-[#FFFFFF] border border-[#E5E2D9] p-6 sm:p-10 rounded-3xl shadow-xs">
          <div className="border-b border-[#E5E2D9] pb-4">
            <span className="text-xs uppercase font-bold text-[#4A5D4E]">الخصوصية وأمان البيانات</span>
            <h1 className="text-2xl sm:text-3xl font-amiri font-bold text-[#2C2C2C] mt-1">
              سياسة الخصوصية وملفات تعريف الارتباط (Cookies & AdSense)
            </h1>
            <p className="text-xs text-[#6E6A64] mt-1">
              متوافقة مع معايير Google AdSense و GDPR و CCPA واللوائح الدولية لحماية بيانات القراء
            </p>
          </div>

          <div className="text-sm text-[#2C2C2C] leading-relaxed whitespace-pre-line bg-[#FDFCF8] p-5 rounded-2xl border border-[#E5E2D9]">
            {legalDocs.privacyPolicy}
          </div>
        </article>
      )}

      {/* 3. TERMS OF SERVICE */}
      {normalizedPage === 'terms' && (
        <article className="space-y-6 bg-[#FFFFFF] border border-[#E5E2D9] p-6 sm:p-10 rounded-3xl shadow-xs">
          <div className="border-b border-[#E5E2D9] pb-4">
            <span className="text-xs uppercase font-bold text-[#4A5D4E]">اتفاقية الاستخدام والناشر</span>
            <h1 className="text-2xl sm:text-3xl font-amiri font-bold text-[#2C2C2C] mt-1">
              الشروط والأحكام العامة للموقع
            </h1>
            <p className="text-xs text-[#6E6A64] mt-1">آخر تحديث: {legalDocs.lastUpdated}</p>
          </div>

          <div className="text-sm text-[#2C2C2C] leading-relaxed whitespace-pre-line bg-[#FDFCF8] p-5 rounded-2xl border border-[#E5E2D9]">
            {legalDocs.termsOfService}
          </div>
        </article>
      )}

      {/* 4. DMCA POLICY */}
      {normalizedPage === 'dmca' && (
        <article className="space-y-6 bg-[#FFFFFF] border border-[#E5E2D9] p-6 sm:p-10 rounded-3xl shadow-xs">
          <div className="border-b border-[#E5E2D9] pb-4">
            <span className="text-xs uppercase font-bold text-[#4A5D4E]">حماية الملكية الفكرية</span>
            <h1 className="text-2xl sm:text-3xl font-amiri font-bold text-[#2C2C2C] mt-1">
              حقوق النشر والملكية الأدبية وقانون DMCA
            </h1>
            <p className="text-xs text-[#6E6A64] mt-1">Digital Millennium Copyright Act Compliance</p>
          </div>

          <div className="text-sm text-[#2C2C2C] leading-relaxed whitespace-pre-line bg-[#FDFCF8] p-5 rounded-2xl border border-[#E5E2D9]">
            {legalDocs.dmcaPolicy}
          </div>
        </article>
      )}

      {/* 5. LICENSES / CREATIVE COMMONS */}
      {normalizedPage === 'licenses' && (
        <article className="space-y-6 bg-[#FFFFFF] border border-[#E5E2D9] p-6 sm:p-10 rounded-3xl shadow-xs">
          <div className="border-b border-[#E5E2D9] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#4A5D4E]" />
                <span className="text-xs uppercase font-bold text-[#4A5D4E]">رخصة النشر والاستخدام</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-amiri font-bold text-[#2C2C2C] mt-1">
                التراخيص وحقوق الاستشهاد والمشاركة
              </h1>
              <p className="text-xs text-[#6E6A64] mt-1">
                رخصة المشاع الإبداعي (نسب المصنف - غير تجاري 4.0 دولي) CC BY-NC 4.0
              </p>
            </div>

            <a
              href="https://creativecommons.org/licenses/by-nc/4.0/deed.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4A5D4E]/10 hover:bg-[#4A5D4E]/20 text-[#4A5D4E] font-bold text-xs transition-colors shrink-0"
            >
              <span>نص الرخصة الرسمي (CC BY-NC 4.0)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="bg-[#4A5D4E]/5 border border-[#4A5D4E]/20 p-6 sm:p-7 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-[#4A5D4E] font-bold text-sm">
              <BookOpen className="w-4 h-4" />
              <span>عن هذا العمل ورؤية الكاتب أيمن كناني:</span>
            </div>
            <blockquote className="text-base sm:text-lg font-amiri font-semibold text-[#2C2C2C] leading-relaxed italic pr-3 border-r-2 border-[#4A5D4E]">
              "أسمح بتدريسه والاستشهاد به ونشره للفائدة، شريطة نسبته لصاحبه الأصلي وعدم استغلاله تجاريًا."
            </blockquote>
            <p className="text-sm text-[#4A4740] leading-relaxed">
              الأفكار والرؤية في هذا العمل نابعة مني بالكامل. أستعين بأدوات الذكاء الاصطناعي لتوسيع الأفكار وصياغتها الأولية، مع مراجعتي وإشرافي الكامل على كل نص قبل نشره.
            </p>
          </div>

          <div className="bg-[#FAF8F2] border border-[#E5DFD0] p-6 sm:p-7 rounded-2xl space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-[#4A5D4E] font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-[#4A5D4E]" />
              <span>بيان رخصة النشر ودعم الكاتب:</span>
            </div>
            <p className="text-sm sm:text-base font-amiri font-semibold text-[#2C2C2C] leading-relaxed bg-[#FFFFFF] p-4 rounded-xl border border-[#E5E2D9]">
              "هذا العمل مرخّص بموجب CC BY-NC 4.0 لإعادة النشر والاستخدام غير التجاري من قبل الجمهور. بصفتي المؤلف الأصلي لهذا المحتوى، أعرض إعلانات وخيارات دعم لتأمين دخل يعينني على العيش والاستمرار في الكتابة، وهذا حق أصيل لا يتعارض مع الترخيص الممنوح للقراء."
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#F7F9F6] border border-[#D5E1D7] p-5 rounded-2xl space-y-3">
              <h3 className="font-bold text-sm text-[#2D5A34] flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>ما يُسمح به بحرية (وفق الرخصة):</span>
              </h3>
              <ul className="space-y-2 text-xs text-[#3E4A3F] leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>المشاركة والتوزيع:</strong> نسخ العمل وتوزيعه بأي صيغة أو وسيلة رقمية أو ورقية.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>التدريس والأكاديميا:</strong> استخدام النصوص وتدريسها في المناهج والجامعات والدورات التدريبية.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>الاقتباس والاستشهاد:</strong> الاستشهاد بالأفكار والأطروحات في الأبحاث والمقالات.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>التطوير والاشتقاق:</strong> البناء على هذه الأفكار لإنتاج محتوى معرفي جديد غير تجاري.</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#FDF8F6] border border-[#EED7D0] p-5 rounded-2xl space-y-3">
              <h3 className="font-bold text-sm text-[#873420] flex items-center gap-2">
                <XIcon className="w-4 h-4 text-rose-600" />
                <span>الشروط والقيود الإلزامية:</span>
              </h3>
              <ul className="space-y-2 text-xs text-[#5D3A32] leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">✕</span>
                  <span><strong>نسب المصنف (Attribution):</strong> يجب وجوباً ذكر اسم الكاتب الأصلي (أيمن كناني - Ayman Kinani) ورابط المنصة.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">✕</span>
                  <span><strong>غير تجاري (Non-Commercial):</strong> يُحظر تماماً بيع العمل أو استغلاله في منتجات أو دورات مدفوعة لتحقيق أرباح دون إذن كتابي مسبق.</span>
                </li>
              </ul>
            </div>
          </div>

          {legalDocs.licensesPolicy && (
            <div className="text-sm text-[#2C2C2C] leading-relaxed whitespace-pre-line bg-[#FDFCF8] p-5 rounded-2xl border border-[#E5E2D9]">
              {legalDocs.licensesPolicy}
            </div>
          )}
        </article>
      )}

      {/* 6. CONTACT US / PUBLISHER INQUIRY */}
      {normalizedPage === 'contact' && (
        <article className="space-y-6 bg-[#FFFFFF] border border-[#E5E2D9] p-6 sm:p-10 rounded-3xl shadow-xs">
          <div className="border-b border-[#E5E2D9] pb-4">
            <span className="text-xs uppercase font-bold text-[#4A5D4E]">الناشر والتواصل المباشر</span>
            <h1 className="text-2xl sm:text-3xl font-amiri font-bold text-[#2C2C2C] mt-1">
              معلومات الناشر والتواصل معنا
            </h1>
            <p className="text-xs text-[#6E6A64] mt-1">استفسارات القراء، طلبات النشر، والرعايات الرسمية</p>
          </div>

          <section className="space-y-6 text-sm text-[#2C2C2C] leading-relaxed">
            <div className="text-sm text-[#2C2C2C] leading-relaxed whitespace-pre-line bg-[#FDFCF8] p-5 rounded-2xl border border-[#E5E2D9]">
              {legalDocs.publisherInfo}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#F7F5EE] border border-[#E5E2D9]">
                <div className="flex items-center gap-2 text-[#4A5D4E] mb-1">
                  <Mail className="w-4 h-4" />
                  <strong className="text-xs uppercase font-bold">البريد الإلكتروني للناشر وفريق التحرير</strong>
                </div>
                <p className="text-xs font-mono text-[#2C2C2C]" dir="ltr">{legalDocs.contactEmail}</p>
              </div>

              {legalDocs.supportEmail && (
                <div className="p-4 rounded-2xl bg-[#F7F5EE] border border-[#E5E2D9]">
                  <div className="flex items-center gap-2 text-[#4A5D4E] mb-1">
                    <ShieldCheck className="w-4 h-4" />
                    <strong className="text-xs uppercase font-bold">الشراكات الإعلانية والدعم الفني</strong>
                  </div>
                  <p className="text-xs font-mono text-[#2C2C2C]" dir="ltr">{legalDocs.supportEmail}</p>
                </div>
              )}
            </div>

            {/* Direct Contact Form */}
            <div className="p-6 rounded-2xl bg-[#F7F5EE] border border-[#E5E2D9]">
              <h4 className="font-amiri font-bold text-lg text-[#2C2C2C] mb-1">
                إرسال رسالة مباشرة إلى بريد الناشر والإدارة
              </h4>
              <p className="text-xs text-[#6E6A64] mb-4">
                سيتم إرسال رسالتك مباشرة وحفظها في صندوق بريد الإدارة ليتم الرد عليك عبر بريدك الإلكتروني
              </p>

              {isSent && (
                <div className="mb-4 p-3.5 rounded-xl bg-[#4A5D4E]/10 border border-[#4A5D4E]/30 text-[#4A5D4E] text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>شكراً لك! تم استلام رسالتك بنجاح وسيتواصل معك فريق الناشر في أقرب وقت.</span>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="اسمك الكامل *"
                    required
                    value={senderName}
                    onChange={e => setSenderName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FFFFFF] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E]"
                  />
                  <input
                    type="email"
                    placeholder="بريدك الإلكتروني (لتلقي الرد) *"
                    required
                    value={senderEmail}
                    onChange={e => setSenderEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FFFFFF] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] text-left font-mono"
                    dir="ltr"
                  />
                </div>

                <input
                  type="text"
                  placeholder="موضوع الرسالة (اختياري)"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FFFFFF] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E]"
                />

                <textarea
                  rows={4}
                  placeholder="اكتب استفسارك، اقتراحك، أو طلب النشر بالتفصيل..."
                  required
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full p-3.5 text-xs rounded-xl bg-[#FFFFFF] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] leading-relaxed"
                />

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8] text-xs font-bold rounded-xl cursor-pointer transition-all shadow-xs flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>إرسال الرسالة إلى الناشر</span>
                </button>
              </form>
            </div>
          </section>
        </article>
      )}

      {/* 7. SUPPORT & DONATION / PATRONAGE */}
      {normalizedPage === 'support' && (
        <article className="space-y-6 bg-[#FFFFFF] border border-[#E5E2D9] p-6 sm:p-10 rounded-3xl shadow-xs">
          <div className="border-b border-[#E5E2D9] pb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold mb-3">
              <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
              <span>دعم المحتوى الفكري الحر</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-amiri font-bold text-[#2C2C2C] mt-1">
              دعم الكاتب والمنصة (Support Ayman Kinani)
            </h1>
            <p className="text-xs sm:text-sm text-[#6E6A64] mt-1">
              مساهمتك تمكننا من الاستمرار في نشر المؤلفات والكتب والأبحاث الرصينة مجاناً لجميع القراء
            </p>
          </div>

          <div className="bg-[#FAF8F2] p-6 rounded-2xl border border-[#E5DFD0] space-y-4">
            <h3 className="font-amiri font-bold text-xl text-[#2C2C2C]">لماذا ندعو لدعم المنصة؟</h3>
            <p className="text-sm leading-relaxed text-[#2C2C2C]/90">
              {donationSettings?.customMessage || 'نحن نؤمن بأن المعرفة حق إنساني أصيل، لذا نتيح كافة أعمال الكاتب أيمن كناني للقراءة والتحميل مجاناً دون حواجز مادية. دعمكم المباشر يساعد الكاتب على التفرغ التام للبحث والتأليف وإصدار كتب ودراسات فكرية جديدة.'}
            </p>
          </div>

          {/* Direct Support Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {donationSettings?.paypalUrl && (
              <a
                href={donationSettings.paypalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 rounded-2xl border border-[#E5E2D9] bg-white hover:border-[#4A5D4E] hover:shadow-md transition-all flex items-center justify-between group"
              >
                <div>
                  <h4 className="font-bold text-sm text-[#2C2C2C] group-hover:text-[#4A5D4E]">الدعم عبر PayPal</h4>
                  <p className="text-xs text-[#6E6A64] mt-1">دفع آمن بالبطاقات الائتمانية أو حساب PayPal</p>
                </div>
                <ExternalLink className="w-4 h-4 text-[#4A5D4E]" />
              </a>
            )}

            {donationSettings?.patreonUrl && (
              <a
                href={donationSettings.patreonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 rounded-2xl border border-[#E5E2D9] bg-white hover:border-[#FF424D] hover:shadow-md transition-all flex items-center justify-between group"
              >
                <div>
                  <h4 className="font-bold text-sm text-[#2C2C2C] group-hover:text-[#FF424D]">الرعاية الشهرية عبر Patreon</h4>
                  <p className="text-xs text-[#6E6A64] mt-1">انضم إلى مجتمع الرعاة والداعمين الدائمين</p>
                </div>
                <ExternalLink className="w-4 h-4 text-[#FF424D]" />
              </a>
            )}

            {donationSettings?.buyMeCoffeeUrl && (
              <a
                href={donationSettings.buyMeCoffeeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 rounded-2xl border border-[#E5E2D9] bg-white hover:border-[#FFDD00] hover:shadow-md transition-all flex items-center justify-between group"
              >
                <div>
                  <h4 className="font-bold text-sm text-[#2C2C2C] group-hover:text-amber-700">Buy Me a Coffee</h4>
                  <p className="text-xs text-[#6E6A64] mt-1">دعم رمزي وسريع بنقرة واحدة</p>
                </div>
                <ExternalLink className="w-4 h-4 text-amber-700" />
              </a>
            )}
          </div>

          {/* Crypto Wallets if present */}
          {donationSettings?.cryptoAddresses && Object.keys(donationSettings.cryptoAddresses).length > 0 && (
            <div className="space-y-3 pt-4 border-t border-[#E5E2D9]">
              <h4 className="font-bold text-sm text-[#2C2C2C]">محافظ العملات الرقمية (Crypto Support)</h4>
              <div className="space-y-2">
                {Object.entries(donationSettings.cryptoAddresses).map(([coin, addr]) => (
                  <div key={coin} className="p-3.5 rounded-xl bg-[#F7F5EE] border border-[#E5E2D9] flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <span className="font-bold text-[#4A5D4E] uppercase ml-2">{coin}:</span>
                      <span className="font-mono text-[#6E6A64] truncate" dir="ltr">{addr}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(addr, coin)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-[#E5E2D9] hover:bg-[#FAF8F2] text-[#2C2C2C] font-semibold text-[11px] shrink-0 cursor-pointer flex items-center gap-1"
                    >
                      {copiedCrypto === coin ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCrypto === coin ? 'تم النسخ' : 'نسخ'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      )}
    </div>
  );
};
