import json
import structlog
from groq import AsyncGroq
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type
from config import settings
from models.schemas import FactSheet

logger = structlog.get_logger(__name__)

class FactCheckAgent:
    def __init__(self):
        self.client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        self.model = settings.GROQ_PRO_MODEL

    @retry(stop=stop_after_attempt(5), wait=wait_exponential(multiplier=2, min=5, max=60))
    async def extract_facts(self, raw_input: str) -> FactSheet:
        logger.info("Extracting facts via Groq (Llama 3.3 70B)...")

        system_prompt = """You are a Fact-Check Agent.
Rules:
- Extract ONLY verifiable facts from the provided source.
- DO NOT infer or embellish any information.
- Flag ambiguous statements explicitly.
- Output ONLY strictly valid JSON matching the schema below. No markdown, no explanation.

Schema:
{
  "product": {"name": str, "category": str, "description": str},
  "features": [{"name": str, "description": str, "evidence": str}],
  "technical_specs": {str: any},
  "target_audience": [str],
  "value_proposition": str,
  "pricing": {"amount": str, "confidence": str} or null,
  "ambiguous_statements": [{"text": str, "reason": str}],
  "constraints": {"tone": str, "must_include": [str]}
}"""

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Source text/URL data:\n{raw_input}"}
            ],
            temperature=0.1,
            response_format={"type": "json_object"},
        )

        data = json.loads(response.choices[0].message.content)
        return FactSheet(**data)

    async def run(self, state_dict: dict) -> dict:
        raw_input = state_dict.get("raw_input", "")
        if not raw_input:
            raise ValueError("No input data provided to FactCheckAgent.")

        fact_sheet = await self.extract_facts(raw_input)
        state_dict["fact_sheet"] = fact_sheet
        return state_dict
