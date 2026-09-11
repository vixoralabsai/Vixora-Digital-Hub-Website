import { useState } from 'react';
import {
  ExternalLink,
  TrendingUp,
  Cpu,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { PortfolioProject } from '../data/vixoraContent';
import { PORTFOLIO_PROJECTS_WITH_ADDITIONS, PortfolioProjectWithUrl } from '../data/portfolioAdditions';

interface PortfolioPageProps {
  onOpenProjectModal: () => void;
}

export function PortfolioPage({ onOpenProjectModal }: PortfolioPageProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [activeProject, setActiveProject] = useState<PortfolioProjectWithUrl | null>(null);

  const filterCategories = ['All', 'AI & Automation', 'SaaS & Web', 'Healthcare', 'Fintech', 'Real Estate', 'Education'];

  const filteredProjects = selectedFilter === 'All'
    ? PORTFOLIO_PROJECTS_WITH_ADDITIONS
    : PORTFOLIO_PROJECTS_WITH_ADDITIONS.filter((p) =>
        p.category.toLowerCase().includes(selectedFilter.toLowerCase()) ||
        p.title.toLowerCase().includes(selectedFilter.toLowerCase())
      );

  return (
    <div className="pt-24 pb-20 bg-[#F7F7FC] text-[#000048] min-h-screen">
      <section className="relative py-16 sm:py-24 overflow-hidden border-b border-[#E5E5F0] bg-white">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-[#9030F8]/10 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#480878]/5 border border-[#480878]/15 text-[#480878]">
            <Sparkles className="w-3.5 h-3.5 text-[#9030F8]" />
            <span className="font-mono uppercase tracking-widest text-[11px]">Proven Client Impact</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#000048] tracking-tight leading-tight">Case Studies & Featured Deployments</h1>
          <p className="text-base sm:text-lg text-[#5F6078] max-w-2xl mx-auto font-normal leading-relaxed">Explore how Vixora Digital Hub builds practical software, AI-powered solutions, and digital platforms that help businesses work better and grow.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex flex-wrap items-center justify-center gap-2 pb-6 border-b border-[#E5E5F0]">
          {filterCategories.map((cat) => (
            <button key={cat} onClick={() => setSelectedFilter(cat)} className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${selectedFilter === cat ? 'bg-[#480878] text-white shadow-md shadow-[#480878]/20' : 'bg-white text-[#5F6078] hover:text-[#480878] hover:bg-[#F7F7FC] border border-[#E5E5F0]'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-3xl border border-[#E5E5F0] hover:border-[#9030F8]/40 transition-all duration-300 flex flex-col overflow-hidden group shadow-lg hover:-translate-y-1">
              <div className="relative aspect-video overflow-hidden bg-[#08082F] flex items-center justify-center">
                {project.imageUrl ? (
                  <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#480878] via-[#7000F8] to-[#08082F] flex items-center justify-center p-6 text-center">
                    <div className="space-y-1">
                      <div className="w-10 h-10 rounded-xl bg-white/10 text-white border border-white/20 flex items-center justify-center mx-auto"><Cpu className="w-5 h-5" /></div>
                      <div className="text-xs font-mono text-white font-bold">{project.outcomeStats}</div>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#08082F] via-[#08082F]/40 to-transparent pointer-events-none" />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase bg-[#000048]/85 text-white border border-white/20 backdrop-blur-md">{project.category}</span>
              </div>

              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="text-xs text-[#5F6078] font-medium">Client: <span className="text-[#000048] font-semibold">{project.client}</span></div>
                  <h3 className="text-xl font-bold text-[#000048] group-hover:text-[#480878] transition-colors">{project.title}</h3>
                  <p className="text-xs sm:text-sm text-[#5F6078] leading-relaxed">{project.businessProblem}</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-[#E5E5F0]">
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologiesUsed.map((tech, tIdx) => (
                      <span key={tIdx} className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-[#F7F7FC] text-[#000048] border border-[#E5E5F0]">{tech}</span>
                    ))}
                  </div>
                  <div className="p-3 rounded-xl bg-[#480878]/5 border border-[#480878]/15 flex items-start gap-2.5">
                    <TrendingUp className="w-4 h-4 text-[#480878] shrink-0 mt-0.5" />
                    <div className="text-xs text-[#000048]"><strong className="text-[#480878] font-semibold">Outcome: </strong>{project.outcome}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {project.liveUrl && (
                    <a href={project.liveUrl} target="_blank" rel="noreferrer" className="w-full py-3 rounded-xl text-xs font-semibold bg-[#480878] hover:bg-[#7000F8] text-white transition-all flex items-center justify-center gap-2">
                      <span>View Live Website</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button onClick={onOpenProjectModal} className="w-full py-3 rounded-xl text-xs font-semibold bg-[#000048] hover:bg-[#480878] text-white transition-all flex items-center justify-center gap-2 cursor-pointer">
                    <span>Request Similar Architecture</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="py-16 text-center max-w-4xl mx-auto px-4">
        <div className="p-10 rounded-3xl bg-gradient-to-br from-[#000048] via-[#480878] to-[#7000F8] border border-[#9030F8]/30 space-y-5 shadow-xl">
          <h3 className="text-2xl sm:text-3xl font-bold text-white">Have a Digital, Software, or AI Challenge?</h3>
          <p className="text-sm text-white/80 max-w-xl mx-auto">Tell us what you are trying to build, improve, automate, or grow—and let’s explore the right solution together.</p>
          <button onClick={onOpenProjectModal} className="px-8 py-3.5 rounded-xl text-xs sm:text-sm font-semibold bg-white hover:bg-[#F7F7FC] text-[#000048] shadow-lg transition-all cursor-pointer">Start Your Project Blueprint</button>
        </div>
      </section>
    </div>
  );
}
