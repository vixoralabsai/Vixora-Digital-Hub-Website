import React from 'react';
import {
  GraduationCap,
  Award,
  ShieldCheck,
  Mail,
  MessageSquare,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Sparkles,
  FileText
} from 'lucide-react';
import { BRAND_CONFIG } from '../data/brandConfig';
import { ACADEMY_COURSES } from '../data/vixoraContent';

interface AcademyFooterProps {
  onNavigate: (page: string, sectionId?: string, courseSlug?: string, customPath?: string) => void;
  onOpenCorporateModal?: () => void;
}

export function AcademyFooter({ onNavigate, onOpenCorporateModal }: AcademyFooterProps) {
  return (
    <footer className="bg-[#000030] text-purple-100 border-t border-[#480878]/40 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Tier: Academic Brand & Dean Directorate */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          
          {/* Academy Brand Column */}
          <div className="lg:col-span-4 space-y-4">
            <button
              onClick={() => onNavigate('academy', undefined, undefined, '/pages/academy')}
              className="flex items-center gap-3 text-left cursor-pointer"
            >
              <div className="p-2 bg-white rounded-2xl shadow-lg border border-purple-100 flex items-center justify-center">
                <img
                  src="/images/vixora-academy-logo.jpg"
                  alt="Vixora Academy — Learn. Apply. Earn."
                  className="h-10 w-auto max-w-[200px] object-contain rounded-xl"
                />
              </div>
            </button>

            <p className="text-xs sm:text-sm text-purple-200 leading-relaxed max-w-sm">
              The premier technical institution under the Academic Directorate of Dean <strong className="text-white">Sarumi Hammad</strong>, offering rigorous cohort training in Autonomous AI Systems, Data Analytics, and Digital Freelancing.
            </p>

            <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <Award className="w-4 h-4" />
                <span>Dean Sarumi Hammad</span>
              </div>
              <div className="text-[11px] text-purple-200">
                Dean & Academic Director, Vixora Academy
              </div>
              <div className="text-[11px] font-mono text-emerald-300 pt-0.5">
                Subdomain: {BRAND_CONFIG.cleanAcademyDomain}
              </div>
            </div>

            {/* Direct Admissions Links */}
            <div className="space-y-2 pt-2 text-xs">
              <a
                href={BRAND_CONFIG.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-emerald-300 hover:text-emerald-200 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Admissions Desk: {BRAND_CONFIG.whatsapp.nigeria.displayNumber}</span>
              </a>

              <a
                href={`mailto:${BRAND_CONFIG.email}`}
                className="flex items-center gap-2 text-purple-200 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Admissions Email: {BRAND_CONFIG.email}</span>
              </a>
            </div>
          </div>

          {/* Academic Columns */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
            
            {/* 1. Academic Cohorts */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                <span>Academic Cohorts</span>
              </h4>
              <ul className="space-y-2.5 text-xs text-purple-200">
                {ACADEMY_COURSES.map((course) => (
                  <li key={course.id}>
                    <button
                      onClick={() => onNavigate('academy-course', undefined, course.slug, `/academy/${course.slug}`)}
                      className="hover:text-white transition-colors cursor-pointer text-left block"
                    >
                      <div className="font-semibold text-white/90 hover:text-white">{course.title}</div>
                      <div className="text-[11px] text-purple-300/80 font-mono">{course.duration} • {course.badge}</div>
                    </button>
                  </li>
                ))}
                <li className="pt-1">
                  <button
                    onClick={() => onNavigate('academy', undefined, undefined, '/pages/academy')}
                    className="text-amber-300 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All Academy Tracks</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </li>
              </ul>
            </div>

            {/* 2. Directorate & Portals */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                <span>Student Directorate</span>
              </h4>
              <ul className="space-y-2.5 text-xs text-purple-200">
                <li>
                  <button
                    onClick={() => onNavigate('student-portal', undefined, undefined, '/pages/student-portal')}
                    className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span>Student Portal & Dashboard</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('certificate-portal', undefined, undefined, '/pages/certificate-portal')}
                    className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Verify Credential ID</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('certificate-portal', undefined, undefined, '/pages/certificate-portal')}
                    className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                    <span>Download Official PDF</span>
                  </button>
                </li>
                {onOpenCorporateModal && (
                  <li>
                    <button
                      onClick={onOpenCorporateModal}
                      className="hover:text-white transition-colors cursor-pointer text-left text-amber-300"
                    >
                      Corporate Training Scoping
                    </button>
                  </li>
                )}
              </ul>
            </div>

            {/* 3. Main Hub Connection */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-emerald-300" />
                <span>Main Digital Hub</span>
              </h4>
              <p className="text-xs text-purple-300 leading-relaxed">
                Vixora Academy is the technical education arm of Vixora Digital Hub.
              </p>
              <ul className="space-y-2 text-xs text-purple-200">
                <li>
                  <a
                    href={BRAND_CONFIG.domain}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all"
                  >
                    <span>Vixora Digital Hub Main Agency</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </li>
                <li className="pt-2">
                  <a
                    href={`${BRAND_CONFIG.domain}/#solutions`}
                    className="hover:text-white transition-colors text-purple-300 hover:underline block"
                  >
                    Custom Software & Web Platforms
                  </a>
                </li>
                <li>
                  <a
                    href={`${BRAND_CONFIG.domain}/#solutions`}
                    className="hover:text-white transition-colors text-purple-300 hover:underline block"
                  >
                    Autonomous Business Automation
                  </a>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom Bar: Accreditation & Dean Authority */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-purple-300/80 pt-4">
          <div>
            © 2026 Vixora Academy. All Rights Reserved. Supervised under Dean <strong className="text-white">Sarumi Hammad</strong>.
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-emerald-400 text-[11px]">
              Subdomain: {BRAND_CONFIG.cleanAcademyDomain}
            </span>
            <span>•</span>
            <a
              href={BRAND_CONFIG.domain}
              className="text-purple-200 hover:text-white transition-colors"
            >
              Main Platform: {BRAND_CONFIG.cleanDomain}
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
