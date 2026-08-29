// src/utils/store.js
// API base and shared utilities

export const BASE_URL = 'https://hotspot.nextthingnetworks.co.ke';
export const HOTSPOT_LOGIN_URL = 'http://ntnafro.net/login';
const STATION = 'daystar';

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
    duration: '1 days',
    dataAmount: '3GB',
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
    duration: '1 days',
    dataAmount: '12GB',
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
    dataAmount: '15GB',
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
    dataAmount: '20GB',
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
    dataAmount: '100GB',
    features: ['100 GB High Speed', 'Ultra-Low Latency', 'Unlimited Devices', 'VIP Priority'],
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
      let duration = '1 days';
      let dataAmount = '3GB';
      let speed = '10 Mbps';
      let devices = '1-2 Devices';

      if (nameLower.includes('daily')) {
        icon = 'Sun';
        duration = '1 days';
        dataAmount = nameLower.includes('12') ? '12GB' : '3GB';
        speed = '10-15 Mbps';
      } else if (nameLower.includes('weekly') || nameLower.includes('week')) {
        icon = 'Calendar';
        duration = '7 days';
        dataAmount = nameLower.includes('20') ? '20GB' : '15GB';
        speed = '20-25 Mbps';
        badge = index === 2 ? 'BEST VALUE' : null;
      } else if (nameLower.includes('monthly') || nameLower.includes('month')) {
        icon = 'Crown';
        duration = '30 days';
        dataAmount = '100GB';
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
        dataAmount,
        speed,
        devices,
        features: [
          'High-Speed Browsing',
          'Social Media & Streaming',
          'Instant SMS Voucher',
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
    data?.id ??
    null;

  if (!checkoutRequestId) {
    throw new Error('STK push sent but no CheckoutRequestID returned from server.');
  }

  return checkoutRequestId;
}

// ── Poll payment status ────────────────────────────────────────────────────────
export async function checkPaymentStatus(checkoutRequestId) {
  try {
    const res = await fetch(
      `${BASE_URL}/mpesa/payment-status/${checkoutRequestId}`
    );

    if (!res.ok) {
      // 404 or temporary backend delay -> treat as pending, keep polling
      return { status: 'pending' };
    }

    const data = await res.json().catch(() => ({}));

    // Extract voucher code from nested or flat response
    // e.g. {"status":"successful","voucher":{"voucher_code":"UFJPPX8","status":"active"}}
    let voucher =
      data?.voucher?.voucher_code ??
      data?.voucher?.code ??
      data?.voucher_code ??
      (typeof data?.voucher === 'string' ? data?.voucher : null) ??
      data?.code ??
      data?.voucherCode ??
      data?.data?.voucher?.voucher_code ??
      data?.data?.voucher ??
      null;

    const message = (
      data?.message ??
      data?.ResultDesc ??
      data?.sms ??
      data?.description ??
      ''
    ).toString();

    // If voucher not in explicit field, extract from SMS message
    if (!voucher && message) {
      const match =
        message.match(/voucher(?:\s+code)?(?:\s+is)?[:\s]+([A-Za-z0-9]{5,15})/i) ||
        message.match(/code\s+is\s+([A-Za-z0-9]{5,15})/i) ||
        message.match(/\b([A-Z0-9]{7})\b/);
      if (match && match[1]) {
        voucher = match[1].trim().toUpperCase();
      }
    }

    const rawStatus = (
      data?.status ??
      data?.Status ??
      data?.result ??
      data?.state ??
      ''
    ).toString().toLowerCase();

    const resultCode = data?.ResultCode ?? data?.result_code ?? data?.resultCode;

    // Any positive signal indicates success
    const isSuccess =
      rawStatus === 'successful' ||
      rawStatus === 'success' ||
      rawStatus === 'completed' ||
      rawStatus === 'complete' ||
      rawStatus === 'paid' ||
      rawStatus === 'ok' ||
      rawStatus === '0' ||
      Boolean(voucher) ||
      data?.success === true ||
      data?.paid === true ||
      resultCode === 0 ||
      resultCode === '0';

    if (isSuccess) {
      const finalVoucher = (voucher || generateVoucher()).trim().toUpperCase();
      return {
        status: 'success',
        voucher: finalVoucher,
        voucherDetails: typeof data?.voucher === 'object' ? data?.voucher : null,
        site: data?.site,
        amount: data?.amount,
        message: message || `Dear user, your voucher code is ${finalVoucher}.`,
        raw: data,
      };
    }

    const isFailed =
      rawStatus === 'failed' ||
      rawStatus === 'failure' ||
      rawStatus === 'cancelled' ||
      rawStatus === 'canceled' ||
      rawStatus === 'declined' ||
      rawStatus === 'rejected' ||
      (resultCode !== undefined && resultCode !== null && resultCode !== 0 && resultCode !== '0');

    if (isFailed) {
      return {
        status: 'failed',
        message: message || data?.error || 'Payment was declined or cancelled.',
      };
    }

    return { status: 'pending' };
  } catch (err) {
    console.warn('Status poll warning:', err.message);
    return { status: 'pending' };
  }
}

// ── Submit voucher to MikroTik / Hotspot Login ─────────────────────────────────
// Submits username & password to http://ntnafro.net/login
export function submitHotspotLogin(voucherCode) {
  if (!voucherCode) return;
  const clean = voucherCode.trim();

  // Create an invisible form to perform standard captive portal login
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = HOTSPOT_LOGIN_URL;
  form.style.display = 'none';

  const userField = document.createElement('input');
  userField.type = 'hidden';
  userField.name = 'username';
  userField.value = clean;
  form.appendChild(userField);

  const passField = document.createElement('input');
  passField.type = 'hidden';
  passField.name = 'password';
  passField.value = clean;
  form.appendChild(passField);

  const dstField = document.createElement('input');
  dstField.type = 'hidden';
  dstField.name = 'dst';
  dstField.value = 'http://ntnafro.net/status';
  form.appendChild(dstField);

  document.body.appendChild(form);
  
  try {
    form.submit();
  } catch (e) {
    console.warn('Form submit error:', e);
    // Fallback GET request if POST blocked
    window.location.href = `${HOTSPOT_LOGIN_URL}?username=${encodeURIComponent(clean)}&password=${encodeURIComponent(clean)}`;
  }
}

// ── Voucher generator (7-char uppercase alphanumeric like HVLA1Z7) ────────────
export function generateVoucher() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 7; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code; // e.g. HVLA1Z7
}

// ── Format standard SMS voucher message ────────────────────────────────────────
export function getVoucherSmsMessage({ voucher, dataAmount = '3GB', duration = '1 days' }) {
  return `Dear user, your voucher code is ${voucher} for ${dataAmount}. Valid for ${duration}.`;
}
