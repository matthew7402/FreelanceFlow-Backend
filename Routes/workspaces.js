import express from "express";
import { authMiddleware } from "../Middleware/auth.js";
import { createWorkspace,getWorkspaces,inviteMember } from "../Controllers/workspaces.js";

const router = express.Router();

router.post("/", authMiddleware, createWorkspace);
router.get("/", authMiddleware, getWorkspaces);
router.post(
  "/:workspaceId/invite",
  authMiddleware,
  inviteMember
);

export default router;
