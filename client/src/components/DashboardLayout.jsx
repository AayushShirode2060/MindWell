import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { LayoutDashboard, SmilePlus, ClipboardCheck, MessageCircle, CalendarDays, BookOpen, Users, LogOut, Brain, AlertTriangle, Flag, Gamepad2, Building } from 'lucide-react';
import ProfileModal from './ProfileModal';


const adminLinks = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
];


const studentLinks = [
  { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/student/mood', icon: SmilePlus, label: 'Mood Tracker' },
  { to: '/student/screening', icon: ClipboardCheck, label: 'Self-Assessment' },
  { to: '/student/chat', icon: MessageCircle, label: 'AI Chatbot' },
  { to: '/student/appointments', icon: CalendarDays, label: 'Appointments' },
  { to: '/student/resources', icon: BookOpen, label: 'Resources' },
  { to: '/student/forum', icon: Users, label: 'Forum' },
  { to: '/student/games', icon: Gamepad2, label: 'Games' },

];

const counsellorLinks = [
  { to: '/counsellor/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/counsellor/appointments', icon: CalendarDays, label: 'Appointments' },
  { to: '/counsellor/calendar', icon: CalendarDays, label: 'Calendar' },
  { to: '/counsellor/referrals', icon: AlertTriangle, label: 'Referrals' },
];

const volunteerLinks = [
  { to: '/volunteer/dashboard', icon: LayoutDashboard, label: 'Overview & Queue' },
  { to: '/volunteer/chat', icon: MessageCircle, label: 'Active Support Chat' },
  { to: '/volunteer/moderation', icon: Flag, label: 'Forum Moderation' },
  { to: '/volunteer/training', icon: BookOpen, label: 'Training Resources' }
];



const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const links = user?.role === 'counsellor' ? counsellorLinks 
  :user?.role==='volunteer'?volunteerLinks
   : user?.role === 'admin' || user?.role === 'superadmin' ? adminLinks
  : studentLinks;
  
  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar */}
      <aside className="w-64 bg-dark text-white flex flex-col fixed top-0 left-0 bottom-0 z-50 border-r border-white/5">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-white/5">
          <div className="flex items-center gap-2.5 text-primary font-extrabold text-xl tracking-tight">
            <Brain size={24} />
            <span>mindwell</span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 no-underline
                ${isActive
                  ? 'bg-primary text-dark font-semibold'
                  : 'text-white/50 hover:text-white hover:bg-white/5'}`
              }
            >
              <link.icon size={20} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/5">
          <div 
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-primary text-dark flex items-center justify-center font-extrabold text-sm">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">{user?.name}</span>
              <span className="text-xs text-white/40 capitalize">{user?.role}</span>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full text-left text-white/50 hover:text-red-500 hover:bg-red-500/10 transition-all duration-200 bg-transparent border-none cursor-pointer">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Profile Modal */}
      {isProfileOpen && <ProfileModal onClose={() => setIsProfileOpen(false)} />}

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
