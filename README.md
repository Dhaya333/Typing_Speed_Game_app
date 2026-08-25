# Typing Speed Game

A full-stack typing speed test application. Users register, play a 20-character typing challenge with live penalty tracking, and compete on a global leaderboard.

Built as a submission for the Burdenoff full-stack assignment — evaluating frontend, backend, GraphQL API design, database modeling, authentication, state management, validation, and code quality.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start (Docker Compose)](#quick-start-docker-compose)
- [Running Without Docker](#running-without-docker)
- [Environment Variables](#environment-variables)
- [GraphQL API](#graphql-api)
- [Testing](#testing)
- [Key Technical Decisions](#key-technical-decisions)
- [Known Limitations](#known-limitations)
- [Walkthrough](#walkthrough)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Bun, TypeScript (strict mode) |
| API | GraphQL Yoga |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT (jsonwebtoken) + bcrypt password hashing |
| Validation | Zod |
| Frontend | React, TypeScript, Vite |
| Data fetching | Apollo Client |
| Routing | React Router |
| Testing | Bun test (backend unit + integration), Vitest + React Testing Library (frontend) |
| Containerization | Docker, Docker Compose |

---

## Features

- User registration and login with hashed passwords and JWT-based sessions
- 20-character randomized typing challenge, one character at a time
- 0.5s penalty per incorrect keypress, tracked live during the round
- Progress indicator (`n / 20`) and running timer
- Success / Try Again result based on beating your own previous best time
- Best score persisted locally (instant feedback, works even logged out) **and** in the backend (source of truth for history/leaderboard) when logged in
- Full game history per user
- Global leaderboard, ranked by best time ascending
- A user can only ever read their own game history — enforced at the resolver level, not just hidden in the UI

---

## Project Structure

```
typing-speed-game/
├── docker-compose.yml
├── .env.example
├── README.md
├── backend/
│   ├── prisma/            # schema, migrations, seed data
│   └── src/
│       ├── graphql/       # typeDefs + resolvers
│       ├── services/      # business logic
│       ├── repositories/  # Prisma data access
│       ├── middleware/    # JWT auth extraction
│       ├── validation/    # Zod input schemas
│       └── utils/
└── frontend/
    └── src/
        ├── pages/          # route-level views
        ├── components/     # game/, layout/, ui/
        ├── hooks/          # useTypingGame, useAuth, useLocalBestScore
        ├── context/        # AuthContext
        └── graphql/        # Apollo client, queries, mutations
```

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for the one-command setup)
- [Bun](https://bun.sh) (only needed if running the backend without Docker)
- [Node.js 20+](https://nodejs.org) (only needed if running the frontend without Docker)

---

## Quick Start (Docker Compose)

```bash
git clone https://github.com/Dhaya333/typing-speed-game.git
cd typing-speed-game
cp .env.example .env
docker compose up --build
```

This will, in order:
1. Start PostgreSQL and wait until it's actually accepting connections (healthcheck, not just "container started")
2. Run `prisma migrate deploy` against it automatically
3. Start the backend GraphQL server
4. Build and serve the frontend via nginx

Once it settles:
- **Frontend:** http://localhost:5173
- **Backend / GraphiQL:** http://localhost:4000/graphql

Stop everything:
```bash
docker compose down          # keeps DB data
docker compose down -v       # also wipes DB data
```

> **Note on ports:** Postgres defaults to host port `5433` (not `5432`) in this setup to avoid colliding with any other local Postgres instance you may already be running. Adjust `POSTGRES_PORT` in `.env` if needed.

---

## Running Without Docker

### Backend

```bash
cd backend
cp .env.example .env
# edit .env — DATABASE_URL should point at a Postgres instance reachable from your host,
# e.g. postgresql://typing_user:typing_password@localhost:5433/typing_speed_game

bun install
bunx prisma generate
bunx prisma migrate dev --name init
bun run prisma:seed        # optional — adds sample leaderboard data
bun run dev
```

Backend + GraphiQL: http://localhost:4000/graphql

### Frontend

```bash
cd frontend
cp .env.example .env
# confirm VITE_GRAPHQL_URL=http://localhost:4000/graphql

npm install
npm run dev
```

Frontend: http://localhost:5173

---

## Environment Variables

### Root `.env` (used by `docker-compose.yml`)

| Variable | Description | Default |
|---|---|---|
| `POSTGRES_USER` | Postgres username | `typing_user` |
| `POSTGRES_PASSWORD` | Postgres password | `typing_password` |
| `POSTGRES_DB` | Database name | `typing_speed_game` |
| `POSTGRES_PORT` | Host-side port mapping for Postgres | `5433` |
| `JWT_SECRET` | Secret used to sign JWTs — **change this** | — |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `BACKEND_PORT` | Host-side port for the backend | `4000` |
| `FRONTEND_URL` | Used for backend CORS config | `http://localhost:5173` |
| `FRONTEND_PORT` | Host-side port for the frontend | `5173` |
| `VITE_GRAPHQL_URL` | GraphQL endpoint baked into the frontend at **build time** | `http://localhost:4000/graphql` |

### `backend/.env` (standalone dev)

Same as above minus the `POSTGRES_*`/`FRONTEND_PORT` values, plus `DATABASE_URL` as a full connection string and `NODE_ENV`.

### `frontend/.env` (standalone dev)

Just `VITE_GRAPHQL_URL`.

No credentials or secrets are hard-coded anywhere in the codebase — everything sensitive is read from environment variables, and `.env` is gitignored (`.env.example` files are committed instead).

---

## GraphQL API

### Mutations

```graphql
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    token
    user { id username email }
  }
}

mutation Login($input: LoginInput!) {
  login(input: $input) {
    token
    user { id username email }
  }
}

mutation SubmitGameResult($input: SubmitGameResultInput!) {
  submitGameResult(input: $input) {
    id
    totalTimeMs
    correctChars
    wrongAttempts
    penaltyMs
    createdAt
  }
}
```

### Queries

```graphql
query Me {
  me { id username email }
}

query MyGameHistory {
  myGameHistory { id totalTimeMs wrongAttempts penaltyMs createdAt }
}

query MyBestScore {
  myBestScore { id totalTimeMs createdAt }
}

query Leaderboard($limit: Int) {
  leaderboard(limit: $limit) { rank username bestTimeMs }
}
```

Authenticated operations (`me`, `myGameHistory`, `myBestScore`, `submitGameResult`) require an `Authorization: Bearer <token>` header. Unauthenticated requests to protected mutations/queries throw a `GraphQLError` with `extensions.code: "UNAUTHENTICATED"`.

Full interactive schema and docs are available via GraphiQL at `/graphql` when the backend is running in non-production mode.

---

## Testing

### Backend

```bash
cd backend
bun test                   # all tests
bun run test:unit          # unit only — no DB required
bun run test:integration   # integration — requires a running Postgres with migrations applied
```

Covers: password hashing and JWT issuance, duplicate registration rejection, invalid login rejection, game result validation (exact 20 correct chars, non-negative values), best-score computation across multiple runs, leaderboard ordering, and cross-user data isolation (a user cannot read another user's history).

### Frontend

```bash
cd frontend
npm run test
```

Covers: the core typing game state machine (correct keypress advances, incorrect keypress penalizes without advancing, completion transitions to `finished`), and rendering of the character display and result screen components.

---

## Key Technical Decisions

- **Local + backend best score, not just one or the other.** LocalStorage gives instant feedback and works for anonymous play; the backend is the source of truth once a user is authenticated, since the leaderboard and history need to be server-side by definition.
- **Raw SQL for the leaderboard query.** Prisma's `groupBy` can compute `MIN(totalTimeMs)` per user but can't cleanly join back to `username` in one query, so `leaderboard` uses `$queryRaw` with a parameterized `LIMIT` instead of two round trips.
- **JWT over sessions.** Simpler to reason about for a GraphQL API with no server-side session store required; the tradeoff is no server-side revocation before expiry, which is acceptable for this assignment's scope.
- **Repository → Service → Resolver layering.** Repositories only know Prisma; services hold business rules (e.g. "a completed game must have exactly 20 correct characters"); resolvers only handle GraphQL wiring and auth checks. Keeps unit tests fast (mock the repository layer) and integration tests meaningful (exercise the real resolver → service → DB path).
- **Vite env vars are build-time, not runtime.** `VITE_GRAPHQL_URL` is passed into the frontend's Docker build as an `ARG`, not a runtime `environment` var — Vite statically replaces `import.meta.env.VITE_*` when the bundle is built, so setting it only at container-start would have no effect on the already-built JS.
- **`createdAt` explicitly serialized to ISO string** via GraphQL field resolvers on `User` and `GameResult`, rather than trusting the default `String` scalar to stringify a `Date` correctly (it doesn't — it uses `.valueOf()`, which produces a raw timestamp number, not an ISO string).

---

## Known Limitations

- No JWT revocation/blocklist — logout is purely client-side (token removed from localStorage), the token itself remains valid until it expires.
- No rate limiting on auth mutations.
- Bonus features not implemented in this submission: GraphQL subscriptions/real-time leaderboard, Redis caching, MongoDB event logging, difficulty levels, CI/CD pipeline, dark mode.

---

## Working 


A short walkthrough covering the implementation and key technical decisions: **[link here](https://drive.google.com/file/d/16ZlxrEnbwnjiY5f-GHPOY8y0dCbtxpLC/view?usp=drive_link)**