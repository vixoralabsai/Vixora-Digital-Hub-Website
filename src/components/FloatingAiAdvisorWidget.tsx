import React from 'react';
import { Sparkles, Bot } from 'lucide-react';

interface FloatingAiAdvisorWidgetProps {
  onOpen: () => void;
}

export const FloatingAiAdvisorWidget: React.FC<FloatingAiAdvisorWidgetProps> = ({ onOpen }) => {
  return (
    <aside aria-label="AI Advisor Quick Launch" className="fixed bottom-6 left-6 z-40 font-sans print:hidden">
      <button
        onClick={onOpen}
        className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#0C061F] via-[#480878] to-[#7000F8] hover:from-[#480878] hover:to-[#9030F8] text-white shadow-2xl shadow-purple-950/80 border-2 border-purple-400/50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        aria-label="Open Vixora AI Advisor"
      >
        <div className="relative flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#0C061F]" />
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-black tracking-tight leading-none text-white">
            ✦ Ask AI Advisor
          </span>
          <span className="text-[10px] text-purple-100 font-mono leading-tight mt-0.5 font-bold">
            Architecture & Course Guide
          </span>
        </div>
      </button>
    </aside>
  );
};
