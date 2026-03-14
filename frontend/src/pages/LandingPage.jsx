import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { ArrowRight, Clock, MapPin, Globe, Video, Mic, MessageSquare, Monitor, MoreHorizontal, Calendar as CalendarIcon, ChevronDown, ChevronRight } from 'lucide-react';
import { OrbitingCircles } from '../components/ui/orbiting-circles';

/* ─── tiny hook: triggers .visible class when element enters viewport ─── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

const LOGOS_ROW1 = ['etScale', 'coinbase', 'storyblok', 'AngelList', 'Raycast', 'Vercel', 'Supabase'];
const LOGOS_ROW2 = ['Udemy', 'Rho', 'deel.', 'Framer', 'ramp', 'PlanetScale', 'Loom'];

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const WEEKS = [
  [null, null, null, null, 1, 2, 3],
  [4, 5, 6, 7, 8, 9, 10],
  [11, 12, 13, 14, 15, 16, 17],
  [18, 19, 20, 21, 22, 23, 24],
  [25, 26, 27, 28, 29, 30, null],
];

export default function LandingPage() {
  useReveal();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body, #root { font-family: 'Plus Jakarta Sans', sans-serif; }

        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes fade-up { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }

        .hero-badge  { animation: fade-up .5s .05s both; }
        .hero-h1     { animation: fade-up .6s .15s both; }
        .hero-sub    { animation: fade-up .6s .28s both; }
        .hero-btns   { animation: fade-up .6s .40s both; }
        .hero-note   { animation: fade-up .5s .52s both; }
        .hero-right  { animation: fade-in .8s .3s both; }

        .reveal      { opacity: 0; transform: translateY(24px); transition: opacity .65s ease, transform .65s ease; }
        .reveal.visible { opacity: 1; transform: none; }
        .s1 { transition-delay: .05s; } .s2 { transition-delay: .15s; } .s3 { transition-delay: .25s; }
        .s4 { transition-delay: .35s; } .s5 { transition-delay: .45s; }

        .marquee-wrap { overflow: hidden; position: relative; }
        .marquee-wrap::before, .marquee-wrap::after {
          content: ''; position: absolute; top: 0; height: 100%; width: 80px; z-index: 2; pointer-events: none;
        }
        .marquee-wrap::before { left: 0; background: linear-gradient(to right, #f4f4f5, transparent); }
        .marquee-wrap::after  { right: 0; background: linear-gradient(to left, #f4f4f5, transparent); }
        .marquee-track { display: flex; width: max-content; animation: marquee 28s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }

        .pill-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 999px; border: 1px solid #e5e7eb;
          background: #fff; font-size: 12px; font-weight: 600; color: #374151; cursor: pointer;
          transition: background .2s;
        }
        .pill-btn:hover { background: #f9fafb; }

        .dur-pill {
          padding: 5px 12px; border-radius: 6px; font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all .15s;
        }
        .dur-pill.active { background: #111827; color: #fff; }
        .dur-pill.inactive { background: transparent; color: #6b7280; }
        .dur-pill.inactive:hover { background: #f3f4f6; }

        .cal-date {
          width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
          border-radius: 8px; font-size: 14px; cursor: pointer; position: relative; transition: background .15s;
        }
        .cal-date.avail  { background: #f3f4f6; font-weight: 500; color: #111827; }
        .cal-date.avail:hover { background: #e5e7eb; }
        .cal-date.selected { background: #111827; color: #fff; font-weight: 700; border-radius: 10px; }
        .cal-date.today-dot::after {
          content: ''; position: absolute; bottom: 3px; left: 50%; transform: translateX(-50%);
          width: 4px; height: 4px; border-radius: 50%; background: #111827;
        }
        .cal-date.selected.today-dot::after { background: #fff; }
        .cal-date.empty { cursor: default; }

        .step-badge {
          display: inline-flex; align-items: center; justify-content: center;
          width: 36px; height: 36px; border-radius: 10px; background: #f3f4f6;
          font-size: 13px; font-weight: 700; color: #6b7280;
        }

        .feature-card { border: 1px solid #e5e7eb; border-radius: 20px; background: #fff; padding: 28px; overflow: hidden; }
        .feature-card h3 { font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 10px; }
        .feature-card p  { font-size: 14px; color: #6b7280; line-height: 1.6; }

        .main-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 22px; border-radius: 10px; font-size: 15px; font-weight: 700;
          cursor: pointer; transition: all .2s; text-decoration: none;
        }
        .main-btn.dark  { background: #111827; color: #fff; border: none; }
        .main-btn.dark:hover  { background: #1f2937; }
        .main-btn.light { background: #fff; color: #111827; border: 1px solid #e5e7eb; }
        .main-btn.light:hover { background: #f9fafb; }

        .avail-row {
          display: flex; align-items: center; gap: 10px; padding: 8px 0;
          border-bottom: 1px solid #f3f4f6; font-size: 13px;
        }
        .toggle { width: 36px; height: 20px; border-radius: 999px; position: relative; flex-shrink: 0; cursor: pointer; }
        .toggle.on  { background: #111827; }
        .toggle.off { background: #d1d5db; }
        .toggle::after {
          content: ''; position: absolute; top: 2px; width: 16px; height: 16px; border-radius: 50%; background: #fff;
          transition: left .15s;
        }
        .toggle.on::after  { left: 18px; }
        .toggle.off::after { left: 2px; }
        .time-input {
          padding: 4px 10px; border: 1px solid #e5e7eb; border-radius: 6px;
          font-size: 12px; font-weight: 500; color: #374151; background: #fff;
        }

        .notice-select {
          width: 100%; padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 8px;
          font-size: 14px; font-weight: 500; color: #374151; background: #fff;
          appearance: none; cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 12px center;
        }

        .hero-card { background: #fff; border-radius: 20px; border: 1px solid #e5e7eb; padding: 24px; }

        .star-trustpilot { color: #00b67a; }
        .star-ph  { color: #ff6154; }
        .star-g2  { color: #ff492c; }

        .review-badge {
          display: flex; align-items: center; gap: 8px; padding: 10px 16px;
          border: 1px solid #e5e7eb; border-radius: 12px; background: #fff;
        }

        .meet-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: #f3f4f6; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#f4f4f5', fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#111827', overflowX: 'hidden' }}>

        {/* ── Navbar ── */}
        <header style={{ position: 'sticky', top: 0, zIndex: 50, background: '#f4f4f5', borderBottom: '1px solid #e5e7eb', padding: '12px 40px' }}>
          <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
              <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px', color: '#111827' }}>Cal.com</span>
              <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                {[
                  { text: 'Solutions', drop: true },
                  { text: 'Enterprise', drop: false },
                  { text: 'Cal.ai', drop: false },
                  { text: 'Developer', drop: true },
                  { text: 'Resources', drop: true },
                  { text: 'Pricing', drop: false }
                ].map(l => (
                  <button key={l.text} style={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 500, color: '#4b5563', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}
                    onMouseEnter={e => e.target.style.color = '#111827'}
                    onMouseLeave={e => e.target.style.color = '#4b5563'}>
                    {l.text}
                    {l.drop && <ChevronDown size={12} strokeWidth={2.5} style={{ opacity: 0.5 }} />}
                  </button>
                ))}
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginLeft: 'auto' }}>
              <button style={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 500, color: '#111827', cursor: 'pointer', fontFamily: 'inherit' }}>Sign in</button>
              <Link to="/admin" style={{ background: '#292929', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit', textDecoration: 'none' }}>
                Get started <ChevronRight size={14} strokeWidth={3} />
              </Link>
            </div>
          </div>
        </header>

        {/* ── Hero ── */}
        <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 0' }}>
          <div style={{ background: '#fff', borderRadius: 24, padding: '56px 48px', display: 'flex', gap: 48, alignItems: 'center', border: '1px solid #e5e7eb', boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>

            {/* Left */}
            <div style={{ flex: '1 1 460px', minWidth: 0 }}>
              <div className="hero-badge pill-btn" style={{ marginBottom: 24 }}>
                CloneCal launches v1.0 <ArrowRight size={12} />
              </div>

              <h1 className="hero-h1" style={{ fontSize: 'clamp(40px,5vw,68px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-2px', marginBottom: 20, color: '#111827' }}>
                The better way to schedule your meetings
              </h1>

              <p className="hero-sub" style={{ fontSize: 16, color: '#6b7280', lineHeight: 1.65, marginBottom: 28, maxWidth: 460 }}>
                A fully customizable scheduling software for individuals, businesses taking calls and developers building scheduling platforms.
              </p>

              <div className="hero-btns" style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 380 }}>
                {/* Google button */}
                <Link to="/admin" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '14px 20px', background: '#111827', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Get started for free
                </Link>
                <Link to="/admin" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 20px', background: '#fff', color: '#111827', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none' }}>
                  Sign up with email <ArrowRight size={14} />
                </Link>
              </div>

              <p className="hero-note" style={{ marginTop: 14, fontSize: 13, color: '#9ca3af' }}>No credit card required</p>
            </div>

            {/* Right – booking widget */}
            <div className="hero-right" style={{ flex: '0 0 auto', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              {/* Booking info card */}
              <div className="hero-card" style={{ width: 260 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#c084fc,#818cf8)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>Denise Wilson</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>Property Viewing</div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.55, marginBottom: 16 }}>
                  Tour your potential dream home with our experienced real estate professionals.
                </p>
                {/* Duration pills */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                  {['15m','30m','45m','1h'].map(d => (
                    <span key={d} className={`dur-pill ${d === '45m' ? 'active' : 'inactive'}`}>{d}</span>
                  ))}
                </div>
                <div style={{ fontSize: 13, color: '#374151', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MapPin size={14} color="#6b7280" /> Pine Realty Office
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Globe size={14} color="#6b7280" /> Australia/Sydney ▾
                  </div>
                </div>
              </div>

              {/* Calendar card */}
              <div className="hero-card" style={{ width: 280 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: 16, fontWeight: 700 }}>May <span style={{ color: '#6b7280', fontWeight: 400 }}>2025</span></span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 6 }}>
                  {DAYS.map(d => (
                    <div key={d} style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textAlign: 'center', paddingBottom: 6 }}>{d.slice(0,3)}</div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
                  {WEEKS.flat().map((date, i) => {
                    if (!date) return <div key={i} className="cal-date empty" />;
                    const isSelected = date === 21;
                    const isToday = date === 15;
                    const isAvail = [6,7,8,13,14,15,16,20,21,22,23,27,28,29,30].includes(date);
                    return (
                      <div key={i}
                        className={`cal-date ${isSelected ? 'selected' : isAvail ? 'avail' : ''} ${isToday ? 'today-dot' : ''}`}
                        style={{ margin: '1px auto', color: isSelected ? '#fff' : isAvail ? '#111827' : '#d1d5db' }}>
                        {date}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ── Review badges ── */}
          <div style={{ display: 'flex', gap: 16, marginTop: 20, justifyContent: 'flex-end' }}>
            <div className="review-badge">
              {'★★★★½'.split('').map((s, i) => <span key={i} className="star-trustpilot" style={{ fontSize: 18 }}>★</span>)}
              <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 4 }}>Trustpilot</span>
            </div>
            <div className="review-badge">
              {'★★★★★'.split('').map((s, i) => <span key={i} className="star-ph" style={{ fontSize: 18 }}>★</span>)}
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#ff6154', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 800 }}>P</div>
            </div>
            <div className="review-badge">
              {'★★★★½'.split('').map((s, i) => <span key={i} className="star-g2" style={{ fontSize: 18 }}>★</span>)}
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#ff492c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 800 }}>G</div>
            </div>
          </div>

          {/* ── Logo marquee ── */}
          <div style={{ marginTop: 40, marginBottom: 8 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', marginBottom: 16 }}>Trusted by fast-growing companies around the world</p>
            <div className="marquee-wrap">
              <div className="marquee-track">
                {[...LOGOS_ROW1, ...LOGOS_ROW1].map((name, i) => (
                  <span key={i} style={{ marginRight: 56, fontSize: 16, fontWeight: 800, color: '#9ca3af', whiteSpace: 'nowrap', letterSpacing: '-0.3px' }}>{name}</span>
                ))}
              </div>
            </div>
            <div className="marquee-wrap" style={{ marginTop: 10 }}>
              <div className="marquee-track" style={{ animationDirection: 'reverse', animationDuration: '24s' }}>
                {[...LOGOS_ROW2, ...LOGOS_ROW2].map((name, i) => (
                  <span key={i} style={{ marginRight: 56, fontSize: 16, fontWeight: 800, color: '#9ca3af', whiteSpace: 'nowrap', letterSpacing: '-0.3px' }}>{name}</span>
                ))}
              </div>
            </div>
          </div>

          {/* ── How it works ── */}
          <div style={{ marginTop: 80, textAlign: 'center' }}>
            <div className="reveal pill-btn" style={{ margin: '0 auto 20px' }}>
              🔁 How it works
            </div>
            <h2 className="reveal" style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 14 }}>
              With us, appointment scheduling is easy
            </h2>
            <p className="reveal" style={{ fontSize: 16, color: '#6b7280', maxWidth: 540, margin: '0 auto 12px', lineHeight: 1.65 }}>
              Effortless scheduling for business and individuals, powerful solutions for fast-growing modern companies.
            </p>
            <div className="reveal" style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 44 }}>
              <Link to="/admin" className="main-btn dark" style={{ textDecoration: 'none' }}>Get started <ArrowRight size={15} /></Link>
              <button className="main-btn light">Book a demo <ArrowRight size={15} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {/* Card 01 */}
              <div className="reveal s1 feature-card" style={{ textAlign: 'left' }}>
                <span className="step-badge" style={{ marginBottom: 20, display: 'inline-flex' }}>01</span>
                <h3>Connect your calendar</h3>
                <p>We'll handle all the cross-referencing, so you don't have to worry about double bookings.</p>
                <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 180, position: 'relative' }}>
                  {/* Central Node */}
                  <div style={{ 
                    width: 90, height: 90, borderRadius: '50%', border: '2px solid #e5e7eb', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    fontSize: 14, fontWeight: 800, color: '#111827', background: '#fff', 
                    boxShadow: '0 4px 12px rgba(0,0,0,.08)', position: 'relative', zIndex: 10 
                  }}>
                    Cal.com
                  </div>

                  {/* Inner Orbit */}
                  <OrbitingCircles radius={60} duration={20}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,.1)', border: '1px solid #f3f4f6' }}>
                      <CalendarIcon size={14} className="text-red-400" />
                    </div>
                  </OrbitingCircles>
                  <OrbitingCircles radius={60} duration={20} delay={10}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,.1)', border: '1px solid #f3f4f6' }}>
                      <CalendarIcon size={14} className="text-blue-400" />
                    </div>
                  </OrbitingCircles>

                  {/* Outer Orbit */}
                  <OrbitingCircles radius={95} duration={30} reverse>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,.1)', border: '1px solid #f3f4f6' }}>
                      <CalendarIcon size={14} className="text-green-400" />
                    </div>
                  </OrbitingCircles>
                </div>
              </div>

              {/* Card 02 */}
              <div className="reveal s2 feature-card" style={{ textAlign: 'left' }}>
                <span className="step-badge" style={{ marginBottom: 20, display: 'inline-flex' }}>02</span>
                <h3>Set your availability</h3>
                <p>Want to block off weekends? Set up any buffers? We make that easy.</p>
                <div style={{ marginTop: 24 }}>
                  {[
                    { day: 'Mon', on: true,  from: '8:30 am', to: '5:00 pm' },
                    { day: 'Tue', on: false, from: '9:00 am', to: '6:30 pm' },
                    { day: 'Wed', on: true,  from: '10:00 am', to: '7:00 pm' },
                  ].map(r => (
                    <div key={r.day} className="avail-row">
                      <div className={`toggle ${r.on ? 'on' : 'off'}`} />
                      <span style={{ width: 28, fontSize: 13, fontWeight: 600, color: r.on ? '#111827' : '#9ca3af' }}>{r.day}</span>
                      <span className="time-input">{r.from}</span>
                      <span style={{ color: '#9ca3af', fontSize: 12 }}>–</span>
                      <span className="time-input">{r.to}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 03 */}
              <div className="reveal s3 feature-card" style={{ textAlign: 'left' }}>
                <span className="step-badge" style={{ marginBottom: 20, display: 'inline-flex' }}>03</span>
                <h3>Choose how to meet</h3>
                <p>It could be a video chat, phone call, or a walk in the park!</p>
                <div style={{ marginTop: 28, background: '#f9fafb', borderRadius: 14, border: '1px solid #f0f0f0', padding: '12px', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                    {['#e5e7eb','#e5e7eb','#e5e7eb'].map((c,i)=><div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />)}
                  </div>
                  <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 12 }}>
                    {[0,1].map(i => (
                      <div key={i} style={{ width: 60, height: 60, borderRadius: '50%', background: '#d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="#9ca3af"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                    {[<Video size={14}/>, <Mic size={14}/>, <MessageSquare size={14}/>, <Monitor size={14}/>, <MoreHorizontal size={14}/>].map((icon,i) => (
                      <div key={i} className="meet-icon">{icon}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Benefits ── */}
          <div style={{ marginTop: 80, textAlign: 'center' }}>
            <div className="reveal pill-btn" style={{ margin: '0 auto 20px' }}>
              🎁 Benefits
            </div>
            <h2 className="reveal" style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 14 }}>
              Your all-purpose scheduling app
            </h2>
            <p className="reveal" style={{ fontSize: 16, color: '#6b7280', maxWidth: 480, margin: '0 auto 12px', lineHeight: 1.65 }}>
              Discover a variety of our advanced features. Unlimited and free for individuals.
            </p>
            <div className="reveal" style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 44 }}>
              <button className="main-btn dark">Get started <ArrowRight size={15} /></button>
              <button className="main-btn light">Book a demo <ArrowRight size={15} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Benefit 1 */}
              <div className="reveal s1 feature-card" style={{ textAlign: 'left' }}>
                <h3>Avoid meeting overload</h3>
                <p>Only get booked when you want to. Set daily, weekly or monthly limits and add buffers around your events to allow you to focus or take a break.</p>
                <div style={{ marginTop: 24, border: '1px solid #e5e7eb', borderRadius: 14, padding: '20px', background: '#fafafa' }}>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Notice and buffers</div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>Minimum notice</div>
                    <select className="notice-select"><option>3 hours</option></select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>Buffer before event</div>
                      <select className="notice-select"><option>15 mins</option></select>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>Buffer after event</div>
                      <select className="notice-select"><option>15 mins</option></select>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>Time-slot intervals</div>
                    <select className="notice-select"><option>15 mins</option></select>
                  </div>
                </div>
              </div>

              {/* Benefit 2 */}
              <div className="reveal s2 feature-card" style={{ textAlign: 'left' }}>
                <h3>Stand out with a custom booking link</h3>
                <p>Customize your booking link so it's short and easy to remember for your bookers. No more long, complicated links one can easily forget.</p>
                <div style={{ marginTop: 24 }}>
                  <div style={{ display: 'inline-block', padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 14 }}>cal.com/ewa</div>
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: 14, padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#a78bfa,#6366f1)', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 11, color: '#6b7280' }}>Ewa Michalak</div>
                        <div style={{ fontSize: 15, fontWeight: 800 }}>Marketing Strategy Session</div>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5, marginBottom: 12 }}>Let's collaborate on campaigns, co-marketing opportunities, and learn how Cal.com is approaching growth and brand.</p>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                      {['15m','30m','45m','1h'].map(d => (
                        <span key={d} className={`dur-pill ${d === '30m' ? 'active' : 'inactive'}`} style={{ fontSize: 12, padding: '4px 10px' }}>{d}</span>
                      ))}
                    </div>
                    <div style={{ fontSize: 12, color: '#374151', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 14 }}>📹</span> Google Meet
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Globe size={12} color="#6b7280" /> Europe/Warsaw ▾
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefit 3 */}
              <div className="reveal s3 feature-card" style={{ textAlign: 'left' }}>
                <h3>Streamline your bookers' experience</h3>
                <p>Let your bookers overlay their calendar, receive booking confirmations via text or email, get events added to their calendar, and allow them to reschedule with ease.</p>
              </div>

              {/* Benefit 4 */}
              <div className="reveal s4 feature-card" style={{ textAlign: 'left' }}>
                <h3>Reduce no-shows with automated meeting reminders</h3>
                <p>Easily send sms or meeting reminder emails about bookings, and send automated follow-ups to gather any relevant information before the meeting.</p>
              </div>
            </div>
          </div>

          {/* ── CTA ── */}
          <div style={{ marginTop: 80, textAlign: 'center', paddingBottom: 80 }}>
            <div className="reveal" style={{ background: '#fff', borderRadius: 24, border: '1px solid #e5e7eb', padding: '56px 48px' }}>
              <h2 style={{ fontSize: 'clamp(28px,3.5vw,44px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: 12 }}>
                Ready to streamline your meetings?
              </h2>
              <p style={{ fontSize: 16, color: '#6b7280', marginBottom: 28 }}>Join 200,000+ users. No credit card required.</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                <button className="main-btn dark" style={{ fontSize: 16, padding: '14px 28px' }}>Get started for free <ArrowRight size={16} /></button>
                <button className="main-btn light" style={{ fontSize: 16, padding: '14px 28px' }}>Book a demo <ArrowRight size={16} /></button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}