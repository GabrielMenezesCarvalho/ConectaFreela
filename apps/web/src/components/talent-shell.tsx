"use client";

import type { ReactNode } from "react";
import type { SessionUser } from "@/lib/auth-session";
import { DashboardShell } from "./dashboard-shell";

export function TalentShell({ user, children }: { user: SessionUser; children: ReactNode }) {
  return <DashboardShell homeHref="/oportunidades" user={user}>{children}</DashboardShell>;
}
