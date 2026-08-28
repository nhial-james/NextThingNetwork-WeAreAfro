// src/pages/Step3_ConfirmPayment.jsx — Real M-Pesa STK Push
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Smartphone, RefreshCw, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { StepShell, RedButton, GhostButton } from '../components/shared';
import { sendStkPush, generateVoucher } from '../utils/store';

// Animation steps shown while waiting for M-Pesa PIN
const STEPS_ANIM = [
  { id: 1, label: 'Sending STK push to your phone…',   duration: 2000 },
  { id: 2, label: 'Waiting for M-Pesa PIN entry…',     duration: 8000 },
  { id: 3, label: 'Confirming payment with Safaricom…', duration: 3000 },
  { id: 4, label: 'Generating your voucher code…',      duration: 1500 },
];

export default function Step3ConfirmPayment() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const pkg   = state?.package;
  const phone = state?.phone;   // already in "254XXXXXXXXX" format from Step 2

  const [currentStep, setCurrentStep] = useState(0);
  const [status,      setStatus]      = useState('pending');  // pending | success | failed
  const [errorMsg,    setErrorMsg]    = useState(null);
  const [countdown,   setCountdown]   = useState(90);
  const timersRef = useRef([]);

  const formattedPhone = phone
    ? `+${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6, 9)} ${phone.slice(9)}`
    : 'your phone';

  // Clear all pending timers
  const clearAllTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  // Fire the real STK push and run the animation sequence
  const initiatePush = async () => {
    setStatus('pending');
    setErrorMsg(null);
    setCurrentStep(1); // immediately show step 1 active

    try {
      // Send real STK push — fire immediately, don't await animation
      await sendStkPush({
        phone,
        packageId: pkg?.api_id ?? pkg?.id,
        amount:    pkg?.priceNum,
      });

      // STK push accepted → run the remaining animation steps
      let delay = STEPS_ANIM[0].duration; // step 1 already shown
      STEPS_ANIM.slice(1).forEach((step, i) => {
        const t = setTimeout(() => setCurrentStep(i + 2), delay);
        timersRef.current.push(t);
        delay += step.duration;
      });

      // After all steps complete → navigate to voucher page
      const finalTimer = setTimeout(() => {
        setStatus('success');
        const voucher = generateVoucher();
        navigate('/buy/voucher', { state: { package: pkg, phone, voucher } });
      }, delay);
      timersRef.current.push(finalTimer);

    } catch (err) {
      setStatus('failed');
      setErrorMsg(err.message || 'Payment request failed. Please try again.');
    }
  };

  // On mount — fire the STK push
  useEffect(() => {
    if (!pkg || !phone) {
      navigate('/buy');
      return;
    }
    initiatePush();

    // Countdown timer
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(interval); return 0; }
        return c - 1;
      });
    }, 1000);

    return () => {
      clearAllTimers();
      clearInterval(interval);
    };
  }, []);

  const handleResend = () => {
    clearAllTimers();
    setCountdown(90);
    setCurrentStep(0);
    initiatePush();
  };

  // ── Failed state ─────────────────────────────────────────────────────────────
  if (status === 'failed') {
    return (
      <StepShell
        step={3}
        title="Payment Failed"
        subtitle="There was a problem sending the payment request"
      >
        <div className="flex flex-col items-center gap-5 py-6 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
               style={{ background: 'rgba(227,30,36,0.15)', border: '1px solid rgba(227,30,36,0.4)' }}>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-lg mb-1">STK Push Failed</p>
            <p className="text-sm text-white/50">{errorMsg}</p>
          </div>
          <div className="flex gap-3 w-full">
            <RedButton onClick={handleResend} className="flex-1 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Try Again
            </RedButton>
            <GhostButton onClick={() => navigate('/buy/phone', { state: { package: pkg } })} className="flex-1">
              Wrong number?
            </GhostButton>
          </div>
        </div>
      </StepShell>
    );
  }

  // ── Pending / success state ──────────────────────────────────────────────────
  return (
    <StepShell
      step={3}
      title="Confirm M-Pesa Payment"
      subtitle={`Check your phone — a payment request was sent to ${formattedPhone}`}
    >
      {/* Phone animation */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          {/* Phone body */}
          <div className="w-28 h-48 rounded-3xl border-2 border-white/20 flex flex-col items-center justify-center p-3 relative overflow-hidden"
               style={{ background: 'rgba(0,0,0,0.6)' }}>
            {/* Screen glow */}
            <div className="absolute inset-0 rounded-3xl transition-all duration-1000"
                 style={{ background: currentStep >= 2 ? 'rgba(34,197,94,0.05)' : 'rgba(227,30,36,0.04)' }} />

            {/* M-Pesa branding */}
            <div className="w-14 h-8 rounded-lg flex items-center justify-center mb-3"
                 style={{ background: '#00A651' }}>
              <span className="text-white font-black text-xs">M-PESA</span>
            </div>

            {/* Amount */}
            <div className="text-center">
              <div className="text-[9px] text-white/50 leading-tight">Pay</div>
              <div className="text-sm font-black text-green-400">{pkg?.price}</div>
              <div className="text-[9px] text-white/40 mt-1 leading-tight">WeAreAfro Wi-Fi</div>
            </div>

            <div className="w-full h-px bg-white/10 my-2" />

            {/* PIN dots */}
            <div className="flex gap-1.5 items-center justify-center">
              {[0, 1, 2, 3].map((i) => (
                <div key={i}
                     className={`w-2 h-2 rounded-full transition-all duration-300 ${currentStep >= 2 ? 'bg-green-400' : 'bg-white/20'}`}
                     style={{ transitionDelay: `${i * 150}ms` }} />
              ))}
            </div>
            <div className="text-[8px] text-white/30 mt-1">Enter PIN</div>
          </div>

          {/* Pulse ring */}
          {currentStep < 4 && (
            <div className="absolute inset-0 rounded-3xl animate-ping opacity-20"
                 style={{ border: '2px solid #E31E24' }} />
          )}

          {/* STK notification badge */}
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-lg"
               style={{ background: 'rgba(0,166,81,0.9)', boxShadow: '0 0 16px rgba(0,166,81,0.6)' }}>
            📲
          </div>
        </div>

        {/* Countdown */}
        <div className="mt-5 text-center">
          <div className="text-2xl font-black font-mono"
               style={{ color: countdown > 30 ? '#E31E24' : '#fbbf24' }}>
            {String(Math.floor(countdown / 60)).padStart(2, '0')}:{String(countdown % 60).padStart(2, '0')}
          </div>
          <div className="text-xs text-white/30 mt-0.5">Payment request expires in</div>
        </div>
      </div>

      {/* Progress steps */}
      <div className="glass-card rounded-2xl p-5 mb-5 space-y-3">
        {STEPS_ANIM.map((s, i) => {
          const done   = currentStep > i + 1;
          const active = currentStep === i + 1;
          return (
            <div key={s.id} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                done ? 'bg-green-500' : active ? 'bg-red-500 animate-pulse' : 'bg-white/10'
              }`}>
                {done
                  ? <CheckCircle2 className="w-4 h-4 text-white" />
                  : active
                    ? <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                    : <div className="w-2 h-2 rounded-full bg-white/20" />}
              </div>
              <span className={`text-sm transition-colors duration-300 ${
                done ? 'text-green-400' : active ? 'text-white font-medium' : 'text-white/25'
              }`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="rounded-2xl p-4 mb-5 text-center"
           style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
        <p className="text-xs text-white/60 leading-relaxed">
          📱 A pop-up appeared on your phone.<br />
          <span className="text-white/80 font-medium">Enter your M-Pesa PIN to confirm payment.</span><br />
          Do not close this screen.
        </p>
      </div>

      {/* Resend / wrong number */}
      <div className="flex gap-3">
        <GhostButton onClick={handleResend} className="flex-1">
          <RefreshCw className="w-4 h-4" /> Resend Request
        </GhostButton>
        <GhostButton onClick={() => navigate('/buy/phone', { state: { package: pkg } })} className="flex-1">
          Wrong number?
        </GhostButton>
      </div>
    </StepShell>
  );
}
