"use client";

import Image from "next/image";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Check,
  Clock3,
  Link as LinkIcon,
  Sparkles,
  UserRound,
} from "lucide-react";
import { FormEvent, useState } from "react";
import logo from "@/assets/landing/connectafreela.png";

type UserRole = "TALENT" | "ORGANIZATION";

type CreatedUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333/api";

function splitValues(value: string) {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function Home() {
  const [role, setRole] = useState<UserRole>("TALENT");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdUser, setCreatedUser] = useState<CreatedUser | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setError("");
    setCreatedUser(null);
    setIsSubmitting(true);

    const form = new FormData(formElement);
    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
      role,
      ...(role === "TALENT" && {
        bio: form.get("bio"),
        skills: splitValues(String(form.get("skills") ?? "")),
        availability: form.get("availability"),
        portfolioLinks: splitValues(String(form.get("portfolioLinks") ?? "")),
      }),
    };

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        const message = Array.isArray(data.message)
          ? data.message.join(" ")
          : data.message;
        throw new Error(message || "Não foi possível criar sua conta.");
      }

      setCreatedUser(data);
      formElement.reset();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Não foi possível conectar à API.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f7f2] text-slate-950">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8 lg:px-10">
        <Image
          src={logo}
          alt="ConectaFreela"
          className="h-auto w-44 sm:w-52"
          priority
        />
        <span className="hidden text-sm font-medium text-slate-500 sm:block">
          Conectando talentos a boas ideias.
        </span>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 pb-10 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
        <aside className="relative overflow-hidden rounded-[2rem] bg-[#063d2c] p-8 text-white shadow-xl shadow-emerald-950/10 sm:p-10 lg:min-h-[720px]">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="relative flex h-full flex-col">
            <span className="mb-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400 text-emerald-950">
              <Sparkles size={22} aria-hidden="true" />
            </span>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-300">
              Seu próximo projeto começa aqui
            </p>
            <h1 className="mt-4 max-w-lg text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Crie um perfil que abre novas conexões.
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-emerald-50/75">
              Escolha como você quer participar e mostre o que pode construir em
              colaboração com a comunidade.
            </p>

            <div className="mt-10 space-y-5 lg:mt-auto">
              {[
                "Cadastro gratuito e rápido",
                "Perfil direcionado ao seu objetivo",
                "Dados protegidos desde o primeiro acesso",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-sm text-emerald-50/90"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
                    <Check size={14} aria-hidden="true" />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-10">
          <div className="mb-8">
            <p className="text-sm font-semibold text-emerald-700">
              Comece agora
            </p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight">
              Crie sua conta
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Primeiro, conte como você quer usar a plataforma.
            </p>
          </div>

          <div
            className="mb-8 grid gap-3 sm:grid-cols-2"
            aria-label="Tipo de perfil"
          >
            <RoleButton
              active={role === "TALENT"}
              icon={<UserRound size={21} />}
              title="Sou talento"
              description="Quero colaborar em projetos"
              onClick={() => setRole("TALENT")}
            />
            <RoleButton
              active={role === "ORGANIZATION"}
              icon={<Building2 size={21} />}
              title="Sou organização"
              description="Quero encontrar talentos"
              onClick={() => setRole("ORGANIZATION")}
            />
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label={
                  role === "TALENT" ? "Nome completo" : "Nome da organização"
                }
                htmlFor="name"
              >
                <input
                  className="input"
                  id="name"
                  name="name"
                  placeholder={
                    role === "TALENT"
                      ? "Como devemos chamar você?"
                      : "Nome da sua organização"
                  }
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                  required
                />
              </Field>
              <Field label="E-mail" htmlFor="email">
                <input
                  className="input"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="voce@email.com"
                  autoComplete="email"
                  required
                />
              </Field>
            </div>

            <Field
              label="Senha"
              htmlFor="password"
              hint="Mínimo de 8 caracteres"
            >
              <input
                className="input"
                id="password"
                name="password"
                type="password"
                minLength={8}
                maxLength={72}
                autoComplete="new-password"
                placeholder="Crie uma senha segura"
                required
              />
            </Field>

            {role === "TALENT" && (
              <div className="space-y-5 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
                <div className="flex items-center gap-3">
                  <BriefcaseBusiness className="text-emerald-700" size={20} />
                  <div>
                    <h3 className="font-semibold">Seu perfil de talento</h3>
                    <p className="text-xs text-slate-500">
                      Você poderá atualizar estes dados depois.
                    </p>
                  </div>
                </div>

                <Field
                  label="Competências"
                  htmlFor="skills"
                  hint="Separe por vírgulas"
                >
                  <input
                    className="input bg-white"
                    id="skills"
                    name="skills"
                    placeholder="Design, React, Gestão de projetos"
                    required
                  />
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Disponibilidade" htmlFor="availability">
                    <div className="relative">
                      <Clock3
                        className="pointer-events-none absolute left-3 top-3.5 text-slate-400"
                        size={17}
                      />
                      <select
                        className="input bg-white pl-10"
                        id="availability"
                        name="availability"
                        required
                      >
                        <option value="">Selecione</option>
                        <option value="Até 5 horas por semana">
                          Até 5 horas por semana
                        </option>
                        <option value="De 5 a 10 horas por semana">
                          De 5 a 10 horas por semana
                        </option>
                        <option value="Mais de 10 horas por semana">
                          Mais de 10 horas por semana
                        </option>
                      </select>
                    </div>
                  </Field>
                  <Field
                    label="Portfólio"
                    htmlFor="portfolioLinks"
                    hint="Opcional"
                  >
                    <div className="relative">
                      <LinkIcon
                        className="pointer-events-none absolute left-3 top-3.5 text-slate-400"
                        size={17}
                      />
                      <input
                        className="input bg-white pl-10"
                        id="portfolioLinks"
                        name="portfolioLinks"
                        type="url"
                        placeholder="https://seuportfolio.com"
                      />
                    </div>
                  </Field>
                </div>

                <Field label="Sobre você" htmlFor="bio" hint="Opcional">
                  <textarea
                    className="input min-h-24 resize-y bg-white"
                    id="bio"
                    name="bio"
                    maxLength={500}
                    placeholder="Conte brevemente sobre sua experiência e interesses."
                  />
                </Field>
              </div>
            )}

            {error && (
              <p
                className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                {error}
              </p>
            )}

            {createdUser && (
              <div
                className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3"
                aria-live="polite"
              >
                <p className="font-semibold text-emerald-900">
                  Conta criada com sucesso!
                </p>
                <p className="mt-1 text-sm text-emerald-700">
                  Bem-vindo, {createdUser.name}. Seu perfil de{" "}
                  {createdUser.role === "TALENT" ? "talento" : "organização"}{" "}
                  está pronto.
                </p>
              </div>
            )}

            <button
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Criando conta..." : "Criar minha conta"}
              {!isSubmitting && <ArrowRight size={18} aria-hidden="true" />}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

function RoleButton({
  active,
  icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-4 focus:ring-emerald-100 ${
        active
          ? "border-emerald-500 bg-emerald-50 text-emerald-950"
          : "border-slate-200 bg-white text-slate-700 hover:border-emerald-200"
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${active ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}
      >
        {icon}
      </span>
      <span>
        <span className="block text-sm font-bold">{title}</span>
        <span className="mt-0.5 block text-xs text-slate-500">
          {description}
        </span>
      </span>
    </button>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block" htmlFor={htmlFor}>
      <span className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700">
        {label}
        {hint && (
          <span className="text-xs font-normal text-slate-400">{hint}</span>
        )}
      </span>
      {children}
    </label>
  );
}
