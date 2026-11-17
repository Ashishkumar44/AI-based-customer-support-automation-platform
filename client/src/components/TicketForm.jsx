import { useState } from "react";
import api from "../api";

export default function TicketForm({ onCreated }) {
  const [form, setForm] = useState({
    subject: "",
    description: "",
    priority: "medium",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/tickets", form);
      onCreated(data);
      setForm({ subject: "", description: "", priority: "medium" });
    } catch (err) {
      setError(err.response?.data?.message || "Ticket nahi ban paya");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow space-y-3"
    >
      <h2 className="text-lg font-semibold text-gray-800">Naya ticket</h2>

      {error && (
        <p className="bg-red-50 text-red-600 text-sm p-2 rounded">{error}</p>
      )}

      <input
        name="subject"
        placeholder="Subject (jaise: Login nahi ho raha)"
        value={form.subject}
        onChange={handleChange}
        required
        maxLength={120}
        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
      <textarea
        name="description"
        placeholder="Problem detail me likho"
        value={form.description}
        onChange={handleChange}
        required
        rows={4}
        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
      <select
        name="priority"
        value={form.priority}
        onChange={handleChange}
        className="w-full border rounded-lg px-3 py-2"
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "Ban raha hai..." : "Ticket banao"}
      </button>
    </form>
  );
}