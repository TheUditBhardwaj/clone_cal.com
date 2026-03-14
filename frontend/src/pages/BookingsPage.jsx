import { useEffect, useState } from 'react';
import { getBookings, deleteBooking } from '../api';
import { BookOpen, Trash2, Clock, Mail, User, Search, ChevronRight, Filter, Settings, MoreHorizontal, Video, ChevronLeft } from 'lucide-react';
import { format, isBefore, startOfDay, parseISO } from 'date-fns';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('upcoming');
  const [search, setSearch] = useState('');

  const fetch = async () => {
    try { 
      const res = await getBookings(); 
      setBookings(res.data || []); 
    }
    catch { 
      setError('Could not load bookings'); 
    }
    finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetch(); }, []);

  const today = startOfDay(new Date());
  
  const filtered = bookings
    .filter((b) => {
      const bDate = startOfDay(parseISO(b.bookingDate));
      if (tab === 'upcoming') return !isBefore(bDate, today) && b.status !== 'CANCELLED';
      if (tab === 'past') return isBefore(bDate, today) && b.status !== 'CANCELLED';
      if (tab === 'cancelled') return b.status === 'CANCELLED';
      // Mocking for other tabs for now
      if (tab === 'unconfirmed') return false; 
      if (tab === 'recurring') return false;
      return true;
    });

  const tabs = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'unconfirmed', label: 'Unconfirmed' },
    { key: 'recurring', label: 'Recurring' },
    { key: 'past', label: 'Past' },
    { key: 'cancelled', label: 'Canceled' },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black pb-20">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 mt-10 space-y-8 animate-in">
        
        {/* Header Section */}
        <header className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight">Bookings</h1>
          <p className="text-gray-400 text-sm font-medium opacity-80">
            See upcoming and past events booked through your event type links.
          </p>
        </header>

        {/* Tabs and Filters Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-white/5">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                  tab === t.key 
                    ? 'bg-[#1a1a1a] text-white shadow-sm' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0a0a0a] border border-white/5 text-gray-400 hover:text-white transition-all text-xs font-bold group">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0a0a0a] border border-white/5 text-gray-400 hover:text-white transition-all text-xs font-bold group">
              <span>Saved filters</span>
              <ChevronRight className="w-3.5 h-3.5 rotate-90 opacity-40 group-hover:opacity-100" />
            </button>
          </div>
        </div>

        {/* Main Content Container */}
        <div className="rounded-2xl border border-white/5 bg-[#080808] overflow-hidden">
          {/* Group Header */}
          <div className="px-6 py-4 border-b border-white/5 bg-[#0a0a0a]/50">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">TODAY</p>
          </div>

          <div className="divide-y divide-white/5">
            {loading ? (
              <div className="py-24 text-center text-gray-500 text-sm font-medium">Fetching your schedule...</div>
            ) : filtered.length === 0 ? (
              <div className="py-24 text-center flex flex-col items-center justify-center gap-5">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                  <BookOpen className="w-8 black text-white/10" />
                </div>
                <div className="space-y-1">
                  <p className="text-white text-sm font-bold">No {tab} bookings</p>
                  <p className="text-gray-500 text-xs">You have no {tab} bookings.</p>
                </div>
              </div>
            ) : (
              filtered.map((booking) => (
                <div key={booking.id} className="p-6 px-10 flex items-center hover:bg-white/[0.02] transition-colors group relative border-white/5">
                  {/* Left: Date & Link */}
                  <div className="w-48 space-y-3">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white leading-none">
                        {format(parseISO(booking.bookingDate), 'eee, MMM d')}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">
                        {booking.startTime?.slice(0, 5)} - {booking.endTime?.slice(0, 5)}
                      </p>
                    </div>
                    <a href="#" className="flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-all text-xs font-bold">
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Cal Video</span>
                    </a>
                  </div>

                  {/* Center: Title & Description */}
                  <div className="flex-1 min-w-0 pr-10">
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-white truncate group-hover:text-violet-400 transition-all">
                        {booking.eventTitle || 'Meeting'} between Administrator and {booking.bookerName}
                      </h4>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500 font-medium italic opacity-70">
                          "{booking.eventDescription || 'No description provided'}"
                        </p>
                        <p className="text-xs text-gray-500 font-medium">
                          You and {booking.bookerName}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <button className="p-2 rounded-lg bg-[#0a0a0a] border border-white/5 text-gray-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 bg-[#0a0a0a]/50 border-t border-white/5 flex items-center justify-between text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-[#0a0a0a] border border-white/5 rounded-lg px-2 py-1 text-xs font-bold text-white">
                <span>10</span>
                <ChevronRight className="w-3.5 h-3.5 rotate-90 opacity-40" />
              </div>
              <span className="text-xs font-bold tracking-tight">rows per page</span>
            </div>
            
            <div className="flex items-center gap-8">
              <span className="text-[11px] font-bold tracking-tight">
                {filtered.length > 0 ? `1-${filtered.length} of ${filtered.length}` : '0-0 of 0'}
              </span>
              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded-lg border border-white/5 bg-[#0a0a0a] disabled:opacity-30 disabled:cursor-not-allowed hover:text-white transition-all" disabled>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-lg border border-white/5 bg-[#0a0a0a] disabled:opacity-30 disabled:cursor-not-allowed hover:text-white transition-all" disabled>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
