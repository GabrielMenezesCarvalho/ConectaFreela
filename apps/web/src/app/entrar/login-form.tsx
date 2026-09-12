"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { saveSession, type SessionUser } from "@/lib/auth-session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333/api";

type LoginResult = {
  message: string;
  user: SessionUser;
};

function apiMessage(data: unknown, fallback: string) {
  if (!data || typeof data !== "object" || !("message" in data)) {
    return fallback;
  }

  const message = data.message;
  return Array.isArray(message) ? message.join(" ") : String(message);
}

export function LoginForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const data: unknown = await response.json();

      if (!response.ok) {
        throw new Error(apiMessage(data, "Não foi possível entrar."));
      }

      const loginResult = data as LoginResult;
      saveSession(loginResult.user);
      router.replace(
        loginResult.user.role === "ADMIN"
          ? "/admin"
          : loginResult.user.role === "ORGANIZATION"
            ? "/organizacao"
            : "/oportunidades",
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível conectar à API.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
      <label className="block text-sm font-medium" htmlFor="email">
        E-mail
        <div className="relative mt-2"><Mail className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-slate-400" /><input className="input pl-10" id="email" name="email" type="email" placeholder="voce@email.com" autoComplete="email" required /></div>
      </label>

      <label className="block text-sm font-medium" htmlFor="password">
        Senha
        <div className="relative mt-2"><LockKeyhole className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-slate-400" /><input className="input px-10" id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Sua senha" minLength={8} maxLength={72} autoComplete="current-password" required /><button className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700" type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div>
      </label>

      {error && (
        <p
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}

      <button
        className="w-full rounded-xl bg-emerald-700 px-4 py-3.5 font-bold text-white shadow-lg shadow-emerald-700/15 transition hover:bg-emerald-800 disabled:opacity-60"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Validando..." : "Entrar"}
      </button>
    </form>
  );
}
