import mongoose from "mongoose";

const DEFAULT_MONGO_URI = "mongodb://127.0.0.1:27017/ai-support-platform";

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || DEFAULT_MONGO_URI;
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};