"use client";

import Link from "next/link";
import { FileText, Filter, RotateCcw, Search, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { OpportunityCard } from "@/components/opportunity-card";
import { TalentShell } from "@/components/talent-shell";
import { apiFetch, isAbortError, type Modality, type Opportunity, type OpportunityType } from "@/lib/api";
import { useRequiredSession } from "@/lib/use-required-session";

type Talent = { talentProfile: { skills: string[] } | null };
type MatchFilter = "ALL" | "MATCHING" | "FEATURED";

export function TalentOpportunities() {
  const user = useRequiredSession("TALENT");
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<OpportunityType | "ALL">("ALL");
  const [modality, setModality] = useState<Modality | "ALL">("ALL");
  const [match, setMatch] = useState<MatchFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    Promise.all([
      apiFetch<Opportunity[]>(`/opportunities?talentUserId=${user.id}`, { signal: controller.signal, fallbackError: "Não foi possível carregar as oportunidades." }),
      apiFetch<Talent>(`/users/${user.id}`, { signal: controller.signal }),
    ])
      .then(([list, talent]) => {
        setOpportunities(list);
        setSkills(talent.talentProfile?.skills ?? []);
        setLoading(false);
      })
      .catch((requestError) => {
        if (isAbortError(requestError)) return;
        setError(requestError instanceof Error ? requestError.message : "Não foi possível conectar à API.");
        setLoading(false);
      });
    return () => controller.abort();
  }, [user]);

  const normalizedSkills = useMemo(() => new Set(skills.map((skill) => skill.toLowerCase())), [skills]);
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return opportunities.filter((item) => {
      const compatible = item.skills.some((skill) => normalizedSkills.has(skill.toLowerCase()));
      const searchText = `${item.title} ${item.description} ${item.skills.join(" ")} ${item.organization?.name ?? item.createdBy.name}`.toLowerCase();
      return searchText.includes(normalizedQuery)
        && (type === "ALL" || item.type === type)
        && (modality === "ALL" || item.modality === modality)
        && (match === "ALL" || (match === "FEATURED" && item.isFeatured) || (match === "MATCHING" && compatible));
    });
  }, [match, modality, normalizedSkills, opportunities, query, type]);

  const recommendedCount = opportunities.filter((item) => item.isFeatured && item.skills.some((skill) => normalizedSkills.has(skill.toLowerCase()))).length;
  const hasFilters = Boolean(query || type !== "ALL" || modality !== "ALL" || match !== "ALL");
  function clearFilters() { setQuery(""); setType("ALL"); setModality("ALL"); setMatch("ALL"); }

  if (!user) return <div className="min-h-screen bg-slate-50" />;

  return <TalentShell user={user}>
    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
      <div><p className="text-sm font-semibold text-emerald-700">Projetos para você</p><h1 className="mt-1 font-display text-3xl leading-tight sm:text-4xl lg:text-5xl">Encontre sua próxima oportunidade</h1><p className="mt-2 text-sm text-slate-500">Destaques compatíveis com suas habilidades aparecem primeiro.</p></div>
      <div className="flex flex-wrap gap-2"><Link className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-emerald-700" href="/candidaturas"><FileText className="size-4" /> Minhas candidaturas</Link>{recommendedCount > 0 && <span className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-800"><Sparkles className="size-4" /> {recommendedCount} recomendação{recommendedCount > 1 ? "es" : ""}</span>}</div>
    </div>

    <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-label="Filtros de oportunidades">
      <label className="relative block"><Search className="absolute left-4 top-3.5 size-5 text-slate-400" /><span className="sr-only">Buscar oportunidades</span><input className="input pl-12" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busque por projeto, organização ou habilidade" /></label>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.2fr_auto]">
        <FilterSelect label="Tipo" value={type} onChange={(value) => setType(value as OpportunityType | "ALL")} options={[["ALL", "Todos os tipos"], ["VOLUNTEER", "Voluntário"], ["PAID", "Remunerado"]]} />
        <FilterSelect label="Modalidade" value={modality} onChange={(value) => setModality(value as Modality | "ALL")} options={[["ALL", "Todas"], ["REMOTE", "Remoto"], ["HYBRID", "Híbrido"], ["ONSITE", "Presencial"]]} />
        <FilterSelect label="Relevância" value={match} onChange={(value) => setMatch(value as MatchFilter)} options={[["ALL", "Todas as oportunidades"], ["MATCHING", "Compatíveis comigo"], ["FEATURED", "Somente destacadas"]]} />
        <button className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 disabled:opacity-40" disabled={!hasFilters} onClick={clearFilters} type="button"><RotateCcw className="size-4" /> Limpar</button>
      </div>
    </section>

    <div className="mt-6 flex items-center justify-between gap-3"><p className="text-sm text-slate-500"><strong className="text-slate-900">{filtered.length}</strong> oportunidade{filtered.length !== 1 ? "s" : ""}</p><span className="hidden items-center gap-1.5 text-xs text-slate-400 sm:flex"><Filter className="size-3.5" /> Ordenadas por relevância</span></div>
    {error && <p className="mt-6 rounded-lg bg-red-50 p-4 text-red-700" role="alert">{error}</p>}
    {loading && <p className="mt-8 text-slate-500">Buscando as melhores oportunidades...</p>}
    {!loading && !error && <div className="mt-4 grid gap-5 md:grid-cols-2">{filtered.map((opportunity) => <OpportunityCard key={opportunity.id} opportunity={opportunity} href={`/oportunidades/${opportunity.id}`} />)}</div>}
    {!loading && filtered.length === 0 && <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center"><p className="text-slate-600">Nenhuma oportunidade corresponde aos filtros.</p>{hasFilters && <button className="mt-3 text-sm font-bold text-emerald-700" onClick={clearFilters}>Limpar filtros</button>}</div>}
  </TalentShell>;
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<[string, string]> }) {
  return <label><span className="sr-only">{label}</span><select className="input h-12 bg-white" value={value} onChange={(event) => onChange(event.target.value)}>{options.map(([optionValue, text]) => <option key={optionValue} value={optionValue}>{text}</option>)}</select></label>;
}
