import React from 'react';
import { Download, Globe, Phone, Mail } from 'lucide-react';
import { Github } from './SocialIcons';
import StatusBadge from './StatusBadge';

const ApplicationTable = ({ applications, onUpdateStatus, updatingId }) => {
  const statuses = ['Applied', 'Reviewed', 'Shortlisted', 'Rejected', 'Hired'];

  const getResumeUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const serverUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '') 
      : 'http://localhost:5000';
    return `${serverUrl}${path}`;
  };

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/5 text-xs font-bold text-slate-400 uppercase bg-slate-950/40">
            <th className="px-6 py-4">Applicant</th>
            <th className="px-6 py-4">Contact Info</th>
            <th className="px-6 py-4">Links</th>
            <th className="px-6 py-4">Cover Letter</th>
            <th className="px-6 py-4">Resume</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Update Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {applications.map((app) => (
            <tr key={app._id} className="text-sm text-slate-300 hover:bg-slate-900/10 transition-colors">
              <td className="px-6 py-4">
                <div className="font-bold text-slate-100">{app.name}</div>
                <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                  Applied {new Date(app.createdAt).toLocaleDateString()}
                </div>
              </td>

              <td className="px-6 py-4 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{app.email}</span>
                </div>
                {app.phone && (
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{app.phone}</span>
                  </div>
                )}
              </td>

              <td className="px-6 py-4">
                <div className="flex gap-2">
                  {app.github && (
                    <a
                      href={app.github}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-slate-900/80 border border-white/5 hover:text-white transition-colors"
                      title="GitHub"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {app.portfolio && (
                    <a
                      href={app.portfolio}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-slate-900/80 border border-white/5 hover:text-white transition-colors"
                      title="Portfolio"
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                  {!app.github && !app.portfolio && (
                    <span className="text-xs text-slate-500 font-medium">None</span>
                  )}
                </div>
              </td>

              <td className="px-6 py-4 max-w-xs">
                <p className="text-xs text-slate-400 line-clamp-2" title={app.coverLetter}>
                  {app.coverLetter || 'No cover letter provided.'}
                </p>
              </td>

              <td className="px-6 py-4">
                {app.resume ? (
                  <a
                    href={getResumeUrl(app.resume)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-brandBlue hover:text-brandIndigo font-bold transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                ) : (
                  <span className="text-xs text-slate-500">Not Uploaded</span>
                )}
              </td>

              <td className="px-6 py-4">
                <StatusBadge status={app.status} />
              </td>

              <td className="px-6 py-4 text-right">
                <select
                  value={app.status}
                  disabled={updatingId === app._id}
                  onChange={(e) => onUpdateStatus(app._id, e.target.value)}
                  className="bg-slate-950 border border-white/5 text-xs font-bold rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-brandIndigo cursor-pointer"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ApplicationTable;
