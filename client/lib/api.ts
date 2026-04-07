import type {
  CampaignState,
  CampaignListItem,
  StartCampaignResponse,
  WSEvent,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

// ---- Helpers ----

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ---- Campaign API ----

export async function startCampaign(rawText: string): Promise<StartCampaignResponse> {
  return request<StartCampaignResponse>("/campaign/start", {
    method: "POST",
    body: JSON.stringify({ raw_text: rawText }),
  });
}

export async function saveDraft(rawText: string): Promise<StartCampaignResponse> {
  return request<StartCampaignResponse>("/campaign/draft", {
    method: "POST",
    body: JSON.stringify({ raw_text: rawText }),
  });
}

export async function listCampaigns(): Promise<CampaignListItem[]> {
  return request<CampaignListItem[]>("/campaign");
}

export async function getCampaignStatus(
  campaignId: string
): Promise<{ status: string; iteration_count: number; error_message: string | null }> {
  return request(`/campaign/${campaignId}/status`);
}

export async function getCampaignResult(campaignId: string): Promise<CampaignState> {
  return request<CampaignState>(`/campaign/${campaignId}/result`);
}

export async function exportCampaign(campaignId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/campaign/${campaignId}/export`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Export failed: ${res.status}`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `campaign_${campaignId}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function deleteCampaign(campaignId: string): Promise<void> {
  await request(`/campaign/${campaignId}`, { method: "DELETE" });
}

export async function renameCampaign(campaignId: string, name: string): Promise<void> {
  await request(`/campaign/${campaignId}/rename`, {
    method: "PUT",
    body: JSON.stringify({ name }),
  });
}

export async function startExistingCampaign(campaignId: string): Promise<void> {
  await request(`/campaign/${campaignId}/start`, { method: "POST" });
}

// ---- WebSocket ----

export function connectWebSocket(
  campaignId: string,
  onMessage: (event: WSEvent) => void,
  onError?: (error: Event) => void,
  onClose?: () => void
): WebSocket {
  const ws = new WebSocket(`${WS_BASE}/ws/${campaignId}`);

  ws.onmessage = (e) => {
    try {
      const event: WSEvent = JSON.parse(e.data);
      onMessage(event);
    } catch {
      console.error("Failed to parse WS message:", e.data);
    }
  };

  ws.onerror = (e) => {
    console.error("WebSocket error:", e);
    onError?.(e);
  };

  ws.onclose = () => {
    onClose?.();
  };

  return ws;
}
