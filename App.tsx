import React, { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { DashboardView } from "./components/DashboardView";
import { ScannerView } from "./components/ScannerView";
import { ArchitectureView } from "./components/ArchitectureView";
import { LoginView } from "./components/LoginView";
import { RepositoryView } from "./components/RepositoryView";
import { CommitHistoryView } from "./components/CommitHistoryView";
import { AppView } from "./types";
import { Icons } from "./components/Icons";
import { useEffect } from "react";

const App: React.FC = () => {
  const getInitialView = () => {
    const path = window.location.pathname;

    if (path === "/dashboard") return AppView.DASHBOARD;
    if (path === "/repositories") return AppView.REPOSITORIES;
    if (path === "/scanner") return AppView.SCANNER;

    return AppView.LOGIN;
  };

  const initialPath = window.location.pathname;

  const [currentView, setCurrentView] = useState<AppView>(
    initialPath === "/dashboard" ? AppView.DASHBOARD : AppView.LOGIN,
  );

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation State
  const [selectedRepoId, setSelectedRepoId] = useState<string | null>(null);

  const handleLogin = () => {
    window.location.href = "http://localhost:3001/auth/github";
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    window.location.href = "/";
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const auth = params.get("auth");

    if (auth === "success") {
      setIsAuthenticated(true);
      setCurrentView(AppView.DASHBOARD);

      // clean the URL
      window.history.replaceState({}, "", "/dashboard");
      return;
    }

    if (window.location.pathname === "/dashboard") {
      setCurrentView(AppView.DASHBOARD);
    } else {
      setCurrentView(AppView.LOGIN);
    }
  }, []);

  const handleRepoSelect = (repoId: string) => {
    setSelectedRepoId(repoId);
    setCurrentView(AppView.COMMITS);
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.LOGIN:
        return <LoginView onLogin={handleLogin} />;

      case AppView.DASHBOARD:
        return <DashboardView />;

      case AppView.REPOSITORIES:
        return <RepositoryView onSelectRepo={handleRepoSelect} />;

      case AppView.COMMITS:
        if (!selectedRepoId)
          return <RepositoryView onSelectRepo={handleRepoSelect} />;
        return (
          <CommitHistoryView
            repoId={selectedRepoId}
            onBack={() => setCurrentView(AppView.REPOSITORIES)}
          />
        );

      case AppView.SCANNER:
        return <ScannerView />;

      case AppView.ARCHITECTURE:
        return <ArchitectureView />;

      case AppView.SETTINGS:
        return (
          <div className="flex items-center justify-center h-full text-slate-500 animate-fade-in">
            <div className="text-center">
              <Icons.Settings className="mx-auto mb-4 w-12 h-12 opacity-20" />
              <h3 className="text-lg font-bold text-slate-400">Settings</h3>
              <p>Configuration managed via config.yaml in deployment.</p>
            </div>
          </div>
        );

      default:
        return <DashboardView />;
    }
  };

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30">
      {/* Mobile Header */}
      <div className="lg:hidden p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
        <div className="flex items-center gap-2">
          <Icons.Shield className="text-emerald-500 w-6 h-6" />
          <span className="font-bold text-white">Sentinel AI</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-slate-400"
        >
          {isMobileMenuOpen ? (
            <Icons.Error size={24} />
          ) : (
            <div className="space-y-1.5">
              <span className="block w-6 h-0.5 bg-current"></span>
              <span className="block w-6 h-0.5 bg-current"></span>
              <span className="block w-6 h-0.5 bg-current"></span>
            </div>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-slate-900 pt-20 px-4">
          <nav className="space-y-4">
            {[
              AppView.DASHBOARD,
              AppView.REPOSITORIES,
              AppView.SCANNER,
              AppView.ARCHITECTURE,
            ].map((view) => (
              <button
                key={view}
                onClick={() => {
                  setCurrentView(view);
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left py-3 px-4 rounded-lg bg-slate-800 text-white font-medium capitalize"
              >
                {view.toLowerCase()}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="block w-full text-left py-3 px-4 rounded-lg bg-red-900/20 text-red-400 font-medium mt-4"
            >
              Sign Out
            </button>
          </nav>
        </div>
      )}

      {/* Desktop Layout */}
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar (Desktop) */}
        <div className="hidden lg:block w-64">
          <Sidebar
            currentView={currentView}
            onChangeView={setCurrentView}
            onLogout={handleLogout}
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-slate-950 p-4 lg:p-8 relative">
          {/* Background Grid Pattern */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(to right, #cbd5e1 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          ></div>

          <div className="relative z-0 max-w-7xl mx-auto h-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
