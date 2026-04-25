import { stripe } from "../Config/stripe.js";
import { pool } from "../db.js";

/**
 * Create Stripe Checkout Session
 */
export const createCheckoutSession = async (req, res) => {
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

     success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
     cancel_url: `${process.env.FRONTEND_URL}/cancel`,

      metadata: {
        workspaceId,
      },
    });

    res.json({
      checkoutUrl: session.url,
    });
  } catch (err) {
    console.error("Stripe checkout error:", err.message);
    res.status(500).json({ message: "Stripe session creation failed" });
  }
};

/**
 * Handle Stripe success (temporary approach)
 */
export const handleStripeSuccess = async (req, res) => {
  const { session_id } = req.query;

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    const workspaceId = session.metadata.workspaceId;

    await pool.query(
      `UPDATE workspaces
       SET subscription_status = 'active'
       WHERE id = $1`,
      [workspaceId]
    );

    res.json({ message: "Subscription activated" });
  } catch (err) {
    console.error("Stripe success error:", err.message);
    res.status(500).json({ message: "Activation failed" });
  }
};