import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';

const SearchBar = ({ onSearch, initialQuery = '', initialLocation = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ query, location });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col md:flex-row gap-2 p-2 bg-slate-900/40 border border-white/5 rounded-2xl backdrop-blur-md shadow-xl">
        <div className="flex-1 flex items-center gap-2.5 px-3 py-2.5">
          <Search className="w-4 h-4 text-brandBlue shrink-0" />
          <input
            type="text"
            placeholder="Job title, keywords, or company..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 outline-none text-sm font-medium"
          />
        </div>
        <div className="hidden md:block w-px bg-white/5 my-2"></div>
        <div className="flex-1 flex items-center gap-2.5 px-3 py-2.5">
          <MapPin className="w-4 h-4 text-brandPurple shrink-0" />
          <input
            type="text"
            placeholder="Location, city, or remote..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 outline-none text-sm font-medium"
          />
        </div>
        <button
          type="submit"
          className="btn-primary py-2.5 px-6 text-sm font-semibold rounded-xl shrink-0 cursor-pointer"
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
