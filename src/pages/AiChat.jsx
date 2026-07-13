import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, ShieldAlert, CheckCircle, Info, AlertTriangle, Lightbulb } from 'lucide-react'
import { api } from '../lib/api'

export default function AiChat() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const suggestions = [
    "How can I reduce jaw pain?",
    "What exercises help TMD?",
    "How does stress affect TMD?",
    "Tips for improving sleep quality?",
    "When should I consult a doctor?"
  ]

  const parseMessageContent = (content) => {
    // If the message has no special tags, return standard text
    if (!content.includes('[')) return <p style={{ margin: 0 }}>{content}</p>

    const blocks = []
    const lines = content.split('\n')
    
    let currentBlock = []
    let currentType = 'text'

    const renderBlock = (type, text, index) => {
      const contentStr = text.join('\n').trim()
      if (!contentStr) return null

      switch(type) {
        case 'INFO':
          return (
            <div key={index} style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', borderLeft: '4px solid #2563EB', padding: '0.75rem', borderRadius: '4px', margin: '0.5rem 0', color: '#1E40AF', display: 'flex', gap: '0.5rem' }}>
              <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{contentStr}</div>
            </div>
          )
        case 'SUCCESS':
          return (
            <div key={index} style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid #10B981', padding: '0.75rem', borderRadius: '4px', margin: '0.5rem 0', color: '#065F46', display: 'flex', gap: '0.5rem' }}>
              <CheckCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{contentStr}</div>
            </div>
          )
        case 'WARNING':
          return (
            <div key={index} style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', borderLeft: '4px solid #F59E0B', padding: '0.75rem', borderRadius: '4px', margin: '0.5rem 0', color: '#92400E', display: 'flex', gap: '0.5rem' }}>
              <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{contentStr}</div>
            </div>
          )
        case 'ALERT':
          return (
            <div key={index} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #EF4444', padding: '0.75rem', borderRadius: '4px', margin: '0.5rem 0', color: '#991B1B', display: 'flex', gap: '0.5rem' }}>
              <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{contentStr}</div>
            </div>
          )
        case 'REC':
          return (
            <div key={index} style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', padding: '0.75rem', borderRadius: '8px', margin: '0.5rem 0', color: '#1D4ED8', display: 'flex', gap: '0.5rem' }}>
              <Lightbulb size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{contentStr}</div>
            </div>
          )
        default:
          return <p key={index} style={{ margin: '0 0 0.5rem 0' }}>{contentStr}</p>
      }
    }

    lines.forEach(line => {
      const match = line.match(/^\[(INFO|SUCCESS|WARNING|ALERT|REC)\]/)
      if (match) {
        if (currentBlock.length > 0) blocks.push({ type: currentType, text: [...currentBlock] })
        currentType = match[1]
        currentBlock = [line.replace(/^\[.*?\]/, '').trim()]
      } else {
        currentBlock.push(line)
      }
    })
    
    if (currentBlock.length > 0) blocks.push({ type: currentType, text: currentBlock })

    return blocks.map((b, i) => renderBlock(b.type, b.text, i))
  }

  const handleSend = async (text) => {
    if (!text.trim() || isLoading) return

    const newMessages = [...messages, { role: 'user', content: text, timestamp: Date.now() }]
    setMessages(newMessages)
    setInputText('')
    setIsLoading(true)

    try {
      const history = newMessages.map(m => ({ role: m.role, content: m.content }))
      
      const result = await api.post('/chat', { messages: history })
      
      if (!result) throw new Error("No response from server")
      if (result.error) throw new Error(result.error)

      const botReply = result.choices?.[0]?.message?.content || result.reply || "Sorry, I couldn't process that."
      setMessages([...newMessages, { role: 'assistant', content: botReply, timestamp: Date.now() }])
      
    } catch (error) {
      console.error("Groq API Error:", error)
      // Robust Fallback if API key is invalid
      const fallbackResponse = `[WARNING] The Groq API key is invalid or missing.\n\n[INFO] For demonstration purposes, I am returning this mock response.\n\n[REC] Please ensure you are resting your jaw and applying a warm compress.`
      setMessages([...newMessages, { role: 'assistant', content: fallbackResponse, timestamp: Date.now() }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '900px', margin: '0 auto', backgroundColor: 'var(--surface)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
      
      {/* Header */}
      <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-secondary)' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={24} color="var(--brand-primary)" />
          TMD Self-Care Clinical Assistant
        </h1>
      </div>

      {/* Warning Banner */}
      <div style={{ backgroundColor: 'rgba(37, 99, 235, 0.05)', borderBottom: '1px solid rgba(37, 99, 235, 0.1)', color: 'var(--brand-primary)', padding: '0.75rem 1.25rem', fontSize: '0.8125rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Info size={16} />
        <span>This AI assistant provides general wellness guidance and is not a replacement for professional medical advice. Always consult a physician for severe pain.</span>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: 'var(--bg-primary)' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--brand-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <ShieldAlert size={32} color="var(--brand-primary)" />
            </div>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>How can I help you today?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Ask me about your symptoms, exercises, or general TMD wellness.</p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', maxWidth: '600px', margin: '0 auto' }}>
              {suggestions.map(s => (
                <button 
                  key={s} 
                  onClick={() => handleSend(s)}
                  className="btn btn-outline"
                  style={{ borderRadius: '24px', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user'
          return (
            <div key={idx} style={{ alignSelf: isUser ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
              <div style={{
                backgroundColor: isUser ? 'var(--brand-primary)' : 'var(--surface)',
                color: isUser ? 'white' : 'var(--text-primary)',
                padding: '1rem',
                borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                boxShadow: 'var(--shadow-sm)',
                border: isUser ? 'none' : '1px solid var(--surface-border)'
              }}>
                {isUser ? msg.content : parseMessageContent(msg.content)}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem', textAlign: isUser ? 'right' : 'left' }}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          )
        })}

        {isLoading && (
          <div style={{ alignSelf: 'flex-start', backgroundColor: 'var(--surface)', padding: '1rem', borderRadius: '16px 16px 16px 4px', border: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="typing-dot" style={{ animationDelay: '0s', width: '8px', height: '8px', backgroundColor: 'var(--brand-primary)', borderRadius: '50%', display: 'inline-block' }}></span>
            <span className="typing-dot" style={{ animationDelay: '0.2s', width: '8px', height: '8px', backgroundColor: 'var(--brand-primary)', borderRadius: '50%', display: 'inline-block' }}></span>
            <span className="typing-dot" style={{ animationDelay: '0.4s', width: '8px', height: '8px', backgroundColor: 'var(--brand-primary)', borderRadius: '50%', display: 'inline-block' }}></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: '1.25rem', backgroundColor: 'var(--surface)', borderTop: '1px solid var(--surface-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend(inputText)}
            placeholder="Describe your symptoms or ask a question..."
            style={{
              flex: 1, padding: '1rem', borderRadius: '24px',
              border: '1px solid var(--surface-border)', outline: 'none', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)',
              fontSize: '0.9375rem'
            }}
          />
          <button
            onClick={() => handleSend(inputText)}
            disabled={!inputText.trim() || isLoading}
            style={{
              width: '52px', height: '52px', borderRadius: '50%',
              backgroundColor: inputText.trim() && !isLoading ? 'var(--brand-primary)' : 'var(--surface-border)',
              color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        .typing-dot { animation: bounce 1.4s infinite ease-in-out both; }
      `}</style>
    </div>
  )
}
