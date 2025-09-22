import pkg from 'pg';
const { Pool } = pkg;

const hasDb = !!process.env.DATABASE_URL;
let pool = null;

// In-memory fallback for demo
const mem = {
  orders: [],       // {order_ref, email, subtotal_cents, tax_cents, shipping_cents, total_cents, status, gateway, gateway_ref, created_at}
  order_items: []   // {order_ref, sku, title, unit_price_cents, qty}
};

export async function initDb(){
  if (!hasDb) {
    console.log('DB: Using in-memory store (set DATABASE_URL to use Postgres)');
    return;
  }
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_ref TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      subtotal_cents INT NOT NULL,
      tax_cents INT NOT NULL,
      shipping_cents INT NOT NULL,
      total_cents INT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      gateway TEXT,
      gateway_ref TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_ref TEXT NOT NULL REFERENCES orders(order_ref) ON DELETE CASCADE,
      sku TEXT NOT NULL,
      title TEXT NOT NULL,
      unit_price_cents INT NOT NULL,
      qty INT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_orders_ref ON orders(order_ref);
  `);
  console.log('DB: Postgres ready');
}

function nowIso(){ return new Date().toISOString(); }
function toCents(x){ return Math.round(Number(x || 0) * 100); }

// ---- Helpers (work in both memory + Postgres) ----
export async function saveOrder({ order, items }){
  if (!hasDb) {
    // memory
    const exists = mem.orders.find(x => x.order_ref === order.order_ref);
    if (!exists) mem.orders.push(order);
    items.forEach(it => mem.order_items.push(it));
    return;
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO orders (order_ref, email, subtotal_cents, tax_cents, shipping_cents, total_cents, status, gateway, gateway_ref)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (order_ref) DO NOTHING`,
      [
        order.order_ref, order.email, order.subtotal_cents, order.tax_cents,
        order.shipping_cents, order.total_cents, order.status, order.gateway, order.gateway_ref
      ]
    );
    for (const it of items) {
      await client.query(
        `INSERT INTO order_items (order_ref, sku, title, unit_price_cents, qty)
         VALUES ($1,$2,$3,$4,$5)`,
        [it.order_ref, it.sku, it.title, it.unit_price_cents, it.qty]
      );
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function markOrderPaid({ order_ref, gateway, gateway_ref }){
  if (!hasDb) {
    const o = mem.orders.find(x => x.order_ref === order_ref);
    if (o) { o.status = 'paid'; o.gateway = gateway; o.gateway_ref = gateway_ref; }
    return;
  }
  await pool.query(
    `UPDATE orders SET status='paid', gateway=$2, gateway_ref=$3 WHERE order_ref=$1`,
    [order_ref, gateway, gateway_ref]
  );
}

export async function listOrders({ q = '' } = {}){
  if (!hasDb) {
    if (!q) return mem.orders.slice().sort((a,b)=> b.created_at.localeCompare(a.created_at));
    const needle = q.toLowerCase();
    return mem.orders.filter(o =>
      o.order_ref.toLowerCase().includes(needle) || o.email.toLowerCase().includes(needle)
    ).sort((a,b)=> b.created_at.localeCompare(a.created_at));
  }
  const res = await pool.query(
    `SELECT order_ref,email,total_cents,status,created_at
     FROM orders
     WHERE ($1 = '' OR order_ref ILIKE '%'||$1||'%' OR email ILIKE '%'||$1||'%')
     ORDER BY created_at DESC`,
    [q]
  );
  return res.rows;
}

export function calcTotals(lines){
  // lines: [{ sku, title, price, qty }]
  const subtotal = lines.reduce((s, l) => s + Number(l.price || 0) * Number(l.qty || 0), 0);
  const tax = subtotal * 0.08;        // demo placeholder 8%
  const shipping = subtotal > 150 ? 0 : 12; // demo shipping rule
  const total = subtotal + tax + shipping;
  return {
    subtotal_cents: toCents(subtotal),
    tax_cents: toCents(tax),
    shipping_cents: toCents(shipping),
    total_cents: toCents(total)
  };
}

export function newOrderRef(){
  const n = Math.floor(Math.random()*900000)+100000;
  return `EF-${n}`;
}
