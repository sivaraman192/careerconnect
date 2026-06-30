import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import ResumeUpload from '../components/ResumeUpload';
import { ArrowLeft, User, Mail, Phone, Link2, FileText, Send } from 'lucide-react';
import { Github } from '../components/SocialIcons';

const ApplyJobPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    portfolio: user?.portfolio || '',
    github: user?.github || '',
    coverLetter: '',
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelected = (file) => {
    setResumeFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      showToast('Name and Email are required!', 'error');
      return;
    }

    if (!resumeFile && !user?.resume) {
      showToast('Please upload a resume file.', 'error');
      return;
    }

    setSubmitting(true);
    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      data.append(key, val);
    });

    if (resumeFile) {
      data.append('resume', resumeFile);
    }

    try {
      await api.post(`/applications/apply/${jobId}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      showToast('Application submitted successfully!', 'success');
      setTimeout(() => {
        navigate('/applications');
      }, 1500);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to submit application.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 relative">
      <Link to={`/jobs/${jobId}`} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Cancel and go back
      </Link>

      <div className="glass p-6 sm:p-8 rounded-3xl border border-white/5 shadow-2xl relative">
        <div className="absolute top-0 right-0 w-24 h-24 bg-brandBlue/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="mb-6">
          <h1 className="text-xl font-extrabold text-white">Apply to Position</h1>
          <p className="text-xs text-slate-400 mt-1 font-semibold">
            Please fill out your contact details and attach your resume.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name */}
            <div className="space-y-1.5 flex flex-col">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" /> Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="input-field"
                placeholder="John Doe"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5 flex flex-col">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" /> Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="input-field"
                placeholder="john@example.com"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5 flex flex-col">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500" /> Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="input-field"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            {/* Portfolio Link */}
            <div className="space-y-1.5 flex flex-col">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-slate-500" /> Portfolio Website
              </label>
              <input
                type="url"
                name="portfolio"
                value={formData.portfolio}
                onChange={handleInputChange}
                className="input-field"
                placeholder="https://portfolio.com"
              />
            </div>

            {/* GitHub Profile */}
            <div className="space-y-1.5 flex flex-col md:col-span-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Github className="w-3.5 h-3.5 text-slate-500" /> GitHub URL
              </label>
              <input
                type="url"
                name="github"
                value={formData.github}
                onChange={handleInputChange}
                className="input-field"
                placeholder="https://github.com/username"
              />
            </div>

            {/* Cover Letter */}
            <div className="space-y-1.5 flex flex-col md:col-span-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" /> Cover Letter / Message to hiring manager
              </label>
              <textarea
                name="coverLetter"
                rows="4"
                value={formData.coverLetter}
                onChange={handleInputChange}
                className="input-field resize-none"
                placeholder="Tell us why you are a good fit for this role..."
              ></textarea>
            </div>

            {/* Resume Upload */}
            <div className="space-y-1.5 flex flex-col md:col-span-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Submit Resume</label>
              <ResumeUpload onFileSelected={handleFileSelected} currentResumePath={user?.resume} />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-white/5">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex items-center gap-2 px-6 py-3 cursor-pointer"
            >
              <Send className="w-4 h-4 shrink-0" />
              <span>{submitting ? 'Submitting application...' : 'Submit Application'}</span>
            </button>
          </div>
        </form>
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

export default ApplyJobPage;
