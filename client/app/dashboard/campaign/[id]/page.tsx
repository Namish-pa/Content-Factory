"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getCampaignResult, exportCampaign, renameCampaign } from "@/lib/api";
import type { CampaignState } from "@/lib/types";
import ContentViewer from "@/components/dashboard/ContentViewer";
import PerformancePanel from "@/components/dashboard/PerformancePanel";

export default function CampaignResultPage() {
  const params = useParams();
  const id = params.id as string;

  const [campaign, setCampaign] = useState<CampaignState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    if (!id) return;
    loadCampaign();
  }, [id]);

  const loadCampaign = async () => {
    try {
      setLoading(true);
      const data = await getCampaignResult(id);
      setCampaign(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load campaign");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      await exportCampaign(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const campaignTitle = campaign?.name 
    || campaign?.fact_sheet?.product?.name
    || (campaign?.raw_input ? campaign.raw_input.split("\n")[0].slice(0, 60) : null)
    || `Campaign ${id.slice(0, 8)}`;

  const handleStartRename = () => {
    setIsEditing(true);
    setEditingName(campaignTitle || "");
  };

  const handleCommitRename = async () => {
    if (editingName.trim() !== "" && editingName !== campaignTitle) {
      try {
        await renameCampaign(id, editingName);
        if (campaign) {
          setCampaign({ ...campaign, name: editingName });
        }
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to rename campaign");
      }
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommitRename();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "60vh",
        color: "var(--text-muted)",
        fontSize: "0.95rem",
      }}>
        Loading campaign data...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "60vh",
        color: "#ff6b6b",
        fontSize: "0.95rem",
        gap: "1rem",
      }}>
        {error}
        <button onClick={loadCampaign} style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid var(--border-color)",
          borderRadius: "6px",
          color: "var(--text-secondary)",
          padding: "0.5rem 1.25rem",
          cursor: "pointer",
        }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Campaign Header */}
      <div className="campaign-header">
        <div className="campaign-breadcrumb">
          <span><a href="/dashboard" style={{ color: "inherit", textDecoration: "none" }}>Campaigns</a></span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">{campaignTitle}</span>
        </div>

        <div className="campaign-title-row">
          {isEditing ? (
            <input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              maxLength={100}
              style={{
                fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
                fontFamily: "var(--font-body)",
                fontStyle: "normal",
                fontWeight: 600,
                color: "var(--text-primary)",
                background: "rgba(0,0,0,0.2)",
                border: "1px solid var(--accent-blue)",
                borderRadius: "var(--radius-sm)",
                padding: "2px 10px",
                outline: "none",
                width: "100%",
                maxWidth: "600px",
                flex: 1
              }}
            />
          ) : (
            <h1>{campaignTitle}</h1>
          )}
          <div className="campaign-actions">
            <button className="btn-outline" id="btn-versions" onClick={loadCampaign}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              Refresh
            </button>
            {isEditing ? (
              <button className="btn-outline" onClick={handleCommitRename}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Save
              </button>
            ) : (
              <button className="btn-outline" onClick={handleStartRename}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Rename
              </button>
            )}
            <button
              className="btn-export"
              id="btn-export"
              onClick={handleExport}
              disabled={exporting}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {exporting ? "Exporting..." : "Export"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content + Right Panel */}
      <div className="dashboard-content-area">
        <ContentViewer
          drafts={campaign?.drafts || null}
          factSheet={campaign?.fact_sheet || null}
          editorFeedback={campaign?.editor_feedback || null}
          rawInput={campaign?.raw_input || null}
          sourceUrl={campaign?.source_url || null}
        />
        <PerformancePanel
          editorFeedback={campaign?.editor_feedback || null}
          factSheet={campaign?.fact_sheet || null}
          iterationCount={campaign?.iteration_count || 0}
        />
      </div>

      {/* Dashboard Footer */}
      <footer className="dashboard-footer">
        <span className="dashboard-footer-copy">
          © 2024 Obsidian Intelligence. All rights reserved.
        </span>
        <ul className="dashboard-footer-links">
          <li><a href="#">Privacy Policy</a></li>
          <li><a href="#">Terms of Service</a></li>
          <li><a href="#">Security</a></li>
        </ul>
      </footer>
    </>
  );
}
