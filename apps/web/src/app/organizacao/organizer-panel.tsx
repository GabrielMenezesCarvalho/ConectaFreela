"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { OpportunityCard } from "@/components/opportunity-card";
import { FeatureOpportunityButton } from "@/components/feature-opportunity-button";
import { OrganizerShell } from "@/components/organizer-shell";
import { apiFetch, isAbortError, type Opportunity, type PremiumSubscription } from "@/lib/api";
import { useRequiredSession } from "@/lib/use-required-session";

export function OrganizerPanel() {
  const user = useRequiredSession("ORGANIZATION");
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [subscription, setSubscription] = useState<PremiumSubscription | null>(null);

  useEffect(() => {
    if (!user) return;

    const controller = new AbortController();

    Promise.all([
      apiFetch<Opportunity[]>(`/opportunities?createdByUserId=${user.id}`, { signal: controller.signal, fallbackError: "Não foi possível carregar suas oportunidades." }),
      apiFetch<PremiumSubscription | null>(`/premium/organizers/${user.id}/subscription`, { signal: controller.signal }),
    ])
      .then(([list, subscription]) => {
        setOpportunities(list);
        setSubscription(subscription);
        setIsLoading(false);
      })
      .catch((requestError: unknown) => {
        if (isAbortError(requestError)) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Não foi possível conectar à API.",
        );
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [user]);

  if (!user) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  const totalApplications = opportunities.reduce(
    (total, opportunity) => total + opportunity._count.applications,
    0,
  );
  const activeCount = opportunities.filter(
    (opportunity) => opportunity.status === "ACTIVE",
  ).length;
  const isPremium = subscription?.status === "ACTIVE";
  const remainingCredits = subscription?.featuredCredits ?? 0;

  return (
    <OrganizerShell user={{ ...user, isPremium }}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-slate-950">
            Painel do organizador
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Acompanhe suas oportunidades e as pessoas que se candidataram.
          </p>
        </div>

        <Link
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          href="/organizacao/publicar"
        >
          <Plus aria-hidden className="size-4" />
          Nova oportunidade
        </Link>
      </div>

      {error && (
        <p className="mt-8 rounded-lg bg-red-50 p-4 text-red-700" role="alert">
          {error}
        </p>
      )}

      {!error && (
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Oportunidades" value={opportunities.length} />
          <SummaryCard label="Ativas" value={activeCount} />
          <SummaryCard label="Candidaturas" value={totalApplications} />
          <SummaryCard label="Destaques restantes" value={remainingCredits} accent={isPremium} />
        </section>
      )}

      <h2 className="mt-10 text-xl font-semibold">Suas oportunidades</h2>

      {isLoading && !error && (
        <p className="mt-4 text-slate-500">Carregando oportunidades...</p>
      )}

      {!isLoading && !error && opportunities.length === 0 && (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-slate-600">
            Você ainda não publicou nenhuma oportunidade.
          </p>
          <Link
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700"
            href="/organizacao/publicar"
          >
            <Plus aria-hidden className="size-4" />
            Publicar a primeira
          </Link>
        </div>
      )}

      {opportunities.length > 0 && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {opportunities.map((opportunity) => (
            <div className="flex flex-col gap-3" key={opportunity.id}>
              <OpportunityCard href={`/organizacao/oportunidades/${opportunity.id}`} opportunity={opportunity} />
              <div className="flex justify-end">
                <FeatureOpportunityButton opportunity={opportunity} organizerUserId={user.id} isPremium={isPremium} remainingCredits={remainingCredits} onFeatured={(updated, credits) => { setOpportunities((current) => current.map((item) => item.id === updated.id ? updated : item)); setSubscription((current) => current ? { ...current, featuredCredits: credits } : current); }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </OrganizerShell>
  );
}

function SummaryCard({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  return (
    <article className={`rounded-xl border p-5 ${accent ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white"}`}>
      <p className={accent ? "text-sm text-amber-800" : "text-sm text-slate-500"}>{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${accent ? "text-amber-950" : ""}`}>{value}</p>
    </article>
  );
}
