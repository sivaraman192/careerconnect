import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const typeConfig = {
    success: {
      bg: 'bg-emerald-950/70 border-emerald-500/30 text-emerald-200',
      icon: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
    },
    error: {
      bg: 'bg-rose-950/70 border-rose-500/30 text-rose-200',
      icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
    },
    warning: {
      bg: 'bg-amber-950/70 border-amber-500/30 text-amber-200',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
    }
  };

  const config = typeConfig[type] || typeConfig.success;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm pointer-events-none">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={`pointer-events-auto flex items-center justify-between gap-4 p-4 rounded-xl border backdrop-blur-md shadow-2xl ${config.bg}`}
      >
        <div className="flex items-center gap-3">
          {config.icon}
          <span className="text-sm font-medium leading-5">{message}</span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-white/5 shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
};

export default Toast;
