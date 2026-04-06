// ---- Campaign Status Enum ----

export enum CampaignStatus {
  INIT = "INIT",
  INGESTING = "INGESTING",
  EXTRACTING = "EXTRACTING",
  GENERATING = "GENERATING",
  REVIEWING = "REVIEWING",
  APPROVED = "APPROVED",
  FAILED = "FAILED",
}

// ---- FactSheet Models ----

export interface Product {
  name: string;
  category: string;
  description: string;
}

export interface Feature {
  name: string;
  description: string;
  evidence: string;
}

export interface Pricing {
  amount: string;
  confidence: string;
}

export interface AmbiguousStatement {
  text: string;
  reason: string;
}

export interface Constraints {
  tone: string;
  must_include: string[];
}

export interface FactSheet {
  product: Product;
  features: Feature[];
  technical_specs: Record<string, unknown>;
  target_audience: string[];
  value_proposition: string;
  pricing: Pricing | null;
  ambiguous_statements: AmbiguousStatement[];
  constraints: Constraints;
}

// ---- Content Drafts ----

export interface ContentDrafts {
  blog: string;
  thread: string[];
  email: string;
}

// ---- Editor Feedback ----

export interface Issue {
  type: string;
  message: string;
  location: string;
}

export interface EditorFeedback {
  status: "APPROVED" | "REJECTED";
  issues: Issue[];
  correction_note: string;
  iteration: number;
}

// ---- Campaign State ----

export interface CampaignState {
  campaign_id: string;
  raw_input: string | null;
  source_url: string | null;
  fact_sheet: FactSheet | null;
  drafts: ContentDrafts | null;
  editor_feedback: Record<string, EditorFeedback | null>;
  status: CampaignStatus;
  iteration_count: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

// ---- Campaign List Item (from GET /campaign) ----

export interface CampaignListItem {
  id: string;
  status: CampaignStatus;
  created_at: string;
  updated_at: string;
  raw_input_preview: string | null;
  error_message: string | null;
  iteration_count: number;
}

// ---- Start Campaign Response ----

export interface StartCampaignResponse {
  campaign_id: string;
  status: string;
  message: string;
}

// ---- WebSocket Event ----

export type WSEventType =
  | "AGENT_STATUS"
  | "DRAFT_UPDATE"
  | "EDITOR_FEEDBACK"
  | "CAMPAIGN_STATUS"
  | "COMPLETE"
  | "ERROR";

export interface WSEvent {
  type: WSEventType;
  campaign_id: string;
  agent: string | null;
  status: string | null;
  data: Record<string, unknown> | null;
  message: string | null;
  timestamp: string;
}
