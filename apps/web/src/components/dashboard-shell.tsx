"use client";

import Link from "next/link";
import { Crown, LogOut, MessagesSquare, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { clearSession, type SessionUser } from "@/lib/auth-session";
import { useUnreadMessages } from "@/lib/use-unread-messages";
import { BrandLogo } from "./brand-logo";

export function DashboardShell({
  user,
  homeHref,
  children,
  showPremium = false,
}: {
  user: SessionUser;
  homeHref: string;
  children: ReactNode;
  showPremium?: boolean;
}) {
  const router = useRouter();
  const unread = useUnreadMessages(user.id);

  function logout() {
    clearSession();
    router.replace("/entrar");
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f8f4] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-emerald-950/10 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link className="min-w-0 shrink" href={homeHref}>
            <BrandLogo compact />
          </Link>

          <nav className="flex shrink-0 items-center gap-1.5 sm:gap-2" aria-label="Conta">
            <Link
              className="relative flex size-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 sm:h-10 sm:w-auto sm:px-3"
              href="/mensagens"
              title="Mensagens"
            >
              <MessagesSquare aria-hidden className="size-4" />
              <span className="ml-1.5 hidden text-xs font-bold sm:inline">Mensagens</span>
              {unread.total > 0 && (
                <span
                  className="absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[11px] font-bold leading-5 text-white ring-2 ring-white sm:static sm:ml-1.5 sm:ring-0"
                  aria-label={`${unread.total} mensagens nao lidas`}
                >
                  {unread.total > 99 ? "99+" : unread.total}
                </span>
              )}
            </Link>
            {showPremium && (
              <Link
                className={`flex size-10 items-center justify-center rounded-xl sm:h-10 sm:w-auto sm:px-3 ${
                  user.isPremium
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-50 text-emerald-800"
                }`}
                href="/organizacao/premium"
                title={user.isPremium ? "Plano Premium" : "Conheça o Premium"}
              >
                <Crown aria-hidden className="size-4" />
                <span className="ml-1.5 hidden text-xs font-bold sm:inline">
                  {user.isPremium ? "Premium" : "Ver Premium"}
                </span>
              </Link>
            )}

            <Link
              className="flex min-w-0 items-center gap-2 rounded-xl px-2 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 sm:px-3"
              href="/perfil"
              title="Meu perfil"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <UserRound className="size-4" />
              </span>
              <span className="hidden max-w-36 truncate text-sm font-semibold md:block">
                {user.name}
              </span>
            </Link>

            <button
              className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
              type="button"
              onClick={logout}
              aria-label="Sair"
              title="Sair"
            >
              <LogOut className="size-4" />
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        {children}
      </main>
    </div>
  );
}
