import { useState, useEffect } from 'react';
import {
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  HardDrive
} from 'lucide-react';

interface NavbarProps {
  onOpenProjectModal: () => void;
  onOpenDriveWorkspace: () => void;
  currentPage: string;
  onNavigate: (page: string, sectionId?: string) => void;
}

export function Navbar({
  onOpenProjectModal,
  onOpenDriveWorkspace,
  currentPage,
  onNavigate,
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', page: 'home' },
    { name: 'About Us', page: 'about' },
    { name: 'Solutions', page: 'home', sectionId: 'solutions' },
    { name: 'Services', page: 'home', sectionId: 'solutions' },
    { name: 'Academy', page: 'academy' },
    { name: 'Portfolio', page: 'portfolio' },
    { name: 'Resources', page: 'resources' },
    { name: 'Contact', page: 'home', sectionId: 'contact' },
  ];

  const handleItemClick = (page: string, sectionId?: string) => {
    setMobileMenuOpen(false);
    onNavigate(page, sectionId);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#070314]/90 backdrop-blur-md border-b border-purple-900/30 shadow-lg shadow-black/60 py-3'
          : 'bg-transparent py-4 sm:py-5 border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Brand Identity (3D Origami "V" + VIXORA DIGITAL HUB) */}
          <button
            onClick={() => handleItemClick('home')}
            className="flex items-center gap-3 group focus:outline-none cursor-pointer text-left"
          >
            {/* 3D Geometric Faceted 'V' Icon */}
            <div className="relative w-9 h-9 flex items-center justify-center group-hover:scale-105 transition-transform">
              <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-[0_0_12px_rgba(168,85,247,0.7)]">
                <defs>
                  <linearGradient id="navVLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                  <linearGradient id="navVRight" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#A855F7" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                </defs>
                <polygon points="6,6 16,6 20,32 13,32" fill="url(#navVLeft)" />
                <polygon points="34,6 24,6 20,32 27,32" fill="url(#navVRight)" />
                <polygon points="16,6 24,6 20,32" fill="#180B2B" opacity="0.6" />
                <polyline points="6,6 20,33 34,6" stroke="#C084FC" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-wider text-white">
                  VIXORA
                </span>
              </div>
              <span className="text-[9px] font-semibold tracking-widest text-neutral-400 uppercase -mt-1">
                DIGITAL HUB
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive =
                currentPage === item.page &&
                (!item.sectionId || item.page !== 'home');
              return (
                <button
                  key={item.name}
                  onClick={() => handleItemClick(item.page, item.sectionId)}
                  className={`text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'text-purple-300 font-semibold'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Google Drive PRD Workspace Tool */}
            <button
              id="nav-drive-workspace-btn"
              onClick={onOpenDriveWorkspace}
              title="Google Drive PRD Workspace & Document Analyzer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-neutral-900/90 hover:bg-neutral-800 text-purple-300 hover:text-white border border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer shadow-xs"
            >
              <HardDrive className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden md:inline">Drive Workspace</span>
            </button>

            {/* Book Consultation / Start Project CTA */}
            <button
              id="nav-book-consultation-btn"
              onClick={onOpenProjectModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Book Consultation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex xl:hidden items-center gap-2">
            <button
              onClick={onOpenDriveWorkspace}
              className="p-2 rounded-lg bg-neutral-900 text-purple-400 border border-purple-500/20 sm:hidden"
            >
              <HardDrive className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-neutral-900/80 text-neutral-300 hover:text-white border border-neutral-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#0A051C]/95 border-b border-purple-900/30 px-6 py-6 space-y-4 backdrop-blur-xl animate-in slide-in-from-top-4 duration-200 shadow-2xl">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleItemClick(item.page, item.sectionId)}
                className="text-left px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white hover:bg-purple-950/40 rounded-lg flex items-center justify-between"
              >
                <span>{item.name}</span>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-purple-900/30 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDriveWorkspace();
              }}
              className="w-full py-2.5 rounded-xl text-xs font-medium bg-purple-950/60 text-purple-300 border border-purple-800/40 flex items-center justify-center gap-2"
            >
              <HardDrive className="w-4 h-4 text-purple-400" />
              <span>Drive Requirements PRD Hub</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenProjectModal();
              }}
              className="w-full py-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 flex items-center justify-center gap-2"
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
