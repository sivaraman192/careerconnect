import React from 'react';
import { motion } from 'framer-motion';

const DashboardCard = ({ title, value, icon: Icon, description, color = 'blue', onClick }) => {
  const colorMap = {
    blue: 'from-blue-500/10 to-cyan-500/5 border-blue-500/20 text-blue-400 shadow-blue-500/5',
    purple: 'from-purple-500/10 to-pink-500/5 border-purple-500/20 text-purple-400 shadow-purple-500/5',
    green: 'from-emerald-500/10 to-teal-500/5 border-emerald-500/20 text-emerald-400 shadow-emerald-500/5',
    orange: 'from-orange-500/10 to-amber-500/5 border-orange-500/20 text-orange-400 shadow-orange-500/5',
  };

  const selectedColor = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      onClick={onClick}
      className={`glass-card p-6 rounded-2xl border bg-gradient-to-br ${selectedColor} shadow-xl flex items-center justify-between gap-4 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="space-y-1.5">
        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">{title}</span>
        <span className="text-3xl font-extrabold text-slate-100 block">{value}</span>
        {description && <span className="text-[10px] text-slate-500 font-semibold block">{description}</span>}
      </div>
      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 shadow-inner">
        <Icon className="w-6 h-6 shrink-0" />
      </div>
    </motion.div>
  );
};

export default DashboardCard;
