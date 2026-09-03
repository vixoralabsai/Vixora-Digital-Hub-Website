import { useState } from 'react';
import { Copy, Check, Building2, CreditCard, ShieldCheck } from 'lucide-react';
import { BANK_PAYMENT_DETAILS } from '../data/vixoraContent';

interface BankPaymentDetailsCardProps {
  courseTitle?: string;
  tuitionAmount?: string;
  className?: string;
}

export function BankPaymentDetailsCard({
  courseTitle,
  tuitionAmount = '₦60,000',
  className = ''
}: BankPaymentDetailsCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(BANK_PAYMENT_DETAILS.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className={`rounded-3xl bg-gradient-to-b from-[#1E113E] to-[#0F0724] border-2 border-purple-500/50 p-6 sm:p-7 shadow-2xl shadow-purple-950/60 text-left space-y-4 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-800/40 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Direct Bank Transfer Option</h4>
            <p className="text-[11px] font-mono text-purple-300">Instant manual verification via Admissions WhatsApp</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
          <ShieldCheck className="w-3 h-3" />
          <span>Official Corporate Account</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Bank Name */}
        <div className="p-3.5 rounded-2xl bg-purple-950/70 border border-purple-800/50">
          <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Bank</div>
          <div className="text-sm sm:text-base font-black text-white mt-0.5">{BANK_PAYMENT_DETAILS.bankName}</div>
        </div>

        {/* Account Name */}
        <div className="p-3.5 rounded-2xl bg-purple-950/70 border border-purple-800/50">
          <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Account Name</div>
          <div className="text-xs sm:text-sm font-black text-amber-300 mt-0.5">{BANK_PAYMENT_DETAILS.accountName}</div>
        </div>

        {/* Account Number with Copy */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/60 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-amber-300">Account Number</div>
            <div className="text-base sm:text-lg font-mono font-black text-white tracking-wider mt-0.5">
              {BANK_PAYMENT_DETAILS.accountNumber}
            </div>
          </div>
          <button
            onClick={handleCopyAccount}
            className="p-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold transition-all active:scale-95 flex items-center gap-1 cursor-pointer shrink-0 shadow-md"
            title="Copy account number"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-neutral-950" />
                <span className="text-[10px] font-mono hidden xs:inline">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span className="text-[10px] font-mono hidden xs:inline">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-neutral-950/60 border border-purple-900/40 text-xs text-neutral-300 flex items-start gap-2">
        <span className="text-amber-400 font-bold text-sm leading-none mt-0.5">📌</span>
        <span>
          After making payment ({tuitionAmount}{courseTitle ? ` for ${courseTitle}` : ''}), send your transaction receipt/screenshot to our WhatsApp Admissions Desk for instant enrolment receipt and cohort onboarding.
        </span>
      </div>
    </div>
  );
}
