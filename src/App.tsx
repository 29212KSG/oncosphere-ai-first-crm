import React, { useEffect } from "react";
import { Provider, useSelector, useDispatch } from "react-redux";
import { reduxStore, RootState, setAvailableData, setInteractions } from "./reduxStore";
import Header from "./components/Header";
import InteractionForm from "./components/InteractionForm";
import AIAssistant from "./components/AIAssistant";
import ArchitectureDoc from "./components/ArchitectureDoc";
import LoggedInteractionsList from "./components/LoggedInteractionsList";
import LangGraphTrace from "./components/LangGraphTrace";
import { Cpu, Layers, Sparkles, LogIn, Activity } from "lucide-react";

function MainDashboard() {
  const activeTab = useSelector((state: RootState) => state.crm.activeTab);
  const dispatch = useDispatch();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [hcpsRes, materialsRes, samplesRes, interactionsRes] = await Promise.all([
          fetch("/api/hcps").then(res => res.json()),
          fetch("/api/materials").then(res => res.json()),
          fetch("/api/samples").then(res => res.json()),
          fetch("/api/interactions").then(res => res.json()),
        ]);

        dispatch(setAvailableData({
          hcps: hcpsRes,
          materials: materialsRes,
          samples: samplesRes,
        }));

        dispatch(setInteractions(interactionsRes));
      } catch (error) {
        console.error("Error loading CRM data from database:", error);
      }
    };

    loadInitialData();
  }, [dispatch]);

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      {activeTab === "interface" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Structured Input & History Registry */}
          <div className="lg:col-span-7 space-y-8 animate-fade-in">
            <InteractionForm />
            <LoggedInteractionsList />
          </div>

          {/* Right: Conversational Chat & Real-Time Graph Tracing */}
          <div className="lg:col-span-5 space-y-8 animate-fade-in">
            <AIAssistant />
            <LangGraphTrace />
          </div>
        </div>
      )}

      {activeTab === "architecture" && (
        <div className="animate-fade-in max-w-5xl mx-auto">
          <ArchitectureDoc />
        </div>
      )}

      {activeTab === "logs" && (
        <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2 font-sans">
              <Cpu className="h-6 w-6 text-blue-600" />
              <span>LangGraph Execution Panel</span>
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Below is an expanded view of the active state machine. As you log interactions, the agent updates context state variables, validates pharmaceutical constraints, and triggers tools.
            </p>
            <LangGraphTrace />
          </div>

          {/* Quick simulator info box */}
          <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <Sparkles className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Interactive Testing Guidance</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                To trigger state machine logging, go to the <strong>Interaction Board</strong> tab. You can type notes into the AI Assistant input box on the right or click any of the <strong>Quick templates</strong> (e.g. "Meeting with Dr. Jane Sharma"). The backend will trigger a stateful run, execute appropriate tools, and display the JSON traces right inside this graph panel.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function App() {
  return (
    <Provider store={reduxStore}>
      <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-blue-600 selection:text-white pb-12">
        <Header />
        <MainDashboard />
      </div>
    </Provider>
  );
}
