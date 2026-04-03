import express from "express";
import { stripe } from "../Config/stripe.js";
import { requireWorkspaceOwner } from "../middleware/workspaceOwner.js";
import { authMiddleware } from "../Middleware/auth.js";
import { pool } from "../db.js";

const router = express.Router();
//console.log("aaa");
//console.log(process.env.STRIPE_SECRET_KEY);
router.post(
  "/workspaces/:workspaceId/create-checkout-session",
  authMiddleware,
  requireWorkspaceOwner,
  async (req, res) => {
    const { workspaceId } = req.params;

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",

        payment_method_types: ["card"],

        line_items: [
          {
            price: process.env.STRIPE_PRICE_ID,
            quantity: 1,
          },
        ],

        success_url: "http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url: "http://localhost:5173/cancel",

        metadata: {
          workspaceId,
        },
      });

      res.json({
        checkoutUrl: session.url,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Stripe session creation failed" });
    }
  }
);

router.get("/stripe-success", async (req, res) => {
  const { session_id } = req.query;

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    const workspaceId = session.metadata.workspaceId;
    console.log(session.customer);
    await pool.query(
      `UPDATE workspaces
       SET subscription_status = 'active'
       WHERE id = $1`,
      [workspaceId]
    );

    res.json({ message: "Subscription activated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Activation failed" });
  }
});

export default router;