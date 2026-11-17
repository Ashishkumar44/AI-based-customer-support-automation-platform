import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";
import Badge from "../components/Badge";

export default function TicketPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/tickets/${id}`)
      .then((res) => setTicket(res.data))
      .catch((err) =>
        setError(err.response?.data?.message || "Ticket load nahi hua")
      );
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="max-w-3xl mx-auto p-6 space-y-4">
        <Link to="/" className="text-sm text-indigo-600">
          ← Wapas tickets par
        </Link>

        {error && (
          <p className="bg-red-50 text-red-600 text-sm p-3 rounded">{error}</p>
        )}

        {!ticket && !error && <p className="text-gray-500">Load ho raha hai...</p>}

        {ticket && (
          <div className="bg-white p-6 rounded-xl shadow space-y-3">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-xl font-semibold text-gray-800">
                {ticket.subject}
              </h1>
              <div className="flex gap-2 shrink-0">
                <Badge value={ticket.priority} />
                <Badge value={ticket.status} />
              </div>
            </div>

            <p className="text-gray-600 whitespace-pre-wrap">
              {ticket.description}
            </p>

            <div className="text-sm text-gray-500 border-t pt-3 space-y-1">
              <p>Customer: {ticket.customer?.name}</p>
              <p>
                Agent:{" "}
                {ticket.assignedAgent
                  ? ticket.assignedAgent.name
                  : "Abhi assign nahi hua"}
              </p>
              <p>
                Banaya: {new Date(ticket.createdAt).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-xl shadow text-gray-400 text-center">
          Live chat Part 5.4 me yahan aayegi
        </div>
      </main>
    </div>
  );
}