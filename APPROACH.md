# F.A.C.T.S. - Technical Approach & Architecture

## System Overview
F.A.C.T.S. (Feature Analysis & Content Transformation System) is built to solve a critical bottleneck in modern marketing: the manual translation of highly technical or dense documentation into engaging, multi-platform campaigns without introducing AI hallucination.

Instead of utilizing a monolithic Large Language Model (LLM) loop, we engineered a **Decoupled Multi-Agent State Machine**. This allows for iterative generation, specialized node routing, and algorithmic fact-checking.

## The Architecture (LangGraph Directed Acyclic Graph)
The intelligence layer of the backend is orchestrated using **LangGraph**. We defined three highly specialized agents acting across distinct nodes in a graph:

1. **The Researcher (Data Structuring):** Extracts the raw textual payload and structures a clean, factual "Single Source of Truth."
2. **The Copywriter (Generative):** Drafts the marketing assets (Blog Post, Social Thread, Marketing Email) based *only* on the fact-sheet provided.
3. **The Editor-in-Chief (Zero-Hallucination Gatekeeper):** An independent evaluation node. It mathematically cross-references the Copywriter's drafts against the Researcher's fact-sheet. If a hallucination or off-brand statement is detected, it rejects the draft and forces the Copywriter node to iterate.

### Tiered Inference Routing (Groq)
To balance extreme generation speed with heavy reasoning capabilities, we integrated a **Tiered LLM Strategy** via the Groq Inference API:
* **Llama-3.3-70b-versatile:** Utilized by the Editor-in-Chief. The 70B parameter model is necessary for complex logic, fact-validation, and nuanced critique.
* **Llama-3.1-8b-instant:** Utilized by the Copywriter. Because the draft is continuously validated by the Editor, we can rely on an ultra-fast 8B parameter model to rapidly generate cyclical drafts, heavily optimizing our API latency.

## Real-Time Asynchronous Delivery
Because the multi-agent graph runs iteratively, traditional HTTP request-response cycles would result in server timeouts (504s). 

To solve this, we decoupled the task execution:
1. **FastAPI (REST):** Accepts the document upload and fires a background task. 
2. **Serverless Redis (Upstash):** As the AI thinks, it publishes its internal logging states and drafts into Redis pub/sub channels.
3. **WebSockets:** The Next.js frontend subscribes to the WebSocket endpoint, streaming the AI's "thought process" in real-time to the user's dashboard, creating an engaging, transparent user experience.

## Infrastructure Stack
* **Frontend:** Next.js 15, React, Vanilla CSS. Deployed on **Vercel**.
* **Backend:** Python 3.12, FastAPI, LangGraph. Deployed on **Render**.
* **Databases:** PostgreSQL via `asyncpg` on **Neon.tech** (Persistence), Redis on **Upstash** (Messaging).
