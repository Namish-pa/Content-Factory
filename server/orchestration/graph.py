from langgraph.graph import StateGraph, END
from langgraph.graph.state import CompiledStateGraph
import structlog

from orchestration.nodes import (
    GraphState,
    ingest_node,
    fact_extraction_node,
    copywriter_node,
    editor_node
)
from db.redis_client import publish_event
from db.database import store_campaign_state
from models.schemas import WSEvent, CampaignState, CampaignStatus
from config import settings

logger = structlog.get_logger(__name__)

async def routing_decision(state: dict) -> str:
    """Decision node for the end of the Editor stage."""
    # Ensure feedback and drafts existed
    if not state.get("editor_feedback") or not state.get("drafts"):
        return "FAILED"
    
    # State string gets set in the Editor logic
    if state["status"] == "APPROVED":
        return "EXPORT" # End state or special export prep node
        
    if state["iteration_count"] >= settings.MAX_EDITOR_ITERATIONS:
        # FAILED due to too many iterations
        return "FAILED"
        
    return "COPYWRITER"


def build_graph() -> CompiledStateGraph:
    workflow = StateGraph(GraphState)

    # Add Nodes
    workflow.add_node("INGEST", ingest_node)
    workflow.add_node("FACT_EXTRACTION", fact_extraction_node)
    workflow.add_node("COPYWRITER", copywriter_node)
    workflow.add_node("EDITOR", editor_node)

    # Edge Definitions
    workflow.set_entry_point("INGEST")
    workflow.add_edge("INGEST", "FACT_EXTRACTION")
    workflow.add_edge("FACT_EXTRACTION", "COPYWRITER")
    workflow.add_edge("COPYWRITER", "EDITOR")
    
    # Conditional Edges from EDITOR
    workflow.add_conditional_edges(
        "EDITOR",
        routing_decision,
        {
            "COPYWRITER": "COPYWRITER",
            "FAILED": END,
            "EXPORT": END
        }
    )

    return workflow.compile()

# Singleton graph instance
campaign_graph = build_graph()
