import React from 'react';

const Sidebar = ({ items, activeTab, setActiveTab }) => {
  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="glass rounded-2xl p-4 sticky top-24 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-brandBlue to-brandIndigo text-white shadow-md shadow-brandIndigo/15'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
