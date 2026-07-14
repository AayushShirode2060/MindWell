import { useState, useEffect, useRef } from 'react';
import API from '../../api/axios';
import { helpRequestEndpoints, volunteerChatEndpoints, counsellorEscalatedEndpoints } from '../../api/endpoints';
import { io } from 'socket.io-client';
import { Send, CheckCircle, ArrowLeft, User, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CounsellorChatWorkspace = () => {
  const [requestDetails, setRequestDetails] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchActiveRequest();
  }, []);

  useEffect(() => {
    if (!requestDetails) return;

    fetchChatHistory(requestDetails._id);

    const newSocket = io(SOCKET_URL, {
      auth: { token: sessionStorage.getItem('token') },
      reconnection: true
    });

    newSocket.on('connect', () => {
      // Use the escalated-chat join event so the student is notified
      newSocket.emit('join-escalated-chat', { helpRequestId: requestDetails._id });
    });

    newSocket.on('new-volunteer-message', (data) => {
      setMessages(prev => [...prev, data]);
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
    } finally {
      setLoading(false);
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

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !socket || !requestDetails) return;

    socket.emit('send-volunteer-message', {
      helpRequestId: requestDetails._id,
      content: newMessage
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

  const completeSession = async () => {
    if (!requestDetails) return;
    const summary = prompt('Please provide a concise session summary before closing:');
    if (!summary) return;

    setCompleting(true);
    try {
      await API.post(`${counsellorEscalatedEndpoints.COMPLETE_ESCALATED_API}/${requestDetails._id}/complete`, {
        issueDiscussed: requestDetails.issueType,
        actionsTaken: summary
      });
      alert('Session completed successfully. The student has been notified.');
      navigate('/counsellor/dashboard');
    } catch (err) {
      alert('Failed to complete session.');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-text-muted text-sm font-semibold">Loading chat workspace...</p>
        </div>
      </div>
    );
  }

  if (!requestDetails) {
    return (
      <div className="text-center py-20 flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
          <CheckCircle size={32} className="text-gray-400" />
        </div>
        <h3 className="text-xl font-bold">No Active Escalated Chat</h3>
        <p className="text-text-muted text-sm">You don't have an active escalated support request at the moment.</p>
        <button
          onClick={() => navigate('/counsellor/dashboard')}
          className="px-5 py-2.5 bg-text-main text-white font-bold rounded-xl hover:bg-black transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[75vh]">
      {/* Chat Container */}
      <div className="flex-1 bg-white rounded-2xl border border-border-custom flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-shadow">

        {/* Chat Header */}
        <div className="p-4 border-b border-border-custom bg-indigo-50 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2 text-indigo-900">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
              <User size={18} className="text-indigo-600" />
              Escalated Session — {requestDetails.student?.name || 'Anonymous Student'}
            </h2>
            <div className="text-xs text-indigo-700 mt-1">
              Issue: <span className="font-semibold">{requestDetails.issueType}</span>
              {' · '} Urgency: <span className="text-red-500 font-semibold">{requestDetails.urgency}</span>
              {requestDetails.assignedVolunteer?.name && (
                <> {' · '} Escalated by: <span className="font-semibold">{requestDetails.assignedVolunteer.name}</span></>
              )}
            </div>
          </div>
          <button
            onClick={completeSession}
            disabled={completing}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <CheckCircle size={14} /> {completing ? 'Completing...' : 'Complete Session'}
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-5 overflow-y-auto bg-gray-50/50">
          {/* Conversation history notice */}
          <div className="text-center text-[11px] font-semibold text-gray-400 bg-gray-100 py-2 px-4 rounded-lg mb-4">
            Full conversation history — includes messages from volunteer session
          </div>

          {messages.length === 0 ? (
            <div className="text-center text-text-muted text-sm my-10">No messages yet.</div>
          ) : (
            messages.map((m, idx) => {
              const isMine = m.senderRole === 'counsellor';
              const isVolunteer = m.senderRole === 'volunteer';
              return (
                <div key={idx} className={`mb-4 max-w-[80%] ${isMine ? 'ml-auto' : 'mr-auto'}`}>
                  {isVolunteer && (
                    <div className="text-[10px] text-gray-400 font-semibold mb-1 ml-1">
                      {m.sender?.name || 'Volunteer'}
                    </div>
                  )}
                  <div className={`p-3 rounded-2xl ${
                    isMine
                      ? 'bg-indigo-500 text-white rounded-tr-sm'
                      : isVolunteer
                        ? 'bg-amber-50 border border-amber-200 text-text-main rounded-tl-sm'
                        : 'bg-white border text-text-main rounded-tl-sm'
                  }`}>
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

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-border-custom flex gap-3">
          <input
            type="text"
            className="flex-1 px-4 py-3 bg-surface border border-border-custom rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
            placeholder="Type your message to the student..."
            value={newMessage}
            onChange={handleTyping}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default CounsellorChatWorkspace;
