import {
  Code2,
  Bot,
  Palette,
  Megaphone,
  Video,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { FEATURED_SERVICES, ServiceDetail } from '../data/vixoraContent';

interface FeaturedServicesProps {
  onOpenProjectModal: () => void;
}

export function FeaturedServices({ onOpenProjectModal }: FeaturedServicesProps) {
  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code2':
        return <Code2 className="w-6 h-6 text-blue-400" />;
      case 'Bot':
        return <Bot className="w-6 h-6 text-purple-400" />;
      case 'Palette':
        return <Palette className="w-6 h-6 text-amber-400" />;
      case 'Megaphone':
        return <Megaphone className="w-6 h-6 text-emerald-400" />;
      case 'Video':
        return <Video className="w-6 h-6 text-pink-400" />;
      case 'GraduationCap':
        return <GraduationCap className="w-6 h-6 text-indigo-400" />;
      default:
        return <Sparkles className="w-6 h-6 text-blue-400" />;
    }
  };

  return (
    <section id="services" className="py-24 bg-neutral-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono font-medium text-purple-400 bg-purple-500/10 border border-purple-500/20 mb-3">
            <span>FULL-SPECTRUM SERVICES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-100 tracking-tight">
            Featured Capabilities & Services
          </h2>
          <p className="mt-3 text-base sm:text-lg text-neutral-400 font-normal">
            Specialized engineering, creative media, performance growth, and corporate academy tracks tailored to your business stage.
          </p>
        </div>

        {/* 6 Featured Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_SERVICES.map((srv) => (
            <div
              key={srv.id}
              className="p-7 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 transition-all flex flex-col justify-between group hover:bg-neutral-900 hover:shadow-xl hover:shadow-black/50"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                    {getServiceIcon(srv.icon)}
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 px-2.5 py-0.5 rounded-full bg-neutral-800 border border-neutral-750">
                    {srv.subtitle}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">
                  {srv.title}
                </h3>
                <p className="text-xs font-medium text-blue-400/90 mb-3">
                  "{srv.tagline}"
                </p>

                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-6">
                  {srv.description}
                </p>

                {/* Features List */}
                <div className="space-y-2.5 pt-4 border-t border-neutral-800/80">
                  {srv.features.map((feat, fIdx) => (
                    <div
                      key={fIdx}
                      className="flex items-start gap-2.5 text-xs text-neutral-300"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-neutral-850">
                <button
                  onClick={onOpenProjectModal}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold bg-neutral-950 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 hover:border-neutral-700 transition-all flex items-center justify-center gap-2 group-hover:text-white"
                >
                  <span>Inquire for {srv.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
