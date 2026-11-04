import { TESTIMONIALS } from '../data/vixoraContent';
import { Star } from 'lucide-react';

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-white border-t border-[#E5E5F0] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs font-semibold tracking-wider text-[#480878] uppercase mb-2">
            Client Perspectives
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#000048] tracking-tight" style={{ color: '#000048' }}>What Leaders Say About Vixora</h2>
          <p className="mt-2 text-sm sm:text-base text-[#5F6078]" style={{ color: '#475569' }}>Real feedback from brand founders, consumer goods executives, and automotive leaders we partner with.</p>
        </div>

        {/* Asymmetric Proof Bento Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Marquee Featured Testimonial (Span 7) */}
          <div className="lg:col-span-7 p-8 sm:p-9 rounded-2xl bg-[#F7F7FC] border border-[#E5E5F0] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[#7000F8]">
                  {[...Array(TESTIMONIALS[0].rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#7000F8]" />
                  ))}
                </div>
                <span className="text-xs font-mono font-medium text-[#480878] uppercase tracking-wider">
                  {TESTIMONIALS[0].industry}
                </span>
              </div>
              <blockquote className="text-base sm:text-lg text-[#000048] leading-relaxed font-medium">
                "{TESTIMONIALS[0].quote}"
              </blockquote>
            </div>

            <div className="pt-6 border-t border-[#E5E5F0] flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-[#480878] flex items-center justify-center text-white font-bold text-sm">
                {TESTIMONIALS[0].author.charAt(0)}
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#000048]">{TESTIMONIALS[0].author}</h3>
                <p className="text-xs text-[#5F6078]">
                  {TESTIMONIALS[0].role}, <span className="text-[#000048] font-medium">{TESTIMONIALS[0].company}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Secondary Testimonials Stack (Span 5) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-5">
            {TESTIMONIALS.slice(1).map((t) => (
              <div
                key={t.id}
                className="p-6 rounded-2xl bg-white border border-[#E5E5F0] flex flex-col justify-between space-y-4 shadow-sm hover:border-[#480878]/30 transition-all flex-1"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[#7000F8]">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#7000F8]" />
                      ))}
                    </div>
                    <span className="text-[11px] font-mono text-[#5F6078]">{t.industry}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#5F6078] leading-relaxed">
                    "{t.quote}"
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E5E5F0] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#480878]/10 text-[#480878] flex items-center justify-center font-bold text-xs">
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#000048]">{t.author}</h3>
                    <p className="text-[11px] text-[#5F6078]">
                      {t.role}, <span className="text-[#000048] font-medium">{t.company}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
