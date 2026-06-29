import React, { useState, useEffect } from "react";
import { store } from "../store";
import { 
  Send, 
  FileText, 
  Users, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Upload, 
  Eye, 
  Calendar, 
  FileDown,
  Hash,
  Copy,
  Info,
  X
} from "lucide-react";

interface SMSModuleViewProps {
  onShowQuickAlert: (msg: string, type: "success" | "error" | "info") => void;
  activeSubTab?: "single" | "bulk" | "group";
}

export default function SMSModuleView({ onShowQuickAlert, activeSubTab = "single" }: SMSModuleViewProps) {
  const [mode, setMode] = useState<"single" | "bulk" | "group">(activeSubTab);
  
  // Shared inputs
  const [senderId, setSenderId] = useState("");
  const [messageText, setMessageText] = useState("");
  const [drafts, setDrafts] = useState<{ id: string; title: string; text: string; sender: string }[]>([
    { id: "dr_1", title: "Sunday Meeting", text: "Dear {Name}, remember our fellowship tomorrow at 8 AM. God bless you.", sender: "CHURCH_MSG" },
    { id: "dr_2", title: "Flash Weekend Sale", text: "Hello {Name}! Get ready for our weekend flash sale with up to 50% off.", sender: "SMSHUBPRO" }
  ]);

  // Single SMS Inputs
  const [singlePhone, setSinglePhone] = useState("");

  // Bulk SMS Inputs
  const [bulkManualInput, setBulkManualInput] = useState("");
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkUploadedNumbers, setBulkUploadedNumbers] = useState<string[]>([]);
  const [bulkUploadedNames, setBulkUploadedNames] = useState<Record<string, string>>({});
  const [deduplicate, setDeduplicate] = useState(true);

  // Group SMS Inputs
  const [selectedGroupId, setSelectedGroupId] = useState("");

  // Scheduling Inputs
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleFrequency, setScheduleFrequency] = useState<"once" | "daily" | "weekly" | "monthly" | "birthday">("once");

  // Dialog & Review
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sendingLoader, setSendingLoader] = useState(false);

  // Character and segments counter helper
  const getSmsSegments = (len: number) => {
    if (len === 0) return { count: 0, parts: 0 };
    if (len <= 160) return { count: len, parts: 1 };
    return { count: len, parts: Math.ceil(len / 153) };
  };

  const { count: charCount, parts: smsPartsCount } = getSmsSegments(messageText.length);

  useEffect(() => {
    // Fill active default sender on mount
    setSenderId(store.getDefaultSenderID());
    
    // Fill first group if available
    if (store.groups.length > 0) {
      setSelectedGroupId(store.groups[0].id);
    }
  }, []);

  // Parse manual bulk text area input (newline, comma, space)
  const getBulkManualNumbers = () => {
    if (!bulkManualInput) return [];
    return bulkManualInput
      .split(/[\n,;\s]+/)
      .map(num => num.trim())
      .filter(num => num.length >= 8);
  };

  // Compile final clean list of recipients based on current mode
  const getFinalRecipients = () => {
    let rawList: string[] = [];
    if (mode === "single") {
      if (singlePhone.trim()) rawList.push(singlePhone.trim());
    } else if (mode === "bulk") {
      rawList = [...getBulkManualNumbers(), ...bulkUploadedNumbers];
    } else if (mode === "group") {
      const activeGroup = store.groups.find(g => g.id === selectedGroupId);
      if (activeGroup) {
        activeGroup.contactIds.forEach(cid => {
          const c = store.contacts.find(con => con.id === cid);
          if (c) rawList.push(c.phoneNumber);
        });
      }
    }

    // Filter duplicate if checked
    if (deduplicate && mode === "bulk") {
      return Array.from(new Set(rawList));
    }
    return rawList;
  };

  const finalRecipients = getFinalRecipients();
  const ratePerSmsPart = store.getActiveProvider()?.name === "Arkesel" ? 0.015 : 0.02;
  const estimatedCost = finalRecipients.length * smsPartsCount * ratePerSmsPart;

  // Personalization Template Parser (Dear {Name})
  // Replaces the placeholder for previewing with the first valid recipient name
  const parsePersonalizedMessage = (recipientPhone: string) => {
    let name = "Seth Sefa"; // Fallback preview name
    
    // Find name in contact book
    const contactMatch = store.contacts.find(c => c.phoneNumber === recipientPhone);
    if (contactMatch) {
      name = contactMatch.name;
    } else if (bulkUploadedNames[recipientPhone]) {
      name = bulkUploadedNames[recipientPhone];
    }

    return messageText.replace(/{Name}/g, name);
  };

  // Simulate Excel/CSV file upload parsing
  const handleCSVUploadSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkFile(file);
    onShowQuickAlert(`Simulated upload for ${file.name} successful. Parsing records...`, "info");

    // Prepopulate with mock dataset based on CSV selection
    setTimeout(() => {
      const mockNumbers = ["+233244111222", "+233501234567", "+233209876543", "+14155550192"];
      const mockNames: Record<string, string> = {
        "+233244111222": "Adwoa Mansa",
        "+233501234567": "Emmanuel Boateng",
        "+233209876543": "Priscilla Appiah",
        "+14155550192": "James Sterling"
      };

      setBulkUploadedNumbers(mockNumbers);
      setBulkUploadedNames(mockNames);
      onShowQuickAlert(`Successfully loaded ${mockNumbers.length} contacts from ${file.name}! Duplicate filtering active.`, "success");
    }, 1000);
  };

  // Clear uploaded bulk file
  const handleClearBulkFile = () => {
    setBulkFile(null);
    setBulkUploadedNumbers([]);
    setBulkUploadedNames({});
  };

  // Handle Save Draft Action
  const handleSaveDraft = () => {
    if (!messageText.trim()) {
      onShowQuickAlert("Please write some message text before saving to drafts.", "error");
      return;
    }

    const title = prompt("Enter a brief title for this draft:", `Draft ${drafts.length + 1}`) || "Untitled Draft";
    const newDraft = {
      id: "dr_" + Date.now(),
      title,
      text: messageText,
      sender: senderId
    };

    setDrafts([newDraft, ...drafts]);
    onShowQuickAlert(`Draft "${title}" successfully stored! You can reload it from the sidebar drafts anytime.`, "success");
  };

  // Load a Draft
  const handleLoadDraft = (dText: string, dSender: string) => {
    setMessageText(dText);
    setSenderId(dSender);
    onShowQuickAlert("Draft content loaded successfully into editor.", "info");
  };

  // Trigger Send SMS Campaign
  const handleDispatchSMS = () => {
    if (finalRecipients.length === 0) {
      onShowQuickAlert("Please enter or upload at least one valid recipient phone number.", "error");
      return;
    }
    if (!messageText.trim()) {
      onShowQuickAlert("Message content cannot be blank.", "error");
      return;
    }

    if (isScheduling && !scheduleTime) {
      onShowQuickAlert("Please select a date & time for scheduling this SMS dispatch.", "error");
      return;
    }

    setSendingLoader(true);
    setPreviewOpen(false);

    setTimeout(() => {
      if (isScheduling) {
        // Schedule SMS
        store.addScheduled({
          recipientType: mode,
          recipient: mode === "single" ? singlePhone : mode === "group" ? (store.groups.find(g => g.id === selectedGroupId)?.name || "Group") : "Bulk Campaign List",
          message: messageText,
          scheduleTime,
          frequency: scheduleFrequency
        });
        onShowQuickAlert(`Campaign successfully scheduled for dispatch on ${new Date(scheduleTime).toLocaleString()}!`, "success");
        setMessageText("");
        setSinglePhone("");
        setBulkManualInput("");
        setSendingLoader(false);
        setIsScheduling(false);
      } else {
        // Live Dispatch Now
        const res = store.triggerSendSMS(
          senderId || "SMSHUBPRO",
          finalRecipients,
          messageText,
          mode === "single" ? "Single Dispatch" : mode === "group" ? `Group: ${store.groups.find(g => g.id === selectedGroupId)?.name}` : "Bulk Blast Campaign"
        );
        setSendingLoader(false);

        if (res.successCount > 0) {
          onShowQuickAlert(`Successfully dispatched ${res.successCount} SMS! Failed/Blocked: ${res.failedCount}.`, "success");
          setMessageText("");
          setSinglePhone("");
          setBulkManualInput("");
          setBulkUploadedNumbers([]);
          setBulkFile(null);
        } else {
          onShowQuickAlert(`Failed to send. Errors: ${res.errors[0] || "Unknown Gateway block."}`, "error");
        }
      }
    }, 1200);
  };

  return (
    <div id="sms_terminal_view" className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      {/* Messaging Form Panel */}
      <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
        
        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 dark:border-slate-850 pb-1 gap-1" id="sms_tab_selector">
          {[
            { id: "single", label: "Single SMS", desc: "Send quick individual message" },
            { id: "bulk", label: "Bulk Campaigns", desc: "Upload CSV list or paste contacts" },
            { id: "group", label: "Group Broadcaster", desc: "Broadcast alerts to pre-defined tags" }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setMode(t.id as any);
                setIsScheduling(false);
              }}
              className={`flex-1 text-left px-4 py-3 rounded-xl transition-all ${
                mode === t.id
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-semibold"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900"
              }`}
            >
              <h3 className="text-xs uppercase tracking-wider">{t.label}</h3>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">{t.desc}</p>
            </button>
          ))}
        </div>

        {/* SMS Form Fields */}
        <div className="space-y-4" id="sms_fields_section">
          
          {/* Sender ID & Provider Selector Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Sender ID</label>
              <select
                value={senderId}
                onChange={(e) => setSenderId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500"
              >
                {store.senderIDs.filter(s => s.status === "Active").map(s => (
                  <option key={s.id} value={s.name}>{s.name} (Registered)</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] text-slate-500 flex items-center justify-between">
                <span>Active Routing Gateway:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {store.getActiveProvider()?.name || "None Configured"}
                </span>
              </div>
            </div>
          </div>

          {/* Mode-Specific Recipients Input */}
          <div className="space-y-3">
            
            {/* Mode 1: Single SMS */}
            {mode === "single" && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Recipient Phone Number</label>
                <input
                  type="tel"
                  required
                  value={singlePhone}
                  onChange={(e) => setSinglePhone(e.target.value)}
                  placeholder="e.g. +233544321098"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-250 outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Include international dialing country codes without symbols.</span>
              </div>
            )}

            {/* Mode 2: Bulk Campaign SMS */}
            {mode === "bulk" && (
              <div className="space-y-4">
                
                {/* Manual entry area and CSV Drag & Drop Upload block */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Manual Pasting */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Manual Paste Contacts List</label>
                    <textarea
                      rows={5}
                      value={bulkManualInput}
                      onChange={(e) => setBulkManualInput(e.target.value)}
                      placeholder="Paste phone numbers separated by commas, spaces, or newlines..."
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-250 outline-none focus:border-emerald-500 resize-none font-mono"
                    />
                  </div>

                  {/* CSV Drag-and-Drop file uploader */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Bulk Upload CSV / Excel List</label>
                    
                    {!bulkFile ? (
                      <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500/50 rounded-lg p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors relative">
                        <input
                          type="file"
                          accept=".csv,.xlsx"
                          onChange={handleCSVUploadSimulate}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Upload className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">Drag & Drop files or click to upload</h4>
                        <p className="text-[10px] text-slate-400 mt-1">Supports standard Comma Separated Values (.csv) or Excel (.xlsx)</p>
                      </div>
                    ) : (
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                          <div className="text-left">
                            <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 truncate max-w-[180px]">{bulkFile.name}</h4>
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-500">{bulkUploadedNumbers.length} recipients imported</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleClearBulkFile}
                          className="p-1 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2.5">
                      <span className="text-[10px] text-slate-400 font-medium">Download sample template:</span>
                      <a 
                        href="#download" 
                        onClick={(e) => {
                          e.preventDefault();
                          onShowQuickAlert("Sample SMS Bulk Campaign template downloaded successfully.", "success");
                        }} 
                        className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                      >
                        <FileDown className="w-3.5 h-3.5" /> Sample_Contacts.csv
                      </a>
                    </div>
                  </div>

                </div>

                {/* Duplicate Removal option */}
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={deduplicate}
                      onChange={(e) => setDeduplicate(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-200 bg-slate-50 text-emerald-600"
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-400">Perform contact deduplication automatically</span>
                  </label>
                </div>

              </div>
            )}

            {/* Mode 3: Group SMS Broadcasting */}
            {mode === "group" && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Select Target Audience Group</label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500"
                >
                  {store.groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name} ({g.contactIds.length} members) - {g.description}</option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">Your broadcast will be replicated dynamically and sent to all numbers tagged in this group.</span>
              </div>
            )}

          </div>

          {/* SMS Compose Message Editor Box */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase">Compose Message Content</label>
              
              {/* Characters segment counter */}
              <span className="text-[11px] font-mono text-slate-500">
                <strong className={charCount > 160 ? "text-amber-500" : "text-emerald-500"}>{charCount}</strong> characters | <strong className="text-slate-800 dark:text-slate-200">{smsPartsCount}</strong> SMS credit{smsPartsCount > 1 ? "s" : ""}
              </span>
            </div>

            <textarea
              required
              rows={6}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Compose your SMS text here. Tip: Use '{Name}' to personalize message templates (e.g. 'Dear {Name}, welcome back!')."
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-250 outline-none focus:border-emerald-500 font-sans"
            />

            {/* Smart variable buttons */}
            <div className="flex gap-2.5 mt-2">
              <button
                type="button"
                onClick={() => setMessageText(prev => prev + " {Name}")}
                className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10.5px] font-semibold text-slate-600 dark:text-slate-400 rounded transition-colors"
              >
                + Insert Personalization {`{Name}`}
              </button>
              <button
                type="button"
                onClick={() => setMessageText(prev => prev + " {OTP}")}
                className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10.5px] font-semibold text-slate-600 dark:text-slate-400 rounded transition-colors"
              >
                + Insert verification {`{OTP}`}
              </button>
            </div>
          </div>

          {/* Scheduling Controller Expansion */}
          <div className="border-t border-slate-100 dark:border-slate-850 pt-4 mt-2">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isScheduling}
                  onChange={(e) => setIsScheduling(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-200 bg-slate-50 text-emerald-600"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Schedule message for future dispatch</span>
              </label>
              <span className="text-[10px] text-slate-400 bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-500/10 font-bold uppercase tracking-wider">Premium Engine</span>
            </div>

            {isScheduling && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 animate-slide-down">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Select Dispatch Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Recurrence Pattern</label>
                  <select
                    value={scheduleFrequency}
                    onChange={(e) => setScheduleFrequency(e.target.value as any)}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200 outline-none"
                  >
                    <option value="once">Once (One-shot Alert)</option>
                    <option value="daily">Daily broadcast</option>
                    <option value="weekly">Weekly broadcast</option>
                    <option value="monthly">Monthly broadcast</option>
                    <option value="birthday">Birthday Campaign Trigger</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Send and Preview Trigger Row */}
          <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg text-xs transition-colors"
            >
              Save Draft
            </button>

            <button
              type="button"
              onClick={() => {
                if (finalRecipients.length === 0) {
                  onShowQuickAlert("Please specify at least one recipient first.", "error");
                  return;
                }
                setPreviewOpen(true);
              }}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5 ml-auto"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Personalization</span>
            </button>

            <button
              type="button"
              disabled={sendingLoader}
              onClick={handleDispatchSMS}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-2 shadow-sm shadow-emerald-950/10"
            >
              {sendingLoader ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/35 border-t-white rounded-full animate-spin" />
                  <span>Spooling Queue...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 rotate-45" />
                  <span>{isScheduling ? "Schedule Broadcast" : "Dispatch Now"}</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Sidebar Quick Drafts and Estimator Helper */}
      <div className="space-y-6">
        
        {/* Cost Estimator Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-3">Live Dispatch Estimator</h3>
          
          <div className="space-y-3 text-xs">
            <div className="flex justify-between pb-1.5 border-b border-slate-50 dark:border-slate-850">
              <span className="text-slate-400">Recipient Count:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{finalRecipients.length.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pb-1.5 border-b border-slate-50 dark:border-slate-850">
              <span className="text-slate-400">SMS Segments/user:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{smsPartsCount} segment{smsPartsCount > 1 ? "s" : ""}</span>
            </div>
            <div className="flex justify-between pb-1.5 border-b border-slate-50 dark:border-slate-850">
              <span className="text-slate-400">Total SMS Parts:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{(finalRecipients.length * smsPartsCount).toLocaleString()} units</span>
            </div>
            <div className="flex justify-between pb-1.5 border-b border-slate-50 dark:border-slate-850">
              <span className="text-slate-400">Active Failover Gateway:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">{store.getActiveProvider()?.name || "None"}</span>
            </div>

            <div className="pt-3.5 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">ESTIMATED BALANCE COST</span>
              <h2 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 leading-none">
                {estimatedCost.toLocaleString()}
                <span className="text-[11px] font-semibold text-slate-400 ml-1">Credits</span>
              </h2>
              {store.balance < estimatedCost && (
                <div className="mt-2.5 p-2 bg-red-50 dark:bg-red-950/20 border border-red-500/10 rounded text-[10px] text-red-500 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Warning: Exceeds available balance!</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Local Drafts Card List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-3">Quick Templates & Drafts</h3>
          
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1" id="drafts_card_list">
            {drafts.map((d) => (
              <div 
                key={d.id} 
                onClick={() => handleLoadDraft(d.text, d.sender)}
                className="p-3 bg-slate-50 dark:bg-slate-950 hover:bg-emerald-500/5 hover:border-emerald-500/20 border border-slate-100 dark:border-slate-800 rounded-lg cursor-pointer transition-all text-left"
              >
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">{d.title}</h4>
                  <span className="text-[8px] font-bold font-mono bg-slate-200 dark:bg-slate-850 text-slate-500 px-1 py-0.2 rounded uppercase">{d.sender}</span>
                </div>
                <p className="text-[10px] text-slate-500 truncate">{d.text}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Dynamic Dear Name Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="preview_personalization_modal">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-850 dark:text-white">Variable Interpolation Preview</h3>
              </div>
              <button 
                onClick={() => setPreviewOpen(false)} 
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              This simulates the parsed visual text received on a recipient's mobile phone handset, replacing the variable tags with contact properties.
            </p>

            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-3 font-sans">
              <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-200 dark:border-slate-800/80 pb-2">
                <span>Sender: <strong className="text-slate-700 dark:text-slate-300">{senderId || "SMSHUBPRO"}</strong></span>
                <span>Type: <strong className="text-slate-700 dark:text-slate-300">Handset Screen</strong></span>
              </div>
              <div className="bg-emerald-500 text-white rounded-2xl rounded-tr-none px-4 py-3 text-xs shadow max-w-[85%] ml-auto text-left relative">
                <p className="whitespace-pre-line leading-relaxed">
                  {parsePersonalizedMessage(finalRecipients[0] || "+233544321098")}
                </p>
                <span className="text-[8px] opacity-75 absolute bottom-1 left-3 font-mono">11:15 AM</span>
              </div>
            </div>

            <div className="mt-5 flex gap-2.5">
              <button
                onClick={() => setPreviewOpen(false)}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs transition-colors"
              >
                Return to Editor
              </button>
              <button
                onClick={handleDispatchSMS}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs shadow-md transition-colors"
              >
                Approve & Send
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
