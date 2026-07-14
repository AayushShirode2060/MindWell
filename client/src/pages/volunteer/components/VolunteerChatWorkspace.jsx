import { useState, useEffect, useRef } from 'react';
import API from '../../../api/axios';
import { helpRequestEndpoints, volunteerChatEndpoints } from '../../../api/endpoints';
import { io } from 'socket.io-client';
import { Send, AlertTriangle, ShieldAlert, CheckCircle, Info } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const quickReplies = [
  "I understand how you feel.",
  "You're not alone.",
  "Would you like to try a breathing exercise?",
  "Take your time, I'm here to listen.",
  "That sounds really difficult."
];

const getGuidedTips = (issueType) => {
  switch (issueType?.toLowerCase()) {
    case 'anxiety': return ["Suggest the 4-7-8 breathing technique.", "Ask about their immediate environment (5-4-3-2-1 grounding)."];
    case 'stress': return ["Ask what is causing the most pressure right now.", "Suggest taking a 10-minute break from tasks."];
    case 'depression': return ["Validate their feelings without trying to 'fix' them instantly.", "Ask about their sleep and eating habits gently."];
    default: return ["Active listening is key.", "Reflect their feelings to show understanding."];
  }
};

const VolunteerChatWorkspace = () => {
  const [requestDetails, setRequestDetails] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [warningMessage, setWarningMessage] = useState(null);
  
  // Escalation state
  const [counsellors, setCounsellors] = useState([]);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [selectedCounsellorId, setSelectedCounsellorId] = useState('');

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchActiveRequest();
    fetchCounsellors();
  }, []);

  const fetchCounsellors = async () => {
    try {
      const res = await API.get('/appointments/counsellors');
      setCounsellors(res.data.counsellors);
      if (res.data.counsellors.length > 0) {
        setSelectedCounsellorId(res.data.counsellors[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!requestDetails) return;

    fetchChatHistory(requestDetails._id);

    const newSocket = io(SOCKET_URL, {
      auth: { token: sessionStorage.getItem('token') },
      reconnection: true
    });

    newSocket.on('connect', () => {
      newSocket.emit('join-room', requestDetails._id);
    });

    newSocket.on('new-volunteer-message', (data) => {
      setMessages(prev => [...prev, data]);
      if (data.isRisky && data.senderRole === 'student') {
        setWarningMessage("⚠️ Critical Alert: High risk language detected. Please escalate to a professional immediately.");
      }
    });

    newSocket.on('user-typing', () => setIsTyping(true));
    newSocket.on('user-stop-typing', () => setIsTyping(false));

    setSocket(newSocket);

    return () => {
      newSocket.emit('leave-room', requestDetails._id);
      newSocket.disconnect();
    };
  }, [requestDetails?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const fetchActiveRequest = async () => {
    try {
      const res = await API.get(helpRequestEndpoints.GET_ACTIVE_API);
      if (res.data.helpRequest) {
        setRequestDetails(res.data.helpRequest);
      } else {
         setRequestDetails(null);
      }
    } catch (err) {
      console.error('Failed to fetch request details:', err);
    }
  };

  const fetchChatHistory = async (id) => {
    try {
      const res = await API.get(`${volunteerChatEndpoints.GET_CHAT_HISTORY_API}/${id}`);
      setMessages(res.data.messages);
    } catch (err) {
      console.error('Failed to fetch chat history:', err);
    }
  };

  const handleSendMessage = (e, presetMessage = null) => {
    if (e) e.preventDefault();
    const content = presetMessage || newMessage;
    if (!content.trim() || !socket || !requestDetails) return;
    
    socket.emit('send-volunteer-message', {
      helpRequestId: requestDetails._id,
      content
    });

    setNewMessage('');
    socket.emit('stop-typing', requestDetails._id);
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!socket || !requestDetails) return;
    
    if (e.target.value.length > 0) {
      socket.emit('typing', requestDetails._id);
    } else {
      socket.emit('stop-typing', requestDetails._id);
    }
  };

  const confirmEscalateRequest = async () => {
    if (!requestDetails) return;
    try {
      await API.post(`${helpRequestEndpoints.ESCALATE_REQUEST_API}/${requestDetails._id}/escalate`, {
        counsellorId: selectedCounsellorId || null
      });
      
      // Notify the student in real-time via socket
      if (socket) {
        socket.emit('chat-escalated', { helpRequestId: requestDetails._id });
      }

      alert("This case has been successfully escalated! You earned gamification points for identifying urgency.");
      setShowEscalateModal(false);
      setRequestDetails(prev => ({ ...prev, status: 'escalated' }));
    } catch (err) {
      alert("Failed to escalate.");
    }
  };

  const completeRequest = async () => {
    if (!requestDetails) return;
    const summary = prompt("Please provide a concise summary of the session before closing:");
    if (!summary) return; // cancelled

    try {
      await API.post(`${helpRequestEndpoints.COMPLETE_REQUEST_API}/${requestDetails._id}/complete`, {
        issueDiscussed: requestDetails.issueType,
        actionsTaken: summary
      });
      alert("Session completed! Thank you for your support (+10 pts).");
      navigate('/volunteer/dashboard');
    } catch (err) {
      alert("Failed to complete request.");
    }
  };

  if (!requestDetails) return <div className="text-center py-20 flex flex-col items-center gap-4"><h3 className="text-xl font-bold">No Active Chat</h3><p className="text-text-muted">You do not have an active support request.</p><button onClick={() => navigate('/volunteer/dashboard')} className="px-4 py-2 bg-text-main text-white font-bold rounded-xl">Go to Dashboard</button></div>;

  const tips = getGuidedTips(requestDetails?.issueType);

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[75vh]">
      {/* Main Chat Area */}
      <div className="flex-1 bg-white rounded-2xl border border-border-custom flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        
        {/* Chat Header */}
        <div className="p-4 border-b border-border-custom bg-surface flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
              Anonymous Student
            </h2>
            <div className="text-xs text-text-muted mt-1">
              Issue: <span className="font-semibold">{requestDetails.issueType}</span> 
              {" · "} Urgency: <span className="text-red-500 font-semibold">{requestDetails.urgency}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowEscalateModal(true)} className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-bold rounded-lg flex items-center gap-1 transition-colors">
              <ShieldAlert size={14} /> Escalate
            </button>
            <button onClick={completeRequest} className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-sm font-bold rounded-lg flex items-center gap-1 transition-colors">
              <CheckCircle size={14} /> Finish
            </button>
          </div>
        </div>

        {/* Escalate Modal Overlay */}
        {showEscalateModal && (
          <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in-up">
              <h3 className="text-xl font-bold flex items-center gap-2 mb-2 text-red-600">
                <ShieldAlert /> Escalate to Professional
              </h3>
              <p className="text-sm text-text-muted mb-6">
                Please select an active Counsellor to transfer this support request to. They will receive an immediate alert on their dashboard.
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-bold mb-2">Select Counsellor</label>
                {counsellors.length === 0 ? (
                  <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">
                    No counsellors are currently available. You can still escalate, and it will be sent to the general emergency queue.
                  </div>
                ) : (
                  <select 
                    value={selectedCounsellorId} 
                    onChange={e => setSelectedCounsellorId(e.target.value)}
                    className="w-full p-3 bg-surface border border-border-custom rounded-xl outline-none focus:ring-2 focus:ring-red-500/20"
                  >
                    <option value="">-- Send to General Emergency Queue --</option>
                    {counsellors.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => setShowEscalateModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-text-main font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmEscalateRequest}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors"
                >
                  Confirm Escalation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Warning Banner */}
        {warningMessage && (
          <div className="bg-red-500 text-white p-3 text-sm font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} />
              {warningMessage}
            </div>
            <button onClick={() => setWarningMessage(null)} className="opacity-70 hover:opacity-100">Dismiss</button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 p-5 overflow-y-auto bg-gray-50/50">
          {messages.length === 0 ? (
            <div className="text-center text-text-muted text-sm my-10">Start the conversation to listen and support.</div>
          ) : (
            messages.map((m, idx) => {
              const isMine = m.senderRole === 'volunteer';
              return (
                <div key={idx} className={`mb-4 max-w-[80%] ${isMine ? 'ml-auto' : 'mr-auto'}`}>
                  <div className={`p-3 rounded-2xl ${isMine ? 'bg-[#BAFF39]/30 text-text-main rounded-tr-sm' : 'bg-white border text-text-main rounded-tl-sm'}`}>
                    {m.content}
                  </div>
                  <div className={`text-[10px] text-gray-400 mt-1 ${isMine ? 'text-right' : 'text-left'}`}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })
          )}
          {isTyping && <div className="text-xs text-text-muted italic ml-2">Student is typing...</div>}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        <div className="px-4 py-2 bg-surface border-t border-border-custom flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
          {quickReplies.map((reply, i) => (
             <button 
               key={i} 
               onClick={() => handleSendMessage(null, reply)}
               className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
             >
               {reply}
             </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-border-custom flex gap-3">
          <input
            type="text"
            className="flex-1 px-4 py-3 bg-surface border border-border-custom rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            placeholder="Type your supportive message respectfully..."
            value={newMessage}
            onChange={handleTyping}
          />
          <button type="submit" disabled={!newMessage.trim()} className="p-3 bg-primary text-text-main rounded-xl hover:bg-primary-hover disabled:opacity-50 transition-colors">
            <Send size={18} />
          </button>
        </form>
      </div>

      {/* Guided Support Sidebar */}
      <div className="w-full md:w-80 bg-white rounded-2xl border border-border-custom p-5 flex flex-col h-full shadow-sm">
        <h3 className="text-md font-bold flex items-center gap-2 mb-4">
          <Info size={18} className="text-blue-500" /> Guided Support
        </h3>
        
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-4 text-sm text-blue-800">
          <p className="font-bold mb-1">Issue Context:</p>
          <p>{requestDetails.issueType}</p>
        </div>

        <div className="flex-1">
          <h4 className="text-xs font-bold uppercase text-gray-500 mb-3">Suggested Approaches</h4>
          <ul className="space-y-3">
            {tips.map((tip, i) => (
              <li key={i} className="text-sm text-gray-700 bg-surface p-3 rounded-lg border border-gray-100 flex gap-2">
                <span className="text-primary font-bold">»</span> {tip}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto border-t border-gray-100 pt-4">
           <h4 className="text-xs font-bold text-red-600 uppercase mb-2">Safety Limits</h4>
           <div className="text-xs text-gray-600 space-y-2">
             <p>• Do not diagnose.</p>
             <p>• Do not prescribe action.</p>
             <p>• If in doubt, escalate to professional.</p>
           </div>
        </div>
      </div>

    </div>
  );
};

export default VolunteerChatWorkspace;
