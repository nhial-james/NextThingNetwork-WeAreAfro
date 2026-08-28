// src/pages/Step3_ConfirmPayment.jsx — Real M-Pesa STK Push + Status Polling + Auto-Connect
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RefreshCw, CheckCircle2, XCircle, Loader2, Wifi, Zap } from 'lucide-react';
import { StepShell, RedButton, GhostButton } from '../components/shared';
import { sendStkPush, checkPaymentStatus, submitHotspotLogin } from '../utils/store';

const STEPS_ANIM = [
  { id: 1, label: 'Sending STK push to your phone…' },
  { id: 2, label: 'Waiting for M-Pesa PIN entry on your phone…' },
  { id: 3, label: 'Payment confirmed! Generating voucher…' },
  { id: 4, label: 'Connecting to WeAreAfro_NTN Wi-Fi…' },
];

const POLL_INTERVAL_MS = 2500; // poll every 2.5 seconds for instant feedback
const TIMEOUT_SECS = 120; // 120 seconds timeout

export default function Step3ConfirmPayment() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const pkg = state?.package;
  const phone = state?.phone; // "254XXXXXXXXX"

  const [currentStep, setCurrentStep] = useState(1);
  const [status, setStatus] = useState('initiating'); // initiating | polling | success | failed | timeout
  const [errorMsg, setErrorMsg] = useState(null);
  const [countdown, setCountdown] = useState(TIMEOUT_SECS);
  const [voucherCode, setVoucherCode] = useState(null);

  const pollRef = useRef(null);
  const countdownRef = useRef(null);
  const mountedRef = useRef(true);

  const formattedPhone = phone
    ? `+${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6, 9)} ${phone.slice(9)}`
    : 'your phone';

  const stopAll = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  const handleSuccess = (voucher, voucherDetails) => {
    stopAll();
    setVoucherCode(voucher);
    setStatus('success');
    setCurrentStep(3);

    // Auto-connect flow
    setTimeout(() => {
      if (!mountedRef.current) return;
      setCurrentStep(4);
    }, 1200);

    setTimeout(() => {
      if (!mountedRef.current) return;
      // Navigate to voucher page with auto-login triggered
      navigate('/buy/voucher', {
        state: {
          package: pkg,
          phone,
          voucher,
          voucherDetails,
          autoConnect: true,
        },
      });
    }, 2800);
  };

  const startPolling = (requestId) => {
    setCurrentStep(2);

    pollRef.current = setInterval(async () => {
      if (!mountedRef.current) return;
      try {
        const result = await checkPaymentStatus(requestId);

        if (result.status === 'success') {
          handleSuccess(result.voucher, result.voucherDetails);
        } else if (result.status === 'failed') {
          stopAll();
          if (mountedRef.current) {
            setStatus('failed');
            setErrorMsg(result.message || 'Payment was declined or cancelled. Please try again.');
          }
        }
      } catch (err) {
        console.warn('Status poll glitch:', err.message);
      }
    }, POLL_INTERVAL_MS);
  };

  const initiatePush = async () => {
    stopAll();
    setStatus('initiating');
    setErrorMsg(null);
    setCurrentStep(1);
    setCountdown(TIMEOUT_SECS);

    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          stopAll();
          if (mountedRef.current) {
            setStatus('timeout');
            setErrorMsg('Payment request timed out. If you entered your PIN, please check your SMS for the voucher code.');
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
        amount: pkg?.priceNum,
      });

      if (!mountedRef.current) return;
      setStatus('polling');
      startPolling(requestId);
    } catch (err) {
      stopAll();
      if (mountedRef.current) {
        setStatus('failed');
        setErrorMsg(err.message || 'Failed to send M-Pesa payment request. Please verify your phone number and try again.');
      }
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    if (!pkg || !phone) {
      navigate('/buy');
      return;
    }
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
        title={status === 'timeout' ? 'Payment Timed Out' : 'Payment Request Failed'}
        subtitle={status === 'timeout' ? 'No payment confirmation received yet' : 'Could not complete the M-Pesa transaction'}
      >
        <div className="flex flex-col items-center gap-5 py-6 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
               style={{ background: 'rgba(227,30,36,0.15)', border: '1px solid rgba(227,30,36,0.4)' }}>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-lg mb-1">
              {status === 'timeout' ? 'Waiting Time Exceeded' : 'STK Push Failed'}
            </p>
            <p className="text-sm text-white/50 max-w-sm mx-auto leading-relaxed">{errorMsg}</p>
          </div>

          <div className="glass-card rounded-2xl p-4 w-full text-left">
            <div className="text-xs text-white/70 font-semibold mb-1">Did you receive an SMS with your voucher?</div>
            <p className="text-xs text-white/40 mb-3">If M-Pesa deducted your money, your voucher was sent via SMS.</p>
            <button
              onClick={() => navigate('/connect')}
              className="btn-ghost w-full text-xs flex items-center justify-center gap-2 py-2.5"
            >
              <Wifi className="w-3.5 h-3.5" /> I have an SMS voucher code →
            </button>
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
              Change Number
            </GhostButton>
          </div>
        </div>
      </StepShell>
    );
  }

  // ── Initiating / Polling / Auto-Connecting state ──────────────────────────────
  return (
    <StepShell
      step={3}
      title={status === 'success' ? 'Payment Received! 🎉' : 'Confirm M-Pesa Payment'}
      subtitle={status === 'success' ? 'Connecting your device automatically to Wi-Fi…' : `Check your phone — an M-Pesa request was sent to ${formattedPhone}`}
    >
      {/* Phone mockup & animation */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <div
            className="w-28 h-48 rounded-3xl border-2 border-white/20 flex flex-col items-center justify-center p-3 relative overflow-hidden"
            style={{ background: 'rgba(0,0,0,0.6)' }}
          >
            {/* Screen glow */}
            <div
              className="absolute inset-0 rounded-3xl transition-all duration-1000"
              style={{ background: currentStep >= 3 ? 'rgba(34,197,94,0.15)' : 'rgba(227,30,36,0.06)' }}
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
              <div className="text-[9px] text-white/40 mt-1 leading-tight">{pkg?.name}</div>
            </div>

            <div className="w-full h-px bg-white/10 my-2" />

            {/* Status indicator inside phone */}
            {status === 'success' ? (
              <div className="flex flex-col items-center">
                <CheckCircle2 className="w-5 h-5 text-green-400 mb-1" />
                <div className="text-[8px] font-bold text-green-400">PAID</div>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>

          {/* Pulse ring while waiting */}
          {status !== 'success' && (
            <div
              className="absolute inset-0 rounded-3xl animate-ping opacity-20"
              style={{ border: '2px solid #E31E24' }}
            />
          )}

          {/* STK notification badge */}
          <div
            className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-lg"
            style={{
              background: status === 'success' ? '#22c55e' : 'rgba(0,166,81,0.9)',
              boxShadow: '0 0 16px rgba(0,166,81,0.6)',
            }}
          >
            {status === 'success' ? '⚡' : '📲'}
          </div>
        </div>

        {/* Countdown / Success header */}
        <div className="mt-5 text-center">
          {status === 'success' ? (
            <div>
              <div className="text-xl font-black text-green-400 font-mono tracking-wider">
                VOUCHER: {voucherCode}
              </div>
              <div className="text-xs text-white/60 mt-1">Auto-submitting to http://ntnafro.net/login…</div>
            </div>
          ) : (
            <div>
              <div
                className="text-2xl font-black font-mono"
                style={{ color: countdown > 30 ? '#E31E24' : '#fbbf24' }}
              >
                {String(Math.floor(countdown / 60)).padStart(2, '0')}:{String(countdown % 60).padStart(2, '0')}
              </div>
              <div className="text-xs text-white/30 mt-0.5">Waiting for payment confirmation</div>
            </div>
          )}
        </div>
      </div>

      {/* Progress steps */}
      <div className="glass-card rounded-2xl p-5 mb-5 space-y-3">
        {STEPS_ANIM.map((s, i) => {
          const done = currentStep > i + 1;
          const active = currentStep === i + 1;
          return (
            <div key={s.id} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                done ? 'bg-green-500' : active ? (status === 'success' ? 'bg-green-500 animate-pulse' : 'bg-red-500 animate-pulse') : 'bg-white/10'
              }`}>
                {done
                  ? <CheckCircle2 className="w-4 h-4 text-white" />
                  : active
                    ? <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                    : <div className="w-2 h-2 rounded-full bg-white/20" />}
              </div>
              <span className={`text-sm transition-colors duration-300 ${
                done ? 'text-green-400 font-medium' : active ? 'text-white font-bold' : 'text-white/25'
              }`}>
                {s.label}
              </span>
            </div>
          );
        })}

        {status === 'polling' && (
          <div className="flex items-center gap-2 pt-1 border-t border-white/5">
            <Loader2 className="w-3.5 h-3.5 text-green-400 animate-spin" />
            <span className="text-[11px] text-white/40">Checking Safaricom M-Pesa status…</span>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div
        className="rounded-2xl p-4 mb-5 text-center"
        style={{
          background: status === 'success' ? 'rgba(34,197,94,0.12)' : 'rgba(34,197,94,0.06)',
          border: '1px solid rgba(34,197,94,0.2)',
        }}
      >
        {status === 'success' ? (
          <p className="text-xs text-white/80 leading-relaxed font-medium">
            ✅ Payment received. Your voucher is active. Connecting your browser now!
          </p>
        ) : (
          <p className="text-xs text-white/60 leading-relaxed">
            📱 A pop-up appeared on your phone.<br />
            <span className="text-white/80 font-medium">Enter your M-Pesa PIN to complete payment.</span><br />
            Your Wi-Fi will connect automatically as soon as payment is confirmed.
          </p>
        )}
      </div>

      {/* Resend / wrong number */}
      {status !== 'success' && (
        <div className="flex gap-3">
          <GhostButton onClick={initiatePush} className="flex-1 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4" /> Resend Push
          </GhostButton>
          <GhostButton onClick={() => navigate('/buy/phone', { state: { package: pkg } })} className="flex-1">
            Change Number
          </GhostButton>
        </div>
      )}
    </StepShell>
  );
}
