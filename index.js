import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
console.log("Loaded key:", process.env.STRIPE_SECRET_KEY);

import billingRoutes from "./Routes/billing.js";  


import authRoutes from "./Routes/auth.js";
import workspaceRoutes from "./Routes/workspaces.js";
import projectRoutes from "./Routes/projects.js";
//import messageRoutes from "./routes/messages.js";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api", projectRoutes);
app.use("/api", billingRoutes);
//app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => res.send("FreelanceFlow API running"));

const PORT = process.env.PORT || 5000;
import { pool } from "./db.js";

app.get("/api/health/db", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.json(result.rows[0]);
});
//console.log("Loaded key:", process.env.STRIPE_SECRET_KEY);
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));