import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const SUGGESTED = [
  'How many people are cut off from hospitals?',
  'Which bridges were destroyed?',
  'What is the total flooded area?',
  'Which roads are damaged?',
  'How many deaths were confirmed?',
  'How long is the flood path?',
];

export default function CopilotPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `🛰️ **Nepal Flood Response Copilot**\n\nI can answer questions about the Trishuli-Bhote Koshi flood event using satellite analysis data.\n\nAll figures I quote come directly from our database — I never invent statistics. Ask me about flood extent, damaged infrastructure, cut-off settlements, or casualties.`,
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [eventId] = useState(1);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(text) {
    const q = text || input.trim();
    if (!q || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setLoading(true);

    try {
      const res = await axios.post('/api/copilot/chat', { question: q, event_id: eventId });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.answer }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ Error: ${e.response?.data?.error || e.message}. Please check that the backend server is running.`
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <div className="fullpage" style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <div className="page-title">🤖 AI Situation Copilot</div>
          <div className="page-subtitle">Answers grounded in satellite + OSM data · Never hallucinates figures</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span className="badge badge-info">📡 Sentinel-1</span>
          <span className="badge badge-safe">✅ Data-grounded</span>
        </div>
      </div>

      {/* Suggested questions */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-glass)', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {SUGGESTED.map((s, i) => (
          <button key={i} className="btn btn-ghost btn-sm" onClick={() => send(s)} disabled={loading}>
            {s}
          </button>
        ))}
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`chat-bubble ${m.role === 'user' ? 'user' : 'assistant'}`}>
              {m.content.split('\n').map((line, j) => (
                <span key={j}>{line}{j < m.content.split('\n').length - 1 ? <br /> : null}</span>
              ))}
            </div>
          ))}
          {loading && (
            <div className="chat-bubble assistant loading">
              <div className="dot-loading" />
              <div className="dot-loading" />
              <div className="dot-loading" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-row">
          <textarea
            className="chat-input"
            rows={1}
            placeholder="Ask about flood extent, damages, cut-off settlements, casualties…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            id="copilot-input"
          />
          <button className="btn btn-primary" onClick={() => send()} disabled={loading || !input.trim()} id="copilot-send-btn">
            {loading ? <div className="spinner" /> : '↑ Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
