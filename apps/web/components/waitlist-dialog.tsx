"use client";

import { Check, LoaderCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { trackEvent } from "@aiyomi/analytics";
import { Mascot } from "./mascot";

type PlatformInterest = "ios" | "android" | "both";
type WaitlistSource = "hero" | "navigation" | "final_cta" | "mobile_navigation";

type WaitlistEvent = CustomEvent<{ source?: WaitlistSource }>;

const platformOptions: Array<{ value: PlatformInterest; label: string }> = [
  { value: "ios", label: "iOS" },
  { value: "android", label: "Android" },
  { value: "both", label: "Both" },
];

function cleanParam(value: string | null) {
  return value?.trim().slice(0, 120) || undefined;
}

export function WaitlistDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState<WaitlistSource>("hero");
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [platform, setPlatform] = useState<PlatformInterest | "">("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const open = (event: Event) => {
      const detail = (event as WaitlistEvent).detail;
      const nextSource = detail?.source ?? "hero";
      setSource(nextSource);
      trackEvent("waitlist_started", { source: nextSource });
      setStartedAt(Date.now());
      setError("");
      if (status === "success") {
        setStatus("idle");
        setPlatform("");
      }
      if (!dialog.open) dialog.showModal();
      window.setTimeout(() => emailRef.current?.focus(), 40);
    };

    window.addEventListener("aiyomi:open-waitlist", open);
    return () => window.removeEventListener("aiyomi:open-waitlist", open);
  }, [status]);

  function closeDialog() {
    dialogRef.current?.close();
  }

  async function submitWaitlist(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!platform) {
      setError("Choose where you would like to meet Aiyomi first.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const params = new URLSearchParams(window.location.search);
    setError("");
    setStatus("submitting");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          firstName: form.get("firstName") || undefined,
          platformInterest: platform,
          marketingConsent: form.get("marketingConsent") === "on",
          website: form.get("website") || "",
          formStartedAt: startedAt,
          source: "landing_page",
          utmSource: cleanParam(params.get("utm_source")),
          utmMedium: cleanParam(params.get("utm_medium")),
          utmCampaign: cleanParam(params.get("utm_campaign")),
          utmContent: cleanParam(params.get("utm_content")),
          utmTerm: cleanParam(params.get("utm_term")),
          referralCode: cleanParam(params.get("ref")),
          locale: navigator.language,
        }),
      });
      const result = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) {
        throw new Error(result.error || "We could not save your spot right now.");
      }
      setStatus("success");
      trackEvent("waitlist_completed", { source, platform });
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "We could not save your spot right now.";
      setError(message);
      setStatus("idle");
      trackEvent("waitlist_failed", { source, reason: "request_failed" });
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="waitlist-dialog"
      aria-labelledby="waitlist-title"
      onClick={(event) => {
        if (event.target === dialogRef.current) closeDialog();
      }}
    >
      <div className="dialog-card">
        <button className="dialog-close" type="button" onClick={closeDialog} aria-label="Close waitlist form">
          <X aria-hidden="true" />
        </button>

        {status === "success" ? (
          <div className="waitlist-success" aria-live="polite">
            <div className="success-mascot-wrap">
              <Mascot variant="mori" size="medium" pose="celebrate" mood="proud" label="Mori celebrating your waitlist signup" />
              <span className="success-spark success-spark-one" aria-hidden="true">✦</span>
              <span className="success-spark success-spark-two" aria-hidden="true">✦</span>
            </div>
            <span className="eyebrow">Your spot is saved</span>
            <h2 id="waitlist-title">You&apos;re in 🌱</h2>
            <p>We&apos;ll let you know when your companion is ready.</p>
            <button className="button button-primary" type="button" onClick={closeDialog}>
              Lovely, thank you
              <Check size={18} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div className="waitlist-form-wrap">
            <div className="dialog-heading">
              <span className="dialog-companion" aria-hidden="true"><Mascot variant="mori" size="small" pose="wave" decorative /></span>
              <div>
                <span className="eyebrow">Come grow with us</span>
                <h2 id="waitlist-title">Meet your companion early.</h2>
                <p>Join the list for thoughtful launch updates and early access news.</p>
              </div>
            </div>

            <form className="waitlist-form" onSubmit={submitWaitlist} noValidate>
              <div className="form-grid">
                <label className="field-group">
                  <span>First name <small>Optional</small></span>
                  <input name="firstName" type="text" autoComplete="given-name" maxLength={80} placeholder="Ari" />
                </label>
                <label className="field-group">
                  <span>Email address</span>
                  <input ref={emailRef} name="email" type="email" autoComplete="email" maxLength={254} required placeholder="you@example.com" />
                </label>
              </div>

              <fieldset className="platform-fieldset">
                <legend>Preferred platform</legend>
                <div className="platform-options">
                  {platformOptions.map((option) => (
                    <label key={option.value} className={`platform-option ${platform === option.value ? "is-selected" : ""}`}>
                      <input
                        type="radio"
                        name="platformInterest"
                        value={option.value}
                        checked={platform === option.value}
                        onChange={() => {
                          setPlatform(option.value);
                          trackEvent("platform_selected", { platform: option.value });
                        }}
                      />
                      <span>{option.label}</span>
                      <i aria-hidden="true"><Check /></i>
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="consent-row">
                <input name="marketingConsent" type="checkbox" />
                <span>Send me occasional product notes and early access updates. I can unsubscribe anytime.</span>
              </label>

              <label className="honey-field" aria-hidden="true">
                Website
                <input name="website" type="text" tabIndex={-1} autoComplete="off" />
              </label>

              <div className="form-message" role="alert" aria-live="assertive">
                {error}
              </div>

              <button className="button button-primary button-full" type="submit" disabled={status === "submitting"}>
                {status === "submitting" ? (
                  <>
                    <LoaderCircle className="spin" size={19} aria-hidden="true" />
                    Saving your spot
                  </>
                ) : (
                  <>Join the Waitlist <span aria-hidden="true">🌱</span></>
                )}
              </button>
              <p className="form-privacy">Your information stays private. No spam, no selling your data.</p>
            </form>
          </div>
        )}
      </div>
    </dialog>
  );
}
