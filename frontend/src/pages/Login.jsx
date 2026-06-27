import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { BookOpen, Eye, EyeOff, AlertCircle, ArrowLeft, Phone as PhoneIcon, Key } from 'lucide-react';
import { RecaptchaVerifier } from 'firebase/auth';
import { auth } from '../config/firebase';

const Login = () => {
  const { login, sendOtp, resetPassword, error: authError, isFirebase } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Phone Sign-In State
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [otpSent, setOtpSent] = useState(false);
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [phoneError, setPhoneError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm();
  const { register: regForgot, handleSubmit: handleForgotSubmit, formState: { errors: forgotErrors } } = useForm();

  useEffect(() => {
    // Dynamically inject reCAPTCHA container on document.body
    // This places the recaptcha elements outside React's Virtual DOM root (#root),
    // preventing React from wiping out the iframe/widget children when state updates.
    let container = document.getElementById('recaptcha-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'recaptcha-container';
      document.body.appendChild(container);
    }
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {}
        window.recaptchaVerifier = null;
      }
      const el = document.getElementById('recaptcha-container');
      if (el) {
        el.remove();
      }
    };
  }, []);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone) {
      setPhoneError('Phone number is required');
      return;
    }
    setPhoneError('');
    setSubmitting(true);
    try {
      let verifier = null;
      if (isFirebase && auth) {
        // Safe cleanup: Clear existing instance if it was created in a previous render
        if (window.recaptchaVerifier) {
          try {
            window.recaptchaVerifier.clear();
          } catch (e) {
            console.warn('Error clearing previous recaptcha:', e);
          }
          window.recaptchaVerifier = null;
        }

        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            // reCAPTCHA solved
          }
        });
        verifier = window.recaptchaVerifier;
      }
      
      const result = await sendOtp(phone, verifier);
      setConfirmationResult(result);
      setOtpSent(true);
    } catch (err) {
      console.error('OTP send failed:', err);
      // Reset recaptcha verifier on error so it can recreate fresh next time
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {}
        window.recaptchaVerifier = null;
      }
      setPhoneError(err.message || 'Failed to dispatch verification code. Ensure country code is correct.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode) {
      setPhoneError('Please enter the 6-digit OTP code');
      return;
    }
    setPhoneError('');
    setSubmitting(true);
    try {
      await confirmationResult.confirm(otpCode);
      navigate('/dashboard');
    } catch (err) {
      console.error('OTP confirmation failed:', err);
      setPhoneError(err.message || 'OTP confirmation failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const onForgotSubmit = async (data) => {
    setSubmitting(true);
    setForgotSuccess('');
    setForgotError('');
    try {
      await resetPassword(data.forgotEmail);
      setForgotSuccess('A password reset link has been dispatched to your email.');
    } catch (e) {
      setForgotError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">

      {/* Left Column - Educational Branding Cover (Visible on Desktop) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-gradient-to-br from-primary to-secondary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.1),transparent_40%)]" />
        
        {/* Logo */}
        <div className="flex items-center gap-3 relative cursor-pointer" onClick={() => navigate('/')}>
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white text-primary shadow-lg">
            <BookOpen size={22} className="stroke-[2.5]" />
          </div>
          <span className="font-outfit font-extrabold text-xl tracking-wide">EduManage Pro</span>
        </div>

        {/* Big Slogan */}
        <div className="max-w-md relative z-10">
          <h2 className="font-outfit font-black text-4xl leading-tight">
            Elevating coaching standards, one session at a time.
          </h2>
          <p className="mt-4 text-white/80 text-sm leading-relaxed">
            Access study notes, resolve doubt queries, track batch timings, and evaluate performance analytics through our state-of-the-art console.
          </p>
        </div>

        {/* Footer */}
        <p className="text-xs text-white/60 relative">© {new Date().getFullYear()} EduManage Pro. All rights reserved.</p>
      </div>

      {/* Right Column - Interactive Form Panel */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 px-6 sm:px-12 md:px-20 py-12 relative">
        <button 
          onClick={() => navigate('/')}
          className="absolute top-8 left-8 flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>

        <div className="w-full max-w-md mx-auto">
          {/* Form Header */}
          <div className="text-left mb-6">
            <h2 className="font-outfit font-black text-3xl text-slate-800 dark:text-white">
              {isForgot ? 'Reset Password' : 'Sign In'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {isForgot 
                ? 'Enter your institutional email to recover account access.'
                : 'Provide credentials to log into your dashboard portal.'
              }
            </p>
          </div>

          {/* Tab Options (Only if not Forgot Mode) */}
          {!isForgot && (
            <div className="flex gap-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-3">
              <button
                type="button"
                onClick={() => { setLoginMethod('email'); setPhoneError(''); }}
                className={`text-xs font-bold pb-1.5 uppercase tracking-wider transition-all border-b-2 ${
                  loginMethod === 'email' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-slate-450 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
                }`}
              >
                Email Console
              </button>
              <button
                type="button"
                onClick={() => { setLoginMethod('phone'); setPhoneError(''); }}
                className={`text-xs font-bold pb-1.5 uppercase tracking-wider transition-all border-b-2 ${
                  loginMethod === 'phone' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-slate-455 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
                }`}
              >
                Phone SMS Authentication
              </button>
            </div>
          )}

          {/* General Login Error Alerts */}
          {authError && !isForgot && loginMethod === 'email' && (
            <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-red-500/10 text-red-650 dark:text-red-400 text-xs animate-in fade-in font-semibold">
              <AlertCircle size={16} className="shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Phone specific error alerts */}
          {phoneError && (
            <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-red-505/10 text-red-650 dark:text-red-400 text-xs animate-in fade-in font-semibold">
              <AlertCircle size={16} className="shrink-0" />
              <span>{phoneError}</span>
            </div>
          )}

          {/* Email Form Panel */}
          {!isForgot && loginMethod === 'email' && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-505">Email Address</label>
                <input 
                  type="email"
                  placeholder="name@example.com"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                  })}
                  className={`w-full px-4 py-3 mt-1.5 text-sm bg-white dark:bg-slate-800 border ${
                    errors.email ? 'border-red-500' : 'border-slate-202 dark:border-slate-700/60'
                  } rounded-xl outline-none focus:border-primary transition-colors text-slate-808 dark:text-white`}
                />
                {errors.email && <span className="text-xs text-red-500 font-medium mt-1 inline-block">{errors.email.message}</span>}
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Password</label>
                  <button 
                    type="button"
                    onClick={() => setIsForgot(true)}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative mt-1.5">
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password', { required: 'Password is required' })}
                    className={`w-full pl-4 pr-12 py-3 text-sm bg-white dark:bg-slate-800 border ${
                      errors.password ? 'border-red-500' : 'border-slate-202 dark:border-slate-700/60'
                    } rounded-xl outline-none focus:border-primary transition-colors text-slate-808 dark:text-white`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <span className="text-xs text-red-500 font-medium mt-1 inline-block">{errors.password.message}</span>}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex items-center justify-center w-full py-3.5 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-glow-primary hover:shadow-premium hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none transform transition-all duration-200 mt-8 text-sm"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Access Dashboard</span>
                )}
              </button>
            </form>
          )}

          {/* Phone Sign-In Form Panel */}
          {!isForgot && loginMethod === 'phone' && (
            <div className="animate-in fade-in duration-200">
              {!otpSent ? (
                /* Request OTP Form */
                <form onSubmit={handleSendOtp} className="space-y-5">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Phone Number (with Country Code) *</label>
                    <div className="relative mt-1.5">
                      <input 
                        type="tel"
                        required
                        placeholder="e.g. +919876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 text-sm bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary transition-colors text-slate-800 dark:text-white"
                      />
                      <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 inline-block">Use country code prefix (e.g., +91 for India, +1 for US).</span>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center justify-center w-full py-3.5 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-glow-primary hover:shadow-premium hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none transform transition-all duration-200 mt-8 text-sm"
                  >
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Send Verification Code</span>
                    )}
                  </button>
                </form>
              ) : (
                /* Verify OTP Form */
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-750 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-slate-550 dark:text-slate-400">OTP Code sent to {phone}</span>
                    <button type="button" onClick={() => setOtpSent(false)} className="text-primary hover:underline font-bold">Change</button>
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">Enter 6-Digit OTP *</label>
                    <div className="relative mt-1.5">
                      <input 
                        type="text"
                        maxLength="6"
                        required
                        placeholder="123456"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 text-sm bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary transition-colors text-slate-800 dark:text-white tracking-widest font-mono font-bold"
                      />
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center justify-center w-full py-3.5 bg-primary text-white font-bold rounded-xl shadow-glow-primary hover:shadow-premium hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none transform transition-all duration-200 mt-8 text-sm"
                  >
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Verify & Access Console</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Forgot Password Panel */}
          {isForgot && (
            <form onSubmit={handleForgotSubmit(onForgotSubmit)} className="space-y-5">
              {forgotSuccess && (
                <div className="p-4 rounded-xl bg-success/10 text-success text-sm font-semibold animate-in fade-in mb-4">
                  {forgotSuccess}
                </div>
              )}
              {forgotError && (
                <div className="p-4 rounded-xl bg-red-505/10 text-red-600 text-sm font-semibold animate-in fade-in mb-4">
                  {forgotError}
                </div>
              )}

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Institutional Email</label>
                <input 
                  type="email"
                  placeholder="name@example.com"
                  {...regForgot('forgotEmail', { 
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                  })}
                  className={`w-full px-4 py-3 mt-1.5 text-sm bg-white dark:bg-slate-800 border ${
                    forgotErrors.forgotEmail ? 'border-red-500' : 'border-slate-202 dark:border-slate-700/60'
                  } rounded-xl outline-none focus:border-primary transition-colors text-slate-808 dark:text-white`}
                />
                {forgotErrors.forgotEmail && <span className="text-xs text-red-500 font-medium mt-1 inline-block">{forgotErrors.forgotEmail.message}</span>}
              </div>

              <div className="flex flex-col gap-3 mt-8">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center w-full py-3.5 bg-primary text-white font-bold rounded-xl shadow-glow-primary hover:shadow-premium hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none transform transition-all duration-200 text-sm"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Dispatch Recovery Link</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgot(false);
                    setForgotSuccess('');
                    setForgotError('');
                  }}
                  className="w-full py-3 text-xs font-semibold text-slate-500 hover:text-slate-808 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-808 rounded-xl transition-colors"
                >
                  Cancel and Return
                </button>
              </div>
            </form>
          )}



        </div>
      </div>

    </div>
  );
};

export default Login;
