import { useEffect, useState } from 'react';
import { useLoading } from '../context/LoadingContext';
import { Loader2, Sparkles } from 'lucide-react';

export function GlobalLoadingIndicator() {
  const { isLoading, loadingMessage, progress } = useLoading();
  const [visible, setVisible] = useState(false);

  // Slight debounce to avoid brief flickering on near-instant responses
  useEffect(() => {
    let timeout: any;
    if (isLoading) {
      timeout = setTimeout(() => setVisible(true), 80);
    } else {
      timeout = setTimeout(() => setVisible(false), 200);
    }
    return () => clearTimeout(timeout);
  }, [isLoading]);

  return (
    <>
      {/* 1. Global Viewport Top Glow Progress Bar */}
      {(isLoading || progress > 0) && (
        <div
          className="fixed top-0 left-0 right-0 z-[99999] h-[3.5px] bg-transparent pointer-events-none overflow-hidden"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div
            className="h-full bg-gradient-to-r from-[#5B5FED] via-[#9030F8] to-[#10B981] transition-all duration-200 ease-out shadow-[0_0_12px_rgba(144,48,248,0.85)] relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/25 animate-pulse" />
          </div>
        </div>
      )}

      {/* 2. Floating Tactile Loading Pill (Only when visible & active) */}
      {visible && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-[99998] pointer-events-none select-none animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[#0F1535]/95 text-white backdrop-blur-md border border-[#5B5FED]/40 shadow-xl shadow-[#0F1535]/40 text-xs font-semibold">
            <div className="relative flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-[#C7A0FF] animate-spin" />
              <div className="absolute inset-0 rounded-full animate-ping opacity-25 bg-[#9030F8]" />
            </div>
            <span className="text-neutral-100 font-sans tracking-wide">
              {loadingMessage || 'Loading...'}
            </span>
            <Sparkles className="w-3.5 h-3.5 text-[#FFD700] animate-pulse" />
          </div>
        </div>
      )}
    </>
  );
}
