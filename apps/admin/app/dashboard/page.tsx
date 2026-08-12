import type { Metadata } from "next";

const readinessItems = [
  {
    number: "01",
    title: "Accessible shell",
    description:
      "Semantic landmarks, clear focus states, readable contrast, and a responsive navigation pattern are in place.",
  },
  {
    number: "02",
    title: "Route foundation",
    description:
      "The dashboard is available now, while future admin areas are visible and clearly marked as planned.",
  },
  {
    number: "03",
    title: "Safe baseline",
    description:
      "The app builds without secrets and contains no authentication, provider credentials, or live data access.",
  },
] as const;

const boundaries = [
  "No admin sign-in or authorization flow",
  "No user, waitlist, or subscription records",
  "No analytics, operational controls, or write actions",
  "No AI provider configuration or server credentials",
] as const;

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="dashboard">
      <section className="hero-panel" aria-labelledby="dashboard-title">
        <div className="hero-copy">
          <span className="section-kicker">Foundation status</span>
          <h1 id="dashboard-title">
            A calm starting point for Aiyomi operations.
          </h1>
          <p>
            This workspace establishes the admin application shell and route
            direction. Product management tools will arrive only in their
            approved phases.
          </p>
        </div>

        <div className="foundation-card">
          <span aria-hidden="true" className="foundation-icon">
            ✓
          </span>
          <div>
            <strong>Shell ready</strong>
            <p>Routing, responsive layout, and navigation placeholders are set.</p>
          </div>
        </div>
      </section>

      <section className="content-section" aria-labelledby="ready-title">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Available now</span>
            <h2 id="ready-title">Ready in this phase</h2>
          </div>
          <p>A small, dependable base for future bounded work.</p>
        </div>

        <div className="readiness-grid">
          {readinessItems.map((item) => (
            <article className="readiness-card" key={item.number}>
              <span aria-hidden="true" className="card-number">
                {item.number}
              </span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="boundary-panel" aria-labelledby="boundaries-title">
        <div>
          <span className="section-kicker">Intentionally not connected</span>
          <h2 id="boundaries-title">Clear foundation boundaries</h2>
          <p>
            This is not a functioning administration system yet. It includes no
            private data surface and no controls that can change product state.
          </p>
        </div>
        <ul>
          {boundaries.map((boundary) => (
            <li key={boundary}>
              <span aria-hidden="true">×</span>
              {boundary}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
