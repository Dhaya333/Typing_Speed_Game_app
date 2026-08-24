import { gql } from "@apollo/client";

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        username
        email
      }
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        username
        email
      }
    }
  }
`;

export const SUBMIT_GAME_RESULT_MUTATION = gql`
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
`;