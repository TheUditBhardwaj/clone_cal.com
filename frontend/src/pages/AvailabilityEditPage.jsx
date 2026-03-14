import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Copy, Pencil, Plus, Trash2, X } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, isBefore, isSameDay, isAfter, parseISO, startOfDay } from 'date-fns';
import { getScheduleById, createSchedule, updateSchedule, deleteSchedule, getUsers } from '../api';
import { motion, AnimatePresence } from 'framer-motion';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIMEZONES = [
  'Asia/Kolkata', 'Asia/Calcutta', 'America/New_York', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Australia/Sydney', 'Asia/Tokyo', 'UTC',
];

const NEW_SCHEDULE = {
  name: 'New schedule',
  timezone: 'Asia/Kolkata',
  isDefault: false,
  days: [
    { day: 0, enabled: false, slots: [{ start: '09:00', end: '17:00' }] },
    { day: 1, enabled: true,  slots: [{ start: '09:00', end: '17:00' }] },
    { day: 2, enabled: true,  slots: [{ start: '09:00', end: '17:00' }] },
    { day: 3, enabled: true,  slots: [{ start: '09:00', end: '17:00' }] },
    { day: 4, enabled: true,  slots: [{ start: '09:00', end: '17:00' }] },
    { day: 5, enabled: true,  slots: [{ start: '09:00', end: '17:00' }] },
    { day: 6, enabled: false, slots: [{ start: '09:00', end: '17:00' }] },
  ],
  overrides: [],
};

function Toggle({ checked, onChange }) {
  return (
    <label className="toggle" style={{ cursor: 'pointer' }}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <div className="toggle-track" />
      <div className="toggle-thumb" />
    </label>
  );
}

function TimeInput({ value, onChange }) {
  return (
    <input type="time" value={value} onChange={(e) => onChange(e.target.value)}
      className="time-input-refined"
      style={{
        width: 126, padding: '8px 12px', background: 'var(--bg-input)',
        border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
        color: 'var(--text-primary)', fontSize: 13, fontVariantNumeric: 'tabular-nums',
        outline: 'none', transition: 'all 0.1s'
      }} />
  );
}

function OverrideCalendar({ onClose, onAdd }) {
  const [viewMonth, setViewMonth] = useState(startOfMonth(new Date()));
  const [selectedDates, setSelectedDates] = useState([]);
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('17:00');
  const [unavailable, setUnavailable] = useState(false);
  
  const s = startOfWeek(startOfMonth(viewMonth));
  const e = endOfWeek(endOfMonth(viewMonth));
  const days = eachDayOfInterval({ start: s, end: e });
  const today = new Date();

  const handleDayClick = (day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    if (selectedDates.includes(dateStr)) {
      setSelectedDates(selectedDates.filter(d => d !== dateStr));
    } else {
      setSelectedDates([...selectedDates, dateStr]);
    }
  };

  const handleSave = () => {
    if (selectedDates.length === 0) return;
    selectedDates.forEach(dateStr => {
      onAdd({ 
        date: dateStr, 
        start: unavailable ? '00:00' : start, 
        end: unavailable ? '00:00' : end,
        unavailable
      });
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" style={{ background: 'rgba(0,0,0,.9)' }} onClick={(ev) => ev.target === ev.currentTarget && onClose()}>
      <div style={{ 
        background: '#0a0a0a', 
        border: '1px solid #1f1f1f', 
        borderRadius: 24, 
        width: 780, 
        display: 'flex',
        overflow: 'hidden',
        animation: 'fade-in .15s ease' 
      }}>
        {/* Left Pane: Calendar */}
        <div style={{ flex: 1, padding: 32, borderRight: '1px solid #1f1f1f' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24, color: '#fff', letterSpacing: '-0.02em' }}>Select the dates to override</h2>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
              {format(viewMonth, 'MMMM')} <span style={{ opacity: 0.5 }}>{format(viewMonth, 'yyyy')}</span>
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-icon" style={{ padding: 8, background: '#111', borderRadius: 8 }} onClick={() => setViewMonth(subMonths(viewMonth, 1))}><ChevronLeft className="w-4 h-4" /></button>
              <button className="btn-icon" style={{ padding: 8, background: '#111', borderRadius: 8 }} onClick={() => setViewMonth(addMonths(viewMonth, 1))}><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 8 }}>
            {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 800, color: '#4b5563', paddingBottom: 8, letterSpacing: '0.05em' }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
            {days.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const isSel = selectedDates.includes(dateStr);
              const past = isBefore(day, startOfDay(today)) && !isToday(day);
              const out = !isSameMonth(day, viewMonth);
              const cur = isToday(day);
              
              return (
                <button 
                  key={dateStr}
                  disabled={past || out}
                  onClick={() => handleDayClick(day)}
                  style={{
                    aspectRatio: '1', 
                    borderRadius: 12,
                    border: 'none',
                    cursor: past || out ? 'default' : 'pointer',
                    background: isSel ? '#fff' : cur ? '#1a1a1a' : 'transparent',
                    color: isSel ? '#000' : out || past ? '#374151' : '#fff',
                    fontWeight: isSel ? 900 : 600, 
                    fontSize: 14, 
                    position: 'relative',
                    transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
                    opacity: out && !isSel ? 0.2 : 1
                  }}
                >
                  {format(day, 'd')}
                  {cur && (
                    <span style={{ 
                      position: 'absolute', 
                      bottom: 6, 
                      left: '50%', 
                      transform: 'translateX(-50%)', 
                      width: 4, 
                      height: 4, 
                      borderRadius: '50%', 
                      background: isSel ? '#000' : '#6d28d9' 
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Configuration */}
        <div style={{ width: 320, padding: 32, display: 'flex', flexDirection: 'column', background: '#080808' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 24 }}>Which hours are you free?</h3>
            
            {!unavailable && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ flex: 1 }}>
                  <input 
                    type="time" 
                    value={start} 
                    onChange={(e) => setStart(e.target.value)}
                    style={{ 
                      width: '100%', padding: '12px', background: '#111', border: '1px solid #1f1f1f', borderRadius: 12, 
                      color: '#fff', fontSize: 13, fontWeight: 600, outline: 'none'
                    }} 
                  />
                </div>
                <span style={{ color: '#4b5563', fontWeight: 700 }}>–</span>
                <div style={{ flex: 1 }}>
                  <input 
                    type="time" 
                    value={end} 
                    onChange={(e) => setEnd(e.target.value)}
                    style={{ 
                      width: '100%', padding: '12px', background: '#111', border: '1px solid #1f1f1f', borderRadius: 12, 
                      color: '#fff', fontSize: 13, fontWeight: 600, outline: 'none'
                    }} 
                  />
                </div>
              </div>
            )}

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              padding: '16px', 
              background: '#111', 
              borderRadius: 16, 
              border: '1px solid #1f1f1f' 
            }}>
              <Toggle checked={unavailable} onChange={() => setUnavailable(!unavailable)} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Mark unavailable (All day)</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, marginTop: 32 }}>
            <button 
              onClick={onClose}
              style={{ padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 700, color: '#9ca3af', border: 'none', background: 'transparent', cursor: 'pointer' }}
            >
              Close
            </button>
            <button 
              onClick={handleSave}
              disabled={selectedDates.length === 0}
              style={{ 
                padding: '12px 24px', 
                borderRadius: 12, 
                fontSize: 14, 
                fontWeight: 800, 
                color: '#000', 
                background: selectedDates.length === 0 ? '#1a1a1a' : '#fff', 
                border: 'none', 
                cursor: selectedDates.length === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Save override
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function dbToLocal(dbSchedule) {
  const dayMap = {};
  for (let i = 0; i < 7; i++) dayMap[i] = { day: i, enabled: false, slots: [{ start: '09:00', end: '17:00' }] };
  for (const slot of (dbSchedule.days || [])) {
    const d = slot.dayOfWeek;
    if (!dayMap[d].enabled) {
      dayMap[d].enabled = true;
      dayMap[d].slots = [{ start: slot.startTime?.slice(0, 5), end: slot.endTime?.slice(0, 5) }];
    } else {
      dayMap[d].slots.push({ start: slot.startTime?.slice(0, 5), end: slot.endTime?.slice(0, 5) });
    }
  }
  return {
    userId: dbSchedule.userId,
    name: dbSchedule.name,
    timezone: dbSchedule.timezone,
    isDefault: dbSchedule.isDefault,
    days: Object.values(dayMap).sort((a, b) => a.day - b.day),
    overrides: (dbSchedule.overrides || []).map(ov => ({
      id: ov.id,
      date: ov.overrideDate,
      start: ov.startTime?.slice(0, 5),
      end: ov.endTime?.slice(0, 5),
    })),
  };
}

export default function AvailabilityEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = id === 'new';
  const [schedule, setSchedule] = useState(NEW_SCHEDULE);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (isNew) {
      getUsers().then(res => {
        if (res.data && res.data.length > 0) {
          setSchedule(prev => ({ ...prev, userId: res.data[0].id }));
        }
      });
      return;
    }
    (async () => {
      try {
        const res = await getScheduleById(id);
        setSchedule(dbToLocal(res.data));
      } catch { navigate('/admin/availability'); }
      finally { setLoading(false); }
    })();
  }, [id, isNew]);

  const toggleDay = (i) => setSchedule(prev => ({
    ...prev,
    days: prev.days.map((d, idx) => idx === i ? { ...d, enabled: !d.enabled } : d),
  }));

  const updateSlot = (dayIdx, slotIdx, field, val) => setSchedule(prev => ({
    ...prev,
    days: prev.days.map((d, di) => di !== dayIdx ? d : {
      ...d,
      slots: d.slots.map((s, si) => si !== slotIdx ? s : { ...s, [field]: val }),
    }),
  }));

  const addSlot = (dayIdx) => setSchedule(prev => ({
    ...prev,
    days: prev.days.map((d, di) => di !== dayIdx ? d : {
      ...d, slots: [...d.slots, { start: '09:00', end: '17:00' }],
    }),
  }));

  const copyDay = (dayIdx) => {
    const slots = schedule.days[dayIdx].slots;
    setSchedule(prev => ({
      ...prev,
      days: prev.days.map((d, di) => !d.enabled || di === dayIdx ? d : { ...d, slots: JSON.parse(JSON.stringify(slots)) }),
    }));
  };

  const addOverride = (ov) => {
    setSchedule(prev => ({ ...prev, overrides: [...prev.overrides, ov] }));
    setShowCalendar(false);
  };

  const removeOverride = (idx) => setSchedule(prev => ({ ...prev, overrides: prev.overrides.filter((_, i) => i !== idx) }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        userId: schedule.userId,
        name: schedule.name,
        timezone: schedule.timezone,
        isDefault: schedule.isDefault,
        days: schedule.days,
        overrides: schedule.overrides,
      };
      if (isNew) {
        await createSchedule(payload);
      } else {
        await updateSchedule(id, payload);
      }
      setSaved(true);
      setTimeout(() => { navigate('/admin/availability'); }, 800);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this schedule?')) return;
    try { await deleteSchedule(id); navigate('/admin/availability'); }
    catch (e) { console.error(e); }
  };

  const summary = (() => {
    const en = schedule.days.filter(d => d.enabled);
    if (!en.length) return 'No days selected';
    const sorted = [...en].sort((a, b) => a.day - b.day);
    const names = sorted.map(d => DAYS[d.day].slice(0, 3));
    const seq = sorted.every((d, i) => i === 0 || d.day === sorted[i-1].day + 1);
    const dayStr = seq && names.length > 2 ? `${names[0]} - ${names[names.length-1]}` : names.join(', ');
    const s = sorted[0].slots[0];
    const h1 = parseInt(s.start);
    const h2 = parseInt(s.end);
    const fmtT = (t) => { const [hh,mm] = t.split(':'); const h=parseInt(hh); return `${h%12||12}:${mm} ${h>=12?'PM':'AM'}`; };
    return `${dayStr}, ${fmtT(s.start)} - ${fmtT(s.end)}`;
  })();

  if (loading) return <div className="empty-state" style={{ minHeight: '100vh' }}><p>Loading…</p></div>;

  return (
    <div className="animate-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
      {/* Header */}
      <div className="px-4 py-4 sm:px-8 sm:py-6 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-10 bg-[var(--bg-sidebar)]">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/availability')} className="btn-icon">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            {editingName ? (
              <input 
                autoFocus
                className="bg-transparent text-lg font-bold outline-none border-b border-[var(--accent)] text-[var(--text-primary)] w-full max-w-[200px]"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={() => { setSchedule(p => ({ ...p, name: tempName })); setEditingName(false); }}
                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
              />
            ) : (
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setTempName(schedule.name); setEditingName(true); }}>
                <span className="text-base sm:text-lg font-bold text-[var(--text-primary)]">{schedule.name}</span>
                <Pencil className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              </div>
            )}
            <p className="text-[10px] sm:text-xs text-[var(--text-secondary)] mt-0.5">{summary}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 justify-end">
          <div className="flex items-center gap-2 bg-[var(--bg-input)] px-3 py-1.5 rounded-lg border border-[var(--border)]">
            <span className="text-[10px] sm:text-xs text-[var(--text-secondary)] font-medium">Set as default</span>
            <Toggle checked={schedule.isDefault} onChange={() => setSchedule(p => ({ ...p, isDefault: !p.isDefault }))} />
          </div>
          <div className="hidden sm:block w-px h-6 bg-[var(--border)]" />
          {!isNew && <button className="btn-icon text-red-500" onClick={handleDelete} title="Delete schedule"><Trash2 className="w-4.5 h-4.5" /></button>}
          <button className="btn-primary px-4 sm:px-6 py-2 text-xs sm:text-sm" onClick={handleSave} disabled={saving}>
            {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto flex flex-col lg:flex-row lg:justify-center">
        <div className="w-full max-w-[1600px] flex flex-col lg:flex-row">
          {/* Main column */}
          <div className="flex-1 p-6 sm:p-10 lg:p-12 border-b lg:border-b-0 lg:border-r border-[var(--border)]">
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 24 }}>Weekly Hours</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {schedule.days.map((dayObj, di) => (
                <div key={di} className={`
                  flex flex-col sm:flex-row items-start gap-4 sm:gap-8 lg:gap-12 p-4 sm:p-5 rounded-2xl transition-all duration-200
                  ${dayObj.enabled ? 'bg-transparent' : 'bg-white/[0.01] border border-[var(--border)]'}
                `}>
                  <div className="flex items-center gap-3 w-full sm:w-[140px] lg:w-[160px] pt-1.5 flex-shrink-0">
                    <Toggle checked={dayObj.enabled} onChange={() => toggleDay(di)} />
                    <span className={`text-sm font-bold tracking-tight ${dayObj.enabled ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                      {DAYS[di]}
                    </span>
                  </div>
                  <div className="flex-1 w-full sm:w-auto">
                    {!dayObj.enabled ? (
                      <span className="text-xs sm:text-sm text-[var(--text-muted)] pt-2 sm:pt-4 display-block font-medium">Unavailable</span>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {dayObj.slots.map((slot, si) => (
                          <div key={si} className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                              <TimeInput value={slot.start} onChange={(v) => updateSlot(di, si, 'start', v)} />
                              <span className="text-[var(--text-muted)] font-medium">–</span>
                              <TimeInput value={slot.end} onChange={(v) => updateSlot(di, si, 'end', v)} />
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {si === 0 && (
                                <>
                                  <button className="btn-icon w-8 h-8 rounded-lg border border-[var(--border)]" onClick={() => addSlot(di)} title="Add slot"><Plus className="w-4 h-4" /></button>
                                  <button className="btn-icon w-8 h-8 rounded-lg border border-[var(--border)]" onClick={() => copyDay(di)} title="Copy to all days"><Copy className="w-3.5 h-3.5" /></button>
                                </>
                              )}
                              {si > 0 && (
                                <button className="btn-icon w-8 h-8 rounded-lg border border-[var(--border)] text-red-500"
                                  onClick={() => setSchedule(prev => ({ ...prev, days: prev.days.map((d, dIdx) => dIdx !== di ? d : { ...d, slots: d.slots.filter((_, sIdx) => sIdx !== si) }) }))}>
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ height: 1, background: 'var(--border)', margin: '48px 0' }} />

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Date overrides</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>Add dates when your availability changes from your daily hours.</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {schedule.overrides.map((ov, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '16px', 
                    background: 'var(--bg-sidebar)', 
                    border: '1px solid var(--border)', 
                    borderRadius: 12,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{format(parseISO(ov.date), 'MMMM d, yyyy')}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
                        {ov.start} – {ov.end}
                      </p>
                    </div>
                    <button className="btn-icon" style={{ color: 'var(--text-muted)' }} onClick={() => removeOverride(idx)}><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                
                <button 
                  onClick={() => setShowCalendar(true)}
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center',
                    padding: '16px', 
                    background: 'transparent', 
                    border: '2px dashed var(--border)', 
                    borderRadius: 12,
                    cursor: 'pointer',
                    gap: 8,
                    color: 'var(--text-secondary)',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--text-muted)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <Plus className="w-5 h-5" />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>Add an override</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div style={{ width: 300, padding: '40px 32px', flexShrink: 0 }}>
            <div style={{ marginBottom: 32 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 10 }}>Timezone</label>
              <select value={schedule.timezone} onChange={(e) => setSchedule(p => ({ ...p, timezone: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: 'var(--bg-input)' }}>
                {TIMEZONES.map(tz => <option key={tz}>{tz}</option>)}
              </select>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>All times are shown in your local timezone.</p>
            </div>
            
            <div style={{ padding: '24px 20px', borderRadius: 12, background: 'rgba(109,40,217,0.05)', border: '1px solid rgba(109,40,217,0.1)' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Troubleshooter</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.4 }}>Something doesn't look right? Check your availability for specific dates.</p>
              <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: 12, background: '#fff', color: '#000', border: 'none', fontWeight: 600 }}>
                Launch troubleshooter
              </button>
            </div>
          </div>
        </div>
      </div>

      {showCalendar && <OverrideCalendar onClose={() => setShowCalendar(false)} onAdd={addOverride} />}
    </div>
  );
}
