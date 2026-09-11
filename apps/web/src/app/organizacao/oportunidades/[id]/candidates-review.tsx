"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { OrganizerShell } from "@/components/organizer-shell";
import {
  apiFetch,
  applicationStatusLabels,
  applicationStatusStyles,
  isAbortError,
  modalityLabels,
  opportunityAuthor,
  opportunityStatusLabels,
  typeLabels,
  type Application,
  type ApplicationStatus,
  type Opportunity,
} from "@/lib/api";
import { useRequiredSession } from "@/lib/use-required-session";

const dateFormatter = new Intl.DateTimeFormat("pt-BR");

/** WITHDRAWN é decisão do talento, então não aparece como ação do organizador. */
const decisions: ApplicationStatus[] = [
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
];

export function CandidatesReview({ opportunityId }: { opportunityId: string }) {
  const user = useRequiredSession("ORGANIZATION");
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const controller = new AbortController();

    Promise.all([
      apiFetch<Opportunity>(`/opportunities/${opportunityId}`, {
        signal: controller.signal,
        fallbackError: "Não foi possível carregar a oportunidade.",
      }),
      apiFetch<Application[]>(
        `/opportunities/${opportunityId}/applications?organizerUserId=${user.id}`,
        {
          signal: controller.signal,
          fallbackError: "Não foi possível carregar as candidaturas.",
        },
      ),
    ])
      .then(([loadedOpportunity, loadedApplications]) => {
        setOpportunity(loadedOpportunity);
        setApplications(loadedApplications);
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
  }, [opportunityId, user]);

  async function decide(application: Application, status: ApplicationStatus) {
    if (!user || application.status === status) return;

    setError("");
    setPendingId(application.id);

    try {
      const updated = await apiFetch<Application>(
        `/applications/${application.id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ organizerUserId: user.id, status }),
          fallbackError: "Não foi possível atualizar a candidatura.",
        },
      );

      setApplications((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível conectar à API.",
      );
    } finally {
      setPendingId(null);
    }
  }

  if (!user) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  return (
    <OrganizerShell user={user}>
      <Link
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-800"
        href="/organizacao"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Voltar ao painel
      </Link>

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 p-4 text-red-700" role="alert">
          {error}
        </p>
      )}

      {isLoading && !error && (
        <p className="mt-6 text-slate-500">Carregando candidaturas...</p>
      )}

      {opportunity && (
        <div className="mt-6">
          <p className="text-sm font-semibold text-emerald-800">
            {opportunityAuthor(opportunity)}
          </p>
          <h1 className="mt-1 font-display text-3xl text-slate-950">
            {opportunity.title}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {typeLabels[opportunity.type]} ·{" "}
            {modalityLabels[opportunity.modality]} ·{" "}
            {opportunity.weeklyHours
              ? `${opportunity.weeklyHours}h/semana`
              : "Carga a combinar"}{" "}
            · {opportunityStatusLabels[opportunity.status]}
          </p>
        </div>
      )}

      {!isLoading && !error && applications.length === 0 && (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-slate-600">
            Nenhuma candidatura recebida até agora.
          </p>
        </div>
      )}

      {applications.length > 0 && (
        <>
          <h2 className="mt-10 text-xl font-semibold">
            Candidatos ({applications.length})
          </h2>

          <div className="mt-4 space-y-4">
            {applications.map((application) => (
              <article
                className="rounded-xl border border-slate-200 bg-white p-5"
                key={application.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-950">
                      {application.talent.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {application.talent.email}
                      {application.talent.talentProfile && (
                        <>
                          {" · "}
                          {application.talent.talentProfile.availability}
                        </>
                      )}
                    </p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                        applicationStatusStyles[application.status]
                      }`}
                    >
                      {applicationStatusLabels[application.status]}
                    </span>
                    <p className="mt-1.5 text-xs text-slate-400">
                      Candidatura em{" "}
                      {dateFormatter.format(new Date(application.createdAt))}
                    </p>
                  </div>
                </div>

                {application.talent.talentProfile &&
                  application.talent.talentProfile.skills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {application.talent.talentProfile.skills.map((skill) => (
                        <span
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
                          key={skill}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-500">
                    Mensagem de candidatura
                  </p>
                  <p className="mt-1.5 text-sm leading-6 text-slate-600">
                    {application.message}
                  </p>
                </div>

                {application.talent.talentProfile?.portfolioLinks.map(
                  (link) => (
                    <a
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-800"
                      href={link}
                      key={link}
                      rel="noreferrer noopener"
                      target="_blank"
                    >
                      <ExternalLink aria-hidden className="size-3.5" />
                      {link}
                    </a>
                  ),
                )}

                {application.status === "WITHDRAWN" ? (
                  <p className="mt-5 text-sm text-slate-500">
                    Candidatura retirada pelo talento.
                  </p>
                ) : (
                  <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                    {decisions.map((decision) => {
                      const active = application.status === decision;

                      return (
                        <button
                          className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                            active
                              ? "border-emerald-600 bg-emerald-600 text-white"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                          }`}
                          disabled={pendingId === application.id || active}
                          key={decision}
                          onClick={() => decide(application, decision)}
                          type="button"
                        >
                          {applicationStatusLabels[decision]}
                        </button>
                      );
                    })}
                  </div>
                )}
              </article>
            ))}
          </div>
        </>
      )}
    </OrganizerShell>
  );
}
