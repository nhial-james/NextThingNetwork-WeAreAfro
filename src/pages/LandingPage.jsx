import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wifi, Zap, Shield, Crown, Clock, CheckCircle2,
  ChevronRight, Phone, Mail, ExternalLink,
  Signal, Lock, Ticket, ShoppingCart, Smartphone,
  PartyPopper, ArrowRight, Sun, Calendar,
} from 'lucide-react';
import { NTNLogo, AfroLogo, CircuitOverlay } from '../components/shared';
import { fetchPackages, PACKAGES } from '../utils/store';

const ICONS = { Clock, Zap, Crown, Sun, Calendar, Wifi };

// ── Features ────────────────────────────────────────────────────────────────────
const features = [
  { icon: Zap, title: 'Ultra-Fast Streaming', desc: 'Blazing speeds for HD video and live streaming with zero buffering.' },
  { icon: Crown, title: 'VIP Priority', desc: 'Premium lane ensures VIP ticket holders always get max bandwidth.' },
  { icon: Shield, title: 'Secure Connection', desc: 'Military-grade WPA3 encryption keeps your data private.' },
  { icon: Signal, title: 'Full Coverage', desc: 'Dense AP deployment blankets every corner of the venue.' },
];

// ── How to Buy steps ─────────────────────────────────────────────────────────────
const HOW_TO_BUY = [
  {
    step: '01',
    icon: ShoppingCart,
    title: 'Pick a Plan',
    desc: 'Choose your internet package and tap "Buy Now." Options from 3 GB Daily to 100 GB Monthly.',
    color: '#E31E24',
  },
  {
    step: '02',
    icon: Smartphone,
    title: 'Enter Your Phone Number',
    desc: "We'll send you an M-Pesa payment request directly to your Safaricom line.",
    color: '#ff6b6b',
  },
  {
    step: '03',
    icon: Lock,
    title: 'Confirm Payment',
    desc: 'Enter your M-Pesa PIN on your phone to pay securely. No card details needed.',
    color: '#f59e0b',
  },
  {
    step: '04',
    icon: Ticket,
    title: 'Get Your Voucher',
    desc: "You'll receive a unique voucher code via SMS instantly after payment.",
    color: '#34d399',
  },
  {
    step: '05',
    icon: PartyPopper,
    title: 'Connect & Enjoy!',
    desc: 'Enter your voucher code, tap Connect Now, and start browsing immediately!',
    color: '#60a5fa',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState('');
  const [loading, setLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeHowStep, setActiveHowStep] = useState(null);
  const [packagesList, setPackagesList] = useState(PACKAGES);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    fetchPackages().then((pkgs) => {
      if (pkgs && pkgs.length > 0) {
        setPackagesList(pkgs);
      }
    });
  }, []);

  const formatVoucher = (val) => {
    const clean = val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 12);
    const groups = [];
    for (let i = 0; i < clean.length; i += 4) {
      groups.push(clean.slice(i, i + 4));
    }
    return groups.join('-');
  };

  const handleVoucherChange = (e) => {
    setVoucher(formatVoucher(e.target.value));
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!voucher.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    navigate('/connect', { state: { voucher } });
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      <div className="scanline" />

      {/* ── NAVBAR ──────────────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'navbar-glass shadow-2xl' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <NTNLogo />
            <div className="hidden md:flex items-center gap-2 glass-card rounded-full px-4 py-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-white/70 font-medium">Network Online</span>
            </div>
            <AfroLogo />
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={`${import.meta.env.BASE_URL}concert-bg.jpg`} alt="We Are Afro Concert" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, rgba(0,0,5,0.5) 40%, rgba(0,0,0,0.85) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)' }} />
        </div>
        <CircuitOverlay />

        {/* Badge */}
        <div className="relative z-10 mb-6 float-anim">
          <div className="flex items-center gap-2 glass-card rounded-full px-5 py-2.5">
            <Wifi className="w-4 h-4 text-red-500" />
            <span className="text-sm font-semibold text-white tracking-wide">Official Internet Partner — We Are Afro Concert</span>
          </div>
        </div>

        {/* Headline */}
        <div className="relative z-10 text-center mb-3">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-none mb-4">
            Stay{' '}
            <span className="relative inline-block">
              <span className="relative z-10">Connected</span>
              <span className="absolute -inset-1 rounded-lg opacity-30 blur-xl" style={{ background: '#E31E24' }} />
            </span>
            <br />
            <span className="text-transparent bg-clip-text"
                  style={{ backgroundImage: 'linear-gradient(135deg, #fff 40%, #E31E24 100%)' }}>
              to the Vibe
            </span>
          </h1>
          <p className="text-base sm:text-lg text-white/70 font-light tracking-wider">
            Official Internet Partner for <span className="text-red-400 font-semibold">We Are Afro</span>
          </p>
        </div>

        {/* CTA buttons */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-3 mb-8">
          <button onClick={() => navigate('/buy')} className="btn-red px-8 py-3.5 text-base flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" /> Buy Data Now
          </button>
          <button onClick={() => document.getElementById('login-card')?.scrollIntoView({ behavior: 'smooth' })}
                  className="btn-ghost px-8 py-3.5 text-base flex items-center gap-2">
            <Ticket className="w-5 h-5" /> Enter Voucher
          </button>
        </div>

        {/* ── GUEST ACCESS VOUCHER CARD ────────────────────────────────────── */}
        <div id="login-card" className="relative z-10 w-full max-w-md">
          <div className="glass-card rounded-3xl p-6 sm:p-8 glow-pulse">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-full text-white/90"
                   style={{ background: 'rgba(227,30,36,0.18)', border: '1px solid rgba(227,30,36,0.35)' }}>
                <Ticket className="w-3.5 h-3.5 text-red-400" />
                Guest Access
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white mb-1">Wi-Fi Voucher Login</h2>
              <p className="text-xs text-white/50">Enter the voucher code sent to your phone after purchase</p>
            </div>

            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label className="block text-xs text-white/60 mb-2 font-semibold tracking-wider uppercase">
                  Voucher / Promo Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="AFRO-XXXX-XXXX"
                    className="input-field text-center text-lg sm:text-xl tracking-widest font-mono uppercase font-bold"
                    value={voucher}
                    onChange={handleVoucherChange}
                    maxLength={14}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] text-white/35 mt-2 px-1">
                  <span>Format: 12 alphanumeric characters</span>
                  <span>Instant access</span>
                </div>
              </div>

              <button
                type="submit"
                className="btn-red w-full text-base mt-2 h-12 flex items-center justify-center gap-2"
                disabled={loading || voucher.replace(/-/g, '').length < 8}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Verifying Voucher…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Wifi className="w-4 h-4" /> Connect Now
                  </span>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-white/40">Need Wi-Fi data?</span>
              <button
                onClick={() => navigate('/buy')}
                className="text-xs text-red-400 hover:text-red-300 font-semibold inline-flex items-center gap-1 transition-colors"
              >
                Buy a Data Package <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW TO BUY Wi-Fi IN SECONDS ──────────────────────────────────────── */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #000 0%, #06000d 60%, #000 100%)' }} />
        <CircuitOverlay />

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-1.5 mb-5">
              <Zap className="w-3.5 h-3.5 text-red-500" />
              <span className="text-xs font-medium text-white/70 tracking-wider uppercase">Quick Start Guide</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3">
              Buy Wi-Fi in{' '}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #E31E24, #ff6b6b)' }}>
                Seconds
              </span>
            </h2>
            <p className="text-white/45 text-sm max-w-md mx-auto">
              From picking a plan to being online — the entire process takes less than 60 seconds.
            </p>
          </div>

          {/* Steps */}
          <div className="relative">
            <div className="hidden lg:block absolute top-14 left-[10%] right-[10%] h-px"
                 style={{ background: 'linear-gradient(90deg, transparent, rgba(227,30,36,0.3), rgba(227,30,36,0.6), rgba(227,30,36,0.3), transparent)' }} />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-4">
              {HOW_TO_BUY.map((item, idx) => {
                const Icon = item.icon;
                const isActive = activeHowStep === idx;
                return (
                  <div
                    key={item.step}
                    className="flex flex-col items-center text-center group cursor-pointer"
                    onMouseEnter={() => setActiveHowStep(idx)}
                    onMouseLeave={() => setActiveHowStep(null)}
                    onClick={() => idx === 0 ? navigate('/buy') : null}
                  >
                    {/* Step number + icon */}
                    <div className={`relative z-10 w-28 h-28 rounded-2xl flex flex-col items-center justify-center mb-4 transition-all duration-300 ${isActive ? '-translate-y-2' : ''}`}
                         style={{
                           background: isActive
                             ? `linear-gradient(135deg, ${item.color}33, ${item.color}11)`
                             : 'rgba(255,255,255,0.04)',
                           border: `1px solid ${isActive ? item.color + '60' : 'rgba(255,255,255,0.08)'}`,
                           boxShadow: isActive ? `0 20px 40px ${item.color}30` : 'none',
                         }}>
                      <div className="absolute top-2 right-3 text-5xl font-black opacity-[0.08] leading-none select-none"
                           style={{ color: item.color }}>{item.step}</div>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-1 transition-all duration-300"
                           style={{ background: `${item.color}20`, border: `1px solid ${item.color}40` }}>
                        <Icon className="w-6 h-6 transition-all duration-300" style={{ color: item.color }} />
                      </div>
                      <span className="text-[10px] font-black tracking-wider text-white/30">STEP {item.step}</span>
                    </div>

                    {/* Arrow connector (mobile) */}
                    {idx < HOW_TO_BUY.length - 1 && (
                      <div className="lg:hidden flex items-center justify-center w-8 h-8 mb-2">
                        <ChevronRight className="w-5 h-5 text-white/15 rotate-90" />
                      </div>
                    )}

                    {/* Text */}
                    <h3 className={`font-bold text-sm mb-1.5 transition-colors duration-200 ${isActive ? 'text-white' : 'text-white/80'}`}>
                      {item.title}
                    </h3>
                    <p className="text-xs text-white/35 leading-relaxed max-w-[160px]">{item.desc}</p>

                    {idx === 0 && (
                      <button onClick={() => navigate('/buy')}
                              className="mt-3 text-xs font-semibold flex items-center gap-1 transition-all duration-200 hover:gap-2"
                              style={{ color: item.color }}>
                        Start here <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Big CTA */}
          <div className="mt-16 text-center">
            <button onClick={() => navigate('/buy')} className="btn-red px-10 py-4 text-lg inline-flex items-center gap-3">
              <ShoppingCart className="w-5 h-5" />
              Get Connected Now
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-xs text-white/25 mt-3">Instant activation · Powered by M-Pesa · Secure</p>
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────────────── */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #000 0%, #0a000a 50%, #000 100%)' }} />
        <CircuitOverlay />

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-1.5 mb-4">
              <Zap className="w-3.5 h-3.5 text-red-500" />
              <span className="text-xs font-medium text-white/70 tracking-wider uppercase">Data Packages</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black mb-3">
              Choose Your <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #E31E24, #ff6b6b)' }}>Connection</span>
            </h2>
            <p className="text-white/50 text-sm max-w-md mx-auto">Instant activation. Pay securely via M-Pesa.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {packagesList.map((pkg) => {
              const Icon = ICONS[pkg.icon] || Wifi;
              return (
                <div key={pkg.id}
                     className={`pricing-card glass-card rounded-3xl p-6 relative flex flex-col justify-between ${pkg.highlight ? 'ring-1 ring-red-600/60' : ''}`}
                     style={pkg.highlight ? { boxShadow: '0 0 40px rgba(227,30,36,0.2)' } : {}}>
                  <div>
                    {pkg.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full text-white"
                              style={{ background: '#E31E24', boxShadow: '0 0 16px rgba(227,30,36,0.6)' }}>{pkg.badge}</span>
                      </div>
                    )}
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                         style={{ background: 'rgba(227,30,36,0.15)', border: '1px solid rgba(227,30,36,0.3)' }}>
                      <Icon className="w-6 h-6 text-red-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-1">{pkg.name}</h3>
                    <div className="text-3xl font-black text-white mb-1">{pkg.price}</div>
                    <div className="text-xs text-white/30 mb-4">{pkg.duration}</div>
                    <div className="flex gap-3 mb-5">
                      <div className="glass-card-dark rounded-xl px-3 py-2 text-center flex-1">
                        <div className="text-xs text-white/40">Speed</div>
                        <div className="text-sm font-bold text-red-400">{pkg.speed || 'High-Speed'}</div>
                      </div>
                      <div className="glass-card-dark rounded-xl px-3 py-2 text-center flex-1">
                        <div className="text-xs text-white/40">Devices</div>
                        <div className="text-sm font-bold text-white">{pkg.devices || '1-2 Devices'}</div>
                      </div>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {(pkg.features || ['High-Speed Browsing', 'Social Media & Streaming', 'Instant SMS Voucher']).map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                          <CheckCircle2 className="w-4 h-4 text-red-500 flex-shrink-0" />{f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button onClick={() => navigate('/buy', { state: { preselect: pkg.id } })}
                          className={`w-full h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${pkg.highlight ? 'btn-red' : 'btn-ghost'}`}>
                    Buy Now <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
          <div className="mt-8 text-center">
            <p className="text-white/30 text-xs">Pay securely with <span className="text-green-400 font-semibold">M-Pesa STK Push</span> · Instant SMS voucher</p>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────────── */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #0a000a 0%, #050010 100%)' }} />
        <CircuitOverlay />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-1.5 mb-4">
              <Shield className="w-3.5 h-3.5 text-red-500" />
              <span className="text-xs font-medium text-white/70 tracking-wider uppercase">Why Choose Us</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black">
              Built for the <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #E31E24, #ff6b6b)' }}>Crowd</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.title} className="glass-card rounded-2xl p-5 hover:-translate-y-1 transition-all duration-300 group cursor-default">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                       style={{ background: 'rgba(227,30,36,0.15)', border: '1px solid rgba(227,30,36,0.3)' }}>
                    <Icon className="w-6 h-6 text-red-400" />
                  </div>
                  <h3 className="font-bold text-sm mb-2 text-white">{feat.title}</h3>
                  <p className="text-white/45 text-xs leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-14 glass-card rounded-2xl p-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[['10,000+', 'Concurrent Users'], ['99.9%', 'Uptime SLA'], ['< 5ms', 'Avg Latency'], ['WPA3', 'Encryption']].map(([val, label]) => (
              <div key={label}>
                <div className="text-2xl font-black text-transparent bg-clip-text mb-1"
                     style={{ backgroundImage: 'linear-gradient(135deg, #fff 0%, #E31E24 100%)' }}>{val}</div>
                <div className="text-xs text-white/40 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="relative py-10 px-4 border-t border-white/[0.06]">
        <div className="absolute inset-0 bg-black" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div>
              <NTNLogo />
              <p className="text-white/40 text-xs mt-3 leading-relaxed max-w-xs">Kenya's premier event Wi-Fi provider. Connecting you to the moments that matter.</p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3">Support</h4>
              <ul className="space-y-2">
                {[[Phone, '+254 700 000 000', 'tel:+254700000000'], [Mail, 'support@nextthingnetworks.co.ke', 'mailto:support@nextthingnetworks.co.ke']].map(([Icon, label, href]) => (
                  <li key={label}>
                    <a href={href} className="flex items-center gap-2 text-xs text-white/40 hover:text-red-400 transition-colors">
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />{label}
                    </a>
                  </li>
                ))}
                <li>
                  <span className="flex items-center gap-2 text-xs text-white/40">
                    <Wifi className="w-3.5 h-3.5 flex-shrink-0" />Help Desk: Near Main Stage
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3">Legal</h4>
              <ul className="space-y-2">
                {['Terms of Service', 'Privacy Policy', 'Acceptable Use Policy', 'Refund Policy'].map((link) => (
                  <li key={link}>
                    <a href="#" className="flex items-center gap-1.5 text-xs text-white/40 hover:text-red-400 transition-colors">
                      <ExternalLink className="w-3 h-3" />{link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-white/25 text-xs">© 2024 Next Thing Networks. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <AfroLogo size="sm" />
              <div className="w-px h-6 bg-white/10" />
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-white/30">Network Active</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
