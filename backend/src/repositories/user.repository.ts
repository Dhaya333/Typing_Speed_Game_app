import type { PrismaClient } from "@prisma/client";

export class UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findByUsername(username: string) {
    return this.prisma.user.findUnique({ where: { username } });
  }

  findByEmailOrUsername(email: string, username: string) {
    return this.prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
  }

  create(data: { username: string; email: string; passwordHash: string }) {
    return this.prisma.user.create({ data });
  }
}