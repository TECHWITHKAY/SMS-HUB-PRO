import { 
  LayoutDashboard, 
  BarChart3, 
  MessageSquare, 
  Send, 
  Calendar, 
  FileText, 
  History, 
  Users, 
  FolderKanban, 
  Sliders, 
  Hash, 
  Ban, 
  ShieldCheck, 
  ScrollText, 
  LogOut,
  Sparkles
} from "lucide-react";
import { User } from "../types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  onLogout: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, currentUser, onLogout }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, section: "OVERVIEW" },
    { id: "analytics", label: "Analytics", icon: BarChart3, section: "OVERVIEW" },
    
    { id: "single-sms", label: "Single SMS", icon: MessageSquare, section: "MESSAGING" },
    { id: "bulk-sms", label: "Bulk SMS", icon: Send, section: "MESSAGING" },
    { id: "scheduled", label: "Scheduled", icon: Calendar, section: "MESSAGING" },
    { id: "templates", label: "Templates", icon: FileText, section: "MESSAGING" },
    { id: "history", label: "History", icon: History, section: "MESSAGING" },

    { id: "contacts", label: "Contacts", icon: Users, section: "AUDIENCE" },
    { id: "groups", label: "Groups", icon: FolderKanban, section: "AUDIENCE" },
    { id: "blacklist", label: "Blacklist", icon: Ban, section: "AUDIENCE" },

    { id: "providers", label: "Providers", icon: Sliders, section: "ADMINISTRATION" },
    { id: "sender-ids", label: "Sender ID", icon: Hash, section: "ADMINISTRATION" },
    { id: "users", label: "User Control", icon: ShieldCheck, section: "ADMINISTRATION" },
    { id: "audit-logs", label: "Audit Logs", icon: ScrollText, section: "ADMINISTRATION" },
  ];

  const sections = ["OVERVIEW", "MESSAGING", "AUDIENCE", "ADMINISTRATION"];

  return (
    <aside id="app_sidebar" className="w-64 bg-[#012217] text-emerald-100 flex flex-col h-screen shrink-0 border-r border-emerald-950">
      
      {/* Brand Section */}
      <div className="p-6 border-b border-emerald-950/60" id="sidebar_brand">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-400/30 text-emerald-300">
            <Send className="w-5 h-5 rotate-45" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide leading-tight">SMS Hub Pro</h1>
            <span className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase">Messaging Suite</span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-thin scrollbar-thumb-emerald-900 scrollbar-track-transparent">
        {sections.map((section) => {
          const sectionItems = menuItems.filter((item) => item.section === section);
          return (
            <div key={section} className="space-y-1.5" id={`section_${section.toLowerCase()}`}>
              <h3 className="px-3 text-[10px] font-bold text-emerald-500/70 tracking-widest uppercase mb-2">
                {section}
              </h3>
              {sectionItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`sidebar_tab_${item.id}`}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                      isActive
                        ? "bg-emerald-800 text-white shadow-md shadow-emerald-950/40"
                        : "text-emerald-300 hover:text-white hover:bg-emerald-900/40"
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                      isActive ? "text-emerald-300" : "text-emerald-400/80"
                    }`} />
                    <span>{item.label}</span>
                    {item.id === "providers" && (
                      <span className="ml-auto text-[9px] font-semibold bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest animate-pulse">
                        Core
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Footer User Info */}
      <div className="p-4 bg-[#011810] border-t border-emerald-950 flex items-center justify-between gap-2" id="sidebar_footer">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-9 h-9 rounded-full bg-emerald-800 flex items-center justify-center font-bold text-white shrink-0 uppercase border border-emerald-600/30">
            {currentUser?.name.split(" ").map(n => n[0]).join("") || "YA"}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-semibold text-white truncate">{currentUser?.name || "Yaa Adjei"}</h4>
            <p className="text-[10px] text-emerald-400/80 truncate">{currentUser?.role || "Super Admin"}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          id="logout_action_btn"
          title="Sign Out Session"
          className="p-1.5 rounded-lg hover:bg-red-950/40 text-emerald-500 hover:text-red-400 border border-transparent hover:border-red-900/30 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
