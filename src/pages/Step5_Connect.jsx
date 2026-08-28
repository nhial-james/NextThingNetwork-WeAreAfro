// src/pages/Step5_Connect.jsx — Enter voucher and connect
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Wifi, CheckCircle2, ArrowRight, Signal, Clock, Gauge, Ticket } from 'lucide-react';
import { StepShell, RedButton, GhostButton } from '../components/shared';

export default function Step5Connect() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const pkg = state?.package;
  const prefillVoucher = state?.voucher || '';

  const [voucher, setVoucher] = useState(prefillVoucher);
  const [status, setStatus] = useState('idle'); // idle | connecting | connected
  const [dots, setDots] = useState('');
  const [bars, setBars] = useState(0);

  // Animated dots
  useEffect(() => {
    if (status !== 'connecting') return;
    const iv = setInterval(() => setDots((d) => (d.length >= 3 ? '' : d + '.')), 400);
    return () => clearInterval(iv);
  }, [status]);

  // Signal bars animation after connect
  useEffect(() => {
    if (status !== 'connected') return;
    let b = 0;
    const iv = setInterval(() => {
      b++;
      setBars(b);
      if (b >= 5) clearInterval(iv);
    }, 150);
    return () => clearInterval(iv);
  }, [status]);

  const handleConnect = async () => {
    if (!voucher.trim()) return;
    setStatus('connecting');
    await new Promise((r) => setTimeout(r, 2200));
    setStatus('connected');
  };

  const formatVoucher = (v) => {
    const clean = v.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 12);
    const groups = [];
    for (let i = 0; i < clean.length; i += 4) groups.push(clean.slice(i, i + 4));
    return groups.join('-');
  };

  const handleChange = (e) => {
    setVoucher(formatVoucher(e.target.value));
    setStatus('idle');
  };

  if (status === 'connected') {
    return (
      <StepShell step={5} title="You're Connected! 🎉" subtitle="Enjoy ultra-fast internet at We Are Afro">
        <div className="text-center py-4">
          {/* Big success icon */}
          <div className="relative inline-flex items-center justify-center w-28 h-28 rounded-full mb-6"
               style={{ background: 'linear-gradient(135deg, #E31E24 0%, #7c0f13 100%)', boxShadow: '0 0 60px rgba(227,30,36,0.6)' }}>
            <Wifi className="w-14 h-14 text-white" />
            <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: '#E31E24' }} />
          </div>

          {/* Network name */}
          <div className="glass-card rounded-2xl p-4 mb-5 text-center">
            <div className="text-xs text-white/40 mb-1">Connected to</div>
            <div className="font-mono font-black text-xl text-white">WeAreAfro_NTN</div>
            <div className="flex items-center justify-center gap-1.5 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`rounded-sm transition-all duration-300 ${i < bars ? 'bg-green-400' : 'bg-white/15'}`}
                     style={{ width: 6, height: 8 + i * 4 }} />
              ))}
              <span className="text-xs text-green-400 ml-2 font-semibold">Excellent</span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: Gauge, label: 'Speed', value: pkg?.speed || '10-20 Mbps', color: 'text-red-400' },
              { icon: Clock, label: 'Duration', value: pkg?.duration || 'Active Session', color: 'text-yellow-400' },
              { icon: Signal, label: 'Signal', value: '●●●●●', color: 'text-green-400' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="glass-card rounded-xl p-3 text-center">
                <Icon className={`w-4 h-4 ${color} mx-auto mb-1.5`} />
                <div className={`text-xs font-bold ${color}`}>{value}</div>
                <div className="text-[10px] text-white/30 mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Plan details */}
          <div className="glass-card rounded-2xl p-4 mb-6 text-left">
            <div className="text-xs text-white/40 uppercase tracking-widest mb-3 font-semibold">Session Details</div>
            <div className="space-y-2">
              {[
                ['Package', pkg?.name || 'Wi-Fi Voucher Pass'],
                ['Voucher', voucher],
                ['Network', 'WeAreAfro_NTN'],
                ['IP Address', '192.168.10.' + Math.floor(Math.random() * 200 + 50)],
                ['Connected At', new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="text-white/40">{k}</span>
                  <span className="text-white font-mono font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Enjoy message */}
          <div className="rounded-2xl p-4 mb-5 text-center"
               style={{ background: 'rgba(227,30,36,0.08)', border: '1px solid rgba(227,30,36,0.2)' }}>
            <p className="text-sm text-white/70">
              🎶 <span className="font-semibold text-white">Enjoy We Are Afro!</span><br />
              <span className="text-xs text-white/40">Share moments, go live, stay connected all night.</span>
            </p>
          </div>

          <GhostButton onClick={() => navigate('/')}>Back to Home</GhostButton>
        </div>
      </StepShell>
    );
  }

  return (
    <StepShell
      step={5}
      title="Connect & Enjoy!"
      subtitle="Enter your voucher code to start browsing"
    >
      {/* Pre-filled notice if coming from voucher page */}
      {prefillVoucher && (
        <div className="flex items-center gap-2 rounded-xl p-3 mb-4"
             style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
          <span className="text-xs text-white/60">Voucher code pre-filled from your SMS receipt</span>
        </div>
      )}

      {/* Guest Access Form */}
      <div className="glass-card rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Ticket className="w-3.5 h-3.5 text-red-400" /> Guest Voucher Login
          </span>
          <span className="text-[10px] text-white/40">Instant Activation</span>
        </div>

        <label className="block text-xs text-white/50 uppercase tracking-widest mb-2 font-semibold">
          Voucher Code
        </label>
        <input
          type="text"
          placeholder="AFRO-XXXX-XXXX"
          className="input-field text-center text-xl tracking-widest font-mono uppercase mb-4"
          value={voucher}
          onChange={handleChange}
          maxLength={14}
          autoFocus={!prefillVoucher}
        />

        {/* Voucher format hint */}
        <div className="flex justify-center gap-1 mb-5">
          {['XXXX', 'XXXX', 'XXXX'].map((g, i) => (
            <div key={i} className="flex gap-1">
              {i > 0 && <span className="text-white/20 font-mono">-</span>}
              {Array.from(g).map((_, j) => {
                const pos = i * 4 + j;
                const char = voucher.replace(/-/g, '')[pos];
                return (
                  <div key={j}
                       className="w-6 h-7 flex items-center justify-center rounded text-xs font-mono font-bold"
                       style={{ background: char ? 'rgba(227,30,36,0.2)' : 'rgba(255,255,255,0.05)', borderBottom: `2px solid ${char ? '#E31E24' : 'rgba(255,255,255,0.1)'}` }}>
                    {char || ''}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {status === 'connecting' ? (
          <div className="btn-red w-full h-14 flex items-center justify-center gap-3 text-base font-bold rounded-xl">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Connecting{dots}
          </div>
        ) : (
          <RedButton onClick={handleConnect} disabled={voucher.replace(/-/g, '').length < 8}>
            <Wifi className="w-5 h-5" />
            Connect Now
            <ArrowRight className="w-5 h-5" />
          </RedButton>
        )}
      </div>

      {/* Help */}
      <div className="text-center">
        <p className="text-xs text-white/30 mb-3">Don't have a voucher?</p>
        <GhostButton onClick={() => navigate('/buy')}>
          Buy a Data Package
        </GhostButton>
      </div>
    </StepShell>
  );
}
