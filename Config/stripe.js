import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config(); // relative to stripe.js
//console.log(process.env.STRIPE_SECRET_KEY);

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);