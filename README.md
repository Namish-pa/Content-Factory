# Autonomous Content Factory

## The Problem
Marketing teams and content creators often struggle to quickly transform raw source material into high-quality, multi-channel campaigns without hallucinating facts or losing brand voice. Manual drafting, fact-checking, and iterative editing across various formats (blogs, social threads, emails) is highly time-consuming, expensive, and prone to human error or inconsistencies. 

## The Solution
The Autonomous Content Factory solves this by providing a high-performance, enterprise-grade content generation pipeline powered by a multi-agent orchestration system. It ingests source material, uses targeted AI agents to verify claims against real-world data, and dynamically crafts production-ready content formatted for distinct channels like blogs, email teasers, and social platforms. Featuring a high-fidelity real-time dashboard and robust Editor-in-Chief rejection loops, the system ensures verifiable accuracy and strict adherence to brand tone before the content ever reaches a human.

## Tech Stack
* **Programming Languages:** Python 3.12+, TypeScript, JavaScript, HTML, CSS
* **Frameworks:** FastAPI (Backend), Next.js 15+ App Router (Frontend), React
* **Databases:** PostgreSQL (with SQLAlchemy 2.0 & asyncpg), Redis (for Pub-Sub and Caching)
* **APIs and Third-Party Tools:** LangGraph (Stateful multi-agent workflows), Groq API (Llama 3.3 70B & Llama 3.1 8B), WebSockets

## Setup Instructions

### Prerequisites
Make sure you have Python 3.12+, Node.js 20+, PostgreSQL, and Redis installed and running on your system.

### 1. Backend Setup (`/server`)
Navigate to the `/server` directory to configure the AI and API services:

1. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
3. **Configure environment variables:**
   Create a `.env` file in the `/server` directory and add the following keys:
   ```env
   DATABASE_URL=postgresql+asyncpg://user:password@localhost/dbname
   REDIS_URL=redis://localhost:6379/0
   GROQ_API_KEY=your_groq_api_key
   GROQ_PRO_MODEL=llama-3.3-70b-versatile
   GROQ_FLASH_MODEL=llama-3.1-8b-instant
   ```
4. **Run the backend locally:**
   ```bash
   uvicorn main:app --reload
   ```

### 2. Frontend Setup (`/client`)
Open a new terminal tab and navigate to the `/client` directory to run the Next.js UI:

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Run the frontend locally:**
   ```bash
   npm run dev
   ```
The user interface will now be available at `http://localhost:3000`.
