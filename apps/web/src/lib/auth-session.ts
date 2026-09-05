export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "TALENT" | "ORGANIZATION";
};

const SESSION_KEY = "conectafreela.user";

export function saveSession(user: SessionUser) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function readSession(): SessionUser | null {
  const storedUser = sessionStorage.getItem(SESSION_KEY);
  if (!storedUser) return null;

  try {
    const user = JSON.parse(storedUser) as SessionUser;
    if (
      !user.id ||
      !user.email ||
      !["TALENT", "ORGANIZATION"].includes(user.role)
    ) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}
