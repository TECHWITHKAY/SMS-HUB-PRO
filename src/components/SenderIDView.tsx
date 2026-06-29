import React, { useState } from "react";
import { store } from "../store";
import { SenderID } from "../types";
import { 
  Hash, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  HelpCircle, 
  Clock, 
  AlertTriangle 
} from "lucide-react";

interface SenderIDViewProps {
  onShowQuickAlert: (msg: string, type: "success" | "error" | "info") => void;
}

export default function SenderIDView({ onShowQuickAlert }: SenderIDViewProps) {
  const [senderIDs, setSenderIDs] = useState<SenderID[]>(store.senderIDs);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const refreshList = () => {
    setSenderIDs([...store.senderIDs]);
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const clean = newName.trim().toUpperCase();
    if (clean.length < 3 || clean.length > 11) {
      onShowQuickAlert("Sender ID must be between 3 and 11 alpha-numeric characters.", "error");
      return;
    }

    const res = store.addSenderID(clean);
    if (!res) {
      onShowQuickAlert("A Sender ID with that name already exists in the system directory.", "error");
      return;
    }

    onShowQuickAlert(`Sender ID request for "${clean}" successfully registered as active!`, "success");
    setNewName("");
    setAddOpen(false);
    refreshList();
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete Sender ID "${name}" permanently?`)) {
      store.deleteSenderID(id);
      onShowQuickAlert("Sender ID deleted successfully.", "success");
      refreshList();
    }
  };

  const handleToggleDefault = (id: string, name: string) => {
    store.editSenderID(id, { isDefault: true });
    onShowQuickAlert(`Sender ID "${name}" set as system default outbound masking name.`, "success");
    refreshList();
  };

  const handleToggleStatus = (id: string, name: string, currentStatus: "Active" | "Pending" | "Inactive") => {
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
    store.editSenderID(id, { status: nextStatus });
    onShowQuickAlert(`Sender ID "${name}" status toggled to "${nextStatus}".`, "info");
    refreshList();
  };

  return (
    <div id="sender_id_view" className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5" id="sender_id_title_section">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Sender ID Masking</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Register custom alphanumeric labels to mask outbound phone numbers</p>
        </div>

        <button
          onClick={() => setAddOpen(true)}
          id="sender_id_add_btn"
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Request Sender ID</span>
        </button>
      </div>

      {/* Advisory Note */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 flex items-start gap-3" id="sender_advisory">
        <HelpCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">Outbound Masking Standards</h4>
          <p className="leading-relaxed">A Sender ID must adhere to GSMA regulations: Max 11 characters, no symbols/spaces, and cannot represent restricted words. Only **Active** Sender IDs can be loaded into message compose panels. The selected default ID is preloaded automatically in the SMS editor.</p>
        </div>
      </div>

      {/* List Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm" id="sender_ids_table_card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Sender ID Mask</th>
                <th className="p-4">Registration Date</th>
                <th className="p-4">Global Default</th>
                <th className="p-4">Regulatory Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {senderIDs.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                  
                  <td className="p-4 font-bold text-slate-800 dark:text-white font-mono text-sm tracking-wider">
                    {s.name}
                  </td>

                  <td className="p-4 text-slate-500">
                    {new Date(s.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </td>

                  <td className="p-4">
                    {s.isDefault ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
                        Default Active
                      </span>
                    ) : (
                      s.status === "Active" ? (
                        <button
                          onClick={() => handleToggleDefault(s.id, s.name)}
                          className="text-[10px] text-emerald-600 hover:text-emerald-500 font-bold hover:underline"
                        >
                          Make Default
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400">-</span>
                      )
                    )}
                  </td>

                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${
                      s.status === "Active"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
                        : s.status === "Pending"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400"
                        : "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-400"
                    }`}>
                      {s.status}
                    </span>
                  </td>

                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      {s.status !== "Pending" && (
                        <button
                          onClick={() => handleToggleStatus(s.id, s.name, s.status)}
                          className={`text-xs font-bold ${
                            s.status === "Active" 
                              ? "text-red-500 hover:text-red-400" 
                              : "text-emerald-600 hover:text-emerald-500"
                          }`}
                        >
                          {s.status === "Active" ? "Deactivate" : "Activate"}
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDelete(s.id, s.name)}
                        disabled={s.isDefault}
                        title="Delete registration request"
                        className="p-1 rounded text-slate-400 hover:text-red-500 disabled:opacity-30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Sender ID Modal Overlay */}
      {addOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="add_sender_modal">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-slate-850 dark:text-white uppercase tracking-wider">Request Brand Sender ID</h3>
              <button 
                onClick={() => setAddOpen(false)} 
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Desired Masking Label (3-11 chars) *</label>
                <input
                  type="text"
                  required
                  maxLength={11}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value.toUpperCase())}
                  placeholder="e.g. NIKEALERT"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500 uppercase tracking-widest font-mono font-bold"
                />
                <span className="text-[10px] text-slate-400 block mt-1">Must be entirely letters and numbers. Special character symbols are rejected by cellular hubs.</span>
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
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs shadow-md transition-colors"
                >
                  Request Activation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
