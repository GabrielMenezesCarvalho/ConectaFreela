"use client";

import { Search, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { OpportunityCard } from "@/components/opportunity-card";
import { TalentShell } from "@/components/talent-shell";
import { apiFetch, isAbortError, type Opportunity } from "@/lib/api";
import { useRequiredSession } from "@/lib/use-required-session";

type Talent = { talentProfile: { skills: string[] } | null };

export function TalentOpportunities() {
  const user = useRequiredSession("TALENT");
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    Promise.all([
      apiFetch<Opportunity[]>(`/opportunities?talentUserId=${user.id}`, { signal: controller.signal, fallbackError: "Não foi possível carregar as oportunidades." }),
      apiFetch<Talent>(`/users/${user.id}`, { signal: controller.signal }),
    ]).then(([list, talent]) => { setOpportunities(list); setSkills(talent.talentProfile?.skills ?? []); setLoading(false); })
      .catch((requestError) => { if (isAbortError(requestError)) return; setError(requestError instanceof Error ? requestError.message : "Não foi possível conectar à API."); setLoading(false); });
    return () => controller.abort();
  }, [user]);

  const filtered = useMemo(() => opportunities.filter((item) => `${item.title} ${item.description} ${item.skills.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [opportunities, query]);
  const normalizedSkills = new Set(skills.map((skill) => skill.toLowerCase()));
  const recommendedCount = opportunities.filter((item) => item.isFeatured && item.skills.some((skill) => normalizedSkills.has(skill.toLowerCase()))).length;

  if (!user) return <div className="min-h-screen bg-slate-50" />;
  return <TalentShell user={user}>
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-emerald-700">Projetos para você</p><h1 className="mt-1 font-display text-4xl">Encontre sua próxima oportunidade</h1><p className="mt-2 text-sm text-slate-500">Os destaques compatíveis com suas habilidades aparecem primeiro.</p></div>{recommendedCount > 0 && <span className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-800"><Sparkles className="size-4" /> {recommendedCount} {recommendedCount === 1 ? "destaque combina" : "destaques combinam"} com você</span>}</div>
    <label className="relative mt-8 block"><Search className="absolute left-4 top-3.5 size-5 text-slate-400" /><span className="sr-only">Buscar oportunidades</span><input className="input pl-12" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busque por projeto, habilidade ou palavra-chave" /></label>
    {error && <p className="mt-6 rounded-lg bg-red-50 p-4 text-red-700" role="alert">{error}</p>}
    {loading && <p className="mt-8 text-slate-500">Buscando as melhores oportunidades...</p>}
    {!loading && !error && <div className="mt-8 grid gap-5 md:grid-cols-2">{filtered.map((opportunity) => <OpportunityCard key={opportunity.id} opportunity={opportunity} href={`/oportunidades/${opportunity.id}`} />)}</div>}
    {!loading && filtered.length === 0 && <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">Nenhuma oportunidade encontrada para esta busca.</div>}
  </TalentShell>;
}
