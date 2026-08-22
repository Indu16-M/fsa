import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Camera, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AiChatbot = () => {
  const { getAuthHeaders } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: "Hi! I'm ShareWise AI 👋\nI can help you with donations, food sharing, pickup tracking, NGOs, and anything related to ShareByte.\n\n📷 Want to check food quality? Click the camera icon below to upload a photo and get a freshness report!",
      suggestions: [
        "How do I donate food?",
        "Where is my pickup person?",
        "Find nearby NGOs"
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const sendMessage = async (e, directText = null) => {
    if (e) e.preventDefault();
    const userMsg = directText || inputValue.trim();
    
    // We need either text or an image to proceed
    if (!userMsg && !imageFile) return;

    const currentImage = imageFile;
    const currentPreview = previewUrl;

    // Append user message with optional image attachment
    setMessages(prev => [...prev, { 
      sender: 'user', 
      text: userMsg || "Analyzed food item quality", 
      image: currentPreview 
    }]);

    setInputValue('');
    setImageFile(null);
    setLoading(true);

    try {
      if (currentImage) {
        // If there is an image, we call the food checker AI endpoint
        const formData = new FormData();
        formData.append('category', 'cooked'); // default
        formData.append('image', currentImage);

        const checkRes = await fetch('/api/ai/food-check', {
          method: 'POST',
          headers: {
            'Authorization': getAuthHeaders().Authorization
          },
          body: formData
        });

        if (checkRes.ok) {
          const data = await checkRes.json();
          const report = `🍲 **AI Food Quality Check Report:**\n` +
                         `• **Status**: ${data.status}\n` +
                         `• **Freshness**: ${data.freshness} (${data.confidence} confidence)\n` +
                         `• **Recommendation**: ${data.recommendation}`;
          setMessages(prev => [...prev, { sender: 'bot', text: report }]);
        } else {
          setMessages(prev => [...prev, { sender: 'bot', text: "Sorry, I failed to analyze the image. Please try again." }]);
        }
      } else {
        // Standard chatbot text response
        const context = {
          pathname: window.location.pathname,
          timestamp: new Date().toISOString()
        };

        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ message: userMsg, context })
        });
        
        if (res.ok) {
          const data = await res.json();
          setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
        } else {
          setMessages(prev => [...prev, { sender: 'bot', text: "Sorry, I'm having trouble connecting right now." }]);
        }
      }
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: "Network error. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button 
        className="ai-chat-fab"
        onClick={toggleChat}
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000,
          width: '60px', height: '60px', borderRadius: '50%',
          backgroundColor: 'var(--primary-color)', color: 'white',
          border: 'none', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(16,185,129,0.4)',
          transition: 'transform 0.2s',
          transform: isOpen ? 'scale(0)' : 'scale(1)'
        }}
      >
        <MessageSquare size={28} />
      </button>

      {/* Chat Window */}
      <div 
        className="ai-chat-window"
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1001,
          width: '350px', height: '500px', backgroundColor: 'var(--bg-primary)',
          borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          transition: 'all 0.3s ease',
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
          pointerEvents: isOpen ? 'all' : 'none',
          border: '1px solid var(--border-color)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1rem', background: 'linear-gradient(135deg, var(--primary-color), #2dd4bf)',
          color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bot size={24} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 600, fontSize: '1.1rem', lineHeight: '1' }}>ShareWise AI</span>
              <span style={{ fontSize: '0.7rem', opacity: 0.9 }}>Smart guidance for every meal</span>
            </div>
          </div>
          <button onClick={toggleChat} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem',
          backgroundColor: 'var(--bg-secondary)'
        }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%', display: 'flex', gap: '0.5rem',
              flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
            }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                backgroundColor: msg.sender === 'user' ? '#3b82f6' : 'var(--primary-color)',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div style={{
                backgroundColor: msg.sender === 'user' ? '#3b82f6' : 'var(--bg-primary)',
                color: msg.sender === 'user' ? 'white' : 'var(--text-primary)',
                padding: '0.75rem', borderRadius: '12px',
                borderTopRightRadius: msg.sender === 'user' ? '4px' : '12px',
                borderTopLeftRadius: msg.sender === 'bot' ? '4px' : '12px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                fontSize: '0.95rem', lineHeight: '1.4',
                whiteSpace: 'pre-line'
              }}>
                {msg.image && (
                  <div style={{ marginBottom: '0.5rem', borderRadius: '8px', overflow: 'hidden' }}>
                    <img src={msg.image} alt="Food analysis preview" style={{ width: '100%', maxHeight: '140px', objectFit: 'cover', display: 'block' }} />
                  </div>
                )}
                {msg.text}
                
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                    {msg.suggestions.map((sug, i) => (
                      <button 
                        key={i}
                        onClick={() => sendMessage(null, sug)}
                        style={{
                          background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                          color: 'var(--primary-color)', padding: '0.5rem', borderRadius: '8px',
                          fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left', fontWeight: 500
                        }}
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '0.5rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bot size={16} /></div>
              <div style={{ backgroundColor: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '12px', borderTopLeftRadius: '4px', fontSize: '0.95rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                {imageFile ? '⚡ AI is analyzing food quality...' : 'Thinking...'}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input & Form */}
        <div style={{ borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
          {/* Selected File Preview Box */}
          {previewUrl && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(16, 185, 129, 0.05)' }}>
              <img src={previewUrl} alt="Attached thumbnail" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flex: 1 }}>{imageFile?.name}</span>
              <button onClick={() => setImageFile(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <X size={18} />
              </button>
            </div>
          )}

          <form onSubmit={sendMessage} style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Camera / Upload trigger */}
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
            />
            <button 
              type="button" 
              onClick={triggerFileInput} 
              style={{
                background: 'none', border: 'none', color: imageFile ? 'var(--primary-color)' : 'var(--text-muted)', 
                cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              title="Upload Food Image for AI Check"
            >
              <Camera size={22} />
            </button>

            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={imageFile ? "Add details or click Send to analyze..." : "Ask a question..."}
              style={{
                flex: 1, padding: '0.65rem 1rem', borderRadius: '99px',
                border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)',
                outline: 'none', fontSize: '0.95rem'
              }}
            />
            <button 
              type="submit"
              disabled={(!inputValue.trim() && !imageFile) || loading}
              style={{
                width: '36px', height: '36px', borderRadius: '50%',
                backgroundColor: (inputValue.trim() || imageFile) ? 'var(--primary-color)' : 'var(--bg-secondary)',
                color: 'white', border: 'none', cursor: (inputValue.trim() || imageFile) ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AiChatbot;
