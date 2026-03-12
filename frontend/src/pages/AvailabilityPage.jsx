import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { getSchedules, deleteSchedule } from '../api';

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
}

function buildSummary(schedule) {
  const days = schedule.days || [];
  if (!days.length) return 'No days set';
  const sorted = [...days].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  const indices = sorted.map(d => d.dayOfWeek);
  const unique = [...new Set(indices)];
  const seq = unique.every((v, i) => i === 0 || v === unique[i - 1] + 1);
  const dayStr = seq && unique.length > 2
    ? `${DAY_SHORT[unique[0]]} - ${DAY_SHORT[unique[unique.length - 1]]}`
    : unique.map(i => DAY_SHORT[i]).join(', ');
  const timeStr = `${formatTime(sorted[0].startTime)} - ${formatTime(sorted[0].endTime)}`;
  return `${dayStr}, ${timeStr}`;
}

export default function AvailabilityPage() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  const fetchSchedules = async () => {
    try {
      const res = await getSchedules();
      setSchedules(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    setOpenMenuId(null);
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    try {
      await deleteSchedule(id);
      setSchedules(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Failed to delete schedule:', err);
    }
  };

  return (
    <div className="animate-in" style={{ minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Availability</h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Configure times when you are available for bookings.</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 4, display: 'flex', gap: 2 }}>
              <button className="btn-secondary" style={{ 
                fontSize: 13, 
                padding: '6px 14px', 
                borderRadius: 8, 
                border: 'none', 
                background: 'rgba(255,255,255,0.08)',
                color: '#fff'
              }}>My availability</button>
              <button className="btn-secondary" style={{ 
                fontSize: 13, 
                padding: '6px 14px', 
                borderRadius: 8, 
                border: 'none', 
                background: 'transparent',
                opacity: 0.5
              }}>Team availability</button>
            </div>
            <button className="btn-primary" 
              onClick={() => navigate('/admin/availability/edit/new')}
              style={{ padding: '8px 18px', borderRadius: 10, fontWeight: 600 }}>
              <Plus className="w-4 h-4" /> New
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {loading ? (
            <div className="empty-state"><p>Loading…</p></div>
          ) : schedules.length === 0 ? (
            <div className="empty-state" style={{ border: '1px dashed var(--border)', borderRadius: 16 }}>
              <Globe className="w-10 h-10" />
              <p>No availability schedules yet.</p>
              <button className="btn-primary" onClick={() => navigate('/admin/availability/edit/new')}>
                <Plus className="w-4 h-4" /> Create schedule
              </button>
            </div>
          ) : (
            schedules.map((s) => (
              <div key={s.id}
                className="card-hover"
                style={{ 
                  padding: '24px 32px', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  background: 'transparent',
                  border: '1px solid #1f1f1f',
                  borderRadius: 16,
                  transition: 'border-color 0.2s, background-color 0.2s',
                }}
                onClick={() => navigate(`/admin/availability/edit/${s.id}`)}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>{s.name}</span>
                    {s.isDefault && (
                      <span style={{ 
                        fontSize: 11, 
                        fontWeight: 600, 
                        background: '#2a2a2a', 
                        color: 'var(--text-secondary)', 
                        padding: '2px 8px', 
                        borderRadius: 6 
                      }}>Default</span>
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{buildSummary(s)}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <Globe className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.timezone}</span>
                  </div>
                </div>
                <div style={{ position: 'relative' }}>
                  <button className="btn-icon" 
                    style={{ 
                      width: 36, height: 36, 
                      borderRadius: 10, 
                      border: '1px solid #1f1f1f',
                      background: openMenuId === s.id ? 'var(--bg-hover)' : 'transparent' 
                    }} 
                    onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === s.id ? null : s.id); }}>
                    <MoreHorizontal className="w-4.5 h-4.5" />
                  </button>
                  {openMenuId === s.id && (
                    <div ref={menuRef} className="dropdown-menu" style={{ right: 0, top: '100%', marginTop: 8 }}>
                      <div className="dropdown-item danger" onClick={(e) => handleDelete(s.id, e)}>
                        <Trash2 className="w-4 h-4" /> Delete
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ marginTop: 48, textAlign: 'center', padding: '32px 0' }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Temporarily out-of-office?{' '}
            <span style={{ color: 'var(--text-primary)', fontWeight: 500, textDecoration: 'underline', cursor: 'pointer' }}>
              Add a redirect
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
