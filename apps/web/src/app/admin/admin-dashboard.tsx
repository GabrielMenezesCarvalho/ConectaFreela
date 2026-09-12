"use client";

import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  BadgeDollarSign,
  BriefcaseBusiness,
  Crown,
  LogOut,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { apiFetch, isAbortError } from "@/lib/api";
import { clearSession } from "@/lib/auth-session";
import { useRequiredSession } from "@/lib/use-required-session";

type Metrics = {
  totals: {
    totalUsers: number;
    talents: number;
    organizers: number;
    opportunities: number;
    applications: number;
  };
  monetization: {
    activeSubscriptions: number;
    totalSubscriptions: number;
    paidTransactions: number;
    monthlyRecurringRevenueCents: number;
    monthlyPaymentFeesCents: number;
    netMonthlyRevenueCents: number;
    conversionRate: number;
    retentionRate: number;
    pricing: { monthlyPriceCents: number; paymentFeeCents: number };
    profitabilityTarget: {
      subscriptions: number;
      remainingSubscriptions: number;
      progress: number;
      grossRevenueCents: number;
      paymentFeesCents: number;
      netRevenueCents: number;
    };
  };
  value: {
    activationRate: number;
    approvedApplicationRate: number;
    featuredOpportunities: number;
    featureAdoptionRate: number;
  };
};

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function AdminDashboard() {
  const user = useRequiredSession("ADMIN");
  const router = useRouter();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    apiFetch<Metrics>(`/admin/metrics?adminUserId=${user.id}`, {
      signal: controller.signal,
      fallbackError: "Não foi possível carregar as métricas.",
    })
      .then(setMetrics)
      .catch((requestError) => {
        if (!isAbortError(requestError)) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Não foi possível conectar à API.",
          );
        }
      });
    return () => controller.abort();
  }, [user]);

  if (!user) return <div className="min-h-screen bg-slate-950" />;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link className="rounded-lg bg-white px-3 py-2" href="/admin">
            <BrandLogo compact />
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-400 sm:inline">
              {user.name} · ADM
            </span>
            <button
              className="flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold"
              onClick={() => {
                clearSession();
                router.replace("/entrar");
              }}
            >
              <LogOut className="size-4" /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <p className="text-sm font-semibold text-emerald-400">Visão executiva</p>
        <h1 className="mt-1 font-display text-4xl sm:text-5xl">Saúde do produto</h1>
        <p className="mt-3 text-slate-400">
          Receita, custos de pagamento e progresso da meta Premium.
        </p>

        {error && (
          <p className="mt-8 rounded-xl bg-red-950/50 p-4 text-red-300" role="alert">
            {error}
          </p>
        )}
        {!metrics && !error && <p className="mt-8 text-slate-400">Calculando indicadores...</p>}

        {metrics && (
          <>
            <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                accent
                icon={BadgeDollarSign}
                label="Receita bruta mensal"
                value={money.format(metrics.monetization.monthlyRecurringRevenueCents / 100)}
              />
              <MetricCard
                icon={BadgeDollarSign}
                label="Receita líquida estimada"
                value={money.format(metrics.monetization.netMonthlyRevenueCents / 100)}
                detail={`${money.format(metrics.monetization.monthlyPaymentFeesCents / 100)} em taxas`}
              />
              <MetricCard
                icon={Crown}
                label="Assinantes ativos"
                value={String(metrics.monetization.activeSubscriptions)}
                detail={`${metrics.monetization.conversionRate}% dos organizadores`}
              />
              <MetricCard
                icon={Activity}
                label="Retenção Premium"
                value={`${metrics.monetization.retentionRate}%`}
                detail="assinaturas ainda ativas"
              />
            </section>

            <ProfitabilityGoal metrics={metrics.monetization} />

            <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-emerald-400">Funil de valor</p>
                    <h2 className="mt-1 text-xl font-bold">Da base à conversão</h2>
                  </div>
                  <ArrowUpRight className="text-slate-500" />
                </div>
                <div className="mt-7 space-y-5">
                  <Funnel label="Usuários cadastrados" value={metrics.totals.totalUsers} max={metrics.totals.totalUsers} />
                  <Funnel label="Organizadores" value={metrics.totals.organizers} max={metrics.totals.totalUsers} />
                  <Funnel premium label="Organizadores Premium" value={metrics.monetization.activeSubscriptions} max={metrics.totals.totalUsers} />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <p className="text-sm font-semibold text-amber-300">Uso do Premium</p>
                <h2 className="mt-1 text-xl font-bold">Adoção de destaque</h2>
                <div className="mt-7 flex items-end gap-3">
                  <span className="text-5xl font-bold">{metrics.value.featureAdoptionRate}%</span>
                  <span className="pb-1 text-sm text-slate-400">das oportunidades</span>
                </div>
                <Progress value={metrics.value.featureAdoptionRate} amber />
                <p className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                  <Sparkles className="size-4 text-amber-300" />
                  {metrics.value.featuredOpportunities} oportunidades destacadas
                </p>
              </div>
            </section>

            <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <SmallStat icon={Users} label="Talentos" value={metrics.totals.talents} />
              <SmallStat icon={BriefcaseBusiness} label="Oportunidades" value={metrics.totals.opportunities} />
              <SmallStat icon={Activity} label="Candidaturas" value={metrics.totals.applications} />
              <SmallStat icon={BadgeDollarSign} label="Transações pagas" value={metrics.monetization.paidTransactions} />
              <SmallStat icon={Target} label="Conversão em match" value={`${metrics.value.approvedApplicationRate}%`} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function ProfitabilityGoal({ metrics }: { metrics: Metrics["monetization"] }) {
  const target = metrics.profitabilityTarget;
  return (
    <section className="mt-8 rounded-2xl border border-emerald-400/30 bg-gradient-to-r from-emerald-950 to-slate-900 p-6 sm:p-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-semibold text-emerald-400">Meta de rentabilidade</p>
          <h2 className="mt-2 text-2xl font-bold">
            {metrics.activeSubscriptions} de {target.subscriptions} assinaturas mensais
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {target.remainingSubscriptions > 0
              ? `Faltam ${target.remainingSubscriptions} assinaturas para atingir a meta informada.`
              : "Meta atingida. A operação entrou na faixa de rentabilidade planejada."}
          </p>
        </div>
        <span className="w-fit rounded-full bg-emerald-400/15 px-4 py-2 text-sm font-bold text-emerald-300">
          {target.progress}% da meta
        </span>
      </div>
      <Progress value={target.progress} />
      <div className="mt-6 grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-4">
        <GoalValue label="Preço mensal" value={money.format(metrics.pricing.monthlyPriceCents / 100)} />
        <GoalValue label="Receita bruta na meta" value={money.format(target.grossRevenueCents / 100)} />
        <GoalValue label="Taxas na meta" value={`- ${money.format(target.paymentFeesCents / 100)}`} />
        <GoalValue label="Receita líquida na meta" value={money.format(target.netRevenueCents / 100)} highlight />
      </div>
    </section>
  );
}

function Progress({ value, amber = false }: { value: number; amber?: boolean }) {
  return (
    <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
      <div
        className={`h-full rounded-full ${amber ? "bg-gradient-to-r from-amber-400 to-orange-400" : "bg-emerald-400"}`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

function GoalValue({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return <div><p className="text-xs text-slate-500">{label}</p><p className={`mt-1 text-lg font-bold ${highlight ? "text-emerald-300" : "text-white"}`}>{value}</p></div>;
}

function MetricCard({ icon: Icon, label, value, detail, accent = false }: { icon: typeof Activity; label: string; value: string; detail?: string; accent?: boolean }) {
  return <article className={`rounded-2xl border p-5 ${accent ? "border-emerald-400/40 bg-emerald-400/10" : "border-white/10 bg-white/[0.04]"}`}><div className="flex items-center justify-between"><p className="text-sm text-slate-400">{label}</p><Icon className={`size-5 ${accent ? "text-emerald-400" : "text-slate-500"}`} /></div><p className="mt-4 text-3xl font-bold">{value}</p>{detail && <p className="mt-2 text-xs text-slate-500">{detail}</p>}</article>;
}

function Funnel({ label, value, max, premium = false }: { label: string; value: number; max: number; premium?: boolean }) {
  const width = max ? Math.max((value / max) * 100, value ? 4 : 0) : 0;
  return <div><div className="mb-2 flex justify-between text-sm"><span className="text-slate-300">{label}</span><strong>{value}</strong></div><div className="h-8 overflow-hidden rounded-lg bg-white/5"><div className={`h-full rounded-lg ${premium ? "bg-gradient-to-r from-amber-400 to-orange-400" : "bg-emerald-600"}`} style={{ width: `${width}%` }} /></div></div>;
}

function SmallStat({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: number | string }) {
  return <article className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4"><span className="flex size-10 items-center justify-center rounded-lg bg-white/5 text-slate-400"><Icon className="size-5" /></span><div><p className="text-xs text-slate-500">{label}</p><p className="text-lg font-bold">{value}</p></div></article>;
}
