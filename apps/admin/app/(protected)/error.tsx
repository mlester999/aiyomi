"use client";

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <section className="state-card" role="alert">
      <span className="eyebrow">Temporary issue</span>
      <h1>We could not load this admin area</h1>
      <p>Try again. If the problem continues, share the request time with an owner.</p>
      <button className="button button-primary" onClick={reset} type="button">
        Try again
      </button>
    </section>
  );
}
