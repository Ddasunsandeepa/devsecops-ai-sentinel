import React, { useState, useEffect } from "react";
import { Icons } from "./Icons";
import { analyzeCodeWithGemini } from "../services/geminiService";
import { SecurityScanResult } from "../types";

export const ScannerView: React.FC = () => {
  const [code, setCode] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SecurityScanResult | null>(null);
  const [selectedCommit, setSelectedCommit] = useState<string>("");

  // Handle template selection
  const handleScan = async () => {
    if (!code.trim()) return;

    setIsAnalyzing(true);
    setResult(null);
    try {
      // Simulate network delay for realism if it's too fast
      const scanResult = await analyzeCodeWithGemini(
        code,
        "repo",
        selectedCommit,
      );

      setResult(scanResult);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      case "HIGH":
        return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "MEDIUM":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      default:
        return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    }
  };
  const [commits, setCommits] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:3001/api/repos")
      .then((r) => r.json())
      .then((repos) => {
        if (repos.length > 0) {
          fetch(`http://localhost:3001/api/repos/${repos[0].id}/commits`)
            .then((r) => r.json())
            .then(setCommits);
        }
      });
  }, []);

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in pb-10">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Live Vulnerability Scanner
          </h2>
          <p className="text-slate-400">
            Analyze code snippets or historical commits for security flaws using
            Gemini.
          </p>
        </div>
        <div className="flex gap-2">
          <select
            className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg p-2.5"
            onChange={(e) => {
              const commit = commits.find((c) => c.hash === e.target.value);
              if (commit) {
                setSelectedCommit(commit.hash);
                setCode(commit.message); // or later load diff
                setResult(null);
              }
            }}
          >
            <option value="">-- Select GitHub Commit --</option>
            {commits.map((c) => (
              <option key={c.hash} value={c.hash}>
                {c.hash.slice(0, 7)} – {c.message}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[500px]">
        {/* Editor Side */}
        <div className="flex flex-col gap-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 flex-1 flex flex-col overflow-hidden shadow-xl">
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
              <span className="text-xs font-mono text-slate-400">
                source_code.ts
              </span>
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></span>
                <span className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></span>
              </div>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 bg-slate-900 p-4 font-mono text-sm text-slate-300 resize-none focus:outline-none placeholder-slate-600"
              placeholder="// Paste code here to analyze..."
              spellCheck="false"
            />
          </div>
          <button
            onClick={handleScan}
            disabled={isAnalyzing || !code}
            className={`flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
              isAnalyzing
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20"
            }`}
          >
            {isAnalyzing ? (
              <>
                <Icons.Pipeline className="animate-spin" size={18} />{" "}
                Analyzing...
              </>
            ) : (
              <>
                <Icons.Run size={18} /> Run Security Scan
              </>
            )}
          </button>
        </div>

        {/* Results Side */}
        <div className="flex flex-col gap-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 flex-1 p-6 overflow-y-auto shadow-xl">
            {!result && !isAnalyzing && (
              <div className="h-full flex flex-col items-center justify-center text-slate-600">
                <Icons.Shield size={48} className="mb-4 opacity-50" />
                <p>Ready to scan.</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
                </div>
                <p className="text-emerald-500 font-mono text-sm animate-pulse">
                  Detecting vulnerabilities...
                </p>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Analysis Report
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      ID: {result.scanId.slice(0, 8)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-slate-400 mb-1">
                      Risk Score
                    </span>
                    <div
                      className={`text-2xl font-bold ${result.riskScore > 70 ? "text-red-500" : result.riskScore > 30 ? "text-yellow-500" : "text-green-500"}`}
                    >
                      {result.riskScore}/100
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Executive Summary
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {result.summary}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Findings ({result.vulnerabilities.length})
                  </h4>
                  {result.vulnerabilities.length === 0 ? (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
                      <Icons.Success className="text-green-500" />
                      <span className="text-green-400 text-sm">
                        No vulnerabilities detected.
                      </span>
                    </div>
                  ) : (
                    result.vulnerabilities.map((vuln) => (
                      <div
                        key={vuln.id}
                        className="bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-bold border ${getSeverityColor(vuln.severity)}`}
                            >
                              {vuln.severity}
                            </span>
                            <span className="font-medium text-slate-200">
                              {vuln.type}
                            </span>
                          </div>
                          <span className="text-xs font-mono text-slate-500">
                            Line: {vuln.location}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 mb-3">
                          {vuln.description}
                        </p>
                        <div className="bg-slate-950/50 p-3 rounded border border-slate-800">
                          <div className="flex items-center gap-2 mb-1">
                            <Icons.Security
                              size={12}
                              className="text-emerald-500"
                            />
                            <span className="text-xs font-bold text-emerald-500">
                              Remediation
                            </span>
                          </div>
                          <p className="text-xs text-slate-300">
                            {vuln.remediation}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
