import React, { useMemo, useState } from 'react';
import { ArrowRight, Eye, EyeOff, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../../plugin/axios';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { token = '' } = useParams();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isLinkValid = useMemo(() => Boolean(token && email), [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isLinkValid) {
      setErrorMessage('This password reset link is incomplete or invalid.');
      return;
    }

    if (!password || !passwordConfirmation) {
      setErrorMessage('Please complete both password fields.');
      return;
    }

    if (password !== passwordConfirmation) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      await axios.post('reset-password', {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      toast.success('Password reset successful. You can now sign in.');
      navigate('/user-login', { replace: true });
    } catch (err: any) {
      const message =
        err.response?.data?.errors?.email?.[0] ||
        err.response?.data?.errors?.password?.[0] ||
        err.response?.data?.message ||
        'Unable to reset password.';

      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2500&auto=format&fit=crop')` }}
    >
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden border border-white/20">
          <div className="pt-10 pb-6 px-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6 relative">
              <div className="absolute inset-0 rounded-full border border-primary/20 animate-pulse" />
              <ShieldCheck size={40} className="text-primary" />
            </div>

            <h2 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tight">
              Reset Password
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-2 font-medium px-4 leading-relaxed">
              Create a new password for <span className="font-black">{email || 'your account'}</span>.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 pb-10 space-y-5">
            {errorMessage && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-4 rounded-xl flex items-start gap-3">
                <div className="min-w-1.5 h-1.5 mt-1.5 rounded-full bg-red-500" />
                <p className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-tight leading-relaxed">
                  {errorMessage}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 flex items-center gap-2 text-gray-500 dark:text-gray-400">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={16} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  disabled={isLoading}
                  placeholder="Enter your new password"
                  className="w-full pl-11 pr-12 py-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white font-bold text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 placeholder:text-gray-400 placeholder:font-normal"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 inset-y-0 pr-4 flex items-center text-gray-400 hover:text-primary transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 flex items-center gap-2 text-gray-500 dark:text-gray-400">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={16} className="text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  disabled={isLoading}
                  placeholder="Confirm your new password"
                  className="w-full pl-11 pr-12 py-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white font-bold text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 placeholder:text-gray-400 placeholder:font-normal"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-0 inset-y-0 pr-4 flex items-center text-gray-400 hover:text-primary transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isLinkValid}
              className="w-full bg-primary hover:opacity-90 text-white font-black uppercase py-4 rounded-xl shadow-lg shadow-primary/25 transform transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-6 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <span className="text-xs tracking-[0.2em]">Reset Password</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <Link to="/user-login" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                Back to Login
              </Link>
            </div>
          </form>

          <div className="h-1.5 w-full bg-linear-to-r from-primary/40 via-primary to-primary/40" />
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
