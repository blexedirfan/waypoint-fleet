import { apiFetch, setToken, getToken, clearToken } from "@/lib/apiClient";

/* Talks to the real API server (see server/src/routes/auth.js). Exported
   signatures/return shapes are unchanged from the old localStorage version,
   so useAuth.js needs no changes:
     signUp({name, email, password}) => Promise<{ user: {id,name,email,phone,avatar,role} }>
     signIn({email, password})       => Promise<{ user: {id,name,email,phone,avatar,role} }>
     signOut()                       => Promise<void>
     getSession()                    => Promise<{ user: {...} } | null>
   Errors are surfaced by throwing — callers catch and read `.message`.
   The JWT issued by the server is kept in localStorage (the only local
   storage left in the app) and sent as a Bearer token on every request. */

export async function signUp({ name, email, password }) {
  const data = await apiFetch("/api/auth/signup", { method: "POST", body: { name, email, password } });
  setToken(data.token);
  return { user: data.user };
}

export async function signIn({ email, password }) {
  const data = await apiFetch("/api/auth/signin", { method: "POST", body: { email, password } });
  setToken(data.token);
  return { user: data.user };
}

export async function signOut() {
  clearToken();
}

export async function getSession() {
  if (!getToken()) return null;
  try {
    const data = await apiFetch("/api/auth/session");
    return { user: data.user };
  } catch {
    clearToken();
    return null;
  }
}
