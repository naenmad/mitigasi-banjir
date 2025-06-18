import { NextRequest, NextResponse } from 'next/server';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || 'whatsapp:+14155238886';

export async function POST(request: NextRequest) {
    try {
        const { to, message, type } = await request.json();

        if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
            return NextResponse.json(
                { error: 'Twilio credentials not configured' },
                { status: 500 }
            );
        }

        if (!to || !message) {
            return NextResponse.json(
                { error: 'Phone number and message are required' },
                { status: 400 }
            );
        }

        // Format phone number for WhatsApp
        const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

        // Prepare Twilio API request
        const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

        const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

        const body = new URLSearchParams({
            From: TWILIO_PHONE_NUMBER,
            To: formattedTo,
            Body: message,
        });

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body.toString(),
        });

        const data = await response.json();

        if (response.ok) {
            console.log('WhatsApp message sent successfully:', data.sid);
            return NextResponse.json({
                success: true,
                sid: data.sid,
                status: data.status,
            });
        } else {
            console.error('Twilio API error:', data);
            return NextResponse.json(
                { error: data.message || 'Failed to send WhatsApp message' },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
