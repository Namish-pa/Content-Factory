from typing import Dict, Any, TypedDict
import structlog
from db.database import store_campaign_state
from db.redis_client import publish_event, cache_campaign_state
from models.schemas import CampaignState, WSEvent, CampaignStatus
from agents.fact_check_agent import FactCheckAgent
from agents.copywriter_agent import CopywriterAgent
from agents.editor_agent import EditorAgent

logger = structlog.get_logger(__name__)

# State shape injected into nodes
class GraphState(TypedDict):
    campaign_id: str
    raw_input: str
    source_url: str
    fact_sheet: Any
    drafts: Any
    editor_feedback: Dict[str, Any]
    status: str
    iteration_count: int
    error_message: str

async def _sync_state_to_db_and_ws(state: dict, agent: str, ws_type: str, status_enum: CampaignStatus):
    campaign_id = state["campaign_id"]
    state["status"] = status_enum.value
    
    # Parse back into Pydantic CampaignState for storage/caching
    cstate = CampaignState(**state)
    await store_campaign_state(cstate)
    await cache_campaign_state(cstate)
    
    # Fire WS Event
    ws_event = WSEvent(
        type=ws_type,
        campaign_id=campaign_id,
        agent=agent,
        status="DONE" if ws_type == "AGENT_STATUS" else None,
        data={"iteration": cstate.iteration_count} if ws_type == "EDITOR_FEEDBACK" else None
    )
    if ws_type == "CAMPAIGN_STATUS":
        ws_event.status = status_enum.value
        
    await publish_event(ws_event)

async def ingest_node(state: dict):
    logger.info(f"[{state['campaign_id']}] INGESTING")
    
    await publish_event(WSEvent(
        type="AGENT_STATUS", campaign_id=state["campaign_id"], agent="Ingestion", status="THINKING"
    ))
    
    state["iteration_count"] = 0
    await _sync_state_to_db_and_ws(state, "Ingestion", "CAMPAIGN_STATUS", CampaignStatus.INGESTING)
    return state

async def fact_extraction_node(state: dict):
    logger.info(f"[{state['campaign_id']}] FACT_EXTRACTION")
    
    await publish_event(WSEvent(type="AGENT_STATUS", campaign_id=state["campaign_id"], agent="FactCheck", status="THINKING"))
    
    agent = FactCheckAgent()
    state = await agent.run(state)
    
    await _sync_state_to_db_and_ws(state, "FactCheck", "AGENT_STATUS", CampaignStatus.EXTRACTING)
    return state

async def copywriter_node(state: dict):
    logger.info(f"[{state['campaign_id']}] COPYWRITING")
    
    await publish_event(WSEvent(type="AGENT_STATUS", campaign_id=state["campaign_id"], agent="Copywriter", status="WRITING"))
    
    agent = CopywriterAgent()
    state = await agent.run(state)
    
    await _sync_state_to_db_and_ws(state, "Copywriter", "DRAFT_UPDATE", CampaignStatus.GENERATING)
    return state

async def editor_node(state: dict):
    logger.info(f"[{state['campaign_id']}] EDITING")
    
    await publish_event(WSEvent(type="AGENT_STATUS", campaign_id=state["campaign_id"], agent="Editor", status="REVIEWING"))
    
    agent = EditorAgent()
    state = await agent.run(state)
    
    status_enum = CampaignStatus.APPROVED if state["status"] == "APPROVED" else CampaignStatus.REVIEWING
    await _sync_state_to_db_and_ws(state, "Editor", "EDITOR_FEEDBACK", status_enum)
    return state
