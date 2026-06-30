import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import { Briefcase, User, Mail, Lock, Phone, Globe, Building, ShieldAlert, ArrowLeft, UserCheck, BriefcaseIcon, FileText } from 'lucide-react';
import { getDashboardPath } from '../components/ProtectedRoute';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Role Selection
  const [selectedRole, setSelectedRole] = useState(null); // 'jobseeker' or 'recruiter'
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Common Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Jobseeker Specific Fields
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('Entry');
  const [portfolio, setPortfolio] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [resumeFile, setResumeFile] = useState(null);

  // Recruiter Specific Fields
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companySize, setCompanySize] = useState('1-10');
  const [industry, setIndustry] = useState('');
  const [companyLocation, setCompanyLocation] = useState('');
  const [designation, setDesignation] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showToast('Please fill out Name, Email, and Password.', 'error');
      return;
    }

    if (selectedRole === 'recruiter' && (!companyName || !industry || !designation)) {
      showToast('Please fill out Company Name, Industry, and Designation.', 'error');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('role', selectedRole);
      formData.append('name', name);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('password', password);

      if (selectedRole === 'jobseeker') {
        formData.append('skills', skills);
        formData.append('experience', experience);
        formData.append('portfolio', portfolio);
        formData.append('github', github);
        formData.append('linkedin', linkedin);
        if (resumeFile) {
          formData.append('resume', resumeFile);
        }
      } else {
        formData.append('companyName', companyName);
        formData.append('companyWebsite', companyWebsite);
        formData.append('companySize', companySize);
        formData.append('industry', industry);
        formData.append('companyLocation', companyLocation);
        formData.append('designation', designation);
        formData.append('linkedin', linkedin);
        formData.append('companyLogo', companyLogo);
      }

      // Convert formData to standard JSON payload since register in AuthContext uses JSON
      const payload = {
        role: selectedRole,
        name,
        email,
        phone,
        password,
      };

      if (selectedRole === 'jobseeker') {
        payload.skills = skills;
        payload.experience = experience;
        payload.portfolio = portfolio;
        payload.github = github;
        payload.linkedin = linkedin;
      } else {
        payload.companyName = companyName;
        payload.companyWebsite = companyWebsite;
        payload.companySize = companySize;
        payload.industry = industry;
        payload.companyLocation = companyLocation;
        payload.designation = designation;
        payload.linkedin = linkedin;
        payload.companyLogo = companyLogo;
      }

      await register(payload);
      showToast('Account created successfully!', 'success');
      
      setTimeout(() => {
        const dest = selectedRole === 'recruiter' ? '/recruiter-dashboard' : '/';
        navigate(dest);
      }, 1500);
    } catch (err) {
      console.error(err);
      const errMsg = err?.toString() || '';
      if (errMsg.toLowerCase().includes('already exists')) {
        showToast('User already exists with this email. Please login.', 'error');
      } else {
        showToast(err || 'Registration failed.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gradient-bg min-h-[calc(screen-16px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-brandBlue/10 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-brandPurple/10 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="max-w-2xl w-full space-y-8 glass p-8 rounded-3xl relative z-10 border border-white/5 shadow-2xl">
        {/* Selection State */}
        {!selectedRole ? (
          <div className="space-y-8 text-center">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brandBlue to-brandPurple text-white mx-auto shadow-lg shadow-brandBlue/20 mb-4">
                <Briefcase className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">Create an Account</h2>
              <p className="mt-2 text-xs text-slate-400 font-semibold">
                Join CareerConnect to find a job or recruit exceptional talent.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* Jobseeker Card */}
              <button
                onClick={() => setSelectedRole('jobseeker')}
                className="glass glass-hover p-8 rounded-3xl text-left border border-white/5 flex flex-col justify-between h-64 group cursor-pointer transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-brandBlue/10 border border-brandBlue/20 text-brandBlue flex items-center justify-center group-hover:bg-brandBlue group-hover:text-white transition-all duration-300">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-brandBlue transition-colors">I'm looking for a job</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Discover tailored opportunities, submit applications, save jobs, and track your hiring pipeline.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-brandBlue group-hover:translate-x-1.5 transition-transform inline-flex items-center gap-1">
                  Start as Candidate &rarr;
                </span>
              </button>

              {/* Recruiter Card */}
              <button
                onClick={() => setSelectedRole('recruiter')}
                className="glass glass-hover p-8 rounded-3xl text-left border border-white/5 flex flex-col justify-between h-64 group cursor-pointer transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-brandPurple/10 border border-brandPurple/20 text-brandPurple flex items-center justify-center group-hover:bg-brandPurple group-hover:text-white transition-all duration-300">
                    <Building className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-brandPurple transition-colors">I'm hiring talent</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Post job listings, manage applications, assess candidates, and scale your organization.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-brandPurple group-hover:translate-x-1.5 transition-transform inline-flex items-center gap-1">
                  Start as Employer &rarr;
                </span>
              </button>
            </div>
          </div>
        ) : (
          /* Form State */
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <button
                  onClick={() => setSelectedRole(null)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold mb-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Change Account Type
                </button>
                <h2 className="text-xl font-extrabold text-white">
                  Register as {selectedRole === 'jobseeker' ? 'Job Seeker' : 'Employer / Recruiter'}
                </h2>
              </div>
              <div className="text-xs font-bold px-3 py-1 rounded-full bg-slate-900 border border-white/5 text-slate-400 capitalize">
                {selectedRole === 'jobseeker' ? 'Candidate' : 'Employer'}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Full Name */}
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500" /> {selectedRole === 'jobseeker' ? 'Full Name' : 'Recruiter Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                    placeholder="John Doe"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" /> {selectedRole === 'jobseeker' ? 'Personal Email' : 'Work Email'}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    placeholder="john@company.com"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" /> Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field"
                    placeholder="+91 9876543210"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-500" /> Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                    placeholder="••••••••"
                  />
                </div>

                {/* Job Seeker Custom Fields */}
                {selectedRole === 'jobseeker' && (
                  <>
                    {/* Skills */}
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-slate-500" /> Skills (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        className="input-field"
                        placeholder="React, Node.js, Python"
                      />
                    </div>

                    {/* Experience Level */}
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-slate-500" /> Experience Level
                      </label>
                      <select
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="bg-slate-950 border border-slate-700/60 rounded-xl text-slate-300 px-3.5 py-3.5 focus:outline-none focus:border-brandIndigo text-xs font-semibold cursor-pointer"
                      >
                        <option value="Entry">Entry Level</option>
                        <option value="Mid">Mid Level</option>
                        <option value="Senior">Senior Level</option>
                        <option value="Lead">Lead / Staff</option>
                        <option value="Executive">Executive</option>
                      </select>
                    </div>

                    {/* Portfolio */}
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-slate-500" /> Portfolio Link
                      </label>
                      <input
                        type="url"
                        value={portfolio}
                        onChange={(e) => setPortfolio(e.target.value)}
                        className="input-field"
                        placeholder="https://myportfolio.com"
                      />
                    </div>

                    {/* GitHub */}
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-slate-500" /> GitHub Profile
                      </label>
                      <input
                        type="url"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        className="input-field"
                        placeholder="https://github.com/username"
                      />
                    </div>

                    {/* LinkedIn */}
                    <div className="space-y-1.5 flex flex-col md:col-span-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-slate-500" /> LinkedIn Profile URL
                      </label>
                      <input
                        type="url"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        className="input-field"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                  </>
                )}

                {/* Recruiter Custom Fields */}
                {selectedRole === 'recruiter' && (
                  <>
                    {/* Company Name */}
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-500" /> Company Name
                      </label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="input-field"
                        placeholder="Acme Corporation"
                      />
                    </div>

                    {/* Company Website */}
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-slate-500" /> Company Website
                      </label>
                      <input
                        type="url"
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                        className="input-field"
                        placeholder="https://acme.com"
                      />
                    </div>

                    {/* Industry */}
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-500" /> Industry
                      </label>
                      <input
                        type="text"
                        required
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="input-field"
                        placeholder="Software & IT Services"
                      />
                    </div>

                    {/* Company Size */}
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-slate-500" /> Company Size
                      </label>
                      <select
                        value={companySize}
                        onChange={(e) => setCompanySize(e.target.value)}
                        className="bg-slate-950 border border-slate-700/60 rounded-xl text-slate-300 px-3.5 py-3.5 focus:outline-none focus:border-brandIndigo text-xs font-semibold cursor-pointer"
                      >
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="501+">501+ employees</option>
                      </select>
                    </div>

                    {/* Company Location */}
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-500" /> Company Location
                      </label>
                      <input
                        type="text"
                        value={companyLocation}
                        onChange={(e) => setCompanyLocation(e.target.value)}
                        className="input-field"
                        placeholder="Mumbai, India"
                      />
                    </div>

                    {/* Designation */}
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-500" /> Your Designation
                      </label>
                      <input
                        type="text"
                        required
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        className="input-field"
                        placeholder="HR Manager / Talent Acquisition"
                      />
                    </div>

                    {/* Company Logo Link */}
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-slate-500" /> Company Logo URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={companyLogo}
                        onChange={(e) => setCompanyLogo(e.target.value)}
                        className="input-field"
                        placeholder="https://acme.com/logo.png"
                      />
                    </div>

                    {/* LinkedIn URL */}
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-slate-500" /> LinkedIn Profile URL
                      </label>
                      <input
                        type="url"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        className="input-field"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                  </>
                )}

              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3.5 cursor-pointer text-sm shadow-lg shadow-brandIndigo/25"
              >
                {loading ? 'Creating Account...' : 'Complete Registration'}
              </button>
            </form>
          </div>
        )}

        <div className="text-center text-xs font-semibold text-slate-400 mt-6 pt-4 border-t border-white/5">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brandBlue hover:text-brandIndigo transition-colors">
            Login
          </Link>
        </div>
      </div>

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

export default RegisterPage;
