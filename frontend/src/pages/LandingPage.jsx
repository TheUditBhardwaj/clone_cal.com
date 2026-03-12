import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { ArrowRight, Calendar, Clock, Video, Globe, Lock, Code, Layers, CheckCircle } from 'lucide-react';

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

/* ─── animated number counter ─── */
function Counter({ to, suffix = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      let start = 0;
      const step = () => {
        start += Math.ceil(to / 60);
        if (start >= to) { el.textContent = to + suffix; return; }
        el.textContent = start + suffix;
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      io.disconnect();
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [to, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}

const LOGOS = ['coinbase', 'Storyblok', 'AngelList', 'Raycast', 'Vercel', 'Supabase', 'Udemy', 'Rho', 'Deel', 'Framer'];

export default function LandingPage() {
  useReveal();

  return (
    <>
      {/* Global animation styles */}
      <style>{`
        @keyframes fade-up   { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fade-in   { from { opacity:0; } to { opacity:1; } }
        @keyframes float     { 0%,100% { transform:translateY(0px);  } 50% { transform:translateY(-12px); } }
        @keyframes marquee   { from { transform:translateX(0); } to { transform:translateX(-50%); } }
        @keyframes gradient  { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
        @keyframes ping-slow { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.4; transform:scale(1.3); } }

        .hero-badge    { animation: fade-up .6s .1s both ease-out; }
        .hero-h1       { animation: fade-up .7s .25s both ease-out; }
        .hero-sub      { animation: fade-up .7s .4s both ease-out; }
        .hero-btns     { animation: fade-up .7s .55s both ease-out; }
        .hero-note     { animation: fade-up .6s .7s both ease-out; }
        .hero-visual   { animation: fade-in .9s .3s both ease-out, float 6s 1.2s ease-in-out infinite; }

        .reveal        { opacity:0; transform:translateY(28px); transition: opacity .7s ease, transform .7s ease; }
        .reveal.visible { opacity:1; transform:none; }

        .stagger-1 { transition-delay:.05s; }
        .stagger-2 { transition-delay:.15s; }
        .stagger-3 { transition-delay:.25s; }
        .stagger-4 { transition-delay:.35s; }
        .stagger-5 { transition-delay:.45s; }
        .stagger-6 { transition-delay:.55s; }
        .stagger-7 { transition-delay:.65s; }
        .stagger-8 { transition-delay:.75s; }

        .marquee-track { display:flex; width:max-content; animation: marquee 22s linear infinite; }
        .marquee-track:hover { animation-play-state:paused; }

        .gradient-text {
          background: linear-gradient(270deg,#6d28d9,#2563eb,#059669,#6d28d9);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradient 6s ease infinite;
        }

        .glow-btn:hover { box-shadow: 0 0 30px rgba(109,40,217,.45); }
        .card-hover { transition: transform .3s ease, box-shadow .3s ease; }
        .card-hover:hover { transform:translateY(-6px); box-shadow:0 20px 40px rgba(0,0,0,.08); }
      `}</style>

      <div className="min-h-screen bg-white font-sans antialiased text-slate-900 overflow-x-hidden">

        {/* ── Navbar ── */}
        <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-10">
            <span className="text-2xl font-bold tracking-tight">Cal.com</span>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
              {['Solutions', 'Enterprise', 'Pricing', 'About'].map(l => (
                <button key={l} className="hover:text-slate-900 transition-colors duration-200">{l}</button>
              ))}
            </div>
          </div>
          <Link to="/admin"
            className="glow-btn px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-all duration-300 flex items-center gap-2 group">
            Get started
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </nav>

        {/* ── Hero ── */}
        <main className="max-w-7xl mx-auto px-6 pt-20 pb-28">
          <div className="flex flex-col lg:flex-row items-center gap-16">

            {/* Left */}
            <div className="flex-1 text-center lg:text-left">
              <div className="hero-badge inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-600 mb-6 cursor-default">
                <span className="bg-white px-1.5 py-0.5 rounded shadow-sm text-[10px]">NEW</span>
                Cal.com clone v1 launches →
              </div>

              <h1 className="hero-h1 text-5xl md:text-[5.5rem] font-bold tracking-tight leading-[1.05] mb-8">
                The <span className="gradient-text">better</span> way to schedule your meetings
              </h1>

              <p className="hero-sub text-lg text-slate-500 mb-10 max-w-2xl leading-relaxed">
                A fully customizable scheduling platform for individuals, businesses, and developers who need powerful booking workflows.
              </p>

              <div className="hero-btns flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link to="/admin"
                  className="glow-btn w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-base hover:bg-slate-800 transition-all duration-300 flex items-center justify-center gap-2 group">
                  Get started for free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
                <button className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-xl font-bold text-base hover:bg-slate-50 hover:border-slate-300 transition-all duration-300">
                  Book a demo →
                </button>
              </div>
              <p className="hero-note mt-5 text-sm text-slate-400">No credit card required · Free forever</p>
            </div>

            {/* Right – floating calendar mock */}
            <div className="hero-visual flex-1 w-full max-w-lg hidden lg:block">
              <div className="relative">
                {/* Glow rings */}
                <div className="absolute inset-0 rounded-3xl bg-violet-100 blur-3xl opacity-50" />
                <div className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">May 2025</p>
                      <p className="font-bold text-slate-900">Schedule a meeting</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-green-50 border border-green-100 rounded-full px-3 py-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 ping-slow" style={{ animation: 'ping-slow 2s ease-in-out infinite' }} />
                      <span className="text-xs font-medium text-green-700">Available</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1.5 mt-2">
                    {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                      <div key={d} className="text-center text-[10px] font-medium text-slate-400 pb-1">{d}</div>
                    ))}
                    {[...Array(31)].map((_, i) => {
                      const special = [8, 14, 21, 22, 28].includes(i);
                      const today = i === 15;
                      return (
                        <div key={i}
                          className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-200 cursor-pointer
                            ${today ? 'bg-slate-900 text-white shadow-lg scale-110' : ''}
                            ${special && !today ? 'bg-violet-50 text-violet-700 border border-violet-200' : ''}
                            ${!today && !special ? 'text-slate-400 hover:bg-slate-50' : ''}
                          `}>
                          {i + 1}
                          {special && !today && <span className="absolute mt-5 w-1 h-1 rounded-full bg-violet-400" />}
                        </div>
                      );
                    })}
                  </div>
                  {/* Upcoming slot */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">30 min meeting</p>
                      <p className="text-[10px] text-slate-400">Next: Today at 3:00 PM</p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Scrolling logo marquee ── */}
          <div className="mt-28 reveal">
            <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest mb-8">Trusted by fast-growing companies worldwide</p>
            <div className="overflow-hidden relative">
              <div className="absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
              <div className="marquee-track">
                {[...LOGOS, ...LOGOS].map((name, i) => (
                  <div key={i} className="flex items-center justify-center mx-10 grayscale opacity-50 hover:opacity-100 hover:grayscale-0 transition-all duration-300">
                    <span className="text-xl font-black tracking-tight">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── How it works ── */}
          <div className="mt-44 text-center">
            <p className="reveal inline-block px-3 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-600 uppercase tracking-wider">
              How it works
            </p>
            <h2 className="reveal mt-4 text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Appointment scheduling, <span className="gradient-text">simplified</span>
            </h2>
            <p className="reveal text-lg text-slate-500 max-w-2xl mx-auto mb-16">
              Effortless scheduling for businesses and individuals.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { step: '01', title: 'Connect your calendar', desc: "We handle all the cross-referencing so you don't worry about double bookings.", icon: Calendar },
                { step: '02', title: 'Set your availability', desc: "Block weekends, add buffers, set timezone. We make it effortless.", icon: Clock },
                { step: '03', title: 'Choose how to meet', desc: "Video, phone, or in-person — your bookers choose what works.", icon: Video }
              ].map((item, id) => (
                <div key={id}
                  className={`reveal stagger-${id + 1} card-hover p-8 rounded-3xl bg-slate-50 border border-slate-100 text-left`}>
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-400 mb-6 shadow-sm">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-slate-500 leading-relaxed text-sm mb-8">{item.desc}</p>
                  <div className="flex justify-center pt-6 border-t border-slate-100">
                    <item.icon className="w-14 h-14 text-slate-200" strokeWidth={1} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Stats row ── */}
          <div className="mt-28 grid grid-cols-2 md:grid-cols-4 gap-8 text-center reveal">
            {[
              { value: 200, suffix: 'k+', label: 'Users worldwide' },
              { value: 50,  suffix: 'M+', label: 'Meetings scheduled' },
              { value: 65,  suffix: '+',  label: 'Languages' },
              { value: 99,  suffix: '%',  label: 'Uptime SLA' },
            ].map((s, i) => (
              <div key={i} className={`reveal stagger-${i + 1}`}>
                <p className="text-4xl font-black tracking-tight text-slate-900">
                  <Counter to={s.value} suffix={s.suffix} />
                </p>
                <p className="text-sm text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* ── Features grid ── */}
          <div className="mt-40 text-center bg-slate-50 rounded-[3.5rem] px-8 py-24 border border-slate-100">
            <h2 className="reveal text-4xl md:text-5xl font-bold tracking-tight mb-20">…and so much more!</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
              {[
                { icon: Layers, label: 'Accept payments' },
                { icon: Video,  label: 'Built-in video' },
                { icon: Code,   label: 'Short booking links' },
                { icon: Lock,   label: 'Privacy first' },
                { icon: Globe,  label: '65+ languages' },
                { icon: Layers, label: 'Easy embeds' },
                { icon: Layers, label: 'All your apps' },
                { icon: Layers, label: 'Simple customization' },
              ].map((item, id) => (
                <div key={id}
                  className={`reveal stagger-${id + 1} card-hover bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center gap-4 cursor-default`}>
                  <item.icon className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
                  <span className="text-sm font-bold text-slate-700">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── CTA ── */}
          <div className="mt-40 text-center pb-12 reveal">
            <h2 className="text-4xl font-bold mb-8 leading-snug">
              Ready to streamline<br />your meetings?
            </h2>
            <Link to="/admin"
              className="glow-btn inline-flex px-10 py-5 bg-slate-900 text-white rounded-2xl font-bold text-xl hover:bg-slate-800 transition-all duration-300 gap-4 items-center group shadow-2xl">
              Get started for free
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform duration-200" />
            </Link>
            <p className="mt-6 text-slate-400 text-sm">Join 200,000+ users · No credit card required</p>
          </div>
        </main>
      </div>
    </>
  );
}
