import React, { useState } from "react";
import { store } from "../store";
import { ScheduledSMS } from "../types";
import { 
  Calendar, 
  Clock, 
  Trash2, 
  X, 
  AlertTriangle, 
  RefreshCw, 
  User, 
  Users, 
  Smile, 
  BellRing,
  CheckCircle,
  Megaphone
} from "lucide-react";

interface ScheduledViewProps {
  onShowQuickAlert: (msg: string, type: "success" | "error" | "info") => void;
}

export default function ScheduledView({ onShowQuickAlert }: ScheduledViewProps) {
  const [scheduled, setScheduled] = useState<ScheduledSMS[]>(store.scheduled);

  const refreshList = () => {
    setScheduled([...store.scheduled]);
  };

  const handleCancel = (id: string, name: string) => {
    if (confirm(`Are you sure you want to cancel the scheduled transmission to "${name}"?`)) {
      store.cancelScheduled(id);
      onShowQuickAlert(`Scheduled SMS to "${name}" has been successfully cancelled.`, "info");
      refreshList();
    }
  };

  const getRecipientIcon = (type: string) => {
    switch (type) {
      case "single": return <User className="w-4 h-4 text-emerald-500" />;
      case "group": return <Users className="w-4 h-4 text-blue-500" />;
      default: return <Megaphone className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div id="scheduled_messages_view" className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5" id="scheduled_title_section">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Scheduled SMS</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review future triggers, birthday automations, and recurring marketing reminders</p>
        </div>

        <button
          onClick={refreshList}
          className="flex items-center gap-1 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 text-slate-700 dark:text-slate-350 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Advisory block */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 flex items-start gap-3" id="scheduled_advisory">
        <Clock className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">Background Dispatch Queue</h4>
          <p className="leading-relaxed">Scheduled messages are processed automatically by the SMS Hub scheduler daemon. If your **SMS balance** drops below 1 unit at the time of dispatch, the message status will automatically shift to **Failed**. You can cancel any pending schedule up to 1 minute before dispatch.</p>
        </div>
      </div>

      {/* Scheduled queue grid listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="scheduled_queue_grid">
        {scheduled.length === 0 ? (
          <div className="md:col-span-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-400 text-xs">
            No pending schedules mapped in current dispatcher queue. Use the "Single SMS" or "Bulk SMS" compose panels to schedule a message.
          </div>
        ) : (
          scheduled.map(s => (
            <div 
              key={s.id} 
              className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm space-y-4 relative ${
                s.status === "Cancelled" 
                  ? "border-slate-100 dark:border-slate-950 opacity-65" 
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              
              {/* Card Header Badge details */}
              <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-850 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    {getRecipientIcon(s.recipientType)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                      Recipient: <span className="font-mono">{s.recipient}</span>
                    </h4>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Type: {s.recipientType} segment
                    </span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                  s.status === "Scheduled"
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400"
                    : s.status === "Sent"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
                    : "bg-slate-150 text-slate-500 dark:bg-slate-800"
                }`}>
                  {s.status}
                </span>
              </div>

              {/* Message text content */}
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-sans line-clamp-3">
                  {s.message}
                </p>
              </div>

              {/* Delivery timings metrics */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-450 shrink-0" />
                  <span>Dispatch: <strong className="text-slate-700 dark:text-slate-300">{new Date(s.scheduleTime).toLocaleString()}</strong></span>
                </div>

                {s.frequency !== "once" && (
                  <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 rounded text-[9px] font-bold uppercase">
                    {s.frequency}
                  </span>
                )}
              </div>

              {/* Cancel actions buttons row */}
              {s.status === "Scheduled" && (
                <div className="flex items-center justify-end border-t border-slate-50 dark:border-slate-850 pt-3 mt-1">
                  <button
                    onClick={() => handleCancel(s.id, s.recipient)}
                    className="flex items-center gap-1 px-3 py-1 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/60 text-red-600 dark:text-red-400 text-[10.5px] font-bold rounded-lg transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel Dispatch</span>
                  </button>
                </div>
              )}

            </div>
          ))
        )}
      </div>

    </div>
  );
}
