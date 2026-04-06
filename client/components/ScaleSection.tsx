"use client";

import { useEffect, useRef } from "react";

const metrics = [
  { name: "Content Quality Score", value: "94.2%", fill: 94, colorClass: "fill-blue" },
  { name: "Fact-Check Accuracy", value: "99.1%", fill: 99, colorClass: "fill-violet" },
  { name: "Pipeline Throughput", value: "87.6%", fill: 87, colorClass: "fill-purple" },
  { name: "Audience Relevance", value: "91.4%", fill: 91, colorClass: "fill-cyan" },
];

export default function ScaleSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const fills = entry.target.querySelectorAll<HTMLDivElement>(
              ".scale-progress-fill"
            );
            fills.forEach((fill) => {
              fill.style.width = fill.style.getPropertyValue("--fill");
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="scale" id="scale" ref={sectionRef}>
      <div className="container">
        <div className="scale-inner">
          <div className="scale-text">
            <p className="section-label">Why ContentFactory</p>
            <h2>
              Scale Without the
              <br />
              Operational Overhead
            </h2>
            <p>
              Unleash AI-driven, end-to-end content creation that scales with your
              ambitions. From product briefs to polished multi-channel campaigns in
              seconds — not weeks.
            </p>
            <div className="scale-bullets">
              <div className="scale-bullet">
                <span className="scale-bullet-num">1</span>
                <span>Multi-agent pipeline factoring in real-time data</span>
              </div>
              <div className="scale-bullet">
                <span className="scale-bullet-num">2</span>
                <span>Fact-check and brand-safety built into every draft</span>
              </div>
              <div className="scale-bullet">
                <span className="scale-bullet-num">3</span>
                <span>Zero-config workflow, from input to publication</span>
              </div>
            </div>
          </div>

          <div className="scale-terminal">
            <div className="scale-terminal-header">
              <span className="scale-terminal-title">Pipeline Metrics</span>
              <div className="scale-terminal-dots">
                <span className="scale-terminal-dot" />
                <span className="scale-terminal-dot" />
                <span className="scale-terminal-dot" />
              </div>
            </div>
            <div className="scale-terminal-body">
              {metrics.map((metric, i) => (
                <div className="scale-metric" key={i}>
                  <div className="scale-metric-header">
                    <span className="scale-metric-name">{metric.name}</span>
                    <span className="scale-metric-value">{metric.value}</span>
                  </div>
                  <div className="scale-progress-track">
                    <div
                      className={`scale-progress-fill ${metric.colorClass}`}
                      style={
                        { "--fill": `${metric.fill}%`, width: "0%" } as React.CSSProperties
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
