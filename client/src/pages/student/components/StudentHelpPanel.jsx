import { useState, useEffect, useRef } from 'react';
import API from '../../../api/axios';
import { helpRequestEndpoints, volunteerChatEndpoints } from '../../../api/endpoints';
import { io } from 'socket.io-client';
import { HeartPulse, Loader, Send, CheckCircle } from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const issueTypes = ['Anxiety', 'Stress', 'Depression', 'Academic Pressure', 'Loneliness', 'Other'];

const StudentHelpPanel = () => {
  const [activeRequest, setActiveRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [issueType, setIssueType] = useState('Anxiety');
  const [urgency, setUrgency] = useState('medium');

  // Chat state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    checkActiveRequest();
  }, []);

  useEffect(() => {
    let interval;
    if (activeRequest?.status === 'pending') {
      interval = setInterval(() => {
        checkActiveRequest();
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeRequest?.status]);

  useEffect(() => {
    if (['active', 'escalated', 'counsellor-active'].includes(activeRequest?.status)) {
      if (!socket) {
        setupChat();
      }
    }
  }, [activeRequest?.status, socket]);

  const checkActiveRequest = async () => {
    try {
      const res = await API.get(helpRequestEndpoints.GET_ACTIVE_API);
      if (res.data.helpRequest) {
        setActiveRequest(res.data.helpRequest);
      } else {
        // Just in case it was completed by the volunteer, clear it
        setActiveRequest(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const setupChat = async () => {
    try {
      const res = await API.get(`${volunteerChatEndpoints.GET_CHAT_HISTORY_API}/${activeRequest._id}`);
      setMessages(res.data.messages);

      const newSocket = io(SOCKET_URL, {
        auth: { token: sessionStorage.getItem('token') },
        reconnection: true
      });

      newSocket.on('connect', () => {
        newSocket.emit('join-room', activeRequest._id);
      });

      newSocket.on('new-volunteer-message', (data) => {
        setMessages(prev => [...prev, data]);
      });

      // Listen for escalation — volunteer escalated the chat to a counsellor
      newSocket.on('chat-escalated', () => {
        setActiveRequest(prev => prev ? { ...prev, status: 'escalated' } : null);
      });

      // Listen for counsellor accepting the escalated request — seamless transition
      newSocket.on('escalation-accepted', (data) => {
        setActiveRequest(prev => prev ? { ...prev, status: 'counsellor-active', escalationData: data } : null);
      });

      // Listen for counsellor completing the session
      newSocket.on('session-completed', () => {
        setActiveRequest(prev => prev ? { ...prev, status: 'completed' } : null);
      });

      setSocket(newSocket);

      // Cleanup function is not returned here directly anymore because it's called async,
      // but we handle component unmount cleanup elsewhere if needed, or rely on socket state.
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    return () => {
      if (socket && activeRequest) {
        socket.emit('leave-room', activeRequest._id);
        socket.disconnect();
      }
    };
  }, [socket, activeRequest]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await API.post(helpRequestEndpoints.CREATE_REQUEST_API, { issueType, urgency });
      setActiveRequest(res.data.helpRequest);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;
    socket.emit('send-volunteer-message', {
      helpRequestId: activeRequest._id,
      content: newMessage
    });
    setNewMessage('');
  };

  if (loading) return <div className="p-8 text-center text-text-muted">Loading support panel...</div>;

  return (
    <div className="bg-white rounded-2xl border border-border-custom overflow-hidden shadow-sm mt-8">
      {/* Header */}
      <div className="bg-[#BAFF39]/20 p-5 border-b border-[#BAFF39]/30 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#BAFF39] flex items-center justify-center text-[#1a1a1a]">
          <HeartPulse size={20} />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-[#1a1a1a]">Anonymous Peer Support</h2>
          <p className="text-sm text-gray-700 font-semibold">Talk to a trained student volunteer safely and confidentially.</p>
        </div>
      </div>

      <div className="p-5 md:p-6">
        {!activeRequest ? (
          /* Create Request Form */
          <form onSubmit={handleSubmitRequest} className="max-w-md mx-auto space-y-4 py-4">
            <div>
              <label className="block text-sm font-bold text-text-main mb-2">What's on your mind?</label>
              <select 
                value={issueType} 
                onChange={e => setIssueType(e.target.value)}
                className="w-full p-3 bg-surface border border-border-custom rounded-xl outline-none focus:ring-2 focus:ring-[#BAFF39]/50"
              >
                {issueTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            
            <div>
               <label className="block text-sm font-bold text-text-main mb-2">How urgent is this?</label>
               <select 
                value={urgency} 
                onChange={e => setUrgency(e.target.value)}
                className="w-full p-3 bg-surface border border-border-custom rounded-xl outline-none focus:ring-2 focus:ring-[#BAFF39]/50"
              >
                <option value="low">Low - Just need someone to listen</option>
                <option value="medium">Medium - Feeling overwhelmed</option>
                <option value="high">High - Distressed, need help soon</option>
              </select>
            </div>
            
            <button type="submit" className="w-full py-3 bg-[#1a1a1a] text-[#BAFF39] font-black rounded-xl hover:bg-gray-800 transition-colors mt-2">
              Request Anonymous Support
            </button>
            <p className="text-xs text-center text-text-muted font-semibold mt-2">
              If you are in immediate danger, please do not use this chat. Call emergency services immediately.
            </p>
          </form>

        ) : activeRequest.status === 'pending' ? (
          
          /* Waiting Screen */
          <div className="text-center py-12">
            <Loader size={48} className="mx-auto text-[#BAFF39] animate-spin mb-4" />
            <h3 className="text-xl font-bold text-text-main mb-2">Finding a Volunteer...</h3>
            <p className="text-sm text-text-muted">You are in the queue. A trained student volunteer will join the chat shortly. Please don't close this window.</p>
          </div>

        ) : activeRequest.status === 'active' ? (

          /* Chat Room */
          <div className="flex flex-col h-[500px]">
            <div className="flex-1 overflow-y-auto bg-gray-50/50 p-4 rounded-xl border border-gray-100 mb-4 flex flex-col gap-3">
              <div className="text-center text-xs font-bold text-emerald-600 bg-emerald-50 py-2 rounded-lg mb-4">
                A Volunteer has joined the chat. Say hello!
              </div>
              
              {messages.map((m, idx) => {
                const isMine = m.senderRole === 'student';
                return (
                  <div key={idx} className={`max-w-[80%] ${isMine ? 'ml-auto' : 'mr-auto'}`}>
                    <div className={`p-3 rounded-2xl ${isMine ? 'bg-[#BAFF39] text-[#1a1a1a] rounded-tr-sm' : 'bg-white border text-text-main rounded-tl-sm shadow-sm'}`}>
                      {m.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-3 bg-surface border border-border-custom rounded-xl outline-none"
              />
              <button type="submit" disabled={!newMessage.trim()} className="p-3 bg-[#1a1a1a] text-[#BAFF39] rounded-xl hover:bg-gray-800 disabled:opacity-50">
                <Send size={18} />
              </button>
            </form>
          </div>

        ) : activeRequest.status === 'escalated' ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <HeartPulse size={32} className="text-blue-600 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-text-main mb-2">You're being connected to a Professional Counsellor</h3>
            <p className="text-sm text-text-muted max-w-md mx-auto">
              The volunteer has referred your case to a licensed counsellor for further support. Please wait here, a counsellor will accept your case shortly. You are not alone — professional help is on the way.
            </p>
          </div>
        ) : activeRequest.status === 'counsellor-active' ? (

          /* Counsellor Chat Room — same chat UI with updated header */
          <div className="flex flex-col h-[500px]">
            <div className="flex-1 overflow-y-auto bg-gray-50/50 p-4 rounded-xl border border-gray-100 mb-4 flex flex-col gap-3">
              <div className="text-center text-xs font-bold text-indigo-600 bg-indigo-50 py-2 rounded-lg mb-4">
                🩺 You are now connected to Professional Counsellor{activeRequest.escalationData?.counsellorName ? `: ${activeRequest.escalationData.counsellorName}` : ''}
              </div>
              
              {messages.map((m, idx) => {
                const isMine = m.senderRole === 'student';
                return (
                  <div key={idx} className={`max-w-[80%] ${isMine ? 'ml-auto' : 'mr-auto'}`}>
                    <div className={`p-3 rounded-2xl ${isMine ? 'bg-[#BAFF39] text-[#1a1a1a] rounded-tr-sm' : 'bg-white border text-text-main rounded-tl-sm shadow-sm'}`}>
                      {m.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-3 bg-surface border border-border-custom rounded-xl outline-none"
              />
              <button type="submit" disabled={!newMessage.trim()} className="p-3 bg-[#1a1a1a] text-[#BAFF39] rounded-xl hover:bg-gray-800 disabled:opacity-50">
                <Send size={18} />
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-10">
            <h3 className="text-lg font-bold">Session Ended</h3>
            <p className="text-sm text-text-muted">The volunteer has closed this support request. Thank you for using MindWell.</p>
            <button onClick={() => setActiveRequest(null)} className="mt-4 px-4 py-2 bg-gray-200 font-bold rounded-xl text-sm hover:bg-gray-300">
              Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentHelpPanel;
