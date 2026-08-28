// src/pages/Step3_ConfirmPayment.jsx — Real M-Pesa STK Push + Status Polling
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RefreshCw, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { StepShell, RedButton, GhostButton } from '../components/shared';
import { sendStkPush, checkPaymentStatus, generateVoucher } from '../utils/store';

// Animation labels shown while polling
const STEPS_ANIM = [
  { id: 1, label: 'Sending STK push to your phone…'     },
  { id: 2, label: 'Waiting for M-Pesa PIN entry…'       },
  { id: 3, label: 'Confirming payment with Safaricom…'  },
  { id: 4, label: 'Generating your voucher code…'       },
];

const POLL_INTERVAL_MS = 4000;  // poll every 4 seconds
const TIMEOUT_SECS     = 90;    // give up after 90 seconds

export default function Step3ConfirmPayment() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const pkg   = state?.package;
  const phone = state?.phone; // "254XXXXXXXXX" from Step 2

  const [currentStep,       setCurrentStep]       = useState(0);
  const [status,            setStatus]            = useState('initiating'); // initiating | polling | success | failed | timeout
  const [errorMsg,          setErrorMsg]          = useState(null);
  const [countdown,         setCountdown]         = useState(TIMEOUT_SECS);
  const [checkoutRequestId, setCheckoutRequestId] = useState(null);

  const pollRef      = useRef(null);
  const countdownRef = useRef(null);
  const mountedRef   = useRef(true);

  const formattedPhone = phone
    ? `+${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6, 9)} ${phone.slice(9)}`
    : 'your phone';

  // ── Stop all timers ──────────────────────────────────────────────────────────
  const stopAll = () => {
    clearInterval(pollRef.current);
    clearInterval(countdownRef.current);
  };

  // ── Start polling for payment confirmation ────────────────────────────────────
  const startPolling = (requestId) => {
    setCurrentStep(2); // "Waiting for M-Pesa PIN…"

    pollRef.current = setInterval(async () => {
      if (!mountedRef.current) return;
      try {
        const result = await checkPaymentStatus(requestId);

        if (result.status === 'success') {
          stopAll();
          setCurrentStep(3);
          // Brief pause on step 3 then 4 before navigating
          setTimeout(() => setCurrentStep(4), 1200);
          setTimeout(() => {
            if (!mountedRef.current) return;
            setStatus('success');
            const voucher = generateVoucher();
            navigate('/buy/voucher', { state: { package: pkg, phone, voucher } });
          }, 2600);

        } else if (result.status === 'failed') {
          stopAll();
          if (mountedRef.current) {
            setStatus('failed');
            setErrorMsg(result.message || 'Payment was declined or cancelled. Please try again.');
          }
        }
        // 'pending' → do nothing, keep polling

      } catch (err) {
        // Network error while polling — keep trying until timeout
        console.warn('Status poll error:', err.message);
      }
    }, POLL_INTERVAL_MS);
  };

  // ── Initiate STK push then start polling ─────────────────────────────────────
  const initiatePush = async () => {
    stopAll();
    setStatus('initiating');
    setErrorMsg(null);
    setCurrentStep(1);
    setCountdown(TIMEOUT_SECS);

    // Start countdown
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(countdownRef.current);
          clearInterval(pollRef.current);
          if (mountedRef.current) {
            setStatus('timeout');
            setErrorMsg('The payment request timed out. Please try again.');
          }
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    try {
      const requestId = await sendStkPush({
        phone,
        packageId: pkg?.api_id ?? pkg?.id,
        amount:    pkg?.priceNum,
      });

      if (!mountedRef.current) return;
      setCheckoutRequestId(requestId);
      setStatus('polling');
      startPolling(requestId);

    } catch (err) {
      stopAll();
      if (mountedRef.current) {
        setStatus('failed');
        setErrorMsg(err.message || 'Failed to send payment request. Please try again.');
      }
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    if (!pkg || !phone) { navigate('/buy'); return; }
    initiatePush();
    return () => {
      mountedRef.current = false;
      stopAll();
    };
  }, []);

  // ── Failed / Timeout state ───────────────────────────────────────────────────
  if (status === 'failed' || status === 'timeout') {
    return (
      <StepShell
        step={3}
        title={status === 'timeout' ? 'Request Timed Out' : 'Payment Failed'}
        subtitle={status === 'timeout' ? 'No PIN was entered within 90 seconds' : 'The payment request was declined or cancelled'}
      >
        <div className="flex flex-col items-center gap-5 py-6 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
               style={{ background: 'rgba(227,30,36,0.15)', border: '1px solid rgba(227,30,36,0.4)' }}>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-lg mb-1">
              {status === 'timeout' ? 'Timed Out' : 'STK Push Failed'}
            </p>
            <p className="text-sm text-white/50 max-w-xs mx-auto leading-relaxed">{errorMsg}</p>
          </div>
          <div className="flex gap-3 w-full">
            <RedButton
              onClick={initiatePush}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </RedButton>
            <GhostButton
              onClick={() => navigate('/buy/phone', { state: { package: pkg } })}
              className="flex-1"
            >
              Wrong number?
            </GhostButton>
          </div>
        </div>
      </StepShell>
    );
  }

  // ── Initiating / Polling state ───────────────────────────────────────────────
  return (
    <StepShell
      step={3}
      title="Confirm M-Pesa Payment"
      subtitle={`Check your phone — a payment request was sent to ${formattedPhone}`}
    >
      {/* Phone mockup */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <div
            className="w-28 h-48 rounded-3xl border-2 border-white/20 flex flex-col items-center justify-center p-3 relative overflow-hidden"
            style={{ background: 'rgba(0,0,0,0.6)' }}
          >
            {/* Screen glow */}
            <div
              className="absolute inset-0 rounded-3xl transition-all duration-1000"
              style={{ background: currentStep >= 2 ? 'rgba(34,197,94,0.05)' : 'rgba(227,30,36,0.04)' }}
            />

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
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${currentStep >= 2 ? 'bg-green-400' : 'bg-white/20'}`}
                  style={{ transitionDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
            <div className="text-[8px] text-white/30 mt-1">Enter PIN</div>
          </div>

          {/* Pulse ring while waiting */}
          {currentStep < 4 && (
            <div
              className="absolute inset-0 rounded-3xl animate-ping opacity-20"
              style={{ border: '2px solid #E31E24' }}
            />
          )}

          {/* STK notification badge */}
          <div
            className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-lg"
            style={{ background: 'rgba(0,166,81,0.9)', boxShadow: '0 0 16px rgba(0,166,81,0.6)' }}
          >
            📲
          </div>
        </div>

        {/* Countdown */}
        <div className="mt-5 text-center">
          <div
            className="text-2xl font-black font-mono"
            style={{ color: countdown > 30 ? '#E31E24' : '#fbbf24' }}
          >
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

        {/* Live polling indicator */}
        {status === 'polling' && (
          <div className="flex items-center gap-2 pt-1">
            <Loader2 className="w-3 h-3 text-white/30 animate-spin" />
            <span className="text-[11px] text-white/25">Checking payment status every 4 seconds…</span>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div
        className="rounded-2xl p-4 mb-5 text-center"
        style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}
      >
        <p className="text-xs text-white/60 leading-relaxed">
          📱 A pop-up appeared on your phone.<br />
          <span className="text-white/80 font-medium">Enter your M-Pesa PIN to confirm payment.</span><br />
          This page will automatically update when payment is received.
        </p>
      </div>

      {/* Resend / wrong number */}
      <div className="flex gap-3">
        <GhostButton onClick={initiatePush} className="flex-1 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4" /> Resend Request
        </GhostButton>
        <GhostButton onClick={() => navigate('/buy/phone', { state: { package: pkg } })} className="flex-1">
          Wrong number?
        </GhostButton>
      </div>
    </StepShell>
  );
}
