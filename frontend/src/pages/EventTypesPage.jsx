import { useEffect, useState, useRef } from 'react';
import { getEventTypes, createEventType, updateEventType, deleteEventType, getUsers } from '../api';
import { Plus, Clock, Pencil, Trash2, Search, MoreHorizontal, Copy, Code2 } from 'lucide-react';

/* ──────────── Modal ──────────── */
/* ──────────── Modal ──────────── */
function EventModal({ onClose, onSubmit, initial }) {
  const [form, setForm] = useState(
    initial
      ? { ...initial }
      : { title: '', description: '', duration: 15, slug: '', userId: null }
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!initial && !form.userId) {
      getUsers().then(res => {
        if (res.data && res.data.length > 0) {
          setForm(p => ({ ...p, userId: res.data[0].id }));
        }
      });
    }
  }, [initial, form.userId]);

  const handle = (e) => {
    const { name, value } = e.target;
    setForm((p) => {
      const next = { ...p, [name]: value };
      if (name === 'title' && !initial) {
        next.slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      }
      return next;
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.userId) {
      alert('Loading user information. Please try again in a moment.');
      return;
    }
    setSaving(true);
    await onSubmit({ ...form, duration: parseInt(form.duration) });
    setSaving(false);
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()} style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div className="modal-box" style={{ width: 520, background: '#111', border: '1px solid #1f1f1f', borderRadius: 16, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '32px 32px 24px' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 8, letterSpacing: '-0.02em' }}>
            {initial ? 'Edit event type' : 'Add a new event type'}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>
            Set up event types to offer different types of meetings.
          </p>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 8, display: 'block' }}>Title</label>
              <input name="title" value={form.title} onChange={handle} required 
                placeholder="Quick chat" 
                style={{ background: 'transparent', border: '1px solid #1f1f1f', borderRadius: 10, height: 44, padding: '0 16px', fontSize: 14, color: '#fff' }} />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 8, display: 'block' }}>URL</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'transparent', border: '1px solid #1f1f1f', borderRadius: 10, overflow: 'hidden' }}>
                <span style={{ padding: '0 12px', color: 'var(--text-muted)', fontSize: 13, opacity: 0.6 }}>
                  cal.com/udit-bhardwaj-dorkjw/
                </span>
                <input name="slug" value={form.slug} onChange={handle} required
                  style={{ border: 'none', background: 'transparent', height: 44, padding: '0 0 0 4px', fontSize: 14, flex: 1, color: '#fff' }}
                  placeholder="slug" />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 8, display: 'block' }}>Description</label>
              <div style={{ position: 'relative', border: '1px solid #1f1f1f', borderRadius: 10, background: 'transparent', overflow: 'hidden' }}>
                <div style={{ display: 'flex', gap: 16, padding: '12px 16px', borderBottom: '1px solid #1f1f1f' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, cursor: 'not-allowed', opacity: 0.4 }}>B</span>
                  <span style={{ fontSize: 14, fontStyle: 'italic', cursor: 'not-allowed', opacity: 0.4 }}>I</span>
                </div>
                <textarea name="description" value={form.description} onChange={handle} rows={3} 
                  placeholder="A quick video meeting." 
                  style={{ width: '100%', background: 'transparent', border: 'none', padding: '12px 16px', fontSize: 14, color: '#fff', resize: 'none' }} />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 8, display: 'block' }}>Duration</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input name="duration" type="number" value={form.duration} onChange={handle} min={1} required 
                  style={{ width: '100%', background: 'transparent', border: '1px solid #1f1f1f', borderRadius: 10, height: 44, padding: '0 16px', fontSize: 14, color: '#fff' }} />
                <span style={{ position: 'absolute', right: 16, fontSize: 14, color: 'var(--text-muted)', opacity: 0.6 }}>minutes</span>
              </div>
            </div>
          </form>
        </div>

        <div style={{ padding: '20px 32px', borderTop: '1px solid #1f1f1f', display: 'flex', justifyContent: 'flex-end', gap: 12, background: 'rgba(255,255,255,0.02)' }}>
          <button type="button" className="btn-secondary" onClick={onClose} 
            style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: 'transparent', fontWeight: 600, color: '#fff' }}>
            Close
          </button>
          <button type="submit" className="btn-primary" disabled={saving} onClick={submit}
            style={{ padding: '8px 24px', borderRadius: 8, background: '#fff', color: '#000', fontWeight: 600, border: 'none' }}>
            {saving ? 'Saving…' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────── 3-dot Dropdown ──────────── */
function EventMenu({ et, onEdit, onDelete, onDuplicate, onEmbed }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => !ref.current?.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="btn-icon" 
        style={{ 
          width: 38, 
          height: 38, 
          border: '1px solid #1f1f1f', 
          borderRadius: 8, 
          background: open ? '#1f1f1f' : 'rgba(255,255,255,0.03)',
          color: '#888'
        }}
        onClick={() => setOpen(!open)}>
        <MoreHorizontal className="w-[18px] h-[18px]" />
      </button>
      {open && (
        <div className="dropdown-menu" style={{ 
          minWidth: 180, 
          padding: 6, 
          background: '#1c1c1c', 
          border: '1px solid #2a2a2a', 
          borderRadius: 12,
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}>
          <div
            className="dropdown-item"
            style={{ borderRadius: 8, padding: '8px 12px', gap: 12 }}
            onClick={() => {
              onEdit();
              setOpen(false);
            }}
          >
            <Pencil className="w-4 h-4" /> Edit
          </div>
          <div
            className="dropdown-item"
            style={{ borderRadius: 8, padding: '8px 12px', gap: 12 }}
            onClick={() => {
              onDuplicate();
              setOpen(false);
            }}
          >
            <Copy className="w-4 h-4" /> Duplicate
          </div>
          <div
            className="dropdown-item"
            style={{ borderRadius: 8, padding: '8px 12px', gap: 12 }}
            onClick={() => {
              onEmbed();
              setOpen(false);
            }}
          >
            <Code2 className="w-4 h-4" /> Embed
          </div>
          <div className="dropdown-divider" style={{ margin: '6px 0', background: '#2a2a2a' }} />
          <div
            className="dropdown-item danger"
            style={{ borderRadius: 8, padding: '8px 12px', gap: 12, color: '#ff4d4d' }}
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
          >
            <Trash2 className="w-4 h-4" /> Delete
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────── Toggle ──────────── */
function Toggle({ checked, onChange }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <div className="toggle-track" />
      <div className="toggle-thumb" />
    </label>
  );
}

/* ──────────── Main Page ──────────── */
export default function EventTypesPage() {
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [hidden, setHidden] = useState({});

  const fetch = async () => {
    try {
      const res = await getEventTypes();
      setEventTypes(res.data);
    } catch { setError('Could not load event types'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const handleCreate = async (data) => {
    try { await createEventType(data); setShowModal(false); fetch(); }
    catch (e) { setError(e.response?.data?.error || 'Failed to create'); }
  };
  const handleUpdate = async (data) => {
    try { await updateEventType(editItem.id, data); setEditItem(null); fetch(); }
    catch (e) { setError(e.response?.data?.error || 'Failed to update'); }
  };
  const handleDelete = async (id) => {
    if (!confirm('Delete this event type?')) return;
    try { 
      await deleteEventType(id); 
      fetch(); 
    } catch (e) { 
      const msg = e.response?.data?.error || 'Failed to delete';
      setError(msg); 
    }
  };

  const handleDuplicate = async (et) => {
    const payload = {
      title: `${et.title} copy`,
      description: et.description || '',
      duration: et.duration,
      slug: `${et.slug}-copy`,
      userId: et.userId,
    };
    try {
      await createEventType(payload);
      fetch();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to duplicate');
    }
  };

  const handleEmbed = (et) => {
    const url = `${window.location.origin}/book/${et.slug}`;
    const snippet = `<iframe src="${url}" style="width:100%;height:600px;border:0;" allowfullscreen></iframe>`;
    navigator.clipboard
      .writeText(snippet)
      .then(() => {
        alert('Embed code copied to clipboard.');
      })
      .catch(() => {
        setError('Could not copy embed code');
      });
  };

  const filtered = eventTypes.filter(et => et.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-in" style={{ minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 24px 0' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Event types</h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Configure different events for people to book on your calendar.</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search className="w-4 h-4" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                style={{ paddingLeft: 36, width: 280, height: 40, background: '#111', border: '1px solid #222', borderRadius: 10, fontSize: 14 }} />
            </div>
            <button className="btn-primary" onClick={() => setShowModal(true)} style={{ padding: '8px 18px', borderRadius: 10, fontWeight: 600 }}>
              <Plus className="w-4 h-4" /> New
            </button>
          </div>
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
              <Clock className="w-10 h-10" />
              <p>{search ? 'No results match your search.' : 'No event types yet — create your first one.'}</p>
            </div>
          ) : (
            <div style={{ background: 'transparent', border: '1px solid #1f1f1f', borderRadius: 16 }}>
              {filtered.map((et, idx) => (
                <div key={et.id}
                  className="card-hover"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '20px 32px', 
                    gap: 16,
                    borderBottom: idx === filtered.length - 1 ? 'none' : '1px solid #1f1f1f',
                    background: 'transparent',
                    transition: 'background-color 0.2s',
                  }}>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, color: '#fff', fontSize: 15 }}>{et.title}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>/{et.slug}</span>
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 6, padding: '3px 8px' }}>
                      <Clock className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{et.duration}m</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 12 }}>
                      {hidden[et.id] && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Hidden</span>}
                      <Toggle
                        checked={!!hidden[et.id]}
                        onChange={() => setHidden((p) => ({ ...p, [et.id]: !p[et.id] }))}
                      />
                    </div>
                    <EventMenu
                      et={et}
                      onEdit={() => setEditItem(et)}
                      onDelete={() => handleDelete(et.id)}
                      onDuplicate={() => handleDuplicate(et)}
                      onEmbed={() => handleEmbed(et)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && <EventModal onClose={() => setShowModal(false)} onSubmit={handleCreate} />}
      {editItem && <EventModal onClose={() => setEditItem(null)} onSubmit={handleUpdate} initial={editItem} />}
    </div>
  );
}
