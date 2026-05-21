import React, { useState, useRef, useEffect } from 'react';
import './ChatbotWidget.css';

const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', content: 'Hi! What can I help you with?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSendMessage = async (text) => {
        if (!text.trim()) return;

        // Add user message
        const newMessages = [...messages, { role: 'user', content: text }];
        setMessages(newMessages);
        setInputValue('');
        setIsTyping(true);

        try {
            const response = await fetch('http://localhost:5001/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: text, history: newMessages })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            
            setMessages(prev => [...prev, { role: 'ai', content: data.response || "Sorry, I couldn't understand that." }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I'm having trouble connecting right now." }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleQuickReply = (text) => {
        handleSendMessage(text);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage(inputValue);
        }
    };

    return (
        <div className="chatbot-widget-container">
            {/* The Floating Action Button */}
            {!isOpen && (
                <button 
                    className="chatbot-fab" 
                    onClick={() => setIsOpen(true)}
                    aria-label="Open Chat Support"
                >
                    <img src="/bot-icon.png" alt="Bot Icon" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                </button>
            )}

            {/* The Chat Window Overlay */}
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="chatbot-header-title">
                            <span className="chatbot-avatar">
                                <img src="/bot-icon.png" alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            </span>
                            Investra Support Bot
                        </div>
                        <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>
                            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`chat-bubble-wrapper ${msg.role === 'user' ? 'user' : 'ai'}`}>
                                <div className={`chat-bubble ${msg.role === 'user' ? 'user' : 'ai'}`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        
                        {isTyping && (
                            <div className="chat-bubble-wrapper ai typing-indicator-wrapper">
                                <div className="chat-bubble ai typing-indicator">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Replies - shown only when fewer messages exist */}
                    {messages.length < 3 && !isTyping && (
                        <div className="chatbot-quick-replies">
                            <button className="quick-reply-btn" onClick={() => handleQuickReply("Is this real money or paper trading?")}>
                                Is this real money?
                            </button>
                            <button className="quick-reply-btn" onClick={() => handleQuickReply("How do I add virtual funds?")}>
                                How to add funds?
                            </button>
                            <button className="quick-reply-btn" onClick={() => handleQuickReply("Are the stock prices real?")}>
                                Are prices real?
                            </button>
                        </div>
                    )}

                    <div className="chatbot-input-area">
                        <div className="chatbot-input-disclaimer">
                            AI-generated responses may be misleading or incorrect. Please validate the information independently, or contact support@investra.co to verify the facts.
                        </div>
                        <div className="chatbot-input-wrapper">
                            <input 
                                type="text"
                                placeholder="Message..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={isTyping}
                            />
                            <button 
                                className="chatbot-send-btn"
                                onClick={() => handleSendMessage(inputValue)}
                                disabled={!inputValue.trim() || isTyping}
                            >
                                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="19" x2="12" y2="5"></line>
                                    <polyline points="5 12 12 5 19 12"></polyline>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatbotWidget;
