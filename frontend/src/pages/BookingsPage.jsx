import { useEffect, useState } from 'react';
import { getBookings, deleteBooking } from '../api';
import { BookOpen, Trash2, Clock, Mail, User, Search, ChevronRight } from 'lucide-react';
import { format, isBefore, startOfDay } from 'date-fns';

const STATUS_STYLES = {
  ACCEPTED: { bg: 'rgba(34,197,94,.1)', color: '#86efac', border: 'rgba(34,197,94,.15)', label: 'Accepted' },
  CANCELLED: { bg: 'rgba(239,68,68,.08)', color: '#f87171', border: 'rgba(239,68,68,.15)', label: 'Cancelled' },
  PENDING:   { bg: 'rgba(234,179,8,.08)', color: '#fde047', border: 'rgba(234,179,8,.15)', label: 'Pending' },
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('upcoming');
  const [search, setSearch] = useState('');

  const fetch = async () => {
    try { const res = await getBookings(); setBookings(res.data); }
    catch { setError('Could not load bookings'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try { await deleteBooking(id); fetch(); }
    catch { setError('Failed to cancel'); }
  };

  const today = startOfDay(new Date());
  const filtered = bookings
    .filter((b) => {
      const bDate = startOfDay(new Date(b.bookingDate));
      return tab === 'upcoming' ? !isBefore(bDate, today) : isBefore(bDate, today);
    })
    .filter((b) => {
      if (!search) return true;
      return b.bookerName?.toLowerCase().includes(search.toLowerCase()) ||
             b.bookerEmail?.toLowerCase().includes(search.toLowerCase());
    });

  const tabs = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past', label: 'Past' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="animate-in" style={{ minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 24px 0' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Bookings</h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>View and manage all your scheduled meetings.</p>
          </div>
          <div style={{ position: 'relative' }}>
            <Search className="w-4 h-4" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search attendees…"
              style={{ paddingLeft: 36, width: 280, height: 40, background: '#111', border: '1px solid #222', borderRadius: 10, fontSize: 14 }} />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid #1f1f1f', marginBottom: 32 }}>
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{
                padding: '12px 4px', fontSize: 14, fontWeight: tab === t.key ? 600 : 500, cursor: 'pointer',
                border: 'none', background: 'transparent', 
                borderBottom: tab === t.key ? '2px solid #fff' : '2px solid transparent',
                color: tab === t.key ? '#fff' : 'var(--text-muted)',
                transition: 'all .15s',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        <div>
          {error && (
            <div style={{ marginBottom: 24, padding: '12px 16px', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 12, color: '#f87171', fontSize: 14 }}>
              {error}
            </div>
          )}

          {loading ? (
            <div className="empty-state"><p>Loading…</p></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state" style={{ border: '1px dashed #222', borderRadius: 16 }}>
              <BookOpen className="w-10 h-10" />
              <p>No {tab} bookings{search && ` matching "${search}"`}.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map((b) => {
                const status = STATUS_STYLES[b.status] || STATUS_STYLES.PENDING;
                return (
                  <div key={b.id}
                    className="card-hover"
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      padding: '16px 20px', 
                      gap: 20, 
                      background: 'rgba(255,255,255,0.02)', 
                      border: '1px solid #1f1f1f', 
                      borderRadius: 16 
                    }}>
                    {/* Date block */}
                    <div style={{ 
                      flexShrink: 0, width: 64, height: 64, 
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      background: '#111', borderRadius: 12, border: '1px solid #222' 
                    }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                        {format(new Date(b.bookingDate), 'MMM')}
                      </p>
                      <p style={{ fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                        {format(new Date(b.bookingDate), 'dd')}
                      </p>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, color: '#fff', fontSize: 15 }}>
                          {format(new Date(b.bookingDate), 'EEEE, MMMM d, yyyy')}
                        </span>
                        <span style={{ 
                          display: 'inline-flex', alignItems: 'center', gap: 6, 
                          fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', 
                          background: 'rgba(255,255,255,0.05)', borderRadius: 99, padding: '3px 10px',
                          border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                          <Clock className="w-3.5 h-3.5" />
                          {b.startTime?.slice(0, 5)} – {b.endTime?.slice(0, 5)}
                        </span>
                        <span style={{ 
                          display: 'inline-block', fontSize: 12, fontWeight: 600, 
                          borderRadius: 99, padding: '3px 12px', 
                          background: status.bg, color: status.color, border: `1px solid ${status.border}` 
                        }}>
                          {status.label}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <span style={{ fontSize: 14, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <User className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                          {b.bookerName}
                        </span>
                        <span style={{ fontSize: 14, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Mail className="w-4 h-4" />
                          {b.bookerEmail}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {tab === 'upcoming' && (
                        <button className="btn-icon"
                          onClick={() => handleCancel(b.id)} 
                          style={{ color: 'var(--text-muted)', width: 40, height: 40, borderRadius: 10 }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}>
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                      <div style={{ color: 'var(--text-muted)', padding: 8 }}>
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
