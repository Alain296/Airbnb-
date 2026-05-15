import { useState, useRef, useEffect } from 'react';
import { 
  FiMessageCircle, FiX, FiSend, FiMinimize2, FiMaximize2, FiCpu
} from 'react-icons/fi';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { api } from '../../lib/api';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatboxProps {
  listingId?: string;
}

export function Chatbox({ listingId }: ChatboxProps) {
  const { isAuthenticated, userName, userEmail } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I can help with bookings, payments, cancellations, reviews, or questions about your stay.',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayName = userName || userEmail?.split('@')[0] || 'Guest';

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && isOpen && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await api.post<{ 
        response: string; 
        conversationId?: string;
        suggestions?: string[];
      }>('/ai/support', {
        message: userMessage.text,
        listingId,
        conversationId,
      });

      // Update conversation ID if provided
      if (response.conversationId && !conversationId) {
        setConversationId(response.conversationId);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I could not answer that just now. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Quick action buttons
  const quickActions = [
    'How do I book a listing?',
    'What is the cancellation policy?',
    'How do I contact a host?',
    'Payment methods',
  ];

  const handleQuickAction = (action: string) => {
    setInputValue(action);
    setTimeout(() => handleSendMessage(), 100);
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ff5722 0%, #ff8a50 100%)',
            border: 'none',
            boxShadow: '0 4px 20px rgba(255, 87, 34, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 24px rgba(255, 87, 34, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 87, 34, 0.4)';
          }}
          title="Chat with AI Assistant"
        >
          <FiMessageCircle size={28} color="white" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: isMinimized ? 320 : 380,
            height: isMinimized ? 60 : 550,
            background: 'white',
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 999,
            overflow: 'hidden',
            transition: 'all 0.3s ease',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #ff5722 0%, #ff8a50 100%)',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: 'white',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FiCpu size={22} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>AI Assistant</div>
                <div style={{ fontSize: 12, opacity: 0.9 }}>
                  {isLoading ? 'Typing...' : 'Online'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: 6,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                title={isMinimized ? 'Maximize' : 'Minimize'}
              >
                {isMinimized ? (
                  <FiMaximize2 size={16} color="white" />
                ) : (
                  <FiMinimize2 size={16} color="white" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: 6,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                title="Close"
              >
                <FiX size={18} color="white" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '20px',
                  background: '#f8f9fa',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      gap: 8,
                    }}
                  >
                    {msg.sender === 'bot' && (
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #ff5722 0%, #ff8a50 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <FiCpu size={18} color="white" />
                      </div>
                    )}
                    <div
                      style={{
                        maxWidth: '75%',
                        padding: '12px 16px',
                        borderRadius: 12,
                        background: msg.sender === 'user' ? '#ff5722' : 'white',
                        color: msg.sender === 'user' ? 'white' : '#374151',
                        fontSize: 14,
                        lineHeight: 1.5,
                        boxShadow:
                          msg.sender === 'user'
                            ? '0 2px 8px rgba(255, 87, 34, 0.2)'
                            : '0 2px 8px rgba(0, 0, 0, 0.08)',
                      }}
                    >
                      {msg.text}
                    </div>
                    {msg.sender === 'user' && (
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: '#e5e7eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          fontWeight: 700,
                          fontSize: 14,
                          color: '#6b7280',
                        }}
                      >
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #ff5722 0%, #ff8a50 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <FiCpu size={18} color="white" />
                    </div>
                    <div
                      style={{
                        padding: '12px 16px',
                        borderRadius: 12,
                        background: 'white',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                        display: 'flex',
                        gap: 4,
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: '#9ca3af',
                          animation: 'bounce 1.4s infinite ease-in-out both',
                          animationDelay: '0s',
                        }}
                      />
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: '#9ca3af',
                          animation: 'bounce 1.4s infinite ease-in-out both',
                          animationDelay: '0.16s',
                        }}
                      />
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: '#9ca3af',
                          animation: 'bounce 1.4s infinite ease-in-out both',
                          animationDelay: '0.32s',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Quick actions (show only if no messages yet) */}
                {messages.length === 1 && !isLoading && (
                  <div style={{ marginTop: 12 }}>
                    <div
                      style={{
                        fontSize: 12,
                        color: '#9ca3af',
                        marginBottom: 8,
                        fontWeight: 600,
                      }}
                    >
                      Quick questions:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {quickActions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickAction(action)}
                          style={{
                            background: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: 8,
                            padding: '10px 12px',
                            fontSize: 13,
                            color: '#374151',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#ff5722';
                            e.currentTarget.style.background = '#fff7f2';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e5e7eb';
                            e.currentTarget.style.background = 'white';
                          }}
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div
                style={{
                  padding: '16px 20px',
                  borderTop: '1px solid #e5e7eb',
                  background: 'white',
                }}
              >
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      border: '1.5px solid #e5e7eb',
                      borderRadius: 10,
                      padding: '12px 16px',
                      fontSize: 14,
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#ff5722')}
                    onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background:
                        !inputValue.trim() || isLoading
                          ? '#e5e7eb'
                          : 'linear-gradient(135deg, #ff5722 0%, #ff8a50 100%)',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: !inputValue.trim() || isLoading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                    }}
                    title="Send message"
                  >
                    <FiSend
                      size={18}
                      color={!inputValue.trim() || isLoading ? '#9ca3af' : 'white'}
                    />
                  </button>
                </div>
                {!isAuthenticated && (
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 11,
                      color: '#9ca3af',
                      textAlign: 'center',
                    }}
                  >
                    Sign in for personalized assistance
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
}
