// src/pages/Step1_SelectPlan.jsx — Pick a plan
import { useNavigate } from 'react-router-dom';
import { Clock, Zap, Crown, CheckCircle2, ChevronRight } from 'lucide-react';
import { StepShell, RedButton } from '../components/shared';
import { PACKAGES } from '../utils/store';

const ICONS = { Clock, Zap, Crown };

export default function Step1SelectPlan() {
  const navigate = useNavigate();

  const handleSelect = (pkg) => {
    navigate('/buy/phone', { state: { package: pkg } });
  };

  return (
    <StepShell
      step={1}
      title="Pick a Plan"
      subtitle="Choose the internet package that fits your vibe"
    >
      <div className="space-y-4">
        {PACKAGES.map((pkg) => {
          const Icon = ICONS[pkg.icon];
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
                      <div className="text-xs text-white/40">{pkg.duration} · {pkg.devices}</div>
                    </div>
                  </div>

                  {/* Right: price + arrow */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xl font-black text-white">{pkg.price}</div>
                      <div className="text-[10px] text-white/30">{pkg.usd}</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-red-400 transition-colors" />
                  </div>
                </div>

                {/* Speed + features inline */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold text-red-400"
                        style={{ background: 'rgba(227,30,36,0.12)', border: '1px solid rgba(227,30,36,0.2)' }}>
                    ⚡ {pkg.speed}
                  </span>
                  {pkg.features.slice(0, 3).map((f) => (
                    <span key={f} className="text-xs px-2.5 py-1 rounded-full text-white/50"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Trust signals */}
      <div className="mt-6 flex items-center justify-center gap-6 text-xs text-white/25">
        <span>✓ Instant activation</span>
        <span>✓ Secure payment</span>
        <span>✓ No contract</span>
      </div>
    </StepShell>
  );
}
