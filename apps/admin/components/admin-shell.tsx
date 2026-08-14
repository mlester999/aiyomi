"use client";

import {
  BarChart3,
  BookOpenCheck,
  ClipboardList,
  Flag,
  Gauge,
  HeartHandshake,
  Menu,
  Settings,
  ShieldCheck,
  UserCog,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { BrandLockup } from "@/components/brand-lockup";
import {
  hasPermission,
  roleLabels,
  type AdminMember,
  type AdminPermission,
} from "@/lib/admin/contracts";
import { logoutAction } from "@/lib/auth/actions";
import type { DeploymentEnvironment } from "@/lib/env";

const navigation: ReadonlyArray<{
  label: string;
  items: ReadonlyArray<{
    label: string;
    href: string;
    permission: AdminPermission;
    icon: typeof Gauge;
  }>;
}> = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", permission: "dashboard.read", icon: Gauge },
    ],
  },
  {
    label: "Growth",
    items: [
      { label: "Waitlist", href: "/waitlist", permission: "waitlist.read", icon: ClipboardList },
      { label: "Analytics", href: "/analytics", permission: "analytics.read", icon: BarChart3 },
      { label: "Referrals", href: "/referrals", permission: "referrals.read", icon: HeartHandshake },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Audit logs", href: "/audit-logs", permission: "audit.read", icon: BookOpenCheck },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Admins", href: "/admins", permission: "admins.read", icon: UserCog },
      { label: "Feature flags", href: "/feature-flags", permission: "feature_flags.read", icon: Flag },
      { label: "Settings", href: "/settings", permission: "settings.read", icon: Settings },
    ],
  },
];

const environmentLabels: Record<DeploymentEnvironment, string> = {
  development: "Development",
  staging: "Staging",
  production: "Production",
};

interface AdminShellProps {
  member: AdminMember;
  environment: DeploymentEnvironment | null;
  children: React.ReactNode;
}

export function AdminShell({ member, environment, children }: AdminShellProps) {
  const pathname = usePathname();
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [mobileNavigation, setMobileNavigation] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const identity = member.displayName ?? member.email;

  useEffect(() => {
    const media = window.matchMedia("(max-width: 860px)");
    const synchronize = () => {
      setMobileNavigation(media.matches);
      if (!media.matches) setNavigationOpen(false);
    };

    synchronize();
    media.addEventListener("change", synchronize);
    return () => media.removeEventListener("change", synchronize);
  }, []);

  useEffect(() => {
    if (!navigationOpen) return;

    const focusFrame = window.requestAnimationFrame(() => {
      sidebarRef.current
        ?.querySelector<HTMLElement>(".sidebar-navigation a[href]")
        ?.focus();
    });
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setNavigationOpen(false);
      menuButtonRef.current?.focus();
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [navigationOpen]);

  const closeNavigationAndRestoreFocus = () => {
    setNavigationOpen(false);
    menuButtonRef.current?.focus();
  };

  return (
    <div className="admin-shell">
      <a className="skip-link" href="#admin-content">
        Skip to content
      </a>

      <header className="mobile-bar">
        <BrandLockup compact />
        <button
          aria-controls="admin-sidebar"
          aria-expanded={navigationOpen}
          aria-label={navigationOpen ? "Close navigation" : "Open navigation"}
          className="icon-button"
          onClick={() => setNavigationOpen((value) => !value)}
          ref={menuButtonRef}
          type="button"
        >
          {navigationOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </header>

      {navigationOpen && (
        <button
          aria-label="Close navigation"
          className="sidebar-scrim"
          onClick={closeNavigationAndRestoreFocus}
          tabIndex={-1}
          type="button"
        />
      )}

      <aside
        aria-hidden={mobileNavigation && !navigationOpen ? true : undefined}
        className={`sidebar${navigationOpen ? " sidebar-open" : ""}`}
        id="admin-sidebar"
        inert={mobileNavigation && !navigationOpen ? true : undefined}
        ref={sidebarRef}
      >
        <BrandLockup />
        <nav aria-label="Admin navigation" className="sidebar-navigation">
          {navigation.map((section) => {
            const items = section.items.filter((item) =>
              hasPermission(member, item.permission),
            );

            if (!items.length) return null;

            return (
              <section className="nav-section" key={section.label}>
                <h2>{section.label}</h2>
                <ul>
                  {items.map((item) => {
                    const active =
                      pathname === item.href || pathname.startsWith(`${item.href}/`);
                    const Icon = item.icon;

                    return (
                      <li key={item.href}>
                        <Link
                          aria-current={active ? "page" : undefined}
                          className={`nav-item${active ? " nav-item-active" : ""}`}
                          href={item.href}
                          onClick={() => {
                            if (mobileNavigation) {
                              closeNavigationAndRestoreFocus();
                            }
                          }}
                        >
                          <Icon aria-hidden="true" size={18} strokeWidth={2} />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </nav>

        <div className="future-note">
          <ShieldCheck aria-hidden="true" size={18} />
          <span>
            <strong>Secure workspace</strong>
            <small>Future product controls remain unavailable.</small>
          </span>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <span
            className={`environment-pill environment-${environment ?? "missing"}`}
            title="This label comes from the server deployment configuration."
          >
            <span aria-hidden="true" className="status-dot" />
            {environment ? environmentLabels[environment] : "Environment not set"}
          </span>

          <details className="account-menu">
            <summary>
              <span className="avatar" aria-hidden="true">
                {identity.slice(0, 1).toUpperCase()}
              </span>
              <span className="account-summary-copy">
                <strong>{identity}</strong>
                <small>{roleLabels[member.role]}</small>
              </span>
            </summary>
            <div className="account-popover">
              <p>{member.email}</p>
              <span className="badge badge-neutral">{roleLabels[member.role]}</span>
              <form action={logoutAction}>
                <button className="button button-secondary button-full" type="submit">
                  Sign out
                </button>
              </form>
            </div>
          </details>
        </header>

        <main className="page-content" id="admin-content">
          {children}
        </main>
        <footer className="admin-footer">
          Aiyomi Admin. Authorized operations only.
        </footer>
      </div>
    </div>
  );
}
