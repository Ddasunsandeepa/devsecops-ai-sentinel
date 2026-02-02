import React, { useState } from "react";
import { Icons } from "./Icons";

interface LoginViewProps {
  onLogin: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    window.location.href = "http://localhost:3001/auth/github";
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="z-10 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/30">
            <Icons.Shield className="text-emerald-500 w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Sentinel AI
          </h1>
          <p className="text-slate-400 mt-2 text-center">
            DevSecOps Intelligence Dashboard
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-slate-100 hover:bg-white text-slate-900 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02]"
          >
            {isLoading ? (
              <Icons.Pipeline className="animate-spin w-5 h-5" />
            ) : (
              <Icons.Repo className="w-5 h-5" />
            )}
            Sign in with GitHub
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-700"></div>
            <span className="flex-shrink mx-4 text-slate-500 text-xs uppercase">
              Portfolio Demo Mode
            </span>
            <div className="flex-grow border-t border-slate-700"></div>
          </div>

          <div className="text-center text-xs text-slate-500 leading-relaxed">
            By signing in, you agree to the mock terms of service. This is a
            demonstration project for portfolio purposes.
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 text-slate-600 text-xs">
        v1.4.0-beta • Built with React & Node.js
      </div>
    </div>
  );
};
