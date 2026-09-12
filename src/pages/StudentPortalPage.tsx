import React, { useState, useEffect } from 'react';
import { 
  Certificate, 
  StudentProfile, 
  StudentCourse, 
  SEED_CERTIFICATES, 
  SEED_STUDENTS 
} from '../data/academyPortalData';
import { CertificateDocument } from '../components/CertificateDocument';
import { CertificateVerificationWidget } from '../components/CertificateVerificationWidget';
import { IssueCertificatePanel } from '../components/IssueCertificatePanel';
import { 
  GraduationCap, 
  Award, 
  ShieldCheck, 
  Send, 
  User, 
  Lock, 
  Mail, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  BookOpen, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Download
} from 'lucide-react';

interface StudentPortalPageProps {
  initialTab?: 'dashboard' | 'certificates' | 'verify' | 'issue';
  initialCertId?: string;
  onNavigateToCourse?: (courseSlug: string) => void;
}

export const StudentPortalPage: React.FC<StudentPortalPageProps> = ({
  initialTab = 'dashboard',
  initialCertId,
  onNavigateToCourse
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'certificates' | 'verify' | 'issue'>(
    initialCertId ? 'certificates' : initialTab
  );

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(SEED_STUDENTS[0]);
  const [studentCertificates, setStudentCertificates] = useState<Certificate[]>(() =>
    SEED_CERTIFICATES.filter(c => c.studentEmail === SEED_STUDENTS[0].email)
  );
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(SEED_CERTIFICATES[0]);

  // Login form state
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [rateLimitCooldown, setRateLimitCooldown] = useState<number | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number>(5);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  // Email sending state
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Check rate limit status on mount and when email changes
  const checkRateLimitStatus = async (email: string) => {
    try {
      const res = await fetch(`/api/student/rate-limit-status?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.remaining !== undefined) {
        setRemainingAttempts(data.remaining);
      }
      if (data.isLimited && data.resetInSeconds) {
        setRateLimitCooldown(data.resetInSeconds);
      }
    } catch (e) {
      // Ignore network errors in status probe
    }
  };

  useEffect(() => {
    checkRateLimitStatus(emailInput);
  }, [emailInput]);

  // Rate limit countdown timer
  useEffect(() => {
    if (rateLimitCooldown === null || rateLimitCooldown <= 0) return;
    const interval = setInterval(() => {
      setRateLimitCooldown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setLoginError(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [rateLimitCooldown]);

  // Set default selected certificate from seed or initial
  useEffect(() => {
    if (initialCertId) {
      const found = SEED_CERTIFICATES.find(c => c.id === initialCertId);
      if (found) {
        setSelectedCertificate(found);
        setActiveTab('certificates');
      }
    } else if (!selectedCertificate && SEED_CERTIFICATES.length > 0) {
      setSelectedCertificate(SEED_CERTIFICATES[0]);
    }
  }, [initialCertId]);

  // Handle student login with rate limiting
  const handleLogin = async (e?: React.FormEvent, overrideEmail?: string) => {
    if (e) e.preventDefault();
    const targetEmail = (overrideEmail || emailInput).trim().toLowerCase();

    if (!targetEmail || !targetEmail.includes('@')) {
      setLoginError('Please enter a valid student email address.');
      return;
    }

    if (rateLimitCooldown && rateLimitCooldown > 0) {
      setLoginError(`Rate limit reached. Please wait ${rateLimitCooldown}s before trying again.`);
      return;
    }

    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          password: passwordInput,
        })
      });

      const data = await res.json();

      if (res.status === 429) {
        setRateLimitCooldown(data.retryAfterSeconds || 60);
        setRemainingAttempts(0);
        setLoginError(`Security Notice: Too many login attempts. Rate limiting engaged. Try again in ${data.retryAfterSeconds || 60} seconds.`);
        return;
      }

      if (!res.ok) {
        setLoginError(data.error || 'Login failed. Please verify your credentials.');
        if (data.rateLimit?.remaining !== undefined) {
          setRemainingAttempts(data.rateLimit.remaining);
        }
        return;
      }

      // Successful login
      setIsLoggedIn(true);
      setCurrentStudent(data.student);
      setStudentCertificates(data.certificates || []);
      if (data.certificates && data.certificates.length > 0) {
        setSelectedCertificate(data.certificates[0]);
      }
      if (data.rateLimit?.remaining !== undefined) {
        setRemainingAttempts(data.rateLimit.remaining);
      }
    } catch (err: any) {
      setLoginError('Network error connecting to Vixora Academy Authentication Gateway.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentStudent(null);
    setStudentCertificates([]);
  };

  // Quick Demo Login helper
  const handleQuickDemoLogin = (demoEmail: string) => {
    setEmailInput(demoEmail);
    handleLogin(undefined, demoEmail);
  };

  // Automated Certificate Email Sender
  const handleSendCertificateEmail = async (certId: string, email: string) => {
    setIsSendingEmail(true);
    try {
      const res = await fetch('/api/certificates/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certificateId: certId,
          customRecipientEmail: email
        })
      });
      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: data.error || 'Failed to dispatch email.',
          remaining: data.remaining,
          delivery: data.delivery
        };
      }
      return {
        success: true,
        message: data.message,
        delivery: data.delivery,
        emailLog: data.emailLog,
        remaining: data.rateLimit?.remaining
      };
    } catch (e: any) {
      return {
        success: false,
        message: 'Network error communicating with the mail server.'
      };
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Dynamic Student Overview Progress Metrics
  const coursesCompletedCount = currentStudent?.courses.filter(
    (c) => c.status === 'completed' || c.progressPercent >= 100
  ).length ?? 0;

  const activeEnrollmentsCount = currentStudent?.courses.filter(
    (c) => c.status !== 'completed' && c.progressPercent < 100
  ).length ?? 0;

  const certificatesEarnedCount = (studentCertificates && studentCertificates.length > 0)
    ? studentCertificates.length
    : (currentStudent?.courses.filter((c) => Boolean(c.certificateId)).length ?? 0);

  return (
    <div className="min-h-screen bg-[#F7F7FC] text-[#000048] pb-24 pt-8 px-4 sm:px-6 lg:px-8">
      {/* Top Banner & Academy Branding */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-[#000048] via-[#480878] to-[#7000F8] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          
          {/* Subtle logo emblem in background */}
          <div 
            className="absolute -right-8 -bottom-10 w-72 h-72 opacity-10 pointer-events-none rounded-full bg-contain bg-no-repeat bg-center"
            style={{ backgroundImage: `url('/images/vixora-academy-logo.jpg')` }}
          />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white rounded-2xl shadow-md shrink-0">
                <img 
                  src="/images/vixora-academy-logo.jpg" 
                  alt="Vixora Academy" 
                  className="h-14 sm:h-16 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase bg-white/15 text-purple-200 backdrop-blur-xs mb-2">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Student & Certificate Portal</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                  Vixora Academy Academic Directorate
                </h1>
                <p className="text-xs sm:text-sm text-purple-200 mt-1 max-w-xl">
                  Official portal for coursework tracking, cryptographic credential verification, and automated graduate certificate dispatch under Dean <strong className="text-white">Sarumi Hammad</strong>.
                </p>
              </div>
            </div>

            {/* Authenticated user status or quick login reminder */}
            {isLoggedIn && currentStudent ? (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center justify-between md:flex-col md:items-end gap-3">
                <div className="text-left md:text-right">
                  <div className="text-xs text-purple-200 font-medium">Logged in as</div>
                  <div className="text-sm font-bold text-white">{currentStudent.name}</div>
                  <div className="text-[11px] font-mono text-purple-300">{currentStudent.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-white/15 hover:bg-white/25 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-300 shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-white">Protected by Adaptive Rate Limiter</div>
                  <div className="text-purple-200 text-[11px]">Sliding-window brute-force mitigation active</div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Tabs Pill Bar */}
          <div className="mt-8 pt-6 border-t border-white/20 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'dashboard'
                  ? 'bg-white text-[#000048] shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Student Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('certificates')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'certificates'
                  ? 'bg-white text-[#000048] shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Certificate Portal & Viewer</span>
            </button>

            <button
              onClick={() => setActiveTab('verify')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'verify'
                  ? 'bg-white text-[#000048] shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify Credential ID</span>
            </button>

            <button
              onClick={() => setActiveTab('issue')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'issue'
                  ? 'bg-white text-[#000048] shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Issue & Auto-Email Certificates</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Content Area Based on Active Tab */}
      <div className="max-w-6xl mx-auto">
        
        {/* ==================================================== */}
        {/* TAB 1: STUDENT DASHBOARD (WITH EMAIL LOGIN)          */}
        {/* ==================================================== */}
        {activeTab === 'dashboard' && (
          <div>
            {!isLoggedIn ? (
              /* Student Login Form with Rate Limiting */
              <div className="max-w-lg mx-auto bg-white rounded-3xl border border-purple-100 shadow-xl p-8">
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#000048] to-[#7000F8] flex items-center justify-center text-white mx-auto mb-3 shadow-md">
                    <Lock className="w-7 h-7 text-amber-300" />
                  </div>
                  <h2 className="text-2xl font-black text-[#000048] tracking-tight">
                    Student Portal Login
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                    Sign in with your registered academy email to access courses and certifications
                  </p>
                </div>

                {/* Rate Limiting Status Indicator */}
                <div className={`mb-6 p-3 rounded-2xl text-xs flex items-center justify-between border ${
                  rateLimitCooldown && rateLimitCooldown > 0
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-purple-50 border-purple-100 text-[#000048]'
                }`}>
                  <div className="flex items-center gap-2">
                    {rateLimitCooldown && rateLimitCooldown > 0 ? (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-[#7000F8] shrink-0" />
                    )}
                    <span>
                      {rateLimitCooldown && rateLimitCooldown > 0
                        ? `Rate Limiter Active: Cooldown in progress`
                        : `Adaptive Security Active`}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-[11px] bg-white px-2 py-0.5 rounded-lg border">
                    {rateLimitCooldown && rateLimitCooldown > 0
                      ? `${rateLimitCooldown}s left`
                      : `${remainingAttempts}/5 attempts left`}
                  </span>
                </div>

                {loginError && (
                  <div className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Authentication Error</div>
                      <div className="mt-0.5">{loginError}</div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#000048] mb-1.5">
                      Student Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="student@vixora.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 bg-[#FCFCFF] text-sm text-[#000048] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#7000F8]"
                        required
                        disabled={loginLoading || (rateLimitCooldown !== null && rateLimitCooldown > 0)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#000048] mb-1.5">
                      Password or Access Code
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        type="password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 bg-[#FCFCFF] text-sm text-[#000048] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#7000F8]"
                        disabled={loginLoading || (rateLimitCooldown !== null && rateLimitCooldown > 0)}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading || (rateLimitCooldown !== null && rateLimitCooldown > 0)}
                    className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#000048] via-[#480878] to-[#7000F8] hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    {loginLoading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    <span>
                      {rateLimitCooldown && rateLimitCooldown > 0
                        ? `Locked (${rateLimitCooldown}s cooldown)`
                        : loginLoading
                        ? 'Authenticating...'
                        : 'Sign In to Student Portal'}
                    </span>
                  </button>
                </form>

                {/* Onboarding Credentials Guidance for Real Students */}
                <div className="mt-6 p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs text-[#5F6078] space-y-1">
                  <div className="font-bold text-[#000048] flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-[#7000F8]" />
                    <span>How do students get login details?</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Students receive their official login email and temporary password automatically in their welcome confirmation email upon admission into a cohort. For support, contact the Admissions Desk on WhatsApp.
                  </p>
                </div>

                {/* Collapsible Demo Profiles for Evaluators / Testing */}
                <div className="mt-5 pt-4 border-t border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-purple-700 hover:text-purple-900 py-1 transition-colors cursor-pointer"
                  >
                    <span>Developer / Evaluator Demo Logins</span>
                    <span className="text-[11px] font-mono text-purple-600 bg-purple-100 px-2 py-0.5 rounded-md">
                      {showDemoAccounts ? 'Hide Demo Logins' : 'Show Demo Logins'}
                    </span>
                  </button>

                  {showDemoAccounts && (
                    <div className="space-y-2 mt-3 animate-in fade-in duration-150">
                      <div className="text-[11px] text-neutral-500">
                        Click any test profile below to auto-fill and test the student dashboard:
                      </div>
                      <button
                        type="button"
                        onClick={() => handleQuickDemoLogin('student@vixora.com')}
                        className="w-full p-2.5 rounded-xl border border-purple-100 hover:border-purple-300 hover:bg-purple-50/50 bg-[#FCFCFF] text-left transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <div className="text-xs font-bold text-[#000048]">David A. Okonjo</div>
                          <div className="text-[11px] text-neutral-500">Autonomous AI Systems • Distinction Graduate</div>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-[#7000F8]">student@vixora.com</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickDemoLogin('alex.chen@vixora.com')}
                        className="w-full p-2.5 rounded-xl border border-purple-100 hover:border-purple-300 hover:bg-purple-50/50 bg-[#FCFCFF] text-left transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <div className="text-xs font-bold text-[#000048]">Alex K. Chen</div>
                          <div className="text-[11px] text-neutral-500">Data Analytics Mastery • Honors Graduate</div>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-[#7000F8]">alex.chen@vixora.com</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickDemoLogin('sarah.j@vixora.com')}
                        className="w-full p-2.5 rounded-xl border border-purple-100 hover:border-purple-300 hover:bg-purple-50/50 bg-[#FCFCFF] text-left transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <div className="text-xs font-bold text-[#000048]">Sarah Jenkins</div>
                          <div className="text-[11px] text-neutral-500">AI Freelancing & Agency • Certified</div>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-[#7000F8]">sarah.j@vixora.com</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              /* Authenticated Student Dashboard */
              <div className="space-y-8">
                {/* Student Profile Overview Card */}
                <div className="bg-white rounded-3xl border border-purple-100 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#000048] to-[#7000F8] text-white flex items-center justify-center font-bold text-2xl shadow-md">
                      {currentStudent?.name.charAt(0) || 'S'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-black text-[#000048]">{currentStudent?.name}</h2>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-[#480878] uppercase tracking-wider">
                          {currentStudent?.role || 'Student'}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-500 mt-0.5">
                        Student ID: <span className="font-mono font-bold text-[#000048]">{currentStudent?.id}</span> • Member since {currentStudent?.enrolledDate}
                      </div>
                      <div className="text-xs text-neutral-500 font-mono mt-0.5">
                        {currentStudent?.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveTab('certificates')}
                      className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-[#000048] hover:bg-[#480878] transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Award className="w-4 h-4 text-amber-300" />
                      <span>View My Certificates ({studentCertificates.length})</span>
                    </button>
                  </div>
                </div>

                {/* Student Overview Summary (Grid Layout with Cards) */}
                <div id="student-overview-section" className="bg-white rounded-3xl border border-purple-100 shadow-sm p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-[#000048] flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-[#7000F8]" />
                        <span>Student Overview</span>
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Real-time academic progression, active coursework, and verified credentials
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-100 px-3 py-1 rounded-full w-fit">
                      Current Academic Cohort
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    {/* Card 1: Courses Completed */}
                    <div 
                      id="metric-courses-completed"
                      className="p-5 rounded-2xl bg-[#FCFCFF] border border-neutral-200/80 hover:border-emerald-200 hover:bg-emerald-50/10 transition-all duration-200 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        </div>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                          Completed
                        </span>
                      </div>
                      <div className="mt-4">
                        <div className="text-3xl sm:text-4xl font-black text-[#000048] tracking-tight">
                          {coursesCompletedCount}
                        </div>
                        <div className="text-sm font-bold text-[#000048] mt-1">
                          Courses Completed
                        </div>
                        <div className="text-xs text-neutral-500 mt-0.5">
                          100% curriculum fulfilled
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Active Enrollments */}
                    <div 
                      id="metric-active-enrollments"
                      className="p-5 rounded-2xl bg-[#FCFCFF] border border-neutral-200/80 hover:border-blue-200 hover:bg-blue-50/10 transition-all duration-200 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                          In Progress
                        </span>
                      </div>
                      <div className="mt-4">
                        <div className="text-3xl sm:text-4xl font-black text-[#000048] tracking-tight">
                          {activeEnrollmentsCount}
                        </div>
                        <div className="text-sm font-bold text-[#000048] mt-1">
                          Active Enrollments
                        </div>
                        <div className="text-xs text-neutral-500 mt-0.5">
                          Ongoing cohort coursework
                        </div>
                      </div>
                    </div>

                    {/* Card 3: Certificates Earned */}
                    <div 
                      id="metric-certificates-earned"
                      onClick={() => setActiveTab('certificates')}
                      className="p-5 rounded-2xl bg-[#FCFCFF] border border-neutral-200/80 hover:border-purple-300 hover:bg-purple-50/20 transition-all duration-200 flex flex-col justify-between cursor-pointer group"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100 text-[#7000F8] flex items-center justify-center">
                          <Award className="w-5 h-5 text-[#7000F8]" />
                        </div>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-[#7000F8] border border-purple-100 group-hover:bg-[#7000F8] group-hover:text-white transition-colors">
                          Verified
                        </span>
                      </div>
                      <div className="mt-4">
                        <div className="text-3xl sm:text-4xl font-black text-[#000048] tracking-tight flex items-baseline justify-between">
                          <span>{certificatesEarnedCount}</span>
                          <span className="text-xs font-semibold text-[#7000F8] group-hover:underline">View &rarr;</span>
                        </div>
                        <div className="text-sm font-bold text-[#000048] mt-1">
                          Certificates Earned
                        </div>
                        <div className="text-xs text-neutral-500 mt-0.5">
                          Cryptographically validated
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enrolled Courses & Progress Section */}
                <div className="bg-white rounded-3xl border border-purple-100 shadow-sm p-6 sm:p-8">
                  <h3 className="text-lg font-black text-[#000048] mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#7000F8]" />
                    <span>My Enrolled Academic Programs</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentStudent?.courses.map((course, idx) => (
                      <div 
                        key={idx}
                        className="p-5 rounded-2xl border border-neutral-200 hover:border-purple-300 bg-[#FCFCFF] hover:bg-purple-50/20 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-purple-100 text-[#480878]">
                              {course.badge}
                            </span>
                            <span className={`text-xs font-bold ${
                              course.status === 'completed' ? 'text-emerald-700' : 'text-amber-700'
                            }`}>
                              {course.status === 'completed' ? '✓ Completed' : 'In Progress'}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-[#000048]">{course.title}</h4>
                          <p className="text-xs text-neutral-500 mt-1">
                            Instructor: {course.instructor} • Cohort: {course.cohort}
                          </p>

                          {/* Progress Bar */}
                          <div className="mt-4">
                            <div className="flex justify-between text-xs font-semibold mb-1">
                              <span>Curriculum Progress</span>
                              <span className="text-[#7000F8]">{course.progressPercent}%</span>
                            </div>
                            <div className="w-full h-2.5 rounded-full bg-neutral-200 overflow-hidden">
                              <div 
                                className="h-full rounded-full bg-gradient-to-r from-[#480878] to-[#7000F8]"
                                style={{ width: `${course.progressPercent}%` }}
                              />
                            </div>
                            <div className="text-[11px] text-neutral-400 mt-1">
                              {course.completedModules} of {course.totalModules} production modules fulfilled
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-neutral-200/70 flex items-center justify-between">
                          {course.certificateId ? (
                            <button
                              onClick={() => {
                                const cert = SEED_CERTIFICATES.find(c => c.id === course.certificateId) || studentCertificates.find(c => c.id === course.certificateId);
                                if (cert) {
                                  setSelectedCertificate(cert);
                                  setActiveTab('certificates');
                                }
                              }}
                              className="text-xs font-bold text-[#7000F8] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>View Official Certificate &rarr;</span>
                            </button>
                          ) : (
                            <span className="text-xs text-neutral-400">
                              Certificate awarded upon capstone completion
                            </span>
                          )}

                          {onNavigateToCourse && (
                            <button
                              onClick={() => onNavigateToCourse(course.courseId)}
                              className="text-xs font-semibold text-neutral-600 hover:text-[#000048] flex items-center gap-1 cursor-pointer"
                            >
                              <span>Course Portal</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certificates Earned Preview */}
                {studentCertificates.length > 0 && (
                  <div className="bg-white rounded-3xl border border-purple-100 shadow-sm p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-black text-[#000048] flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        <span>Earned Professional Credentials</span>
                      </h3>
                      <button
                        onClick={() => setActiveTab('certificates')}
                        className="text-xs font-bold text-[#7000F8] hover:underline cursor-pointer"
                      >
                        Inspect Full Credentials &rarr;
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {studentCertificates.map((cert) => (
                        <div
                          key={cert.id}
                          className="p-5 rounded-2xl border-2 border-purple-100 bg-gradient-to-br from-white to-purple-50/40 hover:border-purple-300 transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold font-mono bg-purple-100 text-[#480878]">
                                {cert.id}
                              </span>
                              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Active & Verified
                              </span>
                            </div>
                            <div className="text-base font-extrabold text-[#000048]">{cert.courseTitle}</div>
                            <div className="text-xs text-neutral-500 mt-1">Conferred on {cert.issueDate} • {cert.grade}</div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-purple-100 flex items-center justify-between gap-2">
                            <button
                              onClick={() => {
                                setSelectedCertificate(cert);
                                setActiveTab('certificates');
                              }}
                              className="text-xs font-bold text-[#7000F8] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>View Document</span>
                            </button>

                            <a
                              href={`/api/certificates/${cert.id}/pdf`}
                              download={`Vixora-Academy-Certificate-${cert.id}.pdf`}
                              onClick={(e) => e.stopPropagation()}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors flex items-center gap-1.5 shadow-xs"
                              title="Download official PDF certificate"
                            >
                              <Download className="w-3 h-3" />
                              <span>Download PDF</span>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: CERTIFICATE PORTAL & VIEWER                  */}
        {/* ==================================================== */}
        {activeTab === 'certificates' && (
          <div>
            {/* Certificate Selector Strip */}
            <div className="mb-6 bg-white p-4 rounded-2xl border border-purple-100 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Select Graduate Certificate:
                </span>
                <div className="flex flex-wrap gap-2">
                  {SEED_CERTIFICATES.concat(
                    studentCertificates.filter(sc => !SEED_CERTIFICATES.some(sc2 => sc2.id === sc.id))
                  ).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCertificate(c)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedCertificate?.id === c.id
                          ? 'bg-[#000048] text-white shadow-xs'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-purple-100'
                      }`}
                    >
                      {c.studentName.split(' ')[0]} ({c.id})
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setActiveTab('verify')}
                className="text-xs font-bold text-[#7000F8] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verify Another Credential ID</span>
              </button>
            </div>

            {selectedCertificate ? (
              <CertificateDocument
                certificate={selectedCertificate}
                onSendEmail={handleSendCertificateEmail}
                isSendingEmail={isSendingEmail}
              />
            ) : (
              <div className="p-12 text-center text-neutral-500">
                No certificate selected.
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: CREDENTIAL VERIFICATION GATEWAY               */}
        {/* ==================================================== */}
        {activeTab === 'verify' && (
          <CertificateVerificationWidget
            onViewCertificate={(cert) => {
              setSelectedCertificate(cert);
              setActiveTab('certificates');
            }}
          />
        )}

        {/* ==================================================== */}
        {/* TAB 4: ISSUE & AUTO-EMAIL CERTIFICATES (ADMIN/INSTRUCTOR) */}
        {/* ==================================================== */}
        {activeTab === 'issue' && (
          <IssueCertificatePanel
            onCertificateIssued={(newCert) => {
              setSelectedCertificate(newCert);
              setStudentCertificates(prev => [newCert, ...prev]);
            }}
          />
        )}

      </div>
    </div>
  );
};
