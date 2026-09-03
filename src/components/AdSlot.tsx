import React, { useEffect } from 'react';
import { AdPlacement, AdSettings } from '../types';
import { storageService } from '../services/storageService';
import { ExternalLink, Sparkles, ShieldCheck } from 'lucide-react';

interface AdSlotProps {
  location: 'header' | 'sidebar' | 'mid_chapter' | 'chapter_end' | 'footer' | 'floating_bottom';
  adSettings: AdSettings;
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ location, adSettings, className = '' }) => {
  const placement: AdPlacement | undefined = adSettings.placements[location];

  useEffect(() => {
    if (placement?.enabled && placement.type === 'corporate' && placement.corporateSponsorId) {
      storageService.recordSponsorImpression(placement.corporateSponsorId);
    }
  }, [placement?.enabled, placement?.type, placement?.corporateSponsorId]);

  if (!placement || !placement.enabled) {
    return null;
  }

  const sponsor = placement.corporateSponsorId
    ? adSettings.corporateSponsors.find(s => s.id === placement.corporateSponsorId)
    : adSettings.corporateSponsors[0];

  const handleSponsorClick = (sponsorId?: string) => {
    if (sponsorId) {
      storageService.recordSponsorClick(sponsorId);
    }
  };

  // Google AdSense rendering
  if (placement.type === 'adsense') {
    const isTestMode = adSettings.googleAdSense.testMode;
    const publisherId = adSettings.googleAdSense.publisherId || 'ca-pub-9842103859124012';
    const slotId = placement.adSlotId || '3948571029';

    return (
      <aside 
        id={`ad-slot-${location}`}
        aria-label="Advertisement"
        className={`my-6 mx-auto w-full transition-all duration-300 ${className}`}
      >
        <div className="flex items-center justify-between px-3 py-1 bg-[#F7F5EE] border-t border-x border-[#E5E2D9] rounded-t text-[11px] text-[#6E6A64] font-sans">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#4A5D4E]"></span>
            ADVERTISEMENT · GOOGLE ADSENSE
          </span>
          <span className="text-[10px] text-[#6E6A64]">
            {isTestMode ? 'TEST MODE PREVIEW' : `SLOT #${slotId}`}
          </span>
        </div>

        <div className="relative border border-[#E5E2D9] bg-[#FFFFFF] rounded-b p-4 text-center overflow-hidden flex flex-col items-center justify-center min-h-[100px] shadow-xs">
          {isTestMode ? (
            <div className="flex flex-col items-center justify-center py-2 px-4 max-w-lg">
              <div className="flex items-center gap-2 mb-1 text-[#4A5D4E] text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Google AdSense Slot · {placement.name}</span>
              </div>
              <p className="text-xs text-[#2C2C2C]">
                Ad Client: <code className="text-[#4A5D4E] font-mono bg-[#F7F5EE] border border-[#E5E2D9] px-1 py-0.5 rounded">{publisherId}</code>
              </p>
              <p className="text-[11px] text-[#6E6A64] mt-1">
                Responsive Display Ad ({placement.adFormat || 'auto'}) · Ready for live publisher delivery
              </p>
            </div>
          ) : (
            <div className="w-full flex justify-center py-1">
              {/* In production this executes Google AdSense script tags */}
              <ins
                className="adsbygoogle"
                style={{ display: 'block', textAlign: 'center', width: '100%' }}
                data-ad-layout="in-article"
                data-ad-format={placement.adFormat || 'auto'}
                data-ad-client={publisherId}
                data-ad-slot={slotId}
                data-full-width-responsive="true"
              />
              <div className="text-xs text-[#6E6A64] py-2">
                Live AdSense Unit Active ({publisherId})
              </div>
            </div>
          )}
        </div>
      </aside>
    );
  }

  // Corporate Sponsor Banner rendering
  if (placement.type === 'corporate' && sponsor) {
    return (
      <aside 
        id={`ad-sponsor-${location}`}
        aria-label="Sponsored Partner"
        className={`my-6 mx-auto w-full group transition-all duration-300 ${className}`}
      >
        <div className="flex items-center justify-between px-3 py-1 bg-[#F7F5EE] border-t border-x border-[#E5E2D9] rounded-t text-[11px] text-[#4A5D4E] font-sans">
          <span className="flex items-center gap-1.5 font-medium tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5 text-[#4A5D4E]" />
            SPONSORED PARTNER · {sponsor.badge.toUpperCase()}
          </span>
          <span className="text-[10px] text-[#6E6A64]">Verified Corporate Sponsor</span>
        </div>

        <a
          href={sponsor.targetUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={() => handleSponsorClick(sponsor.id)}
          className="block relative border border-[#E5E2D9] hover:border-[#4A5D4E] bg-[#FFFFFF] hover:bg-[#FDFCF8] transition-all rounded-b p-4 overflow-hidden shadow-xs"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {sponsor.imageUrl && (
              <img
                src={sponsor.imageUrl}
                alt={sponsor.sponsorName}
                className="w-full sm:w-32 h-20 sm:h-20 object-cover rounded-lg shadow-xs border border-[#E5E2D9] flex-shrink-0"
              />
            )}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h4 className="text-[#2C2C2C] font-serif font-bold text-sm sm:text-base group-hover:text-[#4A5D4E] transition-colors">
                  {sponsor.sponsorName}
                </h4>
                <span className="text-[10px] bg-[#4A5D4E]/15 text-[#4A5D4E] px-2 py-0.5 rounded-full border border-[#4A5D4E]/30 font-sans font-semibold">
                  {sponsor.badge}
                </span>
              </div>
              <p className="text-xs text-[#6E6A64] line-clamp-2 mb-2 font-sans">
                {sponsor.tagline}
              </p>
            </div>
            <div className="flex-shrink-0">
              <button
                type="button"
                id={`sponsor-cta-btn-${sponsor.id}`}
                className="px-3.5 py-1.5 bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8] font-sans font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>{sponsor.ctaText}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </a>
      </aside>
    );
  }

  return null;
};
