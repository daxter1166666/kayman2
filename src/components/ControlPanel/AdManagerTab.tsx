import React, { useState } from 'react';
import { AdSettings, AdPlacement, CorporateSponsor, AdType } from '../../types';
import { storageService } from '../../services/storageService';
import { supabaseService } from '../../services/supabaseService';
import {
  DollarSign,
  Sparkles,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  Copy,
  Eye,
  MousePointerClick,
  Globe
} from 'lucide-react';

interface AdManagerTabProps {
  adSettings: AdSettings;
  onRefreshData: () => void;
}

export const AdManagerTab: React.FC<AdManagerTabProps> = ({
  adSettings,
  onRefreshData,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'placements' | 'adsterra' | 'adsense' | 'corporate'>('placements');
  const [notification, setNotification] = useState<string | null>(null);

  // AdSense config state
  const [adSenseEnabled, setAdSenseEnabled] = useState<boolean>(adSettings.googleAdSense.enabled);
  const [publisherId, setPublisherId] = useState<string>(adSettings.googleAdSense.publisherId);
  const [autoAds, setAutoAds] = useState<boolean>(adSettings.googleAdSense.autoAds);
  const [testMode, setTestMode] = useState<boolean>(adSettings.googleAdSense.testMode);
  const [adsTxtContent, setAdsTxtContent] = useState<string>(adSettings.googleAdSense.adsTxtContent);

  // Adsterra config state
  const [adsterraEnabled, setAdsterraEnabled] = useState<boolean>(adSettings.adsterra?.enabled ?? true);
  const [socialBarScript, setSocialBarScript] = useState<string>(adSettings.adsterra?.socialBarScript ?? '');
  const [popunderScript, setPopunderScript] = useState<string>(adSettings.adsterra?.popunderScript ?? '');
  const [directLinkUrl, setDirectLinkUrl] = useState<string>(adSettings.adsterra?.directLinkUrl ?? '');
  const [nativeBannerScript, setNativeBannerScript] = useState<string>(adSettings.adsterra?.nativeBannerScript ?? '');

  // Corporate Sponsor Form
  const [isEditingSponsor, setIsEditingSponsor] = useState<boolean>(false);
  const [editingSponsorId, setEditingSponsorId] = useState<string | null>(null);
  const [sponsorName, setSponsorName] = useState<string>('');
  const [tagline, setTagline] = useState<string>('');
  const [badge, setBadge] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [targetUrl, setTargetUrl] = useState<string>('');
  const [ctaText, setCtaText] = useState<string>('');

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const persistAdSettings = (updated: AdSettings) => {
    storageService.saveAdSettings(updated);
    supabaseService.saveAdSettingsToSupabase(updated);
    onRefreshData();
  };

  // Save Adsterra Config
  const handleSaveAdsterraConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AdSettings = {
      ...adSettings,
      adsterra: {
        enabled: adsterraEnabled,
        socialBarScript: socialBarScript.trim(),
        popunderScript: popunderScript.trim(),
        directLinkUrl: directLinkUrl.trim(),
        nativeBannerScript: nativeBannerScript.trim(),
      },
    };
    persistAdSettings(updated);
    showToast('تم حفظ إعدادات وأكواد شبكة Adsterra بنجاح ومزامنتها سحابياً!');
  };

  // Update placement settings
  const handleTogglePlacement = (key: string, enabled: boolean) => {
    const updated = { ...adSettings };
    if (updated.placements[key]) {
      updated.placements[key].enabled = enabled;
      persistAdSettings(updated);
      showToast(`تم ${enabled ? 'تفعيل' : 'تعطيل'} موضع "${updated.placements[key].name}" ومزامنته سحابياً`);
    }
  };

  const handleChangePlacementType = (key: string, type: AdType) => {
    const updated = { ...adSettings };
    if (updated.placements[key]) {
      updated.placements[key].type = type;
      persistAdSettings(updated);
      showToast(`تم تغيير مصدر موضع "${updated.placements[key].name}" إلى ${type === 'adsense' ? 'جوجل أدسنس' : 'راعي مباشر'}`);
    }
  };

  const handleChangePlacementSponsor = (key: string, sponsorId: string) => {
    const updated = { ...adSettings };
    if (updated.placements[key]) {
      updated.placements[key].corporateSponsorId = sponsorId;
      persistAdSettings(updated);
      showToast(`تم تعيين الراعي للموضع المحدد ومزامنته`);
    }
  };

  const handleChangePlacementSlot = (key: string, slotId: string) => {
    const updated = { ...adSettings };
    if (updated.placements[key]) {
      updated.placements[key].adSlotId = slotId;
      persistAdSettings(updated);
    }
  };

  // Save AdSense Config
  const handleSaveAdSenseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AdSettings = {
      ...adSettings,
      googleAdSense: {
        enabled: adSenseEnabled,
        publisherId: publisherId.trim(),
        autoAds,
        testMode,
        adsTxtContent: adsTxtContent.trim(),
      },
    };
    persistAdSettings(updated);
    showToast('تم حفظ إعدادات جوجل أدسنس بنجاح ومزامنتها سحابياً!');
  };

  // Save Corporate Sponsor
  const handleSaveSponsor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorName.trim() || !targetUrl.trim()) {
      alert('يرجى ملء اسم الراعي ورابط التوجيه');
      return;
    }

    const updated = { ...adSettings };
    if (editingSponsorId) {
      const idx = updated.corporateSponsors.findIndex(s => s.id === editingSponsorId);
      if (idx !== -1) {
        updated.corporateSponsors[idx] = {
          ...updated.corporateSponsors[idx],
          sponsorName: sponsorName.trim(),
          tagline: tagline.trim(),
          badge: badge.trim() || 'راعي معتمد',
          imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
          targetUrl: targetUrl.trim(),
          ctaText: ctaText.trim() || 'اكتشف المزيد',
        };
      }
      showToast('تم تحديث بيانات الراعي بنجاح ومزامنته سحابياً!');
    } else {
      const newSponsor: CorporateSponsor = {
        id: `corp-${Date.now()}`,
        sponsorName: sponsorName.trim(),
        tagline: tagline.trim(),
        badge: badge.trim() || 'شريك مميز',
        imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
        targetUrl: targetUrl.trim(),
        ctaText: ctaText.trim() || 'استكشف العرض',
        active: true,
        impressions: 0,
        clicks: 0,
      };
      updated.corporateSponsors.push(newSponsor);
      showToast('تمت إضافة راعي تجاري جديد ومزامنته سحابياً!');
    }

    persistAdSettings(updated);
    setIsEditingSponsor(false);
    setEditingSponsorId(null);
  };

  const handleStartCreateSponsor = () => {
    setEditingSponsorId(null);
    setSponsorName('');
    setTagline('');
    setBadge('شريك أدبي معتمد');
    setImageUrl('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop');
    setTargetUrl('https://example.com/partner');
    setCtaText('احصل على الخصم الحصري');
    setIsEditingSponsor(true);
  };

  const handleStartEditSponsor = (s: CorporateSponsor) => {
    setEditingSponsorId(s.id);
    setSponsorName(s.sponsorName);
    setTagline(s.tagline);
    setBadge(s.badge);
    setImageUrl(s.imageUrl);
    setTargetUrl(s.targetUrl);
    setCtaText(s.ctaText);
    setIsEditingSponsor(true);
  };

  const handleDeleteSponsor = (sId: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا الراعي التجاري؟')) {
      const updated = { ...adSettings };
      updated.corporateSponsors = updated.corporateSponsors.filter(s => s.id !== sId);
      persistAdSettings(updated);
      showToast('تم حذف الراعي بنجاح ومزامنته سحابياً');
    }
  };

  const copyAdsTxt = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(adsTxtContent);
      showToast('تم نسخ محتوى ملف ads.txt إلى الحافظة!');
    }
  };

  return (
    <div className="space-y-8 text-[#2C2C2C] font-cairo">
      {/* Toast */}
      {notification && (
        <div className="fixed bottom-6 left-6 z-50 bg-[#4A5D4E] text-[#FDFCF8] px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Header & Sub-Navigation */}
      <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E5E2D9] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="font-amiri font-bold text-xl text-[#2C2C2C] flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#4A5D4E]" />
            <span>مركز إدارة الإعلانات والربح والرعاة</span>
          </h2>
          <p className="text-xs text-[#6E6A64]">
            تحكم في مواضع ظهور الإعلانات، أكواد Google AdSense، بانرات الشركات الراعية، وملف ads.txt.
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex flex-wrap items-center gap-1 bg-[#F7F5EE] p-1 rounded-xl border border-[#E5E2D9] text-xs font-bold">
          <button
            type="button"
            id="subtab-placements"
            onClick={() => setActiveSubTab('placements')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'placements'
                ? 'bg-[#4A5D4E] text-[#FDFCF8] shadow-xs'
                : 'text-[#6E6A64] hover:text-[#2C2C2C]'
            }`}
          >
            مواضع الإعلانات
          </button>
          <button
            type="button"
            id="subtab-adsterra"
            onClick={() => setActiveSubTab('adsterra')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              activeSubTab === 'adsterra'
                ? 'bg-[#4A5D4E] text-[#FDFCF8] shadow-xs'
                : 'text-[#6E6A64] hover:text-[#2C2C2C]'
            }`}
          >
            <span>شبكة Adsterra</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 border border-amber-300">سريعة القبول</span>
          </button>
          <button
            type="button"
            id="subtab-adsense"
            onClick={() => setActiveSubTab('adsense')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'adsense'
                ? 'bg-[#4A5D4E] text-[#FDFCF8] shadow-xs'
                : 'text-[#6E6A64] hover:text-[#2C2C2C]'
            }`}
          >
            إعدادات Google AdSense
          </button>
          <button
            type="button"
            id="subtab-corporate"
            onClick={() => setActiveSubTab('corporate')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'corporate'
                ? 'bg-[#4A5D4E] text-[#FDFCF8] shadow-xs'
                : 'text-[#6E6A64] hover:text-[#2C2C2C]'
            }`}
          >
            الرعاة والشركات ({adSettings.corporateSponsors.length})
          </button>
        </div>
      </div>

      {/* Subtab 1: AD PLACEMENTS CONTROLLER */}
      {activeSubTab === 'placements' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-[#4A5D4E]/10 border border-[#4A5D4E]/20 text-xs text-[#2C2C2C] flex items-center justify-between">
            <span>
              💡 <strong>تلميح احترافي:</strong> يمكنك تشغيل أو إيقاف كل موضع إعلاني بشكل مستقل، والتبديل بسهولة بين شبكة AdSense والرعاة المباشرين.
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {(Object.entries(adSettings.placements) as [string, AdPlacement][]).map(([key, placement]) => (
              <div
                key={key}
                id={`ad-placement-row-${key}`}
                className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E2D9] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-amiri font-bold text-[#2C2C2C] text-lg">
                      {placement.name === 'Header Leaderboard' && 'بانر الترويسة العلوي'}
                      {placement.name === 'Sidebar Banner' && 'بانر القائمة الجانبية للرواية'}
                      {placement.name === 'In-Article Mid Chapter' && 'إعلان وسط فصول القراءة'}
                      {placement.name === 'Post-Chapter Footer' && 'إعلان نهاية الفصل وقبل التعليقات'}
                      {placement.name === 'Global Footer Banner' && 'بانر التذييل السفلي العام'}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F7F5EE] text-[#6E6A64] border border-[#E5E2D9]">
                      الموقع: {placement.location}
                    </span>
                  </div>
                  <p className="text-xs text-[#6E6A64]">
                    {placement.location === 'header' && 'يظهر في أعلى صفحات الروايات وقارئ الفصول لجذب أكبر قدر من الانتباه.'}
                    {placement.location === 'sidebar' && 'يظهر في العمود الجانبي بجوار قائمة الفصول ومعلومات الرواية.'}
                    {placement.location === 'mid_chapter' && 'يتم إدراجه بذكاء بين فقرات القراءة بتنسيق مريح للعين.'}
                    {placement.location === 'chapter_end' && 'يظهر مباشرة قبل قسم تعليقات القراء وأزرار التنقل بين الفصول.'}
                    {placement.location === 'footer' && 'يظهر عبر التذييل السفلي لكافة صفحات الموقع.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  {/* Type Selector */}
                  <div>
                    <label className="text-[10px] font-bold text-[#6E6A64] block mb-1">
                      مصدر الإعلان
                    </label>
                    <select
                      id={`placement-type-${key}`}
                      value={placement.type}
                      onChange={e => handleChangePlacementType(key, e.target.value as AdType)}
                      className="px-2.5 py-1.5 text-xs rounded-lg bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] font-bold cursor-pointer"
                    >
                      <option value="adsense">Google AdSense</option>
                      <option value="corporate">راعي تجاري مباشر</option>
                    </select>
                  </div>

                  {/* Dependent source config */}
                  {placement.type === 'corporate' ? (
                    <div>
                      <label className="text-[10px] font-bold text-[#6E6A64] block mb-1">
                        اختر الراعي
                      </label>
                      <select
                        id={`placement-sponsor-${key}`}
                        value={placement.corporateSponsorId || adSettings.corporateSponsors[0]?.id}
                        onChange={e => handleChangePlacementSponsor(key, e.target.value)}
                        className="px-2.5 py-1.5 text-xs rounded-lg bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] max-w-xs truncate font-bold cursor-pointer"
                      >
                        {adSettings.corporateSponsors.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.sponsorName}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="text-[10px] font-bold text-[#6E6A64] block mb-1">
                        معرّف الوحدة الإعلانية (Slot ID)
                      </label>
                      <input
                        type="text"
                        id={`placement-slot-${key}`}
                        value={placement.adSlotId || ''}
                        onChange={e => handleChangePlacementSlot(key, e.target.value)}
                        placeholder="مثال: 3948571029"
                        className="px-2.5 py-1.5 text-xs rounded-lg bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] w-32 font-mono"
                        dir="ltr"
                      />
                    </div>
                  )}

                  {/* Enable / Disable Switch */}
                  <div className="pt-4">
                    <button
                      type="button"
                      id={`toggle-placement-${key}`}
                      onClick={() => handleTogglePlacement(key, !placement.enabled)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        placement.enabled
                          ? 'bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8]'
                          : 'bg-[#F7F5EE] hover:bg-[#E5E2D9] text-[#6E6A64] border border-[#E5E2D9]'
                      }`}
                    >
                      {placement.enabled ? 'مفعّل' : 'معطّل'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 2: ADSTERRA NETWORK CONFIG */}
      {activeSubTab === 'adsterra' && (
        <form onSubmit={handleSaveAdsterraConfig} className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E5E2D9] space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#E5E2D9] pb-3 gap-2">
            <div>
              <h3 className="font-amiri font-bold text-lg text-[#2C2C2C] flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#C88A3B]" />
                <span>إعدادات شبكة إعلانات Adsterra الإعلانية</span>
              </h3>
              <p className="text-xs text-[#6E6A64]">
                شبكة بديلة ممتازة وسريعة القبول الفوري دون شروط مسبقة وتدعم Social Bar، Popunder، والروابط المباشرة.
              </p>
            </div>
            
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#2C2C2C] bg-[#F7F5EE] px-3 py-1.5 rounded-xl border border-[#E5E2D9]">
              <input
                type="checkbox"
                id="adsterra-enabled-checkbox"
                checked={adsterraEnabled}
                onChange={e => setAdsterraEnabled(e.target.checked)}
                className="w-4 h-4 accent-[#4A5D4E]"
              />
              <span>تفعيل Adsterra</span>
            </label>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-[#2C2C2C] space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <Sparkles className="w-4 h-4" />
              <span>كيفية تفعيل إعلانات Adsterra:</span>
            </div>
            <p className="text-[#6E6A64]">
              1. سجّل في منصة <strong className="text-[#2C2C2C]">Adsterra Publisher</strong> وأضف نطاق موقعك.<br />
              2. أنشئ الوحدات الإعلانية المرغوبة (Social Bar أو Popunder أو Direct Link) وانسخ الكود أو الرابط ثم الصقه في الحقول أدناه.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Social Bar Script */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C2C2C] flex items-center justify-between">
                <span>1. كود إعلان Social Bar (شريط التنبيهات الذكي)</span>
                <span className="text-[11px] text-[#6E6A64]">أعلى نسبة نقر وأرباح</span>
              </label>
              <textarea
                id="adsterra-socialbar-input"
                rows={3}
                placeholder={`<!-- كود Social Bar من Adsterra -->\n<script type='text/javascript' src='//plXXXXX.highratecpm.com/...'></script>`}
                value={socialBarScript}
                onChange={e => setSocialBarScript(e.target.value)}
                className="w-full p-3 text-xs font-mono rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E]"
                dir="ltr"
              />
            </div>

            {/* Popunder Script */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C2C2C] flex items-center justify-between">
                <span>2. كود إعلان Popunder (النافذة المنبثقة)</span>
                <span className="text-[11px] text-[#6E6A64]">يفتح عند النقر الأول</span>
              </label>
              <textarea
                id="adsterra-popunder-input"
                rows={3}
                placeholder={`<!-- كود Popunder من Adsterra -->\n<script type='text/javascript' src='//plXXXXX.highratecpm.com/...'></script>`}
                value={popunderScript}
                onChange={e => setPopunderScript(e.target.value)}
                className="w-full p-3 text-xs font-mono rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E]"
                dir="ltr"
              />
            </div>

            {/* Direct Link URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C2C2C] flex items-center justify-between">
                <span>3. رابط التحويل المباشر (Direct Link / Smartlink)</span>
                <span className="text-[11px] text-[#6E6A64]">للأزرار والروابط الترويجية</span>
              </label>
              <input
                type="url"
                id="adsterra-directlink-input"
                placeholder="https://highratecpm.com/XXXXX/..."
                value={directLinkUrl}
                onChange={e => setDirectLinkUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E]"
                dir="ltr"
              />
            </div>

            {/* Native Banner Script */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C2C2C] flex items-center justify-between">
                <span>4. كود البانرات الأصلية (Native Banners)</span>
                <span className="text-[11px] text-[#6E6A64]">بانرات وسط المقال والمكتبة</span>
              </label>
              <textarea
                id="adsterra-native-input"
                rows={3}
                placeholder={`<!-- كود Native Banner من Adsterra -->\n<script async="async" data-cfasync="false" src="//plXXXXX..."></script>`}
                value={nativeBannerScript}
                onChange={e => setNativeBannerScript(e.target.value)}
                className="w-full p-3 text-xs font-mono rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E]"
                dir="ltr"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-[#E5E2D9]">
            <button
              type="submit"
              id="save-adsterra-settings-btn"
              className="px-6 py-2.5 bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8] font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              حفظ وتطبيق إعدادات Adsterra
            </button>
          </div>
        </form>
      )}

      {/* Subtab 3: GOOGLE ADSENSE GLOBAL CONFIG */}
      {activeSubTab === 'adsense' && (
        <form onSubmit={handleSaveAdSenseConfig} className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E5E2D9] space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-3">
            <h3 className="font-amiri font-bold text-lg text-[#2C2C2C] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#4A5D4E]" />
              <span>بيانات ومعرّف حساب Google AdSense</span>
            </h3>
            <span className="text-xs text-[#6E6A64]">إعدادات التكامل الرسمي لـ AdSense</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold text-[#2C2C2C] block mb-1">
                معرف الناشر (Publisher Client ID) *
              </label>
              <input
                type="text"
                id="adsense-pub-id-input"
                placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                value={publisherId}
                onChange={e => setPublisherId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] font-mono focus:outline-none focus:ring-1 focus:ring-[#4A5D4E]"
                dir="ltr"
                required
              />
              <p className="text-[11px] text-[#6E6A64] mt-1">
                تجد هذا المعرف في حساب Google AdSense الخاص بك تحت قسم: الحساب ← الإعدادات ← معلومات الحساب.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer text-xs font-bold text-[#2C2C2C]">
                <input
                  type="checkbox"
                  id="adsense-enabled-checkbox"
                  checked={adSenseEnabled}
                  onChange={e => setAdSenseEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[#4A5D4E]"
                />
                <span>تفعيل شبكة إعلانات Google AdSense في الموقع</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer text-xs font-bold text-[#2C2C2C]">
                <input
                  type="checkbox"
                  id="adsense-testmode-checkbox"
                  checked={testMode}
                  onChange={e => setTestMode(e.target.checked)}
                  className="w-4 h-4 accent-[#4A5D4E]"
                />
                <span>وضع الاختبار التجريبي (موصى به أثناء فترة المراجعة وطلب القبول)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer text-xs font-bold text-[#2C2C2C]">
                <input
                  type="checkbox"
                  id="adsense-autoads-checkbox"
                  checked={autoAds}
                  onChange={e => setAutoAds(e.target.checked)}
                  className="w-4 h-4 accent-[#4A5D4E]"
                />
                <span>تفعيل الإعلانات التلقائية الذكية (Auto-Ads)</span>
              </label>
            </div>
          </div>

          {/* ads.txt declaration */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-[#2C2C2C]">
                ملف البائعين الرقميين المعتمدين (ads.txt)
              </label>
              <button
                type="button"
                id="copy-ads-txt-btn"
                onClick={copyAdsTxt}
                className="text-xs text-[#4A5D4E] hover:underline flex items-center gap-1 cursor-pointer font-bold"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>نسخ محتوى ads.txt</span>
              </button>
            </div>
            <textarea
              id="ads-txt-textarea"
              rows={4}
              value={adsTxtContent}
              onChange={e => setAdsTxtContent(e.target.value)}
              className="w-full p-3 text-xs font-mono rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] leading-relaxed text-left"
              dir="ltr"
            />
            <p className="text-[11px] text-[#6E6A64] mt-1">
              تقوم عناكب Google AdSense بفحص هذا السطر تلقائياً للتأكد من ملكيتك للموقع وصلاحية نشر الإعلانات.
            </p>
          </div>

          <div className="flex justify-end pt-3 border-t border-[#E5E2D9]">
            <button
              type="submit"
              id="save-adsense-settings-btn"
              className="px-6 py-2.5 bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8] font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              حفظ إعدادات AdSense
            </button>
          </div>
        </form>
      )}

      {/* Subtab 3: CORPORATE SPONSORS STUDIO */}
      {activeSubTab === 'corporate' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-amiri font-bold text-lg text-[#2C2C2C] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#4A5D4E]" />
              <span>الرعاة المباشرون والشركات الأدبية الشريكة</span>
            </h3>
            <button
              type="button"
              id="add-corporate-sponsor-btn"
              onClick={handleStartCreateSponsor}
              className="px-3.5 py-2 bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8] font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة راعي جديد</span>
            </button>
          </div>

          {/* Form Modal */}
          {isEditingSponsor && (
            <form
              onSubmit={handleSaveSponsor}
              className="p-6 rounded-3xl bg-[#FFFFFF] border-2 border-[#4A5D4E]/40 space-y-4 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-2">
                <h4 className="font-amiri font-bold text-base text-[#2C2C2C]">
                  {editingSponsorId ? 'تعديل بيانات وإعلان الراعي' : 'إضافة راعي تجاري جديد'}
                </h4>
                <button
                  type="button"
                  id="cancel-sponsor-edit-btn"
                  onClick={() => setIsEditingSponsor(false)}
                  className="text-xs text-[#6E6A64] hover:text-[#2C2C2C] font-bold"
                >
                  إلغاء
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#2C2C2C] block mb-1">
                    اسم الراعي / العلامة التجارية *
                  </label>
                  <input
                    type="text"
                    id="sponsor-name-input"
                    placeholder="مثال: تطبيق كتب وروايات مسموعة"
                    value={sponsorName}
                    onChange={e => setSponsorName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#2C2C2C] block mb-1">
                    شارة التمييز (مثال: شريك أدبي معتمد)
                  </label>
                  <input
                    type="text"
                    id="sponsor-badge-input"
                    placeholder="مثال: شريك رسمي موثوق"
                    value={badge}
                    onChange={e => setBadge(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-[#2C2C2C] block mb-1">
                    النص الإعلاني الجذاب *
                  </label>
                  <input
                    type="text"
                    id="sponsor-tagline-input"
                    placeholder="مثال: استمع لآلاف الروايات الخيالية بأصوات نخبة المعلقين مع اشتراك مجاني لمدة شهر."
                    value={tagline}
                    onChange={e => setTagline(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#2C2C2C] block mb-1">
                    رابط صورة البانر الإعلاني
                  </label>
                  <input
                    type="url"
                    id="sponsor-img-input"
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] font-mono text-left"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#2C2C2C] block mb-1">
                    رابط التوجيه عند النقر (Target URL) *
                  </label>
                  <input
                    type="url"
                    id="sponsor-url-input"
                    placeholder="https://sponsor.example.com/deal"
                    value={targetUrl}
                    onChange={e => setTargetUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] font-mono text-left"
                    dir="ltr"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#2C2C2C] block mb-1">
                    نص زر الإجراء (CTA)
                  </label>
                  <input
                    type="text"
                    id="sponsor-cta-input"
                    placeholder="مثال: احصل على العرض الحصري"
                    value={ctaText}
                    onChange={e => setCtaText(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E2D9]">
                <button
                  type="button"
                  id="cancel-sponsor-btn"
                  onClick={() => setIsEditingSponsor(false)}
                  className="px-3 py-1.5 text-xs text-[#6E6A64] hover:text-[#2C2C2C] font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  id="submit-sponsor-btn"
                  className="px-5 py-1.5 bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8] text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  حفظ الراعي
                </button>
              </div>
            </form>
          )}

          {/* Sponsors List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {adSettings.corporateSponsors.map(sponsor => (
              <div
                key={sponsor.id}
                id={`manage-sponsor-card-${sponsor.id}`}
                className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E2D9] flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#4A5D4E]/15 text-[#4A5D4E] border border-[#4A5D4E]/30">
                      {sponsor.badge}
                    </span>
                    <span className="text-xs text-[#4A5D4E] font-mono font-bold">
                      نسبة النقر (CTR): {sponsor.impressions > 0 ? ((sponsor.clicks / sponsor.impressions) * 100).toFixed(2) : 0}%
                    </span>
                  </div>

                  <h4 className="font-amiri font-bold text-[#2C2C2C] text-base mb-1">
                    {sponsor.sponsorName}
                  </h4>
                  <p className="text-xs text-[#6E6A64] mb-3 line-clamp-2">
                    {sponsor.tagline}
                  </p>

                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-[#F7F5EE] border border-[#E5E2D9] text-xs text-[#6E6A64] font-mono mb-4">
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-[#6E6A64]" />
                      <span>{sponsor.impressions.toLocaleString()} مشاهدة</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MousePointerClick className="w-3.5 h-3.5 text-[#4A5D4E]" />
                      <span>{sponsor.clicks.toLocaleString()} نقرة</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#E5E2D9]">
                  <a
                    href={sponsor.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#4A5D4E] font-bold hover:underline flex items-center gap-1"
                  >
                    <span>زيارة الرابط</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id={`edit-sponsor-${sponsor.id}`}
                      onClick={() => handleStartEditSponsor(sponsor)}
                      className="px-2.5 py-1 bg-[#F7F5EE] hover:bg-[#E5E2D9] text-[#2C2C2C] text-xs rounded border border-[#E5E2D9] cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      id={`delete-sponsor-${sponsor.id}`}
                      onClick={() => handleDeleteSponsor(sponsor.id)}
                      className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs rounded border border-rose-200 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
