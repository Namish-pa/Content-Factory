import json
import redis.asyncio as redis
from config import settings
from models.schemas import CampaignState, WSEvent

redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

async def publish_event(event: WSEvent):
    channel = f"campaign:{event.campaign_id}:events"
    await redis_client.publish(channel, event.model_dump_json())

async def subscribe_to_campaign(campaign_id: str) -> redis.client.PubSub:
    channel = f"campaign:{campaign_id}:events"
    pubsub = redis_client.pubsub()
    await pubsub.subscribe(channel)
    return pubsub

async def cache_campaign_state(state: CampaignState):
    key = f"campaign:{state.campaign_id}:state"
    await redis_client.set(key, state.model_dump_json(), ex=3600)  # 1 hour TTL

async def get_cached_campaign_state(campaign_id: str) -> CampaignState | None:
    key = f"campaign:{campaign_id}:state"
    data = await redis_client.get(key)
    if data:
        state_dict = json.loads(data)
        return CampaignState(**state_dict)
    return None
