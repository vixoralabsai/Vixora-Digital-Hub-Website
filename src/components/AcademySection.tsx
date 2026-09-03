import { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Users,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Terminal,
  Award,
  Sparkles,
  Play
} from 'lucide-react';
import { WhatsAppContactButton } from './WhatsAppContactButton';

interface AcademySectionProps {
  onOpenProjectModal: () => void;
}

export function AcademySection({ onOpenProjectModal }: AcademySectionProps) {
  const [selectedTrack, setSelectedTrack] = useState<'academy' | 'corporate' | 'masterclass'>('academy');

  const tracks = [
    {
      id: 'academy',
      title: 'Vixora Academy Cohort',
      subtitle: '12-Week Intensive Full-Stack & AI Engineering',
      target: 'Aspiring Builders & Senior Devs',
      topics: [
        'Advanced Python, FastAPI & Asynchronous Architectures',
        'Next.js 15, React 19 & High-Performance Frontends',
        'Autonomous AI Agents, n8n Orchestration & LangChain',
        'PostgreSQL, pgvector & Vector Search Pipelines',
        'Docker, AWS Cloud Run & Production CI/CD'
      ],
      deliverable: 'Capstoned Real-World Production App + Vixora Certified Credential'
    },
    {
      id: 'corporate',
      title: 'Corporate AI & Automation Upskilling',
      subtitle: 'Custom Workforce Transformation for Enterprises & SMEs',
      target: 'Company Teams, Operations & Executives',
      topics: [
        'Executive AI Strategy, Governance & Security Compliance',
        'No-Code/Low-Code Workflow Automation (n8n & Zapier)',
        'Prompt Engineering & Custom GPTs for Internal Operations',
        'Automated Customer Support & CRM Integrations',
        'Document Parsing & Financial Reporting Pipelines'
      ],
      deliverable: 'Custom Corporate LMS Modules + Hands-on Departmental Labs'
    },
    {
      id: 'masterclass',
      title: 'Technical Masterclasses & Workshops',
      subtitle: 'Focused Single-Day Deep Dives on Emerging Tech',
      target: 'Engineers, Product Managers & Founders',
      topics: [
        'Building Multi-Agent Swarms with Tool Calling',
        'Fine-Tuning LLMs on Proprietary Business Knowledge',
        'High-Converting UGC & AI Video Ad Generation',
        'Zero-Downtime Deployment & Cloud Observability'
      ],
      deliverable: 'Live Code Sandbox, Architecture Blueprints & Replay Library'
    }
  ];

  const currentTrack = tracks.find((t) => t.id === selectedTrack) || tracks[0];

  return (
    <section id="academy" className="py-24 bg-neutral-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 mb-3">
            <span>EDUCATION & TALENT ENGINE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-100 tracking-tight">
            Vixora Academy & Corporate Training
          </h2>
          <p className="mt-3 text-base sm:text-lg text-neutral-400 font-normal">
            Bridging the global tech talent gap by training developers and corporate teams in modern software architecture, LLM systems, and automated operations.
          </p>
        </div>

        {/* Track Switcher */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10">
          {tracks.map((t) => {
            const isSelected = t.id === selectedTrack;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTrack(t.id as any)}
                className={`p-5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-950/40 border-blue-500/80 shadow-lg shadow-blue-500/10'
                    : 'bg-neutral-900/70 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                }`}
              >
                <div>
                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded uppercase ${
                      isSelected ? 'bg-blue-500 text-white' : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {t.target}
                  </span>
                  <h3
                    className={`text-base font-bold mt-2.5 ${
                      isSelected ? 'text-blue-300' : 'text-neutral-200'
                    }`}
                  >
                    {t.title}
                  </h3>
                </div>
                <p className="text-xs text-neutral-400 mt-2 line-clamp-2">
                  {t.subtitle}
                </p>
              </button>
            );
          })}
        </div>

        {/* Detailed Curriculum / Syllabus Container */}
        <div className="p-7 sm:p-9 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs font-mono text-blue-400 uppercase font-semibold">
                  Course Architecture
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                  {currentTrack.title}
                </h3>
                <p className="text-sm text-neutral-300 mt-1">
                  {currentTrack.subtitle}
                </p>
              </div>

              <div className="space-y-2.5">
                <p className="text-xs font-mono uppercase text-neutral-500 tracking-wider">
                  Curriculum Highlights:
                </p>
                {currentTrack.topics.map((top, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-200"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{top}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 flex items-center gap-3">
                <Award className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <strong className="text-white block font-medium">
                    Certification & Capstone:
                  </strong>
                  {currentTrack.deliverable}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 p-6 rounded-xl bg-neutral-950 border border-neutral-800 space-y-5">
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">
                  Next Cohort Registration
                </h4>
                <p className="text-xs text-neutral-400">
                  Applications are reviewed on a rolling basis. Small cohort sizes for hands-on mentorship.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs py-2 border-b border-neutral-800">
                  <span className="text-neutral-400">Format</span>
                  <span className="font-semibold text-white">Live Virtual + Code Lab</span>
                </div>
                <div className="flex items-center justify-between text-xs py-2 border-b border-neutral-800">
                  <span className="text-neutral-400">Mentorship</span>
                  <span className="font-semibold text-white">1-on-1 Senior Staff Engineers</span>
                </div>
                <div className="flex items-center justify-between text-xs py-2 border-b border-neutral-800">
                  <span className="text-neutral-400">Prerequisites</span>
                  <span className="font-semibold text-white">Basic Programming / Logic</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  onClick={onOpenProjectModal}
                  className="w-full py-3 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <span>Apply for Enrollment / Corporate Booking</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <WhatsAppContactButton
                  variant="secondary"
                  label="Chat with Academy Advisor (US & Nigeria)"
                  message="Hello Vixora Academy Admissions, I have a question about course cohorts and syllabus tracks."
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
