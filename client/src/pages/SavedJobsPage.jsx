import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import JobCard from '../components/JobCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import { Bookmark, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

const SavedJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const res = await api.get('/saved');
      setJobs(res.data.savedJobs || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load saved jobs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleToggleSave = (jobId, isSavedNow) => {
    if (!isSavedNow) {
      setJobs(prev => prev.filter(j => j._id !== jobId));
      showToast('Job removed from saved list.', 'success');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white">Saved Jobs</h1>
          <p className="text-xs text-slate-400 mt-1 font-semibold">
            Track and review the opportunities you bookmarked.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              isSavedInitially={true}
              onToggleSave={handleToggleSave}
            />
          ))}
        </div>
      ) : (
        <div className="glass rounded-3xl p-12 text-center border border-white/5 shadow-xl min-h-[300px] flex flex-col items-center justify-center">
          <div className="p-4 bg-slate-900/60 border border-white/5 rounded-2xl text-slate-500 mb-4">
            <Bookmark className="w-10 h-10" />
          </div>
          <h3 className="text-sm font-bold text-slate-300">No saved jobs</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            You haven't bookmarked any jobs yet. When exploring, click the bookmark icon on job cards to save them.
          </p>
          <Link
            to="/jobs"
            className="mt-6 btn-primary py-2.5 px-5 text-xs font-semibold"
          >
            Browse Jobs
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

export default SavedJobsPage;
