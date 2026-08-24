import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const alex = await prisma.user.upsert({
    where: { email: "alex@example.com" },
    update: {},
    create: {
      username: "Alex",
      email: "alex@example.com",
      passwordHash,
    },
  });

  const john = await prisma.user.upsert({
    where: { email: "john@example.com" },
    update: {},
    create: {
      username: "John",
      email: "john@example.com",
      passwordHash,
    },
  });

  const sarah = await prisma.user.upsert({
    where: { email: "sarah@example.com" },
    update: {},
    create: {
      username: "Sarah",
      email: "sarah@example.com",
      passwordHash,
    },
  });

  await prisma.gameResult.createMany({
    data: [
      { userId: alex.id, totalTimeMs: 8420, correctChars: 20, wrongAttempts: 1, penaltyMs: 500 },
      { userId: john.id, totalTimeMs: 9150, correctChars: 20, wrongAttempts: 2, penaltyMs: 1000 },
      { userId: sarah.id, totalTimeMs: 9870, correctChars: 20, wrongAttempts: 0, penaltyMs: 0 },
    ],
  });

  console.log("Seed data created:", { alex: alex.username, john: john.username, sarah: sarah.username });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });