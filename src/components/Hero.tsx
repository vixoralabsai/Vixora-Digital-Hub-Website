import { useState } from 'react';
import {
  ArrowRight,
  Play,
  Bot,
  Code2,
  BarChart3,
  PenTool,
  Sparkles,
  CheckCircle,
  Users,
  HardDrive
} from 'lucide-react';

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
  const [activeNode, setActiveNode] = useState<string | null>(null);

  return (
    <section
      id="hero"
      className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 overflow-hidden bg-[#070314]"
    >
      {/* Dynamic Cosmic & Neon Purple Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[1100px] h-[550px] bg-gradient-to-b from-purple-600/20 via-indigo-600/15 to-transparent blur-[140px] -z-10 pointer-events-none rounded-full" />
      <div className="absolute top-20 right-10 w-96 h-96 bg-purple-500/10 blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-600/10 blur-[100px] -z-10 pointer-events-none" />

      {/* Cyber Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#8B5CF6_1px,transparent_1px)] [background-size:24px_24px] -z-10" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-6 items-center">
          
          {/* Left Column: Headlines, Value Proposition & CTAs */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left z-10">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-500/10 border border-purple-500/30 text-purple-300 shadow-sm shadow-purple-500/10 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              <span className="font-mono text-[11px] uppercase tracking-widest text-purple-300">
                TECHNOLOGY. AUTOMATION. GROWTH.
              </span>
            </div>

            {/* 3-Tier Dynamic Hero Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight text-white leading-[1.12]">
              <span>Build Smarter.</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-300 to-indigo-300">
                Automate Faster.
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-blue-400">
                Grow Greater.
              </span>
            </h1>

            {/* Supporting Description */}
            <p className="text-base sm:text-lg text-neutral-300/90 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              We help businesses and organizations transform ideas into powerful digital solutions using AI, software, and strategy that drive real results.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                id="hero-start-project-btn"
                onClick={onOpenProjectModal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.98] text-white shadow-lg shadow-purple-600/35 transition-all cursor-pointer"
              >
                <span>Start Your Project</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero-explore-solutions-btn"
                onClick={onExploreServices}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 border border-neutral-700/80 hover:border-purple-500/50 transition-all cursor-pointer"
              >
                <span>Explore Solutions</span>
                <Play className="w-3.5 h-3.5 fill-current text-neutral-400" />
              </button>

              <button
                id="hero-drive-hub-btn"
                onClick={onOpenDriveWorkspace}
                title="Open Google Drive Requirements PRD Analyzer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-xl text-xs font-medium text-purple-300 hover:text-white bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/40 transition-all cursor-pointer"
              >
                <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                <span>Drive PRD Hub</span>
              </button>
            </div>

            {/* Social Proof Stack (Avatars + 200+ Businesses) */}
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-3.5">
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
              <p className="text-xs sm:text-sm text-neutral-300 font-medium">
                Trusted by <span className="text-purple-300 font-semibold">200+ businesses</span> and growing
              </p>
            </div>
          </div>

          {/* Right Column: 3D Illuminated Futuristic "V" Centerpiece & Floating Solution Nodes */}
          <div className="lg:col-span-6 relative flex items-center justify-center min-h-[480px] sm:min-h-[540px]">
            
            {/* Ambient Base Stage Glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[340px] sm:w-[460px] h-[340px] sm:h-[460px] rounded-full bg-purple-600/20 blur-[90px] animate-pulse" />
              <div className="w-[200px] sm:w-[280px] h-[200px] sm:h-[280px] rounded-full bg-blue-500/25 blur-[60px]" />
            </div>

            {/* Connecting Geometric Cyber Tracer Lines (SVG) */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
              viewBox="0 0 600 500"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Line to Top-Left Node (AI Automation) */}
              <path 
                d="M 190 120 L 260 190 L 300 240" 
                stroke="url(#purpleGlowLine)" 
                strokeWidth="1.5" 
                strokeDasharray="4 4"
                className="opacity-70"
              />
              {/* Line to Bottom-Left Node (Software Solutions) */}
              <path 
                d="M 180 320 L 250 290 L 300 260" 
                stroke="url(#blueGlowLine)" 
                strokeWidth="1.5" 
                strokeDasharray="4 4"
                className="opacity-70"
              />
              {/* Line to Top-Right Node (Digital Marketing) */}
              <path 
                d="M 420 140 L 360 200 L 300 240" 
                stroke="url(#purpleGlowLine)" 
                strokeWidth="1.5" 
                strokeDasharray="4 4"
                className="opacity-70"
              />
              {/* Line to Bottom-Right Node (Creative & Branding) */}
              <path 
                d="M 430 330 L 360 300 L 300 260" 
                stroke="url(#purpleGlowLine)" 
                strokeWidth="1.5" 
                strokeDasharray="4 4"
                className="opacity-70"
              />

              {/* Glowing Gradients Definition */}
              <defs>
                <linearGradient id="purpleGlowLine" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A855F7" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="blueGlowLine" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#818CF8" stopOpacity="0.2" />
                </linearGradient>
              </defs>
            </svg>

            {/* Central 3D Podium & Neon "V" Monolith */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              
              {/* 3D Glass Geometric "V" Emblem */}
              <div className="relative w-44 h-48 sm:w-56 sm:h-60 flex items-center justify-center group">
                {/* Backlight Aura */}
                <div className="absolute inset-0 bg-gradient-to-t from-purple-600 via-indigo-500 to-cyan-400 opacity-60 blur-2xl rounded-full transform group-hover:scale-110 transition-transform duration-700" />
                
                {/* Monolith 3D SVG Shape */}
                <svg
                  className="w-full h-full drop-shadow-[0_0_35px_rgba(168,85,247,0.75)] filter transform group-hover:-translate-y-1 transition-transform duration-500"
                  viewBox="0 0 200 220"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="vLeftFacet" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="40%" stopColor="#6366F1" />
                      <stop offset="100%" stopColor="#9333EA" />
                    </linearGradient>
                    <linearGradient id="vRightFacet" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#A855F7" />
                      <stop offset="50%" stopColor="#7C3AED" />
                      <stop offset="100%" stopColor="#4338CA" />
                    </linearGradient>
                    <linearGradient id="vFrontGloss" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
                      <stop offset="30%" stopColor="#C084FC" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#7E22CE" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="vNeonEdge" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#67E8F9" />
                      <stop offset="50%" stopColor="#C084FC" />
                      <stop offset="100%" stopColor="#F472B6" />
                    </linearGradient>
                  </defs>

                  {/* Left Arm of 3D 'V' */}
                  <polygon
                    points="30,25 78,25 100,165 65,165"
                    fill="url(#vLeftFacet)"
                  />
                  {/* Left Arm Bevel Highlight */}
                  <polygon
                    points="30,25 45,25 82,165 65,165"
                    fill="url(#vFrontGloss)"
                  />

                  {/* Right Arm of 3D 'V' (Origami Wing) */}
                  <polygon
                    points="170,25 122,25 100,165 135,165"
                    fill="url(#vRightFacet)"
                  />
                  {/* Right Arm Sharp Edge */}
                  <polygon
                    points="122,25 145,25 118,165 100,165"
                    fill="url(#vFrontGloss)"
                  />

                  {/* Inner Vertex 3D Shadow/Depth Core */}
                  <polygon
                    points="78,25 122,25 100,165"
                    fill="#1E1035"
                    opacity="0.55"
                  />

                  {/* Neon Glow Outer Tracer */}
                  <polyline
                    points="30,25 100,168 170,25"
                    stroke="url(#vNeonEdge)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Center Core Light Pulse */}
                  <circle cx="100" cy="165" r="5" fill="#E0E7FF" filter="drop-shadow(0 0 8px #38BDF8)" />
                </svg>
              </div>

              {/* 3D Multi-Tiered Illuminated Stage / Podium */}
              <div className="relative -mt-8 flex flex-col items-center">
                {/* Top Tier Disc */}
                <div className="w-48 sm:w-64 h-7 rounded-[100%] bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-600 border-2 border-purple-400/80 shadow-[0_0_30px_rgba(168,85,247,0.8)]" />
                
                {/* Mid Tier Stage Body */}
                <div className="w-56 sm:w-76 h-8 -mt-3.5 rounded-[100%] bg-gradient-to-b from-[#200F48] to-[#0D0524] border border-purple-500/40 shadow-inner" />
                
                {/* Bottom Base Ring with Neon Ambient Ripple */}
                <div className="w-68 sm:w-92 h-10 -mt-4 rounded-[100%] bg-[#080218] border border-purple-600/30 shadow-[0_15px_40px_rgba(124,58,237,0.4)] flex items-center justify-center">
                  <div className="w-[85%] h-[60%] rounded-[100%] border border-cyan-400/30 blur-[1px]" />
                </div>
              </div>
            </div>

            {/* 4 Floating Cyber Solution Cards Connected to the Hub */}
            
            {/* 1. TOP-LEFT: AI Automation */}
            <div 
              onMouseEnter={() => setActiveNode('ai')}
              onMouseLeave={() => setActiveNode(null)}
              className={`absolute top-2 sm:top-6 left-0 sm:left-2 z-20 max-w-[210px] p-3 rounded-2xl bg-[#0F0A26]/90 border ${
                activeNode === 'ai' ? 'border-purple-400 shadow-lg shadow-purple-500/30' : 'border-purple-500/30'
              } backdrop-blur-md transition-all duration-300 transform hover:-translate-y-1`}
            >
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white">AI Automation</div>
                  <div className="text-[10px] text-neutral-300 leading-tight">
                    Smart workflows that save time and scale your business.
                  </div>
                </div>
              </div>
            </div>

            {/* 2. BOTTOM-LEFT: Software Solutions */}
            <div 
              onMouseEnter={() => setActiveNode('software')}
              onMouseLeave={() => setActiveNode(null)}
              className={`absolute bottom-6 sm:bottom-12 left-0 sm:left-4 z-20 max-w-[210px] p-3 rounded-2xl bg-[#0F0A26]/90 border ${
                activeNode === 'software' ? 'border-blue-400 shadow-lg shadow-blue-500/30' : 'border-blue-500/30'
              } backdrop-blur-md transition-all duration-300 transform hover:-translate-y-1`}
            >
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 shrink-0">
                  <Code2 className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white">Software Solutions</div>
                  <div className="text-[10px] text-neutral-300 leading-tight">
                    Custom software built for performance and growth.
                  </div>
                </div>
              </div>
            </div>

            {/* 3. TOP-RIGHT: Digital Marketing */}
            <div 
              onMouseEnter={() => setActiveNode('marketing')}
              onMouseLeave={() => setActiveNode(null)}
              className={`absolute top-4 sm:top-10 right-0 sm:right-2 z-20 max-w-[210px] p-3 rounded-2xl bg-[#0F0A26]/90 border ${
                activeNode === 'marketing' ? 'border-purple-400 shadow-lg shadow-purple-500/30' : 'border-purple-500/30'
              } backdrop-blur-md transition-all duration-300 transform hover:-translate-y-1`}
            >
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white">Digital Marketing</div>
                  <div className="text-[10px] text-neutral-300 leading-tight">
                    Data-driven strategies that boost your brand and revenue.
                  </div>
                </div>
              </div>
            </div>

            {/* 4. BOTTOM-RIGHT: Creative & Branding */}
            <div 
              onMouseEnter={() => setActiveNode('branding')}
              onMouseLeave={() => setActiveNode(null)}
              className={`absolute bottom-4 sm:bottom-10 right-0 sm:right-4 z-20 max-w-[210px] p-3 rounded-2xl bg-[#0F0A26]/90 border ${
                activeNode === 'branding' ? 'border-fuchsia-400 shadow-lg shadow-fuchsia-500/30' : 'border-fuchsia-500/30'
              } backdrop-blur-md transition-all duration-300 transform hover:-translate-y-1`}
            >
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-500/30 shrink-0">
                  <PenTool className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white">Creative & Branding</div>
                  <div className="text-[10px] text-neutral-300 leading-tight">
                    Designs that communicate value and build trust.
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
