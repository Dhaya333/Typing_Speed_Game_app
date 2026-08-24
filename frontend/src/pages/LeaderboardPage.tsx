import { useQuery } from "@apollo/client";
import { LEADERBOARD_QUERY } from "@/graphql/queries";

interface LeaderboardEntry {
  rank: number;
  username: string;
  bestTimeMs: number;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
}

export default function LeaderboardPage() {
  const { data, loading, error } = useQuery<LeaderboardData>(LEADERBOARD_QUERY, {
    variables: { limit: 10 },
  });

  return (
    <div className="leaderboard-page">
      <h1>Leaderboard</h1>

      {loading && <p>Loading leaderboard...</p>}
      {error && <p role="alert">Couldn't load the leaderboard. Please try again.</p>}

      {data && data.leaderboard.length === 0 && <p>No scores yet — be the first to play!</p>}

      {data && data.leaderboard.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Best Time</th>
            </tr>
          </thead>
          <tbody>
            {data.leaderboard.map((entry) => (
              <tr key={entry.rank}>
                <td>{entry.rank}</td>
                <td>{entry.username}</td>
                <td>{(entry.bestTimeMs / 1000).toFixed(2)}s</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}