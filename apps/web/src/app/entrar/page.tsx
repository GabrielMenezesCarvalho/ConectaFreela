import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export const metadata: Metadata = {
  title: "Entrar | ConectaFreela",
  description: "Acesso à plataforma ConectaFreela.",
};

export default function EntrarPage() {
  return (
    <main className="grid min-h-screen bg-[#f7f8f4] lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-[#0a1a12] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <BrandLogo light />
        <div className="relative max-w-lg">
          <p className="mb-4 text-sm font-semibold text-emerald-300">
            Acesso à sua conta
          </p>
          <h1 className="font-display text-6xl leading-[0.95] tracking-[-0.03em]">
            Seus projetos e conexões em um só lugar.
          </h1>
          <p className="mt-6 max-w-md leading-7 text-white/60">
            Acompanhe oportunidades, candidaturas e colaborações pela
            plataforma.
          </p>
        </div>
        <p className="text-xs text-white/35">
          ConectaFreela · oportunidades acadêmicas e sociais
        </p>
      </section>

      <section className="relative flex items-center justify-center p-6 sm:p-10">
        <Link
          className="absolute right-6 top-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-emerald-700 sm:right-10 sm:top-10"
          href="/"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Voltar ao início
        </Link>
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5 sm:p-10">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <LockKeyhole size={22} aria-hidden="true" />
          </span>
          <p className="mt-7 text-sm font-bold text-emerald-700">
            Em preparação
          </p>
          <h2 className="mt-2 font-display text-5xl leading-none tracking-[-0.03em]">
            Login em breve.
          </h2>
          <p className="mt-5 leading-7 text-slate-500">
            O cadastro já está disponível. O acesso seguro à conta será
            conectado na história de autenticação.
          </p>
          <Link
            className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-700"
            href="/cadastro"
          >
            Criar uma conta
          </Link>
        </div>
      </section>
    </main>
  );
}
