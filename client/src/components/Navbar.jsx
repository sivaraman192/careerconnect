import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Briefcase, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-white/5 bg-slate-950/70 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link 
              to={isAuthenticated && user.role === 'recruiter' ? '/recruiter-dashboard' : '/'} 
              className="flex items-center gap-2 text-xl font-bold tracking-tight"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brandBlue to-brandPurple text-white shadow-md shadow-brandBlue/20">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent font-extrabold">
                Career<span className="text-brandBlue font-bold">Connect</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {/* Home link: Show for Public, Jobseeker, Admin (Not Recruiter) */}
            {(!isAuthenticated || user.role !== 'recruiter') && (
              <Link
                to="/"
                className={`text-sm font-semibold transition-colors hover:text-white ${
                  isActive('/') ? 'text-brandBlue' : 'text-slate-300'
                }`}
              >
                Home
              </Link>
            )}

            {/* Find Jobs: Show for Public, Jobseeker (Not Recruiter, Admin) */}
            {(!isAuthenticated || user.role === 'jobseeker') && (
              <Link
                to="/jobs"
                className={`text-sm font-semibold transition-colors hover:text-white ${
                  isActive('/jobs') ? 'text-brandBlue' : 'text-slate-300'
                }`}
              >
                Find Jobs
              </Link>
            )}

            {isAuthenticated && (
              <>
                {user.role === 'jobseeker' && (
                  <>
                    <Link
                      to="/applications"
                      className={`text-sm font-semibold transition-colors hover:text-white ${
                        isActive('/applications') ? 'text-brandBlue' : 'text-slate-300'
                      }`}
                    >
                      My Applications
                    </Link>
                    <Link
                      to="/saved"
                      className={`text-sm font-semibold transition-colors hover:text-white ${
                        isActive('/saved') ? 'text-brandBlue' : 'text-slate-300'
                      }`}
                    >
                      Saved Jobs
                    </Link>
                  </>
                )}

                {user.role === 'recruiter' && (
                  <>
                    <Link
                      to="/recruiter-dashboard"
                      className={`text-sm font-semibold transition-colors hover:text-white ${
                        isActive('/recruiter-dashboard') ? 'text-brandBlue' : 'text-slate-300'
                      }`}
                    >
                      Recruiter Console
                    </Link>
                    <Link
                      to="/candidate-pipeline"
                      className={`text-sm font-semibold transition-colors hover:text-white ${
                        isActive('/candidate-pipeline') ? 'text-brandBlue' : 'text-slate-300'
                      }`}
                    >
                      Candidate Pipeline
                    </Link>
                  </>
                )}

                {user.role === 'admin' && (
                  <>
                    <Link
                      to="/admin-dashboard"
                      className={`text-sm font-semibold transition-colors hover:text-white ${
                        isActive('/admin-dashboard') && !location.search.includes('tab=') ? 'text-brandBlue' : 'text-slate-300'
                      }`}
                    >
                      Admin Console
                    </Link>
                    <Link
                      to="/candidate-pipeline"
                      className={`text-sm font-semibold transition-colors hover:text-white ${
                        isActive('/candidate-pipeline') ? 'text-brandBlue' : 'text-slate-300'
                      }`}
                    >
                      Candidate Pipeline
                    </Link>
                    <Link
                      to="/admin-dashboard?tab=users"
                      className={`text-sm font-semibold transition-colors hover:text-white ${
                        location.search.includes('tab=users') ? 'text-brandBlue' : 'text-slate-300'
                      }`}
                    >
                      Users
                    </Link>
                    <Link
                      to="/admin-dashboard?tab=jobs"
                      className={`text-sm font-semibold transition-colors hover:text-white ${
                        location.search.includes('tab=jobs') ? 'text-brandBlue' : 'text-slate-300'
                      }`}
                    >
                      Jobs
                    </Link>
                  </>
                )}

                <Link
                  to="/profile"
                  className={`text-sm font-semibold transition-colors hover:text-white ${
                    isActive('/profile') ? 'text-brandBlue' : 'text-slate-300'
                  }`}
                >
                  Profile
                </Link>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-100">{user.name}</p>
                  <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/80 text-slate-200 hover:text-white hover:bg-slate-700/80 px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-primary py-2 px-4 text-sm font-semibold rounded-xl">
                  Register
                </Link>
              </>
            )}
          </div>

          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden glass border-t border-white/5 bg-slate-950/95 shadow-xl">
          <div className="space-y-1 px-4 py-3">
            {/* Home link */}
            {(!isAuthenticated || user.role !== 'recruiter') && (
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className={`block rounded-lg px-3 py-2 text-base font-medium ${
                  isActive('/') ? 'bg-slate-900 text-white' : 'text-slate-300 hover:bg-slate-900/50'
                }`}
              >
                Home
              </Link>
            )}

            {/* Find Jobs */}
            {(!isAuthenticated || user.role === 'jobseeker') && (
              <Link
                to="/jobs"
                onClick={() => setIsOpen(false)}
                className={`block rounded-lg px-3 py-2 text-base font-medium ${
                  isActive('/jobs') ? 'bg-slate-900 text-white' : 'text-slate-300 hover:bg-slate-900/50'
                }`}
              >
                Find Jobs
              </Link>
            )}

            {isAuthenticated ? (
              <>
                {user.role === 'jobseeker' && (
                  <>
                    <Link
                      to="/applications"
                      onClick={() => setIsOpen(false)}
                      className={`block rounded-lg px-3 py-2 text-base font-medium ${
                        isActive('/applications') ? 'bg-slate-900 text-white' : 'text-slate-300 hover:bg-slate-900/50'
                      }`}
                    >
                      My Applications
                    </Link>
                    <Link
                      to="/saved"
                      onClick={() => setIsOpen(false)}
                      className={`block rounded-lg px-3 py-2 text-base font-medium ${
                        isActive('/saved') ? 'bg-slate-900 text-white' : 'text-slate-300 hover:bg-slate-900/50'
                      }`}
                    >
                      Saved Jobs
                    </Link>
                  </>
                )}

                {user.role === 'recruiter' && (
                  <>
                    <Link
                      to="/recruiter-dashboard"
                      onClick={() => setIsOpen(false)}
                      className={`block rounded-lg px-3 py-2 text-base font-medium ${
                        isActive('/recruiter-dashboard') ? 'bg-slate-900 text-white' : 'text-slate-300 hover:bg-slate-900/50'
                      }`}
                    >
                      Recruiter Console
                    </Link>
                    <Link
                      to="/candidate-pipeline"
                      onClick={() => setIsOpen(false)}
                      className={`block rounded-lg px-3 py-2 text-base font-medium ${
                        isActive('/candidate-pipeline') ? 'bg-slate-900 text-white' : 'text-slate-300 hover:bg-slate-900/50'
                      }`}
                    >
                      Candidate Pipeline
                    </Link>
                  </>
                )}

                {user.role === 'admin' && (
                  <>
                    <Link
                      to="/admin-dashboard"
                      onClick={() => setIsOpen(false)}
                      className={`block rounded-lg px-3 py-2 text-base font-medium ${
                        isActive('/admin-dashboard') && !location.search.includes('tab=') ? 'bg-slate-900 text-white' : 'text-slate-300 hover:bg-slate-900/50'
                      }`}
                    >
                      Admin Console
                    </Link>
                    <Link
                      to="/candidate-pipeline"
                      onClick={() => setIsOpen(false)}
                      className={`block rounded-lg px-3 py-2 text-base font-medium ${
                        isActive('/candidate-pipeline') ? 'bg-slate-900 text-white' : 'text-slate-300 hover:bg-slate-900/50'
                      }`}
                    >
                      Candidate Pipeline
                    </Link>
                    <Link
                      to="/admin-dashboard?tab=users"
                      onClick={() => setIsOpen(false)}
                      className={`block rounded-lg px-3 py-2 text-base font-medium ${
                        location.search.includes('tab=users') ? 'bg-slate-900 text-white' : 'text-slate-300 hover:bg-slate-900/50'
                      }`}
                    >
                      Users
                    </Link>
                    <Link
                      to="/admin-dashboard?tab=jobs"
                      onClick={() => setIsOpen(false)}
                      className={`block rounded-lg px-3 py-2 text-base font-medium ${
                        location.search.includes('tab=jobs') ? 'bg-slate-900 text-white' : 'text-slate-300 hover:bg-slate-900/50'
                      }`}
                    >
                      Jobs
                    </Link>
                  </>
                )}

                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className={`block rounded-lg px-3 py-2 text-base font-medium ${
                    isActive('/profile') ? 'bg-slate-900 text-white' : 'text-slate-300 hover:bg-slate-900/50'
                  }`}
                >
                  Profile
                </Link>

                <div className="border-t border-white/5 my-2 pt-2">
                  <div className="px-3 py-2 text-sm text-slate-400 capitalize">Logged in as {user.name}</div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-base font-medium text-rose-400 hover:bg-slate-900/50 cursor-pointer"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="border-t border-white/5 my-2 pt-2 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block text-center rounded-lg px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-900/50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="btn-primary block text-center rounded-xl py-2.5 text-base"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
