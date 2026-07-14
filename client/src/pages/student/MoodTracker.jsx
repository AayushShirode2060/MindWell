import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { moodEndpoints } from '../../api/endpoints';
import { Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const moods = [
  { value: 'great', emoji: '😄', label: 'Great' },
  { value: 'good', emoji: '🙂', label: 'Good' },
  { value: 'okay', emoji: '😐', label: 'Okay' },
  { value: 'low', emoji: '😔', label: 'Low' },
  { value: 'terrible', emoji: '😢', label: 'Terrible' },
];

const activityList = ['exercise', 'study', 'social', 'sleep', 'meditation', 'therapy', 'creative', 'nature', 'music'];

const moodEmoji = { great: '😄', good: '🙂', okay: '😐', low: '😔', terrible: '😢' };

const MoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState('');
  const [note, setNote] = useState('');
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [sleepHours, setSleepHours] = useState('');
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      const res = await API.get(`${moodEndpoints.GET_MOOD_HISTORY_API}?days=30`);
      setEntries(res.data.entries);
      setStats(res.data.stats);
    } catch (err) { console.error('Failed to fetch mood history:', err); }
  };

  const toggleActivity = (activity) => {
    setSelectedActivities(prev =>
      prev.includes(activity) ? prev.filter(a => a !== activity) : [...prev, activity]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMood) { setError('Please select a mood'); return; }
    setError(''); setLoading(true);
    try {
      await API.post(moodEndpoints.CREATE_MOOD_API, {
        mood: selectedMood, note,
        activities: selectedActivities,
        sleepHours: sleepHours ? parseFloat(sleepHours) : null
      });
      setSuccess('Mood logged! 🎉');
      setSelectedMood(''); setNote(''); setSelectedActivities([]); setSleepHours('');
      fetchHistory();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log mood');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`${moodEndpoints.CREATE_MOOD_API}/${id}`);
      fetchHistory();
    } catch (err) { console.error('Delete failed:', err); }
  };

  const chartData = [...entries].reverse().map(e => ({
    date: new Date(e.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    score: e.moodScore
  }));

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-text-main">Mood Tracker</h1>
        <p className="text-text-muted mt-1">Track how you're feeling and spot patterns over time</p>
      </div>

      {/* Log Mood Card */}
      <div className="bg-white rounded-2xl p-6 border border-border-custom shadow-sm mb-6">
        <h3 className="text-lg font-bold mb-4">How are you feeling today?</h3>

        {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg border-l-4 border-red-500 mb-4 text-sm font-medium">{error}</div>}
        {success && <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg border-l-4 border-primary mb-4 text-sm font-medium">{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* Mood Picker */}
          <div className="flex gap-3 justify-center my-6">
            {moods.map(m => (
              <button key={m.value} type="button" onClick={() => setSelectedMood(m.value)}
                className={`flex flex-col items-center gap-2 px-5 py-4 rounded-2xl border-2 bg-white cursor-pointer transition-all duration-300 text-3xl min-w-[80px] hover:-translate-y-1 hover:shadow-md
                ${selectedMood === m.value
                  ? 'border-primary bg-primary/10 shadow-glow'
                  : 'border-border-custom hover:border-dark'}`}>
                {m.emoji}
                <span className={`text-[0.7rem] font-semibold uppercase tracking-wider
                  ${selectedMood === m.value ? 'text-primary-dark font-bold' : 'text-text-muted'}`}>
                  {m.label}
                </span>
              </button>
            ))}
          </div>

          {/* Activities */}
          <label className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2 block">
            What did you do today?
          </label>
          <div className="flex flex-wrap gap-2 my-4">
            {activityList.map(a => (
              <button key={a} type="button" onClick={() => toggleActivity(a)}
                className={`px-4 py-2 rounded-full border-2 text-xs font-semibold cursor-pointer transition-all duration-200
                ${selectedActivities.includes(a)
                  ? 'border-primary bg-primary/15 text-text-main'
                  : 'border-border-custom bg-surface text-text-light hover:border-dark'}`}>
                {a}
              </button>
            ))}
          </div>

          {/* Note + Sleep */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">Note (optional)</label>
              <textarea placeholder="How was your day?" value={note} onChange={(e) => setNote(e.target.value)}
                rows={3} maxLength={500}
                className="px-4 py-3 border-2 border-border-custom rounded-xl text-sm bg-surface focus:border-dark focus:bg-white transition-all outline-none resize-none font-inter" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">Sleep Hours</label>
              <input type="number" placeholder="e.g. 7" value={sleepHours} onChange={(e) => setSleepHours(e.target.value)}
                min="0" max="24" step="0.5"
                className="px-4 py-3 border-2 border-border-custom rounded-xl text-sm bg-surface focus:border-dark focus:bg-white transition-all outline-none font-inter" />
            </div>
          </div>

          <button type="submit" disabled={loading || !selectedMood}
            className="mt-4 px-7 py-3.5 rounded-full bg-primary text-dark font-semibold text-sm hover:-translate-y-0.5 hover:shadow-glow transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none">
            {loading ? <div className="w-5 h-5 border-3 border-border-custom border-t-dark rounded-full animate-spin mx-auto" /> : 'Log Mood'}
          </button>
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon: '📊', value: stats.totalEntries || 0, label: 'Entries (30 days)' },
          { icon: '⭐', value: stats.avgScore || '—', label: 'Avg Mood Score' },
          { icon: '🔥', value: entries.length > 0 ? moodEmoji[entries[0].mood] : '—', label: 'Latest Mood' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-border-custom rounded-2xl p-6 hover:shadow-md transition-all">
            <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center text-xl mb-4">{s.icon}</div>
            <div className="text-3xl font-extrabold tracking-tight text-text-main">{s.value}</div>
            <div className="text-xs text-text-muted uppercase tracking-wide mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Mood Chart */}
      {chartData.length > 1 && (
        <div className="bg-white rounded-2xl p-6 border border-border-custom shadow-sm mb-6">
          <h3 className="text-lg font-bold mb-4">Mood Trend (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e0db" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]}
                tickFormatter={(v) => ['', '😢', '😔', '😐', '🙂', '😄'][v]} />
              <Tooltip formatter={(value) => [`Score: ${value}`, 'Mood']} />
              <Line type="monotone" dataKey="score" stroke="#BAFF39" strokeWidth={3}
                dot={{ fill: '#BAFF39', r: 5 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* History */}
      <div className="mt-8">
        <h3 className="text-lg font-bold mb-4">Recent Entries</h3>
        {entries.length === 0 ? (
          <p className="text-text-muted">No mood entries yet. Log your first mood above!</p>
        ) : entries.map(entry => (
          <div key={entry._id} className="flex items-center gap-4 px-5 py-4 bg-white border border-border-custom rounded-xl mb-2 hover:shadow-sm transition-all">
            <div className="text-2xl">{moodEmoji[entry.mood]}</div>
            <div className="flex-1">
              <div className="text-xs text-text-muted">
                {new Date(entry.createdAt).toLocaleDateString('en-IN', {
                  weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                })}
              </div>
              {entry.note && <div className="text-sm text-text-main mt-0.5">{entry.note}</div>}
              {entry.activities.length > 0 && (
                <div className="flex gap-1 mt-1 flex-wrap">
                  {entry.activities.map(a => (
                    <span key={a} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{a}</span>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => handleDelete(entry._id)}
              className="bg-transparent text-gray-300 hover:text-red-500 p-2 border-none cursor-pointer transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoodTracker;
