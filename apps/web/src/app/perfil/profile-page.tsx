"use client";

import { CheckCircle2, Crown, Mail, Save, ShieldCheck, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { apiFetch, type Organization } from "@/lib/api";
import { readSession, saveSession, type SessionUser } from "@/lib/auth-session";

type UserProfile = SessionUser & {
  createdAt: string;
  talentProfile: {
    bio: string | null;
    skills: string[];
    availability: string;
    portfolioLinks: string[];
  } | null;
};

const roleLabels = {
  TALENT: "Talento",
  ORGANIZATION: "Organizador",
  ADMIN: "Administrador",
} as const;

function splitValues(value: string) {
  return value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
}

export function ProfilePage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const current = readSession();
    if (!current) {
      router.replace("/entrar");
      return;
    }
    const controller = new AbortController();
    queueMicrotask(() => setSession(current));

    Promise.all([
      apiFetch<UserProfile>(`/users/${current.id}`, { signal: controller.signal }),
      current.role === "ORGANIZATION"
        ? apiFetch<Organization | null>(`/organizations?ownerUserId=${current.id}`, { signal: controller.signal })
        : Promise.resolve(null),
    ])
      .then(([loadedProfile, loadedOrganization]) => {
        setProfile(loadedProfile);
        setOrganization(loadedOrganization);
        setLoading(false);
      })
      .catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar o perfil.");
        setLoading(false);
      });

    return () => controller.abort();
  }, [router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session || !profile) return;
    setSaving(true);
    setError("");
    setSuccess("");
    const form = new FormData(event.currentTarget);

    try {
      const updatedUser = await apiFetch<UserProfile>(`/users/${session.id}/profile`, {
        method: "PATCH",
        body: JSON.stringify({ name: form.get("name") }),
      });

      let updatedProfile = updatedUser;
      if (session.role === "TALENT") {
        updatedProfile = await apiFetch<UserProfile>(`/users/${session.id}/talent-profile`, {
          method: "PATCH",
          body: JSON.stringify({
            bio: form.get("bio"),
            availability: form.get("availability"),
            skills: splitValues(String(form.get("skills") ?? "")),
            portfolioLinks: splitValues(String(form.get("portfolioLinks") ?? "")),
          }),
        });
      }

      if (session.role === "ORGANIZATION") {
        const updatedOrganization = await apiFetch<Organization>("/organizations", {
          method: "PUT",
          body: JSON.stringify({
            ownerUserId: session.id,
            name: form.get("organizationName"),
            description: form.get("description"),
            website: form.get("website") || undefined,
          }),
        });
        setOrganization(updatedOrganization);
      }

      const updatedSession = { ...session, name: updatedProfile.name };
      saveSession(updatedSession);
      setSession(updatedSession);
      setProfile(updatedProfile);
      setSuccess("Perfil atualizado com sucesso.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível salvar o perfil.");
    } finally {
      setSaving(false);
    }
  }

  if (!session) return <div className="min-h-screen bg-[#f7f8f4]" />;
  const homeHref = session.role === "ADMIN" ? "/admin" : session.role === "ORGANIZATION" ? "/organizacao" : "/oportunidades";

  return (
    <DashboardShell homeHref={homeHref} showPremium={session.role === "ORGANIZATION"} user={session}>
      <div className="mx-auto max-w-4xl">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="bg-[#063d2c] px-5 py-7 text-white sm:px-8 sm:py-9">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-400 text-emerald-950">
                <UserRound className="size-8" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-emerald-300">Meu perfil</p>
                <h1 className="mt-1 truncate font-display text-3xl sm:text-4xl">{session.name}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-emerald-50/70">
                  <span>{roleLabels[session.role]}</span>
                  {session.isPremium && <span className="inline-flex items-center gap-1 text-amber-300"><Crown className="size-3.5" /> Premium</span>}
                </div>
              </div>
            </div>
          </div>

          {loading && <p className="p-8 text-slate-500">Carregando seus dados...</p>}
          {profile && (
            <form className="space-y-8 p-5 sm:p-8" onSubmit={submit}>
              <section>
                <h2 className="text-lg font-bold">Dados da conta</h2>
                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <Field label="Nome" htmlFor="name"><input className="input" id="name" name="name" defaultValue={profile.name} minLength={2} required /></Field>
                  <Field label="E-mail" htmlFor="email"><div className="relative"><Mail className="absolute left-3 top-3.5 size-4 text-slate-400" /><input className="input bg-slate-50 pl-10 text-slate-500" id="email" value={profile.email} readOnly /></div></Field>
                </div>
              </section>

              {session.role === "TALENT" && (
                <section className="border-t border-slate-100 pt-7">
                  <h2 className="text-lg font-bold">Perfil profissional</h2>
                  <div className="mt-4 space-y-5">
                    <Field label="Sobre você" htmlFor="bio"><textarea className="input min-h-28 resize-y" id="bio" name="bio" defaultValue={profile.talentProfile?.bio ?? ""} /></Field>
                    <Field label="Habilidades" htmlFor="skills" hint="Separe por vírgulas"><input className="input" id="skills" name="skills" defaultValue={profile.talentProfile?.skills.join(", ")} required /></Field>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Disponibilidade" htmlFor="availability"><input className="input" id="availability" name="availability" defaultValue={profile.talentProfile?.availability} required /></Field>
                      <Field label="Portfólio" htmlFor="portfolioLinks" hint="Um ou mais links"><input className="input" id="portfolioLinks" name="portfolioLinks" defaultValue={profile.talentProfile?.portfolioLinks.join(", ")} placeholder="https://seuportfolio.com" /></Field>
                    </div>
                  </div>
                </section>
              )}

              {session.role === "ORGANIZATION" && (
                <section className="border-t border-slate-100 pt-7">
                  <h2 className="text-lg font-bold">Dados da organização</h2>
                  <div className="mt-4 space-y-5">
                    <Field label="Nome da organização" htmlFor="organizationName"><input className="input" id="organizationName" name="organizationName" defaultValue={organization?.name ?? profile.name} minLength={2} required /></Field>
                    <Field label="Descrição" htmlFor="description"><textarea className="input min-h-28 resize-y" id="description" name="description" defaultValue={organization?.description ?? ""} /></Field>
                    <Field label="Site" htmlFor="website" hint="Opcional"><input className="input" id="website" name="website" type="url" defaultValue={organization?.website ?? ""} placeholder="https://suaorganizacao.org" /></Field>
                  </div>
                </section>
              )}

              {session.role === "ADMIN" && (
                <div className="flex gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
                  <ShieldCheck className="size-5 shrink-0" /> Seu perfil possui permissões administrativas. O e-mail e o nível de acesso não podem ser alterados por esta tela.
                </div>
              )}

              {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</p>}
              {success && <p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-800" role="status"><CheckCircle2 className="size-4" />{success}</p>}
              <div className="flex justify-end border-t border-slate-100 pt-6">
                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 font-bold text-white disabled:opacity-60 sm:w-auto" disabled={saving}><Save className="size-4" />{saving ? "Salvando..." : "Salvar alterações"}</button>
              </div>
            </form>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}

function Field({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: React.ReactNode }) {
  return <label className="block" htmlFor={htmlFor}><span className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700">{label}{hint && <span className="text-xs font-normal text-slate-400">{hint}</span>}</span>{children}</label>;
}
