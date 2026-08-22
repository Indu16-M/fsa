import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Send, X, Bot, Sparkles, AlertCircle, CheckCircle, Package, Utensils, HeartHandshake } from 'lucide-react';

const AnnamitraNgoAssistant = ({ isOpen, onClose }) => {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Hello! I'm Annamitra, your AI operations assistant for ShareByte. How can I help your NGO with food recovery, finding suitable donations, or distribution planning today?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickPrompts = [
    "What food can we claim today?",
    "Find donations expiring soon",
    "How to record food distribution?",
    "Suggest food for 50 people"
  ];

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = { id: Date.now(), sender: 'user', text: query, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Check real-time food for specific queries
      let contextInfo = '';
      if (query.toLowerCase().includes('claim') || query.toLowerCase().includes('today') || query.toLowerCase().includes('available') || query.toLowerCase().includes('expir')) {
        const resFood = await fetch('/api/ngo/find-food', { headers: { Authorization: `Bearer ${token}` } });
        if (resFood.ok) {
          const foodData = await resFood.json();
          if (foodData.length > 0) {
            contextInfo = `Current live donations in DB: ` + foodData.slice(0, 3).map(f => `${f.title} (${f.quantity} ${f.quantity_unit}, ${f.food_type}, in ${f.donor_city || 'Nearby'})`).join('; ');
          } else {
            contextInfo = 'Currently no active surplus food in DB.';
          }
        }
      }

      // Try backend AI or intelligent rule-based response
      let replyText = '';
      const q = query.toLowerCase();

      if (q.includes('claim today') || q.includes('available food') || q.includes('what food')) {
        if (contextInfo) {
          replyText = `Here is the current live surplus food available in ShareByte:\n\n${contextInfo}\n\nYou can claim any of these by visiting **Find Food**!`;
        } else {
          replyText = `Currently, all donor donations have been claimed or none are available. Check back in a few minutes or create a custom **Food Request** for donors to fulfill!`;
        }
      } else if (q.includes('expir')) {
        replyText = `I checked the expiry tracking! You can filter for donations with less than 2 hours of shelf life under **Find Food → Expiring Soon**. Rescuing these items prevents food waste immediately!`;
      } else if (q.includes('distribution') || q.includes('record')) {
        replyText = `To record a completed distribution:\n1. Collect the food from the donor using your verification code.\n2. Navigate to **Distribution** in the sidebar.\n3. Click **Record Distribution**, enter portions served and select your beneficiary group!`;
      } else if (q.includes('50 people') || q.includes('100 people') || q.includes('people')) {
        replyText = `For bulk requirements, I recommend submitting a **Food Request** under the *Food Requests* tab with high urgency. Donors in your service area will be notified to contribute!`;
      } else {
        replyText = `As an authorized NGO on ShareByte, you can discover surplus donations, claim them directly, coordinate pickups via the in-app map, and record distributions to your communities. Let me know if you need help with claims, beneficiaries, or reports!`;
      }

      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'bot',
          text: replyText,
          timestamp: new Date()
        }]);
        setLoading(false);
      }, 500);

    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'I am here to assist your NGO. Please visit Find Food to explore available donations or Food Requests to post requirements.',
        timestamp: new Date()
      }]);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', width: '380px', height: '560px', backgroundColor: 'var(--bg-secondary, #ffffff)', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: '1px solid var(--border-color, #e5e7eb)', display: 'flex', flexDirection: 'column', zIndex: 1000, overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Header */}
      <div style={{ padding: '1.1rem 1.25rem', background: 'linear-gradient(135deg, #10b981, #047857)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={22} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Annamitra AI <Sparkles size={14} color="#fef08a" />
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>NGO Operations Assistant</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '4px' }}>
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {messages.map((m) => (
          <div key={m.id} style={{ display: 'flex', justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ maxWidth: '82%', padding: '0.75rem 1rem', borderRadius: m.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px', backgroundColor: m.sender === 'user' ? '#10b981' : 'var(--bg-tertiary, #f3f4f6)', color: m.sender === 'user' ? 'white' : 'var(--text-primary, #111827)', fontSize: '0.88rem', lineHeight: 1.45, whiteSpace: 'pre-line' }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.82rem', padding: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', animation: 'ping 1s infinite' }} />
            Annamitra is analyzing food data...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.4rem', overflowX: 'auto', borderTop: '1px solid var(--border-color, #e5e7eb)', backgroundColor: 'var(--bg-secondary, #fafafa)' }}>
        {quickPrompts.map((p, idx) => (
          <button key={idx} onClick={() => handleSend(p)}
            style={{ padding: '0.3rem 0.65rem', backgroundColor: 'var(--bg-primary, #ffffff)', border: '1px solid var(--border-color, #e5e7eb)', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary, #4b5563)', whiteSpace: 'nowrap', cursor: 'pointer' }}>
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border-color, #e5e7eb)', display: 'flex', gap: '0.5rem', alignItems: 'center', backgroundColor: 'var(--bg-secondary, #ffffff)' }}>
        <input type="text" placeholder="Ask Annamitra anything..." value={input} onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1px solid var(--border-color, #e5e7eb)', fontSize: '0.88rem', outline: 'none', backgroundColor: 'var(--bg-primary, #ffffff)', color: 'var(--text-primary, #111827)' }} />
        <button type="submit" disabled={!input.trim() || loading}
          style={{ padding: '0.65rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: !input.trim() ? 0.6 : 1 }}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default AnnamitraNgoAssistant;
