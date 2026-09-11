"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { readSession, type SessionUser } from "./auth-session";

/**
 * A sessão vive no sessionStorage, então só pode ser lida no cliente. Enquanto
 * o retorno for `null` a página deve renderizar um esqueleto — ou o usuário já
 * está sendo redirecionado para o login.
 */
export function useRequiredSession(requiredRole: SessionUser["role"]) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    const currentUser = readSession();

    if (!currentUser || currentUser.role !== requiredRole) {
      router.replace("/entrar");
      return;
    }

    // Fora do corpo do efeito para não disparar render em cascata
    // (`react-hooks/set-state-in-effect`), como já é feito no RoleDashboard.
    let isActive = true;
    queueMicrotask(() => {
      if (isActive) setUser(currentUser);
    });

    return () => {
      isActive = false;
    };
  }, [requiredRole, router]);

  return user;
}
