# Waitlist email delivery

The waitlist database write completes before the API returns success. Resend
audience synchronization and confirmation delivery are scheduled with Next.js
`after()`, so provider latency does not change the public new or duplicate
response path. Provider calls also have a bounded timeout.

This Phase 1A delivery path is best effort. Missing Resend configuration and
provider failures never discard a stored signup. Before launch-scale email,
add a durable outbox with idempotency keys, retry limits, backoff, monitoring,
and a dead-letter review path.
