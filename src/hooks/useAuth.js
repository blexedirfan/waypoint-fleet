import { useState, useEffect, useCallback } from "react";
import * as authService from "@/services/authService";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService
      .getSession()
      .then((session) => setUser(session ? session.user : null))
      .finally(() => setLoading(false));
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    const { user } = await authService.signIn({ email, password });
    setUser(user);
    return user;
  }, []);

  const signUp = useCallback(async ({ name, email, password }) => {
    const { user } = await authService.signUp({ name, email, password });
    setUser(user);
    return user;
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setUser(null);
  }, []);

  return { user, isAuthenticated: !!user, loading, signIn, signUp, signOut, setUser };
}
