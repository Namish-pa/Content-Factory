import asyncio
import structlog
import bleach
from groq import AsyncGroq
from typing import Dict, Any, List
from tenacity import retry, wait_exponential, stop_after_attempt
from config import settings
from models.schemas import FactSheet, ContentDrafts, EditorFeedback

logger = structlog.get_logger(__name__)

class CopywriterAgent:
    def __init__(self):
        self.client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        self.model = settings.GROQ_FLASH_MODEL

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=2, min=5, max=60))
    async def generate_blog(self, facts_json: str, feedback: str = "") -> str:
        prompt = f"""Write a professional blog post (~500 words) using ONLY these facts:
{facts_json}

The value proposition MUST be the hero of the post.
{f"CRITICAL EDITOR FEEDBACK TO ADDRESS: {feedback}" if feedback else ""}"""

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )
        raw_output = response.choices[0].message.content
        return bleach.clean(raw_output)

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=2, min=5, max=60))
    async def generate_thread(self, facts_json: str, feedback: str = "") -> List[str]:
        prompt = f"""Write a punchy social media thread (max 5 posts, 280 chars each) using ONLY these facts:
{facts_json}

The value proposition MUST be the hero of the post.
{f"CRITICAL EDITOR FEEDBACK TO ADDRESS: {feedback}" if feedback else ""}

Format your response simply as lines starting with "1.", "2.", etc."""

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.9,
        )
        text = response.choices[0].message.content
        lines = [line.strip() for line in text.split("\n") if line.strip() and line[0].isdigit()]
        if not lines:
            lines = [p.strip() for p in text.split("\n\n") if p.strip()][:5]
        return [bleach.clean(line) for line in lines]

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=2, min=5, max=60))
    async def generate_email(self, facts_json: str, feedback: str = "") -> str:
        prompt = f"""Write a friendly email teaser (max 100 words, 1 paragraph) using ONLY these facts:
{facts_json}

The value proposition MUST be the hero of the post.
{f"CRITICAL EDITOR FEEDBACK TO ADDRESS: {feedback}" if feedback else ""}"""

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.6,
        )
        raw_output = response.choices[0].message.content
        return bleach.clean(raw_output)

    async def run(self, state_dict: dict) -> dict:
        logger.info("Copywriter Agent generating in parallel via Groq...")
        fact_sheet: FactSheet = state_dict.get("fact_sheet")
        if not fact_sheet:
            raise ValueError("FactSheet not found in state.")

        facts_json = fact_sheet.model_dump_json(indent=2)
        editor_feedbacks: Dict[str, EditorFeedback] = state_dict.get("editor_feedback", {})

        blog_fe = editor_feedbacks.get("blog").correction_note if editor_feedbacks.get("blog") and editor_feedbacks["blog"].status == "REJECTED" else ""
        thread_fe = editor_feedbacks.get("thread").correction_note if editor_feedbacks.get("thread") and editor_feedbacks["thread"].status == "REJECTED" else ""
        email_fe = editor_feedbacks.get("email").correction_note if editor_feedbacks.get("email") and editor_feedbacks["email"].status == "REJECTED" else ""

        existing_drafts = state_dict.get("drafts")
        blog_task, thread_task, email_task = None, None, None

        if not existing_drafts or not editor_feedbacks.get("blog") or blog_fe:
            blog_task = self.generate_blog(facts_json, blog_fe)

        if not existing_drafts or not editor_feedbacks.get("thread") or thread_fe:
            thread_task = self.generate_thread(facts_json, thread_fe)

        if not existing_drafts or not editor_feedbacks.get("email") or email_fe:
            email_task = self.generate_email(facts_json, email_fe)

        results = await asyncio.gather(
            blog_task if blog_task else self._return_existing(existing_drafts.blog),
            thread_task if thread_task else self._return_existing(existing_drafts.thread),
            email_task if email_task else self._return_existing(existing_drafts.email)
        )

        state_dict["drafts"] = ContentDrafts(
            blog=results[0],
            thread=results[1],
            email=results[2]
        )
        return state_dict

    async def _return_existing(self, data):
        return data
