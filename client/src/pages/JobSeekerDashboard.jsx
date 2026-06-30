import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import DashboardCard from '../components/DashboardCard';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { Briefcase, Bookmark, FileText, Calendar, ArrowRight, UserCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const JobSeekerDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const appsRes = await api.get('/applications/my');
        setApplications(appsRes.data.applications || []);

        const savedRes = await api.get('/saved');
        setSavedJobs(savedRes.data.savedJobs || []);

        const jobsRes = await api.get('/jobs');
        setRecentJobs((jobsRes.data.jobs || []).slice(0, 5));
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const appliedCount = applications.length;
  const savedCount = savedJobs.length;
  const interviewCount = applications.filter(app => ['Shortlisted', 'Interview', 'Hired'].includes(app.status)).length;

  const statusMap = {
    Applied: 0,
    Reviewed: 0,
    Shortlisted: 0,
    Interview: 0,
    Rejected: 0,
    Hired: 0
  };

  applications.forEach(app => {
    if (statusMap[app.status] !== undefined) {
      statusMap[app.status]++;
    }
  });

  const chartData = Object.entries(statusMap).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#10b981'];

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-xl font-extrabold text-white">Seeker Dashboard</h1>
        <p className="text-xs text-slate-400 mt-1 font-semibold">
          Check your applications status, reviews, and saved jobs list.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="Total Applied Jobs"
          value={appliedCount}
          icon={FileText}
          description="Applications submitted to date"
          color="blue"
        />
        <DashboardCard
          title="Saved Opportunities"
          value={savedCount}
          icon={Bookmark}
          description="Jobs bookmarked for review"
          color="purple"
        />
        <DashboardCard
          title="Interview Calls"
          value={interviewCount}
          icon={UserCheck}
          description="Shortlisted or hired offers"
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Column */}
        <div className="lg:col-span-2 glass p-6 rounded-3xl border border-white/5 shadow-2xl flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-200">Application Pipeline</h3>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Stage distribution of your applications.</p>
          </div>

          <div className="h-[250px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Jobs list Column */}
        <div className="glass p-6 rounded-3xl border border-white/5 shadow-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Latest Openings</h3>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Recently posted positions in catalog.</p>
          </div>

          <div className="space-y-4 my-6">
            {recentJobs.length > 0 ? (
              recentJobs.map((job) => (
                <div key={job._id} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0">
                  <div className="min-w-0">
                    <Link to={`/jobs/${job._id}`} className="text-xs font-bold text-slate-200 hover:text-brandBlue transition-colors truncate block">
                      {job.title}
                    </Link>
                    <span className="text-[10px] text-slate-500 font-semibold truncate block mt-0.5">{job.company} • {job.location}</span>
                  </div>
                  <Link to={`/jobs/${job._id}`} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 font-medium py-6 text-center">No open jobs found.</p>
            )}
          </div>

          <Link to="/jobs" className="w-full text-center py-2.5 bg-slate-900 border border-white/5 hover:bg-slate-950 text-xs font-semibold text-slate-300 rounded-xl transition-colors cursor-pointer block">
            Browse All Jobs
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobSeekerDashboard;
