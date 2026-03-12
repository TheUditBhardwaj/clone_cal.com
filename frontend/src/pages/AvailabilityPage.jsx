import { useEffect, useState } from 'react';
import { getAvailability, createAvailability, updateAvailability, deleteAvailability } from '../api';
import { Plus, Trash2, Calendar } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEFAULT_FORM = {
  userId: 1,
  dayOfWeek: 1,
  startTime: '09:00:00',
  endTime: '17:00:00',
  timezone: 'America/New_York',
};

export default function AvailabilityPage() {
  const [availabilityList, setAvailabilityList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAvailability = async () => {
    try {
      const res = await getAvailability();
      setAvailabilityList(res.data);
    } catch (e) {
      setError('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAvailability(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createAvailability({ ...form, dayOfWeek: parseInt(form.dayOfWeek) });
      setSuccess('Availability added!');
      fetchAvailability();
      setTimeout(() => setSuccess(''), 2000);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to add availability');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAvailability(id);
      fetchAvailability();
    } catch (e) {
      setError('Failed to delete availability');
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Availability</h1>
        <p className="text-gray-500 text-sm mt-1">Set your available days and hours.</p>
      </div>

      {error && <div className="mb-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}
      {success && <div className="mb-4 bg-green-50 text-green-600 text-sm px-4 py-3 rounded-lg">{success}</div>}

      {/* Add New Availability Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Add Availability Window</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Day</label>
            <select name="dayOfWeek" value={form.dayOfWeek}
              onChange={(e) => setForm((p) => ({ ...p, dayOfWeek: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
              {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
            <input type="time" value={form.startTime.slice(0, 5)}
              onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value + ':00' }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">End Time</label>
            <input type="time" value={form.endTime.slice(0, 5)}
              onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value + ':00' }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
          </div>
          <div className="flex items-end">
            <button type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </form>
      </div>

      {/* Existing Availability List */}
      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : availabilityList.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No availability set yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {availabilityList.map((av) => (
            <div key={av.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-3">
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-900 w-24">{DAYS[av.dayOfWeek]}</span>
                <span className="text-sm text-gray-600">
                  {av.startTime?.slice(0, 5)} – {av.endTime?.slice(0, 5)}
                </span>
                <span className="text-xs text-gray-400">{av.timezone}</span>
              </div>
              <button onClick={() => handleDelete(av.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
