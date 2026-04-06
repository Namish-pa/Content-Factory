# 🏭 Autonomous Content Factory

**Deploy AI-driven fact-checked, brand-faithful blog posts, emails, and social threads in seconds.**

The Autonomous Content Factory is a high-performance, enterprise-grade content generation pipeline. It uses a multi-agent orchestration system to ingest source material, verify claims against real-world data, and craft production-ready content that adheres to strict brand guidelines.

---

## ⚡ Tech Stack

### Frontend
- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Styling**: Vanilla CSS (Tailored Design System)
- **Typography**: [Outfit](https://fonts.google.com/specimen/Outfit) (Geometric Sans-Serif)
- **Theme**: "Frosted Autumn" (Sophisticated Charcoal & Honey Gold palette)

### Backend
- **API**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.12+)
- **Orchestration**: [LangGraph](https://www.langchain.com/langgraph) (Stateful multi-agent workflows)
- **LLMs**: [Groq](https://groq.com/) (Llama 3.3 70B & Llama 3.1 8B)
- **Database**: PostgreSQL (with [SQLAlchemy 2.0](https://www.sqlalchemy.org/) + `asyncpg`)
- **Real-time**: WebSockets for live pipeline tracking
- **Cache/Pub-Sub**: Redis (Default port: 6379)

---

## 🚀 Key Features

- **Multi-Agent Pipeline**: 
    - 📥 **Ingestion Agent**: Extracts and synthesizes source documents.
    - ⚖️ **Fact-Check Agent**: Validates claims and ensures accuracy.
    - ✍️ **Copywriter Agent**: Generates creative drafts based on core data.
    - 🎨 **Editor Agent**: Refines tone, style, and brand alignment.
- **Campaign Management**: Save drafts, track active processing, and manage historical campaigns.
- **Live Processing UI**: A real-time, event-driven stepper UI that visualizes exactly what the AI is doing at every stage.
- **Enterprise Design**: A premium, "obsidian-style" dark interface designed for clarity and focus.

---

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.12+
- Node.js 20+
- PostgreSQL
- Redis

### Backend Setup (`/server`)
1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure environment variables in `.env`:
   ```env
   DATABASE_URL=postgresql+asyncpg://user:password@localhost/dbname
   REDIS_URL=redis://localhost:6379
   GROQ_API_KEY=your_groq_api_key
   GROQ_PRO_MODEL=llama-3.3-70b-versatile
   GROQ_FLASH_MODEL=llama-3.1-8b-instant
   ```
4. Run the server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup (`/client`)
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```

---

## 🖋️ Design System: "Frosted Autumn"

The platform uses a custom-built design system focused on sophisticated, low-fatigue aesthetics:
- **Primary Background**: `#3D353C` (Charcoal Purple)
- **Accent Color**: `#EBB464` (Honey Gold)
- **Typography**: **Outfit** (Extra Bold headings, clean Inter body text)
- **Visuals**: Modern glassmorphism, subtle micro-animations, and tight negative letter-spacing for an authoritative feel.

---

## 📝 License
Proprietary. High-performance content orchestration for the modern enterprise.
