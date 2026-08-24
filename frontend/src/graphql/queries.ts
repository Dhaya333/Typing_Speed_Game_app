import { gql } from "@apollo/client";

export const ME_QUERY = gql`
  query Me {
    me {
      id
      username
      email
    }
  }
`;

export const MY_GAME_HISTORY_QUERY = gql`
  query MyGameHistory {
    myGameHistory {
      id
      totalTimeMs
      correctChars
      wrongAttempts
      penaltyMs
      createdAt
    }
  }
`;

export const MY_BEST_SCORE_QUERY = gql`
  query MyBestScore {
    myBestScore {
      id
      totalTimeMs
      createdAt
    }
  }
`;

export const LEADERBOARD_QUERY = gql`
  query Leaderboard($limit: Int) {
    leaderboard(limit: $limit) {
      rank
      username
      bestTimeMs
    }
  }
`;