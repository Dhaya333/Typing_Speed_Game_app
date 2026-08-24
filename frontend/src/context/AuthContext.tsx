import { createContext, useCallback, useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { LOGIN_MUTATION, REGISTER_MUTATION } from "@/graphql/mutations";
import { ME_QUERY } from "@/graphql/queries";
import { AUTH_TOKEN_STORAGE_KEY } from "@/utils/storage";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(AUTH_TOKEN_STORAGE_KEY));

  const { data, loading, refetch } = useQuery<{ me: User | null }>(ME_QUERY, {
    skip: !token,
    fetchPolicy: "network-only",
  });

  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [registerMutation] = useMutation(REGISTER_MUTATION);

  const persistToken = useCallback((newToken: string) => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, newToken);
    setToken(newToken);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await loginMutation({ variables: { input: { email, password } } });
      if (!data?.login?.token) throw new Error("Login failed.");
      persistToken(data.login.token);
      await refetch();
    },
    [loginMutation, persistToken, refetch],
  );

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      const { data } = await registerMutation({ variables: { input: { username, email, password } } });
      if (!data?.register?.token) throw new Error("Registration failed.");
      persistToken(data.register.token);
      await refetch();
    },
    [registerMutation, persistToken, refetch],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    setToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: data?.me ?? null,
      loading: Boolean(token) && loading,
      login,
      register,
      logout,
    }),
    [data, loading, token, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}