import React, { useState } from "react";
import { store } from "../store";
import { Contact } from "../types";
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Download, 
  Upload, 
  Tag, 
  X, 
  Check, 
  FileSpreadsheet,
  Mail,
  Phone
} from "lucide-react";

interface ContactManagementViewProps {
  onShowQuickAlert: (msg: string, type: "success" | "error" | "info") => void;
}

export default function ContactManagementView({ onShowQuickAlert }: ContactManagementViewProps) {
  const [contactsList, setContactsList] = useState<Contact[]>(store.contacts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTagFilter, setSelectedTagFilter] = useState("ALL");
  
  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState<Contact | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formTagsString, setFormTagsString] = useState("");

  const refreshList = () => {
    setContactsList([...store.contacts]);
  };

  const handleOpenAdd = () => {
    setFormName("");
    setFormPhone("");
    setFormEmail("");
    setFormTagsString("");
    setAddModalOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone) {
      onShowQuickAlert("Name and Phone Number are mandatory.", "error");
      return;
    }

    const cleanTags = formTagsString
      .split(",")
      .map(t => t.trim())
      .filter(t => t.length > 0);

    store.addContact({
      name: formName,
      phoneNumber: formPhone,
      email: formEmail,
      tags: cleanTags
    });

    onShowQuickAlert(`Contact ${formName} successfully saved!`, "success");
    setAddModalOpen(false);
    refreshList();
  };

  const handleOpenEdit = (c: Contact) => {
    setCurrentContact(c);
    setFormName(c.name);
    setFormPhone(c.phoneNumber);
    setFormEmail(c.email);
    setFormTagsString(c.tags.join(", "));
    setEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentContact) return;

    const cleanTags = formTagsString
      .split(",")
      .map(t => t.trim())
      .filter(t => t.length > 0);

    store.editContact(currentContact.id, {
      name: formName,
      phoneNumber: formPhone,
      email: formEmail,
      tags: cleanTags
    });

    onShowQuickAlert("Contact modifications applied successfully.", "success");
    setEditModalOpen(false);
    setCurrentContact(null);
    refreshList();
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete contact "${name}" permanently?`)) {
      store.deleteContact(id);
      onShowQuickAlert("Contact record successfully expunged.", "success");
      refreshList();
    }
  };

  const handleExportCSV = () => {
    const headers = "Name,Phone Number,Email,Tags,Created At\n";
    const rows = store.contacts.map(c => 
      `"${c.name}","${c.phoneNumber}","${c.email}","${c.tags.join('|')}","${c.createdAt}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `smshub_contacts_export_${Date.now()}.csv`;
    link.click();
    onShowQuickAlert("CSV contact export generated and downloaded.", "success");
  };

  const handleSimulateImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv,.xlsx";
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      onShowQuickAlert(`Simulating CSV Parse of ${file.name}...`, "info");
      setTimeout(() => {
        // Pre-populate with beautiful contacts
        const items = [
          { name: "Sylvia Osei", phoneNumber: "+233541122334", email: "sylvia@smshub.com", tags: ["VIP", "Customer"] },
          { name: "Robert Boateng", phoneNumber: "+233207766554", email: "robert@boateng.com", tags: ["Event Attendees"] },
          { name: "Akua Mansah", phoneNumber: "+233243110099", email: "akua@gmail.com", tags: ["Students"] }
        ];

        items.forEach(item => {
          store.addContact(item);
        });

        onShowQuickAlert(`Successfully parsed & imported ${items.length} contacts from ${file.name}!`, "success");
        refreshList();
      }, 1000);
    };
    input.click();
  };

  // Get unique tags across all contacts for filtering
  const allTags = Array.from(new Set(store.contacts.flatMap(c => c.tags)));

  // Perform search and tag filtering
  const filteredContacts = contactsList.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phoneNumber.includes(searchQuery) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = 
      selectedTagFilter === "ALL" || 
      c.tags.includes(selectedTagFilter);

    return matchesSearch && matchesTag;
  });

  return (
    <div id="contacts_management_view" className="space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5" id="contacts_title_section">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Audience Directory</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage contact records, upload CSV templates, and tag custom groups</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateImport}
            id="contacts_import_btn"
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleExportCSV}
            id="contacts_export_btn"
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Contacts</span>
          </button>

          <button
            onClick={handleOpenAdd}
            id="contacts_add_btn"
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row items-center gap-4 justify-between" id="contacts_filter_bar">
        
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, phone, email..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500"
          />
        </div>

        {/* Tag Pill Selector Filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none py-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Tags:</span>
          <button
            onClick={() => setSelectedTagFilter("ALL")}
            className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wide uppercase transition-colors shrink-0 ${
              selectedTagFilter === "ALL"
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            }`}
          >
            All Contacts
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTagFilter(tag)}
              className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wide uppercase transition-colors shrink-0 ${
                selectedTagFilter === tag
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm" id="contacts_table_card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Contact Profile</th>
                <th className="p-4">Phone Number</th>
                <th className="p-4">Email</th>
                <th className="p-4">Tags</th>
                <th className="p-4">Date Joined</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No matching audience records found. Select "Add Contact" to create manually.
                  </td>
                </tr>
              ) : (
                filteredContacts.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                    
                    {/* Visual Avatar and Name */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 font-bold flex items-center justify-center border border-emerald-300/20">
                          {c.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800 dark:text-white">{c.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">UID: {c.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-mono text-slate-700 dark:text-slate-300 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{c.phoneNumber}</span>
                      </div>
                    </td>

                    <td className="p-4 text-slate-500 dark:text-slate-400">
                      {c.email ? (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.email}</span>
                        </div>
                      ) : (
                        <span className="italic text-slate-350">No email defined</span>
                      )}
                    </td>

                    {/* Tag badge lists */}
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1.5">
                        {c.tags.length === 0 ? (
                          <span className="text-[10px] text-slate-350">-</span>
                        ) : (
                          c.tags.map(tag => (
                            <span 
                              key={tag}
                              className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 text-[9px] font-bold tracking-wide uppercase"
                            >
                              {tag}
                            </span>
                          ))
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-slate-500">
                      {new Date(c.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>

                    {/* Edit/Delete row controls */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          title="Edit Contact details"
                          className="p-1 text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.name)}
                          title="Delete Contact permanently"
                          className="p-1 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Contact Dialogue */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="add_contact_modal">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-slate-850 dark:text-white uppercase tracking-wider">Register New Contact</h3>
              <button 
                onClick={() => setAddModalOpen(false)} 
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Sylvia Osei"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="e.g. +233544321098"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="e.g. sylvia@smshub.com"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Grouping Tags (comma separated)</label>
                <input
                  type="text"
                  value={formTagsString}
                  onChange={(e) => setFormTagsString(e.target.value)}
                  placeholder="e.g. Students, Customer, VIP"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs shadow-md transition-colors"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Contact Dialogue */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="edit_contact_modal">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-slate-850 dark:text-white uppercase tracking-wider">Modify Contact Details</h3>
              <button 
                onClick={() => {
                  setEditModalOpen(false);
                  setCurrentContact(null);
                }} 
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Sylvia Osei"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="e.g. +233544321098"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="e.g. sylvia@smshub.com"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Grouping Tags (comma separated)</label>
                <input
                  type="text"
                  value={formTagsString}
                  onChange={(e) => setFormTagsString(e.target.value)}
                  placeholder="e.g. Students, Customer, VIP"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditModalOpen(false);
                    setCurrentContact(null);
                  }}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs shadow-md transition-colors"
                >
                  Apply Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
