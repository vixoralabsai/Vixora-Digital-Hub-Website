import React from 'react';
import { Check, ArrowRight, ShieldCheck, Users, UserRound, Crown } from 'lucide-react';
import { AcademyCourse } from '../../data/vixoraContent';
import { TRAINING_PLANS, TrainingPlanId, formatTrainingPlanPrice } from '../../data/trainingPlans';
import { StickerLabel, TactileButton } from './CourseVisualDecorations';

interface CoursePricingSectionProps {
  course: AcademyCourse;
  onEnroll: (planId: TrainingPlanId) => void;
}

const planIcons = {
  group: Users,
  'small-group': UserRound,
  private: Crown
};

export const CoursePricingSection: React.FC<CoursePricingSectionProps> = ({
  course,
  onEnroll
}) => {
  const [seatCounts, setSeatCounts] = React.useState<Record<TrainingPlanId, number | null>>({
    group: null,
    'small-group': null,
    private: null
  });

  React.useEffect(() => {
    let cancelled = false;

    const loadSeats = async () => {
      try {
        const response = await fetch(`/api/academy/cohort/availability?courseId=${encodeURIComponent(course.id)}`);
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled && data?.seats) {
          setSeatCounts(data.seats);
        }
      } catch {
        // Availability is supplementary UI; checkout remains server-authoritative.
      }
    };

    loadSeats();
    return () => {
      cancelled = true;
    };
  }, [course.id]);

  return (
    <section
      id="pricing"
      className="bg-[#FFFDF9] text-[#1A1D4F] border-y-2 border-[#1A1D4F] py-20 lg:py-28 relative overflow-hidden text-left"
    >
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#5B5FED]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#FFC107]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <StickerLabel color="bg-[#FFC107]" textColor="text-[#1A1D4F]" rotate={-2}>
            ✦ Choose Your Training Experience
          </StickerLabel>

          <h2 className="mt-4 font-display font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight">
            Learn the same skill. Choose the level of support you need.
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#1A1D4F]/70 max-w-2xl mx-auto">
            {course.title} is available through three Vixora Academy training experiences.
            Pick the option that matches your preferred learning environment and level of guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {(Object.keys(TRAINING_PLANS) as TrainingPlanId[]).map((planId) => {
            const plan = TRAINING_PLANS[planId];
            const Icon = planIcons[planId];
            const isPopular = planId === 'small-group';

            return (
              <article
                key={plan.id}
                className={[
                  'relative flex flex-col rounded-3xl border-2 border-[#1A1D4F] bg-white p-6 sm:p-7 shadow-retro-lg',
                  isPopular ? 'lg:-translate-y-3 ring-4 ring-[#5B5FED]/15' : ''
                ].join(' ')}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-[#5B5FED] text-white text-[11px] font-black uppercase tracking-wide border-2 border-[#1A1D4F]">
                    {plan.badge}
                  </div>
                )}

                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <div className="w-11 h-11 rounded-2xl bg-[#EEF2FF] border-2 border-[#5B5FED]/30 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#5B5FED]" />
                    </div>
                    <h3 className="mt-4 text-xl font-black">{plan.name}</h3>
                    <p className="mt-1 text-xs text-[#1A1D4F]/60 font-semibold">
                      {plan.supportLevel}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-display font-black text-[#1A1D4F]">
                      {formatTrainingPlanPrice(planId)}
                    </div>
                    <div className="text-[11px] font-bold text-[#1A1D4F]/50">
                      one-time tuition
                    </div>
                  </div>
                </div>

                <p className="text-sm leading-6 text-[#1A1D4F]/75 min-h-[72px]">
                  {plan.description}
                </p>

                <div className="mt-5 p-3 rounded-xl bg-[#F8F9FE] border border-[#1A1D4F]/15 text-xs font-bold">
                  {seatCounts[planId] !== null
                    ? seatCounts[planId] === 0
                      ? 'Currently full — join the waitlist'
                      : `${seatCounts[planId]} spot${seatCounts[planId] === 1 ? '' : 's'} remaining`
                    : plan.capacity === 1
                      ? '1 learner per private slot'
                      : plan.capacity <= 5
                        ? `Maximum ${plan.capacity} learners`
                        : `Up to ${plan.capacity} learners per cohort`}
                </div>

                <div className="mt-5 space-y-2.5 flex-1">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2 text-sm font-semibold">
                      <span className="w-4 h-4 rounded-full bg-[#D1F2D9] border border-[#10B981] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-[#10B981] stroke-[3]" />
                      </span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-7">
                  <TactileButton
                    variant={isPopular ? 'primary' : 'outline'}
                    size="lg"
                    onClick={() => onEnroll(planId)}
                    className="w-full justify-center"
                  >
                    <span>{plan.cta}</span>
                    <ArrowRight className="w-5 h-5" />
                  </TactileButton>
                </div>

                <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#1A1D4F]/55">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                  Secure enrollment • Paystack available
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
