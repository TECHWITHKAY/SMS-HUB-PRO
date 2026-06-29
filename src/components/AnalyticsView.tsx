import React, { useState } from "react";
import { store } from "../store";
import { 
  BarChart3, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  HelpCircle,
  TrendingUp,
  Sliders,
  Calculator,
  ArrowUpRight
} from "lucide-react";

interface AnalyticsViewProps {
  onShowQuickAlert: (msg: string, type: "success" | "error" | "info") => void;
}

export default function AnalyticsView({ onShowQuickAlert }: AnalyticsViewProps) {
  // Cost Calculator State
  const [calcProvider, setCalcProvider] = useState("Hubtel");
  const [calcSMSCount, setCalcSMSCount] = useState(1000);
  const [calcCharLength, setCalcCharLength] = useState(140);
  const [calcCustomCountry, setCalcCustomCountry] = useState("Local (Ghana)");

  const stats = store.getStats();

  // Get dynamic costs
  const getRatePerSMS = (provName: string) => {
    switch (provName) {
      case "Hubtel": return 0.02; // in credits or GHS
      case "Arkesel": return 0.015;
      case "MNotify": return 0.025;
      case "Twilio": return 0.045;
      default: return 0.03;
    }
  };

  const getSmsPartsCount = (chars: number) => {
    if (chars <= 160) return 1;
    // Multi-part SMS has 153 chars limit per segment
    return Math.ceil(chars / 153);
  };

  const smsParts = getSmsPartsCount(calcCharLength);
  const ratePerSmsPart = getRatePerSMS(calcProvider);
  const totalCalculatedCost = calcSMSCount * smsParts * ratePerSmsPart;

  return (
    <div id="analytics_view" className="space-y-6">
      
      {/* Title Header */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-5" id="analytics_title_section">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Analytics</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Performance, latency, reliability, and cost analytics logs</p>
      </div>

      {/* Advanced Stats Metrics - Screenshot 2 Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="analytics_metrics_grid">
        
        {/* Metric 1: Delivery Rate */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">DELIVERY RATE</span>
          <div className="flex items-baseline gap-1.5">
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">{stats.deliveryRate.toFixed(1)}%</h2>
            <span className="text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center bg-emerald-50 dark:bg-emerald-950/30 px-1 py-0.5 rounded">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              +0.4pp
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-2">vs last week (average 96.7%)</span>
        </div>

        {/* Metric 2: Failure Rate */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">FAILURE RATE</span>
          <div className="flex items-baseline gap-1.5">
            <h2 className="text-3xl font-extrabold text-slate-850 dark:text-white">{stats.failureRate.toFixed(1)}%</h2>
            <span className="text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center bg-emerald-50 dark:bg-emerald-950/30 px-1 py-0.5 rounded">
              -0.4pp
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-2">vs last week (average 3.3%)</span>
        </div>

        {/* Metric 3: Avg. Latency */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">AVG. LATENCY</span>
          <div className="flex items-baseline gap-1.5">
            <h2 className="text-3xl font-extrabold text-slate-850 dark:text-white">1.8s</h2>
            <span className="text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center bg-emerald-50 dark:bg-emerald-950/30 px-1 py-0.5 rounded">
              -120ms
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-2">Time-to-handset delivery speed</span>
        </div>

        {/* Metric 4: Spend Month-to-Date */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">SPEND (MTD)</span>
          <div className="flex items-baseline gap-1.5">
            <h2 className="text-3xl font-extrabold text-slate-850 dark:text-white">$5,529</h2>
            <span className="text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center bg-emerald-50 dark:bg-emerald-950/30 px-1 py-0.5 rounded">
              +8.1%
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-2">Total campaign costs recorded</span>
        </div>

      </div>

      {/* Daily Volume and Provider Performance Grid - Screenshot 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="analytics_graphs_grid">
        
        {/* Daily Volume graph */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Daily volume</h3>
              <p className="text-xs text-slate-400 mt-0.5">Sent vs delivered volumes over the last 14 days</p>
            </div>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-850 font-bold px-2 py-1 rounded dark:text-slate-300">
              Live updates active
            </span>
          </div>

          <div className="h-56 w-full pt-1">
            {/* Custom vector area chart */}
            <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity="0.2" />
                  <stop offset="95%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              <grid y1="20" y2="120" />
              <path 
                d="M30,120 L80,50 L130,110 L180,60 L230,40 L280,100 L330,30 L380,80 L430,20 L490,90"
                fill="none" 
                stroke="#059669" 
                strokeWidth="3" 
                strokeLinecap="round" 
              />
              <path 
                d="M30,120 L80,50 L130,110 L180,60 L230,40 L280,100 L330,30 L380,80 L430,20 L490,90 L490,140 L30,140 Z"
                fill="url(#volGrad)" 
              />

              {/* Baseline markers */}
              <line x1="30" y1="140" x2="490" y2="140" stroke="#cbd5e1" className="dark:stroke-slate-800" />

              {/* Gridlines */}
              <line x1="30" y1="20" x2="490" y2="20" stroke="#f1f5f9" className="dark:stroke-slate-800/40" />
              <line x1="30" y1="60" x2="490" y2="60" stroke="#f1f5f9" className="dark:stroke-slate-800/40" />
              <line x1="30" y1="100" x2="490" y2="100" stroke="#f1f5f9" className="dark:stroke-slate-800/40" />

              <text x="5" y="24" className="text-[9px] fill-slate-400 font-mono">2,400</text>
              <text x="5" y="64" className="text-[9px] fill-slate-400 font-mono">1,600</text>
              <text x="5" y="104" className="text-[9px] fill-slate-400 font-mono">800</text>
              
              <text x="30" y="150" className="text-[8px] fill-slate-400 font-mono">Jun 12</text>
              <text x="180" y="150" className="text-[8px] fill-slate-400 font-mono">Jun 18</text>
              <text x="330" y="150" className="text-[8px] fill-slate-400 font-mono">Jun 22</text>
              <text x="490" y="150" className="text-[8px] fill-slate-400 font-mono">Jun 26</text>
            </svg>
          </div>
        </div>

        {/* Provider Performance horizontal bar graph - Replica from Screenshot 2 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Provider performance</h3>
            <p className="text-xs text-slate-400 mt-0.5">Delivery % success rate by active provider</p>
          </div>

          <div className="space-y-4 pt-1" id="provider_performance_bars">
            {[
              { name: "Hubtel", rate: 98.4, color: "bg-emerald-600", volume: "125,482 sent" },
              { name: "Arkesel", rate: 96.8, color: "bg-emerald-500", volume: "45,901 sent" },
              { name: "MNotify", rate: 95.1, color: "bg-emerald-400", volume: "12,937 sent" },
              { name: "Twilio", rate: 91.2, color: "bg-teal-600", volume: "1,142 sent" },
              { name: "Africa's Talking", rate: 89.5, color: "bg-slate-500", volume: "2,412 sent" }
            ].map((p, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">{p.name} <span className="text-[10px] text-slate-400 font-normal">({p.volume})</span></span>
                  <span className="text-slate-900 dark:text-white">{p.rate}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${p.color} rounded-full`} style={{ width: `${p.rate}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Advanced Premium Feature: SMS Cost Calculator */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm" id="cost_calculator_card">
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800 mb-5 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-emerald-500" />
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Premium SMS Cost Calculator</h3>
            <p className="text-xs text-slate-400 mt-0.5">Simulate cost projections for bulk marketing campaigns dynamically</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Form Fields */}
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Field 1: Gateway provider selector */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Select Gateway</label>
              <select
                value={calcProvider}
                onChange={(e) => setCalcProvider(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200 outline-none"
              >
                {store.providers.map(p => (
                  <option key={p.id} value={p.name}>{p.name} ({p.active ? "Active" : "Inactive"})</option>
                ))}
              </select>
            </div>

            {/* Field 2: Target country */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Target Destination</label>
              <select
                value={calcCustomCountry}
                onChange={(e) => setCalcCustomCountry(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200 outline-none"
              >
                <option value="Local (Ghana)">Local (Ghana / ECOWAS)</option>
                <option value="International (US/EU)">International (US/EU Routing)</option>
                <option value="East Africa">East Africa (SAF/MTN Region)</option>
              </select>
            </div>

            {/* Field 3: Campaign volumes */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Recipient Count</label>
              <input
                type="number"
                min="1"
                value={calcSMSCount}
                onChange={(e) => setCalcSMSCount(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200 outline-none"
              />
            </div>

            {/* Length parameter slider */}
            <div className="sm:col-span-3">
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Message Text Character Length</label>
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {calcCharLength} Chars ({smsParts} SMS Segment{smsParts > 1 ? "s" : ""})
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="800"
                value={calcCharLength}
                onChange={(e) => setCalcCharLength(parseInt(e.target.value))}
                className="w-full accent-emerald-600 cursor-ew-resize bg-slate-100 dark:bg-slate-800 h-2 rounded-lg"
              />
              <span className="text-[10px] text-slate-400 block mt-1">Standard SMS segments: 160 characters max. Multipart segment limits: 153 characters.</span>
            </div>

          </div>

          {/* Results Summary Box */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-4 rounded-xl text-center flex flex-col justify-between" id="calculator_results_box">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">PROJECTED COST</span>
              <h2 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 leading-none">
                {totalCalculatedCost.toLocaleString()}
                <span className="text-xs font-semibold text-slate-400 ml-1">Credits</span>
              </h2>
              <span className="text-[10px] text-slate-400 block mt-1">~ ${(totalCalculatedCost * 0.12).toFixed(2)} USD Equivalent</span>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800/80 pt-3 mt-4 text-left space-y-1.5 text-[11px] text-slate-500">
              <div className="flex justify-between">
                <span>Base Rate ({calcProvider}):</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{ratePerSmsPart.toFixed(3)} credits/SMS</span>
              </div>
              <div className="flex justify-between">
                <span>Segments per user:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{smsParts} segment{smsParts > 1 ? "s" : ""}</span>
              </div>
              <div className="flex justify-between">
                <span>Destination Multiplier:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">1.0x</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
