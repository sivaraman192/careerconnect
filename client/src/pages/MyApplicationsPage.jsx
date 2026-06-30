import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import Toast from '../components/Toast';
import { FileSpreadsheet, MapPin, DollarSign, Calendar, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const res = await api.get('/applications/my');
        setApplications(res.data.applications || []);
      } catch (err) {
        console.error(err);
        showToast('Failed to load applications.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white">My Applications</h1>
          <p className="text-xs text-slate-400 mt-1 font-semibold">
            Track the status of positions you applied to.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : applications.length > 0 ? (
        <div className="glass rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-xs font-bold text-slate-400 uppercase bg-slate-950/40">
                  <th className="px-6 py-4">Job Title</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Quick Details</th>
                  <th className="px-6 py-4">Applied Date</th>
                  <th className="px-6 py-4">Hiring Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {applications.map((app) => {
                  const job = app.jobId;
                  if (!job) return null;
                  return (
                    <tr key={app._id} className="text-sm text-slate-300 hover:bg-slate-900/10 transition-colors">
                      <td className="px-6 py-4">
                        <Link to={`/jobs/${job._id}`} className="font-bold text-slate-100 hover:text-brandBlue transition-colors">
                          {job.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-300">{job.company}</span>
                      </td>
                      <td className="px-6 py-4 space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <DollarSign className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{job.salary}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={app.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass rounded-3xl p-12 text-center border border-white/5 shadow-xl min-h-[300px] flex flex-col items-center justify-center">
          <div className="p-4 bg-slate-900/60 border border-white/5 rounded-2xl text-slate-500 mb-4">
            <FileSpreadsheet className="w-10 h-10" />
          </div>
          <h3 className="text-sm font-bold text-slate-300">No applications yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            You haven't submitted any job applications yet. Go to the jobs page, find a matching role, and apply.
          </p>
          <Link
            to="/jobs"
            className="mt-6 btn-primary py-2.5 px-5 text-xs font-semibold"
          >
            Find a Job
          </Link>
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

export default MyApplicationsPage;
