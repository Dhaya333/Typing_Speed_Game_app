import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { PrismaClient } from "@prisma/client";
import { graphql } from "graphql";
import bcrypt from "bcryptjs";
import { schema } from "@/graphql/schema";
import type { GraphQLContext } from "@/context";

const prisma = new PrismaClient();

function buildContext(userId: string | null = null): GraphQLContext {
  return { prisma, userId, request: new Request("http://localhost/graphql") } as GraphQLContext;
}

const SUBMIT_MUTATION = /* GraphQL */ `
  mutation Submit($input: SubmitGameResultInput!) {
    submitGameResult(input: $input) {
      id
      totalTimeMs
    }
  }
`;

const HISTORY_QUERY = /* GraphQL */ `
  query History {
    myGameHistory { id totalTimeMs }
  }
`;

let userAId: string;
let userBId: string;

beforeAll(async () => {
  await prisma.gameResult.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);
  const userA = await prisma.user.create({
    data: { username: "userA", email: "userA@example.com", passwordHash },
  });
  const userB = await prisma.user.create({
    data: { username: "userB", email: "userB@example.com", passwordHash },
  });
  userAId = userA.id;
  userBId = userB.id;
});

afterAll(async () => {
  await prisma.gameResult.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe("game resolvers", () => {
  it("rejects submitGameResult when unauthenticated", async () => {
    const result = await graphql({
      schema,
      source: SUBMIT_MUTATION,
      contextValue: buildContext(null),
      variableValues: { input: { totalTimeMs: 8000, correctChars: 20, wrongAttempts: 0, penaltyMs: 0 } },
    });
    expect(result.errors).toBeDefined();
  });

  it("saves a game result for the authenticated user", async () => {
    const result = await graphql({
      schema,
      source: SUBMIT_MUTATION,
      contextValue: buildContext(userAId),
      variableValues: { input: { totalTimeMs: 8420, correctChars: 20, wrongAttempts: 1, penaltyMs: 500 } },
    });

    expect(result.errors).toBeUndefined();
    expect((result.data as any).submitGameResult.totalTimeMs).toBe(8420);
  });

  it("a user only sees their own game history", async () => {
    await graphql({
      schema,
      source: SUBMIT_MUTATION,
      contextValue: buildContext(userBId),
      variableValues: { input: { totalTimeMs: 9500, correctChars: 20, wrongAttempts: 0, penaltyMs: 0 } },
    });

    const resultA = await graphql({ schema, source: HISTORY_QUERY, contextValue: buildContext(userAId) });
    const resultB = await graphql({ schema, source: HISTORY_QUERY, contextValue: buildContext(userBId) });

    expect((resultA.data as any).myGameHistory).toHaveLength(1);
    expect((resultB.data as any).myGameHistory).toHaveLength(1);
    expect((resultA.data as any).myGameHistory[0].totalTimeMs).toBe(8420);
    expect((resultB.data as any).myGameHistory[0].totalTimeMs).toBe(9500);
  });
});