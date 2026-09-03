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
    // ⬇️ Logos configured from provided links:
    imageUrl: "https://i.imgur.com/QOLJJP8.png", 
    secondaryImageUrl: "https://i.imgur.com/swGpVmW.png",
    darkImageUrl: "https://i.imgur.com/swGpVmW.png",
    altText: "Vixora Digital Hub Logo"
  },
  heroBackground: {
    // ⬇️ Custom hero section background image:
    imageUrl: "https://i.imgur.com/lP5Ub4o.png", 
    overlayOpacity: 0.75
  }
};

/**
 * Extracts an Imgur image ID if the URL matches an Imgur link
 */
export function extractImgurId(url?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const imgurMatch = trimmed.match(/^https?:\/\/(?:[a-z0-9.]+\.)?imgur\.com\/(?:a\/|gallery\/)?([a-zA-Z0-9]+)(?:\.[a-zA-Z0-9]+)?/i);
  return (imgurMatch && imgurMatch[1]) ? imgurMatch[1] : null;
}

/**
 * Helper to normalize and convert any image URL (including imgur albums/pages) into a direct image CDN link.
 * Uses a multi-CDN proxy approach (wsrv.nl / i.imgur.com) to bypass hotlink blocking.
 */
export function getDirectImageUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  
  const imgurId = extractImgurId(trimmed);
  if (imgurId) {
    // Use wsrv.nl proxy as primary since Imgur often returns 403 Forbidden to foreign referrers/iframes
    return `https://wsrv.nl/?url=https://i.imgur.com/${imgurId}.png`;
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

  const imgurId = extractImgurId(trimmed);
  if (imgurId) {
    return [
      `https://wsrv.nl/?url=https://i.imgur.com/${imgurId}.png`,
      `https://i.imgur.com/${imgurId}.png`,
      `https://i.imgur.com/${imgurId}.jpg`,
      `https://images.weserv.nl/?url=https://i.imgur.com/${imgurId}.png`,
      `https://cdn.statically.io/img/i.imgur.com/${imgurId}.png`
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
