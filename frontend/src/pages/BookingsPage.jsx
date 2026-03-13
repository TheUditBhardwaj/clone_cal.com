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
    <div className="animate-in pb-12" style={{ minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-1 sm:mb-2 text-white">Bookings</h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">View and manage all your scheduled meetings.</p>
          </div>
          <div className="relative w-full sm:w-[280px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search attendees…"
              className="w-full h-11 pl-11 pr-4 bg-[#111] border border-[#222] rounded-xl text-sm focus:border-[var(--accent)] outline-none transition-colors" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 sm:gap-8 border-b border-[#1f1f1f] mb-10 overflow-x-auto no-scrollbar">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`
                whitespace-nowrap pb-4 text-xs sm:text-sm font-bold tracking-tight transition-all relative
                ${tab === t.key ? 'text-white' : 'text-[var(--text-muted)] hover:text-white'}
              `}>
              {t.label}
              {tab === t.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-t-full shadow-[0_-2px_8px_rgba(255,255,255,0.4)]" />
              )}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm animate-in">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4 sm:gap-5">
            {loading ? (
              <div className="empty-state py-12"><p>Loading…</p></div>
            ) : filtered.length === 0 ? (
              <div className="empty-state border border-dashed border-[#222] rounded-3xl py-16 px-4">
                <BookOpen className="w-12 h-12 mb-4 text-[var(--text-muted)] opacity-20" />
                <p className="text-sm sm:text-base text-[var(--text-secondary)] font-medium">No {tab} bookings{search && ` matching "${search}"`}.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 sm:gap-5">
                {filtered.map((b) => {
                  const status = STATUS_STYLES[b.status] || STATUS_STYLES.PENDING;
                  return (
                    <div key={b.id}
                      className="group bg-white/[0.01] border border-[#1f1f1f] rounded-3xl p-5 sm:p-7 md:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 hover:bg-white/[0.03] hover:border-[var(--border)] transition-all duration-300 cursor-pointer">
                      
                      {/* Date block */}
                      <div className="flex-shrink-0 w-full sm:w-[72px] h-16 sm:h-[72px] flex sm:flex-col items-center justify-center gap-2 sm:gap-0.5 bg-[#111] border border-[#222] rounded-2xl group-hover:border-[var(--border)] transition-colors">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-60">
                          {format(new Date(b.bookingDate), 'MMM')}
                        </p>
                        <p className="text-2xl sm:text-3xl font-black text-white leading-none">
                          {format(new Date(b.bookingDate), 'dd')}
                        </p>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <span className="text-sm sm:text-base font-black text-white tracking-tight">
                            {format(new Date(b.bookingDate), 'EEEE, MMMM d')}
                          </span>
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] sm:text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                            <Clock className="w-3 h-3" />
                            {b.startTime?.slice(0, 5)} – {b.endTime?.slice(0, 5)}
                          </div>
                          <span className="px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest border"
                            style={{ background: status.bg, color: status.color, borderColor: status.border }}>
                            {status.label}
                          </span>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-10">
                          <div className="flex items-center gap-3 group/user">
                            <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-white group-hover/user:bg-white/10 transition-colors">
                              {b.bookerName?.[0]}
                            </div>
                            <span className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)] truncate">
                              {b.bookerName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2.5 text-[var(--text-muted)] opacity-60 hover:opacity-100 transition-opacity">
                            <Mail className="w-3.5 h-3.5" />
                            <span className="text-xs sm:text-sm font-medium truncate">{b.bookerEmail}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-4 mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-[#1f1f1f]">
                        {tab === 'upcoming' && (
                          <button className="flex items-center gap-2 px-4 py-2 sm:p-2 sm:aspect-square rounded-xl bg-red-500/5 hover:bg-red-500/20 text-red-400 border border-red-500/10 transition-all group/trash" 
                            onClick={(e) => { e.stopPropagation(); handleCancel(b.id); }}>
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 group-hover/trash:scale-110 transition-transform" />
                            <span className="sm:hidden text-xs font-bold uppercase tracking-wider font-sans">Cancel booking</span>
                          </button>
                        )}
                        <div className="p-2 sm:p-0 text-[var(--text-muted)] opacity-0 sm:group-hover:opacity-100 group-hover:translate-x-1 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                          <span className="hidden sm:inline">Details</span>
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
    </div>
  );
}
