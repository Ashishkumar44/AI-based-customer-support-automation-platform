import { io } from "socket.io-client";
import readline from "readline";

const [token, ticketId] = process.argv.slice(2);

const socket = io("http://localhost:5000", { auth: { token } });

socket.on("connect", () => {
  console.log("Connected");

  if (!ticketId) {
    console.log("Ticket join nahi kiya (sirf notifications sunenge)");
    return;
  }

  socket.emit("join_ticket", ticketId, (res) => {
    if (!res.ok) {
      console.log("Join failed:", res.message);
      return;
    }
    console.log("Ticket room join ho gaya.");
    console.log("Message likho + Enter. Typing test: /typing aur /stop");
  });
});

socket.on("connect_error", (err) => {
  console.log("Connection error:", err.message);
});

socket.on("new_message", (m) => {
  console.log(`[${m.senderRole}] ${m.sender.name}: ${m.text}`);
});

socket.on("user_typing", (d) => {
  console.log(
    d.isTyping
      ? `... ${d.name} typing kar raha hai`
      : `... ${d.name} ne typing band ki`
  );
});

socket.on("ticket_notification", (n) => {
  console.log(
    `[NOTIFICATION] ${n.type} | ${n.subject} | ${n.from}${
      n.preview ? ": " + n.preview : ""
    }`
  );
});

const rl = readline.createInterface({ input: process.stdin });
rl.on("line", (line) => {
  if (!ticketId) return console.log("Ticket id ke bina message nahi bhej sakte");
  if (line === "/typing") return socket.emit("typing", { ticketId, isTyping: true });
  if (line === "/stop") return socket.emit("typing", { ticketId, isTyping: false });
  if (!line.trim()) return;

  socket.emit("send_message", { ticketId, text: line }, (res) => {
    if (!res.ok) console.log("Send failed:", res.message);
  });
});