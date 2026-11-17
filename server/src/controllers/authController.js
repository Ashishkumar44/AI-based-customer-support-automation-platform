import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "development-secret";

const generateToken = (id) =>
  jwt.sign({ id }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const normalizeEmail = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const safeName = typeof name === "string" ? name.trim() : "";
    const safeEmail = normalizeEmail(email);
    const safePassword = typeof password === "string" ? password.trim() : "";

    if (!safeName || !safeEmail || !safePassword) {
      return res
        .status(400)
        .json({ message: "Name, email aur password required hain" });
    }

    const exists = await User.findOne({ email: safeEmail });
    if (exists) {
      return res
        .status(400)
        .json({ message: "Ye email pehle se registered hai" });
    }

    // Admin role register se nahi milega
    const safeRole = role === "agent" ? "agent" : "customer";

    const user = await User.create({
      name: safeName,
      email: safeEmail,
      password: safePassword,
      role: safeRole,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const safeEmail = normalizeEmail(email);
    const safePassword = typeof password === "string" ? password.trim() : "";

    if (!safeEmail || !safePassword) {
      return res
        .status(400)
        .json({ message: "Email aur password required hain" });
    }

    const foundUser = await User.findOne({ email: safeEmail });
    const user =
      foundUser && typeof foundUser.select === "function"
        ? await foundUser.select("+password")
        : foundUser;

    if (!user || !(await user.matchPassword(safePassword))) {
      return res.status(401).json({ message: "Email ya password galat hai" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMe = async (req, res) => {
  res.json(req.user);
};