import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { referralEndpoints } from '../../api/endpoints';
import { AlertTriangle, CheckCircle, Loader, ShieldAlert, MessageCircle } from 'lucide-react';

const CounsellorReferrals = () => {
  const [referrals, setReferrals] = useState([]);
  const [escalated, setEscalated] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [refRes, escRes] = await Promise.all([
        API.get(referralEndpoints.GET_COUNSELLOR_REFERRALS_API),
        API.get('/counsellor-escalated')
      ]);
      setReferrals(refRes.data.referrals);
      setEscalated(escRes.data.requests || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleStatus = async (id, status) => {
    try {
      await API.put(`${referralEndpoints.UPDATE_REFERRAL_API}/${id}`, { status });
      fetchAll();
    } catch (err) { console.error(err); }
  };

  const acceptEscalation = async (id) => {
    try {
      await API.put(`/counsellor-escalated/${id}/accept`);
      alert('You have successfully accepted this escalated case. An emergency appointment has been booked.');
      navigate('/counsellor/appointments');
    } catch (err) {
      alert('Failed to accept escalation.');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader size={24} className="animate-spin text-text-muted" />
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-text-main">crisis referrals</h1>
        <p className="text-text-muted mt-1">AI-detected crisis alerts & volunteer escalations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-border-custom">
          <div className="text-2xl font-extrabold text-red-500">{referrals.filter(r => r.status === 'unresolved').length}</div>
          <div className="text-xs text-text-muted mt-1">Unresolved</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-border-custom">
          <div className="text-2xl font-extrabold text-yellow-500">{referrals.filter(r => r.status === 'acknowledged').length}</div>
          <div className="text-xs text-text-muted mt-1">Acknowledged</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-border-custom">
          <div className="text-2xl font-extrabold text-emerald-500">{referrals.filter(r => r.status === 'resolved').length}</div>
          <div className="text-xs text-text-muted mt-1">Resolved</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-red-200 bg-red-50/30">
          <div className="text-2xl font-extrabold text-red-600">{escalated.length}</div>
          <div className="text-xs text-red-500 font-bold mt-1">🚨 Volunteer Escalations</div>
        </div>
      </div>

      {/* ── Volunteer Escalations Section ── */}
      {escalated.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-red-600 flex items-center gap-2 mb-4">
            <ShieldAlert size={20} /> Volunteer Escalated Requests
          </h2>
          <div className="space-y-3">
            {escalated.map(req => (
              <div key={req._id} className="p-5 rounded-2xl border-2 border-red-300 bg-red-50/50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded uppercase text-[10px] shadow-sm">Emergency Escalation</span>
                    </div>
                    <div className="font-bold text-sm">{req.student?.name || 'Anonymous Student'}</div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full uppercase bg-red-100 text-red-700">
                    escalated
                  </span>
                </div>
                <div className="bg-white/80 rounded-lg p-3 text-xs border border-red-100 mb-3">
                  <div className="font-semibold text-red-700 mb-1">⚠️ Issue: {req.issueType}</div>
                  <div className="text-text-muted">Urgency: {req.urgency}</div>
                  <div className="text-text-muted mt-1">
                    Escalated by: {req.assignedVolunteer?.name || 'Volunteer'} · {new Date(req.createdAt).toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => acceptEscalation(req._id)}
                    className="flex items-center gap-1 px-4 py-2 bg-dark text-white rounded-lg text-xs font-semibold border-none cursor-pointer hover:bg-black transition-colors">
                    <MessageCircle size={14} /> Accept & Take Over
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── AI Referral Cards ── */}
      <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
        <AlertTriangle size={20} className="text-yellow-500" /> AI-Detected Crisis Alerts
      </h2>
      {referrals.length === 0 ? (
        <p className="text-text-muted text-sm text-center py-12">No AI referrals yet. When the AI detects a crisis, alerts will appear here.</p>
      ) : (
        <div className="space-y-3">
          {referrals.map(ref => (
            <div key={ref._id} className={`p-5 rounded-2xl border-2 ${
              ref.status === 'unresolved' ? 'border-red-300 bg-red-50/50'
                : ref.status === 'acknowledged' ? 'border-yellow-300 bg-yellow-50/50'
                  : 'border-border-custom bg-white'}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-bold text-sm">{ref.student?.name}</div>
                  <div className="text-xs text-text-muted">{ref.student?.email}</div>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                  ref.status === 'unresolved' ? 'bg-red-100 text-red-700'
                    : ref.status === 'acknowledged' ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-emerald-100 text-emerald-700'}`}>
                  {ref.status}
                </span>
              </div>
              <div className="bg-white/80 rounded-lg p-3 text-xs border border-red-100 mb-3">
                <div className="font-semibold text-red-700 mb-1">⚠️ {ref.reason}</div>
                <div className="text-text-muted italic">"{ref.aiNotes}"</div>
                <div className="text-text-muted mt-1">
                  Severity: {ref.severity}/5 · Source: {ref.source} · {new Date(ref.createdAt).toLocaleString('en-IN')}
                </div>
              </div>
              <div className="flex gap-2">
                {ref.status === 'unresolved' && (
                  <button onClick={() => handleStatus(ref._id, 'acknowledged')}
                    className="px-4 py-2 bg-dark text-white rounded-lg text-xs font-semibold border-none cursor-pointer">
                    Acknowledge
                  </button>
                )}
                {ref.status === 'acknowledged' && (
                  <button onClick={() => handleStatus(ref._id, 'resolved')}
                    className="flex items-center gap-1 px-4 py-2 bg-emerald-500 text-white rounded-lg text-xs font-semibold border-none cursor-pointer">
                    <CheckCircle size={14} /> Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CounsellorReferrals;

