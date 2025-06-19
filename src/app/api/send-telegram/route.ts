import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export async function POST(request: NextRequest) {
    try {
        console.log('🤖 Telegram API called');

        const { chatId, message, type } = await request.json();
        console.log('📨 Request data:', { chatId, messageLength: message?.length, type });

        if (!TELEGRAM_BOT_TOKEN) {
            console.error('❌ TELEGRAM_BOT_TOKEN is missing');
            console.log('Environment check:', {
                tokenExists: !!process.env.TELEGRAM_BOT_TOKEN,
                tokenLength: process.env.TELEGRAM_BOT_TOKEN?.length || 0
            });
            return NextResponse.json(
                { error: 'Telegram Bot Token not configured. Please add TELEGRAM_BOT_TOKEN to your .env.local file.' },
                { status: 500 }
            );
        }

        console.log('✅ Bot token found, length:', TELEGRAM_BOT_TOKEN.length);

        if (!chatId || !message) {
            console.error('❌ Missing required fields:', { chatId: !!chatId, message: !!message });
            return NextResponse.json(
                { error: 'Chat ID and message are required' },
                { status: 400 }
            );
        }

        // Prepare Telegram API request
        const url = `${TELEGRAM_API_URL}/sendMessage`;
        console.log('🔗 API URL:', url);

        const requestBody = {
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
        };
        console.log('📤 Request body:', requestBody);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        }); console.log('📡 Response status:', response.status);

        let data;
        try {
            data = await response.json();
            console.log('📄 Response data:', data);
        } catch (parseError) {
            console.error('❌ Failed to parse Telegram API response:', parseError);
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid response from Telegram API',
                    details: 'Response was not valid JSON'
                },
                { status: 500 }
            );
        } if (response.ok && data.ok) {
            console.log('✅ Telegram message sent successfully:', data.result?.message_id);
            return NextResponse.json({
                success: true,
                messageId: data.result?.message_id,
                chatId: data.result?.chat?.id,
                timestamp: new Date().toISOString()
            });
        } else {
            console.error('❌ Telegram API error:', data);

            // Provide more specific error messages
            let errorMessage = data.description || 'Failed to send Telegram message';

            if (data.error_code === 400) {
                if (errorMessage.includes('chat not found')) {
                    errorMessage = 'Chat not found. Please start a conversation with your bot first by sending any message to it.';
                } else if (errorMessage.includes('bot was blocked')) {
                    errorMessage = 'Bot was blocked by user. Please unblock the bot and send /start command.';
                }
            } else if (data.error_code === 401) {
                errorMessage = 'Unauthorized. Please check your bot token in .env.local file.';
            } else if (data.error_code === 429) {
                errorMessage = 'Too many requests. Please wait a moment before trying again.';
            }

            return NextResponse.json(
                {
                    success: false,
                    error: errorMessage,
                    errorCode: data.error_code,
                    originalError: data.description,
                    timestamp: new Date().toISOString()
                },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('🚨 Error in Telegram API:', error);
        console.error('Error details:', {
            name: (error as Error)?.name || 'Unknown',
            message: (error as Error)?.message || String(error),
            stack: (error as Error)?.stack
        });

        return NextResponse.json(
            {
                error: 'Internal server error',
                details: (error as Error)?.message || String(error),
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}
