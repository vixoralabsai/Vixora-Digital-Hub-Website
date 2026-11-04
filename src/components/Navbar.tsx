import { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, Sun, Moon } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  onOpenProjectModal: () => void;
  onOpenDriveWorkspace?: () => void;
  onOpenAiAdvisor?: () => void;
  currentPage: string;
  currentPath?: string;
  onNavigate: (page: string, sectionId?: string, courseSlug?: string, customPath?: string) => void;
}

export function Navbar({
  onOpenProjectModal,
  currentPage,
  currentPath = '/',
  onNavigate,
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (
    page: string,
    sectionId?: string,
    courseSlug?: string,
    customPath?: string
  ) => {
    setMobileMenuOpen(false);
    onNavigate(page, sectionId, courseSlug, customPath);
  };

  const isCurrent = (page: string, pathPrefix?: string) => {
    if (currentPage === page) return true;
    if (pathPrefix && currentPath.startsWith(pathPrefix)) return true;
    return false;
  };

  return (
    <header
      id="main-navigation"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-[#070314]/95 backdrop-blur-md border-b border-purple-900/30 shadow-lg shadow-black/50 py-3'
          : 'bg-[#070314]/85 backdrop-blur-md border-b border-purple-900/15 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8">
          
          {/* ZONE 1: BRAND IDENTITY (Single clean wordmark) */}
          <button
            onClick={() => handleNavClick('home', undefined, undefined, '/')}
            className="flex items-center gap-2 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-lg shrink-0"
            aria-label="Vixora Digital Hub Home"
          >
            <BrandLogo size="md" />
          </button>

          {/* ZONE 2: CLEAN SINGLE-LINE NAV LINKS (4-5 focused destinations) */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium"
          >
            <button
              onClick={() => handleNavClick('home', 'solutions', undefined, '/#solutions')}
              className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 ${
                currentPage === 'home' && (currentPath.includes('solution') || currentPath === '/' || currentPath === '')
                  ? 'text-white border-purple-400 font-semibold'
                  : 'text-neutral-300 hover:text-white border-transparent'
              }`}
            >
              Services
            </button>

            <button
              onClick={() => handleNavClick('portfolio', undefined, undefined, '/pages/portfolio')}
              className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 ${
                isCurrent('portfolio', '/pages/portfolio')
                  ? 'text-white border-purple-400 font-semibold'
                  : 'text-neutral-300 hover:text-white border-transparent'
              }`}
            >
              Work
            </button>

            <button
              onClick={() => handleNavClick('academy', undefined, undefined, '/pages/academy')}
              className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 ${
                currentPage === 'academy' || currentPage === 'cohort-1' || currentPath.includes('academy')
                  ? 'text-white border-purple-400 font-semibold'
                  : 'text-neutral-300 hover:text-white border-transparent'
              }`}
            >
              Academy
            </button>

            <button
              onClick={() => handleNavClick('about', undefined, undefined, '/pages/about')}
              className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 ${
                isCurrent('about', '/pages/about')
                  ? 'text-white border-purple-400 font-semibold'
                  : 'text-neutral-300 hover:text-white border-transparent'
              }`}
            >
              About
            </button>

            <button
              onClick={() => handleNavClick('student-portal', undefined, undefined, '/pages/student-portal')}
              className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 ${
                isCurrent('student-portal', '/pages/student-portal') || isCurrent('certificate-portal', '/pages/certificate-portal')
                  ? 'text-white border-purple-400 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200 border-transparent text-xs'
              }`}
            >
              Student Portal
            </button>
          </nav>

          {/* ZONE 3: SINGLE PRIMARY ACTION */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Theme Toggle (Subtle & Quiet) */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
              aria-label="Toggle color theme"
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900/60 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Primary Action Button */}
            <button
              id="nav-start-project-btn"
              onClick={onOpenProjectModal}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all duration-200 cursor-pointer shadow-sm hover:shadow-purple-500/20 whitespace-nowrap shrink-0"
            >
              <span>Start Project</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-900/80 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          className="md:hidden bg-[#070314]/98 border-b border-purple-900/40 backdrop-blur-xl px-4 pt-3 pb-6 animate-in slide-in-from-top-2 duration-150"
        >
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => handleNavClick('home', 'solutions', undefined, '/#solutions')}
              className="px-3 py-2.5 rounded-lg text-left text-sm font-medium text-neutral-200 hover:text-white hover:bg-purple-950/40 transition-colors"
            >
              Services &amp; Capabilities
            </button>
            <button
              onClick={() => handleNavClick('portfolio', undefined, undefined, '/pages/portfolio')}
              className="px-3 py-2.5 rounded-lg text-left text-sm font-medium text-neutral-200 hover:text-white hover:bg-purple-950/40 transition-colors"
            >
              Featured Work
            </button>
            <button
              onClick={() => handleNavClick('academy', undefined, undefined, '/pages/academy')}
              className="px-3 py-2.5 rounded-lg text-left text-sm font-medium text-neutral-200 hover:text-white hover:bg-purple-950/40 transition-colors"
            >
              Vixora Academy
            </button>
            <button
              onClick={() => handleNavClick('about', undefined, undefined, '/pages/about')}
              className="px-3 py-2.5 rounded-lg text-left text-sm font-medium text-neutral-200 hover:text-white hover:bg-purple-950/40 transition-colors"
            >
              About Vixora
            </button>
            <button
              onClick={() => handleNavClick('student-portal', undefined, undefined, '/pages/student-portal')}
              className="px-3 py-2.5 rounded-lg text-left text-sm font-medium text-neutral-400 hover:text-white hover:bg-purple-950/40 transition-colors"
            >
              Student Portal &amp; Certifications
            </button>

            <div className="pt-3 mt-2 border-t border-purple-900/30">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenProjectModal();
                }}
                className="w-full py-3 px-4 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <span>Start Your Project</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
