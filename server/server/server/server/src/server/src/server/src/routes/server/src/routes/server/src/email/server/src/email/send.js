import mjml2html from 'mjml';

// Demo-only: render HTML and log to console.
// In production, send with your email provider (SendGrid, SES, Mailgun, etc.)
export function renderReceipt({ order, items }) {
  const mjml = /* mjml */ `
  ${/* In a real project, you'd import the MJML template from file and inject variables */''}
  `;
  // For brevity in demo, we’ll just return a tiny HTML:
  const html = `
    <html><body>
      <h2>Order ${order.order_ref}</h2>
      <p>Email: ${order.email}</p>
      <p>Total: $ ${(order.total_cents/100).toFixed(2)}</p>
    </body></html>
  `;
  return html;
}

export async function sendReceiptEmail({ to, html }) {
  // TODO: integrate email provider. For demo:
  console.log('--- EMAIL TO:', to, '---');
  console.log(html);
  console.log('--- END EMAIL ---');
}
