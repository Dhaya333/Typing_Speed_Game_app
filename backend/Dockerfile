FROM oven/bun:1.1-alpine AS base
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile || bun install

# Copy the rest of the source
COPY . .

# Generate Prisma client
RUN bunx prisma generate

EXPOSE 4000

# Run migrations then start the server
CMD ["sh", "-c", "bunx prisma migrate deploy && bun run src/index.ts"]