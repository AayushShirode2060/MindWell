import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import NotificationWidget from '../../components/NotificationWidget';
import OverviewTab from './components/OverviewTab';

const VolunteerDashboard = () => {
  const { user } = useAuth();
  const [availability, setAvailability] = useState(user?.availabilityStatus || 'offline');

  const handleAvailabilityToggle = async (status) => {
    // Expected to be updated in a real implementation via an API
    setAvailability(status);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/30">
      {/* Gamification & Availability Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-4 rounded-2xl border border-border-custom shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-text-main flex items-center gap-2">
            Volunteer Hub 🤝
          </h1>
          <p className="text-text-muted mt-1 text-sm">Provide confidential peer support and moderation.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-3 border-r border-gray-100 flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-gray-400">Level</span>
            <span className="font-bold text-primary">{user?.gamification?.level || 1}</span>
          </div>
          <div className="px-3 border-r border-gray-100 flex flex-col items-center">
             <span className="text-[10px] uppercase font-bold text-gray-400">Points</span>
             <span className="font-bold text-yellow-500">⭐ {user?.gamification?.points || 0}</span>
          </div>
          <div className="px-3 flex items-center gap-2">
             <span className="text-xs font-bold text-gray-500">Status:</span>
             <select 
                value={availability}
                onChange={(e) => handleAvailabilityToggle(e.target.value)}
                className={`text-sm font-bold p-1.5 rounded-lg outline-none cursor-pointer border-none shadow-sm
                  ${availability === 'available' ? 'bg-emerald-100 text-emerald-700' : 
                    availability === 'busy' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}
             >
                <option value="available">🟢 Available</option>
                <option value="busy">🟡 Busy</option>
                <option value="offline">⚪ Offline</option>
             </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        <OverviewTab />
      </div>

       {/* Keep standard notifications active below */}
      <div className="mt-8">
        <NotificationWidget />
      </div>
    </div>
  );
};

export default VolunteerDashboard;
