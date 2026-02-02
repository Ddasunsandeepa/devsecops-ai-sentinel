
import React from 'react';
import { AppView, User } from '../types';
import { Icons } from './Icons';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  user: User | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, user, onLogout }) => {
  const navItems = [
    { view: AppView.DASHBOARD, label: 'Analytics', icon: Icons.Dashboard },
    { view: AppView.REPOSITORIES, label: 'Repositories', icon: Icons.Repo },
    { view: AppView.SCANNER, label: 'Live Scanner', icon: Icons.Code },
    { view: AppView.ARCHITECTURE, label: 'Architecture', icon: Icons.Architecture },
    { view: AppView.SETTINGS, label: 'Settings', icon: Icons.Settings },
  ];

  if (!user) return null;

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-10">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          <Icons.Shield className="text-slate-950 w-5 h-5" />
        </div>
        <span className="text-lg font-bold text-slate-100 tracking-tight">Sentinel AI</span>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => onChangeView(item.view)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentView === item.view
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-lg p-3 mb-2">
          <div className="flex items-center gap-3">
            <img 
              src={user.avatarUrl} 
              alt="User" 
              className="w-8 h-8 rounded-full border border-slate-600"
            />
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-slate-200 truncate">{user.name}</span>
              <span className="text-xs text-slate-500 truncate">{user.role}</span>
            </div>
          </div>
        </div>
        <button 
          onClick={onLogout} 
          className="w-full flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-red-400 py-2 transition-colors"
        >
          <div className="rotate-180"><Icons.Run size={12} /></div> Sign Out
        </button>
      </div>
    </div>
  );
};
