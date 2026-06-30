import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import { ArrowLeft, Users, Mail, Phone, Globe, Download, Calendar, FileText, Search, Filter, Grid, List, ArrowRight, Briefcase, User, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

const CandidatePipeline = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [jobFilter, setJobFilter] = useState('All');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/applications/pipeline');
      setApplications(res.data.applications || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load candidate pipeline.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'recruiter')) {
      navigate('/');
      return;
    }
    // Verified check for recruiter
    if (user.role === 'recruiter' && user.verificationStatus !== 'approved') {
      navigate('/recruiter-dashboard');
      return;
    }
    fetchApplications();
  }, [user]);

  // Unique job titles for filtering
  const uniqueJobs = ['All', ...new Set(applications.map(app => app.job?.title).filter(Boolean))];

  // Filter applications
  const filteredApps = applications.filter(app => {
    const candidateName = app.user?.name || app.name || '';
    const jobTitle = app.job?.title || '';
    const companyName = app.job?.company || '';
    const searchString = `${candidateName} ${jobTitle} ${companyName}`.toLowerCase();
    
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    const matchesJob = jobFilter === 'All' || app.job?.title === jobFilter;
    
    return matchesSearch && matchesStatus && matchesJob;
  });

  const statuses = ['All', 'Applied', 'Reviewed', 'Shortlisted', 'Interview', 'Rejected', 'Hired'];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate(user.role === 'admin' ? '/admin-dashboard' : '/recruiter-dashboard')}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-8 h-8 text-brandIndigo" /> Candidate Pipeline
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-semibold">
            Evaluate applications, track interview processes, and hire top candidates.
          </p>
        </div>

        {/* View Mode & Count */}
        <div className="flex items-center gap-4">
          <div className="text-xs font-bold text-slate-500">
            Showing {filteredApps.length} of {applications.length} Applicants
          </div>
          <div className="flex items-center gap-1 bg-slate-900 border border-white/5 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg cursor-pointer transition-all ${viewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg cursor-pointer transition-all ${viewMode === 'list' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/40 p-4 rounded-2xl border border-white/5">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search candidate, job, company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-brandIndigo"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/60 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-brandIndigo font-semibold cursor-pointer"
          >
            {statuses.map(st => (
              <option key={st} value={st}>{st === 'All' ? 'All Statuses' : st}</option>
            ))}
          </select>
        </div>

        {/* Job Filter */}
        <div className="flex items-center gap-2">
          <Briefcase className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/60 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-brandIndigo font-semibold cursor-pointer"
          >
            {uniqueJobs.map(job => (
              <option key={job} value={job}>{job === 'All' ? 'All Jobs' : job}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Panel Content */}
      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredApps.length > 0 ? (
        viewMode === 'grid' ? (
          /* Grid View Layout */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApps.map(app => {
              const candName = app.user?.name || app.name;
              const candEmail = app.user?.email || app.email;
              const candPhone = app.user?.phone || app.phone;
              return (
                <div key={app._id} className="glass rounded-3xl border border-white/5 p-6 hover:border-white/10 transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    {/* Candidate Identity */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-extrabold text-white text-base leading-tight">{candName}</h3>
                        <p className="text-[11px] text-slate-400 mt-1 font-semibold">
                          Applied: {app.job?.title} at <span className="text-slate-200">{app.job?.company}</span>
                        </p>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>

                    {/* Meta Fields */}
                    <div className="space-y-1 text-xs text-slate-500 pt-2 border-t border-white/5 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-600" /> {candEmail}
                      </div>
                      {candPhone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-600" /> {candPhone}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-600" /> {new Date(app.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Skills pills */}
                    {app.user?.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {app.user.skills.slice(0, 3).map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-[10px] font-bold text-slate-400">
                            {s}
                          </span>
                        ))}
                        {app.user.skills.length > 3 && (
                          <span className="text-[10px] text-slate-500 font-bold self-center">+{app.user.skills.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions footer */}
                  <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                    {app.resume ? (
                      <a
                        href={app.resume.startsWith('http') ? app.resume : `${api.defaults.baseURL?.replace('/api', '') || ''}${app.resume}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-brandBlue hover:underline flex items-center gap-1 font-bold"
                      >
                        <Download className="w-3.5 h-3.5" /> Resume
                      </a>
                    ) : (
                      <span className="text-xs text-slate-600">No Resume</span>
                    )}

                    <button
                      onClick={() => navigate(`/candidate-pipeline/${app._id}`)}
                      className="px-3.5 py-1.5 bg-brandIndigo text-slate-100 hover:bg-brandIndigo/80 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-md shadow-brandIndigo/20"
                    >
                      View Profile <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View Layout */
          <div className="glass rounded-3xl border border-white/5 overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse text-slate-300">
              <thead>
                <tr className="border-b border-white/5 text-xs font-bold text-slate-400 uppercase bg-slate-950/40">
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Applied Position</th>
                  <th className="px-6 py-4">Hiring Status</th>
                  <th className="px-6 py-4">Links</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredApps.map(app => {
                  const candName = app.user?.name || app.name;
                  const candEmail = app.user?.email || app.email;
                  return (
                    <tr key={app._id} className="text-sm hover:bg-slate-900/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-100">{candName}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{candEmail}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-200">{app.job?.title}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{app.job?.company}</div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="px-6 py-4 text-xs space-y-1 font-semibold">
                        {app.resume && (
                          <a
                            href={app.resume.startsWith('http') ? app.resume : `${api.defaults.baseURL?.replace('/api', '') || ''}${app.resume}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-brandBlue hover:underline flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" /> Resume Link
                          </a>
                        )}
                        {app.user?.linkedin && (
                          <a href={app.user.linkedin} target="_blank" rel="noreferrer" className="text-brandPurple hover:underline flex items-center gap-1">
                            <Globe className="w-3.5 h-3.5" /> LinkedIn profile
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => navigate(`/candidate-pipeline/${app._id}`)}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-white/5 rounded-xl text-xs font-bold text-slate-300 cursor-pointer transition-colors"
                        >
                          Review Profile
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : (
        /* Empty State */
        <div className="glass rounded-3xl p-16 text-center border border-white/5">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-base font-bold text-slate-300">No applicants found matching filter</h3>
          <p className="text-xs text-slate-500 mt-1">Adjust search parameters or try another status filter category.</p>
        </div>
      )}

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

export default CandidatePipeline;
