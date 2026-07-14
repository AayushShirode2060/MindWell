import { useState, useEffect } from 'react';
import API from '../../api/axios';
import ChatRoom from '../../components/chat/ChatRoom';

import { appointmentEndpoints } from '../../api/endpoints';
import {
  CalendarDays, Clock, User, Loader, Star, MessageCircle, Phone, Video,
  Shield, Zap, Brain, ChevronRight, AlertTriangle, GripVertical
} from 'lucide-react';

const statusColor = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-100 text-red-700',
  emergency: 'bg-red-100 text-red-700',
};

const issues = ['stress', 'anxiety', 'depression', 'academic', 'relationship', 'grief', 'self-esteem', 'other'];

const BookAppointment = () => {
  const [tab, setTab] = useState('book'); // book, history, emergency
  const [step, setStep] = useState(1); // booking wizard: 1=presession, 2=counsellor, 3=datetime, 4=confirm

  // Booking state
  const [counsellors, setCounsellors] = useState([]);
  const [selectedCounsellor, setSelectedCounsellor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [sessionType, setSessionType] = useState('chat');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [anonymousName, setAnonymousName] = useState('');

  // Pre-session form
  const [feeling, setFeeling] = useState('');
  const [issue, setIssue] = useState('');
  const [urgency, setUrgency] = useState('');
  const [details, setDetails] = useState('');

  // AI recommendation
  const [recommendation, setRecommendation] = useState(null);

  // General
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Feedback
  const [feedbackId, setFeedbackId] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  // Kanban
  const [kanbanId, setKanbanId] = useState(null);
  const [newTask, setNewTask] = useState('');

  // Chat
  const [chatAppointment, setChatAppointment] = useState(null);

  // Step validation
  const [stepError, setStepError] = useState('');


  useEffect(() => {
    fetchCounsellors();
    fetchMyAppointments();
    fetchRecommendation();
  }, []);

  const fetchCounsellors = async () => {
    try {
      const res = await API.get(appointmentEndpoints.GET_COUNSELLORS_API);
      setCounsellors(res.data.counsellors);
    } catch (err) { console.error(err); }
  };

  const fetchMyAppointments = async () => {
    try {
      const res = await API.get(appointmentEndpoints.GET_MY_APPOINTMENTS_API);
      setAppointments(res.data.appointments);
    } catch (err) { console.error(err); }
  };

  const fetchRecommendation = async () => {
    try {
      const res = await API.get(appointmentEndpoints.RECOMMEND_COUNSELLOR_API);
      setRecommendation(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchSlots = async (cId, date) => {
    if (!cId || !date) return;
    setSlotsLoading(true);
    try {
      const res = await API.get(`${appointmentEndpoints.GET_AVAILABLE_SLOTS_API}/${cId}?date=${date}`);
      setAvailableSlots(res.data.availableSlots);
    } catch (err) { console.error(err); }
    finally { setSlotsLoading(false); }
  };

  const handleBook = async () => {
    if (!selectedCounsellor || !selectedDate || !selectedSlot) {
      setError('Please complete all steps'); return;
    }
    setLoading(true); setError('');
    try {
      await API.post(appointmentEndpoints.CREATE_APPOINTMENT_API, {
        counsellorId: selectedCounsellor._id,
        date: selectedDate,
        timeSlot: selectedSlot,
        sessionType,
        isAnonymous,
        anonymousName,
        preSession: { feeling, issue, urgency, details }
      });
      setSuccess('Appointment booked! 🎉 Check your email for confirmation.');
      setStep(1); setSelectedCounsellor(null); setSelectedSlot(''); setSelectedDate('');
      setFeeling(''); setIssue(''); setUrgency(''); setDetails('');
      fetchMyAppointments();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally { setLoading(false); }
  };

  const handleEmergency = async () => {
    if (!window.confirm('This will immediately connect you with an available counsellor. Continue?')) return;
    setLoading(true);
    try {
      const res = await API.post(appointmentEndpoints.EMERGENCY_BOOKING_API);
      setSuccess(`🚨 Emergency session created with ${res.data.counsellor.name}!`);
      if (res.data.jitsiLink) window.open(res.data.jitsiLink, '_blank');
      fetchMyAppointments();
    } catch (err) {
      setError(err.response?.data?.message || 'Emergency booking failed');
    } finally { setLoading(false); }
  };

  const handleFeedback = async () => {
    try {
      await API.post(`${appointmentEndpoints.SUBMIT_FEEDBACK_API}/${feedbackId}/feedback`, { rating, comment });
      setFeedbackId(null); setRating(0); setComment('');
      fetchMyAppointments();
      setSuccess('Feedback submitted! ⭐');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError('Feedback failed'); }
  };

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    try {
      await API.put(`${appointmentEndpoints.UPDATE_TASK_API}/${kanbanId}/task`, { text: newTask });
      setNewTask('');
      fetchMyAppointments();
    } catch (err) { console.error(err); }
  };

  const handleTaskStatus = async (aptId, taskId, status) => {
    try {
      await API.put(`${appointmentEndpoints.UPDATE_TASK_API}/${aptId}/task`, { taskId, status });
      fetchMyAppointments();
    } catch (err) { console.error(err); }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];


  const validateStep = (currentStep) => {
    setStepError('');
    if (currentStep === 1) {
      if (!feeling.trim()) { setStepError('Please describe how you are feeling'); return false; }
      if (!issue) { setStepError('Please select an issue'); return false; }
      if (!urgency) { setStepError('Please select urgency level'); return false; }
      if (isAnonymous && !anonymousName.trim()) { setStepError('Please enter a nickname for anonymous booking'); return false; }
    }
    if (currentStep === 2) {
      if (!selectedCounsellor) { setStepError('Please select a counsellor'); return false; }
    }
    if (currentStep === 3) {
      if (!selectedDate) { setStepError('Please select a date'); return false; }
      if (!selectedSlot) { setStepError('Please select a time slot'); return false; }
    }
    return true;
  };


  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-main">Appointments</h1>
          <p className="text-text-muted mt-1">Book, manage, and review your sessions</p>
        </div>
        <button onClick={handleEmergency} disabled={loading}
          className="flex items-center gap-2 px-5 py-3 bg-red-500 text-white rounded-full text-sm font-bold border-none cursor-pointer hover:bg-red-600 transition-all animate-pulse">
          <AlertTriangle size={16} /> Need Help Now
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg border-l-4 border-red-500 mb-4 text-sm font-medium">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg border-l-4 border-primary mb-4 text-sm font-medium">{success}</div>}

      {stepError && <div className="bg-orange-50 text-orange-700 px-4 py-3 rounded-lg border-l-4 border-orange-400 mb-4 text-sm font-medium">{stepError}</div>}


      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'book', label: 'Book Session', icon: CalendarDays },
          { id: 'history', label: 'Session History', icon: Clock },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold cursor-pointer border-2 transition-all
            ${tab === t.id ? 'bg-dark text-white border-dark' : 'bg-white text-text-muted border-border-custom hover:border-dark'}`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* ── BOOK TAB ── */}
      {tab === 'book' && (
        <div>
          {/* AI Recommendation Banner */}
          {recommendation?.recommended && (
            <div className="mb-6 p-5 rounded-2xl border-2 border-indigo-100" style={{ background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Brain size={16} className="text-indigo-500" />
                <span className="text-xs font-bold uppercase text-indigo-400">AI Recommendation</span>
              </div>
              <p className="text-sm text-indigo-800">
                Based on your mood (<strong>{recommendation.analysis.mood}</strong>) and recent concerns (<strong>{recommendation.analysis.dominantConcern}</strong>),
                we recommend: <strong>{recommendation.recommended.name}</strong>
                {recommendation.recommended.specialization && ` — ${recommendation.recommended.specialization}`}
              </p>
              <button onClick={() => { setSelectedCounsellor(recommendation.recommended); setStep(3); }}
                className="mt-3 px-4 py-2 bg-indigo-500 text-white rounded-lg text-xs font-semibold border-none cursor-pointer hover:bg-indigo-600 transition-all">
                Book with {recommendation.recommended.name} →
              </button>
            </div>
          )}

          {/* Step Indicators */}
          <div className="flex items-center gap-3 mb-6">
            {['Pre-Session', 'Counsellor', 'Date & Time', 'Confirm'].map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                  ${step > i + 1 ? 'bg-primary text-dark' : step === i + 1 ? 'bg-dark text-white' : 'bg-surface text-text-muted'}`}>
                  {i + 1}
                </div>
                <span className={`text-xs font-semibold hidden md:block ${step === i + 1 ? 'text-dark' : 'text-text-muted'}`}>{s}</span>
                {i < 3 && <ChevronRight size={14} className="text-text-muted" />}
              </div>
            ))}
          </div>

          {/* STEP 1: Pre-Session Form */}
          {step === 1 && (
            <div className="bg-white rounded-2xl p-6 border border-border-custom">
              <h3 className="text-lg font-bold mb-4">📝 Pre-Session Form</h3>
              <p className="text-xs text-text-muted mb-4">This helps your counsellor prepare for your session</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-semibold uppercase text-text-muted mb-1.5 block">How are you feeling?</label>
                  <input type="text" value={feeling} onChange={(e) => setFeeling(e.target.value)}
                    placeholder="e.g., Anxious, overwhelmed..."
                    className="w-full px-4 py-3 border-2 border-border-custom rounded-xl text-sm bg-surface focus:border-dark outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-text-muted mb-1.5 block">What issue?</label>
                  <div className="flex flex-wrap gap-2">
                    {issues.map(i => (
                      <button key={i} onClick={() => setIssue(i)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer border-2 capitalize transition-all
                        ${issue === i ? 'bg-dark text-white border-dark' : 'bg-white border-border-custom hover:border-dark'}`}>
                        {i}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs font-semibold uppercase text-text-muted mb-1.5 block">Urgency</label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high', 'critical'].map(u => (
                    <button key={u} onClick={() => setUrgency(u)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer border-2 capitalize transition-all
                      ${urgency === u ? 'bg-dark text-white border-dark' : 'bg-white border-border-custom hover:border-dark'}`}>
                      {u === 'critical' ? '🚨 ' : ''}{u}
                    </button>
                  ))}
                </div>
              </div>

              <textarea value={details} onChange={(e) => setDetails(e.target.value)}
                placeholder="Any additional details..." rows={2} maxLength={500}
                className="w-full px-4 py-3 border-2 border-border-custom rounded-xl text-sm bg-surface focus:border-dark outline-none resize-none mb-4" />

              {/* Session Type + Anonymous */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-semibold uppercase text-text-muted mb-1.5 block">Session Type</label>
                  <div className="flex gap-2">
                    {[
                      { id: 'chat', icon: MessageCircle, label: 'Chat' },
                      { id: 'audio', icon: Phone, label: 'Audio' },
                      { id: 'video', icon: Video, label: 'Video' },
                    ].map(t => (
                      <button key={t.id} onClick={() => setSessionType(t.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer border-2 transition-all
                        ${sessionType === t.id ? 'bg-dark text-white border-dark' : 'bg-white border-border-custom hover:border-dark'}`}>
                        <t.icon size={14} /> {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-text-muted mb-1.5 block">Privacy</label>
                  <button onClick={() => setIsAnonymous(!isAnonymous)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer border-2 transition-all
                    ${isAnonymous ? 'bg-dark text-white border-dark' : 'bg-white border-border-custom hover:border-dark'}`}>
                    <Shield size={14} /> {isAnonymous ? '🔒 Anonymous' : 'Use My Name'}
                  </button>
                  {isAnonymous && (
                    <input type="text" value={anonymousName} onChange={(e) => setAnonymousName(e.target.value)}
                      placeholder="Choose a nickname..." maxLength={20}
                      className="mt-2 w-full px-4 py-2 border-2 border-border-custom rounded-xl text-xs bg-surface focus:border-dark outline-none" />
                  )}
                </div>
              </div>

              <button onClick={() =>  { if (validateStep(1)) setStep(2); }}
                className="px-6 py-3 rounded-full bg-dark text-white font-semibold text-sm border-none cursor-pointer hover:shadow-lg transition-all">
                Next: Choose Counsellor →
              </button>
            </div>
          )}

          {/* STEP 2: Counsellor Selection */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-bold mb-3">Select a Counsellor</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {counsellors.map(c => (
                  <button key={c._id} onClick={() => { setSelectedCounsellor(c); setStep(3); }}
                    className={`text-left p-5 rounded-2xl border-2 transition-all cursor-pointer bg-white
                    ${selectedCounsellor?._id === c._id ? 'border-primary shadow-glow' : 'border-border-custom hover:border-dark'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold">
                        {c.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{c.name}</div>
                        <div className="text-xs text-text-muted">{c.specialization || 'General'}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(1)} className="mt-4 text-xs text-text-muted cursor-pointer bg-transparent border-none hover:text-dark">
                ← Back
              </button>
            </div>
          )}

          {/* STEP 3: Date & Time */}
          {step === 3 && selectedCounsellor && (
            <div className="bg-white rounded-2xl p-6 border border-border-custom">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <CalendarDays size={20} /> Pick Date & Time
              </h3>
              <p className="text-xs text-text-muted mb-3">Booking with <strong>{selectedCounsellor.name}</strong></p>

              <div className="max-w-xs mb-4">
                <label className="text-xs font-semibold uppercase text-text-muted mb-1 block">Date</label>
                <input type="date" value={selectedDate} min={minDate}
                  onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(''); fetchSlots(selectedCounsellor._id, e.target.value); }}
                  className="w-full px-4 py-3 border-2 border-border-custom rounded-xl text-sm bg-surface focus:border-dark outline-none" />
              </div>

              {selectedDate && (
                <div className="mb-4">
                  <label className="text-xs font-semibold uppercase text-text-muted mb-2 block">Available Slots</label>
                  {slotsLoading ? <Loader size={16} className="animate-spin text-text-muted" /> :
                    availableSlots.length === 0 ? <p className="text-sm text-text-muted">No slots available.</p> : (
                      <div className="flex flex-wrap gap-2">
                        {availableSlots.map(s => (
                          <button key={s} onClick={() => setSelectedSlot(s)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold cursor-pointer border-2 transition-all
                            ${selectedSlot === s ? 'border-primary bg-primary text-dark' : 'border-border-custom bg-white hover:border-dark'}`}>
                            <Clock size={12} className="inline mr-1" /> {s}
                          </button>
                        ))}
                      </div>
                    )}
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => setStep(2)} className="px-4 py-2.5 rounded-full text-xs font-semibold bg-surface border border-border-custom cursor-pointer">← Back</button>
                {selectedSlot && (
                  <button onClick={() =>{ if (validateStep(3)) setStep(4); }}
                    className="px-6 py-2.5 rounded-full bg-dark text-white font-semibold text-sm border-none cursor-pointer">
                    Review & Confirm →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: Confirmation */}
          {step === 4 && (
            <div className="bg-white rounded-2xl p-6 border border-border-custom max-w-lg">
              <h3 className="text-lg font-bold mb-4">✅ Confirm Booking</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm"><span className="text-text-muted">Counsellor</span><strong>{selectedCounsellor?.name}</strong></div>
                <div className="flex justify-between text-sm"><span className="text-text-muted">Date</span><strong>{new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</strong></div>
                <div className="flex justify-between text-sm"><span className="text-text-muted">Time</span><strong>{selectedSlot}</strong></div>
                <div className="flex justify-between text-sm"><span className="text-text-muted">Mode</span><strong className="capitalize">{sessionType === 'video' ? '🎥 Video' : sessionType === 'audio' ? '📞 Audio' : '💬 Chat'}</strong></div>
                <div className="flex justify-between text-sm"><span className="text-text-muted">Privacy</span><strong>{isAnonymous ? `🔒 ${anonymousName || 'Anonymous'}` : 'Regular'}</strong></div>
                {issue && <div className="flex justify-between text-sm"><span className="text-text-muted">Issue</span><strong className="capitalize">{issue}</strong></div>}
                {urgency && <div className="flex justify-between text-sm"><span className="text-text-muted">Urgency</span><strong className="capitalize">{urgency}</strong></div>}
              </div>
              {sessionType === 'video' && (
                <div className="bg-blue-50 text-blue-700 text-xs p-3 rounded-lg mb-4">
                  🎥 A Jitsi Meet link will be emailed to you and your counsellor after booking.
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => setStep(3)} className="px-4 py-2.5 rounded-full text-xs font-semibold bg-surface border border-border-custom cursor-pointer">← Back</button>
                <button onClick={handleBook} disabled={loading}
                  className="px-7 py-3 rounded-full bg-primary text-dark font-semibold text-sm cursor-pointer hover:shadow-glow transition-all disabled:opacity-60 border-none">
                  {loading ? 'Booking...' : 'Confirm Booking ✓'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {tab === 'history' && (
        <div>
          <h3 className="text-lg font-bold mb-4">Session History</h3>
          {appointments.length === 0 ? <p className="text-text-muted text-sm">No appointments yet.</p> :
            appointments.map(apt => (
              <div key={apt._id} className="bg-white border border-border-custom rounded-xl mb-3 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold">
                      {apt.counsellor?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{apt.counsellor?.name}</div>
                      <div className="text-xs text-text-muted">
                        {new Date(apt.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} · {apt.timeSlot}
                        {apt.sessionType && ` · ${apt.sessionType === 'video' ? '🎥' : apt.sessionType === 'audio' ? '📞' : '💬'}`}
                        {apt.isAnonymous && ' · 🔒'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusColor[apt.status]}`}>{apt.status}</span>
                    {apt.status === 'completed' && !apt.feedback?.rating && (
                      <button onClick={() => setFeedbackId(apt._id)}
                        className="text-xs px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full font-semibold border border-yellow-200 cursor-pointer">
                        ⭐ Rate
                      </button>
                    )}
                    {apt.feedback?.rating && (
                      <span className="text-xs text-yellow-600 font-semibold">{'⭐'.repeat(apt.feedback.rating)}</span>
                    )}
                    <button onClick={() => setKanbanId(kanbanId === apt._id ? null : apt._id)}
                      className="text-xs px-3 py-1 bg-surface rounded-full font-semibold border border-border-custom cursor-pointer">
                      📋 Notes
                    </button>
                  </div>
                </div>

                {/* Jitsi link for video */}
                {apt.sessionType === 'video' && apt.jitsiRoomId && apt.status !== 'completed' && apt.status !== 'cancelled' && (
                  <div className="px-5 pb-3">
                    <a href={`https://meet.jit.si/${apt.jitsiRoomId}`} target="_blank" rel="noreferrer"
                      className="text-xs text-blue-600 hover:underline">
                      🎥 Join Video Session →
                    </a>
                  </div>
                )}

                {/* Chat link for chat sessions */}
            {apt.sessionType === 'chat' && apt.status !== 'completed' && apt.status !== 'cancelled' && (
              <div className="px-5 pb-3">
                <button onClick={() => setChatAppointment(apt)}
                  className="text-xs text-indigo-600 font-semibold hover:underline bg-transparent border-none cursor-pointer">
                  💬 Open Chat Session →
                </button>
              </div>
            )}


                {/* Kanban Notes */}
                {kanbanId === apt._id && (
                  <div className="px-5 pb-4 border-t border-border-custom pt-3">
                    <div className="flex gap-2 mb-3">
                      <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                        placeholder="Add a task..." className="flex-1 px-3 py-2 border border-border-custom rounded-lg text-xs outline-none" />
                      <button onClick={handleAddTask}
                        className="px-3 py-2 bg-dark text-white rounded-lg text-xs font-semibold border-none cursor-pointer">Add</button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {['todo', 'doing', 'done'].map(col => (
                        <div key={col} className="bg-surface rounded-lg p-2">
                          <div className="text-[10px] font-bold uppercase text-text-muted mb-2 text-center">{col}</div>
                          {apt.taskNotes?.filter(t => t.status === col).map(t => (
                            <div key={t._id} className="bg-white rounded-md p-2 mb-1 text-xs flex items-center gap-1 border border-border-custom">
                              <GripVertical size={10} className="text-text-muted" />
                              <span className="flex-1">{t.text}</span>
                              <select value={t.status} onChange={(e) => handleTaskStatus(apt._id, t._id, e.target.value)}
                                className="text-[10px] border-none bg-transparent cursor-pointer outline-none">
                                <option value="todo">Todo</option>
                                <option value="doing">Doing</option>
                                <option value="done">Done</option>
                              </select>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                    {apt.notes && (
                      <div className="mt-3 p-3 bg-indigo-50 rounded-lg text-xs text-indigo-700">
                        <strong>Counsellor Notes:</strong> {apt.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          }
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackId && (
        <div className="fixed inset-0 bg-dark/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 text-center">
            <h2 className="text-xl font-extrabold mb-2">How was your session?</h2>
            <div className="flex justify-center gap-2 my-4">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => setRating(s)}
                  className={`text-3xl cursor-pointer bg-transparent border-none transition-transform ${rating >= s ? 'scale-110' : 'opacity-30'}`}>
                  ⭐
                </button>
              ))}
            </div>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)}
              placeholder="Any comments..." rows={2}
              className="w-full px-4 py-3 border-2 border-border-custom rounded-xl text-sm bg-surface outline-none resize-none mb-4" />
            <div className="flex gap-2 justify-center">
              <button onClick={() => setFeedbackId(null)} className="px-4 py-2 text-sm bg-surface rounded-full border border-border-custom cursor-pointer">Cancel</button>
              <button onClick={handleFeedback} disabled={!rating}
                className="px-6 py-2 bg-dark text-white rounded-full text-sm font-semibold border-none cursor-pointer disabled:opacity-50">
                Submit ⭐
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Room Modal */}
{chatAppointment && (
  <ChatRoom
    appointmentId={chatAppointment._id}
    counsellorName={chatAppointment.counsellor?.name || 'Counsellor'}
    onClose={() => setChatAppointment(null)}
  />
)}

    </div>
  );
};

export default BookAppointment;
