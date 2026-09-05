"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
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
        loginResult.user.role === "ORGANIZATION" ? "/admin" : "/oportunidades",
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
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      <label className="block text-sm font-medium" htmlFor="email">
        E-mail
        <input
          className="input mt-2"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </label>

      <label className="block text-sm font-medium" htmlFor="password">
        Senha
        <input
          className="input mt-2"
          id="password"
          name="password"
          type="password"
          minLength={8}
          maxLength={72}
          autoComplete="current-password"
          required
        />
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
        className="w-full rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white disabled:opacity-60"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Validando..." : "Entrar"}
      </button>
    </form>
  );
}
