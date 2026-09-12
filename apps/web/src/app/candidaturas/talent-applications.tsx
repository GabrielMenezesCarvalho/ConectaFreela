"use client";

import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness, CalendarDays, MapPin, X } from "lucide-react";
import { useEffect, useState } from "react";
import { TalentShell } from "@/components/talent-shell";
import { apiFetch, applicationStatusLabels, applicationStatusStyles, isAbortError, modalityLabels, typeLabels, type Application } from "@/lib/api";
import { useRequiredSession } from "@/lib/use-required-session";

const dateFormatter = new Intl.DateTimeFormat("pt-BR");

export function TalentApplications() {
  const user = useRequiredSession("TALENT");
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    apiFetch<Application[]>(`/applications/talents/${user.id}`, { signal: controller.signal, fallbackError: "Não foi possível carregar suas candidaturas." })
      .then(setApplications)
      .catch((requestError) => { if (!isAbortError(requestError)) setError(requestError instanceof Error ? requestError.message : "Não foi possível conectar à API."); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [user]);

  async function withdraw(application: Application) {
    if (!user) return;
    setPendingId(application.id);
    setError("");
    try {
      const updated = await apiFetch<Application>(`/applications/${application.id}/withdraw`, { method: "PATCH", body: JSON.stringify({ talentUserId: user.id }), fallbackError: "Não foi possível retirar a candidatura." });
      setApplications((current) => current.map((item) => item.id === updated.id ? updated : item));
      setConfirmId(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível conectar à API.");
    } finally {
      setPendingId(null);
    }
  }

  if (!user) return <div className="min-h-screen bg-slate-50" />;
  const activeCount = applications.filter((item) => item.status === "UNDER_REVIEW").length;
  const approvedCount = applications.filter((item) => item.status === "APPROVED").length;

  return <TalentShell user={user}>
    <Link className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900" href="/oportunidades"><ArrowLeft className="size-4" /> Voltar ao feed</Link>
    <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-emerald-700">Sua jornada</p><h1 className="mt-1 font-display text-4xl">Minhas candidaturas</h1><p className="mt-2 text-sm text-slate-500">Acompanhe as respostas dos organizadores e revise seus envios.</p></div><div className="flex gap-3"><MiniStat label="Em análise" value={activeCount} /><MiniStat label="Aprovadas" value={approvedCount} /></div></div>
    {error && <p className="mt-6 rounded-xl bg-red-50 p-4 text-red-700" role="alert">{error}</p>}
    {loading && <p className="mt-8 text-slate-500">Carregando candidaturas...</p>}
    {!loading && !error && applications.length === 0 && <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><h2 className="text-xl font-bold">Você ainda não se candidatou.</h2><p className="mt-2 text-sm text-slate-500">Encontre um projeto compatível com suas habilidades.</p><Link className="mt-5 inline-flex rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white" href="/oportunidades">Explorar oportunidades</Link></div>}
    <div className="mt-8 space-y-4">{applications.map((application) => {
      const author = application.opportunity.organization?.name ?? application.opportunity.createdBy.name;
      return <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6" key={application.id}>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div className="min-w-0"><p className="text-sm font-semibold text-emerald-700">{author}</p><Link className="mt-1 block text-xl font-bold hover:text-emerald-700" href={`/oportunidades/${application.opportunity.id}`}>{application.opportunity.title}</Link><div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500"><span className="flex items-center gap-1.5"><BriefcaseBusiness className="size-3.5" />{typeLabels[application.opportunity.type]}</span><span className="flex items-center gap-1.5"><MapPin className="size-3.5" />{modalityLabels[application.opportunity.modality]}</span><span className="flex items-center gap-1.5"><CalendarDays className="size-3.5" />Enviada em {dateFormatter.format(new Date(application.createdAt))}</span></div></div><span className={`w-fit shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${applicationStatusStyles[application.status]}`}>{applicationStatusLabels[application.status]}</span></div>
        <div className="mt-5 rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Mensagem enviada</p><p className="mt-2 text-sm leading-6 text-slate-600">{application.message}</p></div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><Link className="text-sm font-bold text-emerald-700" href={`/oportunidades/${application.opportunity.id}`}>Ver oportunidade</Link>{application.status === "UNDER_REVIEW" && (confirmId === application.id ? <div className="flex items-center gap-2"><span className="text-xs text-red-700">Confirmar retirada?</span><button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold" onClick={() => setConfirmId(null)} type="button">Não</button><button className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60" disabled={pendingId === application.id} onClick={() => withdraw(application)} type="button">{pendingId === application.id ? "Retirando..." : "Sim, retirar"}</button></div> : <button className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600" onClick={() => setConfirmId(application.id)} type="button"><X className="size-4" /> Retirar candidatura</button>)}</div>
      </article>;
    })}</div>
  </TalentShell>;
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return <div className="min-w-24 rounded-xl border border-slate-200 bg-white px-4 py-3 text-center"><p className="text-2xl font-bold">{value}</p><p className="text-xs text-slate-500">{label}</p></div>;
}
