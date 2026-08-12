import type { Metadata } from "next";
import Link from "next/link";

import "./globals.css";

const navigation = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", available: true }],
  },
  {
    label: "People",
    items: [
      { label: "Users", href: "/users", available: false },
      { label: "Waitlist", href: "/waitlist", available: false },
      { label: "Referrals", href: "/referrals", available: false },
      { label: "Subscriptions", href: "/subscriptions", available: false },
    ],
  },
  {
    label: "Insights",
    items: [{ label: "Analytics", href: "/analytics", available: false }],
  },
  {
    label: "AI systems",
    items: [
      { label: "Providers", href: "/ai/providers", available: false },
      { label: "Models", href: "/ai/models", available: false },
      { label: "Prompts", href: "/ai/prompts", available: false },
      { label: "Usage and costs", href: "/ai/usage", available: false },
    ],
  },
  {
    label: "Companion world",
    items: [
      { label: "Companions", href: "/companions", available: false },
      { label: "Cosmetics", href: "/cosmetics", available: false },
      { label: "Achievements", href: "/achievements", available: false },
      { label: "Quests", href: "/quests", available: false },
      { label: "Rewards", href: "/rewards", available: false },
    ],
  },
  {
    label: "Community",
    items: [
      { label: "Competitions", href: "/competitions", available: false },
      { label: "Leaderboards", href: "/leaderboards", available: false },
      { label: "Anti-abuse", href: "/anti-abuse", available: false },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Email", href: "/email", available: false },
      { label: "Feature flags", href: "/feature-flags", available: false },
      { label: "Settings", href: "/settings", available: false },
      { label: "Audit logs", href: "/audit-logs", available: false },
    ],
  },
] as const;

export const metadata: Metadata = {
  title: {
    default: "Aiyomi Admin",
    template: "%s | Aiyomi Admin",
  },
  description: "The internal administration foundation for Aiyomi.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#admin-content">
          Skip to content
        </a>
        <div className="admin-shell">
          <aside className="sidebar">
            <Link
              aria-label="Aiyomi admin dashboard"
              className="brand"
              href="/dashboard"
            >
              <span aria-hidden="true" className="brand-mark">
                A
              </span>
              <span>
                <strong>Aiyomi</strong>
                <small>Admin workspace</small>
              </span>
            </Link>

            <details className="nav-disclosure">
              <summary>
                <span>Admin areas</span>
                <span aria-hidden="true" className="summary-cue">
                  Browse
                </span>
              </summary>
              <div className="nav-sections">
                <nav aria-label="Admin navigation">
                  {navigation.map((section) => (
                    <section className="nav-section" key={section.label}>
                      <h2>{section.label}</h2>
                      <ul>
                        {section.items.map((item) => (
                          <li key={item.href}>
                            {item.available ? (
                              <Link
                                aria-current="page"
                                className="nav-item nav-item-active"
                                href={item.href}
                              >
                                <span aria-hidden="true" className="nav-dot" />
                                <span>{item.label}</span>
                              </Link>
                            ) : (
                              <span
                                aria-disabled="true"
                                className="nav-item nav-item-planned"
                                title={`${item.href} is planned`}
                              >
                                <span aria-hidden="true" className="nav-dot" />
                                <span>{item.label}</span>
                                <span className="planned-label">Planned</span>
                                <span className="sr-only">Route {item.href}.</span>
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </nav>
              </div>
            </details>

            <div className="sidebar-note">
              <span aria-hidden="true" className="status-dot" />
              <span>
                <strong>Foundation only</strong>
                <small>No live systems connected</small>
              </span>
            </div>
          </aside>

          <div className="main-column">
            <header className="topbar">
              <div>
                <span className="topbar-eyebrow">Internal workspace</span>
                <span className="topbar-title">Phase 0 foundation</span>
              </div>
              <span className="phase-pill">
                <span aria-hidden="true" className="status-dot" />
                Foundation status
              </span>
            </header>
            <main className="page-content" id="admin-content">
              {children}
            </main>
            <footer className="admin-footer">
              Aiyomi admin foundation. No production data is connected.
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
