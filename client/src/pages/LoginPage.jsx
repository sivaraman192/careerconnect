import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import { Briefcase, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { getDashboardPath } from '../components/ProtectedRoute';

const LoginPage = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const from = location.state?.from?.pathname || '';

  useEffect(() => {
    // If already logged in, redirect
    if (user) {
      if (from) {
        navigate(from, { replace: true });
      } else {
        const dest = user.role === 'recruiter' ? '/recruiter-dashboard' : '/';
        navigate(dest, { replace: true });
      }
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password.', 'error');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      // Success toast trigger
      showToast(`Welcome back, ${loggedUser.name}!`, 'success');
    } catch (err) {
      console.error(err);
      showToast(err || 'Invalid email or password.', 'error');
    } finally {
      setLoading(false);
    }
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
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Welcome Back</h2>
          <p className="mt-1 text-xs text-slate-400 font-semibold">
            Login to your dashboard to manage jobs and applications
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

          {/* Password */}
          <div className="space-y-1.5 flex flex-col relative">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-500" /> Password
            </label>
            <div className="relative flex">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-10 w-full"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 rounded"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex items-center justify-end text-xs">
            <Link to="/forgot-password" className="font-bold text-brandBlue hover:text-brandIndigo transition-colors">
              Forgot Password?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 cursor-pointer"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="text-center text-xs font-semibold text-slate-400 mt-6 pt-4 border-t border-white/5">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-brandBlue hover:text-brandIndigo transition-colors">
            Register now
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

export default LoginPage;
