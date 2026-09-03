import { useState, useEffect } from 'react';
import {
  GraduationCap,
  Calendar,
  Clock,
  Users,
  Award,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  BookOpen,
  Code2,
  Cpu,
  Layers,
  FileText,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
  ExternalLink,
  CreditCard,
  Building2,
  MessageSquare,
  Globe,
  Play,
  Flame,
  Zap,
  Briefcase,
  Store,
  Compass,
  X,
  Star,
  Check,
  Smartphone,
  HelpCircle,
  TrendingUp,
  Target,
  UserCheck
} from 'lucide-react';
import { AcademyCourse, CourseSyllabusModule, ACADEMY_COURSES } from '../data/vixoraContent';
import { BRAND_CONFIG, getWhatsAppUrl } from '../data/brandConfig';
import { WhatsAppContactButton } from '../components/WhatsAppContactButton';

interface CourseLandingPageProps {
  course: AcademyCourse;
  onBackToAcademy: () => void;
  onEnroll: (course: AcademyCourse) => void;
  onSelectCourse?: (course: AcademyCourse) => void;
  onOpenSubdomainGuide: () => void;
  onNavigateHome: () => void;
}

export function CourseLandingPage({
  course,
  onBackToAcademy,
  onEnroll,
  onSelectCourse,
  onOpenSubdomainGuide,
  onNavigateHome
}: CourseLandingPageProps) {
  const [expandedModules, setExpandedModules] = useState<{ [key: number]: boolean }>({ 0: true, 1: true });
  const [expandedFaqs, setExpandedFaqs] = useState<{ [key: number]: boolean }>({ 0: true, 1: true });
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showStickyBanner, setShowStickyBanner] = useState(true);

  // Live ticking countdown timer (e.g. 04 : 20 : 43)
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 20, seconds: 43 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 4, minutes: 20, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleModule = (idx: number) => {
    setExpandedModules(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const toggleAllModules = (expand: boolean) => {
    const next: { [key: number]: boolean } = {};
    course.weeklySyllabus.forEach((_, idx) => {
      next[idx] = expand;
    });
    setExpandedModules(next);
  };

  const toggleFaq = (idx: number) => {
    setExpandedFaqs(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDownloadSyllabus = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
    const content = `VIXORA ACADEMY - OFFICIAL COURSE SYLLABUS\nCourse: ${course.title}\nFormat: ${course.format}\nTuition: ${course.tuition}\nNext Cohort: ${course.nextCohortDate}\n\nCURRICULUM BREAKDOWN:\n` +
      course.weeklySyllabus.map(m => `${m.week}: ${m.title}\n${m.description}\nKey Topics: ${m.topics.join(', ')}\nHands-On Lab: ${m.handsOnLab}\n`).join('\n---\n') +
      `\n\nOFFICIAL ENROLLMENT PORTAL: ${BRAND_CONFIG.academyDomain}/course/${course.slug}\nWhatsApp Admissions: ${BRAND_CONFIG.whatsapp.usAndGlobal.displayNumber} / ${BRAND_CONFIG.whatsapp.nigeria.displayNumber}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Vixora-Academy-${course.slug}-Syllabus.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isPremiumCourse = course.slug === 'ai-automation-digital-business-systems';
  const isBeginnerCourse = course.slug === 'ai-automation-digital-skills';

  const massMarketCourse = ACADEMY_COURSES.find(c => c.slug === 'ai-automation-digital-skills') || course;
  const premiumCourse = ACADEMY_COURSES.find(c => c.slug === 'ai-automation-digital-business-systems') || course;

  const handleSwitchToCourse = (targetCourse: AcademyCourse) => {
    if (onSelectCourse) {
      onSelectCourse(targetCourse);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="pt-20 pb-36 bg-[#070314] text-neutral-100 min-h-screen selection:bg-amber-400 selection:text-neutral-950">
      {/* 1. Subdomain Breadcrumb Header */}
      <div className="bg-[#0A051B] border-b border-purple-900/40 py-2.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToAcademy}
              className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Academy Hub
            </button>
            <span className="text-neutral-700">|</span>
            <div className="flex items-center gap-1.5 text-purple-300 font-mono bg-purple-950/60 px-2.5 py-0.5 rounded-full border border-purple-800/40">
              <Globe className="w-3 h-3 text-purple-400" />
              <span>{BRAND_CONFIG.cleanAcademyDomain}/course/{course.slug}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSubdomainGuide}
              className="text-neutral-400 hover:text-purple-300 underline decoration-purple-500/40 transition-colors cursor-pointer text-[11px]"
            >
              Subdomain DNS Guide
            </button>
            <span className="text-neutral-700">&bull;</span>
            <button
              onClick={onNavigateHome}
              className="text-neutral-400 hover:text-white transition-colors cursor-pointer text-[11px]"
            >
              Main Site ({BRAND_CONFIG.cleanDomain})
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Mini Navigation Ribbon (VibeCoding Style) */}
      <nav className="sticky top-20 z-30 bg-[#0C061F]/90 backdrop-blur-md border-b border-purple-900/40 py-3 px-4 sm:px-8 shadow-lg shadow-purple-950/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={onBackToAcademy}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-extrabold text-white text-sm shadow-md shadow-purple-600/30">
              V
            </div>
            <div>
              <div className="text-xs font-black tracking-tight text-white flex items-center gap-1.5">
                <span>Vixora Academy</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${isPremiumCourse ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' : 'bg-purple-500/20 text-purple-300 border border-purple-400/30'}`}>
                  {isPremiumCourse ? 'PREMIUM' : 'Mastery'}
                </span>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-6 text-xs font-medium text-neutral-300">
            <button onClick={() => scrollToSection('problem')} className="hover:text-amber-300 transition-colors cursor-pointer">
              The Problem
            </button>
            <button onClick={() => scrollToSection('solution')} className="hover:text-amber-300 transition-colors cursor-pointer">
              Transformation
            </button>
            <button onClick={() => scrollToSection('curriculum')} className="hover:text-amber-300 transition-colors cursor-pointer">
              Curriculum
            </button>
            <button onClick={() => scrollToSection('who-for')} className="hover:text-amber-300 transition-colors cursor-pointer">
              Who It's For
            </button>
            <button onClick={() => scrollToSection('choose-path')} className="hover:text-amber-300 transition-colors cursor-pointer">
              Choose Path
            </button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-amber-300 transition-colors cursor-pointer">
              Pricing
            </button>
            <button onClick={() => scrollToSection('reviews')} className="hover:text-amber-300 transition-colors cursor-pointer">
              Reviews
            </button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-amber-300 transition-colors cursor-pointer">
              FAQ
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onEnroll(course)}
              className="px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-neutral-950 shadow-md shadow-amber-500/20 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <span>{isPremiumCourse ? 'Apply for Premium' : 'Enroll Now'} ({course.tuition})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* 3. HERO SECTION */}
      <section className="relative pt-12 pb-20 sm:pt-16 sm:pb-24 border-b border-purple-900/30 overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-[600px] h-[350px] bg-purple-600/15 blur-[150px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[300px] bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Headlines, Avatars & Action CTAs */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Eyebrow Pill Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-purple-950/80 text-purple-300 border border-purple-600/40 shadow-sm backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{isPremiumCourse ? 'VIXORA ACADEMY — ADVANCED TRACK' : 'VIXORA ACADEMY PRESENTS'}</span>
              </div>

              {/* Bold Playful Display Title */}
              <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-black text-white tracking-tight leading-[1.15]">
                {isPremiumCourse ? (
                  <>
                    Stop Using AI Tools. Start Building{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-200 underline decoration-amber-400/40 decoration-wavy decoration-2">
                      AI Systems
                    </span>{' '}
                    Businesses Pay For.
                  </>
                ) : (
                  <>
                    Everyone's Talking About AI. In{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-200 underline decoration-amber-400/40 decoration-wavy decoration-2">
                      12 Weeks
                    </span>
                    , You'll Actually Know How to Use It.
                  </>
                )}
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg text-neutral-300 leading-relaxed font-normal">
                {course.subtitle}
              </p>

              {/* Social Proof Avatar Stack */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <div className="flex -space-x-2 overflow-hidden">
                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-[#070314] bg-gradient-to-tr from-purple-500 to-pink-500 text-[11px] font-bold text-white flex items-center justify-center">
                    FA
                  </div>
                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-[#070314] bg-gradient-to-tr from-blue-500 to-cyan-500 text-[11px] font-bold text-white flex items-center justify-center">
                    NE
                  </div>
                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-[#070314] bg-gradient-to-tr from-amber-500 to-yellow-500 text-[11px] font-bold text-neutral-950 flex items-center justify-center">
                    DK
                  </div>
                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-[#070314] bg-gradient-to-tr from-emerald-500 to-teal-500 text-[11px] font-bold text-white flex items-center justify-center">
                    AO
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-white">{isPremiumCourse ? 'Strict Cohort Cap (12 Max)' : '78+ students enrolled'}</span>
                  <span className="text-neutral-500">&bull;</span>
                  <span className="text-amber-400 font-semibold">{course.seatsRemaining} seats left in next cohort</span>
                </div>
              </div>

              {/* Dual Hero CTAs */}
              <div className="pt-2 space-y-2.5">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                  <button
                    onClick={() => onEnroll(course)}
                    className="relative px-7 py-4 rounded-2xl text-sm font-extrabold bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-neutral-950 shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer group"
                  >
                    <div className="absolute -top-3 -right-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-red-600 text-white shadow-md flex items-center gap-1">
                      <Flame className="w-2.5 h-2.5" /> {isPremiumCourse ? '60% OFF · REG ₦150K+' : '14% OFF'}
                    </div>
                    <span>{isPremiumCourse ? 'Apply for Premium — ₦60,000' : `Apply Now — ${course.tuition}`}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => scrollToSection('curriculum')}
                    className="px-6 py-4 rounded-2xl text-sm font-bold bg-[#140D2D] hover:bg-[#1A1238] text-neutral-200 border border-purple-800/60 hover:border-purple-500/60 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Course Curriculum ↓</span>
                  </button>
                </div>

                <div className="text-xs font-mono text-neutral-400 flex flex-wrap items-center gap-2">
                  <span>12 weeks</span>
                  <span>&bull;</span>
                  <span className="text-purple-300">{isPremiumCourse ? 'Advanced Implementation' : 'Beginner-friendly'}</span>
                  <span>&bull;</span>
                  <span className="text-emerald-400">{isPremiumCourse ? 'Direct Mentorship Included' : 'Certificate + Real Project'}</span>
                </div>
              </div>

            </div>

            {/* Right Column: Playful Tech Hero Card Visual */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Floating Badge */}
                <div className="absolute -top-4 -right-2 z-20 w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/50 backdrop-blur-md flex items-center justify-center text-amber-300 shadow-lg rotate-12">
                  <Sparkles className="w-6 h-6 animate-spin" style={{ animationDuration: '8s' }} />
                </div>

                {/* Main Visual Board */}
                <div className="relative rounded-3xl bg-gradient-to-b from-[#1C123D] to-[#0E0724] border-2 border-purple-600/40 p-5 sm:p-7 shadow-2xl shadow-purple-950/80 space-y-4">
                  
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2 border-b border-purple-800/40 pb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="text-[11px] font-mono font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-500/30">
                      {isPremiumCourse ? 'systems > simple tools' : 'vibe > code'}
                    </div>
                  </div>

                  {/* Video / Visual Card Preview */}
                  <div
                    onClick={() => setShowVideoModal(true)}
                    className="relative aspect-video rounded-2xl bg-gradient-to-tr from-[#2A175B] via-[#1E1145] to-[#120830] border border-purple-500/50 overflow-hidden cursor-pointer group flex items-center justify-center"
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px]" />

                    <div className="relative z-10 text-center space-y-2 p-4">
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-900/80 text-[10px] font-mono text-purple-300 border border-purple-700/60">
                        <span>{isPremiumCourse ? 'advanced implementation preview ✨' : 'watch this first ✨'}</span>
                      </div>
                      
                      <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        {isPremiumCourse ? (
                          <>Deploy <span className="text-amber-400">AI Business Systems</span></>
                        ) : (
                          <>What is <span className="text-amber-400">AI Automation</span>?</>
                        )}
                      </div>

                      {/* Play Button */}
                      <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-neutral-950 flex items-center justify-center shadow-xl shadow-amber-500/40 group-hover:scale-110 transition-transform mt-2">
                        <Play className="w-6 h-6 fill-neutral-950 ml-0.5" />
                      </div>
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-mono text-neutral-300">
                      {isPremiumCourse ? '04:15 Systems Architecture' : '03:45 Overview'}
                    </div>
                  </div>

                  {/* Bottom Doodles & Code Snippet Box */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-800/40 space-y-1">
                      <div className="text-[10px] font-mono text-neutral-400">// {isPremiumCourse ? 'retainer > one-off' : 'idea → automation'}</div>
                      <div className="text-xs font-bold text-white flex items-center gap-1">
                        <span>{isPremiumCourse ? '₦200k+ client setups 💼' : 'Build workflows that pay 💛'}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-800/40 space-y-1">
                      <div className="text-[10px] font-mono text-neutral-400">&lt;/&gt; {isPremiumCourse ? 'Vibe Coding + n8n' : 'No Coding Required'}</div>
                      <div className="text-xs font-bold text-amber-300">
                        {isPremiumCourse ? 'Architect. Sell. Retain. 🚀' : 'Describe it. Automate it. 😊'}
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. THE PROBLEM (Agitation Section) */}
      <section id="problem" className="py-20 border-b border-purple-900/30 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-widest text-red-400 bg-red-950/50 px-3 py-1 rounded-full border border-red-800/40">
              <Zap className="w-3.5 h-3.5" /> {isPremiumCourse ? 'THE CEILING EFFECT' : 'The Real Gap in Today\'s Market'}
            </div>
            
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {isPremiumCourse ? (
                <>
                  Knowing AI tools gets you noticed.{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-300">
                    Building AI systems gets you paid.
                  </span>
                </>
              ) : (
                <>
                  You're not behind because you're not smart enough.{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-300">
                    You're behind because nobody showed you how.
                  </span>
                </>
              )}
            </h2>
          </div>

          <div className="space-y-4">
            <p className="text-sm sm:text-base text-neutral-300 text-center max-w-2xl mx-auto">
              {isPremiumCourse
                ? 'There is a stark difference between someone who "knows ChatGPT" and someone who builds an autonomous workflow that saves a business 10 hours a week — and clients know the difference too:'
                : 'Right now, somewhere, someone with zero extra talent is:'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {isPremiumCourse ? (
                <>
                  <div className="p-6 rounded-2xl bg-[#120B29] border border-purple-900/40 hover:border-red-500/40 transition-all space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center font-bold text-base border border-red-500/20">
                      📜
                    </div>
                    <h3 className="text-base font-bold text-white">
                      Basic Prompting is a Ceiling
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                      Writing a good prompt is nice, but businesses won't pay premium monthly fees for text prompts anyone can type themselves.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#120B29] border border-purple-900/40 hover:border-amber-500/40 transition-all space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-base border border-amber-500/20">
                      ⚡
                    </div>
                    <h3 className="text-base font-bold text-white">
                      Systems Drive Retainers
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                      Organizations pay ₦200k+ to $2,500/mo for multi-step automations that connect CRM, invoicing, customer support, and document processing.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#120B29] border border-purple-900/40 hover:border-purple-500/40 transition-all space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-base border border-purple-500/20">
                      💼
                    </div>
                    <h3 className="text-base font-bold text-white">
                      Sending Invoices vs. Applying
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                      That is why one group is still endlessly submitting resumes, while the other is sending invoices and closing retainer contracts.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-6 rounded-2xl bg-[#120B29] border border-purple-900/40 hover:border-red-500/40 transition-all space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center font-bold text-base border border-red-500/20">
                      💼
                    </div>
                    <h3 className="text-base font-bold text-white">
                      Getting hired over you
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                      Because they listed practical "AI tools & automations" on their CV instead of outdated traditional skills.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#120B29] border border-purple-900/40 hover:border-amber-500/40 transition-all space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-base border border-amber-500/20">
                      ⚡
                    </div>
                    <h3 className="text-base font-bold text-white">
                      Charging clients for automations
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                      Charging ₦150k+ for simple Make/Zapier automations that only take them 20 minutes to assemble.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#120B29] border border-purple-900/40 hover:border-purple-500/40 transition-all space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-base border border-purple-500/20">
                      🎨
                    </div>
                    <h3 className="text-base font-bold text-white">
                      Creating content in 1 hour
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                      Generating high-converting visuals, scripts, and video campaigns that used to take full creative teams a full day.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Agitation Callout Box */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-red-950/40 via-[#1A0F35] to-purple-950/40 border border-red-500/30 text-center space-y-3 max-w-3xl mx-auto mt-6">
              <p className="text-sm sm:text-base text-neutral-200 leading-relaxed font-medium">
                {isPremiumCourse
                  ? '"If you already understand the basics of AI, staying at that level isn\'t safe — it\'s a ceiling. The people getting real income and real clients right now are the ones who went further: who learned to build, implement, and sell systems, not just use tools."'
                  : '"It\'s not that they\'re smarter. It\'s that they learned the tools before everyone else caught on. Every month you wait, the gap gets wider — and the \'I\'ll learn it eventually\' plan quietly becomes \'I never learned it at all.\'"'}
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 5. THE SOLUTION (Transformation Section) */}
      <section id="solution" className="py-20 border-b border-purple-900/30 bg-[#0A051C]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-widest text-amber-300 bg-amber-950/50 px-3 py-1 rounded-full border border-amber-500/40">
              <Sparkles className="w-3.5 h-3.5" /> The Transformation
            </div>
            
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {isPremiumCourse ? (
                <>
                  From "I Know How AI Works" to{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400">
                    "I Build AI-Powered Business Systems"
                  </span>
                </>
              ) : (
                <>
                  This Is the Shortcut. Not the Shortcut That Skips the Work —{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400">
                    the One That Skips the Confusion.
                  </span>
                </>
              )}
            </h2>

            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-3xl mx-auto pt-2">
              {isPremiumCourse ? (
                <>
                  <strong className="text-white">AI Automation & Digital Business Systems</strong> is Vixora Academy's advanced, implementation-focused program for people ready to go beyond tools and start building. You'll learn to design, build, and deploy AI-powered automations and solutions — the kind organizations and clients actually pay for — with hands-on mentorship, real business projects, and direct support.
                </>
              ) : (
                <>
                  <strong className="text-white">AI Automation & Digital Skills</strong> is a 12-week, hands-on program built for complete beginners who want to go from <em>"I've heard of ChatGPT"</em> to <em>"I automate things for a living"</em> — without a single line of code.
                </>
              )}
            </p>
          </div>

          {/* 3-Step Transformation Path */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {isPremiumCourse ? (
              <>
                <div className="p-6 rounded-2xl bg-[#140D2D] border border-purple-800/40 space-y-3 relative overflow-hidden">
                  <div className="text-xs font-mono text-purple-400 font-bold">PHASE 1 (WEEKS 1-4)</div>
                  <h3 className="text-lg font-bold text-white">Advanced Workflows & Client Media</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Master multi-step conditional routing in Make, n8n, GHL, and commercial-grade AI image & video asset production.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#140D2D] border border-purple-800/40 space-y-3 relative overflow-hidden">
                  <div className="text-xs font-mono text-amber-400 font-bold">PHASE 2 (WEEKS 5-8)</div>
                  <h3 className="text-lg font-bold text-white">Business Process & Vibe Coding</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Automate PDF invoices, contract data parsing, and build custom AI web tools for clients without a coding background.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#140D2D] border border-purple-800/40 space-y-3 relative overflow-hidden">
                  <div className="text-xs font-mono text-emerald-400 font-bold">PHASE 3 (WEEKS 9-12)</div>
                  <h3 className="text-lg font-bold text-white">Client Systems, Retainers & Mentorship</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Structure winning SOW proposals, land paying clients, price recurring retainers, and polish your capstone portfolio.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="p-6 rounded-2xl bg-[#140D2D] border border-purple-800/40 space-y-3 relative overflow-hidden">
                  <div className="text-xs font-mono text-purple-400 font-bold">PHASE 1 (WEEKS 1-4)</div>
                  <h3 className="text-lg font-bold text-white">Master AI Prompting & Content</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Work 10x faster with ChatGPT and generate scroll-stopping images and videos with precision prompts.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#140D2D] border border-purple-800/40 space-y-3 relative overflow-hidden">
                  <div className="text-xs font-mono text-amber-400 font-bold">PHASE 2 (WEEKS 5-9)</div>
                  <h3 className="text-lg font-bold text-white">Visual Automations & Documents</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Build autonomous Make, Zapier & Notion workflows that eliminate admin, parse invoices, and route data.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#140D2D] border border-purple-800/40 space-y-3 relative overflow-hidden">
                  <div className="text-xs font-mono text-emerald-400 font-bold">PHASE 3 (WEEKS 10-12)</div>
                  <h3 className="text-lg font-bold text-white">Monetization & First Clients</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Package your skills into freelance offerings, build a real capstone portfolio, and land your first paid work.
                  </p>
                </div>
              </>
            )}
          </div>

        </div>
      </section>

      {/* 6. WHO THIS IS FOR */}
      <section id="who-for" className="py-20 border-b border-purple-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-purple-400">
              Audience & Alignment
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Who This Program Is Built For
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {isPremiumCourse ? (
              <>
                <div className="p-6 rounded-2xl bg-[#120A27] border border-purple-900/40 space-y-2.5 hover:border-purple-500/40 transition-all">
                  <div className="text-2xl">💼</div>
                  <h3 className="text-base font-bold text-white">Career Professionals</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Ready to add high-value AI and automation systems engineering to their resume and secure senior roles.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#120A27] border border-purple-900/40 space-y-2.5 hover:border-purple-500/40 transition-all">
                  <div className="text-2xl">🚀</div>
                  <h3 className="text-base font-bold text-white">Business Owners</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Who want to build and deploy real autonomous automation systems across their teams and operations.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#120A27] border border-purple-900/40 space-y-2.5 hover:border-purple-500/40 transition-all">
                  <div className="text-2xl">🏢</div>
                  <h3 className="text-base font-bold text-white">Advisors & Consultants</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Running or advising organizations looking to implement high-ROI AI solutions and custom web tools.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#120A27] border border-purple-900/40 space-y-2.5 hover:border-purple-500/40 transition-all">
                  <div className="text-2xl">📈</div>
                  <h3 className="text-base font-bold text-white">Digital Skills Alumni</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Graduates ready to go from "I understand AI tools" to "I build client systems and send ₦200k+ invoices."
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="p-6 rounded-2xl bg-[#120A27] border border-purple-900/40 space-y-2.5 hover:border-purple-500/40 transition-all">
                  <div className="text-2xl">🎓</div>
                  <h3 className="text-base font-bold text-white">Students</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Who want to graduate with real, high-income practical skills their standard degree curriculum didn't teach them.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#120A27] border border-purple-900/40 space-y-2.5 hover:border-purple-500/40 transition-all">
                  <div className="text-2xl">💼</div>
                  <h3 className="text-base font-bold text-white">Job Seekers</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Tired of hearing "we're looking for someone with practical AI experience" and wanting high-converting portfolio proof.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#120A27] border border-purple-900/40 space-y-2.5 hover:border-purple-500/40 transition-all">
                  <div className="text-2xl">🏪</div>
                  <h3 className="text-base font-bold text-white">Small Business Owners</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Drowning in manual, repetitive admin tasks, invoicing, customer inquiries, and social media posting.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#120A27] border border-purple-900/40 space-y-2.5 hover:border-purple-500/40 transition-all">
                  <div className="text-2xl">🌱</div>
                  <h3 className="text-base font-bold text-white">Total Beginners</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Curious and eager to enter the AI revolution, but intimidated by complex coding and confusing technical jargon.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Readiness Box */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-[#1B0F38] via-[#120A27] to-[#0A051C] border border-amber-500/40 space-y-6 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-800/40 pb-4">
              <div>
                <h3 className="text-xl font-black text-white">{isPremiumCourse ? 'Prerequisites & Preparation' : 'What You Do NOT Need'}</h3>
                <p className="text-xs text-neutral-400">{isPremiumCourse ? 'Clear starting expectations for the advanced implementation track.' : 'Zero barriers to entry — we start from the very ground up.'}</p>
              </div>
              <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono border border-emerald-500/40 flex items-center gap-1.5 w-fit">
                <Check className="w-3.5 h-3.5" /> {isPremiumCourse ? 'Implementation-Ready' : '100% Beginner Friendly'}
              </div>
            </div>

            {isPremiumCourse ? (
              <div className="space-y-3 text-sm text-neutral-200">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</div>
                  <span><strong>Basic AI Comfort:</strong> Familiar with prompting ChatGPT and basic digital tools (this track builds up, it doesn't start from zero).</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</div>
                  <span><strong>Direct Mentorship Access:</strong> You'll receive higher-touch feedback, weekly office hours, and code/workflow audits.</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</div>
                  <span><strong>Real Portfolio Deliverables:</strong> You will build actual live systems for your client portfolio, not sample exercises.</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex items-center gap-3 text-sm text-neutral-200">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs shrink-0">✕</div>
                  <span>Zero coding experience needed</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-200">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs shrink-0">✕</div>
                  <span>No tech or graphic design background</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-200">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs shrink-0">✕</div>
                  <span>No expensive software or heavy equipment</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-200">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs shrink-0">✕</div>
                  <span>No need to be "good with computers"</span>
                </div>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-center">
              <p className="text-sm font-bold text-amber-300">
                {isPremiumCourse ? '💡 "You won\'t just have a certificate. You\'ll have a portfolio of real work and the skills to close paying clients."' : '💡 "If you can send a WhatsApp message, you can do this."'}
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 7. FULL CURRICULUM */}
      <section id="curriculum" className="py-20 border-b border-purple-900/30 bg-[#0A051C]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-widest text-amber-300 bg-amber-950/50 px-3 py-1 rounded-full border border-amber-500/40">
                <BookOpen className="w-3.5 h-3.5" /> Full Curriculum
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {isPremiumCourse ? '7 Modules · 12 Weeks · Direct Mentorship' : '5 Modules · 12 Weeks · Zero Fluff'}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400">
                Every module is hands-on and practical with a tangible project output.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleAllModules(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-mono bg-purple-950 text-purple-200 border border-purple-800 hover:text-white transition-colors cursor-pointer"
              >
                Expand All
              </button>
              <button
                onClick={() => toggleAllModules(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-mono bg-purple-950 text-purple-200 border border-purple-800 hover:text-white transition-colors cursor-pointer"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Module Accordions */}
          <div className="space-y-4">
            {course.weeklySyllabus.map((mod, idx) => {
              const isExpanded = expandedModules[idx] ?? false;
              return (
                <div
                  key={idx}
                  className="rounded-3xl bg-[#140D2D] border border-purple-800/50 hover:border-purple-500/60 overflow-hidden transition-all duration-200 shadow-lg"
                >
                  <button
                    onClick={() => toggleModule(idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 hover:bg-purple-900/20 transition-colors cursor-pointer"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                          {mod.week}
                        </span>
                        <h3 className="text-lg sm:text-xl font-bold text-white">
                          {mod.title}
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-neutral-300 max-w-3xl leading-relaxed">
                        {mod.description}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-purple-950 text-purple-300 shrink-0 border border-purple-800/60">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-purple-900/40 space-y-4 bg-[#0F0824]">
                      <div>
                        <div className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider mb-2.5">
                          Topics & Practical Skills:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {mod.topics.map((top, tIdx) => (
                            <div key={tIdx} className="flex items-start gap-2 text-xs sm:text-sm text-neutral-300">
                              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                              <span>{top}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#090417] border border-purple-800/60 space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 font-mono">
                          <Code2 className="w-4 h-4" /> Practical Hands-On Lab:
                        </div>
                        <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
                          {mod.handsOnLab}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Download & Format Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 via-[#180F38] to-indigo-950/60 border border-purple-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-white">Format: 12 weeks &bull; {isPremiumCourse ? 'Implementation-focused + Direct Mentorship' : 'Hybrid (Online + Practical Sessions)'}</div>
              <div className="text-xs text-neutral-400">You'll walk away with: {isPremiumCourse ? 'Real Client-Ready Portfolio + Freelance/Business Retainer Process' : 'Certificate of Completion + Real Portfolio Project'}</div>
            </div>

            <button
              onClick={handleDownloadSyllabus}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-purple-700/50 flex items-center gap-2 cursor-pointer transition-all shrink-0"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Syllabus Downloaded
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-purple-400" /> Download Full Syllabus
                </>
              )}
            </button>
          </div>

        </div>
      </section>

      {/* 8. WHAT YOU GET (Value Stack) */}
      <section className="py-20 border-b border-purple-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
              The Complete Value Stack
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Everything Included When You Join
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {isPremiumCourse ? (
              <>
                <div className="p-6 rounded-2xl bg-[#140D2D] border border-purple-800/40 space-y-2">
                  <div className="text-emerald-400 font-bold text-lg">✅ Advanced Curriculum</div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Implementation-focused curriculum covering n8n, GHL, Vibe Coding, and complex multi-app automations (not a repeat of basics).
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#140D2D] border border-purple-800/40 space-y-2">
                  <div className="text-emerald-400 font-bold text-lg">✅ Direct Mentorship</div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Higher-touch guidance, live office hours, code & workflow audits, and 1-on-1 strategy reviews throughout the cohort.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#140D2D] border border-purple-800/40 space-y-2">
                  <div className="text-emerald-400 font-bold text-lg">✅ Real Business Projects</div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Build your actual client portfolio with real-world document parsers, lead engines, and web apps, not hypothetical exercises.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#140D2D] border border-purple-800/40 space-y-2">
                  <div className="text-emerald-400 font-bold text-lg">✅ Client Acquisition Training</div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Finding, pitching, and closing paying clients with battle-tested SOW templates, discovery call scripts, and pricing guides.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#140D2D] border border-purple-800/40 space-y-2">
                  <div className="text-emerald-400 font-bold text-lg">✅ Active Builder Community</div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Exclusive mastermind channel of serious practitioners, agency owners, and systems engineers sharing client opportunities.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#140D2D] border border-purple-800/40 space-y-2">
                  <div className="text-emerald-400 font-bold text-lg">✅ Path to Freelance Income</div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Step-by-step roadmap to building a profitable service business with recurring monthly maintenance retainers.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="p-6 rounded-2xl bg-[#140D2D] border border-purple-800/40 space-y-2">
                  <div className="text-emerald-400 font-bold text-lg">✅ 12 Weeks Training</div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Structured, hands-on masterclasses designed with zero fluff and maximum real-world execution.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#140D2D] border border-purple-800/40 space-y-2">
                  <div className="text-emerald-400 font-bold text-lg">✅ 5 Comprehensive Modules</div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Deep coverage of AI tools, viral content creation, Make/Zapier automation, documents & monetization.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#140D2D] border border-purple-800/40 space-y-2">
                  <div className="text-emerald-400 font-bold text-lg">✅ Real Capstone Project</div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    A live, functional practical project to display in your personal portfolio to impress clients and employers.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#140D2D] border border-purple-800/40 space-y-2">
                  <div className="text-emerald-400 font-bold text-lg">✅ Official Certificate</div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Verifiable Vixora Certificate of Completion upon graduation to showcase on your LinkedIn & CV.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#140D2D] border border-purple-800/40 space-y-2">
                  <div className="text-emerald-400 font-bold text-lg">✅ Beginner-Friendly</div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Step-by-step guidance starting from absolute zero with direct mentor support.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#140D2D] border border-purple-800/40 space-y-2">
                  <div className="text-emerald-400 font-bold text-lg">✅ Hybrid Access</div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Flexible access to live virtual sessions, interactive practical labs, recorded replays, and student community.
                  </p>
                </div>
              </>
            )}
          </div>

        </div>
      </section>

      {/* 9. SHARED SECTION — CHOOSE YOUR PATH (Upgrade / Downgrade Framing) */}
      <section id="choose-path" className="py-20 border-b border-purple-900/30 bg-[#0C061F]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-widest text-amber-300 bg-amber-950/50 px-3 py-1 rounded-full border border-amber-500/40">
              <Compass className="w-3.5 h-3.5" /> Tier Alignment
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Choose Your Path
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Both tracks teach real, usable AI skills. The difference is depth, support, and outcome — pick the one that matches where you are right now. You can always move between them.
            </p>
          </div>

          {/* Comparison Matrix Table */}
          <div className="rounded-3xl bg-[#140D2D] border border-purple-800/50 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-purple-800/60 bg-[#090418]">
                    <th className="py-4 px-5 text-neutral-400 font-mono font-semibold uppercase text-xs">Feature / Track</th>
                    <th className="py-4 px-5 text-white font-bold bg-purple-950/40 border-x border-purple-800/40">
                      <div className="flex items-center gap-1.5">
                        <span>AI Automation & Digital Skills</span>
                        {!isPremiumCourse && <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-neutral-950 font-black">CURRENT</span>}
                      </div>
                    </th>
                    <th className="py-4 px-5 text-amber-300 font-bold bg-[#1C0F3E]/60">
                      <div className="flex items-center gap-1.5">
                        <span>AI Automation & Digital Business Systems</span>
                        {isPremiumCourse && <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-neutral-950 font-black">CURRENT</span>}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-900/30 text-neutral-300">
                  <tr>
                    <td className="py-3.5 px-5 font-semibold text-neutral-400">Best for</td>
                    <td className="py-3.5 px-5 bg-purple-950/20 border-x border-purple-800/30">Starting from zero — learn & start using AI</td>
                    <td className="py-3.5 px-5 bg-amber-950/10 font-medium text-white">Ready to build & monetize professionally</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-semibold text-neutral-400">Level</td>
                    <td className="py-3.5 px-5 bg-purple-950/20 border-x border-purple-800/30">Beginner-friendly</td>
                    <td className="py-3.5 px-5 bg-amber-950/10 font-medium text-amber-200">Advanced / implementation-focused</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-semibold text-neutral-400">Format</td>
                    <td className="py-3.5 px-5 bg-purple-950/20 border-x border-purple-800/30">12 weeks, hybrid</td>
                    <td className="py-3.5 px-5 bg-amber-950/10 font-medium text-white">Higher-touch, mentorship-led</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-semibold text-neutral-400">Outcome</td>
                    <td className="py-3.5 px-5 bg-purple-950/20 border-x border-purple-800/30">Practical AI skills + certificate</td>
                    <td className="py-3.5 px-5 bg-amber-950/10 font-medium text-emerald-300">Real client-ready portfolio + income path</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-semibold text-neutral-400">Support</td>
                    <td className="py-3.5 px-5 bg-purple-950/20 border-x border-purple-800/30">Structured group learning</td>
                    <td className="py-3.5 px-5 bg-amber-950/10 font-medium text-white">Direct mentorship + community</td>
                  </tr>
                  <tr className="bg-purple-950/30 font-bold">
                    <td className="py-4 px-5 text-white font-mono">Investment</td>
                    <td className="py-4 px-5 border-x border-purple-800/40 text-emerald-400">
                      <div>₦30,000 – ₦35,000</div>
                      <div className="text-[10px] font-mono text-neutral-400 font-normal">Early applicant rate: ₦30,000</div>
                    </td>
                    <td className="py-4 px-5 text-amber-300 bg-amber-950/30">
                      <div className="flex items-baseline gap-2">
                        <span className="text-base text-amber-300">₦60,000 – ₦65,000</span>
                        <span className="text-xs line-through text-neutral-500 font-normal">₦150k+</span>
                      </div>
                      <div className="text-[10px] font-mono text-amber-200 font-normal">Limited Early Bird: ₦60,000</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Dynamic Switcher Callout Box */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/80 via-[#180E38] to-indigo-950/80 border border-purple-700/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="space-y-1">
              {isPremiumCourse ? (
                <>
                  <div className="text-sm font-bold text-white">New to AI and want to start from the fundamentals first?</div>
                  <p className="text-xs text-neutral-300">The beginner-friendly Digital Skills track teaches you core prompting, media, and simple automations from zero.</p>
                </>
              ) : (
                <>
                  <div className="text-sm font-bold text-white">Already comfortable with AI basics, or want to move faster?</div>
                  <p className="text-xs text-neutral-300">The Advanced Business Systems track includes direct mentorship, n8n, Vibe Coding, and client acquisition retainers.</p>
                </>
              )}
            </div>

            <button
              onClick={() => handleSwitchToCourse(isPremiumCourse ? massMarketCourse : premiumCourse)}
              className="px-6 py-3 rounded-2xl text-xs font-extrabold bg-[#22134F] hover:bg-purple-700 text-amber-300 border border-amber-400/50 hover:text-white transition-all flex items-center gap-2 cursor-pointer shrink-0 shadow-lg shadow-purple-950/50"
            >
              <span>{isPremiumCourse ? 'Start with Digital Skills track →' : 'Upgrade to the Premium track →'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* 10. PRICING SECTION */}
      <section id="pricing" className="py-20 border-b border-purple-900/30 bg-[#0A051C]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-widest text-amber-300 bg-amber-950/50 px-3 py-1 rounded-full border border-amber-500/40">
              <CreditCard className="w-3.5 h-3.5" /> {isPremiumCourse ? 'Investment in Income-Generating Skills' : 'Tuition & Early Bird'}
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {isPremiumCourse ? 'An Investment in Income-Generating Skills' : 'Two Prices. One Decision.'}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              {isPremiumCourse ? 'Lock in the limited Early Bird rate before standard admissions commence.' : 'Lock in your early applicant rate before regular admissions commence.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            
            {/* Early Bird Price Card (Highlighted) */}
            <div className="relative rounded-3xl bg-gradient-to-b from-[#22134F] to-[#12082E] border-2 border-amber-400/80 p-7 sm:p-8 shadow-2xl shadow-amber-500/10 space-y-6 flex flex-col justify-between">
              <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-yellow-400 text-neutral-950 shadow-md">
                ⭐ BEST VALUE · LIMITED SEATS
              </div>

              <div className="space-y-3">
                <div className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                  {isPremiumCourse ? 'Early Bird Rate (Limited Time)' : 'Early Applicant Price'}
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="text-4xl sm:text-5xl font-black text-white">{isPremiumCourse ? '₦60,000' : '₦30,000'}</div>
                  <div className="text-sm font-mono text-neutral-500 line-through">{isPremiumCourse ? '₦150,000+' : '₦35,000'}</div>
                </div>
                <p className="text-xs text-amber-200/90 font-medium">
                  {isPremiumCourse ? 'Strict 12-seat cap · Mentorship & client projects included' : 'Limited seats available · Early bird window ending soon'}
                </p>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-purple-800/40 text-xs sm:text-sm text-neutral-200">
                {isPremiumCourse ? (
                  <>
                    <div className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Full 12-Week Advanced Curriculum (7 Modules)</div>
                    <div className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Direct 1-on-1 Mentorship & Weekly Office Hours</div>
                    <div className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Real Client Projects & Custom Tool Portfolio</div>
                    <div className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Client Acquisition Training & Proposal Blueprints</div>
                    <div className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Vixora Advanced Mastery Credential</div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Full 12-Week Access (5 Modules)</div>
                    <div className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Hands-On Capstone Portfolio Project</div>
                    <div className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Official Vixora Certificate of Completion</div>
                    <div className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Direct Mentor Q&A & Community Access</div>
                  </>
                )}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onEnroll(course)}
                  className="w-full py-4 rounded-2xl text-sm font-extrabold bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-neutral-950 shadow-xl shadow-amber-500/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{isPremiumCourse ? 'Secure Early Bird Rate at ₦60,000' : 'Secure Your Spot at ₦30,000'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Standard Price Card */}
            <div className="rounded-3xl bg-[#140D2D] border border-purple-900/40 p-7 sm:p-8 space-y-6 flex flex-col justify-between opacity-85 hover:opacity-100 transition-opacity">
              <div className="space-y-3">
                <div className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider">
                  Standard Price
                </div>
                <div className="text-4xl sm:text-5xl font-black text-neutral-300">{isPremiumCourse ? '₦65,000' : '₦35,000'}</div>
                <p className="text-xs text-neutral-400">
                  Effective after early bird period closes
                </p>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-purple-900/30 text-xs sm:text-sm text-neutral-400">
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-neutral-500" /> Full 12-Week Access</div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-neutral-500" /> Hands-On Capstone Project</div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-neutral-500" /> Official Certificate of Completion</div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-neutral-500" /> Standard Admissions Queue</div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onEnroll(course)}
                  className="w-full py-3.5 rounded-2xl text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 transition-all cursor-pointer"
                >
                  Apply Standard ({isPremiumCourse ? '₦65,000' : '₦35,000'})
                </button>
              </div>
            </div>

          </div>

          {/* Value Framing Quote Box */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/60 via-[#180E38] to-indigo-950/60 border border-purple-800/40 text-center max-w-3xl mx-auto space-y-3">
            <p className="text-sm sm:text-base text-neutral-200 leading-relaxed font-medium">
              {isPremiumCourse
                ? '"This isn\'t a course fee. It\'s the cost of building skills that generate their own return — the first client project most graduates take on pays for the program itself."'
                : '"The skills in this course will be worth exponentially more than ₦30,000 the moment you land your first client, your first job offer, or your first automated workflow that saves you hours every week. The only thing that costs you money here is waiting."'}
            </p>
            <div className="pt-2 flex justify-center">
              <WhatsAppContactButton
                variant="secondary"
                label="Have Questions? Inquire via WhatsApp"
                message={`Hello Vixora Academy! I would like to discuss enrolling in the ${course.title} at the ${course.tuition} early price.`}
              />
            </div>
          </div>

        </div>
      </section>

      {/* 11. SOCIAL PROOF & TESTIMONIALS */}
      <section id="reviews" className="py-20 border-b border-purple-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
              Student Reviews & Impact
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {isPremiumCourse ? 'Real Outcomes From Builders' : 'Real Transformations From Beginners'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isPremiumCourse ? (
              <>
                <div className="p-7 rounded-3xl bg-[#140D2D] border border-purple-800/40 space-y-4 shadow-xl flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex text-amber-400 gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed italic">
                      "I closed my first ₦200,000 automation project for a client two months after starting Premium."
                    </p>
                  </div>

                  <div className="pt-3 border-t border-purple-900/40 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-bold text-xs flex items-center justify-center">
                      FA
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Femi A.</div>
                      <div className="text-[10px] text-amber-300 font-mono">Freelance Automation Specialist</div>
                    </div>
                  </div>
                </div>

                <div className="p-7 rounded-3xl bg-[#140D2D] border border-purple-800/40 space-y-4 shadow-xl flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex text-amber-400 gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed italic">
                      "The mentorship alone was worth it. I stopped guessing and started building things people actually wanted to pay for."
                    </p>
                  </div>

                  <div className="pt-3 border-t border-purple-900/40 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 text-white font-bold text-xs flex items-center justify-center">
                      NE
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Ngozi E.</div>
                      <div className="text-[10px] text-amber-300 font-mono">Business Owner</div>
                    </div>
                  </div>
                </div>

                <div className="p-7 rounded-3xl bg-[#140D2D] border border-purple-800/40 space-y-4 shadow-xl flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex text-amber-400 gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed italic">
                      "This is the difference between knowing AI and getting paid for AI. Premium bridges that gap."
                    </p>
                  </div>

                  <div className="pt-3 border-t border-purple-900/40 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-bold text-xs flex items-center justify-center">
                      DK
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">David K.</div>
                      <div className="text-[10px] text-amber-300 font-mono">Systems & AI Consultant</div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="p-7 rounded-3xl bg-[#140D2D] border border-purple-800/40 space-y-4 shadow-xl flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex text-amber-400 gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed italic">
                      "I went from not knowing what a 'prompt' was to building automations for my small business in under 3 months."
                    </p>
                  </div>

                  <div className="pt-3 border-t border-purple-900/40 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-bold text-xs flex items-center justify-center">
                      SB
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Chidinma O.</div>
                      <div className="text-[10px] text-amber-300 font-mono">Small Business Owner</div>
                    </div>
                  </div>
                </div>

                <div className="p-7 rounded-3xl bg-[#140D2D] border border-purple-800/40 space-y-4 shadow-xl flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex text-amber-400 gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed italic">
                      "I added 'AI Automation' to my CV after this course and got called for 3 interviews in two weeks."
                    </p>
                  </div>

                  <div className="pt-3 border-t border-purple-900/40 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 text-white font-bold text-xs flex items-center justify-center">
                      TJ
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Tunde A.</div>
                      <div className="text-[10px] text-amber-300 font-mono">Tech Career Transitioner</div>
                    </div>
                  </div>
                </div>

                <div className="p-7 rounded-3xl bg-[#140D2D] border border-purple-800/40 space-y-4 shadow-xl flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex text-amber-400 gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed italic">
                      "Best 12 weeks I've spent. I made back my course fee in my very first freelance gig building a lead bot."
                    </p>
                  </div>

                  <div className="pt-3 border-t border-purple-900/40 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-bold text-xs flex items-center justify-center">
                      EK
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Emmanuel K.</div>
                      <div className="text-[10px] text-amber-300 font-mono">Freelance Automation Specialist</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </section>

      {/* 12. FAQ (Objection Handling Accordions) */}
      <section id="faq" className="py-20 border-b border-purple-900/30 bg-[#0A051C]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-purple-400">
              Got Questions?
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {course.faqs.map((faq, idx) => {
              const isExpanded = expandedFaqs[idx] ?? false;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#140D2D] border border-purple-800/40 overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-purple-900/20 transition-colors cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-bold text-white">{faq.q}</span>
                    <div className="text-amber-400 shrink-0">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-neutral-300 border-t border-purple-900/40 pt-3 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 13. FINAL HIGH-CONVERTING CTA SECTION */}
      <section className="py-20 bg-gradient-to-b from-[#140A30] via-[#0E0624] to-[#070314] relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/40">
            <Flame className="w-3.5 h-3.5" /> Next Cohort Starts Soon
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {isPremiumCourse ? (
              <>
                Stop Learning AI.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-200">
                  Start Getting Paid For It.
                </span>
              </>
            ) : (
              <>
                The Gap Between You and "AI-Skilled" Is{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-200">
                  12 Weeks. That's It.
                </span>
              </>
            )}
          </h2>

          <p className="text-sm sm:text-base text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            {isPremiumCourse ? (
              'Twelve weeks from now, you could still be "someone who knows about AI" — or you could be someone with a portfolio, paying clients, and a real automation business. Premium is built for the second outcome.'
            ) : (
              'Not 2 years. Not a degree. Not a coding bootcamp. Twelve weeks, hands-on, beginner-friendly — and a certificate + project to prove it.'
            )}
          </p>

          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 max-w-md mx-auto text-xs font-mono text-red-300">
            ⏳ Seats are limited, and the {isPremiumCourse ? '₦60,000' : '₦30,000'} early price won't last.
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={() => onEnroll(course)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-extrabold bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-neutral-950 shadow-xl shadow-amber-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isPremiumCourse ? 'Apply for Premium — ₦60,000' : 'Apply Now — Claim Early Price'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <WhatsAppContactButton
              variant="secondary"
              label="Chat on WhatsApp"
              message={`Hello Vixora Admissions, I would like to confirm my seat for the ${course.title} at the ${course.tuition} early price.`}
              className="w-full sm:w-auto"
            />
          </div>

          <div className="text-xs font-mono text-neutral-400 pt-2">
            12 weeks &bull; {isPremiumCourse ? 'Advanced Track · Mentorship Included · Real Client Projects' : 'Certificate + Project · No experience required'}
          </div>

        </div>
      </section>

      {/* 14. PERSISTENT / STICKY EARLY-BIRD OFFER BANNER */}
      {showStickyBanner && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-[#160B33]/95 backdrop-blur-xl border-t border-amber-400/40 py-3 px-4 sm:px-6 shadow-2xl shadow-black/80">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* Left: Offer Details */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600 text-white font-mono text-[11px] font-extrabold uppercase shrink-0">
                <Flame className="w-3 h-3" /> Special offer
              </div>

              <div>
                <div className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
                  <span className="text-neutral-400 line-through text-xs font-mono">{isPremiumCourse ? '₦150,000+' : '₦35,000'}</span>
                  <span className="text-amber-400 font-mono">{isPremiumCourse ? '₦60,000' : '₦30,000'}</span>
                  <span className="text-xs font-normal text-amber-200 hidden md:inline">
                    {isPremiumCourse ? '— Save ₦90,000+ early bird rate' : '— Save ₦5,000 today only'}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-400 hidden lg:block">
                  You are eligible for the early rate. Once this cohort closes, regular admissions resume.
                </div>
              </div>
            </div>

            {/* Right: Live Countdown & Action Button */}
            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
              {/* Countdown Ticker */}
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className="text-[11px] text-neutral-400 hidden md:inline">expires in</span>
                <span className="px-2 py-0.5 rounded bg-neutral-900 text-amber-300 font-bold border border-amber-400/30">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-neutral-500 font-bold">:</span>
                <span className="px-2 py-0.5 rounded bg-neutral-900 text-amber-300 font-bold border border-amber-400/30">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-neutral-500 font-bold">:</span>
                <span className="px-2 py-0.5 rounded bg-neutral-900 text-amber-300 font-bold border border-amber-400/30">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onEnroll(course)}
                className="px-5 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-neutral-950 shadow-md shadow-amber-500/30 transition-all flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>{isPremiumCourse ? 'Claim ₦60K' : 'Claim ₦30K'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              {/* Close Button */}
              <button
                onClick={() => setShowStickyBanner(false)}
                className="text-neutral-400 hover:text-white p-1 transition-colors cursor-pointer"
                title="Dismiss Banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 15. INTERACTIVE COURSE OVERVIEW VIDEO/WALKTHROUGH MODAL */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-[#12082A] border border-purple-600/50 rounded-3xl overflow-hidden p-6 sm:p-8 space-y-5 shadow-2xl">
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-mono border border-amber-400/30">
                <Sparkles className="w-3 h-3" /> {course.title}
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Course Walkthrough & Practical Lab Preview
              </h3>
            </div>

            <div className="aspect-video rounded-2xl bg-gradient-to-tr from-purple-950 via-[#180A38] to-indigo-950 border border-purple-500/40 flex flex-col items-center justify-center p-6 text-center space-y-3 relative overflow-hidden">
              <div className="w-14 h-14 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center shadow-lg shadow-amber-400/30">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="text-base font-bold text-white">12-Week Interactive Transformation Program</div>
              <p className="text-xs text-neutral-300 max-w-md">
                {isPremiumCourse ? (
                  'Deploy production-grade automations with Make, Zapier, n8n, GHL, and Vibe Coding. You will build a tangible client portfolio and master closing recurring retainer clients.'
                ) : (
                  'You will build live automated systems with Make.com, ChatGPT, Zapier, Notion & PDF parsers, creating real portfolio assets that get you hired or paid by clients.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => {
                  setShowVideoModal(false);
                  onEnroll(course);
                }}
                className="py-3 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-neutral-950 transition-all cursor-pointer text-center"
              >
                Enroll Now ({course.tuition})
              </button>
              <button
                onClick={() => setShowVideoModal(false)}
                className="py-3 rounded-xl text-xs font-medium bg-neutral-900 hover:bg-neutral-800 text-neutral-300 transition-colors cursor-pointer text-center"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
