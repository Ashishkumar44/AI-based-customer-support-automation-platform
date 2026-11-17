import { useEffect, useState } from "react";
import api from "./api";

export default function App() {
  const [status, setStatus] = useState("checking...");

  useEffect(() => {
    api
      .get("/health")
      .then((res) => setStatus(res.data.status))
      .catch(() => setStatus("server not reachable"));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow text-center">
        <h1 className="text-2xl font-bold text-indigo-600">
          AI Support Platform
        </h1>
        <p className="mt-2 text-gray-600">
          Server status: <span className="font-semibold">{status}</span>
        </p>
      </div>
    </div>
  );
}