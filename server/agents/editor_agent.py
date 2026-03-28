import json
import structlog
import google.generativeai as genai
from typing import Dict, Any, List
from tenacity import retry, wait_exponential, stop_after_attempt
from config import settings
from models.schemas import FactSheet, ContentDrafts, EditorFeedback

logger = structlog.get_logger(__name__)

class EditorAgent:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel(settings.GEMINI_FLASH_MODEL)

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=5))
    async def evaluate_draft(self, channel: str, draft: str, facts_json: str, iteration: int) -> EditorFeedback:
        system_rules = f"""
        You are the Editor-in-Chief. Check this {channel} draft strictly against the facts.
        
        Validation Steps:
        1. Hallucination: Are there facts not present in the FactSheet?
        2. Tone: Check constraints and flag overly robotic/salesy text.
        3. Length:
           - Blog: Target ~500 words.
           - Thread: Max 5 posts, 280 chars each.
           - Email: Max 100 words, 1 paragraph.
        4. Value Prop: Ensure the value proposition acts as the hero.
        
        Output strictly as JSON matching EditorFeedback schema.
        """
        
        prompt = f"{system_rules}\n\nFactSheet:\n{facts_json}\n\nDraft:\n{draft}"
        
        response = await self.model.generate_content_async(
            prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.0, # strict evaluator
                response_mime_type="application/json",
                response_schema=EditorFeedback
            )
        )
        
        data = json.loads(response.text)
        data["iteration"] = iteration
        return EditorFeedback(**data)

    async def run(self, state_dict: dict) -> dict:
        logger.info("Editor Agent evaluating drafts...")
        fact_sheet: FactSheet = state_dict.get("fact_sheet")
        drafts: ContentDrafts = state_dict.get("drafts")
        iteration_count = state_dict.get("iteration_count", 0) + 1
        
        if not fact_sheet or not drafts:
            raise ValueError("Missing state data for Editor Agent.")

        facts_json = fact_sheet.model_dump_json(indent=2)
        
        # Evaluate all drafts in sequence or parallel (doing sequentially for simplicity of tracking)
        fb_blog = await self.evaluate_draft("blog", drafts.blog, facts_json, iteration_count)
        fb_thread = await self.evaluate_draft("thread", str(drafts.thread), facts_json, iteration_count)
        fb_email = await self.evaluate_draft("email", drafts.email, facts_json, iteration_count)
        
        feedbacks = {
            "blog": fb_blog,
            "thread": fb_thread,
            "email": fb_email
        }
        
        state_dict["editor_feedback"] = feedbacks
        state_dict["iteration_count"] = iteration_count
        
        # Decide next status based on editor decision
        all_approved = all(fb.status == "APPROVED" for fb in feedbacks.values())
        if all_approved:
            state_dict["status"] = "APPROVED"
        else:
            state_dict["status"] = "REVIEWING" # Pending rewrite

        return state_dict
