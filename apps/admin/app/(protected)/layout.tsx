import { AdminShell } from "@/components/admin-shell";
import { requireActiveAdmin } from "@/lib/auth/authorization";
import { getDeploymentEnvironment } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const member = await requireActiveAdmin();
  const environment = getDeploymentEnvironment();

  return (
    <AdminShell environment={environment} member={member}>
      {children}
    </AdminShell>
  );
}
