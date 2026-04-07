# F.A.C.T.S. (Feature Analysis & Content Transformation System)

## The Problem
Marketing teams and content creators face the significant challenge of quickly transforming complex raw source material into high-quality, multi-channel campaigns without hallucinating facts or losing brand consistency. Manual drafting, fact-checking, and iterative editing across various platforms is highly time-consuming, expensive, and alarmingly prone to systemic human error.

## The Solution
**F.A.C.T.S.** is an autonomous, enterprise-level pipeline powered by a multi-agent orchestrated state machine that ingests source material to generate fully verified marketing campaigns. Our approach solves manual bottlenecks by isolating generation into specialized agent logic (Researcher, Copywriter, and Editor), establishing a cyclical, zero-hallucination feedback loop that evaluates all outputs mathematically against an extracted "Single Source of Truth."

Key features include:
* **Multi-Agent Orchestration**: LangGraph Directed Acyclic Graph (DAG) for isolated task execution.
* **Tiered Model Inference**: Highly complex semantic tasks route to `llama-3.3-70b-versatile`, while cyclical generative tasks route to `llama-3.1-8b-instant`.
* **Real-time Pipeline Telemetry**: WebSockets stream node transitions and execution logs live to the Next.js visualizer dashboard.
* **Granular Analytics**: Records and visualizes global LLM token consumption synchronized to Indian Standard Time (IST).

## Screenshots

<p align="center">
  <img src="client/public/screenshot-home.png" alt="Home Page" width="800"/>
  <br/>
  <em>Home Page</em>
</p>

<p align="center">
  <img src="client/public/screenshot-new-campaign.png" alt="New Campaign" width="800"/>
  <br/>
  <em>New Campaign Configuration</em>
</p>

<p align="center">
  <img src="client/public/screenshot-dashboard.png" alt="Dashboard" width="800"/>
  <br/>
  <em>Live Telemetry Dashboard</em>
</p>

<p align="center">
  <img src="client/public/screenshot-campaign.png" alt="Campaign Details" width="800"/>
  <br/>
  <em>Individual Campaign Details</em>
</p>

## Tech Stack
* **Programming languages:** Python 3.12+, TypeScript, JavaScript, HTML, CSS
* **Frameworks:** React, Next.js 15+ App Router, FastAPI
* **Databases:** PostgreSQL (with SQLAlchemy 2.0 & asyncpg), Redis (for Pub-Sub architecture)
* **APIs or third-party tools:** LangGraph (Stateful workflow), Groq API (Inference Engine), WebSockets

## Setup Instructions

### Prerequisites
Ensure Python 3.12+, Node.js 20+, PostgreSQL, and Redis are installed on your system.

### Backend Setup (`/server`)
Navigate to the `/server` directory to configure the core pipeline:

1. Create a `.env` file with your credentials:
   ```env
   DATABASE_URL=postgresql+asyncpg://user:password@localhost/dbname
   REDIS_URL=redis://localhost:6379/0
   GROQ_API_KEY=your_groq_api_key
   GROQ_PRO_MODEL=llama-3.3-70b-versatile
   GROQ_FLASH_MODEL=llama-3.1-8b-instant
   ```
2. Install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Run the project locally:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup (`/client`)
Open a new terminal tab and navigate to the `/client` directory:

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the project locally:
   ```bash
   npm run dev
   ```
The dashboard interface will now be available at `http://localhost:3000`.
