import React, { useState } from "react";
import { store } from "../store";
import { User, UserRole } from "../types";
import { 
  ShieldCheck, 
  Plus, 
  Edit2, 
  X, 
  Check, 
  UserX, 
  Key, 
  Mail, 
  ShieldAlert,
  Info
} from "lucide-react";

interface UserManagementViewProps {
  onShowQuickAlert: (msg: string, type: "success" | "error" | "info") => void;
}

export default function UserManagementView({ onShowQuickAlert }: UserManagementViewProps) {
  const [users, setUsers] = useState<User[]>(store.users);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.STAFF);
  const [permissions, setPermissions] = useState<string[]>([]);

  const refreshList = () => {
    setUsers([...store.users]);
  };

  const handleOpenAdd = () => {
    setSelectedUser(null);
    setName("");
    setEmail("");
    setRole(UserRole.STAFF);
    setPermissions(["send_sms", "manage_contacts"]);
    setAddOpen(true);
  };

  const handleOpenEdit = (u: User) => {
    setSelectedUser(u);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setPermissions(u.permissions);
    setEditOpen(true);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      onShowQuickAlert("All asterisk marked fields are required.", "error");
      return;
    }

    if (selectedUser) {
      // Modify
      store.editUser(selectedUser.id, { name, email, role, permissions });
      onShowQuickAlert(`Permissions updated for user "${name}"!`, "success");
    } else {
      // Create
      store.addUser({
        name,
        email,
        role,
        permissions,
        active: true
      });
      onShowQuickAlert(`New system personnel account generated for "${name}"!`, "success");
    }

    setAddOpen(false);
    setEditOpen(false);
    refreshList();
  };

  const handleToggleActive = (u: User) => {
    if (u.id === store.currentUser?.id) {
      onShowQuickAlert("You cannot deactivate your own active session.", "error");
      return;
    }
    const nextState = !u.active;
    store.editUser(u.id, { active: nextState });
    onShowQuickAlert(`User "${u.name}" account status set to ${nextState ? "Active" : "Suspended"}.`, "info");
    refreshList();
  };

  const togglePermission = (perm: string) => {
    if (permissions.includes(perm)) {
      setPermissions(permissions.filter(p => p !== perm));
    } else {
      setPermissions([...permissions, perm]);
    }
  };

  const allAvailablePermissions = [
    { key: "send_sms", label: "Send SMS & Campaigns", desc: "Allows dispatch of Single, Bulk and Group SMS messages." },
    { key: "manage_contacts", label: "Manage Contacts & Groups", desc: "Allows additions, modifications, and deletions of directories." },
    { key: "manage_providers", label: "Manage SMS Gateway Providers", desc: "Allows configuring API URL, Keys, and testing routings." },
    { key: "view_reports", label: "View Analytical Reports", desc: "Allows reading delivery outbox charts, Latency ratios, and Cost projections." },
    { key: "manage_users", label: "Manage Administrative Personnel", desc: "Allows overriding permissions, creating admins, and auditing secure logs." }
  ];

  return (
    <div id="user_control_view" className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5" id="users_title_section">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Access Control</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Audit administrative personnel, adjust role profiles, and override granular feature permissions</p>
        </div>

        <button
          onClick={handleOpenAdd}
          id="users_add_btn"
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add System User</span>
        </button>
      </div>

      {/* Advisory notes */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 flex items-start gap-3" id="users_advisory">
        <ShieldAlert className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">Granular Role-Based Access (RBAC) Controls</h4>
          <p className="leading-relaxed">Access tokens and JWT sessions validate security claims against the user's granular permission matrix. Suspended users are immediately blocked from logging in or calling SMS API proxy services. Changes to keys are tracked in audit logs.</p>
        </div>
      </div>

      {/* User listing cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="users_grid_container">
        {users.map(u => (
          <div 
            key={u.id} 
            className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between ${
              !u.active 
                ? "border-red-500/10 opacity-70" 
                : "border-slate-200 dark:border-slate-800"
            }`}
          >
            <div>
              {/* Profile Card Header */}
              <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-850 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 font-bold flex items-center justify-center border border-emerald-300/10">
                    {u.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <h3 className="text-xs font-extrabold text-slate-850 dark:text-white uppercase tracking-wider">{u.name}</h3>
                    <span className="text-[10px] text-slate-400 block font-mono">UID: {u.id}</span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider ${
                  u.role === UserRole.SUPER_ADMIN
                    ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/10"
                    : u.role === UserRole.ADMIN
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/10"
                    : "bg-slate-100 text-slate-550 dark:bg-slate-850 dark:text-slate-400"
                }`}>
                  {u.role}
                </span>
              </div>

              {/* Email details */}
              <div className="pt-3.5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-300">{u.email}</span>
                </div>
                
                {/* Permissions pills list */}
                <div>
                  <span className="text-slate-400 block mb-1.5">Authorized Roles & claims:</span>
                  <div className="flex flex-wrap gap-1">
                    {u.permissions.map(perm => (
                      <span 
                        key={perm}
                        className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-950 text-slate-500 text-[8.5px] font-mono rounded"
                      >
                        {perm.replace("_", " ")}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-850 pt-3 mt-4">
              <button
                onClick={() => handleToggleActive(u)}
                className={`text-[11px] font-extrabold uppercase tracking-wider ${
                  u.active 
                    ? "text-red-500 hover:text-red-450" 
                    : "text-emerald-600 hover:text-emerald-500"
                }`}
              >
                {u.active ? "Suspend Access" : "Activate User"}
              </button>

              <button
                onClick={() => handleOpenEdit(u)}
                className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-lg text-[10.5px] font-bold hover:text-emerald-650"
              >
                <Key className="w-3 h-3 text-slate-400" />
                <span>Override Roles</span>
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Override Roles permissions drawer/dialog */}
      {(addOpen || editOpen) && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="user_override_modal">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-slate-850 dark:text-white uppercase tracking-wider">
                {selectedUser ? `Override Permissions: ${selectedUser.name}` : "Generate Personnel Credentials"}
              </h3>
              <button 
                onClick={() => {
                  setAddOpen(false);
                  setEditOpen(false);
                }} 
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-4 max-h-[440px] overflow-y-auto pr-1">
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ama Serwaa"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Secure Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. ama@smshub.com"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Role Classification Profile *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-250 outline-none focus:border-emerald-500"
                >
                  <option value={UserRole.SUPER_ADMIN}>Super Admin (Global Master Override)</option>
                  <option value={UserRole.ADMIN}>Admin (Operations Supervisor)</option>
                  <option value={UserRole.STAFF}>Staff Personnel (Restricted sender)</option>
                </select>
              </div>

              {/* Granular checklist list */}
              <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-850">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Granular Permissions Override Matrix</label>
                
                <div className="space-y-2">
                  {allAvailablePermissions.map(p => {
                    const isChecked = permissions.includes(p.key);
                    return (
                      <div 
                        key={p.key} 
                        onClick={() => togglePermission(p.key)}
                        className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                          isChecked 
                            ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-800 dark:text-emerald-400 font-semibold" 
                            : "border-slate-100 dark:border-slate-850 hover:bg-slate-50 bg-slate-50/50 dark:bg-slate-950/20 text-slate-650"
                        }`}
                      >
                        <div className="flex items-start gap-2.5 text-xs">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            readOnly
                            className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <div>
                            <h4>{p.label}</h4>
                            <p className="text-[10px] text-slate-450 font-normal mt-0.5">{p.desc}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAddOpen(false);
                    setEditOpen(false);
                  }}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs shadow-md transition-colors"
                >
                  Apply Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
