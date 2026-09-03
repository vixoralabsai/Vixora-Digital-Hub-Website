import { ArrowRight, MessageSquare, Sparkles, ShieldCheck, PhoneCall } from 'lucide-react';
import { WhatsAppContactButton } from './WhatsAppContactButton';

interface CallToActionProps {
  onOpenProjectModal: () => void;
}

export function CallToAction({ onOpenProjectModal }: CallToActionProps) {
  return (
    <section className="py-24 bg-neutral-950 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/20 to-neutral-950 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-600/15 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="p-8 sm:p-14 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-2xl backdrop-blur-xl text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-neutral-950 border border-neutral-800 text-blue-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready to Scale Your Digital Infrastructure?</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-neutral-100 tracking-tight leading-tight max-w-3xl mx-auto">
            Let’s Engineer Your Next Competitive Advantage
          </h2>

          <p className="text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto">
            Whether you need custom enterprise software, autonomous AI agent pipelines, high-converting media, or company-wide training—our engineering team is ready to deploy.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              onClick={onOpenProjectModal}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Start Your Project Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <WhatsAppContactButton
              variant="secondary"
              label="Instant WhatsApp Discussion (US & Nigeria)"
              message="Hello Vixora Hub Engineering Team, I would like to schedule a project consultation."
              className="w-full sm:w-auto"
            />
          </div>

          <div className="pt-6 border-t border-neutral-800/80 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>100% Code & IP Ownership</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Guaranteed Milestone Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>24/7 Post-Launch Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
