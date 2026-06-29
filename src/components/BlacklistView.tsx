import React, { useState } from "react";
import { store } from "../store";
import { BlacklistedNumber } from "../types";
import { 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Search, 
  Check, 
  X, 
  Info,
  SlidersHorizontal,
  Ban
} from "lucide-react";

interface BlacklistViewProps {
  onShowQuickAlert: (msg: string, type: "success" | "error" | "info") => void;
}

export default function BlacklistView({ onShowQuickAlert }: BlacklistViewProps) {
  const [blacklist, setBlacklist] = useState<BlacklistedNumber[]>(store.blacklist);
  const [searchQuery, setSearchQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  // Form State
  const [phoneNumber, setPhoneNumber] = useState("");
  const [reason, setReason] = useState("");

  const refreshList = () => {
    setBlacklist([...store.blacklist]);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;

    const res = store.addToBlacklist(phoneNumber, reason);
    if (!res) {
      onShowQuickAlert("This phone number is already blacklisted in the system.", "error");
      return;
    }

    onShowQuickAlert(`Number "${phoneNumber}" added to blacklist block directory!`, "success");
    setPhoneNumber("");
    setReason("");
    setAddOpen(false);
    refreshList();
  };

  const handleRemove = (id: string, phoneNumber: string) => {
    if (confirm(`Are you sure you want to lift the blacklist on "${phoneNumber}"? Outbound SMS routing will be re-enabled for this destination.`)) {
      store.removeFromBlacklist(id);
      onShowQuickAlert("Blacklist block lifted successfully.", "success");
      refreshList();
    }
  };

  const filteredList = blacklist.filter(item => 
    item.phoneNumber.includes(searchQuery) ||
    item.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="blacklist_manager_view" className="space-y-6">
      
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5" id="blacklist_title_section">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Do Not Disturb (DND)</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage numbers excluded from campaigns to comply with cellular regulations</p>
        </div>

        <button
          onClick={() => setAddOpen(true)}
          id="blacklist_add_btn"
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Block Phone Number</span>
        </button>
      </div>

      {/* Advisory Card */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 flex items-start gap-3" id="blacklist_advisory">
        <Ban className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">Global Campaign Compliance Guardrails</h4>
          <p className="leading-relaxed">Numbers inside this DND repository are automatically bypassed by the bulk composer, preventing regulatory fines and safeguarding gateway delivery standing. Any attempt to route SMS to a blocked target will immediately result in an **Auto-Blocked** outbox error status code.</p>
        </div>
      </div>

      {/* Search Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-4 justify-between" id="blacklist_filters">
        <div className="relative w-full max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search blacklisted number, reason..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Grid listing Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm" id="blacklist_table_card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Blocked Destination</th>
                <th className="p-4">Reason Description</th>
                <th className="p-4">Date Blacklisted</th>
                <th className="p-4 text-center">Campaign Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    Compliance registry is empty. No numbers are currently blacklisted.
                  </td>
                </tr>
              ) : (
                filteredList.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                    
                    <td className="p-4 font-bold font-mono tracking-wider text-slate-800 dark:text-white">
                      {item.phoneNumber}
                    </td>

                    <td className="p-4 text-slate-600 dark:text-slate-350 italic">
                      {item.reason || "Opt-out keyword (e.g. STOP) matched."}
                    </td>

                    <td className="p-4 text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleRemove(item.id, item.phoneNumber)}
                        title="Allow campaign dispatches"
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-lg transition-colors"
                      >
                        Lift Block
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual block phone number Modal */}
      {addOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="add_blacklist_modal">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-slate-850 dark:text-white uppercase tracking-wider">Restrict Phone Destination</h3>
              <button 
                onClick={() => setAddOpen(false)} 
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Destination Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. +233544123456"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Reason for Blacklist / DND Request</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Customer requested opt-out / STOP"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setAddOpen(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-red-600 hover:bg-red-505 text-white font-semibold rounded-xl text-xs shadow-md transition-colors"
                >
                  Block Number
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
