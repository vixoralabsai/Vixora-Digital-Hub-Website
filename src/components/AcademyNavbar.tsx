import { useState, useEffect } from 'react';
import {
  GraduationCap,
  BookOpen,
  ShieldCheck,
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Bot,
  Send
} from 'lucide-react';
import { BRAND_CONFIG } from '../data/brandConfig';
import { ACADEMY_COURSES } from '../data/vixoraContent';
import { CurrencySwitcher } from './CurrencySwitcher';

interface AcademyNavbarProps {
  currentPage: string;
  currentPath?: string;
  onNavigate: (page: string, sectionId?: string, courseSlug?: string, customPath?: string) => void;
  onOpenCorporateModal?: () => void;
  onOpenAiAdvisor?: () => void;
}

export function AcademyNavbar({
  currentPage,
  onNavigate,
  onOpenAiAdvisor
}: AcademyNavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [coursesDropdownOpen, setCoursesDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (page: string, sectionId?: string, courseSlug?: string, customPath?: string) => {
    setCoursesDropdownOpen(false);
    setMobileMenuOpen(false);
    onNavigate(page, sectionId, courseSlug, customPath);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-[#000048]/95 backdrop-blur-md border-b border-[#480878]/50 shadow-lg shadow-black/40'
          : 'bg-[#000048] border-b border-[#480878]/40'
      }`}
    >
      {/* Subdomain Indicator Strip */}
      <div className="bg-[#000028] border-b border-purple-900/40 py-1 px-3 sm:px-4 text-[11px] text-purple-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 truncate">
            <span className="font-mono font-bold text-white tracking-wide truncate text-[10px] sm:text-[11px]">
              {BRAND_CONFIG.cleanAcademyDomain}
            </span>
            <span className="text-purple-300/80 hidden sm:inline">· Academic Directorate Portal</span>
          </div>
          <button
            onClick={() => handleNavClick('home', undefined, undefined, '/')}
            className="text-amber-300 hover:text-amber-200 font-semibold flex items-center gap-1 cursor-pointer transition-colors shrink-0 text-[10px] sm:text-[11px]"
          >
            <span>Return to <span className="hidden sm:inline">Main </span>Hub</span>
            <span className="hidden md:inline font-mono text-[10px]">({BRAND_CONFIG.cleanDomain})</span> &rarr;
          </button>
        </div>
      </div>

      {/* Main Academy Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5">
        <div className="flex items-center justify-between gap-2 sm:gap-4 min-w-0">
          
          {/* Logo Identity (Single Wordmark Element) */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => handleNavClick('academy', undefined, undefined, '/pages/academy')}
              className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none min-w-0"
              aria-label="Vixora Academy Home"
            >
              <div className="p-1 sm:p-1.5 bg-white rounded-xl shadow-md border border-purple-100 flex items-center justify-center shrink-0">
                <img
                  src={BRAND_CONFIG.academyLogo?.imageUrl || "/images/vixora-academy-logo.png"}
                  alt={BRAND_CONFIG.academyLogo?.altText || "Vixora Academy"}
                  onError={(e) => { (e.target as HTMLImageElement).src = '/images/vixora-academy-logo.jpg'; }}
                  className="h-7 sm:h-8 w-auto max-w-[125px] sm:max-w-[180px] object-contain rounded-lg"
                />
              </div>
              <span className="hidden md:inline text-sm font-black text-white tracking-tight whitespace-nowrap shrink-0">
                Vixora Academy
              </span>
            </button>
          </div>

          {/* Streamlined Desktop Navigation (Clean 4 Items) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            
            {/* 1. Academic Programs Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCoursesDropdownOpen(!coursesDropdownOpen)}
                onMouseEnter={() => setCoursesDropdownOpen(true)}
                className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentPage === 'academy' || currentPage === 'academy-course'
                    ? 'text-white bg-white/15'
                    : 'text-purple-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-purple-300" />
                <span>Programs</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${coursesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {coursesDropdownOpen && (
                <div
                  onMouseLeave={() => setCoursesDropdownOpen(false)}
                  className="absolute top-full left-0 mt-2 w-84 rounded-2xl bg-[#07031C] border border-purple-500/30 shadow-2xl p-3 space-y-1.5 animate-in fade-in duration-150 z-50 text-white"
                >
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-purple-300 border-b border-purple-900/40 flex items-center justify-between">
                    <span>Accredited Tracks</span>
                    <span className="text-amber-400 font-bold">2026 Admissions</span>
                  </div>

                  <button
                    onClick={() => handleNavClick('academy', undefined, undefined, '/pages/academy')}
                    className="w-full p-2 rounded-xl hover:bg-white/10 text-left transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-amber-300" />
                      <span className="text-xs font-bold text-white group-hover:text-amber-300">All Academy Programs</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  {ACADEMY_COURSES.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => handleNavClick('academy-course', undefined, course.slug, `/academy/${course.slug}`)}
                      className="w-full p-2 rounded-xl hover:bg-white/10 text-left transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold text-white group-hover:text-purple-300 truncate max-w-[200px]">
                          {course.title}
                        </div>
                        <span className="text-[10px] font-mono text-amber-300">{course.duration}</span>
                      </div>
                      <div className="text-[11px] text-neutral-400 line-clamp-1">{course.badge}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Direct Link: Course Curriculum Hub */}
            <button
              onClick={() => handleNavClick('training', undefined, undefined, '/pages/training')}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                currentPage === 'training'
                  ? 'text-amber-300 bg-purple-950/80 border border-amber-400/30'
                  : 'text-purple-100 hover:text-amber-300 hover:bg-white/10'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-300" />
              <span>Curriculum</span>
            </button>

            {/* 3. Direct Link: Cohort 1.0 Master Vault */}
            <button
              onClick={() => handleNavClick('cohort-1', undefined, undefined, '/academy/cohort-1')}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                currentPage === 'cohort-1'
                  ? 'text-amber-300 bg-purple-950/80 border border-amber-400/30'
                  : 'text-purple-100 hover:text-amber-300 hover:bg-white/10'
              }`}
            >
              <span>Cohort 1.0 Vault</span>
            </button>

            {/* 3. Direct Link: Verify Credential */}
            <button
              onClick={() => handleNavClick('certificate-portal', undefined, undefined, '/pages/certificate-portal')}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                currentPage === 'certificate-portal'
                  ? 'text-white bg-white/20'
                  : 'text-purple-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verify Credential</span>
            </button>

            {/* 4. Admissions Desk WhatsApp */}
            <a
              href={BRAND_CONFIG.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-xs font-semibold text-emerald-300 hover:text-emerald-200 hover:bg-emerald-950/40 rounded-xl transition-all flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admissions Desk</span>
            </a>

            {/* 5. Public Telegram Channel */}
            <a
              href={BRAND_CONFIG.telegramPublicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-xs font-semibold text-sky-300 hover:text-sky-200 hover:bg-sky-950/40 rounded-xl transition-all flex items-center gap-1.5"
              title="Join Vixora Academy Public Telegram Community"
            >
              <Send className="w-3.5 h-3.5 text-sky-400" />
              <span>Telegram</span>
            </a>
          </nav>

          {/* Action CTAs (Right Side) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Currency Switcher (USD / NGN) */}
            <CurrencySwitcher />

            {/* Student Portal Button (Clean, Non-redundant) */}
            <button
              onClick={() => handleNavClick('student-portal', undefined, undefined, '/pages/student-portal')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentPage === 'student-portal'
                  ? 'bg-purple-600 text-white border border-purple-400 shadow-purple-600/30'
                  : 'text-white bg-white/15 hover:bg-white/25 border border-white/20'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
              <span>Student Portal</span>
            </button>

            {/* Primary Enroll CTA */}
            <button
              onClick={() => {
                const el = document.getElementById('catalog');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  handleNavClick('academy', undefined, undefined, '/pages/academy');
                }
              }}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-[#000048] bg-amber-400 hover:bg-amber-300 transition-all cursor-pointer shadow-md flex items-center gap-1.5 shrink-0"
            >
              <span>Enroll Now</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#000048]" />
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 sm:p-2 rounded-xl text-white hover:bg-white/10 lg:hidden cursor-pointer shrink-0"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Streamlined Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#000048] border-t border-[#480878]/50 px-4 pt-4 pb-6 space-y-3 animate-in slide-in-from-top-3 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
            <div className="text-purple-200">
              Dean: <strong className="text-white">Sarumi Hammad</strong>
            </div>
            <span className="font-mono text-[11px] text-emerald-300 bg-white/10 px-2 py-0.5 rounded-md">
              {BRAND_CONFIG.cleanAcademyDomain}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            {onOpenAiAdvisor && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAiAdvisor();
                }}
                className="w-full p-2.5 rounded-xl text-left font-bold text-white bg-[#1E113F] border border-purple-500/40 flex items-center justify-between shadow-md mb-1"
              >
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-300" />
                  <span>AI Course Advisor (Match Career)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-purple-300" />
              </button>
            )}

            <button
              onClick={() => handleNavClick('training', undefined, undefined, '/pages/training')}
              className="w-full p-2.5 rounded-xl text-left font-bold text-white bg-purple-950/70 border border-purple-500/40 flex items-center justify-between shadow-xs"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-300" />
                <span>Course Curriculum Hub</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-purple-300" />
            </button>

            <button
              onClick={() => handleNavClick('cohort-1', undefined, undefined, '/academy/cohort-1')}
              className="w-full p-2.5 rounded-xl text-left font-bold text-white bg-purple-950/70 border border-purple-500/40 flex items-center justify-between shadow-xs"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Cohort 1.0 Master Vault (4 Tracks)</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
            </button>

            <button
              onClick={() => handleNavClick('academy', undefined, undefined, '/pages/academy')}
              className="w-full p-2.5 rounded-xl text-left font-bold text-white hover:bg-white/10 flex items-center justify-between"
            >
              <span>All Academy Programs Catalog</span>
              <ArrowRight className="w-3.5 h-3.5 text-purple-300" />
            </button>

            <button
              onClick={() => handleNavClick('student-portal', undefined, undefined, '/pages/student-portal')}
              className="w-full p-2.5 rounded-xl text-left font-bold text-white hover:bg-white/10 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-amber-300" />
                <span>Student Portal & Dashboard</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-purple-300" />
            </button>

            <button
              onClick={() => handleNavClick('certificate-portal', undefined, undefined, '/pages/certificate-portal')}
              className="w-full p-2.5 rounded-xl text-left font-bold text-white hover:bg-white/10 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verify Credential ID</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-purple-300" />
            </button>

            <a
              href={BRAND_CONFIG.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full p-2.5 rounded-xl text-left font-semibold text-emerald-300 hover:bg-emerald-950/40 flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Admissions Desk WhatsApp</span>
            </a>

            <a
              href={BRAND_CONFIG.telegramPublicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full p-2.5 rounded-xl text-left font-semibold text-sky-300 hover:bg-sky-950/40 flex items-center gap-2"
            >
              <Send className="w-4 h-4 text-sky-400" />
              <span>Join Public Telegram Channel (@vixoraacademy)</span>
            </a>

            <button
              onClick={() => handleNavClick('home', undefined, undefined, '/')}
              className="w-full p-2.5 rounded-xl text-left font-medium text-purple-200 hover:bg-white/10 flex items-center justify-between border-t border-white/10 pt-3"
            >
              <span>Switch to Main Hub ({BRAND_CONFIG.cleanDomain})</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
