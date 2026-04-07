from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import structlog

from config import settings
from db.database import init_db
from routes import campaign, websocket

logger = structlog.get_logger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing F.A.C.T.S DB...")
    await init_db()
    yield
    # Shutdown
    logger.info("Shutting down F.A.C.T.S...")

app = FastAPI(
    title="F.A.C.T.S",
    description="LangGraph orchestrated pipeline for content generation.",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(campaign.router)
app.include_router(websocket.router)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "F.A.C.T.S Server Running"}

