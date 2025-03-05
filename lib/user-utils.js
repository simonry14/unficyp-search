const db = require('./db');
const { hashPassword } = require('./password-utils');

function registerUser(username, password) {
  try {
    // Hash the password
    const { salt, hash } = hashPassword(password);

    // Prepare the insert statement
    const insertUser = db.prepare(`
      INSERT INTO users (username, password, salt) 
      VALUES (?, ?, ?)
    `);

    // Execute the insert
    const result = insertUser.run(username, hash, salt);

    return {
      success: true,
      userId: result.lastInsertRowid
    };
  } catch (error) {
    console.error('Registration error:', error);
    
    // Check for unique constraint violation (duplicate username)
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return {
        success: false,
        message: 'Username already exists'
      };
    }

    return {
      success: false,
      message: 'Registration failed'
    };
  }
}

function addChatMessage(userId, messageText, isAiMessage) {
  try {
    const insertMessage = db.prepare(`
      INSERT INTO chat_messages (user_id, message_text, is_ai_message) 
      VALUES (?, ?, ?)
    `);

    const result = insertMessage.run(userId, messageText, isAiMessage ? 1 : 0);

    return {
      success: true,
      messageId: result.lastInsertRowid
    };
  } catch (error) {
    console.error('Chat message insertion error:', error);
    return {
      success: false,
      message: 'Failed to save message'
    };
  }
}

function getUserChatHistory(userId) {
  try {
    const getMessages = db.prepare(`
      SELECT message_text, is_ai_message, timestamp 
      FROM chat_messages 
      WHERE user_id = ? 
      ORDER BY timestamp
    `);

    const messages = getMessages.all(userId);

    return {
      success: true,
      messages: messages.map(msg => ({
        text: msg.message_text,
        isAiMessage: !!msg.is_ai_message,
        timestamp: msg.timestamp
      }))
    };
  } catch (error) {
    console.error('Retrieving chat history error:', error);
    return {
      success: false,
      message: 'Failed to retrieve chat history'
    };
  }
}

module.exports = {
  registerUser,
  addChatMessage,
  getUserChatHistory
};