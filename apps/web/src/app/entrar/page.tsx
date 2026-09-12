import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import teamImage from "@/assets/landing/team-project.webp";
import { BrandLogo } from "@/components/brand-logo";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Entrar | ConectaFreela",
  description: "Acesse sua conta na plataforma ConectaFreela.",
};

export default function EntrarPage() {
  return (
    <main className="min-h-screen bg-[#f7f8f4] p-3 text-slate-950 sm:p-5 lg:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-7xl overflow-hidden rounded-3xl border border-emerald-950/10 bg-white shadow-xl shadow-slate-900/5 sm:min-h-[calc(100vh-2.5rem)] lg:grid-cols-[1.05fr_0.95fr]">
        <aside className="relative hidden overflow-hidden bg-[#063d2c] lg:block">
          <Image className="object-cover opacity-55" src={teamImage} alt="Equipe colaborando em um projeto" fill priority sizes="55vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#04291e] via-[#063d2c]/70 to-[#063d2c]/20" />
          <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
            <BrandLogo light />
            <div className="max-w-xl text-white">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-emerald-200 backdrop-blur"><Sparkles className="size-3.5" /> Conexões que geram impacto</span>
              <h1 className="mt-6 font-display text-5xl leading-[0.95] xl:text-6xl">Boas ideias encontram pessoas prontas para realizá-las.</h1>
              <div className="mt-8 grid gap-3 text-sm text-emerald-50/80 sm:grid-cols-2">
                <p className="flex items-center gap-2"><CheckCircle2 className="size-4 text-emerald-300" /> Projetos relevantes</p>
                <p className="flex items-center gap-2"><CheckCircle2 className="size-4 text-emerald-300" /> Talentos compatíveis</p>
              </div>
            </div>
          </div>
        </aside>

        <section className="flex items-center justify-center px-5 py-8 sm:px-10 lg:px-12 xl:px-20">
          <div className="w-full max-w-md">
            <div className="flex items-center justify-between lg:hidden"><BrandLogo compact /><Link className="flex items-center gap-1 text-sm font-medium text-slate-500" href="/"><ArrowLeft className="size-4" /> Início</Link></div>
            <Link className="hidden items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-emerald-700 lg:inline-flex" href="/"><ArrowLeft className="size-4" /> Voltar ao início</Link>
            <p className="mt-10 text-sm font-bold text-emerald-700 lg:mt-14">Bem-vindo de volta</p>
            <h2 className="mt-2 font-display text-4xl sm:text-5xl">Entre na sua conta</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">Continue acompanhando oportunidades, candidatos e projetos que fazem sentido para você.</p>
            <LoginForm />
            <p className="mt-7 text-center text-sm text-slate-500">Ainda não tem uma conta? <Link className="font-bold text-emerald-700 hover:text-emerald-800" href="/cadastro">Cadastre-se gratuitamente</Link></p>
          </div>
        </section>
      </div>
    </main>
  );
}
