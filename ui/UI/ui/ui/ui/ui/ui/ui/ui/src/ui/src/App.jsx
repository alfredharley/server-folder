import React, { useEffect, useMemo, useState } from "react";

// ---- Env / API helper: dev uses proxy; prod can use VITE_API_BASE ----
const API_BASE = import.meta.env.VITE_API_BASE || "";
const apiUrl = (p) => `${API_BASE}${p}`;

// ---- Small UI helpers ----
const Btn = ({ children, onClick, variant="primary", className="", ...rest }) => {
  const base = "px-3 py-2 rounded-full text-sm font-medium transition";
  const styles = variant === "outline"
    ? "border border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
    : variant === "ghost"
    ? "text-slate-700 hover:bg-slate-100"
    : "bg-sky-700 text-white hover:bg-sky-800";
  return (
    <button onClick={onClick} className={`${base} ${styles} ${className}`} {...rest}>
      {children}
    </button>
  );
};

const Card = ({ children, className="" }) => (
  <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>
);
const CardHeader = ({ children, className="" }) => (
  <div className={`p-4 border-b border-slate-100 ${className}`}>{children}</div>
);
const CardTitle = ({ children }) => <div className="text-lg font-semibold">{children}</div>;
const CardContent = ({ children, className="" }) => <div className={`p-4 ${className}`}>{children}</div>;

const SectionTitle = ({ children }) => (
  <div className="text-2xl font-semibold text-slate-900 mb-3">{children}</div>
);

// ---- Demo content ----
const heroDestinations = [
  {
    name: "St. Eustatius",
    tagline: "The Hidden Caribbean Gem",
    content: [
      { section: "Know Before You Go", text: "Small Dutch Caribbean island. U.S. dollars accepted, English widely spoken." },
      { section: "Eat & Drink", text: "Sample fresh catch BBQ and island flavors.", links: [{ label: "Golden Rock Resort", url: "https://www.goldenrockresort.com/" }] },
      { section: "What to Do", text: "Hike The Quill volcano, dive wrecks." },
      { section: "Events", text: "Statia Day (Nov 16), Carnival." },
      { section: "Important Numbers", text: "Emergency 911, Hospital +599-318-2211" }
    ]
  },
  {
    name: "St. Maarten",
    tagline: "Beaches, Shopping & Planespotting",
    content: [
      { section: "Eat & Drink", text: "Fine dining and beachside fun.", links: [{ label: "Pineapple Pete's", url: "https://www.vacationstmaarten.com/listing/pineapple-pete/388/" }] },
      { section: "What to Do", text: "Planespot at Maho Beach, sail to nearby islands." },
      { section: "Events", text: "Carnival, Heineken Regatta." }
    ]
  },
  {
    name: "St. Kitts & Nevis",
    tagline: "Twin Island Heritage & Nature",
    content: [
      { section: "Eat & Drink", text: "Beach clubs and island bistros.", links: [
        { label: "Silver Reef", url: "https://silverreefstkitts.com/" },
        { label: "Four Seasons Nevis", url: "https://www.fourseasons.com/nevis/" }
      ]},
      { section: "What to Do", text: "Visit Brimstone Hill Fortress, Nevis Hot Springs.", links: [
        { label: "Golden Rock Development", url: "https://www.grcpark.com/" }
      ]}
    ]
  },
  {
    name: "Curaçao",
    tagline: "Culture, Cuisine & Colorful Streets",
    content: [
      { section: "Eat & Drink", text: "Explore Willemstad’s colorful food scene." },
      { section: "Events", text: "Major festivals include the North Sea Jazz Festival.", links: [
        { label: "Curaçao North Sea Jazz", url: "https://www.curacaonorthseajazz.com/en/" }
      ]}
    ]
  },
  {
    name: "Antigua & Barbuda",
    tagline: "365 Beaches & Sailing Paradise",
    content: [
      { section: "Eat & Drink", text: "Savor seafood and cocktails at the beach." },
      { section: "Events", text: "Don’t miss the Carnival Breakfast Party.", links: [
        { label: "de 268 Breakfast Fete (IG)", url: "https://www.instagram.com/de268breakfastfete/" },
        { label: "Tickets via TickeTing", url: "https://ticketingevents.com/" }
      ]}
    ]
  }
];

const airports = [
  { code: "SXM", name: "Princess Juliana International Airport", desc: "Famous for low-altitude beach landings. NE Caribbean hub." },
  { code: "JFK", name: "John F. Kennedy International Airport", desc: "Major U.S. gateway in New York, six terminals, lounges." },
  { code: "MIA", name: "Miami International Airport", desc: "Latin America & Caribbean hub with extensive dining & shopping." }
];

const airlines = ["American Airlines", "Delta Air Lines", "Air France / KLM"];

// ---- Shop data ----
const defaultCatalog = [
  { sku: "CASE-CARRYON", title: "Carry-on Suitcase", price: 149, img: "https://source.unsplash.com/800x600/?suitcase" },
  { sku: "BAG-WEEKENDER", title: "Weekender Bag", price: 89, img: "https://source.unsplash.com/800x600/?duffel,bag" },
  { sku: "CAP-HEADGEAR", title: "Headgear (Caps)", price: 25, img: "https://source.unsplash.com/800x600/?cap" },
  { sku: "PIL-NECK", title: "Neck Pillow", price: 19, img: "https://source.unsplash.com/800x600/?travel,pillow" },
  { sku: "CUBES-PACK", title: "Packing Cubes", price: 29, img: "https://source.unsplash.com/800x600/?packing,cubes" },
  { sku: "ORG-TECH", title: "Tech Organizer", price: 39, img: "https://source.unsplash.com/800x600/?gadgets,case" }
];

// ---- Components ----
const Tabs = ({ value, onChange }) => {
  const items = [
    ["dest", "Destinations"],
    ["airp", "Airports"],
    ["airl", "Airlines"],
    ["flgt", "My Flight"],
    ["isld", "Island Mode"],
    ["shop", "Shop"],
    ["ords", "Admin"]
  ];
  return (
    <div className="grid grid-cols-7 gap-1 bg-white border border-slate-200 rounded-2xl p-1 sticky top-0 z-30">
      {items.map(([val, label]) => (
        <button
          key={val}
          onClick={() => onChange(val)}
          className={`py-2 rounded-xl text-sm font-medium ${
            value === val ? "bg-sky-700 text-white" : "hover:bg-slate-100"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

const HeroPage = ({ name, tagline, content }) => (
  <Card>
    <CardHeader>
      <CardTitle>{name} — <span className="text-slate-600">{tagline}</span></CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {content.map((c, i) => (
        <div key={i} className="border border-slate-100 rounded-xl p-3">
          <div className="text-sm font-semibold">{c.section}</div>
          <div className="text-sm text-slate-600">{c.text}</div>
          {c.links && (
            <div className="flex flex-wrap gap-2 mt-2">
              {c.links.map((l, j) => (
                <a key={j} href={l.url || "#"} target={l.url ? "_blank" : undefined} rel={l.url ? "noopener noreferrer" : undefined}>
                  <Btn variant="outline">{l.label}</Btn>
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </CardContent>
  </Card>
);

const AirportPage = ({ code, name, desc }) => (
  <Card>
    <CardHeader><CardTitle>{code} — {name}</CardTitle></CardHeader>
    <CardContent className="space-y-2 text-sm">
      <div className="text-slate-600">{desc}</div>
      <div className="flex flex-wrap gap-2">
        <Btn variant="outline">Arrivals & Departures</Btn>
        <Btn variant="outline">Lounges</Btn>
        <Btn variant="outline">Wi-Fi & SIM</Btn>
        <Btn variant="outline">Ground Transport</Btn>
      </div>
    </CardContent>
  </Card>
);

const FlightSelect = () => {
  const [airline, setAirline] = useState("Delta");
  const [flight, setFlight] = useState("DL123");
  const [date, setDate] = useState("");
  return (
    <Card>
      <CardHeader><CardTitle>My Flight</CardTitle></CardHeader>
      <CardContent className="grid sm:grid-cols-3 gap-3">
        <input value={airline} onChange={e=>setAirline(e.target.value)} className="border rounded-xl px-3 py-2" placeholder="Airline" />
        <input value={flight} onChange={e=>setFlight(e.target.value)} className="border rounded-xl px-3 py-2" placeholder="Flight (e.g., DL123)" />
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="border rounded-xl px-3 py-2" />
        <div className="sm:col-span-3 flex gap-2">
          <Btn>Track via Partner</Btn>
          <Btn variant="outline">Save Flight</Btn>
        </div>
      </CardContent>
    </Card>
  );
};

// ---- Shop / Cart ----
function useCart() {
  const [lines, setLines] = useState([]);
  const add = (item) => {
    setLines(prev => {
      const i = prev.findIndex(x => x.sku === item.sku);
      if (i >= 0) {
        const copy = prev.slice();
        copy[i] = { ...copy[i], qty: copy[i].qty + 1 };
        return copy;
      }
      return [...prev, { sku: item.sku, title: item.title, price: item.price, qty: 1 }];
    });
  };
  const remove = (sku) => setLines(prev => prev.filter(x => x.sku !== sku));
  const setQty = (sku, qty) => setLines(prev => prev.map(x => x.sku === sku ? { ...x, qty: Math.max(1, qty) } : x));
  const totals = useMemo(() => {
    const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const shipping = subtotal > 150 ? 0 : (lines.length ? 12 : 0);
    const total = subtotal + tax + shipping;
    return { subtotal, tax, shipping, total };
  }, [lines]);
  return { lines, add, remove, setQty, totals, setLines };
}

const OrdersAdmin = () => {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const search = async () => {
    const r = await fetch(apiUrl(`/api/admin/orders?q=${encodeURIComponent(q)}`));
    const json = await r.json();
    setRows(json || []);
  };
  const exportCsv = () => {
    const header = 'order_ref,email,total_cents,status,created_at\n';
    const body = rows.map(r => `${r.order_ref},${r.email},${r.total_cents},${r.status},${r.created_at}`).join('\n');
    const blob = new Blob([header+body], { type:'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'orders.csv'; a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <Card>
      <CardHeader><CardTitle>Orders Admin</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <input className="border rounded-xl px-3 py-2 flex-1" placeholder="Search email or order ref" value={q} onChange={e=>setQ(e.target.value)} />
          <Btn onClick={search}>Search</Btn>
          <Btn variant="outline" onClick={exportCsv}>Export CSV</Btn>
        </div>
        <div className="rounded-xl border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="text-left p-2">Order Ref</th>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">Total</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r,i)=>(
                <tr key={i} className="border-t">
                  <td className="p-2">{r.order_ref}</td>
                  <td className="p-2">{r.email}</td>
                  <td className="p-2">$ {(r.total_cents/100).toFixed(2)}</td>
                  <td className="p-2">{r.status}</td>
                  <td className="p-2">{new Date(r.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {rows.length===0 && <tr><td className="p-4 text-slate-500" colSpan={5}>No results.</td></tr>}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

const OrderSuccess = () => {
  const [order, setOrder] = useState(null);
  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    const ref = qs.get('order_ref');
    (async ()=>{
      if (!ref) return;
      const r = await fetch(apiUrl(`/api/admin/orders?q=${encodeURIComponent(ref)}`));
      const rows = await r.json();
      const o = (rows || []).find(x => x.order_ref === ref);
      if (o) setOrder(o);
    })();
  }, []);
  if (!order) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader><CardTitle>Order {order.order_ref} — Thank you!</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>Email: <strong>{order.email}</strong></div>
          <div>Total: <strong>$ {(order.total_cents/100).toFixed(2)}</strong></div>
          <div>Status: <strong>{order.status}</strong></div>
          <Btn className="mt-2" onClick={()=>{
            const url = new URL(window.location.href);
            url.searchParams.delete('order_ref');
            window.history.replaceState(null,'', url.toString());
            window.location.reload();
          }}>Close</Btn>
        </CardContent>
      </Card>
    </div>
  );
};

const MerchPage = () => {
  const [catalog, setCatalog] = useState(defaultCatalog);
  const cart = useCart();
  const [email, setEmail] = useState("");
  const [live, setLive] = useState(false);
  const handleStripe = async () => {
    if (!email) { alert("Enter your email for receipt."); return; }
    if (!cart.lines.length) { alert("Cart is empty."); return; }
    // Live → call server; Test → simulate success
    if (live) {
      const resp = await fetch(apiUrl('/api/checkout/stripe'), {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ email, lines: cart.lines })
      });
      const json = await resp.json();
      if (json?.url) window.location.href = json.url;
      else alert("Stripe error. Check server and env.");
      return;
    }
    // Simulate success: add ?order_ref=EF-TEST to URL
    const fakeRef = `EF-${Math.floor(Math.random()*900000)+100000}`;
    const u = new URL(window.location.href);
    u.searchParams.set('order_ref', fakeRef);
    window.history.replaceState(null,'',u.toString());
    alert("Test payment simulated. Showing success overlay.");
  };

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      {/* Catalog */}
      <div className="lg:col-span-2 space-y-4">
        <SectionTitle>eFlight Shop — Travel Essentials</SectionTitle>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {catalog.map((a,i)=>(
            <Card key={i} className="overflow-hidden">
              <div className="h-36 bg-cover bg-center" style={{ backgroundImage:`url(${a.img})` }} />
              <CardContent className="space-y-2">
                <div className="font-semibold">{a.title}</div>
                <div className="text-sm text-slate-500">$ {a.price}</div>
                <Btn onClick={()=>cart.add(a)}>Add to Cart</Btn>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      {/* Cart / Checkout */}
      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle>Cart</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {cart.lines.length===0 && <div className="text-sm text-slate-500">No items yet.</div>}
            {cart.lines.map((l,i)=>(
              <div key={i} className="flex items-center justify-between gap-2 border-b py-2">
                <div>
                  <div className="font-medium">{l.title}</div>
                  <div className="text-xs text-slate-500">${l.price} ×</div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" min="1" value={l.qty} onChange={e=>cart.setQty(l.sku, Number(e.target.value)||1)} className="w-16 border rounded-lg px-2 py-1 text-sm" />
                  <Btn variant="outline" onClick={()=>cart.remove(l.sku)}>Remove</Btn>
                </div>
              </div>
            ))}
            <div className="text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>$ {cart.totals.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Tax (8%)</span><span>$ {cart.totals.tax.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>$ {cart.totals.shipping.toFixed(2)}</span></div>
              <div className="flex justify-between font-semibold"><span>Total</span><span>$ {cart.totals.total.toFixed(2)}</span></div>
            </div>
            <div className="rounded-xl border p-3 bg-slate-50">
              <div className="flex items-center justify-between">
                <div className="text-sm"><span className="font-semibold">Pay with Stripe (live)</span> — turn on to use your dev server</div>
                <Btn variant={live?'primary':'outline'} onClick={()=>setLive(!live)}>{live?'On':'Off'}</Btn>
              </div>
              <input className="mt-2 w-full border rounded-xl px-3 py-2" placeholder="Email for receipt" value={email} onChange={e=>setEmail(e.target.value)} />
              <Btn className="mt-2" onClick={handleStripe}>{live ? "Pay with Stripe (Live)" : "Stripe Checkout (Test Simulated)"}</Btn>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function App(){
  const [tab, setTab] = useState("dest");

  return (
    <>
      <OrderSuccess />
      <div className="min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 grid place-items-center rounded-xl bg-sky-700 text-white">✈</div>
              <div className="text-xl font-bold">eFlight<span className="text-sky-700">Magazine</span>.com</div>
            </div>
            <input placeholder="Search…" className="hidden md:block border rounded-xl px-3 py-2 w-72" />
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          <Tabs value={tab} onChange={setTab} />

          {tab === "dest" && (
            <div className="space-y-4">
              <SectionTitle>Hero Destinations</SectionTitle>
              <div className="grid lg:grid-cols-2 gap-4">
                {heroDestinations.map((d,i)=> <HeroPage key={i} {...d} />)}
              </div>
            </div>
          )}

          {tab === "airp" && (
            <div className="space-y-4">
              <SectionTitle>Airports</SectionTitle>
              <div className="grid lg:grid-cols-2 gap-4">
                {airports.map((a,i)=> <AirportPage key={i} {...a} />)}
              </div>
            </div>
          )}

          {tab === "airl" && (
            <Card>
              <CardHeader><CardTitle>Top Partner Airlines</CardTitle></CardHeader>
              <CardContent className="grid sm:grid-cols-3 gap-2">
                {airlines.map((a,i)=>(<div key={i} className="border rounded-xl p-3">{a}</div>))}
              </CardContent>
            </Card>
          )}

          {tab === "flgt" && <FlightSelect />}

          {tab === "isld" && (
            <Card>
              <CardHeader><CardTitle>Island Mode (GPS-aware)</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-xl border p-4 bg-white/70">
                  When you’re on an island (not in an airport or in-flight), the app shows that island’s cover with events, dining, things to do, and emergency numbers.
                </div>
                <div className="flex flex-wrap gap-2">
                  <Btn variant="outline">Places to dine</Btn>
                  <Btn variant="outline">What to do</Btn>
                  <Btn variant="outline">Events</Btn>
                  <Btn variant="outline">Important numbers</Btn>
                </div>
              </CardContent>
            </Card>
          )}

          {tab === "shop" && <MerchPage />}

          {tab === "ords" && <OrdersAdmin />}
        </main>

        <footer className="border-t border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 py-6 text-xs text-slate-500 text-center">
            © {new Date().getFullYear()} eFlight Magazine — Demo Build
          </div>
        </footer>
      </div>
    </>
  );
}
