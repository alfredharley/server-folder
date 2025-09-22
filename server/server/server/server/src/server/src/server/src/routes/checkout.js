import express from 'express';
import Stripe from 'stripe';
import { calcTotals, newOrderRef, saveOrder } from '../db.js';

const router = express.Router();
const stripeKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeKey ? new Stripe(stripeKey) : null;
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

router.post('/checkout/stripe', async (req, res) => {
  try {
    const { email, lines = [] } = req.body || {};
    if (!email || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({ error: 'MISSING_EMAIL_OR_LINES' });
    }
    if (!stripe) return res.status(400).json({ error: 'STRIPE_NOT_CONFIGURED' });

    const order_ref = newOrderRef();
    const totals = calcTotals(lines);

    // Save a pending order now (so /success can show details immediately)
    await saveOrder({
      order: {
        order_ref,
        email,
        ...totals,
        status: 'pending',
        gateway: 'stripe',
        gateway_ref: null,
        created_at: new Date().toISOString()
      },
      items: lines.map(l => ({
        order_ref,
        sku: l.sku,
        title: l.title,
        unit_price_cents: Math.round(Number(l.price || 0) * 100),
        qty: Number(l.qty || 1)
      }))
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      line_items: lines.map(l => ({
        price_data: {
          currency: 'usd',
          product_data: { name: l.title || l.sku || 'Item' },
          unit_amount: Math.round(Number(l.price || 0) * 100)
        },
        quantity: Number(l.qty || 1)
      })),
      success_url: `${BASE_URL}/success?order_ref=${order_ref}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/?canceled=1`,
      metadata: { order_ref }
    });

    return res.json({ url: session.url, order_ref });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'STRIPE_CHECKOUT_ERROR' });
  }
});

// --- Adyen stubs so UI buttons have endpoints (not fully wired in demo) ---
router.get('/checkout/adyen/paymentMethods', async (req, res) => {
  return res.json({ paymentMethods: [] }); // demo
});
router.post('/checkout/adyen/payments', async (req, res) => {
  return res.json({ resultCode: 'Authorised' }); // demo
});
router.post('/checkout/adyen/payments/details', async (req, res) => {
  return res.json({ resultCode: 'Authorised' }); // demo
});

export default router;
