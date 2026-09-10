import { useState } from 'react';
import {
  TrendingUp,
  Bot,
  Megaphone,
  GraduationCap,
  Globe,
  Code2,
  Layers,
  Cpu,
  Sparkles,
  MessageSquare,
  Image,
  Video,
  Palette,
  Target,
  Film,
  BookOpen,
  Users,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Monitor,
  PenTool
} from 'lucide-react';
import { SOLUTIONS_CATEGORIES, SolutionCategory, SolutionItem } from '../data/vixoraContent';

interface SolutionsSectionProps {
  onOpenProjectModal: () => void;
}

export function SolutionsSection({ onOpenProjectModal }: SolutionsSectionProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string>('growth');
  const [viewDeepPillars, setViewDeepPillars] = useState<boolean>(false);

  const featuredCards = [
    {
      id: 'software',
      title: 'Software Development',
      desc: 'Custom web, mobile, and enterprise software built for performance and scalability.',
      icon: Code2,
      category: 'growth',
    },
    {
      id: 'ai',
      title: 'AI & Automation',
      desc: 'Intelligent automation, AI agents and workflows that streamline processes and save time.',
      icon: Bot,
      category: 'ai',
    },
    {
      id: 'web',
      title: 'Web Development',
      desc: 'Modern, responsive websites that convert visitors into customers.',
      icon: Monitor,
      category: 'growth',
    },
    {
      id: 'marketing',
      title: 'Digital Marketing',
      desc: 'Data-driven marketing strategies that grow your brand and increase ROI.',
      icon: Megaphone,
      category: 'marketing',
    },
    {
      id: 'branding',
      title: 'Branding & Design',
      desc: 'Creative branding and UI/UX design that communicates value and builds trust.',
      icon: PenTool,
      category: 'marketing',
    },
    {
      id: 'consulting',
      title: 'Consulting',
      desc: 'Technology strategy and digital consulting to help you scale faster.',
      icon: Users,
      category: 'growth',
    },
  ];

  const activeCategory =
    SOLUTIONS_CATEGORIES.find((c) => c.id === activeCategoryId) ||
    SOLUTIONS_CATEGORIES[0];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'TrendingUp': return <TrendingUp className="w-4 h-4" />;
      case 'Bot': return <Bot className="w-4 h-4" />;
      case 'Megaphone': return <Megaphone className="w-4 h-4" />;
      case 'GraduationCap': return <GraduationCap className="w-4 h-4" />;
      case 'Globe': return <Globe className="w-5 h-5 text-purple-400" />;
      case 'Code2': return <Code2 className="w-5 h-5 text-indigo-400" />;
      case 'Layers': return <Layers className="w-5 h-5 text-cyan-400" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-purple-400" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-purple-400" />;
      case 'MessageSquare': return <MessageSquare className="w-5 h-5 text-emerald-400" />;
      case 'Image': return <Image className="w-5 h-5 text-pink-400" />;
      case 'Video': return <Video className="w-5 h-5 text-rose-400" />;
      case 'Palette': return <Palette className="w-5 h-5 text-amber-400" />;
      case 'Target': return <Target className="w-5 h-5 text-red-400" />;
      case 'Film': return <Film className="w-5 h-5 text-orange-400" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-emerald-400" />;
      case 'Users': return <Users className="w-5 h-5 text-purple-400" />;
      case 'Calendar': return <Calendar className="w-5 h-5 text-indigo-400" />;
      default: return <Sparkles className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <section id="solutions" className="py-24 bg-[#0A051A] relative overflow-hidden">
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-600/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-600/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold text-purple-300 bg-purple-500/10 border border-purple-500/30 uppercase tracking-widest">
            <span>WHAT WE DO</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Complete Digital Solutions
          </h2>
          <p className="text-sm sm:text-base text-neutral-300 font-normal max-w-2xl mx-auto">
            End-to-end digital services and AI-powered solutions designed to transform your business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {featuredCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 sm:p-7 shadow-xl border border-neutral-100 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                onClick={() => {
                  setActiveCategoryId(card.category);
                  onOpenProjectModal();
                }}
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-5 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-purple-600 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
                <div className="pt-6 mt-6 border-t border-neutral-100 flex items-center text-xs font-bold text-purple-600 group-hover:text-purple-700 gap-1.5">
                  <span>Learn More</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <button
            onClick={() => setViewDeepPillars(!viewDeepPillars)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 hover:border-purple-500/50 transition-all cursor-pointer"
          >
            <span>{viewDeepPillars ? 'Collapse Deep Architecture' : 'View All Services & Deep Architecture'}</span>
            <ChevronRight className={`w-4 h-4 transition-transform ${viewDeepPillars ? 'rotate-90' : ''}`} />
          </button>
        </div>

        {viewDeepPillars && (
          <div className="mt-16 pt-12 border-t border-purple-900/30 space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {SOLUTIONS_CATEGORIES.map((cat) => {
                const isSelected = cat.id === activeCategoryId;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategoryId(cat.id)}
                    className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-purple-950/60 border-purple-500/60 shadow-lg shadow-purple-500/10'
                        : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-purple-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
                        {getIcon(cat.icon)}
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-purple-400' : 'text-neutral-600'}`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{cat.title}</h4>
                      <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">{cat.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl border border-purple-900/30 bg-neutral-950/50 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-purple-400 mb-2">Solution Architecture</div>
                  <h3 className="text-2xl font-bold text-white">{activeCategory.title}</h3>
                  <p className="text-sm text-neutral-400 mt-2 max-w-2xl">{activeCategory.subtitle}</p>
                </div>
                <button
                  onClick={onOpenProjectModal}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors shrink-0"
                >
                  Scope Solution <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeCategory.items.map((item: SolutionItem) => (
                  <div key={item.name} className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 p-2 rounded-lg bg-neutral-800">{getIcon(item.iconName)}</div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{item.name}</h4>
                          {item.badge && <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/40">{item.badge}</span>}
                        </div>
                        <p className="text-xs text-neutral-400 leading-relaxed mt-2">{item.description}</p>
                      </div>
                    </div>
                    <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {item.capabilities.map((capability) => (
                        <li key={capability} className="flex items-start gap-2 text-[11px] text-neutral-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                          <span>{capability}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
