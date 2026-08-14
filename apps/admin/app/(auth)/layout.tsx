import { BrandLockup } from "@/components/brand-lockup";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <BrandLockup />
        {children}
        <p className="auth-security-note">
          Authorized Aiyomi team members only. Access is recorded and reviewed.
        </p>
      </section>
    </main>
  );
}
