import { getItem, setItem } from "@/lib/storage";

/* CONTRACT for backend dev — replace the localStorage bodies below with
   fetch() calls to your real endpoints; keep these signatures/return shapes
   so useAuth.js needs no changes:
     signUp({name, email, password}) => Promise<{ user: {id,name,email,phone,avatar,role} }>
     signIn({email, password})       => Promise<{ user: {id,name,email,phone,avatar,role} }>
     signOut()                       => Promise<void>
     getSession()                    => Promise<{ user: {...} } | null>
   Errors are surfaced by throwing — callers catch and read `.message`.
   `role` is "admin" | "member" — the very first account ever created is
   seeded as "admin" (a bootstrap superuser); everyone after is "member". */

function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toPublicUser(u) {
  return { id: u.id, name: u.name, email: u.email, phone: u.phone, avatar: u.avatar, role: u.role };
}

export async function signUp({ name, email, password }) {
  await delay();
  const users = getItem("users", []);
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("An account with this email already exists.");
  }
  const user = {
    id: crypto.randomUUID(),
    name,
    email,
    password,
    phone: "",
    avatar: "",
    role: users.length === 0 ? "admin" : "member",
  };
  setItem("users", [...users, user]);
  setItem("session", { userId: user.id });
  return { user: toPublicUser(user) };
}

export async function signIn({ email, password }) {
  await delay();
  const users = getItem("users", []);
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password !== password) {
    throw new Error("Invalid email or password.");
  }
  setItem("session", { userId: user.id });
  return { user: toPublicUser(user) };
}

export async function signOut() {
  await delay(80);
  setItem("session", null);
}

export async function getSession() {
  const session = getItem("session", null);
  if (!session) return null;
  const users = getItem("users", []);
  const user = users.find((u) => u.id === session.userId);
  return user ? { user: toPublicUser(user) } : null;
}
