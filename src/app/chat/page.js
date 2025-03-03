'use client'

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './chat.module.css';

export default function Chat() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMessage = searchParams.get('initialMessage');
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (initialMessage) {
      setMessages([{ 
        text: initialMessage, 
        isUser: true, 
        timestamp: new Date().toISOString() 
      }]);
      handleAIResponse(initialMessage);
    }
  }, [initialMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = {
      text: input,
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    
    handleAIResponse(input);
  };

  const handleAIResponse = (userMessage) => {
    setIsLoading(true);
    
    setTimeout(() => {
      const aiResponse = {
        text: generateAIResponse(userMessage),
        isUser: false,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const generateAIResponse = (userMessage) => {
    const responses = [
      `Thank you for your query about "${userMessage}". Based on United Nations data, I can provide you with relevant information on this topic.`,
      `I've analyzed your question about "${userMessage}". The UN has several resources that might be helpful for your research.`,
      `Regarding "${userMessage}", the United Nations has conducted extensive work in this area. Let me share some insights.`,
      `Your interest in "${userMessage}" is important. The UN's sustainable development goals address aspects of this topic in goals 1, 8, and 16.`,
      `I've found several UN documents related to "${userMessage}". Would you like me to provide specific references from our database?`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.logoContainer}>
            <img 
              src="/un-logo.png" 
              alt="United Nations Logo" 
              className={styles.logo} 
            />
            <div className={styles.titleContainer}>
              <h1 className={styles.mainTitle}>UNFICYP</h1>
              <div className={styles.divider}></div>
              <div className={styles.chatTitle}>
                <h2>UNFICYP AI Chat</h2>
                <p>AI-Powered Assistant for UNFICYP Resources</p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => router.push('/')} 
            className={styles.backButton}
          >
            Back to Search
          </button>
        </header>

        <main className={styles.main}>
          <div className={styles.chatContainer}>
            <div className={styles.messagesContainer}>
              {messages.length === 0 ? (
                <div className={styles.welcomeMessage}>
                  <h3>Welcome to UNFICYP AI Chat</h3>
                  <p>Ask me anything about UNFICYP resources or data.</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`${styles.message} ${message.isUser ? styles.userMessage : styles.aiMessage}`}
                  >
                    <div className={styles.messageContent}>
                      <span className={styles.messageSender}>
                        {message.isUser ? 'You' : 'UNFICYP AI'}
                      </span>
                      <p>{message.text}</p>
                      <span className={styles.timestamp}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className={`${styles.message} ${styles.aiMessage}`}>
                  <div className={styles.messageContent}>
                    <span className={styles.messageSender}>UNFICYP AI</span>
                    <p className={styles.typingIndicator}>
                      <span>.</span><span>.</span><span>.</span>
                    </p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className={styles.inputForm}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message here..."
                className={styles.messageInput}
                disabled={isLoading}
              />
              <button 
                type="submit" 
                className={styles.sendButton}
                disabled={isLoading || !input.trim()}
              >
                Send
              </button>
            </form>
          </div>
        </main>
      </div>
    </Suspense>
  );
}
