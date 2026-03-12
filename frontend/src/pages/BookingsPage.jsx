import { useEffect, useState } from 'react';
import { getBookings, deleteBooking } from '../api';
import { BookOpen, Trash2, Clock, Mail, User } from 'lucide-react';
import { format, isBefore, startOfDay } from 'date-fns';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('upcoming');

  const fetchBookings = async () => {
    try {
      const res = await getBookings();
      setBookings(res.data);
    } catch (e) {
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await deleteBooking(id);
      fetchBookings();
    } catch (e) {
      setError('Failed to cancel booking');
    }
  };

  const today = startOfDay(new Date());
  const filtered = bookings.filter((b) => {
    const bDate = startOfDay(new Date(b.bookingDate));
    return tab === 'upcoming' ? !isBefore(bDate, today) : isBefore(bDate, today);
  });

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="text-gray-500 text-sm mt-1">View and manage all your scheduled meetings.</p>
      </div>

      {error && <div className="mb-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-lg w-fit">
        {['upcoming', 'past'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No {tab} bookings.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <div key={b.id}
              className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-4 hover:shadow-sm transition-shadow">
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-semibold text-gray-900">
                    {format(new Date(b.bookingDate), 'MMM dd, yyyy')}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {b.startTime?.slice(0, 5)} – {b.endTime?.slice(0, 5)}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    b.status === 'ACCEPTED' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {b.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-gray-400" /> {b.bookerName}
                  </span>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-gray-400" /> {b.bookerEmail}
                  </span>
                </div>
              </div>
              {tab === 'upcoming' && (
                <button onClick={() => handleDelete(b.id)}
                  className="ml-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
