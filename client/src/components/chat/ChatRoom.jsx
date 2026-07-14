import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Send, X, MessageCircle } from 'lucide-react';

const ChatRoom = ({ appointmentId, counsellorName, onClose }) => {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  // Connect socket + load history
  useEffect(() => {
    // Load chat history
    const loadHistory = async () => {
      try {
        const res = await API.get(`/session-chat/${appointmentId}`);
        setMessages(res.data.messages);
      } catch (err) { console.error(err); }
    };
    loadHistory();

    // Connect socket
    const socket = io(window.location.origin.replace(':5173', ':5000'), {
      auth: { token }
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join-room', appointmentId);
    });

    socket.on('new-message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('user-typing', (data) => {
      setTyping(`${data.name} is typing...`);
    });

    socket.on('user-stop-typing', () => {
      setTyping(null);
    });

    socket.on('disconnect', () => setConnected(false));

    return () => {
      socket.emit('leave-room', appointmentId);
      socket.disconnect();
    };
  }, [appointmentId, token]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !socketRef.current) return;
    socketRef.current.emit('send-message', {
      appointmentId,
      content: input.trim()
    });
    socketRef.current.emit('stop-typing', appointmentId);
    setInput('');
  };

  const handleTyping = () => {
    if (!socketRef.current) return;
    socketRef.current.emit('typing', appointmentId);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socketRef.current.emit('stop-typing', appointmentId);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-dark/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg h-[600px] mx-4 flex flex-col overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-custom bg-gradient-to-r from-indigo-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
              <MessageCircle size={16} className="text-indigo-600" />
            </div>
            <div>
              <div className="font-bold text-sm">Chat with {counsellorName}</div>
              <div className="text-[10px] text-text-muted flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-red-400'}`} />
                {connected ? 'Connected' : 'Connecting...'}
              </div>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface flex items-center justify-center border border-border-custom cursor-pointer hover:bg-red-50">
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
          style={{ background: 'linear-gradient(180deg, #f8fafc, #f1f5f9)' }}>
          {messages.length === 0 && (
            <div className="text-center text-text-muted text-xs mt-12">
              <MessageCircle size={32} className="mx-auto mb-2 opacity-30" />
              Start the conversation...
            </div>
          )}
          {messages.map(msg => {
            const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
            return (
              <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm
                  ${isMe
                    ? 'bg-dark text-white rounded-br-md'
                    : 'bg-white text-text-main border border-border-custom rounded-bl-md'}`}>
                  {!isMe && (
                    <div className="text-[10px] font-semibold text-indigo-500 mb-0.5">
                      {msg.sender?.name || 'Counsellor'}
                    </div>
                  )}
                  <p>{msg.content}</p>
                  <div className={`text-[9px] mt-1 ${isMe ? 'text-white/50' : 'text-text-muted'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
          {typing && (
            <div className="text-xs text-indigo-500 italic">{typing}</div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-border-custom bg-white">
          <div className="flex gap-2">
            <input type="text" value={input}
              onChange={(e) => { setInput(e.target.value); handleTyping(); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 border-2 border-border-custom rounded-xl text-sm bg-surface focus:border-dark outline-none" />
            <button onClick={handleSend} disabled={!input.trim()}
              className="w-11 h-11 rounded-xl bg-dark text-white flex items-center justify-center border-none cursor-pointer disabled:opacity-40 hover:shadow-lg transition-all">
              <Send size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChatRoom;
