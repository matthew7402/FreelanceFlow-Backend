// index.js
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { pool } from "./db.js";

import authRoutes from "./Routes/auth.js";
import workspaceRoutes from "./Routes/workspaces.js";
import projectRoutes from "./Routes/projects.js";
import billingRoutes from "./Routes/billing.js";
import messageRoutes from "./Routes/messages.js";
import { handleSendMessage } from "./Controllers/messagesController.js";

console.log("Loaded key:", process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(cors());
app.use(express.json());

// ====== ROUTES ======
app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api", projectRoutes);
app.use("/api", billingRoutes);
app.use("/api/messages", messageRoutes);

// ====== HEALTH CHECK ======
app.get("/", (req, res) => res.send("FreelanceFlow API running"));
app.get("/api/health/db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// ====== CREATE SERVER & SOCKET.IO ======
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }, // allow all origins for testing
  
  
});

// ====== REAL-TIME CHAT ======
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join a project room
  socket.on("joinProject", (projectId) => {
    socket.join(`project_${projectId}`);
    //console.log(`Socket ${socket.id} joined project_${projectId}`);
  });

  // Delegate sendMessage logic to controller
  handleSendMessage(io, socket);

  socket.on("disconnect", () => {
   // console.log("User disconnected:", socket.id);
  });
});
const testDB = async () => {
  const res = await pool.query('SELECT NOW()');
  console.log(res.rows);
};

testDB();

// ====== START SERVER ======
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));