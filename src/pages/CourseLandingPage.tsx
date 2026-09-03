import { useState } from 'react';
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
  Globe
} from 'lucide-react';
import { AcademyCourse, CourseSyllabusModule } from '../data/vixoraContent';
import { BRAND_CONFIG } from '../data/brandConfig';

interface CourseLandingPageProps {
  course: AcademyCourse;
  onBackToAcademy: () => void;
  onEnroll: (course: AcademyCourse) => void;
  onOpenSubdomainGuide: () => void;
  onNavigateHome: () => void;
}

export function CourseLandingPage({
  course,
  onBackToAcademy,
  onEnroll,
  onOpenSubdomainGuide,
  onNavigateHome
}: CourseLandingPageProps) {
  const [expandedModules, setExpandedModules] = useState<{ [key: number]: boolean }>({ 0: true, 1: true });
  const [expandedFaqs, setExpandedFaqs] = useState<{ [key: number]: boolean }>({ 0: true });
  const [downloadSuccess, setDownloadSuccess] = useState(false);

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

  const handleDownloadSyllabus = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
    // Trigger download of text syllabus representation
    const content = `VIXORA ACADEMY - SYLLABUS OVERVIEW\nCourse: ${course.title}\nFormat: ${course.format}\nTuition: ${course.tuition}\nNext Cohort: ${course.nextCohortDate}\n\nCURRICULUM MODULES:\n` +
      course.weeklySyllabus.map(m => `${m.week}: ${m.title}\n${m.description}\nTopics: ${m.topics.join(', ')}\nHands-On Lab: ${m.handsOnLab}\n`).join('\n---\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Vixora-Academy-${course.slug}-Syllabus.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="pt-20 pb-28 bg-[#070314] text-neutral-100 min-h-screen">
      {/* Subdomain Header Banner */}
      <div className="bg-neutral-950 border-b border-purple-900/40 py-2.5 px-4 sm:px-8">
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

      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 border-b border-purple-900/30 overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[360px] bg-purple-600/15 blur-[140px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {course.badge}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-neutral-900 text-neutral-300 border border-neutral-800">
                Level: {course.level}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-neutral-900 text-neutral-300 border border-neutral-800">
                Track: {course.track}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
              {course.title}
            </h1>

            <p className="text-lg sm:text-xl text-neutral-300 max-w-4xl font-normal leading-relaxed">
              {course.subtitle}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 p-4 sm:p-6 rounded-3xl bg-neutral-900/80 border border-purple-900/40 backdrop-blur-md">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
                <Clock className="w-3.5 h-3.5 text-purple-400" /> Duration
              </div>
              <div className="text-base font-bold text-white">{course.duration}</div>
              <div className="text-[11px] text-neutral-500">{course.commitment}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
                <Calendar className="w-3.5 h-3.5 text-purple-400" /> Next Cohort
              </div>
              <div className="text-base font-bold text-white">{course.nextCohortDate}</div>
              <div className="text-[11px] text-purple-300 font-medium">{course.format}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
                <CreditCard className="w-3.5 h-3.5 text-purple-400" /> Tuition
              </div>
              <div className="text-base font-bold text-emerald-400">{course.tuition}</div>
              <div className="text-[11px] text-neutral-500">Installments available</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
                <Users className="w-3.5 h-3.5 text-purple-400" /> Availability
              </div>
              <div className="text-base font-bold text-amber-400">{course.seatsRemaining} Seats Left</div>
              <div className="text-[11px] text-neutral-500">Small-group cohort</div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onEnroll(course)}
              className="px-8 py-4 rounded-2xl text-sm font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-xl shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer group"
            >
              Enroll in Next Cohort <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={handleDownloadSyllabus}
              className="px-6 py-4 rounded-2xl text-sm font-semibold bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Syllabus Downloaded
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-purple-400" /> Download Syllabus PDF / TXT
                </>
              )}
            </button>
          </div>

          {/* Highlights checklist */}
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {course.highlights.map((hl, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-300">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>{hl}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        {/* Core Transformation / Outcomes */}
        <section className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-purple-400">
              Core Competencies & Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              What You Will Master & Ship to Production
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {course.outcomes.map((outcome, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-purple-500/40 transition-all space-y-2 flex items-start gap-3.5"
              >
                <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{outcome}</h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Grounded in real production codebases and battle-tested engineering patterns.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Target Audience & Prerequisites */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-7 rounded-3xl bg-neutral-900/80 border border-purple-900/30 space-y-4">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <Users className="w-5 h-5" /> Who is this Cohort for?
            </div>
            <p className="text-sm text-neutral-300 leading-relaxed">
              {course.targetAudience}
            </p>
            <div className="pt-2 text-xs text-neutral-400 border-t border-neutral-800">
              Ideal for builders looking to bypass trial-and-error and adopt enterprise-level toolchains directly.
            </div>
          </div>

          <div className="p-7 rounded-3xl bg-neutral-900/80 border border-purple-900/30 space-y-4">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
              <ShieldCheck className="w-5 h-5" /> Prerequisites & Setup
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-300">
              {course.prerequisites.map((req, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Detailed Weekly Syllabus */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-purple-400">
                Curriculum Blueprint
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Comprehensive Weekly Syllabus & Labs
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400">
                Every module blends architectural theory with an immediate hands-on engineering lab.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleAllModules(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-mono bg-neutral-900 text-neutral-300 border border-neutral-800 hover:text-white transition-colors"
              >
                Expand All
              </button>
              <button
                onClick={() => toggleAllModules(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-mono bg-neutral-900 text-neutral-300 border border-neutral-800 hover:text-white transition-colors"
              >
                Collapse All
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {course.weeklySyllabus.map((mod, idx) => {
              const isExpanded = expandedModules[idx] ?? false;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-neutral-900/80 border border-purple-900/30 overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => toggleModule(idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 hover:bg-neutral-800/40 transition-colors cursor-pointer"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800/50">
                          {mod.week}
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-white">
                          {mod.title}
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-neutral-400 max-w-3xl">
                        {mod.description}
                      </p>
                    </div>

                    <div className="p-2 rounded-xl bg-neutral-800 text-neutral-400 shrink-0">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-neutral-800/60 space-y-4">
                      <div>
                        <div className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider mb-2">
                          Core Topics Covered:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {mod.topics.map((top, tIdx) => (
                            <div key={tIdx} className="flex items-start gap-2 text-xs text-neutral-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                              <span>{top}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 font-mono">
                          <Code2 className="w-3.5 h-3.5" /> Hands-on Production Lab:
                        </div>
                        <p className="text-xs text-neutral-300 leading-relaxed">
                          {mod.handsOnLab}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Capstone Projects Portfolio */}
        {course.capstoneProjects && course.capstoneProjects.length > 0 && (
          <section className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-indigo-400">
                Portfolio Assets
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Real-World Capstone Projects You'll Build
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400">
                You won't leave with toy exercises. You will deploy battle-tested applications ready for your client proposals or engineering portfolio.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {course.capstoneProjects.map((cap, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-neutral-900/70 border border-neutral-800 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4 shadow-xl"
                >
                  <div className="space-y-3">
                    <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 w-fit">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-white leading-snug">
                      {cap.title}
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {cap.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-neutral-800">
                    <div className="flex flex-wrap gap-1.5">
                      {cap.technologies.map((tech, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-neutral-950 text-neutral-300 border border-neutral-800"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Instructors */}
        {course.instructors && course.instructors.length > 0 && (
          <section className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-purple-400">
                Instructors & Mentorship
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Taught by Practicing Senior Architects
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {course.instructors.map((ins, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-neutral-900/80 border border-purple-900/30 flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-lg shadow-purple-600/20">
                    {ins.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-white">{ins.name}</h3>
                    <div className="text-xs text-purple-300 font-medium">{ins.role}</div>
                    <div className="text-[11px] font-mono text-neutral-400">{ins.companyBackground}</div>
                    <p className="text-xs text-neutral-300 pt-1 leading-relaxed">{ins.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tuition & Corporate Sponsorship */}
        <section className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-purple-950/50 via-neutral-900 to-indigo-950/50 border border-purple-900/50 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Transparent Tuition & Reimbursement
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Invest in High-Velocity AI Capabilities
              </h2>
              <p className="text-sm text-neutral-300 leading-relaxed">
                {course.tuitionNote}
              </p>
              <div className="text-xs text-neutral-400 space-y-1">
                <p>&bull; 100% Tax Deductible as Professional Education & Development.</p>
                <p>&bull; Formal syllabus documentation & corporate invoices issued upon request.</p>
                <p>&bull; Certificate issued: <strong className="text-purple-300">{course.certificateType}</strong></p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-5 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-neutral-800 pb-4">
                <div>
                  <div className="text-xs text-neutral-400">Total Program Tuition</div>
                  <div className="text-3xl font-extrabold text-white">{course.tuition}</div>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono border border-emerald-500/30">
                  {course.seatsRemaining} Seats Remaining
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => onEnroll(course)}
                  className="w-full py-3.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Apply & Reserve Your Seat <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleDownloadSyllabus}
                  className="w-full py-3 rounded-xl text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download Employer Justification Kit
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Course FAQs */}
        {course.faqs && course.faqs.length > 0 && (
          <section className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-purple-400">
                Got Questions?
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-3">
              {course.faqs.map((faq, idx) => {
                const isExpanded = expandedFaqs[idx] ?? false;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl bg-neutral-900/80 border border-neutral-800 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-neutral-800/40 transition-colors cursor-pointer"
                    >
                      <span className="text-sm font-bold text-white">{faq.q}</span>
                      <div className="text-neutral-400 shrink-0">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="px-5 pb-5 text-xs sm:text-sm text-neutral-300 border-t border-neutral-800/60 pt-3 leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Sticky Bottom Enrollment Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-neutral-950/95 border-t border-purple-900/40 py-3.5 px-4 sm:px-8 backdrop-blur-lg z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <div className="text-xs font-bold text-white truncate max-w-md">{course.title}</div>
            <div className="text-[11px] text-neutral-400 font-mono">
              Next Cohort: {course.nextCohortDate} &bull; <span className="text-emerald-400">{course.tuition}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={handleDownloadSyllabus}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition-colors hidden md:inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Syllabus
            </button>
            <button
              onClick={() => onEnroll(course)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Enroll Now ({course.tuition}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
