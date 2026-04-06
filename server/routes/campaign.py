import uuid
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from models.schemas import CampaignState, CampaignStatus
from db.database import get_db_campaign_state, store_campaign_state, list_all_campaigns, delete_campaign, rename_campaign
from services.campaign_service import run_campaign_pipeline_bg
from services.export_service import create_export_archive

router = APIRouter(prefix="/campaign", tags=["campaign"])

class StartRequest(BaseModel):
    raw_text: Optional[str] = None
    source_url: Optional[str] = None

class RegenerateRequest(BaseModel):
    channel: str # e.g. "blog", "thread", "email"

class RenameRequest(BaseModel):
    name: str

@router.get("")
async def get_all_campaigns():
    records = await list_all_campaigns()
    return [
        {
            "id": r.id,
            "name": r.name,
            "status": r.status,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "updated_at": r.updated_at.isoformat() if r.updated_at else None,
            "raw_input_preview": (r.raw_input[:120] + "...") if r.raw_input and len(r.raw_input) > 120 else r.raw_input,
            "error_message": r.error_message,
            "iteration_count": r.iteration_count,
        }
        for r in records
    ]

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

@router.post("/draft")
async def save_draft(req: StartRequest):
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
    
    return {
        "campaign_id": campaign_id,
        "status": CampaignStatus.INIT.value,
        "message": "Draft saved successfully."
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
        name=record.name,
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

@router.delete("/{campaign_id}")
async def delete_campaign_route(campaign_id: str):
    deleted = await delete_campaign(campaign_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return {"message": "Campaign deleted", "campaign_id": campaign_id}

@router.put("/{campaign_id}/rename")
async def rename_campaign_route(campaign_id: str, req: RenameRequest):
    if not req.name.strip():
        raise HTTPException(status_code=400, detail="Name cannot be empty")
    renamed = await rename_campaign(campaign_id, req.name.strip())
    if not renamed:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return {"message": "Campaign renamed", "campaign_id": campaign_id, "name": req.name.strip()}

@router.post("/{campaign_id}/start")
async def start_existing_campaign(campaign_id: str, bg_tasks: BackgroundTasks):
    record = await get_db_campaign_state(campaign_id)
    if not record:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    # Optional: Only allow starting if in INIT or FAILED state
    if record.status not in [CampaignStatus.INIT, CampaignStatus.FAILED]:
        raise HTTPException(status_code=400, detail=f"Campaign is already in {record.status} state")

    bg_tasks.add_task(run_campaign_pipeline_bg, campaign_id)
    
    return {
        "campaign_id": campaign_id,
        "status": record.status,
        "message": "Campaign pipeline started."
    }
