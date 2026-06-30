import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import JobCard from '../components/JobCard';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api/axios';
import { Briefcase, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const JobsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const initialSearch = searchParams.get('search') || '';
  const initialLoc = searchParams.get('location') || '';

  const [jobs, setJobs] = useState([]);
  const [savedJobsIds, setSavedJobsIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [location, setLocation] = useState(initialLoc);

  const [filters, setFilters] = useState({
    jobType: '',
    experience: '',
    salary: '',
    skills: '',
  });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (location) params.append('location', location);
      if (filters.jobType) params.append('jobType', filters.jobType);
      if (filters.experience) params.append('experience', filters.experience);
      if (filters.salary) params.append('salary', filters.salary);
      if (filters.skills) params.append('skills', filters.skills);

      const res = await api.get(`/jobs?${params.toString()}`);
      setJobs(res.data.jobs || []);

      if (user && user.role === 'jobseeker') {
        const savedRes = await api.get('/saved');
        setSavedJobsIds((savedRes.data.savedJobs || []).map(j => j._id));
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [search, location, filters, user]);

  const handleSearch = ({ query, location: loc }) => {
    setSearch(query);
    setLocation(loc);
    const newParams = {};
    if (query) newParams.search = query;
    if (loc) newParams.location = loc;
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setFilters({
      jobType: '',
      experience: '',
      salary: '',
      skills: '',
    });
  };

  const handleToggleSave = (jobId, isSavedNow) => {
    if (isSavedNow) {
      setSavedJobsIds(prev => [...prev, jobId]);
    } else {
      setSavedJobsIds(prev => prev.filter(id => id !== jobId));
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Search Bar */}
      <div className="mb-8">
        <SearchBar onSearch={handleSearch} initialQuery={search} initialLocation={location} />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Filter Column */}
        <div className="w-full lg:w-80 shrink-0">
          <FilterPanel filters={filters} setFilters={setFilters} onClear={handleClearFilters} />
        </div>

        {/* Right Jobs Listing */}
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100">
              {loading ? 'Finding Jobs...' : `${jobs.length} Positions Available`}
            </h2>
          </div>

          {loading ? (
            <div className="min-h-[400px] flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  isSavedInitially={savedJobsIds.includes(job._id)}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          ) : (
            <div className="glass rounded-3xl p-12 text-center border border-white/5 shadow-xl min-h-[350px] flex flex-col items-center justify-center">
              <div className="p-4 bg-slate-900/60 border border-white/5 rounded-2xl text-slate-500 mb-4">
                <Briefcase className="w-10 h-10" />
              </div>
              <h3 className="text-base font-bold text-slate-300">No jobs match your search</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Try resetting your filters or adjusting your search queries to see more jobs.
              </p>
              <button
                onClick={() => {
                  setSearch('');
                  setLocation('');
                  handleClearFilters();
                  setSearchParams({});
                }}
                className="mt-6 btn-secondary py-2 px-5 text-xs font-semibold cursor-pointer"
              >
                Reset Search
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobsPage;
