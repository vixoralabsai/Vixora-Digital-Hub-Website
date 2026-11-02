import { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  HardDrive,
  LayoutDashboard,
  ShieldCheck,
  Sun,
  Moon,
  Bot,
  Code2,
  Palette,
  Megaphone,
  GraduationCap,
  Briefcase,
  Users,
  FileText,
  Sparkles,
  Award,
  Layers
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useTheme } from '../context/ThemeContext';
import { CurrencySwitcher } from './CurrencySwitcher';

interface NavbarProps {
  onOpenProjectModal: () => void;
  onOpenDriveWorkspace: () => void;
  onOpenAiAdvisor?: () => void;
  currentPage: string;
  currentPath?: string;
  onNavigate: (page: string, sectionId?: string, courseSlug?: string, customPath?: string) => void;
}

export function Navbar({
  onOpenProjectModal,
  onOpenDriveWorkspace,
  onOpenAiAdvisor,
  currentPage,
  currentPath = '/',
  onNavigate,
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpandedSection, setMobileExpandedSection] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.nav-dropdown-container')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleMouseEnter = (menuName: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setOpenDropdown(menuName);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 180);
  };

  const handleNavClick = (page: string, sectionId?: string, courseSlug?: string, customPath?: string) => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
    onNavigate(page, sectionId, courseSlug, customPath);
  };

  const toggleMobileSection = (section: string) => {
    setMobileExpandedSection(mobileExpandedSection === section ? null : section);
  };

  const isPortalActive = ['student-portal', 'certificate-portal', 'dashboard', 'admin'].includes(currentPage);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#070314]/95 backdrop-blur-md border-b border-purple-900/40 shadow-lg shadow-black/60 py-2.5 sm:py-3'
          : 'bg-[#070314]/90 backdrop-blur-md border-b border-purple-900/20 py-3.5 sm:py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & Brand Identity */}
          <button
            onClick={() => handleNavClick('home', undefined, undefined, '/')}
            className="flex items-center gap-3 group focus:outline-none cursor-pointer text-left shrink-0"
          >
            <BrandLogo size="md" />
          </button>

          {/* Streamlined Desktop Navigation (4 Focused Pillars) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 nav-dropdown-container">
            
            {/* 1. Services Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('services')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => setOpenDropdown(openDropdown === 'services' ? null : 'services')}
                className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  openDropdown === 'services' || (currentPage === 'home' && currentPath.includes('solution'))
                    ? 'text-purple-300 bg-purple-950/40'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900/60'
                }`}
              >
                <span>Services</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
                    openDropdown === 'services' ? 'rotate-180 text-purple-400' : ''
                  }`}
                />
              </button>

              {openDropdown === 'services' && (
                <div className="absolute top-full left-0 mt-2 w-80 rounded-2xl bg-[#0b0620]/95 border border-purple-900/40 shadow-2xl backdrop-blur-xl p-3 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-purple-400 border-b border-purple-900/30 flex items-center justify-between">
                    <span>Capabilities</span>
                    <span className="text-[9px] text-neutral-400">Engineering & Growth</span>
                  </div>
                  
                  <button
                    onClick={() => handleNavClick('home', 'solutions', undefined, '/#solutions')}
                    className="w-full p-2.5 rounded-xl hover:bg-purple-950/60 text-left transition-colors flex items-start gap-3 group cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500/20 shrink-0 mt-0.5">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-purple-300">Software & Web Platforms</div>
                      <div className="text-[11px] text-neutral-400">Custom React, Next.js & enterprise cloud systems</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNavClick('home', 'solutions', undefined, '/#solutions')}
                    className="w-full p-2.5 rounded-xl hover:bg-purple-950/60 text-left transition-colors flex items-start gap-3 group cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:bg-purple-500/20 shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-purple-300">AI Agents & Automations</div>
                      <div className="text-[11px] text-neutral-400">Autonomous LLM swarms, n8n workflows & RAG</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNavClick('home', 'solutions', undefined, '/#solutions')}
                    className="w-full p-2.5 rounded-xl hover:bg-purple-950/60 text-left transition-colors flex items-start gap-3 group cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20 group-hover:bg-pink-500/20 shrink-0 mt-0.5">
                      <Palette className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-purple-300">Brand Systems & UI/UX</div>
                      <div className="text-[11px] text-neutral-400">Design systems, Figma wireframes & conversion UI</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNavClick('home', 'solutions', undefined, '/#solutions')}
                    className="w-full p-2.5 rounded-xl hover:bg-purple-950/60 text-left transition-colors flex items-start gap-3 group cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-amber-500/20 shrink-0 mt-0.5">
                      <Megaphone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-purple-300">Media Buying & Paid Growth</div>
                      <div className="text-[11px] text-neutral-400">Performance campaigns on Meta, TikTok & Google</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* 2. Work / Portfolio (Direct Link - Clean & Fast) */}
            <button
              onClick={() => handleNavClick('portfolio', undefined, undefined, '/pages/portfolio')}
              className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                currentPage === 'portfolio'
                  ? 'text-purple-300 bg-purple-950/40'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-900/60'
              }`}
            >
              <span>Work</span>
            </button>

            {/* 3. Academy Dropdown (Consolidated & Clean) */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('academy')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => setOpenDropdown(openDropdown === 'academy' ? null : 'academy')}
                className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  openDropdown === 'academy' || currentPage === 'academy' || currentPage === 'academy-course' || currentPage === 'cohort-1'
                    ? 'text-purple-300 bg-purple-950/40'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900/60'
                }`}
              >
                <span>Academy</span>
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Cohort 1.0
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
                    openDropdown === 'academy' ? 'rotate-180 text-purple-400' : ''
                  }`}
                />
              </button>

              {openDropdown === 'academy' && (
                <div className="absolute top-full left-0 mt-2 w-84 rounded-2xl bg-[#0b0620]/95 border border-purple-900/40 shadow-2xl backdrop-blur-xl p-3 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-purple-400 border-b border-purple-900/30 flex items-center justify-between">
                    <span>Academic Directorate</span>
                    <span className="text-[9px] text-amber-400 font-semibold">Admissions Open</span>
                  </div>

                  {/* Featured Cohort 1.0 Vault */}
                  <button
                    onClick={() => handleNavClick('cohort-1', undefined, undefined, '/academy/cohort-1')}
                    className="w-full p-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900/90 border border-purple-500/40 text-left transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-amber-300 flex items-center gap-1.5">
                          <span>Cohort 1.0 Master Vault</span>
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-400 text-black font-black">4 Tracks</span>
                        </div>
                        <div className="text-[10px] text-purple-200">Recordings, PDFs & Telegram access</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button
                    onClick={() => handleNavClick('academy', undefined, undefined, '/pages/academy')}
                    className="w-full p-2.5 rounded-xl hover:bg-purple-950/60 text-left transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <GraduationCap className="w-4 h-4 text-purple-400 shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-white group-hover:text-purple-300">All Programs Catalog</div>
                        <div className="text-[10px] text-neutral-400">Data, AI Systems & Freelance Mastery</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <div className="pt-2 border-t border-purple-900/30 flex items-center gap-2">
                    <button
                      onClick={() => handleNavClick('student-portal', undefined, undefined, '/pages/student-portal')}
                      className="flex-1 p-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/40 text-left transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="text-xs font-medium text-white">Student Portal</span>
                    </button>
                    <button
                      onClick={() => handleNavClick('certificate-portal', undefined, undefined, '/pages/certificate-portal')}
                      className="flex-1 p-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/40 text-left transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-xs font-medium text-white">Verify Cert</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Company & Insights Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('company')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => setOpenDropdown(openDropdown === 'company' ? null : 'company')}
                className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  openDropdown === 'company' || ['about', 'resources', 'categories', 'pages-directory'].includes(currentPage)
                    ? 'text-purple-300 bg-purple-950/40'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900/60'
                }`}
              >
                <span>Company</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
                    openDropdown === 'company' ? 'rotate-180 text-purple-400' : ''
                  }`}
                />
              </button>

              {openDropdown === 'company' && (
                <div className="absolute top-full left-0 mt-2 w-76 rounded-2xl bg-[#0b0620]/95 border border-purple-900/40 shadow-2xl backdrop-blur-xl p-3 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-purple-400 border-b border-purple-900/30">
                    Organization & Knowledge
                  </div>

                  <button
                    onClick={() => handleNavClick('about', undefined, undefined, '/pages/about')}
                    className="w-full p-2.5 rounded-xl hover:bg-purple-950/60 text-left transition-colors flex items-center gap-2.5 group cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-purple-400 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-purple-300">About Vixora</div>
                      <div className="text-[10px] text-neutral-400">Leadership, engineering principles & mission</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNavClick('categories', undefined, undefined, '/categories')}
                    className="w-full p-2.5 rounded-xl hover:bg-purple-950/60 text-left transition-colors flex items-center gap-2.5 group cursor-pointer"
                  >
                    <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-purple-300">Insights & Categories</div>
                      <div className="text-[10px] text-neutral-400">AI workflows, software architecture & growth</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNavClick('resources', undefined, undefined, '/pages/resources')}
                    className="w-full p-2.5 rounded-xl hover:bg-purple-950/60 text-left transition-colors flex items-center gap-2.5 group cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-purple-300">Knowledge Hub</div>
                      <div className="text-[10px] text-neutral-400">Blueprints, calculators & whitepapers</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNavClick('home', 'contact', undefined, '/#contact')}
                    className="w-full p-2.5 rounded-xl hover:bg-purple-950/60 text-left transition-colors flex items-center gap-2.5 group cursor-pointer border-t border-purple-900/30"
                  >
                    <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-purple-300">Contact & Inquiries</div>
                      <div className="text-[10px] text-neutral-400">Direct WhatsApp & email advisory</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Decluttered Action Area (Right Side) */}
          <div className="hidden sm:flex items-center gap-2 nav-dropdown-container">
            
            {/* Unified Portals Popover Menu (Replaces 4 sprawling individual portal buttons!) */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('portals')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                id="nav-portals-menu-btn"
                onClick={() => setOpenDropdown(openDropdown === 'portals' ? null : 'portals')}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isPortalActive || openDropdown === 'portals'
                    ? 'bg-purple-600/20 text-purple-300 border-purple-500/50 shadow-xs'
                    : 'bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border-purple-500/20 hover:border-purple-500/40'
                }`}
                title="Student, Client & Workspace Portals"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Portals</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
                    openDropdown === 'portals' ? 'rotate-180 text-purple-400' : ''
                  }`}
                />
              </button>

              {openDropdown === 'portals' && (
                <div className="absolute top-full right-0 mt-2 w-72 rounded-2xl bg-[#0b0620]/95 border border-purple-900/40 shadow-2xl backdrop-blur-xl p-3 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-purple-400 border-b border-purple-900/30">
                    Secure Workspace Portals
                  </div>

                  {/* Student Portal */}
                  <button
                    id="nav-student-portal-btn"
                    onClick={() => handleNavClick('student-portal', undefined, undefined, '/pages/student-portal')}
                    className="w-full p-2.5 rounded-xl hover:bg-purple-950/60 text-left transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white group-hover:text-purple-300">Student Portal</div>
                        <div className="text-[10px] text-neutral-400">Course materials & cert validation</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-purple-300" />
                  </button>

                  {/* Client Portal */}
                  <button
                    id="nav-client-portal-btn"
                    onClick={() => handleNavClick('dashboard', undefined, undefined, '/pages/dashboard')}
                    className="w-full p-2.5 rounded-xl hover:bg-purple-950/60 text-left transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-amber-500/20">
                        <LayoutDashboard className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white group-hover:text-purple-300">Client Portal</div>
                        <div className="text-[10px] text-neutral-400">Project milestones & deliverables</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-purple-300" />
                  </button>

                  {/* AI Advisor Modal */}
                  {onOpenAiAdvisor && (
                    <button
                      id="nav-ai-advisor-btn"
                      onClick={() => {
                        setOpenDropdown(null);
                        onOpenAiAdvisor();
                      }}
                      className="w-full p-2.5 rounded-xl hover:bg-purple-950/60 text-left transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:bg-purple-500/20">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white group-hover:text-purple-300">AI Advisor Engine</div>
                          <div className="text-[10px] text-neutral-400">Architecture & career guidance</div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-purple-300" />
                    </button>
                  )}

                  {/* Drive Workspace Modal */}
                  <button
                    id="nav-drive-workspace-btn"
                    onClick={() => {
                      setOpenDropdown(null);
                      onOpenDriveWorkspace();
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-purple-950/60 text-left transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500/20">
                        <HardDrive className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white group-hover:text-purple-300">Drive PRD Workspace</div>
                        <div className="text-[10px] text-neutral-400">Doc synchronization & specs</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-purple-300" />
                  </button>

                  {/* Admin Command Center (if admin view) */}
                  {(currentPage === 'admin' || (typeof window !== 'undefined' && window.location.hostname.startsWith('admin.'))) && (
                    <button
                      id="nav-admin-portal-btn"
                      onClick={() => handleNavClick('admin', undefined, undefined, '/admin')}
                      className="w-full p-2.5 rounded-xl hover:bg-purple-950/60 text-left transition-colors flex items-center justify-between group cursor-pointer border-t border-purple-900/30"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white">Admin Command Center</div>
                          <div className="text-[10px] text-neutral-400">Submissions, keys & audit</div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-purple-300" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Currency Switcher (NGN / USD) */}
            <CurrencySwitcher />

            {/* Theme Toggle Button */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
              aria-label="Toggle color theme"
              className="p-2 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer shadow-xs"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-300 animate-in spin-in-180 duration-200" />
              ) : (
                <Moon className="w-4 h-4 text-purple-600 animate-in spin-in-180 duration-200" />
              )}
            </button>

            {/* Primary Action CTA */}
            <button
              id="nav-book-consultation-btn"
              onClick={onOpenProjectModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 active:scale-[0.98] transition-all cursor-pointer ml-1"
            >
              <span>Consultation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Controls */}
          <div className="flex lg:hidden items-center gap-2">
            <CurrencySwitcher variant="compact" />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-neutral-900 text-neutral-300 border border-purple-500/20"
              title="Toggle Theme"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-purple-600" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-neutral-900/80 text-neutral-300 hover:text-white border border-neutral-800 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Streamlined Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0A051C]/98 border-b border-purple-900/30 px-5 py-6 space-y-4 backdrop-blur-2xl animate-in slide-in-from-top-4 duration-200 shadow-2xl max-h-[85vh] overflow-y-auto">
          {/* Mobile Header */}
          <div className="flex items-center justify-between pb-3 border-b border-purple-900/30">
            <button
              onClick={() => handleNavClick('home', undefined, undefined, '/')}
              className="flex items-center gap-3 text-left cursor-pointer"
            >
              <BrandLogo variant="mobile" size="md" responsive={false} />
              <div>
                <div className="text-xs font-bold text-white tracking-wider">VIXORA DIGITAL HUB</div>
                <div className="text-[10px] text-purple-400 font-mono">Software • AI • Academy</div>
              </div>
            </button>
            <button
              onClick={() => handleNavClick('home', undefined, undefined, '/')}
              className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-purple-950/60 text-purple-300 border border-purple-800/40 hover:bg-purple-900/60 cursor-pointer"
            >
              Home
            </button>
          </div>

          {/* Section 1: Services */}
          <div className="border-t border-purple-900/30 pt-3 space-y-1">
            <button
              onClick={() => toggleMobileSection('services')}
              className="w-full flex items-center justify-between text-left py-2 px-3 text-xs font-mono uppercase tracking-wider text-purple-300 font-bold"
            >
              <span>Services & Solutions</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  mobileExpandedSection === 'services' ? 'rotate-180' : ''
                }`}
              />
            </button>
            {mobileExpandedSection === 'services' && (
              <div className="pl-3 space-y-1 pt-1 animate-in fade-in duration-150">
                <button
                  onClick={() => handleNavClick('home', 'solutions', undefined, '/#solutions')}
                  className="w-full text-left py-2 px-3 text-xs text-neutral-300 hover:text-white"
                >
                  Software & Cloud Platforms
                </button>
                <button
                  onClick={() => handleNavClick('home', 'solutions', undefined, '/#solutions')}
                  className="w-full text-left py-2 px-3 text-xs text-neutral-300 hover:text-white"
                >
                  AI Agents & Workflow Automations
                </button>
                <button
                  onClick={() => handleNavClick('home', 'solutions', undefined, '/#solutions')}
                  className="w-full text-left py-2 px-3 text-xs text-neutral-300 hover:text-white"
                >
                  Branding & UI/UX Design Systems
                </button>
                <button
                  onClick={() => handleNavClick('home', 'solutions', undefined, '/#solutions')}
                  className="w-full text-left py-2 px-3 text-xs text-neutral-300 hover:text-white"
                >
                  Media Buying & Paid Growth
                </button>
              </div>
            )}
          </div>

          {/* Section 2: Work & Portfolio (Direct Link) */}
          <div className="border-t border-purple-900/30 pt-2">
            <button
              onClick={() => handleNavClick('portfolio', undefined, undefined, '/pages/portfolio')}
              className="w-full flex items-center justify-between text-left py-2 px-3 text-xs font-bold text-white hover:text-purple-300"
            >
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                <span>Portfolio & Case Studies</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
            </button>
          </div>

          {/* Section 3: Academy */}
          <div className="border-t border-purple-900/30 pt-3 space-y-1">
            <button
              onClick={() => toggleMobileSection('academy')}
              className="w-full flex items-center justify-between text-left py-2 px-3 text-xs font-mono uppercase tracking-wider text-purple-300 font-bold"
            >
              <div className="flex items-center gap-2">
                <span>Vixora Academy</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-400 text-black font-black">Cohort 1.0</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  mobileExpandedSection === 'academy' ? 'rotate-180' : ''
                }`}
              />
            </button>
            {mobileExpandedSection === 'academy' && (
              <div className="pl-3 space-y-1 pt-1 animate-in fade-in duration-150">
                <button
                  onClick={() => handleNavClick('cohort-1', undefined, undefined, '/academy/cohort-1')}
                  className="w-full text-left py-2 px-3 text-xs font-bold text-amber-300 flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Cohort 1.0 Master Vault (4 Tracks)</span>
                </button>
                <button
                  onClick={() => handleNavClick('academy', undefined, undefined, '/pages/academy')}
                  className="w-full text-left py-2 px-3 text-xs font-semibold text-purple-300"
                >
                  View All Programs & Curriculum →
                </button>
                <button
                  onClick={() => handleNavClick('academy-course', undefined, 'data-analysis-cohort', '/academy/data-analysis-cohort')}
                  className="w-full text-left py-2 px-3 text-xs text-neutral-300 hover:text-white"
                >
                  Data Analysis Cohort (16 Wks)
                </button>
                <button
                  onClick={() => handleNavClick('academy-course', undefined, 'ai-automation-digital-business-systems', '/academy/ai-automation-digital-business-systems')}
                  className="w-full text-left py-2 px-3 text-xs text-neutral-300 hover:text-white"
                >
                  AI Automation Systems (12 Wks)
                </button>
                <button
                  onClick={() => handleNavClick('academy-course', undefined, 'complete-ai-digital-skills-freelancing-mastery', '/academy/complete-ai-digital-skills-freelancing-mastery')}
                  className="w-full text-left py-2 px-3 text-xs text-neutral-300 hover:text-white"
                >
                  AI Freelance Mastery (6 Wks)
                </button>
              </div>
            )}
          </div>

          {/* Section 4: Company & Insights */}
          <div className="border-t border-purple-900/30 pt-3 space-y-1">
            <button
              onClick={() => toggleMobileSection('company')}
              className="w-full flex items-center justify-between text-left py-2 px-3 text-xs font-mono uppercase tracking-wider text-purple-300 font-bold"
            >
              <span>Company & Insights</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  mobileExpandedSection === 'company' ? 'rotate-180' : ''
                }`}
              />
            </button>
            {mobileExpandedSection === 'company' && (
              <div className="pl-3 space-y-1 pt-1 animate-in fade-in duration-150">
                <button
                  onClick={() => handleNavClick('about', undefined, undefined, '/pages/about')}
                  className="w-full text-left py-2 px-3 text-xs text-neutral-300 hover:text-white"
                >
                  About Vixora
                </button>
                <button
                  onClick={() => handleNavClick('categories', undefined, undefined, '/categories')}
                  className="w-full text-left py-2 px-3 text-xs text-neutral-300 hover:text-white"
                >
                  Insights & Categories Index
                </button>
                <button
                  onClick={() => handleNavClick('resources', undefined, undefined, '/pages/resources')}
                  className="w-full text-left py-2 px-3 text-xs text-neutral-300 hover:text-white"
                >
                  Knowledge Hub & Blueprints
                </button>
                <button
                  onClick={() => handleNavClick('home', 'contact', undefined, '/#contact')}
                  className="w-full text-left py-2 px-3 text-xs text-neutral-300 hover:text-white"
                >
                  Contact Us
                </button>
              </div>
            )}
          </div>

          {/* Clean 2x2 Portals Grid for Mobile */}
          <div className="pt-3 border-t border-purple-900/30">
            <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-2 px-1">
              Workspace Portals
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleNavClick('student-portal', undefined, undefined, '/pages/student-portal')}
                className="p-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/40 text-left transition-colors flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-semibold text-white">Student Portal</span>
              </button>
              <button
                onClick={() => handleNavClick('dashboard', undefined, undefined, '/pages/dashboard')}
                className="p-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/40 text-left transition-colors flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-semibold text-white">Client Portal</span>
              </button>
              {onOpenAiAdvisor && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAiAdvisor();
                  }}
                  className="p-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/40 text-left transition-colors flex items-center gap-2"
                >
                  <Bot className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="text-xs font-semibold text-white">AI Advisor</span>
                </button>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenDriveWorkspace();
                }}
                className="p-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/40 text-left transition-colors flex items-center gap-2"
              >
                <HardDrive className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-xs font-semibold text-white">Drive Hub</span>
              </button>
            </div>
          </div>

          {/* Primary CTA button in Mobile Menu */}
          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenProjectModal();
              }}
              className="w-full py-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Book Consultation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
