import { useQuery } from "@apollo/client";
import { MY_GAME_HISTORY_QUERY } from "@/graphql/queries";

interface GameResult {
  id: string;
  totalTimeMs: number;
  correctChars: number;
  wrongAttempts: number;
  penaltyMs: number;
  createdAt: string;
}

interface MyGameHistoryData {
  myGameHistory: GameResult[];
}

export default function HistoryPage() {
  const { data, loading, error } = useQuery<MyGameHistoryData>(MY_GAME_HISTORY_QUERY);

  return (
    <div className="history-page">
      <h1>Your Game History</h1>

      {loading && <p>Loading history...</p>}
      {error && <p role="alert">Couldn't load your history. Please try again.</p>}

      {data && data.myGameHistory.length === 0 && <p>You haven't played any games yet.</p>}

      {data && data.myGameHistory.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Wrong Attempts</th>
              <th>Penalty</th>
            </tr>
          </thead>
          <tbody>
            {data.myGameHistory.map((result) => (
              <tr key={result.id}>
                <td>{new Date(result.createdAt).toLocaleString()}</td>
                <td>{(result.totalTimeMs / 1000).toFixed(2)}s</td>
                <td>{result.wrongAttempts}</td>
                <td>{(result.penaltyMs / 1000).toFixed(2)}s</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}