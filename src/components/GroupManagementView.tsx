import React, { useState } from "react";
import { store } from "../store";
import { Group, Contact } from "../types";
import { 
  FolderKanban, 
  Plus, 
  Trash2, 
  Users, 
  UserPlus, 
  UserMinus, 
  X, 
  Upload, 
  Search,
  Check,
  ChevronRight,
  Info
} from "lucide-react";

interface GroupManagementViewProps {
  onShowQuickAlert: (msg: string, type: "success" | "error" | "info") => void;
}

export default function GroupManagementView({ onShowQuickAlert }: GroupManagementViewProps) {
  const [groups, setGroups] = useState<Group[]>(store.groups);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  
  // Create group form state
  const [createOpen, setCreateOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");

  // Manage member search states
  const [memberSearch, setMemberSearch] = useState("");
  const [allContactsSearch, setAllContactsSearch] = useState("");

  const refreshList = () => {
    setGroups([...store.groups]);
    if (activeGroup) {
      const updated = store.groups.find(g => g.id === activeGroup.id);
      setActiveGroup(updated || null);
    }
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName) return;

    store.addGroup({
      name: groupName,
      description: groupDesc,
      contactIds: []
    });

    onShowQuickAlert(`Broadcast group "${groupName}" created successfully!`, "success");
    setGroupName("");
    setGroupDesc("");
    setCreateOpen(false);
    refreshList();
  };

  const handleDeleteGroup = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the group "${name}"? Contacts inside the group will not be deleted.`)) {
      store.deleteGroup(id);
      onShowQuickAlert("Group deleted successfully.", "success");
      if (activeGroup?.id === id) setActiveGroup(null);
      refreshList();
    }
  };

  const handleAddMember = (contactId: string) => {
    if (!activeGroup) return;
    if (activeGroup.contactIds.includes(contactId)) return;

    const updatedList = [...activeGroup.contactIds, contactId];
    store.editGroup(activeGroup.id, { contactIds: updatedList });
    refreshList();
    onShowQuickAlert("Contact added to group successfully.", "success");
  };

  const handleRemoveMember = (contactId: string) => {
    if (!activeGroup) return;
    const updatedList = activeGroup.contactIds.filter(id => id !== contactId);
    store.editGroup(activeGroup.id, { contactIds: updatedList });
    refreshList();
    onShowQuickAlert("Contact removed from group.", "info");
  };

  // Group Bulk import contacts simulation
  const handleSimulateGroupBulkImport = () => {
    if (!activeGroup) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      onShowQuickAlert(`Simulating parse of ${file.name} for group appending...`, "info");
      setTimeout(() => {
        // Create 3 mock contacts and append them
        const phone1 = "+233249000111";
        const phone2 = "+233509000112";

        const c1 = store.addContact({ name: "Imported Student A", phoneNumber: phone1, email: "student.a@smshub.com", tags: [activeGroup.name] });
        const c2 = store.addContact({ name: "Imported Student B", phoneNumber: phone2, email: "student.b@smshub.com", tags: [activeGroup.name] });

        const updatedList = Array.from(new Set([...activeGroup.contactIds, c1.id, c2.id]));
        store.editGroup(activeGroup.id, { contactIds: updatedList });
        
        onShowQuickAlert(`Successfully loaded and appended 2 bulk records into ${activeGroup.name}!`, "success");
        refreshList();
      }, 1000);
    };
    input.click();
  };

  // Lists for management panels
  const getGroupMembers = () => {
    if (!activeGroup) return [];
    return activeGroup.contactIds
      .map(id => store.contacts.find(c => c.id === id))
      .filter((c): c is Contact => !!c)
      .filter(c => c.name.toLowerCase().includes(memberSearch.toLowerCase()) || c.phoneNumber.includes(memberSearch));
  };

  const getAvailableContacts = () => {
    if (!activeGroup) return [];
    return store.contacts
      .filter(c => !activeGroup.contactIds.includes(c.id))
      .filter(c => c.name.toLowerCase().includes(allContactsSearch.toLowerCase()) || c.phoneNumber.includes(allContactsSearch));
  };

  const groupMembers = getGroupMembers();
  const availableContacts = getAvailableContacts();

  return (
    <div id="group_management_view" className="space-y-6">
      
      {/* Header and Add Group Action Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5" id="groups_header_section">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Campaign Groups</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Organize audience databases by demographics, employee status, or student lists</p>
        </div>

        <button
          onClick={() => setCreateOpen(true)}
          id="groups_create_btn"
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Group</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="groups_layout_grid">
        
        {/* Groups Grid List Left Side */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Segments</h3>
          
          <div className="space-y-3" id="groups_cards_container">
            {groups.map(g => (
              <div 
                key={g.id} 
                onClick={() => setActiveGroup(g)}
                className={`p-4 border rounded-xl cursor-pointer transition-all text-left relative overflow-hidden group ${
                  activeGroup?.id === g.id
                    ? "bg-emerald-500/5 border-emerald-500/30 shadow-md"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                      <FolderKanban className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{g.name}</h4>
                      <span className="text-[10px] text-slate-400 font-semibold">{g.contactIds.length} Registered Members</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteGroup(g.id, g.name);
                    }}
                    title="Delete group segment"
                    className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                <p className="text-xs text-slate-500 mt-3 line-clamp-2">{g.description || "No description defined for group."}</p>
                <span className="text-[9px] text-slate-400 mt-2 block font-mono">Segment ID: {g.id}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Member Management Panel Right Side */}
        <div className="lg:col-span-2">
          {activeGroup ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6 animate-fade-in" id="group_management_panel">
              
              {/* Panel Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 font-bold px-2 py-0.5 rounded tracking-wider uppercase font-mono">Tag Active</span>
                    <h2 className="text-base font-bold text-slate-800 dark:text-white">{activeGroup.name}</h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{activeGroup.description}</p>
                </div>

                <button
                  onClick={handleSimulateGroupBulkImport}
                  className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Bulk Append CSV</span>
                </button>
              </div>

              {/* Members Management Grid (Current Members vs Available Contacts) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="group_members_grid">
                
                {/* Section 1: Current Group Members */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Group Members ({groupMembers.length})</h3>
                    <input
                      type="text"
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      placeholder="Search member..."
                      className="p-1 px-2 text-[11px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded outline-none w-28"
                    />
                  </div>

                  <div className="border border-slate-200 dark:border-slate-850 rounded-xl max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850 p-2 space-y-1 bg-slate-50/50 dark:bg-slate-950/20" id="current_members_list">
                    {groupMembers.length === 0 ? (
                      <p className="p-4 text-center text-slate-400 text-xs italic">
                        No members currently in group.
                      </p>
                    ) : (
                      groupMembers.map(m => (
                        <div key={m.id} className="p-2 flex items-center justify-between text-xs bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800/80">
                          <div className="truncate pr-2 text-left">
                            <h4 className="font-semibold text-slate-800 dark:text-white truncate">{m.name}</h4>
                            <span className="text-[10px] text-slate-400 font-mono">{m.phoneNumber}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveMember(m.id)}
                            title="Remove contact from this group"
                            className="p-1 rounded text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 shrink-0"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Section 2: Add Contacts from directory */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Add from Directory ({availableContacts.length})</h3>
                    <input
                      type="text"
                      value={allContactsSearch}
                      onChange={(e) => setAllContactsSearch(e.target.value)}
                      placeholder="Search directory..."
                      className="p-1 px-2 text-[11px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded outline-none w-28"
                    />
                  </div>

                  <div className="border border-slate-200 dark:border-slate-850 rounded-xl max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850 p-2 space-y-1 bg-slate-50/50 dark:bg-slate-950/20" id="available_directory_list">
                    {availableContacts.length === 0 ? (
                      <p className="p-4 text-center text-slate-400 text-xs italic font-mono">
                        No contacts available.
                      </p>
                    ) : (
                      availableContacts.map(c => (
                        <div key={c.id} className="p-2 flex items-center justify-between text-xs bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800/80">
                          <div className="truncate pr-2 text-left">
                            <h4 className="font-semibold text-slate-800 dark:text-white truncate">{c.name}</h4>
                            <span className="text-[10px] text-slate-400 font-mono">{c.phoneNumber}</span>
                          </div>
                          <button
                            onClick={() => handleAddMember(c.id)}
                            title="Add contact to this group"
                            className="p-1 rounded text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 shrink-0"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-12 text-center flex flex-col items-center justify-center h-full min-h-[300px]" id="group_empty_panel">
              <FolderKanban className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Group Selected</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">Select any audience group segment from the left-hand listing to manage member lists or perform imports.</p>
            </div>
          )}
        </div>

      </div>

      {/* Create Group Form Modal Overlay */}
      {createOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="create_group_modal">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-slate-850 dark:text-white uppercase tracking-wider">Create Group Segment</h3>
              <button 
                onClick={() => setCreateOpen(false)} 
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Group Title *</label>
                <input
                  type="text"
                  required
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. Church Members"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Description / Target Segment</label>
                <textarea
                  rows={3}
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                  placeholder="Describe group purpose..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs shadow-md transition-colors"
                >
                  Create Segment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
