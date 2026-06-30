import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ResumeUpload from './ResumeUpload';
import { User, Mail, Phone, Code, Award, Link2, Save } from 'lucide-react';
import { Github, Linkedin } from './SocialIcons';

const ProfileForm = ({ onSubmitSuccess, onShowToast }) => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    skills: user?.skills?.join(', ') || '',
    experience: user?.experience || '',
    portfolio: user?.portfolio || '',
    github: user?.github || '',
    linkedin: user?.linkedin || '',
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelected = (file) => {
    setResumeFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    if (resumeFile) {
      data.append('resume', resumeFile);
    }

    try {
      await updateProfile(data);
      onShowToast('Profile updated successfully!', 'success');
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      console.error(err);
      onShowToast(err || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2 flex flex-col">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-brandBlue shrink-0" />
            <span>Name</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="input-field"
            placeholder="John Doe"
          />
        </div>

        <div className="space-y-2 flex flex-col">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-brandBlue shrink-0" />
            <span>Email Address</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="input-field"
            placeholder="john@example.com"
          />
        </div>

        <div className="space-y-2 flex flex-col">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-brandBlue shrink-0" />
            <span>Phone Number</span>
          </label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="input-field"
            placeholder="+1 (555) 000-0000"
          />
        </div>

        <div className="space-y-2 flex flex-col">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-brandBlue shrink-0" />
            <span>Experience Level</span>
          </label>
          <input
            type="text"
            name="experience"
            value={formData.experience}
            onChange={handleInputChange}
            className="input-field"
            placeholder="e.g. 3 years as React Developer"
          />
        </div>

        <div className="space-y-2 flex flex-col md:col-span-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Code className="w-3.5 h-3.5 text-brandBlue shrink-0" />
            <span>Skills</span>
          </label>
          <input
            type="text"
            name="skills"
            value={formData.skills}
            onChange={handleInputChange}
            className="input-field"
            placeholder="React, Node.js, Express, MongoDB (comma separated)"
          />
          <p className="text-[10px] text-slate-500 font-semibold">Separate each skill tag with a comma</p>
        </div>

        <div className="space-y-2 flex flex-col">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 text-brandBlue shrink-0" />
            <span>Portfolio Link</span>
          </label>
          <input
            type="url"
            name="portfolio"
            value={formData.portfolio}
            onChange={handleInputChange}
            className="input-field"
            placeholder="https://portfolio.com"
          />
        </div>

        <div className="space-y-2 flex flex-col">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Github className="w-3.5 h-3.5 text-brandBlue shrink-0" />
            <span>GitHub Profile</span>
          </label>
          <input
            type="url"
            name="github"
            value={formData.github}
            onChange={handleInputChange}
            className="input-field"
            placeholder="https://github.com/username"
          />
        </div>

        <div className="space-y-2 flex flex-col md:col-span-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Linkedin className="w-3.5 h-3.5 text-brandBlue shrink-0" />
            <span>LinkedIn Profile</span>
          </label>
          <input
            type="url"
            name="linkedin"
            value={formData.linkedin}
            onChange={handleInputChange}
            className="input-field"
            placeholder="https://linkedin.com/in/username"
          />
        </div>

        {user?.role === 'jobseeker' && (
          <div className="space-y-2 flex flex-col md:col-span-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Resume</label>
            <ResumeUpload onFileSelected={handleFileSelected} currentResumePath={user?.resume} />
          </div>
        )}
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="btn-primary flex items-center gap-2 px-6 py-3 cursor-pointer"
        >
          <Save className="w-4 h-4 shrink-0" />
          <span>{saving ? 'Saving changes...' : 'Save Profile'}</span>
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;
