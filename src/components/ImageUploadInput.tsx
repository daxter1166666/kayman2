import React, { useState, useRef } from 'react';
import {
  Upload,
  Link,
  Sparkles,
  Image as ImageIcon,
  X,
  CheckCircle2,
  FolderOpen,
  Eye,
  RefreshCw
} from 'lucide-react';

interface ImageUploadInputProps {
  label: string;
  subLabel?: string;
  value: string;
  onChange: (newUrl: string) => void;
  aspectRatio?: '2/3' | '16/9' | 'square';
  placeholder?: string;
  presets?: { title: string; url: string }[];
}

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  label,
  subLabel,
  value,
  onChange,
  aspectRatio = '2/3',
  placeholder = 'https://...',
  presets = [],
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setErrorMessage(null);
    if (!file.type.startsWith('image/')) {
      setErrorMessage('يرجى اختيار ملف صورة صالح (PNG, JPG, WebP, GIF)');
      return;
    }

    // Max 10MB check
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 10 ميجابايت.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onChange(e.target.result as string);
      }
    };
    reader.onerror = () => {
      setErrorMessage('تعذر قراءة ملف الصورة من الحاسوب.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const aspectClass = {
    '2/3': 'aspect-[2/3] max-w-[150px]',
    '16/9': 'aspect-[16/9] w-full max-w-[280px]',
    'square': 'aspect-square max-w-[150px]',
  }[aspectRatio];

  return (
    <div className="space-y-2 font-cairo">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold text-[#2C2C2C] block">
            {label}
          </label>
          {subLabel && (
            <p className="text-[11px] text-[#6E6A64]">
              {subLabel}
            </p>
          )}
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-[#F7F5EE] p-0.5 rounded-xl border border-[#E5E2D9] text-[11px]">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'upload'
                ? 'bg-[#4A5D4E] text-[#FDFCF8] shadow-2xs'
                : 'text-[#6E6A64] hover:text-[#2C2C2C]'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>من الحاسوب</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'url'
                ? 'bg-[#4A5D4E] text-[#FDFCF8] shadow-2xs'
                : 'text-[#6E6A64] hover:text-[#2C2C2C]'
            }`}
          >
            <Link className="w-3 h-3" />
            <span>رابط مباشر</span>
          </button>

          {presets.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'presets'
                  ? 'bg-[#4A5D4E] text-[#FDFCF8] shadow-2xs'
                  : 'text-[#6E6A64] hover:text-[#2C2C2C]'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>أغلفة جاهزة</span>
            </button>
          )}
        </div>
      </div>

      {errorMessage && (
        <p className="text-xs text-rose-600 font-bold animate-in fade-in">
          ⚠️ {errorMessage}
        </p>
      )}

      {/* Mode 1: Upload from Computer */}
      {activeTab === 'upload' && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`p-4 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-2 ${
            dragOver
              ? 'border-[#4A5D4E] bg-[#4A5D4E]/10 scale-[1.01]'
              : 'border-[#D0CCC2] hover:border-[#4A5D4E] bg-[#FDFCF8] hover:bg-[#F7F5EE]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />
          <div className="w-10 h-10 rounded-xl bg-[#4A5D4E]/10 text-[#4A5D4E] flex items-center justify-center">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#2C2C2C]">
              اسحب وأفلت صورة الغلاف هنا، أو <span className="text-[#4A5D4E] underline">تصفح ملفات جهازك</span>
            </p>
            <p className="text-[10px] text-[#8E8A83] mt-0.5">
              يدعم كافة الصيغ (PNG, JPG, WebP) بأعلى دقة
            </p>
          </div>
        </div>
      )}

      {/* Mode 2: Direct URL */}
      {activeTab === 'url' && (
        <div className="relative">
          <input
            type="url"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full pr-3.5 pl-9 py-2.5 text-xs rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] focus:border-[#4A5D4E] focus:ring-1 focus:ring-[#4A5D4E] focus:outline-none font-mono text-left"
            dir="ltr"
          />
          <Link className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8A83]" />
        </div>
      )}

      {/* Mode 3: Preset Templates */}
      {activeTab === 'presets' && presets.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
          {presets.map((preset, idx) => (
            <div
              key={idx}
              onClick={() => onChange(preset.url)}
              className={`group relative rounded-xl overflow-hidden border cursor-pointer transition-all aspect-[2/3] ${
                value === preset.url
                  ? 'border-[#4A5D4E] ring-2 ring-[#4A5D4E]'
                  : 'border-[#E5E2D9] hover:border-[#4A5D4E]/50'
              }`}
            >
              <img
                src={preset.url}
                alt={preset.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-x-0 bottom-0 p-1 bg-gradient-to-t from-black/80 to-transparent text-white text-[9px] font-bold text-center truncate">
                {preset.title}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Live Preview & Clear Thumbnail */}
      {value && (
        <div className="p-3 rounded-2xl bg-[#F7F5EE] border border-[#E5E2D9] flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg overflow-hidden border border-[#E5E2D9] shadow-xs bg-black/10 shrink-0 ${aspectClass}`}>
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>تم تجهيز الصورة بنجاح</span>
              </span>
              <p className="text-[10px] text-[#6E6A64] truncate max-w-[200px] sm:max-w-xs font-mono mt-0.5">
                {value.startsWith('data:') ? 'صورة مرفوعة من الحاسوب' : value}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onChange('')}
            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer"
            title="إزالة الصورة"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">إزالة</span>
          </button>
        </div>
      )}
    </div>
  );
};
