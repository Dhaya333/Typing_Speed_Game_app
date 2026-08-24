import { describe, it, expect, beforeEach, mock } from "bun:test";
import { AuthService } from "@/services/auth.service";

// In-memory fake replacing the real UserRepository for fast, DB-free unit tests.
mock.module("@/repositories/user.repository", () => {
  return {
    UserRepository: class {
      private users = new Map<string, any>();

      findByEmailOrUsername = mock(async (email: string, username: string) => {
        return [...this.users.values()].find((u) => u.email === email || u.username === username) ?? null;
      });
      findByEmail = mock(async (email: string) => {
        return [...this.users.values()].find((u) => u.email === email) ?? null;
      });
      findById = mock(async (id: string) => this.users.get(id) ?? null);
      create = mock(async (data: any) => {
        const user = { id: crypto.randomUUID(), ...data, createdAt: new Date() };
        this.users.set(user.id, user);
        return user;
      });
    },
  };
});

describe("AuthService", () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService({} as any);
  });

  it("registers a new user and returns a token", async () => {
    const result = await authService.register({
      username: "alex",
      email: "alex@example.com",
      password: "password123",
    });

    expect(result.token).toBeTruthy();
    expect(result.user.username).toBe("alex");
  });

  it("rejects duplicate registration", async () => {
    await authService.register({ username: "alex", email: "alex@example.com", password: "password123" });

    await expect(
      authService.register({ username: "alex", email: "alex@example.com", password: "password123" }),
    ).rejects.toThrow();
  });

  it("logs in with correct credentials", async () => {
    await authService.register({ username: "sarah", email: "sarah@example.com", password: "password123" });
    const result = await authService.login({ email: "sarah@example.com", password: "password123" });
    expect(result.token).toBeTruthy();
  });

  it("rejects login with wrong password", async () => {
    await authService.register({ username: "john", email: "john@example.com", password: "password123" });

    await expect(
      authService.login({ email: "john@example.com", password: "wrongpassword" }),
    ).rejects.toThrow();
  });
});