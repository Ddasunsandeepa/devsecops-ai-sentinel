
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { Icons } from './Icons';

const data = [
  { name: 'SQL Inj', count: 12, color: '#ef4444' },
  { name: 'XSS', count: 8, color: '#f97316' },
  { name: 'Secrets', count: 5, color: '#eab308' },
  { name: 'Deps', count: 15, color: '#3b82f6' },
  { name: 'Config', count: 3, color: '#10b981' },
];

export const DashboardView: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div>
        <h2 className="text-2xl font-bold text-white">Security Analytics</h2>
        <p className="text-slate-400">Real-time metrics from the DevSecOps pipeline.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-lg">
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Scans</p>
            <h3 className="text-2xl font-bold text-white mt-1">1,284</h3>
          </div>
          <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
            <Icons.Code className="text-blue-500" size={20} />
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-lg">
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Critical Vulns</p>
            <h3 className="text-2xl font-bold text-red-500 mt-1">23</h3>
          </div>
          <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center border border-red-500/20">
            <Icons.Warning className="text-red-500" size={20} />
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-lg">
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Mean Time to Fix</p>
            <h3 className="text-2xl font-bold text-white mt-1">4.2h</h3>
          </div>
          <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center border border-purple-500/20">
            <Icons.Pipeline className="text-purple-500" size={20} />
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-lg">
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Healthy Repos</p>
            <h3 className="text-2xl font-bold text-emerald-500 mt-1">94%</h3>
          </div>
          <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
            <Icons.Success className="text-emerald-500" size={20} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-6">Vulnerability Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis 
                    dataKey="name" 
                    stroke="#64748b" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                />
                <YAxis 
                    stroke="#64748b" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                  cursor={{ fill: '#334155', opacity: 0.2 }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3 items-start border-b border-slate-800 pb-3 last:border-0 last:pb-0">
                <div className="mt-1">
                  {i === 1 ? (
                    <Icons.Warning size={16} className="text-red-500" />
                  ) : i === 2 ? (
                    <Icons.Success size={16} className="text-emerald-500" />
                  ) : (
                    <Icons.Repo size={16} className="text-slate-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-slate-200">
                    {i === 1 ? "Critical SQLi found in auth-service" : i === 2 ? "Scan passed for user-service" : "New push to inventory-api"}
                  </p>
                  <p className="text-xs text-slate-500">{i * 12} mins ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
