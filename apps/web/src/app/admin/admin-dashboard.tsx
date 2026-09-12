"use client";

import { Activity, BadgeDollarSign, BriefcaseBusiness, Crown, Sparkles, Target, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { apiFetch, isAbortError } from "@/lib/api";
import { useRequiredSession } from "@/lib/use-required-session";

type Metrics = {
  totals: { totalUsers: number; talents: number; organizers: number; opportunities: number; applications: number };
  monetization: {
    activeSubscriptions: number; totalSubscriptions: number; paidTransactions: number;
    monthlyRecurringRevenueCents: number; monthlyPaymentFeesCents: number; netMonthlyRevenueCents: number;
    conversionRate: number; retentionRate: number;
    pricing: { monthlyPriceCents: number; paymentFeeCents: number };
    profitabilityTarget: { subscriptions: number; remainingSubscriptions: number; progress: number; grossRevenueCents: number; paymentFeesCents: number; netRevenueCents: number };
  };
  value: { activationRate: number; approvedApplicationRate: number; featuredOpportunities: number; featureAdoptionRate: number };
};

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function AdminDashboard() {
  const user = useRequiredSession("ADMIN");
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    apiFetch<Metrics>(`/admin/metrics?adminUserId=${user.id}`, { signal: controller.signal, fallbackError: "Não foi possível carregar as métricas." })
      .then(setMetrics)
      .catch((requestError) => { if (!isAbortError(requestError)) setError(requestError instanceof Error ? requestError.message : "Não foi possível conectar à API."); });
    return () => controller.abort();
  }, [user]);

  if (!user) return <div className="min-h-screen bg-[#f7f8f4]" />;

  return <DashboardShell homeHref="/admin" user={user}>
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p className="text-sm font-semibold text-emerald-700">Visão administrativa</p><h1 className="mt-1 font-display text-3xl sm:text-5xl">Saúde do produto</h1><p className="mt-2 text-sm text-slate-500">Receita, engajamento e progresso da meta Premium.</p></div>
      <span className="w-fit rounded-full bg-emerald-100 px-4 py-2 text-xs font-bold text-emerald-800">Dados em tempo real</span>
    </div>
    {error && <p className="mt-8 rounded-xl bg-red-50 p-4 text-red-700" role="alert">{error}</p>}
    {!metrics && !error && <p className="mt-8 text-slate-500">Calculando indicadores...</p>}

    {metrics && <>
      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard accent icon={BadgeDollarSign} label="Receita bruta mensal" value={money.format(metrics.monetization.monthlyRecurringRevenueCents / 100)} />
        <MetricCard icon={BadgeDollarSign} label="Receita líquida estimada" value={money.format(metrics.monetization.netMonthlyRevenueCents / 100)} detail={`${money.format(metrics.monetization.monthlyPaymentFeesCents / 100)} em taxas`} />
        <MetricCard icon={Crown} label="Assinantes ativos" value={String(metrics.monetization.activeSubscriptions)} detail={`${metrics.monetization.conversionRate}% dos organizadores`} />
        <MetricCard icon={Activity} label="Retenção Premium" value={`${metrics.monetization.retentionRate}%`} detail="assinaturas ainda ativas" />
      </section>

      <ProfitabilityGoal metrics={metrics.monetization} />

      <section className="mt-7 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
          <p className="text-sm font-semibold text-emerald-700">Funil de valor</p><h2 className="mt-1 text-xl font-bold">Da base à conversão</h2>
          <div className="mt-6 space-y-5"><Funnel label="Usuários cadastrados" value={metrics.totals.totalUsers} max={metrics.totals.totalUsers} /><Funnel label="Organizadores" value={metrics.totals.organizers} max={metrics.totals.totalUsers} /><Funnel premium label="Organizadores Premium" value={metrics.monetization.activeSubscriptions} max={metrics.totals.totalUsers} /></div>
        </article>
        <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-7">
          <p className="text-sm font-semibold text-amber-800">Uso do Premium</p><h2 className="mt-1 text-xl font-bold">Adoção de destaque</h2>
          <div className="mt-6 flex items-end gap-3"><span className="text-4xl font-bold sm:text-5xl">{metrics.value.featureAdoptionRate}%</span><span className="pb-1 text-sm text-slate-500">das oportunidades</span></div>
          <Progress value={metrics.value.featureAdoptionRate} amber />
          <p className="mt-4 flex items-center gap-2 text-sm text-slate-600"><Sparkles className="size-4 text-amber-600" />{metrics.value.featuredOpportunities} oportunidades destacadas</p>
        </article>
      </section>

      <section className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <SmallStat icon={Users} label="Talentos" value={metrics.totals.talents} />
        <SmallStat icon={BriefcaseBusiness} label="Oportunidades" value={metrics.totals.opportunities} />
        <SmallStat icon={Activity} label="Candidaturas" value={metrics.totals.applications} />
        <SmallStat icon={BadgeDollarSign} label="Transações pagas" value={metrics.monetization.paidTransactions} />
        <SmallStat icon={Target} label="Conversão em match" value={`${metrics.value.approvedApplicationRate}%`} />
      </section>
    </>}
  </DashboardShell>;
}

function ProfitabilityGoal({ metrics }: { metrics: Metrics["monetization"] }) {
  const target = metrics.profitabilityTarget;
  return <section className="mt-7 overflow-hidden rounded-2xl border border-emerald-800 bg-[#063d2c] p-5 text-white sm:p-8">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="text-sm font-semibold text-emerald-300">Meta de rentabilidade</p><h2 className="mt-2 text-xl font-bold sm:text-2xl">{metrics.activeSubscriptions} de {target.subscriptions} assinaturas mensais</h2><p className="mt-2 text-sm text-emerald-50/65">{target.remainingSubscriptions > 0 ? `Faltam ${target.remainingSubscriptions} assinaturas para atingir a meta.` : "Meta de rentabilidade atingida."}</p></div><span className="w-fit rounded-full bg-emerald-400/15 px-4 py-2 text-sm font-bold text-emerald-200">{target.progress}% da meta</span></div>
    <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-300" style={{ width: `${target.progress}%` }} /></div>
    <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 lg:grid-cols-4"><GoalValue label="Preço mensal" value={money.format(metrics.pricing.monthlyPriceCents / 100)} /><GoalValue label="Receita bruta na meta" value={money.format(target.grossRevenueCents / 100)} /><GoalValue label="Taxas na meta" value={`- ${money.format(target.paymentFeesCents / 100)}`} /><GoalValue highlight label="Receita líquida na meta" value={money.format(target.netRevenueCents / 100)} /></div>
  </section>;
}

function Progress({ value, amber = false }: { value: number; amber?: boolean }) { return <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200"><div className={`h-full rounded-full ${amber ? "bg-amber-500" : "bg-emerald-600"}`} style={{ width: `${Math.min(value, 100)}%` }} /></div>; }
function GoalValue({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) { return <div><p className="text-xs text-emerald-50/50">{label}</p><p className={`mt-1 text-base font-bold sm:text-lg ${highlight ? "text-emerald-300" : "text-white"}`}>{value}</p></div>; }
function MetricCard({ icon: Icon, label, value, detail, accent = false }: { icon: typeof Activity; label: string; value: string; detail?: string; accent?: boolean }) { return <article className={`rounded-2xl border p-5 ${accent ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white"}`}><div className="flex items-center justify-between gap-3"><p className="text-sm text-slate-500">{label}</p><Icon className={`size-5 shrink-0 ${accent ? "text-emerald-700" : "text-slate-400"}`} /></div><p className="mt-4 break-words text-2xl font-bold sm:text-3xl">{value}</p>{detail && <p className="mt-2 text-xs text-slate-400">{detail}</p>}</article>; }
function Funnel({ label, value, max, premium = false }: { label: string; value: number; max: number; premium?: boolean }) { const width = max ? Math.max((value / max) * 100, value ? 4 : 0) : 0; return <div><div className="mb-2 flex justify-between text-sm"><span className="text-slate-600">{label}</span><strong>{value}</strong></div><div className="h-7 overflow-hidden rounded-lg bg-slate-100"><div className={`h-full rounded-lg ${premium ? "bg-gradient-to-r from-amber-400 to-orange-400" : "bg-emerald-600"}`} style={{ width: `${width}%` }} /></div></div>; }
function SmallStat({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: number | string }) { return <article className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white p-4"><span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"><Icon className="size-5" /></span><div className="min-w-0"><p className="truncate text-xs text-slate-500">{label}</p><p className="text-lg font-bold">{value}</p></div></article>; }
