import React from 'react';
import { RefreshCw } from 'lucide-react';

const FilterPanel = ({ filters, setFilters, onClear }) => {
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];
  const experiences = ['Entry', 'Mid', 'Senior', 'Expert'];

  const handleChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="glass rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-200 text-sm">Filters</h3>
        <button
          onClick={onClear}
          className="text-xs text-slate-400 hover:text-brandBlue flex items-center gap-1 font-semibold transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Clear All
        </button>
      </div>

      {/* Job Type */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Job Type</label>
        <div className="flex flex-col gap-2">
          {jobTypes.map((type) => (
            <label key={type} className="flex items-center gap-2.5 text-sm text-slate-300 hover:text-white cursor-pointer select-none">
              <input
                type="radio"
                name="jobType"
                checked={filters.jobType === type}
                onChange={() => handleChange('jobType', type)}
                className="w-4 h-4 rounded text-brandBlue bg-slate-950 border-slate-700 focus:ring-brandBlue/30 focus:ring-offset-slate-900"
              />
              {type}
            </label>
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Experience Level</label>
        <div className="flex flex-col gap-2">
          {experiences.map((exp) => (
            <label key={exp} className="flex items-center gap-2.5 text-sm text-slate-300 hover:text-white cursor-pointer select-none">
              <input
                type="radio"
                name="experience"
                checked={filters.experience === exp}
                onChange={() => handleChange('experience', exp)}
                className="w-4 h-4 rounded text-brandPurple bg-slate-950 border-slate-700 focus:ring-brandPurple/30 focus:ring-offset-slate-900"
              />
              {exp} Level
            </label>
          ))}
        </div>
      </div>

      {/* Salary Search */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Salary Range</label>
        <input
          type="text"
          placeholder="e.g. $100k, $80k..."
          value={filters.salary || ''}
          onChange={(e) => handleChange('salary', e.target.value)}
          className="input-field py-2 text-xs w-full"
        />
      </div>

      {/* Skills Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Required Skills</label>
        <input
          type="text"
          placeholder="e.g. React, Node, Python..."
          value={filters.skills || ''}
          onChange={(e) => handleChange('skills', e.target.value)}
          className="input-field py-2 text-xs w-full"
        />
        <p className="text-[10px] text-slate-500 font-semibold">Comma-separated values</p>
      </div>
    </div>
  );
};

export default FilterPanel;
