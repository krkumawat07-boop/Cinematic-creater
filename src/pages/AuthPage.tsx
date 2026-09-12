import React, { useState } from 'react';
import { 
  Clapperboard, 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Film, 
  Coins, 
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

type AuthMode = 'signin' | 'signup' | 'forgot';

export const AuthPage: React.FC = () => {
  const { 
    loginWithGoogle, 
    loginWithEmail, 
    signupWithEmail, 
    resetPassword, 
    authError, 
    clearError, 
    loading 
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    clearError();
    setLocalError(null);
    setResetSent(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (mode === 'forgot') {
      if (!email || !email.includes('@')) {
        setLocalError('Please enter a valid email address');
        return;
      }
      try {
        await resetPassword(email);
        setResetSent(true);
      } catch (err: any) {
        setLocalError(err.message || 'Could not send password reset email');
      }
      return;
    }

    if (mode === 'signup') {
      if (!email || !password) {
        setLocalError('Email and password are required');
        return;
      }
      if (password.length < 6) {
        setLocalError('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match');
        return;
      }
      try {
        await signupWithEmail(email, password, displayName || undefined);
      } catch (err: any) {
        setLocalError(err.message || 'Account creation failed');
      }
      return;
    }

    // mode === 'signin'
    if (!email || !password) {
      setLocalError('Please provide both email and password');
      return;
    }
    try {
      await loginWithEmail(email, password);
    } catch (err: any) {
      setLocalError(err.message || 'Sign in failed');
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setLocalError(err.message || 'Google sign-in failed');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#08090f] text-zinc-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-600/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md bg-[#10121c]/90 border border-zinc-800/90 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl relative z-10">
        {/* Branding header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center relative w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 shadow-xl shadow-indigo-500/25 ring-1 ring-white/20 mb-3">
            <Clapperboard className="w-7 h-7 text-white" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 ring-2 ring-[#10121c] flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-black" />
            </div>
          </div>
          <h1 className="text-2xl font-bold font-cinematic tracking-wide text-white">
            CineForge Studio
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Production-Ready AI Cinematic Filmmaking Suite
          </p>
        </div>

        {/* Free credits notification banner */}
        <div className="mb-6 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-200">
          <Coins className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
          <span>
            <strong>New Creator Grant:</strong> 100 free AI generation credits on your first sign in.
          </span>
        </div>

        {/* Tabs: Sign In / Create Account */}
        {mode !== 'forgot' && (
          <div className="flex rounded-lg bg-zinc-900/90 p-1 border border-zinc-800 mb-5">
            <button
              id="auth-tab-signin-btn"
              type="button"
              onClick={() => switchMode('signin')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                mode === 'signin'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              id="auth-tab-signup-btn"
              type="button"
              onClick={() => switchMode('signup')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                mode === 'signup'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Google Sign In Button */}
        {mode !== 'forgot' && (
          <div className="mb-5">
            <button
              id="auth-google-signin-btn"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-sm font-medium text-white transition-all shadow-sm hover:bg-zinc-800 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.92 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase">
                <span className="bg-[#10121c] px-2 text-zinc-500 font-mono">or continue with email</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Messages */}
        {(localError || authError) && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-800/80 flex items-start gap-2.5 text-xs text-red-200 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{localError || authError}</span>
            </div>
          </div>
        )}

        {/* Password Reset Confirmation Banner */}
        {resetSent && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/80 flex items-start gap-2.5 text-xs text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Reset Link Sent</p>
              <p className="text-[11px] text-emerald-300/80 mt-0.5">
                Check your inbox at <strong>{email}</strong> for instructions to reset your password.
              </p>
            </div>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-medium text-zinc-300 uppercase tracking-wider mb-1">
                Display Name (Optional)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-display-name-input"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Director Christopher"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-white placeholder-zinc-500 outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-zinc-300 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="auth-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="creator@studio.com"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-white placeholder-zinc-500 outline-none transition-all"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-zinc-300 uppercase tracking-wider">
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    id="auth-forgot-pass-btn"
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-white placeholder-zinc-500 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-medium text-zinc-300 uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-confirm-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-white placeholder-zinc-500 outline-none transition-all"
                />
              </div>
            </div>
          )}

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all mt-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : mode === 'signin' ? (
              <>
                <span>Sign In to Studio</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : mode === 'signup' ? (
              <>
                <span>Create Creator Account</span>
                <Sparkles className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Send Password Reset Link</span>
                <Mail className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Return to Sign In link when in Forgot mode */}
        {mode === 'forgot' && (
          <div className="text-center mt-5">
            <button
              id="auth-back-to-signin-btn"
              type="button"
              onClick={() => switchMode('signin')}
              className="text-xs text-zinc-400 hover:text-white transition-colors"
            >
              ← Back to Sign In
            </button>
          </div>
        )}

        {/* Security badge footer */}
        <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-center gap-2 text-[10px] text-zinc-500 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Secured with Firebase Authentication & Cloud Firestore</span>
        </div>
      </div>
    </div>
  );
};
