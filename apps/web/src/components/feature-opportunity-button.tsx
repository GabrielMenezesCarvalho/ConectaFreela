"use client";

import Link from "next/link";
import { Check, Crown, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { apiFetch, type Opportunity } from "@/lib/api";

export function FeatureOpportunityButton({ opportunity, organizerUserId, isPremium, onFeatured }: { opportunity: Opportunity; organizerUserId: string; isPremium: boolean; onFeatured: (opportunity: Opportunity) => void }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  if (opportunity.isFeatured) return <span className="flex items-center gap-1.5 rounded-lg bg-amber-100 px-4 py-2 text-sm font-bold text-amber-800"><Check className="size-4" /> Em destaque</span>;
  if (opportunity.status !== "ACTIVE") return null;
  if (!isPremium) return <Link className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-800" href="/organizacao/premium"><Crown className="size-4" /> Desbloquear destaque</Link>;

  async function confirm() {
    setPending(true); setError("");
    try {
      const updated = await apiFetch<Opportunity>(`/opportunities/${opportunity.id}/feature`, { method: "PATCH", body: JSON.stringify({ organizerUserId }), fallbackError: "Não foi possível destacar a oportunidade." });
      onFeatured(updated); setOpen(false);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Não foi possível conectar à API."); }
    finally { setPending(false); }
  }

  return <>
    <button className="flex items-center gap-1.5 rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-amber-950 hover:bg-amber-300" type="button" onClick={() => setOpen(true)}><Sparkles className="size-4" /> Destacar</button>
    {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-5" role="presentation" onMouseDown={() => setOpen(false)}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="feature-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4"><span className="flex size-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><Sparkles className="size-5" /></span><button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Fechar" onClick={() => setOpen(false)}><X className="size-5" /></button></div>
        <h2 className="mt-5 text-2xl font-bold" id="feature-title">Destacar esta oportunidade?</h2>
        <p className="mt-3 text-sm leading-6 text-slate-500"><strong className="text-slate-800">{opportunity.title}</strong> ganhará selo especial e prioridade para talentos com habilidades compatíveis.</p>
        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
        <div className="mt-6 flex gap-3"><button className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-semibold" type="button" onClick={() => setOpen(false)}>Agora não</button><button className="flex-1 rounded-xl bg-amber-400 px-4 py-3 font-bold text-amber-950 disabled:opacity-60" type="button" disabled={pending} onClick={confirm}>{pending ? "Destacando..." : "Confirmar destaque"}</button></div>
      </div>
    </div>}
  </>;
}
