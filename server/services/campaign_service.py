import structlog
from typing import Optional
from orchestration.graph import campaign_graph
from models.schemas import CampaignState, CampaignStatus, WSEvent
from db.database import store_campaign_state, get_db_campaign_state
from db.redis_client import publish_event

logger = structlog.get_logger(__name__)

async def run_campaign_pipeline_bg(campaign_id: str):
    """Entrypoint to run the built LangGraph."""
    logger.info(f"[{campaign_id}] Starting LangGraph Execution")
    
    db_state = await get_db_campaign_state(campaign_id)
    if not db_state:
        logger.error(f"Campaign {campaign_id} not found in DB before orchestration.")
        return
        
    initial_state = {
        "campaign_id": campaign_id,
        "raw_input": db_state.raw_input,
        "source_url": db_state.source_url,
        "status": CampaignStatus.INIT.value,
        "iteration_count": 0,
        "fact_sheet": None,
        "drafts": None,
        "editor_feedback": {},
        "error_message": "",
    }
    
    try:
        # Using astream internally to await final result but wait for intermediate prints
        async for output in campaign_graph.astream(initial_state):
            # output contains the return value of the nodes dict {"node_name": state}
            pass
            
        logger.info(f"[{campaign_id}] LangGraph execution completed successfully.")
        
        # Publish final success event (the nodes have handled the intermediate states DB syncing)
        final_state_db = await get_db_campaign_state(campaign_id)
        if final_state_db and final_state_db.status == CampaignStatus.APPROVED:
            await publish_event(WSEvent(
                type="COMPLETE", 
                campaign_id=campaign_id,
                message="Campaign approved and completed successfully."
            ))
            
    except Exception as e:
        logger.error(f"[{campaign_id}] Graph execution failed: {str(e)}", exc_info=True)
        # Fallback error trap outside of node logic
        
        err_state = CampaignState(
            campaign_id=campaign_id,
            status=CampaignStatus.FAILED,
            error_message=str(e),
            raw_input=db_state.raw_input
        )
        await store_campaign_state(err_state)
        await publish_event(WSEvent(
            type="ERROR",
            campaign_id=campaign_id,
            message=str(e)
        ))
