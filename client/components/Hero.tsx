import Image from "next/image";

export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="container">
        <div className="hero-content">
          <h1>
            Autonomous Intelligence
            <br />
            for the Modern Enterprise
          </h1>
          <p className="hero-subtitle">
            Deploy AI-driven fact-checked, brand-faithful blog posts, emails, and
            social threads. Our autonomous pipeline produces production-ready content in
            seconds.
          </p>
          <div className="hero-ctas">
            <a href="/campaign/new" className="btn-primary" id="cta-get-started">
              Get Started
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
            <a href="#" className="btn-secondary" id="cta-watch-demo">
              Watch demo
            </a>
          </div>
        </div>

        {/* Hero UI Mockup */}
        <div className="hero-image-wrapper">
          <div className="hero-image-container">
            <div className="hero-ui-mockup">
              <div className="mockup-card">
                <span className="mockup-card-title">Generation Flow</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-blue)' }}></div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontStyle: 'italic' }}>Reading source documents... 100%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-blue)' }}></div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>Fact-checking claims against verified data...</span>
                    <span className="mockup-cursor"></span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Draft: Product Keynote Script</span>
                  <div className="mockup-line"></div>
                  <div className="mockup-line medium"></div>
                  <div className="mockup-line short"></div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', opacity: 0.6 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Draft: Social Thread Expansion</span>
                  <div className="mockup-line"></div>
                  <div className="mockup-line medium"></div>
                </div>
              </div>

              <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '15px', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(235, 180, 100, 0.1)', fontSize: '0.65rem', color: 'var(--accent-blue)', border: '1px solid rgba(235, 180, 100, 0.2)' }}>EN-US</div>
                    <div style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>Professional Tone</div>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Pipeline: 8.4 docs/min</span>
                </div>
              </div>
            </div>
            
            {/* Stats bar */}
            <div className="hero-stats">
              <div className="hero-stat-item">
                <span className="hero-stat-label">Generation Speed</span>
                <span className="hero-stat-value">Instant</span>
              </div>
              <div className="hero-stat-item">
                <span className="hero-stat-label">Model Precision</span>
                <span className="hero-stat-value accent">99.2%</span>
              </div>
              <div className="hero-stat-badges">
                <span className="hero-stat-badge">Ready</span>
                <span className="hero-stat-badge highlight">Optimized</span>
              </div>
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="hero-checklist">
          <div className="hero-check-item">
            <span className="hero-check-icon">✓</span>
            <span>Multi-channel content factory in real-time</span>
          </div>
          <div className="hero-check-item">
            <span className="hero-check-icon">✓</span>
            <span>Fact-checked AI-generated output with full audit trail</span>
          </div>
          <div className="hero-check-item">
            <span className="hero-check-icon">✓</span>
            <span>Zero-config deployment with enterprise-grade SLAs</span>
          </div>
        </div>
      </div>
    </section>
  );
}
