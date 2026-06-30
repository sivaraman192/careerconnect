import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, DollarSign, Briefcase, Calendar, Bookmark, BookmarkCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const JobCard = ({ job, isSavedInitially = false, onToggleSave }) => {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(isSavedInitially);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user || user.role !== 'jobseeker') return;
    setSaving(true);
    try {
      if (isSaved) {
        await api.delete(`/saved/${job._id}`);
        setIsSaved(false);
      } else {
        await api.post(`/saved/${job._id}`);
        setIsSaved(true);
      }
      if (onToggleSave) onToggleSave(job._id, !isSaved);
    } catch (err) {
      console.error('Error toggling job save status:', err);
    } finally {
      setSaving(false);
    }
  };

  const getPostedTime = (dateStr) => {
    const diff = new Date() - new Date(dateStr);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="glass-card glass-card-hover p-6 rounded-2xl flex flex-col justify-between h-full group"
    >
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 group-hover:text-brandBlue transition-colors duration-200">
              <Link to={`/jobs/${job._id}`}>{job.title}</Link>
            </h3>
            <p className="text-slate-400 font-semibold text-xs mt-0.5">{job.company}</p>
          </div>
          {user && user.role === 'jobseeker' && (
            <button
              onClick={handleSave}
              disabled={saving}
              className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer shrink-0 ${
                isSaved
                  ? 'bg-brandIndigo/20 border-brandIndigo/30 text-brandIndigo'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 my-4 text-xs font-semibold text-slate-400">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{job.salary}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{job.jobType}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{getPostedTime(job.createdAt)}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 my-4">
          {job.skills?.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="bg-slate-900/80 text-slate-300 border border-white/5 text-[10px] font-semibold px-2 py-0.5 rounded-md"
            >
              {skill}
            </span>
          ))}
          {job.skills?.length > 3 && (
            <span className="bg-slate-900/50 text-slate-500 text-[10px] font-semibold px-2 py-0.5 rounded-md">
              +{job.skills.length - 3} more
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between gap-3">
        <span className="text-[10px] font-bold text-slate-400 capitalize bg-slate-950/80 px-2 py-0.5 rounded border border-white/5">
          {job.experience} Level
        </span>
        <Link
          to={`/jobs/${job._id}`}
          className="text-xs font-bold text-brandBlue hover:text-brandIndigo flex items-center gap-0.5 transition-colors"
        >
          View details &rarr;
        </Link>
      </div>
    </motion.div>
  );
};

export default JobCard;
