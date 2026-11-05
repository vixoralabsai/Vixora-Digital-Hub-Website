import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Globe } from 'lucide-react';
import { useCurrency, Currency } from '../context/CurrencyContext';

interface CurrencySwitcherProps {
  className?: string;
  variant?: 'dropdown' | 'compact' | 'segmented';
}

const CURRENCY_OPTIONS: Array<{
  code: Currency;
  label: string;
  symbol: string;
  flag: string;
  subtitle: string;
}> = [
  {
    code: 'NGN',
    label: 'NGN',
    symbol: '₦',
    flag: '🇳🇬',
    subtitle: 'Nigerian Naira (₦)',
  },
  {
    code: 'USD',
    label: 'USD',
    symbol: '$',
    flag: '🌐',
    subtitle: 'US Dollar ($)',
  },
];

export const CurrencySwitcher: React.FC<CurrencySwitcherProps> = ({
  className = '',
}) => {
  const { currency, setCurrency, isAutoDetected, detectedCountry } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeOption =
    CURRENCY_OPTIONS.find((opt) => opt.code === currency) || CURRENCY_OPTIONS[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (code: Currency) => {
    setCurrency(code);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select currency"
        title={
          isAutoDetected && detectedCountry
            ? `Detected location: ${detectedCountry}. Current: ${currency}. Click to switch.`
            : `Current currency: ${currency}. Click to switch.`
        }
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold font-mono bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
      >
        <span className="text-sm leading-none">{activeOption.flag}</span>
        <span className="font-bold tracking-tight text-white">{activeOption.symbol} {activeOption.code}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-purple-200 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-white' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Available currencies"
          className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-[#07031C] border border-purple-500/30 shadow-2xl p-1.5 space-y-1 z-50 text-white animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-purple-300 border-b border-purple-900/40 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-purple-400" />
              Currency
            </span>
            {isAutoDetected && (
              <span className="text-[9px] text-emerald-400 font-bold">Auto-detected</span>
            )}
          </div>

          {CURRENCY_OPTIONS.map((option) => {
            const isSelected = option.code === currency;
            return (
              <button
                key={option.code}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option.code)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
                  isSelected
                    ? 'bg-purple-600/30 text-white border border-purple-500/40 font-semibold'
                    : 'text-purple-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">{option.flag}</span>
                  <div className="flex flex-col">
                    <span className="font-mono font-bold leading-tight">
                      {option.symbol} {option.code}
                    </span>
                    <span className="text-[10px] text-purple-300/80 leading-tight">
                      {option.subtitle}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

