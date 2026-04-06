"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { connectWebSocket, getCampaignStatus } from "@/lib/api";
import { CampaignStatus } from "@/lib/types";
import type { WSEvent } from "@/lib/types";
import "./processing.css";

interface PipelineStep {
  title: string;
  description: string;
  status: "completed" | "active" | "pending";
  progress?: number;
}

interface TerminalLog {
  time: string;
  type: "info" | "success" | "action" | "log" | "error";
  text: string;
}

const STATUS_TO_STEP_INDEX: Record<string, number> = {
  INIT: 0,
  INGESTING: 0,
  EXTRACTING: 1,
  GENERATING: 2,
  REVIEWING: 3,
  APPROVED: 4,
  FAILED: -1,
};

function getTimeStr(): string {
  const d = new Date();
  return d.toLocaleTimeString("en-US", { hour12: false });
}

export default function ProcessingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [steps, setSteps] = useState<PipelineStep[]>([
    {
      title: "Ingesting",
      description: "Connecting to knowledge base and aggregating raw data sources.",
      status: "active",
    },
    {
      title: "Extracting",
      description: "Analyzing content and extracting structured fact sheet.",
      status: "pending",
    },
    {
      title: "Generating",
      description: "Creating multi-channel content drafts from the fact sheet.",
      status: "pending",
    },
    {
      title: "Reviewing",
      description: "AI editor quality assurance and iterative refinement.",
      status: "pending",
    },
  ]);

  const [logs, setLogs] = useState<TerminalLog[]>([
    { time: getTimeStr(), type: "info", text: "Initializing Obsidian Factory Execution Engine..." },
    { time: getTimeStr(), type: "info", text: `Campaign ID: ${id}` },
    { time: getTimeStr(), type: "action", text: "Connecting to pipeline WebSocket..." },
  ]);

  const [wsConnected, setWsConnected] = useState(false);
  const [campaignError, setCampaignError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (type: TerminalLog["type"], text: string) => {
    setLogs((prev) => [...prev, { time: getTimeStr(), type, text }]);
  };

  const updateStepsForStatus = (status: string) => {
    const activeIdx = STATUS_TO_STEP_INDEX[status] ?? 0;

    setSteps((prev) =>
      prev.map((step, i) => ({
        ...step,
        status: i < activeIdx ? "completed" as const
          : i === activeIdx ? "active" as const
          : "pending" as const,
      }))
    );
  };

  // Poll campaign status as a fallback if WS disconnects
  useEffect(() => {
    if (wsConnected) return;

    const interval = setInterval(async () => {
      try {
        const data = await getCampaignStatus(id);
        updateStepsForStatus(data.status);

        if (data.status === CampaignStatus.APPROVED) {
          addLog("success", "Campaign completed successfully. Redirecting...");
          clearInterval(interval);
          setTimeout(() => router.push(`/dashboard/campaign/${id}`), 2000);
        } else if (data.status === CampaignStatus.FAILED) {
          setCampaignError(data.error_message || "Pipeline failed.");
          addLog("error", data.error_message || "Pipeline execution failed.");
          clearInterval(interval);
        }
      } catch {
        // Silently retry
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [id, wsConnected, router]);

  // WebSocket connection
  useEffect(() => {
    if (!id) return;

    const ws = connectWebSocket(
      id,
      (event: WSEvent) => {
        // Update terminal logs
        switch (event.type) {
          case "AGENT_STATUS":
            addLog("action", `[${event.agent}] ${event.message || event.status || "Processing..."}`);
            break;
          case "CAMPAIGN_STATUS":
            addLog("info", `Pipeline status: ${event.status || event.message || ""}`);
            if (event.status) updateStepsForStatus(event.status);
            break;
          case "DRAFT_UPDATE":
            addLog("success", `Draft update: ${event.message || "Content generated."}`);
            break;
          case "EDITOR_FEEDBACK":
            addLog("log", `Editor feedback: ${event.message || "Review complete."}`);
            break;
          case "COMPLETE":
            addLog("success", event.message || "Campaign approved and completed!");
            setSteps((prev) => prev.map((s) => ({ ...s, status: "completed" as const })));
            setTimeout(() => router.push(`/dashboard/campaign/${id}`), 2500);
            break;
          case "ERROR":
            addLog("error", event.message || "Pipeline error occurred.");
            setCampaignError(event.message || "Pipeline failed.");
            break;
        }
      },
      () => {
        addLog("error", "WebSocket connection error. Falling back to polling...");
        setWsConnected(false);
      },
      () => {
        addLog("info", "WebSocket connection closed.");
        setWsConnected(false);
      }
    );

    ws.onopen = () => {
      setWsConnected(true);
      addLog("success", "WebSocket connected. Receiving live pipeline events...");
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [id, router]);

  function getLogTypeLabel(type: string) {
    switch (type) {
      case "info": return "INFO";
      case "success": return "SUCCESS";
      case "action": return "ACTION";
      case "log": return "LOG";
      case "error": return "ERROR";
      default: return "INFO";
    }
  }

  return (
    <>
      <div className="processing-wrapper">
        {/* Left: Pipeline Stepper */}
        <div className="pipeline-panel">
          <div className="pipeline-header">
            <h1>Campaign Execution</h1>
            <p className="pipeline-task-id">Task ID: {id.slice(0, 12).toUpperCase()}</p>
          </div>

          <div className="pipeline-stepper">
            {steps.map((step, i) => {
              const isLast = i === steps.length - 1;
              const lineClass = step.status;

              return (
                <div className="pipeline-step" key={i} id={`pipeline-step-${i}`}>
                  <div className="step-indicator">
                    <div className={`step-dot ${step.status}`} />
                    {!isLast && <div className={`step-line ${lineClass}`} />}
                  </div>
                  <div className={`step-content ${step.status === "pending" ? "dimmed" : ""}`}>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>

                    {step.status === "completed" && (
                      <span className="step-status completed">Completed</span>
                    )}

                    {step.status === "active" && (
                      <div className="step-progress-label">
                        <span className="progress-icon" />
                        In Progress
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* System Status */}
          <div className="system-status-card" id="system-status">
            <div className="system-status-header">
              <div className="system-status-icon">
                {campaignError ? "⚠" : wsConnected ? "✓" : "ℹ"}
              </div>
              <h4>System Status</h4>
            </div>
            <div className="system-status-metrics">
              <div>
                <div className="system-metric-label">Connection</div>
                <div className="system-metric-value" style={{
                  color: campaignError ? "#ff6b6b" : wsConnected ? "#34d399" : "#fbbf24"
                }}>
                  {campaignError ? "Error" : wsConnected ? "Live" : "Polling"}
                </div>
              </div>
              <div>
                <div className="system-metric-label">Model</div>
                <div className="system-metric-value neutral">Groq LLM</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Terminal */}
        <div className="terminal-panel" id="execution-terminal">
          <div className="terminal-header">
            <div className="terminal-header-left">
              <div className="terminal-dots">
                <span className="terminal-dot red" />
                <span className="terminal-dot yellow" />
                <span className="terminal-dot green" />
              </div>
              <span className="terminal-title">
                factory@obsidian: ~/execution_logs/{id.slice(0, 8)}
              </span>
            </div>
            <div className="terminal-header-right">
              <span>{wsConnected ? "LIVE" : "POLL"}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
          </div>

          <div className="terminal-body" ref={terminalRef}>
            {logs.map((log, i) => (
              <span className="log-line" key={i}>
                <span className="log-timestamp">[{log.time}]</span>{" "}
                <span className={`log-${log.type}`}>
                  {getLogTypeLabel(log.type)}: {log.text}
                </span>
              </span>
            ))}
            <span className="log-line">
              <span className="log-cursor" />
            </span>
          </div>

          <div className="terminal-input">
            <span className="terminal-input-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 17 10 11 4 5" />
                <line x1="12" y1="19" x2="20" y2="19" />
              </svg>
            </span>
            <span className="terminal-input-prompt">$</span>
            <input
              type="text"
              placeholder="Watching pipeline execution..."
              id="terminal-command-input"
              readOnly
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="processing-footer">
        <span className="processing-footer-left">
          © 2024 Obsidian Intelligence. All rights reserved.
        </span>
        <ul className="processing-footer-links">
          <li><a href="#">Privacy Policy</a></li>
          <li><a href="#">Terms of Service</a></li>
        </ul>
        <button className="processing-chat-btn" aria-label="Chat" id="chat-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </footer>
    </>
  );
}
