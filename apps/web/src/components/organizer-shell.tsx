import type { ReactNode } from "react";
import type { SessionUser } from "@/lib/auth-session";
import { DashboardShell } from "./dashboard-shell";

export function OrganizerShell({
  user,
  children,
}: {
  user: SessionUser;
  children: ReactNode;
}) {
  return (
    <DashboardShell homeHref="/organizacao" showPremium user={user}>
      {children}
    </DashboardShell>
  );
}
