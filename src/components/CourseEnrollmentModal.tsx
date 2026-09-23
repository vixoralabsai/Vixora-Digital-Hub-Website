import { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  GraduationCap,
  Calendar,
  CreditCard,
  Building2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Zap,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { AcademyCourse } from '../data/vixoraContent';
import { getWhatsAppUrl } from '../data/brandConfig';
import { BankPaymentDetailsCard } from './BankPaymentDetailsCard';
import { PaymentReceiptModal } from './PaymentReceiptModal';
import {
  initializePaystackPayment,
  launchPaystackCheckout,
  VerifiedPaymentData
} from '../lib/paystack';
import { supabase } from '../lib/supabaseClient';

interface CourseEnrollmentModalProps {
  isOpen: boolean;
  course: AcademyCourse | null;
  onClose: () => void;
  onGoToPortal?: () => void;
}

export function CourseEnrollmentModal({
  isOpen,
  course,
  onClose,
  onGoToPortal
}: CourseEnrollmentModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [company, setCompany] = useState('');
  const [fundingType, setFundingType] = useState<'self' | 'employer' | 'installments'>('self');
  const [selfPaymentMethod, setSelfPaymentMethod] = useState<'paystack' | 'bank_transfer'>('paystack');
  const [experienceLevel, setExperienceLevel] = useState('Intermediate (2-5 yrs)');
  const [goals, setGoals] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isApplicationSubmitted, setIsApplicationSubmitted] = useState(false);
  const [verifiedPayment, setVerifiedPayment] = useState<VerifiedPaymentData | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  // Pre-fill profile information if student is logged into Supabase
  useEffect(() => {
    if (!isOpen) return;

    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          if (session.user.email && !email) {
            setEmail(session.user.email);
          }
          const userMeta = session.user.user_metadata;
          if (userMeta?.full_name && !fullName) {
            setFullName(userMeta.full_name);
          } else if (userMeta?.name && !fullName) {
            setFullName(userMeta.name);
          }
        }
      }).catch(() => {
        // Guest mode fallback
      });
    }
  }, [isOpen]);

  if (!isOpen || !course) return null;

  const handleResetAndClose = () => {
    setIsSubmitting(false);
    setErrorMessage(null);
    setIsApplicationSubmitted(false);
    setFullName('');
    setEmail('');
    setPhone('');
    setCurrentRole('');
    setCompany('');
    setGoals('');
    setShowReceipt(false);
    setVerifiedPayment(null);
    onClose();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate submission clicks while active
    if (isSubmitting) return;

    setErrorMessage(null);

    if (!email || !email.includes('@')) {
      setErrorMessage('Please provide a valid email address to receive your enrollment confirmation.');
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage('Please provide your full student name.');
      return;
    }

    // Path 1: Self-Funded via Paystack Instant Online Checkout
    if (fundingType === 'self' && selfPaymentMethod === 'paystack') {
      setIsSubmitting(true);

      try {
        // Step 1: Backend Paystack Initialize
        // Note: Frontend sends ONLY trusted student details & courseId.
        // The authoritative amount is strictly determined server-side from canonical course catalog.
        const callbackUrl = typeof window !== 'undefined'
          ? `${window.location.origin}/payment/callback?courseId=${encodeURIComponent(course.id)}`
          : undefined;

        const initRes = await initializePaystackPayment({
          courseId: course.id,
          studentName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          callbackUrl
        });

        if (!initRes.success || !initRes.reference) {
          if (initRes.code === 'PAYSTACK_NOT_CONFIGURED') {
            setErrorMessage(
              'Payment processing is currently undergoing system setup. Please contact admissions via WhatsApp or try again shortly.'
            );
          } else {
            setErrorMessage(initRes.error || 'Failed to initialize payment checkout.');
          }
          setIsSubmitting(false);
          return;
        }

        // Step 2: Paystack Checkout (Inline popup or hosted redirect fallback)
        await launchPaystackCheckout({
          reference: initRes.reference,
          authorizationUrl: initRes.authorizationUrl,
          accessCode: initRes.accessCode,
          publicKey: initRes.publicKey,
          email: email.trim(),
          studentName: fullName.trim(),
          phone: phone.trim() || undefined,
          onSuccess: (confirmedRef) => {
            // Redirect to canonical /payment/callback for server verification
            window.location.href = `/payment/callback?reference=${encodeURIComponent(confirmedRef)}&courseId=${encodeURIComponent(course.id)}`;
          },
          onCancel: () => {
            setIsSubmitting(false);
            setErrorMessage('Payment was cancelled. You can try again whenever you are ready.');
          },
          onError: (err) => {
            setIsSubmitting(false);
            setErrorMessage(err || 'Failed to open payment gateway.');
          }
        });
      } catch (err: any) {
        console.error('Enrollment initialization error:', err);
        setErrorMessage(err?.message || 'A network error occurred while initializing checkout.');
        setIsSubmitting(false);
      }
      return;
    }

    // Path 2: Bank transfer or Corporate / Installments application
    setIsApplicationSubmitted(true);
  };

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

        {/* Content Body */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto">
          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-950/70 border border-rose-800/80 text-xs text-rose-200 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold text-rose-100">{errorMessage}</span>
                <p className="text-[11px] text-rose-300/80">
                  Your information has been preserved. You can click &quot;Submit Enrollment &amp; Pay&quot; to try again.
                </p>
              </div>
            </div>
          )}

          {isApplicationSubmitted ? (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Application Received!</h3>
                <p className="text-sm text-neutral-300 max-w-md mx-auto">
                  Thank you, <strong className="text-purple-300">{fullName}</strong>. Our admissions team has reserved a provisional seat for you in the <strong className="text-white">{course.title}</strong> cohort.
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
                  <span className="text-neutral-500">Payment Option:</span>
                  <span className="capitalize">{fundingType}</span>
                </div>
              </div>

              {fundingType === 'self' && selfPaymentMethod === 'bank_transfer' ? (
                <BankPaymentDetailsCard
                  courseTitle={course.title}
                  tuitionAmount={course.tuition}
                  onPayOnline={() => {
                    setIsApplicationSubmitted(false);
                    setSelfPaymentMethod('paystack');
                  }}
                />
              ) : (
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-semibold text-neutral-300 font-mono">
                    Fast-Track Corporate Admissions via WhatsApp:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <a
                      href={getWhatsAppUrl(
                        'us',
                        `Hello Vixora Admissions! I submitted an application for "${course.title}". My name is ${fullName} (${email}). Plan: ${fundingType}.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
                    >
                      <span>🇺🇸 Global Admissions Desk</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={getWhatsAppUrl(
                        'ng',
                        `Hello Vixora Admissions! I submitted an application for "${course.title}". My name is ${fullName} (${email}). Plan: ${fundingType}.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
                    >
                      <span>🇳🇬 Nigeria (08114542934)</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-all"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">
                    Full Name <span className="text-purple-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isSubmitting}
                    placeholder="e.g. Alex Morgan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white text-sm outline-none transition-all placeholder:text-neutral-600 disabled:opacity-60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">
                    Email Address <span className="text-purple-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    disabled={isSubmitting}
                    placeholder="alex@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white text-sm outline-none transition-all placeholder:text-neutral-600 disabled:opacity-60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">
                    Phone / WhatsApp (Optional)
                  </label>
                  <input
                    type="tel"
                    disabled={isSubmitting}
                    placeholder="+234 811 454 2934"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white text-sm outline-none transition-all placeholder:text-neutral-600 disabled:opacity-60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">
                    Current Title &amp; Company
                  </label>
                  <input
                    type="text"
                    disabled={isSubmitting}
                    placeholder="e.g. Data Analyst @ Acme"
                    value={currentRole}
                    onChange={(e) => setCurrentRole(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white text-sm outline-none transition-all placeholder:text-neutral-600 disabled:opacity-60"
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
                      disabled={isSubmitting}
                      onClick={() => setExperienceLevel(lvl)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                        experienceLevel === lvl
                          ? 'bg-purple-600/30 border-purple-500 text-white'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                      } disabled:opacity-50`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tuition & Payment Method Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-neutral-300">
                    Payment Preference
                  </label>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    Official Tuition: {course.tuition}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => !isSubmitting && setFundingType('self')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      fundingType === 'self'
                        ? 'bg-purple-950/60 border-purple-500 text-white'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-bold">Self-Funded</span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      Instant online checkout &amp; seat confirmation.
                    </p>
                  </div>

                  <div
                    onClick={() => !isSubmitting && setFundingType('installments')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      fundingType === 'installments'
                        ? 'bg-purple-950/60 border-purple-500 text-white'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold">Installments</span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      Flexible monthly payment schedule.
                    </p>
                  </div>

                  <div
                    onClick={() => !isSubmitting && setFundingType('employer')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      fundingType === 'employer'
                        ? 'bg-purple-950/60 border-purple-500 text-white'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-bold">Employer Invoice</span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      Corporate tax invoices &amp; L&amp;D sponsorship.
                    </p>
                  </div>
                </div>

                {fundingType === 'self' && (
                  <div className="pt-2 space-y-3">
                    <div className="flex rounded-xl bg-neutral-950 p-1 border border-neutral-800">
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => setSelfPaymentMethod('paystack')}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          selfPaymentMethod === 'paystack'
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Instant Online (Paystack)</span>
                      </button>
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => setSelfPaymentMethod('bank_transfer')}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          selfPaymentMethod === 'bank_transfer'
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Direct Bank Transfer</span>
                      </button>
                    </div>

                    {selfPaymentMethod === 'paystack' && (
                      <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-neutral-300 space-y-1 font-mono">
                        <div className="flex items-center justify-between text-white font-semibold font-sans">
                          <span>Paystack Multi-Channel Gateway</span>
                          <span className="text-emerald-400">{course.tuition}</span>
                        </div>
                        <p className="text-[11px] text-neutral-400">
                          Supports Debit/Credit Cards, Bank Transfer, USSD, Apple Pay &amp; Mobile Money.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Goals / Background */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300">
                  What is your primary goal for this cohort?
                </label>
                <textarea
                  rows={2}
                  disabled={isSubmitting}
                  placeholder="e.g. Master enterprise AI workflows and earn the verified alumni credential."
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white text-sm outline-none transition-all placeholder:text-neutral-600 resize-none disabled:opacity-60"
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-800">
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>256-bit encrypted admissions &bull; Verified Paystack security</span>
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleResetAndClose}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Connecting to Paystack...</span>
                      </>
                    ) : fundingType === 'self' && selfPaymentMethod === 'paystack' ? (
                      <>
                        <span>Submit Enrollment &amp; Pay</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        <span>Submit Application</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Verified Payment Receipt Modal */}
      <PaymentReceiptModal
        isOpen={showReceipt}
        payment={verifiedPayment}
        onClose={handleResetAndClose}
        onGoToPortal={onGoToPortal}
      />
    </div>
  );
}
