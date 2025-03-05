'use client'

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './chat.module.css';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';


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
    const handleInitialMessage = async () => {
      // Check if there's an initial message and user is logged in
      if (initialMessage && userId) {
        try {
          // First, create a new chat
          const chatResponse = await fetch('/api/database', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              action: 'createChat', 
              userId, 
              title: initialMessage.slice(0, 50) // Use first 50 chars as title
            })
          });
          
          const chatData = await chatResponse.json();
          
          if (chatData.success) {
            const newChatId = chatData.chatId;
            
            // Update chats list with the new chat
            setChats(prev => [
              { 
                id: newChatId, 
                title: chatData.title, 
                createdAt: new Date().toISOString() 
              }, 
              ...prev
            ]);
            
            // Explicitly set current chat to the new chat
            setCurrentChatId(newChatId);
            
            // Add initial message as a user message
            const userMessage = { 
              text: initialMessage, 
              isUser: true, 
              timestamp: new Date().toISOString() 
            };
            
            // Save user message to database
            await fetch('/api/database', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                action: 'addMessage', 
                userId, 
                chatId: newChatId, 
                messageText: initialMessage, 
                isAiMessage: false 
              })
            });
            
            // Update messages state
            setMessages([userMessage]);
            
            // Trigger AI response, passing the chatId explicitly if needed
            await handleAIResponse(initialMessage, newChatId);
          }
        } catch (error) {
          console.error('Error handling initial message:', error);
        }
      }
    };
  
    // Only run if userId is set
    if (userId) {
      handleInitialMessage();
    }
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
        console.log(chats.length)
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
        const loadedMessages = data.messages.map(msg => ({
          text: msg.text,
          isUser: !msg.isAiMessage,
          timestamp: msg.timestamp
        }));
        
        setMessages(loadedMessages);
        
        // Scroll to bottom after messages are loaded
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
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


  const saveChatMessage = async (message, isUser) => {
    if (!currentChatId) return;
    await fetch('/api/database', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'addMessage',userId, chatId: currentChatId, messageText: message, isAiMessage: !isUser })
    });
  };

  const handleSendMessageOLD = async (e, initialMsg = null) => {
    e.preventDefault();
    const messageText = initialMsg || input;
    if (!messageText.trim()) return;

    // Add user message to state
    const userMessage = { text: messageText, isUser: true, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);

    setInput('');

    //save user message in db
    await saveChatMessage(messageText, true);

    // Call AI response handler
    await handleAIResponse(messageText);
    
};

const handleSendMessage = async (e, initialMsg = null) => {
  e.preventDefault();
  const messageText = initialMsg || input;
  if (!messageText.trim()) return;

  // If no current chat, create a new one
  let chatId = currentChatId;
  if (!chatId) {
    try {
      // Create a new chat
      const chatResponse = await fetch('/api/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'createChat', 
          userId, 
          title: 'New Chat' // Temporary title
        })
      });
      
      const chatData = await chatResponse.json();
      
      if (chatData.success) {
        chatId = chatData.chatId;
        
        // Update chats list with the new chat
        setChats(prev => [
          { 
            id: chatId, 
            title: 'New Chat', 
            createdAt: new Date().toISOString() 
          }, 
          ...prev
        ]);
        
        // Set current chat to the new chat
        setCurrentChatId(chatId);
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
      return;
    }
  }

  // Add user message to state
  const userMessage = { text: messageText, isUser: true, timestamp: new Date().toISOString() };
  setMessages(prev => [...prev, userMessage]);

  // Clear input
  setInput('');

  // Save user message in db
  await fetch('/api/database', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      action: 'addMessage', 
      userId, 
      chatId, 
      messageText, 
      isAiMessage: false 
    })
  });

  // if this is the first message, update title
  if (messages.length === 0) {
    //await updateChatTitle(messages[0].text, chatId);
    try {
      await fetch('/api/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'updateChatTitle', 
          chatId, 
          title: messageText.slice(0, 50) 
        })
      });
  
      // Update local state to reflect new title
      setChats(prev => prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, title: messageText.slice(0, 50) } 
          : chat
      ));
    } catch (error) {
      console.error('Error updating chat title:', error);
    }
  }



  // Call AI response handler
  await handleAIResponse(messageText, chatId);
};


const handleAIResponse = async (userMessage, forcedChatId = null) => {
  setIsLoading(true);

  // Use the forced chatId or fall back to currentChatId
  const chatId = forcedChatId || currentChatId;

  if (!chatId) {
    console.error('No chat ID available for AI response');
    setIsLoading(false);
    return;
  }

  try {
      const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMessage, context: messages.slice(-5) })
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponseText = "";
      
      // Add empty AI response placeholder
      const aiResponse = { text: "", isUser: false, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, aiResponse]);

      while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          aiResponseText += chunk;

          setMessages(prevMessages => {
              const updatedMessages = [...prevMessages];
              updatedMessages[updatedMessages.length - 1] = { 
                  ...aiResponse, 
                  text: aiResponseText 
              };
              return updatedMessages;
          });
      }

      // Ensure aiResponseText is trimmed and not empty before saving
      if (aiResponseText.trim()) {
        console.log('Saving AI response:', {
          chatId,
          userId,
          aiResponseText,
          timestamp: new Date().toISOString()
        });

        // Save AI response to database
        const saveResponse = await fetch('/api/database', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'addMessage', 
            userId, 
            chatId, 
            messageText: aiResponseText, 
            isAiMessage: true 
          })
        });

        const saveResult = await saveResponse.json();
        console.log('AI message save result:', saveResult);

        if (!saveResult.success) {
          console.error('Failed to save AI message');
        }
      }
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

      <Link href="/" className={styles.backButton}>
        Back to Search
      </Link>

    </div>
    
    
  </div>


  
</header>


 
<main className={styles.main}>

<div className={`${styles.chatSidebar}`}>
       
          
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
                 <span className={styles.messageSender}>{message.isUser ? '' : 'UNFICYP AI'}</span>
                <ReactMarkdown>{message.text}</ReactMarkdown>
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