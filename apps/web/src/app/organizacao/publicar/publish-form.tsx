"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { OrganizerShell } from "@/components/organizer-shell";
import {
  apiFetch,
  isAbortError,
  modalityLabels,
  typeLabels,
  type Modality,
  type Opportunity,
  type OpportunityType,
  type Organization,
} from "@/lib/api";
import { useRequiredSession } from "@/lib/use-required-session";

/**
 * Mesmo vocabulário usado nos perfis de talento — competências digitadas livremente
 * não cruzariam com o que os talentos cadastraram.
 */
const skillCatalog = [
  "Comunicação",
  "Design gráfico",
  "Figma",
  "Gestão de projetos",
  "JavaScript",
  "Marketing digital",
  "Node.js",
  "Pesquisa acadêmica",
  "React",
  "Redação",
  "TypeScript",
  "UX Research",
];

const weeklyHoursOptions = [5, 10, 20, 40];

export function PublishForm() {
  const user = useRequiredSession("ORGANIZATION");
  const router = useRouter();

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [publishAsOrganization, setPublishAsOrganization] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<OpportunityType>("VOLUNTEER");
  const [modality, setModality] = useState<Modality>("REMOTE");
  const [weeklyHours, setWeeklyHours] = useState("10");
  const [skills, setSkills] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    const controller = new AbortController();

    apiFetch<Organization | null>(`/organizations?ownerUserId=${user.id}`, {
      signal: controller.signal,
    })
      .then(setOrganization)
      .catch((requestError: unknown) => {
        // Não ter organização é um caso válido: a pessoa publica em nome próprio.
        if (isAbortError(requestError)) return;
        setOrganization(null);
      });

    return () => controller.abort();
  }, [user]);

  function toggleSkill(skill: string) {
    setSkills((current) =>
      current.includes(skill)
        ? current.filter((item) => item !== skill)
        : [...current, skill],
    );
  }

  const isValid =
    title.trim().length >= 4 &&
    description.trim().length >= 20 &&
    skills.length > 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !isValid || isSubmitting) return;

    setError("");
    setIsSubmitting(true);

    try {
      const created = await apiFetch<Opportunity>("/opportunities", {
        method: "POST",
        body: JSON.stringify({
          createdByUserId: user.id,
          ...(organization &&
            publishAsOrganization && { organizationId: organization.id }),
          title: title.trim(),
          description: description.trim(),
          type,
          modality,
          ...(weeklyHours && { weeklyHours: Number(weeklyHours) }),
          skills,
        }),
        fallbackError: "Não foi possível publicar a oportunidade.",
      });

      setSaved(true);
      router.replace(`/organizacao/oportunidades/${created.id}`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível conectar à API.",
      );
      setIsSubmitting(false);
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

      <div className="mt-6 max-w-2xl">
        <h1 className="font-display text-3xl text-slate-950">
          Publicar oportunidade
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Descreva bem o projeto para atrair as pessoas certas.
        </p>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {organization && (
            <fieldset>
              <legend className="mb-2 text-xs font-medium text-slate-600">
                Publicar como
              </legend>
              <div className="grid gap-2 sm:grid-cols-2">
                <ChoiceButton
                  active={publishAsOrganization}
                  label={organization.name}
                  onClick={() => setPublishAsOrganization(true)}
                />
                <ChoiceButton
                  active={!publishAsOrganization}
                  label={`${user.name} (nome próprio)`}
                  onClick={() => setPublishAsOrganization(false)}
                />
              </div>
            </fieldset>
          )}

          <div>
            <label
              className="mb-1.5 block text-xs font-medium text-slate-600"
              htmlFor="title"
            >
              Título da oportunidade *
            </label>
            <input
              className="input"
              id="title"
              maxLength={120}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex: Desenvolvimento de painel para pesquisa acadêmica"
              value={title}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <fieldset>
              <legend className="mb-1.5 text-xs font-medium text-slate-600">
                Tipo *
              </legend>
              <div className="flex gap-2">
                {(["VOLUNTEER", "PAID"] as const).map((option) => (
                  <ChoiceButton
                    active={type === option}
                    key={option}
                    label={typeLabels[option]}
                    onClick={() => setType(option)}
                  />
                ))}
              </div>
            </fieldset>

            <div>
              <label
                className="mb-1.5 block text-xs font-medium text-slate-600"
                htmlFor="modality"
              >
                Modalidade *
              </label>
              <select
                className="input"
                id="modality"
                onChange={(event) =>
                  setModality(event.target.value as Modality)
                }
                value={modality}
              >
                {(["REMOTE", "ONSITE", "HYBRID"] as const).map((option) => (
                  <option key={option} value={option}>
                    {modalityLabels[option]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              className="mb-1.5 block text-xs font-medium text-slate-600"
              htmlFor="weeklyHours"
            >
              Carga semanal
            </label>
            <select
              className="input"
              id="weeklyHours"
              onChange={(event) => setWeeklyHours(event.target.value)}
              value={weeklyHours}
            >
              <option value="">A combinar</option>
              {weeklyHoursOptions.map((option) => (
                <option key={option} value={option}>
                  {option}h/semana
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="mb-1.5 block text-xs font-medium text-slate-600"
              htmlFor="description"
            >
              Descrição *
            </label>
            <textarea
              className="input resize-none"
              id="description"
              maxLength={1000}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Conte o que a pessoa vai fazer, o impacto esperado e o que ela ganha com isso..."
              rows={5}
              value={description}
            />
            <p className="mt-1 text-xs text-slate-400">
              {description.length}/1000 · mínimo de 20 caracteres
            </p>
          </div>

          <fieldset>
            <legend className="mb-2 text-xs font-medium text-slate-600">
              Competências desejadas *{" "}
              <span className="text-slate-400">
                ({skills.length} selecionadas)
              </span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {skillCatalog.map((skill) => {
                const active = skills.includes(skill);

                return (
                  <button
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
                    }`}
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    type="button"
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {error && (
            <p className="rounded-lg bg-red-50 p-4 text-red-700" role="alert">
              {error}
            </p>
          )}

          <button
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            disabled={!isValid || isSubmitting}
            type="submit"
          >
            {saved && <Check aria-hidden className="size-4" />}
            {saved
              ? "Publicada! Redirecionando..."
              : isSubmitting
                ? "Publicando..."
                : "Publicar oportunidade"}
          </button>
        </form>
      </div>
    </OrganizerShell>
  );
}

function ChoiceButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`flex-1 truncate rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
        active
          ? "border-emerald-600 bg-emerald-600 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
