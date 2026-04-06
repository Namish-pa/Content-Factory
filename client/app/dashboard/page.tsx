"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { listCampaigns, deleteCampaign, renameCampaign, startExistingCampaign } from "@/lib/api";
import { CampaignStatus } from "@/lib/types";
import type { CampaignListItem } from "@/lib/types";
import "./campaigns.css";

function getStatusLabel(status: CampaignStatus): string {
  switch (status) {
    case CampaignStatus.APPROVED: return "Completed";
    case CampaignStatus.FAILED: return "Failed";
    case CampaignStatus.INIT: return "Draft";
    case CampaignStatus.INGESTING: return "Ingesting";
    case CampaignStatus.EXTRACTING: return "Extracting";
    case CampaignStatus.GENERATING: return "Generating";
    case CampaignStatus.REVIEWING: return "Reviewing";
    default: return status;
  }
}

function getStatusClass(status: CampaignStatus): string {
  switch (status) {
    case CampaignStatus.APPROVED: return "completed";
    case CampaignStatus.FAILED: return "failed";
    case CampaignStatus.INIT: return "draft";
    default: return "generating";
  }
}

function getStatusIcon(status: CampaignStatus): string {
  switch (status) {
    case CampaignStatus.APPROVED: return "✨";
    case CampaignStatus.FAILED: return "⚠️";
    case CampaignStatus.INIT: return "📄";
    default: return "📄";
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  }) + " · " + d.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });
}

function getCampaignTitle(c: CampaignListItem): string {
  if (c.name) return c.name;
  if (c.raw_input_preview) {
    // Use first line or first 50 chars as title
    const firstLine = c.raw_input_preview.split("\n")[0];
    return firstLine.length > 50 ? firstLine.slice(0, 50) + "..." : firstLine;
  }
  return `Campaign ${c.id.slice(0, 8)}`;
}

function getCampaignLink(c: CampaignListItem): string {
  const isActive = ![CampaignStatus.APPROVED, CampaignStatus.FAILED].includes(c.status);
  if (isActive) {
    return `/dashboard/campaign/${c.id}/processing`;
  }
  return `/dashboard/campaign/${c.id}`;
}

const chartBars = [
  { height: 45, active: false },
  { height: 55, active: false },
  { height: 35, active: false },
  { height: 70, active: false },
  { height: 90, active: true },
  { height: 80, active: false },
  { height: 50, active: false },
  { height: 40, active: false },
  { height: 60, active: false },
  { height: 30, active: false },
];

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<CampaignListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const data = await listCampaigns();
      setCampaigns(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter((c) => {
    // Only show terminal states (Completed or Failed) OR Drafts (INIT) in the Recent Activity list
    const isVisible = [CampaignStatus.APPROVED, CampaignStatus.FAILED, CampaignStatus.INIT].includes(c.status);
    if (!isVisible) return false;

    if (!filter) return true;
    const search = filter.toLowerCase();
    return (
      c.id.toLowerCase().includes(search) ||
      c.status.toLowerCase().includes(search) ||
      (c.raw_input_preview?.toLowerCase().includes(search) ?? false)
    );
  });

  const completedCount = campaigns.filter((c) => c.status === CampaignStatus.APPROVED).length;
  const activeCount = campaigns.filter((c) =>
    ![CampaignStatus.APPROVED, CampaignStatus.FAILED].includes(c.status)
  ).length;

  const handleDelete = async (e: React.MouseEvent, campaignId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    try {
      await deleteCampaign(campaignId);
      setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete campaign");
    }
  };

  const handleStartRename = (e: React.MouseEvent, campaignId: string, currentName: string) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingCampaignId(campaignId);
    setEditingName(currentName);
  };

  const handleCommitRename = async (e?: React.MouseEvent | React.KeyboardEvent, campaignId?: string) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!editingCampaignId) return;
    const targetId = campaignId || editingCampaignId;

    if (editingName.trim() !== "") {
      try {
        await renameCampaign(targetId, editingName);
        setCampaigns((prev) => 
          prev.map((c) => c.id === targetId ? { ...c, name: editingName } : c)
        );
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to rename campaign");
      }
    }
    setEditingCampaignId(null);
  };

  const handleStart = async (e: React.MouseEvent, campaignId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await startExistingCampaign(campaignId);
      router.push(`/dashboard/campaign/${campaignId}/processing`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to start campaign");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommitRename(e);
    } else if (e.key === 'Escape') {
      setEditingCampaignId(null);
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="campaigns-page-header">
        <div className="campaigns-page-header-text">
          <h1>Campaign History</h1>
          <p>
            Manage and monitor your autonomous content generation engines in
            real-time.
          </p>
        </div>
        <Link href="/campaign/new" className="btn-new-campaign" id="btn-new-campaign">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Campaign
        </Link>
      </div>

      {/* Stats Row */}
      <div className="campaigns-stats-row">
        {/* Throughput Chart */}
        <div className="throughput-card">
          <div className="throughput-header">
            <span className="throughput-dot" />
            Active Engine Throughput
          </div>
          <div className="throughput-chart">
            {chartBars.map((bar, i) => (
              <div className="chart-bar-group" key={i}>
                <div
                  className={`chart-bar ${bar.active ? "active" : ""}`}
                  style={{ height: `${bar.height}%` }}
                />
              </div>
            ))}
          </div>
          <div className="chart-labels">
            <span className="chart-label">00:00</span>
            <span className="chart-label">06:00</span>
            <span className="chart-label">12:00</span>
            <span className="chart-label">18:00</span>
            <span className="chart-label">NOW</span>
          </div>
        </div>

        {/* Total Output */}
        <div className="total-output-card">
          <span className="total-output-label">Total Campaigns</span>
          <span className="total-output-value">{campaigns.length}</span>
          <span className="total-output-change">
            {completedCount} completed · {activeCount} active
          </span>
          <div className="total-output-avatars">
            <div className="avatar-stack">
              <div className="avatar-circle a1" />
              <div className="avatar-circle a2" />
              <div className="avatar-circle a3" />
              <div className="avatar-more">+{Math.max(0, campaigns.length - 3)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <div className="recent-activity-header">
          <h2>Recent Activity</h2>
          <div className="filter-input">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Filter campaigns..."
              id="filter-campaigns"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="campaigns-table">
          <div className="campaigns-table-head">
            <span>Campaign Details</span>
            <span>Status</span>
            <span>Date Created</span>
            <span>Iterations</span>
            <span>Actions</span>
          </div>

          {loading && (
            <div style={{
              padding: "3rem 2rem",
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: "0.9rem",
            }}>
              Loading campaigns...
            </div>
          )}

          {error && (
            <div style={{
              padding: "3rem 2rem",
              textAlign: "center",
              color: "#ff6b6b",
              fontSize: "0.9rem",
            }}>
              {error}
              <br />
              <button onClick={loadCampaigns} style={{
                marginTop: "0.75rem",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--border-color)",
                borderRadius: "6px",
                color: "var(--text-secondary)",
                padding: "0.4rem 1rem",
                cursor: "pointer",
              }}>
                Retry
              </button>
            </div>
          )}

          {!loading && !error && filteredCampaigns.length === 0 && (
            <div style={{
              padding: "3rem 2rem",
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: "0.9rem",
            }}>
              {campaigns.length === 0
                ? "No campaigns yet. Create your first one!"
                : "No campaigns match your filter."}
            </div>
          )}

          {!loading && !error && filteredCampaigns.map((campaign) => (
            <Link
              href={getCampaignLink(campaign)}
              className="campaign-row"
              key={campaign.id}
              id={`campaign-row-${campaign.id}`}
            >
              <div className="campaign-details">
                <div className={`campaign-icon ${getStatusClass(campaign.status)}`}>
                  {getStatusIcon(campaign.status)}
                </div>
                <div className="campaign-info">
                  {editingCampaignId === campaign.id ? (
                    <input
                      type="text"
                      className="inline-edit-input"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={handleKeyDown}
                      autoFocus
                      maxLength={100}
                    />
                  ) : (
                    <h4>{getCampaignTitle(campaign)}</h4>
                  )}
                  <span>ID: {campaign.id.slice(0, 8)}...</span>
                </div>
              </div>
              <div className="campaign-status-cell">
                <span className={`status-badge ${getStatusClass(campaign.status)}`}>
                  {getStatusLabel(campaign.status)}
                </span>
              </div>
              <span className="campaign-date">{formatDate(campaign.created_at)}</span>
              <span className={`campaign-output ${campaign.iteration_count === 0 ? "zero" : ""}`}>
                {campaign.iteration_count}
              </span>
              <div className="campaign-actions-cell">
                {editingCampaignId === campaign.id ? (
                  <button
                    className="btn-action btn-edit"
                    onClick={(e) => handleCommitRename(e, campaign.id)}
                    aria-label="Save name"
                    title="Save name"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </button>
                ) : (
                  <button
                    className="btn-action btn-edit"
                    onClick={(e) => handleStartRename(e, campaign.id, getCampaignTitle(campaign))}
                    aria-label="Rename campaign"
                    title="Rename campaign"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                )}
                {campaign.status === CampaignStatus.INIT && (
                  <button
                    className="btn-action btn-start"
                    onClick={(e) => handleStart(e, campaign.id)}
                    aria-label="Start campaign"
                    title="Start campaign"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </button>
                )}
                <button
                  className="btn-action btn-delete"
                  onClick={(e) => handleDelete(e, campaign.id)}
                  aria-label="Delete campaign"
                  title="Delete campaign"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </button>
              </div>
            </Link>
          ))}
        </div>

        {filteredCampaigns.length > 10 && (
          <button className="show-more" id="show-more-btn">
            Show more activity
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}
      </div>

      {/* Footer */}
      <footer className="campaigns-footer">
        <span className="campaigns-footer-left">
          © 2024 Obsidian Intelligence. All rights reserved.
        </span>
        <ul className="campaigns-footer-center">
          <li><a href="#">Privacy Policy</a></li>
          <li><a href="#">Terms of Service</a></li>
          <li><a href="#">Security</a></li>
        </ul>
        <div className="campaigns-footer-status">
          <span className="status-dot-green" />
          System Operational
        </div>
      </footer>
    </>
  );
}
