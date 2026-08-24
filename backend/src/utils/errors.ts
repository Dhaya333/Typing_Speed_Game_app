import { GraphQLError } from "graphql";

export function unauthenticatedError(
  message = "You must be logged in to perform this action.",
): GraphQLError {
  return new GraphQLError(message, { extensions: { code: "UNAUTHENTICATED" } });
}

export function invalidCredentialsError(): GraphQLError {
  return new GraphQLError("Invalid email or password.", {
    extensions: { code: "INVALID_CREDENTIALS" },
  });
}

export function userAlreadyExistsError(): GraphQLError {
  return new GraphQLError("A user with this email or username already exists.", {
    extensions: { code: "USER_ALREADY_EXISTS" },
  });
}

export function invalidGameResultError(message: string): GraphQLError {
  return new GraphQLError(message, { extensions: { code: "INVALID_GAME_RESULT" } });
}

export function notFoundError(entity: string): GraphQLError {
  return new GraphQLError(`${entity} not found.`, { extensions: { code: "NOT_FOUND" } });
}