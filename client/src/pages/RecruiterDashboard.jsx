import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import Sidebar from '../components/Sidebar';
import DashboardCard from '../components/DashboardCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ApplicationTable from '../components/ApplicationTable';
import { LayoutDashboard, Briefcase, PlusCircle, Users, Trash2, Edit, Calendar, MapPin, DollarSign, Send, ArrowLeft, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Stats & listings
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  
  // Applications management
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [updatingAppId, setUpdatingAppId] = useState(null);

  // Job Posting/Editing Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [jobForm, setJobForm] = useState({
    title: '',
    company: '',
    location: '',
    salary: '',
    jobType: 'Full-time',
    experience: 'Entry',
    skills: '',
    description: '',
    responsibilities: '',
    requirements: ''
  });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const fetchStats = async () => {
    try {
      if (user && (user.role === 'admin' || user.role === 'recruiter')) {
        const statsRes = await api.get('/admin/stats');
        setStats(statsRes.data);
      } else {
        setStats({
          totalJobs: 0,
          totalApplications: 0,
          activeHires: 0,
          chartData: [],
          recentJobs: []
        });
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setStats({
        totalJobs: 0,
        totalApplications: 0,
        activeHires: 0,
        chartData: [],
        recentJobs: []
      });
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Get Recruiter stats
      await fetchStats();

      // Get Recruiter posted jobs
      const jobsRes = await api.get('/jobs');
      const jobsList = jobsRes.data.jobs || jobsRes.data || [];
      // Filter jobs posted by current user unless user is admin
      const myJobs = user.role === 'admin' 
        ? jobsList 
        : jobsList.filter(j => {
            const postedById = j.postedBy?._id || j.postedBy;
            return postedById?.toString() === user.id?.toString();
          });
      setJobs(myJobs);
    } catch (err) {
      console.error(err);
      showToast('Error loading recruiter metrics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // View job applications
  const handleViewApplications = async (job) => {
    setSelectedJob(job);
    setActiveTab('applications');
    setLoadingApps(true);
    try {
      const res = await api.get(`/applications/job/${job._id}`);
      setApplications(res.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load candidate list.', 'error');
      setActiveTab('manage');
    } finally {
      setLoadingApps(false);
    }
  };

  // Update candidate status
  const handleUpdateStatus = async (appId, newStatus) => {
    setUpdatingAppId(appId);
    try {
      await api.put(`/applications/${appId}/status`, { status: newStatus });
      
      // Update local state
      setApplications(prev => 
        prev.map(app => app._id === appId ? { ...app, status: newStatus } : app)
      );
      
      showToast('Application status updated successfully!', 'success');
      
      // Refresh stats in background
      fetchStats();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to update status.', 'error');
    } finally {
      setUpdatingAppId(null);
    }
  };

  // Delete job
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job listing? All corresponding applications will remain saved.')) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      setJobs(prev => prev.filter(j => j._id !== jobId));
      showToast('Job listing deleted successfully.', 'success');
      // Refresh stats
      await fetchStats();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete job listing.', 'error');
    }
  };

  // Edit job trigger
  const handleEditJobTrigger = (job) => {
    setIsEditing(true);
    setEditingJobId(job._id);
    setJobForm({
      title: job.title || '',
      company: job.company || '',
      location: job.location || '',
      salary: job.salary || '',
      jobType: job.jobType || 'Full-time',
      experience: job.experience || 'Entry',
      skills: job.skills?.join(', ') || '',
      description: job.description || '',
      responsibilities: job.responsibilities?.join('\n') || '',
      requirements: job.requirements?.join('\n') || ''
    });
    setActiveTab('post');
  };

  // Form submit (Post/Update)
  const handleJobSubmit = async (e) => {
    e.preventDefault();
    if (!jobForm.title || !jobForm.company || !jobForm.location || !jobForm.salary) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    try {
      const payload = {
        ...jobForm,
        // skills and requirements lists are handled in controller
      };

      if (isEditing) {
        await api.put(`/jobs/${editingJobId}`, payload);
        showToast('Job updated successfully!', 'success');
      } else {
        await api.post('/jobs', payload);
        showToast('New job posted successfully!', 'success');
      }

      // Reset form & reload data
      setJobForm({
        title: '',
        company: '',
        location: '',
        salary: '',
        jobType: 'Full-time',
        experience: 'Entry',
        skills: '',
        description: '',
        responsibilities: '',
        requirements: ''
      });
      setIsEditing(false);
      setEditingJobId(null);
      
      // Reload stats and jobs
      await fetchDashboardData();
      
      setActiveTab('manage');
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to submit job.', 'error');
    }
  };

  const sidebarItems = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard },
    { id: 'manage', name: 'Manage Jobs', icon: Briefcase },
    { id: 'post', name: isEditing ? 'Edit Job' : 'Post a Job', icon: PlusCircle },
    { id: 'review', name: 'Candidate Pipeline', icon: Users }
  ];

  const COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#10b981'];

  if (user && user.role === 'recruiter' && user.verificationStatus !== 'approved') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        {user.verificationStatus === 'pending' ? (
          <div className="glass rounded-3xl p-12 border border-white/5 shadow-2xl space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-400">
              <Calendar className="w-8 h-8 animate-pulse" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Your recruiter account is pending verification.</h1>
            <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
              Thank you for registering as an Employer/Recruiter on CareerConnect! Our platform administrator is currently reviewing your company profile details. You will gain full access to post jobs and review candidates once approved.
            </p>
            <div className="border-t border-white/5 pt-6 text-left max-w-md mx-auto space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Submitted Profile:</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Company Name</span>
                  <span className="text-slate-200 font-semibold">{user.companyName || 'Not Provided'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Designation</span>
                  <span className="text-slate-200 font-semibold">{user.designation || 'Not Provided'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Industry</span>
                  <span className="text-slate-200 font-semibold">{user.industry || 'Not Provided'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Company Size</span>
                  <span className="text-slate-200 font-semibold">{user.companySize || 'Not Provided'}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass rounded-3xl p-12 border border-rose-500/10 shadow-2xl space-y-6 bg-rose-950/5">
            <div className="mx-auto w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20 text-rose-400">
              <Trash2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Recruiter Account Verification Rejected</h1>
            <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
              Unfortunately, your recruiter profile verification was not approved by our platform administrator. Please contact support at <a href="mailto:support@careerconnect.com" className="text-brandBlue font-bold hover:underline">support@careerconnect.com</a> for more details or to submit additional documents.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
      {/* Sidebar navigation */}
      <Sidebar items={sidebarItems} activeTab={activeTab === 'applications' ? 'manage' : activeTab} setActiveTab={(tab) => {
        if (tab === 'review') {
          navigate('/candidate-pipeline');
          return;
        }
        if (tab === 'post' && !isEditing) {
          // Reset form if posting fresh
          setJobForm({
            title: '',
            company: '',
            location: '',
            salary: '',
            jobType: 'Full-time',
            experience: 'Entry',
            skills: '',
            description: '',
            responsibilities: '',
            requirements: ''
          });
        }
        setActiveTab(tab);
      }} />

      {/* Main Panel content */}
      <main className="flex-1 min-w-0">
        {loading ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-xl font-extrabold text-white">Console Overview</h1>
                  <p className="text-xs text-slate-400 mt-1 font-semibold">Monitor applications count, jobs listings, and hiring stages.</p>
                </div>

                {/* Dashboard KPI cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <DashboardCard
                    title="Active Positions"
                    value={stats?.totalJobs || 0}
                    icon={Briefcase}
                    description="Job listings posted in catalog"
                    color="blue"
                  />
                  <DashboardCard
                    title="Hiring Applications"
                    value={stats?.totalApplications || 0}
                    icon={Users}
                    description="Total applications received"
                    color="purple"
                    onClick={() => navigate('/candidate-pipeline')}
                  />
                  <DashboardCard
                    title="Total Successful Hires"
                    value={stats?.activeHires || 0}
                    icon={Users}
                    description="Candidates hired to date"
                    color="green"
                  />
                </div>

                {/* Pipeline Chart */}
                <div className="glass p-6 rounded-3xl border border-white/5 shadow-2xl flex flex-col justify-between">
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-200">Hiring Pipeline Chart</h3>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Application status categories totals.</p>
                  </div>
                  <div className="h-[250px] w-full mt-2">
                    {stats?.chartData && stats.chartData.some(d => d.value > 0) ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                          <YAxis stroke="#64748b" fontSize={10} tickLine={false} allowDecimals={false} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0f172a',
                              borderColor: 'rgba(255, 255, 255, 0.08)',
                              borderRadius: '12px',
                              fontSize: '12px'
                            }}
                          />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {stats.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-slate-500 font-semibold">
                        No applications data to represent.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Manage Jobs Tab */}
            {activeTab === 'manage' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-extrabold text-white">Manage Job Listings</h1>
                    <p className="text-xs text-slate-400 mt-1 font-semibold">Manage your posted positions or inspect submitted applications.</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setJobForm({
                        title: '',
                        company: '',
                        location: '',
                        salary: '',
                        jobType: 'Full-time',
                        experience: 'Entry',
                        skills: '',
                        description: '',
                        responsibilities: '',
                        requirements: ''
                      });
                      setActiveTab('post');
                    }}
                    className="btn-primary flex items-center gap-1.5 py-2.5 px-4 text-xs font-semibold cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" /> Post a Job
                  </button>
                </div>

                {jobs.length > 0 ? (
                  <div className="glass rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left border-collapse text-slate-300">
                        <thead>
                          <tr className="border-b border-white/5 text-xs font-bold text-slate-400 uppercase bg-slate-950/40">
                            <th className="px-6 py-4">Job Title</th>
                            <th className="px-6 py-4">Company</th>
                            <th className="px-6 py-4">Quick Stats</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {jobs.map((job) => (
                            <tr key={job._id} className="text-sm hover:bg-slate-900/10 transition-colors">
                              <td className="px-6 py-4">
                                <span className="font-bold text-slate-100 block">{job.title}</span>
                                <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                                  Posted {new Date(job.createdAt).toLocaleDateString()}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-semibold">{job.company}</td>
                              <td className="px-6 py-4 space-y-1 text-xs font-bold text-slate-400">
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                  <span>{job.location}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                                  <span>{job.salary}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleViewApplications(job)}
                                    className="btn-secondary py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                  >
                                    View Applications
                                  </button>
                                  <button
                                    onClick={() => handleEditJobTrigger(job)}
                                    className="p-2 bg-slate-900 border border-white/5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                                    title="Edit Job"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteJob(job._id)}
                                    className="p-2 bg-slate-900 border border-white/5 text-rose-500 hover:bg-rose-950/20 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                                    title="Delete Job"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="glass rounded-3xl p-12 text-center border border-white/5 shadow-xl min-h-[300px] flex flex-col items-center justify-center">
                    <Briefcase className="w-10 h-10 text-slate-600 mb-3" />
                    <h3 className="text-sm font-bold text-slate-300">No jobs listed</h3>
                    <p className="text-xs text-slate-500 mt-1">You haven't posted any job listings. Click 'Post a Job' to begin.</p>
                  </div>
                )}
              </div>
            )}

            {/* Post/Edit a Job Tab */}
            {activeTab === 'post' && (
              <div className="glass p-6 sm:p-8 rounded-3xl border border-white/5 shadow-2xl">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-extrabold text-white">{isEditing ? 'Edit Job Posting' : 'Post New Job'}</h1>
                    <p className="text-xs text-slate-400 mt-1 font-semibold">Publish job posts for potential job seeker candidates.</p>
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setActiveTab('manage');
                      }}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back to List
                    </button>
                  )}
                </div>

                <form onSubmit={handleJobSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Job Title */}
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Job Title *</label>
                      <input
                        type="text"
                        required
                        value={jobForm.title}
                        onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                        className="input-field"
                        placeholder="e.g. Senior Frontend Dev"
                      />
                    </div>

                    {/* Company */}
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Company Name *</label>
                      <input
                        type="text"
                        required
                        value={jobForm.company}
                        onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
                        className="input-field"
                        placeholder="e.g. Acme Corp"
                      />
                    </div>

                    {/* Location */}
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location *</label>
                      <input
                        type="text"
                        required
                        value={jobForm.location}
                        onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                        className="input-field"
                        placeholder="e.g. San Francisco, CA or Remote"
                      />
                    </div>

                    {/* Salary */}
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Salary Package *</label>
                      <input
                        type="text"
                        required
                        value={jobForm.salary}
                        onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                        className="input-field"
                        placeholder="e.g. $120k - $140k"
                      />
                    </div>

                    {/* Job Type */}
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Job Type *</label>
                      <select
                        value={jobForm.jobType}
                        onChange={(e) => setJobForm({ ...jobForm, jobType: e.target.value })}
                        className="input-field"
                      >
                        {['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    {/* Experience Level */}
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Experience Level *</label>
                      <select
                        value={jobForm.experience}
                        onChange={(e) => setJobForm({ ...jobForm, experience: e.target.value })}
                        className="input-field"
                      >
                        {['Entry', 'Mid', 'Senior', 'Expert'].map(e => (
                          <option key={e} value={e}>{e} Level</option>
                        ))}
                      </select>
                    </div>

                    {/* Required Skills */}
                    <div className="space-y-1.5 flex flex-col md:col-span-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Required Skills</label>
                      <input
                        type="text"
                        value={jobForm.skills}
                        onChange={(e) => setJobForm({ ...jobForm, skills: e.target.value })}
                        className="input-field"
                        placeholder="React, JavaScript, CSS (comma separated)"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5 flex flex-col md:col-span-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Job Description</label>
                      <textarea
                        rows="4"
                        value={jobForm.description}
                        onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                        className="input-field resize-none"
                        placeholder="Write a clear job description..."
                      ></textarea>
                    </div>

                    {/* Responsibilities */}
                    <div className="space-y-1.5 flex flex-col md:col-span-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Responsibilities (One per line)</label>
                      <textarea
                        rows="3"
                        value={jobForm.responsibilities}
                        onChange={(e) => setJobForm({ ...jobForm, responsibilities: e.target.value })}
                        className="input-field resize-none"
                        placeholder="Develop UI components&#10;Collaborate with product teams..."
                      ></textarea>
                    </div>

                    {/* Requirements */}
                    <div className="space-y-1.5 flex flex-col md:col-span-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Core Requirements (One per line)</label>
                      <textarea
                        rows="3"
                        value={jobForm.requirements}
                        onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                        className="input-field resize-none"
                        placeholder="3+ years React experience&#10;Familiarity with Tailwind CSS..."
                      ></textarea>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-white/5">
                    <button
                      type="submit"
                      className="btn-primary flex items-center gap-2 px-6 py-3 cursor-pointer"
                    >
                      <Send className="w-4 h-4 shrink-0" />
                      <span>{isEditing ? 'Save Changes' : 'Post Job'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Applications View Tab */}
            {activeTab === 'applications' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <button
                      onClick={() => setActiveTab('manage')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold mb-2"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back to Listings
                    </button>
                    <h1 className="text-xl font-extrabold text-white">Candidates for {selectedJob?.title}</h1>
                    <p className="text-xs text-slate-400 mt-1 font-semibold">{selectedJob?.company} • {selectedJob?.location}</p>
                  </div>
                </div>

                {loadingApps ? (
                  <div className="min-h-[250px] flex items-center justify-center">
                    <LoadingSpinner />
                  </div>
                ) : applications.length > 0 ? (
                  <div className="glass rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                    <ApplicationTable
                      applications={applications}
                      onUpdateStatus={handleUpdateStatus}
                      updatingId={updatingAppId}
                    />
                  </div>
                ) : (
                  <div className="glass rounded-3xl p-12 text-center border border-white/5 shadow-xl min-h-[250px] flex flex-col items-center justify-center">
                    <Users className="w-10 h-10 text-slate-600 mb-3" />
                    <h3 className="text-sm font-bold text-slate-300">No applications received</h3>
                    <p className="text-xs text-slate-500 mt-1">Candidates haven't applied to this job post yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

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

export default RecruiterDashboard;
