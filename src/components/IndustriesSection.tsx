import { useState } from 'react';
import {
  HeartPulse,
  GraduationCap,
  Building2,
  ShoppingBag,
  Utensils,
  Globe2,
  Church,
  Landmark,
  Briefcase,
  Rocket,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';
import { INDUSTRIES, IndustrySpec } from '../data/vixoraContent';

interface IndustriesSectionProps {
  onSelectIndustry?: (industry: string) => void;
}

export function IndustriesSection({ onSelectIndustry }: IndustriesSectionProps) {
  const [selectedId, setSelectedId] = useState<string>('healthcare');

  const activeInd = INDUSTRIES.find((i) => i.id === selectedId) || INDUSTRIES[0];

  const getIndustryIcon = (iconName: string) => {
    switch (iconName) {
      case 'HeartPulse':
        return <HeartPulse className="w-5 h-5 text-rose-400" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-blue-400" />;
      case 'Building2':
        return <Building2 className="w-5 h-5 text-amber-400" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-5 h-5 text-emerald-400" />;
      case 'Utensils':
        return <Utensils className="w-5 h-5 text-orange-400" />;
      case 'Globe2':
        return <Globe2 className="w-5 h-5 text-cyan-400" />;
      case 'Church':
        return <Church className="w-5 h-5 text-purple-400" />;
      case 'Landmark':
        return <Landmark className="w-5 h-5 text-indigo-400" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5 text-teal-400" />;
      case 'Rocket':
        return <Rocket className="w-5 h-5 text-pink-400" />;
      default:
        return <Briefcase className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <section id="industries" className="py-24 bg-neutral-900/30 border-t border-neutral-850 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 mb-3">
            <span>DOMAIN SPECIALIZATION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-100 tracking-tight">
            Industries We Transform
          </h2>
          <p className="mt-3 text-base sm:text-lg text-neutral-400 font-normal">
            Domain-specific software engineering, compliance frameworks, and AI workflows tailored to your sector's regulatory standards and market dynamics.
          </p>
        </div>

        {/* 10 Industries Grid & Interactive Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Industry Pills Selector */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-2 gap-3">
            {INDUSTRIES.map((ind) => {
              const isSelected = ind.id === selectedId;
              return (
                <button
                  key={ind.id}
                  onClick={() => setSelectedId(ind.id)}
                  className={`p-4 rounded-xl text-left border transition-all flex items-start gap-3.5 group ${
                    isSelected
                      ? 'bg-neutral-900 border-blue-500/70 shadow-md shadow-blue-500/10'
                      : 'bg-neutral-950/70 border-neutral-850 hover:border-neutral-700 hover:bg-neutral-900/50'
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-lg shrink-0 transition-colors ${
                      isSelected ? 'bg-neutral-800' : 'bg-neutral-900'
                    }`}
                  >
                    {getIndustryIcon(ind.icon)}
                  </div>
                  <div>
                    <h3
                      className={`text-sm font-bold flex items-center gap-1.5 ${
                        isSelected ? 'text-white' : 'text-neutral-200 group-hover:text-white'
                      }`}
                    >
                      <span>{ind.name}</span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      )}
                    </h3>
                    <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                      {ind.impactMetric}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Industry Spotlight Card */}
          <div className="lg:col-span-5 sticky top-28">
            <div className="p-6 sm:p-7 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                    {getIndustryIcon(activeInd.icon)}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">
                      {activeInd.name}
                    </h4>
                    <span className="text-xs font-mono text-emerald-400">
                      Impact: {activeInd.impactMetric}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-mono text-neutral-500 uppercase tracking-wider mb-1.5">
                  Sector Overview
                </p>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  {activeInd.summary}
                </p>
              </div>

              <div>
                <p className="text-xs font-mono text-neutral-500 uppercase tracking-wider mb-2.5">
                  Engineered Use Cases
                </p>
                <div className="space-y-2">
                  {activeInd.useCases.map((uc, uIdx) => (
                    <div
                      key={uIdx}
                      className="p-3 rounded-lg bg-neutral-950/80 border border-neutral-800 text-xs text-neutral-200 flex items-start gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <span>{uc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-neutral-500">
                    PRIMARY STACK
                  </span>
                  <p className="font-mono text-neutral-300 font-semibold text-[11px]">
                    {activeInd.techFocus}
                  </p>
                </div>
                <a
                  href="#contact"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1 shadow-sm"
                >
                  <span>Build For {activeInd.name.split(' ')[0]}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
