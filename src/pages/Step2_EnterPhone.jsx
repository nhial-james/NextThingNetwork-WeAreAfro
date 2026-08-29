// src/pages/Step2_EnterPhone.jsx — Enter M-Pesa phone number
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Phone, ShieldCheck, Info } from 'lucide-react';
import { StepShell, RedButton } from '../components/shared';

export default function Step2EnterPhone() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const pkg = state?.package;

  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const formatPhone = (val) => {
    // Strip non-digits
    const digits = val.replace(/\D/g, '');
    // Normalize: if starts with 0, replace with 254
    let normalized = digits;
    if (digits.startsWith('0')) normalized = '254' + digits.slice(1);
    if (digits.startsWith('7') || digits.startsWith('1')) normalized = '254' + digits;
    return digits; // show raw but validate normalized
  };

  const handleChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
    setPhone(raw);
    setError('');
  };

  const displayPhone = () => {
    if (!phone) return '';
    if (phone.startsWith('254')) return '+' + phone.slice(0, 3) + ' ' + phone.slice(3, 6) + ' ' + phone.slice(6, 9) + ' ' + phone.slice(9);
    if (phone.startsWith('0')) return phone.slice(0, 4) + ' ' + phone.slice(4, 7) + ' ' + phone.slice(7);
    return phone;
  };

  const isValid = () => {
    const d = phone;
    if (d.startsWith('254') && d.length === 12) return true;
    if (d.startsWith('07') && d.length === 10) return true;
    if (d.startsWith('01') && d.length === 10) return true;
    if ((d.startsWith('7') || d.startsWith('1')) && d.length === 9) return true;
    return false;
  };

  const handleSubmit = () => {
    if (!isValid()) {
      setError('Please enter a valid Safaricom/M-Pesa number');
      return;
    }
    let normalized = phone;
    if (phone.startsWith('0')) normalized = '254' + phone.slice(1);
    if (phone.startsWith('7') || phone.startsWith('1')) normalized = '254' + phone;
    navigate('/buy/payment', { state: { package: pkg, phone: normalized } });
  };

  return (
    <StepShell
      step={2}
      title="Enter Your Phone Number"
      subtitle="We'll send an M-Pesa payment request to this number"
    >
      {/* Selected plan summary */}
      {pkg && (
        <div className="glass-card rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div>
            <div className="text-xs text-white/40 mb-0.5">Selected Plan</div>
            <div className="font-bold text-white">{pkg.name}</div>
            <div className="text-xs text-white/50">{pkg.duration} · {pkg.speed}</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-white">{pkg.price}</div>
            <div className="text-xs text-white/30">{pkg.usd}</div>
          </div>
        </div>
      )}

      {/* Phone input */}
      <div className="glass-card rounded-2xl p-5 mb-4">
        <label className="block text-xs text-white/40 uppercase tracking-widest mb-3 font-semibold">
          M-Pesa Number
        </label>
        <div className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${error ? 'border border-red-500/60' : 'border border-white/10 focus-within:border-red-500/60'}`}
             style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-lg">🇰🇪</span>
            <span className="text-white/50 text-sm font-mono">+254</span>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <input
            type="tel"
            inputMode="numeric"
            placeholder="7XX XXX XXX"
            className="flex-1 bg-transparent text-white font-mono text-lg placeholder-white/20 focus:outline-none"
            value={phone}
            onChange={handleChange}
            autoFocus
          />
          {phone.length > 0 && (
            <Phone className={`w-4 h-4 flex-shrink-0 ${isValid() ? 'text-green-400' : 'text-white/20'}`} />
          )}
        </div>

        {error && (
          <div className="flex items-center gap-1.5 mt-2.5 text-xs text-red-400">
            <Info className="w-3.5 h-3.5" /> {error}
          </div>
        )}

        {/* Quick-dial shortcuts */}
        <div className="mt-4">
          <div className="text-xs text-white/30 mb-2">Quick fill (for demo):</div>
          <div className="flex gap-2">
            {['0712345678', '0723456789', '0734567890'].map((n) => (
              <button
                key={n}
                onClick={() => { setPhone(n); setError(''); }}
                className="text-xs px-3 py-1.5 rounded-lg text-white/40 hover:text-white/70 transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Security notice */}
      <div className="flex items-start gap-3 rounded-xl p-3.5 mb-6"
           style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.15)' }}>
        <ShieldCheck className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-white/50 leading-relaxed">
          Your number is used <span className="text-white/70 font-medium">only for this payment</span>. 
          We never store personal data. M-Pesa PIN is entered on your phone — not here.
        </p>
      </div>

      <RedButton onClick={handleSubmit} disabled={!isValid()}>
        <Phone className="w-5 h-5" />
        Send M-Pesa Request
      </RedButton>
    </StepShell>
  );
}
