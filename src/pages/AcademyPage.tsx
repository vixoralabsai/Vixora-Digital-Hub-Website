import { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Users,
  CheckCircle2,
  Calendar,
  Sparkles,
  Award,
  ArrowRight,
  ShieldCheck,
  Building,
  Code2,
  Cpu,
  Bot,
  Globe,
  Clock,
  CreditCard,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { ACADEMY_COURSES, AcademyCourse } from '../data/vixoraContent';
import { BRAND_CONFIG } from '../data/brandConfig';

interface AcademyPageProps {
  onOpenProjectModal: () => void;
  onSelectCourse: (course: AcademyCourse) => void;
  onEnrollCourse: (course: AcademyCourse) => void;
  onNavigateHome: () => void;
}

export function AcademyPage({
  onOpenProjectModal,
  onSelectCourse,
  onEnrollCourse,
  onNavigateHome
}: AcademyPageProps) {
  const [selectedTrack, setSelectedTrack] = useState<string>('All Tracks');

  const tracks = [
    'All Tracks',
    'Data & Analytics',
    'Business Automation',
    'Engineering & AI',
    'Executive & Leadership',
    'Design & Marketing'
  ];

  const filteredCourses = selectedTrack === 'All Tracks'
    ? ACADEMY_COURSES
    : ACADEMY_COURSES.filter((c) => c.track === selectedTrack);

  const corporateOfferings = [
    {
      title: 'In-House AI Enablement & Engineering Bootcamps',
      desc: 'Customized 4 to 12-week curriculum delivered on-site or remotely to transition your engineering and product teams into high-velocity AI builders.',
      icon: Building,
      badge: 'Corporate Cohorts'
    },
    {
      title: 'AI Automation Hackathons & Sprint Labs',
      desc: '3-day intensive build sprints where your employees build live, production-ready n8n and Python workflows for your actual internal business processes.',
      icon: Cpu,
      badge: '3-Day Sprints'
    },
    {
      title: 'Executive AI Governance & Risk Masterclasses',
      desc: 'Confidential strategic roadmapping sessions for C-suite leaders and directors on AI risk mitigation, model procurement, and 10x ROI vectors.',
      icon: Award,
      badge: 'Executive Advisory'
    },
  ];

  return (
    <div className="pt-20 pb-24 bg-[#F7F7FC] text-[#000048] min-h-screen">
      {/* Academy Brand Ribbon */}
      <div className="bg-[#000048] border-b border-[#480878]/40 py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/images/vixora-academy-logo.jpg"
              alt="Vixora Academy"
              className="h-10 w-auto max-w-[190px] object-contain bg-white rounded-md p-1"
            />
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-white">Vixora Academy</div>
              <div className="text-[10px] text-white/70">Learn. Apply. Earn.</div>
            </div>
          </div>
          <a
            href={BRAND_CONFIG.domain}
            className="text-xs font-semibold text-white/80 hover:text-white transition-colors flex items-center gap-1"
          >
            Main Hub <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Subdomain Indicator Header Ribbon */}
      <div className="bg-white border-b border-[#E5E5F0] py-2.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[#480878] font-mono bg-[#F7F7FC] px-3 py-1 rounded-full border border-[#480878]/20">
              <Globe className="w-3.5 h-3.5 text-[#9030F8]" />
              <span className="font-semibold">{BRAND_CONFIG.cleanAcademyDomain}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1" />
            </div>
            <span className="text-[#5F6078] text-[11px] hidden sm:inline">
              Official Vixora Academy Subdomain Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={BRAND_CONFIG.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
            >
              Admissions Desk WhatsApp
            </a>
            <span className="text-[#E5E5F0] hidden sm:inline">&bull;</span>
            <a
              href={BRAND_CONFIG.domain}
              className="text-[#5F6078] hover:text-[#480878] transition-colors text-[11px] flex items-center gap-1"
            >
              <span>Main Hub ({BRAND_CONFIG.cleanDomain})</span>
              <ArrowUpRight className="w-3 h-3 text-[#5F6078]" />
            </a>
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <section className="relative py-16 sm:py-24 overflow-hidden border-b border-[#E5E5F0] bg-white">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#9030F8]/10 blur-[140px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <img
            src="/images/vixora-academy-logo.jpg"
            alt="Vixora Academy — Learn. Apply. Earn."
            className="mx-auto w-auto h-24 sm:h-28 md:h-32 max-w-[420px] object-contain"
          />
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#480878]/5 border border-[#480878]/20 text-[#480878]">
            <GraduationCap className="w-3.5 h-3.5 text-[#9030F8]" />
            <span className="font-mono uppercase tracking-widest text-[11px]">Vixora Academy & Live Cohorts</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#000048] tracking-tight leading-tight">
            Engineering-Grade Training in Software, AI & Autonomous Systems
          </h1>

          <p className="text-base sm:text-lg text-[#5F6078] max-w-3xl mx-auto font-normal leading-relaxed">
            Practical, cohort-based training and masterclasses designed to transform developers, executives, and organizations into high-impact innovators using real production toolchains.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <button
              onClick={onOpenProjectModal}
              className="px-7 py-3.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-[#480878] via-[#7000F8] to-[#9030F8] hover:from-[#7000F8] hover:to-[#480878] text-white shadow-lg shadow-[#480878]/25 transition-all cursor-pointer"
            >
              Request Corporate In-House Cohort
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('catalog');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3.5 rounded-xl text-xs sm:text-sm font-semibold bg-white hover:bg-[#F7F7FC] text-[#000048] border border-[#480878]/25 hover:border-[#9030F8] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#480878]" /> Browse Program Tracks
            </button>
          </div>
        </div>
      </section>

      {/* Course Catalog Showcase */}
      <section id="catalog" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-[#480878]">
              <BookOpen className="w-3.5 h-3.5" /> Course Catalog & Individual Landing Pages
            </div>
            <h2 className="text-3xl font-extrabold text-[#000048] tracking-tight">
              Select a Program Track
            </h2>
            <p className="text-sm text-[#5F6078] max-w-2xl">
              Each course features a dedicated landing page with weekly syllabus breakdowns, hands-on production labs, capstone previews, and verified certifications.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {tracks.map((track) => (
              <button
                key={track}
                onClick={() => setSelectedTrack(track)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedTrack === track
                    ? 'bg-[#480878] text-white shadow-md shadow-[#480878]/20'
                    : 'bg-white text-[#5F6078] border border-[#E5E5F0] hover:border-[#9030F8]/40 hover:text-[#480878]'
                }`}
              >
                {track}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-3xl border border-[#E5E5F0] hover:border-[#9030F8]/50 transition-all duration-300 flex flex-col justify-between overflow-hidden group shadow-lg hover:-translate-y-1"
            >
              <div className="p-6 sm:p-7 space-y-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase bg-[#480878]/5 text-[#480878] border border-[#480878]/15">
                    {course.badge}
                  </span>
                  <span className="text-[11px] font-mono text-emerald-600 font-bold">
                    {course.tuition}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3
                    onClick={() => onSelectCourse(course)}
                    className="text-lg font-bold text-[#000048] group-hover:text-[#480878] transition-colors cursor-pointer leading-snug"
                  >
                    {course.title}
                  </h3>
                  <p className="text-xs text-[#5F6078] line-clamp-3 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5E5F0] text-xs font-mono text-[#000048]">
                  <div className="flex items-center gap-1.5 text-[#5F6078]">
                    <Clock className="w-3.5 h-3.5 text-[#9030F8]" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#5F6078]">
                    <Calendar className="w-3.5 h-3.5 text-[#9030F8]" />
                    <span className="truncate">{course.nextCohortDate}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="text-[11px] font-mono font-semibold uppercase text-[#480878]">
                    Key Modules:
                  </div>
                  <ul className="space-y-1.5">
                    {course.curriculum.slice(0, 3).map((curr, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-[#5F6078]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#9030F8] shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{curr}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-6 pt-0 space-y-2">
                <button
                  onClick={() => onSelectCourse(course)}
                  className="w-full py-3 rounded-xl text-xs font-bold bg-[#480878] hover:bg-[#7000F8] text-white border border-[#480878] hover:border-[#7000F8] transition-all flex items-center justify-center gap-1.5 cursor-pointer group"
                >
                  <span>Explore Course Landing Page</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="flex items-center justify-between text-[11px] px-1 font-mono text-[#5F6078]">
                  <span className="text-amber-700">{course.seatsRemaining} seats left</span>
                  <button
                    onClick={() => onEnrollCourse(course)}
                    className="text-[#480878] hover:text-[#7000F8] underline cursor-pointer"
                  >
                    Quick Enroll &rarr;
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white border border-[#E5E5F0] p-8 sm:p-12 space-y-10 shadow-lg">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-[#480878]">
              <Building className="w-4 h-4" /> Enterprise Workforce Transformation
            </div>
            <h2 className="text-3xl font-extrabold text-[#000048] tracking-tight">
              Custom Corporate Training & In-House Cohorts
            </h2>
            <p className="text-sm text-[#5F6078] leading-relaxed">
              We design and deliver bespoke corporate training programs for technology companies, enterprises, and government agencies seeking to upskill entire teams in modern autonomous toolchains.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {corporateOfferings.map((off, idx) => {
              const Icon = off.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#F7F7FC] border border-[#E5E5F0] hover:border-[#9030F8]/40 transition-all space-y-3.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-[#480878]/5 text-[#480878] w-fit">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#480878]/5 text-[#480878] border border-[#480878]/15">
                      {off.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#000048]">{off.title}</h3>
                  <p className="text-xs text-[#5F6078] leading-relaxed">{off.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E5E5F0]">
            <div className="text-xs text-[#5F6078]">
              Need a custom syllabus tailored to your company's proprietary tech stack?
            </div>
            <button
              onClick={onOpenProjectModal}
              className="px-6 py-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#480878] via-[#7000F8] to-[#9030F8] hover:from-[#7000F8] hover:to-[#480878] text-white shadow-lg shadow-[#480878]/25 transition-all cursor-pointer shrink-0"
            >
              Book Corporate Scoping Call
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
