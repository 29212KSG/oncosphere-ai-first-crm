import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  RootState, 
  setFormField, 
  setTraceLog, 
  setLoading, 
  setError 
} from "../reduxStore";
import { Send, Sparkles, HelpCircle, User, Bot, AlertCircle, RefreshCw } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

export default function AIAssistant() {
  const dispatch = useDispatch();
  const loading = useSelector((state: RootState) => state.crm.loading);
  const error = useSelector((state: RootState) => state.crm.error);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Hello! I am your AI-First CRM Assistant. You can log interactions with HCPs naturally using conversational text or dictation. Type notes about your meeting, and I will extract entities, run regulatory compliance checks, call appropriate CRM tools, and populate your structured form.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const presetTemplates = [
    {
      label: "Meeting with Dr. Jane Sharma",
      text: "I met Dr. Jane Sharma today at Metro Oncology. We had a great discussion about the OncoBoost Phase III trial efficacy slide deck. Positive sentiment overall. I left 2 packs of OncoBoost 10mg Starter Packs with her. She wants to catch up again in 2 weeks."
    },
    {
      label: "Lunch & Learn with Dr. Vance",
      text: "Conducted a Lunch and Learn session with Dr. Marcus Vance. Discussed CardioShield efficacy. I shared the CardioShield Dosing Guide and left 4 Starter Kits of CardioShield 50mg. Neutral sentiment. Outcomes: Dr. Vance is ready to consider CardioShield for critical cardiology cohorts."
    },
    {
      label: "Advisory Board Invitation",
      text: "Emailed Dr. Elena Rostova about the upcoming Clinical Advisory Board invitation. She replied with positive interest. Will follow up next week to confirm travel arrangements."
    }
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    // 1. Add User Message
    const userMsgId = `msg-${Date.now()}`;
    const userMsg: Message = {
      id: userMsgId,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    dispatch(setLoading(true));
    dispatch(setError(null));

    // 2. Fetch API for natural language parsing (Simulating Groq/LangGraph tool execution)
    try {
      const response = await fetch("/api/ai/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSend }),
      });
      const resData = await response.json();

      if (resData.success) {
        // Load parsed data into React Redux store!
        Object.keys(resData.data).forEach((key) => {
          dispatch(setFormField({ key: key as any, value: resData.data[key] }));
        });

        // Set LangGraph execution trace
        dispatch(setTraceLog(resData.trace));

        // Create Bot Response highlighting tools called!
        const parsed = resData.data;
        let toolsTriggered = ["log_interaction"];
        if (parsed.hcpName) toolsTriggered.unshift("search_hcp_directory");
        if ((parsed.materialsShared && parsed.materialsShared.length > 0) || (parsed.samplesDistributed && parsed.samplesDistributed.length > 0)) {
          toolsTriggered.unshift("fetch_product_portfolio");
        }

        const botReply: Message = {
          id: `msg-${Date.now() + 1}`,
          sender: "bot",
          text: `Successfully parsed interaction details! I have mapped the entities and populated the left structured form:
          
• **HCP Matched:** ${parsed.hcpName || "Not specified"}
• **Interaction:** ${parsed.interactionType || "Meeting"}
• **Observed Sentiment:** ${parsed.sentiment || "Neutral"}

💼 **CRM Agent Tools Invoked:**
${toolsTriggered.map((t) => `- \`${t}\` (Success)`).join("\n")}

You can review the updated fields on the left or view the active LangGraph DAG tracing on the "LangGraph Agent Logs" tab!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, botReply]);
      } else {
        throw new Error(resData.error || "An error occurred during extraction.");
      }
    } catch (err: any) {
      dispatch(setError(err.message));
      const errorReply: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: "bot",
        text: `⚠️ **Extraction Error:** I encountered a problem running the LangGraph state transitions: ${err.message}. Please try again or fill in the fields manually.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl flex flex-col h-[700px] shadow-sm overflow-hidden text-slate-900">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-blue-50 text-blue-600 p-1.5 rounded-lg border border-blue-100">
            <Sparkles className="h-4.5 w-4.5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <span>AI Assistant</span>
              <span className="text-[10px] bg-blue-50 border border-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-mono font-medium">
                gemma2-9b-it
              </span>
            </h3>
            <p className="text-[10px] text-slate-500">Log interaction via natural language chat</p>
          </div>
        </div>
        <button
          onClick={() => {
            setMessages([
              {
                id: "welcome",
                sender: "bot",
                text: "Hello! I am your AI-First CRM Assistant. You can log interactions with HCPs naturally using conversational text or dictation. Type notes about your meeting, and I will extract entities, run regulatory compliance checks, call appropriate CRM tools, and populate your structured form.",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]);
            dispatch(setTraceLog(null));
          }}
          title="Clear Chat Logs"
          className="text-slate-500 hover:text-slate-800 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Quick guidance bubble */}
      <div className="bg-slate-50/50 border-b border-slate-200 p-4">
        <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-500 flex items-start gap-2.5 shadow-sm">
          <HelpCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-slate-800">Log interaction details here:</p>
            <p className="mt-0.5 leading-relaxed">
              "Met Dr. Jane Sharma, discussed Product efficacy, positive sentiment, shared brochure" or ask for help. Feel free to click one of the quick templates below to simulate instantly!
            </p>
          </div>
        </div>
      </div>

      {/* Chat messages stream */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/30">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 max-w-[85%] ${
              msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
            }`}
          >
            {/* Avatar */}
            <div
              className={`p-1.5 rounded-lg border flex-shrink-0 ${
                msg.sender === "user"
                  ? "bg-slate-100 text-blue-600 border-slate-200"
                  : "bg-blue-50 text-blue-600 border-blue-100"
              }`}
            >
              {msg.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            {/* Bubble */}
            <div>
              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white font-medium rounded-tr-none shadow-sm"
                    : "bg-white border border-slate-200 text-slate-800 rounded-tl-none whitespace-pre-wrap shadow-sm"
                }`}
              >
                {msg.text}
              </div>
              <p className={`text-[9px] text-slate-400 font-mono mt-1 ${msg.sender === "user" ? "text-right" : ""}`}>
                {msg.timestamp}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3 max-w-[85%]">
            <div className="p-1.5 rounded-lg border bg-blue-50 text-blue-600 border-blue-100">
              <Bot className="h-4 w-4 animate-spin" />
            </div>
            <div>
              <div className="bg-white border border-slate-200 p-3.5 rounded-2xl rounded-tl-none flex items-center space-x-2 shadow-sm">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span>
                <span className="text-[10px] text-slate-400 font-mono pl-1.5">LangGraph routing gemma2-9b-it...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Templates Panel */}
      <div className="px-4 py-2 bg-slate-50/60 border-t border-slate-200 overflow-x-auto whitespace-nowrap flex gap-2">
        {presetTemplates.map((tpl, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSendMessage(tpl.text)}
            disabled={loading}
            className="inline-block text-[10px] bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer font-medium shadow-sm"
          >
            ⚡ {tpl.label}
          </button>
        ))}
      </div>

      {/* Input panel */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            disabled={loading}
            placeholder={loading ? "Orchestrating state DAG..." : "Describe interaction..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSendMessage(input);
              }
            }}
            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 placeholder-slate-400 font-sans disabled:opacity-60 shadow-sm"
          />
          <button
            type="button"
            onClick={() => handleSendMessage(input)}
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white p-3 rounded-xl transition-all shadow-md shadow-blue-500/5 flex items-center justify-center"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
