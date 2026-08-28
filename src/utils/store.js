// src/utils/store.js
// Shared purchase context passed via router state
export const PACKAGES = [
  {
    id: 'hour',
    icon: 'Clock',
    name: '1 Hour',
    price: 'KSh 50',
    priceNum: 50,
    usd: '~$0.38',
    speed: '5 Mbps',
    devices: '1 Device',
    duration: '60 mins',
    features: ['HD Streaming', 'Social Media', 'Messaging'],
    highlight: false,
    badge: null,
  },
  {
    id: 'five',
    icon: 'Zap',
    name: '5 Hours',
    price: 'KSh 200',
    priceNum: 200,
    usd: '~$1.55',
    speed: '10 Mbps',
    devices: '2 Devices',
    duration: '5 hours',
    features: ['HD Streaming', 'Social Media', 'Video Calls', 'Priority Queue'],
    highlight: true,
    badge: 'MOST POPULAR',
  },
  {
    id: 'event',
    icon: 'Crown',
    name: 'Full Event',
    price: 'KSh 500',
    priceNum: 500,
    usd: '~$3.85',
    speed: '20 Mbps',
    devices: '3 Devices',
    duration: 'All night',
    features: ['4K Streaming', 'All Platforms', 'Video Calls', 'VIP Priority', 'No Throttle'],
    highlight: false,
    badge: 'VIP',
  },
];

export function generateVoucher() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code; // e.g. AFRO-K3MX-9PQZ
}
