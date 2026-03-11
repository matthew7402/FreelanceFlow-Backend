// Routes/messages.js
import express from "express";
import { getMessages } from "../Controllers/messagesController.js";

const router = express.Router();

// GET all messages for a project
router.get("/:projectId", getMessages);

export default router;