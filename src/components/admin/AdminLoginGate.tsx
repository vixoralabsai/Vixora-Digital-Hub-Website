import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  ArrowLeft
} from 'lucide-react';
import { adminLogin, AdminSession } from '../../services/adminAuthService';
import { BRAND_CONFIG } from '../../data/brandConfig';

interface AdminLoginGateProps {
  onAuthenticated: (session: AdminSession) => void;
  onBackToHome?: () => void;
}

export function AdminLoginGate({ onAuthenticated, onBackToHome }: AdminLoginGateProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please provide both administrator email and password.');
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

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="mb-6 inline-flex items-center gap-2 text-xs font-mono text-purple-300 hover:text-white transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Vixora Main Site
          </button>
        )}

        <div className="relative rounded-3xl bg-[#0e0724]/90 border border-purple-500/30 backdrop-blur-xl p-8 sm:p-10 shadow-2xl shadow-purple-950/60">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-purple-900/40 border border-purple-500/40 text-purple-300 mb-4 shadow-inner shadow-purple-500/20">
              <ShieldCheck className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
              Enterprise Admin Portal
            </h1>
            <p className="text-sm text-neutral-300">
              Vixora Digital Hub &bull; Supabase Auth Protected
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-500/50 flex items-start gap-3 text-rose-200 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-mono font-medium text-purple-200 mb-2">
                Administrator Work Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400/60">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@vixoradigitalhub.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-purple-950/30 border border-purple-800/40 text-white placeholder-purple-300/30 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-mono font-medium text-purple-200 mb-2">
                Administrator Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400/60">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-purple-950/30 border border-purple-800/40 text-white placeholder-purple-300/30 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-purple-400/60 hover:text-purple-300 cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-purple-900/50 hover:shadow-purple-700/60 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying Supabase Credentials...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Authorize Command Session
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Security Guarantee Footer */}
          <div className="mt-8 pt-6 border-t border-purple-900/30 flex items-center justify-center gap-4 text-[11px] font-mono text-neutral-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Supabase Auth
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 text-purple-300">
              <Building2 className="w-3.5 h-3.5" /> Vixora Digital Hub
            </span>
            <span>&bull;</span>
            <span>TLS 1.3 Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
