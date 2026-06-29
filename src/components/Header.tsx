import React, { useState, useEffect } from "react";
import { 
  Search, 
  Sun, 
  Moon, 
  Bell, 
  Plus, 
  Send, 
  X, 
  Check, 
  AlertCircle,
  HelpCircle,
  Hash,
  Database
} from "lucide-react";
import { store } from "../store";
import { Contact, SMSTemplate } from "../types";

interface HeaderProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSearchQuery: (query: string) => void;
  onShowQuickAlert: (msg: string, type: "success" | "error" | "info") => void;
}

export default function Header({ 
  theme, 
  onToggleTheme, 
  activeTab, 
  setActiveTab, 
  onSearchQuery, 
  onShowQuickAlert 
}: HeaderProps) {
  const [searchVal, setSearchVal] = useState("");
  const [showQuickSend, setShowQuickSend] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifs, setNotifs] = useState([
    { id: "1", title: "API Status Green", desc: "Hubtel primary Gateway connected successfully.", type: "success", unread: true, time: "Just now" },
    { id: "2", title: "Low Balance Alert Warning", desc: "Balance has dropped below 15,000 threshold.", type: "warning", unread: true, time: "2 hours ago" },
    { id: "3", title: "Bulk Campaign Dispatched", desc: "Completed dispatch of 842 Student messages.", type: "info", unread: false, time: "Yesterday" }
  ]);

  // Quick Send Form
  const [qsPhone, setQsPhone] = useState("");
  const [qsMessage, setQsMessage] = useState("");
  const [qsSender, setQsSender] = useState("");
  const [qsLoading, setQsLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);

  // Auto-fill active default sender
  useEffect(() => {
    setQsSender(store.getDefaultSenderID());
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    onSearchQuery(e.target.value);
  };

  const handleQuickSendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qsPhone || !qsMessage) {
      onShowQuickAlert("Please fill in all Quick Send parameters.", "error");
      return;
    }

    setQsLoading(true);
    setTimeout(() => {
      const activeP = store.getActiveProvider();
      if (!activeP) {
        onShowQuickAlert("No active SMS provider configured in Settings.", "error");
        setQsLoading(false);
        return;
      }

      const res = store.triggerSendSMS(qsSender || "SMSHUBPRO", [qsPhone], qsMessage, "Quick Send Widget");
      setQsLoading(false);
      setShowQuickSend(false);
      
      if (res.successCount > 0) {
        onShowQuickAlert(`Quick SMS successfully dispatched to ${qsPhone}!`, "success");
        setQsPhone("");
        setQsMessage("");
      } else {
        onShowQuickAlert(`Failed to send Quick SMS: ${res.errors[0] || "Gateway Error"}`, "error");
      }
    }, 900);
  };

  const markAllRead = () => {
    setNotifs(notifs.map(n => ({ ...n, unread: false })));
  };

  const unreadCount = notifs.filter(n => n.unread).length;

  const u = store.currentUser;

  return (
    <header id="app_header" className="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 px-6 flex items-center justify-between shrink-0 select-none relative z-40">
      
      {/* Title & Status Indicator */}
      <div className="flex items-center gap-4 shrink-0">
        <h1 className="text-base font-bold text-slate-800 dark:text-white capitalize tracking-tight">
          {activeTab.replace("-", " ")}
        </h1>
        <div className="hidden sm:flex items-center gap-2 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-full border border-slate-100 dark:border-slate-800/60">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Systems Online</span>
        </div>
      </div>

      {/* Center Search Input Widget */}
      <div className="flex-1 max-w-xs mx-4" id="header_search_container">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            id="header_search_input"
            type="text"
            value={searchVal}
            onChange={handleSearchChange}
            placeholder="Search console..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-xs text-slate-850 dark:text-slate-200 outline-none transition-all"
          />
        </div>
      </div>

      {/* Actions Widget Group */}
      <div className="flex items-center gap-4 shrink-0" id="header_actions">
        
        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          id="theme_toggle_btn"
          title="Toggle UI Color Theme"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors"
        >
          {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Notifications Alert Panel */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowQuickSend(false);
            }}
            id="notif_bell_btn"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div id="notif_dropdown" className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50">
              <div className="p-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Alert Center</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[10px] text-emerald-500 hover:text-emerald-400 font-medium">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-64 overflow-y-auto">
                {notifs.map(n => (
                  <div key={n.id} className={`p-3 text-[11px] flex gap-2.5 transition-colors ${n.unread ? "bg-slate-50/50 dark:bg-slate-900/20" : ""}`}>
                    {n.type === "success" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : n.type === "warning" ? (
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <HelpCircle className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-700 dark:text-slate-200 leading-tight">{n.title}</h4>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{n.desc}</p>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 block font-mono">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-slate-100 dark:border-slate-800/85 text-center bg-slate-50/30 dark:bg-slate-900/30">
                <span className="text-[9px] text-slate-400 font-mono">Simulated gateway notification logs</span>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-850"></div>

        {/* User Badge Info */}
        <div className="hidden md:flex items-center gap-2.5">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">{u?.name || "John Doe"}</div>
            <div className="text-[8px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold mt-1 font-mono">{u?.role || "Super Admin"}</div>
          </div>
          <div className="w-7 h-7 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 uppercase select-none">
            {u?.name ? u.name.split(" ").map(n => n[0]).slice(0,2).join("") : "JD"}
          </div>
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-850"></div>

        {/* Quick Send Core Widget Button */}
        <button
          onClick={() => {
            setShowQuickSend(!showQuickSend);
            setShowNotifications(false);
          }}
          id="quick_send_trigger_btn"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New SMS</span>
        </button>

        {/* Quick Send Float Panel */}
        {showQuickSend && (
          <div id="quick_send_panel" className="absolute right-6 top-16 w-80 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-4 z-50 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <Send className="w-3.5 h-3.5 text-emerald-500" />
                <h3 className="text-[10px] font-bold text-slate-850 dark:text-slate-200 uppercase tracking-widest">Quick Send Panel</h3>
              </div>
              <button 
                onClick={() => setShowQuickSend(false)} 
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleQuickSendSubmit} className="space-y-3.5 pt-3">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Sender ID</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-slate-400 font-mono text-[11px]"><Hash className="w-3 h-3" /></span>
                  <input
                    type="text"
                    value={qsSender}
                    onChange={(e) => setQsSender(e.target.value.toUpperCase())}
                    placeholder="e.g. SENDER"
                    maxLength={11}
                    className="w-full pl-7 pr-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded text-xs text-slate-800 dark:text-slate-200 outline-none uppercase font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Recipient Phone</label>
                <input
                  type="tel"
                  required
                  value={qsPhone}
                  onChange={(e) => setQsPhone(e.target.value)}
                  placeholder="e.g. +233544321098"
                  className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded text-xs text-slate-800 dark:text-slate-200 outline-none font-mono"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Message</label>
                  <span className="text-[8px] font-mono text-slate-400">{qsMessage.length} ch / {Math.ceil(qsMessage.length / 160)} SMS</span>
                </div>
                <textarea
                  required
                  rows={3}
                  value={qsMessage}
                  onChange={(e) => setQsMessage(e.target.value)}
                  placeholder="Type quick message text..."
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded text-xs text-slate-800 dark:text-slate-200 outline-none resize-none font-mono"
                />
              </div>

              <div className="pt-1.5">
                <button
                  type="submit"
                  disabled={qsLoading}
                  className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5"
                >
                  {qsLoading ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/35 border-t-white rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Dispatch</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </header>
  );
}
