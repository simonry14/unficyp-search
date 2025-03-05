'use client'

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './chat.module.css';
import Link from 'next/link';


// Create a separate component that uses useSearchParams
function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMessage = searchParams.get('initialMessage');
  //const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const messagesEndRef = useRef(null);
  const [userName, setUserName] = useState('');

   // New state for chats management
   const [chats, setChats] = useState([]);
   const [currentChatId, setCurrentChatId] = useState(null);
   const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('unficyp_user') || 
                       sessionStorage.getItem('unficyp_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.username)
      setUserId(user.userId);
      //fetchChatHistory(user.userId);
      fetchUserChats(user.userId);
    } else {
      router.push('/login');
    }
  }, []);

    useEffect(() => {
    if (initialMessage && userId) {
      handleSendMessage(new Event('submit'), initialMessage);
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [initialMessage, userId]);

  const fetchUserChats = async (userId) => {
    try {
      const response = await fetch('/api/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getChats', userId })
      });
      const data = await response.json();
      if (data.success) {
        setChats(data.chats);
        if (data.chats.length > 0) {
          loadChat(data.chats[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const loadChat = async (chatId) => {
    setCurrentChatId(chatId);
    try {
      const response = await fetch('/api/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getMessages', chatId })
      });
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages.map(msg => ({
          text: msg.text,
          isUser: !msg.isAiMessage,
          timestamp: msg.timestamp
        })));
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  const createNewChat = async () => {
    try {
      const response = await fetch('/api/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'createChat', userId })
      });
      const data = await response.json();
      if (data.success) {
        setChats(prev => [{ id: data.chatId, createdAt: new Date().toISOString() }, ...prev]);
        loadChat(data.chatId);
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const fetchChatHistoryOLD = async (userId) => {
    try {
      const response = await fetch('/api/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getMessages', userId })
      });
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages.map(msg => ({
          text: msg.text,
          isUser: !msg.isAiMessage,
          timestamp: msg.timestamp
        })));
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const saveChatMessageOLD = async (message, isUser) => {
    if (!userId) return;
    await fetch('/api/database', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'addMessage', userId, messageText: message, isAiMessage: !isUser })
    });
  };

  const saveChatMessage = async (message, isUser) => {
    if (!currentChatId) return;
    await fetch('/api/database', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'addMessage', chatId: currentChatId, messageText: message, isAiMessage: !isUser })
    });
  };

  const handleSendMessage = async (e, initialMsg = null) => {
    e.preventDefault();
    const messageText = initialMsg || input;
    if (!messageText.trim()) return;
    
    const newMessage = { text: messageText, isUser: true, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    await saveChatMessage(messageText, true);
    await handleAIResponse(messageText);
  };

  const handleAIResponseOLD = async (userMessage) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, context: messages.slice(-5) })
      });
      const data = await response.json();
      const aiResponse = { text: data.response, isUser: false, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, aiResponse]);
      await saveChatMessage(aiResponse.text, false);
    } catch (error) {
      console.error('Error getting AI response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIResponse = async (userMessage) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, context: messages.slice(-5) })
      });
      const data = await response.json();
      const aiResponse = { text: data.response, isUser: false, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, aiResponse]);
      await saveChatMessage(aiResponse.text, false);
    } catch (error) {
      console.error('Error getting AI response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('unficyp_user');
    sessionStorage.removeItem('unficyp_user');
    window.location.href = '/login'; // Redirect to login page
  };


  return (
    <div className={styles.pageWrapper}>
   


      <nav className={styles.globalNav}>
        <div className={styles.navContainer}>
          <div className={styles.navLeft}>
            <Link href="https://www.un.org" className={styles.navLink}>
              United Nations
            </Link>
            <span className={styles.navDivider}>|</span>
            <Link href="https://peacekeeping.un.org" className={styles.navLink}>
              UN Peacekeeping
            </Link>
          </div>
          <div className={styles.navRight}>
          {userName.length > 0 ? (
  <>
    Hi, {userName} |  
    <button onClick={handleLogout} className={styles.navLink}>
      Logout
    </button>
  </>
) : (
  <Link href="/login" className={styles.navLink}>
    Login
  </Link>
)}
            <div className={styles.languageSelector}>
              <select className={styles.langSelect} defaultValue="en">
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
                <option value="ar">العربية</option>
                <option value="ru">Русский</option>
                <option value="zh">中文</option>
                <option value="el">Ελληνικά</option>
                <option value="tr">Türkçe</option>
              </select>
            </div>
          </div>
        </div>
      </nav>

      <header className={styles.header}>
  <div className={styles.headerWrapper}>
    <div className={styles.logoContainer}>
      <img 
        src="/un-logo.png" 
        alt="United Nations Logo" 
        className={styles.logo} 
      />
      <div className={styles.titleContainer}>
        <h1 className={styles.mainTitle}>UNFICYP</h1>
        <div className={styles.divider}></div>
        <div className={styles.searchTitle}>
        <h2>UNFICYP AI Chat</h2>
        <p>AI-Powered Assistant for UNFICYP Resources</p>
        </div>
      </div>
    </div>
  </div>
</header>


 
<main className={styles.main}>

<div className={`${styles.chatSidebar} ${isSidebarOpen ? styles.open : ''}`}>
          <button 
            className={styles.sidebarToggle} 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? '←' : '→'}
          </button>
          
          <div className={styles.chatList}>
            <button 
              onClick={createNewChat} 
              className={styles.newChatButton}
            >
              + New Chat
            </button>
            
            {chats.map(chat => (
              <div 
                key={chat.id} 
                className={`${styles.chatItem} ${chat.id === currentChatId ? styles.active : ''}`}
                onClick={() => loadChat(chat.id)}
              >
                <span>{chat.title || 'Untitled Chat'}</span>
                <small>{new Date(chat.lastUpdated).toLocaleString()}</small>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.chatContainer}>
          <div className={styles.messagesContainer}>
            {messages.length === 0 ? (
              <div className={styles.welcomeMessage}>
                <h3>Welcome to UNFICYP AI Chat</h3>
                <p>Ask me anything about UNFICYP resources or data.</p>
              </div>
            ) : (
              messages.map((message, index) => (
              <div key={index} className={`${styles.message} ${message.isUser ? styles.userMessage : styles.aiMessage}`}>
                 <span className={styles.messageSender}>{message.isUser ? 'You' : 'UNFICYP AI'}</span>
                <p>{message.text}</p>
                <span className={styles.timestamp}>{new Date(message.timestamp).toLocaleTimeString()}</span>
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
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your message..." className={styles.messageInput} disabled={isLoading} />
            <button type="submit" className={styles.sendButton} disabled={isLoading || !input.trim()}>Send</button>
          </form>
        </div>
      </main>

        {/* Footer */}
        <footer className={styles.footer}>
        <div className={styles.footerBottom}>
          <p>© {new Date().getFullYear()} United Nations. All rights reserved.</p>
        </div>
      </footer>
   
    </div>
  );
}

// Main component with proper Suspense boundary
export default function Chat() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatContent />
    </Suspense>
  );
}