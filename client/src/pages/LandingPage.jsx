import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import JobCard from '../components/JobCard';
import api from '../api/axios';
import { Briefcase, Users, Building, ArrowRight, Star, Quote, ChevronRight } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/jobs');
        const jobs = res.data.jobs || [];
        setFeaturedJobs(jobs.slice(0, 6));
      } catch (err) {
        console.error('Error fetching featured jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearch = ({ query, location }) => {
    navigate(`/jobs?search=${encodeURIComponent(query || '')}&location=${encodeURIComponent(location || '')}`);
  };

  const steps = [
    {
      icon: <Briefcase className="w-6 h-6 text-brandBlue shrink-0" />,
      title: 'Find Your Job',
      desc: 'Browse through thousands of curated tech, remote, and creative positions matching your criteria.'
    },
    {
      icon: <Users className="w-6 h-6 text-brandPurple shrink-0" />,
      title: 'Apply Seamlessly',
      desc: 'Submit your profile and uploaded resume in one click. Rest assured it reaches the hiring manager.'
    },
    {
      icon: <Building className="w-6 h-6 text-brandIndigo shrink-0" />,
      title: 'Hired & Succeed',
      desc: 'Track your application stages in real-time, prepare for interviews, and get hired.'
    }
  ];

  const companies = [
    { name: 'Google', logo: 'Google', color: 'text-red-400' },
    { name: 'Microsoft', logo: 'Microsoft', color: 'text-blue-400' },
    { name: 'Meta', logo: 'Meta', color: 'text-indigo-400' },
    { name: 'Amazon', logo: 'Amazon', color: 'text-amber-400' },
    { name: 'Apple', logo: 'Apple', color: 'text-slate-300' }
  ];

  const testimonials = [
    {
      quote: "CareerConnect transformed my job search. Within two weeks of registering, I was shortlisted and hired as a Senior React Architect.",
      author: "Alex Morgan",
      role: "Frontend Developer",
      rating: 5
    },
    {
      quote: "As a recruiter, finding top-tier developer talent has never been easier. The dashboard analytics and resume trackers are incredibly robust.",
      author: "Sarah Jenkins",
      role: "HR Director at Meta",
      rating: 5
    }
  ];

  return (
    <div className="gradient-bg min-h-screen flex flex-col justify-between">
      {/* Hero Section */}
      <header className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center relative">
        {/* Glow Effect */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-brandIndigo/10 rounded-full blur-[100px] pointer-events-none"></div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-brandBlue mb-6 animate-pulse">
          🎯 Find your next career leap
        </span>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.15]">
          Connect with the <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
            Ultimate Career Matches
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-slate-400 text-sm sm:text-base leading-relaxed mb-10">
          Discover a premium job portal featuring seamless JWT security, role-based dashboards, and analytics trackers. Post jobs or upload your resume to apply today.
        </p>

        {/* Search Widget */}
        <div className="max-w-3xl mx-auto mb-16">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Brand Logos */}
        <div className="pt-6 border-t border-white/5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Trusted by developers at</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {companies.map((c) => (
              <span key={c.name} className={`text-base font-extrabold tracking-wider ${c.color} opacity-40 hover:opacity-85 transition-opacity`}>
                {c.logo}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Featured Jobs */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Featured Opportunities</h2>
            <p className="text-xs text-slate-400 mt-1">Handpicked jobs from leading tech firms posted recently.</p>
          </div>
          <Link to="/jobs" className="text-xs font-bold text-brandBlue hover:text-brandIndigo flex items-center gap-0.5 transition-colors">
            Explore All Jobs <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="glass-card h-[220px] rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : featuredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        ) : (
          <div className="glass rounded-2xl p-12 text-center">
            <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-300">No jobs posted yet</h3>
            <p className="text-xs text-slate-500 mt-1">Check back later or register as a recruiter to post jobs.</p>
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 w-full border-t border-white/5">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-slate-100">How CareerConnect Works</h2>
          <p className="text-xs text-slate-400 mt-1">Get matching offers and interviews in three simplified steps.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, idx) => (
            <div key={idx} className="glass p-6 rounded-2xl relative overflow-hidden flex flex-col items-center text-center">
              <div className="absolute -top-3 -right-3 text-7xl font-extrabold text-white/[0.02] select-none">
                0{idx + 1}
              </div>
              <div className="p-3 bg-slate-900 border border-white/5 rounded-xl mb-4">
                {s.icon}
              </div>
              <h3 className="text-base font-bold text-slate-200 mb-2">{s.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 w-full border-t border-white/5">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-slate-100">Voice of CareerConnect</h2>
          <p className="text-xs text-slate-400 mt-1">Read reviews from our community of professionals and HR teams.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((t, idx) => (
            <div key={idx} className="glass p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm italic leading-relaxed mb-6 font-medium">
                  "{t.quote}"
                </p>
              </div>
              <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-brandBlue to-brandPurple flex items-center justify-center font-bold text-sm text-white shrink-0">
                  {t.author.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{t.author}</h4>
                  <p className="text-[10px] text-slate-500 font-semibold">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 bg-slate-950/80 py-8 text-center text-xs text-slate-500 font-semibold mt-auto">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-brandBlue" />
            <span className="text-slate-300 font-bold">CareerConnect</span>
          </div>
          <p>&copy; 2026 CareerConnect – Job Portal System. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/jobs" className="hover:text-brandBlue transition-colors">Search Jobs</Link>
            <span className="text-white/10">|</span>
            <Link to="/login" className="hover:text-brandBlue transition-colors">Candidate Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
