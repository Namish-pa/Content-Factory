import json
import structlog
import google.generativeai as genai
from tenacity import retry, wait_exponential, stop_after_attempt
from config import settings
from models.schemas import FactSheet

logger = structlog.get_logger(__name__)

class FactCheckAgent:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        # Using Gemini Pro as requested
        self.model = genai.GenerativeModel(settings.GEMINI_PRO_MODEL)

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def extract_facts(self, raw_input: str) -> FactSheet:
        logger.info("Extracting facts via Gemini 2.0 Pro...")
        system_rules = """
        You are a Fact-Check Agent.
        Rules:
        - Extract ONLY verifiable facts from the provided source.
        - DO NOT infer or embellish any information.
        - Flag ambiguous statements explicitly.
        - Output strictly valid JSON matching the schema, with no markdown block formatting holding the JSON.
        """
        
        prompt = f"{system_rules}\n\nSource text/URL data:\n{raw_input}"
        
        response = await self.model.generate_content_async(
            prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.1,  # deterministic
                response_mime_type="application/json",
                response_schema=FactSheet
            )
        )
        data = json.loads(response.text)
        return FactSheet(**data)

    async def run(self, state_dict: dict) -> dict:
        raw_input = state_dict.get("raw_input", "")
        if not raw_input:
            raise ValueError("No input data provided to FactCheckAgent.")
            
        fact_sheet = await self.extract_facts(raw_input)
        state_dict["fact_sheet"] = fact_sheet
        return state_dict
