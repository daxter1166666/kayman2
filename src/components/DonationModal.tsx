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

        {/* Donation Channels List */}
        <div className="space-y-3 pt-2">
          {/* PayPal */}
          {donationSettings.paypalEmailOrLink && (
            <a
              href={
                donationSettings.paypalEmailOrLink.startsWith('http')
                  ? donationSettings.paypalEmailOrLink
                  : `https://paypal.me/${donationSettings.paypalEmailOrLink}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="w-full p-3.5 rounded-2xl bg-[#0070BA] hover:bg-[#005ea6] text-white flex items-center justify-between font-bold text-xs shadow-xs hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white font-black text-sm">
                  P
                </span>
                <div className="text-right">
                  <span className="block text-white text-xs">الدعم السريع عبر PayPal</span>
                  <span className="block text-[11px] text-white/80 font-normal">دفع آمن بالبطاقة الائتمانية أو حسابك</span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform" />
            </a>
          )}

          {/* Buy Me a Coffee */}
          {donationSettings.buyMeACoffeeUrl && (
            <a
              href={donationSettings.buyMeACoffeeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full p-3.5 rounded-2xl bg-[#FFDD00] hover:bg-[#FFD000] text-[#000000] flex items-center justify-between font-bold text-xs shadow-xs hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-black/10 flex items-center justify-center text-black">
                  <Coffee className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <span className="block text-black text-xs">Buy Me a Coffee</span>
                  <span className="block text-[11px] text-black/70 font-normal">تقديم فنجان قهوة ودعم للكتابة</span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-black/70 group-hover:translate-x-0.5 transition-transform" />
            </a>
          )}

          {/* Patreon */}
          {donationSettings.patreonUrl && (
            <a
              href={donationSettings.patreonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full p-3.5 rounded-2xl bg-[#FF424D] hover:bg-[#E83440] text-white flex items-center justify-between font-bold text-xs shadow-xs hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white font-black text-sm">
                  Pat
                </span>
                <div className="text-right">
                  <span className="block text-white text-xs">الانضمام لرعاة باتريون (Patreon)</span>
                  <span className="block text-[11px] text-white/80 font-normal">دعم شهري مستمر ومزايا للقراء</span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform" />
            </a>
          )}

          {/* Ko-fi */}
          {donationSettings.kofiUrl && (
            <a
              href={donationSettings.kofiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full p-3.5 rounded-2xl bg-[#13C3FF] hover:bg-[#0FB1E8] text-white flex items-center justify-between font-bold text-xs shadow-xs hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-xs">
                  Ko-fi
                </span>
                <div className="text-right">
                  <span className="block text-white text-xs">دعم عبر منصة Ko-fi</span>
                  <span className="block text-[11px] text-white/80 font-normal">دعم فوري بدون عمولات</span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform" />
            </a>
          )}

          {/* Bank Account / IBAN */}
          {donationSettings.bankAccountDetails && (
            <div className="p-4 rounded-2xl bg-[#F7F5EE] border border-[#E5E2D9] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#2C2C2C]">
                  <CreditCard className="w-4 h-4 text-[#4A5D4E]" />
                  <span>التحويل البنكي المباشر (IBAN)</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(donationSettings.bankAccountDetails, 'bank')}
                  className="px-2.5 py-1 bg-[#FFFFFF] hover:bg-[#EAE7DC] text-[#2C2C2C] border border-[#E5E2D9] rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                >
                  {copiedKey === 'bank' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'bank' ? 'تم النسخ' : 'نسخ الآيبان'}</span>
                </button>
              </div>
              <p className="text-xs font-mono text-[#4A5D4E] bg-white p-2.5 rounded-xl border border-[#E5E2D9] select-all">
                {donationSettings.bankAccountDetails}
              </p>
            </div>
          )}

          {/* Crypto Wallet */}
          {donationSettings.cryptoWallet && (
            <div className="p-4 rounded-2xl bg-[#F7F5EE] border border-[#E5E2D9] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#2C2C2C]">
                  <QrCode className="w-4 h-4 text-purple-600" />
                  <span>محفظة العملات الرقمية (USDT / Crypto)</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(donationSettings.cryptoWallet, 'crypto')}
                  className="px-2.5 py-1 bg-[#FFFFFF] hover:bg-[#EAE7DC] text-[#2C2C2C] border border-[#E5E2D9] rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                >
                  {copiedKey === 'crypto' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'crypto' ? 'تم النسخ' : 'نسخ العنوان'}</span>
                </button>
              </div>
              <p className="text-[11px] font-mono text-[#2C2C2C] bg-white p-2.5 rounded-xl border border-[#E5E2D9] break-all select-all">
                {donationSettings.cryptoWallet}
              </p>
            </div>
          )}

          {/* Custom Payment Link */}
          {donationSettings.customPaymentLink && (
            <a
              href={donationSettings.customPaymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full p-3.5 rounded-2xl bg-[#4A5D4E] hover:bg-[#3C4C3F] text-white flex items-center justify-between font-bold text-xs shadow-xs hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>{donationSettings.customPaymentTitle || 'وسيلة دفع ودعم إضافية'}</span>
              </div>
              <ExternalLink className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform" />
            </a>
          )}
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
