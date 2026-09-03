import React, { useState } from 'react';
import { DonationSettings } from '../../types';
import { storageService } from '../../services/storageService';
import { supabaseService } from '../../services/supabaseService';
import {
  Heart,
  DollarSign,
  Coffee,
  CreditCard,
  QrCode,
  Check,
  Globe,
  ExternalLink,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface DonationsTabProps {
  onRefreshData: () => void;
}

export const DonationsTab: React.FC<DonationsTabProps> = ({ onRefreshData }) => {
  const [settings, setSettings] = useState<DonationSettings>(() => storageService.getDonationSettings());
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleChange = (field: keyof DonationSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveDonationSettings(settings);
    supabaseService.saveDonationSettingsToSupabase(settings);
    setSavedSuccess(true);
    onRefreshData();
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div className="space-y-8 animate-fade-in font-cairo">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#E5E2D9] rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 shrink-0">
            <Heart className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#2C2C2C] font-amiri">
                إدارة قنوات الدعم المالي والتبرعات (Support the Author)
              </h2>
              <span className="text-xs bg-rose-600 text-white px-2.5 py-0.5 rounded-full font-mono">
                Financial Support
              </span>
            </div>
            <p className="text-sm text-[#6E6A64] mt-1">
              خصص وسائل الدعم المالي المتاحة لقرّاء الكاتب أيمن كناني، مثل PayPal و Buy Me a Coffee والتحويل البنكي والعملات الرقمية.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="w-full md:w-auto px-6 py-3 bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8] rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <Check className="w-5 h-5" />
          <span>حفظ وتحديث وسائل الدعم</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-bold flex items-center gap-3 animate-fade-in">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>تم حفظ بيانات وقنوات الدعم المالي بنجاح! تظهر الآن لجميع القراء في الموقع.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Settings (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[#FFFFFF] border border-[#E5E2D9] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-4">
              <h3 className="text-base font-bold text-[#2C2C2C] flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#4A5D4E]" />
                <span>خيارات وعناوين الدعم المالي المباشر</span>
              </h3>

              <label className="flex items-center gap-2 text-xs font-bold text-[#2C2C2C] cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => handleChange('enabled', e.target.checked)}
                  className="rounded border-[#E5E2D9] text-[#4A5D4E] focus:ring-[#4A5D4E]"
                />
                <span>تفعيل زر وبطاقة الدعم في الموقع</span>
              </label>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2C2C]">عنوان نافذة الدعم المالي</label>
                <input
                  type="text"
                  value={settings.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="مثال: دعم الكاتب والمؤلف أيمن كناني"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] text-sm text-[#2C2C2C] font-bold focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2C2C]">رسالة الشكر ونبذة الدعم</label>
                <textarea
                  rows={3}
                  value={settings.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="اكتب رسالة شكر للقرّاء الداعمين تشرح فيها كيف يساهم دعمهم في استمرار الكتابة..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] text-sm text-[#2C2C2C] leading-relaxed focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>
            </div>

            {/* Channels */}
            <div className="border-t border-[#E5E2D9] pt-6 space-y-4">
              <h4 className="text-sm font-bold text-[#2C2C2C] mb-3">القنوات وروابط الدفع:</h4>

              {/* PayPal */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2C2C] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <span>رابط PayPal المباشر أو بريد الحساب</span>
                </label>
                <input
                  type="text"
                  value={settings.paypalEmailOrLink}
                  onChange={(e) => handleChange('paypalEmailOrLink', e.target.value)}
                  placeholder="https://paypal.me/aymankinani أو ayman.kinani@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] text-xs font-mono text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E]"
                  dir="ltr"
                />
              </div>

              {/* Buy Me a Coffee */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2C2C] flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-amber-500" />
                  <span>رابط منصة Buy Me a Coffee</span>
                </label>
                <input
                  type="url"
                  value={settings.buyMeACoffeeUrl}
                  onChange={(e) => handleChange('buyMeACoffeeUrl', e.target.value)}
                  placeholder="https://buymeacoffee.com/aymankinani"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] text-xs font-mono text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E]"
                  dir="ltr"
                />
              </div>

              {/* Patreon */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2C2C] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span>رابط صفحة باتريون (Patreon)</span>
                </label>
                <input
                  type="url"
                  value={settings.patreonUrl}
                  onChange={(e) => handleChange('patreonUrl', e.target.value)}
                  placeholder="https://patreon.com/aymankinani"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] text-xs font-mono text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E]"
                  dir="ltr"
                />
              </div>

              {/* Ko-fi */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2C2C] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                  <span>رابط منصة كوفي (Ko-fi)</span>
                </label>
                <input
                  type="url"
                  value={settings.kofiUrl}
                  onChange={(e) => handleChange('kofiUrl', e.target.value)}
                  placeholder="https://ko-fi.com/aymankinani"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] text-xs font-mono text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E]"
                  dir="ltr"
                />
              </div>

              {/* Bank Account / IBAN */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2C2C] flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#4A5D4E]" />
                  <span>بيانات الحساب البنكي / رقم الآيبان (IBAN) للتحويل المباشر</span>
                </label>
                <input
                  type="text"
                  value={settings.bankAccountDetails}
                  onChange={(e) => handleChange('bankAccountDetails', e.target.value)}
                  placeholder="مثال: IBAN: SA0380000000608010167519 - البنك الأهلي"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] text-xs text-[#2C2C2C] font-mono focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              {/* Crypto Wallet */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2C2C] flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-purple-600" />
                  <span>عنوان محفظة العملات الرقمية (USDT / Crypto)</span>
                </label>
                <input
                  type="text"
                  value={settings.cryptoWallet}
                  onChange={(e) => handleChange('cryptoWallet', e.target.value)}
                  placeholder="مثال: USDT (TRC20): TXYz1234567890abcdefghijklmnopqrstuvwxyz"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] text-xs text-[#2C2C2C] font-mono focus:outline-none focus:border-[#4A5D4E]"
                  dir="ltr"
                />
              </div>

              {/* Custom Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2C2C2C]">اسم وسيلة دفع مخصصة</label>
                  <input
                    type="text"
                    value={settings.customPaymentTitle || ''}
                    onChange={(e) => handleChange('customPaymentTitle', e.target.value)}
                    placeholder="مثال: تحويل فوري / STC Pay"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] text-xs text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2C2C2C]">رابط أو رقم وسيلة الدفع</label>
                  <input
                    type="text"
                    value={settings.customPaymentLink || ''}
                    onChange={(e) => handleChange('customPaymentLink', e.target.value)}
                    placeholder="https://... أو رقم الحساب"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] text-xs text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Card (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#FFFFFF] border border-[#E5E2D9] rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#2C2C2C] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>معاينة بطاقة الدعم للقراء</span>
            </h3>

            <div className="border border-[#E5E2D9] bg-[#FDFCF8] rounded-2xl p-5 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
                <Heart className="w-6 h-6 fill-rose-600/20" />
              </div>

              <div>
                <h4 className="font-amiri font-bold text-base text-[#2C2C2C]">
                  {settings.title || 'دعم الكاتب أيمن كناني'}
                </h4>
                <p className="text-xs text-[#6E6A64] mt-1.5 leading-relaxed">
                  {settings.description || 'مساهمتك تساعد في استمرار هذا المشروع الأدبي.'}
                </p>
              </div>

              <div className="space-y-2 pt-2 text-xs">
                {settings.paypalEmailOrLink && (
                  <div className="p-2 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl font-bold flex items-center justify-center gap-2">
                    <span>دعم عبر PayPal</span>
                  </div>
                )}
                {settings.buyMeACoffeeUrl && (
                  <div className="p-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl font-bold flex items-center justify-center gap-2">
                    <Coffee className="w-3.5 h-3.5" />
                    <span>Buy Me a Coffee</span>
                  </div>
                )}
                {settings.bankAccountDetails && (
                  <div className="p-2 bg-[#F7F5EE] border border-[#E5E2D9] text-[#2C2C2C] rounded-xl font-bold flex items-center justify-center gap-2">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>التحويل البنكي المباشر</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#F7F5EE] border border-[#E5E2D9] rounded-2xl p-6 text-xs text-[#6E6A64] space-y-2.5">
            <h4 className="font-bold text-[#2C2C2C] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#4A5D4E]" />
              <span>أين يظهر زر الدعم في الموقع؟</span>
            </h4>
            <p>1. في القائمة العلوية (Navbar) بجوار محرك البحث والتطبيق.</p>
            <p>2. داخل بطاقة النبذة التعريفية للكاتب أيمن كناني.</p>
            <p>3. في نهاية كل فصل ومقال أثناء قراءة القارئ.</p>
          </div>
        </div>
      </form>
    </div>
  );
};
