"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { clearSession, type SessionUser } from "@/lib/auth-session";
import { BrandLogo } from "./brand-logo";

export function TalentShell({ user, children }: { user: SessionUser; children: ReactNode }) {
  const router = useRouter();
  return <div className="min-h-screen bg-slate-50 text-slate-950">
    <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8"><Link href="/oportunidades"><BrandLogo compact /></Link><div className="flex items-center gap-4"><span className="hidden text-sm text-slate-500 sm:inline">{user.name}</span><button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold" onClick={() => { clearSession(); router.replace("/entrar"); }}><LogOut className="size-4" /> Sair</button></div></div></header>
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">{children}</main>
  </div>;
}
