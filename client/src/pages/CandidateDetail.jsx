import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import { ArrowLeft, User, Mail, Phone, Globe, Download, Calendar, Save, FileText, CheckCircle2, ChevronRight, Briefcase } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

const CandidateDetail = () => {
  const { applicationId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Update panel states
  const [status, setStatus] = useState('Applied');
  const [notes, setNotes] = useState('');
  const [interviewDate, setInterviewDate] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const fetchApplicationDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/applications/${applicationId}`);
      const app = res.data.application;
      setApplication(app);

      // Populate edit states
      setStatus(app.status || 'Applied');
      setNotes(app.notes || '');
      setInterviewDate(app.interviewDate ? new Date(app.interviewDate).toISOString().substring(0, 16) : '');
    } catch (err) {
      console.error(err);
      showToast('Failed to load candidate application details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'recruiter')) {
      navigate('/');
      return;
    }
    fetchApplicationDetails();
  }, [applicationId, user]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const payload = {
        status,
        notes,
        interviewDate: interviewDate || null
      };

      const res = await api.put(`/applications/${applicationId}/status`, payload);
      setApplication(res.data.application);
      showToast('Candidate application status updated successfully.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to update candidate status.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Application Not Found</h2>
        <p className="text-slate-400 text-sm">The candidate application profile could not be loaded.</p>
        <button onClick={() => navigate('/candidate-pipeline')} className="btn-primary px-4 py-2 cursor-pointer">
          Back to Pipeline
        </button>
      </div>
    );
  }

  const candName = application.user?.name || application.name;
  const candEmail = application.user?.email || application.email;
  const candPhone = application.user?.phone || application.phone;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <div>
        <button
          onClick={() => navigate('/candidate-pipeline')}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold cursor-pointer mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Pipeline
        </button>
        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <span>Pipeline</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>Candidates</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-brandIndigo">{candName}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Summary Header Card */}
          <div className="glass p-6 rounded-3xl border border-white/5 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-brandIndigo/5 rounded-full blur-[60px] pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brandBlue to-brandPurple text-white flex items-center justify-center shadow-lg font-black text-2xl">
                  {candName.charAt(0)}
                </div>
                <div>
                  <h1 className="text-2xl font-black text-white">{candName}</h1>
                  <p className="text-xs text-slate-400 mt-1 font-semibold flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" /> Experience Level: <span className="text-slate-200">{application.user?.experience || 'Not Specified'}</span>
                  </p>
                </div>
              </div>
              <div className="self-start md:self-center">
                <StatusBadge status={application.status} />
              </div>
            </div>

            {/* Contacts & Social links */}
            <div className="border-t border-white/5 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-400">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-500" /> {candEmail}
                </div>
                {candPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-500" /> {candPhone}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" /> Applied: {new Date(application.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="space-y-2">
                {application.resume && (
                  <a
                    href={application.resume.startsWith('http') ? application.resume : `${api.defaults.baseURL?.replace('/api', '') || ''}${application.resume}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brandBlue hover:underline flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download Resume
                  </a>
                )}
                {application.user?.linkedin && (
                  <a href={application.user.linkedin} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white flex items-center gap-2">
                    <Globe className="w-4 h-4" /> LinkedIn Profile
                  </a>
                )}
                {application.user?.github && (
                  <a href={application.user.github} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white flex items-center gap-2">
                    <Globe className="w-4 h-4" /> GitHub Profile
                  </a>
                )}
                {application.user?.portfolio && (
                  <a href={application.user.portfolio} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Portfolio Site
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Job details applied */}
          <div className="glass p-6 rounded-3xl border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Applied Position Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold">
              <div>
                <span className="text-slate-500 block">Position Title</span>
                <span className="text-slate-200 text-sm">{application.job?.title}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Company</span>
                <span className="text-slate-200 text-sm">{application.job?.company}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Location</span>
                <span className="text-slate-200 text-sm">{application.job?.location}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Job Type</span>
                <span className="text-slate-200 text-sm">{application.job?.jobType}</span>
              </div>
              {application.job?.salary && (
                <div>
                  <span className="text-slate-500 block">Salary Package</span>
                  <span className="text-slate-200 text-sm">{application.job?.salary}</span>
                </div>
              )}
            </div>
          </div>

          {/* Skills segment */}
          <div className="glass p-6 rounded-3xl border border-white/5 space-y-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Candidate Skills</h3>
            {application.user?.skills?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {application.user.skills.map((s, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-xl bg-slate-900 border border-white/5 text-xs font-bold text-slate-300">
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No specific skills listed on the candidate profile.</p>
            )}
          </div>

          {/* Cover Letter */}
          <div className="glass p-6 rounded-3xl border border-white/5 space-y-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Cover Letter / Statement</h3>
            {application.coverLetter ? (
              <div className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-white/5 max-h-[300px] overflow-y-auto whitespace-pre-line">
                {application.coverLetter}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No cover letter was submitted with this application.</p>
            )}
          </div>

        </div>

        {/* Right 1 Col: Status Update Form */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-3xl border border-white/5 space-y-5 bg-slate-950/20">
            <div>
              <h3 className="text-base font-extrabold text-white">Update Application Status</h3>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold">Change hiring stages, set interview date/time, and add review remarks.</p>
            </div>

            <form onSubmit={handleStatusUpdate} className="space-y-4">
              
              {/* Select Status */}
              <div className="space-y-1.5 flex flex-col">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hiring Stage</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="bg-slate-950 border border-slate-700/60 rounded-xl text-slate-300 px-3.5 py-3 focus:outline-none focus:border-brandIndigo text-xs font-semibold cursor-pointer"
                >
                  <option value="Applied">Applied</option>
                  <option value="Reviewed">Reviewed</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Interview">Interview Scheduled</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Hired">Hired</option>
                </select>
              </div>

              {/* Interview Date Picker */}
              {status === 'Interview' && (
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" /> Interview Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="bg-slate-950 border border-slate-700/60 rounded-xl text-slate-300 px-3.5 py-2.5 focus:outline-none focus:border-brandIndigo text-xs font-semibold"
                  />
                </div>
              )}

              {/* Notes */}
              <div className="space-y-1.5 flex flex-col">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reviewer Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="bg-slate-950 border border-slate-700/60 rounded-xl text-slate-300 px-3.5 py-2.5 focus:outline-none focus:border-brandIndigo text-xs font-semibold placeholder:text-slate-600"
                  placeholder="Add administrative context, interview feedback, or details..."
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={updating}
                className="w-full btn-primary py-3 cursor-pointer text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-brandIndigo/25"
              >
                <Save className="w-4 h-4" /> {updating ? 'Saving Changes...' : 'Save Decision'}
              </button>

            </form>
          </div>

          {/* Audit trail */}
          {application.updatedBy && (
            <div className="p-4 bg-slate-950/40 rounded-2xl border border-white/5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Last status update processed by system reviewer.
            </div>
          )}
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

export default CandidateDetail;
