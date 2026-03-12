import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventTypes, getAvailableSlots, createBooking } from '../api';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isBefore, isToday, isSameDay, isSameMonth } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, Globe, CheckCircle, Video, ArrowLeft } from 'lucide-react';

/* ─── Full Calendar ─── */
function Calendar({ selectedDate, onSelect, eventType }) {
  const [viewMonth, setViewMonth] = useState(startOfMonth(new Date()));

  const start = startOfWeek(startOfMonth(viewMonth));
  const end = endOfWeek(endOfMonth(viewMonth));
  const days = eachDayOfInterval({ start, end });
  const today = new Date();

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>
          {format(viewMonth, 'MMMM yyyy')}
        </h2>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => setViewMonth(subMonths(viewMonth, 1))}
            style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e5e5e5', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMonth(addMonths(viewMonth, 1))}
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {days.map((day) => {
          const past = isBefore(day, startOfMonth(today)) && !isSameMonth(day, today) || (isBefore(day, today) && !isToday(day));
          const outOfMonth = !isSameMonth(day, viewMonth);
          const selected = selectedDate && isSameDay(day, selectedDate);
          const current = isToday(day);
          return (
            <button key={day.toISOString()} disabled={past || outOfMonth}
              onClick={() => onSelect(day)}
              style={{
                aspectRatio: '1', borderRadius: 8, border: 'none', cursor: past || outOfMonth ? 'default' : 'pointer',
                background: selected ? '#1a1a1a' : current ? '#f5f5f5' : 'transparent',
                color: selected ? '#fff' : outOfMonth ? '#ccc' : past ? '#ccc' : '#1a1a1a',
                fontWeight: selected || current ? 700 : 400,
                fontSize: 13,
                outline: current && !selected ? '2px solid #1a1a1a' : 'none',
                outlineOffset: -2,
                transition: 'background .15s',
              }}
              onMouseEnter={(e) => { if (!selected && !past && !outOfMonth) e.currentTarget.style.background = '#f5f5f5'; }}
              onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = current ? '#f5f5f5' : 'transparent'; }}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Time Grid ─── */
function TimeGrid({ slots, onSelect }) {
  if (slots.length === 0) return (
    <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
      <Clock className="w-8 h-8 mx-auto mb-2" style={{ opacity: .3 }} />
      <p style={{ fontSize: 13 }}>No available slots on this day.</p>
    </div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 420, overflowY: 'auto', paddingRight: 4 }}>
      {slots.map((slot) => (
        <button key={slot.start} onClick={() => onSelect(slot)}
          style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid #e5e5e5', background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#1a1a1a', transition: 'all .15s', textAlign: 'center' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#1a1a1a'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#1a1a1a'; e.currentTarget.style.borderColor = '#e5e5e5'; }}
        >
          {slot.start.slice(0, 5)}
        </button>
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
    <div>
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
        <button type="submit" disabled={loading}
          style={{ marginTop: 4, padding: '12px', borderRadius: 8, border: 'none', background: '#1a1a1a', color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'default' : 'pointer', opacity: loading ? .6 : 1 }}>
          {loading ? 'Confirming…' : 'Confirm booking'}
        </button>
      </form>
    </div>
  );
}

/* ─── Success ─── */
function SuccessScreen({ eventType, date, slot }) {
  const navigate = useNavigate();
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <CheckCircle className="w-8 h-8" style={{ color: '#22c55e' }} />
      </div>
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
    </div>
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
    <div style={{ minHeight: '100vh', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e5e5', boxShadow: '0 4px 24px rgba(0,0,0,.06)', overflow: 'hidden', width: '100%', maxWidth: booked ? 480 : 860, display: 'flex' }}>

        {/* Left panel – Event Info */}
        {!booked && (
          <div style={{ width: 280, flexShrink: 0, borderRight: '1px solid #e5e5e5', padding: 32, background: '#fff' }}>
            {/* Avatar */}
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#6d28d9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>U</div>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Udit Bhardwaj</p>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', lineHeight: 1.2, marginBottom: 20 }}>{eventType.title}</h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#555', fontSize: 13 }}>
                <Clock className="w-4 h-4" style={{ flexShrink: 0 }} />
                <span>{eventType.duration} minutes</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#555', fontSize: 13 }}>
                <Video className="w-4 h-4" style={{ flexShrink: 0 }} />
                <span>Google Meet / Video call</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#555', fontSize: 13 }}>
                <Globe className="w-4 h-4" style={{ flexShrink: 0 }} />
                <span>Asia/Kolkata</span>
              </div>
            </div>

            {eventType.description && (
              <p style={{ marginTop: 24, fontSize: 13, color: '#888', lineHeight: 1.6, borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
                {eventType.description}
              </p>
            )}

            {/* Duration pills */}
            <div style={{ marginTop: 24, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[15, 30, 45, 60].map(d => (
                <span key={d} style={{ padding: '4px 10px', borderRadius: 99, border: '1px solid', fontSize: 12, fontWeight: d === eventType.duration ? 700 : 400, background: d === eventType.duration ? '#1a1a1a' : '#fff', color: d === eventType.duration ? '#fff' : '#555', borderColor: d === eventType.duration ? '#1a1a1a' : '#e5e5e5' }}>
                  {d}m
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Right panel – Calendar / Slots / Form */}
        <div style={{ flex: 1, padding: booked ? 0 : 32 }}>
          {booked ? (
            <SuccessScreen eventType={eventType} date={selectedDate} slot={selectedSlot} />
          ) : selectedSlot ? (
            <BookingForm slot={selectedSlot} eventType={eventType} date={selectedDate}
              onBack={() => setSelectedSlot(null)} onSuccess={() => setBooked(true)} />
          ) : (
            <div style={{ display: 'flex', gap: 32 }}>
              {/* Calendar */}
              <div style={{ flex: 1 }}>
                <Calendar selectedDate={selectedDate} onSelect={setSelectedDate} eventType={eventType} />
              </div>

              {/* Time slots */}
              {selectedDate && (
                <div style={{ width: 160, flexShrink: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', marginBottom: 12 }}>
                    {format(selectedDate, 'EEE, MMM d')}
                  </p>
                  {slotsLoading ? (
                    <p style={{ fontSize: 13, color: '#aaa' }}>Loading…</p>
                  ) : (
                    <TimeGrid slots={slots} onSelect={setSelectedSlot} />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
