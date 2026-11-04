import {
  ShieldCheck,
  Zap,
  Code2,
  Cpu,
  Layers,
  Users2,
  CheckCircle2,
  Lock
} from 'lucide-react';

export function WhyVixora() {
  const pillars = [
    {
      title: "Engineered Like Enterprise Tech, Not an Agency",
      desc: "We write clean, typed, modular codebases with automated CI/CD and zero vendor lock-in. You own 100% of your source code and infrastructure.",
      icon: Code2,
      badge: "Architecture"
    },
    {
      title: "Real Autonomous AI & LLM Systems",
      desc: "Beyond simple wrapper apps, we build production agent swarms, vector retrieval pipelines (RAG), and resilient n8n automation backends.",
      icon: Cpu,
      badge: "AI Native"
    },
    {
      title: "Full-Lifecycle Execution Under One Roof",
      desc: "From initial SRS specification to Figma design, FastAPI engineering, media production, and team training in Vixora Academy.",
      icon: Layers,
      badge: "End-to-End"
    },
    {
      title: "Zero-Trust Security & High Availability",
      desc: "HIPAA-grade data segregation, server-side secret isolation, automated backups, and 99.98% containerized SLA deployments.",
      icon: ShieldCheck,
      badge: "Security"
    }
  ];

  return (
    <section className="py-24 bg-neutral-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="text-xs font-semibold tracking-wider text-blue-400 uppercase mb-2">
              Engineering Philosophy
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-100 tracking-tight leading-tight">
              The Digital Headquarters for Smarter Business Growth
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
              Most businesses struggle with disjointed freelancers, slow agencies, and brittle tools. Vixora Digital Hub operates as your dedicated engineering and innovation powerhouse, delivering battle-tested software and high-ROI automation.
            </p>

            <div className="pt-2 space-y-3">
              <div className="flex items-center gap-3 text-sm text-neutral-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Transparent fixed milestones & clear SRS roadmaps</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Dedicated full-stack engineering & AI architect lead</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Post-launch warranty & ongoing 24/7 reliability support</span>
              </div>
            </div>
          </div>

          {/* Right Column: Asymmetric Strategic Pillars Bento */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Primary Bento Anchor: Enterprise Tech (Spans 2 cols) */}
            <div className="sm:col-span-2 p-7 rounded-2xl bg-gradient-to-r from-neutral-900 to-neutral-900/80 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-blue-400">
                  <Code2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-semibold text-blue-400 uppercase tracking-wider">
                  Core Architecture
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1.5">
                  Engineered Like Enterprise Tech, Not an Agency
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  We write clean, typed, modular codebases with automated CI/CD and zero vendor lock-in. You retain 100% ownership of your source repositories, Docker containers, and database schemas.
                </p>
              </div>
              <div className="pt-2 border-t border-neutral-800/80 flex flex-wrap gap-4 text-xs font-mono text-neutral-400">
                <span>· Full Git Ownership</span>
                <span>· Zero Vendor Lock-in</span>
                <span>· Production Docker Deployments</span>
              </div>
            </div>

            {/* Bento Card 2: Real Autonomous AI */}
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-850 hover:border-neutral-700 transition-all space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-purple-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono text-purple-400 uppercase tracking-wider">
                  AI Native
                </span>
              </div>
              <h3 className="text-base font-bold text-white leading-snug">
                Autonomous AI &amp; LLM Systems
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Beyond simple wrapper apps, we build production agent swarms, vector retrieval pipelines (RAG), and resilient automation backends.
              </p>
            </div>

            {/* Bento Card 3: Zero-Trust Security & Reliability */}
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-850 hover:border-neutral-700 transition-all space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
                  Security
                </span>
              </div>
              <h3 className="text-base font-bold text-white leading-snug">
                Zero-Trust Security &amp; 99.98% SLA
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Server-side secret isolation, automated encrypted backups, strict RBAC permissions, and containerized high availability.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
