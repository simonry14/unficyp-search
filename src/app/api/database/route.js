import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import { hashPassword, verifyPassword } from '../../../../lib/password-utils';

// Dynamically create database path that works in serverless environments
const dbPath = path.join(process.cwd(), 'unficyp.db');

function initializeDatabase() {
  try {
    const db = new Database(dbPath);

    // Create users table (unchanged)
    db.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        salt TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    // Create chats table
    db.prepare(`
      CREATE TABLE IF NOT EXISTS chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `).run();

    // Update chat_messages table to include chat_id
    db.prepare(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        message_text TEXT NOT NULL,
        is_ai_message BOOLEAN NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(chat_id) REFERENCES chats(id),
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `).run();

    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case 'register':
        return await registerUser(body);
      case 'login':
        return await loginUser(body);
      case 'createChat':
        return await createNewChat(body);
      case 'addMessage':
        return await addChatMessage(body);
      case 'getUserChats':
        return await getUserChats(body);
      case 'getChatMessages':
        return await getChatMessages(body);
      default:
        return NextResponse.json({ 
          success: false, 
          message: 'Invalid action' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal Server Error' 
    }, { status: 500 });
  }
}

// Existing registerUser and loginUser functions remain unchanged

async function createNewChat(body) {
  try {
    const db = initializeDatabase();
    const { userId, title = 'New Chat' } = body;

    const createChat = db.prepare(`
      INSERT INTO chats (user_id, title) 
      VALUES (?, ?)
    `);

    const result = createChat.run(userId, title);

    return NextResponse.json({ 
      success: true, 
      chatId: result.lastInsertRowid,
      title: title
    });
  } catch (error) {
    console.error('Create chat error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to create new chat' 
    }, { status: 500 });
  }
}

async function addChatMessage(body) {
  try {
    const db = initializeDatabase();
    const { userId, chatId, messageText, isAiMessage } = body;

    // Update last_active timestamp for the chat
    db.prepare(`
      UPDATE chats 
      SET last_active = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(chatId);

    const insertMessage = db.prepare(`
      INSERT INTO chat_messages (chat_id, user_id, message_text, is_ai_message) 
      VALUES (?, ?, ?, ?)
    `);

    const result = insertMessage.run(chatId, userId, messageText, isAiMessage ? 1 : 0);

    return NextResponse.json({ 
      success: true, 
      messageId: result.lastInsertRowid 
    });
  } catch (error) {
    console.error('Add message error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to add message' 
    }, { status: 500 });
  }
}

async function getUserChats(body) {
  try {
    const db = initializeDatabase();
    const { userId } = body;

    const getChats = db.prepare(`
      SELECT id, title, created_at, last_active 
      FROM chats 
      WHERE user_id = ? 
      ORDER BY last_active DESC
    `);

    const chats = getChats.all(userId);

    return NextResponse.json({ 
      success: true, 
      chats: chats.map(chat => ({
        id: chat.id,
        title: chat.title,
        createdAt: chat.created_at,
        lastActive: chat.last_active
      }))
    });
  } catch (error) {
    console.error('Get chats error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to retrieve chats' 
    }, { status: 500 });
  }
}

async function getChatMessages(body) {
  try {
    const db = initializeDatabase();
    const { chatId } = body;

    const getMessages = db.prepare(`
      SELECT message_text, is_ai_message, timestamp 
      FROM chat_messages 
      WHERE chat_id = ? 
      ORDER BY timestamp
    `);

    const messages = getMessages.all(chatId);

    return NextResponse.json({ 
      success: true, 
      messages: messages.map(msg => ({
        text: msg.message_text,
        isAiMessage: !!msg.is_ai_message,
        timestamp: msg.timestamp
      }))
    });
  } catch (error) {
    console.error('Get chat messages error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to retrieve chat messages' 
    }, { status: 500 });
  }
}