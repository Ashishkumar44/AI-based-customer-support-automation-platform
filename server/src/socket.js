import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "./models/User.js";
import Ticket from "./models/Ticket.js";
import Message from "./models/Message.js";

const STAFF_ROOM = "staff";

const reply = (ack, data) => typeof ack === "function" && ack(data);

const canAccessTicket = (user, ticket) =>
  ["agent", "admin"].includes(user.role) || ticket.customer.equals(user._id);

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  // Har connection se pehle token check hoga
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Login required"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error("User nahi mila"));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Token invalid ya expire ho gaya"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.user.name} (${socket.user.role})`);

    // Agent/admin ko notifications wale staff room me daalo
    if (["agent", "admin"].includes(socket.user.role)) {
      socket.join(STAFF_ROOM);
    }

    // Ticket ke chat room me join
    socket.on("join_ticket", async (ticketId, ack) => {
      try {
        if (!mongoose.isValidObjectId(ticketId)) {
          return reply(ack, { ok: false, message: "Ticket id galat hai" });
        }

        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
          return reply(ack, { ok: false, message: "Ticket nahi mila" });
        }

        if (!canAccessTicket(socket.user, ticket)) {
          return reply(ack, { ok: false, message: "Aapko permission nahi hai" });
        }

        socket.join(`ticket:${ticketId}`);
        reply(ack, { ok: true });
      } catch (err) {
        reply(ack, { ok: false, message: err.message });
      }
    });

    // Typing indicator
    socket.on("typing", (data) => {
      const { ticketId, isTyping } = data || {};
      const room = `ticket:${ticketId}`;

      // Sirf wahi typing bhej sakta hai jo us ticket room me hai
      if (!socket.rooms.has(room)) return;

      // socket.to(...) bhejne wale ko chhodkar baaki sabko bhejta hai
      socket.to(room).emit("user_typing", {
        ticketId,
        userId: socket.user._id,
        name: socket.user.name,
        role: socket.user.role,
        isTyping: Boolean(isTyping),
      });
    });

    // Message bhejna
    socket.on("send_message", async (data, ack) => {
      try {
        const { ticketId, text } = data || {};
        const room = `ticket:${ticketId}`;

        if (!socket.rooms.has(room)) {
          return reply(ack, { ok: false, message: "Pehle ticket join karo" });
        }

        if (!text || !text.trim()) {
          return reply(ack, { ok: false, message: "Message khali nahi ho sakta" });
        }

        const message = await Message.create({
          ticket: ticketId,
          sender: socket.user._id,
          senderRole: socket.user.role,
          text,
        });

        await message.populate("sender", "name");

        io.to(room).emit("new_message", {
          _id: message._id,
          ticket: message.ticket,
          text: message.text,
          senderRole: message.senderRole,
          sender: message.sender,
          createdAt: message.createdAt,
        });

        // Customer ne message bheja to saare agents ko notification
        if (socket.user.role === "customer") {
          const ticket = await Ticket.findById(ticketId).select("subject");
          io.to(STAFF_ROOM).emit("ticket_notification", {
            type: "new_message",
            ticketId,
            subject: ticket?.subject,
            from: socket.user.name,
            preview: message.text.slice(0, 80),
          });
        }

        reply(ack, { ok: true });
      } catch (err) {
        reply(ack, { ok: false, message: err.message });
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.user.name}`);
    });
  });

  return io;
};