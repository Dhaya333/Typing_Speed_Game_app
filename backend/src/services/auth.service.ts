import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { GraphQLError } from "graphql";
import type { PrismaClient, User } from "@prisma/client";
import { UserRepository } from "@/repositories/user.repository";
import { env } from "@/config/env";

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthPayload {
  token: string;
  user: User;
}

const SALT_ROUNDS = 10;

export class AuthService {
  private readonly userRepository: UserRepository;

  constructor(prisma: PrismaClient) {
    this.userRepository = new UserRepository(prisma);
  }

  async register(input: RegisterInput): Promise<AuthPayload> {
    const existing = await this.userRepository.findByEmailOrUsername(input.email, input.username);
    if (existing) {
      throw new GraphQLError("A user with this email or username already exists.", {
        extensions: { code: "USER_ALREADY_EXISTS" },
      });
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await this.userRepository.create({
      username: input.username,
      email: input.email,
      passwordHash,
    });

    return { token: this.signToken(user.id), user };
  }

  async login(input: LoginInput): Promise<AuthPayload> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new GraphQLError("Invalid email or password.", {
        extensions: { code: "INVALID_CREDENTIALS" },
      });
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
      throw new GraphQLError("Invalid email or password.", {
        extensions: { code: "INVALID_CREDENTIALS" },
      });
    }

    return { token: this.signToken(user.id), user };
  }

  async getUserById(userId: string): Promise<User | null> {
    return this.userRepository.findById(userId);
  }

  private signToken(userId: string): string {
    return jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
  }

  verifyToken(token: string): { sub: string } | null {
    try {
      return jwt.verify(token, env.JWT_SECRET) as { sub: string };
    } catch {
      return null;
    }
  }
}