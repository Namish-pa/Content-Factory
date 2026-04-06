import json
from datetime import datetime
from typing import Optional, Dict, Any

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base, Mapped, mapped_column
from sqlalchemy import String, Integer, DateTime, Enum as SAEnum, select
from sqlalchemy.dialects.postgresql import JSONB

from config import settings
from models.schemas import CampaignStatus, CampaignState

Base = declarative_base()

class CampaignRecord(Base):
    __tablename__ = "campaigns"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    raw_input: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    source_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    fact_sheet: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    drafts: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    editor_feedback: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    
    status: Mapped[CampaignStatus] = mapped_column(SAEnum(CampaignStatus), default=CampaignStatus.INIT)
    iteration_count: Mapped[int] = mapped_column(Integer, default=0)
    error_message: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def store_campaign_state(state: CampaignState):
    async with AsyncSessionLocal() as session:
        async with session.begin():
            record = await session.get(CampaignRecord, state.campaign_id)
            if not record:
                record = CampaignRecord(id=state.campaign_id)
                session.add(record)
            
            record.raw_input = state.raw_input
            record.source_url = state.source_url
            record.fact_sheet = state.fact_sheet.model_dump() if state.fact_sheet else None
            record.drafts = state.drafts.model_dump() if state.drafts else None
            record.editor_feedback = {k: v.model_dump() if v else None for k, v in state.editor_feedback.items()} if state.editor_feedback else None
            record.status = state.status
            record.iteration_count = state.iteration_count
            record.error_message = state.error_message
            record.updated_at = datetime.utcnow()
            
async def get_db_campaign_state(campaign_id: str) -> Optional[CampaignRecord]:
    async with AsyncSessionLocal() as session:
        return await session.get(CampaignRecord, campaign_id)

async def list_all_campaigns() -> list[CampaignRecord]:
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(CampaignRecord).order_by(CampaignRecord.created_at.desc())
        )
        return list(result.scalars().all())

async def delete_campaign(campaign_id: str) -> bool:
    async with AsyncSessionLocal() as session:
        async with session.begin():
            record = await session.get(CampaignRecord, campaign_id)
            if not record:
                return False
            await session.delete(record)
            return True
