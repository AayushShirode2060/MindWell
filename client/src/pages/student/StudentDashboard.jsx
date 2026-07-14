import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import { moodEndpoints, appointmentEndpoints, chatEndpoints, screeningEndpoints } from '../../api/endpoints';
import NotificationWidget from '../../components/NotificationWidget';
import StudentHelpPanel from './components/StudentHelpPanel';

const moodLabels = { great: 'Great', good: 'Good', okay: 'Okay', low: 'Low', terrible: 'Bad' };

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ mood: '—', appointments: 0, chatSessions: 0, assessments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [moodRes, apptRes, chatRes, screenRes] = await Promise.allSettled([
          API.get(`${moodEndpoints.GET_MOOD_HISTORY_API}?days=1`),
          API.get(appointmentEndpoints.GET_MY_APPOINTMENTS_API),
          API.get(chatEndpoints.GET_CHAT_HISTORY_API),
          API.get(screeningEndpoints.GET_MY_SCREENINGS_API),
        ]);

        // Mood today — latest entry's mood label
        let mood = '—';
        if (moodRes.status === 'fulfilled') {
          const entries = moodRes.value?.data?.entries;
          if (entries?.length > 0) {
            mood = moodLabels[entries[0].mood] || entries[0].mood;
          }
        }

        // Upcoming appointments count
        let appointments = 0;
        if (apptRes.status === 'fulfilled') {
          const appts = apptRes.value?.data?.appointments || apptRes.value?.data || [];
          const now = new Date();
          appointments = Array.isArray(appts)
            ? appts.filter(a => new Date(a.date || a.slotDate) >= now || a.status === 'scheduled' || a.status === 'confirmed').length
            : 0;
        }

        // Chat sessions — count of distinct conversation days (or total messages / 2 as proxy)
        let chatSessions = 0;
        if (chatRes.status === 'fulfilled') {
          const messages = chatRes.value?.data?.messages || [];
          // Count unique dates as sessions
          const uniqueDays = new Set(messages.map(m => new Date(m.createdAt).toDateString()));
          chatSessions = uniqueDays.size;
        }

        // Assessments count
        let assessments = 0;
        if (screenRes.status === 'fulfilled') {
          const screenings = screenRes.value?.data?.screenings || screenRes.value?.data || [];
          assessments = Array.isArray(screenings) ? screenings.length : 0;
        }

        setStats({ mood, appointments, chatSessions, assessments });
      } catch (err) {
        console.error('Dashboard stats fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    { icon: '🧠', value: stats.mood, label: 'Mood Today', bg: 'bg-primary/15' },
    { icon: '📅', value: stats.appointments, label: 'Appointments', bg: 'bg-blue-400/15' },
    { icon: '💬', value: stats.chatSessions, label: 'Chat Sessions', bg: 'bg-yellow-400/15' },
    { icon: '📝', value: stats.assessments, label: 'Assessments', bg: 'bg-emerald-400/15' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-text-main">
          Hey, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-text-muted mt-1">Here's your mental wellness overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((s, i) => (
          <div key={i} className="bg-white border border-border-custom rounded-2xl p-6 hover:shadow-md transition-all">
            <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center text-xl mb-4`}>{s.icon}</div>
            <div className="text-3xl font-extrabold tracking-tight text-text-main">
              {loading ? (
                <div className="h-9 w-16 bg-gray-200 rounded-lg animate-pulse" />
              ) : s.value}
            </div>
            <div className="text-xs text-text-muted uppercase tracking-wide mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-border-custom">
        <h3 className="text-lg font-bold mb-2">Welcome to MindWell</h3>
        <p className="text-text-light">
          Start by tracking your mood, taking a self-assessment, or chatting with our AI counsellor.
          All your data is confidential and secure.
        </p>
      </div>

      <StudentHelpPanel />

      <NotificationWidget />
    </div>
  );
};

export default StudentDashboard;
