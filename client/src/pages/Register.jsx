import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Server se connect nahi ho paya"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow w-full max-w-sm space-y-4"
      >
        <h1 className="text-2xl font-bold text-indigo-600 text-center">
          Register
        </h1>

        {error && (
          <p className="bg-red-50 text-red-600 text-sm p-2 rounded">{error}</p>
        )}

        <input
          type="text"
          name="name"
          placeholder="Naam"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <input
          type="password"
          name="password"
          placeholder="Password (kam se kam 6 characters)"
          value={form.password}
          onChange={handleChange}
          required
          minLength={6}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Account ban raha hai..." : "Register"}
        </button>

        <p className="text-sm text-center text-gray-600">
          Pehle se account hai?{" "}
          <Link to="/login" className="text-indigo-600 font-medium">
            Login karo
          </Link>
        </p>
      </form>
    </div>
  );
}