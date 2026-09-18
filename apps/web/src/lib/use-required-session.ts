"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { readSession, type SessionUser } from "./auth-session";

type Role = SessionUser["role"];

/**
 * A sessão vive no sessionStorage, então só pode ser lida no cliente. Enquanto
 * o retorno for `null` a página deve renderizar um esqueleto — ou o usuário já
 * está sendo redirecionado para o login.
 *
 * `requiredRole` aceita uma lista quando a tela serve a mais de um perfil, como
 * o chat, que é compartilhado entre talento e organizador.
 */
export function useRequiredSession(requiredRole: Role | Role[]) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  // Array novo a cada render quebraria a dependência do efeito.
  const allowed = Array.isArray(requiredRole)
    ? requiredRole.join(",")
    : requiredRole;

  useEffect(() => {
    const currentUser = readSession();

    if (!currentUser || !allowed.split(",").includes(currentUser.role)) {
      router.replace("/entrar");
      return;
    }

    // Fora do corpo do efeito para não disparar render em cascata
    // (`react-hooks/set-state-in-effect`).
    let isActive = true;
    queueMicrotask(() => {
      if (isActive) setUser(currentUser);
    });

    return () => {
      isActive = false;
    };
  }, [allowed, router]);

  return user;
}
