import express from "express";
import { authMiddleware } from "../Middleware/auth.js";
import { requireWorkspaceOwner } from "../Middleware/workspaceOwner.js";

import {
  createCheckoutSession,
  handleStripeSuccess,
} from "../Controllers/billing.js";

const router = express.Router();

router.post(
  "/workspaces/:workspaceId/create-checkout-session",
  authMiddleware,
  requireWorkspaceOwner,
  createCheckoutSession
);

router.get("/stripe-success", handleStripeSuccess);

export default router;