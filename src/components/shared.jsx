// src/components/shared.jsx — Reusable layout pieces across all pages
import { useNavigate } from 'react-router-dom';
import { Wifi, ArrowLeft } from 'lucide-react';

// ── Brand Logos ────────────────────────────────────────────────────────────────
// NTN logo: 299×162 natural size → displayed at controlled height
export const NTNLogo = ({ size = 'md' }) => {
  const h = size === 'sm' ? 'h-8' : 'h-10';
  return (
    <div className="flex items-center">
      <img
        src="/ntn-logo.svg"
        alt="Next Thing Networks"
        className={`${h} w-auto object-contain`}
        style={{ maxWidth: size === 'sm' ? 120 : 150 }}
      />
    </div>
  );
};

// Afro logo: 414×162 natural size → displayed at controlled height
export const AfroLogo = ({ size = 'md' }) => {
  const h = size === 'sm' ? 'h-8' : 'h-11';
  return (
    <div className="flex items-center">
      <img
        src="/afro-logo.svg"
        alt="Most Wanted & Friends Live"
        className={`${h} w-auto object-contain`}
        style={{ maxWidth: size === 'sm' ? 140 : 180 }}
      />
    </div>
  );
};

// ── Circuit SVG overlay ────────────────────────────────────────────────────────
export const CircuitOverlay = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="circuit" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
        <path d="M10 60 H50 V10 H90" stroke="#E31E24" strokeWidth="1" fill="none"/>
        <path d="M60 110 V70 H110 V30" stroke="#E31E24" strokeWidth="1" fill="none"/>
        <circle cx="10" cy="60" r="3" fill="#E31E24"/>
        <circle cx="90" cy="10" r="3" fill="#E31E24"/>
        <circle cx="60" cy="110" r="3" fill="#E31E24"/>
        <circle cx="110" cy="30" r="3" fill="#E31E24"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#circuit)"/>
  </svg>
);

// ── Step Page Shell (shared wrapper for all /buy/* pages) ──────────────────────
export const StepShell = ({ children, step, totalSteps = 5, title, subtitle }) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-black flex flex-col" style={{ background: 'linear-gradient(160deg, #0a0005 0%, #000 50%, #05000a 100%)' }}>
      {/* Scanline */}
      <div className="scanline" />
      <CircuitOverlay />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-5 pb-3 max-w-lg mx-auto w-full">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-1.5">
          <Wifi className="w-4 h-4 text-red-500" />
          <span className="text-xs font-bold text-white/60 tracking-wider uppercase">WeAreAfro Wi-Fi</span>
        </div>
        <div className="text-xs text-white/30 font-mono">{step}/{totalSteps}</div>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 max-w-lg mx-auto w-full px-4 mb-6">
        <div className="h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${(step / totalSteps) * 100}%`, background: 'linear-gradient(90deg, #E31E24, #ff6b6b)' }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${i < step ? 'bg-red-500' : 'bg-white/15'}`} />
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="relative z-10 text-center px-4 mb-6">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-3 text-lg font-black text-white"
             style={{ background: 'linear-gradient(135deg, #E31E24, #7c0f13)', boxShadow: '0 0 20px rgba(227,30,36,0.5)' }}>
          {step}
        </div>
        <h1 className="text-xl font-black text-white mb-1">{title}</h1>
        {subtitle && <p className="text-sm text-white/45">{subtitle}</p>}
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 px-4 pb-8 max-w-lg mx-auto w-full">
        {children}
      </div>
    </div>
  );
};

// ── Reusable big red button ────────────────────────────────────────────────────
export const RedButton = ({ children, onClick, disabled, loading, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className={`btn-red w-full h-14 text-base font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {loading ? (
      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
    ) : children}
  </button>
);

// ── Ghost button ───────────────────────────────────────────────────────────────
export const GhostButton = ({ children, onClick, className = '' }) => (
  <button onClick={onClick} className={`btn-ghost w-full h-12 text-sm flex items-center justify-center gap-2 ${className}`}>
    {children}
  </button>
);
