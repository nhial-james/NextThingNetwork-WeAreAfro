// src/utils/store.js
// API base and shared utilities

const BASE_URL = 'https://hotspot.nextthingnetworks.co.ke';
const STATION  = 'daystar';

// ── Fetch packages from live API ───────────────────────────────────────────────
export async function fetchPackages() {
  const res = await fetch(`${BASE_URL}/api/packages/${STATION}`);
  if (!res.ok) throw new Error(`Failed to fetch packages (${res.status})`);
  const data = await res.json();

  // Normalise the API response into the shape the UI expects
  return data.map((pkg, index) => {
    // Derive a display-friendly duration / label from the name
    const nameLower = pkg.name.toLowerCase();
    let icon    = 'Wifi';
    let badge   = null;
    let highlight = false;
    let duration = pkg.name;

    if (nameLower.includes('daily')) {
      icon      = 'Sun';
      duration  = '24 hours';
    } else if (nameLower.includes('weekly') || nameLower.includes('week')) {
      icon      = 'Calendar';
      duration  = '7 days';
    } else if (nameLower.includes('monthly') || nameLower.includes('month')) {
      icon      = 'Crown';
      duration  = '30 days';
      badge     = 'BEST VALUE';
    }

    // Mark the cheapest package as "most popular"
    if (index === 0) {
      badge     = 'MOST POPULAR';
      highlight = true;
    }

    return {
      // Use the real API id so it can be sent to STK push
      id:         pkg.id,
      api_id:     String(pkg.id),
      icon,
      name:       pkg.name,
      description: pkg.description,
      // Price from API is a string like "30.00" — display as KSh
      price:      `KSh ${parseFloat(pkg.price).toFixed(0)}`,
      priceNum:   parseFloat(pkg.price),
      duration,
      highlight,
      badge,
    };
  });
}

// ── Send real STK Push to M-Pesa ───────────────────────────────────────────────
// Returns { success: true } or throws with an error message
export async function sendStkPush({ phone, packageId, amount }) {
  const res = await fetch(`${BASE_URL}/payment/stkpush`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone,        // e.g. "254712345678"
      package_id: String(packageId),
      amount,       // numeric e.g. 30
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.message || `STK push failed (${res.status})`);
  }

  return data; // whatever the server returns (checkout_request_id etc.)
}

// ── Voucher generator (kept for voucher display page) ─────────────────────────
export function generateVoucher() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code; // e.g. AFRO-K3MX-9PQZ
}
