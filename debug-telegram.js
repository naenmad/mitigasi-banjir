#!/usr/bin/env node

/**
 * Quick Debug Script for Telegram Bot
 * ===================================
 * 
 * Jalankan: node debug-telegram.js
 * Untuk test koneksi Telegram API secara langsung
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    const env = {};
    
    lines.forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        env[key.trim()] = value.trim();
      }
    });
    
    return env;
  }
  return {};
}

async function testTelegramBot() {
  console.log('🤖 Telegram Bot Debug Script');
  console.log('=============================\n');
  
  // Load environment
  const env = loadEnv();
  const botToken = env.TELEGRAM_BOT_TOKEN;
  
  if (!botToken) {
    console.error('❌ TELEGRAM_BOT_TOKEN not found in .env.local');
    console.log('💡 Make sure .env.local contains:');
    console.log('   TELEGRAM_BOT_TOKEN=your_bot_token_here');
    return;
  }
  
  console.log('✅ Bot token found:', botToken.substring(0, 10) + '...');
  
  // Test bot info
  const botInfoUrl = `https://api.telegram.org/bot${botToken}/getMe`;
  
  console.log('\n🔍 Testing bot info...');
  
  try {
    const response = await fetch(botInfoUrl);
    const data = await response.json();
    
    if (data.ok) {
      console.log('✅ Bot is valid!');
      console.log('🤖 Bot info:');
      console.log('   Name:', data.result.first_name);
      console.log('   Username:', data.result.username);
      console.log('   ID:', data.result.id);
    } else {
      console.error('❌ Bot token invalid:', data.description);
      return;
    }
  } catch (error) {
    console.error('❌ Error testing bot:', error.message);
    return;
  }
  
  // Test send message
  console.log('\n📨 Testing send message...');
  
  const chatId = process.argv[2] || 'YOUR_CHAT_ID';
  
  if (chatId === 'YOUR_CHAT_ID') {
    console.log('💡 Usage: node debug-telegram.js [CHAT_ID]');
    console.log('💡 Example: node debug-telegram.js 123456789');
    console.log('💡 Get your Chat ID from @userinfobot');
    return;
  }
  
  const sendUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const message = `🧪 Test from debug script\n\nTime: ${new Date().toLocaleString()}\nStatus: Bot is working!`;
  
  try {
    const response = await fetch(sendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });
    
    const data = await response.json();
    
    if (data.ok) {
      console.log('✅ Message sent successfully!');
      console.log('📨 Message ID:', data.result.message_id);
      console.log('💬 Check your Telegram for the test message!');
    } else {
      console.error('❌ Failed to send message:', data.description);
      
      if (data.description.includes('chat not found')) {
        console.log('\n💡 Fix "chat not found":');
        console.log('   1. Open Telegram');
        console.log('   2. Search for your bot username');
        console.log('   3. Click START or send any message');
        console.log('   4. Try again');
      }
    }
  } catch (error) {
    console.error('❌ Error sending message:', error.message);
  }
}

// Polyfill fetch for older Node.js versions
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

testTelegramBot().catch(console.error);
