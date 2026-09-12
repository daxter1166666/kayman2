import React from 'react';
import { Feather, ShieldCheck, Lock } from 'lucide-react';
import { AdSlot } from './AdSlot';
import { AdSettings, SiteBranding } from '../types';

interface FooterProps {
  onOpenLegalPage: (page: 'terms' | 'privacy' | 'dmca' | 'licenses' | 'contact') => void;
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
  const footerText = siteBranding?.footerText || `جميع الحقوق محفوظة للكاتب ${brandName} © ${new Date().getFullYear()}`;

  return (
    <footer className="bg-[#F7F5EE] border-t border-[#E5E2D9] text-[#6E6A64] text-xs font-cairo mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Global Footer Ad Slot */}
        <AdSlot location="footer" adSettings={adSettings} className="mb-12" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-[#E5E2D9]">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#4A5D4E] flex items-center justify-center text-[#FDFCF8] shadow-xs">
                <Feather className="w-4 h-4" />
              </div>
              <span className="font-amiri font-bold text-[#2C2C2C] text-lg">{brandName}</span>
            </div>
            <p className="text-xs text-[#6E6A64] leading-relaxed">
              {brandSubtitle} - منصة أدبية متكاملة لنشر قراءات، روايات، كتب، وبحوث فكرية وأدبية للكاتب أيمن كناني.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#2C2C2C] mb-3">
              أقسام وتصنيفات المؤلفات
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="hover:text-[#4A5D4E] transition-colors cursor-pointer">
                  الفكر، الفلسفة، وتطوير الذات
                </span>
              </li>
              <li>
                <span className="hover:text-[#4A5D4E] transition-colors cursor-pointer">
                  التاريخ، الحضارات، والتراث
                </span>
              </li>
              <li>
                <span className="hover:text-[#4A5D4E] transition-colors cursor-pointer">
                  الأدب، الروايات، والقصص الفلسفية
                </span>
              </li>
              <li>
                <span className="hover:text-[#4A5D4E] transition-colors cursor-pointer">
                  العلوم، التكنولوجيا، والمستقبليات
                </span>
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
                <button
                  type="button"
                  id="footer-terms-btn"
                  onClick={() => onOpenLegalPage('terms')}
                  className="hover:text-[#4A5D4E] transition-colors cursor-pointer text-right"
                >
                  الشروط والأحكام العامة
                </button>
              </li>
              <li>
                <button
                  type="button"
                  id="footer-privacy-btn"
                  onClick={() => onOpenLegalPage('privacy')}
                  className="hover:text-[#4A5D4E] transition-colors cursor-pointer text-right"
                >
                  سياسة الخصوصية وملفات الكوكيز (Cookies)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  id="footer-dmca-btn"
                  onClick={() => onOpenLegalPage('dmca')}
                  className="hover:text-[#4A5D4E] transition-colors cursor-pointer text-right"
                >
                  حقوق الملكية الفكرية وقانون DMCA
                </button>
              </li>
              <li>
                <button
                  type="button"
                  id="footer-licenses-btn"
                  onClick={() => onOpenLegalPage('licenses')}
                  className="hover:text-[#4A5D4E] font-semibold text-[#4A5D4E] transition-colors cursor-pointer text-right flex items-center gap-1.5"
                >
                  <span>التراخيص ورخصة المشاع الإبداعي (CC BY-NC 4.0)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  id="footer-contact-btn"
                  onClick={() => onOpenLegalPage('contact')}
                  className="hover:text-[#4A5D4E] transition-colors cursor-pointer text-right"
                >
                  معلومات الناشر والتواصل معنا
                </button>
              </li>
            </ul>
          </div>

          {/* Publication & Rights statement */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#2C2C2C] mb-3">
              الملكية الفكرية وحقوق النشر
            </h4>
            <p className="text-[11px] text-[#6E6A64] leading-relaxed mb-3">
              جميع الأعمال الأدبية والفكرية المنشورة في هذه المنصة محفوظة بحقوق الطبع والنشر للمؤلف، وتخضع للقوانين المنظمة لحماية الملكية الفكرية وحق القراءة الحرة.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#4A5D4E] font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>منصة رسمية لحفظ ونشر الإبداع الأدبي</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#8E8A83]">
          <p>{footerText}</p>
          <div className="flex items-center gap-3">
            <span className="text-[#4A5D4E] font-medium">صُنعت بشغف لنشر المعرفة والأدب</span>
            {onOpenAdminLoginModal && (
              <button
                type="button"
                onClick={onOpenAdminLoginModal}
                className="text-[#8E8A83] hover:text-[#4A5D4E] p-1 transition-colors opacity-20 hover:opacity-100"
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
