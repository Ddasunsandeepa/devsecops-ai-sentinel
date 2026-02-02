
import React from 'react';
import { Icons } from './Icons';
import { MOCK_REPOS } from '../constants';
import { Repository } from '../types';

interface RepositoryViewProps {
  onSelectRepo: (repoId: string) => void;
}

export const RepositoryView: React.FC<RepositoryViewProps> = ({ onSelectRepo }) => {
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white">Repositories</h2>
          <p className="text-slate-400">Manage monitored projects and security policies.</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <Icons.Repo size={16} />
            Add Repository
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {MOCK_REPOS.map((repo) => (
          <div 
            key={repo.id} 
            onClick={() => onSelectRepo(repo.id)}
            className="group bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-emerald-500/50 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-800/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${
                    repo.language === 'TypeScript' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                    repo.language === 'Python' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                    repo.language === 'Go' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500' :
                    'bg-slate-700/50 border-slate-600 text-slate-400'
                }`}>
                    <Icons.Code size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                    {repo.name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${repo.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                        {repo.status}
                    </span>
                    <span>•</span>
                    <span>{repo.language}</span>
                    <span>•</span>
                    <span>{repo.commitCount} commits</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                 <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase font-medium">Last Scan</p>
                    <p className="text-sm text-slate-300">{repo.lastScan}</p>
                 </div>
                 
                 <div className="text-right min-w-[100px]">
                    <p className="text-xs text-slate-500 uppercase font-medium">Risk Score</p>
                    <div className="flex items-center justify-end gap-2">
                        <span className={`text-2xl font-bold ${
                            repo.riskScore > 70 ? 'text-red-500' : 
                            repo.riskScore > 30 ? 'text-yellow-500' : 
                            'text-emerald-500'
                        }`}>
                            {repo.riskScore}
                        </span>
                        <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full ${
                                    repo.riskScore > 70 ? 'bg-red-500' : 
                                    repo.riskScore > 30 ? 'bg-yellow-500' : 
                                    'bg-emerald-500'
                                }`} 
                                style={{ width: `${repo.riskScore}%` }}
                            ></div>
                        </div>
                    </div>
                 </div>
                 
                 <Icons.Run className="text-slate-600 group-hover:text-slate-300" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
