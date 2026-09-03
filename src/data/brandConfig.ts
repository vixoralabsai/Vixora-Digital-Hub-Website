/**
 * Brand Configuration for Vixora Digital Hub
 *
 * You can easily update your domain, logo link, hero background image link,
 * and WhatsApp contact channels below.
 */

export interface WhatsAppChannel {
  id: 'us' | 'ng';
  label: string;
  region: string;
  displayNumber: string;
  fullInternationalNumber: string;
  cleanDigits: string;
  flagEmoji: string;
  isPrimary?: boolean;
}

export interface BrandConfig {
  name: string;
  tagline: string;
  domain: string;
  cleanDomain: string;
  academyDomain: string;
  cleanAcademyDomain: string;
  email: string;
  secondaryEmail: string;
  phone: string;
  whatsapp: {
    usAndGlobal: WhatsAppChannel;
    nigeria: WhatsAppChannel;
    defaultUrl: string;
  };
  // Fallback flat fields for backward compatibility
  whatsappNumber: string;
  whatsappUrl: string;
  address: string;
  logo: {
    imageUrl: string;
    secondaryImageUrl?: string;
    darkImageUrl?: string;
    altText: string;
  };
  heroBackground: {
    imageUrl: string;
    overlayOpacity: number;
  };
}

export const BRAND_CONFIG: BrandConfig = {
  name: "Vixora Digital Hub",
  tagline: "Software • AI • Automation",
  domain: "https://www.vixoradigitalhub.com",
  cleanDomain: "vixoradigitalhub.com",
  academyDomain: "https://academy.vixoradigitalhub.com",
  cleanAcademyDomain: "academy.vixoradigitalhub.com",
  email: "vixoralabsai@gmail.com",
  secondaryEmail: "hello@vixoradigitalhub.com",
  phone: "+1 (279) 257-4850",
  whatsapp: {
    usAndGlobal: {
      id: 'us',
      label: "US & Foreign Inbounds",
      region: "United States, Americas, Europe & Global",
      displayNumber: "+1 (279) 257-4850",
      fullInternationalNumber: "+12792574850",
      cleanDigits: "12792574850",
      flagEmoji: "🇺🇸 🌐",
      isPrimary: true
    },
    nigeria: {
      id: 'ng',
      label: "Nigeria Inbounds",
      region: "Nigeria & West Africa Region",
      displayNumber: "08114542934",
      fullInternationalNumber: "+2348114542934",
      cleanDigits: "2348114542934",
      flagEmoji: "🇳🇬",
      isPrimary: false
    },
    defaultUrl: "https://wa.me/12792574850?text=Hello%20Vixora%20Digital%20Hub%20Team%2C%20I%20would%20like%20to%20discuss%20a%20new%20project."
  },
  whatsappNumber: "+1 (279) 257-4850",
  whatsappUrl: "https://wa.me/12792574850?text=Hello%20Vixora%20Digital%20Hub%20Team%2C%20I%20would%20like%20to%20discuss%20a%20new%20project.",
  address: "Vixora Digital Hub Headquarters, Silicon Corridor & Cloud Innovation Center",
  logo: {
    // ⬇️ Brand logo image files:
    imageUrl: "/images/brand-logo-1.png", 
    secondaryImageUrl: "/images/brand-logo-2.png",
    darkImageUrl: "/images/brand-logo-2.png",
    altText: "Vixora Digital Hub Logo"
  },
  heroBackground: {
    // ⬇️ Hero section background image:
    imageUrl: "/images/hero-background.png", 
    overlayOpacity: 0.65
  }
};

/**
 * Extracts an Imgur image ID if the URL matches an Imgur link
 */
export function extractImgurId(url?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  
  // Specific mappings for known album/page hashes
  if (trimmed.includes('lP5Ub4o')) return 'hV70o1X';
  if (trimmed.includes('QOLJJP8')) return '7APTK1Z';
  if (trimmed.includes('swGpVmW')) return 'swGpVmW';

  const imgurMatch = trimmed.match(/^https?:\/\/(?:[a-z0-9.]+\.)?imgur\.com\/(?:a\/|gallery\/)?([a-zA-Z0-9]+)(?:\.[a-zA-Z0-9]+)?/i);
  return (imgurMatch && imgurMatch[1]) ? imgurMatch[1] : null;
}

/**
 * Helper to normalize and convert any image URL into a direct image CDN link.
 */
export function getDirectImageUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  
  if (trimmed.startsWith('/') || trimmed.startsWith('data:')) {
    return trimmed;
  }

  const imgurId = extractImgurId(trimmed);
  if (imgurId) {
    return `https://i.imgur.com/${imgurId}.png`;
  }
  
  return trimmed;
}

/**
 * Generates an array of fallback URLs for resilient image loading
 */
export function getImageFallbacks(url?: string): string[] {
  if (!url) return [];
  const trimmed = url.trim();
  if (!trimmed) return [];

  // Local assets fallbacks
  if (trimmed === '/images/brand-logo-1.png') {
    return ['/images/brand-logo-1.png', 'https://i.imgur.com/7APTK1Z.png', '/images/brand-logo-2.png'];
  }
  if (trimmed === '/images/brand-logo-2.png') {
    return ['/images/brand-logo-2.png', 'https://i.imgur.com/swGpVmW.png', '/images/brand-logo-1.png'];
  }
  if (trimmed === '/images/hero-background.png') {
    return ['/images/hero-background.png', 'https://i.imgur.com/hV70o1X.png'];
  }

  const imgurId = extractImgurId(trimmed);
  if (imgurId) {
    return [
      `https://i.imgur.com/${imgurId}.png`,
      `https://i.imgur.com/${imgurId}.jpg`,
      `https://wsrv.nl/?url=https://i.imgur.com/${imgurId}.png`
    ];
  }

  return [trimmed];
}

/**
 * Helper to generate pre-filled WhatsApp click-to-chat links
 */
export function getWhatsAppUrl(
  channel: 'us' | 'ng' = 'us',
  customMessage?: string
): string {
  const selected = channel === 'ng' ? BRAND_CONFIG.whatsapp.nigeria : BRAND_CONFIG.whatsapp.usAndGlobal;
  const message = customMessage || "Hello Vixora Digital Hub Team, I would like to discuss a project.";
  return `https://wa.me/${selected.cleanDigits}?text=${encodeURIComponent(message)}`;
}
