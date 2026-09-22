import { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  Printer,
  GraduationCap,
  Copy,
  Check,
  ArrowLeft,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { verifyPaystackPayment, VerifiedPaymentData } from '../lib/paystack';
import { getWhatsAppUrl, BRAND_CONFIG } from '../data/brandConfig';

interface PaymentCallbackPageProps {
  onNavigateHome?: () => void;
  onNavigateToPortal?: () => void;
}

export function PaymentCallbackPage({
  onNavigateHome,
  onNavigateToPortal
}: PaymentCallbackPageProps) {
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [payment, setPayment] = useState<VerifiedPaymentData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get('reference') || params.get('trxref');

    if (!reference) {
      setLoading(false);
      setErrorMessage('No payment reference found in callback URL.');
      return;
    }

    let isMounted = true;

    async function checkVerification(ref: string) {
      try {
        const res = await verifyPaystackPayment(ref);
        if (!isMounted) return;

        if (res.verified && res.payment) {
          setVerified(true);
          setPayment(res.payment);
        } else {
          setVerified(false);
          setErrorMessage(res.error || res.message || 'Payment could not be verified on Paystack.');
        }
      } catch (err: any) {
        if (!isMounted) return;
        setVerified(false);
        setErrorMessage(err.message || 'Failed to verify transaction.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    checkVerification(reference);

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCopyRef = () => {
    if (payment?.reference) {
      navigator.clipboard.writeText(payment.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between py-12 px-4 sm:px-6">
      <div className="max-w-xl mx-auto w-full">
        {/* Top Brand Tag */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Vixora Academy Admissions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Payment Verification</h1>
        </div>

        {/* State 1: Loading Verification */}
        {loading && (
          <div className="p-8 sm:p-12 rounded-3xl bg-neutral-900 border border-purple-900/40 text-center space-y-4 shadow-2xl">
            <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto" />
            <h2 className="text-lg sm:text-xl font-bold text-white">Verifying Transaction with Paystack...</h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              Please wait while our admissions server securely verifies your payment with the Paystack network.
            </p>
          </div>
        )}

        {/* State 2: Verified Success */}
        {!loading && verified && payment && (
          <div className="rounded-3xl bg-neutral-900 border border-emerald-500/50 overflow-hidden shadow-2xl shadow-emerald-950/40">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-950/80 via-neutral-900 to-purple-950/80 p-6 sm:p-8 border-b border-emerald-900/40 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-white">Payment Confirmed!</h2>
              <p className="text-xs text-emerald-300 font-mono mt-1">
                Official Tuition Receipt &bull; Paystack Verified
              </p>
            </div>

            {/* Receipt Body */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="p-5 rounded-2xl bg-neutral-950/90 border border-neutral-800 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2.5">
                  <span className="text-neutral-400">Reference:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold">{payment.reference}</span>
                    <button
                      onClick={handleCopyRef}
                      className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                      title="Copy Reference"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2.5">
                  <span className="text-neutral-400">Amount Paid:</span>
                  <span className="text-base font-bold text-emerald-400 font-sans">
                    {payment.currency} {payment.amount.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2.5">
                  <span className="text-neutral-400">Student Name:</span>
                  <span className="text-white font-semibold font-sans">{payment.studentName}</span>
                </div>

                <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2.5">
                  <span className="text-neutral-400">Student Email:</span>
                  <span className="text-white">{payment.studentEmail}</span>
                </div>

                <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2.5">
                  <span className="text-neutral-400">Course Track:</span>
                  <span className="text-purple-300 font-bold font-sans">{payment.courseTitle}</span>
                </div>

                <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2.5">
                  <span className="text-neutral-400">Channel:</span>
                  <span className="text-neutral-200 capitalize font-sans">{payment.channel}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Timestamp:</span>
                  <span className="text-neutral-300">{new Date(payment.paidAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <a
                  href={getWhatsAppUrl(
                    'ng',
                    `Hello Vixora Admissions! I just completed my tuition payment of ${payment.currency} ${payment.amount.toLocaleString()} for ${payment.courseTitle} via Paystack. Reference: ${payment.reference}. My email is ${payment.studentEmail}.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <span>💬 Join Admissions WhatsApp Cohort Desk</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Receipt</span>
                  </button>

                  {onNavigateToPortal ? (
                    <button
                      type="button"
                      onClick={onNavigateToPortal}
                      className="py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Student Portal</span>
                    </button>
                  ) : (
                    <a
                      href="/pages/student-portal"
                      className="py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all text-center"
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Student Portal</span>
                    </a>
                  )}
                </div>

                <div className="text-center pt-2">
                  {onNavigateHome ? (
                    <button
                      type="button"
                      onClick={onNavigateHome}
                      className="text-xs text-neutral-400 hover:text-white transition-colors"
                    >
                      &larr; Return to Academy Homepage
                    </button>
                  ) : (
                    <a href="/pages/academy" className="text-xs text-neutral-400 hover:text-white transition-colors">
                      &larr; Return to Academy Homepage
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* State 3: Failure or Not Found */}
        {!loading && (!verified || !payment) && (
          <div className="p-8 sm:p-10 rounded-3xl bg-neutral-900 border border-rose-900/50 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Payment Verification Incomplete</h2>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-md mx-auto">
                {errorMessage || 'The transaction could not be confirmed. If you were debited, please contact our admissions team with your transaction reference.'}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={getWhatsAppUrl('ng', 'Hello Vixora Admissions, I attempted payment via Paystack and need assistance verifying my transaction.')}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <span>Admissions Support on WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {onNavigateHome ? (
                <button
                  type="button"
                  onClick={onNavigateHome}
                  className="py-3 px-5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-all"
                >
                  Back to Academy
                </button>
              ) : (
                <a
                  href="/pages/academy"
                  className="py-3 px-5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-all"
                >
                  Back to Academy
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-neutral-500 mt-8 font-mono">
        Vixora Digital Hub Admissions &bull; Paystack Certified Integration &bull; 256-bit SSL Security
      </div>
    </div>
  );
}
