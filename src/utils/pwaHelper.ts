import { SiteBranding } from '../types';

let currentManifestBlobUrl: string | null = null;

/**
 * Dynamically applies site branding to browser tab, favicons, Apple Touch icons,
 * and the Web App Manifest (PWA). This ensures that any icon or name set in the
 * Control Panel immediately reflects on mobile home screens and desktop installs.
 */
export function applyBrandingToPWA(branding?: SiteBranding | null) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const currentBranding = branding || {
    siteName: 'أيمن كناني | Ayman Kinani',
    siteSubtitle: 'المنصة الرسمية لنشر المؤلفات والكتب',
    logoUrl: '',
    faviconUrl: '',
    pwaIconUrl: '',
    footerText: '',
  };

  const rawName = currentBranding.siteName?.trim() || 'أيمن كناني';
  const rawSubtitle = currentBranding.siteSubtitle?.trim() || 'المنصة الرسمية لنشر المؤلفات والكتب';
  
  // App short name for home screen icon label (max 12 chars per PWA spec)
  const shortName = rawName.includes('|') 
    ? rawName.split('|')[0].trim() 
    : (rawName.length > 12 ? 'أيمن كناني' : rawName);

  const fullName = `${rawName} - ${rawSubtitle}`;

  // Priority for app icon: PWA icon > Favicon > Logo > Default generated custom icon
  const iconSrc = currentBranding.pwaIconUrl?.trim() || 
                  currentBranding.faviconUrl?.trim() || 
                  currentBranding.logoUrl?.trim() || 
                  '/pwa-512.png';

  const faviconSrc = currentBranding.faviconUrl?.trim() || 
                     currentBranding.pwaIconUrl?.trim() || 
                     currentBranding.logoUrl?.trim() || 
                     '/pwa-192.png';

  // 1. Update Document Title
  if (rawName) {
    document.title = fullName;
  }

  // 2. Update Application Names in Meta tags
  const appNameMeta = document.querySelector('meta[name="application-name"]');
  if (appNameMeta) {
    appNameMeta.setAttribute('content', shortName);
  }

  const appleTitleMeta = document.querySelector('meta[name="apple-mobile-web-app-title"]');
  if (appleTitleMeta) {
    appleTitleMeta.setAttribute('content', shortName);
  }

  // 3. Update Apple Touch Icon (iOS Safari Home Screen)
  let appleIconLink = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
  if (!appleIconLink) {
    appleIconLink = document.createElement('link');
    appleIconLink.rel = 'apple-touch-icon';
    document.head.appendChild(appleIconLink);
  }
  appleIconLink.href = iconSrc;

  // 4. Update Favicons (Browser Tab & Bookmarks)
  const favicons = document.querySelectorAll('link[rel*="icon"]');
  favicons.forEach(el => {
    const link = el as HTMLLinkElement;
    if (link.rel.includes('apple-touch')) return;
    link.href = faviconSrc;
  });

  // 5. Update Web App Manifest dynamically via Blob URL
  try {
    const manifestData = {
      id: '/',
      short_name: shortName,
      name: fullName,
      description: rawSubtitle,
      start_url: '/',
      scope: '/',
      display: 'standalone',
      orientation: 'portrait-primary',
      dir: 'rtl',
      lang: 'ar',
      background_color: '#FDFCF8',
      theme_color: '#4A5D4E',
      icons: [
        {
          src: iconSrc,
          type: iconSrc.startsWith('data:image/svg') ? 'image/svg+xml' : 'image/png',
          sizes: '192x192 512x512',
          purpose: 'any',
        },
        {
          src: '/pwa-192.png',
          type: 'image/png',
          sizes: '192x192',
          purpose: 'any',
        },
        {
          src: '/pwa-512.png',
          type: 'image/png',
          sizes: '512x512',
          purpose: 'any',
        },
        {
          src: '/pwa-maskable-512.png',
          type: 'image/png',
          sizes: '512x512',
          purpose: 'maskable',
        },
        {
          src: '/apple-touch-icon.png',
          type: 'image/png',
          sizes: '180x180',
          purpose: 'any',
        },
      ],
    };

    const manifestString = JSON.stringify(manifestData);
    const blob = new Blob([manifestString], { type: 'application/json' });
    
    // Revoke previous blob URL to prevent memory leaks
    if (currentManifestBlobUrl) {
      URL.revokeObjectURL(currentManifestBlobUrl);
    }

    currentManifestBlobUrl = URL.createObjectURL(blob);

    let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      document.head.appendChild(manifestLink);
    }
    manifestLink.href = currentManifestBlobUrl;
  } catch (err) {
    console.warn('Dynamic manifest creation error:', err);
  }
}
