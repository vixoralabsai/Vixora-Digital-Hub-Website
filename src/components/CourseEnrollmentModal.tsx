import { useState, useEffect } from 'react';
import { useLoading } from '../context/LoadingContext';
import {
  X,
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
  AlertCircle,
  Phone,
  Mail,
  User
} from 'lucide-react';
import { AcademyCourse } from '../data/vixoraContent';
import { getWhatsAppUrl } from '../data/brandConfig';
import { BankPaymentDetailsCard } from './BankPaymentDetailsCard';
import { PaymentReceiptModal } from './PaymentReceiptModal';
import {
  initializePaystackPayment,
  getAvailableCohorts,
  launchPaystackCheckout,
  cleanErrorMessage,
  VerifiedPaymentData
} from '../lib/paystack';
import { supabase } from '../lib/supabaseClient';
import { StickerLabel, TactileButton } from './course/CourseVisualDecorations';
import { getCoursePricingMode, getCourseTrainingPlans, getTrainingPlan, type TrainingPlan } from '../data/trainingPlans';
import type { AvailableCohort } from '../lib/paystack';

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
  // Only 3 required student profile fields: Full Name, Email, and Phone
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Payment preference state
  const [fundingType, setFundingType] = useState<'self' | 'employer' | 'installments'>('self');
  const [selfPaymentMethod, setSelfPaymentMethod] = useState<'paystack' | 'bank_transfer'>('paystack');
  const [selectedPlanId, setSelectedPlanId] = useState<TrainingPlan['id']>('small-group');
  const [availableCohorts, setAvailableCohorts] = useState<AvailableCohort[]>([]);
  const [selectedCohortId, setSelectedCohortId] = useState<string>('');
  const [isLoadingCohorts, setIsLoadingCohorts] = useState(false);

  // UI state
  const { startLoading, stopLoading } = useLoading();
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

\n  useEffect(() => {\n    if (!isOpen || !course || getCoursePricingMode(course.id) !== 'tiered') return;\n    let cancelled = false;\n    setIsLoadingCohorts(true);\n    setAvailableCohorts([]);\n    setSelectedCohortId('');\n    getAvailableCohorts(course.id, selectedPlanId)\n      .then((result) => {\n        if (cancelled) return;\n        if (result.success) {\n          setAvailableCohorts(result.cohorts);\n          if (result.cohorts.length === 1) setSelectedCohortId(result.cohorts[0].id);\n        } else {\n          setErrorMessage(result.error || 'Unable to load available cohorts.');\n        }\n      })\n      .finally(() => { if (!cancelled) setIsLoadingCohorts(false); });\n    return () => { cancelled = true; };\n  }, [isOpen, course?.id, selectedPlanId]);\n
  if (!isOpen || !course) return null;

  const handleResetAndClose = () => {
    setIsSubmitting(false);
    stopLoading();
    setErrorMessage(null);
    setIsApplicationSubmitted(false);
    setFullName('');
    setEmail('');
    setPhone('');
    setFundingType('self');
    setSelfPaymentMethod('paystack');
    setSelectedPlanId('small-group');
    setAvailableCohorts([]);
    setSelectedCohortId('');
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

    const pricingMode = getCoursePricingMode(course.id);
    const selectedPlan = pricingMode === 'tiered' ? getTrainingPlan(selectedPlanId) : null;

    if (pricingMode === 'tiered' && !selectedPlan) {
      setErrorMessage('Please select a valid training plan before continuing.');
      return;
    }

    // Path 1: Self-Funded via Paystack Instant Online Checkout
    if (fundingType === 'self' && selfPaymentMethod === 'paystack') {
      setIsSubmitting(true);
      startLoading('Connecting to Paystack...');

      try {
        // Step 1: Backend Paystack Initialize
        // Note: Frontend sends ONLY trusted student details & courseId.
        // The authoritative amount is strictly determined server-side from canonical course catalog.
        const callbackUrl = typeof window !== 'undefined'
          ? `${window.location.origin}/payment/callback?courseId=${encodeURIComponent(course.id)}`
          : undefined;

        const initRes = await initializePaystackPayment({
          courseId: course.id,
          planId: selectedPlan?.id,
          cohortId: pricingMode === 'tiered' ? selectedCohortId : undefined,
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
          stopLoading();
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
            stopLoading();
            setErrorMessage('Payment was cancelled. You can try again whenever you are ready.');
          },
          onError: (err) => {
            setIsSubmitting(false);
            stopLoading();
            setErrorMessage(err || 'Failed to open payment gateway.');
          }
        });
      } catch (err: any) {
        console.error('Enrollment initialization error:', err);
        setErrorMessage(cleanErrorMessage(err?.message) || 'A network error occurred while initializing checkout.');
        setIsSubmitting(false);
        stopLoading();
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
        className="fixed inset-0 bg-[#0F1535]/80 backdrop-blur-sm transition-opacity"
        onClick={handleResetAndClose}
      />

      {/* Modal Card with Unified Retro Design Language */}
      <div className="relative w-full max-w-xl bg-[#FFFDF9] border-2 border-[#1A1D4F] rounded-2xl shadow-retro-lg overflow-hidden z-10 my-8 text-left animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Ribbon */}
        <div className="bg-[#F8F9FE] p-6 sm:p-7 border-b-2 border-[#1A1D4F] relative">
          <button
            onClick={handleResetAndClose}
            className="absolute top-5 right-5 p-1.5 rounded-lg border-2 border-[#1A1D4F] bg-white text-[#1A1D4F] hover:bg-[#FFF6EC] shadow-retro-sm transition-transform active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>

          <div className="flex items-center gap-2 mb-2.5">
            <StickerLabel color="bg-[#5B5FED]" textColor="text-white" rotate={-1}>
              ✦ Admissions Portal
            </StickerLabel>
            <span className="text-xs font-black px-2 py-0.5 rounded border border-[#1A1D4F] bg-[#FFF6EC] text-[#FF8A65]">
              {course.badge}
            </span>
          </div>

          <h2 className="font-display font-black text-2xl sm:text-3xl text-[#1A1D4F] tracking-tight">
            Enroll in {course.title}
          </h2>

          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-[#1A1D4F]/70 mt-2 font-mono">
            <span className="flex items-center gap-1 text-[#5B5FED]">
              <Calendar className="w-3.5 h-3.5" /> Next Cohort: {course.nextCohortDate}
            </span>
            <span>&bull;</span>
            <span className="text-[#10B981] font-black">{course.tuition} Tuition</span>
            <span>&bull;</span>
            <span className="text-[#FF8A65]">{course.seatsRemaining} Seats Remaining</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 max-h-[75vh] overflow-y-auto space-y-6">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-500 text-xs text-rose-900 flex items-start gap-3 shadow-retro-sm">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-black text-rose-900">{errorMessage}</span>
                <p className="text-[11px] text-rose-700">
                  Your information has been preserved. You can click &quot;Submit Enrollment &amp; Pay&quot; to try again.
                </p>
              </div>
            </div>
          )}

          {isApplicationSubmitted ? (
            /* Application Submitted / Alternative Checkout View */
            <div className="text-center py-4 space-y-5">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#D1F2D9] border-2 border-[#1A1D4F] shadow-retro flex items-center justify-center text-[#10B981]">
                <GraduationCap className="w-7 h-7 text-[#1A1D4F]" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-[#1A1D4F]">Application Received!</h3>
                <p className="text-xs sm:text-sm text-[#1A1D4F]/80 max-w-md mx-auto">
                  Thank you, <strong className="text-[#5B5FED]">{fullName}</strong>. Our admissions team has reserved a provisional seat for you in the <strong className="text-[#1A1D4F]">{course.title}</strong> cohort.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8F9FE] border-2 border-[#1A1D4F] shadow-retro-sm text-left space-y-2 text-xs font-mono text-[#1A1D4F]">
                <div className="flex justify-between">
                  <span className="text-[#1A1D4F]/60">Applicant:</span>
                  <span className="font-bold">{fullName} ({email})</span>
                </div>
                {phone && (
                  <div className="flex justify-between">
                    <span className="text-[#1A1D4F]/60">Phone:</span>
                    <span className="font-bold">{phone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#1A1D4F]/60">Course Track:</span>
                  <span className="font-bold">{course.track}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#1A1D4F]/60">Payment Option:</span>
                  <span className="font-bold capitalize">{fundingType}</span>
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
                  <div className="text-xs font-black uppercase text-[#1A1D4F]">
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
                      className="px-4 py-3 rounded-xl bg-white border-2 border-[#1A1D4F] text-[#1A1D4F] text-xs font-bold inline-flex items-center justify-center gap-2 shadow-retro-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                    >
                      <span>🇺🇸 Global Admissions Desk</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#5B5FED]" />
                    </a>
                    <a
                      href={getWhatsAppUrl(
                        'ng',
                        `Hello Vixora Admissions! I submitted an application for "${course.title}". My name is ${fullName} (${email}). Plan: ${fundingType}.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-3 rounded-xl bg-white border-2 border-[#1A1D4F] text-[#1A1D4F] text-xs font-bold inline-flex items-center justify-center gap-2 shadow-retro-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                    >
                      <span>🇳🇬 Nigeria (08114542934)</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#5B5FED]" />
                    </a>
                  </div>
                </div>
              )}

              <TactileButton
                variant="outline"
                size="md"
                className="w-full"
                onClick={handleResetAndClose}
              >
                Close Window
              </TactileButton>
            </div>
          ) : (
            /* Streamlined 3-Field Enrollment Form */
            <form onSubmit={handleFormSubmit} className="space-y-5">
              
              {/* Field 1: Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase text-[#1A1D4F] tracking-wide">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#5B5FED]" /> Full Name <span className="text-[#5B5FED]">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  required
                  disabled={isSubmitting}
                  placeholder="e.g. Alex Morgan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-[#1A1D4F] text-[#1A1D4F] font-bold text-sm outline-none transition-all placeholder:text-[#1A1D4F]/35 shadow-retro-sm focus:border-[#5B5FED] disabled:opacity-60"
                />
              </div>

              {/* Field 2: Email Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase text-[#1A1D4F] tracking-wide">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#5B5FED]" /> Email Address <span className="text-[#5B5FED]">*</span>
                  </span>
                </label>
                <input
                  type="email"
                  required
                  disabled={isSubmitting}
                  placeholder="alex@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-[#1A1D4F] text-[#1A1D4F] font-bold text-sm outline-none transition-all placeholder:text-[#1A1D4F]/35 shadow-retro-sm focus:border-[#5B5FED] disabled:opacity-60"
                />
              </div>

              {/* Field 3: Phone Number */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase text-[#1A1D4F] tracking-wide">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#10B981]" /> Phone / WhatsApp Number
                  </span>
                </label>
                <input
                  type="tel"
                  disabled={isSubmitting}
                  placeholder="+234 811 454 2934"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-[#1A1D4F] text-[#1A1D4F] font-bold text-sm outline-none transition-all placeholder:text-[#1A1D4F]/35 shadow-retro-sm focus:border-[#5B5FED] disabled:opacity-60"
                />
              </div>

              {/* Course-specific training plan selection */}
              {getCoursePricingMode(course.id) === 'tiered' && (
                <div className="space-y-2.5 pt-2 border-t-2 border-[#1A1D4F]/10">
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-xs font-black uppercase text-[#1A1D4F]">Choose Training Plan</label>
                    <span className="text-[11px] font-bold text-[#5B5FED]">Your plan controls the checkout price</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5">
                    {getCourseTrainingPlans(course.id).map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={"text-left p-3 rounded-xl border-2 transition-all " + (selectedPlanId === plan.id ? 'bg-[#EEF2FF] border-[#5B5FED] shadow-retro-sm' : 'bg-white border-[#1A1D4F]/25 hover:border-[#1A1D4F]') + (isSubmitting ? ' opacity-60 cursor-not-allowed' : ' cursor-pointer')}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-[#1A1D4F]">{plan.name}</span>
                              {plan.badge && <span className="text-[9px] font-black uppercase bg-[#FFC107] px-1.5 py-0.5 rounded border border-[#1A1D4F]">{plan.badge}</span>}
                            </div>
                            <p className="text-[11px] text-[#1A1D4F]/70 mt-0.5">{plan.description}</p>
                          </div>
                          <span className="shrink-0 text-base font-black text-[#10B981]">₦{plan.priceNGN.toLocaleString()}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

\n              {getCoursePricingMode(course.id) === 'tiered' && (\n                <div className="space-y-2.5 pt-2 border-t-2 border-[#1A1D4F]/10">\n                  <div className="flex items-center justify-between gap-3">\n                    <label className="text-xs font-black uppercase text-[#1A1D4F]">Choose Cohort</label>\n                    <span className="text-[11px] font-bold text-[#5B5FED]">Secure your start date</span>\n                  </div>\n                  {isLoadingCohorts ? (\n                    <div className="p-3 rounded-xl bg-[#F8F9FE] border-2 border-[#1A1D4F]/15 text-xs font-bold text-[#1A1D4F]/70">Loading available cohorts...</div>\n                  ) : availableCohorts.length ? (\n                    <div className="grid grid-cols-1 gap-2.5">\n                      {availableCohorts.map((cohort) => (\n                        <button key={cohort.id} type="button" disabled={isSubmitting || cohort.seatsRemaining < 1} onClick={() => setSelectedCohortId(cohort.id)} className={"text-left p-3 rounded-xl border-2 transition-all " + (selectedCohortId === cohort.id ? 'bg-[#EEF2FF] border-[#5B5FED] shadow-retro-sm' : 'bg-white border-[#1A1D4F]/25 hover:border-[#1A1D4F]')}>\n                          <div className="flex items-center justify-between gap-3">\n                            <div>\n                              <div className="text-sm font-black text-[#1A1D4F]">{cohort.name}{cohort.code ? ` • ${cohort.code}` : ''}</div>\n                              <div className="text-[11px] text-[#1A1D4F]/70 mt-0.5">\n                                {cohort.startDate ? new Date(cohort.startDate).toLocaleDateString() : 'Start date TBA'}\n                                {cohort.endDate ? ` – ${new Date(cohort.endDate).toLocaleDateString()}` : ''}\n                              </div>\n                            </div>\n                            <span className="shrink-0 text-xs font-black text-[#10B981]">{cohort.seatsRemaining} seat{cohort.seatsRemaining === 1 ? '' : 's'} left</span>\n                          </div>\n                        </button>\n                      ))}\n                    </div>\n                  ) : (\n                    <div className="p-3 rounded-xl bg-amber-50 border-2 border-[#FFC107] text-xs font-bold text-[#1A1D4F]">No open cohorts are currently available for this plan.</div>\n                  )}\n                </div>\n              )}\n
              {/* Tuition & Payment Preference Selection */}
              <div className="space-y-2.5 pt-2 border-t-2 border-[#1A1D4F]/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase text-[#1A1D4F]">
                    Payment Preference
                  </label>
                  <span className="text-xs font-mono text-[#10B981] font-black bg-[#D1F2D9] px-2 py-0.5 rounded border border-[#10B981]">
                    Tuition: {selectedPlan ? `₦${selectedPlan.priceNGN.toLocaleString()}` : course.tuition}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div
                    onClick={() => !isSubmitting && setFundingType('self')}
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                      fundingType === 'self'
                        ? 'bg-[#EEF2FF] border-[#5B5FED] shadow-retro-sm text-[#1A1D4F]'
                        : 'bg-white border-[#1A1D4F]/30 hover:border-[#1A1D4F] text-[#1A1D4F]/70'
                    } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <CreditCard className="w-4 h-4 text-[#5B5FED]" />
                      <span className="text-xs font-black text-[#1A1D4F]">Self-Funded</span>
                    </div>
                    <p className="text-[11px] leading-tight text-[#1A1D4F]/75">
                      Instant online checkout &amp; seat confirmation.
                    </p>
                  </div>

                  <div
                    onClick={() => !isSubmitting && setFundingType('installments')}
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                      fundingType === 'installments'
                        ? 'bg-[#EEF2FF] border-[#5B5FED] shadow-retro-sm text-[#1A1D4F]'
                        : 'bg-white border-[#1A1D4F]/30 hover:border-[#1A1D4F] text-[#1A1D4F]/70'
                    } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-4 h-4 text-[#FF8A65]" />
                      <span className="text-xs font-black text-[#1A1D4F]">Installments</span>
                    </div>
                    <p className="text-[11px] leading-tight text-[#1A1D4F]/75">
                      Flexible monthly milestone schedule.
                    </p>
                  </div>

                  <div
                    onClick={() => !isSubmitting && setFundingType('employer')}
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                      fundingType === 'employer'
                        ? 'bg-[#EEF2FF] border-[#5B5FED] shadow-retro-sm text-[#1A1D4F]'
                        : 'bg-white border-[#1A1D4F]/30 hover:border-[#1A1D4F] text-[#1A1D4F]/70'
                    } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Building2 className="w-4 h-4 text-[#FFC107]" />
                      <span className="text-xs font-black text-[#1A1D4F]">Employer Invoice</span>
                    </div>
                    <p className="text-[11px] leading-tight text-[#1A1D4F]/75">
                      Corporate invoice &amp; L&amp;D sponsorship.
                    </p>
                  </div>
                </div>

                {fundingType === 'self' && (
                  <div className="pt-2 space-y-2.5">
                    <div className="flex rounded-xl bg-white p-1 border-2 border-[#1A1D4F] shadow-retro-sm">
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => setSelfPaymentMethod('paystack')}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          selfPaymentMethod === 'paystack'
                            ? 'bg-[#10B981] text-white shadow-sm'
                            : 'text-[#1A1D4F]/70 hover:text-[#1A1D4F]'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Instant Online (Paystack)</span>
                      </button>
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => setSelfPaymentMethod('bank_transfer')}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          selfPaymentMethod === 'bank_transfer'
                            ? 'bg-[#5B5FED] text-white shadow-sm'
                            : 'text-[#1A1D4F]/70 hover:text-[#1A1D4F]'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Direct Bank Transfer</span>
                      </button>
                    </div>

                    {selfPaymentMethod === 'paystack' && (
                      <div className="p-3 rounded-xl bg-[#D1F2D9]/40 border-2 border-[#10B981] text-xs text-[#1A1D4F] space-y-1 font-mono">
                        <div className="flex items-center justify-between text-[#1A1D4F] font-bold font-sans">
                          <span className="flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-[#10B981]" /> Paystack Multi-Channel Gateway
                          </span>
                          <span className="text-[#10B981] font-black">{selectedPlan ? `₦${selectedPlan.priceNGN.toLocaleString()}` : course.tuition}</span>
                        </div>
                        <p className="text-[11px] text-[#1A1D4F]/75 font-sans">
                          Supports Debit/Credit Cards, Bank Transfer, USSD, Apple Pay &amp; Mobile Money.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Active Loading Feedback Banner */}
              {isSubmitting && (
                <div className="p-3 rounded-xl bg-purple-50 border-2 border-purple-200 flex items-center gap-3 animate-in fade-in duration-150">
                  <div className="relative flex items-center justify-center shrink-0">
                    <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                    <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-purple-600" />
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-bold text-purple-950">Connecting to Secure Paystack Gateway...</p>
                    <p className="text-[11px] text-purple-700">Securing your cohort seat for {course.nextCohortDate}...</p>
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t-2 border-[#1A1D4F]/10">
                <div className="flex items-center gap-1.5 text-xs text-[#1A1D4F]/70 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>256-bit encrypted &bull; Verified Paystack security</span>
                </div>

                <div className="flex gap-2.5 w-full sm:w-auto">
                  <TactileButton
                    variant="outline"
                    size="md"
                    disabled={isSubmitting}
                    onClick={handleResetAndClose}
                    className="flex-1 sm:flex-initial"
                  >
                    Cancel
                  </TactileButton>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-sm font-black border-2 border-[#1A1D4F] bg-[#FFC107] hover:bg-[#ffb700] text-[#1A1D4F] shadow-retro hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-retro-sm active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#1A1D4F]" />
                        <span>Connecting to Paystack...</span>
                      </>
                    ) : fundingType === 'self' && selfPaymentMethod === 'paystack' ? (
                      <>
                        <span>Submit Enrollment &amp; Pay</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span>Submit Application</span>
                        <ArrowRight className="w-4 h-4" />
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
