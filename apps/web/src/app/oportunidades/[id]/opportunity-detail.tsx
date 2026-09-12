"use client";

import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness, CheckCircle2, Clock, MapPin, Send, Sparkles, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { TalentShell } from "@/components/talent-shell";
import { apiFetch, isAbortError, modalityLabels, opportunityAuthor, typeLabels, type Opportunity } from "@/lib/api";
import { useRequiredSession } from "@/lib/use-required-session";

export function OpportunityDetail({ opportunityId }: { opportunityId: string }) {
  const user = useRequiredSession("TALENT");
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [error, setError] = useState("");
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    apiFetch<Opportunity>(`/opportunities/${opportunityId}`, { signal: controller.signal, fallbackError: "Não foi possível carregar a oportunidade." }).then(setOpportunity).catch((requestError) => { if (!isAbortError(requestError)) setError(requestError instanceof Error ? requestError.message : "Não foi possível conectar à API."); });
    return () => controller.abort();
  }, [opportunityId, user]);

  if (!user) return <div className="min-h-screen bg-slate-50" />;
  return <TalentShell user={user}>
    <Link className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900" href="/oportunidades"><ArrowLeft className="size-4" /> Voltar às oportunidades</Link>
    {error && <p className="mt-6 rounded-xl bg-red-50 p-4 text-red-700" role="alert">{error}</p>}
    {!opportunity && !error && <p className="mt-8 text-slate-500">Carregando detalhes...</p>}
    {opportunity && <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
      <article className={`overflow-hidden rounded-2xl border bg-white ${opportunity.isFeatured ? "border-amber-300" : "border-slate-200"}`}>
        {opportunity.isFeatured && <div className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-400 px-7 py-2.5 text-sm font-bold text-amber-950"><Sparkles className="size-4" /> Oportunidade destacada</div>}
        <div className="p-6 sm:p-8"><p className="font-semibold text-emerald-700">{opportunityAuthor(opportunity)}</p><h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">{opportunity.title}</h1><div className="mt-6 grid gap-3 text-sm sm:grid-cols-2"><Info icon={BriefcaseBusiness} text={typeLabels[opportunity.type]} /><Info icon={MapPin} text={modalityLabels[opportunity.modality]} /><Info icon={Clock} text={opportunity.weeklyHours ? `${opportunity.weeklyHours} horas por semana` : "Carga horária a combinar"} /><Info icon={Users} text={`${opportunity._count.applications} candidaturas`} /></div></div>
        <div className="border-t border-slate-100 p-6 sm:p-8"><h2 className="text-xl font-bold">Sobre a oportunidade</h2><p className="mt-4 whitespace-pre-line leading-7 text-slate-600">{opportunity.description}</p><h2 className="mt-8 text-xl font-bold">Habilidades desejadas</h2><div className="mt-4 flex flex-wrap gap-2">{opportunity.skills.map((skill) => <span className="rounded-full bg-emerald-50 px-3.5 py-1.5 text-sm font-medium text-emerald-800" key={skill}>{skill}</span>)}</div><div className="mt-8 rounded-xl bg-slate-50 p-5"><h3 className="font-bold">Antes de se candidatar</h3><ul className="mt-3 space-y-2 text-sm text-slate-600">{["Confira se a carga horária cabe na sua rotina", "Mantenha seu perfil e portfólio atualizados", "Prepare uma mensagem contando como você pode contribuir"].map(item => <li className="flex gap-2" key={item}><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />{item}</li>)}</ul></div></div>
      </article>
      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 lg:sticky lg:top-6"><p className="text-sm text-slate-500">Interessado neste projeto?</p><h2 className="mt-1 text-xl font-bold">Dê o próximo passo</h2><p className="mt-3 text-sm leading-6 text-slate-500">Revise seu perfil e envie uma mensagem personalizada ao organizador.</p><button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3.5 font-bold text-white" onClick={() => setShowNotice(true)}><Send className="size-4" /> Quero me candidatar</button>{showNotice && <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800" role="status">Tudo pronto para a próxima etapa: o formulário de candidatura será conectado aqui.</p>}<p className="mt-4 text-center text-xs text-slate-400">Seu perfil será compartilhado apenas ao confirmar.</p></aside>
    </div>}
  </TalentShell>;
}

function Info({ icon: Icon, text }: { icon: typeof Clock; text: string }) { return <div className="flex items-center gap-2.5 rounded-lg bg-slate-50 px-4 py-3 text-slate-600"><Icon className="size-4 text-emerald-700" />{text}</div>; }
