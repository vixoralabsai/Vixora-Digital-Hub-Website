import { TESTIMONIALS } from '../data/vixoraContent';
import { Star, Quote, ShieldCheck } from 'lucide-react';

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-neutral-900/30 border-t border-neutral-850 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 mb-3">
            <span>CLIENT PERSPECTIVES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-100 tracking-tight">
            What Leaders Say About Vixora
          </h2>
          <p className="mt-2 text-sm sm:text-base text-neutral-400">
            Real feedback from healthcare executives, retail operators, and investment leaders we partner with.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="p-7 rounded-2xl bg-neutral-900 border border-neutral-800/90 flex flex-col justify-between space-y-6 shadow-xl relative group hover:border-neutral-700 transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400 px-2 py-0.5 rounded bg-neutral-800">
                    {t.industry}
                  </span>
                </div>

                <p className="text-sm text-neutral-300 leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  {t.author.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {t.author}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    {t.role}, <span className="text-neutral-300">{t.company}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
