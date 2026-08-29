// src/pages/Step4_VoucherReceived.jsx — Voucher delivered via SMS + Auto-login to http://ntnafro.net/login
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, Copy, MessageSquare, Wifi, Share2, ArrowRight, ExternalLink } from 'lucide-react';
import { StepShell, RedButton, GhostButton } from '../components/shared';
import { submitHotspotLogin, getVoucherSmsMessage, HOTSPOT_LOGIN_URL } from '../utils/store';

export default function Step4VoucherReceived() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const pkg = state?.package;
  const phone = state?.phone;
  const voucher = state?.voucher || 'HVLA1Z7';
  const autoConnect = state?.autoConnect || false;

  const [copied, setCopied] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const hasAutoSubmitted = useRef(false);

  const formattedPhone = phone
    ? `+${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6, 9)} ${phone.slice(9)}`
    : 'your phone';

  const dataAmount = pkg?.dataAmount || '3GB';
  const duration = pkg?.duration || '1 days';
  const smsMessage = getVoucherSmsMessage({ voucher, dataAmount, duration });

  // Confetti effect
  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  // Auto-connect on mount if triggered from payment completion
  useEffect(() => {
    if (autoConnect && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true;
      setConnecting(true);
      const timer = setTimeout(() => {
        submitHotspotLogin(voucher);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [autoConnect, voucher]);

  const handleCopy = () => {
    navigator.clipboard.writeText(voucher).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleManualLogin = () => {
    setConnecting(true);
    submitHotspotLogin(voucher);
  };

  return (
    <StepShell
      step={4}
      title="Payment Successful! 🎉"
      subtitle="Your Wi-Fi voucher is active and ready to use"
    >
      {/* Success burst */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 40}%`,
                background: ['#E31E24', '#ff6b6b', '#fbbf24', '#34d399', '#60a5fa'][i % 5],
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${0.8 + Math.random()}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Auto-connecting banner */}
      {autoConnect && (
        <div
          className="rounded-2xl p-4 mb-5 flex items-center gap-3 animate-pulse"
          style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.35)' }}
        >
          <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <Wifi className="w-5 h-5 text-green-400 animate-bounce" />
          </div>
          <div>
            <div className="text-sm font-bold text-green-400">Auto-Connecting to Wi-Fi…</div>
            <div className="text-xs text-white/50">Submitting credentials to http://ntnafro.net/login</div>
          </div>
        </div>
      )}

      {/* Payment confirmation status */}
      <div className="glass-card rounded-2xl p-5 mb-5 flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}
        >
          <CheckCircle2 className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <div className="font-bold text-green-400 text-sm">Payment Confirmed via M-Pesa</div>
          <div className="text-xs text-white/50 mt-0.5">
            {pkg?.price || 'KSh 30'} · {pkg?.name || 'Wi-Fi Package'} · {duration}
          </div>
        </div>
      </div>

      {/* Voucher card */}
      <div
        className="rounded-2xl p-6 mb-5 text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(227,30,36,0.15) 0%, rgba(0,0,0,0.5) 100%)',
          border: '1px solid rgba(227,30,36,0.4)',
          boxShadow: '0 0 35px rgba(227,30,36,0.2)',
        }}
      >
        <div className="text-xs text-white/40 uppercase tracking-widest mb-2 font-semibold">Your Wi-Fi Voucher Code</div>
        <div className="font-black text-white text-4xl tracking-widest font-mono mb-2 select-all">{voucher}</div>
        <div className="text-xs text-white/40 mb-4">{dataAmount} Data · Valid for {duration}</div>

        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
          style={{
            background: copied ? 'rgba(34,197,94,0.2)' : 'rgba(227,30,36,0.15)',
            border: `1px solid ${copied ? 'rgba(34,197,94,0.4)' : 'rgba(227,30,36,0.3)'}`,
            color: copied ? '#4ade80' : '#E31E24',
          }}
        >
          {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied to Clipboard!' : 'Copy Voucher Code'}
        </button>
      </div>

      {/* SMS message received */}
      <div
        className="rounded-2xl p-4 mb-5"
        style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-2 mb-2.5">
          <MessageSquare className="w-4 h-4 text-green-400" />
          <span className="text-xs text-white/50 font-medium">SMS delivered to {formattedPhone}</span>
          <div className="ml-auto flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] text-green-400 font-bold">Delivered</span>
          </div>
        </div>
        <div
          className="rounded-xl p-3.5 text-xs text-white/80 leading-relaxed font-mono select-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          "{smsMessage}"
        </div>
      </div>

      {/* Connect Now button submitting to router */}
      <RedButton onClick={handleManualLogin} disabled={connecting} className="h-14 text-base">
        {connecting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Logging into Wi-Fi Network…
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Wifi className="w-5 h-5" /> Connect Now (Login to Wi-Fi) <ArrowRight className="w-5 h-5" />
          </span>
        )}
      </RedButton>

      {/* Manual link if needed */}
      <div className="mt-4 text-center">
        <a
          href={`${HOTSPOT_LOGIN_URL}?username=${encodeURIComponent(voucher)}&password=${encodeURIComponent(voucher)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-white/40 hover:text-red-400 inline-flex items-center gap-1 transition-colors"
        >
          Direct router login link <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </StepShell>
  );
}
