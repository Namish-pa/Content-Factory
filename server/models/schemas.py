from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime

class CampaignStatus(str, Enum):
    INIT = "INIT"
    INGESTING = "INGESTING"
    EXTRACTING = "EXTRACTING"
    GENERATING = "GENERATING"
    REVIEWING = "REVIEWING"
    APPROVED = "APPROVED"
    FAILED = "FAILED"

# --- FactSheet Models ---

class Product(BaseModel):
    name: str
    category: str
    description: str

class Feature(BaseModel):
    name: str
    description: str
    evidence: str

class Pricing(BaseModel):
    amount: str
    confidence: str

class AmbiguousStatement(BaseModel):
    text: str
    reason: str

class Constraints(BaseModel):
    tone: str
    must_include: List[str]

class FactSheet(BaseModel):
    product: Product
    features: List[Feature]
    technical_specs: Dict[str, Any]
    target_audience: List[str]
    value_proposition: str
    pricing: Optional[Pricing] = None
    ambiguous_statements: List[AmbiguousStatement] = Field(default_factory=list)
    constraints: Constraints

# --- Content Drafts ---

class ContentDrafts(BaseModel):
    blog: str
    thread: List[str]
    email: str

# --- Editor Feedback ---

class Issue(BaseModel):
    type: str # e.g. "hallucination", "tone", "length"
    message: str
    location: str # description of where the issue occurs

class EditorFeedback(BaseModel):
    status: Literal["APPROVED", "REJECTED"]
    issues: List[Issue] = Field(default_factory=list)
    correction_note: str
    iteration: int = 0

# --- State Object for LangGraph ---

class CampaignState(BaseModel):
    campaign_id: str
    raw_input: Optional[str] = None
    source_url: Optional[str] = None
    fact_sheet: Optional[FactSheet] = None
    drafts: Optional[ContentDrafts] = None
    editor_feedback: Dict[str, EditorFeedback] = Field(default_factory=lambda: {"blog": None, "thread": None, "email": None})
    status: CampaignStatus = CampaignStatus.INIT
    iteration_count: int = 0
    error_message: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# --- WebSocket Event ---

class WSEvent(BaseModel):
    type: Literal["AGENT_STATUS", "DRAFT_UPDATE", "EDITOR_FEEDBACK", "CAMPAIGN_STATUS", "COMPLETE", "ERROR"]
    campaign_id: str
    agent: Optional[str] = None
    status: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    message: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
