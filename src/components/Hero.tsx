import { useState } from 'react';
import {
  ArrowRight,
  Play,
  Bot,
  Code2,
  BarChart3,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Zap,
  MessageCircle,
  HardDrive,
  CheckCircle2,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { BRAND_CONFIG, getImageFallbacks, getDirectImageUrl } from '../data/brandConfig';

interface HeroProps {
  onOpenProjectModal: () => void;
  onExploreServices: () => void;
  onOpenDriveWorkspace: () => void;
}

export function Hero({
  onOpenProjectModal,
  onExploreServices,
  onOpenDriveWorkspace,
}: HeroProps) {
  const [activeTelemetry, setActiveTelemetry] = useState<string | null>(null);
  const fallbacks = getImageFallbacks(BRAND_CONFIG.heroBackground.imageUrl);
  const [bgIdx, setBgIdx] = useState(0);
  const [bgLoadError, setBgLoadError] = useState(false);

  const handleImageError = () => {
    if (bgIdx + 1 < fallbacks.length) {
      setBgIdx(prev => prev + 1);
    } else {
      setBgLoadError(true);
    }
  };

  const currentBgSrc = fallbacks[bgIdx] || getDirectImageUrl(BRAND_CONFIG.heroBackground.imageUrl);

  const telemetryItems = [
    {
      id: 'ai',
      title: 'Agentic AI Systems',
      subtitle: 'Autonomous workflows & LLM orchestration',
      status: 'Active Pipeline',
      icon: Bot,
      color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/40 text-purple-300',
      badge: 'v3.5 Engine',
      position: 'top-4 left-2 sm:left-4'
    },
    {
      id: 'software',
      title: 'Custom Engineering',
      subtitle: 'High-concurrency full-stack architecture',
      status: '99.99% Uptime',
      icon: Code2,
      color: 'from-blue-500/20 to-cyan-500/10 border-cyan-500/40 text-cyan-300',
      badge: 'Cloud Native',
      position: 'bottom-20 left-2 sm:left-6'
    },
    {
      id: 'growth',
      title: 'Growth & Media Buying',
      subtitle: 'Targeted ROI & conversion funnels',
      status: '10x Avg ROAS',
      icon: BarChart3,
      color: 'from-fuchsia-500/20 to-purple-500/10 border-fuchsia-500/40 text-fuchsia-300',
      badge: 'Performance',
      position: 'top-8 right-2 sm:right-4'
    },
    {
      id: 'academy',
      title: 'Executive Academy',
      subtitle: 'Hands-on AI & development certification',
      status: 'Enrollments Open',
      icon: GraduationCap,
      color: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/40 text-indigo-300',
      badge: 'Certified',
      position: 'bottom-16 right-2 sm:right-6'
    }
  ];

  return (
    <section
      id="hero"
      className="relative min-h-[92vh] sm:min-h-[96vh] pt-28 pb-20 sm:pt-36 sm:pb-28 overflow-hidden bg-[#070314] flex items-center"
    >
      {/* 🌌 High-Fidelity Custom Background Image Canvas */}
      {currentBgSrc && !bgLoadError && (
        <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
          <img
            src={currentBgSrc}
            alt="Vixora Digital Hub 3D Cyber Environment"
            referrerPolicy="no-referrer"
            onError={handleImageError}
            className="w-full h-full object-cover object-right lg:object-center scale-100 transition-all duration-1000 ease-out"
          />

          {/* Left-Side Dark Vignette to guarantee pristine text readability on all viewports */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#070314] via-[#070314]/85 lg:via-[#070314]/65 to-transparent z-10" />

          {/* Top & Bottom seamless blending into Navbar and following page sections */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#070314]/90 via-transparent to-[#070314] z-10" />

          {/* Subtle Cyber Neon Grid Texture */}
          <div 
            className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#A855F7_1px,transparent_1px)] [background-size:32px_32px] z-10" 
          />
        </div>
      )}

      {/* Atmospheric Ambient Glows behind the 3D mark */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: Headline, Value Proposition, Action CTAs & Proof */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            
            {/* Top Super-Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-semibold bg-purple-950/70 border border-purple-500/40 text-purple-200 shadow-lg shadow-purple-500/15 backdrop-blur-xl">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-400"></span>
              </span>
              <span className="font-mono text-[11px] uppercase tracking-wider font-bold text-purple-200">
                VIXORA DIGITAL HUB &bull; AI &bull; SOFTWARE &bull; GROWTH
              </span>
            </div>

            {/* Main Power Headline */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-[62px] xl:text-[68px] font-black tracking-tight text-white leading-[1.08]">
                <span>Build Smarter.</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-indigo-300 drop-shadow-[0_0_35px_rgba(168,85,247,0.4)]">
                  Automate Faster.
                </span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-sky-300 to-cyan-400">
                  Scale Infinitely.
                </span>
              </h1>
            </div>

            {/* Description Paragraph */}
            <p className="text-base sm:text-lg lg:text-xl text-neutral-300 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
              We help ambitious businesses and organizations transform bold ideas into high-impact digital realities through custom enterprise software, autonomous AI agent workflows, and ROI-driven digital growth.
            </p>

            {/* Action Buttons Matrix */}
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              {/* Primary Start Project CTA */}
              <button
                id="hero-start-project-btn"
                onClick={onOpenProjectModal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.98] text-white shadow-xl shadow-purple-600/40 hover:shadow-purple-500/50 transition-all duration-300 cursor-pointer border border-purple-400/30"
              >
                <span>Start Your Project</span>
                <ArrowRight className="w-4 h-4 text-purple-200" />
              </button>

              {/* Secondary Explore Solutions */}
              <button
                id="hero-explore-solutions-btn"
                onClick={onExploreServices}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm font-semibold bg-[#110A2E]/80 hover:bg-[#1C1145] text-neutral-200 border border-purple-500/30 hover:border-purple-400/60 shadow-lg shadow-black/40 backdrop-blur-md transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Explore Solutions</span>
              </button>

              {/* Direct WhatsApp Instant Consultation */}
              <a
                id="hero-whatsapp-direct-btn"
                href={BRAND_CONFIG.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-4 rounded-xl text-xs font-semibold bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 hover:text-emerald-200 border border-emerald-600/40 hover:border-emerald-500 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Desk</span>
              </a>

              {/* Google Drive PRD Workspace Launcher */}
              <button
                id="hero-drive-hub-btn"
                onClick={onOpenDriveWorkspace}
                title="Launch Google Drive Requirements PRD Analyzer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-4 rounded-xl text-xs font-medium text-purple-300 hover:text-white bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/40 transition-all cursor-pointer"
              >
                <HardDrive className="w-4 h-4 text-purple-400" />
                <span>Drive PRD Hub</span>
              </button>
            </div>

            {/* Proof Metrics & Credibility Strip */}
            <div className="pt-4 border-t border-purple-900/30">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                <div className="p-3 rounded-xl bg-[#0E0728]/60 border border-purple-500/20 backdrop-blur-sm">
                  <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-1">
                    <span>99.8%</span>
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-[11px] text-neutral-400 font-medium">On-Time Delivery</div>
                </div>

                <div className="p-3 rounded-xl bg-[#0E0728]/60 border border-purple-500/20 backdrop-blur-sm">
                  <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-1">
                    <span>50+</span>
                    <Zap className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-[11px] text-neutral-400 font-medium">Solutions Launched</div>
                </div>

                <div className="p-3 rounded-xl bg-[#0E0728]/60 border border-purple-500/20 backdrop-blur-sm">
                  <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-1">
                    <span>10x</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-[11px] text-neutral-400 font-medium">Workflow ROI</div>
                </div>

                <div className="p-3 rounded-xl bg-[#0E0728]/60 border border-purple-500/20 backdrop-blur-sm">
                  <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-1">
                    <span>24/7</span>
                    <Cpu className="w-4 h-4 text-fuchsia-400" />
                  </div>
                  <div className="text-[11px] text-neutral-400 font-medium">SLA Support</div>
                </div>
              </div>

              {/* Social Proof Stack (Avatars + Rating) */}
              <div className="mt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <div className="flex -space-x-2.5 overflow-hidden">
                  <img
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-purple-950 object-cover"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                    alt="Client avatar"
                  />
                  <img
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-purple-950 object-cover"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                    alt="Client avatar"
                  />
                  <img
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-purple-950 object-cover"
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
                    alt="Client avatar"
                  />
                  <img
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-purple-950 object-cover"
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
                    alt="Client avatar"
                  />
                </div>
                <div className="text-xs text-neutral-300">
                  <div className="flex items-center gap-1 text-amber-400">
                    {'★'.repeat(5)}
                    <span className="font-bold text-white ml-1">4.9 / 5.0</span>
                  </div>
                  <span className="text-neutral-400">Trusted by <span className="text-purple-300 font-semibold">200+ organizations</span> globally</span>
                </div>
              </div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Holographic HUD floating around the 3D V artwork */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 xl:col-span-5 relative min-h-[460px] sm:min-h-[520px] flex items-center justify-center">
            
            {/* Ambient Lighting Ring highlighting the background's 3D V Monolith */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[320px] sm:w-[420px] h-[320px] sm:h-[420px] rounded-full bg-purple-600/25 blur-[100px] animate-pulse" />
            </div>

            {/* Floating Interactive Holographic Telemetry Chips around the 3D Emblem */}
            <div className="relative w-full h-full min-h-[460px] flex items-center justify-center">
              
              {telemetryItems.map((item) => {
                const IconComponent = item.icon;
                const isHovered = activeTelemetry === item.id;

                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setActiveTelemetry(item.id)}
                    onMouseLeave={() => setActiveTelemetry(null)}
                    onClick={() => {
                      if (item.id === 'academy') {
                        window.location.href = BRAND_CONFIG.academyDomain;
                      } else if (item.id === 'ai' || item.id === 'software') {
                        onExploreServices();
                      } else {
                        onOpenProjectModal();
                      }
                    }}
                    className={`absolute ${item.position} z-30 max-w-[210px] sm:max-w-[230px] p-3 sm:p-3.5 rounded-2xl bg-[#0C0624]/85 hover:bg-[#140B38]/95 border ${
                      isHovered ? 'border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.4)] scale-105' : 'border-purple-500/30 shadow-lg shadow-black/60'
                    } backdrop-blur-xl transition-all duration-300 cursor-pointer group`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl bg-gradient-to-br ${item.color} border shrink-0 group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                            {item.title}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-300/80 leading-tight">
                          {item.subtitle}
                        </p>
                        <div className="pt-1 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[9px] font-mono text-purple-300/90 uppercase tracking-wider">
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Central Interactive Portal Action to trigger solutions */}
              <button
                onClick={onExploreServices}
                className="relative z-20 group flex flex-col items-center justify-center p-6 rounded-full bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 hover:border-purple-400/80 shadow-[0_0_40px_rgba(168,85,247,0.3)] backdrop-blur-md transition-all duration-300 cursor-pointer"
                title="Click to explore the Vixora Hub Ecosystem"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-600/50 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5 text-white animate-spin [animation-duration:8s]" />
                </div>
                <span className="mt-2 text-[10px] font-mono font-semibold uppercase tracking-widest text-purple-200 group-hover:text-white transition-colors">
                  Explore Ecosystem
                </span>
              </button>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
