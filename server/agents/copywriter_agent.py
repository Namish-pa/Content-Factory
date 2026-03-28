import asyncio
import structlog
import google.generativeai as genai
from typing import Dict, Any, List
from tenacity import retry, wait_exponential, stop_after_attempt
from config import settings
from models.schemas import FactSheet, ContentDrafts, EditorFeedback

logger = structlog.get_logger(__name__)

class CopywriterAgent:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel(settings.GEMINI_FLASH_MODEL)

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=5))
    async def generate_blog(self, facts_json: str, feedback: str = "") -> str:
        prompt = f"""
        Write a professional blog post (~500 words) using ONLY these facts:
        {facts_json}
        
        The value proposition MUST be the hero of the post.
        {f"CRITICAL EDITOR FEEDBACK TO ADDRESS: {feedback}" if feedback else ""}
        """
        res = await self.model.generate_content_async(
            prompt,
            generation_config=genai.GenerationConfig(temperature=0.7)
        )
        return res.text

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=5))
    async def generate_thread(self, facts_json: str, feedback: str = "") -> List[str]:
        prompt = f"""
        Write a punchy social media thread (max 5 posts, 280 chars each) using ONLY these facts:
        {facts_json}
        
        The value proposition MUST be the hero of the post.
        {f"CRITICAL EDITOR FEEDBACK TO ADDRESS: {feedback}" if feedback else ""}
        
        Format your response simply as lines starting with "1.", "2.", etc.
        """
        res = await self.model.generate_content_async(
            prompt,
            generation_config=genai.GenerationConfig(temperature=0.9)
        )
        
        # Parse output into array
        lines = [line.strip() for line in res.text.split("\n") if line.strip() and line[0].isdigit()]
        # Fallback if generation didn't follow numbered list
        if not lines:
            lines = [p.strip() for p in res.text.split("\n\n") if p.strip()][:5]
            
        return lines

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=5))
    async def generate_email(self, facts_json: str, feedback: str = "") -> str:
        prompt = f"""
        Write a friendly email teaser (max 100 words, 1 paragraph) using ONLY these facts:
        {facts_json}
        
        The value proposition MUST be the hero of the post.
        {f"CRITICAL EDITOR FEEDBACK TO ADDRESS: {feedback}" if feedback else ""}
        """
        res = await self.model.generate_content_async(
            prompt,
            generation_config=genai.GenerationConfig(temperature=0.6)
        )
        return res.text

    async def run(self, state_dict: dict) -> dict:
        logger.info("Copywriter Agents generating in parallel...")
        fact_sheet: FactSheet = state_dict.get("fact_sheet")
        if not fact_sheet:
            raise ValueError("FactSheet not found in state.")
            
        facts_json = fact_sheet.model_dump_json(indent=2)
        editor_feedbacks: Dict[str, EditorFeedback] = state_dict.get("editor_feedback", {})
        
        # Extract specific feedback if any
        blog_fe = editor_feedbacks.get("blog").correction_note if editor_feedbacks.get("blog") and editor_feedbacks["blog"].status == "REJECTED" else ""
        thread_fe = editor_feedbacks.get("thread").correction_note if editor_feedbacks.get("thread") and editor_feedbacks["thread"].status == "REJECTED" else ""
        email_fe = editor_feedbacks.get("email").correction_note if editor_feedbacks.get("email") and editor_feedbacks["email"].status == "REJECTED" else ""

        # Check existing drafts if we are iterating
        existing_drafts = state_dict.get("drafts")
        blog_task, thread_task, email_task = None, None, None
        
        # Only rewrite rejected portions (or all if first run)
        tasks = []
        if not existing_drafts or not editor_feedbacks.get("blog") or blog_fe:
            blog_task = self.generate_blog(facts_json, blog_fe)
        
        if not existing_drafts or not editor_feedbacks.get("thread") or thread_fe:
            thread_task = self.generate_thread(facts_json, thread_fe)
            
        if not existing_drafts or not editor_feedbacks.get("email") or email_fe:
            email_task = self.generate_email(facts_json, email_fe)

        # Await concurrently
        results = await asyncio.gather(
            blog_task if blog_task else self._return_existing(existing_drafts.blog),
            thread_task if thread_task else self._return_existing(existing_drafts.thread),
            email_task if email_task else self._return_existing(existing_drafts.email)
        )
        
        new_drafts = ContentDrafts(
            blog=results[0],
            thread=results[1],
            email=results[2]
        )
        
        state_dict["drafts"] = new_drafts
        return state_dict
        
    async def _return_existing(self, data):
        return data
