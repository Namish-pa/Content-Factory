import uuid
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from models.schemas import CampaignState, CampaignStatus
from db.database import get_db_campaign_state, store_campaign_state
from services.campaign_service import run_campaign_pipeline_bg
from services.export_service import create_export_archive

router = APIRouter(prefix="/campaign", tags=["campaign"])

class StartRequest(BaseModel):
    raw_text: Optional[str] = None
    source_url: Optional[str] = None

class RegenerateRequest(BaseModel):
    channel: str # e.g. "blog", "thread", "email"

@router.post("/start")
async def start_campaign(req: StartRequest, bg_tasks: BackgroundTasks):
    if not req.raw_text and not req.source_url:
        raise HTTPException(status_code=400, detail="Must provide either raw_text or source_url.")
        
    campaign_id = str(uuid.uuid4())
    state = CampaignState(
        campaign_id=campaign_id,
        raw_input=req.raw_text,
        source_url=req.source_url,
        status=CampaignStatus.INIT
    )
    
    await store_campaign_state(state)
    bg_tasks.add_task(run_campaign_pipeline_bg, campaign_id)
    
    return {
        "campaign_id": campaign_id,
        "status": CampaignStatus.INIT.value,
        "message": "Campaign graph launched in background."
    }

@router.get("/{campaign_id}/status")
async def check_status(campaign_id: str):
    record = await get_db_campaign_state(campaign_id)
    if not record:
        raise HTTPException(status_code=404, detail="Campaign not found")
        
    return {
        "status": record.status, 
        "iteration_count": record.iteration_count,
        "error_message": record.error_message
    }

@router.get("/{campaign_id}/result", response_model=CampaignState)
async def get_result(campaign_id: str):
    record = await get_db_campaign_state(campaign_id)
    if not record:
        raise HTTPException(status_code=404, detail="Campaign not found")
        
    return CampaignState(
        campaign_id=record.id,
        raw_input=record.raw_input,
        source_url=record.source_url,
        fact_sheet=record.fact_sheet,
        drafts=record.drafts,
        editor_feedback=record.editor_feedback,
        status=record.status,
        iteration_count=record.iteration_count,
        error_message=record.error_message
    )

@router.get("/{campaign_id}/export")
async def export_campaign(campaign_id: str):
    record = await get_db_campaign_state(campaign_id)
    if not record:
        raise HTTPException(status_code=404, detail="Campaign not found")
        
    state = CampaignState(
        campaign_id=record.id,
        raw_input=record.raw_input,
        source_url=record.source_url,
        fact_sheet=record.fact_sheet,
        drafts=record.drafts,
    )
    
    zip_buffer = create_export_archive(state)
    zip_buffer.seek(0)
    
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename=campaign_{campaign_id}.zip"}
    )
