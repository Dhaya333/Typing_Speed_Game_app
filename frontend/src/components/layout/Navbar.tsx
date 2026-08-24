import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <Link to="/game" className="navbar-brand">
        Typing Speed Game
      </Link>
      <div className="navbar-links">
        <Link to="/game">Play</Link>
        <Link to="/leaderboard">Leaderboard</Link>
        {user && <Link to="/history">History</Link>}
        {user ? (
          <>
            <span className="navbar-user">{user.username}</span>
            <button type="button" onClick={handleLogout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}