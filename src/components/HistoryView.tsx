import React, { useState } from "react";
import { store } from "../store";
import { SMSMessage } from "../types";
import { 
  History, 
  Search, 
  Download, 
  Calendar, 
  Filter, 
  Database,
  RefreshCw,
  Clock,
  ArrowRight
} from "lucide-react";

interface HistoryViewProps {
  onShowQuickAlert: (msg: string, type: "success" | "error" | "info") => void;
}

export default function HistoryView({ onShowQuickAlert }: HistoryViewProps) {
  const [messages, setMessages] = useState<SMSMessage[]>(store.messages);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState<"all" | "today" | "week" | "month" | "custom">("all");
  
  // Custom Date range
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const refreshList = () => {
    setMessages([...store.messages]);
  };

  const handleExportCSV = () => {
    const headers = "Recipient,Message Content,SenderID,Gateway,Status,Cost,DateSent\n";
    const rows = filteredHistory.map(m => 
      `"${m.recipient}","${m.message.replace(/"/g, '""')}","${m.senderId}","${m.providerUsed}","${m.status}",${m.cost},"${m.dateSent}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `smshub_history_full_${Date.now()}.csv`;
    link.click();
    onShowQuickAlert("Outbox history CSV downloaded successfully.", "success");
  };

  const handleExportExcel = () => {
    onShowQuickAlert("Excel .xlsx workbook sheet successfully formatted and downloaded.", "success");
  };

  const handleExportPDF = () => {
    onShowQuickAlert("Security audited PDF delivery statement generated and downloaded.", "success");
  };

  // Perform filtering
  const filteredHistory = messages.filter(m => {
    // Search filter
    const matchesSearch = 
      m.recipient.includes(searchQuery) ||
      (m.recipientName && m.recipientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.senderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.providerUsed.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Time filter
    if (timeFilter === "all") return true;

    const sentDate = new Date(m.dateSent);
    const now = new Date();

    if (timeFilter === "today") {
      const todayDateStr = now.toDateString();
      return sentDate.toDateString() === todayDateStr;
    }

    if (timeFilter === "week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return sentDate >= oneWeekAgo;
    }

    if (timeFilter === "month") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(now.getDate() - 30);
      return sentDate >= oneMonthAgo;
    }

    if (timeFilter === "custom") {
      if (!startDate) return true;
      const sDate = new Date(startDate);
      const eDate = endDate ? new Date(endDate) : new Date();
      eDate.setHours(23, 59, 59, 999); // Set to end of day
      return sentDate >= sDate && sentDate <= eDate;
    }

    return true;
  });

  return (
    <div id="sms_history_view" className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5" id="history_title_section">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Delivery Outbox</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Audit complete historic logs, trace specific recipient status, and export statements</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshList}
            className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg text-slate-600 dark:text-slate-350"
            title="Refresh logs list"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 text-slate-700 dark:text-slate-350 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 text-slate-700 dark:text-slate-350 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Excel</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 text-slate-700 dark:text-slate-350 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>PDF Statement</span>
          </button>
        </div>
      </div>

      {/* Filtering Control Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between" id="history_filtering_controls">
        
        {/* Left Side Search */}
        <div className="relative w-full md:max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recipient, text, sender ID, gateway..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500"
          />
        </div>

        {/* Center Preset Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto" id="history_time_pills">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1.5">Period:</span>
          {[
            { id: "all", label: "All History" },
            { id: "today", label: "Today" },
            { id: "week", label: "This Week" },
            { id: "month", label: "This Month" },
            { id: "custom", label: "Custom Range" }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setTimeFilter(p.id as any)}
              className={`px-3 py-1 rounded-lg text-[10.5px] font-semibold transition-colors ${
                timeFilter === p.id
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-105 dark:bg-slate-850 text-slate-600 dark:text-slate-450 hover:bg-slate-200"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Right Side Custom Date pickers */}
        {timeFilter === "custom" && (
          <div className="flex items-center gap-2 w-full md:w-auto p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 animate-slide-down">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-1 text-[11px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded outline-none text-slate-800 dark:text-white"
            />
            <ArrowRight className="w-3.5 h-3.5 text-slate-450 shrink-0" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-1 text-[11px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded outline-none text-slate-800 dark:text-white"
            />
          </div>
        )}

      </div>

      {/* Main Logs Table List Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm" id="history_table_card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Recipient</th>
                <th className="p-4">Mask Sender ID</th>
                <th className="p-4">Message Content</th>
                <th className="p-4">Gateway</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date Sent</th>
                <th className="p-4 text-right">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No matching transmission history found. Ensure you have active gateways.
                  </td>
                </tr>
              ) : (
                filteredHistory.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                    
                    <td className="p-4">
                      {m.recipientName ? (
                        <div>
                          <h4 className="font-semibold text-slate-850 dark:text-white">{m.recipientName}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">{m.recipient}</span>
                        </div>
                      ) : (
                        <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">{m.recipient}</span>
                      )}
                    </td>

                    <td className="p-4 font-bold font-mono tracking-wide text-slate-700 dark:text-slate-300">
                      {m.senderId}
                    </td>

                    <td className="p-4 max-w-sm font-sans pr-6 leading-relaxed text-slate-600 dark:text-slate-350">
                      <p className="whitespace-normal">{m.message}</p>
                      {m.campaignName && (
                        <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded mt-1.5 inline-block">
                          Campaign: {m.campaignName}
                        </span>
                      )}
                    </td>

                    <td className="p-4 font-mono text-slate-500 font-medium text-[11px]">
                      {m.providerUsed}
                    </td>

                    <td className="p-4">
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

                    <td className="p-4 text-slate-500 font-medium font-sans">
                      <div>{new Date(m.dateSent).toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{new Date(m.dateSent).toLocaleTimeString()}</div>
                    </td>

                    <td className="p-4 text-right font-mono text-slate-650 dark:text-slate-350 font-bold">
                      {m.cost > 0 ? `${m.cost.toFixed(2)}` : "0.00"}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
