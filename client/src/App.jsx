import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import './index.css';
import DashboardLayout from './components/DashboardLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import MoodTracker from './pages/student/MoodTracker';
import Screening from './pages/student/Screening';
import ChatBot from './pages/student/ChatBot';
import BookAppointment from './pages/student/BookAppointment';
import CounsellorDashboard from './pages/counsellor/CounsellorDashboard';
import CounsellorAppointments from './pages/counsellor/CounsellorAppointments';
import CounsellorCalendar from './pages/counsellor/CounsellorCalendar';
import CounsellorReferrals from './pages/counsellor/CounsellorReferrals';
import CounsellorChatWorkspace from './pages/counsellor/CounsellorChatWorkspace';
import ForumPage from './pages/student/ForumPage';
import ResourcesPage from './pages/student/ResourcesPage';
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard';
import VolunteerChatWorkspace from './pages/volunteer/components/VolunteerChatWorkspace';
import ModerationTab from './pages/volunteer/components/ModerationTab';
import TrainingTab from './pages/volunteer/components/TrainingTab';
import AdminDashboard from './pages/admin/AdminDashboard';
import GamesPage from './pages/student/GamesPage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="spinner" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" />;
  return children;
};

const TempDashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-4xl font-bold">🧠 Welcome to MindWell!</h1>
      <p className="text-gray-500 text-lg">
        Logged in as <span className="font-semibold text-primary">{user?.name}</span> ({user?.role})
      </p>
      <button className="btn btn-secondary" onClick={logout}>Logout</button>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
         
         <Route path="/student" element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardLayout/>
          </ProtectedRoute>
         }>
          <Route path="dashboard" element={<StudentDashboard/>}/>
          <Route path="mood" element={<MoodTracker/>}/>
          <Route path="screening" element={<Screening/>}/>
          <Route path="chat" element={<ChatBot/>} />
          <Route path='appointments' element={<BookAppointment/>}/>
          <Route path="forum" element={<ForumPage/>}/>
          <Route path="resources" element={<ResourcesPage/>}/>
          <Route path="games" element={<GamesPage/>}/>
         </Route>
          {/* <Route path="/student/*" element={<ProtectedRoute allowedRoles={['student']}><TempDashboard /></ProtectedRoute>} /> */}
          {/* <Route path="/counsellor/*" element={<ProtectedRoute allowedRoles={['counsellor']}><TempDashboard /></ProtectedRoute>} /> */}
          
           <Route path="/counsellor" element={
            <ProtectedRoute allowedRoles={['counsellor']}>
              <DashboardLayout/>
            </ProtectedRoute>
           }>
            <Route path="dashboard" element={<CounsellorDashboard/>}/>
            <Route path="appointments" element={<CounsellorAppointments/>}/>
            <Route path="calendar" element={<CounsellorCalendar/>}/>
            <Route path="referrals" element={<CounsellorReferrals/>}/>
            <Route path="escalated-chat" element={<CounsellorChatWorkspace/>}/>
           </Route>
           <Route path="/volunteer" element={
            <ProtectedRoute allowedRoles={['volunteer']}>
              <DashboardLayout/>
            </ProtectedRoute>
           }>
            <Route path="dashboard" element={<VolunteerDashboard/>}/>
            <Route path="chat" element={<VolunteerChatWorkspace/>}/>
            <Route path="moderation" element={
              <div className="flex flex-col h-full bg-gray-50/30">
                <ModerationTab/>
              </div>
            }/>
            <Route path="training" element={
              <div className="flex flex-col h-full bg-gray-50/30">
                <TrainingTab/>
              </div>
            }/>
           </Route>
          
          {/* <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['admin','superadmin']}><TempDashboard /></ProtectedRoute>} /> */}
          <Route path="/admin" element={
  <ProtectedRoute allowedRoles={['admin','superadmin']}>
     <DashboardLayout/>
   </ProtectedRoute>
 }>
   <Route path="dashboard" element={<AdminDashboard/>} />
 </Route>
          

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
