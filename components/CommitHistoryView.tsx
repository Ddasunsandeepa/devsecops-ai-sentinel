
import React, { useState } from 'react';
import { Icons } from './Icons';
import { MOCK_COMMITS, MOCK_REPOS } from '../constants';
import { analyzeCodeWithGemini } from '../services/geminiService';
import { SecurityScanResult } from '../types';

interface CommitHistoryViewProps {
  repoId: string;
  onBack: () => void;
}

export const CommitHistoryView: React.FC<CommitHistoryViewProps> = ({ repoId, onBack }) => {
  const [selectedCommitId, setSelectedCommitId] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<SecurityScanResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter commits for this repo
  const commits = MOCK_COMMITS.filter(c => c.repo === repoId);
  const repo = MOCK_REPOS.find(r => r.id === repoId);

  const handleAnalyze = async (commitId: string, code: string) => {
    setSelectedCommitId(commitId);
    setLoading(true);
    setScanResult(null);
    try {
        const result = await analyzeCodeWithGemini(code, repoId, commitId);
        setScanResult(result);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  if (selectedCommitId && (loading || scanResult)) {
     // Render Detail View
     return (
        <div className="space-y-6 animate-fade-in pb-10 h-full flex flex-col">
            <button onClick={() => { setSelectedCommitId(null); setScanResult(null); }} className="text-slate-400 hover:text-white flex items-center gap-2 text-sm w-fit">
                <div className="rotate-180"><Icons.Run size={12}/></div> Back to Commits
            </button>
            
            <div className="flex justify-between items-start">
                 <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span className="font-mono bg-slate-800 px-2 py-1 rounded text-lg">{selectedCommitId}</span>
                        <span>Scan Report</span>
                    </h2>
                    <p className="text-slate-400 mt-1">Detailed AI analysis of security flaws.</p>
                 </div>
                 {scanResult && (
                     <div className={`px-4 py-2 rounded-lg border ${
                         scanResult.riskScore > 50 ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                     }`}>
                         <span className="text-xs font-bold uppercase block text-center">Risk Score</span>
                         <span className="text-2xl font-bold">{scanResult.riskScore}</span>
                     </div>
                 )}
            </div>

            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
                    <Icons.AI className="text-emerald-500 w-16 h-16 animate-pulse mb-4" />
                    <h3 className="text-xl font-bold text-white">Gemini is analyzing...</h3>
                    <p className="text-slate-400">Checking against OWASP Top 10</p>
                </div>
            ) : scanResult ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
                    <div className="space-y-4">
                        <h3 className="font-bold text-slate-300 flex items-center gap-2">
                             <Icons.Code size={16} /> Source Context
                        </h3>
                        <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-slate-300 overflow-auto max-h-[600px] whitespace-pre-wrap">
                            {MOCK_COMMITS.find(c => c.id === selectedCommitId)?.codeSnippet}
                        </div>
                    </div>
                    <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2">
                         <h3 className="font-bold text-slate-300 flex items-center gap-2">
                             <Icons.Warning size={16} /> Findings
                        </h3>
                         <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">AI Summary</h4>
                            <p className="text-sm text-slate-300 leading-relaxed">{scanResult.summary}</p>
                        </div>
                        {scanResult.vulnerabilities.map(vuln => (
                            <div key={vuln.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                                        vuln.severity === 'CRITICAL' ? 'text-red-500 bg-red-500/10 border-red-500/20' : 
                                        vuln.severity === 'HIGH' ? 'text-orange-500 bg-orange-500/10 border-orange-500/20' : 
                                        'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
                                    }`}>{vuln.severity}</span>
                                    <span className="text-slate-500 text-xs font-mono">{vuln.location}</span>
                                </div>
                                <h4 className="font-bold text-white mb-1">{vuln.type}</h4>
                                <p className="text-sm text-slate-400 mb-3">{vuln.description}</p>
                                <div className="bg-emerald-900/10 border border-emerald-500/20 rounded p-3">
                                    <p className="text-xs text-emerald-400 font-bold mb-1">Recommended Fix:</p>
                                    <p className="text-xs text-emerald-300">{vuln.remediation}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
     );
  }

  // Render List View
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <button onClick={onBack} className="text-slate-400 hover:text-white flex items-center gap-2 text-sm w-fit">
        <div className="rotate-180"><Icons.Run size={12}/></div> Back to Repositories
      </button>

      <div>
        <h2 className="text-2xl font-bold text-white">Commit History: {repoId}</h2>
        <p className="text-slate-400">Select a commit to view security analysis details.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-xs text-slate-400 uppercase">
                    <th className="p-4">Commit</th>
                    <th className="p-4">Message</th>
                    <th className="p-4">Author</th>
                    <th className="p-4">Risk</th>
                    <th className="p-4">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
                {commits.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">No commits found for this repository mock.</td>
                    </tr>
                ) : commits.map(commit => (
                    <tr key={commit.id} className="hover:bg-slate-800/50 transition-colors group">
                        <td className="p-4 font-mono text-sm text-emerald-400">{commit.id}</td>
                        <td className="p-4 text-slate-200">{commit.message}</td>
                        <td className="p-4 text-slate-400 text-sm">{commit.author}</td>
                        <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                (commit.riskScore || 0) > 50 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
                            }`}>
                                Score: {commit.riskScore || 0}
                            </span>
                        </td>
                        <td className="p-4">
                            <button 
                                onClick={() => handleAnalyze(commit.id, commit.codeSnippet)}
                                className="text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded transition-all text-white"
                            >
                                View Analysis
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};
