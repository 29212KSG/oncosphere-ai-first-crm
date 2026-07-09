import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, setActiveTab } from "../reduxStore";
import { Activity, BookOpen, Layers, LogIn, Award, Sparkles } from "lucide-react";

export default function Header() {
  const dispatch = useDispatch();
  const activeTab = useSelector((state: RootState) => state.crm.activeTab);
  const currentForm = useSelector((state: RootState) => state.crm.currentForm);

  // Determine active context based on current form or default
  const activeHcpContext = currentForm.hcpName || "Dr. Jane Sharma — Oncology Specialist";

  return (
    <div className="sticky top-0 z-50 shadow-md">
      {/* Primary Header */}
      <header className="h-16 flex items-center justify-between px-6 bg-[#1E293B] border-b border-[#334155] text-white">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-sm text-white shadow-sm">
            CRM
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight leading-tight">
              OncoSphere <span className="text-blue-400 font-medium text-xs ml-1">v2.4 (AI-First)</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">Field Representative - Life Sciences Div.</p>
          </div>
        </div>

        {/* Tab Selection */}
        <nav className="flex space-x-1 bg-slate-900/60 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => dispatch(setActiveTab("interface"))}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 ${
              activeTab === "interface"
                ? "bg-blue-600 text-white shadow-sm font-semibold"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Interaction Board</span>
          </button>

          <button
            onClick={() => dispatch(setActiveTab("architecture"))}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 ${
              activeTab === "architecture"
                ? "bg-blue-600 text-white shadow-sm font-semibold"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Architecture Specs</span>
          </button>

          {/* <button
            onClick={() => dispatch(setActiveTab("logs"))}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 ${
              activeTab === "logs"
                ? "bg-blue-600 text-white shadow-sm font-semibold"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>LangGraph Agent Traces</span>
          </button> */}
        </nav>
      </header>

      {/* Contextual Subheader Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-100 italic">
            HCP Context: {activeHcpContext}
          </div>
          <div className="flex space-x-1.5">
            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold uppercase tracking-wider rounded">
              KOL
            </span>
            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-bold uppercase tracking-wider rounded">
              Active Study
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span>SYNC STATUS: ACTIVE</span>
        </div>
      </div>
    </div>
  );
}
