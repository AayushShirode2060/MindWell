import { useState, useEffect } from 'react';
import API from '../../../api/axios';
import { helpRequestEndpoints } from '../../../api/endpoints';
import { Users, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

const OverviewTab = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ helpedStudents: 0, sessionsCompleted: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
    fetchStats();
    const interval = setInterval(fetchRequests, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await API.get(helpRequestEndpoints.GET_PENDING_API);
      setRequests(res.data.requests);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get('/help-requests/stats');
      if (res.data.stats) setStats(res.data.stats);
    } catch (err) {
      console.error(err);
    }
  };

  const acceptRequest = async (id) => {
    try {
      const res = await API.post(`${helpRequestEndpoints.ACCEPT_REQUEST_API}/${id}/accept`);
      if (res.data.success) {
        navigate('/volunteer/chat');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept request');
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-border-custom flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-600">
            <AlertCircle size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-text-main">{requests.length}</div>
            <div className="text-xs font-bold text-text-muted uppercase">Pending Requests</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-border-custom flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-text-main">{stats.helpedStudents}</div>
            <div className="text-xs font-bold text-text-muted uppercase">Helped Students</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-border-custom flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-text-main">{stats.sessionsCompleted}</div>
            <div className="text-xs font-bold text-text-muted uppercase">Sessions Completed</div>
          </div>
        </div>
      </div>

      {/* Queue */}
      <div className="bg-white rounded-2xl border border-border-custom overflow-hidden">
        <div className="p-5 border-b border-border-custom">
          <h2 className="text-lg font-bold">Live Help Requests</h2>
          <p className="text-sm text-text-muted">Students waiting for emotional support right now.</p>
        </div>
        
        <div className="p-5">
          {loading ? (
            <p className="text-center text-text-muted py-8">Loading queue...</p>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">☕</div>
              <h3 className="text-lg font-bold text-text-main">No pending requests</h3>
              <p className="text-sm text-text-muted">Everything is calm. Take a breather!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map(req => (
                <div key={req._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-surface rounded-xl border border-border-custom">
                  <div className="mb-3 sm:mb-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-text-main py-0.5 px-2 bg-white rounded shadow-sm text-sm border border-gray-100">Anonymous Student</span>
                      {req.urgency === 'high' || req.urgency === 'critical' ? (
                         <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded flex items-center gap-1 uppercase">
                           <AlertTriangle size={10}/> High Urgency
                         </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded uppercase">
                          {req.urgency} Urgency
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-text-muted">Issue: <span className="font-semibold text-text-main">{req.issueType}</span></div>
                    <div className="text-[10px] text-gray-400 mt-1">Waiting: {Math.floor((new Date() - new Date(req.createdAt)) / 60000)} mins</div>
                  </div>
                  <button 
                    onClick={() => acceptRequest(req._id)}
                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors shadow-sm"
                  >
                    Accept Request
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
