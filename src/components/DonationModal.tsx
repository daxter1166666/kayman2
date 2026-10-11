import React, { useState } from 'react';
import { DonationSettings } from '../types';
import {
  Heart,
  X,
  Copy,
  Check,
  Coffee,
  CreditCard,
  QrCode,
  ExternalLink,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  donationSettings: DonationSettings;
}

export const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  onClose,
  donationSettings,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-cairo">
      <div className="relative w-full max-w-lg bg-[#FFFFFF] border border-[#E5E2D9] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl text-[#6E6A64] hover:text-[#2C2C2C] hover:bg-[#F7F5EE] transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
            <Heart className="w-7 h-7 fill-rose-600/20" />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-[#2C2C2C] font-amiri">
            {donationSettings.title || 'دعم الكاتب والمؤلف أيمن كناني'}
          </h3>

          <p className="text-xs text-[#6E6A64] leading-relaxed max-w-md mx-auto">
            {donationSettings.description ||
              'مساهمتك الطيبة تسهم في استمرارية نشر وتأليف المزيد من الكتب والروايات وتقديمها لجميع القراء بالمجان وبأعلى جودة.'}
          </p>
        </div>

        {/* Donation Channels List (PayPal Only) */}
        <div className="space-y-3 pt-2">
          {/* PayPal */}
          <a
            href={
              donationSettings.paypalEmailOrLink
                ? donationSettings.paypalEmailOrLink.startsWith('http')
                  ? donationSettings.paypalEmailOrLink
                  : donationSettings.paypalEmailOrLink.includes('@')
                  ? `https://www.paypal.com/ncp/payment?hosted_button_id=&cmd=_donations&business=${encodeURIComponent(donationSettings.paypalEmailOrLink)}&item_name=${encodeURIComponent('دعم منصة الكاتب أيمن كناني')}&currency_code=USD`
                  : `https://paypal.me/${donationSettings.paypalEmailOrLink}`
                : 'https://paypal.me/kayman4578'
            }
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-4 rounded-2xl bg-[#0070BA] hover:bg-[#005ea6] text-white flex items-center justify-between font-bold text-xs shadow-md hover:shadow-lg transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-black text-base shadow-xs">
                P
              </span>
              <div className="text-right">
                <span className="block text-white text-sm font-bold">الدعم المالي الآمن عبر PayPal</span>
                <span className="block text-xs text-white/90 font-normal mt-0.5">
                  الحساب: {donationSettings.paypalEmailOrLink || 'kayman4578@gmail.com'} (دعم مباشر وآمن)
                </span>
              </div>
            </div>
            <ExternalLink className="w-5 h-5 text-white/90 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        {/* Footer Note */}
        <div className="text-center pt-2 border-t border-[#E5E2D9]">
          <p className="text-[11px] text-[#6E6A64] flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#4A5D4E]" />
            <span>شكراً جزيلاً لدعمكم الصادق ومحبتكم للقراءة والأدب.</span>
          </p>
        </div>
      </div>
    </div>
  );
};
