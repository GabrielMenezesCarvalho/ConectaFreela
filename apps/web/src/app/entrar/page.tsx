import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Entrar | ConectaFreela",
  description: "Validação de acesso à plataforma ConectaFreela.",
};

export default function EntrarPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-slate-950">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <Link className="text-sm text-emerald-700 hover:underline" href="/">
          ← Voltar ao início
        </Link>
        <h1 className="mt-6 text-3xl font-semibold">Entrar</h1>
        <p className="mt-2 text-sm text-slate-500">
          Informe uma conta cadastrada para validar as credenciais na API.
        </p>
        <LoginForm />
      </section>
    </main>
  );
}
