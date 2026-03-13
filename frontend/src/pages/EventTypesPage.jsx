import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getEventTypes, createEventType, updateEventType, deleteEventType, getUsers } from '../api';
import { Plus, Clock, Pencil, Trash2, Search, MoreHorizontal, Copy, Code2, ExternalLink, Link as LinkIcon } from 'lucide-react';

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
    <div className="modal-backdrop px-4" onClick={(e) => e.target === e.currentTarget && onClose()} style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div className="modal-box w-full max-w-[520px] bg-[#111] border border-[#1f1f1f] rounded-2xl overflow-hidden animate-in">
        <div className="p-6 sm:p-10 pb-6 sm:pb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">
            {initial ? 'Edit event type' : 'Add a new event type'}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-8">
            Set up event types to offer different types of meetings.
          </p>

          <form onSubmit={submit} className="flex flex-col gap-5 sm:gap-6">
            <div className="form-group mb-0">
              <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white/50 mb-2 block">Title</label>
              <input name="title" value={form.title} onChange={handle} required 
                placeholder="Quick chat" 
                className="w-full bg-transparent border border-[#1f1f1f] rounded-xl h-11 px-4 text-sm text-white outline-none focus:border-[var(--accent)] transition-colors" />
            </div>

            <div className="form-group mb-0">
              <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white/50 mb-2 block">URL</label>
              <div className="flex items-center bg-transparent border border-[#1f1f1f] rounded-xl overflow-hidden focus-within:border-[var(--accent)] transition-colors">
                <span className="hidden sm:block pl-4 pr-1 text-[var(--text-muted)] text-[13px] opacity-60">
                  cal.com/.../
                </span>
                <input name="slug" value={form.slug} onChange={handle} required
                  className="bg-transparent h-11 px-4 sm:pl-0 text-sm flex-1 text-white outline-none"
                  placeholder="slug" />
              </div>
            </div>

            <div className="form-group mb-0">
              <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white/50 mb-2 block">Description</label>
              <div className="border border-[#1f1f1f] rounded-xl bg-transparent overflow-hidden focus-within:border-[var(--accent)] transition-colors">
                <div className="flex gap-4 p-3 border-b border-[#1f1f1f] bg-white/[0.02]">
                  <span className="text-sm font-bold opacity-30 cursor-not-allowed text-white">B</span>
                  <span className="text-sm italic opacity-30 cursor-not-allowed text-white">I</span>
                </div>
                <textarea name="description" value={form.description} onChange={handle} rows={3} 
                  placeholder="A quick video meeting." 
                  className="w-full bg-transparent border-none p-4 text-sm text-white resize-none outline-none" />
              </div>
            </div>

            <div className="form-group mb-0">
              <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white/50 mb-2 block">Duration</label>
              <div className="relative flex items-center">
                <input name="duration" type="number" value={form.duration} onChange={handle} min={1} required 
                  className="w-full bg-transparent border border-[#1f1f1f] rounded-xl h-11 px-4 text-sm text-white outline-none focus:border-[var(--accent)] transition-colors" />
                <span className="absolute right-4 text-xs font-medium text-[var(--text-muted)] opacity-60">minutes</span>
              </div>
            </div>
          </form>
        </div>

        <div className="p-5 sm:p-6 bg-white/[0.02] border-t border-[#1f1f1f] flex flex-col sm:flex-row justify-end gap-3 px-6">
          <button type="button" className="text-sm font-bold text-white px-6 py-2.5 rounded-xl hover:bg-white/5 transition-colors order-2 sm:order-1" onClick={onClose}>
            Close
          </button>
          <button type="submit" className="bg-white text-black text-sm font-bold px-8 py-2.5 rounded-xl hover:bg-slate-100 transition-colors order-1 sm:order-2" disabled={saving} onClick={submit}>
            {saving ? 'Saving…' : (initial ? 'Update' : 'Continue')}
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
    <div ref={ref} className="relative inline-block text-left">
      <button 
        className={`flex items-center justify-center w-8 h-8 border border-[#1f1f1f] rounded-md transition-all
          ${open ? 'bg-white/10 text-white' : 'bg-transparent text-[#888] hover:bg-white/5 hover:text-white'}
        `}
        onClick={() => setOpen(!open)}>
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 z-[60] min-w-[180px] p-1.5 bg-[#161616] border border-[#2a2a2a] rounded-xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.4),0_4px_6px_-2px_rgba(0,0,0,0.05)] animate-in slide-in-from-top-1 fade-in duration-200">
          <button
            className="w-full flex items-center gap-3 px-3 py-2 text-xs sm:text-sm text-[#a3a3a3] hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
            onClick={() => { onEdit(); setOpen(false); }}
          >
            <Pencil className="w-3.5 h-3.5" /> <span>Edit</span>
          </button>
          <button
            className="w-full flex items-center gap-3 px-3 py-2 text-xs sm:text-sm text-[#a3a3a3] hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
            onClick={() => {
              const url = `${window.location.origin}/book/${et.slug}`;
              navigator.clipboard.writeText(url).then(() => alert('Booking link copied!'));
              setOpen(false);
            }}
          >
            <Copy className="w-3.5 h-3.5" /> <span>Copy Link</span>
          </button>
          <button
            className="w-full flex items-center gap-3 px-3 py-2 text-xs sm:text-sm text-[#a3a3a3] hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
            onClick={() => { onDuplicate(); setOpen(false); }}
          >
            <Copy className="w-3.5 h-3.5" /> <span>Duplicate</span>
          </button>
          <button
            className="w-full flex items-center gap-3 px-3 py-2 text-xs sm:text-sm text-[#a3a3a3] hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
            onClick={() => { onEmbed(); setOpen(false); }}
          >
            <Code2 className="w-3.5 h-3.5" /> <span>Embed</span>
          </button>
          <div className="h-px bg-[#2a2a2a] my-1.5 mx-1" />
          <button
            className="w-full flex items-center gap-3 px-3 py-2 text-xs sm:text-sm text-[#f87171] hover:bg-red-500/10 rounded-lg transition-colors text-left font-medium"
            onClick={() => { onDelete(); setOpen(false); }}
          >
            <Trash2 className="w-3.5 h-3.5" /> <span>Delete</span>
          </button>
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
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('new') === 'true') {
      setShowModal(true);
      // Clean up URL after opening modal
      navigate('/admin/event-types', { replace: true });
    }
  }, [location.search, navigate]);

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
    <div className="animate-in pb-12" style={{ minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 sm:mb-12">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-1 sm:mb-2">Event types</h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">Configure different events for people to book on your calendar.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative group">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#666] group-focus-within:text-white transition-colors" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="w-full sm:w-[180px] md:w-[220px] bg-black border border-[#1f1f1f] rounded-md h-9 pl-9 pr-4 text-sm text-white outline-none focus:border-[#444] transition-all" />
            </div>
            <button className="bg-white text-black whitespace-nowrap px-4 py-1.5 rounded-md font-semibold text-sm flex items-center justify-center gap-1.5 hover:bg-white/90 transition-colors" onClick={() => setShowModal(true)}>
              <Plus className="w-3.5 h-3.5" /> New
            </button>
          </div>
        </div>

        <div>
          {error && (
            <div className="mb-6 p-3 sm:p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm animate-in">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:gap-4 overflow-visible">
            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center bg-white/[0.01] border border-[#1f1f1f] rounded-lg animate-pulse text-white/30">
                Loading event types…
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white/[0.01] border border-[#1f1f1f] border-dashed rounded-lg">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
                  <Clock className="w-8 h-8 text-[var(--text-muted)] opacity-40" />
                </div>
                <h3 className="text-white font-bold mb-1">No results found</h3>
                <p className="text-sm text-[var(--text-secondary)] opacity-60 max-w-[280px]">
                  {search ? `Your search "${search}" didn't match any events.` : 'Start by creating your first event type.'}
                </p>
              </div>
            ) : (
              <div className="bg-black border border-[#1f1f1f] rounded-lg overflow-hidden">
                {filtered.map((et, index) => (
                  <div key={et.id} 
                    className={`group flex items-center justify-between py-3 px-4 hover:bg-[#111] transition-colors cursor-pointer ${index !== filtered.length - 1 ? 'border-b border-[#1f1f1f]' : ''}`} 
                    onClick={() => setEditItem(et)}>
                    
                    {/* Left side: Details */}
                    <div className="flex flex-col gap-1 min-w-0 pr-4">
                      <div className="flex flex-col">
                        <span className="text-[14px] font-semibold text-white tracking-tight">{et.title}</span>
                        <span className="text-[13px] text-[#666] font-normal truncate mt-0.5">/udit-bhardwaj-dorkjw/{et.slug}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="inline-flex items-center gap-1.5 px-1.5 py-0.5 border border-[#1f1f1f] bg-black text-white rounded">
                          <Clock className="w-3 h-3 opacity-60" />
                          <span className="text-[10px] font-medium">{et.duration}m</span>
                        </div>
                      </div>
                    </div>

                    {/* Right side: Grouped Controls */}
                    <div className="flex items-center gap-2 bg-neutral-900 border border-[#1f1f1f] rounded-lg px-2 py-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center pr-1 border-r border-[#1f1f1f] mr-1 gap-2">
                        {hidden[et.id] && (
                          <span className="text-[12px] text-[#666] font-medium">Hidden</span>
                        )}
                        <Toggle
                          checked={!hidden[et.id]}
                          onChange={() => setHidden((p) => ({ ...p, [et.id]: !p[et.id] }))}
                        />
                      </div>
                      
                      <button 
                        onClick={() => window.open(`/book/${et.slug}`, '_blank')}
                        className="w-7 h-7 flex items-center justify-center rounded-md text-[#888] hover:text-white hover:bg-white/5 transition-colors"
                        title="Open link">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      
                      <button 
                        onClick={() => {
                          const url = `${window.location.origin}/book/${et.slug}`;
                          navigator.clipboard.writeText(url).then(() => alert('Copied!'));
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-md text-[#888] hover:text-white hover:bg-white/5 transition-colors"
                        title="Copy link">
                        <LinkIcon className="w-3.5 h-3.5" />
                      </button>
                      
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
      </div>

      {showModal && <EventModal onClose={() => setShowModal(false)} onSubmit={handleCreate} />}
      {editItem && <EventModal onClose={() => setEditItem(null)} onSubmit={handleUpdate} initial={editItem} />}
    </div>
  );
}
