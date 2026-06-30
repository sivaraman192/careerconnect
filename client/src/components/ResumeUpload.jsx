import React, { useState } from 'react';
import { UploadCloud, File, CheckCircle2, AlertCircle } from 'lucide-react';

const ResumeUpload = ({ onFileSelected, currentResumePath }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext)) {
      setError('Only PDF, DOC, and DOCX files are allowed!');
      setSelectedFile(null);
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5MB limit!');
      setSelectedFile(null);
      return false;
    }
    setError('');
    setSelectedFile(file);
    onFileSelected(file);
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateFile(e.target.files[0]);
    }
  };

  const getFileName = (path) => {
    if (!path) return '';
    // Strip timestamps if uploaded
    return path.split('/').pop().split('-').slice(2).join('-') || path.split('/').pop();
  };

  return (
    <div className="space-y-2">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-6 transition-all duration-200 flex flex-col items-center justify-center text-center ${
          dragActive
            ? 'border-brandBlue bg-brandBlue/5 scale-[0.99]'
            : selectedFile
            ? 'border-emerald-500/40 bg-emerald-500/5'
            : 'border-slate-800/80 hover:border-slate-700 bg-slate-900/20 hover:bg-slate-900/40'
        }`}
      >
        <input
          type="file"
          id="resume-file-input"
          className="hidden"
          accept=".pdf,.doc,.docx"
          onChange={handleFileInput}
        />

        {selectedFile ? (
          <div className="space-y-2">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 inline-block">
              <File className="w-8 h-8" />
            </div>
            <p className="text-sm font-bold text-slate-100">{selectedFile.name}</p>
            <p className="text-[10px] text-slate-400 font-semibold">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
            </p>
          </div>
        ) : (
          <label htmlFor="resume-file-input" className="cursor-pointer space-y-2 flex flex-col items-center">
            <div className="p-3 bg-slate-900/60 border border-white/5 rounded-2xl text-slate-300">
              <UploadCloud className="w-8 h-8" />
            </div>
            <p className="text-sm font-bold text-slate-200">
              Drag & drop resume here, or <span className="text-brandBlue font-bold hover:underline">browse</span>
            </p>
            <p className="text-[10px] text-slate-500 font-semibold">Supports PDF, DOC, DOCX up to 5MB</p>
          </label>
        )}

        {error && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-400 font-semibold bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {currentResumePath && !selectedFile && (
        <div className="flex items-center gap-2 p-3 bg-slate-900/40 border border-white/5 rounded-xl text-xs font-semibold text-slate-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate">Active Resume: {getFileName(currentResumePath)}</span>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
