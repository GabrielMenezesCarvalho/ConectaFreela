import Link from "next/link";
import { ArrowRight, Clock, Users } from "lucide-react";
import {
  modalityLabels,
  opportunityAuthor,
  opportunityStatusLabels,
  opportunityStatusStyles,
  typeLabels,
  type Opportunity,
} from "@/lib/api";

export function OpportunityCard({
  opportunity,
  href,
}: {
  opportunity: Opportunity;
  href?: string;
}) {
  const applicationCount = opportunity._count.applications;

  const card = (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors hover:border-emerald-400">
      <header className="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-emerald-800">
            {opportunityAuthor(opportunity)}
          </p>
          {!opportunity.organization && (
            <p className="mt-0.5 text-xs text-slate-500">Projeto individual</p>
          )}
        </div>

        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${
            opportunityStatusStyles[opportunity.status]
          }`}
        >
          {opportunityStatusLabels[opportunity.status]}
        </span>
      </header>

      <div className="flex flex-1 flex-col px-5 py-5">
        <h3 className="font-display text-xl leading-snug text-slate-950 transition-colors group-hover:text-emerald-800">
          {opportunity.title}
        </h3>
        <p className="mt-1 text-sm font-medium text-slate-500">
          {typeLabels[opportunity.type]} ·{" "}
          {modalityLabels[opportunity.modality]}
        </p>
        <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
          {opportunity.description}
        </p>

        {opportunity.skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {opportunity.skills.slice(0, 3).map((skill) => (
              <span
                className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-800"
                key={skill}
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      <footer className="mt-auto grid grid-cols-2 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2 border-r border-slate-200 px-5 py-3.5">
          <Clock aria-hidden className="size-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-700">
            {opportunity.weeklyHours
              ? `${opportunity.weeklyHours}h/semana`
              : "A combinar"}
          </span>
        </div>
        <div className="flex items-center gap-2 px-5 py-3.5">
          <Users aria-hidden className="size-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-700">
            {applicationCount}{" "}
            {applicationCount === 1 ? "candidatura" : "candidaturas"}
          </span>
        </div>

        {href && (
          <div className="col-span-2 flex items-center justify-end gap-1.5 border-t border-emerald-200 bg-emerald-50 px-5 py-3.5 text-sm font-semibold text-emerald-800">
            Ver candidatos
            <ArrowRight aria-hidden className="size-4" />
          </div>
        )}
      </footer>
    </article>
  );

  if (!href) return card;

  return (
    <Link
      className="rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
      href={href}
    >
      {card}
    </Link>
  );
}
