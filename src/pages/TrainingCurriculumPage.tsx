import { useState, useMemo } from 'react';
import {
  GraduationCap,
  BookOpen,
  Search,
  CheckCircle2,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Award,
  Terminal,
  Cpu,
  Layers,
  FileCheck2,
  Check
} from 'lucide-react';
import { TRAINING_COURSES, TrainingCourse, CurriculumWeek } from '../data/trainingCurriculumData';

interface TrainingCurriculumPageProps {
  onNavigateHome: () => void;
  onNavigateAcademy: () => void;
  onNavigateStudentPortal: () => void;
}

export function TrainingCurriculumPage({
  onNavigateAcademy,
  onNavigateStudentPortal
}: TrainingCurriculumPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Programs');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedCourseId, setExpandedCourseId] = useState<string>(TRAINING_COURSES[0].id);
  const [expandedWeeks, setExpandedWeeks] = useState<{ [key: string]: boolean }>({
    [`${TRAINING_COURSES[0].id}-w1`]: true,
    [`${TRAINING_COURSES[0].id}-w2`]: true
  });

  const categories = [
    'All Programs',
    'AI & Automation',
    'Virtual Assistance',
    'Web Development',
    'Content Creation',
    'Data Science & ML',
    'Data Analysis'
  ];

  const toggleWeek = (courseId: string, weekNum: number) => {
    const key = `${courseId}-w${weekNum}`;
    setExpandedWeeks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleAllWeeksForCourse = (course: TrainingCourse, expand: boolean) => {
    const nextState = { ...expandedWeeks };
    course.weeks.forEach(w => {
      nextState[`${course.id}-w${w.weekNumber}`] = expand;
    });
    setExpandedWeeks(nextState);
  };

  // Filter courses based on Category and Search Query
  const filteredCourses = useMemo(() => {
    let result = TRAINING_COURSES;

    if (selectedCategory !== 'All Programs') {
      result = result.filter(c => c.category === selectedCategory);
    }

    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(c => {
        const inTitle = c.title.toLowerCase().includes(query);
        const inTagline = c.tagline.toLowerCase().includes(query);
        const inOverview = c.overview.toLowerCase().includes(query);
        const inTools = c.toolsUsed.some(t => t.toLowerCase().includes(query));
        const inWeeks = c.weeks.some(
          w =>
            w.title.toLowerCase().includes(query) ||
            w.topics.some(tp => tp.toLowerCase().includes(query)) ||
            w.objectives.some(obj => obj.toLowerCase().includes(query)) ||
            w.handsOn.toLowerCase().includes(query) ||
            w.deliverable.toLowerCase().includes(query)
        );
        return inTitle || inTagline || inOverview || inTools || inWeeks;
      });
    }

    return result;
  }, [selectedCategory, searchQuery]);

  return (
    <div className="pt-[74px] sm:pt-[84px] pb-24 bg-[#F7F7FC] text-[#0F1535] min-h-screen selection:bg-[#5B5FED] selection:text-white">
      {/* 1. Header Banner & Global Topic Search */}
      <section className="relative bg-white border-b border-slate-200/80 overflow-hidden py-10 sm:py-16 lg:py-20">
        <div
          className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#5B5FED_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            {/* Kicker */}
            <div className="flex items-center justify-center gap-2 text-xs font-mono font-semibold tracking-wider uppercase text-[#5B5FED]">
              <GraduationCap className="w-4 h-4 text-[#5B5FED]" />
              <span>Vixora Academy · Cohort 2 Syllabus Hub</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl font-black text-[#0F1535] tracking-tight leading-tight">
              Detailed Week-by-Week Course Curricula
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-[#475569] leading-relaxed max-w-2xl mx-auto">
              Inspect complete learning outcomes, week-by-week topic roadmaps, practical hands-on labs, and portfolio project criteria for all 6 Cohort 2 programs.
            </p>

            {/* Search Input */}
            <div className="pt-2 max-w-xl mx-auto relative">
              <div className="relative flex items-center">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search topics, tools (e.g. n8n, SQL, Python, CapCut, Prompting)..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-300 focus:border-[#5B5FED] text-sm text-[#0F1535] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B5FED]/20 transition-all shadow-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 text-xs font-mono text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Quick Stats Strip */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500 font-mono">
              <span>6 Program Tracks</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>74 Total Curriculum Weeks</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>100% Practical Labs &amp; Capstones</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Content Container */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
        {/* Track Category Filter Bar */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#0F1535] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#0F1535] hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search / Filter Results Summary */}
        {filteredCourses.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-[#0F1535]">No Matching Curriculum Found</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              We couldn't find any curriculum topics matching "{searchQuery}". Try searching for terms like "SQL", "Excel", "AI", "Prompting", "Zapier", or "Python".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All Programs');
              }}
              className="mt-2 inline-flex items-center px-4 py-2 rounded-xl bg-[#5B5FED] text-white text-xs font-bold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredCourses.map(course => {
              const isCourseExpanded = expandedCourseId === course.id;

              return (
                <div
                  key={course.id}
                  id={course.slug}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden transition-all duration-200"
                >
                  {/* Course Header Summary Bar */}
                  <div
                    onClick={() => setExpandedCourseId(isCourseExpanded ? '' : course.id)}
                    className="p-6 sm:p-8 cursor-pointer select-none hover:bg-slate-50/50 transition-colors border-b border-slate-200/80"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="space-y-3 max-w-3xl">
                        {/* Eyebrow Tags */}
                        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                          <span className="font-bold uppercase tracking-wider text-[#5B5FED]">
                            {course.category}
                          </span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="text-slate-600 font-semibold">{course.durationWeeks} Weeks</span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="text-slate-600">{course.format}</span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="text-slate-600">{course.level}</span>
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl sm:text-3xl font-black text-[#0F1535] tracking-tight">
                          {course.title}
                        </h2>

                        {/* Tagline & Overview */}
                        <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                          {course.overview}
                        </p>
                      </div>

                      {/* Right Tuition & Expand Toggle */}
                      <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                        <div className="text-left lg:text-right">
                          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                            Tuition
                          </div>
                          <div className="text-2xl font-black font-mono text-[#0F1535]">
                            {course.priceDisplay}
                          </div>
                        </div>

                        <button
                          type="button"
                          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                            isCourseExpanded
                              ? 'bg-[#0F1535] text-white border-[#0F1535]'
                              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                          }`}
                          aria-label={isCourseExpanded ? 'Collapse course details' : 'Expand course details'}
                        >
                          {isCourseExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Phase Roadmap Progress Indicators */}
                    <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
                      {course.phases.map(ph => (
                        <div
                          key={ph.phaseNumber}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between font-mono text-[10px] text-[#5B5FED] font-bold uppercase tracking-wider">
                            <span>Phase {ph.phaseNumber}</span>
                            <span>{ph.weeksRange}</span>
                          </div>
                          <div className="font-bold text-[#0F1535] truncate">{ph.name}</div>
                          <div className="text-[10px] text-slate-500 line-clamp-1">{ph.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expanded Course Curriculum Body */}
                  {isCourseExpanded && (
                    <div className="p-6 sm:p-8 bg-[#F7F7FC]/50 space-y-8 animate-in fade-in duration-200">
                      {/* Learning Outcomes & Tools Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Outcomes */}
                        <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-slate-200/80 space-y-3">
                          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#5B5FED] flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-[#5B5FED]" />
                            <span>Learning Outcomes &amp; Core Capabilities</span>
                          </div>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                            {course.learningOutcomes.map((outcome, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs text-[#0F1535] leading-relaxed">
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span>{outcome}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Tools Stack */}
                        <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-slate-200/80 space-y-3 flex flex-col justify-between">
                          <div>
                            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#5B5FED] flex items-center gap-1.5 mb-3">
                              <Cpu className="w-4 h-4 text-[#5B5FED]" />
                              <span>Software &amp; Toolchain Mastered</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {course.toolsUsed.map((tool, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs font-mono font-semibold text-[#0F1535] bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/80"
                                >
                                  {tool}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
                            <span>Format: {course.format}</span>
                            <span className="text-emerald-700 font-bold">100% Hands-On</span>
                          </div>
                        </div>
                      </div>

                      {/* Week-by-Week Accordion Modules Header */}
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200/80">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#0F1535]">
                            <BookOpen className="w-4 h-4 text-[#5B5FED]" />
                            <span>Week-by-Week Syllabus Breakdown ({course.weeks.length} Modules)</span>
                          </div>

                          <div className="flex items-center gap-3 text-xs font-semibold">
                            <button
                              onClick={() => toggleAllWeeksForCourse(course, true)}
                              className="text-[#5B5FED] hover:underline cursor-pointer"
                            >
                              Expand All Weeks
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                              onClick={() => toggleAllWeeksForCourse(course, false)}
                              className="text-slate-600 hover:underline cursor-pointer"
                            >
                              Collapse All
                            </button>
                          </div>
                        </div>

                        {/* Weeks Accordion Stack */}
                        <div className="space-y-3">
                          {course.weeks.map(week => {
                            const weekKey = `${course.id}-w${week.weekNumber}`;
                            const isWeekExpanded = Boolean(expandedWeeks[weekKey]);

                            return (
                              <div
                                key={week.weekNumber}
                                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden transition-all"
                              >
                                {/* Week Accordion Toggle Header */}
                                <button
                                  type="button"
                                  onClick={() => toggleWeek(course.id, week.weekNumber)}
                                  className="w-full p-4 sm:p-5 flex items-start justify-between gap-4 text-left hover:bg-slate-50/80 transition-colors cursor-pointer select-none"
                                >
                                  <div className="space-y-1 min-w-0 pr-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-[#5B5FED]/10 text-[#5B5FED] rounded border border-[#5B5FED]/20">
                                        Week {week.weekNumber}
                                      </span>
                                      <h3 className="text-base sm:text-lg font-bold text-[#0F1535] truncate">
                                        {week.title}
                                      </h3>
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-1">
                                      {week.objectives.join(' · ')}
                                    </p>
                                  </div>

                                  <div className="shrink-0 p-1.5 rounded-xl bg-slate-100 text-slate-600 mt-1">
                                    {isWeekExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                  </div>
                                </button>

                                {/* Week Details Body */}
                                {isWeekExpanded && (
                                  <div className="p-4 sm:p-6 bg-slate-50/60 border-t border-slate-200/80 space-y-4 text-xs animate-in fade-in duration-150">
                                    {/* Objectives */}
                                    <div className="space-y-1.5">
                                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#5B5FED]">
                                        Weekly Objectives:
                                      </span>
                                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {week.objectives.map((obj, idx) => (
                                          <li key={idx} className="flex items-start gap-2 text-slate-700">
                                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                            <span>{obj}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>

                                    {/* Topics List */}
                                    <div className="space-y-1.5">
                                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                                        Topics Covered:
                                      </span>
                                      <div className="flex flex-wrap gap-1.5">
                                        {week.topics.map((tp, idx) => (
                                          <span
                                            key={idx}
                                            className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium"
                                          >
                                            {tp}
                                          </span>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Hands-on & Deliverable Box */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                                        <div className="text-[10px] font-mono font-bold uppercase text-amber-700 flex items-center gap-1">
                                          <Terminal className="w-3.5 h-3.5 text-amber-600" />
                                          <span>Hands-On Assignment:</span>
                                        </div>
                                        <p className="text-slate-800 leading-relaxed font-medium">
                                          {week.handsOn}
                                        </p>
                                      </div>

                                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                                        <div className="text-[10px] font-mono font-bold uppercase text-emerald-700 flex items-center gap-1">
                                          <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                                          <span>Weekly Deliverable:</span>
                                        </div>
                                        <p className="text-slate-800 leading-relaxed font-medium">
                                          {week.deliverable}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Capstone Project & Portfolio Specification Card */}
                      <div className="p-6 sm:p-8 rounded-2xl bg-[#0F1535] text-white space-y-4 border border-purple-900/60 shadow-lg">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                          <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-300" />
                            <h3 className="text-lg font-bold text-white">
                              Capstone Portfolio Project: {course.capstoneSpec.title}
                            </h3>
                          </div>
                          <span className="text-[10px] font-mono text-purple-300 bg-white/10 px-2.5 py-1 rounded border border-white/15">
                            {course.capstoneSpec.durationMinutesDemo}-Min Live Presentation
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          {course.capstoneSpec.requirements.map((req, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 text-xs text-purple-100">
                              <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                              <span>{req}</span>
                            </div>
                          ))}
                        </div>

                        {/* Assessment Method Checkpoints */}
                        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-purple-200">
                          <span className="font-bold text-amber-300">Assessment Criteria:</span>
                          {course.assessment.map((ast, idx) => (
                            <span key={idx}>· {ast}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. Bottom Academic Directorate Gateway */}
      <section className="mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/90 shadow-lg text-center space-y-5 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#5B5FED]">
            <Award className="w-4 h-4 text-[#5B5FED]" />
            <span>Official Vixora Academy Certification</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F1535] tracking-tight">
            Cryptographically Verified Academic Credentials
          </h2>

          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
            All graduates completing weekly deliverables and the portfolio project receive a digital certificate signed by Academic Dean Sarumi Hammad with verifiable online ID.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onNavigateAcademy}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#5B5FED] hover:bg-[#480878] text-white text-xs font-bold transition-all cursor-pointer shadow-md"
            >
              Explore Program Enrollment Landing Pages
            </button>
            <button
              onClick={onNavigateStudentPortal}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F1535] text-xs font-bold transition-all cursor-pointer border border-slate-300"
            >
              Student &amp; Certificate Portal Login
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
