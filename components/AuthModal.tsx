import React, { useState } from 'react';
import type { AuthError } from '@supabase/supabase-js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmailSignUp: (email_address: string, password_strong: string) => Promise<{ error: AuthError | null; requiresConfirmation?: boolean }>;
  onEmailSignIn: (email_address: string, password_input: string) => Promise<{ error: AuthError | null }>;
  onGoogleAuth: () => Promise<void>;
}

const GoogleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24"  className="w-5 h-5" {...props}>
        <path fill="#4285F4" d="M21.35,11.1H12.18V13.83H18.67C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12.5C5,8.75 8.36,5.73 12.19,5.73C14.03,5.73 15.6,6.33 16.84,7.38L19.09,5.22C17.11,3.56 14.8,2.66 12.19,2.66C6.97,2.66 3,7.22 3,12.5C3,17.78 6.97,22.34 12.19,22.34C17.9,22.34 21.73,18.35 21.73,12.81C21.73,12.23 21.55,11.65 21.35,11.1Z" />
    </svg>
);

const MailIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
  </svg>
);


export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onEmailSignUp,
  onEmailSignIn,
  onGoogleAuth,
}) => {
  const [activeView, setActiveView] = useState<'signUp' | 'signIn'>('signUp');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

  if (!isOpen) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoadingEmail(true);

    if (activeView === 'signUp') {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setIsLoadingEmail(false);
        return;
      }
      const { error: signUpError, requiresConfirmation } = await onEmailSignUp(email, password);
      if (signUpError) {
        setError(signUpError.message || "Sign up failed. Please try again.");
      } else if (requiresConfirmation) {
        setMessage("Sign up successful! Please check your email to confirm your account.");
        setEmail(''); setPassword(''); setConfirmPassword('');
        // setTimeout(onClose, 3000); // Optionally close after message
      } else {
         // This case implies sign up was successful and user is likely auto-signed in (e.g. email confirmation disabled)
        setMessage("Sign up successful!");
        // onClose will be handled by onAuthStateChange in App.tsx
      }
    } else { // Sign In
      const { error: signInError } = await onEmailSignIn(email, password);
      if (signInError) {
        setError(signInError.message || "Sign in failed. Please check your credentials.");
      } else {
        // onClose will be handled by onAuthStateChange in App.tsx upon successful sign-in
         setMessage("Sign in successful!");
      }
    }
    setIsLoadingEmail(false);
  };

  const handleGoogleAuthClick = async () => {
    setError(null);
    setMessage(null);
    setIsLoadingGoogle(true);
    try {
      await onGoogleAuth();
      // For OAuth, Supabase handles redirection. The modal might close or stay open
      // depending on the UX flow after redirect. `onAuthStateChange` in App.tsx will
      // eventually handle the `SIGNED_IN` state and can close the modal.
    } catch (e: any) {
      setError(e.message || "Google authentication failed.");
    }
    // setIsLoadingGoogle(false); // Might not be reached if redirect happens
  };
  
  const resetFormState = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setMessage(null);
    setIsLoadingEmail(false);
    setIsLoadingGoogle(false);
  };

  const switchView = (view: 'signUp' | 'signIn') => {
    setActiveView(view);
    resetFormState();
  }

  return (
    <div
      className="fixed inset-0 bg-[#394240]/70 flex items-center justify-center z-[1050] p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="auth-modal-title"
    >
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl max-w-md w-full transform transition-all animate-fadeInScale">
        <div className="flex justify-between items-center mb-6">
            <h2 id="auth-modal-title" className="text-2xl font-bold text-[#394240] font-['Poppins']">
            {activeView === 'signUp' ? 'Create Account' : 'Welcome Back'}
            </h2>
            <button onClick={() => {resetFormState(); onClose();}} className="text-neutral-500 hover:text-neutral-700">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        
        {error && <p className="mb-4 text-sm text-center text-[#FF8A65] bg-[#FFF0E6] p-2.5 rounded-md font-['Roboto']">{error}</p>}
        {message && <p className="mb-4 text-sm text-center text-[#00796B] bg-[#E0F2F1] p-2.5 rounded-md font-['Roboto']">{message}</p>}

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label htmlFor="email-input" className="block text-sm font-medium text-[#394240] mb-1 font-['Poppins']">Email</label>
            <input
              type="email"
              id="email-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-neutral-300 bg-white rounded-lg shadow-sm focus:ring-[#80CBC4] focus:border-[#80CBC4] transition-colors duration-150 font-['Roboto']"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password-input" className="block text-sm font-medium text-[#394240] mb-1 font-['Poppins']">Password</label>
            <input
              type="password"
              id="password-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full p-3 border border-neutral-300 bg-white rounded-lg shadow-sm focus:ring-[#80CBC4] focus:border-[#80CBC4] transition-colors duration-150 font-['Roboto']"
              placeholder="••••••••"
            />
          </div>
          {activeView === 'signUp' && (
            <div>
              <label htmlFor="confirm-password-input" className="block text-sm font-medium text-[#394240] mb-1 font-['Poppins']">Confirm Password</label>
              <input
                type="password"
                id="confirm-password-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full p-3 border border-neutral-300 bg-white rounded-lg shadow-sm focus:ring-[#80CBC4] focus:border-[#80CBC4] transition-colors duration-150 font-['Roboto']"
                placeholder="••••••••"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={isLoadingEmail || isLoadingGoogle}
            className="w-full flex items-center justify-center gap-2 bg-[#9CCC65] hover:bg-[#8BC34A] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-150 text-lg font-['Poppins'] shadow-md disabled:bg-[#BDBDBD]"
          >
            {isLoadingEmail ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : <MailIcon />}
            {activeView === 'signUp' ? 'Sign Up with Email' : 'Sign In with Email'}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <hr className="flex-grow border-neutral-300"/>
          <span className="mx-4 text-sm text-[#607D8B] font-['Roboto']">OR</span>
          <hr className="flex-grow border-neutral-300"/>
        </div>

        <button
          onClick={handleGoogleAuthClick}
          disabled={isLoadingEmail || isLoadingGoogle}
          className="w-full flex items-center justify-center gap-2 bg-white hover:bg-neutral-100 text-[#394240] font-semibold py-3 px-4 rounded-lg transition-colors duration-150 text-lg font-['Poppins'] shadow-md border border-neutral-300 disabled:bg-neutral-200"
        >
          {isLoadingGoogle ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#394240]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : <GoogleIcon /> }
          {activeView === 'signUp' ? 'Sign Up with Google' : 'Sign In with Google'}
        </button>

        <div className="mt-6 text-center">
          {activeView === 'signUp' ? (
            <p className="text-sm text-[#607D8B] font-['Roboto']">
              Already have an account?{' '}
              <button onClick={() => switchView('signIn')} className="font-medium text-[#80CBC4] hover:text-[#00796B] hover:underline">
                Sign In
              </button>
            </p>
          ) : (
            <p className="text-sm text-[#607D8B] font-['Roboto']">
              Don't have an account?{' '}
              <button onClick={() => switchView('signUp')} className="font-medium text-[#80CBC4] hover:text-[#00796B] hover:underline">
                Sign Up
              </button>
            </p>
          )}
        </div>

        <style>{`
          @keyframes fadeInScale {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          .animate-fadeInScale {
            animation: fadeInScale 0.3s ease-out forwards;
          }
        `}</style>
      </div>
    </div>
  );
};
