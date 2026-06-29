import React, { useState } from "react";
import { store } from "../store";
import { AuditLog } from "../types";
import { 
  ClipboardList, 
  Search, 
  RefreshCw, 
  Shield, 
  AlertCircle, 
  Zap, 
  DollarSign, 
  User 
} from "lucide-react";

export default function AuditLogsView() {
  const [logs, setLogs] = useState<AuditLog[]>(store.auditLogs);
  const [searchQuery, setSearchQuery] = useState("");

  const refreshList = () => {
    setLogs([...store.auditLogs]);
  };

  const getActionCategoryBadge = (category: string) => {
    switch (category) {
      case "Security":
        return <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-red-500/10 text-red-650 dark:text-red-450 border border-red-500/10">Security</span>;
      case "Gateway":
        return <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/10 text-amber-650 dark:text-amber-450 border border-amber-500/10">Gateway</span>;
      case "Billing":
        return <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-500/10 text-blue-650 dark:text-blue-450 border border-blue-500/10">Billing</span>;
      case "SMS Campaign":
        return <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-650 dark:text-emerald-450 border border-emerald-500/10">Campaign</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-100 text-slate-550 dark:bg-slate-800 dark:text-slate-400">System</span>;
    }
  };

  const filteredLogs = logs.filter(l => 
    l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.performedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="audit_logs_manager_view" className="space-y-6">
      
      {/* Header and Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5" id="audit_title_section">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">System Audit Logs</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Audit administrative operations, security challenges, and transaction balance logs</p>
        </div>

        <button
          onClick={refreshList}
          className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Audit Logs</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-4" id="audit_logs_filters">
        <div className="relative w-full max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action, performer, IP, metadata..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Main logs table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm" id="audit_table_card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Action Event</th>
                <th className="p-4">Category</th>
                <th className="p-4">Performed By</th>
                <th className="p-4">Audit Details</th>
                <th className="p-4 font-mono">IP Address</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No matching security audit records.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                    
                    <td className="p-4 font-semibold text-slate-850 dark:text-white">
                      {l.action}
                    </td>

                    <td className="p-4">
                      {getActionCategoryBadge(l.category)}
                    </td>

                    <td className="p-4">
                      <div>
                        <h4 className="font-semibold text-slate-700 dark:text-slate-300">{l.performedBy}</h4>
                        <span className="text-[9px] bg-slate-100 dark:bg-slate-950 px-1.5 py-0.2 rounded font-semibold text-slate-400 uppercase font-mono">{l.performedByRole}</span>
                      </div>
                    </td>

                    <td className="p-4 max-w-xs text-slate-550 dark:text-slate-400 whitespace-normal leading-relaxed">
                      {l.details}
                    </td>

                    <td className="p-4 font-mono text-slate-400">
                      {l.ipAddress}
                    </td>

                    <td className="p-4 text-slate-500 font-medium">
                      <div>{new Date(l.timestamp).toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{new Date(l.timestamp).toLocaleTimeString()}</div>
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
