import React, { useState, useRef } from 'react';
import { AuthorProfile, AuthorSocialLinks } from '../../types';
import { storageService } from '../../services/storageService';
import { supabaseService } from '../../services/supabaseService';
import {
  User,
  Upload,
  Image as ImageIcon,
  Check,
  Globe,
  Share2,
  FileText,
  Mail,
  Sparkles,
  Phone,
  Link as LinkIcon,
  Eye,
  Trash2
} from 'lucide-react';

interface AuthorProfileTabProps {
  onRefreshData: () => void;
}

export const AuthorProfileTab: React.FC<AuthorProfileTabProps> = ({ onRefreshData }) => {
  const [profile, setProfile] = useState<AuthorProfile>(() => storageService.getAuthorProfile());
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [isDraggingAvatar, setIsDraggingAvatar] = useState<boolean>(false);
  const [isDraggingCover, setIsDraggingCover] = useState<boolean>(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (field: keyof AuthorProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (network: keyof AuthorSocialLinks, value: string) => {
    setProfile(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [network]: value,
      },
    }));
  };

  // Image Upload helper from file
  const handleFileUpload = (file: File, type: 'avatar' | 'cover') => {
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        if (type === 'avatar') {
          setProfile(prev => ({ ...prev, avatar: result }));
        } else {
          setProfile(prev => ({ ...prev, coverImage: result }));
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingAvatar(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0], 'avatar');
    }
  };

  const handleCoverDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingCover(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0], 'cover');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveAuthorProfile(profile);
    supabaseService.saveAuthorProfileToSupabase(profile);
    setSavedSuccess(true);
    onRefreshData();
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const sampleAvatars = [
    { label: 'صورة رسمية 1', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop' },
    { label: 'صورة مكتبية 2', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop' },
    { label: 'صورة أدبية 3', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800&auto=format&fit=crop' },
    { label: 'صورة كلاسيكية 4', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop' },
  ];

  return (
    <div className="space-y-8 animate-fade-in font-cairo">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#E5E2D9] rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#4A5D4E]/10 border border-[#4A5D4E]/20 flex items-center justify-center text-[#4A5D4E] shrink-0">
            <User className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#2C2C2C] font-amiri flex items-center gap-2">
              <span>إدارة الملف الشخصي والنبذة التعريفية للكاتب أيمن كناني</span>
              <span className="text-xs bg-[#4A5D4E] text-white px-2.5 py-0.5 rounded-full font-mono">
                Author Profile
              </span>
            </h2>
            <p className="text-sm text-[#6E6A64] mt-1">
              تخصيص النبذة التعريفية، الصورة الشخصية بالسحب والإفلات، الرؤية الأدبية، وروابط التواصل الاجتماعي التي تظهر لقرّائك.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="w-full md:w-auto px-6 py-3 bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8] rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow-md"
        >
          <Check className="w-5 h-5" />
          <span>حفظ التعديلات وتحديث الموقع</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-bold flex items-center gap-3 animate-fade-in">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>تم حفظ وتحديث ملف الكاتب أيمن كناني وبيانات التواصل الاجتماعي بنجاح! تم نشر التحديثات على الموقع.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Cover Drag & Drop */}
        <div className="lg:col-span-1 space-y-6">
          {/* Avatar Upload Card */}
          <div className="bg-[#FFFFFF] border border-[#E5E2D9] rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#2C2C2C] flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#4A5D4E]" />
                <span>الصورة الشخصية للكاتب</span>
              </h3>
              <span className="text-xs text-[#6E6A64]">سحب وإفلات من الجهاز</span>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDraggingAvatar(true); }}
              onDragLeave={() => setIsDraggingAvatar(false)}
              onDrop={handleAvatarDrop}
              onClick={() => avatarInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDraggingAvatar
                  ? 'border-[#4A5D4E] bg-[#4A5D4E]/10 scale-[1.02]'
                  : 'border-[#E5E2D9] bg-[#FDFCF8] hover:border-[#4A5D4E]/50 hover:bg-[#F7F5EE]'
              }`}
            >
              <input
                type="file"
                ref={avatarInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0], 'avatar');
                  }
                }}
              />

              {profile.avatar ? (
                <div className="relative group">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-28 h-28 rounded-full object-cover border-4 border-[#FFFFFF] shadow-md mx-auto"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-bold transition-opacity">
                    <Upload className="w-5 h-5 mb-1" />
                    <span>تغيير الصورة</span>
                  </div>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#E5E2D9] flex items-center justify-center text-[#6E6A64] mb-3">
                  <User className="w-10 h-10" />
                </div>
              )}

              <div className="mt-3">
                <p className="text-xs font-bold text-[#2C2C2C]">
                  اسحب وأفلت صورة من حاسوبك هنا
                </p>
                <p className="text-[11px] text-[#6E6A64] mt-1">
                  أو اضغط لتصفح ملفات جهازك (PNG, JPG, WEBP)
                </p>
              </div>
            </div>

            {/* Direct Avatar URL input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#6E6A64]">أو الصق رابط صورة مباشر (URL):</label>
              <input
                type="url"
                value={profile.avatar}
                onChange={(e) => handleTextChange('avatar', e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] text-xs text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E]"
              />
            </div>

            {/* Preset Avatars for quick selection */}
            <div className="space-y-2 pt-2 border-t border-[#E5E2D9]">
              <span className="text-xs text-[#6E6A64] block font-bold">نماذج جاهزة للاختيار السريع:</span>
              <div className="grid grid-cols-4 gap-2">
                {sampleAvatars.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setProfile(prev => ({ ...prev, avatar: item.url }))}
                    className="relative group rounded-xl overflow-hidden border border-[#E5E2D9] hover:border-[#4A5D4E] transition-all cursor-pointer aspect-square"
                  >
                    <img src={item.url} alt={item.label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cover / Banner Upload */}
          <div className="bg-[#FFFFFF] border border-[#E5E2D9] rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#2C2C2C] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#4A5D4E]" />
              <span>صورة غلاف بطاقة الكاتب (Banner)</span>
            </h3>

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDraggingCover(true); }}
              onDragLeave={() => setIsDraggingCover(false)}
              onDrop={handleCoverDrop}
              onClick={() => coverInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                isDraggingCover ? 'border-[#4A5D4E] bg-[#4A5D4E]/10' : 'border-[#E5E2D9] bg-[#FDFCF8]'
              }`}
            >
              <input
                type="file"
                ref={coverInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0], 'cover');
                  }
                }}
              />
              {profile.coverImage ? (
                <img
                  src={profile.coverImage}
                  alt="غلاف الكاتب"
                  className="w-full h-24 object-cover rounded-lg mb-2 shadow-xs"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Upload className="w-6 h-6 text-[#6E6A64] mx-auto mb-1" />
              )}
              <span className="text-xs font-bold text-[#2C2C2C] block">انقر لرفع صورة غلاف عريضة أو اسحبها هنا</span>
            </div>

            <input
              type="url"
              value={profile.coverImage || ''}
              onChange={(e) => handleTextChange('coverImage', e.target.value)}
              placeholder="رابط صورة الغلاف العريضة..."
              className="w-full px-3 py-2 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] text-xs text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E]"
            />
          </div>
        </div>

        {/* Right Columns: Main Info & Social Media */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info */}
          <div className="bg-[#FFFFFF] border border-[#E5E2D9] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <h3 className="text-lg font-bold text-[#2C2C2C] font-amiri border-b border-[#E5E2D9] pb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#4A5D4E]" />
              <span>البيانات الأساسية والنبذة التعريفية</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2C2C]">اسم الكاتب بالعربية *</label>
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => handleTextChange('name', e.target.value)}
                  placeholder="مثال: أيمن كناني"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] text-sm text-[#2C2C2C] font-bold focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2C2C]">الاسم بالإنجليزية (English Name)</label>
                <input
                  type="text"
                  value={profile.englishName}
                  onChange={(e) => handleTextChange('englishName', e.target.value)}
                  placeholder="مثال: Ayman Kinani"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] text-sm text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2C2C]">المسمى الأدبي والصفة</label>
                <input
                  type="text"
                  value={profile.title}
                  onChange={(e) => handleTextChange('title', e.target.value)}
                  placeholder="مثال: كاتب، روائي، وباحث فكري"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] text-sm text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2C2C]">الموقع / الإقامة</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => handleTextChange('location', e.target.value)}
                  placeholder="مثال: الوطن العربي"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] text-sm text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>
            </div>

            {/* Short Bio */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C2C2C]">النبذة المختصرة (تظهر في البطاقات ومقدمة الموقع) *</label>
              <textarea
                rows={2}
                value={profile.shortBio}
                onChange={(e) => handleTextChange('shortBio', e.target.value)}
                placeholder="سطرين يصفان توجهك الأدبي وشغفك..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] text-sm text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E]"
              />
            </div>

            {/* Full Bio */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C2C2C]">السيرة الذاتية الكاملة والنبذة المفصلة (عن الكاتب أيمن كناني) *</label>
              <textarea
                rows={5}
                value={profile.fullBio}
                onChange={(e) => handleTextChange('fullBio', e.target.value)}
                placeholder="اكتب تفاصيل رحلتك مع التأليف، مؤلفاتك، رسالتك الأدبية، واهتماماتك الفكرية..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] text-sm text-[#2C2C2C] leading-relaxed focus:outline-none focus:border-[#4A5D4E]"
              />
            </div>

            {/* Vision / Quote */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C2C2C]">الرؤية الأدبية أو المقولة المفضلة</label>
              <input
                type="text"
                value={profile.vision || ''}
                onChange={(e) => handleTextChange('vision', e.target.value)}
                placeholder="مثال: السعي نحو إثراء العقل العربي بأدب يلامس الوجدان ويحفز الفكر..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] text-sm text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E]"
              />
            </div>

            {/* Contact Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C2C2C]">البريد الإلكتروني للتواصل المباشر مع الكاتب</label>
              <input
                type="email"
                value={profile.contactEmail}
                onChange={(e) => handleTextChange('contactEmail', e.target.value)}
                placeholder="ayman.kinani@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] text-sm text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E]"
              />
            </div>
          </div>

          {/* Social Media Networks Card */}
          <div className="bg-[#FFFFFF] border border-[#E5E2D9] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-[#E5E2D9] pb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#2C2C2C] font-amiri flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[#4A5D4E]" />
                <span>حسابات ومواقع التواصل الاجتماعي للمؤلف (Social Media)</span>
              </h3>
              <span className="text-xs text-[#6E6A64]">تظهر في الهيدر، الفوتر وبطاقة الكاتب</span>
            </div>

            <p className="text-xs text-[#6E6A64]">
              أدخل روابط حساباتك الرسمية. الحقول الفارغة سيتم إخفاؤها تلقائياً من الموقع:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Twitter / X */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2C2C] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-800" />
                  <span>تويتر / منصة إكس (X / Twitter)</span>
                </label>
                <input
                  type="url"
                  value={profile.socialLinks.twitter || ''}
                  onChange={(e) => handleSocialChange('twitter', e.target.value)}
                  placeholder="https://x.com/aymankinani"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] text-xs text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              {/* Facebook */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2C2C] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>فيسبوك (Facebook)</span>
                </label>
                <input
                  type="url"
                  value={profile.socialLinks.facebook || ''}
                  onChange={(e) => handleSocialChange('facebook', e.target.value)}
                  placeholder="https://facebook.com/aymankinani"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] text-xs text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              {/* Instagram */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2C2C] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-pink-600" />
                  <span>انستغرام (Instagram)</span>
                </label>
                <input
                  type="url"
                  value={profile.socialLinks.instagram || ''}
                  onChange={(e) => handleSocialChange('instagram', e.target.value)}
                  placeholder="https://instagram.com/aymankinani"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] text-xs text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              {/* YouTube */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2C2C] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-600" />
                  <span>يوتيوب (YouTube)</span>
                </label>
                <input
                  type="url"
                  value={profile.socialLinks.youtube || ''}
                  onChange={(e) => handleSocialChange('youtube', e.target.value)}
                  placeholder="https://youtube.com/@aymankinani"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] text-xs text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              {/* Telegram */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2C2C] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  <span>قناة تيليجرام (Telegram)</span>
                </label>
                <input
                  type="url"
                  value={profile.socialLinks.telegram || ''}
                  onChange={(e) => handleSocialChange('telegram', e.target.value)}
                  placeholder="https://t.me/aymankinani"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] text-xs text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              {/* LinkedIn */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2C2C] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-700" />
                  <span>لينكد إن (LinkedIn)</span>
                </label>
                <input
                  type="url"
                  value={profile.socialLinks.linkedin || ''}
                  onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/aymankinani"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] text-xs text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              {/* TikTok */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2C2C] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-black" />
                  <span>تيك توك (TikTok)</span>
                </label>
                <input
                  type="url"
                  value={profile.socialLinks.tiktok || ''}
                  onChange={(e) => handleSocialChange('tiktok', e.target.value)}
                  placeholder="https://tiktok.com/@aymankinani"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] text-xs text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              {/* Goodreads */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2C2C] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-700" />
                  <span>جودريدز (Goodreads)</span>
                </label>
                <input
                  type="url"
                  value={profile.socialLinks.goodreads || ''}
                  onChange={(e) => handleSocialChange('goodreads', e.target.value)}
                  placeholder="https://goodreads.com/aymankinani"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] text-xs text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              {/* WhatsApp */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2C2C] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>واتساب (WhatsApp Link / Number)</span>
                </label>
                <input
                  type="text"
                  value={profile.socialLinks.whatsapp || ''}
                  onChange={(e) => handleSocialChange('whatsapp', e.target.value)}
                  placeholder="https://wa.me/966500000000"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] text-xs text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              {/* Website */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2C2C] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-600" />
                  <span>الموقع الإلكتروني الخاص</span>
                </label>
                <input
                  type="url"
                  value={profile.socialLinks.website || ''}
                  onChange={(e) => handleSocialChange('website', e.target.value)}
                  placeholder="https://aymankinani.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] text-xs text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
