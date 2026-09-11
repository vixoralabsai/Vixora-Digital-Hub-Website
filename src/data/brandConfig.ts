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
  whatsappNumber: string;
  whatsappUrl: string;
  address: string;
  logo: {
    imageUrl: string;
    secondaryImageUrl?: string;
    mobileImageUrl?: string;
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
    imageUrl: "/images/vixora-digital-hub-logo.png",
    secondaryImageUrl: "/images/vixora-digital-hub-logo.png",
    mobileImageUrl: "/images/vixora-digital-hub-logo.png",
    darkImageUrl: "/images/vixora-digital-hub-logo.png",
    altText: "Vixora Digital Hub Logo"
  },
  heroBackground: {
    imageUrl: "/images/hero-background.png",
    overlayOpacity: 0.65
  }
};

export function extractImgurId(url?: string): string | null {
  return null;
}

export function getDirectImageUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  return trimmed;
}

export function getImageFallbacks(url?: string): string[] {
  if (!url) return ['/images/vixora-digital-hub-logo.png'];
  const trimmed = url.trim();
  if (!trimmed) return ['/images/vixora-digital-hub-logo.png'];

  if (
    trimmed.includes('brand-logo') ||
    trimmed.includes('vixora') ||
    trimmed.includes('logo')
  ) {
    return [
      '/images/vixora-digital-hub-logo.png',
      '/images/brand-logo-horizontal.png',
      '/images/brand-logo-mobile.png',
      '/images/vixora-icon.png',
      '/images/brand-logo-1.png'
    ];
  }
  if (trimmed.includes('hero-background')) {
    return ['/images/hero-background.png'];
  }

  return [trimmed, '/images/vixora-digital-hub-logo.png'];
}

export function getWhatsAppUrl(
  channel: 'us' | 'ng' = 'us',
  customMessage?: string
): string {
  const selected = channel === 'ng' ? BRAND_CONFIG.whatsapp.nigeria : BRAND_CONFIG.whatsapp.usAndGlobal;
  const message = customMessage || "Hello Vixora Digital Hub Team, I would like to discuss a project.";
  return `https://wa.me/${selected.cleanDigits}?text=${encodeURIComponent(message)}`;
}
