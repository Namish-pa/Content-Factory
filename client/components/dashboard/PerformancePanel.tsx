import type { EditorFeedback, FactSheet } from "@/lib/types";

interface PerformancePanelProps {
  editorFeedback: Record<string, EditorFeedback | null> | null;
  factSheet: FactSheet | null;
  iterationCount: number;
}

export default function PerformancePanel({
  editorFeedback,
  factSheet,
  iterationCount,
}: PerformancePanelProps) {
  // Compute score: approved = 92+, issues reduce it
  const totalIssues = editorFeedback
    ? Object.values(editorFeedback)
        .filter(Boolean)
        .reduce((sum, fb) => sum + (fb?.issues?.length || 0), 0)
    : 0;

  const isApproved = editorFeedback
    ? Object.values(editorFeedback).some((fb) => fb?.status === "APPROVED")
    : false;

  const score = isApproved ? Math.max(85, 98 - totalIssues * 3) : Math.max(40, 75 - totalIssues * 5);

  // Gather critique items from real feedback
  const critiqueItems = editorFeedback
    ? Object.entries(editorFeedback)
        .filter(([, fb]) => fb !== null)
        .flatMap(([channel, fb]) =>
          (fb?.issues || []).map((issue) => ({
            ...issue,
            channel,
            color: issue.type === "hallucination" ? "orange" as const
              : issue.type === "tone" ? "yellow" as const
              : "green" as const,
          }))
        )
    : [];

  // Word count estimate from drafts (not available here, use fact sheet)
  const audienceList = factSheet?.target_audience || [];
  const readingTime = factSheet ? "~4 min" : "—";

  return (
    <aside className="performance-panel" id="performance-panel">
      {/* Content Performance Score */}
      <div className="perf-section">
        <div className="perf-label">Content Performance</div>
        <div className="perf-score">
          <div className="score-circle">{score}</div>
          <div className="score-details">
            <h4>{isApproved ? "Optimized" : score > 60 ? "In Review" : "Needs Work"}</h4>
            <p>{isApproved ? "Approved" : `${totalIssues} issue${totalIssues !== 1 ? "s" : ""} found`}</p>
            <div className="score-dots">
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className={`score-dot ${n > Math.ceil(score / 20) ? "dim" : ""}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Critique */}
      <div className="perf-section">
        <div className="perf-label">AI Critique</div>

        {critiqueItems.length > 0 ? (
          critiqueItems.slice(0, 4).map((item, i) => (
            <div className={`critique-card ${item.color}`} key={i}>
              <div className="critique-header">
                <span className={`critique-dot ${item.color}`} />
                <span className="critique-title">
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)} — {item.channel}
                </span>
              </div>
              <p className="critique-desc">{item.message}</p>
            </div>
          ))
        ) : (
          <div className="critique-card green">
            <div className="critique-header">
              <span className="critique-dot green" />
              <span className="critique-title">
                {editorFeedback ? "No Issues Found" : "Awaiting Review"}
              </span>
            </div>
            <p className="critique-desc">
              {editorFeedback
                ? "The editor found no issues with the generated content."
                : "Editor feedback will appear here after the review phase."}
            </p>
          </div>
        )}
      </div>

      {/* Content Properties */}
      <div className="perf-section">
        <div className="perf-label">Content Properties</div>
        <div className="content-props">
          <div className="content-prop">
            <span className="content-prop-label">Target Audience</span>
            <div className="content-prop-tags">
              {audienceList.length > 0
                ? audienceList.map((t, i) => (
                    <span className="prop-tag" key={i}>{t}</span>
                  ))
                : <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>—</span>}
            </div>
          </div>
          <div className="content-prop">
            <span className="content-prop-label">Est. Reading Time</span>
            <span className="content-prop-value">{readingTime}</span>
          </div>
          <div className="content-prop">
            <span className="content-prop-label">Iterations</span>
            <span className="content-prop-value">{iterationCount}</span>
          </div>
          {factSheet?.constraints?.tone && (
            <div className="content-prop">
              <span className="content-prop-label">Tone</span>
              <span className="content-prop-value">{factSheet.constraints.tone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Add Comment */}
      <button className="add-comment-btn" id="add-comment-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
        Add Section Comment
      </button>
    </aside>
  );
}
