// src/pages/Step4_VoucherReceived.jsx — Voucher delivered via SMS
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, Copy, MessageSquare, Wifi, Share2 } from 'lucide-react';
import { StepShell, RedButton, GhostButton } from '../components/shared';
export default function Step4VoucherReceived() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const pkg = state?.package;
  const phone = state?.phone;
  const voucher = state?.voucher || 'AFRO-K3MX-9PQZ';

  const [copied, setCopied] = useState(false);
  const [entered, setEntered] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const formattedPhone = phone
    ? `+${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6, 9)} ${phone.slice(9)}`
    : 'your phone';

  // Fire confetti on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        try {
          // Simple confetti without canvas-confetti package
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        } catch {}
      }
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(voucher).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleConnect = () => {
    navigate('/connect', { state: { voucher, package: pkg } });
  };

  return (
    <StepShell
      step={4}
      title="Your Voucher is Ready! 🎉"
      subtitle="Payment confirmed — your voucher code has been sent via SMS"
    >
      {/* Success burst */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
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

      {/* Payment success card */}
      <div className="glass-card rounded-2xl p-5 mb-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
             style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
          <CheckCircle2 className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <div className="font-bold text-green-400 text-sm">Payment Successful!</div>
          <div className="text-xs text-white/45 mt-0.5">
            {pkg?.price} paid · {pkg?.name} · M-Pesa ref: <span className="font-mono text-white/60">QK{Math.floor(Math.random()*9000+1000)}NWA</span>
          </div>
        </div>
      </div>

      {/* SMS preview */}
      <div className="rounded-2xl p-4 mb-5"
           style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-4 h-4 text-green-400" />
          <span className="text-xs text-white/40">SMS sent to {formattedPhone}</span>
          <div className="ml-auto flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] text-green-400">Delivered</span>
          </div>
        </div>
        <div className="rounded-xl p-4 text-xs text-white/70 leading-relaxed font-mono"
             style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="text-green-400 font-bold">Next Thing Networks:</span> Payment received. 
          Your WeAreAfro Wi-Fi voucher: <span className="text-white font-black text-sm">{voucher}</span>. 
          Valid for {pkg?.duration}. Go to http://wifi.nextthing.co.ke or open your browser. Enjoy the vibe! 🎶
        </div>
      </div>

      {/* Voucher code card */}
      <div className="rounded-2xl p-6 mb-5 text-center"
           style={{
             background: 'linear-gradient(135deg, rgba(227,30,36,0.12) 0%, rgba(0,0,0,0.4) 100%)',
             border: '1px solid rgba(227,30,36,0.4)',
             boxShadow: '0 0 30px rgba(227,30,36,0.15)',
           }}>
        <div className="text-xs text-white/40 uppercase tracking-widest mb-3 font-semibold">Your Voucher Code</div>
        <div className="font-black text-white text-3xl tracking-widest font-mono mb-1">{voucher}</div>
        <div className="text-xs text-white/30 mb-4">{pkg?.name} · {pkg?.duration} · {pkg?.speed}</div>
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
          {copied ? 'Copied!' : 'Copy Code'}
        </button>
      </div>

      {/* What to do next */}
      <div className="glass-card rounded-2xl p-4 mb-6">
        <div className="text-xs text-white/40 uppercase tracking-widest mb-3 font-semibold">What's Next?</div>
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black text-white"
               style={{ background: '#E31E24' }}>5</div>
          <div>
            <div className="text-sm font-semibold text-white mb-0.5">Connect & Enjoy</div>
            <div className="text-xs text-white/40">
              Go to the login page, select "Guest Access", paste your voucher code and tap <strong className="text-white/60">Connect Now</strong>.
            </div>
          </div>
        </div>
      </div>

      <RedButton onClick={handleConnect}>
        <Wifi className="w-5 h-5" />
        Connect Now →
      </RedButton>

      <div className="mt-3">
        <GhostButton onClick={() => navigator.share?.({ title: 'My WeAreAfro Wi-Fi Voucher', text: `Use code ${voucher} for WeAreAfro Wi-Fi` })}>
          <Share2 className="w-4 h-4" /> Share Voucher
        </GhostButton>
      </div>
    </StepShell>
  );
}
