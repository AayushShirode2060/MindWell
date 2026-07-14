import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { appointmentEndpoints, referralEndpoints } from '../../api/endpoints';
import ChatRoom from '../../components/chat/ChatRoom';
import {
  CalendarDays, Clock, Users, CheckCircle, AlertTriangle,
  MessageCircle, Video, X, Loader
} from 'lucide-react';

const statusColor = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-100 text-red-700',
  emergency: 'bg-red-200 text-red-800',
};

const CounsellorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  const [notesId, setNotesId] = useState(null);
  const [notesText, setNotesText] = useState('');
  const [chatAppointment, setChatAppointment] = useState(null);
  const [studentHistory, setStudentHistory] = useState(null);
  const [historyAppts, setHistoryAppts] = useState([]);

  useEffect(() => { fetchAppts(); }, []);

  const fetchAppts = async () => {
    setLoading(true);
    try {
      const res = await API.get(appointmentEndpoints.GET_COUNSELLOR_APPOINTMENTS_API);
      setAppointments(res.data.appointments);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await API.put(`${appointmentEndpoints.UPDATE_APPOINTMENT_API}/${id}`, { status });
      fetchAppts();
    } catch (err) { console.error(err); }
  };

  const handleSaveNotes = async () => {
    try {
      await API.put(`${appointmentEndpoints.UPDATE_APPOINTMENT_API}/${notesId}`, { notes: notesText });
      setNotesId(null); setNotesText('');
      fetchAppts();
    } catch (err) { console.error(err); }
  };

  const viewStudentHistory = async (studentId) => {
    try {
      const res = await API.get(`${appointmentEndpoints.GET_STUDENT_HISTORY_API}/${studentId}`);
      setStudentHistory(res.data.student);
      setHistoryAppts(res.data.appointments);
    } catch (err) { console.error(err); }
  };

  const filteredAppts = appointments.filter(a => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (dateFilter) {
      const aptDate = new Date(a.date).toISOString().split('T')[0];
      if (aptDate !== dateFilter) return false;
    }
    return true;
  });

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader size={24} className="animate-spin text-text-muted" />
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-text-main">appointments</h1>
        <p className="text-text-muted mt-1">Manage all your sessions</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border-2 border-border-custom rounded-xl text-xs font-semibold bg-white outline-none cursor-pointer">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="emergency">Emergency</option>
        </select>
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2 border-2 border-border-custom rounded-xl text-xs bg-white outline-none" />
        {(statusFilter !== 'all' || dateFilter) && (
          <button onClick={() => { setStatusFilter('all'); setDateFilter(''); }}
            className="text-xs text-text-muted cursor-pointer bg-transparent border-none hover:text-dark">
            ✕ Clear
          </button>
        )}
      </div>

      {/* Appointment List */}
      {filteredAppts.length === 0 ? (
        <p className="text-text-muted text-sm text-center py-12">No appointments found.</p>
      ) : (
        <div className="space-y-3">
          {filteredAppts.map(apt => (
            <div key={apt._id} className={`bg-white rounded-2xl border overflow-hidden ${apt.isEmergency ? 'border-red-300' : 'border-border-custom'}`}>
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${apt.isEmergency ? 'bg-red-100 text-red-600' : 'bg-primary/15'}`}>
                    {apt.isAnonymous ? '🔒' : apt.student?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-sm flex items-center gap-2">
                      {apt.isAnonymous ? (apt.anonymousName || 'Anonymous') : apt.student?.name}
                      {apt.isEmergency && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">🚨 EMERGENCY</span>}
                    </div>
                    <div className="text-xs text-text-muted">
                      {new Date(apt.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} · {apt.timeSlot}
                      {apt.sessionType && ` · ${apt.sessionType === 'video' ? '🎥' : apt.sessionType === 'audio' ? '📞' : '💬'}`}
                      {apt.preSession?.issue && ` · ${apt.preSession.issue}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusColor[apt.status]}`}>{apt.status}</span>

                  {apt.status === 'pending' && (
                    <>
                      <button onClick={() => handleUpdateStatus(apt._id, 'confirmed')}
                        className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-semibold border-none cursor-pointer hover:bg-emerald-600">
                        ✓ Accept
                      </button>
                      <button onClick={() => handleUpdateStatus(apt._id, 'cancelled')}
                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold border border-red-200 cursor-pointer hover:bg-red-100">
                        ✕ Reject
                      </button>
                    </>
                  )}
                  {(apt.status === 'confirmed' || apt.status === 'emergency') && (
                    <>
                      {apt.sessionType === 'chat' && (
                        <button onClick={() => setChatAppointment(apt)}
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-semibold border border-indigo-200 cursor-pointer">
                          💬 Chat
                        </button>
                      )}
                      {apt.sessionType === 'video' && apt.jitsiRoomId && (
                        <a href={`https://meet.jit.si/${apt.jitsiRoomId}`} target="_blank" rel="noreferrer"
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold border border-blue-200 no-underline">
                          🎥 Join
                        </a>
                      )}
                      <button onClick={() => handleUpdateStatus(apt._id, 'completed')}
                        className="px-3 py-1.5 bg-dark text-white rounded-lg text-xs font-semibold border-none cursor-pointer">
                        ✓ Complete
                      </button>
                    </>
                  )}
                  <button onClick={() => { setNotesId(notesId === apt._id ? null : apt._id); setNotesText(apt.notes || ''); }}
                    className="px-3 py-1.5 bg-surface rounded-lg text-xs font-semibold border border-border-custom cursor-pointer">
                    📝 Notes
                  </button>
                  {!apt.isAnonymous && apt.student?._id && (
                    <button onClick={() => viewStudentHistory(apt.student._id)}
                      className="px-3 py-1.5 bg-surface rounded-lg text-xs font-semibold border border-border-custom cursor-pointer">
                      📂 History
                    </button>
                  )}
                </div>
              </div>

              {apt.preSession?.feeling && (
                <div className="px-5 pb-3">
                  <div className="p-3 bg-indigo-50 rounded-lg text-xs text-indigo-700">
                    <strong>Pre-session:</strong> Feeling: {apt.preSession.feeling}
                    {apt.preSession.issue && ` · Issue: ${apt.preSession.issue}`}
                    {apt.preSession.urgency && ` · Urgency: ${apt.preSession.urgency}`}
                    {apt.preSession.details && <div className="mt-1 italic">"{apt.preSession.details}"</div>}
                  </div>
                </div>
              )}

              {notesId === apt._id && (
                <div className="px-5 pb-4 border-t border-border-custom pt-3">
                  <label className="text-xs font-semibold uppercase text-text-muted mb-1.5 block">Session Notes (Private)</label>
                  <textarea value={notesText} onChange={(e) => setNotesText(e.target.value)}
                    placeholder="Observations, advice given, follow-up plan..."
                    rows={3} maxLength={1000}
                    className="w-full px-4 py-3 border-2 border-border-custom rounded-xl text-sm bg-surface outline-none resize-none mb-2" />
                  <button onClick={handleSaveNotes}
                    className="px-5 py-2 bg-dark text-white rounded-lg text-xs font-semibold border-none cursor-pointer">
                    Save Notes
                  </button>
                </div>
              )}

              {apt.notes && notesId !== apt._id && (
                <div className="px-5 pb-3">
                  <div className="p-2 bg-surface rounded-lg text-xs text-text-muted">
                    <strong>Your notes:</strong> {apt.notes}
                  </div>
                </div>
              )}

              {apt.feedback?.rating && (
                <div className="px-5 pb-3">
                  <div className="text-xs text-yellow-600">
                    Student rated: {'⭐'.repeat(apt.feedback.rating)}
                    {apt.feedback.comment && ` — "${apt.feedback.comment}"`}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Chat Modal */}
      {chatAppointment && (
        <ChatRoom
          appointmentId={chatAppointment._id}
          counsellorName={chatAppointment.isAnonymous ? (chatAppointment.anonymousName || 'Student') : chatAppointment.student?.name}
          onClose={() => setChatAppointment(null)}
        />
      )}

      {/* Student History Modal */}
      {studentHistory && (
        <div className="fixed inset-0 bg-dark/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] mx-4 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-custom">
              <div>
                <h2 className="text-lg font-extrabold">{studentHistory.name}</h2>
                <p className="text-xs text-text-muted">{studentHistory.email} · {historyAppts.length} sessions</p>
              </div>
              <button onClick={() => { setStudentHistory(null); setHistoryAppts([]); }}
                className="w-8 h-8 rounded-full bg-surface flex items-center justify-center border border-border-custom cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {historyAppts.map(apt => (
                <div key={apt._id} className="p-3 bg-surface rounded-xl">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold">
                      {new Date(apt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {apt.timeSlot}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${statusColor[apt.status]}`}>{apt.status}</span>
                  </div>
                  {apt.preSession?.issue && <div className="text-[10px] text-text-muted capitalize">Issue: {apt.preSession.issue}</div>}
                  {apt.notes && <div className="text-[10px] text-indigo-600 mt-1">Notes: {apt.notes}</div>}
                  {apt.feedback?.rating && <div className="text-[10px] text-yellow-600 mt-1">Rating: {'⭐'.repeat(apt.feedback.rating)}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CounsellorAppointments;
