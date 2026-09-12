"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Check,
  Crown,
  Sparkles,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { OrganizerShell } from "@/components/organizer-shell";
import { apiFetch, type PremiumSubscription } from "@/lib/api";
import { useRequiredSession } from "@/lib/use-required-session";

const benefits = [
  {
    icon: Sparkles,
    title: "Oportunidades destacadas",
    text: "Ganhe prioridade na vitrine e atraia talentos compatíveis primeiro.",
  },
  {
    icon: BarChart3,
    title: "Mais visibilidade",
    text: "Amplie o alcance das publicações mais importantes da sua organização.",
  },
  {
    icon: Zap,
    title: "Conexões mais rápidas",
    text: "Destaque projetos sem depender apenas da ordem de publicação.",
  },
];

const freeFeatures = [
  "Publicar oportunidades",
  "Receber candidaturas",
  "Gerenciar candidatos",
];

const premiumFeatures = [
  "Tudo do plano Gratuito",
  "Destaques ilimitados",
  "Prioridade para talentos compatíveis",
  "Identidade visual Premium",
];

export function PremiumOffer() {
  const user = useRequiredSession("ORGANIZATION");
  const [subscription, setSubscription] =
    useState<PremiumSubscription | null>(null);

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    apiFetch<PremiumSubscription | null>(
      `/premium/organizers/${user.id}/subscription`,
      { signal: controller.signal },
    )
      .then(setSubscription)
      .catch(() => undefined);
    return () => controller.abort();
  }, [user]);

  if (!user) return <div className="min-h-screen bg-slate-50" />;
  const isPremium = subscription?.status === "ACTIVE" || user.isPremium;

  return (
    <OrganizerShell user={{ ...user, isPremium }}>
      <Link
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
        href="/organizacao"
      >
        <ArrowLeft className="size-4" aria-hidden /> Voltar ao painel
      </Link>

      <section className="relative mt-6 overflow-hidden rounded-[2rem] bg-[#063d2c] px-6 py-12 text-white sm:px-12 sm:py-16">
        <div className="absolute -right-16 -top-20 size-72 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-300 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-950">
            <Crown className="size-4" /> ConectaFreela Premium
          </span>
          <h1 className="mt-6 font-display text-4xl leading-tight sm:text-6xl">
            Seus melhores projetos merecem ser vistos.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-emerald-50/80">
            Mais alcance e prioridade por um preço simples, transparente e sem taxas adicionais.
          </p>
          {isPremium && (
            <div className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 font-semibold text-amber-200">
              <Check className="size-5" /> Seu plano Premium está ativo
            </div>
          )}
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        <PlanCard
          description="Para começar a publicar e conhecer talentos."
          features={freeFeatures}
          name="Gratuito"
          price="R$ 0"
        />
        <PlanCard
          description="Para oportunidades que precisam chegar às pessoas certas."
          features={premiumFeatures}
          isCurrent={Boolean(isPremium)}
          name="Premium"
          price="R$ 30,00"
          premium
        />
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {benefits.map(({ icon: Icon, title, text }) => (
          <article
            className="rounded-2xl border border-slate-200 bg-white p-6"
            key={title}
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Icon className="size-5" />
            </span>
            <h2 className="mt-5 text-lg font-bold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
          </article>
        ))}
      </section>
    </OrganizerShell>
  );
}

function PlanCard({
  name,
  price,
  description,
  features,
  premium = false,
  isCurrent = false,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  premium?: boolean;
  isCurrent?: boolean;
}) {
  return (
    <article
      className={`relative rounded-2xl border p-6 sm:p-8 ${
        premium
          ? "border-amber-300 bg-gradient-to-br from-amber-50 to-white shadow-lg shadow-amber-100"
          : "border-slate-200 bg-white"
      }`}
    >
      {premium && (
        <span className="absolute right-5 top-5 rounded-full bg-amber-300 px-3 py-1 text-xs font-bold text-amber-950">
          Mais visibilidade
        </span>
      )}
      <p className={`font-bold ${premium ? "text-amber-800" : "text-slate-500"}`}>
        {name}
      </p>
      <p className="mt-3 text-4xl font-bold">
        {price}
        <span className="ml-1 text-base font-normal text-slate-500">/mês</span>
      </p>
      <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
      <ul className="mt-6 space-y-3">
        {features.map((feature) => (
          <li className="flex gap-2.5 text-sm text-slate-700" key={feature}>
            <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
            {feature}
          </li>
        ))}
      </ul>
      {premium &&
        (isCurrent ? (
          <div className="mt-7 rounded-xl bg-emerald-100 px-5 py-3 text-center font-bold text-emerald-800">
            Seu plano atual
          </div>
        ) : (
          <Link
            className="mt-7 block rounded-xl bg-emerald-700 px-5 py-3 text-center font-bold text-white hover:bg-emerald-800"
            href="/organizacao/premium/assinar"
          >
            Assinar Premium por R$ 30,00
          </Link>
        ))}
    </article>
  );
}
