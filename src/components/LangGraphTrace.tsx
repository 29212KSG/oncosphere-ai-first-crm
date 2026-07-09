import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../reduxStore";
import { ArrowRight, Play, CheckCircle2, AlertTriangle, Cpu, Hammer, FileJson, CornerDownRight } from "lucide-react";

export default function LangGraphTrace() {
  const traceLog = useSelector((state: RootState) => state.crm.traceLog);
  const loading = useSelector((state: RootState) => state.crm.loading);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

  // Predefined graph node definitions for visualization
  const graphNodes = [
    { id: "__start__", label: "Start", type: "system" },
    { id: "NLP_Ingest_Node", label: "Ingest Notes", type: "node" },
    { id: "LLM_Extraction_Node", label: "LLM Entity Extractor", type: "node" },
    { id: "Validation_Router_Node", label: "Routing Router", type: "node" },
    { id: "Search_HCP_Directory_Tool", label: "HCP Dir Tool", type: "tool" },
    { id: "Fetch_Product_Portfolio_Tool", label: "Prod Port Tool", type: "tool" },
    { id: "Log_Interaction_Tool", label: "Log Write Tool", type: "tool" },
    { id: "__end__", label: "End", type: "system" },
  ];

  // Determine which node is currently active or highlighted in the trace
  const activeNodeId = traceLog && traceLog.length > 0 
    ? traceLog[traceLog.length - 1].node 
    : null;

  const getTraceStatusColor = (type: string, isHighlighted: boolean) => {
    if (isHighlighted) {
      return "bg-blue-600 border-blue-700 text-white shadow-md scale-105 animate-pulse";
    }
    if (type === "system") return "bg-slate-100 border-slate-200 text-slate-500";
    if (type === "tool") return "bg-blue-50 border-blue-200 text-blue-700";
    return "bg-white border-slate-200 text-slate-700 shadow-sm";
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-slate-900">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2 font-sans">
            <Cpu className="h-5 w-5 text-blue-600" />
            <span>LangGraph Agent State Visualizer</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-normal">
            Real-time visual playback of the conversational agent's node transitions and tools.
          </p>
        </div>
        {loading && (
          <div className="flex items-center space-x-2 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full text-blue-600 text-xs font-mono font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            <span>Agent Processing Graph...</span>
          </div>
        )}
      </div>

      {/* Graphical Flow Representation */}
      <div className="mb-8 overflow-x-auto py-4 px-2 bg-slate-50/50 rounded-xl border border-slate-200">
        <div className="flex items-center space-x-3 min-w-[760px] justify-between">
          {graphNodes.map((node, index) => {
            const isHighlighted = activeNodeId === node.id || (loading && index === 2);
            return (
              <React.Fragment key={node.id}>
                <div
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-300 flex-1 ${getTraceStatusColor(
                    node.type,
                    isHighlighted
                  )}`}
                >
                  <span className="text-[10px] uppercase tracking-wider font-mono opacity-60">
                    {node.type}
                  </span>
                  <span className="text-xs font-semibold mt-1 truncate max-w-full">
                    {node.label}
                  </span>
                </div>
                {index < graphNodes.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-slate-300 flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Logs section */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center space-x-2">
          <FileJson className="h-4 w-4 text-blue-600" />
          <span>Execution Graph Trace Logs ({traceLog ? traceLog.length : 0})</span>
        </h3>

        {!traceLog ? (
          <div className="text-center py-10 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl text-slate-400">
            <Play className="h-8 w-8 mx-auto mb-3 opacity-30 text-blue-600" />
            <p className="text-sm font-medium text-slate-600">No active state execution trace.</p>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed font-normal">
              Submit a natural language log using the AI Assistant chat panel to trigger the LangGraph orchestration flow and populate this graph.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {traceLog.map((item, index) => {
              const isSelected = selectedItemIndex === index;
              return (
                <div
                  key={index}
                  className={`border rounded-xl transition-all duration-200 ${
                    isSelected
                      ? "bg-slate-50 border-slate-300 shadow-sm"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <button
                    onClick={() => setSelectedItemIndex(isSelected ? null : index)}
                    className="w-full text-left p-4 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {item.type === "tool" ? (
                          <div className="bg-blue-50 text-blue-600 p-1.5 rounded-lg border border-blue-100">
                            <Hammer className="h-4 w-4" />
                          </div>
                        ) : (
                          <div className="bg-blue-50 text-blue-600 p-1.5 rounded-lg border border-blue-100">
                            <Cpu className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs text-blue-600 font-bold">
                            {item.node}
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                            {item.type.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 mt-1 font-sans">{item.message}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </span>
                  </button>

                  {/* Expandable JSON / Payload block */}
                  {isSelected && item.data && (
                    <div className="px-4 pb-4 border-t border-slate-200 pt-3 bg-slate-50 rounded-b-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                          <CornerDownRight className="h-3.5 w-3.5 text-blue-600" />
                          Payload State Variables (StateGraph context):
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">JSON format</span>
                      </div>
                      <pre className="text-xs text-blue-900 font-mono p-3 bg-white rounded-lg overflow-x-auto border border-slate-200 max-h-[220px] shadow-inner">
                        {JSON.stringify(item.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
