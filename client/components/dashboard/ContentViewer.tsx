"use client";

import { useState } from "react";
import type { ContentDrafts, FactSheet, EditorFeedback } from "@/lib/types";
import ResponsivePreview from "@/components/campaign/ResponsivePreview";

interface ContentViewerProps {
  drafts: ContentDrafts | null;
  factSheet: FactSheet | null;
  editorFeedback: Record<string, EditorFeedback | null> | null;
  rawInput?: string | null;
  sourceUrl?: string | null;
}

type TabKey = "blog" | "thread" | "email" | "factsheet" | "feedback" | "preview" | "source";

function handleSendEmail(subject: string, body: string) {
  const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailto, "_blank");
}

function SendEmailButton({ subject, body }: { subject: string; body: string }) {
  return (
    <button
      className="btn-send-email"
      onClick={() => handleSendEmail(subject, body)}
      title="Open in email client"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
      Send via Email
    </button>
  );
}

export default function ContentViewer({ drafts, factSheet, editorFeedback, rawInput, sourceUrl }: ContentViewerProps) {
  const [activeTab, setActiveTab] = useState<TabKey>(drafts?.blog ? "source" : "feedback");

  const tabs: { key: TabKey; label: string }[] = [
    { key: "source", label: "Source Input" },
    { key: "preview", label: "Visual Preview" },
    { key: "blog", label: "Blog Draft" },
    { key: "email", label: "Email Draft" },
    { key: "thread", label: "Thread Draft" },
    { key: "factsheet", label: "Fact Sheet" },
    { key: "feedback", label: "Editor Feedback" },
  ];

  // Gather all feedback issues
  const allFeedback = editorFeedback
    ? Object.entries(editorFeedback)
        .filter(([, fb]) => fb !== null && fb !== undefined)
        .map(([channel, fb]) => ({ channel, feedback: fb! }))
    : [];

  const allIssues = allFeedback.flatMap(({ channel, feedback }) =>
    (feedback.issues || []).map((issue) => ({ ...issue, channel }))
  );

  const overallStatus = allFeedback.length > 0
    ? allFeedback.every((f) => f.feedback.status === "APPROVED") ? "APPROVED" : "REJECTED"
    : null;

  const productName = factSheet?.product?.name || "Content Factory";

  return (
    <div className="content-viewer" id="content-viewer">
      {/* Tabs */}
      <div className="content-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`content-tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
            id={`tab-${tab.key}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Blog Draft Tab ─── */}
      {activeTab === "blog" && (
        <div className="editor-body" style={{ borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
          {drafts?.blog ? (
            <>
              <div className="editor-body-header">
                <h2>Blog Post</h2>
                <SendEmailButton
                  subject={`${productName} — Blog Post Draft`}
                  body={drafts.blog}
                />
              </div>
              <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>{drafts.blog}</div>
            </>
          ) : (
            <div className="loading-state">
              <p>No blog draft available yet. The copywriter agent will generate this during the pipeline.</p>
            </div>
          )}
        </div>
      )}

      {/* ─── Email Draft Tab ─── */}
      {activeTab === "email" && (
        <div className="editor-body" style={{ borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
          {drafts?.email ? (
            <>
              <div className="editor-body-header">
                <h2>Email Campaign</h2>
                <SendEmailButton
                  subject={`${productName} — Email Campaign Draft`}
                  body={drafts.email}
                />
              </div>
              <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>{drafts.email}</div>
            </>
          ) : (
            <div className="loading-state">
              <p>No email draft available yet. The copywriter agent will generate this during the pipeline.</p>
            </div>
          )}
        </div>
      )}

      {/* ─── Thread Draft Tab ─── */}
      {activeTab === "thread" && (
        <div className="editor-body" style={{ borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
          {drafts?.thread && drafts.thread.length > 0 ? (
            <>
              <div className="editor-body-header">
                <h2>Social Thread</h2>
                <SendEmailButton
                  subject={`${productName} — Social Thread Draft`}
                  body={drafts.thread.map((t, i) => `[${i + 1}] ${t}`).join("\n\n")}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
                {drafts.thread.map((tweet, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "1rem 1.25rem",
                      borderLeft: "3px solid var(--accent-blue, #6366f1)",
                      background: "rgba(99, 102, 241, 0.04)",
                      borderRadius: "0 8px 8px 0",
                      lineHeight: 1.7,
                    }}
                  >
                    <span style={{
                      display: "inline-block",
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      background: "var(--accent-blue, #6366f1)",
                      color: "#fff",
                      textAlign: "center",
                      lineHeight: "22px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      marginRight: "0.75rem",
                    }}>
                      {i + 1}
                    </span>
                    {tweet}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="loading-state">
              <p>No thread draft available yet. The copywriter agent will generate this during the pipeline.</p>
            </div>
          )}
        </div>
      )}

      {/* ─── Fact Sheet Tab ─── */}
      {activeTab === "factsheet" && (
        <div className="fact-sheet-content">
          {factSheet ? (
            <>
              <div className="fact-section">
                <h3>Product</h3>
                <p>
                  <strong>{factSheet.product?.name || "N/A"}</strong>
                  {factSheet.product?.category && (
                    <span style={{
                      marginLeft: "0.5rem",
                      padding: "0.1rem 0.5rem",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      background: "rgba(99, 102, 241, 0.12)",
                      color: "var(--accent-blue, #6366f1)",
                    }}>
                      {factSheet.product.category}
                    </span>
                  )}
                </p>
                <p style={{ marginTop: "0.5rem" }}>{factSheet.product?.description || "No description"}</p>
              </div>
              <div className="fact-section">
                <h3>Features</h3>
                {factSheet.features?.map((f, i) => (
                  <div className="fact-feature" key={i}>
                    <div className="fact-feature-name">{f.name}</div>
                    <div className="fact-feature-desc">{f.description}</div>
                    {f.evidence && (
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem", fontStyle: "italic" }}>
                        Evidence: {f.evidence}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="fact-section">
                <h3>Value Proposition</h3>
                <p>{factSheet.value_proposition || "N/A"}</p>
              </div>
              <div className="fact-section">
                <h3>Target Audience</h3>
                <div className="content-prop-tags">
                  {factSheet.target_audience?.map((t, i) => (
                    <span className="prop-tag" key={i}>{t}</span>
                  ))}
                </div>
              </div>
              {factSheet.constraints && (
                <div className="fact-section">
                  <h3>Constraints</h3>
                  <p><strong>Tone:</strong> {factSheet.constraints.tone}</p>
                  {factSheet.constraints.must_include?.length > 0 && (
                    <div className="content-prop-tags" style={{ marginTop: "0.5rem" }}>
                      {factSheet.constraints.must_include.map((item, i) => (
                        <span className="prop-tag" key={i}>{item}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {factSheet.ambiguous_statements && factSheet.ambiguous_statements.length > 0 && (
                <div className="fact-section">
                  <h3>Ambiguous Statements</h3>
                  {factSheet.ambiguous_statements.map((stmt, i) => (
                    <div key={i} style={{
                      padding: "0.75rem 1rem",
                      background: "rgba(255, 159, 10, 0.06)",
                      borderLeft: "3px solid #fbbf24",
                      borderRadius: "0 8px 8px 0",
                      marginBottom: "0.75rem",
                    }}>
                      <p style={{ fontWeight: 500 }}>&ldquo;{stmt.text}&rdquo;</p>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                        Reason: {stmt.reason}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="loading-state">
              <p>No fact sheet extracted yet.</p>
            </div>
          )}
        </div>
      )}

      {/* ─── Editor Feedback Tab ─── */}
      {activeTab === "feedback" && (
        <div className="editor-body" style={{ borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
          {allFeedback.length > 0 ? (
            <>
              {/* Overall Status Banner */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "1rem 1.25rem",
                borderRadius: "8px",
                marginBottom: "1.5rem",
                background: overallStatus === "APPROVED"
                  ? "rgba(50, 215, 75, 0.08)"
                  : "rgba(255, 159, 10, 0.08)",
                border: `1px solid ${overallStatus === "APPROVED"
                  ? "rgba(50, 215, 75, 0.2)"
                  : "rgba(255, 159, 10, 0.2)"}`,
              }}>
                <span style={{ fontSize: "1.5rem" }}>
                  {overallStatus === "APPROVED" ? "✅" : "🔄"}
                </span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                    {overallStatus === "APPROVED" ? "Content Approved" : "Revisions Requested"}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    {allIssues.length} issue{allIssues.length !== 1 ? "s" : ""} found across {allFeedback.length} channel{allFeedback.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              {/* Per-channel feedback */}
              {allFeedback.map(({ channel, feedback }) => (
                <div key={channel} style={{ marginBottom: "2rem" }}>
                  <h3 style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "1rem",
                    textTransform: "capitalize",
                  }}>
                    <span style={{
                      padding: "0.15rem 0.6rem",
                      borderRadius: "4px",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      background: feedback.status === "APPROVED"
                        ? "rgba(50, 215, 75, 0.15)"
                        : "rgba(255, 59, 48, 0.15)",
                      color: feedback.status === "APPROVED" ? "#34d399" : "#ff6b6b",
                    }}>
                      {feedback.status}
                    </span>
                    {channel} — Iteration {feedback.iteration}
                  </h3>

                  {/* Issues */}
                  {feedback.issues && feedback.issues.length > 0 ? (
                    feedback.issues.map((issue, i) => (
                      <div key={i} style={{
                        padding: "0.75rem 1rem",
                        marginBottom: "0.75rem",
                        borderRadius: "8px",
                        borderLeft: `3px solid ${
                          issue.type === "hallucination" ? "#ff6b6b" :
                          issue.type === "tone" ? "#fbbf24" :
                          issue.type === "length" ? "#6366f1" :
                          "#34d399"
                        }`,
                        background: "rgba(255,255,255,0.02)",
                      }}>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.4rem" }}>
                          <span style={{
                            padding: "0.1rem 0.45rem",
                            borderRadius: "4px",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            background:
                              issue.type === "hallucination" ? "rgba(255,59,48,0.15)" :
                              issue.type === "tone" ? "rgba(255,159,10,0.15)" :
                              issue.type === "length" ? "rgba(99,102,241,0.15)" :
                              "rgba(50,215,75,0.15)",
                            color:
                              issue.type === "hallucination" ? "#ff6b6b" :
                              issue.type === "tone" ? "#fbbf24" :
                              issue.type === "length" ? "#818cf8" :
                              "#34d399",
                          }}>
                            {issue.type}
                          </span>
                          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                            {issue.location}
                          </span>
                        </div>
                        <p style={{ margin: 0, lineHeight: 1.6 }}>{issue.message}</p>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No issues found.</p>
                  )}

                  {/* Correction note */}
                  {feedback.correction_note && (
                    <div className="key-takeaway" style={{ marginTop: "1rem" }}>
                      <div className="takeaway-label">Correction Note</div>
                      <blockquote style={{ margin: 0, fontStyle: "italic" }}>{feedback.correction_note}</blockquote>
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <>
              <h2>Editor Feedback</h2>
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "3rem 2rem",
                textAlign: "center",
              }}>
                <div style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "rgba(99, 102, 241, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1rem",
                  fontSize: "1.5rem",
                }}>
                  📝
                </div>
                <p style={{ color: "var(--text-muted)", maxWidth: "360px", lineHeight: 1.7 }}>
                  No editor feedback available yet. The AI editor will review all drafts once the copywriter agent completes content generation.
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── Visual Preview Tab ─── */}
      {activeTab === "preview" && (
        <div style={{ marginTop: "1rem", borderRadius: "10px", border: "1px solid var(--border-color)", overflow: "hidden", background: "var(--bg-card)" }}>
          <ResponsivePreview 
            blogContent={drafts?.blog}
            socialThread={drafts?.thread}
            emailContent={drafts?.email}
            isGenerating={overallStatus === "REJECTED"}
          />
        </div>
      )}

      {/* ─── Source Input Tab ─── */}
      {activeTab === "source" && (
        <div className="editor-body" style={{ borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
          <div className="editor-body-header">
            <h2>Source Input</h2>
          </div>
          {sourceUrl && (
            <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "rgba(255,255,255,0.02)", borderRadius: "8px", borderLeft: "3px solid var(--accent-blue)" }}>
              <strong style={{ color: "var(--text-secondary)" }}>Source URL: </strong>
              <a href={sourceUrl} target="_blank" rel="noreferrer" style={{ color: "var(--accent-blue)", textDecoration: "underline" }}>
                {sourceUrl}
              </a>
            </div>
          )}
          {rawInput ? (
            <div style={{
              whiteSpace: "pre-wrap", 
              lineHeight: 1.8, 
              padding: "1.5rem", 
              background: "rgba(0,0,0,0.2)", 
              borderRadius: "8px",
              fontFamily: "var(--font-body)",
              fontSize: "0.95rem"
            }}>
              {rawInput}
            </div>
          ) : (
             <div className="loading-state">
              <p>No raw text input was provided for this campaign.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
