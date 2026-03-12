import { useEffect, useState } from 'react';
import { getEventTypes, createEventType, updateEventType, deleteEventType } from '../api';
import { Plus, Pencil, Trash2, Clock, X } from 'lucide-react';

function Modal({ onClose, onSubmit, initial }) {
  const [form, setForm] = useState(initial || { title: '', description: '', duration: 30, slug: '', userId: 1 });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Auto-generate slug from title
    if (name === 'title') {
      setForm((prev) => ({
        ...prev,
        title: value,
        slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, duration: parseInt(form.duration) });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{initial ? 'Edit Event Type' : 'New Event Type'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input name="title" value={form.title} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
            <input name="duration" type="number" value={form.duration} onChange={handleChange} min={5} max={480} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-gray-400">
              <span className="px-3 py-2 bg-gray-50 text-gray-400 text-sm border-r border-gray-300">/book/</span>
              <input name="slug" value={form.slug} onChange={handleChange} required
                className="flex-1 px-3 py-2 text-sm focus:outline-none" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="px-4 py-2 text-sm rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors">
              {initial ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EventTypesPage() {
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [error, setError] = useState('');

  const fetchEventTypes = async () => {
    try {
      const res = await getEventTypes();
      setEventTypes(res.data);
    } catch (e) {
      setError('Failed to load event types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEventTypes(); }, []);

  const handleCreate = async (data) => {
    try {
      await createEventType(data);
      setShowModal(false);
      fetchEventTypes();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to create event type');
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updateEventType(editItem.id, data);
      setEditItem(null);
      fetchEventTypes();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to update event type');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this event type?')) return;
    try {
      await deleteEventType(id);
      fetchEventTypes();
    } catch (e) {
      setError('Failed to delete event type');
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Types</h1>
          <p className="text-gray-500 text-sm mt-1">Create and manage your bookable event types.</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors">
          <Plus className="w-4 h-4" /> New Event Type
        </button>
      </div>

      {error && <div className="mb-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}

      {loading ? (
        <div className="text-gray-400 text-sm">Loading...</div>
      ) : eventTypes.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No event types yet. Create your first one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {eventTypes.map((et) => (
            <div key={et.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-4 hover:shadow-sm transition-shadow">
              <div>
                <h3 className="font-semibold text-gray-900">{et.title}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {et.duration} minutes
                  </span>
                  <span className="text-xs text-gray-400 font-mono">/book/{et.slug}</span>
                </div>
                {et.description && <p className="text-xs text-gray-500 mt-1">{et.description}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setEditItem(et)}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(et.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <Modal onClose={() => setShowModal(false)} onSubmit={handleCreate} />}
      {editItem && <Modal onClose={() => setEditItem(null)} onSubmit={handleUpdate} initial={editItem} />}
    </div>
  );
}
