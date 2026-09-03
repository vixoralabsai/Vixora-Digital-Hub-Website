import { useState } from 'react';
import {
  ExternalLink,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';
import { PORTFOLIO_PROJECTS, PortfolioProject } from '../data/vixoraContent';

interface PortfolioPageProps {
  onOpenProjectModal: () => void;
}

export function PortfolioPage({ onOpenProjectModal }: PortfolioPageProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [activeProject, setActiveProject] = useState<PortfolioProject | null>(null);

  const filterCategories = ['All', 'AI & Automation', 'SaaS & Web', 'Healthcare', 'Fintech', 'Real Estate', 'Education'];

  const filteredProjects = selectedFilter === 'All'
    ? PORTFOLIO_PROJECTS
    : PORTFOLIO_PROJECTS.filter((p) =>
        p.category.toLowerCase().includes(selectedFilter.toLowerCase()) ||
        p.title.toLowerCase().includes(selectedFilter.toLowerCase())
      );

  return (
    <div className="pt-24 pb-20 bg-[#070314] text-neutral-100 min-h-screen">
      {/* Hero Header */}
      <section className="relative py-16 sm:py-24 overflow-hidden border-b border-purple-900/30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-500/10 border border-purple-500/30 text-purple-300">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-mono uppercase tracking-widest text-[11px]">Proven Client Impact</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Case Studies & Featured Deployments
          </h1>

          <p className="text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Explore how Vixora Digital Hub engineers bespoke software, autonomous AI agent pipelines, and high-growth digital platforms for global leaders.
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex flex-wrap items-center justify-center gap-2 pb-6 border-b border-purple-900/30">
          {filterCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedFilter === cat
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Project Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-neutral-900/80 rounded-3xl border border-purple-900/30 hover:border-purple-500/50 transition-all duration-300 flex flex-col overflow-hidden group shadow-xl hover:-translate-y-1"
            >
              {/* Image Banner */}
              <div className="relative aspect-video overflow-hidden bg-neutral-950 flex items-center justify-center">
                {project.imageUrl ? (
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-950/70 via-indigo-950/50 to-neutral-950 flex items-center justify-center p-6 text-center">
                    <div className="space-y-1">
                      <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center mx-auto">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-mono text-purple-300 font-bold">{project.outcomeStats}</div>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent pointer-events-none" />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase bg-purple-950/80 text-purple-300 border border-purple-800/60 backdrop-blur-md">
                  {project.category}
                </span>
              </div>

              {/* Card Details */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="text-xs text-neutral-400 font-medium">
                    Client: <span className="text-neutral-200 font-semibold">{project.client}</span>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                    {project.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                    {project.businessProblem}
                  </p>
                </div>

                {/* Tech Stack Pills */}
                <div className="space-y-3 pt-4 border-t border-neutral-800">
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologiesUsed.map((tech, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-neutral-950 text-neutral-300 border border-neutral-800"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Impact Metric Banner */}
                  <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/30 flex items-start gap-2.5">
                    <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-neutral-200">
                      <strong className="text-purple-300 font-semibold">Outcome: </strong>
                      {project.outcome}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <button
                  onClick={onOpenProjectModal}
                  className="w-full py-3 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-purple-600 text-neutral-200 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Request Similar Architecture</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Global Call to Action */}
      <section className="py-16 text-center max-w-4xl mx-auto px-4">
        <div className="p-10 rounded-3xl bg-gradient-to-b from-purple-950/60 to-neutral-950 border border-purple-500/30 space-y-5">
          <h3 className="text-2xl sm:text-3xl font-bold text-white">
            Have a Complex Engineering or AI Challenge?
          </h3>
          <p className="text-sm text-neutral-300 max-w-xl mx-auto">
            From zero-to-one SaaS products to high-throughput agent workflows, our team delivers production systems with measurable ROI.
          </p>
          <button
            onClick={onOpenProjectModal}
            className="px-8 py-3.5 rounded-xl text-xs sm:text-sm font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
          >
            Start Your Project Blueprint
          </button>
        </div>
      </section>
    </div>
  );
}
