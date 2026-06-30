import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProfileForm from '../components/ProfileForm';
import Toast from '../components/Toast';
import { User, Mail, Briefcase, FileCheck } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 relative">
      <div className="absolute top-10 right-10 w-48 h-48 bg-brandIndigo/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Card - Summary info */}
        <div className="glass p-6 rounded-3xl border border-white/5 shadow-2xl flex flex-col items-center text-center space-y-4">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-brandBlue to-brandPurple flex items-center justify-center font-extrabold text-2xl text-white shadow-xl shadow-brandIndigo/20">
            {getInitials(user?.name)}
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-100">{user?.name}</h2>
            <p className="text-xs text-slate-400 font-semibold flex items-center justify-center gap-1.5 mt-1 capitalize">
              <Briefcase className="w-3.5 h-3.5 text-slate-500" />
              <span>{user?.role} account</span>
            </p>
          </div>

          <div className="w-full border-t border-white/5 pt-4 space-y-2 text-xs font-semibold text-slate-400 text-left">
            <div className="flex items-center gap-2 text-slate-300">
              <Mail className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="truncate">{user?.email}</span>
            </div>
            {user?.phone && (
              <div className="flex items-center gap-2 text-slate-300">
                <FileCheck className="w-4 h-4 text-slate-500 shrink-0" />
                <span>{user?.phone}</span>
              </div>
            )}
          </div>

          {user?.skills && user.skills.length > 0 && (
            <div className="w-full border-t border-white/5 pt-4 text-left">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">My Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {user.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-slate-900 border border-white/5 text-[9px] font-bold px-2 py-0.5 rounded text-slate-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Tab - Form inputs */}
        <div className="lg:col-span-2 glass p-6 sm:p-8 rounded-3xl border border-white/5 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-100">Personal Information</h2>
            <p className="text-xs text-slate-400 mt-1">Update your personal contact details, skill tags, and active resume.</p>
          </div>

          <ProfileForm onShowToast={showToast} />
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

export default ProfilePage;
