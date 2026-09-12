import React, { useState, useEffect } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  Download,
  Copy,
  Check,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';

export interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
  caption?: string;
  author?: string;
  sourceUrl?: string;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  caption,
  author,
  sourceUrl,
}) => {
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Reset controls when opened
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setRotation(0);
      setCopied(false);
    }
  }, [isOpen, imageUrl]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        setScale(prev => Math.min(prev + 0.25, 3.5));
      } else if (e.key === '-' || e.key === '_') {
        setScale(prev => Math.max(prev - 0.25, 0.5));
      } else if (e.key === '0') {
        setScale(1);
        setRotation(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.4));
  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(imageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col bg-black/95 text-white backdrop-blur-md transition-all animate-in fade-in duration-200"
      dir="rtl"
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-black/60 border-b border-white/10 shrink-0 select-none">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
            <ImageIcon className="w-4 h-4 text-[#C88A3B]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold truncate text-white">
              {title || 'عرض الصورة بجودة فائقة وملء الشاشة'}
            </h3>
            {author && (
              <p className="text-[11px] text-white/60 truncate">
                المصدر والكاتب: {author}
              </p>
            )}
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Zoom controls */}
          <div className="flex items-center bg-white/10 rounded-xl p-1 border border-white/10">
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-white/20 rounded-lg text-white/90 hover:text-white transition-colors cursor-pointer"
              title="تكبير الصورة (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono px-2 text-white/80 select-none min-w-[45px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-white/20 rounded-lg text-white/90 hover:text-white transition-colors cursor-pointer"
              title="تصغير الصورة (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-2 py-1 text-[11px] hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer"
              title="إعادة للقياس الطبيعي (0)"
            >
              100%
            </button>
          </div>

          <button
            type="button"
            onClick={handleRotate}
            className="p-2 hover:bg-white/15 rounded-xl text-white/90 hover:text-white transition-colors cursor-pointer"
            title="تدوير الصورة 90 درجة"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 hover:bg-white/15 rounded-xl text-white/90 hover:text-white transition-colors cursor-pointer hidden sm:block"
            title={isFullscreen ? 'إنهاء ملء الشاشة' : 'ملء الشاشة بالكامل'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="p-2 hover:bg-white/15 rounded-xl text-white/90 hover:text-white transition-colors cursor-pointer"
            title="نسخ رابط الصورة المباشر"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="p-2 hover:bg-white/15 rounded-xl text-white/90 hover:text-white transition-colors cursor-pointer"
            title="فتح الصورة الأصلية في لسان جديد"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          <div className="w-px h-5 bg-white/20 mx-1" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-red-500/30 text-white/90 hover:text-red-400 rounded-xl transition-colors cursor-pointer"
            title="إغلاق المعاينة (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Viewport */}
      <div
        className="flex-1 flex items-center justify-center overflow-auto p-4 relative cursor-grab active:cursor-grabbing select-none"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transition: 'transform 0.15s ease-out',
          }}
          className="max-w-full max-h-full flex items-center justify-center"
        >
          <img
            src={imageUrl}
            alt={title || 'صورة بحث مكبرة'}
            className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg shadow-2xl ring-1 ring-white/10"
            draggable={false}
          />
        </div>
      </div>

      {/* Bottom Caption Bar */}
      {(caption || title || sourceUrl) && (
        <div className="px-6 py-3 bg-black/70 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-white/70 gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white/90">{caption || title}</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-white/50">
            <span>استخدم مفاتيح (+) للتكبير و (-) للتصغير و (Esc) للإغلاق</span>
          </div>
        </div>
      )}
    </div>
  );
};
