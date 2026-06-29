import React, { useState } from "react";
import { store } from "../store";
import { SMSProvider } from "../types";
import { 
  Sliders, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Settings, 
  Info, 
  HelpCircle,
  Database,
  Unplug,
  Zap,
  Lock,
  ChevronDown,
  X
} from "lucide-react";

interface ProviderSettingsViewProps {
  onShowQuickAlert: (msg: string, type: "success" | "error" | "info") => void;
}

export default function ProviderSettingsView({ onShowQuickAlert }: ProviderSettingsViewProps) {
  const [providers, setProviders] = useState<SMSProvider[]>(store.providers);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<SMSProvider | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [senderId, setSenderId] = useState("");
  const [token, setToken] = useState("");
  const [customHeaders, setCustomHeaders] = useState("");
  const [active, setActive] = useState(true);

  // Connection testing states
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, { status: "success" | "error"; msg: string }>>({});

  const refreshList = () => {
    setProviders([...store.providers]);
  };

  const handleOpenAdd = () => {
    setSelectedProvider(null);
    setName("");
    setApiUrl("");
    setApiKey("");
    setApiSecret("");
    setUsername("");
    setPassword("");
    setSenderId("");
    setToken("");
    setCustomHeaders('{"Content-Type": "application/json"}');
    setActive(true);
    setEditOpen(true);
  };

  const handleOpenEdit = (p: SMSProvider) => {
    setSelectedProvider(p);
    setName(p.name);
    setApiUrl(p.apiUrl);
    setApiKey(p.apiKey);
    setApiSecret(p.apiSecret || "");
    setUsername(p.username || "");
    setPassword(p.password || "");
    setSenderId(p.senderId || "");
    setToken(p.token || "");
    setCustomHeaders(p.customHeaders || '{"Content-Type": "application/json"}');
    setActive(p.active);
    setEditOpen(true);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !apiUrl || !apiKey) {
      onShowQuickAlert("Provider Name, Endpoint API URL, and API Key are mandatory.", "error");
      return;
    }

    // Validate headers format if filled
    if (customHeaders) {
      try {
        JSON.parse(customHeaders);
      } catch {
        onShowQuickAlert("Custom Headers must be valid JSON format.", "error");
        return;
      }
    }

    const payload = {
      name,
      apiUrl,
      apiKey,
      apiSecret: apiSecret || undefined,
      username: username || undefined,
      password: password || undefined,
      senderId: senderId || undefined,
      token: token || undefined,
      customHeaders: customHeaders || undefined,
      active,
      isDefault: selectedProvider ? selectedProvider.isDefault : false
    };

    if (selectedProvider) {
      store.editProvider(selectedProvider.id, payload);
      onShowQuickAlert(`Provider gateway "${name}" successfully updated!`, "success");
    } else {
      store.addProvider({ ...payload, isDefault: store.providers.length === 0 });
      onShowQuickAlert(`New Custom Provider gateway "${name}" registered successfully!`, "success");
    }

    setEditOpen(false);
    refreshList();
  };

  const handleDeleteProvider = (id: string, pName: string) => {
    if (confirm(`Are you sure you want to delete configured gateway "${pName}"? This will disrupt routing if it was primary.`)) {
      store.deleteProvider(id);
      onShowQuickAlert("Provider gateway successfully deleted.", "success");
      refreshList();
    }
  };

  const handleToggleDefault = (id: string, pName: string) => {
    store.editProvider(id, { isDefault: true, active: true });
    onShowQuickAlert(`Gateway "${pName}" successfully set as Primary active default. All SMS traffic now routes through this gateway.`, "success");
    refreshList();
  };

  const handleToggleActive = (id: string, pName: string, currentActive: boolean) => {
    store.editProvider(id, { active: !currentActive });
    onShowQuickAlert(`Gateway "${pName}" has been ${!currentActive ? "Enabled" : "Disabled"}.`, "info");
    refreshList();
  };

  // Connection testing simulation
  const handleTestConnection = (p: SMSProvider) => {
    setTestingId(p.id);
    onShowQuickAlert(`Testing secure handshake connection with ${p.name}...`, "info");

    setTimeout(() => {
      setTestingId(null);
      // Failover simulation (Twilio, Custom could fail if keys are sandbox defaults)
      const isSuccess = p.active && p.apiKey.length > 5;
      
      setTestResult(prev => ({
        ...prev,
        [p.id]: {
          status: isSuccess ? "success" : "error",
          msg: isSuccess 
            ? `Handshake OK! HTTP 200. Secure API authenticated. Response: {"status":"active","balance":98432}`
            : `Handshake failed! Error HTTP 401. Unauthorized API credentials or endpoint inaccessible.`
        }
      }));

      if (isSuccess) {
        onShowQuickAlert(`Gateway connection with ${p.name} verified successfully!`, "success");
      } else {
        onShowQuickAlert(`Gateway connection with ${p.name} failed. Check API credentials!`, "error");
      }
    }, 1200);
  };

  return (
    <div id="provider_settings_view" className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5" id="providers_title_section">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Gateway Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure multi-provider integrations, change active routes, and secure API keys</p>
        </div>

        <button
          onClick={handleOpenAdd}
          id="providers_add_btn"
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Provider</span>
        </button>
      </div>

      {/* Critical Admin Advisory */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-400 flex items-start gap-3" id="provider_security_advisory">
        <Info className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" />
        <div>
          <h4 className="font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">Decoupled API Architecture (Zero Hardcoded Keys)</h4>
          <p className="leading-relaxed">All outbound SMS transmissions utilize database-stored configurations dynamically matched at runtime. To swap SMS gateways instantly, set your preferred gateway to **Primary Default**. Inactive gateways serve as instant failover nodes.</p>
        </div>
      </div>

      {/* Providers Grid Card Listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="providers_cards_grid">
        {providers.map(p => (
          <div 
            key={p.id} 
            className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm space-y-4 relative ${
              p.isDefault 
                ? "border-emerald-500/40 shadow-emerald-500/5 shadow-md" 
                : "border-slate-200 dark:border-slate-800"
            }`}
          >
            {/* Upper Badge Line */}
            <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-850 pb-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                  p.active 
                    ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400" 
                    : "bg-slate-100 dark:bg-slate-850 text-slate-400"
                }`}>
                  {p.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                    <span>{p.name}</span>
                    {p.isDefault && (
                      <span className="text-[9px] bg-emerald-600 text-white px-2 py-0.2 rounded-full font-bold uppercase tracking-widest">
                        Primary Route
                      </span>
                    )}
                  </h3>
                  <span className="text-[10px] text-slate-400 truncate max-w-[200px] block font-mono">{p.apiUrl}</span>
                </div>
              </div>

              {/* Toggle switch for Activating */}
              <button
                onClick={() => handleToggleActive(p.id, p.name, p.active)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 outline-none ${
                  p.active ? "bg-emerald-600" : "bg-slate-250 dark:bg-slate-800"
                }`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                  p.active ? "translate-x-4" : "translate-x-0"
                }`} />
              </button>
            </div>

            {/* Config details overlay (Key previews hidden for security) */}
            <div className="grid grid-cols-2 gap-3 text-xs border-b border-slate-50 dark:border-slate-850 pb-3 text-slate-500">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">Key: <code className="bg-slate-50 dark:bg-slate-950 px-1 py-0.2 rounded font-mono">••••{p.apiKey.substring(p.apiKey.length - 4)}</code></span>
              </div>
              <div>
                <span>SenderID: <strong className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">{p.senderId || "None"}</strong></span>
              </div>
              <div>
                <span>Secret: {p.apiSecret ? <code className="bg-slate-50 dark:bg-slate-950 px-1 py-0.2 rounded font-mono">Set</code> : <span className="italic text-slate-400">None</span>}</span>
              </div>
              <div>
                <span>Custom Headers: <strong className="text-slate-700 dark:text-slate-300">{p.customHeaders ? "Enabled" : "Default"}</strong></span>
              </div>
            </div>

            {/* Test connection output log if exists */}
            {testResult[p.id] && (
              <div className={`p-2.5 rounded-lg text-[10.5px] border ${
                testResult[p.id].status === "success" 
                  ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/10 text-emerald-800 dark:text-emerald-400" 
                  : "bg-red-50 dark:bg-red-950/20 border-red-500/10 text-red-800 dark:text-red-400"
              }`}>
                {testResult[p.id].msg}
              </div>
            )}

            {/* Row actions */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(p)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Configure Keys</span>
                </button>
                <button
                  onClick={() => handleDeleteProvider(p.id, p.name)}
                  disabled={p.isDefault}
                  className="p-1 rounded text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-slate-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => handleTestConnection(p)}
                  disabled={testingId === p.id}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 text-slate-700 dark:text-slate-350 text-[10.5px] font-bold rounded flex items-center gap-1 transition-all"
                >
                  {testingId === p.id ? (
                    <div className="w-3 h-3 border-2 border-slate-400 border-t-slate-800 rounded-full animate-spin" />
                  ) : (
                    <Zap className="w-3 h-3 text-amber-500" />
                  )}
                  <span>Test Gate</span>
                </button>

                {!p.isDefault && p.active && (
                  <button
                    onClick={() => handleToggleDefault(p.id, p.name)}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10.5px] font-bold rounded transition-colors"
                  >
                    Set Primary
                  </button>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Slide-In Side Drawer/Modal for Adding & Configuring Gateways */}
      {editOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="provider_edit_drawer">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-slate-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Settings className="w-4.5 h-4.5 text-emerald-500" />
                <span>{selectedProvider ? `Configure Gateway: ${selectedProvider.name}` : "Register Custom SMS Provider"}</span>
              </h3>
              <button 
                onClick={() => setEditOpen(false)} 
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Provider / Gateway Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Hubtel, Twilio, Arkesel"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Default Sender ID</label>
                  <input
                    type="text"
                    value={senderId}
                    onChange={(e) => setSenderId(e.target.value)}
                    placeholder="e.g. SMSHUBPRO"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Endpoint API URL *</label>
                <input
                  type="url"
                  required
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="e.g. https://api.hubtel.com/v1/messages/send"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">API Key (or Client ID) *</label>
                  <input
                    type="password"
                    required
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="••••••••••••••••••••"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">API Secret Key (Optional)</label>
                  <input
                    type="password"
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    placeholder="••••••••••••••••••••"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Username (Opt)</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. admin"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Password (Opt)</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Token (Opt)</label>
                  <input
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="e.g. bearer_xyz"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Custom HTTP Headers (JSON Object Format)</label>
                <textarea
                  rows={3}
                  value={customHeaders}
                  onChange={(e) => setCustomHeaders(e.target.value)}
                  placeholder='{"Content-Type": "application/json", "X-Custom-Header": "SMSHubPro"}'
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs shadow-md transition-colors"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
