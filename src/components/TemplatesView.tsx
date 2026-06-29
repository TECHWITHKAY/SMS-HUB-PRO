import React, { useState } from "react";
import { store } from "../store";
import { SMSTemplate } from "../types";
import { 
  FileText, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Tag, 
  Check, 
  Copy, 
  X 
} from "lucide-react";

interface TemplatesViewProps {
  onShowQuickAlert: (msg: string, type: "success" | "error" | "info") => void;
  onUseTemplate?: (text: string) => void;
}

export default function TemplatesView({ onShowQuickAlert, onUseTemplate }: TemplatesViewProps) {
  const [templates, setTemplates] = useState<SMSTemplate[]>(store.templates);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SMSTemplate | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<"Welcome" | "Birthday" | "Reminder" | "Marketing" | "General">("General");

  const refreshList = () => {
    setTemplates([...store.templates]);
  };

  const handleOpenAdd = () => {
    setSelectedTemplate(null);
    setTitle("");
    setContent("");
    setCategory("General");
    setDialogOpen(true);
  };

  const handleOpenEdit = (t: SMSTemplate) => {
    setSelectedTemplate(t);
    setTitle(t.title);
    setContent(t.content);
    setCategory(t.category);
    setDialogOpen(true);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      onShowQuickAlert("Template title and message content are required.", "error");
      return;
    }

    if (selectedTemplate) {
      store.editTemplate(selectedTemplate.id, { title, content, category });
      onShowQuickAlert(`Template "${title}" successfully updated!`, "success");
    } else {
      store.addTemplate({ title, content, category });
      onShowQuickAlert(`New Template "${title}" saved successfully!`, "success");
    }

    setDialogOpen(false);
    refreshList();
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete template "${name}"?`)) {
      store.deleteTemplate(id);
      onShowQuickAlert("Template deleted successfully.", "success");
      refreshList();
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    onShowQuickAlert("Message template copied to clipboard!", "success");
  };

  const categories = ["ALL", "Welcome", "Birthday", "Reminder", "Marketing", "General"];

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = 
      categoryFilter === "ALL" || 
      t.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div id="templates_manager_view" className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5" id="templates_title_section">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Templates Library</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Pre-compose Welcome letters, Birthday reminders, and OTP structures for instant campaigns</p>
        </div>

        <button
          onClick={handleOpenAdd}
          id="templates_add_btn"
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Template</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row items-center gap-4 justify-between" id="templates_filter_toolbar">
        
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates title/content..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500"
          />
        </div>

        {/* Category Pills Filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto py-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Groups:</span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-wide uppercase transition-colors shrink-0 ${
                categoryFilter === cat
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 dark:bg-slate-850 text-slate-650 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Grid of Templates cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="templates_grid_listing">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-400 text-xs">
            No templates registered under selected filters.
          </div>
        ) : (
          filteredTemplates.map(t => (
            <div 
              key={t.id} 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div>
                {/* Header title */}
                <div className="flex items-start justify-between border-b border-slate-50 dark:border-slate-850 pb-2.5">
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">{t.title}</h3>
                    <span className="text-[10px] text-slate-400 block font-mono mt-0.5">ID: {t.id}</span>
                  </div>
                  
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-wider font-mono">
                    {t.category}
                  </span>
                </div>

                {/* Content text */}
                <div className="pt-3">
                  <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-sans select-all">
                    {t.content}
                  </p>
                </div>
              </div>

              {/* Actions row */}
              <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-850 pt-3 mt-4">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(t)}
                    title="Edit Template details"
                    className="p-1 text-slate-400 hover:text-emerald-500 hover:bg-slate-50 dark:hover:bg-slate-850 rounded"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(t.id, t.title)}
                    title="Delete Template permanently"
                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-slate-50 dark:hover:bg-slate-850 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyText(t.content)}
                    className="p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:text-emerald-600 transition-colors flex items-center gap-1 text-[10px] font-bold"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>

                  {onUseTemplate && (
                    <button
                      onClick={() => onUseTemplate(t.content)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10.5px] font-bold transition-colors"
                    >
                      Use Template
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Save Template Modal Overlay */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="add_template_modal">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-slate-850 dark:text-white uppercase tracking-wider">
                {selectedTemplate ? `Configure Template: ${selectedTemplate.title}` : "Create Message Template"}
              </h3>
              <button 
                onClick={() => setDialogOpen(false)} 
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Template Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Easter Holiday greeting Alert"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Template Group Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500"
                >
                  <option value="Welcome">Welcome Onboarding</option>
                  <option value="Birthday">Birthday Greeting</option>
                  <option value="Reminder">Event Reminder</option>
                  <option value="Marketing">Marketing Campaign</option>
                  <option value="General">General / Audited Notification</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Compose Template Content *</label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type pre-composed body... Use '{Name}' as interpolation merge tags."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500 resize-none font-sans"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs shadow-md transition-colors"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
