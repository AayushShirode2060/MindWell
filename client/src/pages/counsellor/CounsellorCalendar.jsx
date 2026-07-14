import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { appointmentEndpoints, counsellorEventEndpoints } from '../../api/endpoints';
import { ChevronLeft, ChevronRight, Loader, Plus, X, Trash2, Edit2 } from 'lucide-react';

const eventColors = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  red: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
};

const statusColor = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-100 text-red-700',
  emergency: 'bg-red-200 text-red-800',
};

const CounsellorCalendar = () => {
  const [appointments, setAppointments] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  // Add event form
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [eventForm, setEventForm] = useState({ title: '', date: '', time: '', color: 'blue', notes: '' });
  const [editingEventId, setEditingEventId] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [apptsRes, eventsRes] = await Promise.all([
        API.get(appointmentEndpoints.GET_COUNSELLOR_APPOINTMENTS_API),
        API.get(counsellorEventEndpoints.GET_EVENTS_API),
      ]);
      setAppointments(apptsRes.data.appointments);
      setEvents(eventsRes.data.events);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const calendarMonth = calendarDate.getMonth();
  const calendarYear = calendarDate.getFullYear();
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1).getDay();

  const getApptsForDay = (day) => {
    return appointments.filter(a => {
      const ad = new Date(a.date);
      return ad.getDate() === day && ad.getMonth() === calendarMonth && ad.getFullYear() === calendarYear;
    });
  };

  const getEventsForDay = (day) => {
    return events.filter(e => {
      const ed = new Date(e.date);
      return ed.getDate() === day && ed.getMonth() === calendarMonth && ed.getFullYear() === calendarYear;
    });
  };

  const handleAddEvent = async () => {
    if (!eventForm.title || !eventForm.date) return;
    try {
      if (editingEventId) {
        await API.put(`${counsellorEventEndpoints.UPDATE_EVENT_API}/${editingEventId}`, eventForm);
      } else {
        await API.post(counsellorEventEndpoints.CREATE_EVENT_API, eventForm);
      }
      setShowAddEvent(false);
      setEventForm({ title: '', date: '', time: '', color: 'blue', notes: '' });
      setEditingEventId(null);
      fetchAll();
    } catch (err) { console.error(err); }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await API.delete(`${counsellorEventEndpoints.DELETE_EVENT_API}/${id}`);
      setEvents(prev => prev.filter(e => e._id !== id));
    } catch (err) { console.error(err); }
  };

  const startEditEvent = (event) => {
    setEditingEventId(event._id);
    setEventForm({
      title: event.title,
      date: new Date(event.date).toISOString().split('T')[0],
      time: event.time || '',
      color: event.color || 'blue',
      notes: event.notes || ''
    });
    setShowAddEvent(true);
  };

  const openAddForDay = (day) => {
    const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setEventForm({ title: '', date: dateStr, time: '', color: 'blue', notes: '' });
    setEditingEventId(null);
    setShowAddEvent(true);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader size={24} className="animate-spin text-text-muted" />
    </div>
  );

  const selectedDayAppts = selectedDay ? getApptsForDay(selectedDay) : [];
  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-main">calendar</h1>
          <p className="text-text-muted mt-1">Your monthly schedule at a glance</p>
        </div>
        <button onClick={() => { setShowAddEvent(!showAddEvent); setEditingEventId(null); setEventForm({ title: '', date: '', time: '', color: 'blue', notes: '' }); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-dark text-white rounded-xl text-xs font-semibold border-none cursor-pointer">
          <Plus size={14} /> Add Event
        </button>
      </div>

      {/* Add/Edit Event Form */}
      {showAddEvent && (
        <div className="bg-white rounded-2xl p-5 border border-border-custom mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold">{editingEventId ? '✏️ Edit Event' : '➕ New Event'}</h3>
            <button onClick={() => { setShowAddEvent(false); setEditingEventId(null); }}
              className="bg-transparent border-none cursor-pointer text-text-muted">
              <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-text-muted mb-1 block">Title *</label>
              <input type="text" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                placeholder="e.g. Staff meeting, Workshop..."
                className="w-full px-3 py-2 border-2 border-border-custom rounded-lg text-xs bg-surface outline-none focus:border-dark" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-text-muted mb-1 block">Date *</label>
              <input type="date" value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                className="w-full px-3 py-2 border-2 border-border-custom rounded-lg text-xs bg-surface outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-text-muted mb-1 block">Time (optional)</label>
              <input type="time" value={eventForm.time} onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                className="w-full px-3 py-2 border-2 border-border-custom rounded-lg text-xs bg-surface outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-text-muted mb-1 block">Color</label>
              <div className="flex gap-2 mt-1">
                {Object.keys(eventColors).map(c => (
                  <button key={c} onClick={() => setEventForm({ ...eventForm, color: c })}
                    className={`w-7 h-7 rounded-full cursor-pointer border-2 transition-all ${eventColors[c].dot.replace('bg-', 'bg-')} ${
                      eventForm.color === c ? 'border-dark scale-110 shadow-md' : 'border-transparent'}`}
                    style={{ backgroundColor: c === 'blue' ? '#3b82f6' : c === 'emerald' ? '#10b981' : c === 'amber' ? '#f59e0b' : c === 'red' ? '#ef4444' : '#8b5cf6' }} />
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold uppercase text-text-muted mb-1 block">Notes (optional)</label>
              <input type="text" value={eventForm.notes} onChange={(e) => setEventForm({ ...eventForm, notes: e.target.value })}
                placeholder="Any additional details..."
                className="w-full px-3 py-2 border-2 border-border-custom rounded-lg text-xs bg-surface outline-none" />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleAddEvent}
              className="px-5 py-2 bg-dark text-white rounded-lg text-xs font-semibold border-none cursor-pointer">
              {editingEventId ? 'Update' : 'Create Event'}
            </button>
            <button onClick={() => { setShowAddEvent(false); setEditingEventId(null); }}
              className="px-5 py-2 bg-surface rounded-lg text-xs font-semibold border border-border-custom cursor-pointer">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-border-custom">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCalendarDate(new Date(calendarYear, calendarMonth - 1, 1))}
              className="w-8 h-8 rounded-full bg-surface flex items-center justify-center cursor-pointer border border-border-custom">
              <ChevronLeft size={16} />
            </button>
            <h3 className="text-sm font-bold">
              {calendarDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </h3>
            <button onClick={() => setCalendarDate(new Date(calendarYear, calendarMonth + 1, 1))}
              className="w-8 h-8 rounded-full bg-surface flex items-center justify-center cursor-pointer border border-border-custom">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-text-muted py-1">{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayAppts = getApptsForDay(day);
              const dayEvents = getEventsForDay(day);
              const isToday = new Date().getDate() === day && new Date().getMonth() === calendarMonth && new Date().getFullYear() === calendarYear;
              const isSelected = selectedDay === day;
              const hasItems = dayAppts.length > 0 || dayEvents.length > 0;
              return (
                <button key={day} onClick={() => setSelectedDay(day)}
                  className={`min-h-[70px] p-1.5 rounded-xl border text-center cursor-pointer bg-transparent transition-all
                  ${isSelected ? 'border-dark bg-dark/5 shadow-sm' : isToday ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-surface'}`}>
                  <div className={`text-xs font-semibold mb-0.5 ${isToday || isSelected ? 'text-dark' : 'text-text-muted'}`}>{day}</div>
                  {/* Appointment dots */}
                  {dayAppts.slice(0, 1).map(a => (
                    <div key={a._id}
                      className={`text-[7px] px-1 py-0.5 rounded mb-0.5 truncate font-semibold
                      ${a.status === 'emergency' ? 'bg-red-100 text-red-600' : a.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {a.timeSlot?.split(' ')[0]}
                    </div>
                  ))}
                  {/* Event dots */}
                  {dayEvents.slice(0, 1).map(e => (
                    <div key={e._id}
                      className={`text-[7px] px-1 py-0.5 rounded mb-0.5 truncate font-semibold ${eventColors[e.color]?.bg || 'bg-blue-100'} ${eventColors[e.color]?.text || 'text-blue-700'}`}>
                      {e.title?.substring(0, 8)}
                    </div>
                  ))}
                  {(dayAppts.length + dayEvents.length) > 2 && (
                    <div className="text-[7px] text-text-muted">+{(dayAppts.length + dayEvents.length) - 2}</div>
                  )}
                  {/* Color dot row */}
                  {hasItems && (
                    <div className="flex justify-center gap-0.5 mt-0.5">
                      {dayAppts.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                      {dayEvents.map(e => (
                        <div key={e._id} className={`w-1.5 h-1.5 rounded-full ${eventColors[e.color]?.dot || 'bg-blue-500'}`} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border-custom">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
              <span className="text-[10px] text-text-muted font-semibold">Appointments</span>
            </div>
            {Object.entries(eventColors).map(([key, val]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${val.dot}`} />
                <span className="text-[10px] text-text-muted font-semibold capitalize">{key}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Day Detail Panel */}
        <div className="bg-white rounded-2xl p-5 border border-border-custom">
          <h3 className="text-sm font-bold mb-3">
            {selectedDay
              ? `${new Date(calendarYear, calendarMonth, selectedDay).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}`
              : '📅 Select a day'}
          </h3>

          {!selectedDay ? (
            <p className="text-xs text-text-muted">Click on a day to see details.</p>
          ) : (
            <div className="space-y-4">
              {/* Appointments */}
              {selectedDayAppts.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase text-text-muted mb-2">Sessions ({selectedDayAppts.length})</div>
                  <div className="space-y-2">
                    {selectedDayAppts.map(apt => (
                      <div key={apt._id} className={`p-3 rounded-xl border ${apt.isEmergency ? 'border-red-200 bg-red-50/50' : 'border-border-custom bg-surface'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold">{apt.timeSlot}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${statusColor[apt.status]}`}>{apt.status}</span>
                        </div>
                        <div className="text-xs font-semibold">
                          {apt.isAnonymous ? (apt.anonymousName || 'Anonymous') : apt.student?.name}
                        </div>
                        <div className="text-[10px] text-text-muted">
                          {apt.sessionType === 'video' ? '🎥 Video' : apt.sessionType === 'audio' ? '📞 Audio' : '💬 Chat'}
                          {apt.preSession?.issue && ` · ${apt.preSession.issue}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Personal Events */}
              {selectedDayEvents.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase text-text-muted mb-2">Events ({selectedDayEvents.length})</div>
                  <div className="space-y-2">
                    {selectedDayEvents.map(evt => (
                      <div key={evt._id} className={`p-3 rounded-xl border ${eventColors[evt.color]?.bg || 'bg-blue-50'} border-white/50`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold ${eventColors[evt.color]?.text || ''}`}>{evt.title}</span>
                          <div className="flex items-center gap-1">
                            <button onClick={() => startEditEvent(evt)}
                              className="bg-transparent border-none cursor-pointer p-0.5 text-text-muted hover:text-dark">
                              <Edit2 size={11} />
                            </button>
                            <button onClick={() => handleDeleteEvent(evt._id)}
                              className="bg-transparent border-none cursor-pointer p-0.5 text-text-muted hover:text-red-500">
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                        {evt.time && <div className="text-[10px] text-text-muted">🕐 {evt.time}</div>}
                        {evt.notes && <div className="text-[10px] text-text-muted mt-0.5 italic">{evt.notes}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No items */}
              {selectedDayAppts.length === 0 && selectedDayEvents.length === 0 && (
                <p className="text-xs text-text-muted">Nothing scheduled.</p>
              )}

              {/* Quick add for day */}
              <button onClick={() => openAddForDay(selectedDay)}
                className="flex items-center gap-1.5 w-full px-3 py-2 bg-surface rounded-xl text-xs font-semibold text-text-muted border border-border-custom cursor-pointer hover:bg-dark/5 transition-all">
                <Plus size={14} /> Add event on this day
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CounsellorCalendar;
