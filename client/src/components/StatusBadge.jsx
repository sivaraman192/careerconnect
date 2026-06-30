import React from 'react';

const StatusBadge = ({ status }) => {
  const statusStyles = {
    Applied: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    Reviewed: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    Shortlisted: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
    Interview: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
    Hired: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    Rejected: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
  };

  const selectedStyle = statusStyles[status] || 'bg-slate-500/10 border-slate-500/20 text-slate-400';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${selectedStyle}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
