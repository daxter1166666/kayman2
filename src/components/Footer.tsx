import React from 'react';
import { Feather, ShieldCheck, Lock, Heart, FileText, BookOpen, User, Mail, Award } from 'lucide-react';
import { AdSlot } from './AdSlot';
import { AdSettings, SiteBranding } from '../types';

interface FooterProps {
  onOpenLegalPage: (page: 'about' | 'author' | 'terms' | 'privacy' | 'dmca' | 'licenses' | 'contact' | 'support' | 'donate') => void;
  adSettings: AdSettings;
  siteBranding?: SiteBranding;
  onOpenAdminLoginModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenLegalPage,
  adSettings,
  siteBranding,
  onOpenAdminLoginModal,
}) => {
  const brandName = siteBranding?.siteName || 'أيمن كناني | Ayman Kinani';
  const brandSubtitle = siteBranding?.siteSubtitle || 'المنصة الرسمية لنشر المؤلفات والكتب';
  const footerText = siteBranding?.footerText || `مرخص بموجب رخصة المشاع الإبداعي (CC BY-NC 4.0) - ${brandName} © ${new Date().getFullYear()}`;

  const handleLinkClick = (page: 'about' | 'author' | 'terms' | 'privacy' | 'dmca' | 'licenses' | 'contact' | 'support' | 'donate', e: React.MouseEvent) => {
    e.preventDefault();
    onOpenLegalPage(page);
  };

  return (
    <footer className="bg-[#F7F5EE] border-t border-[#E5E2D9] text-[#6E6A64] text-xs font-cairo mt-16" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Global Footer Ad Slot */}
        <AdSlot location="footer" adSettings={adSettings} className="mb-12" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-[#E5E2D9]">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <a
              href="/"
              onClick={(e) => { e.preventDefault(); onOpenLegalPage('about'); }}
              className="flex items-center gap-2 group text-decoration-none"
            >
              <div className="w-8 h-8 rounded-lg bg-[#4A5D4E] flex items-center justify-center text-[#FDFCF8] shadow-xs group-hover:bg-[#3C4C3F] transition-colors">
                <Feather className="w-4 h-4" />
              </div>
              <span className="font-amiri font-bold text-[#2C2C2C] text-lg group-hover:text-[#4A5D4E] transition-colors">
                {brandName}
              </span>
            </a>
            <p className="text-xs text-[#6E6A64] leading-relaxed">
              {brandSubtitle} — المنصة المعتمدة لنشر وقراءة الكتب والروايات والدراسات الفكرية والنقدية برخصة مفتوحة.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <a
                href="/about"
                onClick={(e) => handleLinkClick('about', e)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4A5D4E] hover:underline"
              >
                <User className="w-3.5 h-3.5" />
                <span>عن الكاتب والمنصة (من نحن)</span>
              </a>
            </div>
          </div>

          {/* Quick Links / Sections */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#2C2C2C] mb-3 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#4A5D4E]" />
              <span>أقسام المنصة والمؤلفات</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="/books"
                  onClick={(e) => { e.preventDefault(); if (typeof window !== 'undefined') window.location.href = '/books'; }}
                  className="hover:text-[#4A5D4E] transition-colors"
                >
                  مكتبة الكتب والمؤلفات الكاملة
                </a>
              </li>
              <li>
                <a
                  href="/articles"
                  onClick={(e) => { e.preventDefault(); if (typeof window !== 'undefined') window.location.href = '/articles'; }}
                  className="hover:text-[#4A5D4E] transition-colors"
                >
                  المقالات والدراسات الفكرية والنقدية
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  onClick={(e) => handleLinkClick('about', e)}
                  className="hover:text-[#4A5D4E] transition-colors"
                >
                  السيرة الذاتية والرؤية المنهجية للكاتب
                </a>
              </li>
              <li>
                <a
                  href="/support"
                  onClick={(e) => handleLinkClick('support', e)}
                  className="hover:text-rose-600 transition-colors flex items-center gap-1"
                >
                  <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                  <span>دعم واستمرار النشر المجاني</span>
                </a>
              </li>
            </ul>
          </div>

          {/* AdSense & Legal Compliance Links */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#2C2C2C] mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#4A5D4E]" />
              <span>السياسات والوثائق القانونية</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="/privacy"
                  id="footer-privacy-link"
                  onClick={(e) => handleLinkClick('privacy', e)}
                  className="hover:text-[#4A5D4E] transition-colors block text-right font-medium"
                >
                  سياسة الخصوصية وملفات الكوكيز (Cookies & AdSense)
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  id="footer-terms-link"
                  onClick={(e) => handleLinkClick('terms', e)}
                  className="hover:text-[#4A5D4E] transition-colors block text-right font-medium"
                >
                  الشروط والأحكام العامة للموقع
                </a>
              </li>
              <li>
                <a
                  href="/licenses"
                  id="footer-licenses-link"
                  onClick={(e) => handleLinkClick('licenses', e)}
                  className="hover:text-[#4A5D4E] font-semibold text-[#4A5D4E] transition-colors block text-right"
                >
                  التراخيص ورخصة المشاع الإبداعي (CC BY-NC 4.0)
                </a>
              </li>
              <li>
                <a
                  href="/dmca"
                  id="footer-dmca-link"
                  onClick={(e) => handleLinkClick('dmca', e)}
                  className="hover:text-[#4A5D4E] transition-colors block text-right font-medium"
                >
                  حقوق الملكية الفكرية وقانون DMCA
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  id="footer-contact-link"
                  onClick={(e) => handleLinkClick('contact', e)}
                  className="hover:text-[#4A5D4E] transition-colors block text-right font-medium"
                >
                  معلومات الناشر والتواصل المباشر معنا
                </a>
              </li>
            </ul>
          </div>

          {/* Publication & Rights statement */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#2C2C2C] mb-3 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#C88A3B]" />
              <span>رخصة المشاع الإبداعي CC BY-NC 4.0</span>
            </h4>
            <p className="text-[11px] text-[#6E6A64] leading-relaxed mb-3">
              هذا العمل مرخّص بموجب CC BY-NC 4.0 لإعادة النشر والاستخدام غير التجاري من قبل الجمهور. بصفتي المؤلف الأصلي لهذا المحتوى، أعرض إعلانات وخيارات دعم لتأمين دخل يعينني على العيش والاستمرار في الكتابة، وهذا حق أصيل لا يتعارض مع الترخيص الممنوح للقراء.
            </p>
            <a
              href="/licenses"
              onClick={(e) => handleLinkClick('licenses', e)}
              className="inline-flex items-center gap-1.5 text-[11px] text-[#4A5D4E] hover:underline font-bold"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>عرض تفاصيل ترخيص المشاع الإبداعي</span>
            </a>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#8E8A83]">
          <p>{footerText}</p>
          <div className="flex items-center gap-3">
            <span className="text-[#4A5D4E] font-medium">منصة نشر فكرية وأدبية مستقلة ومفتوحة</span>
            {onOpenAdminLoginModal && (
              <button
                type="button"
                onClick={onOpenAdminLoginModal}
                className="text-[#8E8A83] hover:text-[#4A5D4E] p-1 transition-colors opacity-20 hover:opacity-100 cursor-pointer"
                title="بوابة الإدارة"
              >
                <Lock className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
