"use client";

import Link from "next/link";
import { ArrowLeft, ChevronRight, MessagesSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import {
  apiFetch,
  conversationCounterpart,
  isAbortError,
  type ConversationSummary,
} from "@/lib/api";
import { useRequiredSession } from "@/lib/use-required-session";

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});
const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
});

function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

/** Hora para hoje, "Ontem", data curta para o resto — como num app de mensagens. */
function shortStamp(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (sameDay(date, today)) return timeFormatter.format(date);
  if (sameDay(date, yesterday)) return "Ontem";
  return dateFormatter.format(date);
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

export function ConversationList() {
  const user = useRequiredSession(["TALENT", "ORGANIZATION"]);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();

    apiFetch<ConversationSummary[]>(`/conversations?userId=${user.id}`, {
      signal: controller.signal,
      fallbackError: "Não foi possível carregar suas conversas.",
    })
      .then((list) => {
        setConversations(list);
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
  }, [user]);

  if (!user) return <div className="min-h-screen bg-slate-50" />;

  const homeHref = user.role === "TALENT" ? "/oportunidades" : "/organizacao";
  const totalUnread = conversations.reduce(
    (total, conversation) => total + conversation.unreadCount,
    0,
  );

  return (
    <DashboardShell homeHref={homeHref} user={user}>
      <div className="mx-auto w-full max-w-3xl">
        <Link
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
          href={homeHref}
        >
          <ArrowLeft aria-hidden className="size-4" />
          Voltar
        </Link>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl text-slate-950">Mensagens</h1>
            <p className="mt-1.5 text-sm text-slate-500">
              {user.role === "TALENT"
                ? "Conversas abertas pelos organizadores das vagas em que você se candidatou."
                : "Conversas que você abriu com candidatos das suas vagas."}
            </p>
          </div>

          {totalUnread > 0 && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
              {totalUnread === 1
                ? "1 mensagem nova"
                : `${totalUnread} mensagens novas`}
            </span>
          )}
        </div>

        {error && (
          <p
            className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        )}

        {isLoading && !error && (
          <p className="mt-6 text-slate-500">Carregando conversas...</p>
        )}

        {!isLoading && !error && conversations.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <MessagesSquare
              aria-hidden
              className="mx-auto size-9 text-slate-300"
            />
            <p className="mt-4 font-semibold text-slate-700">
              Nenhuma conversa por aqui ainda.
            </p>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-500">
              {user.role === "TALENT"
                ? "O organizador precisa abrir a conversa para vocês trocarem mensagens."
                : "Abra uma conversa pela tela de candidatos de uma vaga."}
            </p>
          </div>
        )}

        {conversations.length > 0 && (
          <ul className="mt-6 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {conversations.map((conversation) => {
              const counterpart = conversationCounterpart(
                conversation,
                user.id,
              );
              const hasUnread = conversation.unreadCount > 0;
              const lastMessage = conversation.lastMessage;
              const sentByMe = lastMessage?.senderUserId === user.id;

              return (
                <li key={conversation.id}>
                  <Link
                    className={`flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50 ${
                      hasUnread ? "bg-emerald-50/40" : ""
                    }`}
                    href={`/mensagens/${conversation.id}`}
                  >
                    <span
                      className={`flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        hasUnread
                          ? "bg-emerald-600 text-white"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {initials(counterpart)}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="truncate font-bold text-slate-950">
                          {counterpart}
                        </p>
                        <time
                          className="shrink-0 text-xs text-slate-400"
                          dateTime={
                            lastMessage?.createdAt ?? conversation.createdAt
                          }
                        >
                          {shortStamp(
                            lastMessage?.createdAt ?? conversation.createdAt,
                          )}
                        </time>
                      </div>

                      <p className="truncate text-xs text-slate-400">
                        {conversation.application.opportunity.title}
                      </p>

                      <p
                        className={`mt-1.5 truncate text-sm ${
                          hasUnread
                            ? "font-semibold text-slate-900"
                            : "text-slate-500"
                        }`}
                      >
                        {lastMessage ? (
                          <>
                            {/* Sem o prefixo não dá para saber de quem foi a última fala. */}
                            {sentByMe && (
                              <span className="text-slate-400">Você: </span>
                            )}
                            {lastMessage.body}
                          </>
                        ) : (
                          <span className="italic text-slate-400">
                            Conversa aberta, sem mensagens ainda.
                          </span>
                        )}
                      </p>
                    </div>

                    {hasUnread && (
                      <span className="flex min-w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">
                        {conversation.unreadCount > 99
                          ? "99+"
                          : conversation.unreadCount}
                      </span>
                    )}

                    <ChevronRight
                      aria-hidden
                      className="size-4 shrink-0 text-slate-300"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </DashboardShell>
  );
}
