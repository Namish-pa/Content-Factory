"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: "Campaigns",
    href: "/dashboard/campaign",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar" id="dashboard-sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-text">
          <h3>Core Control</h3>
          <span>Autonomous Engine</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`sidebar-nav-item ${
              item.label === "Dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href)
                ? "active"
                : ""
            }`}
            id={`sidebar-${item.label.toLowerCase()}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer" />

      <Link href="/campaign/new" className="sidebar-launch-btn" id="launch-campaign-btn">
        <span>Launch Campaign</span>
      </Link>
    </aside>
  );
}
