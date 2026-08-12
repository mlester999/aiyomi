import type { CSSProperties, ReactNode } from "react";

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const revealOffset = Math.max(0, delay) * 100;

  return (
    <div
      className={`reveal ${className ?? ""}`}
      style={{
        "--reveal-start": `${2 + revealOffset}%`,
        "--reveal-end": `${30 + revealOffset}%`,
      } as CSSProperties}
    >
      {children}
    </div>
  );
}
