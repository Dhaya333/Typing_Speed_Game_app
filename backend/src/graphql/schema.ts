import { createSchema } from "graphql-yoga";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { resolvers } from "@/graphql/resolvers";

function loadTypeDefs(): string {
  const dir = join(import.meta.dir, "typeDefs");
  const files = ["user.graphql", "game.graphql", "leaderboard.graphql"];
  return files.map((file) => readFileSync(join(dir, file), "utf-8")).join("\n");
}

export const schema = createSchema({
  typeDefs: loadTypeDefs(),
  resolvers,
});