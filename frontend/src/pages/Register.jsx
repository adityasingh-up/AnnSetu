import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { HeartHandshake, UserCheck, AlertCircle, ShieldCheck, ArrowRight, RefreshCw, Info } from 'lucide-react';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'donor',
    organizationName: '',
    registrationNumber: '',
    vehicleType: 'two-wheeler',
    address: 'Connaught Place, New Delhi'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // OTP Verification state
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [demoOtp, setDemoOtp] = useState(''); // backend se aane wala OTP (jab SMTP configured nahi)
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const [registeredUser, setRegisteredUser] = useState(null);

  const { register, setUserFromData } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Password Match Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please enter the exact same password in both fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
        organizationName: formData.organizationName,
        registrationNumber: formData.registrationNumber,
        vehicleType: formData.vehicleType,
        location: {
          type: 'Point',
          coordinates: [77.2090, 28.6139],
          address: formData.address
        }
      };

      // Direct API call to get demoOTP from response
      const apiRes = await authService.register(payload);
      const { user: userData, token: jwtToken, demoOTP } = apiRes.data;

      // Update AuthContext state properly
      setUserFromData(userData, jwtToken);
      setRegisteredUser(userData);

      // Show demoOTP on screen if SMTP not configured
      if (demoOTP) {
        setDemoOtp(demoOTP);
      }

      // Open OTP verification step
      setShowOtpScreen(true);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setOtpLoading(true);
    setError('');
    setOtpMessage('');

    try {
      await authService.verifyOTP({
        email: formData.email,
        otp: otpCode
      });

      setOtpMessage('Account successfully verified! Redirecting to dashboard...');
      setTimeout(() => {
        const role = registeredUser?.role || formData.role;
        switch (role) {
          case 'donor': navigate('/donor/dashboard'); break;
          case 'volunteer': navigate('/volunteer/dashboard'); break;
          case 'ngo': navigate('/ngo/dashboard'); break;
          case 'admin': navigate('/admin/dashboard'); break;
          default: navigate('/');
        }
      }, 1500);
    } catch (err) {
      setError(err.message || 'Invalid OTP code. Please check and try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setOtpMessage('');
    try {
      const res = await authService.resendOTP({ email: formData.email });
      setOtpMessage('A new 6-digit OTP code has been sent to your email.');
      if (res.data?.demoOTP) {
        setDemoOtp(res.data.demoOTP);
      }
    } catch (err) {
      setError(err.message || 'Failed to resend OTP.');
    }
  };

  const handleSkipVerification = () => {
    const role = registeredUser?.role || formData.role;
    switch (role) {
      case 'donor': navigate('/donor/dashboard'); break;
      case 'volunteer': navigate('/volunteer/dashboard'); break;
      case 'ngo': navigate('/ngo/dashboard'); break;
      case 'admin': navigate('/admin/dashboard'); break;
      default: navigate('/');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-[#131b2e] rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-gray-800">
        
        {/* Step 2: Email & Phone OTP Verification */}
        {showOtpScreen ? (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-3">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Verify Account OTP</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter the 6-digit verification code sent to <strong className="text-emerald-500">{formData.email}</strong>
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {otpMessage && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold text-center">
                {otpMessage}
              </div>
            )}

            {/* DemoOTP Banner — shown when SMTP/Gmail not configured */}
            {demoOtp && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                <div className="flex items-center space-x-2 mb-2">
                  <Info className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wide">Gmail Email Configure Nahi Hua</span>
                </div>
                <p className="text-xs mb-2 text-amber-700 dark:text-amber-300">Email nahi aaya? Neeche diya OTP use karo:</p>
                <div className="text-center">
                  <span className="font-mono text-2xl font-black tracking-[0.4em] bg-amber-100 dark:bg-amber-900/30 px-4 py-2 rounded-lg border border-amber-400/40 select-all">
                    {demoOtp}
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 text-center">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.trim())}
                  placeholder="123456"
                  className="w-full px-4 py-3 text-center tracking-[0.5em] text-xl font-mono font-bold rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={otpLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2"
              >
                {otpLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Continue</span>
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={handleResendOtp}
                className="text-emerald-500 font-bold hover:underline flex items-center space-x-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Resend OTP Code</span>
              </button>

              <button
                type="button"
                onClick={handleSkipVerification}
                className="text-gray-400 hover:text-gray-200 flex items-center space-x-1"
              >
                <span>Skip (Login Directly)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Step 1: Registration Form */
          <>
            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-3">
                <HeartHandshake className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Join the AnnSetu Rescue Platform</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Select User Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['donor', 'volunteer', 'ngo'].map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setFormData({ ...formData, role: r })}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                        formData.role === r
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                          : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                    Full Name / Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="user@domain.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none text-xs"
                />
              </div>

              {/* Password & Confirm Password (2 times entered) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none text-xs"
                  />
                </div>
              </div>

              {/* NGO Details */}
              {formData.role === 'ngo' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                      NGO Name
                    </label>
                    <input
                      type="text"
                      name="organizationName"
                      required
                      value={formData.organizationName}
                      onChange={handleChange}
                      placeholder="Asha Food Foundation"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                      Registration No.
                    </label>
                    <input
                      type="text"
                      name="registrationNumber"
                      required
                      value={formData.registrationNumber}
                      onChange={handleChange}
                      placeholder="NGO-DEL-2024-889"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Volunteer Vehicle */}
              {formData.role === 'volunteer' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                    Vehicle Type
                  </label>
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none text-xs"
                  >
                    <option value="two-wheeler">Two-Wheeler (Scooter/Motorcycle)</option>
                    <option value="three-wheeler">Three-Wheeler / Auto</option>
                    <option value="four-wheeler">Car / SUV</option>
                    <option value="van">Cargo Van</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 mt-4"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Create Account & Verify OTP</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
              Already registered?{' '}
              <Link to="/login" className="text-emerald-500 font-bold hover:underline">
                Sign In
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
