import Link from "next/link";

export function Logo({ compact = false, linked = true }: { compact?: boolean; linked?: boolean }) {
  const content = (
    <>
      <img className="brand-mark" src="/aiyomi-logo-cropped.png" alt="" width={904} height={991} aria-hidden="true" />
      {!compact && <span>Aiyomi</span>}
    </>
  );

  if (!linked) {
    return <span className="brand-logo" aria-hidden="true">{content}</span>;
  }

  return (
    <Link className="brand-logo" href="/" aria-label="Aiyomi home">
      {content}
    </Link>
  );
}
