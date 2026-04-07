# F.A.C.T.S. – Approach Document

## 1. Solution Design
Marketing teams face a systemic bottleneck: manually transforming complex source material into multi-platform marketing assets is expensive, time-consuming, and highly prone to human error and LLM hallucinations. F.A.C.T.S. (Feature Analysis & Content Transformation System) solves this by replacing manual drafting with an autonomous, multi-agent state machine.

Instead of utilizing a monolithic Large Language Model (LLM) loop, we engineered a **Decoupled Multi-Agent State Machine** orchestrated via **LangGraph**. The system runs three highly specialized agents across a Directed Acyclic Graph (DAG):
1. **The Researcher (Data Structuring):** Extracts raw text and structures a clean, factual "Single Source of Truth."
2. **The Copywriter (Generative):** Drafts marketing assets (Blogs, Social Threads, Emails) based *only* on the fact-sheet provided.
3. **The Editor-in-Chief (Zero-Hallucination Gatekeeper):** An independent evaluation node that mathematically cross-references drafts against the fact-sheet. If a hallucination or off-brand statement is detected, it rejects the draft and forces the Copywriter to iterate.

To prevent frontend timeouts during this async iterative process, we decoupled task execution. The backend accepts the upload and fires a background task. As the AI thinks, it publishes its state to **Redis**, which is streamed in real-time via **WebSockets** back to the user's dashboard.

## 2. Tech Stack Choices
Our technology stack was deliberately chosen to maximize performance, cost-efficiency, and developer velocity for a production-grade AI system.

* **Frontend (Next.js 15, React, Vanilla CSS):** Next.js App Router provides optimal performance and smooth routing. We opted for Vanilla CSS to build our custom "Obsidian & Honey Gold" design system from scratch instead of relying on generic templates, giving the WebApp a distinctly premium feel.
* **Backend (FastAPI, Python 3.12):** Chosen for its native asynchronous capabilities and robust integration with Python-based AI orchestration libraries (LangGraph).
* **AI Orchestration (LangGraph & Groq API):** We used LangGraph to maintain cyclic control over the agents. To balance extreme generation speed with heavy reasoning, we integrated a **Tiered LLM Strategy** via Groq:
  * *Llama-3.3-70b-versatile:* Used by the Editor-in-Chief. The 70B parameter model is necessary for complex logic and fact-validation.
  * *Llama-3.1-8b-instant:* Used by the Copywriter. Because the draft is continuously validated by the Editor, we can rely on an ultra-fast 8B model to rapidly generate cyclical drafts, heavily optimizing our API latency.
* **Infrastructure (Vercel, Render, Neon.tech, Upstash):** We utilized a 100% serverless, zero-downtime architecture. Neon.tech (PostgreSQL) handles persistent campaign state using `asyncpg`, while Upstash (Serverless Redis) provides the ultra-low latency Pub/Sub messaging required for our WebSocket streams.

## 3. What We Would Improve With More Time
If given more time to develop F.A.C.T.S., we would prioritize the following enhancements:
1. **RAG (Retrieval-Augmented Generation) Vector Database Integration:** Instead of just uploading a single file per campaign, we would integrate a vector database (like Pinecone) to ingest a brand's entire historical marketing catalog to ensure the Copywriter implicitly adopts the historical brand tone.
2. **Human-in-the-Loop (HITL) Pausing:** Upgrading the LangGraph DAG to pause execution upon the Editor-in-Chief's final approval, pinging the user with a WebSocket notification to read the draft and provide manual feedback before finalizing the state.
3. **Multi-Modal Generation:** Expanding the pipeline to utilize Image generation APIs (e.g. Stable Diffusion) to automatically spool up cover images directly contextualized by the generated blog post.
4. **OAuth User Authentication:** Adding NextAuth and row-level security in PostgreSQL so multiple marketing teams could isolate their specific campaigns in private dashboard environments.
