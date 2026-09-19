"use client";

import { useEffect, useState } from "react";
import { apiFetch, isAbortError, type UnreadSummary } from "./api";

const empty: UnreadSummary = { total: 0, byConversation: {} };

/**
 * Contagem de mensagens não lidas do usuário.
 *
 * Falhas são engolidas de propósito: isto alimenta um badge, e um erro de rede
 * aqui não deve derrubar a tela que o hospeda. Na pior hipótese o aviso não
 * aparece.
 */
export function useUnreadMessages(userId: string | undefined) {
  const [summary, setSummary] = useState<UnreadSummary>(empty);

  useEffect(() => {
    if (!userId) return;

    const controller = new AbortController();

    apiFetch<UnreadSummary>(`/conversations/unread?userId=${userId}`, {
      signal: controller.signal,
    })
      .then(setSummary)
      .catch((requestError: unknown) => {
        if (!isAbortError(requestError)) setSummary(empty);
      });

    return () => controller.abort();
  }, [userId]);

  return summary;
}
