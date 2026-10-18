import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'signup';
  onClose: () => void;
  onSuccess: (userData: { name: string; email: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password || (mode === 'signup' && !name)) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    // Client-side authentication simulation with local storage persistence
    setTimeout(() => {
      setLoading(false);
      const user = {
        name: mode === 'signup' ? name : (name || email.split('@')[0]),
        email,
      };
      localStorage.setItem('taxmate_user', JSON.stringify(user));
      onSuccess(user);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Warm Blur Backdrop */}
      <div
        className="fixed inset-0 bg-[#282118]/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-3xl bg-[#FAF6EE] p-8 shadow-2xl border border-[#E8DFC9] z-10 text-[#1C1917] overflow-hidden">
        {/* Soft Background Accent Glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[#E5D7BC] blur-3xl opacity-60" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-[#F3E8D2] blur-3xl opacity-60" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#78716C] hover:text-[#1C1917] hover:bg-[#EFE7D6] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE6D4] text-[#6338F1] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>TaxMate AI Secure Access</span>
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-[#1C1917] font-serif">
            {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
          </h3>
          <p className="text-xs text-[#78716C] mt-1.5">
            {mode === 'login'
              ? 'Enter your credentials to access your tax dashboard'
              : 'Join thousands optimizing their FY 2024-25 taxes'}
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-100/80 border border-red-200 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-[#44403C] mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A29E]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aditya Sharma"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D6CBB2] bg-white/80 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#6338F1] focus:ring-2 focus:ring-[#6338F1]/20 transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#44403C] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A29E]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aditya@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D6CBB2] bg-white/80 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#6338F1] focus:ring-2 focus:ring-[#6338F1]/20 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-medium text-[#44403C]">
                Password
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  className="text-[11px] text-[#6338F1] hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A29E]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#D6CBB2] bg-white/80 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#6338F1] focus:ring-2 focus:ring-[#6338F1]/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-[#44403C]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-[#6338F1] hover:bg-[#5229DC] text-white font-medium text-sm shadow-md shadow-[#6338F1]/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to Copilot' : 'Create Free Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Switch Mode */}
        <div className="mt-6 pt-5 border-t border-[#E8DFC9] text-center text-xs text-[#78716C]">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                }}
                className="font-semibold text-[#6338F1] hover:underline cursor-pointer"
              >
                Sign up free
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="font-semibold text-[#6338F1] hover:underline cursor-pointer"
              >
                Log in
              </button>
            </>
          )}
        </div>

        {/* Trust Footnote */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-[#A8A29E]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Local PII sanitization active. Zero data sharing.</span>
        </div>
      </div>
    </div>
  );
};
