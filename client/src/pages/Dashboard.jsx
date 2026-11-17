import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Badge from "../components/Badge";
import TicketForm from "../components/TicketForm";

export default function Dashboard() {
  const { user } = useAuth();
  const isCustomer = user.role === "customer";

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(isCustomer);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isCustomer) return;

    api
      .get("/tickets/my")
      .then((res) => setTickets(res.data))
      .catch((err) =>
        setError(err.response?.data?.message || "Tickets load nahi hue")
      )
      .finally(() => setLoading(false));
  }, [isCustomer]);

  const handleCreated = (ticket) => setTickets((prev) => [ticket, ...prev]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="max-w-5xl mx-auto p-6">
        {!isCustomer ? (
          <p className="bg-white p-6 rounded-xl shadow text-gray-600">
            Agent dashboard Part 5.5 me banega.
          </p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <TicketForm onCreated={handleCreated} />
            </div>

            <div className="md:col-span-2 space-y-3">
              <h2 className="text-lg font-semibold text-gray-800">
                Mere tickets
              </h2>

              {loading && <p className="text-gray-500">Load ho raha hai...</p>}

              {error && (
                <p className="bg-red-50 text-red-600 text-sm p-2 rounded">
                  {error}
                </p>
              )}

              {!loading && !error && tickets.length === 0 && (
                <p className="bg-white p-6 rounded-xl shadow text-gray-500">
                  Abhi koi ticket nahi hai. Left side ke form se pehla ticket
                  banao.
                </p>
              )}

              {tickets.map((t) => (
                <Link
                  key={t._id}
                  to={`/tickets/${t._id}`}
                  className="block bg-white p-4 rounded-xl shadow hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-medium text-gray-800">{t.subject}</h3>
                    <div className="flex gap-2 shrink-0">
                      <Badge value={t.priority} />
                      <Badge value={t.status} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {t.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(t.createdAt).toLocaleString("en-IN")}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}