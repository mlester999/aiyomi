"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { publicNavigation } from "@aiyomi/config";
import { Logo } from "./logo";
import { WaitlistButton } from "./waitlist-button";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Logo />
        <nav className="desktop-nav" aria-label="Main navigation">
          {publicNavigation.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <WaitlistButton source="navigation" className="button button-primary button-small" />
          <button
            type="button"
            className="menu-button"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen((current) => !current)}
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation">
          <div className="shell mobile-nav-inner">
            {publicNavigation.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </a>
            ))}
            <WaitlistButton source="mobile_navigation" className="button button-primary mobile-nav-cta" />
          </div>
        </nav>
      )}
    </header>
  );
}
