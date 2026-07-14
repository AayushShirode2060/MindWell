import { useState, useEffect, useRef } from 'react';
import API from '../../api/axios';
import { chatEndpoints } from '../../api/endpoints';
import useAudioTherapy from '../../hooks/useAudioTherapy';
import { Send, Trash2, Volume2, VolumeX, AlertTriangle, Bot } from 'lucide-react';

const moodLabels = {
  anxiety: { emoji: '😰', label: 'Anxiety', color: 'bg-blue-100 text-blue-700' },
  sadness: { emoji: '😢', label: 'Sadness', color: 'bg-indigo-100 text-indigo-700' },
  anger: { emoji: '😤', label: 'Anger', color: 'bg-red-100 text-red-700' },
  stress: { emoji: '😫', label: 'Stress', color: 'bg-orange-100 text-orange-700' },
  insomnia: { emoji: '😴', label: 'Sleep Issues', color: 'bg-purple-100 text-purple-700' },
  crisis: { emoji: '🚨', label: 'Crisis Alert', color: 'bg-red-200 text-red-800' },
};

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { play, stop, isPlaying, currentFreq } = useAudioTherapy();

  useEffect(() => { fetchHistory(); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchHistory = async () => {
    try {
      const res = await API.get(chatEndpoints.GET_CHAT_HISTORY_API);
      setMessages(res.data.messages);
    } catch (err) { console.error(err); }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input, createdAt: new Date() };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const res = await API.post(chatEndpoints.SEND_MESSAGE_API, { message: currentInput });
      const reply = res.data.reply;

      const botMsg = {
        role: 'assistant',
        content: reply.content,
        detectedMood: reply.detectedMood,
        frequency: reply.frequency?.freq,
        frequencyName: reply.frequency?.name,
        frequencyType: reply.frequency?.type,
        isCrisis: reply.isCrisis,
        confidence: reply.confidence,
        severity: reply.severity,
        createdAt: new Date()
      };
      setMessages(prev => [...prev, botMsg]);

      if (reply.frequency) {
        play(reply.frequency.freq, reply.frequency.type);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        createdAt: new Date()
      }]);
    } finally { setLoading(false); }
  };

  const handleClear = async () => {
    try {
      await API.delete(chatEndpoints.CLEAR_CHAT_API);
      setMessages([]);
      stop();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border-custom mb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Bot size={28} className="text-primary" /> AI counsellor
          </h1>
          <p className="text-text-muted text-sm">Powered by ML mood detection + Gemini AI</p>
        </div>
        <div className="flex items-center gap-3">
          {isPlaying && (
            <button onClick={stop}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 text-primary-dark text-xs font-bold animate-pulse cursor-pointer border-none">
              <Volume2 size={14} /> {currentFreq} Playing
            </button>
          )}
          <button onClick={handleClear}
            className="flex items-center gap-1 px-3 py-2 rounded-full border border-border-custom text-xs font-semibold text-text-muted hover:text-red-500 hover:border-red-300 transition-all bg-transparent cursor-pointer">
            <Trash2 size={14} /> Clear
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🧠</div>
            <h3 className="text-lg font-bold mb-1">Hi! I'm your AI wellness assistant</h3>
            <p className="text-text-muted text-sm">Tell me how you're feeling. Everything you share is confidential.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] ${msg.role === 'user' ? 'order-1' : ''}`}>
              {/* Mood badge with confidence */}
              {msg.detectedMood && moodLabels[msg.detectedMood] && (
                <div className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full mb-1.5 ${moodLabels[msg.detectedMood].color}`}>
                  {moodLabels[msg.detectedMood].emoji} {moodLabels[msg.detectedMood].label}
                  {msg.confidence && <span className="opacity-60">({msg.confidence}%)</span>}
                </div>
              )}

              {/* Message bubble */}
              <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
                ${msg.role === 'user'
                  ? 'bg-dark text-white rounded-br-md'
                  : 'bg-white border border-border-custom text-text-main rounded-bl-md'}`}>
                {msg.content}
              </div>

              {/* Audio card */}
              {msg.frequency && (
                <div className="mt-2 flex items-center gap-2 px-4 py-2.5 bg-primary/10 rounded-xl border border-primary/30">
                  <button onClick={() => isPlaying ? stop() : play(msg.frequency, msg.frequencyType || 'solfeggio')}
                    className="w-8 h-8 rounded-full bg-primary text-dark flex items-center justify-center border-none cursor-pointer">
                    {isPlaying && currentFreq === msg.frequency ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  </button>
                  <div>
                    <div className="text-xs font-bold text-text-main">🎵 {msg.frequency} {msg.frequencyName || ''}</div>
                    <div className="text-[0.65rem] text-text-muted">Tap to {isPlaying ? 'stop' : 'play'} calming frequency</div>
                  </div>
                </div>
              )}

              {/* Crisis alert */}
              {msg.isCrisis && (
                <div className="mt-2 flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                  <AlertTriangle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-red-700">
                    <strong>If you're in crisis</strong>, please contact: iCall <strong>9152987821</strong> or Vandrevala Foundation <strong>1860-2662-345</strong>
                  </div>
                </div>
              )}

              <div className="text-[0.65rem] text-text-muted mt-1 px-1">
                {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="px-5 py-3.5 rounded-2xl bg-white border border-border-custom rounded-bl-md">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="mt-4 flex gap-3">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Type how you're feeling..." disabled={loading}
          className="flex-1 px-5 py-3.5 rounded-full border-2 border-border-custom bg-white text-sm focus:border-dark transition-all outline-none font-inter" />
        <button type="submit" disabled={loading || !input.trim()}
          className="w-12 h-12 rounded-full bg-primary text-dark flex items-center justify-center border-none cursor-pointer hover:shadow-glow transition-all disabled:opacity-40">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatBot;
