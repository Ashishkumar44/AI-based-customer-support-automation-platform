import express from "express";
import {
  createTicket,
  getMyTickets,
  getAllTickets,
  getTicketById,
  updateTicket,
} from "../controllers/ticketController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createTicket);
router.get("/", protect, authorize("agent", "admin"), getAllTickets);
router.get("/my", protect, getMyTickets);
router.get("/:id", protect, getTicketById);
router.patch("/:id", protect, authorize("agent", "admin"), updateTicket);

export default router;