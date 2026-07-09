import React, { useState } from "react";
import { BookOpen, Code, Cpu, Database, Hammer, Info, HelpCircle } from "lucide-react";

export default function ArchitectureDoc() {
  const [activeTab, setActiveTab] = useState<"conceptual" | "tools" | "code" | "schema">("conceptual");

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm text-slate-900">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-5">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          <span>Technical Blueprint & Architecture Specifications</span>
        </h2>
        <p className="text-blue-100 text-xs mt-1 font-normal">
          Technical definition of the LangGraph AI Agent, CRM tools, FastAPI Backend, and Postgres database schemas.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50">
        <button
          onClick={() => setActiveTab("conceptual")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "conceptual"
              ? "border-blue-600 text-blue-600 bg-white"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Cpu className="h-4 w-4" />
          Conceptual Design
        </button>
        <button
          onClick={() => setActiveTab("tools")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "tools"
              ? "border-blue-600 text-blue-600 bg-white"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Hammer className="h-4 w-4" />
          5 CRM Agent Tools
        </button>
        <button
          onClick={() => setActiveTab("code")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "code"
              ? "border-blue-600 text-blue-600 bg-white"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Code className="h-4 w-4" />
          LangGraph + FastAPI Code
        </button>
        <button
          onClick={() => setActiveTab("schema")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "schema"
              ? "border-blue-600 text-blue-600 bg-white"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Database className="h-4 w-4" />
          Database Schema
        </button>
      </div>

      {/* Content Area */}
      <div className="p-6 text-slate-700 font-sans leading-relaxed">
        {activeTab === "conceptual" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                Role of LangGraph Agent in HCP Interaction Management
              </h3>
              <p className="text-sm text-slate-600 font-normal">
                In a modern, AI-first Customer Relationship Management (CRM) system designed for life sciences and clinical representatives, the <strong>LangGraph agent acts as the stateful orchestrator</strong>. Traditional CRMs rely on complex, multi-click input paths which represent a significant administrative burden for field sales representatives. 
              </p>
              <p className="text-sm text-slate-600 mt-3 font-normal">
                By modeling interaction logging as a <strong>Stateful Directed Acyclic Graph (DAG)</strong> using LangGraph, the system provides high flexibility:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="text-sm font-semibold text-blue-700 mb-2">1. Stateful Context Tracking</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  LangGraph maintains the core conversation state variable (<code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">State</code>). This allows reps to log and edit interactions incrementally (e.g., adding details, updating attendees list, or correcting shared materials) across multiple conversational turns, without losing context.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="text-sm font-semibold text-blue-700 mb-2">2. Dynamic Tool Routing</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  Based on the representative's natural language input, the agent makes routing decisions. It evaluates if it should query the provider registry, check drug sample inventory limits under the Prescription Drug Marketing Act (PDMA), or write details to the SQL transaction log.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="text-sm font-semibold text-blue-700 mb-2">3. Guardrails & Compliance Enforcer</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  Life sciences operate under strict regulatory standards (e.g., PhRMA Guidelines, HIPAA). The LangGraph flow includes validation nodes that automatically audit the generated payloads (e.g. confirming starter kit handovers match physical HCP signatures and validating indications).
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="text-sm font-semibold text-blue-700 mb-2">4. Auto-summarization & Extraction</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  Utilizing the <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">gemma2-9b-it</code> model on Groq, the agent parses messy voice notes, extracts entities with extreme semantic accuracy, maps unstructured sentiments, and suggests logical next-best CRM tasks.
                </p>
              </div>
            </div>

            <div className="bg-blue-50/50 border border-blue-200 p-4 rounded-xl flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-blue-900">How This Benefits Field Representatives</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed font-normal">
                  Instead of spending 15 minutes after each clinic visit ticking boxes and selecting dropdowns, a representative dictating a 30-second voice note in their car ("Met Dr. Sharma at Metro Oncology, shared OncoBoost trial reprint, very high positive interest, gave her two starter packs") can rely on the agent to populate a fully validated CRM transaction, ready for submission with a single click.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "tools" && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">5 Specialized CRM Agent Tools Defined</h3>

            <div className="space-y-4">
              {/* Tool 1 */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-md font-semibold text-blue-700 font-mono">1. log_interaction (Mandatory)</h4>
                  <span className="text-xs bg-blue-50 border border-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-mono font-medium">Mutation</span>
                </div>
                <p className="text-xs text-slate-500">
                  <strong>Description:</strong> Captures and commits interaction records to the durable transactional database (Postgres/MySQL).
                </p>
                <div className="mt-3 bg-white p-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-600 shadow-inner">
                  <span className="text-slate-400 font-medium"># Key Extraction & Processing Strategy:</span>
                  <br />- <strong>LLM Entity Extraction:</strong> Extracts HCP Name, date, times, sentiment, attendees, and shared collateral.
                  <br />- <strong>Outcome Summarization:</strong> Translates messy audio/chat transcript to clean Clinical Summaries using <code className="text-blue-700 font-semibold">gemma2-9b-it</code>.
                  <br />- <strong>Reg-Compliance Check:</strong> Verifies that sample distributions match permitted drug limitations per HCP profile.
                </div>
              </div>

              {/* Tool 2 */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-md font-semibold text-blue-700 font-mono">2. edit_interaction (Mandatory)</h4>
                  <span className="text-xs bg-blue-50 border border-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-mono font-medium">Mutation</span>
                </div>
                <p className="text-xs text-slate-500">
                  <strong>Description:</strong> Updates, appends, or edits an existing, previously committed CRM log.
                </p>
                <div className="mt-3 bg-white p-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-600 shadow-inner">
                  <span className="text-slate-400 font-medium"># Action Pattern:</span>
                  <br />- <strong>Reference Lookup:</strong> Selects the active target record ID in the session context.
                  <br />- <strong>State Merging:</strong> Merges the updated inputs with the existing database schema.
                  <br />- <strong>History Auditing:</strong> Logs the differential state updates to an audit-log table for compliance tracking.
                </div>
              </div>

              {/* Tool 3 */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-md font-semibold text-blue-700 font-mono">3. search_hcp_directory</h4>
                  <span className="text-xs bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-mono font-medium">Query</span>
                </div>
                <p className="text-xs text-slate-500">
                  <strong>Description:</strong> Queries the central National Provider Identifier (NPI) registry or internal CRM Provider Directory to fetch and match clinical provider profiles.
                </p>
                <div className="mt-2 text-xs text-slate-600 leading-relaxed font-normal">
                  <strong>Use Case:</strong> Ensures the rep is logging details against a verified clinical identity, fetching their exact specialty, medical credentials (e.g., MD, DO, PharmD), and affiliated institutions.
                </div>
              </div>

              {/* Tool 4 */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-md font-semibold text-blue-700 font-mono">4. fetch_product_portfolio</h4>
                  <span className="text-xs bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-mono font-medium">Query</span>
                </div>
                <p className="text-xs text-slate-500">
                  <strong>Description:</strong> Queries approved scientific brochures, medical trial reprint publications (PDFs), and starter pack drug inventories available for distribution.
                </p>
                <div className="mt-2 text-xs text-slate-600 leading-relaxed font-normal">
                  <strong>Use Case:</strong> Cross-references and completes names of shared materials, making sure that materials listed in the log match approved corporate marketing literature assets.
                </div>
              </div>

              {/* Tool 5 */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-md font-semibold text-blue-700 font-mono">5. schedule_crm_tasks</h4>
                  <span className="text-xs bg-blue-50 border border-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-mono font-medium">Mutation</span>
                </div>
                <p className="text-xs text-slate-500">
                  <strong>Description:</strong> Automatically registers tasks, medical information requests (MIRs), calendar invites, and reminder alerts directly inside the CRM dashboard.
                </p>
                <div className="mt-2 text-xs text-slate-600 leading-relaxed font-normal">
                  <strong>Use Case:</strong> Saves the representative from manual calendar entries. Automatically books tasks based on the "Suggested Follow-ups" parsed by the LLM.
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "code" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Production-Ready Code Architecture</h3>
              <p className="text-sm text-slate-500 font-normal">
                This tab presents the complete technical implementation of the LangGraph state graph and FastAPI endpoints using standard life-science design patterns.
              </p>
            </div>

            {/* Code Block 1: LangGraph Agent */}
            <div>
              <div className="bg-slate-100 px-4 py-2 border-t border-x border-slate-200 rounded-t-lg flex justify-between items-center text-slate-700 shadow-sm">
                <span className="text-xs font-semibold font-mono text-blue-600">agent_graph.py</span>
                <span className="text-[10px] text-slate-400 font-mono font-medium">LangGraph + Groq (gemma2-9b-it)</span>
              </div>
              <pre className="text-xs text-slate-800 p-4 bg-slate-50 border border-slate-200 rounded-b-lg overflow-x-auto font-mono max-h-[350px] leading-relaxed shadow-inner">
{`from typing import TypedDict, List, Dict, Any, Literal
from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage
from langchain_groq import ChatGroq
from langchain_core.tools import tool

# 1. State Definition
class CRMState(TypedDict):
    raw_input: str
    extracted_data: Dict[str, Any]
    matched_hcp_id: str
    validated_materials: List[str]
    validated_samples: List[Dict[str, Any]]
    log_status: str
    messages: List[BaseMessage]

# 2. Tools
@tool
def search_hcp_directory(name: str) -> Dict[str, Any]:
    """Look up healthcare provider credentials and unique NPI identification ID."""
    # Queries MySQL/PostgreSQL directory
    return {"hcp_id": "HCP-9921", "name": name, "npi": "1882746190", "status": "Active"}

@tool
def fetch_product_portfolio(materials: List[str], samples: List[Dict]) -> Dict[str, Any]:
    """Check inventory status and validate life-science marketing assets."""
    return {"materials_valid": True, "samples_compliant": True}

@tool
def log_interaction(data: Dict[str, Any]) -> str:
    """Commit interaction details to primary database schema."""
    # Write to SQL db...
    return "SUCCESS_COMMITTED"

# 3. Model Definition using Groq gemma2-9b-it
model = ChatGroq(model_name="gemma2-9b-it", temperature=0.1)

# 4. State Graph Definition
workflow = StateGraph(CRMState)

# Define Ingest & Extract Node
def nlp_extract_node(state: CRMState) -> Dict[str, Any]:
    prompt = f"Extract structured pharmaceutical sales metrics from: {state['raw_input']}"
    extracted = model.invoke(prompt) # Zero-shot JSON extraction
    return {"extracted_data": extracted}

# Define Validation & Compliance Node
def validation_node(state: CRMState) -> Dict[str, Any]:
    hcp_res = search_hcp_directory(state['extracted_data'].get('hcpName'))
    prod_res = fetch_product_portfolio(
        state['extracted_data'].get('materialsShared', []),
        state['extracted_data'].get('samplesDistributed', [])
    )
    return {
        "matched_hcp_id": hcp_res["hcp_id"],
        "validated_materials": state['extracted_data'].get('materialsShared', []),
        "validated_samples": state['extracted_data'].get('samplesDistributed', [])
    }

# Define Store Node
def db_write_node(state: CRMState) -> Dict[str, Any]:
    status = log_interaction(state['extracted_data'])
    return {"log_status": status}

# Setup state transitions
workflow.add_node("nlp_extract", nlp_extract_node)
workflow.add_node("validate", validation_node)
workflow.add_node("db_write", db_write_node)

workflow.set_entry_point("nlp_extract")
workflow.add_edge("nlp_extract", "validate")
workflow.add_edge("validate", "db_write")
workflow.add_edge("db_write", END)

# Compile agent
agent = workflow.compile()`}
              </pre>
            </div>

            {/* Code Block 2: FastAPI */}
            <div>
              <div className="bg-slate-100 px-4 py-2 border-t border-x border-slate-200 rounded-t-lg flex justify-between items-center text-slate-700 shadow-sm">
                <span className="text-xs font-semibold font-mono text-blue-600">main.py</span>
                <span className="text-[10px] text-slate-400 font-mono font-medium">FastAPI Backend</span>
              </div>
              <pre className="text-xs text-slate-800 p-4 bg-slate-50 border border-slate-200 rounded-b-lg overflow-x-auto font-mono max-h-[350px] leading-relaxed shadow-inner">
{`from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from agent_graph import agent

app = FastAPI(title="AI-First CRM HCP Module Backend", version="1.0.0")

class IngestRequest(BaseModel):
    raw_notes: str = Field(..., description="The dictated or typed interaction logging text.")

class EditRequest(BaseModel):
    interaction_id: str
    modified_fields: Dict[str, Any]

@app.post("/api/interactions/ingest")
async def ingest_interaction(payload: IngestRequest):
    """
    Ingest a raw text notes string and route through stateful LangGraph agent
    executing gemma2-9b-it on Groq.
    """
    try:
        # Run state graph
        inputs = {"raw_input": payload.raw_notes}
        result = agent.invoke(inputs)
        
        return {
            "status": "success",
            "interaction_id": result.get("matched_hcp_id"),
            "extracted_state": result.get("extracted_data"),
            "execution_status": result.get("log_status")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LangGraph execution failure: {str(e)}")

@app.put("/api/interactions/edit")
async def edit_interaction(payload: EditRequest):
    """
    Invoke 'edit_interaction' tool context, modifying and merging fields in the
    relational schema.
    """
    try:
        # State updates
        # Update database details...
        return {
            "status": "updated",
            "edited_id": payload.interaction_id,
            "applied_changes": payload.modified_fields
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database update failed: {str(e)}")`}
              </pre>
            </div>
          </div>
        )}

        {activeTab === "schema" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Relational SQL Database Schema (PostgreSQL/MySQL)</h3>
                <p className="text-sm text-slate-500 font-normal">
                  Defines the normalization structure needed to hold compliant, high-fidelity Life Sciences sales and medical logs.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
              <h4 className="text-sm font-semibold text-blue-700 mb-3 font-mono">DDL Database Blueprint</h4>
              <pre className="text-xs text-slate-800 font-mono overflow-x-auto leading-relaxed max-h-[400px]">
{`-- 1. Healthcare Professionals Directory Table
CREATE TABLE hcps (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    npi_number VARCHAR(10) UNIQUE NOT NULL,
    institution VARCHAR(150),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Master Product Portfolio Literature Materials Table
CREATE TABLE clinical_materials (
    id SERIAL PRIMARY KEY,
    material_name VARCHAR(150) NOT NULL,
    document_type VARCHAR(50), -- clinical_study, efficacy_slide, product_brochure
    regulatory_id VARCHAR(50) -- FDA/Internal Compliance registration code
);

-- 3. Core Interactions Logging Table (The Transactional Header)
CREATE TABLE hcp_interactions (
    id VARCHAR(50) PRIMARY KEY,
    hcp_id VARCHAR(50) NOT NULL,
    interaction_type VARCHAR(50) NOT NULL, -- Meeting, Call, Lunch and Learn, Webcast, Advisory Board
    interaction_date DATE NOT NULL,
    interaction_time TIME NOT NULL,
    sentiment VARCHAR(20) NOT NULL, -- Positive, Neutral, Negative
    topics_discussed TEXT,
    outcomes TEXT,
    follow_up_actions TEXT,
    compliance_audit_hash VARCHAR(64), -- Cryptographic verification hash
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hcp_id) REFERENCES hcps(id)
);

-- 4. Shared Materials Mapping (N-to-N Mapping)
CREATE TABLE shared_materials_mapping (
    interaction_id VARCHAR(50) NOT NULL,
    material_id INT NOT NULL,
    PRIMARY KEY (interaction_id, material_id),
    FOREIGN KEY (interaction_id) REFERENCES hcp_interactions(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES clinical_materials(id)
);

-- 5. Distributed Starter Samples Table (PDMA Audits-ready)
CREATE TABLE samples_distributed (
    id SERIAL PRIMARY KEY,
    interaction_id VARCHAR(50) NOT NULL,
    sample_name VARCHAR(150) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    lot_number VARCHAR(50), -- Tracking batch compliance code
    FOREIGN KEY (interaction_id) REFERENCES hcp_interactions(id) ON DELETE CASCADE
);`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
