import { useState, useEffect } from 'react';

interface ScrollProgressBarProps {
  currentPage?: string;
  targetPages?: string[];
}

/**
 * Subtle viewport top scroll progress bar for long-form pages.
 * Defaults to targeting reading/long-form views like About, Academy, Course Landing, and Resources.
 */
export function ScrollProgressBar({
  currentPage,
  targetPages = ['about', 'academy', 'academy-course', 'resources', 'categories'],
}: ScrollProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const isTargetPage = !currentPage || targetPages.includes(currentPage);

  useEffect(() => {
    if (!isTargetPage) {
      setProgress(0);
      setIsVisible(false);
      return;
    }

    let ticking = false;

    const calculateScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const totalScrollable = scrollHeight - clientHeight;

      if (totalScrollable <= 100) {
        setIsVisible(false);
        setProgress(0);
        return;
      }

      const currentProgress = Math.min(Math.max(scrollTop / totalScrollable, 0), 1);
      setProgress(currentProgress);
      setIsVisible(currentProgress > 0.005);
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          calculateScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Calculate immediately on mount / page change
    calculateScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [currentPage, isTargetPage]);

  if (!isTargetPage || !isVisible) {
    return null;
  }

  return (
    <div
      id="vixora-scroll-progress-container"
      className="fixed top-0 left-0 right-0 h-[3px] z-[60] pointer-events-none overflow-hidden bg-purple-950/20"
      aria-hidden="true"
    >
      <div
        id="vixora-scroll-progress-bar"
        className="h-full w-full bg-gradient-to-r from-[#480878] via-[#7000F8] via-[#9030F8] to-[#38BDF8] transition-transform duration-100 ease-out origin-left shadow-[0_0_10px_rgba(144,48,248,0.85)]"
        style={{
          transform: `scaleX(${progress})`,
        }}
      />
    </div>
  );
}
