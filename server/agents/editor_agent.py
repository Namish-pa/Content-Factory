import json
import structlog
from groq import AsyncGroq
from typing import Dict, Any, List
from tenacity import retry, wait_exponential, stop_after_attempt
from config import settings
from models.schemas import FactSheet, ContentDrafts, EditorFeedback

logger = structlog.get_logger(__name__)

class EditorAgent:
    def __init__(self):
        self.client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        self.model = settings.GROQ_PRO_MODEL  # Use the larger model for strict evaluation

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=2, min=5, max=60))
    async def evaluate_draft(self, channel: str, draft: str, facts_json: str, iteration: int) -> EditorFeedback:
        system_prompt = f"""You are the Editor-in-Chief. Check this {channel} draft strictly against the facts.

Validation Steps:
1. Hallucination: Are there facts not present in the FactSheet?
2. Tone: Check constraints and flag overly robotic/salesy text.
3. Length:
   - Blog: Target ~500 words.
   - Thread: Max 5 posts, 280 chars each.
   - Email: Max 100 words, 1 paragraph.
4. Value Prop: Ensure the value proposition acts as the hero.

Output ONLY strictly valid JSON matching this schema exactly. No markdown, no explanation:
{{
  "status": "APPROVED" or "REJECTED",
  "issues": [{{"type": str, "message": str, "location": str}}],
  "correction_note": str,
  "iteration": {iteration}
}}"""

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"FactSheet:\n{facts_json}\n\nDraft:\n{draft}"}
            ],
            temperature=0.0,
            response_format={"type": "json_object"},
        )

        data = json.loads(response.choices[0].message.content)
        data["iteration"] = iteration
        return EditorFeedback(**data)

    async def run(self, state_dict: dict) -> dict:
        logger.info("Editor Agent evaluating drafts via Groq...")
        fact_sheet: FactSheet = state_dict.get("fact_sheet")
        drafts: ContentDrafts = state_dict.get("drafts")
        iteration_count = state_dict.get("iteration_count", 0) + 1

        if not fact_sheet or not drafts:
            raise ValueError("Missing state data for Editor Agent.")

        facts_json = fact_sheet.model_dump_json(indent=2)

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

        all_approved = all(fb.status == "APPROVED" for fb in feedbacks.values())
        if all_approved:
            state_dict["status"] = "APPROVED"
        else:
            state_dict["status"] = "REVIEWING"

        return state_dict
