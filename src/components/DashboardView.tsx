import React, { useState } from "react";
import { store } from "../store";
import { 
  Send, 
  CheckCircle, 
  XCircle, 
  Wallet, 
  Users, 
  Folder, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Download,
  AlertTriangle,
  History,
  TrendingUp,
  Sparkles
} from "lucide-react";

interface DashboardViewProps {
  onShowQuickAlert: (msg: string, type: "success" | "error" | "info") => void;
  setActiveTab: (tab: string) => void;
}

export default function DashboardView({ onShowQuickAlert, setActiveTab }: DashboardViewProps) {
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("5000");
  const stats = store.getStats();

  // Handle local SMS top up
  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      onShowQuickAlert("Please enter a valid credit amount to top up.", "error");
      return;
    }

    store.balance += amount;
    store.saveState();
    store.addAuditLog("BALANCE_TOPUP", `Topped up SMS credit balance by ${amount.toLocaleString()} units`);
    onShowQuickAlert(`Successfully topped up ${amount.toLocaleString()} SMS credits!`, "success");
    setTopUpOpen(false);
  };

  // Export current list to CSV
  const handleExportCSV = () => {
    const headers = "Recipient,Message,Status,Cost,DateSent,Provider\n";
    const rows = store.messages.map(m => 
      `"${m.recipient}","${m.message.replace(/"/g, '""')}","${m.status}",${m.cost},"${m.dateSent}","${m.providerUsed}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `smshub_history_export_${Date.now()}.csv`);
    a.click();
    onShowQuickAlert("SMS delivery history CSV successfully generated and downloaded.", "success");
  };

  // Recent 5 messages
  const recentMessages = store.messages.slice(0, 5);

  return (
    <div id="dashboard_view" className="space-y-6">
      
      {/* Top Welcome Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5" id="dashboard_title_section">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Live overview of your enterprise messaging operations</p>
        </div>
        
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            id="dashboard_export_btn"
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Logs</span>
          </button>
          
          <button
            onClick={() => setActiveTab("bulk-sms")}
            id="dashboard_campaign_btn"
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm shadow-emerald-950/10 transition-colors"
          >
            <span>New Campaign</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Balance Low Warning Alert banner */}
      {stats.balance < 2000 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl flex items-center justify-between gap-4" id="low_balance_banner">
          <div className="flex items-center gap-3 text-amber-800 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider">SMS Balance critically low</h4>
              <p className="text-xs text-amber-700 dark:text-amber-500/80 mt-0.5">Your available balance is {stats.balance.toLocaleString()} credits. Top up immediately to prevent failure of scheduled bulk deliveries.</p>
            </div>
          </div>
          <button
            onClick={() => setTopUpOpen(true)}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg shrink-0 transition-colors"
          >
            Top up Now
          </button>
        </div>
      )}

      {/* Stats Cards Grid - Sleek High-Density Operator Rail */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4" id="stats_cards_grid">
        
        {/* Card 1: SMS Sent */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">SMS SENT</span>
            <h2 className="text-3xl font-display font-bold text-slate-800 dark:text-white leading-none">{stats.totalSent.toLocaleString()}</h2>
            <div className="flex items-center gap-1 mt-2 text-emerald-600 dark:text-emerald-400 text-xs">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span className="font-semibold">+12.4%</span>
              <span className="text-slate-400">vs last week</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Send className="w-4 h-4 rotate-45" />
          </div>
        </div>

        {/* Card 2: Delivered */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">DELIVERED</span>
            <h2 className="text-3xl font-display font-bold text-slate-800 dark:text-white leading-none">{stats.totalDelivered.toLocaleString()}</h2>
            <div className="flex items-center gap-1 mt-2 text-emerald-600 dark:text-emerald-400 text-xs">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span className="font-semibold">+11.8%</span>
              <span className="text-slate-400">vs last week</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>

        {/* Card 3: Failed Messages */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">FAILED</span>
            <h2 className="text-3xl font-display font-bold text-slate-800 dark:text-white leading-none">{stats.totalFailed.toLocaleString()}</h2>
            <div className="flex items-center gap-1 mt-2 text-red-600 dark:text-red-400 text-xs">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span className="font-semibold">-3.2%</span>
              <span className="text-slate-400">vs last week</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-red-600 dark:text-red-400">
            <XCircle className="w-4 h-4" />
          </div>
        </div>

        {/* Card 4: SMS Balance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">SMS BALANCE</span>
            <h2 className="text-3xl font-display font-bold text-slate-800 dark:text-white leading-none">{stats.balance.toLocaleString()}</h2>
            <div className="flex items-center gap-3 mt-1.5">
              <button
                onClick={() => setTopUpOpen(true)}
                className="text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-colors"
              >
                Top up
              </button>
              <span className="text-[11px] text-slate-400 font-medium">Credits remaining</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Wallet className="w-4 h-4" />
          </div>
        </div>

        {/* Card 5: Contacts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">CONTACTS</span>
            <h2 className="text-3xl font-display font-bold text-slate-800 dark:text-white leading-none">{stats.contactsCount.toLocaleString()}</h2>
            <div className="flex items-center gap-1 mt-2 text-emerald-600 dark:text-emerald-400 text-xs">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span className="font-semibold">+{store.contacts.length + 245}</span>
              <span className="text-slate-400">vs last week</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Users className="w-4 h-4" />
          </div>
        </div>

        {/* Card 6: Groups */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">GROUPS</span>
            <h2 className="text-3xl font-display font-bold text-slate-800 dark:text-white leading-none">{stats.groupsCount.toLocaleString()}</h2>
            <div className="flex items-center gap-1 mt-2 text-emerald-600 dark:text-emerald-400 text-xs">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span className="font-semibold">+{store.groups.length + 2}</span>
              <span className="text-slate-400">vs last week</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Folder className="w-4 h-4" />
          </div>
        </div>

      </div>

      {/* Analytics Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard_charts_grid">
        
        {/* Messages Over Time - High Fidelity Line SVG Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Messages over time</h3>
              <p className="text-xs text-slate-400 mt-0.5">Last 14 days campaign distribution</p>
            </div>
            
            {/* Legend indicators */}
            <div className="flex items-center gap-3.5 text-[10px] font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span> Sent
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-300 rounded-full"></span> Delivered
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-red-400 rounded-full"></span> Failed
              </span>
            </div>
          </div>

          {/* SVG Line Graph */}
          <div className="h-56 relative w-full pt-2">
            <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible">
              {/* Horizontal gridlines */}
              <line x1="30" y1="10" x2="490" y2="10" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-800/50" />
              <line x1="30" y1="50" x2="490" y2="50" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-800/50" />
              <line x1="30" y1="90" x2="490" y2="90" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-800/50" />
              <line x1="30" y1="130" x2="490" y2="130" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-800/50" strokeDasharray="3 3" />

              {/* Data lines */}
              {/* Sent Line */}
              <path
                d="M30,120 Q80,40 130,90 T230,20 T330,80 T430,40 T490,90"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Delivered Line */}
              <path
                d="M30,123 Q80,44 130,93 T230,23 T330,84 T430,43 T490,92"
                fill="none"
                stroke="#6ee7b7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="1"
              />
              {/* Failed Line */}
              <path
                d="M30,150 Q80,140 130,145 T230,135 T330,148 T430,142 T490,152"
                fill="none"
                stroke="#f87171"
                strokeWidth="1.5"
                strokeLinecap="round"
              />

              {/* Grid axes texts */}
              <text x="5" y="15" className="text-[9px] fill-slate-400 font-mono">2,400</text>
              <text x="5" y="55" className="text-[9px] fill-slate-400 font-mono">1,800</text>
              <text x="5" y="95" className="text-[9px] fill-slate-400 font-mono">1,200</text>
              <text x="5" y="135" className="text-[9px] fill-slate-400 font-mono">600</text>

              {/* Bottom dates axes */}
              <text x="30" y="150" className="text-[8px] fill-slate-400 font-mono">Jun 12</text>
              <text x="130" y="150" className="text-[8px] fill-slate-400 font-mono">Jun 16</text>
              <text x="230" y="150" className="text-[8px] fill-slate-400 font-mono">Jun 20</text>
              <text x="330" y="150" className="text-[8px] fill-slate-400 font-mono">Jun 24</text>
              <text x="430" y="150" className="text-[8px] fill-slate-400 font-mono">Jun 26</text>
            </svg>

            {/* Custom Interactive Tooltip Hover Overlay */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-950/90 text-white text-[10px] px-2.5 py-1.5 rounded-lg border border-slate-800 pointer-events-none flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Current peak transmission load: <strong>2,190 SMS/min</strong></span>
            </div>
          </div>
        </div>

        {/* Card: Provider Health - Styled exactly like the technical dark-slate card in the template */}
        <div className="bg-[#1E293B] rounded-xl p-5 text-white border border-slate-800/80 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-200 text-xs tracking-wider uppercase">Provider Health</h2>
              <span className="text-[8px] font-mono font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase tracking-widest border border-emerald-500/20 animate-pulse">Online</span>
            </div>
            
            <div className="space-y-4 pt-1">
              {/* Hubtel API */}
              <div>
                <div className="flex justify-between text-[10px] mb-1.5 font-medium">
                  <span className="text-slate-300 uppercase tracking-wider font-semibold">Hubtel API</span>
                  <span className="text-emerald-400 font-mono font-bold">99.9% Uptime</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[99%] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                </div>
              </div>

              {/* Arkesel API */}
              <div>
                <div className="flex justify-between text-[10px] mb-1.5 font-medium">
                  <span className="text-slate-300 uppercase tracking-wider font-semibold">Arkesel SMS</span>
                  <span className="text-emerald-400 font-mono font-bold">98.7% Uptime</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[98.7%] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                </div>
              </div>

              {/* mNotify */}
              <div>
                <div className="flex justify-between text-[10px] mb-1.5 font-medium">
                  <span className="text-slate-300 uppercase tracking-wider font-semibold">mNotify API</span>
                  <span className="text-emerald-400 font-mono font-bold">99.1% Uptime</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full w-[99.1%] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                </div>
              </div>

              {/* Twilio */}
              <div>
                <div className="flex justify-between text-[10px] mb-1.5 font-medium">
                  <span className="text-slate-400 uppercase tracking-wider font-semibold">Twilio (US)</span>
                  <span className="text-rose-400 font-mono">Inactive</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-slate-700 h-full w-[5%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-3 bg-slate-900/50 rounded-lg border border-slate-800/80">
            <div className="text-[8px] font-bold text-slate-500 uppercase mb-1 font-mono tracking-wider">Latest Gateway Telemetry</div>
            <div className="text-[10px] font-mono text-emerald-400 truncate font-semibold">
              {store.messages.length > 0 
                ? `DISPATCH SUCCESS -> TO ${store.messages[0].recipient}`
                : "NO RECENT OUTBOUND DISPATCHES"
              }
            </div>
            <div className="text-[8px] text-slate-500 mt-1 uppercase tracking-tight font-mono">
              {store.messages.length > 0 
                ? `${store.messages.length} total messages in pool • 0.2s latency`
                : "Operational gateway channels verified"
              }
            </div>
          </div>
        </div>

      </div>

      {/* Recent Outbound Messages & Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard_history_audit">
        
        {/* Recent Outbound SMS Log Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Recent Outbox</h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time gateway transmission activity</p>
            </div>
            
            <button
              onClick={() => setActiveTab("history")}
              className="text-xs text-emerald-600 hover:text-emerald-500 font-semibold flex items-center gap-1"
            >
              <span>View Outbox Log</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto" id="dashboard_outbox_table_container">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-2.5">Recipient</th>
                  <th className="pb-2.5">Message Content</th>
                  <th className="pb-2.5">Gateway</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5 text-right">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentMessages.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-400">
                      No outbound messages recorded in current local outbox.
                    </td>
                  </tr>
                ) : (
                  recentMessages.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 font-medium text-slate-700 dark:text-slate-300">
                        {m.recipientName ? (
                          <div>
                            <div className="font-semibold">{m.recipientName}</div>
                            <div className="text-[10px] text-slate-400">{m.recipient}</div>
                          </div>
                        ) : (
                          m.recipient
                        )}
                      </td>
                      <td className="py-3 max-w-xs truncate text-slate-600 dark:text-slate-400 pr-4" title={m.message}>
                        {m.message}
                      </td>
                      <td className="py-3 text-slate-500 font-mono text-[11px]">
                        {m.providerUsed}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase ${
                          m.status === "Delivered"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
                            : m.status === "Failed"
                            ? "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-400"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400"
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono text-slate-500 font-medium">
                        {m.cost > 0 ? `${m.cost.toFixed(2)}` : "0.00"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Bento column: Delivery breakdown + Live Admin Audit Feed */}
        <div className="space-y-6">
          {/* Delivery Breakdown Radial Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-4">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Delivery breakdown</h3>
              <p className="text-xs text-slate-400 mt-0.5">Performance index</p>
            </div>

            <div className="flex flex-col items-center justify-center" id="breakdown_radial">
              <div className="relative w-28 h-28 flex items-center justify-center">
                {/* Radial Donut using inline SVG */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Track circle */}
                  <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="12" fill="transparent" className="dark:stroke-slate-850" />
                  {/* Delivery Progress circle */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    stroke="#10b981" 
                    strokeWidth="12" 
                    strokeDasharray="251.2" 
                    strokeDashoffset={251.2 * (1 - stats.deliveryRate / 100)} 
                    strokeLinecap="round" 
                    fill="transparent" 
                  />
                </svg>
                {/* Absolute label in center */}
                <div className="absolute text-center">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">{stats.deliveryRate.toFixed(1)}%</h3>
                  <span className="text-[8px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Success</span>
                </div>
              </div>

              {/* Minor descriptive statistics list */}
              <div className="w-full mt-4 grid grid-cols-2 gap-3 text-center border-t border-slate-100 dark:border-slate-800/80 pt-3">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Avg Latency</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">1.8s avg</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Bounce</span>
                  <span className="text-xs font-semibold text-red-500">{stats.failureRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Admin Audit Feed */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active Audit Log</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Security & state changes</p>
              </div>
              <button
                onClick={() => setActiveTab("audit-logs")}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                title="View full audit trail"
              >
                <History className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-48 overflow-y-auto pr-1" id="dashboard_audit_feed">
              {store.auditLogs.slice(0, 3).map((log) => (
                <div key={log.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 text-xs border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-[8px]">{log.action}</span>
                    <span className="text-[8px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 font-medium text-[10px] leading-tight">{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Top Up Modal Overlay */}
      {topUpOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="top_up_modal">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-500" />
              <span>Top up SMS Balance</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Enter the amount of SMS credit units you wish to purchase. Payment is simulated offline.
            </p>

            <form onSubmit={handleTopUpSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Select Preset Amount</label>
                <div className="grid grid-cols-3 gap-2">
                  {["1000", "5000", "20000"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTopUpAmount(preset)}
                      className={`py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                        topUpAmount === preset
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      +{parseInt(preset).toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Custom Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    min="10"
                    required
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-white outline-none focus:border-emerald-500"
                  />
                  <span className="absolute inset-y-0 right-3.5 flex items-center text-xs text-slate-400 font-bold uppercase">SMS Units</span>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setTopUpOpen(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs shadow-md transition-colors"
                >
                  Purchase Credits
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
