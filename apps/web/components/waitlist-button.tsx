"use client";

import { ArrowRight } from "lucide-react";
import { trackEvent } from "@aiyomi/analytics";

type WaitlistButtonProps = {
  source: "hero" | "navigation" | "final_cta" | "mobile_navigation";
  className?: string;
  children?: React.ReactNode;
};

export function WaitlistButton({
  source,
  className = "button button-primary",
  children = "Join the Waitlist",
}: WaitlistButtonProps) {
  function openWaitlist() {
    if (source === "hero") trackEvent("hero_waitlist_clicked", { source });
    if (source === "final_cta") trackEvent("final_cta_clicked", { source });
    window.dispatchEvent(
      new CustomEvent("aiyomi:open-waitlist", { detail: { source } }),
    );
  }

  return (
    <button className={className} type="button" onClick={openWaitlist}>
      <span>{children}</span>
      <ArrowRight size={18} strokeWidth={2.5} aria-hidden="true" />
    </button>
  );
}
