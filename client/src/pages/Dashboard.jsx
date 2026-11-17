import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-indigo-600">
          AI Support Platform
        </h1>
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

      <main className="p-6">
        <p className="text-gray-600">Tickets yahan aayenge (Part 5.3).</p>
      </main>
    </div>
  );
}