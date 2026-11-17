import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { initSocket } from "./socket.js";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = initSocket(server);
app.set("io", io);

connectDB().then(() => {
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});