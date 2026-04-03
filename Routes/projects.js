import express from "express";
import { authMiddleware } from "../Middleware/auth.js";
import { requireWorkspaceMember } from "../middleware/workspace.js";
import { requireWorkspaceOwner } from "../middleware/workspaceOwner.js";

import {
  createProject,
  getWorkspaceProjects,
  updateProject,
  deleteProject
} from "../Controller/project.js";

const router = express.Router();

router.post(
  "/workspaces/:workspaceId/projects",
  authMiddleware,
  requireWorkspaceMember,
  createProject
);

router.get(
  "/workspaces/:workspaceId/projects",
  authMiddleware,
  requireWorkspaceMember,
  getWorkspaceProjects
);

router.put(
  "/workspaces/:workspaceId/projects/:projectId",
  authMiddleware,
  requireWorkspaceMember,
  updateProject
);

router.delete(
  "/workspaces/:workspaceId/projects/:projectId",
  authMiddleware,
  requireWorkspaceOwner,
  deleteProject
);

export default router;