import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMarket } from '../context/MarketContext';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import './AIAssistant.css';

const SUGGESTION_CARDS = [
    {
        title: "Analyze Reliance",
        desc: "Get real-time price snapshot, news pulse, and key trends for Reliance Industries.",
        query: "Analyze Reliance Industries",
        icon: "📈",
        color: "blue"
    },
    {
        title: "TCS Market Trend",
        desc: "See how India's IT giant is moving today and parse its recent price volatility.",
        query: "Why is TCS moving?",
        icon: "💻",
        color: "purple"
    },
    {
        title: "HDFC Bank Check",
        desc: "Check key support/resistance levels and volume dynamics for HDFC Bank.",
        query: "Analyze HDFC Bank",
        icon: "🏦",
        color: "emerald"
    },
    {
        title: "What is PE Ratio?",
        desc: "Learn how the Price-to-Earnings ratio helps identify undervalued stocks.",
        query: "What is PE Ratio and how do I use it?",
        icon: "🎓",
        color: "amber"
    }
];

const AIAssistant = () => {
    const { user } = useAuth();
    const { currentMode } = useMarket();
    const navigate = useNavigate();

    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: `Hey ${user?.name || 'Trader'}! ⚡ I'm **Vega**, your AI Trading Mentor on Investra.

I pull real-time stock prices and latest news for any **Nifty 50** company and break down what's happening — so you actually learn how markets move.

Drop a company name like **"Reliance"** or **"Infosys"** and let's read the market like a pro! 📊`
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (currentMode !== 'DEMO') {
            navigate('/');
        }
    }, [currentMode, navigate]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async (e, directMessage = null) => {
        if (e) e.preventDefault();
        const msgToSend = directMessage || input;
        if (!msgToSend.trim()) return;

        const userMsg = msgToSend.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const BOT_URL = import.meta.env.VITE_BOT_URL || 'http://localhost:5001';
            const response = await fetch(`${BOT_URL}/mentor_chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch response');
            }

            const data = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch (error) {
            console.error("Mentor Chat Error:", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "⚡ Looks like I can't reach my data source right now. This usually means the API quota is temporarily exhausted. Try again in about a minute!"
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Simple markdown-like bold rendering
    const renderText = (text) => {
        const parts = text.split(/(\*\*[^*]+\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    // Structured markdown parsing
    const parseMarkdown = (content) => {
        if (!content) return null;
        
        const lines = content.split('\n');
        return lines.map((line, lineIdx) => {
            // Check for headers
            if (line.startsWith('### ')) {
                return <h3 key={lineIdx} className="chat-h3">{renderText(line.slice(4))}</h3>;
            }
            if (line.startsWith('## ')) {
                return <h2 key={lineIdx} className="chat-h2">{renderText(line.slice(3))}</h2>;
            }
            if (line.startsWith('# ')) {
                return <h1 key={lineIdx} className="chat-h1">{renderText(line.slice(2))}</h1>;
            }
            
            // Check for list items
            if (line.startsWith('- ') || line.startsWith('* ')) {
                return (
                    <ul key={lineIdx} className="chat-ul">
                        <li>{renderText(line.slice(2))}</li>
                    </ul>
                );
            }
            
            // Check for numbered lists
            const numListMatch = line.match(/^(\d+)\.\s(.*)/);
            if (numListMatch) {
                return (
                    <ol key={lineIdx} className="chat-ol" start={numListMatch[1]}>
                        <li>{renderText(numListMatch[2])}</li>
                    </ol>
                );
            }
            
            // Standard line
            if (line.trim() === '') {
                return <div key={lineIdx} className="chat-line-gap" />;
            }
            
            return <p key={lineIdx} className="chat-p">{renderText(line)}</p>;
        });
    };

    if (currentMode !== 'DEMO') return null;

    return (
        <div className="ai-mentor-page fade-in">
            <div className="mentor-header">
                <div className="mentor-avatar">
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"></path>
                        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"></path>
                    </svg>
                </div>
                <div className="mentor-info">
                    <h1>Vega AI</h1>
                    <p>Your Personal Trading Mentor</p>
                    <span className="mentor-badge">Educational</span>
                </div>
            </div>

            <Card className="chat-card">
                {messages.length === 1 ? (
                    <div className="mentor-onboarding">
                        <div className="onboarding-welcome">
                            <span className="onboarding-sparkle">⚡</span>
                            <h2>How can I help you learn today?</h2>
                            <p>I'm Vega, your virtual trading mentor. Ask me about any Nifty 50 stock, price patterns, news events, or financial concepts.</p>
                        </div>
                        <div className="onboarding-grid">
                            {SUGGESTION_CARDS.map((card, i) => (
                                <div 
                                    key={i} 
                                    className={`onboarding-card ${card.color}`} 
                                    onClick={() => handleSend(null, card.query)}
                                >
                                    <div className="oc-icon">{card.icon}</div>
                                    <div className="oc-content">
                                        <h3>{card.title}</h3>
                                        <p>{card.desc}</p>
                                    </div>
                                    <span className="oc-arrow">→</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="chat-history">
                        {messages.map((msg, index) => (
                            <div key={index} className={`chat-message ${msg.role}`}>
                                {msg.role === 'assistant' && (
                                    <span className="msg-avatar">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"></path>
                                            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"></path>
                                        </svg>
                                    </span>
                                )}
                                <div className="msg-bubble">
                                    {parseMarkdown(msg.content)}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="chat-message assistant">
                                <span className="msg-avatar">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"></path>
                                        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"></path>
                                    </svg>
                                </span>
                                <div className="msg-bubble loading">
                                    <div className="dot-flashing"></div>
                                    <span className="loading-text">Vega is analyzing...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}

                <form className="chat-input-area" onSubmit={(e) => handleSend(e)}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about any Nifty 50 stock or trading concept..."
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !input.trim()} className="send-btn" aria-label="Send message">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </form>
            </Card>
        </div>
    );
};

export default AIAssistant;
