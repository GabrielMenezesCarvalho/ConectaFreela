"use client";

import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness, CheckCircle2, Clock, FileText, MapPin, Send, Sparkles, Users, X } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { TalentShell } from "@/components/talent-shell";
import { apiFetch, applicationStatusLabels, applicationStatusStyles, isAbortError, modalityLabels, opportunityAuthor, typeLabels, type Application, type Opportunity } from "@/lib/api";
import { useRequiredSession } from "@/lib/use-required-session";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

export function OpportunityDetail({ opportunityId }: { opportunityId: string }) {
  const user = useRequiredSession("TALENT");
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    Promise.all([
      apiFetch<Opportunity>(`/opportunities/${opportunityId}`, { signal: controller.signal, fallbackError: "Não foi possível carregar a oportunidade." }),
      apiFetch<Application | null>(`/applications/talents/${user.id}/opportunities/${opportunityId}`, { signal: controller.signal }),
    ]).then(([loadedOpportunity, loadedApplication]) => {
      setOpportunity(loadedOpportunity);
      setApplication(loadedApplication);
    }).catch((requestError) => {
      if (!isAbortError(requestError)) setError(requestError instanceof Error ? requestError.message : "Não foi possível conectar à API.");
    });
    return () => controller.abort();
  }, [opportunityId, user]);

  async function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !opportunity) return;
    const trimmedMessage = message.trim();
    if (trimmedMessage.length < 20) {
      setError("Escreva pelo menos 20 caracteres na mensagem de candidatura.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const created = await apiFetch<Application>("/applications", {
        method: "POST",
        body: JSON.stringify({ opportunityId, talentUserId: user.id, message: trimmedMessage }),
        fallbackError: "Não foi possível enviar sua candidatura.",
      });
      setApplication(created);
      setOpportunity((current) => current ? { ...current, _count: { applications: current._count.applications + 1 } } : current);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível conectar à API.");
    } finally {
      setPending(false);
    }
  }

  async function withdrawApplication() {
    if (!user || !application) return;
    setPending(true);
    setError("");
    try {
      const updated = await apiFetch<Application>(`/applications/${application.id}/withdraw`, {
        method: "PATCH",
        body: JSON.stringify({ talentUserId: user.id }),
        fallbackError: "Não foi possível retirar sua candidatura.",
      });
      setApplication(updated);
      setConfirmWithdraw(false);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível conectar à API.");
    } finally {
      setPending(false);
    }
  }

  if (!user) return <div className="min-h-screen bg-slate-50" />;

  return <TalentShell user={user}>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900" href="/oportunidades"><ArrowLeft className="size-4" /> Voltar às oportunidades</Link>
      <Link className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700" href="/candidaturas"><FileText className="size-4" /> Minhas candidaturas</Link>
    </div>
    {error && <p className="mt-6 rounded-xl bg-red-50 p-4 text-red-700" role="alert">{error}</p>}
    {!opportunity && !error && <p className="mt-8 text-slate-500">Carregando detalhes...</p>}
    {opportunity && <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
      <article className={`overflow-hidden rounded-2xl border bg-white ${opportunity.isFeatured ? "border-amber-300" : "border-slate-200"}`}>
        {opportunity.isFeatured && <div className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-400 px-6 py-2.5 text-sm font-bold text-amber-950 sm:px-8"><Sparkles className="size-4" /> Oportunidade destacada</div>}
        <div className="p-6 sm:p-8">
          <p className="font-semibold text-emerald-700">{opportunityAuthor(opportunity)}</p>
          <h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">{opportunity.title}</h1>
          <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
            <Info icon={BriefcaseBusiness} text={typeLabels[opportunity.type]} /><Info icon={MapPin} text={modalityLabels[opportunity.modality]} /><Info icon={Clock} text={opportunity.weeklyHours ? `${opportunity.weeklyHours} horas por semana` : "Carga horária a combinar"} /><Info icon={Users} text={`${opportunity._count.applications} candidaturas`} />
          </div>
        </div>
        <div className="border-t border-slate-100 p-6 sm:p-8">
          <h2 className="text-xl font-bold">Sobre a oportunidade</h2><p className="mt-4 whitespace-pre-line leading-7 text-slate-600">{opportunity.description}</p>
          <h2 className="mt-8 text-xl font-bold">Habilidades desejadas</h2><div className="mt-4 flex flex-wrap gap-2">{opportunity.skills.map((skill) => <span className="rounded-full bg-emerald-50 px-3.5 py-1.5 text-sm font-medium text-emerald-800" key={skill}>{skill}</span>)}</div>
          <div className="mt-8 rounded-xl bg-slate-50 p-5"><h3 className="font-bold">Antes de se candidatar</h3><ul className="mt-3 space-y-2 text-sm text-slate-600">{["Confira se a carga horária cabe na sua rotina", "Mantenha seu perfil e portfólio atualizados", "Escreva como sua experiência pode contribuir"].map((item) => <li className="flex gap-2" key={item}><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />{item}</li>)}</ul></div>
        </div>
      </article>
      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 lg:sticky lg:top-24">
        {application ? <ApplicationSummary application={application} pending={pending} confirmWithdraw={confirmWithdraw} onAskWithdraw={() => setConfirmWithdraw(true)} onCancelWithdraw={() => setConfirmWithdraw(false)} onWithdraw={withdrawApplication} /> : opportunity.status !== "ACTIVE" ? <><p className="text-sm font-semibold text-slate-500">Inscrições encerradas</p><h2 className="mt-2 text-xl font-bold">Esta oportunidade não recebe mais candidaturas.</h2></> : <form onSubmit={submitApplication}>
          <p className="text-sm text-slate-500">Interessado neste projeto?</p><h2 className="mt-1 text-xl font-bold">Envie sua candidatura</h2><p className="mt-3 text-sm leading-6 text-slate-500">Conte ao organizador por que você combina com esta oportunidade.</p>
          <label className="mt-5 block text-sm font-semibold" htmlFor="application-message">Mensagem</label><textarea className="input mt-2 min-h-36 resize-y" id="application-message" maxLength={1000} minLength={20} onChange={(event) => setMessage(event.target.value)} placeholder="Apresente sua experiência, disponibilidade e como pretende contribuir..." required value={message} />
          <div className="mt-1 flex justify-between text-xs text-slate-400"><span>Mínimo de 20 caracteres</span><span>{message.length}/1000</span></div>
          <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3.5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60" disabled={pending || message.trim().length < 20} type="submit"><Send className="size-4" /> {pending ? "Enviando..." : "Confirmar candidatura"}</button><p className="mt-4 text-center text-xs text-slate-400">Seu perfil profissional será compartilhado com o organizador.</p>
        </form>}
      </aside>
    </div>}
  </TalentShell>;
}

function ApplicationSummary({ application, pending, confirmWithdraw, onAskWithdraw, onCancelWithdraw, onWithdraw }: { application: Application; pending: boolean; confirmWithdraw: boolean; onAskWithdraw: () => void; onCancelWithdraw: () => void; onWithdraw: () => void }) {
  return <div><span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${applicationStatusStyles[application.status]}`}>{applicationStatusLabels[application.status]}</span><h2 className="mt-4 text-xl font-bold">Candidatura enviada</h2><p className="mt-2 text-sm text-slate-500">Enviada em {dateFormatter.format(new Date(application.createdAt))}</p><div className="mt-5 rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Sua mensagem</p><p className="mt-2 text-sm leading-6 text-slate-600">{application.message}</p></div><Link className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white" href="/candidaturas"><FileText className="size-4" /> Acompanhar candidaturas</Link>{application.status === "UNDER_REVIEW" && (confirmWithdraw ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4"><p className="text-sm text-red-800">Tem certeza? O envio não poderá ser refeito.</p><div className="mt-3 flex gap-2"><button className="flex-1 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold" onClick={onCancelWithdraw} type="button">Cancelar</button><button className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60" disabled={pending} onClick={onWithdraw} type="button">{pending ? "Retirando..." : "Confirmar"}</button></div></div> : <button className="mt-3 flex w-full items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-red-600" onClick={onAskWithdraw} type="button"><X className="size-4" /> Retirar candidatura</button>)}</div>;
}

function Info({ icon: Icon, text }: { icon: typeof Clock; text: string }) {
  return <div className="flex items-center gap-2.5 rounded-lg bg-slate-50 px-4 py-3 text-slate-600"><Icon className="size-4 text-emerald-700" />{text}</div>;
}
