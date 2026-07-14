import { useState, useEffect, useRef } from 'react';
import API from '../../api/axios';
import { appointmentEndpoints, counsellorTaskEndpoints, counsellorEscalatedEndpoints } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import {
  CalendarDays, Clock, Users, CheckCircle, AlertTriangle, Star,
  Loader, TrendingUp, BarChart3, Plus, X, GripVertical, Trash2, MessageCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationWidget from '../../components/NotificationWidget';

const statusColor = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-100 text-red-700',
  emergency: 'bg-red-200 text-red-800',
};

const priorityColor = {
  low: 'border-l-emerald-400',
  medium: 'border-l-yellow-400',
  high: 'border-l-red-400',
};

const kanbanColumns = [
  { id: 'todo', label: 'To Do', emoji: '📋', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  { id: 'ongoing', label: 'Ongoing', emoji: '🔄', bg: 'bg-blue-50', border: 'border-blue-200' },
  { id: 'completed', label: 'Completed', emoji: '✅', bg: 'bg-emerald-50', border: 'border-emerald-200' },
];

const CounsellorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Kanban
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [showAddTask, setShowAddTask] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);

  // Escalated Requests
  const [escalated, setEscalated] = useState([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [statsRes, tasksRes, escalatedRes] = await Promise.all([
        API.get(appointmentEndpoints.GET_COUNSELLOR_STATS_API),
        API.get(counsellorTaskEndpoints.GET_TASKS_API),
        API.get(counsellorEscalatedEndpoints.GET_ESCALATED_API)
      ]);
      setStats(statsRes.data.stats);
      setTasks(tasksRes.data.tasks);
      setEscalated(escalatedRes.data.requests || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // Kanban - Add task
  const addTask = async () => {
    if (!newTaskText.trim()) return;
    try {
      const res = await API.post(counsellorTaskEndpoints.CREATE_TASK_API, {
        text: newTaskText.trim(), priority: newTaskPriority
      });
      setTasks(prev => [...prev, res.data.task]);
      setNewTaskText(''); setShowAddTask(false);
    } catch (err) { console.error(err); }
  };

  // Kanban - Delete task
  const deleteTask = async (id) => {
    try {
      await API.delete(`${counsellorTaskEndpoints.DELETE_TASK_API}/${id}`);
      setTasks(prev => prev.filter(t => t._id !== id));
    } catch (err) { console.error(err); }
  };

  // Kanban - Drag & Drop
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedTask(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    if (!draggedTask || draggedTask.status === targetStatus) return;

    // Optimistic update
    const updated = tasks.map(t =>
      t._id === draggedTask._id ? { ...t, status: targetStatus } : t
    );
    setTasks(updated);

    // Save to backend
    try {
      await API.put(`${counsellorTaskEndpoints.UPDATE_TASK_API}/${draggedTask._id}`, {
        status: targetStatus
      });
    } catch (err) {
      console.error(err);
      fetchAll(); // rollback
    }
    setDraggedTask(null);
  };

  // Chart helper — bar chart
  const maxSessions = stats?.weeklyTrend ? Math.max(...stats.weeklyTrend.map(d => d.sessions), 1) : 1;

  // Donut chart helper
  const getDonutSegments = () => {
    if (!stats?.statusDistribution) return [];
    const dist = stats.statusDistribution;
    const total = Object.values(dist).reduce((a, b) => a + b, 0) || 1;
    const colors = {
      completed: '#10b981', confirmed: '#6366f1', pending: '#f59e0b',
      cancelled: '#ef4444', emergency: '#dc2626'
    };
    let offset = 0;
    return Object.entries(dist).filter(([, v]) => v > 0).map(([key, val]) => {
      const pct = (val / total) * 100;
      const segment = { key, pct, offset, color: colors[key] || '#9ca3af', val };
      offset += pct;
      return segment;
    });
  };

  // Issue bar chart helper
  const getIssueBars = () => {
    if (!stats?.issueCounts) return [];
    const entries = Object.entries(stats.issueCounts).sort((a, b) => b[1] - a[1]);
    const max = entries[0]?.[1] || 1;
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
    return entries.map(([issue, count], i) => ({ issue, count, pct: (count / max) * 100, color: colors[i % colors.length] }));
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader size={24} className="animate-spin text-text-muted" />
    </div>
  );

  const donutSegments = getDonutSegments();
  const issueBars = getIssueBars();

  const acceptEscalation = async (id) => {
    try {
      await API.put(`${counsellorEscalatedEndpoints.ACCEPT_ESCALATED_API}/${id}/accept`);
      navigate('/counsellor/escalated-chat');
    } catch (err) {
      alert('Failed to accept escalation');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-main">overview</h1>
          <p className="text-text-muted mt-1">Welcome back, {user?.name} 👋</p>
        </div>
        <button
          onClick={() => setShowAddTask(true)}
          className="flex items-center gap-2 px-4 py-2 bg-text-main text-white font-bold rounded-xl hover:bg-black transition-colors"
        >
          <Plus size={16} /> Add Task
        </button>
      </div>

      {/* Escalated Warnings */}
      {escalated.length > 0 && (
        <div className="mb-8 space-y-3">
          <h2 className="text-lg font-bold text-red-600 flex items-center gap-2">
            <AlertTriangle size={20} /> Escalated Requests
          </h2>
          {escalated.map(req => {
            const isActive = req.status === 'counsellor-active';
            return (
              <div key={req._id} className={`p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 ${isActive ? 'bg-indigo-50 border border-indigo-200' : 'bg-red-50 border border-red-200'}`}>
                 <div>
                    <div className="flex items-center gap-2 mb-1">
                       <span className={`font-bold px-2 py-0.5 rounded uppercase text-xs shadow-sm ${isActive ? 'text-indigo-700 bg-indigo-100' : 'text-red-700 bg-red-100'}`}>
                         {isActive ? 'Active Chat' : 'Emergency'}
                       </span>
                       <span className={`text-xs font-semibold ${isActive ? 'text-indigo-500' : 'text-red-500'}`}>{req.student?.name || 'Anonymous User'}</span>
                    </div>
                    <p className={`text-sm font-semibold ${isActive ? 'text-indigo-800' : 'text-red-800'}`}>Issue: {req.issueType}</p>
                    <p className={`text-xs ${isActive ? 'text-indigo-600' : 'text-red-600'}`}>Escalated by volunteer: {req.assignedVolunteer?.name || 'System'}</p>
                 </div>
                 {isActive ? (
                   <button onClick={() => navigate('/counsellor/escalated-chat')} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2">
                     <MessageCircle size={16} /> Open Chat
                   </button>
                 ) : (
                   <button onClick={() => acceptEscalation(req._id)} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition-all">
                     Accept Case
                   </button>
                 )}
              </div>
            );
          })}
        </div>
      )}

      {stats && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Today's Sessions", value: stats.todaySessions, icon: CalendarDays, color: 'text-blue-500 bg-blue-50' },
              { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-emerald-500 bg-emerald-50' },
              { label: 'Pending Requests', value: stats.totalPending, icon: Clock, color: 'text-yellow-500 bg-yellow-50' },
              { label: 'Completed', value: stats.totalCompleted, icon: CheckCircle, color: 'text-indigo-500 bg-indigo-50' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-border-custom">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                  <s.icon size={18} />
                </div>
                <div className="text-2xl font-extrabold">{s.value}</div>
                <div className="text-xs text-text-muted mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Row 2: Mini stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-5 border border-border-custom text-center">
              <Star size={20} className="text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-extrabold">{stats.avgRating > 0 ? `${stats.avgRating} ⭐` : 'N/A'}</div>
              <div className="text-xs text-text-muted">Avg Rating</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-border-custom text-center">
              <AlertTriangle size={20} className="text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-extrabold">{stats.totalEmergency}</div>
              <div className="text-xs text-text-muted">Emergency Sessions</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-border-custom text-center">
              <TrendingUp size={20} className="text-emerald-500 mx-auto mb-2" />
              <div className="text-2xl font-extrabold">{stats.thisWeek}</div>
              <div className="text-xs text-text-muted">This Week</div>
            </div>
          </div>

          {/* ═══ CHARTS ROW ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Weekly Trend Bar Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-border-custom">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                <BarChart3 size={16} className="text-indigo-500" /> Sessions This Week
              </h3>
              <div className="flex items-end gap-2 h-36">
                {stats.weeklyTrend?.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-text-main">{d.sessions}</span>
                    <div className="w-full rounded-t-lg transition-all duration-500"
                      style={{
                        height: `${Math.max((d.sessions / maxSessions) * 100, 8)}%`,
                        background: `linear-gradient(180deg, #6366f1, #818cf8)`,
                        minHeight: '8px'
                      }} />
                    <span className="text-[10px] text-text-muted font-semibold">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Donut Chart */}
            <div className="bg-white rounded-2xl p-5 border border-border-custom">
              <h3 className="text-sm font-bold mb-4">📊 Status Breakdown</h3>
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                  {donutSegments.map(seg => (
                    <circle key={seg.key} r="15.9155" cx="18" cy="18" fill="none"
                      stroke={seg.color} strokeWidth="3"
                      strokeDasharray={`${seg.pct} ${100 - seg.pct}`}
                      strokeDashoffset={-seg.offset}
                      className="transition-all duration-500"
                      transform="rotate(-90 18 18)" />
                  ))}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg font-extrabold">{Object.values(stats.statusDistribution || {}).reduce((a, b) => a + b, 0)}</div>
                    <div className="text-[9px] text-text-muted">Total</div>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                {donutSegments.map(seg => (
                  <div key={seg.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                      <span className="text-[10px] capitalize font-semibold">{seg.key}</span>
                    </div>
                    <span className="text-[10px] text-text-muted font-semibold">{seg.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Issue Breakdown Horizontal Bars */}
          {issueBars.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-border-custom mb-6">
              <h3 className="text-sm font-bold mb-3">🧠 Common Issues</h3>
              <div className="space-y-2.5">
                {issueBars.map(bar => (
                  <div key={bar.issue}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-semibold capitalize">{bar.issue}</span>
                      <span className="text-xs text-text-muted">{bar.count}</span>
                    </div>
                    <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${bar.pct}%`, backgroundColor: bar.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ KANBAN BOARD ═══ */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2">📌 Task Board</h3>
              <button onClick={() => setShowAddTask(!showAddTask)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-dark text-white rounded-lg text-xs font-semibold border-none cursor-pointer">
                <Plus size={14} /> Add Task
              </button>
            </div>

            {/* Add task form */}
            {showAddTask && (
              <div className="bg-white rounded-xl p-4 border border-border-custom mb-4 flex gap-3 items-end">
                <div className="flex-1">
                  <label className="text-[10px] font-bold uppercase text-text-muted mb-1 block">Task</label>
                  <input type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="e.g. Follow up with Student A..."
                    onKeyDown={(e) => e.key === 'Enter' && addTask()}
                    className="w-full px-3 py-2 border-2 border-border-custom rounded-lg text-xs bg-surface outline-none focus:border-dark" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-text-muted mb-1 block">Priority</label>
                  <select value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="px-3 py-2 border-2 border-border-custom rounded-lg text-xs bg-surface outline-none cursor-pointer">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <button onClick={addTask}
                  className="px-4 py-2 bg-dark text-white rounded-lg text-xs font-semibold border-none cursor-pointer whitespace-nowrap">
                  Add
                </button>
                <button onClick={() => setShowAddTask(false)}
                  className="px-3 py-2 bg-surface rounded-lg text-xs border border-border-custom cursor-pointer">
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {kanbanColumns.map(col => {
                const colTasks = tasks.filter(t => t.status === col.id);
                return (
                  <div key={col.id}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, col.id)}
                    className={`rounded-2xl p-4 border-2 min-h-[200px] transition-all ${col.bg} ${col.border} ${
                      draggedTask && draggedTask.status !== col.id ? 'border-dashed scale-[1.01]' : ''
                    }`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold">
                        {col.emoji} {col.label}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/70">{colTasks.length}</span>
                    </div>

                    <div className="space-y-2">
                      {colTasks.map(task => (
                        <div key={task._id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task)}
                          onDragEnd={handleDragEnd}
                          className={`bg-white rounded-xl p-3 border border-white/50 shadow-sm cursor-grab active:cursor-grabbing
                            border-l-4 ${priorityColor[task.priority]} hover:shadow-md transition-all group`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 flex-1">
                              <GripVertical size={14} className="text-text-muted mt-0.5 opacity-50 group-hover:opacity-100 flex-shrink-0" />
                              <span className="text-xs font-medium leading-relaxed">{task.text}</span>
                            </div>
                            <button onClick={() => deleteTask(task._id)}
                              className="opacity-0 group-hover:opacity-100 bg-transparent border-none cursor-pointer p-0.5 text-text-muted hover:text-red-500 transition-all flex-shrink-0">
                              <Trash2 size={12} />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              task.priority === 'high' ? 'bg-red-50 text-red-500' :
                              task.priority === 'medium' ? 'bg-yellow-50 text-yellow-600' : 'bg-emerald-50 text-emerald-600'
                            }`}>{task.priority}</span>
                          </div>
                        </div>
                      ))}
                      {colTasks.length === 0 && (
                        <div className="text-center py-6 text-[10px] text-text-muted">
                          {draggedTask ? 'Drop here ↓' : 'No tasks'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="bg-white rounded-2xl p-5 border border-border-custom">
            <h3 className="text-sm font-bold mb-3">📅 Today's Schedule</h3>
            {stats.upcomingToday?.length === 0 ? (
              <p className="text-text-muted text-xs">No sessions today. Enjoy your break! ☕</p>
            ) : (
              <div className="space-y-2">
                {stats.upcomingToday?.map(apt => (
                  <div key={apt._id} className="flex items-center justify-between p-3 bg-surface rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold">
                        {apt.isAnonymous ? '🔒' : apt.student?.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-semibold">{apt.isAnonymous ? apt.anonymousName || 'Anonymous' : apt.student?.name}</div>
                        <div className="text-[10px] text-text-muted">{apt.timeSlot} · {apt.sessionType === 'video' ? '🎥' : apt.sessionType === 'audio' ? '📞' : '💬'}</div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${statusColor[apt.status]}`}>{apt.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <NotificationWidget />
    </div>
  );
};

export default CounsellorDashboard;
