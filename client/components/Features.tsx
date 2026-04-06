const features = [
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Real-time Optimization",
    description:
      "AI agents continuously monitor and optimize your content pipeline for maximum engagement, relevance, and conversion across every channel.",
  },
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: "Enterprise Security",
    description:
      "Multi-layered security with end-to-end encryption, role-based access control, and comprehensive audit logs for every content operation.",
  },
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
        <path d="M22 12A10 10 0 0 0 12 2v10z" />
      </svg>
    ),
    title: "Predictive Analytics",
    description:
      "Get deep insights into content performance with AI-powered predictions, trend analysis, and actionable recommendations.",
  },
];

export default function Features() {
  return (
    <section className="features" id="features">
      <div className="container">
        <div className="features-header">
          <p className="section-label">Core Modules</p>
          <h2>Engineered for Precision</h2>
        </div>
        <div className="features-grid">
          {features.map((feature, i) => (
            <div className="feature-card" key={i} id={`feature-card-${i}`}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
