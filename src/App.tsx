import React, { useState, useEffect } from "react";
import { store } from "./store";
import { User } from "./types";
import LoginView from "./components/LoginView";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardView from "./components/DashboardView";
import AnalyticsView from "./components/AnalyticsView";
import SMSModuleView from "./components/SMSModuleView";
import ScheduledView from "./components/ScheduledView";
import TemplatesView from "./components/TemplatesView";
import HistoryView from "./components/HistoryView";
import ContactManagementView from "./components/ContactManagementView";
import GroupManagementView from "./components/GroupManagementView";
import BlacklistView from "./components/BlacklistView";
import ProviderSettingsView from "./components/ProviderSettingsView";
import SenderIDView from "./components/SenderIDView";
import UserManagementView from "./components/UserManagementView";
import AuditLogsView from "./components/AuditLogsView";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(store.currentUser);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [theme, setTheme] = useState<"light" | "dark">(store.theme);
  
  // Custom Alert state
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);

  // Sync session and apply color schemes
  useEffect(() => {
    // Sync current user state
    setCurrentUser(store.currentUser);

    // Apply dark class initially
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const handleToggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    store.toggleTheme();
  };

  const handleLoginSuccess = () => {
    setCurrentUser(store.currentUser);
    showToast("Session authenticated successfully! Welcome back to SMS Hub Pro.", "success");
    setActiveTab("dashboard");
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out your current session?")) {
      store.logout();
      setCurrentUser(null);
      showToast("Session safely terminated.", "info");
    }
  };

  const showToast = (msg: string, type: "success" | "error" | "info") => {
    setToast({ msg, type });
    // Auto-dismiss alert banner after 5 seconds
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  // Pre-fill text for templates loading
  const [prefilledMessageText, setPrefilledMessageText] = useState("");

  const handleUseTemplate = (content: string) => {
    // Copy content to clipboard and switch view to single sms compose
    navigator.clipboard.writeText(content);
    setPrefilledMessageText(content);
    setActiveTab("single-sms");
    showToast("Template text copied & preloaded! Paste in composer.", "success");
  };

  // Map tabs to active view components
  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView onShowQuickAlert={showToast} setActiveTab={setActiveTab} />;
      case "analytics":
        return <AnalyticsView onShowQuickAlert={showToast} />;
      case "single-sms":
        return <SMSModuleView activeSubTab="single" onShowQuickAlert={showToast} />;
      case "bulk-sms":
        return <SMSModuleView activeSubTab="bulk" onShowQuickAlert={showToast} />;
      case "scheduled":
        return <ScheduledView onShowQuickAlert={showToast} />;
      case "templates":
        return <TemplatesView onShowQuickAlert={showToast} onUseTemplate={handleUseTemplate} />;
      case "history":
        return <HistoryView onShowQuickAlert={showToast} />;
      case "contacts":
        return <ContactManagementView onShowQuickAlert={showToast} />;
      case "groups":
        return <GroupManagementView onShowQuickAlert={showToast} />;
      case "blacklist":
        return <BlacklistView onShowQuickAlert={showToast} />;
      case "providers":
        return <ProviderSettingsView onShowQuickAlert={showToast} />;
      case "sender-ids":
        return <SenderIDView onShowQuickAlert={showToast} />;
      case "users":
        return <UserManagementView onShowQuickAlert={showToast} />;
      case "audit-logs":
        return <AuditLogsView />;
      default:
        return <DashboardView onShowQuickAlert={showToast} setActiveTab={setActiveTab} />;
    }
  };

  // If user is not authenticated, render Login Page
  if (!currentUser) {
    return (
      <div className={`min-h-screen ${theme === "dark" ? "bg-[#090D16] dark text-white" : "bg-[#F8FAFC] text-slate-900"} flex items-center justify-center font-sans`}>
        <LoginView onLoginSuccess={handleLoginSuccess} />
        
        {/* Alerts Center inside login */}
        {toast && (
          <div className="fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-fade-in bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white max-w-sm">
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            ) : toast.type === "error" ? (
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-blue-500 shrink-0" />
            )}
            <p className="text-xs leading-relaxed font-medium">{toast.msg}</p>
            <button onClick={() => setToast(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`h-screen flex overflow-hidden font-sans ${theme === "dark" ? "bg-[#090D16] text-white" : "bg-[#F8FAFC] text-slate-900"}`}>
      
      {/* Side Navigation Bar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser} 
        onLogout={handleLogout} 
      />

      {/* Main Operations Terminal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        <Header 
          theme={theme}
          onToggleTheme={handleToggleTheme}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onSearchQuery={(q) => {}}
          onShowQuickAlert={showToast}
        />

        {/* Dynamic View Scrollable Frame */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-250 dark:scrollbar-thumb-slate-800">
          <div className="max-w-7xl mx-auto space-y-6">
            {renderActiveView()}
          </div>
        </main>

      </div>

      {/* Global Banner Toast Notifications Alert */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-fade-in bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white max-w-sm">
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : toast.type === "error" ? (
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          ) : (
            <Info className="w-5 h-5 text-blue-500 shrink-0" />
          )}
          <p className="text-xs leading-relaxed font-medium">{toast.msg}</p>
          <button onClick={() => setToast(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
}
