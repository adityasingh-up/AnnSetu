import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { HeartHandshake, LogIn, AlertCircle, KeyRound, CheckCircle2, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState(''); // 'email' or 'password' or 'general'
  const [loading, setLoading] = useState(false);

  // Forgot Password Modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Send OTP, 2: Reset Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorType('');
    setLoading(true);

    try {
      const user = await login({ email, password });
      switch (user.role) {
        case 'donor': navigate('/donor/dashboard'); break;
        case 'volunteer': navigate('/volunteer/dashboard'); break;
        case 'ngo': navigate('/ngo/dashboard'); break;
        case 'admin': navigate('/admin/dashboard'); break;
        default: navigate('/');
      }
    } catch (err) {
      const errMsg = err.message || 'Login failed.';
      if (errMsg.toLowerCase().includes('email')) {
        setErrorType('email');
      } else if (errMsg.toLowerCase().includes('password')) {
        setErrorType('password');
      } else {
        setErrorType('general');
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Handlers
  const handleSendResetOTP = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);

    try {
      await authService.forgotPassword({ email: forgotEmail });
      setForgotSuccess('A 6-digit password reset OTP has been sent to your email address.');
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.message || 'Failed to send reset code.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (newPassword !== confirmNewPassword) {
      setForgotError('New Passwords do not match. Please re-enter the exact same password.');
      return;
    }

    if (newPassword.length < 6) {
      setForgotError('New password must be at least 6 characters long.');
      return;
    }

    setForgotLoading(true);

    try {
      await authService.resetPassword({
        email: forgotEmail,
        otp: resetOtp,
        newPassword
      });

      setForgotSuccess('Password updated successfully! You can now sign in with your new password.');
      setTimeout(() => {
        setIsForgotModalOpen(false);
        setForgotStep(1);
        setEmail(forgotEmail);
        setPassword('');
        setForgotSuccess('');
      }, 2000);
    } catch (err) {
      setForgotError(err.message || 'Password reset failed.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleQuickDemoLogin = (demoRole) => {
    switch (demoRole) {
      case 'donor':
        setEmail('donor@annsetu.org');
        setPassword('donor123');
        break;
      case 'volunteer':
        setEmail('volunteer@annsetu.org');
        setPassword('volunteer123');
        break;
      case 'ngo':
        setEmail('ngo@annsetu.org');
        setPassword('ngo123');
        break;
      case 'admin':
        setEmail('admin@annsetu.org');
        setPassword('admin123');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative">
      
      {/* Glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="w-full max-w-md bg-white/90 dark:bg-[#131b2e]/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/80 dark:border-gray-800/80 space-y-6">
        
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 mb-3 text-white">
            <HeartHandshake className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Welcome Back</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sign in to AnnSetu Rescue & Logistics Platform</p>
        </div>

        {/* 1-Click Quick Demo Login Row */}
        <div className="p-3.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2 flex items-center justify-between">
            <span>⚡ 1-Click Fast Demo Fill</span>
            <span className="text-[10px] text-gray-400 font-normal">Click to auto-fill</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { role: 'donor', label: 'Donor' },
              { role: 'volunteer', label: 'Volunteer' },
              { role: 'ngo', label: 'NGO' },
              { role: 'admin', label: 'Admin' }
            ].map((d) => (
              <button
                key={d.role}
                type="button"
                onClick={() => handleQuickDemoLogin(d.role)}
                className="py-1.5 px-2 rounded-lg bg-white dark:bg-gray-800 text-[11px] font-bold text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:border-emerald-500 hover:text-emerald-500 transition-all text-center truncate shadow-sm"
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@domain.com"
              className={`w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-900/90 text-gray-900 dark:text-white outline-none text-sm transition-all ${
                errorType === 'email'
                  ? 'border-rose-500 ring-2 ring-rose-500/30'
                  : 'border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500'
              }`}
            />
            {errorType === 'email' && (
              <p className="text-[11px] font-bold text-rose-500 mt-1">⚠️ Please check email address spelling or register an account.</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setIsForgotModalOpen(true);
                }}
                className="text-xs font-bold text-emerald-500 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-4 py-3 pr-12 rounded-xl border bg-gray-50 dark:bg-gray-900/90 text-gray-900 dark:text-white outline-none text-sm transition-all ${
                  errorType === 'password'
                    ? 'border-rose-500 ring-2 ring-rose-500/30'
                    : 'border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors focus:outline-none"
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errorType === 'password' && (
              <p className="text-[11px] font-bold text-rose-500 mt-1">⚠️ Incorrect password. Click 'Forgot Password?' if needed.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/25 transition-all flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to Platform</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
          New to AnnSetu?{' '}
          <Link to="/register" className="text-emerald-500 font-bold hover:underline">
            Register New Account
          </Link>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#131b2e] rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-gray-800">
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-emerald-500" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {forgotStep === 1 ? 'Forgot Password' : 'Reset Password'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsForgotModalOpen(false);
                  setForgotStep(1);
                  setForgotError('');
                  setForgotSuccess('');
                }}
                className="text-gray-400 hover:text-gray-200 text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            {forgotError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {forgotStep === 1 ? (
              /* Step 1: Request OTP */
              <form onSubmit={handleSendResetOTP} className="space-y-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Enter your registered email address and we will send you a 6-digit OTP code to reset your password.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Registered Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="user@domain.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-900 dark:text-white outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2"
                >
                  {forgotLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Send Reset OTP Code</span>
                  )}
                </button>
              </form>
            ) : (
              /* Step 2: Enter OTP & New Password */
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 text-center">
                    6-Digit OTP Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value.trim())}
                    placeholder="123456"
                    className="w-full px-3.5 py-2.5 text-center tracking-[0.4em] font-mono font-bold text-lg rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-900 dark:text-white outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors focus:outline-none"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-900 dark:text-white outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors focus:outline-none"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="text-xs text-gray-400 hover:text-white flex items-center space-x-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
                  >
                    {forgotLoading ? 'Updating Password...' : 'Reset & Save Password'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
