import { useState } from 'react';
import {
  Mail,
  Phone,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HardDrive
} from 'lucide-react';
import { COMPANY_CONTACT } from '../data/vixoraContent';
import { BRAND_CONFIG } from '../data/brandConfig';

interface FooterProps {
  onOpenDriveWorkspace: () => void;
  onOpenProjectModal: () => void;
  onNavigate: (page: string, sectionId?: string, courseSlug?: string) => void;
}

export function Footer({ onOpenDriveWorkspace, onOpenProjectModal, onNavigate }: FooterProps) {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [logoLoadError, setLogoLoadError] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <footer id="contact" className="bg-[#05020F] border-t border-purple-900/30 text-neutral-300 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Top Tier: Company Info & Direct Communication Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12 border-b border-purple-900/20">
          {/* Brand & Mission */}
          <div className="lg:col-span-4 space-y-4">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-3 text-left cursor-pointer group"
            >
              {BRAND_CONFIG.logo.imageUrl && !logoLoadError ? (
                <div className="flex items-center gap-2">
                  <img
                    src={BRAND_CONFIG.logo.imageUrl}
                    alt={BRAND_CONFIG.logo.altText || BRAND_CONFIG.name}
                    onError={() => setLogoLoadError(true)}
                    className="h-8 sm:h-9 w-auto max-w-[160px] object-contain group-hover:opacity-90 transition-opacity"
                  />
                </div>
              ) : (
                <>
                  <div className="relative w-8 h-8 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-[0_0_12px_rgba(168,85,247,0.7)]">
                      <defs>
                        <linearGradient id="footerVLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3B82F6" />
                          <stop offset="100%" stopColor="#8B5CF6" />
                        </linearGradient>
                        <linearGradient id="footerVRight" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#A855F7" />
                          <stop offset="100%" stopColor="#6366F1" />
                        </linearGradient>
                      </defs>
                      <polygon points="6,6 16,6 20,32 13,32" fill="url(#footerVLeft)" />
                      <polygon points="34,6 24,6 20,32 27,32" fill="url(#footerVRight)" />
                      <polyline points="6,6 20,33 34,6" stroke="#C084FC" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-lg tracking-tight text-white">
                      Vixora Digital Hub
                    </span>
                    <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest">
                      Software • AI • Automation
                    </span>
                  </div>
                </>
              )}
            </button>

            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-sm">
              The digital headquarters for custom software engineering, autonomous AI workflows, high-converting media buying, and executive technical education.
            </p>

            {/* Direct Contact Links */}
            <div className="space-y-2 pt-2 text-xs">
              <a
                href={`mailto:${COMPANY_CONTACT.email}`}
                className="flex items-center gap-2.5 text-neutral-300 hover:text-purple-400 transition-colors"
              >
                <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                <span>{COMPANY_CONTACT.email}</span>
              </a>

              <div className="pt-1 space-y-1.5 border-t border-neutral-800/80">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">
                  Direct WhatsApp Inbound Lines:
                </span>

                {/* US & Global Line */}
                <a
                  href={BRAND_CONFIG.whatsapp.defaultUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-2 text-emerald-400 hover:text-emerald-300 transition-colors group"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white group-hover:text-emerald-300 flex items-center gap-1.5">
                      <span>🇺🇸 🌐</span> US & Global Inbounds
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400">
                      {BRAND_CONFIG.whatsapp.usAndGlobal.displayNumber}
                    </span>
                  </div>
                </a>

                {/* Nigeria Line */}
                <a
                  href={`https://wa.me/${BRAND_CONFIG.whatsapp.nigeria.cleanDigits}?text=Hello%20Vixora%20Digital%20Hub%20Team%2C%20I%20would%20like%20to%20discuss%20a%20new%20project.`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-2 text-emerald-400 hover:text-emerald-300 transition-colors group"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white group-hover:text-emerald-300 flex items-center gap-1.5">
                      <span>🇳🇬</span> Nigeria Inbounds
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400">
                      {BRAND_CONFIG.whatsapp.nigeria.displayNumber}
                      <span className="text-neutral-500 font-normal text-[10px] ml-1">
                        ({BRAND_CONFIG.whatsapp.nigeria.fullInternationalNumber})
                      </span>
                    </span>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Navigation Links Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {/* Quick Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Quick Links
              </h4>
              <ul className="space-y-2 text-xs text-neutral-400">
                <li><button onClick={() => onNavigate('home')} className="hover:text-white transition-colors cursor-pointer">Home</button></li>
                <li><button onClick={() => onNavigate('about')} className="hover:text-white transition-colors cursor-pointer">About Us</button></li>
                <li><button onClick={() => onNavigate('portfolio')} className="hover:text-white transition-colors cursor-pointer">Portfolio & Work</button></li>
                <li><button onClick={() => onNavigate('academy')} className="hover:text-white transition-colors cursor-pointer">Vixora Academy</button></li>
                <li><button onClick={() => onNavigate('resources')} className="hover:text-white transition-colors cursor-pointer">Resources & Insights</button></li>
                <li><button onClick={onOpenProjectModal} className="hover:text-purple-400 text-purple-300 font-semibold transition-colors cursor-pointer">Book Consultation</button></li>
              </ul>
            </div>

            {/* Solutions */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Our Solutions
              </h4>
              <ul className="space-y-2 text-xs text-neutral-400">
                <li><button onClick={() => onNavigate('home', 'solutions')} className="hover:text-white transition-colors cursor-pointer text-left">Website Development</button></li>
                <li><button onClick={() => onNavigate('home', 'solutions')} className="hover:text-white transition-colors cursor-pointer text-left">Software Development</button></li>
                <li><button onClick={() => onNavigate('home', 'solutions')} className="hover:text-white transition-colors cursor-pointer text-left">AI & Automation</button></li>
                <li><button onClick={() => onNavigate('home', 'solutions')} className="hover:text-white transition-colors cursor-pointer text-left">Digital Marketing</button></li>
                <li><button onClick={() => onNavigate('home', 'solutions')} className="hover:text-white transition-colors cursor-pointer text-left">Creative & Branding</button></li>
              </ul>
            </div>

            {/* Academy & Training */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Academy & Labs
                </h4>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-950 text-purple-300 border border-purple-800/40">
                  Subdomain
                </span>
              </div>
              <ul className="space-y-2 text-xs text-neutral-400">
                <li><button onClick={() => onNavigate('academy-course', undefined, 'fullstack-ai-engineering')} className="hover:text-white transition-colors cursor-pointer text-left">Full-Stack AI Engineering</button></li>
                <li><button onClick={() => onNavigate('academy-course', undefined, 'executive-ai-strategy')} className="hover:text-white transition-colors cursor-pointer text-left">Executive AI Strategy</button></li>
                <li><button onClick={() => onNavigate('academy-course', undefined, 'enterprise-workflow-automation')} className="hover:text-white transition-colors cursor-pointer text-left">Enterprise n8n Automation</button></li>
                <li><button onClick={() => onNavigate('academy-course', undefined, 'ai-product-design-ui-ux')} className="hover:text-white transition-colors cursor-pointer text-left">AI Product Design & UI/UX</button></li>
                <li><button onClick={() => onNavigate('academy-course', undefined, 'generative-media-advertising')} className="hover:text-white transition-colors cursor-pointer text-left">Generative Media & Ads</button></li>
                <li><button onClick={() => onNavigate('academy')} className="hover:text-purple-300 text-purple-400 font-semibold transition-colors cursor-pointer text-left">Explore All 5 Courses &rarr;</button></li>
              </ul>
            </div>

            {/* Knowledge & Tools */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Knowledge & Tools
              </h4>
              <ul className="space-y-2 text-xs text-neutral-400">
                <li><button onClick={() => onNavigate('resources')} className="hover:text-white transition-colors cursor-pointer text-left">Engineering Blog</button></li>
                <li><button onClick={() => onNavigate('resources')} className="hover:text-white transition-colors cursor-pointer text-left">Whitepaper Downloads</button></li>
                <li><button onClick={onOpenDriveWorkspace} className="text-purple-300 hover:text-white font-medium transition-colors cursor-pointer text-left flex items-center gap-1">
                  <HardDrive className="w-3 h-3" />
                  <span>Drive PRD Hub</span>
                </button></li>
                <li><button onClick={() => onNavigate('resources')} className="hover:text-white transition-colors cursor-pointer text-left">FAQs</button></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter & Sub-Footer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
          <div className="lg:col-span-6 space-y-2">
            <h4 className="text-sm font-bold text-white">
              Subscribe to Vixora Engineering Dispatches
            </h4>
            <p className="text-xs text-neutral-400">
              Bi-weekly briefings on generative AI, autonomous agent design patterns, and enterprise scalability.
            </p>
          </div>

          <div className="lg:col-span-6">
            {newsletterSubscribed ? (
              <div className="p-3.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-purple-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Thank you for subscribing! You will receive our next dispatch.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your work email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-900 border border-purple-900/40 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-colors shrink-0"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-purple-900/20 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-4">
          <p>© {new Date().getFullYear()} Vixora Digital Hub. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-neutral-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-neutral-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-neutral-300 cursor-pointer">Security Overview</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
