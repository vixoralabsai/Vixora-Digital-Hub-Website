const BUSINESS_METRICS = [
  {
    value: "15+",
    label: "Projects Completed",
    subtext: "Successfully delivered digital projects for clients.",
    highlight: "Proven Delivery"
  },
  {
    value: "8",
    label: "Businesses Served",
    subtext: "Businesses supported with digital solutions and services.",
    highlight: "Client Experience"
  },
  {
    value: "3",
    label: "Industries Served",
    subtext: "Experience delivering solutions across multiple business sectors.",
    highlight: "Industry Reach"
  }
];

export function BusinessMetrics() {
  return (
    <section className="py-20 bg-neutral-900/40 border-y border-neutral-850 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 mb-3">
            <span>OUR TRACK RECORD</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-100 tracking-tight">
            Proven Scale in Numbers
          </h2>
          <p className="mt-2 text-sm sm:text-base text-neutral-400">
            A snapshot of the businesses, projects, and industries Vixora has served.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {BUSINESS_METRICS.map((metric, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 text-center space-y-2 relative overflow-hidden group hover:border-neutral-700 transition-all shadow-lg"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-blue-500/10 transition-all" />

              <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-cyan-300 font-mono">
                {metric.value}
              </div>

              <h3 className="text-sm font-bold text-white tracking-tight">
                {metric.label}
              </h3>

              <p className="text-[11px] text-neutral-400 leading-snug">
                {metric.subtext}
              </p>

              <div className="pt-2">
                <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-750">
                  {metric.highlight}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
