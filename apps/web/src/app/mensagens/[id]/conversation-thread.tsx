"use client";

import Link from "next/link";
import { ArrowLeft, MessagesSquare, SendHorizontal } from "lucide-react";
import { FormEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import {
  apiFetch,
  conversationCounterpart,
  isAbortError,
  type ConversationDetail,
  type Message,
} from "@/lib/api";
import { useRequiredSession } from "@/lib/use-required-session";

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});
const dayFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
});

function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

/** "Hoje" e "Ontem" pesam menos que a data cheia numa conversa recente. */
function dayLabel(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (sameDay(date, today)) return "Hoje";
  if (sameDay(date, yesterday)) return "Ontem";
  return dayFormatter.format(date);
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

export function ConversationThread({
  conversationId,
}: {
  conversationId: string;
}) {
  const user = useRequiredSession(["TALENT", "ORGANIZATION"]);
  const [conversation, setConversation] = useState<ConversationDetail | null>(
    null,
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();

    apiFetch<ConversationDetail>(
      `/conversations/${conversationId}?userId=${user.id}`,
      {
        signal: controller.signal,
        fallbackError: "Não foi possível carregar a conversa.",
      },
    )
      .then((detail) => {
        setConversation(detail);
        setMessages(detail.messages);
        setIsLoading(false);
      })
      .catch((requestError: unknown) => {
        if (isAbortError(requestError)) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Não foi possível conectar à API.",
        );
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [conversationId, user]);

  // Rola só o painel de mensagens; scrollIntoView arrastaria a página inteira.
  useLayoutEffect(() => {
    const panel = scrollRef.current;
    if (panel) panel.scrollTop = panel.scrollHeight;
  }, [messages]);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!user || !body || isSending) return;

    setError("");
    setIsSending(true);

    try {
      const created = await apiFetch<Message>(
        `/conversations/${conversationId}/messages`,
        {
          method: "POST",
          body: JSON.stringify({ senderUserId: user.id, body }),
          fallbackError: "Não foi possível enviar a mensagem.",
        },
      );
      setMessages((current) => [...current, created]);
      setDraft("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível conectar à API.",
      );
    } finally {
      setIsSending(false);
    }
  }

  if (!user) return <div className="min-h-screen bg-slate-50" />;

  const homeHref = user.role === "TALENT" ? "/oportunidades" : "/organizacao";
  const counterpart = conversation
    ? conversationCounterpart(conversation, user.id)
    : "";

  return (
    <DashboardShell homeHref={homeHref} user={user}>
      <div className="mx-auto w-full max-w-3xl">
        <Link
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
          href="/mensagens"
        >
          <ArrowLeft aria-hidden className="size-4" />
          Todas as conversas
        </Link>

        {error && (
          <p
            className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        )}

        {isLoading && !error && (
          <p className="mt-6 text-slate-500">Carregando conversa...</p>
        )}

        {conversation && (
          <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <header className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
                {initials(counterpart)}
              </span>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold text-slate-950">
                  {counterpart}
                </h1>
                <Link
                  className="truncate text-sm text-slate-500 transition-colors hover:text-emerald-700"
                  href={`/oportunidades/${conversation.application.opportunity.id}`}
                >
                  {conversation.application.opportunity.title}
                </Link>
              </div>
            </header>

            <div
              className="flex h-[55vh] min-h-80 flex-col gap-1 overflow-y-auto bg-[#f7f8f4] px-4 py-5 sm:px-6"
              ref={scrollRef}
            >
              {messages.length === 0 ? (
                <div className="m-auto text-center">
                  <MessagesSquare
                    aria-hidden
                    className="mx-auto size-8 text-slate-300"
                  />
                  <p className="mt-3 text-sm font-medium text-slate-600">
                    Conversa aberta.
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Nenhuma mensagem ainda — diga olá.
                  </p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isMine = message.senderUserId === user.id;
                  const previous = messages[index - 1];
                  const next = messages[index + 1];
                  // Agrupa mensagens seguidas do mesmo autor: só a última do
                  // bloco mostra o horário, o que tira bastante ruído visual.
                  const startsBlock =
                    !previous || previous.senderUserId !== message.senderUserId;
                  const endsBlock =
                    !next || next.senderUserId !== message.senderUserId;
                  const showDay =
                    !previous ||
                    !sameDay(
                      new Date(previous.createdAt),
                      new Date(message.createdAt),
                    );

                  return (
                    <div key={message.id}>
                      {showDay && (
                        <p className="my-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
                          {dayLabel(message.createdAt)}
                        </p>
                      )}

                      <div
                        className={`flex ${
                          isMine ? "justify-end" : "justify-start"
                        } ${startsBlock ? "mt-3" : "mt-0.5"}`}
                      >
                        <div
                          className={`max-w-[78%] px-4 py-2.5 shadow-sm ${
                            isMine
                              ? "rounded-2xl rounded-br-md bg-emerald-700 text-white"
                              : "rounded-2xl rounded-bl-md border border-slate-200 bg-white text-slate-800"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words text-sm leading-6">
                            {message.body}
                          </p>
                          {endsBlock && (
                            <p
                              className={`mt-1 text-right text-[11px] ${
                                isMine ? "text-emerald-200" : "text-slate-400"
                              }`}
                            >
                              {timeFormatter.format(
                                new Date(message.createdAt),
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form
              className="flex items-end gap-3 border-t border-slate-100 px-4 py-4 sm:px-6"
              onSubmit={send}
            >
              <label className="sr-only" htmlFor="message">
                Mensagem
              </label>
              <textarea
                className="max-h-40 min-h-12 flex-1 resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                id="message"
                maxLength={2000}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  // Enter envia, Shift+Enter quebra linha: convenção de chat.
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                placeholder="Escreva sua mensagem..."
                rows={1}
                value={draft}
              />
              <button
                className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                disabled={!draft.trim() || isSending}
                type="submit"
                aria-label="Enviar mensagem"
                title="Enviar (Enter)"
              >
                <SendHorizontal aria-hidden className="size-5" />
              </button>
            </form>
          </section>
        )}
      </div>
    </DashboardShell>
  );
}
