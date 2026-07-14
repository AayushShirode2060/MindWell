import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { adminEndpoints, collegeEndpoints, notificationEndpoints, forumEndpoints, resourceEndpoints } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Users, Brain, AlertTriangle, CalendarDays, MessageSquare, ClipboardCheck, CheckCircle, XCircle,
  Building, Shield, Loader, Eye, Plus, X, Trash2, BookOpen, Flag, Bell, TrendingUp, Send,
  FileText, Video, ListChecks, Phone, BarChart3
} from 'lucide-react';

const COLORS = ['#BAFF39', '#74b9ff', '#fdcb6e', '#e17055', '#a29bfe', '#00cec9', '#fab1a0', '#81ecec'];

const roleBadge = {
  student: 'bg-blue-100 text-blue-700',
  counsellor: 'bg-emerald-100 text-emerald-700',
  volunteer: 'bg-purple-100 text-purple-700',
  admin: 'bg-yellow-100 text-yellow-700',
  superadmin: 'bg-red-100 text-red-700',
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin';

  const [tab, setTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [resources, setResources] = useState([]);
  const [flaggedPosts, setFlaggedPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [proofModal, setProofModal] = useState(null);
  const [showAddCollege, setShowAddCollege] = useState(false);
  const [newCollege, setNewCollege] = useState({ name: '', domain: '', address: '' });
  const [showAddResource, setShowAddResource] = useState(false);
  const [newResource, setNewResource] = useState({ title: '', description: '', category: 'article', tags: '', content: '', videoUrl: '', readTime: 3, thumbnailEmoji: '📄' });
  const [showAddNotif, setShowAddNotif] = useState(false);
  const [newNotif, setNewNotif] = useState({ title: '', message: '', type: 'announcement', priority: 'medium', audience: 'all' });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [analyticsRes, usersRes] = await Promise.all([
        API.get(adminEndpoints.GET_ANALYTICS_API),
        API.get(adminEndpoints.GET_ALL_USERS_API),
      ]);
      setAnalytics(analyticsRes.data.analytics);
      setUsers(usersRes.data.users || []);

      if (isSuperAdmin) {
        const [adminsRes, collegesRes] = await Promise.all([
          API.get(adminEndpoints.GET_PENDING_ADMINS_API),
          API.get(collegeEndpoints.GET_COLLEGES_API),
        ]);
        setPendingAdmins(adminsRes.data.admins || []);
        setColleges(collegesRes.data.colleges || []);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchResources = async () => {
    try {
      const res = await API.get(resourceEndpoints.GET_ALL_RESOURCES_API);
      setResources(res.data.resources || []);
    } catch (err) { console.error(err); }
  };

  const fetchFlagged = async () => {
    try {
      const res = await API.get('/forum/flagged');
      setFlaggedPosts(res.data.posts || []);
    } catch (err) { console.error(err); }
  };

  const fetchNotifications = async () => {
    try {
      const res = await API.get(notificationEndpoints.GET_ADMIN_NOTIFICATIONS_API);
      setNotifications(res.data.notifications || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (tab === 'resources') fetchResources();
    if (tab === 'moderation') fetchFlagged();
    if (tab === 'notifications') fetchNotifications();
  }, [tab]);

  // Actions
  const handleApprove = async (id) => { await API.put(`/users/${id}/approve`); fetchAll(); };
  const handleDeactivate = async (id) => { await API.put(`/users/${id}/deactivate`); fetchAll(); };
  const handleActivate = async (id) => { await API.put(`/users/${id}/activate`); fetchAll(); };
  const handleVerifyAdmin = async (id) => { await API.put(`/admin/verify-admin/${id}`); fetchAll(); };
  const handleRejectAdmin = async (id) => { await API.put(`/admin/reject-admin/${id}`); fetchAll(); };

  const handleAddCollege = async () => {
    if (!newCollege.name.trim()) return;
    await API.post(collegeEndpoints.CREATE_COLLEGE_API, newCollege);
    setNewCollege({ name: '', domain: '', address: '' }); setShowAddCollege(false); fetchAll();
  };
  const handleDeleteCollege = async (id) => { await API.delete(`/colleges/${id}`); fetchAll(); };

  const handleAddResource = async () => {
    if (!newResource.title.trim() || !newResource.description.trim()) return;
    const payload = { ...newResource, tags: newResource.tags.split(',').map(t => t.trim()).filter(Boolean) };
    await API.post(resourceEndpoints.CREATE_RESOURCE_API, payload);
    setNewResource({ title: '', description: '', category: 'article', tags: '', content: '', videoUrl: '', readTime: 3, thumbnailEmoji: '📄' });
    setShowAddResource(false); fetchResources();
  };

  const handleModerate = async (id, action) => {
    await API.put(`/forum/${id}/moderate`, { action });
    fetchFlagged();
  };

  const handleAddNotification = async () => {
    if (!newNotif.title.trim() || !newNotif.message.trim()) return;
    await API.post(notificationEndpoints.CREATE_NOTIFICATION_API, newNotif);
    setNewNotif({ title: '', message: '', type: 'announcement', priority: 'medium', audience: 'all' });
    setShowAddNotif(false); fetchNotifications();
  };
  const handleDeleteNotification = async (id) => {
    await API.delete(`/notifications/${id}`);
    fetchNotifications();
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader className="animate-spin" size={32} /></div>;

  const a = analytics || {};
  const u = a.users || {};
  const g = a.graphs || {};

  // TAB CONFIG
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'resources', label: 'Resources', icon: BookOpen },
    { id: 'moderation', label: 'Moderation', icon: Flag },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    ...(isSuperAdmin ? [
      { id: 'verify', label: 'Verify Admins', icon: Shield },
      { id: 'colleges', label: 'Colleges', icon: Building },
    ] : [])
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{isSuperAdmin ? '🛡️ Super Admin' : '🏛️ College Admin'} Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">{user?.collegeName && `College: ${user.collegeName}`}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border-none cursor-pointer
            ${tab === t.id ? 'bg-[#1a1a1a] text-[#BAFF39]' : 'bg-transparent text-gray-500 hover:bg-gray-100'}`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* ═══ OVERVIEW TAB ═══ */}
      {tab === 'overview' && (
        <div>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Students', value: u.totalStudents, icon: Users, color: '#74b9ff' },
              { label: 'Counsellors', value: u.totalCounsellors, icon: Brain, color: '#BAFF39' },
              { label: 'Appointments', value: a.appointments?.total, icon: CalendarDays, color: '#fdcb6e' },
              { label: 'Flagged Posts', value: a.forum?.flaggedPosts, icon: AlertTriangle, color: '#e17055' },
              { label: 'Screenings', value: a.screenings?.total, icon: ClipboardCheck, color: '#a29bfe' },
              { label: 'Resources', value: a.resources?.total, icon: BookOpen, color: '#00cec9' },
              { label: 'Mood Entries', value: a.mood?.totalEntries, icon: MessageSquare, color: '#fab1a0' },
              { label: 'Referrals', value: a.referrals?.total, icon: AlertTriangle, color: '#81ecec' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}18`, color: s.color }}>
                    <s.icon size={20} />
                  </div>
                  <span className="text-2xl font-bold">{s.value ?? 0}</span>
                </div>
                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* User Growth */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><TrendingUp size={16} /> User Growth (30 days)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={g.userGrowth || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="_id" tick={{ fontSize: 10 }} tickFormatter={v => v?.slice(5)} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#BAFF39" strokeWidth={2} dot={{ fill: '#BAFF39', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Mood Distribution */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><Brain size={16} /> Mood Distribution</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={a.mood?.distribution || []} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} label={({ _id, count }) => `${_id} (${count})`}>
                    {(a.mood?.distribution || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Issue Distribution */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><AlertTriangle size={16} /> Most Common Issues</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={g.issueDistribution || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="_id" tick={{ fontSize: 11 }} width={90} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#BAFF39" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Weekly Usage */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><BarChart3 size={16} /> Weekly Appointments</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={g.weeklyUsage || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="_id" tick={{ fontSize: 10 }} tickFormatter={v => `W${v?.split('-')[1]}`} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#74b9ff" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ═══ USERS TAB ═══ */}
      {tab === 'users' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold">All Users ({users.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 text-left">
                <th className="p-3 font-semibold">Name</th><th className="p-3 font-semibold">Email</th>
                <th className="p-3 font-semibold">Role</th><th className="p-3 font-semibold">College</th>
                <th className="p-3 font-semibold">Status</th><th className="p-3 font-semibold">Actions</th>
              </tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="p-3 font-medium">{u.name}</td>
                    <td className="p-3 text-gray-500">{u.email}</td>
                    <td className="p-3"><span className={`px-2 py-1 rounded-lg text-xs font-semibold ${roleBadge[u.role] || ''}`}>{u.role}</span></td>
                    <td className="p-3 text-gray-500 text-xs">{u.collegeName || '—'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-3 flex gap-1">
                      {!u.isApproved && <button onClick={() => handleApprove(u._id)} className="px-2 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-semibold border-none cursor-pointer hover:bg-green-100">Approve</button>}
                      {u.isActive ? (
                        <button onClick={() => handleDeactivate(u._id)} className="px-2 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-semibold border-none cursor-pointer hover:bg-red-100">Deactivate</button>
                      ) : (
                        <button onClick={() => handleActivate(u._id)} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold border-none cursor-pointer hover:bg-blue-100">Activate</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ RESOURCES TAB ═══ */}
      {tab === 'resources' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold">Resource Hub ({resources.length} items)</h3>
            <button onClick={() => setShowAddResource(true)} className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-[#BAFF39] rounded-xl text-xs font-bold border-none cursor-pointer hover:bg-[#2a2a2a]">
              <Plus size={14} /> Add Resource
            </button>
          </div>

          {/* Add Resource Form */}
          {showAddResource && (
            <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold">New Resource</h4>
                <button onClick={() => setShowAddResource(false)} className="bg-transparent border-none cursor-pointer text-gray-400 hover:text-gray-700"><X size={18} /></button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input placeholder="Title" value={newResource.title} onChange={e => setNewResource(p => ({ ...p, title: e.target.value }))} className="p-2 border border-gray-200 rounded-xl text-sm" />
                <select value={newResource.category} onChange={e => setNewResource(p => ({ ...p, category: e.target.value }))} className="p-2 border border-gray-200 rounded-xl text-sm">
                  <option value="article">📝 Article</option>
                  <option value="guide">⚡ Quick Guide</option>
                  <option value="video">🎥 Video</option>
                  <option value="toolkit">🧰 Toolkit</option>
                  <option value="helpline">📞 Helpline</option>
                </select>
              </div>
              <textarea placeholder="Description" value={newResource.description} onChange={e => setNewResource(p => ({ ...p, description: e.target.value }))} className="w-full p-2 border border-gray-200 rounded-xl text-sm mb-3" rows={2} />
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input placeholder="Tags (comma-separated)" value={newResource.tags} onChange={e => setNewResource(p => ({ ...p, tags: e.target.value }))} className="p-2 border border-gray-200 rounded-xl text-sm" />
                <input placeholder="Emoji icon (📄)" value={newResource.thumbnailEmoji} onChange={e => setNewResource(p => ({ ...p, thumbnailEmoji: e.target.value }))} className="p-2 border border-gray-200 rounded-xl text-sm" />
              </div>
              {newResource.category === 'article' && (
                <textarea placeholder="Full article content" value={newResource.content} onChange={e => setNewResource(p => ({ ...p, content: e.target.value }))} className="w-full p-2 border border-gray-200 rounded-xl text-sm mb-3" rows={4} />
              )}
              {newResource.category === 'video' && (
                <input placeholder="YouTube embed URL" value={newResource.videoUrl} onChange={e => setNewResource(p => ({ ...p, videoUrl: e.target.value }))} className="w-full p-2 border border-gray-200 rounded-xl text-sm mb-3" />
              )}
              <button onClick={handleAddResource} className="px-5 py-2 bg-[#BAFF39] text-[#1a1a1a] rounded-xl text-sm font-bold border-none cursor-pointer hover:bg-[#d4ff7a]">Create Resource</button>
            </div>
          )}

          {/* Resource List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map(r => (
              <div key={r._id} className="bg-white rounded-2xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{r.thumbnailEmoji || '📄'}</span>
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide
                    ${r.category === 'article' ? 'bg-blue-50 text-blue-600' : r.category === 'video' ? 'bg-red-50 text-red-600' : r.category === 'guide' ? 'bg-amber-50 text-amber-600' : r.category === 'toolkit' ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'}`}>
                    {r.category}
                  </span>
                </div>
                <h4 className="text-sm font-bold mb-1">{r.title}</h4>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{r.description}</p>
                <div className="flex gap-1 flex-wrap">
                  {(r.tags || []).map((t, i) => <span key={i} className="px-2 py-0.5 bg-gray-100 rounded-full text-[10px] text-gray-500">{t}</span>)}
                </div>
              </div>
            ))}
          </div>
          {resources.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No resources yet. Add your first resource!</p>}
        </div>
      )}

      {/* ═══ MODERATION TAB ═══ */}
      {tab === 'moderation' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold flex items-center gap-2"><Flag size={16} className="text-red-500" /> Flagged Posts ({flaggedPosts.length})</h3>
          </div>
          {flaggedPosts.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
              <CheckCircle size={40} className="text-green-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No flagged posts. Community is clean! 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {flaggedPosts.map(post => (
                <div key={post._id} className="bg-white rounded-2xl p-4 border border-red-100">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-xs text-red-500 font-semibold">⚠️ {post.flagReason || 'Flagged by user'}</span>
                      <p className="text-sm mt-1">{post.content}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs text-gray-400">{post.isAnonymous ? 'Anonymous' : post.author?.name}</span>
                    <span className="text-xs text-gray-300">•</span>
                    <span className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                    <div className="ml-auto flex gap-2">
                      <button onClick={() => handleModerate(post._id, 'approve')} className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-semibold border-none cursor-pointer hover:bg-green-100">Keep</button>
                      <button onClick={() => handleModerate(post._id, 'hide')} className="px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-xs font-semibold border-none cursor-pointer hover:bg-orange-100">Hide</button>
                      <button onClick={() => handleModerate(post._id, 'delete')} className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-semibold border-none cursor-pointer hover:bg-red-100">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ ANALYTICS TAB ═══ */}
      {tab === 'analytics' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* User Growth Big */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 md:col-span-2">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><TrendingUp size={16} /> User Registration Trend (30 days)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={g.userGrowth || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="_id" tick={{ fontSize: 10 }} tickFormatter={v => v?.slice(5)} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#BAFF39" strokeWidth={3} dot={{ fill: '#BAFF39', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Issue Pie */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h3 className="text-sm font-bold mb-4">Most Common Issues</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={g.issueDistribution || []} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={90} innerRadius={50} label={({ _id, percent }) => `${_id} (${(percent * 100).toFixed(0)}%)`}>
                    {(g.issueDistribution || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Resource Distribution */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h3 className="text-sm font-bold mb-4">Resources by Category</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={a.resources?.byCategory || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#a29bfe" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
              <p className="text-2xl font-bold text-[#BAFF39]">{a.appointments?.pending || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Pending Appointments</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
              <p className="text-2xl font-bold text-[#e17055]">{a.referrals?.unresolved || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Unresolved Referrals</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
              <p className="text-2xl font-bold text-[#74b9ff]">{a.forum?.totalPosts || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Forum Posts</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
              <p className="text-2xl font-bold text-[#fdcb6e]">{u.totalVolunteers || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Active Volunteers</p>
            </div>
          </div>
        </div>
      )}

      {/* ═══ NOTIFICATIONS TAB ═══ */}
      {tab === 'notifications' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold flex items-center gap-2"><Bell size={16} /> Notifications ({notifications.length})</h3>
            <button onClick={() => setShowAddNotif(true)} className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-[#BAFF39] rounded-xl text-xs font-bold border-none cursor-pointer hover:bg-[#2a2a2a]">
              <Send size={14} /> Send Notification
            </button>
          </div>

          {/* Add Notification Form */}
          {showAddNotif && (
            <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold">New Notification</h4>
                <button onClick={() => setShowAddNotif(false)} className="bg-transparent border-none cursor-pointer text-gray-400"><X size={18} /></button>
              </div>
              <input placeholder="Title" value={newNotif.title} onChange={e => setNewNotif(p => ({ ...p, title: e.target.value }))} className="w-full p-2 border border-gray-200 rounded-xl text-sm mb-3" />
              <textarea placeholder="Message" value={newNotif.message} onChange={e => setNewNotif(p => ({ ...p, message: e.target.value }))} className="w-full p-2 border border-gray-200 rounded-xl text-sm mb-3" rows={3} />
              <div className="grid grid-cols-3 gap-3 mb-4">
                <select value={newNotif.type} onChange={e => setNewNotif(p => ({ ...p, type: e.target.value }))} className="p-2 border border-gray-200 rounded-xl text-sm">
                  <option value="announcement">📢 Announcement</option>
                  <option value="alert">🚨 Alert</option>
                  <option value="tip">💡 Tip</option>
                  <option value="update">🔄 Update</option>
                </select>
                <select value={newNotif.priority} onChange={e => setNewNotif(p => ({ ...p, priority: e.target.value }))} className="p-2 border border-gray-200 rounded-xl text-sm">
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
                <select value={newNotif.audience} onChange={e => setNewNotif(p => ({ ...p, audience: e.target.value }))} className="p-2 border border-gray-200 rounded-xl text-sm">
                  <option value="all">👥 Everyone</option>
                  <option value="students">🎓 Students</option>
                  <option value="counsellors">🧑‍⚕️ Counsellors</option>
                  <option value="volunteers">🤝 Volunteers</option>
                </select>
              </div>
              <button onClick={handleAddNotification} className="px-5 py-2 bg-[#BAFF39] text-[#1a1a1a] rounded-xl text-sm font-bold border-none cursor-pointer hover:bg-[#d4ff7a]">
                <Send size={14} className="inline mr-1" /> Send
              </button>
            </div>
          )}

          {/* Notification List */}
          <div className="space-y-3">
            {notifications.map(n => (
              <div key={n._id} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{n.type === 'announcement' ? '📢' : n.type === 'alert' ? '🚨' : n.type === 'tip' ? '💡' : '🔄'}</span>
                    <h4 className="text-sm font-bold">{n.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${n.priority === 'high' ? 'bg-red-50 text-red-600' : n.priority === 'medium' ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'}`}>{n.priority}</span>
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[10px] text-gray-500">{n.audience}</span>
                  </div>
                  <p className="text-xs text-gray-500">{n.message}</p>
                  <p className="text-[10px] text-gray-400 mt-1">by {n.createdBy?.name} • {new Date(n.createdAt).toLocaleDateString()}</p>
                </div>
                <button onClick={() => handleDeleteNotification(n._id)} className="bg-transparent border-none text-gray-300 hover:text-red-500 cursor-pointer p-1">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          {notifications.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No notifications sent yet.</p>}
        </div>
      )}

      {/* ═══ VERIFY ADMINS TAB ═══ */}
      {tab === 'verify' && isSuperAdmin && (
        <div>
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><Shield size={16} /> Pending Admin Verifications ({pendingAdmins.length})</h3>
          {pendingAdmins.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
              <CheckCircle size={40} className="text-green-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No pending admin verifications.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingAdmins.map(admin => (
                <div key={admin._id} className="bg-white rounded-2xl p-4 border border-yellow-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold">{admin.name}</h4>
                      <p className="text-xs text-gray-500">{admin.email}</p>
                      <p className="text-xs text-gray-400 mt-1">College: {admin.collegeName || admin.college?.name || '—'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {admin.proofUrl && (
                        <button onClick={() => setProofModal(admin.proofUrl)} className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-semibold border-none cursor-pointer hover:bg-blue-100">
                          <Eye size={12} /> View Proof
                        </button>
                      )}
                      <button onClick={() => handleVerifyAdmin(admin._id)} className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-xl text-xs font-semibold border-none cursor-pointer hover:bg-green-100">
                        <CheckCircle size={12} /> Approve
                      </button>
                      <button onClick={() => handleRejectAdmin(admin._id)} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border-none cursor-pointer hover:bg-red-100">
                        <XCircle size={12} /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ COLLEGES TAB ═══ */}
      {tab === 'colleges' && isSuperAdmin && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold">Manage Colleges ({colleges.length})</h3>
            <button onClick={() => setShowAddCollege(true)} className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-[#BAFF39] rounded-xl text-xs font-bold border-none cursor-pointer">
              <Plus size={14} /> Add College
            </button>
          </div>
          {showAddCollege && (
            <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold">New College</h4>
                <button onClick={() => setShowAddCollege(false)} className="bg-transparent border-none cursor-pointer text-gray-400"><X size={18} /></button>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <input placeholder="College Name" value={newCollege.name} onChange={e => setNewCollege(p => ({ ...p, name: e.target.value }))} className="p-2 border border-gray-200 rounded-xl text-sm" />
                <input placeholder="Domain (e.g. iit.edu)" value={newCollege.domain} onChange={e => setNewCollege(p => ({ ...p, domain: e.target.value }))} className="p-2 border border-gray-200 rounded-xl text-sm" />
                <input placeholder="Address" value={newCollege.address} onChange={e => setNewCollege(p => ({ ...p, address: e.target.value }))} className="p-2 border border-gray-200 rounded-xl text-sm" />
              </div>
              <button onClick={handleAddCollege} className="px-5 py-2 bg-[#BAFF39] text-[#1a1a1a] rounded-xl text-sm font-bold border-none cursor-pointer hover:bg-[#d4ff7a]">Add College</button>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {colleges.map(c => (
              <div key={c._id} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-2"><Building size={14} className="text-gray-400" /> {c.name}</h4>
                  {c.domain && <p className="text-xs text-gray-400 mt-1">{c.domain}</p>}
                </div>
                <button onClick={() => handleDeleteCollege(c._id)} className="bg-transparent border-none text-gray-300 hover:text-red-500 cursor-pointer p-1"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proof Modal */}
      {proofModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setProofModal(null)}>
          <div className="bg-white rounded-2xl p-4 max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold">Admin ID Proof</h4>
              <button onClick={() => setProofModal(null)} className="bg-transparent border-none cursor-pointer text-gray-400"><X size={18} /></button>
            </div>
            <img src={proofModal} alt="ID Proof" className="w-full rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
