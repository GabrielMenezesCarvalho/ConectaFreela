"use client";

import { FormEvent, useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333/api";

type ApiHealth = {
  status: string;
  service: string;
  version: string;
};

type LoginResult = {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "TALENT" | "ORGANIZATION";
  };
};

function apiMessage(data: unknown, fallback: string) {
  if (!data || typeof data !== "object" || !("message" in data)) {
    return fallback;
  }

  const message = data.message;
  return Array.isArray(message) ? message.join(" ") : String(message);
}

export function LoginForm() {
  const [health, setHealth] = useState<ApiHealth | null>(null);
  const [healthError, setHealthError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<LoginResult | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(API_URL, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("API indisponível");
        return (await response.json()) as ApiHealth;
      })
      .then(setHealth)
      .catch((requestError: unknown) => {
        if (!(
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        )) {
          setHealthError(true);
        }
      });

    return () => controller.abort();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);
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

      setResult(data as LoginResult);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível conectar à API.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="mt-5 rounded-lg bg-slate-100 px-3 py-2 text-sm">
        {health ? (
          <span className="text-emerald-700">
            API {health.status} · versão {health.version}
          </span>
        ) : healthError ? (
          <span className="text-red-700">API indisponível</span>
        ) : (
          <span className="text-slate-500">Verificando a API...</span>
        )}
      </div>

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

        {result && (
          <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
            <p className="font-semibold">{result.message}</p>
            <p className="mt-1">
              {result.user.name} · {result.user.role}
            </p>
            <p>{result.user.email}</p>
          </div>
        )}

        <button
          className="w-full rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white disabled:opacity-60"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Validando..." : "Entrar"}
        </button>
      </form>
    </>
  );
}
