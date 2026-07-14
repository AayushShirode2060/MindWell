import { useState, useEffect } from 'react';
import API from '../api/axios';
import { notificationEndpoints } from '../api/endpoints';
import { Bell, Check, Info, AlertTriangle, Lightbulb, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NotificationWidget = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get(notificationEndpoints.GET_NOTIFICATIONS_API);
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
    setLoading(false);
  };

  const markAsRead = async (id) => {
    try {
      await API.put(`${notificationEndpoints.MARK_READ_API}/${id}/read`);
      // Update local state to reflect it's read by this user
      setNotifications(prev => prev.map(n => {
        if (n._id === id) {
          return { ...n, readBy: [...(n.readBy || []), user?._id] };
        }
        return n;
      }));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  if (loading) return null; // Or a small skeleton

  const unreadCount = notifications.filter(n => !n.readBy?.includes(user?._id)).length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm mt-8">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Bell size={16} className={unreadCount > 0 ? "text-[#BAFF39] fill-[#BAFF39]" : "text-gray-400"} /> 
          Announcements & Alerts
          {unreadCount > 0 && <span className="bg-[#BAFF39] text-[#1a1a1a] text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadCount} new</span>}
        </h3>
      </div>
      
      <div className="p-4 max-h-[300px] overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-4">No recent announcements.</p>
        ) : (
          <div className="space-y-3">
            {notifications.map(n => {
              const isRead = n.readBy?.includes(user?._id);
              return (
                <div key={n._id} className={`p-3 rounded-xl border ${isRead ? 'border-gray-100 bg-gray-50 opacity-70' : 'border-[#BAFF39]/30 bg-[#BAFF39]/5'} flex gap-3 transition-opacity`}>
                  <div className="mt-0.5">
                    {n.type === 'alert' ? <AlertTriangle size={16} className="text-red-500" /> :
                     n.type === 'tip' ? <Lightbulb size={16} className="text-yellow-500" /> :
                     n.type === 'update' ? <RefreshCw size={16} className="text-blue-500" /> :
                     <Info size={16} className="text-purple-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`text-sm ${isRead ? 'font-semibold' : 'font-bold'}`}>{n.title}</h4>
                      <span className="text-[10px] text-gray-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className={`text-xs ${isRead ? 'text-gray-500' : 'text-gray-700'}`}>{n.message}</p>
                  </div>
                  {!isRead && (
                    <button 
                      onClick={() => markAsRead(n._id)}
                      className="self-center p-1.5 rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-green-500 hover:border-green-200 cursor-pointer transition-colors"
                      title="Mark as read"
                    >
                      <Check size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationWidget;
