import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { PrismaClient } from "@prisma/client";
import { graphql } from "graphql";
import { schema } from "@/graphql/schema";
import type { GraphQLContext } from "@/context";

// Integration tests run against a real (disposable) Postgres database.
// Point DATABASE_URL at a test database and run `bunx prisma migrate deploy`
// against it before running this suite — e.g. a `db-test` service in
// docker-compose, or a CI step that spins up Postgres before `bun test`.
const prisma = new PrismaClient();

function buildContext(userId: string | null = null): GraphQLContext {
  return { prisma, userId, request: new Request("http://localhost/graphql") } as GraphQLContext;
}

const REGISTER_MUTATION = /* GraphQL */ `
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user { id username email }
    }
  }
`;

const LOGIN_MUTATION = /* GraphQL */ `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user { id username }
    }
  }
`;

const ME_QUERY = /* GraphQL */ `
  query Me {
    me { id username email }
  }
`;

beforeAll(async () => {
  await prisma.gameResult.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.gameResult.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe("auth resolvers", () => {
  it("registers a user", async () => {
    const result = await graphql({
      schema,
      source: REGISTER_MUTATION,
      contextValue: buildContext(),
      variableValues: {
        input: { username: "integrationuser", email: "integration@example.com", password: "password123" },
      },
    });

    expect(result.errors).toBeUndefined();
    expect((result.data as any).register.user.username).toBe("integrationuser");
  });

  it("rejects duplicate email on register", async () => {
    const result = await graphql({
      schema,
      source: REGISTER_MUTATION,
      contextValue: buildContext(),
      variableValues: {
        input: { username: "anotherName", email: "integration@example.com", password: "password123" },
      },
    });

    expect(result.errors).toBeDefined();
  });

  it("logs in with correct credentials", async () => {
    const result = await graphql({
      schema,
      source: LOGIN_MUTATION,
      contextValue: buildContext(),
      variableValues: { input: { email: "integration@example.com", password: "password123" } },
    });

    expect(result.errors).toBeUndefined();
    expect((result.data as any).login.token).toBeTruthy();
  });

  it("me returns null when unauthenticated", async () => {
    const result = await graphql({ schema, source: ME_QUERY, contextValue: buildContext(null) });
    expect(result.errors).toBeUndefined();
    expect((result.data as any).me).toBeNull();
  });

  it("me returns the current user when authenticated", async () => {
    const user = await prisma.user.findUniqueOrThrow({ where: { email: "integration@example.com" } });
    const result = await graphql({ schema, source: ME_QUERY, contextValue: buildContext(user.id) });
    expect(result.errors).toBeUndefined();
    expect((result.data as any).me.username).toBe("integrationuser");
  });
});