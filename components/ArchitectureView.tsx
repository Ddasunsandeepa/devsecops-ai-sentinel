import React from 'react';
import { Icons } from './Icons';
import { JobRole } from '../types';

export const ArchitectureView: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-white">System Architecture</h2>
        <p className="text-slate-400">High-level design of the DevSecOps pipeline and component breakdown.</p>
      </div>

      {/* Architecture Diagram Visualization */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <Icons.Architecture size={120} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 relative z-10">
            {/* Source */}
            <div className="lg:col-span-1 flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-center mb-4">
                    <Icons.Repo size={32} className="text-white" />
                </div>
                <h3 className="font-bold text-white mb-2">GitHub</h3>
                <p className="text-xs text-center text-slate-400">OAuth & Webhooks trigger scans on push</p>
            </div>

            {/* Arrow */}
            <div className="hidden lg:flex items-center justify-center">
                <div className="h-0.5 w-full bg-slate-700 relative">
                    <div className="absolute right-0 -top-1.5 w-3 h-3 border-t-2 border-r-2 border-slate-700 rotate-45"></div>
                </div>
            </div>

            {/* CI/CD & Backend */}
            <div className="lg:col-span-1 flex flex-col items-center">
                 <div className="w-16 h-16 bg-blue-900/20 border border-blue-500/30 rounded-lg flex items-center justify-center mb-4">
                    <Icons.Pipeline size={32} className="text-blue-400" />
                </div>
                <h3 className="font-bold text-blue-400 mb-2">CI/CD Pipeline</h3>
                <p className="text-xs text-center text-slate-400">Dockerized Node.js Services receive payload</p>
            </div>

             {/* Arrow */}
             <div className="hidden lg:flex items-center justify-center">
                <div className="h-0.5 w-full bg-slate-700 relative">
                    <div className="absolute right-0 -top-1.5 w-3 h-3 border-t-2 border-r-2 border-slate-700 rotate-45"></div>
                </div>
            </div>

            {/* AI Engine */}
            <div className="lg:col-span-1 flex flex-col items-center">
                 <div className="w-16 h-16 bg-purple-900/20 border border-purple-500/30 rounded-lg flex items-center justify-center mb-4">
                    <Icons.AI size={32} className="text-purple-400" />
                </div>
                <h3 className="font-bold text-purple-400 mb-2">AI Analysis</h3>
                <p className="text-xs text-center text-slate-400">Python/FastAPI + Gemini Model (Security Agent)</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-8 relative z-10">
             {/* Empty spacer to align */}
             <div className="lg:col-span-2"></div>

             {/* Arrow Down */}
             <div className="hidden lg:flex flex-col items-center justify-center h-full -mt-6">
                <div className="w-0.5 h-12 bg-slate-700"></div>
            </div>
             <div className="lg:col-span-2"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 relative z-10">
             {/* Dashboard */}
             <div className="lg:col-span-1 flex flex-col items-center">
                 <div className="w-16 h-16 bg-emerald-900/20 border border-emerald-500/30 rounded-lg flex items-center justify-center mb-4">
                    <Icons.Dashboard size={32} className="text-emerald-400" />
                </div>
                <h3 className="font-bold text-emerald-400 mb-2">Dashboard</h3>
                <p className="text-xs text-center text-slate-400">Next.js + Tailwind Visualization</p>
            </div>

             {/* Arrow */}
             <div className="hidden lg:flex items-center justify-center">
                <div className="h-0.5 w-full bg-slate-700 relative">
                     <div className="absolute left-0 -top-1.5 w-3 h-3 border-b-2 border-l-2 border-slate-700 rotate-45"></div>
                </div>
            </div>

            {/* Database */}
            <div className="lg:col-span-1 flex flex-col items-center">
                 <div className="w-16 h-16 bg-orange-900/20 border border-orange-500/30 rounded-lg flex items-center justify-center mb-4">
                    <Icons.Database size={32} className="text-orange-400" />
                </div>
                <h3 className="font-bold text-orange-400 mb-2">PostgreSQL</h3>
                <p className="text-xs text-center text-slate-400">Stores vulnerability reports & history</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Icons.Server className="text-blue-400" size={20}/> Component Breakdown
              </h3>
              <ul className="space-y-3">
                  <li className="flex gap-3 text-sm text-slate-300">
                      <span className="font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded">API Gateway</span>
                      <span>Express.js handling webhooks & client REST reqs.</span>
                  </li>
                  <li className="flex gap-3 text-sm text-slate-300">
                      <span className="font-mono text-purple-400 bg-purple-950/50 px-2 py-0.5 rounded">Analysis Engine</span>
                      <span>FastAPI wrapper around Gemini LLM for diff processing.</span>
                  </li>
                  <li className="flex gap-3 text-sm text-slate-300">
                      <span className="font-mono text-orange-400 bg-orange-950/50 px-2 py-0.5 rounded">Persistence</span>
                      <span>PostgreSQL for relational mapping of Commit {"->"} Vulnerability.</span>

                  </li>
                  <li className="flex gap-3 text-sm text-slate-300">
                      <span className="font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded">Orchestrator</span>
                      <span>BullMQ (Redis) for async job processing of scans.</span>
                  </li>
              </ul>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Icons.Security className="text-red-400" size={20}/> Security & DevOps Features
              </h3>
              <ul className="space-y-3">
                  <li className="flex gap-3 text-sm text-slate-300">
                      <Icons.Success size={16} className="text-green-500 mt-0.5" />
                      <span><strong>OAuth 2.0:</strong> Secure GitHub authentication flow.</span>
                  </li>
                  <li className="flex gap-3 text-sm text-slate-300">
                      <Icons.Success size={16} className="text-green-500 mt-0.5" />
                      <span><strong>Webhook Verification:</strong> HMAC SHA-256 signature checks.</span>
                  </li>
                  <li className="flex gap-3 text-sm text-slate-300">
                      <Icons.Success size={16} className="text-green-500 mt-0.5" />
                      <span><strong>Containerization:</strong> Docker Compose for multi-service stack.</span>
                  </li>
                  <li className="flex gap-3 text-sm text-slate-300">
                      <Icons.Success size={16} className="text-green-500 mt-0.5" />
                      <span><strong>LLM Guardrails:</strong> System prompts to prevent hallucinations.</span>
                  </li>
              </ul>
          </div>
      </div>

       <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <h3 className="text-lg font-bold text-white mb-4">Role Relevance</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             {Object.entries(JobRole).map(([key, role]) => (
                 <div key={key} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                     <div className="text-xs font-mono text-slate-500 mb-1">{role}</div>
                     <p className="text-xs text-slate-300 leading-relaxed">
                        {key === 'BACKEND' && 'REST API design, Async Queue, Database Schema.'}
                        {key === 'DEVOPS' && 'Docker, GitHub Actions, Nginx Reverse Proxy.'}
                        {key === 'SECURITY' && 'OWASP logic, Secret Scanning, Auth flow.'}
                        {key === 'FULLSTACK' && 'Connecting AI results to React Dashboard.'}
                     </p>
                 </div>
             ))}
          </div>
      </div>
    </div>
  );
};