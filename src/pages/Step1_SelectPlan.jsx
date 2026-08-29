// src/pages/Step1_SelectPlan.jsx — Pick a plan (live API)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wifi, Sun, Calendar, Crown, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { StepShell, RedButton } from '../components/shared';
import { fetchPackages } from '../utils/store';

const ICONS = { Wifi, Sun, Calendar, Crown };

export default function Step1SelectPlan() {
  const navigate = useNavigate();
  const [packages, setPackages]   = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [error,    setError]      = useState(null);

  const loadPackages = async () => {
    setLoading(true);
    setError(null);
    try {
      const pkgs = await fetchPackages();
      setPackages(pkgs);
    } catch (err) {
      setError(err.message || 'Failed to load packages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPackages(); }, []);

  const handleSelect = (pkg) => {
    navigate('/buy/phone', { state: { package: pkg } });
  };

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <StepShell step={1} title="Pick a Plan" subtitle="Fetching available packages…">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-5 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/10" />
                  <div className="space-y-2">
                    <div className="h-4 w-28 rounded bg-white/10" />
                    <div className="h-3 w-20 rounded bg-white/5" />
                  </div>
                </div>
                <div className="h-6 w-16 rounded bg-white/10" />
              </div>
              <div className="mt-4 flex gap-2">
                <div className="h-6 w-20 rounded-full bg-white/10" />
                <div className="h-6 w-24 rounded-full bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      </StepShell>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────────
  if (error) {
    return (
      <StepShell step={1} title="Pick a Plan" subtitle="Choose your internet package">
        <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center"
               style={{ background: 'rgba(227,30,36,0.15)', border: '1px solid rgba(227,30,36,0.3)' }}>
            <AlertCircle className="w-7 h-7 text-red-400" />
          </div>
          <div>
            <p className="text-white font-semibold mb-1">Could not load packages</p>
            <p className="text-sm text-white/40">{error}</p>
          </div>
          <RedButton onClick={loadPackages} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Try Again
          </RedButton>
        </div>
      </StepShell>
    );
  }

  // ── Packages loaded ──────────────────────────────────────────────────────────
  return (
    <StepShell
      step={1}
      title="Pick a Plan"
      subtitle="Choose the internet package that fits your vibe"
    >
      <div className="space-y-4">
        {packages.map((pkg) => {
          const Icon = ICONS[pkg.icon] || Wifi;
          return (
            <button
              key={pkg.id}
              onClick={() => handleSelect(pkg)}
              className="w-full text-left group"
            >
              <div
                className={`glass-card rounded-2xl p-5 transition-all duration-300 group-hover:-translate-y-0.5 ${
                  pkg.highlight ? 'ring-1 ring-red-600/60' : ''
                }`}
                style={pkg.highlight ? { boxShadow: '0 0 30px rgba(227,30,36,0.2)' } : {}}
              >
                {/* Badge */}
                {pkg.badge && (
                  <div className="inline-flex items-center gap-1 text-[10px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full text-white mb-3"
                       style={{ background: '#E31E24', boxShadow: '0 0 10px rgba(227,30,36,0.5)' }}>
                    {pkg.badge}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  {/* Left: icon + name */}
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                         style={{ background: 'rgba(227,30,36,0.15)', border: '1px solid rgba(227,30,36,0.3)' }}>
                      <Icon className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-base">{pkg.name}</div>
                      <div className="text-xs text-white/40">{pkg.duration}</div>
                    </div>
                  </div>

                  {/* Right: price + arrow */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xl font-black text-white">{pkg.price}</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-red-400 transition-colors" />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Trust signals */}
      <div className="mt-6 flex items-center justify-center gap-6 text-xs text-white/25">
        <span>✓ Instant activation</span>
        <span>✓ Secure M-Pesa payment</span>
        <span>✓ No contract</span>
      </div>
    </StepShell>
  );
}
