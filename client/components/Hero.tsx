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

        {/* Hero Image */}
        <div className="hero-image-wrapper">
          <div className="hero-image-container">
            <div className="hero-image-dots">
              <span className="hero-image-dot" />
              <span className="hero-image-dot" />
              <span className="hero-image-dot" />
            </div>
            <Image
              src="/hero.png"
              alt="Autonomous content pipeline visualization"
              width={900}
              height={400}
              priority
            />
            {/* Stats bar */}
            <div className="hero-stats">
              <div className="hero-stat-item">
                <span className="hero-stat-label">Avg. Generation Time</span>
                <span className="hero-stat-value">12.4s</span>
              </div>
              <div className="hero-stat-item">
                <span className="hero-stat-label">Accuracy Improvement</span>
                <span className="hero-stat-value accent">33.09%</span>
              </div>
              <div className="hero-stat-badges">
                <span className="hero-stat-badge">-12.4s</span>
                <span className="hero-stat-badge highlight">33.09%</span>
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
