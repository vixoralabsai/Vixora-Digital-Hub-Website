import { useState } from 'react';
import {
  X,
  CheckCircle2,
  GraduationCap,
  Calendar,
  Users,
  CreditCard,
  Building2,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { AcademyCourse, COMPANY_CONTACT } from '../data/vixoraContent';
import { BRAND_CONFIG, getWhatsAppUrl } from '../data/brandConfig';

interface CourseEnrollmentModalProps {
  isOpen: boolean;
  course: AcademyCourse | null;
  onClose: () => void;
}

export function CourseEnrollmentModal({
  isOpen,
  course,
  onClose
}: CourseEnrollmentModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [company, setCompany] = useState('');
  const [fundingType, setFundingType] = useState<'self' | 'employer' | 'installments'>('self');
  const [experienceLevel, setExperienceLevel] = useState('Intermediate (2-5 yrs)');
  const [goals, setGoals] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen || !course) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setFullName('');
    setEmail('');
    setPhone('');
    setCurrentRole('');
    setCompany('');
    setGoals('');
    onClose();
  };

  const encodedWhatsAppMessage = encodeURIComponent(
    `Hello Vixora Academy Admissions! I am interested in enrolling in the "${course.title}". My name is ${fullName || '[Name]'} (${email || '[Email]'}).`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={handleResetAndClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-purple-900/50 rounded-3xl shadow-2xl shadow-purple-950/60 overflow-hidden z-10 my-8">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-purple-950/80 via-neutral-900 to-indigo-950/80 p-6 sm:p-8 border-b border-purple-900/30 relative">
          <button
            onClick={handleResetAndClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-3">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Admissions Portal &bull; {course.badge}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Enroll in {course.title}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-300 mt-2 font-mono">
            <span className="flex items-center gap-1.5 text-purple-300">
              <Calendar className="w-3.5 h-3.5" /> Next Cohort: {course.nextCohortDate}
            </span>
            <span>&bull;</span>
            <span className="text-emerald-400 font-semibold">{course.tuition} Tuition</span>
            <span>&bull;</span>
            <span className="text-amber-400">{course.seatsRemaining} Seats Remaining</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto">
          {isSubmitted ? (
            <div className="text-center py-8 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Application Received!</h3>
                <p className="text-sm text-neutral-300 max-w-md mx-auto">
                  Thank you, <strong className="text-purple-300">{fullName}</strong>. Our admissions team has reserved a provisional seat for you in the <strong className="text-white">{course.title}</strong> cohort starting on <strong className="text-purple-300">{course.nextCohortDate}</strong>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 text-left space-y-2 text-xs font-mono text-neutral-300">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Applicant:</span>
                  <span>{fullName} ({email})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Course Track:</span>
                  <span>{course.track}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Payment Plan:</span>
                  <span className="capitalize">{fundingType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Confirmation Sent To:</span>
                  <span>{email}</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="text-xs font-semibold text-neutral-300 font-mono">
                  Fast-Track Admissions via WhatsApp:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <a
                    href={getWhatsAppUrl(
                      'us',
                      `Hello Vixora Academy Admissions! I am interested in enrolling in the "${course.title}". My name is ${fullName || '[Name]'} (${email || '[Email]'}).`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
                  >
                    <span>🇺🇸 🌐 US / Global Inbounds</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={getWhatsAppUrl(
                      'ng',
                      `Hello Vixora Academy Admissions! I am interested in enrolling in the "${course.title}". My name is ${fullName || '[Name]'} (${email || '[Email]'}).`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
                  >
                    <span>🇳🇬 Nigeria (08114542934)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <button
                  onClick={handleResetAndClose}
                  className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-all"
                >
                  Done & Back to Portal
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">
                    Full Name <span className="text-purple-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white text-sm outline-none transition-all placeholder:text-neutral-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">
                    Work Email <span className="text-purple-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="alex@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white text-sm outline-none transition-all placeholder:text-neutral-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">
                    Phone / WhatsApp (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white text-sm outline-none transition-all placeholder:text-neutral-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">
                    Current Title & Company
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Frontend Dev @ Acme"
                    value={currentRole}
                    onChange={(e) => setCurrentRole(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white text-sm outline-none transition-all placeholder:text-neutral-600"
                  />
                </div>
              </div>

              {/* Experience Level */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300">
                  Current Experience Level
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    'Beginner (< 1 yr)',
                    'Intermediate (2-5 yrs)',
                    'Senior (5+ yrs)',
                    'Executive / Lead'
                  ].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setExperienceLevel(lvl)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                        experienceLevel === lvl
                          ? 'bg-purple-600/30 border-purple-500 text-white'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tuition / Payment Method */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-300">
                  Tuition & Payment Preference
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => setFundingType('self')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      fundingType === 'self'
                        ? 'bg-purple-950/60 border-purple-500 text-white'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-bold">Self-Funded</span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      Single upfront payment with priority seat confirmation.
                    </p>
                  </div>

                  <div
                    onClick={() => setFundingType('installments')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      fundingType === 'installments'
                        ? 'bg-purple-950/60 border-purple-500 text-white'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold">Installments</span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      Split into monthly flexible payments during the cohort.
                    </p>
                  </div>

                  <div
                    onClick={() => setFundingType('employer')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      fundingType === 'employer'
                        ? 'bg-purple-950/60 border-purple-500 text-white'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-bold">Employer Invoice</span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      We provide corporate invoice and tax receipts for your L&D budget.
                    </p>
                  </div>
                </div>
              </div>

              {/* Goals */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300">
                  What is your primary goal or capstone idea for this cohort?
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. I want to build an autonomous agent to automate client proposals, and transition into senior AI engineering."
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white text-sm outline-none transition-all placeholder:text-neutral-600 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-neutral-800">
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>100% Risk-free admissions review</span>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleResetAndClose}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    Submit Enrollment <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
