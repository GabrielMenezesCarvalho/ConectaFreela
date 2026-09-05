"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  clearSession,
  readSession,
  type SessionUser,
} from "@/lib/auth-session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333/api";

type Opportunity = {
  id: string;
  title: string;
  organization: string;
  category: string;
  skills: string[];
  description: string;
};

export function RoleDashboard({
  requiredRole,
  title,
  description,
}: {
  requiredRole: SessionUser["role"];
  title: string;
  description: string;
}) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const currentUser = readSession();
    if (!currentUser || currentUser.role !== requiredRole) {
      router.replace("/entrar");
      return;
    }

    let isActive = true;
    const controller = new AbortController();
    queueMicrotask(() => {
      if (isActive) setUser(currentUser);
    });

    fetch(`${API_URL}/opportunities`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok)
          throw new Error("Não foi possível carregar a listagem.");
        return (await response.json()) as Opportunity[];
      })
      .then(setOpportunities)
      .catch((requestError: unknown) => {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) {
          return;
        }
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Não foi possível conectar à API.",
        );
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [requiredRole, router]);

  function logout() {
    clearSession();
    router.replace("/entrar");
  }

  if (!user) {
    return <main className="min-h-screen bg-slate-50" />;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Olá, {user.name}</p>
            <h1 className="mt-1 text-3xl font-semibold">{title}</h1>
            <p className="mt-2 text-sm text-slate-500">{description}</p>
          </div>
          <button
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold"
            type="button"
            onClick={logout}
          >
            Sair
          </button>
        </header>

        {error && (
          <p
            className="mt-8 rounded-lg bg-red-50 p-4 text-red-700"
            role="alert"
          >
            {error}
          </p>
        )}

        {!error && opportunities.length === 0 && (
          <p className="mt-8 text-slate-500">Carregando oportunidades...</p>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {opportunities.map((opportunity) => (
            <article
              className="rounded-xl border border-slate-200 bg-white p-5"
              key={opportunity.id}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                {opportunity.category}
              </p>
              <h2 className="mt-2 text-xl font-semibold">
                {opportunity.title}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {opportunity.organization}
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                {opportunity.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {opportunity.skills.map((skill) => (
                  <span
                    className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-800"
                    key={skill}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
