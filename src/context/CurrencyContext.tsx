import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { COURSE_PRICING, SupportedCourseCurrency } from '../data/coursePricing';

const STORAGE_KEY = 'vixora_user_currency';

export type Currency = SupportedCourseCurrency;

interface CurrencyContextType {
  currency: Currency;
  currencySymbol: string;
  isNigeria: boolean;
  setCurrency: (c: Currency) => void;
  formatPrice: (courseIdOrSlug: string, fallback?: string) => string;
  getNumericPrice: (courseIdOrSlug: string) => number | null;
  formatRawAmount: (amountNgn: number, amountUsd?: number | null) => string;
  toggleCurrency: () => void;
  detectedCountry?: string;
  isAutoDetected: boolean;
  // Live FX Exchange Rate properties
  fxRates: Record<string, number>;
  fxRateNgn: number;
  fxLastUpdated?: string;
  fxSource?: string;
  isFxLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

// Normalizes course slugs or aliases to canonical course IDs in COURSE_PRICING
function resolveCourseId(slugOrId: string): string {
  if (!slugOrId) return '';
  const clean = slugOrId.toLowerCase().trim();

  // Direct match
  if (COURSE_PRICING[clean]) return clean;

  const mapping: Record<string, string> = {
    // 2026 Active Curriculum Courses
    'course-ai-automation-c2': 'course-ai-automation-c2',
    'ai-automation-digital-literacy': 'course-ai-automation-c2',
    'ai-automation-c2': 'course-ai-automation-c2',

    'course-va-setter-c2': 'course-va-setter-c2',
    'virtual-assistance-appointment-setter': 'course-va-setter-c2',
    'va-setter-c2': 'course-va-setter-c2',

    'course-web-dev-c2': 'course-web-dev-c2',
    'ai-web-development-vibe-coding': 'course-web-dev-c2',
    'web-dev-c2': 'course-web-dev-c2',

    'course-content-creation-c2': 'course-content-creation-c2',
    'ai-content-creation-media': 'course-content-creation-c2',
    'content-creation-c2': 'course-content-creation-c2',

    'course-data-science-ml-c2': 'course-data-science-ml-c2',
    'machine-learning-data-science': 'course-data-science-ml-c2',
    'data-science-ml-c2': 'course-data-science-ml-c2',

    'course-data-analysis-c2': 'course-data-analysis-cohort',
    'data-analysis-cohort': 'course-data-analysis-cohort',
    'course-data-analysis-cohort': 'course-data-analysis-cohort',

    // Cohort 1.0 Master Vault (Preserved)
    'cohort-1': 'course-cohort-1-master-bundle',
    'cohort-1-master-bundle': 'course-cohort-1-master-bundle',
    'cohort-1-bundle': 'course-cohort-1-master-bundle',
    'bundle': 'course-cohort-1-master-bundle',

    // Legacy Course Aliases
    'ai-content-creation': 'course-ai-image-short-videos-creation',
    'track-content-creation': 'course-ai-image-short-videos-creation',
    'ai-image-short-videos-creation': 'course-ai-image-short-videos-creation',
    'course-ai-content-creation': 'course-ai-image-short-videos-creation',

    'ai-automation': 'course-ai-automation-digital-skills',
    'track-ai-automation': 'course-ai-automation-digital-skills',
    'ai-automation-digital-skills': 'course-ai-automation-digital-skills',
    'course-ai-automation': 'course-ai-automation-digital-skills',

    'ai-web-development': 'course-fullstack-vibe-coding',
    'track-web-development': 'course-fullstack-vibe-coding',
    'full-stack-vibe-coding': 'course-fullstack-vibe-coding',
    'fullstack-vibe-coding': 'course-fullstack-vibe-coding',
    'ai-web-dev': 'course-fullstack-vibe-coding',

    'client-acquisition': 'course-client-acquisition-freelancing',
    'track-client-acquisition': 'course-client-acquisition-freelancing',
    'client-acquisition-freelancing': 'course-client-acquisition-freelancing',
  };

  return mapping[clean] || clean;
}

function detectInitialCurrency(): { currency: Currency; isNigeria: boolean } {
  // 1. Check local storage
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'NGN' || stored === 'USD') {
        return { currency: stored, isNigeria: stored === 'NGN' };
      }
    } catch {
      // Storage unavailable
    }

    // 2. Client-side heuristic via browser timezone
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      const isLagos = timeZone === 'Africa/Lagos' || timeZone.includes('Lagos');
      if (isLagos) {
        return { currency: 'NGN', isNigeria: true };
      }
      // Anyone with a timezone outside Nigeria defaults to USD
      if (timeZone) {
        return { currency: 'USD', isNigeria: false };
      }
    } catch {
      // Ignore
    }
  }

  // Default to USD for foreign audience safety
  return { currency: 'USD', isNigeria: false };
}

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [initial] = useState(detectInitialCurrency);
  const [currency, setCurrencyState] = useState<Currency>(initial.currency);
  const [isNigeria, setIsNigeria] = useState<boolean>(initial.isNigeria);
  const [detectedCountry, setDetectedCountry] = useState<string | undefined>(undefined);
  const [isAutoDetected, setIsAutoDetected] = useState<boolean>(false);

  // FX Rates State
  const [fxRates, setFxRates] = useState<Record<string, number>>({ USD: 1, NGN: 1450 });
  const [fxLastUpdated, setFxLastUpdated] = useState<string | undefined>(undefined);
  const [fxSource, setFxSource] = useState<string | undefined>(undefined);
  const [isFxLoading, setIsFxLoading] = useState<boolean>(true);

  // Set currency and store preference
  const setCurrency = useCallback((newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    setIsNigeria(newCurrency === 'NGN');
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, newCurrency);
      } catch (e) {
        console.warn('Failed to save currency to localStorage:', e);
      }
    }
  }, []);

  const toggleCurrency = useCallback(() => {
    setCurrency(currency === 'NGN' ? 'USD' : 'NGN');
  }, [currency, setCurrency]);

  // Fetch FX rates on mount
  useEffect(() => {
    let isMounted = true;
    fetch('/api/exchange-rates')
      .then((res) => {
        if (!res.ok) throw new Error('Exchange rate API response not ok');
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        if (data && data.success && data.rates && typeof data.rates.NGN === 'number') {
          setFxRates(data.rates);
          setFxLastUpdated(data.lastUpdated);
          setFxSource(
            data.source === 'live' || data.source === 'cache'
              ? 'ExchangeRate-API (24h)'
              : 'Fixed Rates'
          );
        }
      })
      .catch((err) => {
        console.warn('[CurrencyContext] FX rate fetch error:', err);
      })
      .finally(() => {
        if (isMounted) setIsFxLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Geolocation detection via backend API or Geo IP
  useEffect(() => {
    let isMounted = true;

    // Check if user has already set a manual preference
    const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored === 'NGN' || stored === 'USD') {
      return; // Respect user explicit choice
    }

    // Query backend geolocation endpoint
    fetch('/api/geo')
      .then((res) => {
        if (!res.ok) throw new Error('Geo endpoint unavailable');
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        if (data && typeof data.country === 'string') {
          const countryCode = data.country.toUpperCase();
          setDetectedCountry(countryCode);
          const isNg = countryCode === 'NG';
          setIsNigeria(isNg);
          setCurrencyState(isNg ? 'NGN' : 'USD');
          setIsAutoDetected(true);
        }
      })
      .catch(() => {
        // Fallback: Check public geo IP service if backend doesn't have country headers
        fetch('https://api.country.is')
          .then((res) => res.json())
          .then((data) => {
            if (!isMounted) return;
            if (data && data.country) {
              const countryCode = String(data.country).toUpperCase();
              setDetectedCountry(countryCode);
              const isNg = countryCode === 'NG';
              setIsNigeria(isNg);
              setCurrencyState(isNg ? 'NGN' : 'USD');
              setIsAutoDetected(true);
            }
          })
          .catch(() => {
            // Keep timezone-based initial detection
          });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const currencySymbol = useMemo(() => {
    return currency === 'NGN' ? '₦' : '$';
  }, [currency]);

  const fxRateNgn = useMemo(() => {
    return fxRates['NGN'] || 1450;
  }, [fxRates]);

  // Format price for a course
  const formatPrice = useCallback((courseIdOrSlug: string, fallback?: string): string => {
    const resolvedId = resolveCourseId(courseIdOrSlug);
    const prices = COURSE_PRICING[resolvedId];

    if (currency === 'USD') {
      if (prices && prices.USD != null) {
        return `$${prices.USD.toLocaleString()}`;
      }
      // If course is Cohort 1 bundle
      if (resolvedId === 'course-cohort-1-master-bundle') return '$45';
      if (fallback && fallback.includes('$')) return fallback;
      return fallback || '$45';
    }

    // NGN
    if (prices && prices.NGN != null) {
      return `₦${prices.NGN.toLocaleString()}`;
    }
    if (fallback && fallback.includes('₦')) return fallback;
    return fallback || '₦45,000';
  }, [currency]);

  // Get raw numeric amount in active currency
  const getNumericPrice = useCallback((courseIdOrSlug: string): number | null => {
    const resolvedId = resolveCourseId(courseIdOrSlug);
    const prices = COURSE_PRICING[resolvedId];
    if (!prices) return null;
    return currency === 'USD' ? prices.USD : prices.NGN;
  }, [currency]);

  // Format arbitrary raw amounts
  const formatRawAmount = useCallback((amountNgn: number, amountUsd?: number | null): string => {
    if (currency === 'USD') {
      if (amountUsd != null) {
        return `$${amountUsd.toLocaleString()}`;
      }
      // Approximate fallback using fxRateNgn if amountUsd is not configured
      const approx = Math.round(amountNgn / (fxRateNgn || 1450));
      return `$${approx.toLocaleString()}`;
    }
    return `₦${amountNgn.toLocaleString()}`;
  }, [currency, fxRateNgn]);

  const value = useMemo(() => ({
    currency,
    currencySymbol,
    isNigeria,
    setCurrency,
    formatPrice,
    getNumericPrice,
    formatRawAmount,
    toggleCurrency,
    detectedCountry,
    isAutoDetected,
    fxRates,
    fxRateNgn,
    fxLastUpdated,
    fxSource,
    isFxLoading,
  }), [
    currency,
    currencySymbol,
    isNigeria,
    setCurrency,
    formatPrice,
    getNumericPrice,
    formatRawAmount,
    toggleCurrency,
    detectedCountry,
    isAutoDetected,
    fxRates,
    fxRateNgn,
    fxLastUpdated,
    fxSource,
    isFxLoading,
  ]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export function useCurrency(): CurrencyContextType {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
