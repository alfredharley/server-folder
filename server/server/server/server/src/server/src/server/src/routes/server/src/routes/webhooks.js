import express from 'express';
import Stripe from 'stripe';
import { markOrderPaid } from '../db.js';

const router = express.Router();
const stripeKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeKey ? new Stripe(stripeKey) : null;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

router.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe || !webhookSecret) {
    return res.status(400).send('Stripe webhook not configured');
  }
  let event;
  try {
    const sig = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const order_ref = session?.metadata?.order_ref;
      const gateway_ref = session?.id;
      if (order_ref) {
        await markOrderPaid({ order_ref, gateway: 'stripe', gateway_ref });
      }
    }
    res.json({ received: true });
  } catch (e) {
    console.error(e);
    res.status(500).send('Webhook handler error');
  }
});

export default router;
