import { useState } from 'react';
import { BRAND_CONFIG, getImageFallbacks, getDirectImageUrl } from '../data/brandConfig';

interface BrandLogoProps {
  className?: string;
  imgClassName?: string;
  variant?: 'primary' | 'secondary';
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function BrandLogo({
  className = '',
  imgClassName = '',
  variant = 'primary',
  showText = true,
  size = 'md'
}: BrandLogoProps) {
  const targetUrl = variant === 'secondary' && BRAND_CONFIG.logo.secondaryImageUrl
    ? BRAND_CONFIG.logo.secondaryImageUrl
    : BRAND_CONFIG.logo.imageUrl;

  const fallbackList = getImageFallbacks(targetUrl);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [hasFailedAll, setHasFailedAll] = useState(false);

  const handleImgError = () => {
    if (currentIdx + 1 < fallbackList.length) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setHasFailedAll(true);
    }
  };

  const heightClasses = {
    sm: 'h-8 sm:h-9 max-w-[180px]',
    md: 'h-10 sm:h-12 md:h-14 max-w-[260px] sm:max-w-[320px]',
    lg: 'h-14 sm:h-20 max-w-[380px]'
  };

  const currentSrc = fallbackList[currentIdx] || getDirectImageUrl(targetUrl);

  if (targetUrl && !hasFailedAll) {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <img
          src={currentSrc}
          alt={BRAND_CONFIG.logo.altText || BRAND_CONFIG.name}
          referrerPolicy="no-referrer"
          onError={handleImgError}
          className={`${heightClasses[size]} w-auto object-contain object-left drop-shadow-md transition-opacity duration-300 ${imgClassName}`}
        />
      </div>
    );
  }

  // Fallback Vector 3D Geometric Faceted 'V' Icon & typography
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative w-9 h-9 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
        <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-[0_0_12px_rgba(168,85,247,0.7)]">
          <defs>
            <linearGradient id="brandVLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
            <linearGradient id="brandVRight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
          </defs>
          <polygon points="6,6 16,6 20,32 13,32" fill="url(#brandVLeft)" />
          <polygon points="34,6 24,6 20,32 27,32" fill="url(#brandVRight)" />
          <polygon points="16,6 24,6 20,32" fill="#180B2B" opacity="0.6" />
          <polyline points="6,6 20,33 34,6" stroke="#C084FC" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-lg tracking-wider text-white">
              VIXORA
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              HUB
            </span>
          </div>
          <span className="text-[9px] font-mono text-neutral-400 tracking-widest uppercase">
            SOFTWARE &bull; AI &bull; AUTOMATION
          </span>
        </div>
      )}
    </div>
  );
}
