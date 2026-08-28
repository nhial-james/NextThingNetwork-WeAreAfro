// src/utils/store.js
// API base and shared utilities

const BASE_URL = 'https://hotspot.nextthingnetworks.co.ke';
const STATION  = 'daystar';

// Fallback packages in case of network issue or offline mode
export const PACKAGES = [
  {
    id: 1,
    api_id: '1',
    icon: 'Sun',
    name: '3 GB Daily',
    description: 'Daystar',
    price: 'KSh 30',
    priceNum: 30,
    usd: '~$0.23',
    speed: '10 Mbps',
    devices: '1 Device',
    duration: '24 hours',
    features: ['High-Speed Browsing', 'Social Media & Live Streaming', 'Instant Activation'],
    highlight: true,
    badge: 'MOST POPULAR',
  },
  {
    id: 7,
    api_id: '7',
    icon: 'Sun',
    name: '12 GB Daily',
    description: 'Daystar',
    price: 'KSh 60',
    priceNum: 60,
    usd: '~$0.46',
    speed: '15 Mbps',
    devices: '2 Devices',
    duration: '24 hours',
    features: ['Ultra-HD Streaming', 'Multiple Devices', 'Priority Bandwidth'],
    highlight: false,
    badge: null,
  },
  {
    id: 8,
    api_id: '8',
    icon: 'Calendar',
    name: '15 GB WEEKLY',
    description: 'Daystar',
    price: 'KSh 180',
    priceNum: 180,
    usd: '~$1.38',
    speed: '20 Mbps',
    devices: '2 Devices',
    duration: '7 days',
    features: ['7 Days Full Access', 'HD Video Calls', 'VIP Queue'],
    highlight: false,
    badge: 'BEST VALUE',
  },
  {
    id: 9,
    api_id: '9',
    icon: 'Calendar',
    name: '20 GB WEEKLY',
    description: 'Daystar',
    price: 'KSh 300',
    priceNum: 300,
    usd: '~$2.30',
    speed: '25 Mbps',
    devices: '3 Devices',
    duration: '7 days',
    features: ['20 GB High Speed', 'Uncapped Speed', 'VIP Priority'],
    highlight: false,
    badge: null,
  },
  {
    id: 10,
    api_id: '10',
    icon: 'Crown',
    name: '100 GB MONTHLY',
    description: 'Daystar',
    price: 'KSh 1000',
    priceNum: 1000,
    usd: '~$7.70',
    speed: '50 Mbps',
    devices: '5 Devices',
    duration: '30 days',
    features: ['100 GB High Speed', 'Ultra-Low Latency', 'Unlimited Devices', 'VIP VIP Priority'],
    highlight: false,
    badge: 'PRO VIP',
  },
];

// ── Fetch packages from live API ───────────────────────────────────────────────
export async function fetchPackages() {
  try {
    const res = await fetch(`${BASE_URL}/api/packages/${STATION}`);
    if (!res.ok) throw new Error(`Failed to fetch packages (${res.status})`);
    const data = await res.json();

    return data.map((pkg, index) => {
      const nameLower = pkg.name.toLowerCase();
      let icon = 'Wifi';
      let badge = null;
      let highlight = false;
      let duration = pkg.name;
      let speed = '10 Mbps';
      let devices = '1-2 Devices';

      if (nameLower.includes('daily')) {
        icon = 'Sun';
        duration = '24 hours';
        speed = '10-15 Mbps';
      } else if (nameLower.includes('weekly') || nameLower.includes('week')) {
        icon = 'Calendar';
        duration = '7 days';
        speed = '20-25 Mbps';
        badge = index === 2 ? 'BEST VALUE' : null;
      } else if (nameLower.includes('monthly') || nameLower.includes('month')) {
        icon = 'Crown';
        duration = '30 days';
        speed = '50 Mbps';
        devices = 'Up to 5 Devices';
        badge = 'PRO VIP';
      }

      if (index === 0) {
        badge = 'MOST POPULAR';
        highlight = true;
      }

      return {
        id: pkg.id,
        api_id: String(pkg.id),
        icon,
        name: pkg.name,
        description: pkg.description,
        price: `KSh ${parseFloat(pkg.price).toFixed(0)}`,
        priceNum: parseFloat(pkg.price),
        duration,
        speed,
        devices,
        features: [
          'High-Speed Browsing',
          'Social Media & Streaming',
          'Instant Voucher SMS',
        ],
        highlight,
        badge,
      };
    });
  } catch (e) {
    console.warn('Using fallback packages:', e.message);
    return PACKAGES;
  }
}

// ── Send real STK Push to M-Pesa ───────────────────────────────────────────────
export async function sendStkPush({ phone, packageId, amount }) {
  const res = await fetch(`${BASE_URL}/payment/stkpush`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone,
      package_id: String(packageId),
      amount: Number(amount),
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.message || `STK push failed (${res.status})`);
  }

  const checkoutRequestId =
    data?.CheckoutRequestID ??
    data?.checkout_request_id ??
    data?.checkoutRequestId ??
    data?.request_id ??
    null;

  if (!checkoutRequestId) {
    throw new Error('STK push sent but no CheckoutRequestID returned from server.');
  }

  return checkoutRequestId;
}

// ── Poll payment status ────────────────────────────────────────────────────────
export async function checkPaymentStatus(checkoutRequestId) {
  const res = await fetch(
    `${BASE_URL}/public/mpesa/payment-status/${checkoutRequestId}`
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 404) return { status: 'pending' };
    throw new Error(data?.message || `Status check failed (${res.status})`);
  }

  const raw = (
    data?.status ??
    data?.Status ??
    data?.ResultCode ??
    data?.result_code ??
    ''
  ).toString().toLowerCase();

  if (raw === 'success' || raw === '0' || data?.success === true || data?.paid === true) {
    return { status: 'success' };
  }

  if (
    raw === 'failed' ||
    raw === 'failure' ||
    raw === 'cancelled' ||
    raw === 'canceled' ||
    (data?.ResultCode !== undefined && data.ResultCode !== 0)
  ) {
    return {
      status: 'failed',
      message: data?.ResultDesc || data?.message || data?.error || 'Payment was declined or cancelled.',
    };
  }

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
  return code;
}
