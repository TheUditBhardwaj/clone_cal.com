import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventTypes, getAvailableSlots, createBooking } from '../api';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isBefore, isToday, isSameDay, isSameMonth } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, Globe, CheckCircle, Video, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Full Calendar ─── */
function Calendar({ selectedDate, onSelect, eventType }) {
  const [viewMonth, setViewMonth] = useState(startOfMonth(new Date()));
  const [direction, setDirection] = useState(0);

  const start = startOfWeek(startOfMonth(viewMonth));
  const end = endOfWeek(endOfMonth(viewMonth));
  const days = eachDayOfInterval({ start, end });
  const today = new Date();

  const changeMonth = (offset) => {
    setDirection(offset);
    setViewMonth(p => offset > 0 ? addMonths(p, 1) : subMonths(p, 1));
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 20 : -20,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 20 : -20,
      opacity: 0
    })
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>
          {format(viewMonth, 'MMMM yyyy')}
        </h2>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => changeMonth(-1)}
            style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e5e5e5', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => changeMonth(1)}
            style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e5e5e5', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#888', paddingBottom: 6 }}>{d}</div>
        ))}
      </div>
      
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={viewMonth.toISOString()}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}
          >
            {days.map((day) => {
              const past = isBefore(day, startOfMonth(today)) && !isSameMonth(day, today) || (isBefore(day, today) && !isToday(day));
              const outOfMonth = !isSameMonth(day, viewMonth);
              const selected = selectedDate && isSameDay(day, selectedDate);
              const current = isToday(day);
              return (
                <motion.button 
                  key={day.toISOString()} 
                  disabled={past || outOfMonth}
                  onClick={() => onSelect(day)}
                  whileHover={!(past || outOfMonth) ? { scale: 1.05, backgroundColor: selected ? '#1a1a1a' : '#f5f5f5' } : {}}
                  whileTap={!(past || outOfMonth) ? { scale: 0.95 } : {}}
                  style={{
                    aspectRatio: '1', borderRadius: 8, border: 'none', cursor: past || outOfMonth ? 'default' : 'pointer',
                    background: selected ? '#1a1a1a' : current ? '#f5f5f5' : 'transparent',
                    color: selected ? '#fff' : outOfMonth ? '#ccc' : past ? '#ccc' : '#1a1a1a',
                    fontWeight: selected || current ? 700 : 400,
                    fontSize: 13,
                    outline: current && !selected ? '2px solid #1a1a1a' : 'none',
                    outlineOffset: -2,
                    position: 'relative'
                  }}
                >
                  {format(day, 'd')}
                  {selected && (
                    <motion.div 
                      layoutId="activeDay"
                      style={{ position: 'absolute', inset: 0, borderRadius: 8, border: '2px solid #1a1a1a', zIndex: -1 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── Time Grid ─── */
function TimeGrid({ slots, onSelect }) {
  if (slots.length === 0) return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}
    >
      <Clock className="w-8 h-8 mx-auto mb-2" style={{ opacity: .3 }} />
      <p style={{ fontSize: 13 }}>No available slots on this day.</p>
    </motion.div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 420, overflowY: 'auto', paddingRight: 4 }}>
      {slots.map((slot, i) => (
        <motion.button 
          key={slot.start} 
          onClick={() => onSelect(slot)}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          whileHover={{ scale: 1.02, backgroundColor: '#1a1a1a', color: '#fff' }}
          whileTap={{ scale: 0.98 }}
          style={{ 
            padding: '12px 16px', borderRadius: 8, border: '1px solid #e5e5e5', 
            background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, 
            color: '#1a1a1a', textAlign: 'center' 
          }}
        >
          {slot.start.slice(0, 5)}
        </motion.button>
      ))}
    </div>
  );
}

/* ─── Booking Form ─── */
function BookingForm({ slot, eventType, date, onBack, onSuccess }) {
  const [form, setForm] = useState({ bookerName: '', bookerEmail: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createBooking({
        eventTypeId: eventType.id,
        bookerName: form.bookerName,
        bookerEmail: form.bookerEmail,
        bookingDate: format(date, 'yyyy-MM-dd'),
        startTime: slot.start,
        endTime: slot.end,
      });
      onSuccess();
    } catch (err) { setError(err.response?.data?.error || 'Booking failed'); }
    finally { setLoading(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#666', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20, padding: 0 }}>
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>Enter your details</h3>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>
        {format(date, 'EEEE, MMMM d')} at {slot.start.slice(0, 5)}
      </p>
      {error && <div style={{ marginBottom: 14, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, color: '#dc2626', fontSize: 13 }}>{error}</div>}
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Your name *</label>
          <input value={form.bookerName} onChange={(e) => setForm(p => ({ ...p, bookerName: e.target.value }))} required placeholder="John Doe"
            style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, background: '#fff', color: '#1a1a1a', outline: 'none' }}
            onFocus={e => e.target.style.borderColor = '#1a1a1a'}
            onBlur={e => e.target.style.borderColor = '#d1d5db'} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Email *</label>
          <input type="email" value={form.bookerEmail} onChange={(e) => setForm(p => ({ ...p, bookerEmail: e.target.value }))} required placeholder="john@example.com"
            style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, background: '#fff', color: '#1a1a1a', outline: 'none' }}
            onFocus={e => e.target.style.borderColor = '#1a1a1a'}
            onBlur={e => e.target.style.borderColor = '#d1d5db'} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Additional notes</label>
          <textarea value={form.notes} onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} placeholder="Any details you'd like to share…"
            style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, background: '#fff', color: '#1a1a1a', resize: 'none', outline: 'none', fontFamily: 'inherit' }}
            onFocus={e => e.target.style.borderColor = '#1a1a1a'}
            onBlur={e => e.target.style.borderColor = '#d1d5db'} />
        </div>
        <motion.button 
          type="submit" 
          disabled={loading}
          whileHover={!loading ? { scale: 1.01 } : {}}
          whileTap={!loading ? { scale: 0.99 } : {}}
          style={{ marginTop: 4, padding: '12px', borderRadius: 8, border: 'none', background: '#1a1a1a', color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'default' : 'pointer', opacity: loading ? .6 : 1 }}
        >
          {loading ? 'Confirming…' : 'Confirm booking'}
        </motion.button>
      </form>
    </motion.div>
  );
}

/* ─── Success ─── */
function SuccessScreen({ eventType, date, slot }) {
  const navigate = useNavigate();
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ textAlign: 'center', padding: '48px 24px' }}
    >
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.2 }}
        style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}
      >
        <CheckCircle className="w-8 h-8" style={{ color: '#22c55e' }} />
      </motion.div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', marginBottom: 8 }}>You're booked!</h2>
      <p style={{ fontSize: 14, color: '#666', marginBottom: 6 }}>{eventType.title}</p>
      <p style={{ fontSize: 14, color: '#888', marginBottom: 32 }}>
        {format(date, 'EEEE, MMMM d, yyyy')} · {slot.start.slice(0, 5)} – {slot.end.slice(0, 5)}
      </p>
      <p style={{ fontSize: 12, color: '#aaa', marginBottom: 24 }}>A confirmation has been sent to your email address.</p>
      <button onClick={() => navigate('/')}
        style={{ padding: '10px 24px', border: '1px solid #e5e5e5', borderRadius: 8, background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#1a1a1a' }}>
        Done
      </button>
    </motion.div>
  );
}

/* ─── Main ─── */
export default function BookingPage() {
  const { slug } = useParams();
  const [eventType, setEventType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState('');
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getEventTypes();
        const found = res.data.find(et => et.slug === slug);
        if (!found) setError('Event type not found.');
        else setEventType(found);
      } catch { setError('Could not load event type.'); }
      finally { setLoading(false); }
    })();
  }, [slug]);

  useEffect(() => {
    if (!selectedDate || !eventType) return;
    (async () => {
      setSlotsLoading(true);
      setSlots([]); setSelectedSlot(null);
      try {
        const res = await getAvailableSlots(eventType.slug, format(selectedDate, 'yyyy-MM-dd'));
        setSlots(res.data);
      } catch { setSlots([]); }
      finally { setSlotsLoading(false); }
    })();
  }, [selectedDate, eventType]);

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', color: '#888', fontSize: 13 }}>Loading…</div>;
  if (error) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', color: '#ef4444', fontSize: 13 }}>{error}</div>;

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-[#1a1a1a] selection:text-white">
      <motion.div 
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          relative w-full bg-white rounded-2xl border border-[#e5e5e5] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-500 ease-in-out
          ${booked ? 'max-w-[480px]' : 'max-w-[960px]'}
        `}
      >
        <div className="flex flex-col lg:flex-row h-full">
          {/* Left panel – Event Info */}
          <AnimatePresence mode="wait">
            {!booked && (
              <motion.div 
                key="event-info"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full lg:w-[320px] lg:border-r border-[#e5e5e5] p-6 sm:p-8 lg:p-10 bg-white"
              >
                {/* Header Info */}
                <div className="flex items-center lg:flex-col lg:items-start gap-4 mb-6 sm:mb-8">
                  <motion.div 
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white font-extrabold text-sm sm:text-base border-4 border-white shadow-xl ring-1 ring-[#1a1a1a]/5"
                  >
                    S
                  </motion.div>
                  <div>
                    <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#888] mb-0.5 sm:mb-1">Scaler</p>
                    <h1 className="text-xl sm:text-2xl font-black text-[#1a1a1a] leading-tight tracking-tight">{eventType.title}</h1>
                  </div>
                </div>

                {/* Details List */}
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-6">
                  <div className="flex items-center gap-3 text-[#555] group">
                    <div className="w-8 h-8 rounded-lg bg-[#f5f5f5] flex items-center justify-center group-hover:bg-[#1a1a1a] group-hover:text-white transition-colors">
                      <Clock className="w-4 h-4" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold">{eventType.duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#555] group">
                    <div className="w-8 h-8 rounded-lg bg-[#f5f5f5] flex items-center justify-center group-hover:bg-[#1a1a1a] group-hover:text-white transition-colors">
                      <Video className="w-4 h-4" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold">Video meeting</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#555] group hidden sm:flex">
                    <div className="w-8 h-8 rounded-lg bg-[#f5f5f5] flex items-center justify-center group-hover:bg-[#1a1a1a] group-hover:text-white transition-colors">
                      <Globe className="w-4 h-4" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold">Asia/Kolkata</span>
                  </div>
                </div>

                {eventType.description && (
                  <div className="mt-8 pt-8 border-t border-[#f0f0f0]">
                    <p className="text-xs sm:text-sm text-[#666] leading-relaxed font-medium">
                      {eventType.description}
                    </p>
                  </div>
                )}

                {/* Quick Options */}
                <div className="mt-8 flex flex-wrap gap-2">
                  {[15, 30, 45, 60].map(d => (
                    <span key={d} className={`
                      px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all duration-200 cursor-default
                      ${d === eventType.duration 
                        ? 'bg-[#1a1a1a] text-white shadow-lg' 
                        : 'bg-[#f5f5f5] text-[#888] border border-transparent'}
                    `}>
                      {d}m
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right panel – Calendar / Slots / Form */}
          <div className={`flex-1 ${booked ? 'p-0' : 'p-6 sm:p-10 lg:p-12'} bg-[#fafafa]/30 relative`}>
            <AnimatePresence mode="wait">
              {booked ? (
                <SuccessScreen key="success" eventType={eventType} date={selectedDate} slot={selectedSlot} />
              ) : selectedSlot ? (
                <BookingForm 
                  key="form"
                  slot={selectedSlot} 
                  eventType={eventType} 
                  date={selectedDate}
                  onBack={() => setSelectedSlot(null)} 
                  onSuccess={() => setBooked(true)} 
                />
              ) : (
                <motion.div 
                  key="selection"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col lg:flex-row gap-10 lg:gap-14"
                >
                  {/* Calendar Section */}
                  <div className="flex-1 w-full max-w-[440px] mx-auto lg:mx-0">
                    <Calendar selectedDate={selectedDate} onSelect={setSelectedDate} eventType={eventType} />
                  </div>

                  {/* Time slots Section */}
                  <AnimatePresence>
                    {selectedDate && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20, width: 0 }}
                        animate={{ opacity: 1, x: 0, width: 'auto' }}
                        exit={{ opacity: 0, x: 20, width: 0 }}
                        className="w-full lg:w-[200px]"
                      >
                        <div className="flex items-center justify-between mb-6">
                          <p className="text-xs sm:text-sm font-bold text-[#1a1a1a] uppercase tracking-wider">
                            {format(selectedDate, 'EEE, MMM d')}
                          </p>
                        </div>
                        {slotsLoading ? (
                          <div className="flex items-center gap-2 py-4">
                            <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-2 h-2 rounded-full bg-[#1a1a1a]" />
                            <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 rounded-full bg-[#1a1a1a]" />
                            <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 rounded-full bg-[#1a1a1a]" />
                          </div>
                        ) : (
                          <TimeGrid slots={slots} onSelect={setSelectedSlot} />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
