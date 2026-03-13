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
    <div className="animate-in pb-12" style={{ minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 sm:mb-12">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-1 sm:mb-2">Availability</h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">Configure times when you are available for bookings.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/5 rounded-xl p-1 flex gap-1 items-center">
              <button className="text-[10px] sm:text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/10 text-white">My availability</button>
              <button className="text-[10px] sm:text-xs font-semibold px-3 py-1.5 rounded-lg text-white/40 hover:text-white transition-colors">Team availability</button>
            </div>
            <button className="btn-primary px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2" 
              onClick={() => navigate('/admin/availability/edit/new')}>
              <Plus className="w-4 h-4" /> New
            </button>
          </div>
        </div>

        <div className="flex flex-col">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center bg-white/[0.01] border border-[#1f1f1f] rounded-lg animate-pulse text-white/30">
              Loading schedules…
            </div>
          ) : schedules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white/[0.01] border border-[#1f1f1f] border-dashed rounded-lg">
              <Globe className="w-10 h-10 mb-4 text-[var(--text-muted)] opacity-40" />
              <p className="text-sm text-[var(--text-secondary)] mb-6">No availability schedules yet.</p>
              <button className="bg-white text-black px-6 py-2.5 rounded-md font-bold text-sm flex items-center gap-2 hover:bg-white/90 transition-colors" onClick={() => navigate('/admin/availability/edit/new')}>
                <Plus className="w-4 h-4" /> Create schedule
              </button>
            </div>
          ) : (
            <div className="bg-black border border-[#1f1f1f] rounded-lg overflow-hidden">
              {schedules.map((s, index) => (
                <div key={s.id}
                  className={`group flex items-center justify-between py-3 px-4 hover:bg-[#111] transition-colors cursor-pointer ${index !== schedules.length - 1 ? 'border-b border-[#1f1f1f]' : ''}`}
                  onClick={() => navigate(`/admin/availability/edit/${s.id}`)}>
                  
                  {/* Left side: Details */}
                  <div className="flex flex-col gap-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[14px] font-semibold text-white tracking-tight">{s.name}</span>
                      {s.isDefault && (
                        <span className="text-[10px] font-bold bg-[#1a1a1a] text-[#666] px-1.5 py-0.5 rounded border border-[#1f1f1f] uppercase tracking-wider">Default</span>
                      )}
                    </div>
                    <p className="text-[13px] text-[#666] font-normal truncate">{buildSummary(s)}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[#666]">
                      <Globe className="w-3 h-3" />
                      <span className="text-[11px]">{s.timezone}</span>
                    </div>
                  </div>

                  {/* Right side: Grouped Controls */}
                  <div className="flex items-center gap-2 bg-neutral-900 border border-[#1f1f1f] rounded-lg px-2 py-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <div className="relative">
                      <button className="w-7 h-7 flex items-center justify-center rounded-md text-[#888] hover:text-white hover:bg-white/5 transition-colors" 
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === s.id ? null : s.id); }}>
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {openMenuId === s.id && (
                        <div ref={menuRef} className="absolute right-0 top-full mt-2 z-50 min-w-[140px] p-1 bg-[#161616] border border-[#1f1f1f] rounded-lg shadow-xl animate-in fade-in">
                          <button
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-md transition-colors text-left font-medium"
                            onClick={(e) => handleDelete(s.id, e)}
                          >
                            <Trash2 className="w-3.5 h-3.5" /> <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
