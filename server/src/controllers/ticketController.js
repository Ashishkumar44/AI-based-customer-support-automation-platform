//import Ticket from "../models/Ticket.js";
//import User from "../models/User.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

import Ticket from "../models/Ticket.js";

export const createTicket = async (req, res) => {
  try {
    const { subject, description, priority } = req.body;

    if (!subject || !description) {
      return res
        .status(400)
        .json({ message: "Subject aur description required hain" });
    }

    const ticket = await Ticket.create({
      subject,
      description,
      priority,
      customer: req.user._id,
    });
    const io = req.app.get("io");
    if (io) {
      io.to("staff").emit("ticket_notification", {
        type: "new_ticket",
        ticketId: ticket._id,
        subject: ticket.subject,
        priority: ticket.priority,
        from: req.user.name,
      });
    }

    res.status(201).json(ticket);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};
export const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ customer: req.user._id })
      .populate("assignedAgent", "name email")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("customer", "name email")
      .populate("assignedAgent", "name email");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket nahi mila" });
    }

    const isOwner = ticket.customer._id.equals(req.user._id);
    const isStaff = ["agent", "admin"].includes(req.user.role);

    if (!isOwner && !isStaff) {
      return res.status(403).json({ message: "Aapko permission nahi hai" });
    }

    res.json(ticket);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Ticket id galat hai" });
    }
    res.status(500).json({ message: err.message });
  }
};
export const getAllTickets = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;

    const tickets = await Ticket.find(filter)
      .populate("customer", "name email")
      .populate("assignedAgent", "name email")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateTicket = async (req, res) => {
  try {
    const { status, priority, assignedAgent } = req.body;

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket nahi mila" });
    }

    if (status !== undefined) ticket.status = status;
    if (priority !== undefined) ticket.priority = priority;

    if (assignedAgent !== undefined) {
      if (assignedAgent === null) {
        ticket.assignedAgent = null;
      } else {
        const agent = await User.findById(assignedAgent);
        if (!agent || !["agent", "admin"].includes(agent.role)) {
          return res
            .status(400)
            .json({ message: "Sirf agent ya admin ko assign kar sakte ho" });
        }
        ticket.assignedAgent = agent._id;
      }
    }

    await ticket.save();
    await ticket.populate([
      { path: "customer", select: "name email" },
      { path: "assignedAgent", select: "name email" },
    ]);

    res.json(ticket);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Id galat hai" });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};
export const getTicketMessages = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket nahi mila" });
    }

    const isOwner = ticket.customer.equals(req.user._id);
    const isStaff = ["agent", "admin"].includes(req.user.role);

    if (!isOwner && !isStaff) {
      return res.status(403).json({ message: "Aapko permission nahi hai" });
    }

    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const filter = { ticket: ticket._id };

    if (req.query.before) {
      const beforeDate = new Date(req.query.before);
      if (isNaN(beforeDate)) {
        return res.status(400).json({ message: "before ki date galat hai" });
      }
      filter.createdAt = { $lt: beforeDate };
    }

    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("sender", "name");

    res.json(messages.reverse());
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Ticket id galat hai" });
    }
    res.status(500).json({ message: err.message });
  }
};