import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Toast from '../components/Toast';
import { Briefcase, Mail, ArrowLeft, Send } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email address.', 'error');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast('Password recovery link has been dispatched to your email!', 'success');
      setEmail('');
    }, 1000);
  };

  return (
    <div className="gradient-bg min-h-[calc(screen-16px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-brandBlue/10 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-brandPurple/10 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 glass p-8 rounded-3xl relative z-10 border border-white/5 shadow-2xl">
        <div className="text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brandBlue to-brandPurple text-white mx-auto shadow-lg shadow-brandBlue/20 mb-4">
            <Briefcase className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Recover Password</h2>
          <p className="mt-1 text-xs text-slate-400 font-semibold">
            Input your email and we'll send a password reset link
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="space-y-1.5 flex flex-col">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-500" /> Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="name@example.com"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4 shrink-0" />
            <span>{loading ? 'Sending link...' : 'Send Recovery Link'}</span>
          </button>
        </form>

        <div className="text-center text-xs font-semibold text-slate-400 mt-6 pt-4 border-t border-white/5 flex items-center justify-center">
          <Link to="/login" className="font-bold text-brandBlue hover:text-brandIndigo transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
          </Link>
        </div>
      </div>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
};

export default ForgotPasswordPage;
