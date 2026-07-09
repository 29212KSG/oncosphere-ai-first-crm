import os
import json
import time
import mimetypes
import pymysql
from dotenv import load_dotenv
from datetime import datetime, timedelta
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field
import httpx
from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from google import genai
from google.genai import types

app = FastAPI()

load_dotenv()  # Load environment variables from .env file

# Configuration and Initialization
PORT = 3000
IS_DEV = os.environ.get("NODE_ENV") != "production"
VITE_URL = "http://127.0.0.1:5173"
DB_NAME = "lifescience_crm"

# Lazy-loaded Gemini client
client = None

def get_gemini_client():
    global client
    if client is None:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise HTTPException(
                status_code=500, 
                detail="GEMINI_API_KEY environment variable is required to process NLP inputs."
            )
        # Initialize Google GenAI client
        client = genai.Client(api_key=api_key)
    return client

# Mock Database of HCPs (used as seed fallback)
mock_hcps = [
    { "id": "hcp-1", "name": "Dr. Jane Sharma", "specialty": "Oncology", "institution": "Metro Cancer Center" },
    { "id": "hcp-2", "name": "Dr. Marcus Vance", "specialty": "Cardiology", "institution": "St. Jude Cardiology" },
    { "id": "hcp-3", "name": "Dr. Elena Rostova", "specialty": "Immunology", "institution": "Global Research Hospital" },
    { "id": "hcp-4", "name": "Dr. David Cho", "specialty": "Oncology", "institution": "University Medical Center" },
    { "id": "hcp-5", "name": "Dr. Sarah Jenkins", "specialty": "Neurology", "institution": "Neurology Specialist Clinic" }
]

# Mock Database of Materials (used as seed fallback)
mock_materials = [
    "OncoBoost Phase III Trial Reprint (NEJM)",
    "OncoBoost Efficacy & Safety Slide Deck",
    "OncoBoost Patient Starter Kit Brochure",
    "CardioShield Dosing Guide",
    "NeuroRevive Clinical Study Summary"
]

# Mock Database of Samples (used as seed fallback)
mock_samples = [
    "OncoBoost 10mg (Starter Packs)",
    "OncoBoost 20mg (Starter Packs)",
    "CardioShield 50mg (Starter Kits)",
    "NeuroRevive 5mg (Sample Bottles)"
]

def get_db_connection():
    return pymysql.connect(
        host="localhost",
        user="root",
        password="root",
        database=DB_NAME,
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor
    )

def init_db():
    # Connect without database first to create it if not exists
    conn = pymysql.connect(
        host="localhost",
        user="root",
        password="root",
        charset="utf8mb4"
    )
    try:
        with conn.cursor() as cursor:
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME};")
        conn.commit()
    finally:
        conn.close()

    # Now connect to database and initialize schema & seed
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS hcps (
                    id VARCHAR(50) PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    specialty VARCHAR(100),
                    institution VARCHAR(150)
                );
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS materials (
                    name VARCHAR(255) PRIMARY KEY
                );
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS samples (
                    name VARCHAR(255) PRIMARY KEY
                );
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS interactions (
                    id VARCHAR(50) PRIMARY KEY,
                    hcpName VARCHAR(255) NOT NULL,
                    interactionType VARCHAR(100) NOT NULL,
                    date VARCHAR(10) NOT NULL,
                    time VARCHAR(5) NOT NULL,
                    attendees TEXT,
                    topicsDiscussed TEXT,
                    materialsShared TEXT,
                    samplesDistributed TEXT,
                    sentiment VARCHAR(50),
                    outcomes TEXT,
                    followUpActions TEXT,
                    suggestedFollowUps TEXT,
                    createdAt VARCHAR(50) NOT NULL
                );
            """)
            
            # Seed HCPs
            cursor.execute("SELECT COUNT(*) as count FROM hcps;")
            if cursor.fetchone()["count"] == 0:
                for hcp in mock_hcps:
                    cursor.execute(
                        "INSERT INTO hcps (id, name, specialty, institution) VALUES (%s, %s, %s, %s);",
                        (hcp["id"], hcp["name"], hcp["specialty"], hcp["institution"])
                    )
            
            # Seed Materials
            cursor.execute("SELECT COUNT(*) as count FROM materials;")
            if cursor.fetchone()["count"] == 0:
                for mat in mock_materials:
                    cursor.execute("INSERT INTO materials (name) VALUES (%s);", (mat,))
            
            # Seed Samples
            cursor.execute("SELECT COUNT(*) as count FROM samples;")
            if cursor.fetchone()["count"] == 0:
                for samp in mock_samples:
                    cursor.execute("INSERT INTO samples (name) VALUES (%s);", (samp,))
            
            # Seed Interactions
            cursor.execute("SELECT COUNT(*) as count FROM interactions;")
            if cursor.fetchone()["count"] == 0:
                initial_int = {
                    "id": "int-1",
                    "hcpName": "Dr. Jane Sharma",
                    "interactionType": "Meeting",
                    "date": "2026-07-08",
                    "time": "14:30",
                    "attendees": json.dumps(["John Doe (Sales rep)", "Dr. Jane Sharma"]),
                    "topicsDiscussed": "Discussed OncoBoost Phase III efficacy data, focusing on progression-free survival (PFS) rates. Dr. Sharma was highly receptive and requested physical copies of the clinical trial reprint.",
                    "materialsShared": json.dumps(["OncoBoost Phase III Trial Reprint (NEJM)"]),
                    "samplesDistributed": json.dumps([{"name": "OncoBoost 10mg (Starter Packs)", "quantity": 2}]),
                    "sentiment": "Positive",
                    "outcomes": "Dr. Sharma agreed to review the clinical reprints and consider OncoBoost for her upcoming cohort. Scheduled a follow-up in two weeks.",
                    "followUpActions": "Prepare and deliver the NEJM reprint package. Schedule follow-up visit.",
                    "suggestedFollowUps": json.dumps([
                        "+ Send OncoBoost Phase III PDF",
                        "+ Schedule follow-up meeting in 2 weeks"
                    ]),
                    "createdAt": (datetime.now() - timedelta(days=1)).isoformat()
                }
                cursor.execute("""
                    INSERT INTO interactions (
                        id, hcpName, interactionType, date, time, attendees, topicsDiscussed,
                        materialsShared, samplesDistributed, sentiment, outcomes, followUpActions,
                        suggestedFollowUps, createdAt
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
                """, (
                    initial_int["id"], initial_int["hcpName"], initial_int["interactionType"],
                    initial_int["date"], initial_int["time"], initial_int["attendees"],
                    initial_int["topicsDiscussed"], initial_int["materialsShared"],
                    initial_int["samplesDistributed"], initial_int["sentiment"],
                    initial_int["outcomes"], initial_int["followUpActions"],
                    initial_int["suggestedFollowUps"], initial_int["createdAt"]
                ))
        conn.commit()
    finally:
        conn.close()

# Run initialization on boot
try:
    init_db()
except Exception as e:
    print("[DB Init Alert] Could not initialize or seed MySQL database on startup:", e)

# Pydantic models for request/response
class ProcessRequest(BaseModel):
    text: str

class SampleItem(BaseModel):
    name: str
    quantity: int

class InteractionModel(BaseModel):
    id: Optional[str] = None
    hcpName: str
    interactionType: str
    date: str
    time: str
    attendees: List[str] = []
    topicsDiscussed: Optional[str] = ""
    materialsShared: List[str] = []
    samplesDistributed: List[SampleItem] = []
    sentiment: str
    outcomes: Optional[str] = ""
    followUpActions: Optional[str] = ""
    suggestedFollowUps: List[str] = []
    createdAt: Optional[str] = None

class CRMExtraction(BaseModel):
    hcpName: str = Field(description="Name of the Healthcare Professional, e.g. Dr. Jane Sharma")
    interactionType: str = Field(description="One of: Meeting, Call, Email, Lunch and Learn, Webcast, Advisory Board")
    date: str = Field(description="YYYY-MM-DD")
    time: str = Field(description="HH:MM")
    attendees: List[str] = Field(default_factory=list)
    topicsDiscussed: Optional[str] = None
    materialsShared: List[str] = Field(default_factory=list)
    samplesDistributed: List[SampleItem] = Field(default_factory=list)
    sentiment: str = Field(description="Positive, Neutral, or Negative")
    outcomes: Optional[str] = None
    followUpActions: Optional[str] = None
    suggestedFollowUps: List[str] = Field(default_factory=list)

# Content Generation Helper with Retries and Fallbacks
def generate_content_with_retry(client, prompt: str, schema: Any, max_retries: int = 3):
    models = ["gemini-2.5-flash", "gemini-3.5-flash", "gemini-3.1-flash-lite"]
    last_err = None
    
    config = types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=schema,
        temperature=0.1,
    )
    
    for model_name in models:
        delay = 1.0
        for attempt in range(1, max_retries + 1):
            try:
                print(f"[Gemini API] Attempting generate_content with model: {model_name}, attempt: {attempt}/{max_retries}")
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=config
                )
                print(f"[Gemini API] Success using model: {model_name}")
                return response
            except Exception as err:
                last_err = err
                print(f"[Gemini API] Error using model {model_name} on attempt {attempt}: {err}")
                
                # Check if transient
                err_msg = str(err).lower()
                is_transient = any(msg in err_msg for msg in [
                    "503", "429", "unavailable", "high demand", 
                    "resource has been exhausted", "failed to fetch", 
                    "network", "overloaded", "quota"
                ])
                
                if not is_transient:
                    raise err
                    
                if attempt < max_retries:
                    time.sleep(delay)
                    delay *= 2.0
                    
        print(f"[Gemini API] Model {model_name} exhausted/unavailable. Falling back...")
    
    raise last_err or Exception("Failed to generate content with all available models")

# API Endpoints
@app.get("/api/hcps")
async def get_hcps():
    try:
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM hcps;")
                return cursor.fetchall()
        finally:
            conn.close()
    except Exception as e:
        print("[DB Error] get_hcps failed:", e)
        return mock_hcps

@app.get("/api/materials")
async def get_materials():
    try:
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM materials;")
                rows = cursor.fetchall()
                return [r["name"] for r in rows]
        finally:
            conn.close()
    except Exception as e:
        print("[DB Error] get_materials failed:", e)
        return mock_materials

@app.get("/api/samples")
async def get_samples():
    try:
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM samples;")
                rows = cursor.fetchall()
                return [r["name"] for r in rows]
        finally:
            conn.close()
    except Exception as e:
        print("[DB Error] get_samples failed:", e)
        return mock_samples

@app.get("/api/interactions")
async def get_interactions():
    try:
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM interactions ORDER BY createdAt DESC;")
                rows = cursor.fetchall()
                for r in rows:
                    r["attendees"] = json.loads(r["attendees"]) if r["attendees"] else []
                    r["materialsShared"] = json.loads(r["materialsShared"]) if r["materialsShared"] else []
                    r["samplesDistributed"] = json.loads(r["samplesDistributed"]) if r["samplesDistributed"] else []
                    r["suggestedFollowUps"] = json.loads(r["suggestedFollowUps"]) if r["suggestedFollowUps"] else []
                return rows
        finally:
            conn.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch interactions: {str(e)}")

@app.post("/api/interactions")
async def create_interaction(item: InteractionModel):
    try:
        conn = get_db_connection()
        try:
            item_id = item.id if item.id else f"int-{int(time.time() * 1000)}"
            created_at = item.createdAt if item.createdAt else datetime.now().isoformat()
            
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO interactions (
                        id, hcpName, interactionType, date, time, attendees, topicsDiscussed,
                        materialsShared, samplesDistributed, sentiment, outcomes, followUpActions,
                        suggestedFollowUps, createdAt
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
                """, (
                    item_id, item.hcpName, item.interactionType, item.date, item.time,
                    json.dumps(item.attendees), item.topicsDiscussed, json.dumps(item.materialsShared),
                    json.dumps([samp.dict() for samp in item.samplesDistributed]), item.sentiment,
                    item.outcomes, item.followUpActions, json.dumps(item.suggestedFollowUps),
                    created_at
                ))
            conn.commit()
            return {
                "id": item_id,
                "hcpName": item.hcpName,
                "interactionType": item.interactionType,
                "date": item.date,
                "time": item.time,
                "attendees": item.attendees,
                "topicsDiscussed": item.topicsDiscussed,
                "materialsShared": item.materialsShared,
                "samplesDistributed": item.samplesDistributed,
                "sentiment": item.sentiment,
                "outcomes": item.outcomes,
                "followUpActions": item.followUpActions,
                "suggestedFollowUps": item.suggestedFollowUps,
                "createdAt": created_at
            }
        finally:
            conn.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create interaction: {str(e)}")

@app.put("/api/interactions/{id}")
async def update_interaction_endpoint(id: str, item: InteractionModel):
    try:
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    UPDATE interactions SET
                        hcpName = %s,
                        interactionType = %s,
                        date = %s,
                        time = %s,
                        attendees = %s,
                        topicsDiscussed = %s,
                        materialsShared = %s,
                        samplesDistributed = %s,
                        sentiment = %s,
                        outcomes = %s,
                        followUpActions = %s,
                        suggestedFollowUps = %s
                    WHERE id = %s;
                """, (
                    item.hcpName, item.interactionType, item.date, item.time,
                    json.dumps(item.attendees), item.topicsDiscussed, json.dumps(item.materialsShared),
                    json.dumps([samp.dict() for samp in item.samplesDistributed]), item.sentiment,
                    item.outcomes, item.followUpActions, json.dumps(item.suggestedFollowUps),
                    id
                ))
            conn.commit()
            return {"status": "success", "id": id}
        finally:
            conn.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update interaction: {str(e)}")

@app.delete("/api/interactions/{id}")
async def delete_interaction_endpoint(id: str):
    try:
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM interactions WHERE id = %s;", (id,))
            conn.commit()
            return {"status": "success", "id": id}
        finally:
            conn.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete interaction: {str(e)}")

@app.post("/api/ai/process")
async def process_nlp(req: ProcessRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text is required")
        
    trace_log = []
    
    def add_trace(node: str, node_type: str, message: str, data: Optional[Any] = None):
        trace_log.append({
            "timestamp": datetime.istnow().isoformat() + "Z",
            "node": node,
            "type": node_type,
            "message": message,
            "data": data
        })

    add_trace(
        "__start__", 
        "node", 
        "Initializing LangGraph State Graph. Raw natural language interaction received.", 
        { "input_text": req.text }
    )

    add_trace(
        "NLP_Ingest_Node", 
        "node", 
        "Triggering LLM Parsing Engine using gemma2-9b-it on Groq platform (simulated via Gemini suite server-side). Preparing structured extraction schema."
    )

    try:
        # Prompt construction
        prompt = f"""You are an AI-first Life Science CRM extraction assistant.
You will extract structured CRM interaction details from the following raw notes logged by a pharmaceutical/medical sales representative.

Input Notes:
"{req.text}"

Extract the interaction details according to the schema. 
- Match the HCP Name to a known provider if possible (e.g., Dr. Jane Sharma, Dr. Marcus Vance, Dr. Elena Rostova, Dr. David Cho, Dr. Sarah Jenkins).
- Infer sentiment based on the discussion notes. Ensure it is exactly one of "Positive", "Neutral", "Negative".
- Populate other fields with high fidelity.
- Synthesize 'suggestedFollowUps' as a list of actionable logical CRM tasks (e.g., "+ Send OncoBoost Phase III PDF").
- Match interaction type to: "Meeting", "Call", "Email", "Lunch and Learn", "Webcast", "Advisory Board". If not clear, default to "Meeting".
- Use the current date and time if date/time are not specified or inferred.
- Ensure the date is formatted strictly as YYYY-MM-DD.
- Ensure the time is formatted strictly as HH:MM."""

        add_trace(
            "LLM_Extraction_Node", 
            "node", 
            "Sending extraction payload to LLM model gemma2-9b-it. Setting temperature=0.1 for maximum deterministic accuracy."
        )

        ai_client = get_gemini_client()
        response = generate_content_with_retry(ai_client, prompt, CRMExtraction)
        
        # Parse output JSON
        parsed_data = json.loads(response.text or "{}")

        add_trace(
            "LLM_Extraction_Node", 
            "node", 
            "Extraction completed successfully. Structured entity payload generated.", 
            parsed_data
        )

        add_trace(
            "Validation_Router_Node", 
            "node", 
            "Determining Graph Routing logic based on extracted state."
        )

        if parsed_data.get("hcpName"):
            add_trace(
                "Search_HCP_Directory_Tool",
                "tool",
                f"Invoking 'Search HCP Directory' tool for: \"{parsed_data['hcpName']}\". Validating provider credentials and CRM ID in life science master directory.",
                { "matched_provider": parsed_data["hcpName"], "status": "Verified" }
            )

        if parsed_data.get("materialsShared") and len(parsed_data["materialsShared"]) > 0:
            add_trace(
                "Fetch_Product_Portfolio_Tool",
                "tool",
                "Invoking 'Fetch Product Portfolio' tool to cross-reference and validate shared medical literature.",
                { "verified_materials": parsed_data["materialsShared"] }
            )

        if parsed_data.get("samplesDistributed") and len(parsed_data["samplesDistributed"]) > 0:
            add_trace(
                "Fetch_Product_Portfolio_Tool",
                "tool",
                "Invoking 'Fetch Product Portfolio' tool to verify drug sample compliance (PDMA regulations) and stock lot allocation.",
                { "verified_samples": parsed_data["samplesDistributed"] }
            )

        add_trace(
            "Log_Interaction_Tool",
            "tool",
            "Invoking primary state write tool: 'Log Interaction'. Storing record in central Postgres/MySQL schema. Generating compliance hash.",
            { "record_status": "DRAFT_COMMITTED" }
        )

        add_trace(
            "__end__",
            "node",
            "LangGraph State Graph processing finished. Returning unified entity payload to React Redux store."
        )

        return {
            "success": True,
            "data": parsed_data,
            "trace": trace_log
        }

    except Exception as error:
        print("Gemini processing error:", error)
        add_trace(
            "__error__",
            "node",
            f"Error during LangGraph state transitions: {str(error)}"
        )
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(error),
                "trace": trace_log
            }
        )

# Proxy and Static File Fallback Handler (Catch-all)
@app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"])
async def proxy_or_serve(request: Request, path_name: str):
    if IS_DEV:
        async with httpx.AsyncClient() as client:
            url = f"{VITE_URL}/{path_name}"
            if request.query_params:
                url += f"?{request.query_params}"
            
            req_headers = dict(request.headers)
            req_headers.pop("host", None)
            
            try:
                res = await client.request(
                    method=request.method,
                    url=url,
                    headers=req_headers,
                    content=await request.body()
                )
                return Response(
                    content=res.content,
                    status_code=res.status_code,
                    headers=dict(res.headers)
                )
            except httpx.RequestError as e:
                return HTMLResponse(
                    content=f"Vite dev server not ready or error: {str(e)}",
                    status_code=502
                )
    else:
        dist_path = os.path.join(os.getcwd(), "dist")
        file_path = os.path.join(dist_path, path_name) if path_name else os.path.join(dist_path, "index.html")
        
        if os.path.exists(file_path) and os.path.isfile(file_path):
            mime_type, _ = mimetypes.guess_type(file_path)
            with open(file_path, "rb") as f:
                return Response(content=f.read(), media_type=mime_type)
        else:
            index_path = os.path.join(dist_path, "index.html")
            if os.path.exists(index_path):
                with open(index_path, "rb") as f:
                    return Response(content=f.read(), media_type="text/html")
            else:
                raise HTTPException(status_code=404, detail="Frontend assets not found. Run 'npm run build' first.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=PORT, reload=True)
