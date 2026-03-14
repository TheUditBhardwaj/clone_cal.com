import { Clock, Calendar, BookOpen, Plus, ArrowRight, User, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getEventTypes, getBookings } from '../api';
import { format, parseISO, isAfter } from 'date-fns';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    eventTypes: 0,
    bookings: 0,
    upcoming: 0
  });
  const [recentMeetings, setRecentMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [etRes, bookingRes] = await Promise.all([
          getEventTypes(),
          getBookings()
        ]);
        
        const etData = etRes.data || [];
        const bookingData = bookingRes.data || [];

        setStats({
          eventTypes: etData.length,
          bookings: bookingData.length,
          upcoming: bookingData.filter(b => isAfter(new Date(b.bookingDate), new Date())).length
        });

        // Filter and sort for "Next Meetings"
        const upcomingSorted = bookingData
          .filter(b => isAfter(parseISO(b.bookingDate), new Date()))
          .sort((a, b) => parseISO(a.bookingDate) - parseISO(b.bookingDate))
          .slice(0, 4);
        
        setRecentMeetings(upcomingSorted);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <div className="p-6 sm:p-10 max-w-[1280px] mx-auto animate-in space-y-10">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-14 h-14 rounded-2xl flex-shrink-0 shadow-[0_0_20px_rgba(255,255,255,0.1)] border-2 border-white/10" 
            />
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">Welcome back, Scaler</h1>
              <p className="text-gray-400 text-sm sm:text-base font-medium opacity-80 mt-0.5">
                Your scheduling dashboard is looking good today.
              </p>
            </div>
          </div>
          <button 
            onClick={() => { navigator.clipboard.writeText(window.location.origin + '/admin'); alert('Profile link copied!'); }}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-xs sm:text-sm font-bold active:scale-95 group self-start md:self-auto"
          >
            <LinkIcon className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
            <span>Copy Profile Link</span>
          </button>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Event Types */}
          <div className="p-7 rounded-2xl bg-[#0a0a0a] border border-white/5 flex items-center justify-between group cursor-default transition-all hover:border-white/10">
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-4">Event Types</p>
              <h3 className="text-4xl font-black">{loading ? '...' : stats.eventTypes}</h3>
            </div>
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 group-hover:text-violet-400 group-hover:border-violet-400/30 transition-all">
              <LinkIcon className="w-4.5 h-4.5 translate-x-px -translate-y-px" />
            </div>
          </div>

          {/* Upcoming Bookings */}
          <div className="p-7 rounded-2xl bg-[#0a0a0a] border border-white/5 flex items-center justify-between group cursor-default transition-all hover:border-white/10">
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-4">Upcoming Bookings</p>
              <h3 className="text-4xl font-black">{loading ? '...' : stats.upcoming}</h3>
            </div>
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 group-hover:text-emerald-400 group-hover:border-emerald-400/30 transition-all">
              <User className="w-4.5 h-4.5" />
            </div>
          </div>

          {/* Availability Status */}
          <div className="p-7 rounded-2xl bg-[#0a0a0a] border border-white/5 flex items-center justify-between group cursor-default transition-all hover:border-white/10">
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-4">Availability Schedule</p>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">Active</h3>
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              </div>
            </div>
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 group-hover:text-violet-400 group-hover:border-violet-400/30 transition-all">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>
        </div>

        {/* Your Next Meetings */}
        <section className="rounded-3xl border border-white/5 bg-[#080808] overflow-hidden">
          <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-gray-300" />
              </div>
              <h2 className="text-base font-bold tracking-tight">Your Next Meetings</h2>
            </div>
            <Link to="/admin/bookings" className="text-[11px] font-bold text-gray-500 uppercase tracking-widest hover:text-white transition-all flex items-center gap-1.5 group">
              View all <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="divide-y divide-white/5">
            {loading ? (
              <div className="py-20 text-center text-gray-500 text-sm font-medium">Crunching your calendar...</div>
            ) : recentMeetings.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                  <Calendar className="w-8 black text-white/10" />
                </div>
                <p className="text-gray-500 text-sm font-medium">No upcoming meetings scheduled.</p>
                <Link to="/admin/event-types?new=true" className="text-xs font-bold text-white bg-white/5 px-4 py-2 rounded-lg hover:bg-white/10 transition-all">Create an event type</Link>
              </div>
            ) : (
              recentMeetings.map((meeting) => (
                <div key={meeting.id} className="p-6 px-10 flex items-center gap-8 hover:bg-white/[0.02] transition-colors group">
                  <div className="flex flex-col items-center justify-center text-center px-4 py-2 rounded-xl bg-white/5 border border-white/5 min-w-[70px]">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">{format(parseISO(meeting.bookingDate), 'MMM')}</span>
                    <span className="text-xl font-black text-white leading-none mt-1">{format(parseISO(meeting.bookingDate), 'dd')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm sm:text-base font-bold text-white truncate group-hover:text-[var(--accent)] transition-colors">
                      {meeting.eventTitle || 'Meeting'} with Admin and {meeting.bookerName}
                    </h4>
                    <p className="text-xs text-gray-500 font-medium mt-1">{meeting.startTime?.slice(0, 5)}</p>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-white/10">
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
