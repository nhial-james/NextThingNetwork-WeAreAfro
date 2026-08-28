// src/utils/store.js
// API base and shared utilities

const BASE_URL = 'https://hotspot.nextthingnetworks.co.ke';
const STATION  = 'daystar';

// ── Fetch packages from live API ───────────────────────────────────────────────
export async function fetchPackages() {
  const res = await fetch(`${BASE_URL}/api/packages/${STATION}`);
  if (!res.ok) throw new Error(`Failed to fetch packages (${res.status})`);
  const data = await res.json();

  return data.map((pkg, index) => {
    const nameLower = pkg.name.toLowerCase();
    let icon    = 'Wifi';
    let badge   = null;
    let highlight = false;
    let duration = pkg.name;

    if (nameLower.includes('daily')) {
      icon     = 'Sun';
      duration = '24 hours';
    } else if (nameLower.includes('weekly') || nameLower.includes('week')) {
      icon     = 'Calendar';
      duration = '7 days';
    } else if (nameLower.includes('monthly') || nameLower.includes('month')) {
      icon     = 'Crown';
      duration = '30 days';
      badge    = 'BEST VALUE';
    }

    if (index === 0) {
      badge     = 'MOST POPULAR';
      highlight = true;
    }

    return {
      id:          pkg.id,
      api_id:      String(pkg.id),
      icon,
      name:        pkg.name,
      description: pkg.description,
      price:       `KSh ${parseFloat(pkg.price).toFixed(0)}`,
      priceNum:    parseFloat(pkg.price),
      duration,
      highlight,
      badge,
    };
  });
}

// ── Send real STK Push to M-Pesa ───────────────────────────────────────────────
// Returns the CheckoutRequestID string from Safaricom (via the NTN backend)
// Throws on network / API error.
export async function sendStkPush({ phone, packageId, amount }) {
  const res = await fetch(`${BASE_URL}/payment/stkpush`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone,
      package_id: String(packageId),
      amount,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.message || `STK push failed (${res.status})`);
  }

  // The server returns the Safaricom CheckoutRequestID — needed for polling
  // Common keys from M-Pesa callbacks: CheckoutRequestID, checkout_request_id
  const checkoutRequestId =
    data?.CheckoutRequestID     ??
    data?.checkout_request_id   ??
    data?.checkoutRequestId     ??
    data?.request_id            ??
    null;

  if (!checkoutRequestId) {
    throw new Error('STK push sent but no CheckoutRequestID returned from server.');
  }

  return checkoutRequestId; // e.g. "ws_CO_28082026210810859721661608"
}

// ── Poll payment status ────────────────────────────────────────────────────────
// Returns:
//   { status: 'success' }  — payment confirmed
//   { status: 'pending' }  — still waiting
//   { status: 'failed', message: string } — payment rejected / cancelled
export async function checkPaymentStatus(checkoutRequestId) {
  const res = await fetch(
    `${BASE_URL}/public/mpesa/payment-status/${checkoutRequestId}`
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // 404 usually means the transaction ID is not yet in the system (still pending)
    if (res.status === 404) return { status: 'pending' };
    throw new Error(data?.message || `Status check failed (${res.status})`);
  }

  // Normalise different possible response shapes from the server
  const raw = (
    data?.status           ??
    data?.Status           ??
    data?.ResultCode       ??
    data?.result_code      ??
    ''
  ).toString().toLowerCase();

  if (raw === 'success' || raw === '0' || data?.success === true || data?.paid === true) {
    return { status: 'success' };
  }

  if (
    raw === 'failed'   ||
    raw === 'failure'  ||
    raw === 'cancelled'||
    raw === 'canceled' ||
    (data?.ResultCode !== undefined && data.ResultCode !== 0)
  ) {
    return {
      status:  'failed',
      message: data?.ResultDesc || data?.message || data?.error || 'Payment was declined or cancelled.',
    };
  }

  // Anything else → still pending
  return { status: 'pending' };
}

// ── Voucher generator ─────────────────────────────────────────────────────────
export function generateVoucher() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code; // e.g. AFRO-K3MX-9PQZ
}
