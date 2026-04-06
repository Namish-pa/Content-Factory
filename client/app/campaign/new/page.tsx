"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { startCampaign } from "@/lib/api";
import "./new-campaign.css";

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  content: string;
}

export default function NewCampaignPage() {
  const [rawText, setRawText] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleInitialize = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      // Combine file contents + raw text into a single payload
      const fileTexts = files.map((f) => `--- ${f.name} ---\n${f.content}`).join("\n\n");
      const combined = [fileTexts, rawText].filter(Boolean).join("\n\n");

      if (!combined.trim()) {
        setError("Please provide source material via file upload or text input.");
        setIsSubmitting(false);
        return;
      }

      const res = await startCampaign(combined);
      router.push(`/dashboard/campaign/${res.campaign_id}/processing`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start campaign.");
      setIsSubmitting(false);
    }
  };

  const handleFiles = (fileList: FileList) => {
    const accepted = Array.from(fileList).filter((f) => {
      const ext = f.name.toLowerCase();
      return (
        ext.endsWith(".pdf") ||
        ext.endsWith(".docx") ||
        ext.endsWith(".doc") ||
        ext.endsWith(".txt")
      );
    });

    accepted.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setFiles((prev) => [
          ...prev,
          {
            name: file.name,
            size: file.size,
            type: file.name.split(".").pop()?.toUpperCase() || "FILE",
            content: content || "",
          },
        ]);
      };
      reader.readAsText(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      {/* Top Bar */}
      <header className="new-campaign-topbar" id="new-campaign-topbar">
        <div className="new-campaign-topbar-brand">
          <span>Obsidian</span> Factory
        </div>

        <ul className="new-campaign-topbar-links">
          <li><a href="/">Product</a></li>
          <li><a href="/dashboard">Dashboard</a></li>
          <li><a href="#">Pricing</a></li>
        </ul>

        <div className="new-campaign-topbar-right">
          <button className="new-campaign-topbar-icon" aria-label="Notifications">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
          <button className="new-campaign-topbar-icon" aria-label="Settings">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
          <div className="new-campaign-topbar-avatar" />
        </div>
      </header>

      {/* Main Content */}
      <div className="new-campaign-wrapper">
        <div className="new-campaign-body">
          {/* Left: Copy */}
          <div className="new-campaign-copy">
            <p className="new-campaign-label">Initialization Phase</p>
            <h1>
              Forge a New
              <br />
              Intelligence
              <br />
              Campaign
            </h1>
            <p>
              Define the parameters for your autonomous engine. Provide the source
              material, and our Obsidian core will refine it into high-impact
              digital assets.
            </p>

            <div className="new-campaign-features">
              <div className="new-campaign-feature">
                <div className="new-campaign-feature-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                <div className="new-campaign-feature-text">
                  <h3>Document Upload</h3>
                  <p>
                    Upload PDF or DOCX files to provide rich source material for
                    the autonomous content pipeline.
                  </p>
                </div>
              </div>

              <div className="new-campaign-feature">
                <div className="new-campaign-feature-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="17" y1="10" x2="3" y2="10" />
                    <line x1="21" y1="6" x2="3" y2="6" />
                    <line x1="21" y1="14" x2="3" y2="14" />
                    <line x1="17" y1="18" x2="3" y2="18" />
                  </svg>
                </div>
                <div className="new-campaign-feature-text">
                  <h3>Raw Text Input</h3>
                  <p>
                    Paste supplementary text or specific instructions to guide the
                    content generation engine.
                  </p>
                </div>
              </div>
            </div>

            <div className="new-campaign-status">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
              {isSubmitting ? "Status: Initializing Pipeline..." : "Status: Ready for Input"}
            </div>
          </div>

          {/* Right: Form */}
          <div className="new-campaign-form" id="campaign-form">
            {/* Error Banner */}
            {error && (
              <div className="form-error" style={{
                background: "rgba(255, 59, 48, 0.1)",
                border: "1px solid rgba(255, 59, 48, 0.3)",
                borderRadius: "8px",
                padding: "0.75rem 1rem",
                color: "#ff6b6b",
                fontSize: "0.85rem",
                marginBottom: "1rem",
              }}>
                {error}
              </div>
            )}

            {/* File Upload */}
            <div className="form-group">
              <label className="form-label">Upload Documents</label>
              <div
                className={`file-dropzone ${isDragging ? "dragging" : ""}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                id="file-dropzone"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) handleFiles(e.target.files);
                    e.target.value = "";
                  }}
                  style={{ display: "none" }}
                  id="file-input"
                />
                <div className="dropzone-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <p className="dropzone-text">
                  Drag & drop files here, or <span>browse</span>
                </p>
                <p className="dropzone-hint">
                  Supports PDF, DOCX, DOC, TXT — Max 10MB per file
                </p>
              </div>

              {/* Uploaded files list */}
              {files.length > 0 && (
                <div className="file-list">
                  {files.map((file, i) => (
                    <div className="file-item" key={i}>
                      <div className="file-item-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </div>
                      <div className="file-item-info">
                        <span className="file-item-name">{file.name}</span>
                        <span className="file-item-meta">
                          {file.type} · {formatFileSize(file.size)}
                        </span>
                      </div>
                      <button
                        className="file-item-remove"
                        onClick={() => removeFile(i)}
                        aria-label="Remove file"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Raw Text */}
            <div className="form-group">
              <label className="form-label" htmlFor="raw-text">
                Contextual Raw Text
              </label>
              <textarea
                id="raw-text"
                className="form-textarea"
                placeholder="Paste supplementary raw data or specific instructions here..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="form-actions">
              <button
                className="btn-initialize"
                onClick={handleInitialize}
                disabled={isSubmitting || (files.length === 0 && !rawText)}
                id="btn-initialize"
              >
                {isSubmitting ? (
                  <>
                    <span className="btn-spinner" style={{
                      display: "inline-block",
                      width: "14px",
                      height: "14px",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTop: "2px solid #fff",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                      marginRight: "8px",
                    }} />
                    Launching Pipeline...
                  </>
                ) : (
                  "Initialize Campaign"
                )}
              </button>
              <button className="btn-save-draft" id="btn-save-draft">
                Save Draft
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="new-campaign-footer">
          <span className="new-campaign-footer-copy">
            © 2024 Obsidian Intelligence. All rights reserved.
          </span>
          <ul className="new-campaign-footer-links">
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Security</a></li>
          </ul>
        </footer>
      </div>
    </>
  );
}
