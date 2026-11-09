"use strict";

/**
 * Stripe webhook endpoint for Vercel Functions.
 * Signature checked against the original request bytes. Configure
 * STRIPE_WEBHOOK_SECRET from Stripe's event destination after deploying.
 *
 * IMPORTANT: Production fulfilment/notifications must be connected before
 * going live; successful webhook delivery alone is not an order workflow.
 */
const { createHmac, timingSafeEqual } = require("node:crypto");

async function readRaw(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}
function verify(body, header, secret) {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(String(header).split(",").map(part => {
    const cut = part.indexOf("=");
    return [part.slice(0, cut).trim(), part.slice(cut + 1).trim()];
  }));
  const timestamp = Number(parts.t);
  if (!Number.isSafeInteger(timestamp) || Math.abs(Date.now() / 1000 - timestamp) > 300)
    return false;
  const signatures = String(header).split(",").filter(x => x.trim().startsWith("v1="))
    .map(x => x.trim().slice(3)).filter(x => /^[a-f0-9]{64}$/i.test(x));
  const expected = createHmac("sha256", secret)
    .update(timestamp + "." + body.toString("utf8")).digest();
  return signatures.some(sig => timingSafeEqual(Buffer.from(sig, "hex"), expected));
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  if (!process.env.STRIPE_WEBHOOK_SECRET) return res.status(503).end();
  try {
    // Disable any automatic JSON body parsing in hosting configuration.
    const raw = await readRaw(req);
    if (!verify(raw, req.headers["stripe-signature"], process.env.STRIPE_WEBHOOK_SECRET))
      return res.status(400).send("Invalid webhook signature");
    const event = JSON.parse(raw.toString("utf8"));
    if (["checkout.session.completed", "checkout.session.async_payment_succeeded",
         "checkout.session.async_payment_failed"].includes(event.type)) {
      const session = event.data?.object || {};
      const isPaid = session.payment_status === "paid" ||
        event.type === "checkout.session.async_payment_succeeded";
      console.log("Stripe checkout event", {
        eventId: event.id,
        type: event.type,
        session: session.id,
        orderId: session.client_reference_id,
        paid: isPaid,
      });
      // Add durable order storage, idempotent fulfillment and vendor notification
      // before connecting this endpoint to live operational processes.
    }
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error.message);
    return res.status(500).end();
  }
};
