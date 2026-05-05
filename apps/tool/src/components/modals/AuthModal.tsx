import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Icon } from '../ui/SharedComponents';
import { useAuth } from '../../context/AuthContext';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'sign-in' | 'sign-up' | 'forgot-password' | 'update-password';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { isRecoveryEvent, clearRecoveryEvent } = useAuth();
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && isRecoveryEvent) {
      setMode('update-password');
      resetState();
    }
  }, [isOpen, isRecoveryEvent]);

  if (!isOpen) return null;

  const resetState = () => {
    setEmail('');
    setPassword('');
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(false);
  };

  const handleModeSwitch = (newMode: AuthMode) => {
    setMode(newMode);
    resetState();
  };

  const handleClose = () => {
    resetState();
    if (isRecoveryEvent) clearRecoveryEvent();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === 'sign-in') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        handleClose(); // Auth state change will propagate via onAuthStateChange
      } else if (mode === 'sign-up') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccessMessage('Account created! Please check your email to confirm your address.');
        setEmail('');
        setPassword('');
      } else if (mode === 'forgot-password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin
        });
        if (error) throw error;
        setSuccessMessage('Check your email for the reset link.');
        setEmail('');
      } else if (mode === 'update-password') {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setSuccessMessage('Password updated successfully.');
        setPassword('');
        clearRecoveryEvent();
        setTimeout(() => handleModeSwitch('sign-in'), 2000);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSignIn = mode === 'sign-in';

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onClick={handleClose}
    >
      {/* Glassmorphism backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top gradient accent bar */}
        <div className="h-1.5 w-full bg-brand-gradient" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <h2 id="auth-modal-title" className="text-xl font-heading font-bold text-gray-900">
            {mode === 'sign-in' ? 'Welcome back' :
             mode === 'sign-up' ? 'Create an account' :
             mode === 'forgot-password' ? 'Reset Password' :
             'Update Password'}
          </h2>
          <button
            onClick={handleClose}
            aria-label="Close dialog"
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-1"
          >
            <Icon name="close" size="md" />
          </button>
        </div>

        {/* Mode Toggle Tabs */}
        {(mode === 'sign-in' || mode === 'sign-up') && (
          <div className="flex mx-6 mt-1 mb-4 bg-gray-100 rounded-xl p-1 gap-1">
            <button
              type="button"
              onClick={() => handleModeSwitch('sign-in')}
              className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none
                ${isSignIn
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('sign-up')}
              className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none
                ${!isSignIn
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="px-6 pb-6 mt-4 space-y-4">
          {/* Email */}
          {mode !== 'update-password' && (
            <div className="space-y-1">
              <label htmlFor="auth-email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 text-sm text-gray-900 placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-all"
              />
            </div>
          )}

          {/* Password */}
          {mode !== 'forgot-password' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="auth-password" className="block text-sm font-medium text-gray-700">
                  {mode === 'update-password' ? 'New Password' : 'Password'}
                </label>
                {mode === 'sign-in' && (
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('forgot-password')}
                    className="text-xs text-brand-purple hover:text-brand-midBlue transition-colors focus:outline-none font-medium"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <input
                id="auth-password"
                type="password"
                autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'sign-in' ? '••••••••' : 'Min. 6 characters'}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 text-sm text-gray-900 placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-all"
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <Icon name="alert-error" size="sm" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
              <Icon name="check" size="sm" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl bg-brand-gradient text-white font-heading font-semibold text-sm
                       transition-all duration-200 hover:contrast-125 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2
                       disabled:opacity-60 disabled:cursor-not-allowed shadow-sm mt-2"
          >
            {isSubmitting
              ? (mode === 'sign-in' ? 'Signing in…' : mode === 'sign-up' ? 'Creating account…' : mode === 'forgot-password' ? 'Sending...' : 'Updating...')
              : (mode === 'sign-in' ? 'Sign In' : mode === 'sign-up' ? 'Create Account' : mode === 'forgot-password' ? 'Send Reset Link' : 'Update Password')
            }
          </button>

          {mode === 'forgot-password' && (
            <div className="flex justify-center mt-4">
              <button
                type="button"
                onClick={() => handleModeSwitch('sign-in')}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors focus:outline-none font-medium"
              >
                Back to Sign In
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
