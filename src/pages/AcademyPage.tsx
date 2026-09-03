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
  Bot
} from 'lucide-react';
import { ACADEMY_COURSES, AcademyCourse } from '../data/vixoraContent';

interface AcademyPageProps {
  onOpenProjectModal: () => void;
}

export function AcademyPage({ onOpenProjectModal }: AcademyPageProps) {
  const [selectedTrack, setSelectedTrack] = useState<string>('All Tracks');

  const tracks = ['All Tracks', 'Executive & Leadership', 'Engineering & AI', 'Business Automation'];

  const filteredCourses = selectedTrack === 'All Tracks'
    ? ACADEMY_COURSES
    : ACADEMY_COURSES.filter((c) =>
        selectedTrack === 'Executive & Leadership'
          ? c.targetAudience.includes('Executive') || c.targetAudience.includes('Manager')
          : selectedTrack === 'Engineering & AI'
          ? c.title.includes('AI') || c.curriculum.some(cur => cur.includes('Python') || cur.includes('FastAPI'))
          : true
      );

  const corporateOfferings = [
    {
      title: 'In-House AI Enablement & Training',
      desc: 'Customized curriculum delivered on-site or remotely to transition your staff into high-velocity AI-augmented teams.',
      icon: Building,
    },
    {
      title: 'AI Automation Hackathons & Sprints',
      desc: '3-day intensive workshops where your teams build live production-ready automation workflows for your actual internal business processes.',
      icon: Cpu,
    },
    {
      title: 'Executive AI Governance & ROI Briefings',
      desc: 'Strategic roadmapping sessions for C-suite leaders and directors on AI risk, model selection, data security, and procurement.',
      icon: Award,
    },
  ];

  return (
    <div className="pt-24 pb-20 bg-[#070314] text-neutral-100 min-h-screen">
      {/* Hero Header */}
      <section className="relative py-16 sm:py-24 overflow-hidden border-b border-purple-900/30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-500/10 border border-purple-500/30 text-purple-300">
            <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-mono uppercase tracking-widest text-[11px]">Vixora Academy & Corporate Training</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Upskill Your Workforce in Software, AI & Autonomous Automation
          </h1>

          <p className="text-base sm:text-lg text-neutral-300 max-w-3xl mx-auto font-normal leading-relaxed">
            Practical, engineering-grounded training designed to turn professionals and organizations into high-impact innovators using real-world toolchains.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
            <button
              onClick={onOpenProjectModal}
              className="px-7 py-3.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              Request Corporate In-House Cohort
            </button>
          </div>
        </div>
      </section>

      {/* Corporate Training Highlights */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {corporateOfferings.map((off, idx) => {
            const Icon = off.icon;
            return (
              <div
                key={idx}
                className="p-7 rounded-2xl bg-neutral-900/80 border border-purple-900/30 hover:border-purple-500/40 transition-all space-y-3.5"
              >
                <div className="p-3 rounded-xl bg-purple-600/20 text-purple-400 w-fit">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">{off.title}</h3>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                  {off.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Courses & Cohort Curriculums */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-mono uppercase tracking-widest text-purple-400">
            FLAGSHIP PROGRAMS
          </div>
          <h2 className="text-3xl font-extrabold text-white">
            Available Bootcamps & Executive Cohorts
          </h2>
        </div>

        {/* Filter */}
        <div className="flex justify-center gap-2">
          {tracks.map((track) => (
            <button
              key={track}
              onClick={() => setSelectedTrack(track)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedTrack === track
                  ? 'bg-purple-600 text-white'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {track}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-neutral-900/80 rounded-3xl border border-purple-900/30 hover:border-purple-500/40 transition-all p-7 flex flex-col justify-between space-y-6 shadow-xl"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase bg-purple-950/80 text-purple-300 border border-purple-800/60">
                    {course.format}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    <span>{course.duration}</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white hover:text-purple-300 transition-colors">
                  {course.title}
                </h3>

                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                  {course.description}
                </p>

                <div className="space-y-2 pt-4 border-t border-neutral-800">
                  <div className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
                    Target Audience:
                  </div>
                  <div className="text-xs text-neutral-300 font-medium">
                    {course.targetAudience}
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-neutral-800">
                  <div className="text-[11px] font-mono text-purple-400 uppercase tracking-wider">
                    Core Curriculum Modules:
                  </div>
                  <div className="space-y-1.5">
                    {course.curriculum.map((item, cIdx) => (
                      <div key={cIdx} className="flex items-start gap-2 text-xs text-neutral-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-800 space-y-3">
                <button
                  onClick={onOpenProjectModal}
                  className="w-full py-3 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Enroll or Inquire</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Banner */}
      <section className="py-16 text-center max-w-4xl mx-auto px-4">
        <div className="p-10 rounded-3xl bg-gradient-to-b from-purple-950/60 to-neutral-950 border border-purple-500/30 space-y-5">
          <h3 className="text-2xl sm:text-3xl font-bold text-white">
            Custom In-House Enterprise Syllabi
          </h3>
          <p className="text-sm text-neutral-300 max-w-xl mx-auto">
            Need training tailored specifically to your company's proprietary codebase, CRM workflows, or security requirements? We build bespoke corporate training tracks.
          </p>
          <button
            onClick={onOpenProjectModal}
            className="px-8 py-3.5 rounded-xl text-xs sm:text-sm font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
          >
            Request Custom Enterprise Proposal
          </button>
        </div>
      </section>
    </div>
  );
}
