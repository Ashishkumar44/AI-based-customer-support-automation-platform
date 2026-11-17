import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold text-indigo-600">
        AI Support Platform
      </Link>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {user.name} ({user.role})
        </span>
        <button
          onClick={logout}
          className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
        >
          Logout
        </button>
      </div>
    </header>
  );
}