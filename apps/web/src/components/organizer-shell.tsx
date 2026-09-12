"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Crown } from "lucide-react";
import { clearSession, type SessionUser } from "@/lib/auth-session";
import { BrandLogo } from "./brand-logo";

export function OrganizerShell({
  user,
  children,
}: {
  user: SessionUser;
  children: ReactNode;
}) {
  const router = useRouter();

  function logout() {
    clearSession();
    router.replace("/entrar");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/organizacao">
            <BrandLogo compact />
          </Link>

          <div className="flex items-center gap-4">
            <Link
              className={`hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold sm:inline-flex ${user.isPremium ? "bg-amber-100 text-amber-800" : "bg-emerald-50 text-emerald-800"}`}
              href="/organizacao/premium"
            >
              <Crown aria-hidden className="size-3.5" />
              {user.isPremium ? "Premium" : "Conheça o Premium"}
            </Link>
            <span className="hidden text-sm text-slate-500 sm:inline">
              {user.name}
            </span>
            <button
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold"
              type="button"
              onClick={logout}
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">{children}</main>
    </div>
  );
}
