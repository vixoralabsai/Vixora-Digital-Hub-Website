import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  Terminal,
  ArrowLeft
} from 'lucide-react';
import { adminLogin, AdminSession } from '../../services/adminAuthService';
import { BRAND_CONFIG } from '../../data/brandConfig';

interface AdminLoginGateProps {
  onAuthenticated: (session: AdminSession) => void;
  onBackToHome?: () => void;
}

export function AdminLoginGate({ onAuthenticated, onBackToHome }: AdminLoginGateProps) {
  const [email, setEmail] = useState('admin@vixoradigitalhub.com');
  const [password, setPassword] = useState('Vixora2026!Admin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please provide both administrator email and master passkey.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const result = await adminLogin(email.trim(), password.trim());
    setIsLoading(false);

    if (result.success && result.session) {
      onAuthenticated(result.session);
    } else {
      setErrorMessage(result.error || 'Authentication denied. Please check your credentials.');
    }
  };

  const handleFillDemo = (adminEmail: string) => {
    setEmail(adminEmail);
    setPassword('Vixora2026!Admin');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-900/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        {/* Navigation back */}
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs font-mono text-purple-300 hover:text-white transition-colors mb-6 cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Return to Public Digital Hub</span>
          </button>
        )}

        {/* Security Container Card */}
        <div className="bg-[#0B051D]/90 backdrop-blur-xl border border-purple-900/40 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-purple-950/40 relative overflow-hidden">
          {/* Top Subtle Border Glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-80" />

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-950/70 border border-purple-800/60 shadow-inner mb-4 text-purple-400">
              <ShieldCheck className="w-8 h-8 text-purple-400" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-semibold bg-purple-900/30 text-purple-300 border border-purple-700/40 mb-3">
              <Terminal className="w-3.5 h-3.5" />
              <span>VIXORA HQ &bull; COMMAND CENTER GATEWAY</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Executive Administrator Login
            </h1>
            <p className="text-sm text-neutral-400 mt-2 max-w-md mx-auto">
              Secure administrative access for Vixora Digital Hub management, student certifications, client projects &amp; Resend email dispatch.
            </p>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-red-950/50 border border-red-800/50 text-red-200 text-xs flex items-start gap-3 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-300">Access Denied</p>
                <p className="mt-0.5 text-neutral-300">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono font-medium text-neutral-300 mb-1.5">
                Administrator Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@vixoradigitalhub.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-950/80 border border-purple-900/40 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono font-medium text-neutral-300">
                  Master Security Passkey
                </label>
                <span className="text-[11px] font-mono text-purple-400">
                  256-bit Encrypted
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-neutral-950/80 border border-purple-900/40 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide passkey' : 'Show passkey'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.99] transition-all shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating Administrator...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Authorize &amp; Launch Command Center</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Pre-fill Bar */}
          <div className="mt-8 pt-6 border-t border-purple-900/30">
            <div className="flex items-center justify-between mb-3 text-[11px] font-mono text-neutral-400">
              <span className="flex items-center gap-1.5 text-purple-300">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Verified Admin Profiles
              </span>
              <span>Click to auto-fill</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('admin@vixoradigitalhub.com')}
                className="p-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 border border-purple-900/30 hover:border-purple-700/50 text-left transition-colors cursor-pointer"
              >
                <div className="text-[11px] font-bold text-white flex items-center justify-between">
                  <span>Sarumi Hammad</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-800/50 text-purple-200">Director</span>
                </div>
                <div className="text-[10px] font-mono text-purple-300/80 truncate">
                  admin@vixoradigitalhub.com
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('vixoralabsai@gmail.com')}
                className="p-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 border border-purple-900/30 hover:border-purple-700/50 text-left transition-colors cursor-pointer"
              >
                <div className="text-[11px] font-bold text-white flex items-center justify-between">
                  <span>Vixora Labs AI</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-800/50 text-indigo-200">Executive</span>
                </div>
                <div className="text-[10px] font-mono text-indigo-300/80 truncate">
                  vixoralabsai@gmail.com
                </div>
              </button>
            </div>
          </div>

          {/* Security Guarantee Footer */}
          <div className="mt-6 flex items-center justify-center gap-4 text-[11px] font-mono text-neutral-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> TLS 1.3 Active
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 text-purple-300">
              <Building2 className="w-3.5 h-3.5" /> Vixora Digital Hub
            </span>
            <span>&bull;</span>
            <span>Resend &amp; SMTP Live</span>
          </div>
        </div>
      </div>
    </div>
  );
}
