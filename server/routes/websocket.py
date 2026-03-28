from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import structlog
from db.redis_client import subscribe_to_campaign

logger = structlog.get_logger(__name__)
router = APIRouter(tags=["websocket"])

@router.websocket("/ws/{campaign_id}")
async def websocket_endpoint(websocket: WebSocket, campaign_id: str):
    await websocket.accept()
    logger.info(f"[{campaign_id}] WS Client connected.")
    
    pubsub = await subscribe_to_campaign(campaign_id)
    
    try:
        while True:
            # Poll for new messages from Redis pub/sub
            message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
            if message:
                await websocket.send_text(message["data"])
            else:
                # To prevent CPU pegging in async block
                await asyncio.sleep(0.5)
                
    except WebSocketDisconnect:
        logger.info(f"[{campaign_id}] WS Client disconnected.")
    except Exception as e:
        logger.error(f"[{campaign_id}] WS Client error: {str(e)}")
    finally:
        await pubsub.unsubscribe()
