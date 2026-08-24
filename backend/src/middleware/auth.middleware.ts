import { verifyAccessToken } from "@/utils/jwt";

/**
 * Extracts and verifies a Bearer JWT from an Authorization header.
 * Returns the userId (sub claim) if valid, otherwise null.
 * Never throws — a missing/invalid token just means an unauthenticated request;
 * individual resolvers decide whether that's acceptable via requireAuth().
 */
export function verifyAuthHeader(authHeader: string | null): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) return null;

  const payload = verifyAccessToken(token);
  return payload?.sub ?? null;
}