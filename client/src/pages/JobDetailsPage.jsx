import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import { MapPin, DollarSign, Briefcase, Calendar, Award, CheckCircle2, Bookmark, BookmarkCheck, ArrowLeft, Send } from 'lucide-react';

const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    const fetchJobDetails = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/jobs/${id}`);
        setJob(res.data);

        if (user && user.role === 'jobseeker') {
          const appsRes = await api.get('/applications/my');
          const appsList = appsRes.data.applications || appsRes.data || [];
          const matchedApp = appsList.find(app => {
            const appJobId = app.jobId?._id || app.jobId;
            return appJobId === id;
          });
          if (matchedApp) {
            setHasApplied(true);
            setApplicationStatus(matchedApp.status);
          }

          const savedRes = await api.get('/saved');
          const savedJobsList = savedRes.data.savedJobs || savedRes.data || [];
          const savedIds = savedJobsList.map(j => j._id);
          setIsSaved(savedIds.includes(id));
        }
      } catch (err) {
        console.error(err);
        showToast('Error loading job details', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchJobDetails();
  }, [id, user]);

  const handleToggleSave = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'jobseeker') return;
    setSaving(true);
    try {
      if (isSaved) {
        await api.delete(`/saved/${id}`);
        setIsSaved(false);
        showToast('Job removed from saved list.', 'success');
      } else {
        await api.post(`/saved/${id}`);
        setIsSaved(true);
        showToast('Job bookmarked successfully!', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Error updating saved status.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-darkBg">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-300">Job Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">The job post you are looking for does not exist or was removed.</p>
        <Link to="/jobs" className="btn-primary mt-6 inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 relative">
      <Link to="/jobs" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to listings
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-6 sm:p-8 rounded-3xl space-y-6 border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brandBlue/5 rounded-full blur-2xl pointer-events-none"></div>

            {/* Header info */}
            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-white/5 bg-slate-900 text-slate-400 mb-4 uppercase tracking-wider">
                {job.jobType}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">{job.title}</h1>
              <p className="text-base font-semibold text-brandBlue mt-1.5">{job.company}</p>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-y border-white/5 py-6 text-xs font-bold text-slate-400">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Location</span>
                <div className="flex items-center gap-1.5 text-slate-200">
                  <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{job.location}</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Salary Offered</span>
                <div className="flex items-center gap-1.5 text-slate-200">
                  <DollarSign className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{job.salary}</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Experience Level</span>
                <div className="flex items-center gap-1.5 text-slate-200">
                  <Award className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{job.experience} Level</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Job Description</h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{job.description || 'No description provided.'}</p>
            </div>

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Core Responsibilities</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  {job.responsibilities.map((resp, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-brandBlue shrink-0 mt-2"></span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Requirements & Qualifications</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  {job.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-brandPurple shrink-0 mt-2"></span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Action Panel Sidebar */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-3xl space-y-5 border border-white/5 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-200">Job Information</h3>

            <div className="space-y-3.5 text-xs font-semibold text-slate-400">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span>Job Type</span>
                <span className="text-slate-200">{job.jobType}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span>Salary</span>
                <span className="text-slate-200">{job.salary}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span>Posted Date</span>
                <span className="text-slate-200">{new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Target Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {job.skills?.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-slate-900 border border-white/5 text-[10px] font-semibold px-2.5 py-1 rounded-lg text-slate-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Apply & Save Buttons */}
            <div className="pt-4 space-y-3">
              {user ? (
                user.role === 'jobseeker' ? (
                  hasApplied ? (
                    <div className="flex flex-col items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-400 text-center">
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      <span>Applied (Status: {applicationStatus})</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => navigate(`/apply/${job._id}`)}
                      className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-sm cursor-pointer"
                    >
                      <Send className="w-4 h-4" /> Apply Now
                    </button>
                  )
                ) : (
                  <div className="p-3 bg-slate-900/60 border border-white/5 rounded-xl text-xs text-slate-500 text-center font-medium">
                    Posted by You (Recruiter View)
                  </div>
                )
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-sm cursor-pointer"
                >
                  Login to Apply
                </button>
              )}

              {(!user || user.role === 'jobseeker') && (
                <button
                  onClick={handleToggleSave}
                  disabled={saving}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isSaved
                      ? 'bg-brandIndigo/15 border-brandIndigo/40 text-brandIndigo'
                      : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:text-white'
                  }`}
                >
                  {isSaved ? (
                    <>
                      <BookmarkCheck className="w-4 h-4" /> Bookmarked
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4" /> Bookmark Job
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
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

export default JobDetailsPage;
