import React from 'react';

export const StatCard = ({ title, value, icon: Icon, trend, subtitle, color = 'emerald' }) => {
  const colorMap = {
    emerald: 'from-emerald-500/20 to-green-500/5 text-emerald-500 border-emerald-500/20',
    blue: 'from-blue-500/20 to-indigo-500/5 text-blue-500 border-blue-500/20',
    amber: 'from-amber-500/20 to-yellow-500/5 text-amber-500 border-amber-500/20',
    rose: 'from-rose-500/20 to-red-500/5 text-rose-500 border-rose-500/20',
    purple: 'from-purple-500/20 to-violet-500/5 text-purple-500 border-purple-500/20',
  };

  return (
    <div className="relative overflow-hidden rounded-2xl p-6 bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2 tracking-tight">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3.5 rounded-xl bg-gradient-to-br border ${colorMap[color] || colorMap.emerald}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {trend && (
        <div className="mt-4 flex items-center space-x-1.5 text-xs font-semibold text-emerald-500">
          <span>{trend}</span>
          <span className="text-gray-400 font-normal">vs last month</span>
        </div>
      )}
    </div>
  );
};
