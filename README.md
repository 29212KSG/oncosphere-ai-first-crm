# Life Sciences CRM & AI Assistant

A modern, full-stack CRM application customized for life sciences and pharmaceutical sales representatives. The application combines a high-fidelity **React frontend** (utilizing Redux and Tailwind CSS) with a highly optimized **FastAPI backend** and a robust **MySQL / MariaDB database** storage engine. By leveraging the **Gemini API**, the CRM automates transcription, extracts complex meeting summaries, and parses key operational metrics in real-time.

---

## 🚀 Key Features

*   **Durable MySQL / MariaDB Storage**: Complete local persistence of Healthcare Professionals (HCPs), shared clinical materials, distributed samples, and rich interaction histories. No mock data—every interaction is logged and managed in real-time.
*   **AI-Powered NLP Extraction**: Uses Gemini to analyze unstructured narrative logs or spoken audio transcripts, automatically identifying:
    *   Target Healthcare Professional (HCP)
    *   Attendees (representatives, medical staff, etc.)
    *   Specific topics discussed
    *   Clinical materials shared (e.g., NEJM Phase III trials)
    *   Physical sample inventory distributed (with quantities)
    *   Interaction sentiment and key next steps
*   **Automated Schema Management**: The backend automatically initializes the MySQL database schema and seeds default HCP, material, sample, and historical interaction records on its very first startup.
*   **Intuitive Representative Dashboard**: Interactive interfaces to log new visits, edit historical interactions, filter and browse detailed activity lists, and explore actionable AI-suggested follow-ups.

---

## 🛠️ Technology Stack

### Frontend
*   **React 19** with **TypeScript**
*   **Redux Toolkit** (Global state management & interaction synchronization)
*   **Tailwind CSS v4** (Modern utility-first styling with smooth visual transitions)
*   **Motion** (Elegant entry/hover animations and fluid transitions)
*   **Lucide React** (Consistent, high-quality icon set)
*   **Vite** (Next-generation frontend toolchain)

### Backend
*   **FastAPI (Python 3)** (High-performance asynchronous web server)
*   **Uvicorn** (Asynchronous ASGI server implementation)
*   **PyMySQL** (Pure-Python MySQL database client library)
*   **Google GenAI SDK** (Server-side Gemini client for structured JSON extractions)

### Database
*   **MariaDB / MySQL** (Relational storage with relational constraints and tables)

---

## ⚙️ Architecture & Setup

The application employs a full-stack unified runtime architecture where the Python backend proxy-services or direct-serves frontend static assets under a unified origin on port `3000`.

### Database Tables & Schema
On boot, the backend automatically establishes:
1.  `hcps`: Healthcare Professional registers (ID, name, specialty, institution).
2.  `materials`: Registered scientific or marketing brochures.
3.  `samples`: Managed physical drug starter pack samples.
4.  `interactions`: Logged meeting summaries, metadata, sentiment, and structured JSON fields.

---

## 🏃 Getting Started & How to Run

Follow these instructions to set up and run the application locally.

### 1. Prerequisites
Ensure you have the following installed on your machine:
*   **Node.js** (v18 or higher)
*   **Python 3.10+** (with `pip` package manager)
*   **MariaDB / MySQL Server**

### 2. Configure Environment Variables
Create a `.env` file in the root directory (based on `.env.example`):
```bash
cp .env.example .env
```
Open `.env` and configure your API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 3. Database Server Configuration
Ensure your local MariaDB or MySQL database service is running:
```bash
# On Linux / Debian systems:
sudo service mariadb start
```
The application connects to MySQL using a default root configuration (`host: localhost`, `user: root`, `password: ""` / passwordless).
*   If your local database setup has custom credentials, you can adjust the connection config within the `get_db_connection` function in `server.py`.

### 4. Install Dependencies

#### Python (Backend) Dependencies
Install the required Python packages:
```bash
pip install fastapi uvicorn pymysql httpx google-genai pydantic
```

#### Node.js (Frontend) Dependencies
Install the required frontend modules:
```bash
npm install
```

### 5. Running the Application

#### Development Mode
Start the joint development environment which boots both the Vite frontend server (on port `5173`) and the FastAPI backend server (on port `3000`):
```bash
npm run dev
```
Once started, open your web browser and navigate to: **`http://localhost:3000`**

#### Production Build & Execution
To compile the frontend client into optimized static assets and launch the production FastAPI server:
```bash
# Compile the React frontend
npm run build

# Start the unified backend server
npm run start
```

---

## 📁 File Structure

```text
├── server.py              # FastAPI Python backend (Database initialization, endpoints, & Gemini API)
├── src/
│   ├── App.tsx            # Main React layout and life-cycle hook (Fetches database state)
│   ├── main.tsx           # Entry point rendering the application within the Redux provider
│   ├── reduxStore.ts      # Redux slice, state schemas, and reducers for interactions and static registers
│   ├── index.css          # Global Tailwind CSS directives and theme fonts
│   └── components/
│       ├── Header.tsx                 # Application top navigation and header brand banner
│       ├── InteractionForm.tsx        # High-fidelity form to add or edit visits (supports Voice Dictation UI)
│       ├── LoggedInteractionsList.tsx # Searchable and detailed grid list of historical database logs
│       └── AIAssistant.tsx            # Floating AI Copilot for drafting logs and querying database stats
├── metadata.json          # Application configuration metadata
├── package.json           # Frontend dependencies, linting, and build pipeline definitions
└── tsconfig.json          # TypeScript project configuration rules
```

---

## 🔒 Security Best Practices
*   **Server-Side Credentials**: All communications with the Gemini API are handled exclusively on the server side (`server.py`). The `GEMINI_API_KEY` is never exposed, queried, or shipped to the client browser.
*   **SQL Parameterization**: All SQL queries executing transactions against the MySQL database utilize explicit parameterization (`%s`) to completely prevent SQL injection vectors.
