import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import { LayoutDashboard, Users, Briefcase, FileText, Check, X, ShieldAlert, ArrowLeft, RefreshCw } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('approvals');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Sync tab with search query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['approvals', 'users', 'jobs', 'applications'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  // Data states
  const [pendingRecruiters, setPendingRecruiters] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [allApplications, setAllApplications] = useState([]);
  const [stats, setStats] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);

      // Fetch pending recruiters
      const pendingRes = await api.get('/admin/recruiters/pending');
      setPendingRecruiters(pendingRes.data.recruiters || []);

      // Fetch all users
      const usersRes = await api.get('/admin/users');
      setAllUsers(usersRes.data.users || []);

      // Fetch all jobs
      const jobsRes = await api.get('/jobs');
      setAllJobs(jobsRes.data.jobs || []);

      // Fetch all applications
      const appsRes = await api.get('/applications');
      setAllApplications(appsRes.data.applications || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load administrative panel data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchDashboardData();
  }, [user]);

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/recruiters/${id}/approve`);
      showToast('Recruiter profile approved successfully.', 'success');
      
      // Update local states
      setPendingRecruiters(prev => prev.filter(r => r._id !== id));
      setAllUsers(prev => prev.map(u => u._id === id ? { ...u, verificationStatus: 'approved' } : u));
    } catch (err) {
      console.error(err);
      showToast('Failed to approve recruiter.', 'error');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/admin/recruiters/${id}/reject`);
      showToast('Recruiter profile rejected.', 'warning');
      
      // Update local states
      setPendingRecruiters(prev => prev.filter(r => r._id !== id));
      setAllUsers(prev => prev.map(u => u._id === id ? { ...u, verificationStatus: 'rejected' } : u));
    } catch (err) {
      console.error(err);
      showToast('Failed to reject recruiter.', 'error');
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job listing?')) return;
    try {
      await api.delete(`/jobs/${id}`);
      showToast('Job listing deleted successfully.', 'success');
      setAllJobs(prev => prev.filter(j => j._id !== id));
    } catch (err) {
      console.error(err);
      showToast('Failed to delete job listing.', 'error');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/')}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <LayoutDashboard className="w-8 h-8 text-brandIndigo" /> Administrative Console
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-semibold">
            System overview, recruiter approvals, active postings, and user listings.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="p-2 rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white cursor-pointer transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Stats Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass p-5 rounded-2xl border border-white/5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Jobs</span>
          <span className="text-2xl font-extrabold text-white mt-1 block">{allJobs.length}</span>
        </div>
        <div className="glass p-5 rounded-2xl border border-white/5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Candidates Applied</span>
          <span className="text-2xl font-extrabold text-white mt-1 block">{allApplications.length}</span>
        </div>
        <div className="glass p-5 rounded-2xl border border-white/5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Shortlisted</span>
          <span className="text-2xl font-extrabold text-white mt-1 block">
            {allApplications.filter(a => ['Shortlisted', 'Interview'].includes(a.status)).length}
          </span>
        </div>
        <div className="glass p-5 rounded-2xl border border-white/5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Pending Approvals</span>
          <span className="text-2xl font-extrabold text-amber-400 mt-1 block">{pendingRecruiters.length}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-px">
        {[
          { id: 'approvals', name: `Recruiter Approvals (${pendingRecruiters.length})`, icon: ShieldAlert },
          { id: 'users', name: `Platform Users (${allUsers.length})`, icon: Users },
          { id: 'jobs', name: `Job Listings (${allJobs.length})`, icon: Briefcase },
          { id: 'applications', name: `Applications (${allApplications.length})`, icon: FileText }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === t.id
                ? 'border-brandIndigo text-slate-100 bg-slate-900/10'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.name}
          </button>
        ))}
      </div>

      {/* Panels */}
      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Approvals tab */}
          {activeTab === 'approvals' && (
            <div className="space-y-4">
              {pendingRecruiters.length > 0 ? (
                <div className="glass rounded-3xl border border-white/5 overflow-hidden overflow-x-auto">
                  <table className="w-full text-left border-collapse text-slate-300">
                    <thead>
                      <tr className="border-b border-white/5 text-xs font-bold text-slate-400 uppercase bg-slate-950/40">
                        <th className="px-6 py-4">Recruiter Name</th>
                        <th className="px-6 py-4">Company Details</th>
                        <th className="px-6 py-4">Verification</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {pendingRecruiters.map(r => (
                        <tr key={r._id} className="text-sm hover:bg-slate-900/10 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-100">{r.name}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{r.email} • {r.phone}</div>
                          </td>
                          <td className="px-6 py-4 text-xs space-y-1">
                            <div><span className="text-slate-500">Company:</span> <span className="text-slate-300 font-semibold">{r.companyName}</span></div>
                            <div><span className="text-slate-500">Designation:</span> <span className="text-slate-300 font-semibold">{r.designation}</span></div>
                            <div><span className="text-slate-500">Industry:</span> <span className="text-slate-300 font-semibold">{r.industry} • {r.companySize} employees</span></div>
                            {r.companyWebsite && (
                              <div>
                                <span className="text-slate-500">Website:</span>{' '}
                                <a href={r.companyWebsite} target="_blank" rel="noreferrer" className="text-brandBlue hover:underline font-semibold">
                                  {r.companyWebsite}
                                </a>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border bg-amber-500/10 border-amber-500/20 text-amber-400">
                              {r.verificationStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => handleApprove(r._id)}
                                className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-xl transition-all cursor-pointer"
                                title="Approve Recruiter"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReject(r._id)}
                                className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all cursor-pointer"
                                title="Reject Recruiter"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="glass rounded-3xl p-12 text-center border border-white/5">
                  <h3 className="text-sm font-bold text-slate-300">No pending recruiter approvals</h3>
                  <p className="text-xs text-slate-500 mt-1">Recruiter submissions are cleared and up-to-date.</p>
                </div>
              )}
            </div>
          )}

          {/* Users tab */}
          {activeTab === 'users' && (
            <div className="glass rounded-3xl border border-white/5 overflow-hidden overflow-x-auto">
              <table className="w-full text-left border-collapse text-slate-300">
                <thead>
                  <tr className="border-b border-white/5 text-xs font-bold text-slate-400 uppercase bg-slate-950/40">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Verification</th>
                    <th className="px-6 py-4">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {allUsers.map(u => (
                    <tr key={u._id} className="text-sm hover:bg-slate-900/10 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-100">{u.name}</td>
                      <td className="px-6 py-4 text-slate-400">{u.email}</td>
                      <td className="px-6 py-4 font-bold capitalize text-brandBlue">{u.role}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${
                          u.verificationStatus === 'approved' 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                            : u.verificationStatus === 'rejected'
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                            : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        }`}>
                          {u.verificationStatus || 'approved'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-semibold">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Jobs tab */}
          {activeTab === 'jobs' && (
            <div className="glass rounded-3xl border border-white/5 overflow-hidden overflow-x-auto">
              <table className="w-full text-left border-collapse text-slate-300">
                <thead>
                  <tr className="border-b border-white/5 text-xs font-bold text-slate-400 uppercase bg-slate-950/40">
                    <th className="px-6 py-4">Job Title</th>
                    <th className="px-6 py-4">Company</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {allJobs.map(j => (
                    <tr key={j._id} className="text-sm hover:bg-slate-900/10 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-100">{j.title}</td>
                      <td className="px-6 py-4 text-slate-400">{j.company}</td>
                      <td className="px-6 py-4">{j.location}</td>
                      <td className="px-6 py-4 font-semibold text-brandPurple">{j.jobType}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDeleteJob(j._id)}
                          className="px-2 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-colors cursor-pointer text-xs font-bold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Applications tab */}
          {activeTab === 'applications' && (
            <div className="glass rounded-3xl border border-white/5 overflow-hidden overflow-x-auto">
              <table className="w-full text-left border-collapse text-slate-300">
                <thead>
                  <tr className="border-b border-white/5 text-xs font-bold text-slate-400 uppercase bg-slate-950/40">
                    <th className="px-6 py-4">Candidate</th>
                    <th className="px-6 py-4">Job Post</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {allApplications.map(a => (
                    <tr key={a._id} className="text-sm hover:bg-slate-900/10 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-100">{a.name}</td>
                      <td className="px-6 py-4 text-brandBlue font-semibold">{a.jobId?.title || 'Unknown Job'}</td>
                      <td className="px-6 py-4 text-slate-400">{a.email}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-semibold">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => navigate(`/candidate-pipeline/${a._id}`)}
                          className="px-3.5 py-1.5 bg-brandIndigo text-slate-100 hover:bg-brandIndigo/80 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-brandIndigo/10"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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

export default AdminDashboard;
