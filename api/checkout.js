"use strict";

/**
 * Vercel Node.js Serverless Function.
 * Creates a Stripe-hosted Checkout Session with server-validated prices.
 * Never store STRIPE_SECRET_KEY in the GitHub repository.
 */
const { randomUUID } = require("node:crypto");

function loadCatalogScripts() {
  // Static require calls allow Vercel's bundler to include the catalog files.
  require("../ersatzteile-barista1000.js");
  require("../ersatzteile-barista600.js");
  require("../ersatzteile-barista500.js");
  require("../ersatzteile-maestro-barista200-300.js");
}

function buildCatalog() {
  const previousWindow = global.window;
  const w = { VENDING_SPARE_PARTS: {} };
  try {
    global.window = w;
    loadCatalogScripts();
  } finally {
    if (previousWindow === undefined) delete global.window;
    else global.window = previousWindow;
  }

  const catalog = new Map();
  const services = [
    ["kuehlung-premium", "Snackautomat-Kühlung – Premium-Umbau", 720],
    ["hilfe-30", "Technische Notfallhilfe – 30 Minuten", 49],
    ["hilfe-60", "Technische Notfallhilfe – 60 Minuten", 89],
    ["hilfe-30-zuschlag", "Notfallhilfe – 30 Minuten, Zuschlagstarif", 63.70],
    ["hilfe-60-zuschlag", "Notfallhilfe – 60 Minuten, Zuschlagstarif", 115.70],
  ];
  for (const [id, name, euro] of services)
    catalog.set(id, { name, cents: Math.round(euro * 100), spare: false });

  for (const [machine, assemblies] of Object.entries(w.VENDING_SPARE_PARTS || {})) {
    for (const group of assemblies) for (const part of group.items || []) {
      if (typeof part.price !== "number" || !Number.isFinite(part.price) || part.price < 0)
        continue;
      // Barista 1000 files already contain net list prices.
      // Other PDFs contain purchase prices after a 25% dealer discount.
      const euro = /^Barista (?:200|300|500|600)\b|^Maestro\b/.test(machine)
        ? Math.round((part.price / 0.75 + Number.EPSILON) * 100) / 100
        : part.price;
      const id = "et-" + machine.replace(/[^a-z0-9]/gi, "").toLowerCase()
        + "-" + group.number + "-" + part.pos + "-" + part.code;
      catalog.set(id, {
        name: machine + " · " + part.name + " · Nr. " + part.code + " · Pos. " + part.pos,
        cents: Math.round(euro * 100),
        spare: true,
      });
    }
  }
  return catalog;
}

const catalog = buildCatalog();

function respond(res, status, body) {
  return res.status(status).json(body);
}

module.exports = async function handler(req, res) {
  const origin = process.env.STORE_ORIGIN || "https://dein-snackautomat.de";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return respond(res, 405, { error: "Methode nicht erlaubt." });
  if (req.headers.origin && req.headers.origin !== origin)
    return respond(res, 403, { error: "Nicht zugelassene Shop-Domain." });

  const secret = process.env.STRIPE_SECRET_KEY;
  const taxRate = process.env.STRIPE_TAX_RATE_ID;
  const automaticTax = process.env.STRIPE_AUTOMATIC_TAX === "true";
  if (!secret || (!taxRate && !automaticTax))
    return respond(res, 503, { error: "Online-Zahlung ist noch nicht konfiguriert." });

  let body = req.body;
  try {
    if (typeof body === "string") body = JSON.parse(body);
    if (!body || !Array.isArray(body.items) || body.items.length < 1 || body.items.length > 50)
      return respond(res, 400, { error: "Ungültiger Warenkorb." });

    let totalCents = 0;
    let withSpares = false;
    const validated = [];
    const seen = new Set();
    for (const item of body.items) {
      if (!item || typeof item.id !== "string" || seen.has(item.id) ||
          !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 30)
        return respond(res, 400, { error: "Ungültige Artikelmenge." });
      seen.add(item.id);
      const product = catalog.get(item.id);
      if (!product) return respond(res, 400, { error: "Unbekannter oder nicht bepreister Artikel." });
      withSpares ||= product.spare;
      totalCents += product.cents * item.quantity;
      validated.push({ ...product, quantity: item.quantity });
    }
    if (withSpares) totalCents += 1550;
    if (totalCents < 50 || totalCents > 10000000)
      return respond(res, 400, { error: "Bestellbetrag außerhalb des erlaubten Bereichs." });

    if (withSpares) validated.push(
      { name: "Versandkosten (einmal je Ersatzteilbestellung)", cents: 1300, quantity: 1 },
      { name: "Verpackungskosten (einmal je Ersatzteilbestellung)", cents: 250, quantity: 1 }
    );

    const orderId = randomUUID();
    const form = new URLSearchParams();
    form.set("mode", "payment");
    form.set("customer_creation", "always");
    form.set("billing_address_collection", "required");
    form.set("tax_id_collection[enabled]", "true");
    form.set("phone_number_collection[enabled]", "true");
    form.set("invoice_creation[enabled]", "true");
    form.set("client_reference_id", orderId);
    form.set("metadata[order_id]", orderId);
    form.set("payment_intent_data[metadata][order_id]", orderId);
    form.set("success_url", origin + "/checkout-erfolg.html?session_id={CHECKOUT_SESSION_ID}");
    form.set("cancel_url", origin + "/shop.html?checkout=abgebrochen");
    if (withSpares) form.set("shipping_address_collection[allowed_countries][0]", "DE");

    // B2B only: collect required company name.
    form.set("custom_fields[0][key]", "firma");
    form.set("custom_fields[0][label][type]", "custom");
    form.set("custom_fields[0][label][custom]", "Firma (nur Gewerbekunden)");
    form.set("custom_fields[0][type]", "text");
    if (automaticTax) form.set("automatic_tax[enabled]", "true");

    validated.forEach((item, i) => {
      const prefix = "line_items[" + i + "]";
      form.set(prefix + "[price_data][currency]", "eur");
      form.set(prefix + "[price_data][unit_amount]", String(item.cents));
      form.set(prefix + "[price_data][product_data][name]", item.name.slice(0, 240));
      form.set(prefix + "[quantity]", String(item.quantity));
      if (taxRate && !automaticTax) form.set(prefix + "[tax_rates][0]", taxRate);
    });

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + secret,
        "Content-Type": "application/x-www-form-urlencoded",
        "Idempotency-Key": orderId,
      },
      body: form.toString(),
      signal: AbortSignal.timeout(12000),
    });
    const result = await stripeRes.json();
    if (!stripeRes.ok || !result.url) {
      console.error("Stripe Checkout creation failed", result.error?.type, result.error?.code);
      return respond(res, 502, { error: "Zahlungsseite derzeit nicht verfügbar. Bitte später erneut versuchen." });
    }
    return respond(res, 200, { url: result.url });
  } catch (error) {
    console.error("Checkout failure:", error?.message);
    return respond(res, 500, { error: "Der Bestellvorgang konnte nicht gestartet werden." });
  }
};
